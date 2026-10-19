import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runLoad, countRows, type LoadPhase } from '../../src/commands/load.js';
import { executeLoadCommand } from '../../src/cli/load-command.js';
import { deriveProjectKey } from '../../src/commands/check.js';
import { parseLoadEnvelope } from '../../src/contracts/index.js';
import { buildProjectId } from '../../src/dataset/ids.js';
import { closeDataset, openDataset, type Dataset } from '../../src/dataset/index.js';
import { managedAll } from '../../src/dataset/sqlite-runtime.js';

const TINY = resolve('test/fixtures/load/fixture-load-tiny');
const REDACTION = resolve('test/fixtures/load/fixture-load-redaction');
const ERRORS_PKG = resolve('test/fixtures/real-packages/errors');
const TS = '2026-07-07T00:00:00.000Z';

const dataDirs: string[] = [];

async function freshDataDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'ts-codegraph-load-'));
  dataDirs.push(dir);
  return dir;
}

afterEach(async () => {
  while (dataDirs.length > 0) {
    const dir = dataDirs.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
});

function collector(): { stream: NodeJS.WritableStream; text(): string } {
  const chunks: string[] = [];
  const stream = {
    write(value: string | Uint8Array): boolean {
      chunks.push(typeof value === 'string' ? value : Buffer.from(value).toString('utf8'));
      return true;
    },
  } as unknown as NodeJS.WritableStream;
  return { stream, text: () => chunks.join('') };
}

async function openFor(projectId: string, dataDirOverride: string): Promise<Dataset> {
  return openDataset(projectId, { dataDirOverride });
}

describe('ts-codegraph load — repeat-load stability', () => {
  it('two loads of the same source yield byte-identical envelope data and IDs from the builders', async () => {
    const first = await runLoad({ projectPath: TINY, dataDirOverride: await freshDataDir(), timestamp: TS });
    const second = await runLoad({ projectPath: TINY, dataDirOverride: await freshDataDir(), timestamp: TS });

    expect(JSON.stringify(second.envelope.data)).toBe(JSON.stringify(first.envelope.data));
    expect(first.envelope.data.projectId).toBe(buildProjectId(deriveProjectKey('@fixture/load-tiny', TINY)));
    expect(first.envelope.data.loadRunId).toMatch(/^load-run:v1:[0-9a-f]{16}$/);
    expect(first.envelope.data.counts.symbols).toBe(4);
    expect(first.envelope.data.counts.searchDocuments).toBe(4);
  });
});

describe('ts-codegraph load — transaction rollback', () => {
  it('leaves a fresh dataset empty when a fault is injected mid-persist', async () => {
    const dataDir = await freshDataDir();
    const projectId = buildProjectId(deriveProjectKey('@fixture/load-tiny', TINY));

    await expect(
      runLoad({
        projectPath: TINY,
        dataDirOverride: dataDir,
        timestamp: TS,
        injectFault: (phase: LoadPhase) => {
          if (phase === 'search-documents') throw new Error('injected mid-persist failure');
        },
      }),
    ).rejects.toThrow(/injected/);

    const dataset = await openFor(projectId, dataDir);
    for (const table of ['project', 'snapshot', 'symbol', 'signature', 'evidence', 'source_file', 'search_document', 'search_document_fts']) {
      expect(countRows(dataset, table), `${table} must be empty after rollback`).toBe(0);
    }
    closeDataset(dataset);
  });

  it('leaves a previously loaded dataset byte-identical when a re-load faults', async () => {
    const dataDir = await freshDataDir();
    const projectId = buildProjectId(deriveProjectKey('@fixture/load-tiny', TINY));

    const first = await runLoad({ projectPath: TINY, dataDirOverride: dataDir, timestamp: TS });
    const before = await openFor(projectId, dataDir);
    const beforeCounts = ['symbol', 'search_document', 'signature', 'evidence', 'source_file', 'package'].map(
      (t) => [t, countRows(before, t)] as const,
    );
    closeDataset(before);

    await expect(
      runLoad({
        projectPath: TINY,
        dataDirOverride: dataDir,
        timestamp: TS,
        injectFault: (phase: LoadPhase) => {
          if (phase === 'symbols') throw new Error('injected re-load failure');
        },
      }),
    ).rejects.toThrow(/injected/);

    const after = await openFor(projectId, dataDir);
    for (const [table, count] of beforeCounts) {
      expect(countRows(after, table), `${table} unchanged after failed re-load`).toBe(count);
    }
    expect(countRows(after, 'symbol')).toBe(first.envelope.data.counts.symbols);
    closeDataset(after);
  });
});

describe('ts-codegraph load — redaction', () => {
  it('emits no absolute path, secret, or home path in the envelope or stored facts', async () => {
    const dataDir = await freshDataDir();
    const outcome = await runLoad({ projectPath: REDACTION, dataDirOverride: dataDir, timestamp: TS });

    const envelopeJson = JSON.stringify(outcome.envelope);
    for (const leak of ['/Users/', 'secret-project', 'sk_live', 'hunter2', '~/private']) {
      expect(envelopeJson).not.toContain(leak);
    }

    const projectId = buildProjectId(deriveProjectKey('@fixture/load-redaction', REDACTION));
    const dataset = await openFor(projectId, dataDir);
    const stored = JSON.stringify([
      managedAll(dataset.db, 'SELECT text FROM evidence', []),
      managedAll(dataset.db, 'SELECT signature_text FROM signature', []),
      managedAll(dataset.db, 'SELECT message FROM diagnostic', []),
    ]);
    for (const leak of ['/Users/', 'secret-project', 'sk_live', 'hunter2', '~/private']) {
      expect(stored).not.toContain(leak);
    }
    closeDataset(dataset);
  });
});

describe('ts-codegraph load — real package @codegraph/errors', () => {
  it('loads non-zero symbols with zero unsafe diagnostics and no leaks', async () => {
    const outcome = await runLoad({ projectPath: ERRORS_PKG, dataDirOverride: await freshDataDir(), timestamp: TS });
    expect(outcome.ok).toBe(true);
    expect(outcome.envelope.data.counts.symbols).toBeGreaterThan(0);
    expect(outcome.envelope.data.diagnosticSummary.errors).toBe(0);
    expect(JSON.stringify(outcome.envelope)).not.toContain('/Users/');
  });
});

describe('ts-codegraph load — CLI JSON purity', () => {
  it('prints exactly one ts-codegraph.load@1 envelope on stdout in --json mode', async () => {
    const out = collector();
    const err = collector();
    const exitCode = await executeLoadCommand({
      argv: ['--project', TINY, '--json'],
      stdout: out.stream,
      stderr: err.stream,
      overrides: { dataDirOverride: await freshDataDir(), timestamp: TS },
    });

    const lines = out.text().trim().split('\n');
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0] ?? '');
    expect(parsed.schemaVersion).toBe('ts-codegraph.load@1');
    expect(parseLoadEnvelope(parsed).success).toBe(true);
    expect(exitCode).toBe(0);
    expect(err.text()).toBe('');
  });
});

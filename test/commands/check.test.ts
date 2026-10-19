import { chmod, readdir, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runCheck, type CheckOutcome } from '../../src/commands/check.js';
import { executeCheckCommand } from '../../src/cli/check-command.js';
import { parseCheckEnvelope } from '../../src/contracts/index.js';
import { buildProjectId } from '../../src/dataset/ids.js';
import { closeDataset, openDataset } from '../../src/dataset/index.js';
import { createCheckFixture, type CheckFixture } from './check-fixtures.js';

const fixtures: CheckFixture[] = [];

async function fixture(options?: Parameters<typeof createCheckFixture>[0]): Promise<CheckFixture> {
  const created = await createCheckFixture(options);
  fixtures.push(created);
  return created;
}

afterEach(async () => {
  while (fixtures.length > 0) {
    const created = fixtures.pop();
    if (created) {
      await created.cleanup();
    }
  }
});

// --- Recursive filesystem snapshot for the no-mutation proof ----------------

async function snapshotTree(root: string): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      out.set(relative(root, dir) || '.', 'dir-inaccessible');
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      const rel = relative(root, full);
      if (entry.isDirectory()) {
        try {
          const stats = await stat(full);
          out.set(rel, `d:${(stats.mode & 0o777).toString(8)}`);
        } catch {
          out.set(rel, 'd:inaccessible');
        }
        await walk(full);
      } else if (entry.isFile()) {
        try {
          const buffer = await readFile(full);
          const stats = await stat(full);
          out.set(
            rel,
            `f:${buffer.length}:${(stats.mode & 0o777).toString(8)}:${createHash('sha256')
              .update(buffer)
              .digest('hex')}`,
          );
        } catch {
          out.set(rel, 'f:inaccessible');
        }
      } else {
        out.set(rel, 'other');
      }
    }
  }
  await walk(root);
  return out;
}

function diffTrees(before: Map<string, string>, after: Map<string, string>): string[] {
  const diffs: string[] = [];
  for (const [key, value] of before) {
    if (!after.has(key)) {
      diffs.push(`removed ${key}`);
    } else if (after.get(key) !== value) {
      diffs.push(`changed ${key}`);
    }
  }
  for (const key of after.keys()) {
    if (!before.has(key)) {
      diffs.push(`added ${key}`);
    }
  }
  return diffs;
}

function gateById(outcome: CheckOutcome, id: string) {
  return outcome.envelope.data.preflightChecks.find((check) => check.id === id);
}

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

function baseOverrides(created: CheckFixture): { dataDirOverride: string; templatePacksDir: string } {
  return { dataDirOverride: created.dataDir, templatePacksDir: created.packsDir };
}

describe('ts-codegraph check — valid project', () => {
  it('passes/warns as expected, validates the envelope, and sets willWrite false', async () => {
    const created = await fixture();
    const outcome = await runCheck({
      projectPath: created.projectRoot,
      ...baseOverrides(created),
    });

    expect(outcome.envelope.data.willWrite).toBe(false);
    expect(parseCheckEnvelope(outcome.envelope).success).toBe(true);
    expect(outcome.envelope.schemaVersion).toBe('ts-codegraph.check@1');
    expect(outcome.envelope.command).toBe('check');
    expect(outcome.envelope.meta.datasetSchemaVersion).toBe('ts-codegraph.dataset@1');

    expect(gateById(outcome, 'project-path')?.status).toBe('pass');
    expect(gateById(outcome, 'repository-discovery')?.status).toBe('pass');
    expect(gateById(outcome, 'tsconfig-presence')?.status).toBe('pass');
    expect(gateById(outcome, 'git-state')?.status).toBe('pass');
    expect(gateById(outcome, 'traversal-policy')?.status).toBe('pass');
    expect(gateById(outcome, 'dataset-readiness')?.status).toBe('warn');
    expect(gateById(outcome, 'template-pack')?.status).toBe('pass');
    expect(gateById(outcome, 'output-strategy')?.status).toBe('skip');

    expect(outcome.envelope.data.preflightChecks).toHaveLength(8);
    expect(outcome.ok).toBe(true);
    expect(outcome.exitCode).toBe(0);
  });

  it('reports template readiness for a valid pack', async () => {
    const created = await fixture();
    const outcome = await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    expect(outcome.envelope.data.templateReadiness.ok).toBe(true);
    expect(outcome.envelope.data.templateReadiness.packs).toHaveLength(1);
    expect(outcome.envelope.data.templateReadiness.packs[0]?.packName).toBe('default');
  });
});

describe('ts-codegraph check — no mutation (filesystem diff)', () => {
  it('makes zero filesystem changes on a valid fixture', async () => {
    const created = await fixture();
    const before = await snapshotTree(created.base);
    await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const after = await snapshotTree(created.base);
    expect(diffTrees(before, after)).toEqual([]);
  });

  it('makes zero filesystem changes on the missing-tsconfig fixture', async () => {
    const created = await fixture({ withTsconfig: false });
    const before = await snapshotTree(created.base);
    await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const after = await snapshotTree(created.base);
    expect(diffTrees(before, after)).toEqual([]);
  });

  it('makes zero filesystem changes on the missing-template-pack fixture', async () => {
    const created = await fixture({ withValidPack: false });
    const before = await snapshotTree(created.base);
    await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const after = await snapshotTree(created.base);
    expect(diffTrees(before, after)).toEqual([]);
  });

  it('makes zero filesystem changes when --output is supplied (nothing created)', async () => {
    const created = await fixture();
    const before = await snapshotTree(created.base);
    await runCheck({
      projectPath: created.projectRoot,
      outputDir: join(created.base, 'out-does-not-exist-yet'),
      ...baseOverrides(created),
    });
    const after = await snapshotTree(created.base);
    expect(diffTrees(before, after)).toEqual([]);
    expect(after.has('out-does-not-exist-yet')).toBe(false);
  });

  it('makes zero filesystem changes on the unreadable-path fixture', async () => {
    const created = await fixture();
    await chmod(created.projectRoot, 0o000);
    const before = await snapshotTree(created.base);
    await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const after = await snapshotTree(created.base);
    expect(diffTrees(before, after)).toEqual([]);
  });

  it('makes zero filesystem changes when a healthy dataset already exists (no WAL sidecars) [F1]', async () => {
    const created = await fixture();
    const projectId = buildProjectId('@fixture/tiny');
    const dataset = await openDataset(projectId, { create: true, dataDirOverride: created.dataDir });
    closeDataset(dataset);

    // Snapshot the app-managed data directory specifically, then run check on the
    // present-dataset branch and assert the health read created nothing (no
    // dataset.db-wal / dataset.db-shm).
    const before = await snapshotTree(created.dataDir);
    const outcome = await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const after = await snapshotTree(created.dataDir);

    expect(gateById(outcome, 'dataset-readiness')?.status).toBe('pass');
    expect(diffTrees(before, after)).toEqual([]);
  });
});

describe('ts-codegraph check — invalid fixtures still return a valid envelope', () => {
  it('fails the tsconfig gate with a stable code', async () => {
    const created = await fixture({ withTsconfig: false });
    const outcome = await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const gate = gateById(outcome, 'tsconfig-presence');
    expect(gate?.status).toBe('fail');
    expect(gate?.diagnostics[0]?.code).toBe('CHECK_TSCONFIG_MISSING');
    expect(parseCheckEnvelope(outcome.envelope).success).toBe(true);
    expect(outcome.ok).toBe(false);
    expect(outcome.exitCode).toBe(2);
  });

  it('fails the template-pack gate when the pack is missing', async () => {
    const created = await fixture({ withValidPack: false });
    const outcome = await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const gate = gateById(outcome, 'template-pack');
    expect(gate?.status).toBe('fail');
    expect(gate?.diagnostics[0]?.code).toBe('CHECK_TEMPLATE_PACK_MISSING');
    expect(outcome.envelope.data.templateReadiness.ok).toBe(false);
    expect(parseCheckEnvelope(outcome.envelope).success).toBe(true);
  });

  it('fails the project-path gate on an unreadable path and skips dependent gates', async () => {
    const created = await fixture();
    await chmod(created.projectRoot, 0o000);
    const outcome = await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const gate = gateById(outcome, 'project-path');
    expect(gate?.status).toBe('fail');
    expect(gate?.diagnostics[0]?.code).toBe('CHECK_PROJECT_UNREADABLE');
    expect(gateById(outcome, 'repository-discovery')?.status).toBe('skip');
    expect(gateById(outcome, 'dataset-readiness')?.status).toBe('skip');
    expect(parseCheckEnvelope(outcome.envelope).success).toBe(true);
    expect(outcome.exitCode).toBe(2);
  });

  it('fails the project-path gate on a missing path', async () => {
    const created = await fixture();
    const outcome = await runCheck({
      projectPath: join(created.base, 'no-such-project'),
      ...baseOverrides(created),
    });
    const gate = gateById(outcome, 'project-path');
    expect(gate?.status).toBe('fail');
    expect(gate?.diagnostics[0]?.code).toBe('CHECK_PROJECT_NOT_FOUND');
  });
});

describe('ts-codegraph check — dataset readiness', () => {
  it('warns with run-load guidance when the dataset is missing', async () => {
    const created = await fixture();
    const outcome = await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const gate = gateById(outcome, 'dataset-readiness');
    expect(gate?.status).toBe('warn');
    expect(gate?.diagnostics[0]?.code).toBe('CHECK_DATASET_MISSING');
    expect(gate?.diagnostics[0]?.suggestedAction).toContain('ts-codegraph load');
    expect(outcome.envelope.data.databaseReadiness.policy).toBe('not-created');
    expect(outcome.ok).toBe(true);
    expect(outcome.exitCode).toBe(0);
  });

  it('passes when a healthy dataset already exists (read-only)', async () => {
    const created = await fixture();
    const projectId = buildProjectId('@fixture/tiny');
    const dataset = await openDataset(projectId, { create: true, dataDirOverride: created.dataDir });
    closeDataset(dataset);

    const outcome = await runCheck({ projectPath: created.projectRoot, ...baseOverrides(created) });
    const gate = gateById(outcome, 'dataset-readiness');
    expect(gate?.status).toBe('pass');
    expect(outcome.envelope.data.databaseReadiness.ok).toBe(true);
    expect(outcome.envelope.data.databaseReadiness.policy).toBe('app-managed');
  });
});

describe('ts-codegraph check — CLI (JSON purity, redaction, exit codes)', () => {
  it('prints exactly one ts-codegraph.check@1 envelope on stdout in --json mode', async () => {
    const created = await fixture();
    const out = collector();
    const err = collector();
    const exitCode = await executeCheckCommand({
      argv: ['--project', created.projectRoot, '--json'],
      stdout: out.stream,
      stderr: err.stream,
      overrides: baseOverrides(created),
    });

    const lines = out.text().trim().split('\n');
    expect(lines).toHaveLength(1);
    const parsedJson = JSON.parse(lines[0] ?? '');
    expect(parsedJson.schemaVersion).toBe('ts-codegraph.check@1');
    expect(parseCheckEnvelope(parsedJson).success).toBe(true);
    expect(parsedJson.data.willWrite).toBe(false);
    expect(exitCode).toBe(0);
    expect(err.text()).toBe('');
  });

  it('produces no absolute path in JSON output for a home-like project path', async () => {
    const created = await fixture({ homeLike: true });
    const out = collector();
    await executeCheckCommand({
      argv: ['--project', created.projectRoot, '--json'],
      stdout: out.stream,
      stderr: collector().stream,
      overrides: baseOverrides(created),
    });
    const json = out.text();
    expect(json).not.toContain(created.base);
    expect(json).not.toContain(created.projectRoot);
    expect(json).not.toContain('/home/tester');
    expect(json).not.toMatch(/"[^"]*\/(home|Users)\/[^"]*"/);
  });

  it('returns exit code 2 through the CLI on a failing gate', async () => {
    const created = await fixture({ withTsconfig: false });
    const exitCode = await executeCheckCommand({
      argv: ['--project', created.projectRoot],
      stdout: collector().stream,
      stderr: collector().stream,
      overrides: baseOverrides(created),
    });
    expect(exitCode).toBe(2);
  });

  it('returns a validation exit code when --project is missing', async () => {
    const exitCode = await executeCheckCommand({
      argv: ['--json'],
      stdout: collector().stream,
      stderr: collector().stream,
    });
    expect(exitCode).toBe(2);
  });
});

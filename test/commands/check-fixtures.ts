import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Test scaffolding for `ts-codegraph check`. Every fixture is built inside a fresh
 * `os.tmpdir()` directory (outside any git repository, so the git gate exercises
 * the no-git path with zero `.git` writes) and is fully removed on cleanup.
 */

export interface CheckFixture {
  /** The temp base holding the project, data, and packs subtrees. */
  readonly base: string;
  /** The project root passed as `--project`. */
  readonly projectRoot: string;
  /** App-paths data-dir override (never written to by check). */
  readonly dataDir: string;
  /** Template packs root override. */
  readonly packsDir: string;
  cleanup(): Promise<void>;
}

export interface FixtureOptions {
  readonly withTsconfig?: boolean;
  readonly withValidPack?: boolean;
  /** Nest the project under a home-like absolute path to exercise redaction. */
  readonly homeLike?: boolean;
}

const VALID_MANIFEST = {
  packName: 'default',
  packVersion: '1.0.0',
  slotIds: ['objective'],
  requiredFacts: [],
  optionalFacts: [],
  templateFiles: [
    { templateId: 'overview', path: 'overview.hbs', outputPattern: 'overview.md' },
  ],
} as const;

export async function createCheckFixture(options: FixtureOptions = {}): Promise<CheckFixture> {
  const withTsconfig = options.withTsconfig ?? true;
  const withValidPack = options.withValidPack ?? true;
  const homeLike = options.homeLike ?? false;

  const base = await mkdtemp(join(tmpdir(), 'ts-codegraph-check-'));
  const projectRoot = homeLike ? join(base, 'home', 'tester', 'project') : join(base, 'project');
  const dataDir = join(base, 'data');
  const packsDir = join(base, 'packs');

  await mkdir(join(projectRoot, 'src'), { recursive: true });
  await mkdir(dataDir, { recursive: true });
  await mkdir(packsDir, { recursive: true });

  await writeFile(
    join(projectRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: '@fixture/tiny',
        version: '0.0.0',
        private: true,
        devDependencies: { typescript: '^5.8.3' },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  await writeFile(join(projectRoot, 'src', 'index.ts'), 'export const answer = 42;\n', 'utf8');

  if (withTsconfig) {
    await writeFile(
      join(projectRoot, 'tsconfig.json'),
      `${JSON.stringify({ compilerOptions: { strict: true } }, null, 2)}\n`,
      'utf8',
    );
  }

  if (withValidPack) {
    await mkdir(join(packsDir, 'default'), { recursive: true });
    await writeFile(
      join(packsDir, 'default', 'manifest.json'),
      `${JSON.stringify(VALID_MANIFEST, null, 2)}\n`,
      'utf8',
    );
  }

  return {
    base,
    projectRoot,
    dataDir,
    packsDir,
    async cleanup(): Promise<void> {
      // Restore permissions in case a test made the project unreadable.
      await chmod(projectRoot, 0o755).catch(() => undefined);
      await rm(base, { recursive: true, force: true });
    },
  };
}

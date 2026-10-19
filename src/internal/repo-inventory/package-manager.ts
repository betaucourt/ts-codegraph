import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { AppError } from '../errors/index.js';
import { getTracer, SpanStatusCode } from '../telemetry/index.js';
import { ERROR_CODES, TELEMETRY_ATTRIBUTES } from './generated/repo-inventory-entities.js';
import type { PackageManagerInfo, PackageManagerName } from './types.js';

const TRACER_NAME = 'codegraph.repo-inventory';

async function fileExists(p: string): Promise<boolean> {
  try { await access(p); return true; } catch { return false; }
}

export async function detectPackageManager(root: string): Promise<PackageManagerInfo> {
  const tracer = getTracer(TRACER_NAME);
  const span = tracer.startSpan('codegraph.repo_inventory.package_manager', {
    attributes: { [TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OPERATION]: 'package_manager' },
  });

  try {
    const [hasPnpmLock, hasPnpmWorkspace, hasYarnLock, hasPackageLock, hasBunLock] = await Promise.all([
      fileExists(join(root, 'pnpm-lock.yaml')),
      fileExists(join(root, 'pnpm-workspace.yaml')),
      fileExists(join(root, 'yarn.lock')),
      fileExists(join(root, 'package-lock.json')),
      fileExists(join(root, 'bun.lock')),
    ]);

    let name: PackageManagerName;
    let lockfilePresent = false;

    if (hasPnpmLock || hasPnpmWorkspace) {
      name = 'pnpm';
      lockfilePresent = hasPnpmLock;
    } else if (hasYarnLock) {
      name = 'yarn';
      lockfilePresent = true;
    } else if (hasBunLock) {
      name = 'bun';
      lockfilePresent = true;
    } else if (hasPackageLock) {
      name = 'npm';
      lockfilePresent = true;
    } else {
      name = 'unknown';
      lockfilePresent = false;
    }

    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_PACKAGE_MANAGER, name);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'success');
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return {
      name,
      lockfilePresent,
      workspacesSupported: name === 'pnpm' || name === 'yarn' || name === 'npm',
    };
  } catch (err) {
    const code = err instanceof AppError ? err.code : ERROR_CODES.REPO_PACKAGE_MANAGER_PROBE_FAILED;
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_ERROR_CODE, code);
    span.setAttribute(TELEMETRY_ATTRIBUTES.CODEGRAPH_REPO_INVENTORY_OUTCOME, 'error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: code });
    span.end();
    throw err;
  }
}

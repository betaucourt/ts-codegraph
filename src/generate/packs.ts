import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { DEFAULT_TEMPLATE_PACKS_DIR, TEMPLATE_PACK_MANIFEST_FILE } from '../commands/check.js';
import { templatePackManifestSchema, type TemplatePackManifest } from '../contracts/index.js';

/**
 * Template-pack loading (step-06b). Packs live at `<pkgRoot>/templates/packs/<name>/`
 * — the same location (`check`'s `DEFAULT_TEMPLATE_PACKS_DIR`) the template-pack gate
 * validates — so the two commands read identical, schema-validated manifests. The
 * template body is read from the pack's single template file; no user-supplied
 * template paths are accepted.
 */

export type TemplateName = 'package-overview' | 'api-reference';

export interface LoadedPack {
  readonly manifest: TemplatePackManifest;
  readonly templateId: string;
  readonly templateSource: string;
  readonly outputPattern: string;
}

export async function loadPack(name: TemplateName, packsDir: string = DEFAULT_TEMPLATE_PACKS_DIR): Promise<LoadedPack> {
  const packDir = join(packsDir, name);
  const raw = await readFile(join(packDir, TEMPLATE_PACK_MANIFEST_FILE), 'utf8');
  const manifest = templatePackManifestSchema.parse(JSON.parse(raw));
  const templateFile = manifest.templateFiles[0];
  if (templateFile === undefined) {
    throw new Error(`template pack ${name} declares no template files`);
  }
  const templateSource = await readFile(join(packDir, templateFile.path), 'utf8');
  return {
    manifest,
    templateId: templateFile.templateId,
    templateSource,
    outputPattern: templateFile.outputPattern,
  };
}

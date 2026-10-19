import { createHash } from 'node:crypto';

import { validateGeneratedDoc, type Diagnostic, type DiagnosticCode } from '../contracts/index.js';
import { buildGeneratedDocId, buildGeneratedSectionId } from '../dataset/ids.js';
import type { ApiReferenceDto, PackageOverviewDto } from '../projection/index.js';
import { compileStrict } from '../render/engine.js';
import { headingSlug, normalizeMarkdown, packageSlug } from './helpers.js';
import type { LoadedPack, TemplateName } from './packs.js';

/**
 * Build one generated document from a validated DTO (step-06b). Pipeline per doc:
 * render (strict engine) -> assemble frontmatter -> OKF validation (Step 01
 * validator) -> hash + ids. A doc that fails OKF validation is a skip with the
 * validator's stable diagnostic code — it never enters the write plan.
 *
 * The section map is computed from the DTO (which sections render), so anchors
 * derive from slot IDs (per-symbol sections embed the symbol stable id in the
 * sectionId), never from heading text.
 */

export interface SectionRecord {
  readonly sectionId: string;
  readonly slotId: string;
  readonly heading: string;
  readonly headingSlug: string;
  readonly symbolId?: string;
}

export interface GeneratedDocRecord {
  readonly docId: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly conceptPath: string;
  readonly content: string;
  readonly contentHash: string;
  readonly sections: readonly SectionRecord[];
}

export type BuildDocumentResult =
  | { readonly status: 'ok'; readonly record: GeneratedDocRecord }
  | {
      readonly status: 'skip';
      readonly conceptPath: string;
      readonly reasonCode: DiagnosticCode;
      readonly diagnostics: readonly Diagnostic[];
    };

export type ProjectionDto = PackageOverviewDto | ApiReferenceDto;

const FRONTMATTER_KEY_ORDER = [
  'type',
  'title',
  'description',
  'resource',
  'tags',
  'timestamp',
  'generated_by',
  'schema_version',
  'source_snapshot',
  'template_id',
  'template_version',
  'dataset_schema_version',
] as const;

const DOC_META: Record<TemplateName, { type: string; schemaVersion: string; tag: string }> = {
  'package-overview': { type: 'Package Overview', schemaVersion: 'ts-codegraph.package-overview@1', tag: 'package-overview' },
  'api-reference': { type: 'API Reference', schemaVersion: 'ts-codegraph.api-reference@1', tag: 'api-reference' },
};

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * A pure render view-model over the validated DTO. Optional scalars (which the DTO
 * omits when absent) are exposed as always-defined presence flags + values, so
 * templates test defined booleans — never a maybe-missing field — under the
 * hardened strict engine. Derived purely from the DTO; no new facts.
 */
function toRenderModel(templateName: TemplateName, dto: ProjectionDto): unknown {
  if (templateName !== 'package-overview') {
    return dto;
  }
  const overview = dto as PackageOverviewDto;
  return {
    ...overview,
    pkg: {
      ...overview.pkg,
      hasDescription: overview.pkg.description !== undefined,
      description: overview.pkg.description ?? '',
      dependencies: overview.pkg.dependencies.map((dependency) => ({
        ...dependency,
        hasVersionRange: dependency.versionRange !== undefined,
        versionRange: dependency.versionRange ?? '',
      })),
    },
  };
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function serializeFrontmatter(fm: Readonly<Record<string, string | readonly string[]>>): string {
  const lines: string[] = [];
  for (const key of FRONTMATTER_KEY_ORDER) {
    const value = fm[key];
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map(yamlString).join(', ')}]`);
    } else {
      lines.push(`${key}: ${yamlString(value as string)}`);
    }
  }
  return lines.join('\n');
}

function overviewSections(dto: PackageOverviewDto): readonly Omit<SectionRecord, 'sectionId' | 'headingSlug'>[] {
  const sections: Omit<SectionRecord, 'sectionId' | 'headingSlug'>[] = [{ slotId: 'objective', heading: 'Objective' }];
  if (dto.exports.present) sections.push({ slotId: 'exports', heading: 'Exports' });
  if (dto.pkg.dependencies.length > 0) sections.push({ slotId: 'dependencies', heading: 'Dependencies' });
  if (dto.diagnostics.present) sections.push({ slotId: 'diagnostics', heading: 'Diagnostics' });
  sections.push({ slotId: 'evidence', heading: 'Sources Used' });
  return sections;
}

function apiSections(dto: ApiReferenceDto): readonly Omit<SectionRecord, 'sectionId' | 'headingSlug'>[] {
  const sections: Omit<SectionRecord, 'sectionId' | 'headingSlug'>[] = [
    { slotId: 'objective', heading: 'Objective' },
    { slotId: 'symbols', heading: 'API' },
  ];
  for (const symbol of dto.symbols.items) {
    sections.push({ slotId: 'symbol', heading: symbol.name, symbolId: symbol.id });
  }
  if (dto.diagnostics.present) sections.push({ slotId: 'diagnostics', heading: 'Diagnostics' });
  sections.push({ slotId: 'evidence', heading: 'Sources Used' });
  return sections;
}

function buildSections(
  planned: readonly Omit<SectionRecord, 'sectionId' | 'headingSlug'>[],
  docId: string,
): SectionRecord[] {
  return planned.map((section) => ({
    sectionId: buildGeneratedSectionId({
      generatedDocId: docId,
      slotId: section.slotId,
      ...(section.symbolId !== undefined ? { symbolId: section.symbolId } : {}),
    }),
    slotId: section.slotId,
    heading: section.heading,
    headingSlug: headingSlug(section.heading),
    ...(section.symbolId !== undefined ? { symbolId: section.symbolId } : {}),
  }));
}

export function buildDocument(pack: LoadedPack, templateName: TemplateName, dto: ProjectionDto): BuildDocumentResult {
  const meta = DOC_META[templateName];
  const slug = packageSlug(dto.pkg.name);
  const conceptPath = pack.outputPattern.replace('{slug}', slug);
  const resource = `/${conceptPath}`;

  const body = normalizeMarkdown(compileStrict(pack.templateSource, { noEscape: true })(toRenderModel(templateName, dto)));

  const frontmatter: Record<string, string | readonly string[]> = {
    type: meta.type,
    title: `${dto.pkg.name} — ${meta.type}`,
    description: `Generated ${meta.type.toLowerCase()} for ${dto.pkg.name} from snapshot ${dto.repository.snapshotId}.`,
    resource,
    tags: ['ts-codegraph', 'generated', meta.tag],
    timestamp: dto.meta.generatedTimestamp,
    generated_by: 'ts-codegraph generate',
    schema_version: meta.schemaVersion,
    source_snapshot: dto.repository.snapshotId,
    template_id: pack.manifest.packName,
    template_version: pack.manifest.packVersion,
    dataset_schema_version: 'ts-codegraph.dataset@1',
  };

  // OKF validation BEFORE any write: a failed doc is skipped with a stable code.
  const okf = validateGeneratedDoc(frontmatter, body);
  if (!okf.ok) {
    const reasonCode = okf.diagnostics[0]?.code ?? ('OKF_FIELD_INVALID' as DiagnosticCode);
    return { status: 'skip', conceptPath, reasonCode, diagnostics: okf.diagnostics };
  }

  const content = `---\n${serializeFrontmatter(frontmatter)}\n---\n\n${body}`;
  const contentHash = `sha256:${sha256Hex(content)}`;
  const docId = buildGeneratedDocId({
    snapshotId: dto.repository.snapshotId,
    templateId: pack.manifest.packName,
    templateVersion: pack.manifest.packVersion,
    conceptPath,
    contentHash,
  });

  const planned = templateName === 'package-overview'
    ? overviewSections(dto as PackageOverviewDto)
    : apiSections(dto as ApiReferenceDto);

  return {
    status: 'ok',
    record: {
      docId,
      templateId: pack.manifest.packName,
      templateVersion: pack.manifest.packVersion,
      conceptPath,
      content,
      contentHash,
      sections: buildSections(planned, docId),
    },
  };
}

export function conceptPathFor(pack: LoadedPack, packageName: string): string {
  return pack.outputPattern.replace('{slug}', packageSlug(packageName));
}

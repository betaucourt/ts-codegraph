---
type: "API Reference"
title: "ts-codegraph — API Reference"
description: "Generated api reference for ts-codegraph from snapshot snapshot:v1:project:v1:e8b73bd9a7125baf:worktree:8f2933f00f682fab5cb09200025c55028d1c97b6bdf0f7b1e7abbecb9b7ee0e0."
resource: "/packages/ts-codegraph/api-reference.md"
tags: ["ts-codegraph", "generated", "api-reference"]
timestamp: "2026-07-03T00:00:00+02:00"
generated_by: "ts-codegraph generate"
schema_version: "ts-codegraph.api-reference@1"
source_snapshot: "snapshot:v1:project:v1:e8b73bd9a7125baf:worktree:8f2933f00f682fab5cb09200025c55028d1c97b6bdf0f7b1e7abbecb9b7ee0e0"
template_id: "api-reference"
template_version: "1.0.0"
dataset_schema_version: "ts-codegraph.dataset@1"
---

# ts-codegraph — API Reference

## Objective

Public API surface for `ts-codegraph` in project `ts-codegraph`.

## API

### Quick Navigation

| Symbol | Kind | Source Location |
| :--- | :---: | :--- |
| [API_REFERENCE_DTO_SCHEMA_ID](#API_REFERENCE_DTO_SCHEMA_ID) | `constant` | `src/projection/dto.ts:144` |
| [APP_ERROR_CATEGORIES](#APP_ERROR_CATEGORIES) | `constant` | `src/internal/errors/core.ts:16` |
| [APP_PATH_KINDS](#APP_PATH_KINDS) | `constant` | `src/internal/app-paths/types.ts:1` |
| [ApiReferenceDto](#ApiReferenceDto) | `type-alias` | `src/projection/dto.ts:141` |
| [AppError](#AppError) | `class` | `src/internal/errors/core.ts:97` |
| [AppErrorAttributes](#AppErrorAttributes) | `interface` | `src/internal/errors/core.ts:51` |
| [AppErrorCategory](#AppErrorCategory) | `type-alias` | `src/internal/errors/core.ts:28` |
| [AppErrorCode](#AppErrorCode) | `type-alias` | `src/internal/errors/core.ts:14` |
| [AppErrorOptions](#AppErrorOptions) | `interface` | `src/internal/errors/core.ts:38` |
| [AppPathErrorCode](#AppPathErrorCode) | `type-alias` | `src/internal/app-paths/types.ts:5` |
| [AppPathKind](#AppPathKind) | `type-alias` | `src/internal/app-paths/types.ts:3` |
| [AppPathOptions](#AppPathOptions) | `interface` | `src/internal/app-paths/types.ts:29` |
| [AppPathOverrides](#AppPathOverrides) | `interface` | `src/internal/app-paths/types.ts:13` |
| [AppPathPolicy](#AppPathPolicy) | `interface` | `src/internal/app-paths/types.ts:22` |
| [AppPathResolution](#AppPathResolution) | `interface` | `src/internal/app-paths/types.ts:39` |
| [AtomicWriteEntry](#AtomicWriteEntry) | `interface` | `src/internal/source-files/types.ts:38` |
| [AtomicWritePlan](#AtomicWritePlan) | `interface` | `src/internal/source-files/types.ts:44` |
| [AttributeName](#AttributeName) | `type-alias` | `src/internal/app-paths/generated/app-paths-entities.ts:26` |
| [AttributeName](#AttributeName) | `type-alias` | `src/internal/cli/generated/cli-entities.ts:31` |
| [AttributeName](#AttributeName) | `type-alias` | `src/internal/process-runner/generated/process-runner-entities.ts:27` |
| [AttributeName](#AttributeName) | `type-alias` | `src/internal/repo-inventory/generated/repo-inventory-entities.ts:29` |
| [AttributeName](#AttributeName) | `type-alias` | `src/internal/security/generated/security-entities.ts:35` |
| [AttributeName](#AttributeName) | `type-alias` | `src/internal/source-files/generated/source-files-entities.ts:27` |
| [AttributeName](#AttributeName) | `type-alias` | `src/internal/sqlite/generated/sqlite-entities.ts:30` |
| [Attributes](#Attributes) | `type-alias` | `src/internal/telemetry/index.ts:7` |
| [BoundedReadResult](#BoundedReadResult) | `interface` | `src/internal/source-files/types.ts:14` |
| [BuildDocumentResult](#BuildDocumentResult) | `type-alias` | `src/generate/document.ts:39` |
| [CHECK_GATE_IDS](#CHECK_GATE_IDS) | `constant` | `src/commands/check.ts:85` |
| [CHECK_TOOL_VERSION](#CHECK_TOOL_VERSION) | `constant` | `src/commands/check.ts:51` |
| [CheckCliOptions](#CheckCliOptions) | `interface` | `src/cli/check-command.ts:29` |
| [CheckCliOverrides](#CheckCliOverrides) | `interface` | `src/cli/check-command.ts:35` |
| [CheckData](#CheckData) | `type-alias` | `src/contracts/envelopes.ts:300` |
| [CheckEnvelope](#CheckEnvelope) | `type-alias` | `src/contracts/envelopes.ts:301` |
| [CheckGateId](#CheckGateId) | `type-alias` | `src/commands/check.ts:96` |
| [CheckOutcome](#CheckOutcome) | `interface` | `src/commands/check.ts:118` |
| [CliCommandDefinition](#CliCommandDefinition) | `interface` | `src/internal/cli/types.ts:37` |
| [CliCommandGroupDefinition](#CliCommandGroupDefinition) | `interface` | `src/internal/cli/types.ts:50` |
| [CliCommandOption](#CliCommandOption) | `interface` | `src/internal/cli/types.ts:31` |
| [CliErrorDetail](#CliErrorDetail) | `interface` | `src/internal/cli/types.ts:17` |
| [CliExecutionContext](#CliExecutionContext) | `interface` | `src/internal/cli/types.ts:12` |
| [CliGlobalOptions](#CliGlobalOptions) | `interface` | `src/internal/cli/types.ts:1` |
| [CliOutput](#CliOutput) | `interface` | `src/internal/cli/types.ts:73` |
| [CliOutputOptions](#CliOutputOptions) | `interface` | `src/internal/cli/types.ts:65` |
| [CliProgram](#CliProgram) | `interface` | `src/internal/cli/types.ts:84` |
| [CliProgramOptions](#CliProgramOptions) | `interface` | `src/internal/cli/types.ts:56` |
| [CliResult](#CliResult) | `interface` | `src/internal/cli/types.ts:24` |
| [CommandEnvelope](#CommandEnvelope) | `type-alias` | `src/contracts/envelopes.ts:308` |
| [CompileStrictOptions](#CompileStrictOptions) | `interface` | `src/render/engine.ts:50` |
| [ComputeSnapshotInput](#ComputeSnapshotInput) | `interface` | `src/dataset/snapshot.ts:36` |
| [ContractParseResult](#ContractParseResult) | `type-alias` | `src/contracts/envelopes.ts:310` |
| [Counter](#Counter) | `interface` | `src/internal/telemetry/index.ts:21` |
| [DATASET_APP_NAME](#DATASET_APP_NAME) | `constant` | `src/dataset/open.ts:27` |
| [DATASET_DB_FILENAME](#DATASET_DB_FILENAME) | `constant` | `src/dataset/open.ts:33` |
| [DATASET_MIGRATIONS](#DATASET_MIGRATIONS) | `constant` | `src/dataset/migrations/index.ts:10` |
| [DATASET_SCHEMA_ID](#DATASET_SCHEMA_ID) | `constant` | `src/dataset/schema.ts:18` |
| [DATASET_SCHEMA_VERSION](#DATASET_SCHEMA_VERSION) | `constant` | `src/dataset/schema.ts:21` |
| [DATASET_SUBDIR](#DATASET_SUBDIR) | `constant` | `src/dataset/open.ts:30` |
| [DATASET_TABLES](#DATASET_TABLES) | `constant` | `src/dataset/schema.ts:27` |
| [DEFAULT_HASH_HEX_LENGTH](#DEFAULT_HASH_HEX_LENGTH) | `constant` | `src/dataset/ids.ts:35` |
| [DEFAULT_IGNORE_PATTERNS](#DEFAULT_IGNORE_PATTERNS) | `constant` | `src/internal/source-files/ignore.ts:4` |
| [DEFAULT_SEARCH_LIMIT](#DEFAULT_SEARCH_LIMIT) | `constant` | `src/commands/search.ts:32` |
| [DEFAULT_TEMPLATE_PACK](#DEFAULT_TEMPLATE_PACK) | `constant` | `src/commands/check.ts:54` |
| [DEFAULT_TEMPLATE_PACKS_DIR](#DEFAULT_TEMPLATE_PACKS_DIR) | `constant` | `src/commands/check.ts:80` |
| [DIAGNOSTIC_CODE_REGISTRY](#DIAGNOSTIC_CODE_REGISTRY) | `constant` | `src/contracts/diagnostics.ts:26` |
| [Dataset](#Dataset) | `interface` | `src/dataset/open.ts:72` |
| [DatasetContainmentError](#DatasetContainmentError) | `class` | `src/dataset/open.ts:36` |
| [DatasetPaths](#DatasetPaths) | `interface` | `src/dataset/open.ts:63` |
| [DatasetTable](#DatasetTable) | `type-alias` | `src/dataset/schema.ts:44` |
| [DeclarationFact](#DeclarationFact) | `interface` | `src/extractor/types.ts:34` |
| [DeclarationKind](#DeclarationKind) | `type-alias` | `src/extractor/types.ts:13` |
| [DeclaredTypeResolution](#DeclaredTypeResolution) | `interface` | `src/extractor/type-checker.ts:50` |
| [Diagnostic](#Diagnostic) | `type-alias` | `src/contracts/diagnostics.ts:149` |
| [DiagnosticCode](#DiagnosticCode) | `type-alias` | `src/contracts/diagnostics.ts:78` |
| [DiagnosticCodes](#DiagnosticCodes) | `constant` | `src/contracts/diagnostics.ts:80` |
| [DiagnosticInput](#DiagnosticInput) | `interface` | `src/contracts/diagnostics.ts:151` |
| [DiagnosticRow](#DiagnosticRow) | `interface` | `src/dataset/rows.ts:439` |
| [DiagnosticRowInput](#DiagnosticRowInput) | `interface` | `src/dataset/rows.ts:426` |
| [DiagnosticSeverity](#DiagnosticSeverity) | `type-alias` | `src/contracts/diagnostics.ts:92` |
| [DiscoverRepositoryOptions](#DiscoverRepositoryOptions) | `interface` | `src/internal/repo-inventory/types.ts:49` |
| [DiscoverWorkspaceOptions](#DiscoverWorkspaceOptions) | `interface` | `src/internal/repo-inventory/types.ts:56` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/internal/app-paths/generated/app-paths-entities.ts:6` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/internal/cli/generated/cli-entities.ts:6` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/internal/errors/generated/error-entities.ts:6` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/internal/process-runner/generated/process-runner-entities.ts:6` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/internal/repo-inventory/generated/repo-inventory-entities.ts:6` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/internal/security/generated/security-entities.ts:6` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/internal/source-files/generated/source-files-entities.ts:6` |
| [ENTITY_IDS](#ENTITY_IDS) | `constant` | `src/internal/sqlite/generated/sqlite-entities.ts:6` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/internal/app-paths/generated/app-paths-entities.ts:29` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/internal/cli/generated/cli-entities.ts:34` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/internal/errors/generated/error-entities.ts:21` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/internal/process-runner/generated/process-runner-entities.ts:41` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/internal/repo-inventory/generated/repo-inventory-entities.ts:32` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/internal/security/generated/security-entities.ts:38` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/internal/source-files/generated/source-files-entities.ts:30` |
| [ERROR_CODES](#ERROR_CODES) | `constant` | `src/internal/sqlite/generated/sqlite-entities.ts:33` |
| [EnsureAppPathOptions](#EnsureAppPathOptions) | `interface` | `src/internal/app-paths/types.ts:35` |
| [EntityId](#EntityId) | `type-alias` | `src/internal/app-paths/generated/app-paths-entities.ts:16` |
| [EntityId](#EntityId) | `type-alias` | `src/internal/cli/generated/cli-entities.ts:19` |
| [EntityId](#EntityId) | `type-alias` | `src/internal/errors/generated/error-entities.ts:18` |
| [EntityId](#EntityId) | `type-alias` | `src/internal/process-runner/generated/process-runner-entities.ts:16` |
| [EntityId](#EntityId) | `type-alias` | `src/internal/repo-inventory/generated/repo-inventory-entities.ts:17` |
| [EntityId](#EntityId) | `type-alias` | `src/internal/security/generated/security-entities.ts:25` |
| [EntityId](#EntityId) | `type-alias` | `src/internal/source-files/generated/source-files-entities.ts:17` |
| [EntityId](#EntityId) | `type-alias` | `src/internal/sqlite/generated/sqlite-entities.ts:18` |
| [EnvelopeMeta](#EnvelopeMeta) | `type-alias` | `src/contracts/envelopes.ts:299` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/internal/app-paths/generated/app-paths-entities.ts:38` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/internal/cli/generated/cli-entities.ts:41` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/internal/errors/generated/error-entities.ts:34` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/internal/process-runner/generated/process-runner-entities.ts:54` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/internal/repo-inventory/generated/repo-inventory-entities.ts:41` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/internal/security/generated/security-entities.ts:46` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/internal/source-files/generated/source-files-entities.ts:42` |
| [ErrorCode](#ErrorCode) | `type-alias` | `src/internal/sqlite/generated/sqlite-entities.ts:48` |
| [ErrorCodeMeta](#ErrorCodeMeta) | `interface` | `src/internal/errors/registry.ts:4` |
| [ErrorRegistry](#ErrorRegistry) | `class` | `src/internal/errors/registry.ts:14` |
| [EvidenceRow](#EvidenceRow) | `interface` | `src/dataset/rows.ts:398` |
| [ExecuteCheckParams](#ExecuteCheckParams) | `interface` | `src/cli/check-command.ts:41` |
| [ExecuteGenerateParams](#ExecuteGenerateParams) | `interface` | `src/cli/generate-command.ts:38` |
| [ExecuteLoadParams](#ExecuteLoadParams) | `interface` | `src/cli/load-command.ts:31` |
| [ExecuteSearchParams](#ExecuteSearchParams) | `interface` | `src/cli/search-command.ts:34` |
| [ExtractPackageFactsInput](#ExtractPackageFactsInput) | `interface` | `src/extractor/types.ts:57` |
| [ExtractorSourceFile](#ExtractorSourceFile) | `interface` | `src/extractor/types.ts:49` |
| [FIXTURE_NAMES](#FIXTURE_NAMES) | `constant` | `src/contracts/fixtures.ts:14` |
| [FORBIDDEN_TABLES](#FORBIDDEN_TABLES) | `constant` | `src/dataset/schema.ts:68` |
| [FieldViolation](#FieldViolation) | `interface` | `src/internal/errors/core.ts:30` |
| [FindTsconfigOptions](#FindTsconfigOptions) | `interface` | `src/internal/repo-inventory/types.ts:61` |
| [FixtureDefinition](#FixtureDefinition) | `interface` | `src/contracts/fixtures.ts:18` |
| [FixtureKind](#FixtureKind) | `type-alias` | `src/contracts/fixtures.ts:16` |
| [FixtureName](#FixtureName) | `type-alias` | `src/contracts/fixtures.ts:12` |
| [GENERATE_TEMPLATES](#GENERATE_TEMPLATES) | `constant` | `src/cli/generate-command.ts:45` |
| [GENERATE_TOOL_VERSION](#GENERATE_TOOL_VERSION) | `constant` | `src/commands/generate.ts:43` |
| [GenerateCliOptions](#GenerateCliOptions) | `interface` | `src/cli/generate-command.ts:26` |
| [GenerateCliOverrides](#GenerateCliOverrides) | `interface` | `src/cli/generate-command.ts:33` |
| [GenerateData](#GenerateData) | `type-alias` | `src/contracts/envelopes.ts:306` |
| [GenerateEnvelope](#GenerateEnvelope) | `type-alias` | `src/contracts/envelopes.ts:307` |
| [GenerateOutcome](#GenerateOutcome) | `interface` | `src/commands/generate.ts:57` |
| [GenerateRefusedError](#GenerateRefusedError) | `class` | `src/commands/generate.ts:65` |
| [GenerateTemplate](#GenerateTemplate) | `type-alias` | `src/commands/generate.ts:46` |
| [GeneratedDocFrontmatter](#GeneratedDocFrontmatter) | `type-alias` | `src/contracts/okf.ts:9` |
| [GeneratedDocRecord](#GeneratedDocRecord) | `interface` | `src/generate/document.ts:29` |
| [GeneratedDocRow](#GeneratedDocRow) | `interface` | `src/dataset/rows.ts:551` |
| [GitSummary](#GitSummary) | `interface` | `src/internal/repo-inventory/types.ts:24` |
| [GitSummaryOptions](#GitSummaryOptions) | `interface` | `src/internal/repo-inventory/types.ts:65` |
| [HashedIdType](#HashedIdType) | `type-alias` | `src/dataset/ids.ts:44` |
| [Histogram](#Histogram) | `interface` | `src/internal/telemetry/index.ts:25` |
| [ID_VERSION](#ID_VERSION) | `constant` | `src/dataset/ids.ts:32` |
| [IdCollisionEntry](#IdCollisionEntry) | `interface` | `src/dataset/ids.ts:328` |
| [IdCollisionResolution](#IdCollisionResolution) | `interface` | `src/dataset/ids.ts:343` |
| [IgnoreChecker](#IgnoreChecker) | `interface` | `src/internal/source-files/ignore.ts:66` |
| [IncludedFile](#IncludedFile) | `interface` | `src/dataset/snapshot.ts:30` |
| [KIND_ORDER](#KIND_ORDER) | `constant` | `src/search/rank.ts:21` |
| [LOAD_TOOL_VERSION](#LOAD_TOOL_VERSION) | `constant` | `src/commands/load.ts:81` |
| [LoadCliOptions](#LoadCliOptions) | `interface` | `src/cli/load-command.ts:21` |
| [LoadCliOverrides](#LoadCliOverrides) | `interface` | `src/cli/load-command.ts:26` |
| [LoadData](#LoadData) | `type-alias` | `src/contracts/envelopes.ts:302` |
| [LoadEnvelope](#LoadEnvelope) | `type-alias` | `src/contracts/envelopes.ts:303` |
| [LoadOutcome](#LoadOutcome) | `interface` | `src/commands/load.ts:110` |
| [LoadPhase](#LoadPhase) | `type-alias` | `src/commands/load.ts:85` |
| [LoadRunRow](#LoadRunRow) | `interface` | `src/dataset/rows.ts:93` |
| [LoadRunRowInput](#LoadRunRowInput) | `interface` | `src/dataset/rows.ts:82` |
| [LoadTimingEntry](#LoadTimingEntry) | `interface` | `src/commands/load.ts:508` |
| [LoadedPack](#LoadedPack) | `interface` | `src/generate/packs.ts:17` |
| [MAX_ALLOWED_ENV_KEYS](#MAX_ALLOWED_ENV_KEYS) | `constant` | `src/internal/process-runner/policy.ts:45` |
| [MAX_ALLOWED_EXECUTABLES](#MAX_ALLOWED_EXECUTABLES) | `constant` | `src/internal/process-runner/policy.ts:44` |
| [MAX_EVIDENCE_LENGTH](#MAX_EVIDENCE_LENGTH) | `constant` | `src/extractor/sanitize.ts:15` |
| [MAX_EXTENSION_ENTRIES](#MAX_EXTENSION_ENTRIES) | `constant` | `src/internal/source-files/scan.ts:32` |
| [MAX_FILE_COUNT](#MAX_FILE_COUNT) | `constant` | `src/internal/source-files/scan.ts:30` |
| [MAX_FILE_SIZE_BYTES](#MAX_FILE_SIZE_BYTES) | `constant` | `src/internal/source-files/scan.ts:29` |
| [MAX_IGNORE_PATTERNS](#MAX_IGNORE_PATTERNS) | `constant` | `src/internal/source-files/scan.ts:33` |
| [MAX_OUTPUT_BYTES](#MAX_OUTPUT_BYTES) | `constant` | `src/internal/process-runner/policy.ts:41` |
| [MAX_POLICY_NAME_LENGTH](#MAX_POLICY_NAME_LENGTH) | `constant` | `src/internal/process-runner/policy.ts:43` |
| [MAX_READ_BYTES](#MAX_READ_BYTES) | `constant` | `src/internal/source-files/scan.ts:31` |
| [MAX_SEARCH_LIMIT](#MAX_SEARCH_LIMIT) | `constant` | `src/commands/search.ts:33` |
| [MAX_SIGNATURE_LENGTH](#MAX_SIGNATURE_LENGTH) | `constant` | `src/extractor/sanitize.ts:18` |
| [MAX_TIMEOUT_MS](#MAX_TIMEOUT_MS) | `constant` | `src/internal/process-runner/policy.ts:42` |
| [ManagedDatabase](#ManagedDatabase) | `interface` | `src/dataset/sqlite-runtime.ts:54` |
| [ManagedHealthResult](#ManagedHealthResult) | `interface` | `src/dataset/sqlite-runtime.ts:129` |
| [ManagedMigrationResult](#ManagedMigrationResult) | `interface` | `src/dataset/sqlite-runtime.ts:60` |
| [ManagedOpenOptions](#ManagedOpenOptions) | `interface` | `src/dataset/sqlite-runtime.ts:36` |
| [Meter](#Meter) | `interface` | `src/internal/telemetry/index.ts:29` |
| [MetricName](#MetricName) | `type-alias` | `src/internal/process-runner/generated/process-runner-entities.ts:38` |
| [NORMALIZED_FIXTURE_TIMESTAMP](#NORMALIZED_FIXTURE_TIMESTAMP) | `constant` | `src/contracts/timestamp.ts:3` |
| [NOW_TRAVERSAL_POLICY](#NOW_TRAVERSAL_POLICY) | `constant` | `src/commands/check.ts:63` |
| [NormalizedQuery](#NormalizedQuery) | `interface` | `src/search/query.ts:14` |
| [NormalizedTimestamp](#NormalizedTimestamp) | `type-alias` | `src/contracts/timestamp.ts:9` |
| [OpenDatasetOptions](#OpenDatasetOptions) | `interface` | `src/dataset/open.ts:46` |
| [OutboundUrlPolicy](#OutboundUrlPolicy) | `interface` | `src/internal/security/url.ts:5` |
| [OutboundUrlResult](#OutboundUrlResult) | `interface` | `src/internal/security/url.ts:12` |
| [PACKAGE_OVERVIEW_DTO_SCHEMA_ID](#PACKAGE_OVERVIEW_DTO_SCHEMA_ID) | `constant` | `src/projection/dto.ts:143` |
| [PackageDependencyRow](#PackageDependencyRow) | `interface` | `src/dataset/rows.ts:211` |
| [PackageDependencyRowInput](#PackageDependencyRowInput) | `interface` | `src/dataset/rows.ts:204` |
| [PackageExportRow](#PackageExportRow) | `interface` | `src/dataset/rows.ts:179` |
| [PackageExportRowInput](#PackageExportRowInput) | `interface` | `src/dataset/rows.ts:173` |
| [PackageFacts](#PackageFacts) | `interface` | `src/extractor/types.ts:65` |
| [PackageInventory](#PackageInventory) | `interface` | `src/internal/repo-inventory/types.ts:4` |
| [PackageManagerInfo](#PackageManagerInfo) | `interface` | `src/internal/repo-inventory/types.ts:18` |
| [PackageManagerName](#PackageManagerName) | `type-alias` | `src/internal/repo-inventory/types.ts:1` |
| [PackageOverviewDto](#PackageOverviewDto) | `type-alias` | `src/projection/dto.ts:140` |
| [PackageRow](#PackageRow) | `interface` | `src/dataset/rows.ts:144` |
| [PackageRowInput](#PackageRowInput) | `interface` | `src/dataset/rows.ts:135` |
| [ProblemDetails](#ProblemDetails) | `interface` | `src/internal/errors/problem-details.ts:6` |
| [ProcessCommand](#ProcessCommand) | `interface` | `src/internal/process-runner/types.ts:1` |
| [ProcessCommandSnapshot](#ProcessCommandSnapshot) | `interface` | `src/internal/process-runner/policy.ts:18` |
| [ProcessOutputLimit](#ProcessOutputLimit) | `interface` | `src/internal/process-runner/types.ts:23` |
| [ProcessResult](#ProcessResult) | `interface` | `src/internal/process-runner/types.ts:27` |
| [ProcessRunner](#ProcessRunner) | `interface` | `src/internal/process-runner/types.ts:38` |
| [ProcessRunnerPolicy](#ProcessRunnerPolicy) | `interface` | `src/internal/process-runner/types.ts:11` |
| [ProcessRunnerPolicySnapshot](#ProcessRunnerPolicySnapshot) | `interface` | `src/internal/process-runner/policy.ts:7` |
| [ProjectRow](#ProjectRow) | `interface` | `src/dataset/rows.ts:28` |
| [ProjectionDto](#ProjectionDto) | `type-alias` | `src/generate/document.ts:48` |
| [ProjectionOptions](#ProjectionOptions) | `interface` | `src/projection/index.ts:30` |
| [ProjectionOutcome](#ProjectionOutcome) | `type-alias` | `src/projection/index.ts:37` |
| [PureHelper](#PureHelper) | `type-alias` | `src/render/engine.ts:48` |
| [RankableCandidate](#RankableCandidate) | `interface` | `src/search/rank.ts:35` |
| [RateLimitKeyOptions](#RateLimitKeyOptions) | `interface` | `src/internal/security/rate-limit.ts:3` |
| [ReadOptions](#ReadOptions) | `interface` | `src/internal/source-files/types.ts:32` |
| [RedactionResult](#RedactionResult) | `interface` | `src/internal/security/redaction.ts:6` |
| [RedactionRule](#RedactionRule) | `interface` | `src/internal/security/redaction.ts:1` |
| [Redactor](#Redactor) | `interface` | `src/internal/security/redaction.ts:11` |
| [ReexportResolution](#ReexportResolution) | `interface` | `src/extractor/type-checker.ts:22` |
| [RepoInventory](#RepoInventory) | `interface` | `src/internal/repo-inventory/types.ts:40` |
| [ResolvedId](#ResolvedId) | `interface` | `src/dataset/ids.ts:336` |
| [RunCheckOptions](#RunCheckOptions) | `interface` | `src/commands/check.ts:103` |
| [RunGenerateOptions](#RunGenerateOptions) | `interface` | `src/commands/generate.ts:48` |
| [RunLoadOptions](#RunLoadOptions) | `interface` | `src/commands/load.ts:100` |
| [RunSearchOptions](#RunSearchOptions) | `interface` | `src/commands/search.ts:38` |
| [SAFE_DEFAULT_ENV_KEYS](#SAFE_DEFAULT_ENV_KEYS) | `constant` | `src/internal/process-runner/policy.ts:28` |
| [SEARCH_DOCUMENT_FTS_COLUMNS](#SEARCH_DOCUMENT_FTS_COLUMNS) | `constant` | `src/dataset/schema.ts:54` |
| [SEARCH_DOCUMENT_FTS_TABLE](#SEARCH_DOCUMENT_FTS_TABLE) | `constant` | `src/dataset/schema.ts:47` |
| [SEARCH_KINDS](#SEARCH_KINDS) | `constant` | `src/commands/search.ts:36` |
| [SEARCH_TOKENIZER_VERSION](#SEARCH_TOKENIZER_VERSION) | `constant` | `src/commands/load.ts:82` |
| [SEARCH_TOOL_VERSION](#SEARCH_TOOL_VERSION) | `constant` | `src/commands/search.ts:31` |
| [SafeDetail](#SafeDetail) | `type-alias` | `src/contracts/diagnostics.ts:148` |
| [SafeError](#SafeError) | `interface` | `src/internal/errors/problem-details.ts:18` |
| [SafePathPolicy](#SafePathPolicy) | `interface` | `src/internal/security/path.ts:9` |
| [SafePathResult](#SafePathResult) | `interface` | `src/internal/security/path.ts:14` |
| [SanitizedEvidence](#SanitizedEvidence) | `interface` | `src/extractor/types.ts:23` |
| [SearchCliOptions](#SearchCliOptions) | `interface` | `src/cli/search-command.ts:22` |
| [SearchCliOverrides](#SearchCliOverrides) | `interface` | `src/cli/search-command.ts:29` |
| [SearchData](#SearchData) | `type-alias` | `src/contracts/envelopes.ts:304` |
| [SearchDocumentRow](#SearchDocumentRow) | `interface` | `src/dataset/rows.ts:496` |
| [SearchDocumentRowInput](#SearchDocumentRowInput) | `interface` | `src/dataset/rows.ts:485` |
| [SearchEnvelope](#SearchEnvelope) | `type-alias` | `src/contracts/envelopes.ts:305` |
| [SearchExecutionInput](#SearchExecutionInput) | `interface` | `src/search/execute.ts:24` |
| [SearchExecutionResult](#SearchExecutionResult) | `interface` | `src/search/execute.ts:32` |
| [SearchKind](#SearchKind) | `type-alias` | `src/search/rank.ts:17` |
| [SearchOutcome](#SearchOutcome) | `interface` | `src/commands/search.ts:47` |
| [SearchTier](#SearchTier) | `type-alias` | `src/search/rank.ts:18` |
| [SectionRecord](#SectionRecord) | `interface` | `src/generate/document.ts:21` |
| [SecurityAuditEvent](#SecurityAuditEvent) | `interface` | `src/internal/security/audit.ts:16` |
| [SecurityAuditEventKind](#SecurityAuditEventKind) | `type-alias` | `src/internal/security/audit.ts:6` |
| [SecurityPolicyDecision](#SecurityPolicyDecision) | `type-alias` | `src/internal/security/types.ts:1` |
| [SignatureRow](#SignatureRow) | `interface` | `src/dataset/rows.ts:374` |
| [SnapshotIdentity](#SnapshotIdentity) | `interface` | `src/dataset/snapshot.ts:51` |
| [SnapshotKind](#SnapshotKind) | `type-alias` | `src/dataset/snapshot.ts:27` |
| [SnapshotRow](#SnapshotRow) | `interface` | `src/dataset/rows.ts:52` |
| [SnapshotRowInput](#SnapshotRowInput) | `interface` | `src/dataset/rows.ts:43` |
| [SnapshotSummary](#SnapshotSummary) | `interface` | `src/dataset/snapshot.ts:44` |
| [SourceExplorer](#SourceExplorer) | `interface` | `src/internal/source-files/types.ts:50` |
| [SourceFileEntry](#SourceFileEntry) | `interface` | `src/internal/source-files/types.ts:3` |
| [SourceFileKind](#SourceFileKind) | `type-alias` | `src/internal/source-files/types.ts:1` |
| [SourceFilePolicy](#SourceFilePolicy) | `interface` | `src/internal/source-files/types.ts:20` |
| [SourceFileRow](#SourceFileRow) | `interface` | `src/dataset/rows.ts:250` |
| [SourceFileRowInput](#SourceFileRowInput) | `interface` | `src/dataset/rows.ts:242` |
| [SourceFileVersionRow](#SourceFileVersionRow) | `interface` | `src/dataset/rows.ts:279` |
| [SourceRange](#SourceRange) | `interface` | `src/extractor/types.ts:16` |
| [SourceRef](#SourceRef) | `type-alias` | `src/contracts/diagnostics.ts:147` |
| [SourceScanResult](#SourceScanResult) | `interface` | `src/internal/source-files/types.ts:9` |
| [Span](#Span) | `interface` | `src/internal/telemetry/index.ts:9` |
| [SqlParam](#SqlParam) | `type-alias` | `src/dataset/sqlite-runtime.ts:34` |
| [SqliteAdapter](#SqliteAdapter) | `interface` | `src/internal/sqlite/types.ts:89` |
| [SqliteCreateOptions](#SqliteCreateOptions) | `interface` | `src/internal/sqlite/types.ts:25` |
| [SqliteDatabase](#SqliteDatabase) | `interface` | `src/internal/sqlite/types.ts:30` |
| [SqliteFtsDefinition](#SqliteFtsDefinition) | `interface` | `src/internal/sqlite/types.ts:66` |
| [SqliteFtsOptions](#SqliteFtsOptions) | `interface` | `src/internal/sqlite/types.ts:73` |
| [SqliteHealthOptions](#SqliteHealthOptions) | `interface` | `src/internal/sqlite/types.ts:78` |
| [SqliteHealthResult](#SqliteHealthResult) | `interface` | `src/internal/sqlite/types.ts:83` |
| [SqliteMigration](#SqliteMigration) | `interface` | `src/internal/sqlite/types.ts:36` |
| [SqliteMigrationResult](#SqliteMigrationResult) | `interface` | `src/internal/sqlite/types.ts:48` |
| [SqliteOpenOptions](#SqliteOpenOptions) | `interface` | `src/internal/sqlite/types.ts:14` |
| [SqlitePolicy](#SqlitePolicy) | `interface` | `src/internal/sqlite/types.ts:1` |
| [SqliteRunMigrationsOptions](#SqliteRunMigrationsOptions) | `interface` | `src/internal/sqlite/types.ts:43` |
| [SqliteTransactionOptions](#SqliteTransactionOptions) | `interface` | `src/internal/sqlite/types.ts:57` |
| [StrictTemplate](#StrictTemplate) | `type-alias` | `src/render/engine.ts:58` |
| [SymbolRow](#SymbolRow) | `interface` | `src/dataset/rows.ts:320` |
| [SymbolRowInput](#SymbolRowInput) | `interface` | `src/dataset/rows.ts:307` |
| [TELEMETRY_ATTRIBUTES](#TELEMETRY_ATTRIBUTES) | `constant` | `src/internal/app-paths/generated/app-paths-entities.ts:19` |
| [TELEMETRY_ATTRIBUTES](#TELEMETRY_ATTRIBUTES) | `constant` | `src/internal/cli/generated/cli-entities.ts:22` |
| [TELEMETRY_ATTRIBUTES](#TELEMETRY_ATTRIBUTES) | `constant` | `src/internal/process-runner/generated/process-runner-entities.ts:19` |
| [TELEMETRY_ATTRIBUTES](#TELEMETRY_ATTRIBUTES) | `constant` | `src/internal/repo-inventory/generated/repo-inventory-entities.ts:20` |
| [TELEMETRY_ATTRIBUTES](#TELEMETRY_ATTRIBUTES) | `constant` | `src/internal/security/generated/security-entities.ts:28` |
| [TELEMETRY_ATTRIBUTES](#TELEMETRY_ATTRIBUTES) | `constant` | `src/internal/source-files/generated/source-files-entities.ts:20` |
| [TELEMETRY_ATTRIBUTES](#TELEMETRY_ATTRIBUTES) | `constant` | `src/internal/sqlite/generated/sqlite-entities.ts:21` |
| [TELEMETRY_METRICS](#TELEMETRY_METRICS) | `constant` | `src/internal/process-runner/generated/process-runner-entities.ts:30` |
| [TEMPLATE_PACK_MANIFEST_FILE](#TEMPLATE_PACK_MANIFEST_FILE) | `constant` | `src/commands/check.ts:57` |
| [TIER_RANK](#TIER_RANK) | `constant` | `src/search/rank.ts:24` |
| [TemplateFile](#TemplateFile) | `type-alias` | `src/contracts/template-pack.ts:63` |
| [TemplateName](#TemplateName) | `type-alias` | `src/generate/packs.ts:15` |
| [TemplatePackManifest](#TemplatePackManifest) | `type-alias` | `src/contracts/template-pack.ts:64` |
| [ToProblemDetailsOptions](#ToProblemDetailsOptions) | `interface` | `src/internal/errors/problem-details.ts:26` |
| [Tracer](#Tracer) | `interface` | `src/internal/telemetry/index.ts:17` |
| [ValidateGeneratedDocResult](#ValidateGeneratedDocResult) | `interface` | `src/contracts/okf.ts:11` |
| [WorkspaceInventory](#WorkspaceInventory) | `interface` | `src/internal/repo-inventory/types.ts:34` |
| [WorkspaceKind](#WorkspaceKind) | `type-alias` | `src/internal/repo-inventory/types.ts:2` |
| [apiReferenceDtoSchema](#apiReferenceDtoSchema) | `constant` | `src/projection/dto.ts:127` |
| [appendLoadTimingEntry](#appendLoadTimingEntry) | `function` | `src/commands/load.ts:542` |
| [assertAppPathInside](#assertAppPathInside) | `function` | `src/internal/app-paths/create.ts:30` |
| [assertDatasetIdentifiersSafe](#assertDatasetIdentifiersSafe) | `function` | `src/dataset/schema.ts:89` |
| [assertDatasetPathContained](#assertDatasetPathContained) | `function` | `src/dataset/open.ts:107` |
| [assertNormalizedTimestamp](#assertNormalizedTimestamp) | `function` | `src/contracts/timestamp.ts:11` |
| [assertOutboundUrlAllowed](#assertOutboundUrlAllowed) | `function` | `src/internal/security/url.ts:106` |
| [assertSafePath](#assertSafePath) | `function` | `src/internal/security/path.ts:96` |
| [buildApiReferenceDto](#buildApiReferenceDto) | `function` | `src/projection/index.ts:239` |
| [buildCitationId](#buildCitationId) | `function` | `src/dataset/ids.ts:320` |
| [buildDiagnosticId](#buildDiagnosticId) | `function` | `src/dataset/ids.ts:245` |
| [buildDocument](#buildDocument) | `function` | `src/generate/document.ts:159` |
| [buildEvidenceId](#buildEvidenceId) | `function` | `src/dataset/ids.ts:224` |
| [buildGeneratedDocId](#buildGeneratedDocId) | `function` | `src/dataset/ids.ts:279` |
| [buildGeneratedSectionId](#buildGeneratedSectionId) | `function` | `src/dataset/ids.ts:305` |
| [buildHashedId](#buildHashedId) | `function` | `src/dataset/ids.ts:106` |
| [buildIgnoreChecker](#buildIgnoreChecker) | `function` | `src/internal/source-files/ignore.ts:70` |
| [buildPackageId](#buildPackageId) | `function` | `src/dataset/ids.ts:129` |
| [buildPackageOverviewDto](#buildPackageOverviewDto) | `function` | `src/projection/index.ts:190` |
| [buildProcessEnv](#buildProcessEnv) | `function` | `src/internal/process-runner/policy.ts:508` |
| [buildProjectId](#buildProjectId) | `function` | `src/dataset/ids.ts:120` |
| [buildRunGenerateOptions](#buildRunGenerateOptions) | `function` | `src/cli/generate-command.ts:96` |
| [buildSearchDocId](#buildSearchDocId) | `function` | `src/dataset/ids.ts:264` |
| [buildSearchFtsCreateStatement](#buildSearchFtsCreateStatement) | `function` | `src/dataset/schema.ts:105` |
| [buildSignatureId](#buildSignatureId) | `function` | `src/dataset/ids.ts:206` |
| [buildSnapshotSummary](#buildSnapshotSummary) | `function` | `src/dataset/snapshot.ts:110` |
| [buildSourceFileId](#buildSourceFileId) | `function` | `src/dataset/ids.ts:148` |
| [buildSourceFileVersionId](#buildSourceFileVersionId) | `function` | `src/dataset/ids.ts:166` |
| [buildSymbolId](#buildSymbolId) | `function` | `src/dataset/ids.ts:184` |
| [checkCommandDefinition](#checkCommandDefinition) | `constant` | `src/cli/check-command.ts:105` |
| [checkDataSchema](#checkDataSchema) | `constant` | `src/contracts/envelopes.ts:89` |
| [checkDatabaseReadinessSchema](#checkDatabaseReadinessSchema) | `constant` | `src/contracts/envelopes.ts:81` |
| [checkEnvelopeSchema](#checkEnvelopeSchema) | `constant` | `src/contracts/envelopes.ts:98` |
| [checkManagedDatabaseHealth](#checkManagedDatabaseHealth) | `function` | `src/dataset/sqlite-runtime.ts:146` |
| [checkPreflightCheckSchema](#checkPreflightCheckSchema) | `constant` | `src/contracts/envelopes.ts:57` |
| [checkSqliteHealth](#checkSqliteHealth) | `function` | `src/internal/sqlite/health.ts:10` |
| [checkTemplateReadinessSchema](#checkTemplateReadinessSchema) | `constant` | `src/contracts/envelopes.ts:66` |
| [closeDataset](#closeDataset) | `function` | `src/dataset/open.ts:191` |
| [closeSqliteDatabase](#closeSqliteDatabase) | `function` | `src/internal/sqlite/database.ts:257` |
| [commandEnvelopeSchemaVersions](#commandEnvelopeSchemaVersions) | `constant` | `src/contracts/envelopes.ts:297` |
| [commandEnvelopeSchemas](#commandEnvelopeSchemas) | `constant` | `src/contracts/envelopes.ts:290` |
| [commitWritePlan](#commitWritePlan) | `function` | `src/internal/source-files/write.ts:122` |
| [compareCandidates](#compareCandidates) | `function` | `src/search/rank.ts:43` |
| [compileStrict](#compileStrict) | `function` | `src/render/engine.ts:65` |
| [computeSnapshotId](#computeSnapshotId) | `function` | `src/dataset/snapshot.ts:91` |
| [computeSnapshotIdentity](#computeSnapshotIdentity) | `function` | `src/dataset/snapshot.ts:136` |
| [conceptPathFor](#conceptPathFor) | `function` | `src/generate/document.ts:217` |
| [countRows](#countRows) | `function` | `src/commands/load.ts:557` |
| [createAppError](#createAppError) | `function` | `src/internal/errors/core.ts:168` |
| [createAtomicWritePlan](#createAtomicWritePlan) | `function` | `src/internal/source-files/write.ts:59` |
| [createCliOutput](#createCliOutput) | `function` | `src/internal/cli/output.ts:79` |
| [createCliProgram](#createCliProgram) | `function` | `src/internal/cli/program.ts:475` |
| [createDiagnostic](#createDiagnostic) | `function` | `src/contracts/diagnostics.ts:160` |
| [createDiagnosticCodeRegistry](#createDiagnosticCodeRegistry) | `function` | `src/contracts/diagnostics.ts:6` |
| [createErrorRegistry](#createErrorRegistry) | `function` | `src/internal/errors/registry.ts:41` |
| [createFtsTable](#createFtsTable) | `function` | `src/internal/sqlite/fts.ts:22` |
| [createOutboundUrlPolicy](#createOutboundUrlPolicy) | `function` | `src/internal/security/url.ts:54` |
| [createProcessRunner](#createProcessRunner) | `function` | `src/internal/process-runner/runner.ts:181` |
| [createRateLimitKey](#createRateLimitKey) | `function` | `src/internal/security/rate-limit.ts:9` |
| [createRedactor](#createRedactor) | `function` | `src/internal/security/redaction.ts:31` |
| [createSafePathPolicy](#createSafePathPolicy) | `function` | `src/internal/security/path.ts:27` |
| [createSecurityAuditEvent](#createSecurityAuditEvent) | `function` | `src/internal/security/audit.ts:46` |
| [createSourceExplorer](#createSourceExplorer) | `function` | `src/internal/source-files/scan.ts:428` |
| [createSqliteDatabase](#createSqliteDatabase) | `function` | `src/internal/sqlite/database.ts:244` |
| [createValidationDiagnostic](#createValidationDiagnostic) | `function` | `src/contracts/diagnostics.ts:164` |
| [declaredTypeTextForUnannotatedExport](#declaredTypeTextForUnannotatedExport) | `function` | `src/extractor/type-checker.ts:65` |
| [defineCliCommand](#defineCliCommand) | `function` | `src/internal/cli/program.ts:479` |
| [defineCliCommandGroup](#defineCliCommandGroup) | `function` | `src/internal/cli/program.ts:486` |
| [deriveProjectKey](#deriveProjectKey) | `function` | `src/commands/check.ts:640` |
| [detectFileKind](#detectFileKind) | `function` | `src/internal/source-files/read.ts:38` |
| [detectIdCollisions](#detectIdCollisions) | `function` | `src/dataset/ids.ts:359` |
| [detectPackageManager](#detectPackageManager) | `function` | `src/internal/repo-inventory/package-manager.ts:14` |
| [determinismInputsSchema](#determinismInputsSchema) | `constant` | `src/contracts/envelopes.ts:261` |
| [diagnosticCodeSchema](#diagnosticCodeSchema) | `constant` | `src/contracts/diagnostics.ts:86` |
| [diagnosticSchema](#diagnosticSchema) | `constant` | `src/contracts/diagnostics.ts:136` |
| [diagnosticSeveritySchema](#diagnosticSeveritySchema) | `constant` | `src/contracts/diagnostics.ts:90` |
| [discoverRepository](#discoverRepository) | `function` | `src/internal/repo-inventory/repo.ts:30` |
| [discoverWorkspace](#discoverWorkspace) | `function` | `src/internal/repo-inventory/workspace.ts:114` |
| [endSpanError](#endSpanError) | `function` | `src/internal/sqlite/database.ts:197` |
| [endSpanOk](#endSpanOk) | `function` | `src/internal/sqlite/database.ts:191` |
| [ensureAppPath](#ensureAppPath) | `function` | `src/internal/app-paths/create.ts:7` |
| [envelopeMetaSchema](#envelopeMetaSchema) | `constant` | `src/contracts/envelopes.ts:32` |
| [executableLabel](#executableLabel) | `function` | `src/internal/process-runner/policy.ts:536` |
| [executeCheckCommand](#executeCheckCommand) | `function` | `src/cli/check-command.ts:138` |
| [executeGenerateCommand](#executeGenerateCommand) | `function` | `src/cli/generate-command.ts:130` |
| [executeLoadCommand](#executeLoadCommand) | `function` | `src/cli/load-command.ts:101` |
| [executeSearch](#executeSearch) | `function` | `src/search/execute.ts:212` |
| [executeSearchCommand](#executeSearchCommand) | `function` | `src/cli/search-command.ts:149` |
| [extractPackageFacts](#extractPackageFacts) | `function` | `src/extractor/extract.ts:344` |
| [findTsconfigFiles](#findTsconfigFiles) | `function` | `src/internal/repo-inventory/tsconfig.ts:15` |
| [fixtureRegistry](#fixtureRegistry) | `constant` | `src/contracts/fixtures.ts:26` |
| [generateDataSchema](#generateDataSchema) | `constant` | `src/contracts/envelopes.ts:270` |
| [generateEnvelopeSchema](#generateEnvelopeSchema) | `constant` | `src/contracts/envelopes.ts:282` |
| [generationManifestSchema](#generationManifestSchema) | `constant` | `src/contracts/envelopes.ts:252` |
| [getCacheDir](#getCacheDir) | `function` | `src/internal/app-paths/resolve.ts:174` |
| [getCliExitCodeForError](#getCliExitCodeForError) | `function` | `src/internal/errors/registry.ts:56` |
| [getConfigDir](#getConfigDir) | `function` | `src/internal/app-paths/resolve.ts:170` |
| [getDataDir](#getDataDir) | `function` | `src/internal/app-paths/resolve.ts:178` |
| [getHandle](#getHandle) | `function` | `src/internal/sqlite/database.ts:24` |
| [getHttpStatusForError](#getHttpStatusForError) | `function` | `src/internal/errors/registry.ts:50` |
| [getLogDir](#getLogDir) | `function` | `src/internal/app-paths/resolve.ts:186` |
| [getMeter](#getMeter) | `function` | `src/internal/telemetry/index.ts:63` |
| [getStateDir](#getStateDir) | `function` | `src/internal/app-paths/resolve.ts:182` |
| [getTempDir](#getTempDir) | `function` | `src/internal/app-paths/resolve.ts:190` |
| [getTracer](#getTracer) | `function` | `src/internal/telemetry/index.ts:59` |
| [hashFileContent](#hashFileContent) | `function` | `src/internal/source-files/hash.ts:15` |
| [headingSlug](#headingSlug) | `function` | `src/generate/helpers.ts:17` |
| [indexSearchDocument](#indexSearchDocument) | `function` | `src/dataset/rows.ts:540` |
| [initMigration](#initMigration) | `constant` | `src/dataset/migrations/001-init.ts:156` |
| [insertDiagnostic](#insertDiagnostic) | `function` | `src/dataset/rows.ts:452` |
| [insertEvidence](#insertEvidence) | `function` | `src/dataset/rows.ts:406` |
| [insertGeneratedDoc](#insertGeneratedDoc) | `function` | `src/dataset/rows.ts:561` |
| [insertLoadRun](#insertLoadRun) | `function` | `src/dataset/rows.ts:104` |
| [insertPackage](#insertPackage) | `function` | `src/dataset/rows.ts:153` |
| [insertPackageDependency](#insertPackageDependency) | `function` | `src/dataset/rows.ts:218` |
| [insertPackageExport](#insertPackageExport) | `function` | `src/dataset/rows.ts:185` |
| [insertProject](#insertProject) | `function` | `src/dataset/rows.ts:33` |
| [insertSearchDocument](#insertSearchDocument) | `function` | `src/dataset/rows.ts:507` |
| [insertSignature](#insertSignature) | `function` | `src/dataset/rows.ts:380` |
| [insertSnapshot](#insertSnapshot) | `function` | `src/dataset/rows.ts:61` |
| [insertSourceFile](#insertSourceFile) | `function` | `src/dataset/rows.ts:258` |
| [insertSourceFileVersion](#insertSourceFileVersion) | `function` | `src/dataset/rows.ts:285` |
| [insertSymbol](#insertSymbol) | `function` | `src/dataset/rows.ts:337` |
| [isAppError](#isAppError) | `function` | `src/internal/errors/core.ts:164` |
| [isExecutableAllowed](#isExecutableAllowed) | `function` | `src/internal/process-runner/policy.ts:467` |
| [isPathInside](#isPathInside) | `function` | `src/internal/security/path.ts:45` |
| [isRetryableError](#isRetryableError) | `function` | `src/internal/errors/registry.ts:83` |
| [kindOrder](#kindOrder) | `function` | `src/search/rank.ts:26` |
| [loadCommandDefinition](#loadCommandDefinition) | `constant` | `src/cli/load-command.ts:75` |
| [loadCountsSchema](#loadCountsSchema) | `constant` | `src/contracts/envelopes.ts:128` |
| [loadDataSchema](#loadDataSchema) | `constant` | `src/contracts/envelopes.ts:151` |
| [loadEnvelopeSchema](#loadEnvelopeSchema) | `constant` | `src/contracts/envelopes.ts:164` |
| [loadGitignorePatterns](#loadGitignorePatterns) | `function` | `src/internal/source-files/ignore.ts:105` |
| [loadPack](#loadPack) | `function` | `src/generate/packs.ts:24` |
| [managedAll](#managedAll) | `function` | `src/dataset/sqlite-runtime.ts:281` |
| [managedGet](#managedGet) | `function` | `src/dataset/sqlite-runtime.ts:271` |
| [managedRun](#managedRun) | `function` | `src/dataset/sqlite-runtime.ts:260` |
| [mapErrorToExitCode](#mapErrorToExitCode) | `function` | `src/internal/cli/exit.ts:3` |
| [normalizeAppError](#normalizeAppError) | `function` | `src/internal/errors/core.ts:175` |
| [normalizeMarkdown](#normalizeMarkdown) | `function` | `src/generate/helpers.ts:33` |
| [normalizeQuery](#normalizeQuery) | `function` | `src/search/query.ts:37` |
| [normalizeRepoRelativePath](#normalizeRepoRelativePath) | `function` | `src/dataset/ids.ts:71` |
| [normalizedTimestampForFixture](#normalizedTimestampForFixture) | `function` | `src/contracts/timestamp.ts:19` |
| [normalizedTimestampFromSnapshot](#normalizedTimestampFromSnapshot) | `function` | `src/contracts/timestamp.ts:15` |
| [normalizedTimestampSchema](#normalizedTimestampSchema) | `constant` | `src/contracts/timestamp.ts:5` |
| [openDataset](#openDataset) | `function` | `src/dataset/open.ts:151` |
| [openManagedDatabase](#openManagedDatabase) | `function` | `src/dataset/sqlite-runtime.ts:92` |
| [openSqliteDatabase](#openSqliteDatabase) | `function` | `src/internal/sqlite/database.ts:205` |
| [packageOverviewDtoSchema](#packageOverviewDtoSchema) | `constant` | `src/projection/dto.ts:114` |
| [packageSlug](#packageSlug) | `function` | `src/generate/helpers.ts:23` |
| [parseCheckArgs](#parseCheckArgs) | `function` | `src/cli/check-command.ts:86` |
| [parseCheckEnvelope](#parseCheckEnvelope) | `function` | `src/contracts/envelopes.ts:344` |
| [parseGenerateArgs](#parseGenerateArgs) | `function` | `src/cli/generate-command.ts:77` |
| [parseGenerateEnvelope](#parseGenerateEnvelope) | `function` | `src/contracts/envelopes.ts:356` |
| [parseGlobalCliOptions](#parseGlobalCliOptions) | `function` | `src/internal/cli/program.ts:493` |
| [parseLoadArgs](#parseLoadArgs) | `function` | `src/cli/load-command.ts:52` |
| [parseLoadEnvelope](#parseLoadEnvelope) | `function` | `src/contracts/envelopes.ts:348` |
| [parsePnpmWorkspaceYaml](#parsePnpmWorkspaceYaml) | `function` | `src/internal/repo-inventory/workspace.ts:20` |
| [parseSearchArgs](#parseSearchArgs) | `function` | `src/cli/search-command.ts:72` |
| [parseSearchEnvelope](#parseSearchEnvelope) | `function` | `src/contracts/envelopes.ts:352` |
| [projectAllowedKeys](#projectAllowedKeys) | `function` | `src/internal/security/serialization.ts:1` |
| [projectDirKey](#projectDirKey) | `function` | `src/dataset/open.ts:87` |
| [rankValue](#rankValue) | `function` | `src/search/rank.ts:31` |
| [readBoundedTextFile](#readBoundedTextFile) | `function` | `src/internal/source-files/read.ts:89` |
| [readPackageManifest](#readPackageManifest) | `function` | `src/internal/repo-inventory/manifest.ts:45` |
| [redactObject](#redactObject) | `function` | `src/internal/security/redaction.ts:74` |
| [redactProcessResult](#redactProcessResult) | `function` | `src/internal/process-runner/redact.ts:8` |
| [redactText](#redactText) | `function` | `src/extractor/sanitize.ts:41` |
| [redactValue](#redactValue) | `function` | `src/internal/security/redaction.ts:39` |
| [resolveAppPath](#resolveAppPath) | `function` | `src/internal/app-paths/resolve.ts:166` |
| [resolveAppPaths](#resolveAppPaths) | `function` | `src/internal/app-paths/resolve.ts:135` |
| [resolveDatasetPaths](#resolveDatasetPaths) | `function` | `src/dataset/open.ts:124` |
| [resolveExplicitReexport](#resolveExplicitReexport) | `function` | `src/extractor/type-checker.ts:34` |
| [resolveSafePath](#resolveSafePath) | `function` | `src/internal/security/path.ts:75` |
| [runCheck](#runCheck) | `function` | `src/commands/check.ts:649` |
| [runCliCommand](#runCliCommand) | `function` | `src/internal/cli/program.ts:326` |
| [runGenerate](#runGenerate) | `function` | `src/commands/generate.ts:102` |
| [runLoad](#runLoad) | `function` | `src/commands/load.ts:487` |
| [runManagedMigrations](#runManagedMigrations) | `function` | `src/dataset/sqlite-runtime.ts:170` |
| [runMigrations](#runMigrations) | `function` | `src/internal/sqlite/migrations.ts:35` |
| [runProcess](#runProcess) | `function` | `src/internal/process-runner/runner.ts:142` |
| [runProcessJson](#runProcessJson) | `function` | `src/internal/process-runner/runner.ts:151` |
| [runSearch](#runSearch) | `function` | `src/commands/search.ts:71` |
| [safeDetailSchema](#safeDetailSchema) | `constant` | `src/contracts/diagnostics.ts:134` |
| [safePositiveInt](#safePositiveInt) | `function` | `src/internal/repo-inventory/utils.ts:4` |
| [sanitizeBaseType](#sanitizeBaseType) | `function` | `src/internal/errors/sanitize.ts:81` |
| [sanitizeClientDetail](#sanitizeClientDetail) | `function` | `src/internal/errors/sanitize.ts:58` |
| [sanitizeCode](#sanitizeCode) | `function` | `src/internal/errors/sanitize.ts:31` |
| [sanitizeDiagnosticText](#sanitizeDiagnosticText) | `function` | `src/internal/security/log-sanitization.ts:35` |
| [sanitizeEvidenceText](#sanitizeEvidenceText) | `function` | `src/extractor/sanitize.ts:59` |
| [sanitizeFieldViolations](#sanitizeFieldViolations) | `function` | `src/internal/errors/sanitize.ts:116` |
| [sanitizeHeaderValue](#sanitizeHeaderValue) | `function` | `src/internal/security/log-sanitization.ts:25` |
| [sanitizeHttpStatus](#sanitizeHttpStatus) | `function` | `src/internal/errors/sanitize.ts:39` |
| [sanitizeLogValue](#sanitizeLogValue) | `function` | `src/internal/security/log-sanitization.ts:17` |
| [sanitizeSignatureText](#sanitizeSignatureText) | `function` | `src/extractor/sanitize.ts:49` |
| [sanitizeTitle](#sanitizeTitle) | `function` | `src/internal/errors/sanitize.ts:49` |
| [sanitizeTraceId](#sanitizeTraceId) | `function` | `src/internal/errors/sanitize.ts:69` |
| [scanSourceFiles](#scanSourceFiles) | `function` | `src/internal/source-files/scan.ts:414` |
| [searchCommandDefinition](#searchCommandDefinition) | `constant` | `src/cli/search-command.ts:124` |
| [searchDataSchema](#searchDataSchema) | `constant` | `src/contracts/envelopes.ts:200` |
| [searchEnvelopeSchema](#searchEnvelopeSchema) | `constant` | `src/contracts/envelopes.ts:210` |
| [searchIndexStatusSchema](#searchIndexStatusSchema) | `constant` | `src/contracts/envelopes.ts:143` |
| [searchMatchPolicySchema](#searchMatchPolicySchema) | `constant` | `src/contracts/envelopes.ts:193` |
| [searchResultSchema](#searchResultSchema) | `constant` | `src/contracts/envelopes.ts:182` |
| [selectDiagnostic](#selectDiagnostic) | `function` | `src/dataset/rows.ts:472` |
| [selectEvidence](#selectEvidence) | `function` | `src/dataset/rows.ts:414` |
| [selectGeneratedDoc](#selectGeneratedDoc) | `function` | `src/dataset/rows.ts:578` |
| [selectLoadRun](#selectLoadRun) | `function` | `src/dataset/rows.ts:122` |
| [selectPackage](#selectPackage) | `function` | `src/dataset/rows.ts:162` |
| [selectPackageDependencies](#selectPackageDependencies) | `function` | `src/dataset/rows.ts:227` |
| [selectPackageExports](#selectPackageExports) | `function` | `src/dataset/rows.ts:193` |
| [selectProject](#selectProject) | `function` | `src/dataset/rows.ts:37` |
| [selectSearchDocument](#selectSearchDocument) | `function` | `src/dataset/rows.ts:525` |
| [selectSignature](#selectSignature) | `function` | `src/dataset/rows.ts:388` |
| [selectSnapshot](#selectSnapshot) | `function` | `src/dataset/rows.ts:70` |
| [selectSourceFile](#selectSourceFile) | `function` | `src/dataset/rows.ts:267` |
| [selectSourceFileVersion](#selectSourceFileVersion) | `function` | `src/dataset/rows.ts:293` |
| [selectSymbol](#selectSymbol) | `function` | `src/dataset/rows.ts:357` |
| [slugify](#slugify) | `function` | `src/generate/helpers.ts:8` |
| [snapshotAndValidateProcessCommand](#snapshotAndValidateProcessCommand) | `function` | `src/internal/process-runner/policy.ts:290` |
| [snapshotAndValidateProcessRunnerPolicy](#snapshotAndValidateProcessRunnerPolicy) | `function` | `src/internal/process-runner/policy.ts:145` |
| [sourceRefSchema](#sourceRefSchema) | `constant` | `src/contracts/diagnostics.ts:108` |
| [spawnProcess](#spawnProcess) | `function` | `src/internal/process-runner/spawn.ts:59` |
| [splitIdentifier](#splitIdentifier) | `function` | `src/extractor/identifier.ts:25` |
| [startSpan](#startSpan) | `function` | `src/internal/sqlite/database.ts:181` |
| [summarizeGitState](#summarizeGitState) | `function` | `src/internal/repo-inventory/git.ts:40` |
| [summarizeTimings](#summarizeTimings) | `function` | `src/commands/load.ts:524` |
| [templateFileSchema](#templateFileSchema) | `constant` | `src/contracts/template-pack.ts:23` |
| [templatePackManifestSchema](#templatePackManifestSchema) | `constant` | `src/contracts/template-pack.ts:52` |
| [toProblemDetails](#toProblemDetails) | `function` | `src/internal/errors/problem-details.ts:34` |
| [toSafeError](#toSafeError) | `function` | `src/internal/errors/problem-details.ts:81` |
| [truncateHash](#truncateHash) | `function` | `src/dataset/ids.ts:94` |
| [validateAppName](#validateAppName) | `function` | `src/internal/app-paths/names.ts:26` |
| [validateCommandEnv](#validateCommandEnv) | `function` | `src/internal/process-runner/policy.ts:485` |
| [validateGeneratedDoc](#validateGeneratedDoc) | `function` | `src/contracts/okf.ts:151` |
| [validateIdentifier](#validateIdentifier) | `function` | `src/internal/sqlite/fts.ts:11` |
| [validateOutboundUrl](#validateOutboundUrl) | `function` | `src/internal/security/url.ts:65` |
| [validatePolicy](#validatePolicy) | `function` | `src/internal/sqlite/database.ts:135` |
| [validateProcessCommand](#validateProcessCommand) | `function` | `src/internal/process-runner/policy.ts:503` |
| [validateProcessRunnerPolicy](#validateProcessRunnerPolicy) | `function` | `src/internal/process-runner/policy.ts:281` |
| [validateProfileName](#validateProfileName) | `function` | `src/internal/app-paths/names.ts:39` |
| [validateSourceFilePolicy](#validateSourceFilePolicy) | `function` | `src/internal/source-files/scan.ts:208` |
| [validateWritePlan](#validateWritePlan) | `function` | `src/internal/source-files/write.ts:78` |
| [withDatasetTransaction](#withDatasetTransaction) | `function` | `src/dataset/open.ts:196` |
| [withErrorCause](#withErrorCause) | `function` | `src/internal/errors/core.ts:187` |
| [withManagedTransaction](#withManagedTransaction) | `function` | `src/dataset/sqlite-runtime.ts:238` |
| [withTransaction](#withTransaction) | `function` | `src/internal/sqlite/transaction.ts:22` |
| [writeCliResult](#writeCliResult) | `function` | `src/internal/cli/output.ts:83` |

---

### API_REFERENCE_DTO_SCHEMA_ID

- **Kind**: `constant`
- **Source**: `src/projection/dto.ts:144`

```ts
export const API_REFERENCE_DTO_SCHEMA_ID: "ts-codegraph.api-reference@1"
```

### APP_ERROR_CATEGORIES

- **Kind**: `constant`
- **Source**: `src/internal/errors/core.ts:16`

```ts
export const APP_ERROR_CATEGORIES: readonly ["validation", "authn", "authz", "not_found", "conflict", "rate_limited", "upstream", "timeout", "unavailable", "internal"]
```

### APP_PATH_KINDS

- **Kind**: `constant`
- **Source**: `src/internal/app-paths/types.ts:1`

```ts
export const APP_PATH_KINDS: readonly ["config", "cache", "data", "state", "log", "temp"]
```

### ApiReferenceDto

- **Kind**: `type-alias`
- **Source**: `src/projection/dto.ts:141`

```ts
export type ApiReferenceDto = z.infer<typeof apiReferenceDtoSchema>;
```

### AppError

- **Kind**: `class`
- **Source**: `src/internal/errors/core.ts:97`

```ts
export class AppError extends Error
```

### AppErrorAttributes

- **Kind**: `interface`
- **Source**: `src/internal/errors/core.ts:51`

```ts
export interface AppErrorAttributes { readonly code: AppErrorCode; readonly category: AppErrorCategory; readonly retryable: boolean; readonly httpStatus: number; }
```

### AppErrorCategory

- **Kind**: `type-alias`
- **Source**: `src/internal/errors/core.ts:28`

```ts
export type AppErrorCategory = (typeof APP_ERROR_CATEGORIES)[number];
```

### AppErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/errors/core.ts:14`

```ts
export type AppErrorCode = string;
```

### AppErrorOptions

- **Kind**: `interface`
- **Source**: `src/internal/errors/core.ts:38`

```ts
export interface AppErrorOptions { code: AppErrorCode; category: AppErrorCategory; title: string; clientDetail?: string; retryable?: boolean; httpStatus?: number; fields?: readonly FieldViolation[]; cause?: unknown; }
```

### AppPathErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/app-paths/types.ts:5`

```ts
export type AppPathErrorCode = | 'APP_PATHS_INVALID_APP_NAME' | 'APP_PATHS_INVALID_PROFILE_NAME' | 'APP_PATHS_INVALID_OVERRIDE' | 'APP_PATHS_INVALID_HOME' | 'APP_PATHS_PATH_ESCAPE' | 'APP_PATHS_CREATION_FAILED';
```

### AppPathKind

- **Kind**: `type-alias`
- **Source**: `src/internal/app-paths/types.ts:3`

```ts
export type AppPathKind = (typeof APP_PATH_KINDS)[number];
```

### AppPathOptions

- **Kind**: `interface`
- **Source**: `src/internal/app-paths/types.ts:29`

```ts
export interface AppPathOptions { readonly app: string; readonly profile?: string; readonly policy?: AppPathPolicy; }
```

### AppPathOverrides

- **Kind**: `interface`
- **Source**: `src/internal/app-paths/types.ts:13`

```ts
export interface AppPathOverrides { readonly config?: string; readonly cache?: string; readonly data?: string; readonly state?: string; readonly log?: string; readonly temp?: string; }
```

### AppPathPolicy

- **Kind**: `interface`
- **Source**: `src/internal/app-paths/types.ts:22`

```ts
export interface AppPathPolicy { readonly overrides?: AppPathOverrides; readonly platform?: 'linux' | 'darwin' | 'auto'; readonly readXdg?: boolean; readonly home?: string; }
```

### AppPathResolution

- **Kind**: `interface`
- **Source**: `src/internal/app-paths/types.ts:39`

```ts
export interface AppPathResolution { readonly app: string; readonly profile: string | undefined; readonly config: string; readonly cache: string; readonly data: string; readonly state: string; readonly log: string; readonly temp: string; }
```

### AtomicWriteEntry

- **Kind**: `interface`
- **Source**: `src/internal/source-files/types.ts:38`

```ts
export interface AtomicWriteEntry { readonly relativePath: string; readonly content: string; readonly encoding?: BufferEncoding; }
```

### AtomicWritePlan

- **Kind**: `interface`
- **Source**: `src/internal/source-files/types.ts:44`

```ts
export interface AtomicWritePlan { readonly root: string; readonly entries: readonly AtomicWriteEntry[]; readonly validated: boolean; }
```

### AttributeName

- **Kind**: `type-alias`
- **Source**: `src/internal/app-paths/generated/app-paths-entities.ts:26`

```ts
export type AttributeName = (typeof TELEMETRY_ATTRIBUTES)[keyof typeof TELEMETRY_ATTRIBUTES];
```

### AttributeName

- **Kind**: `type-alias`
- **Source**: `src/internal/cli/generated/cli-entities.ts:31`

```ts
export type AttributeName = (typeof TELEMETRY_ATTRIBUTES)[keyof typeof TELEMETRY_ATTRIBUTES];
```

### AttributeName

- **Kind**: `type-alias`
- **Source**: `src/internal/process-runner/generated/process-runner-entities.ts:27`

```ts
export type AttributeName = (typeof TELEMETRY_ATTRIBUTES)[keyof typeof TELEMETRY_ATTRIBUTES];
```

### AttributeName

- **Kind**: `type-alias`
- **Source**: `src/internal/repo-inventory/generated/repo-inventory-entities.ts:29`

```ts
export type AttributeName = (typeof TELEMETRY_ATTRIBUTES)[keyof typeof TELEMETRY_ATTRIBUTES];
```

### AttributeName

- **Kind**: `type-alias`
- **Source**: `src/internal/security/generated/security-entities.ts:35`

```ts
export type AttributeName = (typeof TELEMETRY_ATTRIBUTES)[keyof typeof TELEMETRY_ATTRIBUTES];
```

### AttributeName

- **Kind**: `type-alias`
- **Source**: `src/internal/source-files/generated/source-files-entities.ts:27`

```ts
export type AttributeName = (typeof TELEMETRY_ATTRIBUTES)[keyof typeof TELEMETRY_ATTRIBUTES];
```

### AttributeName

- **Kind**: `type-alias`
- **Source**: `src/internal/sqlite/generated/sqlite-entities.ts:30`

```ts
export type AttributeName = (typeof TELEMETRY_ATTRIBUTES)[keyof typeof TELEMETRY_ATTRIBUTES];
```

### Attributes

- **Kind**: `type-alias`
- **Source**: `src/internal/telemetry/index.ts:7`

```ts
export type Attributes = Record<string, string | number | boolean | undefined>;
```

### BoundedReadResult

- **Kind**: `interface`
- **Source**: `src/internal/source-files/types.ts:14`

```ts
export interface BoundedReadResult { readonly content: string; readonly truncated: boolean; readonly sizeBytes: number; }
```

### BuildDocumentResult

- **Kind**: `type-alias`
- **Source**: `src/generate/document.ts:39`

```ts
export type BuildDocumentResult = | { readonly status: 'ok'; readonly record: GeneratedDocRecord } | { readonly status: 'skip'; readonly conceptPath: string; readonly reasonCode: DiagnosticCode; readonly diagnostics: readonly Diagnostic[]; };
```

### CHECK_GATE_IDS

- **Kind**: `constant`
- **Source**: `src/commands/check.ts:85`

```ts
export const CHECK_GATE_IDS: readonly ["project-path", "repository-discovery", "tsconfig-presence", "git-state", "traversal-policy", "dataset-readiness", "template-pack", "output-strategy"]
```

The eight preflight gate ids, in their fixed order.

### CHECK_TOOL_VERSION

- **Kind**: `constant`
- **Source**: `src/commands/check.ts:51`

```ts
export const CHECK_TOOL_VERSION: "0.0.0"
```

`ts-codegraph check` — the strict, zero-mutation preflight (step-03 §3).

This module owns the eight ordered gates and assembles a validated
`ts-codegraph.check@1` envelope with `willWrite: false`. It reads everything it
needs and writes nothing: no dataset creation, no migration, no directory
creation (`ensureAppPath` is never called), no writes to `--output`. When a
dataset already exists its health is read through an immutable
(`file:…?immutable=1`) open that creates no WAL sidecars, so the app-managed
directory is never touched. Every path that
enters a diagnostic is reduced to a repo-relative or app-path-relative label
through `@codegraph/security`; absolute paths never appear in output.

There is no write-capable import in this file (no row-insert helpers, no write
plans, no `ensureAppPath`), so no code path can mutate the filesystem.

Tool version stamped into the envelope meta.

### CheckCliOptions

- **Kind**: `interface`
- **Source**: `src/cli/check-command.ts:29`

```ts
export interface CheckCliOptions { readonly project?: string; readonly templatePack?: string; }
```

CLI wiring for `ts-codegraph check`.

`check` must print, in `--json` mode, exactly one `ts-codegraph.check@1` envelope
on stdout. The `@codegraph/cli` program action always appends a `CliResult`
wrapper through `writeCliResult`, which would either wrap the envelope or emit
a second JSON document. So this module composes the shared CLI primitives
directly — `defineCliCommand` for the command contract, `parseGlobalCliOptions`
for the standard globals, `createCliOutput`/`writeCliResult`/`mapErrorToExitCode`
for human output and exit mapping — and owns the JSON boundary itself so the
validated envelope is the sole JSON document written.

### CheckCliOverrides

- **Kind**: `interface`
- **Source**: `src/cli/check-command.ts:35`

```ts
export interface CheckCliOverrides { readonly dataDirOverride?: string; readonly templatePacksDir?: string; readonly timestamp?: string; }
```

Test-only injection seams; never wired to a CLI flag.

### CheckData

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:300`

```ts
export type CheckData = z.infer<typeof checkDataSchema>;
```

### CheckEnvelope

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:301`

```ts
export type CheckEnvelope = z.infer<typeof checkEnvelopeSchema>;
```

### CheckGateId

- **Kind**: `type-alias`
- **Source**: `src/commands/check.ts:96`

```ts
export type CheckGateId = (typeof CHECK_GATE_IDS)[number];
```

### CheckOutcome

- **Kind**: `interface`
- **Source**: `src/commands/check.ts:118`

```ts
export interface CheckOutcome { readonly envelope: CheckEnvelope; /** `true` when no gate failed (warnings still count as success). */ readonly ok: boolean; /** POSIX exit code (0 on success, `validation` mapping otherwise). */ readonly exitCode: number; }
```

### CliCommandDefinition

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:37`

```ts
export interface CliCommandDefinition<TOptions = Record<string, unknown>, TResult = unknown> { readonly name: string; readonly description: string; readonly options?: readonly CliCommandOption[]; readonly run: (options: TOptions, context: CliExecutionContext) => Promise<TResult>; }
```

### CliCommandGroupDefinition

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:50`

```ts
export interface CliCommandGroupDefinition { readonly name: string; readonly description: string; readonly commands: readonly CliCommandDefinition[]; }
```

A parent command group that owns a flat list of leaf child commands, e.g.
`codegraph-cli run start`. This row supports exactly one structural parent level:
a group owns leaf {@link CliCommandDefinition} children. Recursive groups,
group actions, and group-local options are intentionally out of scope.

### CliCommandOption

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:31`

```ts
export interface CliCommandOption { readonly flags: string; readonly description: string; readonly defaultValue?: string | boolean; }
```

### CliErrorDetail

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:17`

```ts
export interface CliErrorDetail { readonly code: string; readonly category: string; readonly title: string; readonly detail?: string; }
```

### CliExecutionContext

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:12`

```ts
export interface CliExecutionContext { readonly globalOptions: CliGlobalOptions; readonly output: CliOutput; }
```

### CliGlobalOptions

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:1`

```ts
export interface CliGlobalOptions { readonly cwd?: string; readonly config?: string; readonly output?: string; readonly dryRun: boolean; readonly json: boolean; readonly quiet: boolean; readonly verbose: boolean; readonly noColor: boolean; }
```

### CliOutput

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:73`

```ts
export interface CliOutput { readonly json: boolean; readonly quiet: boolean; readonly noColor: boolean; write(text: string): void; writeLine(text: string): void; writeError(text: string): void; writeErrorLine(text: string): void; writeJson(data: unknown): void; }
```

### CliOutputOptions

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:65`

```ts
export interface CliOutputOptions { readonly stdout?: NodeJS.WritableStream; readonly stderr?: NodeJS.WritableStream; readonly json?: boolean; readonly quiet?: boolean; readonly noColor?: boolean; }
```

### CliProgram

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:84`

```ts
export interface CliProgram { addCommand<TOptions, TResult>(def: CliCommandDefinition<TOptions, TResult>): this; addCommandGroup(def: CliCommandGroupDefinition): this; parseAsync(argv?: readonly string[]): Promise<void>; }
```

### CliProgramOptions

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:56`

```ts
export interface CliProgramOptions { readonly name: string; readonly description: string; readonly version: string; readonly packageName?: string; readonly stdout?: NodeJS.WritableStream; readonly stderr?: NodeJS.WritableStream; }
```

### CliResult

- **Kind**: `interface`
- **Source**: `src/internal/cli/types.ts:24`

```ts
export interface CliResult<T = unknown> { readonly success: boolean; readonly data?: T; readonly error?: CliErrorDetail; readonly exitCode: number; }
```

### CommandEnvelope

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:308`

```ts
export type CommandEnvelope = CheckEnvelope | LoadEnvelope | SearchEnvelope | GenerateEnvelope;
```

### CompileStrictOptions

- **Kind**: `interface`
- **Source**: `src/render/engine.ts:50`

```ts
export interface CompileStrictOptions { /** Pure helpers registered on the isolated environment for this template. */ readonly helpers?: Readonly<Record<string, PureHelper>>; /** Disable HTML escaping (Markdown output). Default: false. */ readonly noEscape?: boolean; }
```

### ComputeSnapshotInput

- **Kind**: `interface`
- **Source**: `src/dataset/snapshot.ts:36`

```ts
export interface ComputeSnapshotInput { /** The project ID this snapshot belongs to (see `buildProjectId`). */ readonly projectId: string; readonly gitSummary: GitSummary; readonly includedFiles: readonly IncludedFile[]; }
```

### ContractParseResult

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:310`

```ts
export type ContractParseResult<T> = | { readonly success: true; readonly value: T; } | { readonly success: false; readonly diagnostics: readonly Diagnostic[]; };
```

### Counter

- **Kind**: `interface`
- **Source**: `src/internal/telemetry/index.ts:21`

```ts
export interface Counter { add(value: number, attributes?: Attributes): void; }
```

### DATASET_APP_NAME

- **Kind**: `constant`
- **Source**: `src/dataset/open.ts:27`

```ts
export const DATASET_APP_NAME: "ts-codegraph"
```

Dataset location and lifecycle (step-02 §3, decision record §6/§7).

The dataset lives in an app-managed data directory resolved via
`@codegraph/app-paths`, keyed by the public project ID. There is no repo-local
database path. Containment inside the app-paths boundary is asserted on every
open; a boundary violation surfaces as a safe `SAFETY_PATH_ESCAPE` diagnostic
carrying no absolute path. Migrations run idempotently on open, so opening a
fresh directory creates the schema and re-opening is a no-op.

App name used to resolve the app-managed data directory.

### DATASET_DB_FILENAME

- **Kind**: `constant`
- **Source**: `src/dataset/open.ts:33`

```ts
export const DATASET_DB_FILENAME: "dataset.db"
```

The dataset database filename inside a project's dataset directory.

### DATASET_MIGRATIONS

- **Kind**: `constant`
- **Source**: `src/dataset/migrations/index.ts:10`

```ts
export const DATASET_MIGRATIONS: readonly SqliteMigration[]
```

The ordered migration set for `ts-codegraph.dataset@1`. Exactly one numbered
migration in Now; the product-local runner applies it once and treats re-runs
as a no-op (step-02 §3).

### DATASET_SCHEMA_ID

- **Kind**: `constant`
- **Source**: `src/dataset/schema.ts:18`

```ts
export const DATASET_SCHEMA_ID: "ts-codegraph.dataset@1"
```

Product-local `ts-codegraph.dataset@1` schema constants (kickoff §5, step-02 §3).

This module names the durable-fact tables, the FTS surface, and the columns
that later steps read and write. The concrete DDL lives in
`migrations/001-init.ts`; the constants here are the single source of truth for
introspection tests, row helpers, and identifier validation.

Scope is Now only: the fourteen fact tables plus the search FTS table. No
Next/Later tables (`generated_section`, `citation`) and no speculative tables
(`calls`, `switch_maps`, telemetry, security, relationship, or graph tables)
exist by construction — see `FORBIDDEN_TABLES`.

Dataset schema identity, versioned from day one.

### DATASET_SCHEMA_VERSION

- **Kind**: `constant`
- **Source**: `src/dataset/schema.ts:21`

```ts
export const DATASET_SCHEMA_VERSION: 1
```

Numeric dataset schema version stored on `load_run` and `generated_doc`.

### DATASET_SUBDIR

- **Kind**: `constant`
- **Source**: `src/dataset/open.ts:30`

```ts
export const DATASET_SUBDIR: "datasets"
```

Directory that holds all per-project datasets under the data directory.

### DATASET_TABLES

- **Kind**: `constant`
- **Source**: `src/dataset/schema.ts:27`

```ts
export const DATASET_TABLES: readonly ["project", "snapshot", "load_run", "package", "package_export", "package_dependency", "source_file", "source_file_version", "symbol", "signature", "evidence", "diagnostic", "search_document", "generated_doc"]
```

The fourteen Now fact tables, in the logical order of the fact model
(`docs/features/load.md` minimum fact model).

### DEFAULT_HASH_HEX_LENGTH

- **Kind**: `constant`
- **Source**: `src/dataset/ids.ts:35`

```ts
export const DEFAULT_HASH_HEX_LENGTH: 16
```

Default public hash truncation, in hex characters (decision record §6).

### DEFAULT_IGNORE_PATTERNS

- **Kind**: `constant`
- **Source**: `src/internal/source-files/ignore.ts:4`

```ts
export const DEFAULT_IGNORE_PATTERNS: readonly string[]
```

### DEFAULT_SEARCH_LIMIT

- **Kind**: `constant`
- **Source**: `src/commands/search.ts:32`

```ts
export const DEFAULT_SEARCH_LIMIT: 20
```

### DEFAULT_TEMPLATE_PACK

- **Kind**: `constant`
- **Source**: `src/commands/check.ts:54`

```ts
export const DEFAULT_TEMPLATE_PACK: "default"
```

Default template pack name when `--template-pack` is omitted.

### DEFAULT_TEMPLATE_PACKS_DIR

- **Kind**: `constant`
- **Source**: `src/commands/check.ts:80`

```ts
export const DEFAULT_TEMPLATE_PACKS_DIR: string
```

Default location of the ts-codegraph-provided template packs, resolved relative to
this module so it is stable in both `src` and `dist`. Tests override it; Row 7
populates the real packs. Until then a production `check --template-pack
default` correctly reports the pack is not yet present.

### DIAGNOSTIC_CODE_REGISTRY

- **Kind**: `constant`
- **Source**: `src/contracts/diagnostics.ts:26`

```ts
export const DIAGNOSTIC_CODE_REGISTRY: readonly ["CHECK_ENVELOPE_INVALID", "CHECK_PROJECT_NOT_FOUND", "CHECK_PROJECT_UNREADABLE", "CHECK_PROJECT_UNSAFE", "CHECK_PACKAGE_MANIFEST_MISSING", "CHECK_TSCONFIG_MISSING", "CHECK_GIT_UNAVAILABLE", "CHECK_TRAVERSAL_POLICY_INVALID", "CHECK_DATASET_MISSING", "CHECK_DATASET_UNREADABLE", "CHECK_DATASET_UNHEALTHY", "CHECK_TEMPLATE_PACK_MISSING", "CHECK_TEMPLATE_PACK_INVALID", "CHECK_OUTPUT_NOT_WRITABLE", "CHECK_OUTPUT_UNSAFE", "LOAD_ENVELOPE_INVALID", "SEARCH_ENVELOPE_INVALID", "GENERATE_ENVELOPE_INVALID", "GENERATE_REQUIRED_FACT_MISSING", "GENERATE_DTO_INVALID", "GENERATE_OUTPUT_REQUIRED", "GENERATE_DATASET_MISSING", "OKF_TYPE_MISSING", "OKF_TITLE_MISSING", "OKF_DESCRIPTION_MISSING", "OKF_RESOURCE_MISSING", "OKF_TAGS_MISSING", "OKF_TIMESTAMP_MISSING", "OKF_GENERATED_BY_MISSING", "OKF_SCHEMA_VERSION_MISSING", "OKF_SOURCE_SNAPSHOT_MISSING", "OKF_TEMPLATE_ID_MISSING", "OKF_TEMPLATE_VERSION_MISSING", "OKF_DATASET_SCHEMA_VERSION_MISSING", "OKF_FIELD_INVA…
```

### Dataset

- **Kind**: `interface`
- **Source**: `src/dataset/open.ts:72`

```ts
export interface Dataset { readonly projectId: string; readonly schemaId: string; readonly path: string; /** The managed connection; row helpers accept this and never expose its handle. */ readonly db: ManagedDatabase; close(): void; }
```

### DatasetContainmentError

- **Kind**: `class`
- **Source**: `src/dataset/open.ts:36`

```ts
export class DatasetContainmentError extends Error
```

Raised when a resolved dataset path escapes its app-paths boundary.

### DatasetPaths

- **Kind**: `interface`
- **Source**: `src/dataset/open.ts:63`

```ts
export interface DatasetPaths { /** The app-managed data directory (the containment boundary). */ readonly dataDir: string; /** The per-project dataset directory. */ readonly datasetDir: string; /** The dataset database file. */ readonly dbPath: string; }
```

### DatasetTable

- **Kind**: `type-alias`
- **Source**: `src/dataset/schema.ts:44`

```ts
export type DatasetTable = (typeof DATASET_TABLES)[number];
```

### DeclarationFact

- **Kind**: `interface`
- **Source**: `src/extractor/types.ts:34`

```ts
export interface DeclarationFact { readonly kind: DeclarationKind; readonly name: string; /** Repo-relative module paths that export this declaration (sorted). */ readonly exportPaths: readonly string[]; /** Syntactic modifiers present on the declaration (sorted). */ readonly modifiers: readonly string[]; /** Declaration/signature text only — never a body or an initializer value. */ readonly signatureText: string; /** Sanitized JSDoc/comment evidence, when present. */ readonly evidence?: SanitizedEvidence; readonly sourceRange: SourceRange; }
```

One exported declaration's extracted facts. Bodies are never included.

### DeclarationKind

- **Kind**: `type-alias`
- **Source**: `src/extractor/types.ts:13`

```ts
export type DeclarationKind = 'class' | 'function' | 'interface' | 'type-alias' | 'constant';
```

Public, plain-serializable extractor types (step-04 §3, decision record §6).

This module is the extractor's public type surface and **must never reference
the parser library**. `extractPackageFacts` returns only these shapes, so no
parser object crosses the boundary. The opacity test asserts this file (and the
public barrel) carry no parser-library reference.

The five Now exported-declaration kinds.

### DeclaredTypeResolution

- **Kind**: `interface`
- **Source**: `src/extractor/type-checker.ts:50`

```ts
export interface DeclaredTypeResolution { /** Declared-type text (unsanitized; the caller sanitizes before output). */ readonly text?: string; readonly diagnostic?: Diagnostic; }
```

Result of resolving the declared type of an unannotated export.

### Diagnostic

- **Kind**: `type-alias`
- **Source**: `src/contracts/diagnostics.ts:149`

```ts
export type Diagnostic = z.infer<typeof diagnosticSchema>;
```

### DiagnosticCode

- **Kind**: `type-alias`
- **Source**: `src/contracts/diagnostics.ts:78`

```ts
export type DiagnosticCode = (typeof DIAGNOSTIC_CODE_REGISTRY)[number];
```

### DiagnosticCodes

- **Kind**: `constant`
- **Source**: `src/contracts/diagnostics.ts:80`

```ts
export const DiagnosticCodes: Readonly<{ readonly CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; readonly CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; readonly CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; readonly CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; readonly CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; readonly CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; readonly CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; readonly CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; readonly CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; readonly CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; readonly CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; readonly CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; readonly CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; readonly CHECK_OUTPUT_NOT_WRITABLE: "CHECK_OUTPUT_NOT_WRITABLE"; readonly CHECK_OUTPUT_UNSAFE: "CHECK_OUTPUT_UNSAFE"; readonly LOAD_ENVE…
```

### DiagnosticInput

- **Kind**: `interface`
- **Source**: `src/contracts/diagnostics.ts:151`

```ts
export interface DiagnosticInput { readonly code: DiagnosticCode; readonly severity: DiagnosticSeverity; readonly message: string; readonly sourceRef?: SourceRef; readonly safeDetail?: SafeDetail; readonly suggestedAction?: string; }
```

### DiagnosticRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:439`

```ts
export interface DiagnosticRow { readonly id: string; readonly snapshotId: string; readonly loadRunId: string | null; readonly code: string; readonly severity: string; readonly message: string; readonly locationKey: string | null; readonly sourcePath: string | null; readonly sourceLine: number | null; readonly sourceEndLine: number | null; }
```

### DiagnosticRowInput

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:426`

```ts
export interface DiagnosticRowInput { readonly id: string; readonly snapshotId: string; readonly loadRunId?: string; readonly code: string; readonly severity: string; readonly message: string; readonly locationKey?: string; readonly sourcePath?: string; readonly sourceLine?: number; readonly sourceEndLine?: number; }
```

### DiagnosticSeverity

- **Kind**: `type-alias`
- **Source**: `src/contracts/diagnostics.ts:92`

```ts
export type DiagnosticSeverity = z.infer<typeof diagnosticSeveritySchema>;
```

### DiscoverRepositoryOptions

- **Kind**: `interface`
- **Source**: `src/internal/repo-inventory/types.ts:49`

```ts
export interface DiscoverRepositoryOptions { readonly maxPackages?: number; readonly maxTsconfigFiles?: number; readonly skipGit?: boolean; readonly extraIgnorePatterns?: readonly string[]; }
```

### DiscoverWorkspaceOptions

- **Kind**: `interface`
- **Source**: `src/internal/repo-inventory/types.ts:56`

```ts
export interface DiscoverWorkspaceOptions { readonly maxPackages?: number; readonly extraIgnorePatterns?: readonly string[]; }
```

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/internal/app-paths/generated/app-paths-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_APP_PATHS: "codegraph.app-paths"; readonly CODEGRAPH_APP_PATHS_API_APP_PATH_CREATION: "codegraph.app-paths.api.app-path-creation"; readonly CODEGRAPH_APP_PATHS_API_APP_PATHS: "codegraph.app-paths.api.app-paths"; readonly CODEGRAPH_APP_PATHS_ERRORS_APP_PATHS_ERRORS: "codegraph.app-paths.errors.app-paths-errors"; readonly CODEGRAPH_APP_PATHS_GENERATED_APP_PATHS_TYPES: "codegraph.app-paths.generated.app-paths-types"; readonly CODEGRAPH_APP_PATHS_SECURITY_APP_PATHS_POLICY: "codegraph.app-paths.security.app-paths-policy"; readonly CODEGRAPH_APP_PATHS_TELEMETRY_APP_PATHS_TELEMETRY: "codegraph.app-paths.telemetry.app-paths-telemetry"; }
```

Entity IDs

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/internal/cli/generated/cli-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_CLI: "codegraph.cli"; readonly CODEGRAPH_CLI_API_CLI_COMMAND: "codegraph.cli.api.cli-command"; readonly CODEGRAPH_CLI_API_CLI_COMMAND_GROUP: "codegraph.cli.api.cli-command-group"; readonly CODEGRAPH_CLI_API_CLI_OUTPUT: "codegraph.cli.api.cli-output"; readonly CODEGRAPH_CLI_API_CLI_PROGRAM: "codegraph.cli.api.cli-program"; readonly CODEGRAPH_CLI_ERRORS_CLI_ERRORS: "codegraph.cli.errors.cli-errors"; readonly CODEGRAPH_CLI_GENERATED_CLI_TYPES: "codegraph.cli.generated.cli-types"; readonly CODEGRAPH_CLI_SECURITY_CLI_DIAGNOSTICS_POLICY: "codegraph.cli.security.cli-diagnostics-policy"; readonly CODEGRAPH_CLI_TELEMETRY_CLI_TELEMETRY: "codegraph.cli.telemetry.cli-telemetry"; readonly CODEGRAPH_CLI_TOOL_CLI_TOOL_POLICY: "codegraph.cli.tool.cli-tool-policy"; }
```

Entity IDs

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/internal/errors/generated/error-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_ERRORS: "codegraph.errors"; readonly CODEGRAPH_ERRORS_API_APP_ERROR: "codegraph.errors.api.app-error"; readonly CODEGRAPH_ERRORS_API_CLI_EXIT: "codegraph.errors.api.cli-exit"; readonly CODEGRAPH_ERRORS_API_NORMALIZATION: "codegraph.errors.api.normalization"; readonly CODEGRAPH_ERRORS_API_PROBLEM_DETAILS: "codegraph.errors.api.problem-details"; readonly CODEGRAPH_ERRORS_API_REGISTRY: "codegraph.errors.api.registry"; readonly CODEGRAPH_ERRORS_ERRORS_APP_ERRORS: "codegraph.errors.errors.app-errors"; readonly CODEGRAPH_ERRORS_GENERATED_ERROR_CODES: "codegraph.errors.generated.error-codes"; readonly CODEGRAPH_ERRORS_SECURITY_ERROR_SERIALIZATION_POLICY: "codegraph.errors.security.error-serialization-policy"; }
```

Entity IDs

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/generated/process-runner-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_PROCESS_RUNNER: "codegraph.process-runner"; readonly CODEGRAPH_PROCESS_RUNNER_API_PROCESS_RESULT: "codegraph.process-runner.api.process-result"; readonly CODEGRAPH_PROCESS_RUNNER_API_PROCESS_RUNNER: "codegraph.process-runner.api.process-runner"; readonly CODEGRAPH_PROCESS_RUNNER_ERRORS_PROCESS_RUNNER_ERRORS: "codegraph.process-runner.errors.process-runner-errors"; readonly CODEGRAPH_PROCESS_RUNNER_GENERATED_PROCESS_RUNNER_TYPES: "codegraph.process-runner.generated.process-runner-types"; readonly CODEGRAPH_PROCESS_RUNNER_SECURITY_PROCESS_EXECUTION_POLICY: "codegraph.process-runner.security.process-execution-policy"; readonly CODEGRAPH_PROCESS_RUNNER_TELEMETRY_PROCESS_RUNNER_TELEMETRY: "codegraph.process-runner.telemetry.process-runner-telemetry"; }
```

Entity IDs

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/internal/repo-inventory/generated/repo-inventory-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_REPO_INVENTORY: "codegraph.repo-inventory"; readonly CODEGRAPH_REPO_INVENTORY_API_GIT_SUMMARY: "codegraph.repo-inventory.api.git-summary"; readonly CODEGRAPH_REPO_INVENTORY_API_REPO_INVENTORY: "codegraph.repo-inventory.api.repo-inventory"; readonly CODEGRAPH_REPO_INVENTORY_API_WORKSPACE_INVENTORY: "codegraph.repo-inventory.api.workspace-inventory"; readonly CODEGRAPH_REPO_INVENTORY_ERRORS_REPO_INVENTORY_ERRORS: "codegraph.repo-inventory.errors.repo-inventory-errors"; readonly CODEGRAPH_REPO_INVENTORY_GENERATED_REPO_INVENTORY_TYPES: "codegraph.repo-inventory.generated.repo-inventory-types"; readonly CODEGRAPH_REPO_INVENTORY_SECURITY_REPO_INVENTORY_POLICY: "codegraph.repo-inventory.security.repo-inventory-policy"; readonly CODEGRAPH_REPO_INVENTORY_TELEMETRY_REPO_INVENTORY_TELEMETRY: "codegraph.repo-inventory.telemetry.repo-inventory-telemetry"; }
```

Entity IDs

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/internal/security/generated/security-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_SECURITY: "codegraph.security"; readonly CODEGRAPH_SECURITY_API_AUDIT_EVENTS: "codegraph.security.api.audit-events"; readonly CODEGRAPH_SECURITY_API_LOG_SANITIZATION: "codegraph.security.api.log-sanitization"; readonly CODEGRAPH_SECURITY_API_OUTBOUND_URL_POLICY: "codegraph.security.api.outbound-url-policy"; readonly CODEGRAPH_SECURITY_API_PATH_POLICY: "codegraph.security.api.path-policy"; readonly CODEGRAPH_SECURITY_API_RATE_LIMIT_KEY: "codegraph.security.api.rate-limit-key"; readonly CODEGRAPH_SECURITY_API_REDACTION: "codegraph.security.api.redaction"; readonly CODEGRAPH_SECURITY_API_SAFE_SERIALIZATION: "codegraph.security.api.safe-serialization"; readonly CODEGRAPH_SECURITY_ERRORS_SECURITY_ERRORS: "codegraph.security.errors.security-errors"; readonly CODEGRAPH_SECURITY_GENERATED_SECURITY_TYPES: "codegraph.security.generated.security-types"; readonly CODEGRAPH_SECURITY_SECURITY_LOG_INJECTION_POLICY: "codegraph.security.security.log-injecti…
```

Entity IDs

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/internal/source-files/generated/source-files-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_SOURCE_FILES: "codegraph.source-files"; readonly CODEGRAPH_SOURCE_FILES_API_ATOMIC_WRITE_PLAN: "codegraph.source-files.api.atomic-write-plan"; readonly CODEGRAPH_SOURCE_FILES_API_BOUNDED_READ: "codegraph.source-files.api.bounded-read"; readonly CODEGRAPH_SOURCE_FILES_API_SOURCE_SCAN: "codegraph.source-files.api.source-scan"; readonly CODEGRAPH_SOURCE_FILES_ERRORS_SOURCE_FILES_ERRORS: "codegraph.source-files.errors.source-files-errors"; readonly CODEGRAPH_SOURCE_FILES_GENERATED_SOURCE_FILES_TYPES: "codegraph.source-files.generated.source-files-types"; readonly CODEGRAPH_SOURCE_FILES_SECURITY_SOURCE_FILES_POLICY: "codegraph.source-files.security.source-files-policy"; readonly CODEGRAPH_SOURCE_FILES_TELEMETRY_SOURCE_FILES_TELEMETRY: "codegraph.source-files.telemetry.source-files-telemetry"; }
```

Entity IDs

### ENTITY_IDS

- **Kind**: `constant`
- **Source**: `src/internal/sqlite/generated/sqlite-entities.ts:6`

```ts
export const ENTITY_IDS: { readonly CODEGRAPH_SQLITE: "codegraph.sqlite"; readonly CODEGRAPH_SQLITE_API_SQLITE_DATABASE: "codegraph.sqlite.api.sqlite-database"; readonly CODEGRAPH_SQLITE_API_SQLITE_FTS: "codegraph.sqlite.api.sqlite-fts"; readonly CODEGRAPH_SQLITE_API_SQLITE_MIGRATIONS: "codegraph.sqlite.api.sqlite-migrations"; readonly CODEGRAPH_SQLITE_API_SQLITE_TRANSACTIONS: "codegraph.sqlite.api.sqlite-transactions"; readonly CODEGRAPH_SQLITE_ERRORS_SQLITE_ERRORS: "codegraph.sqlite.errors.sqlite-errors"; readonly CODEGRAPH_SQLITE_GENERATED_SQLITE_TYPES: "codegraph.sqlite.generated.sqlite-types"; readonly CODEGRAPH_SQLITE_SECURITY_SQLITE_POLICY: "codegraph.sqlite.security.sqlite-policy"; readonly CODEGRAPH_SQLITE_TELEMETRY_SQLITE_TELEMETRY: "codegraph.sqlite.telemetry.sqlite-telemetry"; }
```

Entity IDs

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/internal/app-paths/generated/app-paths-entities.ts:29`

```ts
export const ERROR_CODES: { readonly APP_PATHS_CREATION_FAILED: "APP_PATHS_CREATION_FAILED"; readonly APP_PATHS_INVALID_APP_NAME: "APP_PATHS_INVALID_APP_NAME"; readonly APP_PATHS_INVALID_HOME: "APP_PATHS_INVALID_HOME"; readonly APP_PATHS_INVALID_OVERRIDE: "APP_PATHS_INVALID_OVERRIDE"; readonly APP_PATHS_INVALID_PROFILE_NAME: "APP_PATHS_INVALID_PROFILE_NAME"; readonly APP_PATHS_PATH_ESCAPE: "APP_PATHS_PATH_ESCAPE"; }
```

Error codes

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/internal/cli/generated/cli-entities.ts:34`

```ts
export const ERROR_CODES: { readonly CLI_COMMAND_FAILED: "CLI_COMMAND_FAILED"; readonly CLI_COMMAND_NOT_FOUND: "CLI_COMMAND_NOT_FOUND"; readonly CLI_FLAG_INVALID: "CLI_FLAG_INVALID"; readonly CLI_OUTPUT_FAILED: "CLI_OUTPUT_FAILED"; }
```

Error codes

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/internal/errors/generated/error-entities.ts:21`

```ts
export const ERROR_CODES: { readonly CONFLICT: "CONFLICT"; readonly FORBIDDEN: "FORBIDDEN"; readonly INTERNAL: "INTERNAL"; readonly NOT_FOUND: "NOT_FOUND"; readonly RATE_LIMITED: "RATE_LIMITED"; readonly TIMEOUT: "TIMEOUT"; readonly UNAUTHORIZED: "UNAUTHORIZED"; readonly UNAVAILABLE: "UNAVAILABLE"; readonly UPSTREAM_ERROR: "UPSTREAM_ERROR"; readonly VALIDATION: "VALIDATION"; }
```

Error codes

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/generated/process-runner-entities.ts:41`

```ts
export const ERROR_CODES: { readonly PROCESS_CANCELLED: "PROCESS_CANCELLED"; readonly PROCESS_ENV_DENIED: "PROCESS_ENV_DENIED"; readonly PROCESS_EXECUTABLE_DENIED: "PROCESS_EXECUTABLE_DENIED"; readonly PROCESS_INVALID_COMMAND: "PROCESS_INVALID_COMMAND"; readonly PROCESS_INVALID_JSON: "PROCESS_INVALID_JSON"; readonly PROCESS_INVALID_POLICY: "PROCESS_INVALID_POLICY"; readonly PROCESS_NON_ZERO_EXIT: "PROCESS_NON_ZERO_EXIT"; readonly PROCESS_SHELL_DENIED: "PROCESS_SHELL_DENIED"; readonly PROCESS_SPAWN_FAILED: "PROCESS_SPAWN_FAILED"; readonly PROCESS_TIMEOUT: "PROCESS_TIMEOUT"; }
```

Error codes

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/internal/repo-inventory/generated/repo-inventory-entities.ts:32`

```ts
export const ERROR_CODES: { readonly REPO_GIT_PROBE_FAILED: "REPO_GIT_PROBE_FAILED"; readonly REPO_INVALID_ROOT: "REPO_INVALID_ROOT"; readonly REPO_INVENTORY_LIMIT_EXCEEDED: "REPO_INVENTORY_LIMIT_EXCEEDED"; readonly REPO_MANIFEST_PARSE_FAILED: "REPO_MANIFEST_PARSE_FAILED"; readonly REPO_PACKAGE_MANAGER_PROBE_FAILED: "REPO_PACKAGE_MANAGER_PROBE_FAILED"; readonly REPO_TRAVERSAL_DENIED: "REPO_TRAVERSAL_DENIED"; }
```

Error codes

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/internal/security/generated/security-entities.ts:38`

```ts
export const ERROR_CODES: { readonly SECURITY_PATH_DENIED: "SECURITY_PATH_DENIED"; readonly SECURITY_POLICY_INVALID: "SECURITY_POLICY_INVALID"; readonly SECURITY_REDACTION_FAILED: "SECURITY_REDACTION_FAILED"; readonly SECURITY_UNSAFE_DIAGNOSTIC: "SECURITY_UNSAFE_DIAGNOSTIC"; readonly SECURITY_URL_DENIED: "SECURITY_URL_DENIED"; }
```

Error codes

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/internal/source-files/generated/source-files-entities.ts:30`

```ts
export const ERROR_CODES: { readonly SOURCE_FILES_BINARY_FILE: "SOURCE_FILES_BINARY_FILE"; readonly SOURCE_FILES_FILE_TOO_LARGE: "SOURCE_FILES_FILE_TOO_LARGE"; readonly SOURCE_FILES_READ_FAILED: "SOURCE_FILES_READ_FAILED"; readonly SOURCE_FILES_ROOT_INVALID: "SOURCE_FILES_ROOT_INVALID"; readonly SOURCE_FILES_SYMLINK_DENIED: "SOURCE_FILES_SYMLINK_DENIED"; readonly SOURCE_FILES_TOO_MANY_FILES: "SOURCE_FILES_TOO_MANY_FILES"; readonly SOURCE_FILES_TRAVERSAL_DENIED: "SOURCE_FILES_TRAVERSAL_DENIED"; readonly SOURCE_FILES_WRITE_FAILED: "SOURCE_FILES_WRITE_FAILED"; readonly SOURCE_FILES_WRITE_PLAN_INVALID: "SOURCE_FILES_WRITE_PLAN_INVALID"; }
```

Error codes

### ERROR_CODES

- **Kind**: `constant`
- **Source**: `src/internal/sqlite/generated/sqlite-entities.ts:33`

```ts
export const ERROR_CODES: { readonly SQLITE_ADAPTER_UNSUPPORTED: "SQLITE_ADAPTER_UNSUPPORTED"; readonly SQLITE_BUSY_TIMEOUT: "SQLITE_BUSY_TIMEOUT"; readonly SQLITE_CORRUPT: "SQLITE_CORRUPT"; readonly SQLITE_FTS_FAILED: "SQLITE_FTS_FAILED"; readonly SQLITE_HEALTH_FAILED: "SQLITE_HEALTH_FAILED"; readonly SQLITE_MIGRATION_CHECKSUM_MISMATCH: "SQLITE_MIGRATION_CHECKSUM_MISMATCH"; readonly SQLITE_MIGRATION_FAILED: "SQLITE_MIGRATION_FAILED"; readonly SQLITE_OPEN_FAILED: "SQLITE_OPEN_FAILED"; readonly SQLITE_PATH_INVALID: "SQLITE_PATH_INVALID"; readonly SQLITE_PATH_UNSAFE: "SQLITE_PATH_UNSAFE"; readonly SQLITE_TRANSACTION_FAILED: "SQLITE_TRANSACTION_FAILED"; readonly SQLITE_UNSAFE_INPUT: "SQLITE_UNSAFE_INPUT"; }
```

Error codes

### EnsureAppPathOptions

- **Kind**: `interface`
- **Source**: `src/internal/app-paths/types.ts:35`

```ts
export interface EnsureAppPathOptions { readonly boundary?: string; }
```

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/internal/app-paths/generated/app-paths-entities.ts:16`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/internal/cli/generated/cli-entities.ts:19`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/internal/errors/generated/error-entities.ts:18`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/internal/process-runner/generated/process-runner-entities.ts:16`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/internal/repo-inventory/generated/repo-inventory-entities.ts:17`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/internal/security/generated/security-entities.ts:25`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/internal/source-files/generated/source-files-entities.ts:17`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### EntityId

- **Kind**: `type-alias`
- **Source**: `src/internal/sqlite/generated/sqlite-entities.ts:18`

```ts
export type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];
```

### EnvelopeMeta

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:299`

```ts
export type EnvelopeMeta = z.infer<typeof envelopeMetaSchema>;
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/app-paths/generated/app-paths-entities.ts:38`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/cli/generated/cli-entities.ts:41`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/errors/generated/error-entities.ts:34`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/process-runner/generated/process-runner-entities.ts:54`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/repo-inventory/generated/repo-inventory-entities.ts:41`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/security/generated/security-entities.ts:46`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/source-files/generated/source-files-entities.ts:42`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### ErrorCode

- **Kind**: `type-alias`
- **Source**: `src/internal/sqlite/generated/sqlite-entities.ts:48`

```ts
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### ErrorCodeMeta

- **Kind**: `interface`
- **Source**: `src/internal/errors/registry.ts:4`

```ts
export interface ErrorCodeMeta { readonly category: AppErrorCategory; readonly title: string; readonly retryable: boolean; readonly clientSafe: boolean; }
```

### ErrorRegistry

- **Kind**: `class`
- **Source**: `src/internal/errors/registry.ts:14`

```ts
export class ErrorRegistry
```

### EvidenceRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:398`

```ts
export interface EvidenceRow { readonly id: string; readonly symbolId: string; readonly evidenceKind: string; readonly contentHash: string; readonly text: string; }
```

### ExecuteCheckParams

- **Kind**: `interface`
- **Source**: `src/cli/check-command.ts:41`

```ts
export interface ExecuteCheckParams { readonly argv: readonly string[]; readonly stdout?: NodeJS.WritableStream; readonly stderr?: NodeJS.WritableStream; readonly overrides?: CheckCliOverrides; }
```

### ExecuteGenerateParams

- **Kind**: `interface`
- **Source**: `src/cli/generate-command.ts:38`

```ts
export interface ExecuteGenerateParams { readonly argv: readonly string[]; readonly stdout?: NodeJS.WritableStream; readonly stderr?: NodeJS.WritableStream; readonly overrides?: GenerateCliOverrides; }
```

### ExecuteLoadParams

- **Kind**: `interface`
- **Source**: `src/cli/load-command.ts:31`

```ts
export interface ExecuteLoadParams { readonly argv: readonly string[]; readonly stdout?: NodeJS.WritableStream; readonly stderr?: NodeJS.WritableStream; readonly overrides?: LoadCliOverrides; }
```

### ExecuteSearchParams

- **Kind**: `interface`
- **Source**: `src/cli/search-command.ts:34`

```ts
export interface ExecuteSearchParams { readonly argv: readonly string[]; readonly stdout?: NodeJS.WritableStream; readonly stderr?: NodeJS.WritableStream; readonly overrides?: SearchCliOverrides; }
```

### ExtractPackageFactsInput

- **Kind**: `interface`
- **Source**: `src/extractor/types.ts:57`

```ts
export interface ExtractPackageFactsInput { readonly packageName: string; readonly sourceFiles: readonly ExtractorSourceFile[]; /** Absolute path to a tsconfig whose compiler options should be used. */ readonly tsConfigFilePath?: string; }
```

Input to `extractPackageFacts`.

### ExtractorSourceFile

- **Kind**: `interface`
- **Source**: `src/extractor/types.ts:49`

```ts
export interface ExtractorSourceFile { /** Normalized repo-relative POSIX path (used in output ranges). */ readonly repoRelativePath: string; /** Absolute path on disk (used by the parser to read the file). */ readonly absolutePath: string; }
```

A source file the extractor should parse.

### FIXTURE_NAMES

- **Kind**: `constant`
- **Source**: `src/contracts/fixtures.ts:14`

```ts
export const FIXTURE_NAMES: readonly FixtureName[]
```

### FORBIDDEN_TABLES

- **Kind**: `constant`
- **Source**: `src/dataset/schema.ts:68`

```ts
export const FORBIDDEN_TABLES: readonly ["generated_section", "generated_sections", "citation", "citations", "calls", "switch_maps", "switchmaps", "telemetry", "security", "relationship", "relationships", "graph", "graphs"]
```

Tables that must never appear in a `ts-codegraph.dataset@1` dataset. `generated_section`
and `citation` are Next scope; the rest are explicitly rejected speculative
surfaces (decision record, step-02 §4). Tests assert none of these exist.

### FieldViolation

- **Kind**: `interface`
- **Source**: `src/internal/errors/core.ts:30`

```ts
export interface FieldViolation { readonly field: string; readonly message: string; readonly code?: string; }
```

### FindTsconfigOptions

- **Kind**: `interface`
- **Source**: `src/internal/repo-inventory/types.ts:61`

```ts
export interface FindTsconfigOptions { readonly maxFiles?: number; }
```

### FixtureDefinition

- **Kind**: `interface`
- **Source**: `src/contracts/fixtures.ts:18`

```ts
export interface FixtureDefinition { readonly name: FixtureName; readonly kind: FixtureKind; readonly proves: readonly string[]; readonly packageName?: string; readonly packagePath?: string; }
```

### FixtureKind

- **Kind**: `type-alias`
- **Source**: `src/contracts/fixtures.ts:16`

```ts
export type FixtureKind = 'synthetic' | 'invalid' | 'safety' | 'search' | 'generate' | 'real-package';
```

### FixtureName

- **Kind**: `type-alias`
- **Source**: `src/contracts/fixtures.ts:12`

```ts
export type FixtureName = (typeof fixtureNames)[number];
```

### GENERATE_TEMPLATES

- **Kind**: `constant`
- **Source**: `src/cli/generate-command.ts:45`

```ts
export const GENERATE_TEMPLATES: readonly GenerateTemplate[]
```

### GENERATE_TOOL_VERSION

- **Kind**: `constant`
- **Source**: `src/commands/generate.ts:43`

```ts
export const GENERATE_TOOL_VERSION: "0.0.0"
```

`ts-codegraph generate docs` (step-06b). Reads the loaded dataset only (nothing from
`src/extractor/`); per doc: projection -> DTO validation -> render -> OKF
validation -> atomic write plan -> manifest + `generated_doc` rows, all from one
in-memory structure. `--output` is required for any write. Returns a validated
`ts-codegraph.generate@1` envelope.

### GenerateCliOptions

- **Kind**: `interface`
- **Source**: `src/cli/generate-command.ts:26`

```ts
export interface GenerateCliOptions { readonly subcommand?: string; readonly project?: string; readonly template?: string; readonly output?: string; }
```

CLI wiring for `ts-codegraph generate docs`. `--project`, `--template`, `--output`
(required for any write), `--json`. JSON mode prints exactly one validated
`ts-codegraph.generate@1` envelope. A refusal (missing `--output`, missing dataset)
exits non-zero with a stable diagnostic.

### GenerateCliOverrides

- **Kind**: `interface`
- **Source**: `src/cli/generate-command.ts:33`

```ts
export interface GenerateCliOverrides { readonly dataDirOverride?: string; readonly normalizedTimestamp?: string; }
```

### GenerateData

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:306`

```ts
export type GenerateData = z.infer<typeof generateDataSchema>;
```

### GenerateEnvelope

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:307`

```ts
export type GenerateEnvelope = z.infer<typeof generateEnvelopeSchema>;
```

### GenerateOutcome

- **Kind**: `interface`
- **Source**: `src/commands/generate.ts:57`

```ts
export interface GenerateOutcome { readonly envelope: GenerateEnvelope; readonly ok: boolean; readonly exitCode: number; readonly writtenFiles: readonly string[]; }
```

### GenerateRefusedError

- **Kind**: `class`
- **Source**: `src/commands/generate.ts:65`

```ts
export class GenerateRefusedError extends Error
```

A refusal carries a stable diagnostic (e.g. missing `--output`, missing dataset).

### GenerateTemplate

- **Kind**: `type-alias`
- **Source**: `src/commands/generate.ts:46`

```ts
export type GenerateTemplate = TemplateName | 'all';
```

### GeneratedDocFrontmatter

- **Kind**: `type-alias`
- **Source**: `src/contracts/okf.ts:9`

```ts
export type GeneratedDocFrontmatter = Record<string, unknown>;
```

### GeneratedDocRecord

- **Kind**: `interface`
- **Source**: `src/generate/document.ts:29`

```ts
export interface GeneratedDocRecord { readonly docId: string; readonly templateId: string; readonly templateVersion: string; readonly conceptPath: string; readonly content: string; readonly contentHash: string; readonly sections: readonly SectionRecord[]; }
```

### GeneratedDocRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:551`

```ts
export interface GeneratedDocRow { readonly id: string; readonly snapshotId: string; readonly templateId: string; readonly templateVersion: string; readonly conceptPath: string; readonly contentHash: string; readonly datasetSchemaVersion: number; }
```

### GitSummary

- **Kind**: `interface`
- **Source**: `src/internal/repo-inventory/types.ts:24`

```ts
export interface GitSummary { readonly branch?: string; readonly commitHash?: string; readonly isDirty: boolean; readonly untrackedCount: number; readonly modifiedCount: number; readonly stagedCount: number; readonly available: boolean; }
```

### GitSummaryOptions

- **Kind**: `interface`
- **Source**: `src/internal/repo-inventory/types.ts:65`

```ts
export interface GitSummaryOptions { readonly maxDirtyFiles?: number; }
```

### HashedIdType

- **Kind**: `type-alias`
- **Source**: `src/dataset/ids.ts:44`

```ts
export type HashedIdType = | 'project' | 'package' | 'source-file' | 'source-file-version' | 'symbol' | 'signature' | 'evidence' | 'diagnostic' | 'search-doc' | 'generated-doc';
```

Hashed ID families that use the `<type>:v1:<hash16>` shape.

### Histogram

- **Kind**: `interface`
- **Source**: `src/internal/telemetry/index.ts:25`

```ts
export interface Histogram { record(value: number, attributes?: Attributes): void; }
```

### ID_VERSION

- **Kind**: `constant`
- **Source**: `src/dataset/ids.ts:32`

```ts
export const ID_VERSION: "v1"
```

Public stable ID builders for ts-codegraph (decision record §6, kickoff §5).

Every public ID is a deterministic typed string with a `:v1:` version segment.
IDs never contain SQLite row ids, absolute paths, or home directories.

Two ID shapes exist:
 - Hashed families (`project`, `package`, `source-file`, `source-file-version`,
   `symbol`, `signature`, `evidence`, `diagnostic`, `search-doc`,
   `generated-doc`) use `<type>:v1:<hash16>`, where `<hash16>` is the first 16
   lowercase-hex characters of the sha256 of a NUL-joined, normalized input
   tuple. The scope is folded into the hash input so no raw path or name leaks
   into the public ID. The exact hash inputs are documented on each builder.
 - Literal families (`snapshot`, `generated-section`, `citation`) follow the
   formats fixed by decision record §7 and §9. `snapshot` lives in
   `./snapshot.ts`; the other two are built here.

Truncation is 16 hex by default. Within a snapshot scope, `detectIdCollisions`
finds distinct inputs that collide at the truncated length and extends the
truncation for the colliding IDs, emitting a `LOAD_ID_COLLISION` diagnostic
(decision record §6).

### IdCollisionEntry

- **Kind**: `interface`
- **Source**: `src/dataset/ids.ts:328`

```ts
export interface IdCollisionEntry { /** Caller key used to correlate the resolved ID back to the source row. */ readonly key: string; readonly type: HashedIdType; /** The NUL-joined, normalized hash-input tuple (as passed to `buildHashedId`). */ readonly hashInput: string; }
```

One entry to check for truncated-hash collisions within a snapshot scope.

### IdCollisionResolution

- **Kind**: `interface`
- **Source**: `src/dataset/ids.ts:343`

```ts
export interface IdCollisionResolution { readonly ids: readonly ResolvedId[]; readonly diagnostics: readonly Diagnostic[]; }
```

### IgnoreChecker

- **Kind**: `interface`
- **Source**: `src/internal/source-files/ignore.ts:66`

```ts
export interface IgnoreChecker { isIgnored(relPath: string): boolean; }
```

### IncludedFile

- **Kind**: `interface`
- **Source**: `src/dataset/snapshot.ts:30`

```ts
export interface IncludedFile { readonly repoRelativePath: string; /** Full sha256 hex digest of the file bytes. */ readonly contentHash: string; }
```

A file included by the traversal policy, with its precomputed content hash.

### KIND_ORDER

- **Kind**: `constant`
- **Source**: `src/search/rank.ts:21`

```ts
export const KIND_ORDER: readonly SearchKind[]
```

Kind order for the tie-break.

### LOAD_TOOL_VERSION

- **Kind**: `constant`
- **Source**: `src/commands/load.ts:81`

```ts
export const LOAD_TOOL_VERSION: "0.0.0"
```

`ts-codegraph load` — the sole fact writer (step-04 §3, decision record §5/§6/§7).

Pipeline: discovery → snapshot identity → safe traversal + content hashing →
opaque extraction → **single-transaction** persistence of every fact plus
per-symbol search documents (FTS pre-split with the Row-3 identifier splitter) →
a validated `ts-codegraph.load@1` envelope. Any error inside the transaction rolls
everything back: no partial snapshot, no partial search state. Persistence order
is explicitly sorted so repeated loads of the same snapshot are deterministic.

### LoadCliOptions

- **Kind**: `interface`
- **Source**: `src/cli/load-command.ts:21`

```ts
export interface LoadCliOptions { readonly project?: string; }
```

CLI wiring for `ts-codegraph load`. Like `check`, JSON mode prints exactly one
validated `ts-codegraph.load@1` envelope on stdout; the shared `@codegraph/cli`
`CliResult` wrapper is bypassed so the envelope is the sole JSON document.

### LoadCliOverrides

- **Kind**: `interface`
- **Source**: `src/cli/load-command.ts:26`

```ts
export interface LoadCliOverrides { readonly dataDirOverride?: string; readonly timestamp?: string; }
```

Test-only injection seams; never wired to a CLI flag.

### LoadData

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:302`

```ts
export type LoadData = z.infer<typeof loadDataSchema>;
```

### LoadEnvelope

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:303`

```ts
export type LoadEnvelope = z.infer<typeof loadEnvelopeSchema>;
```

### LoadOutcome

- **Kind**: `interface`
- **Source**: `src/commands/load.ts:110`

```ts
export interface LoadOutcome { readonly envelope: LoadEnvelope; readonly ok: boolean; readonly exitCode: number; }
```

### LoadPhase

- **Kind**: `type-alias`
- **Source**: `src/commands/load.ts:85`

```ts
export type LoadPhase = | 'project' | 'snapshot' | 'load-run' | 'packages' | 'dependencies' | 'exports' | 'source-files' | 'source-file-versions' | 'symbols' | 'signatures' | 'evidence' | 'diagnostics' | 'search-documents';
```

Ordered persistence phases (also the fault-injection points for the rollback test).

### LoadRunRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:93`

```ts
export interface LoadRunRow { readonly id: string; readonly projectId: string; readonly snapshotId: string; readonly status: string; readonly startedAt: string; readonly finishedAt: string | null; readonly toolVersion: string | null; readonly datasetSchemaVersion: number; }
```

### LoadRunRowInput

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:82`

```ts
export interface LoadRunRowInput { readonly id: string; readonly projectId: string; readonly snapshotId: string; readonly status: string; readonly startedAt: string; readonly finishedAt?: string; readonly toolVersion?: string; readonly datasetSchemaVersion: number; }
```

### LoadTimingEntry

- **Kind**: `interface`
- **Source**: `src/commands/load.ts:508`

```ts
export interface LoadTimingEntry { readonly target: string; readonly medianMs: number; readonly p95Ms: number; readonly runs: number; readonly node: string; readonly tsMorph: string; readonly datasetSchema: string; }
```

### LoadedPack

- **Kind**: `interface`
- **Source**: `src/generate/packs.ts:17`

```ts
export interface LoadedPack { readonly manifest: TemplatePackManifest; readonly templateId: string; readonly templateSource: string; readonly outputPattern: string; }
```

### MAX_ALLOWED_ENV_KEYS

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/policy.ts:45`

```ts
export const MAX_ALLOWED_ENV_KEYS: 256
```

### MAX_ALLOWED_EXECUTABLES

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/policy.ts:44`

```ts
export const MAX_ALLOWED_EXECUTABLES: 256
```

### MAX_EVIDENCE_LENGTH

- **Kind**: `constant`
- **Source**: `src/extractor/sanitize.ts:15`

```ts
export const MAX_EVIDENCE_LENGTH: 2000
```

Evidence and text sanitization (step-04 §3, decision record §6).

All JSDoc/comment evidence, every emitted signature/declaration text, and every
declared-type text pass through here before leaving the extractor. Sanitization
strips control characters, removes home-like absolute paths and secret-looking
values via `@codegraph/security`, and bounds the length. No parser library here.

Max evidence text length (characters) before truncation.

### MAX_EXTENSION_ENTRIES

- **Kind**: `constant`
- **Source**: `src/internal/source-files/scan.ts:32`

```ts
export const MAX_EXTENSION_ENTRIES: 1024
```

### MAX_FILE_COUNT

- **Kind**: `constant`
- **Source**: `src/internal/source-files/scan.ts:30`

```ts
export const MAX_FILE_COUNT: 1000000
```

### MAX_FILE_SIZE_BYTES

- **Kind**: `constant`
- **Source**: `src/internal/source-files/scan.ts:29`

```ts
export const MAX_FILE_SIZE_BYTES: 1073741824
```

### MAX_IGNORE_PATTERNS

- **Kind**: `constant`
- **Source**: `src/internal/source-files/scan.ts:33`

```ts
export const MAX_IGNORE_PATTERNS: 1024
```

### MAX_OUTPUT_BYTES

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/policy.ts:41`

```ts
export const MAX_OUTPUT_BYTES: 1073741824
```

### MAX_POLICY_NAME_LENGTH

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/policy.ts:43`

```ts
export const MAX_POLICY_NAME_LENGTH: 128
```

### MAX_READ_BYTES

- **Kind**: `constant`
- **Source**: `src/internal/source-files/scan.ts:31`

```ts
export const MAX_READ_BYTES: 1073741824
```

### MAX_SEARCH_LIMIT

- **Kind**: `constant`
- **Source**: `src/commands/search.ts:33`

```ts
export const MAX_SEARCH_LIMIT: 100
```

### MAX_SIGNATURE_LENGTH

- **Kind**: `constant`
- **Source**: `src/extractor/sanitize.ts:18`

```ts
export const MAX_SIGNATURE_LENGTH: 1000
```

Max signature/declaration/type text length before truncation.

### MAX_TIMEOUT_MS

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/policy.ts:42`

```ts
export const MAX_TIMEOUT_MS: 3600000
```

### ManagedDatabase

- **Kind**: `interface`
- **Source**: `src/dataset/sqlite-runtime.ts:54`

```ts
export interface ManagedDatabase { readonly path: string; readonly readOnly: boolean; close(): void; }
```

Opaque handle wrapper. The underlying connection is never exposed publicly.

### ManagedHealthResult

- **Kind**: `interface`
- **Source**: `src/dataset/sqlite-runtime.ts:129`

```ts
export interface ManagedHealthResult { readonly ok: boolean; readonly integrityPassed: boolean; }
```

### ManagedMigrationResult

- **Kind**: `interface`
- **Source**: `src/dataset/sqlite-runtime.ts:60`

```ts
export interface ManagedMigrationResult { readonly applied: number; readonly skipped: number; }
```

### ManagedOpenOptions

- **Kind**: `interface`
- **Source**: `src/dataset/sqlite-runtime.ts:36`

```ts
export interface ManagedOpenOptions { /** Absolute filesystem path, or ':memory:' for an in-memory database. */ readonly path: string; /** Open the connection read-only. Default: false. */ readonly readOnly?: boolean; /** Enable WAL journal mode on file databases. Default: true. */ readonly walMode?: boolean; /** SQLite busy_timeout in milliseconds. Default: 5000. */ readonly busyTimeoutMs?: number; /** * Open the file `immutable` (implies read-only). SQLite then reads a WAL-mode * database directly and creates **no** `-wal`/`-shm` sidecars, so the open is * strictly non-mutating. Use for read-only commands like `search`. */ readonly immutable?: boolean; }
```

### Meter

- **Kind**: `interface`
- **Source**: `src/internal/telemetry/index.ts:29`

```ts
export interface Meter { createCounter(name: string, options?: unknown): Counter; createHistogram(name: string, options?: unknown): Histogram; }
```

### MetricName

- **Kind**: `type-alias`
- **Source**: `src/internal/process-runner/generated/process-runner-entities.ts:38`

```ts
export type MetricName = (typeof TELEMETRY_METRICS)[keyof typeof TELEMETRY_METRICS];
```

### NORMALIZED_FIXTURE_TIMESTAMP

- **Kind**: `constant`
- **Source**: `src/contracts/timestamp.ts:3`

```ts
export const NORMALIZED_FIXTURE_TIMESTAMP: "2026-07-03T00:00:00+02:00"
```

### NOW_TRAVERSAL_POLICY

- **Kind**: `constant`
- **Source**: `src/commands/check.ts:63`

```ts
export const NOW_TRAVERSAL_POLICY: SourceFilePolicy
```

The Now source-traversal policy `load` will use. `check` validates it for
self-consistency (gate 5); it is deliberately fixed and small.

### NormalizedQuery

- **Kind**: `interface`
- **Source**: `src/search/query.ts:14`

```ts
export interface NormalizedQuery { /** Trimmed raw query (for the envelope's `query` field). */ readonly raw: string; /** Trimmed, lowercased query (for exact/prefix label comparison). */ readonly lowered: string; /** Ordered, unique lowercase alphanumeric tokens. */ readonly tokens: readonly string[]; /** Safe FTS5 MATCH expression, or `''` when there are no tokens. */ readonly ftsMatch: string; }
```

Query normalization for `ts-codegraph search` (step-05 §3).

User input is reduced to pure lowercase alphanumeric tokens via the Row-3
identifier splitter, which strips **every** non-`[a-z0-9]` character. The FTS5
MATCH expression is then built only from those tokens (each wrapped as an FTS5
string literal, the last one made a prefix term), so raw user input can never
inject MATCH syntax — there are no metacharacters or boolean keywords left to
escape. No `fs`/`path` here.

### NormalizedTimestamp

- **Kind**: `type-alias`
- **Source**: `src/contracts/timestamp.ts:9`

```ts
export type NormalizedTimestamp = z.infer<typeof normalizedTimestampSchema>;
```

### OpenDatasetOptions

- **Kind**: `interface`
- **Source**: `src/dataset/open.ts:46`

```ts
export interface OpenDatasetOptions { /** Create the dataset directory and schema if absent. Default: false. */ readonly create?: boolean; /** Open the connection read-only (used by `check`/`search`). Default: false. */ readonly readOnly?: boolean; /** * Open the dataset `immutable` (implies read-only, runs no migrations, and * creates no WAL sidecars). Used by `search` for a strictly non-mutating read. */ readonly immutable?: boolean; /** * Override the base data directory (tests only). Passed to `@codegraph/app-paths` * as a data-path override so resolution still goes through the shared resolver. */ readonly dataDirOverride?: string; }
```

### OutboundUrlPolicy

- **Kind**: `interface`
- **Source**: `src/internal/security/url.ts:5`

```ts
export interface OutboundUrlPolicy { readonly allowedSchemes: readonly string[]; readonly allowedHosts?: readonly string[]; readonly allowPrivate: boolean; readonly allowRedirects: boolean; }
```

### OutboundUrlResult

- **Kind**: `interface`
- **Source**: `src/internal/security/url.ts:12`

```ts
export interface OutboundUrlResult { readonly decision: SecurityPolicyDecision; readonly safeHost?: string; readonly reason?: string; }
```

### PACKAGE_OVERVIEW_DTO_SCHEMA_ID

- **Kind**: `constant`
- **Source**: `src/projection/dto.ts:143`

```ts
export const PACKAGE_OVERVIEW_DTO_SCHEMA_ID: "ts-codegraph.package-overview@1"
```

### PackageDependencyRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:211`

```ts
export interface PackageDependencyRow { readonly packageId: string; readonly dependencyName: string; readonly dependencyKind: string; readonly versionRange: string | null; }
```

### PackageDependencyRowInput

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:204`

```ts
export interface PackageDependencyRowInput { readonly packageId: string; readonly dependencyName: string; readonly dependencyKind: string; readonly versionRange?: string; }
```

### PackageExportRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:179`

```ts
export interface PackageExportRow { readonly packageId: string; readonly exportPath: string; readonly symbolId: string | null; }
```

### PackageExportRowInput

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:173`

```ts
export interface PackageExportRowInput { readonly packageId: string; readonly exportPath: string; readonly symbolId?: string; }
```

### PackageFacts

- **Kind**: `interface`
- **Source**: `src/extractor/types.ts:65`

```ts
export interface PackageFacts { readonly packageName: string; readonly declarations: readonly DeclarationFact[]; readonly diagnostics: readonly Diagnostic[]; }
```

The extractor's plain-serializable result.

### PackageInventory

- **Kind**: `interface`
- **Source**: `src/internal/repo-inventory/types.ts:4`

```ts
export interface PackageInventory { readonly path: string; readonly relativePath: string; readonly name?: string; readonly version?: string; readonly description?: string; readonly private?: boolean; readonly workspaces?: readonly string[]; readonly dependencies?: Readonly<Record<string, string>>; readonly devDependencies?: Readonly<Record<string, string>>; readonly scripts?: Readonly<Record<string, string>>; readonly hasTypeScript: boolean; }
```

### PackageManagerInfo

- **Kind**: `interface`
- **Source**: `src/internal/repo-inventory/types.ts:18`

```ts
export interface PackageManagerInfo { readonly name: PackageManagerName; readonly lockfilePresent: boolean; readonly workspacesSupported: boolean; }
```

### PackageManagerName

- **Kind**: `type-alias`
- **Source**: `src/internal/repo-inventory/types.ts:1`

```ts
export type PackageManagerName = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
```

### PackageOverviewDto

- **Kind**: `type-alias`
- **Source**: `src/projection/dto.ts:140`

```ts
export type PackageOverviewDto = z.infer<typeof packageOverviewDtoSchema>;
```

### PackageRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:144`

```ts
export interface PackageRow { readonly id: string; readonly projectId: string; readonly name: string; readonly version: string | null; readonly manifestPath: string; readonly description: string | null; }
```

### PackageRowInput

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:135`

```ts
export interface PackageRowInput { readonly id: string; readonly projectId: string; readonly name: string; readonly version?: string; readonly manifestPath: string; readonly description?: string; }
```

### ProblemDetails

- **Kind**: `interface`
- **Source**: `src/internal/errors/problem-details.ts:6`

```ts
export interface ProblemDetails { readonly type: string; readonly title: string; readonly status: number; readonly code: string; readonly detail?: string; readonly traceId?: string; readonly fields?: readonly FieldViolation[]; }
```

### ProcessCommand

- **Kind**: `interface`
- **Source**: `src/internal/process-runner/types.ts:1`

```ts
export interface ProcessCommand { readonly executable: string; readonly args?: readonly string[]; readonly cwd?: string; readonly env?: Readonly<Record<string, string>>; readonly stdin?: string; readonly timeout?: number; readonly signal?: AbortSignal; }
```

### ProcessCommandSnapshot

- **Kind**: `interface`
- **Source**: `src/internal/process-runner/policy.ts:18`

```ts
export interface ProcessCommandSnapshot { readonly executable: string; readonly args: readonly string[] | undefined; readonly cwd: string | undefined; readonly timeout: number | undefined; readonly env: Readonly<Record<string, string>> | undefined; readonly stdin: string | undefined; readonly signal: AbortSignal | undefined; }
```

Detached frozen snapshot of a validated ProcessCommand.

### ProcessOutputLimit

- **Kind**: `interface`
- **Source**: `src/internal/process-runner/types.ts:23`

```ts
export interface ProcessOutputLimit { readonly maxBytes: number; }
```

### ProcessResult

- **Kind**: `interface`
- **Source**: `src/internal/process-runner/types.ts:27`

```ts
export interface ProcessResult { readonly exitCode: number; readonly stdout: string; readonly stderr: string; readonly truncatedStdout: boolean; readonly truncatedStderr: boolean; readonly timedOut: boolean; readonly cancelled: boolean; readonly durationMs: number; }
```

### ProcessRunner

- **Kind**: `interface`
- **Source**: `src/internal/process-runner/types.ts:38`

```ts
export interface ProcessRunner { run(command: ProcessCommand): Promise<ProcessResult>; runJson<T>(command: ProcessCommand): Promise<T>; }
```

### ProcessRunnerPolicy

- **Kind**: `interface`
- **Source**: `src/internal/process-runner/types.ts:11`

```ts
export interface ProcessRunnerPolicy { readonly name: string; readonly allowedExecutables: readonly string[]; /** Shell execution is disabled by default. Must be explicitly true to enable. */ readonly allowShell?: boolean; readonly maxOutputBytes?: number; readonly defaultTimeoutMs?: number; readonly allowedEnvKeys?: readonly string[]; /** When true (default), non-zero exit throws PROCESS_NON_ZERO_EXIT. */ readonly failOnNonZeroExit?: boolean; }
```

### ProcessRunnerPolicySnapshot

- **Kind**: `interface`
- **Source**: `src/internal/process-runner/policy.ts:7`

```ts
export interface ProcessRunnerPolicySnapshot { readonly name: string; readonly allowedExecutables: readonly string[]; readonly allowedEnvKeys: readonly string[] | undefined; readonly allowShell: boolean; readonly failOnNonZeroExit: boolean; readonly maxOutputBytes: number | undefined; readonly defaultTimeoutMs: number | undefined; }
```

Detached frozen snapshot of a validated ProcessRunnerPolicy.

### ProjectRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:28`

```ts
export interface ProjectRow { readonly id: string; readonly name: string; }
```

### ProjectionDto

- **Kind**: `type-alias`
- **Source**: `src/generate/document.ts:48`

```ts
export type ProjectionDto = PackageOverviewDto | ApiReferenceDto;
```

### ProjectionOptions

- **Kind**: `interface`
- **Source**: `src/projection/index.ts:30`

```ts
export interface ProjectionOptions { /** Normalized timestamp for the DTO meta (default: the fixture timestamp). */ readonly normalizedTimestamp?: string; readonly toolVersion?: string; readonly templateVersion?: string; }
```

Runtime-validated projection DTOs (step-06 §3, task 2).

`buildPackageOverviewDto` / `buildApiReferenceDto` read the loaded dataset with
explicitly ordered queries, assemble a plain-JSON DTO, and validate it against
its Zod schema **before any render**. Absent optional facts collapse a section's
`present` flag; absent required facts return a `skip` decision with a stable
diagnostic. No `src/extractor` import; no write helper.

### ProjectionOutcome

- **Kind**: `type-alias`
- **Source**: `src/projection/index.ts:37`

```ts
export type ProjectionOutcome<T> = | { readonly status: 'ok'; readonly dto: T } | { readonly status: 'skip'; readonly diagnostics: readonly Diagnostic[] };
```

### PureHelper

- **Kind**: `type-alias`
- **Source**: `src/render/engine.ts:48`

```ts
export type PureHelper = (...args: readonly unknown[]) => string;
```

A pure helper: receives data arguments only and returns a string.

### RankableCandidate

- **Kind**: `interface`
- **Source**: `src/search/rank.ts:35`

```ts
export interface RankableCandidate { readonly id: string; readonly kind: SearchKind; readonly tier: SearchTier; /** SQLite bm25 score for FTS-tier candidates (lower is more relevant). */ readonly bm25: number; }
```

### RateLimitKeyOptions

- **Kind**: `interface`
- **Source**: `src/internal/security/rate-limit.ts:3`

```ts
export interface RateLimitKeyOptions { readonly namespace: string; readonly subject: string; readonly action?: string; }
```

### ReadOptions

- **Kind**: `interface`
- **Source**: `src/internal/source-files/types.ts:32`

```ts
export interface ReadOptions { /** Root boundary — the path must reside inside this root or SOURCE_FILES_TRAVERSAL_DENIED is thrown. */ readonly root: string; readonly maxBytes?: number; }
```

### RedactionResult

- **Kind**: `interface`
- **Source**: `src/internal/security/redaction.ts:6`

```ts
export interface RedactionResult { readonly value: string; readonly redacted: boolean; }
```

### RedactionRule

- **Kind**: `interface`
- **Source**: `src/internal/security/redaction.ts:1`

```ts
export interface RedactionRule { readonly pattern: RegExp; readonly replacement: string; }
```

### Redactor

- **Kind**: `interface`
- **Source**: `src/internal/security/redaction.ts:11`

```ts
export interface Redactor { readonly rules: readonly RedactionRule[]; }
```

### ReexportResolution

- **Kind**: `interface`
- **Source**: `src/extractor/type-checker.ts:22`

```ts
export interface ReexportResolution { /** The target declaration nodes (internal `ts-morph` nodes). */ readonly declarations: readonly Node[]; readonly diagnostic?: Diagnostic; }
```

The **only** two TypeChecker exceptions allowed in Now (decision record §8).

The extractor is syntax-first; every semantic/TypeChecker call — anything that
resolves symbols or computes types (`getLocalTargetDeclarations`, `getType`,
`getSymbol`, `getTypeChecker`, …) — lives in this file and nowhere else. Both
functions return plain data or `ts-morph` nodes for internal use only (no
`ts-morph` type is ever re-exported from the extractor barrel), and both degrade
to a safe `Diagnostic` on failure rather than throwing raw. Adding a third
exception requires a decision-record update with a fixture.

The `ts-morph` types in these signatures are internal: `type-checker.ts` is not
re-exported by `src/extractor/index.ts`, so no `ts-morph` type crosses the
public boundary.

Result of resolving an explicit re-export specifier.

### RepoInventory

- **Kind**: `interface`
- **Source**: `src/internal/repo-inventory/types.ts:40`

```ts
export interface RepoInventory { readonly root: string; readonly gitSummary: GitSummary; readonly packageManager: PackageManagerInfo; readonly workspace: WorkspaceInventory; readonly tsconfigPaths: readonly string[]; readonly packageCount: number; }
```

### ResolvedId

- **Kind**: `interface`
- **Source**: `src/dataset/ids.ts:336`

```ts
export interface ResolvedId { readonly key: string; readonly id: string; /** The hex length used; longer than the default only when a collision extended it. */ readonly hashLength: number; }
```

### RunCheckOptions

- **Kind**: `interface`
- **Source**: `src/commands/check.ts:103`

```ts
export interface RunCheckOptions { /** Target project path (`--project`). Resolved to an absolute path internally. */ readonly projectPath: string; /** Template pack name (`--template-pack`). Defaults to `default`. */ readonly templatePack?: string; /** Output directory (`--output`). Checked only; never created. */ readonly outputDir?: string; /** Override the app-managed data directory (tests only). */ readonly dataDirOverride?: string; /** Override the template packs root (tests only). */ readonly templatePacksDir?: string; /** Normalized envelope timestamp. Defaults to the current time. */ readonly timestamp?: string; }
```

### RunGenerateOptions

- **Kind**: `interface`
- **Source**: `src/commands/generate.ts:48`

```ts
export interface RunGenerateOptions { readonly projectPath: string; readonly template: GenerateTemplate; readonly outputDir?: string; readonly dataDirOverride?: string; readonly normalizedTimestamp?: string; readonly toolVersion?: string; }
```

### RunLoadOptions

- **Kind**: `interface`
- **Source**: `src/commands/load.ts:100`

```ts
export interface RunLoadOptions { readonly projectPath: string; readonly dataDirOverride?: string; readonly timestamp?: string; /** Test-only seam for fixtures that must be independent of the parent checkout. */ readonly gitSummaryOverride?: GitSummary; /** Test-only seam: called at the start of each persistence phase; throw to force rollback. */ readonly injectFault?: (phase: LoadPhase) => void; }
```

### RunSearchOptions

- **Kind**: `interface`
- **Source**: `src/commands/search.ts:38`

```ts
export interface RunSearchOptions { readonly projectPath: string; readonly query: string; readonly kind?: SearchKind; readonly limit?: number; readonly dataDirOverride?: string; readonly timestamp?: string; }
```

### SAFE_DEFAULT_ENV_KEYS

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/policy.ts:28`

```ts
export const SAFE_DEFAULT_ENV_KEYS: readonly string[]
```

### SEARCH_DOCUMENT_FTS_COLUMNS

- **Kind**: `constant`
- **Source**: `src/dataset/schema.ts:54`

```ts
export const SEARCH_DOCUMENT_FTS_COLUMNS: readonly ["search_doc_id", "symbol_id", "package_name", "symbol_name", "qualified_name", "tokens"]
```

FTS5 columns. `search_doc_id` and `symbol_id` are stored `UNINDEXED` so results
carry stable public IDs without being tokenized; the remaining columns are the
searchable text derived from facts (never raw source).

### SEARCH_DOCUMENT_FTS_TABLE

- **Kind**: `constant`
- **Source**: `src/dataset/schema.ts:47`

```ts
export const SEARCH_DOCUMENT_FTS_TABLE: "search_document_fts"
```

Standalone FTS5 search index populated from `search_document` facts.

### SEARCH_KINDS

- **Kind**: `constant`
- **Source**: `src/commands/search.ts:36`

```ts
export const SEARCH_KINDS: readonly SearchKind[]
```

### SEARCH_TOKENIZER_VERSION

- **Kind**: `constant`
- **Source**: `src/commands/load.ts:82`

```ts
export const SEARCH_TOKENIZER_VERSION: "identifier-v1"
```

### SEARCH_TOOL_VERSION

- **Kind**: `constant`
- **Source**: `src/commands/search.ts:31`

```ts
export const SEARCH_TOOL_VERSION: "0.0.0"
```

`ts-codegraph search` — read-only retrieval over the loaded dataset (step-05 §3).

Resolves the project id (reading the manifest — permitted in the command layer),
clamps the limit, runs the read-only `executeSearch`, and assembles a validated
`ts-codegraph.search@1` envelope. Empty results are `ok: true`. No write helper is
imported here.

### SafeDetail

- **Kind**: `type-alias`
- **Source**: `src/contracts/diagnostics.ts:148`

```ts
export type SafeDetail = z.infer<typeof safeDetailSchema>;
```

### SafeError

- **Kind**: `interface`
- **Source**: `src/internal/errors/problem-details.ts:18`

```ts
export interface SafeError { readonly code: string; readonly category: string; readonly title: string; readonly retryable: boolean; readonly httpStatus: number; }
```

### SafePathPolicy

- **Kind**: `interface`
- **Source**: `src/internal/security/path.ts:9`

```ts
export interface SafePathPolicy { readonly root: string; readonly allowSymlinks: boolean; }
```

### SafePathResult

- **Kind**: `interface`
- **Source**: `src/internal/security/path.ts:14`

```ts
export interface SafePathResult { readonly decision: SecurityPolicyDecision; readonly relativePath?: string; }
```

### SanitizedEvidence

- **Kind**: `interface`
- **Source**: `src/extractor/types.ts:23`

```ts
export interface SanitizedEvidence { readonly text: string; /** Always `true`: this text passed through `sanitizeEvidenceText`. */ readonly sanitized: true; /** `true` when the text was longer than the bound and was cut. */ readonly truncated: boolean; /** `true` when redaction changed the text (a secret or path was removed). */ readonly redacted: boolean; }
```

Sanitized, bounded evidence text (never raw source).

### SearchCliOptions

- **Kind**: `interface`
- **Source**: `src/cli/search-command.ts:22`

```ts
export interface SearchCliOptions { readonly query?: string; readonly project?: string; readonly kind?: string; readonly limit?: string; }
```

CLI wiring for `ts-codegraph search`. Positional query plus `--project`, `--kind`,
`--limit`, `--json`. JSON mode prints exactly one validated `ts-codegraph.search@1`
envelope; empty results are `ok: true` with a neutral human message otherwise.

### SearchCliOverrides

- **Kind**: `interface`
- **Source**: `src/cli/search-command.ts:29`

```ts
export interface SearchCliOverrides { readonly dataDirOverride?: string; readonly timestamp?: string; }
```

### SearchData

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:304`

```ts
export type SearchData = z.infer<typeof searchDataSchema>;
```

### SearchDocumentRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:496`

```ts
export interface SearchDocumentRow { readonly id: string; readonly snapshotId: string; readonly symbolId: string; readonly packageName: string | null; readonly symbolName: string; readonly kind: string; readonly qualifiedName: string | null; readonly tokens: string; }
```

### SearchDocumentRowInput

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:485`

```ts
export interface SearchDocumentRowInput { readonly id: string; readonly snapshotId: string; readonly symbolId: string; readonly packageName?: string; readonly symbolName: string; readonly kind: string; readonly qualifiedName?: string; readonly tokens: string; }
```

### SearchEnvelope

- **Kind**: `type-alias`
- **Source**: `src/contracts/envelopes.ts:305`

```ts
export type SearchEnvelope = z.infer<typeof searchEnvelopeSchema>;
```

### SearchExecutionInput

- **Kind**: `interface`
- **Source**: `src/search/execute.ts:24`

```ts
export interface SearchExecutionInput { readonly projectId: string; readonly dataDirOverride?: string; readonly query: string; readonly kind?: SearchKind; readonly limit: number; }
```

### SearchExecutionResult

- **Kind**: `interface`
- **Source**: `src/search/execute.ts:32`

```ts
export interface SearchExecutionResult { readonly snapshotId: string; readonly results: readonly SearchResult[]; }
```

### SearchKind

- **Kind**: `type-alias`
- **Source**: `src/search/rank.ts:17`

```ts
export type SearchKind = 'package' | 'file' | 'symbol' | 'export' | 'diagnostic';
```

Deterministic ranking for `ts-codegraph search` (step-05 §3).

Ranking version `exact-prefix-token-v1`. A result's `rank` value is its tier
weight; the **total** result order is:

  1. tier: exact (3) > prefix (2) > token/FTS (1)         — the primary signal
  2. within the FTS tier only, bm25 ascending             — SQLite relevance
  3. kind order: package < file < symbol < export < diagnostic
  4. stable public id ascending (code-unit)               — final tie-break

Because ids are unique, step 4 makes the order total: no two results can swap.
The same dataset + query therefore always yields a byte-identical result array.
Pure functions only — no I/O, no clock.

### SearchOutcome

- **Kind**: `interface`
- **Source**: `src/commands/search.ts:47`

```ts
export interface SearchOutcome { readonly envelope: SearchEnvelope; readonly ok: boolean; readonly exitCode: number; }
```

### SearchTier

- **Kind**: `type-alias`
- **Source**: `src/search/rank.ts:18`

```ts
export type SearchTier = 'exact' | 'prefix' | 'fts';
```

### SectionRecord

- **Kind**: `interface`
- **Source**: `src/generate/document.ts:21`

```ts
export interface SectionRecord { readonly sectionId: string; readonly slotId: string; readonly heading: string; readonly headingSlug: string; readonly symbolId?: string; }
```

Build one generated document from a validated DTO (step-06b). Pipeline per doc:
render (strict engine) -> assemble frontmatter -> OKF validation (Step 01
validator) -> hash + ids. A doc that fails OKF validation is a skip with the
validator's stable diagnostic code — it never enters the write plan.

The section map is computed from the DTO (which sections render), so anchors
derive from slot IDs (per-symbol sections embed the symbol stable id in the
sectionId), never from heading text.

### SecurityAuditEvent

- **Kind**: `interface`
- **Source**: `src/internal/security/audit.ts:16`

```ts
export interface SecurityAuditEvent { readonly kind: SecurityAuditEventKind; readonly component: string; readonly timestamp: string; readonly decision: SecurityPolicyDecision; readonly reason?: string; readonly metadata?: Readonly<Record<string, string | number | boolean>>; }
```

### SecurityAuditEventKind

- **Kind**: `type-alias`
- **Source**: `src/internal/security/audit.ts:6`

```ts
export type SecurityAuditEventKind = | 'path.allow' | 'path.deny' | 'url.allow' | 'url.deny' | 'redact.applied' | 'policy.violation' | 'authz.deny' | 'authn.failure';
```

### SecurityPolicyDecision

- **Kind**: `type-alias`
- **Source**: `src/internal/security/types.ts:1`

```ts
export type SecurityPolicyDecision = 'allow' | 'deny' | 'redact' | 'skip';
```

### SignatureRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:374`

```ts
export interface SignatureRow { readonly id: string; readonly symbolId: string; readonly signatureText: string; }
```

### SnapshotIdentity

- **Kind**: `interface`
- **Source**: `src/dataset/snapshot.ts:51`

```ts
export interface SnapshotIdentity { readonly snapshotId: string; readonly summary: SnapshotSummary; }
```

### SnapshotKind

- **Kind**: `type-alias`
- **Source**: `src/dataset/snapshot.ts:27`

```ts
export type SnapshotKind = 'git-clean' | 'git-dirty' | 'no-git';
```

### SnapshotRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:52`

```ts
export interface SnapshotRow { readonly id: string; readonly projectId: string; readonly kind: string; readonly baseCommit: string | null; readonly includedFileCount: number; readonly dirtyFileCount: number | null; }
```

### SnapshotRowInput

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:43`

```ts
export interface SnapshotRowInput { readonly id: string; readonly projectId: string; readonly kind: string; readonly baseCommit?: string; readonly includedFileCount: number; readonly dirtyFileCount?: number; }
```

### SnapshotSummary

- **Kind**: `interface`
- **Source**: `src/dataset/snapshot.ts:44`

```ts
export interface SnapshotSummary { readonly kind: SnapshotKind; readonly baseCommit?: string; readonly includedFileCount: number; readonly dirtyFileCount?: number; }
```

The public, safe snapshot description (decision record §7).

### SourceExplorer

- **Kind**: `interface`
- **Source**: `src/internal/source-files/types.ts:50`

```ts
export interface SourceExplorer { readonly root: string; /** Always scans the explorer's own root. No override is accepted. */ scan(): Promise<SourceScanResult>; read(absPath: string, opts?: { maxBytes?: number }): Promise<BoundedReadResult>; detect(absPath: string): Promise<SourceFileKind>; hash(absPath: string): Promise<string>; }
```

### SourceFileEntry

- **Kind**: `interface`
- **Source**: `src/internal/source-files/types.ts:3`

```ts
export interface SourceFileEntry { readonly relativePath: string; readonly kind: SourceFileKind; readonly sizeBytes: number; }
```

### SourceFileKind

- **Kind**: `type-alias`
- **Source**: `src/internal/source-files/types.ts:1`

```ts
export type SourceFileKind = 'text' | 'binary' | 'unknown';
```

### SourceFilePolicy

- **Kind**: `interface`
- **Source**: `src/internal/source-files/types.ts:20`

```ts
export interface SourceFilePolicy { readonly maxFileSizeBytes?: number; readonly maxFileCount?: number; readonly allowSymlinks?: boolean; readonly gitignore?: boolean; readonly defaultIgnores?: boolean; readonly extraIgnorePatterns?: readonly string[]; /** Filter to files whose extension (including leading dot) is in this list. */ readonly includeExtensions?: readonly string[]; readonly maxReadBytes?: number; }
```

### SourceFileRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:250`

```ts
export interface SourceFileRow { readonly id: string; readonly snapshotId: string; readonly packageId: string | null; readonly repoRelativePath: string; readonly contentHash: string; }
```

### SourceFileRowInput

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:242`

```ts
export interface SourceFileRowInput { readonly id: string; readonly snapshotId: string; readonly packageId?: string; readonly repoRelativePath: string; readonly contentHash: string; }
```

### SourceFileVersionRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:279`

```ts
export interface SourceFileVersionRow { readonly id: string; readonly sourceFileId: string; readonly contentHash: string; }
```

### SourceRange

- **Kind**: `interface`
- **Source**: `src/extractor/types.ts:16`

```ts
export interface SourceRange { readonly path: string; readonly startLine: number; readonly endLine: number; }
```

A safe source location: repo-relative POSIX path plus 1-based line range.

### SourceRef

- **Kind**: `type-alias`
- **Source**: `src/contracts/diagnostics.ts:147`

```ts
export type SourceRef = z.infer<typeof sourceRefSchema>;
```

### SourceScanResult

- **Kind**: `interface`
- **Source**: `src/internal/source-files/types.ts:9`

```ts
export interface SourceScanResult { readonly files: readonly SourceFileEntry[]; readonly truncated: boolean; }
```

### Span

- **Kind**: `interface`
- **Source**: `src/internal/telemetry/index.ts:9`

```ts
export interface Span { setAttribute(key: string, value: unknown): this; setAttributes(attributes: Attributes): this; setStatus(status: { code: SpanStatusCode; message?: string }): this; recordException(exception: unknown): void; end(): void; }
```

### SqlParam

- **Kind**: `type-alias`
- **Source**: `src/dataset/sqlite-runtime.ts:34`

```ts
export type SqlParam = string | number | bigint | boolean | null | undefined | Uint8Array;
```

Value kinds accepted by the parametrized query helpers.

### SqliteAdapter

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:89`

```ts
export interface SqliteAdapter { readonly name: string; open(path: string, policy: SqlitePolicy): SqliteDatabase; }
```

### SqliteCreateOptions

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:25`

```ts
export interface SqliteCreateOptions extends SqliteOpenOptions { /** Migrations to run after opening. */ readonly migrations?: readonly SqliteMigration[]; }
```

### SqliteDatabase

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:30`

```ts
export interface SqliteDatabase { readonly path: string; readonly adapter: string; close(): void; }
```

### SqliteFtsDefinition

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:66`

```ts
export interface SqliteFtsDefinition { readonly tableName: string; readonly columns: readonly string[]; /** Content table name for content-based FTS5 tables. */ readonly contentTable?: string; }
```

### SqliteFtsOptions

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:73`

```ts
export interface SqliteFtsOptions { /** Create the table only if it does not exist. Default: true. */ readonly ifNotExists?: boolean; }
```

### SqliteHealthOptions

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:78`

```ts
export interface SqliteHealthOptions { /** Run PRAGMA integrity_check. Default: true. */ readonly checkIntegrity?: boolean; }
```

### SqliteHealthResult

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:83`

```ts
export interface SqliteHealthResult { readonly ok: boolean; readonly integrityPassed: boolean; readonly walEnabled: boolean; }
```

### SqliteMigration

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:36`

```ts
export interface SqliteMigration { /** Unique identifier for this migration, e.g. '001_create_users'. */ readonly id: string; /** SQL DDL/DML to execute. Must be deterministic — checksum is verified on re-run. */ readonly sql: string; }
```

### SqliteMigrationResult

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:48`

```ts
export interface SqliteMigrationResult { readonly applied: number; readonly skipped: number; readonly migrations: readonly { readonly id: string; readonly checksum: string; }[]; }
```

### SqliteOpenOptions

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:14`

```ts
export interface SqliteOpenOptions { /** Absolute path to the database file, or ':memory:' for in-memory. */ readonly path?: string; /** App name used with @codegraph/app-paths when path is not provided. Default: 'codegraph-sqlite'. */ readonly app?: string; /** Database filename (without .db extension) used with app-paths. Default: 'default'. */ readonly name?: string; /** PRAGMA policy applied after open. */ readonly policy?: SqlitePolicy; }
```

### SqlitePolicy

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:1`

```ts
export interface SqlitePolicy { /** Enable WAL journal mode. Default: true. Has no effect on :memory: databases. */ readonly walMode?: boolean; /** * SQLite busy_timeout in milliseconds. Default: 5000. * Must be a non-negative safe integer between 0 and 300000 (inclusive). * Values outside this range are rejected with SQLITE_UNSAFE_INPUT before any SQL executes. */ readonly busyTimeoutMs?: number; /** Open in read-only mode. Default: false. */ readonly readOnly?: boolean; }
```

### SqliteRunMigrationsOptions

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:43`

```ts
export interface SqliteRunMigrationsOptions { /** Verify checksums on already-applied migrations. Default: true. */ readonly verifyChecksums?: boolean; }
```

### SqliteTransactionOptions

- **Kind**: `interface`
- **Source**: `src/internal/sqlite/types.ts:57`

```ts
export interface SqliteTransactionOptions { /** * Transaction mode. Default: 'deferred'. * Only 'deferred', 'immediate', and 'exclusive' are accepted; other values are * rejected at runtime with SQLITE_UNSAFE_INPUT before any SQL executes. */ readonly mode?: 'deferred' | 'immediate' | 'exclusive'; }
```

### StrictTemplate

- **Kind**: `type-alias`
- **Source**: `src/render/engine.ts:58`

```ts
export type StrictTemplate = (data: unknown) => string;
```

A compiled template: pure function from data to a string.

### SymbolRow

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:320`

```ts
export interface SymbolRow { readonly id: string; readonly sourceFileVersionId: string; readonly packageId: string | null; readonly kind: string; readonly name: string; readonly exported: boolean; readonly startLine: number; readonly endLine: number | null; readonly startColumn: number | null; readonly endColumn: number | null; }
```

### SymbolRowInput

- **Kind**: `interface`
- **Source**: `src/dataset/rows.ts:307`

```ts
export interface SymbolRowInput { readonly id: string; readonly sourceFileVersionId: string; readonly packageId?: string; readonly kind: string; readonly name: string; readonly exported: boolean; readonly startLine: number; readonly endLine?: number; readonly startColumn?: number; readonly endColumn?: number; }
```

### TELEMETRY_ATTRIBUTES

- **Kind**: `constant`
- **Source**: `src/internal/app-paths/generated/app-paths-entities.ts:19`

```ts
export const TELEMETRY_ATTRIBUTES: { readonly CODEGRAPH_APP_PATHS_CREATED: "codegraph.app_paths.created"; readonly CODEGRAPH_APP_PATHS_KIND: "codegraph.app_paths.kind"; readonly CODEGRAPH_APP_PATHS_OVERRIDE_SOURCE: "codegraph.app_paths.override_source"; readonly CODEGRAPH_APP_PATHS_PLATFORM: "codegraph.app_paths.platform"; }
```

Telemetry attributes

### TELEMETRY_ATTRIBUTES

- **Kind**: `constant`
- **Source**: `src/internal/cli/generated/cli-entities.ts:22`

```ts
export const TELEMETRY_ATTRIBUTES: { readonly CODEGRAPH_CLI_COMMAND_NAME: "codegraph.cli.command_name"; readonly CODEGRAPH_CLI_COMMAND_PATH: "codegraph.cli.command_path"; readonly CODEGRAPH_CLI_DRY_RUN: "codegraph.cli.dry_run"; readonly CODEGRAPH_CLI_ERROR_CODE: "codegraph.cli.error_code"; readonly CODEGRAPH_CLI_EXIT_CODE: "codegraph.cli.exit_code"; readonly CODEGRAPH_CLI_JSON_MODE: "codegraph.cli.json_mode"; }
```

Telemetry attributes

### TELEMETRY_ATTRIBUTES

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/generated/process-runner-entities.ts:19`

```ts
export const TELEMETRY_ATTRIBUTES: { readonly CODEGRAPH_PROCESS_RUNNER_ERROR_CODE: "codegraph.process_runner.error_code"; readonly CODEGRAPH_PROCESS_RUNNER_EXECUTABLE_LABEL: "codegraph.process_runner.executable_label"; readonly CODEGRAPH_PROCESS_RUNNER_EXIT_CODE_CATEGORY: "codegraph.process_runner.exit_code_category"; readonly CODEGRAPH_PROCESS_RUNNER_POLICY_NAME: "codegraph.process_runner.policy_name"; readonly CODEGRAPH_PROCESS_RUNNER_TIMEOUT_CATEGORY: "codegraph.process_runner.timeout_category"; }
```

Telemetry attributes

### TELEMETRY_ATTRIBUTES

- **Kind**: `constant`
- **Source**: `src/internal/repo-inventory/generated/repo-inventory-entities.ts:20`

```ts
export const TELEMETRY_ATTRIBUTES: { readonly CODEGRAPH_REPO_INVENTORY_ERROR_CODE: "codegraph.repo_inventory.error_code"; readonly CODEGRAPH_REPO_INVENTORY_OPERATION: "codegraph.repo_inventory.operation"; readonly CODEGRAPH_REPO_INVENTORY_OUTCOME: "codegraph.repo_inventory.outcome"; readonly CODEGRAPH_REPO_INVENTORY_PACKAGE_COUNT_BUCKET: "codegraph.repo_inventory.package_count_bucket"; readonly CODEGRAPH_REPO_INVENTORY_PACKAGE_MANAGER: "codegraph.repo_inventory.package_manager"; readonly CODEGRAPH_REPO_INVENTORY_WORKSPACE_KIND: "codegraph.repo_inventory.workspace_kind"; }
```

Telemetry attributes

### TELEMETRY_ATTRIBUTES

- **Kind**: `constant`
- **Source**: `src/internal/security/generated/security-entities.ts:28`

```ts
export const TELEMETRY_ATTRIBUTES: { readonly CODEGRAPH_SECURITY_COMPONENT: "codegraph.security.component"; readonly CODEGRAPH_SECURITY_DECISION: "codegraph.security.decision"; readonly CODEGRAPH_SECURITY_POLICY: "codegraph.security.policy"; readonly CODEGRAPH_SECURITY_REASON: "codegraph.security.reason"; }
```

Telemetry attributes

### TELEMETRY_ATTRIBUTES

- **Kind**: `constant`
- **Source**: `src/internal/source-files/generated/source-files-entities.ts:20`

```ts
export const TELEMETRY_ATTRIBUTES: { readonly CODEGRAPH_SOURCE_FILES_ERROR_CODE: "codegraph.source_files.error_code"; readonly CODEGRAPH_SOURCE_FILES_FILE_KIND: "codegraph.source_files.file_kind"; readonly CODEGRAPH_SOURCE_FILES_OPERATION: "codegraph.source_files.operation"; readonly CODEGRAPH_SOURCE_FILES_OUTCOME: "codegraph.source_files.outcome"; }
```

Telemetry attributes

### TELEMETRY_ATTRIBUTES

- **Kind**: `constant`
- **Source**: `src/internal/sqlite/generated/sqlite-entities.ts:21`

```ts
export const TELEMETRY_ATTRIBUTES: { readonly CODEGRAPH_SQLITE_ADAPTER: "codegraph.sqlite.adapter"; readonly CODEGRAPH_SQLITE_ERROR_CODE: "codegraph.sqlite.error_code"; readonly CODEGRAPH_SQLITE_MIGRATION_COUNT_BUCKET: "codegraph.sqlite.migration_count_bucket"; readonly CODEGRAPH_SQLITE_OPERATION: "codegraph.sqlite.operation"; readonly CODEGRAPH_SQLITE_OUTCOME: "codegraph.sqlite.outcome"; readonly CODEGRAPH_SQLITE_TRANSACTION_OUTCOME: "codegraph.sqlite.transaction_outcome"; }
```

Telemetry attributes

### TELEMETRY_METRICS

- **Kind**: `constant`
- **Source**: `src/internal/process-runner/generated/process-runner-entities.ts:30`

```ts
export const TELEMETRY_METRICS: { readonly CODEGRAPH_PROCESS_RUNNER_CANCELLATION_COUNT: "codegraph.process_runner.cancellation_count"; readonly CODEGRAPH_PROCESS_RUNNER_DURATION_MS: "codegraph.process_runner.duration_ms"; readonly CODEGRAPH_PROCESS_RUNNER_EXIT_CODE_COUNT: "codegraph.process_runner.exit_code_count"; readonly CODEGRAPH_PROCESS_RUNNER_INVALID_JSON_COUNT: "codegraph.process_runner.invalid_json_count"; readonly CODEGRAPH_PROCESS_RUNNER_TIMEOUT_COUNT: "codegraph.process_runner.timeout_count"; }
```

Telemetry metrics

### TEMPLATE_PACK_MANIFEST_FILE

- **Kind**: `constant`
- **Source**: `src/commands/check.ts:57`

```ts
export const TEMPLATE_PACK_MANIFEST_FILE: "manifest.json"
```

Manifest filename inside a template pack directory.

### TIER_RANK

- **Kind**: `constant`
- **Source**: `src/search/rank.ts:24`

```ts
export const TIER_RANK: Readonly<Record<SearchTier, number>>
```

Tier → rank value (also the primary sort key).

### TemplateFile

- **Kind**: `type-alias`
- **Source**: `src/contracts/template-pack.ts:63`

```ts
export type TemplateFile = z.infer<typeof templateFileSchema>;
```

### TemplateName

- **Kind**: `type-alias`
- **Source**: `src/generate/packs.ts:15`

```ts
export type TemplateName = 'package-overview' | 'api-reference';
```

Template-pack loading (step-06b). Packs live at `<pkgRoot>/templates/packs/<name>/`
— the same location (`check`'s `DEFAULT_TEMPLATE_PACKS_DIR`) the template-pack gate
validates — so the two commands read identical, schema-validated manifests. The
template body is read from the pack's single template file; no user-supplied
template paths are accepted.

### TemplatePackManifest

- **Kind**: `type-alias`
- **Source**: `src/contracts/template-pack.ts:64`

```ts
export type TemplatePackManifest = z.infer<typeof templatePackManifestSchema>;
```

### ToProblemDetailsOptions

- **Kind**: `interface`
- **Source**: `src/internal/errors/problem-details.ts:26`

```ts
export interface ToProblemDetailsOptions { readonly traceId?: string; readonly baseType?: string; }
```

### Tracer

- **Kind**: `interface`
- **Source**: `src/internal/telemetry/index.ts:17`

```ts
export interface Tracer { startSpan(name: string, options?: unknown): Span; }
```

### ValidateGeneratedDocResult

- **Kind**: `interface`
- **Source**: `src/contracts/okf.ts:11`

```ts
export interface ValidateGeneratedDocResult { readonly ok: boolean; readonly diagnostics: readonly Diagnostic[]; }
```

### WorkspaceInventory

- **Kind**: `interface`
- **Source**: `src/internal/repo-inventory/types.ts:34`

```ts
export interface WorkspaceInventory { readonly root: string; readonly kind: WorkspaceKind; readonly packages: readonly PackageInventory[]; }
```

### WorkspaceKind

- **Kind**: `type-alias`
- **Source**: `src/internal/repo-inventory/types.ts:2`

```ts
export type WorkspaceKind = 'pnpm' | 'yarn' | 'npm' | 'none';
```

### apiReferenceDtoSchema

- **Kind**: `constant`
- **Source**: `src/projection/dto.ts:127`

```ts
export const apiReferenceDtoSchema: z.ZodObject<{ project: z.ZodObject<{ id: z.ZodString; name: z.ZodString; }, z.core.$strict>; repository: z.ZodObject<{ snapshotId: z.ZodString; kind: z.ZodEnum<{ "git-clean": "git-clean"; "git-dirty": "git-dirty"; "no-git": "no-git"; }>; baseCommit: z.ZodOptional<z.ZodString>; }, z.core.$strict>; pkg: z.ZodObject<{ id: z.ZodString; name: z.ZodString; version: z.ZodOptional<z.ZodString>; manifestPath: z.ZodString; description: z.ZodOptional<z.ZodString>; dependencies: z.ZodArray<z.ZodObject<{ name: z.ZodString; kind: z.ZodEnum<{ runtime: "runtime"; dev: "dev"; }>; versionRange: z.ZodOptional<z.ZodString>; }, z.core.$strict>>; }, z.core.$strict>; exports: z.ZodObject<{ present: z.ZodBoolean; items: z.ZodArray<z.ZodObject<{ exportPath: z.ZodString; }, z.core.$strict>>; }, z.core.$strict>; symbols: z.ZodObject<{ present: z.ZodBoolean; items: z.ZodArray<z.ZodObject<{ id: z.ZodString; name: z.ZodString; kind: z.ZodString; signatureText: z.ZodString; source…
```

### appendLoadTimingEntry

- **Kind**: `function`
- **Source**: `src/commands/load.ts:542`

```ts
export async function appendLoadTimingEntry(baselinePath: string, entry: LoadTimingEntry): Promise<void>
```

Merge a timing entry (keyed by target) into the baseline JSON file.

### assertAppPathInside

- **Kind**: `function`
- **Source**: `src/internal/app-paths/create.ts:30`

```ts
export function assertAppPathInside(pathRef: string, boundary: string): void
```

### assertDatasetIdentifiersSafe

- **Kind**: `function`
- **Source**: `src/dataset/schema.ts:89`

```ts
export function assertDatasetIdentifiersSafe(): void
```

Defensive build-time check: every table and FTS identifier this module names
passes the shared `@codegraph/sqlite` identifier validator. Called when the
migration SQL is assembled so an unsafe identifier can never reach SQLite.

### assertDatasetPathContained

- **Kind**: `function`
- **Source**: `src/dataset/open.ts:107`

```ts
export function assertDatasetPathContained(pathRef: string, boundary: string): void
```

Assert `pathRef` is contained by `boundary`, converting an app-paths boundary
violation into a safe `SAFETY_PATH_ESCAPE` diagnostic with no path in it.

### assertNormalizedTimestamp

- **Kind**: `function`
- **Source**: `src/contracts/timestamp.ts:11`

```ts
export function assertNormalizedTimestamp(value: string): NormalizedTimestamp
```

### assertOutboundUrlAllowed

- **Kind**: `function`
- **Source**: `src/internal/security/url.ts:106`

```ts
export function assertOutboundUrlAllowed( policy: OutboundUrlPolicy, rawUrl: string, ): string
```

### assertSafePath

- **Kind**: `function`
- **Source**: `src/internal/security/path.ts:96`

```ts
export function assertSafePath(policy: SafePathPolicy, target: string): string
```

### buildApiReferenceDto

- **Kind**: `function`
- **Source**: `src/projection/index.ts:239`

```ts
export function buildApiReferenceDto( dataset: Dataset, packageId: string, snapshotId: string, options: ProjectionOptions = {}, ): ProjectionOutcome<ApiReferenceDto>
```

### buildCitationId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:320`

```ts
export function buildCitationId(input: { readonly generatedSectionId: string; readonly evidenceId: string; }): string
```

`citation:v1:<generated-section-id>:<evidence-id>` (decision record §9).

### buildDiagnosticId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:245`

```ts
export function buildDiagnosticId(input: { readonly snapshotId: string; readonly code: string; readonly locationKey: string; }): string
```

`diagnostic:v1:<hash16>`.
Hash inputs: `diagnostic` NUL snapshotId NUL code NUL locationKey. The location
key is a safe, repo-relative reference (e.g. `path:line`), never an absolute
path.

### buildDocument

- **Kind**: `function`
- **Source**: `src/generate/document.ts:159`

```ts
export function buildDocument(pack: LoadedPack, templateName: TemplateName, dto: ProjectionDto): BuildDocumentResult
```

### buildEvidenceId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:224`

```ts
export function buildEvidenceId(input: { readonly symbolId: string; readonly evidenceKind: string; readonly contentHash: string; }): string
```

`evidence:v1:<hash16>`.
Hash inputs: `evidence` NUL symbolId NUL evidenceKind NUL contentHash. The
content hash is over the sanitized evidence text.

### buildGeneratedDocId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:279`

```ts
export function buildGeneratedDocId(input: { readonly snapshotId: string; readonly templateId: string; readonly templateVersion: string; readonly conceptPath: string; readonly contentHash: string; }): string
```

`generated-doc:v1:<hash16>`.
Hash inputs: `generated-doc` NUL snapshotId NUL templateId NUL templateVersion
NUL repo-relative(conceptPath) NUL contentHash.

### buildGeneratedSectionId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:305`

```ts
export function buildGeneratedSectionId(input: { readonly generatedDocId: string; readonly slotId: string; readonly symbolId?: string; }): string
```

`generated-section:v1:<generated-doc-id>:<slot-id>` or, for per-symbol slots,
`generated-section:v1:<generated-doc-id>:<slot-id>:<symbol-id-hash>` (decision
record §9). The stable section ID is independent of rendered heading text.
`symbolId`, when present, is folded into a 16-hex hash so the section ID stays
bounded.

### buildHashedId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:106`

```ts
export function buildHashedId( type: HashedIdType, hashInput: string, length: number = DEFAULT_HASH_HEX_LENGTH, ): string
```

Build a hashed public ID: `<type>:v1:<hash16>`. `hashInput` is the already
NUL-joined, normalized input tuple. Prefer the typed builders below, which
document their inputs; this is the shared primitive they call.

### buildIgnoreChecker

- **Kind**: `function`
- **Source**: `src/internal/source-files/ignore.ts:70`

```ts
export function buildIgnoreChecker(patterns: readonly string[]): IgnoreChecker
```

### buildPackageId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:129`

```ts
export function buildPackageId(input: { readonly projectId: string; readonly packageName: string; readonly manifestPath: string; }): string
```

`package:v1:<hash16>`.
Hash inputs: `package` NUL projectId NUL normalized(packageName) NUL
repo-relative(manifestPath).

### buildPackageOverviewDto

- **Kind**: `function`
- **Source**: `src/projection/index.ts:190`

```ts
export function buildPackageOverviewDto( dataset: Dataset, packageId: string, snapshotId: string, options: ProjectionOptions = {}, ): ProjectionOutcome<PackageOverviewDto>
```

### buildProcessEnv

- **Kind**: `function`
- **Source**: `src/internal/process-runner/policy.ts:508`

```ts
export function buildProcessEnv( commandEnv: Readonly<Record<string, string>> | undefined, allowedEnvKeys: readonly string[] | undefined, ): Record<string, string>
```

### buildProjectId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:120`

```ts
export function buildProjectId(projectKey: string): string
```

`project:v1:<hash16>`.
Hash inputs: `project` NUL normalized(projectKey). `projectKey` is the caller's
canonical project identity (e.g. the repo identity string), never an absolute
path.

### buildRunGenerateOptions

- **Kind**: `function`
- **Source**: `src/cli/generate-command.ts:96`

```ts
export function buildRunGenerateOptions( options: GenerateCliOptions, overrides?: GenerateCliOverrides, ): RunGenerateOptions
```

### buildSearchDocId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:264`

```ts
export function buildSearchDocId(input: { readonly snapshotId: string; readonly symbolId: string; }): string
```

`search-doc:v1:<hash16>`.
Hash inputs: `search-doc` NUL snapshotId NUL symbolId.

### buildSearchFtsCreateStatement

- **Kind**: `function`
- **Source**: `src/dataset/schema.ts:105`

```ts
export function buildSearchFtsCreateStatement(): string
```

The `CREATE VIRTUAL TABLE` statement for the search FTS index. Identifiers are
validated with the shared validator before the SQL string is built, satisfying
the "validate every dynamic identifier" rule even though the identifiers are
static.

### buildSignatureId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:206`

```ts
export function buildSignatureId(input: { readonly symbolId: string; readonly signatureText: string; }): string
```

`signature:v1:<hash16>`.
Hash inputs: `signature` NUL symbolId NUL normalized(signatureText). Signature
text is the declaration/signature only, never a body (decision record §6).

### buildSnapshotSummary

- **Kind**: `function`
- **Source**: `src/dataset/snapshot.ts:110`

```ts
export function buildSnapshotSummary(input: ComputeSnapshotInput): SnapshotSummary
```

Build the safe snapshot summary. Only the four allowed fields are returned; no
raw diff, per-file stat, or dirty-path listing is included. `baseCommit` is set
whenever git is present (provenance); `dirtyFileCount` is set only when git is
available (untracked + modified + staged).

### buildSourceFileId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:148`

```ts
export function buildSourceFileId(input: { readonly snapshotId: string; readonly repoRelativePath: string; }): string
```

`source-file:v1:<hash16>`.
Hash inputs: `source-file` NUL snapshotId NUL repo-relative(path).

### buildSourceFileVersionId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:166`

```ts
export function buildSourceFileVersionId(input: { readonly sourceFileId: string; readonly contentHash: string; }): string
```

`source-file-version:v1:<hash16>`.
Hash inputs: `source-file-version` NUL sourceFileId NUL contentHash (full
sha256 of the file bytes).

### buildSymbolId

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:184`

```ts
export function buildSymbolId(input: { readonly sourceFileVersionId: string; readonly kind: string; readonly name: string; readonly startLine: number; }): string
```

`symbol:v1:<hash16>`.
Hash inputs: `symbol` NUL sourceFileVersionId NUL kind NUL name NUL startLine.
The start line disambiguates same-named declarations within a file version.

### checkCommandDefinition

- **Kind**: `constant`
- **Source**: `src/cli/check-command.ts:105`

```ts
export const checkCommandDefinition: CliCommandDefinition<CheckCliOptions, CheckOutcome>
```

The `defineCliCommand` contract for `check` (used for registration/help).

### checkDataSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:89`

```ts
export const checkDataSchema: z.ZodObject<{ preflightChecks: z.ZodArray<z.ZodObject<{ id: z.ZodString; label: z.ZodString; status: z.ZodEnum<{ pass: "pass"; fail: "fail"; warn: "warn"; skip: "skip"; }>; diagnostics: z.ZodArray<z.ZodObject<{ code: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; CHECK_OUTPUT_NOT_WRITABLE: "CHECK_O…
```

### checkDatabaseReadinessSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:81`

```ts
export const checkDatabaseReadinessSchema: z.ZodObject<{ ok: z.ZodBoolean; policy: z.ZodEnum<{ "app-managed": "app-managed"; "not-created": "not-created"; }>; datasetSchemaVersion: z.ZodLiteral<"ts-codegraph.dataset@1">; }, z.core.$strict>
```

### checkEnvelopeSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:98`

```ts
export const checkEnvelopeSchema: z.ZodObject<{ ok: z.ZodBoolean; diagnostics: z.ZodArray<z.ZodObject<{ code: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; CHECK_OUTPUT_NOT_WRITABLE: "CHECK_OUTPUT_NOT_WRITABLE"; CHECK_OUTPUT_UNSAFE: "CHECK_OUTPUT_UNSAFE"; LOAD_ENVELOPE_INVALID: "LOAD_ENVELOPE_INVALID"; SEARCH_ENVELOPE_INVALID:…
```

### checkManagedDatabaseHealth

- **Kind**: `function`
- **Source**: `src/dataset/sqlite-runtime.ts:146`

```ts
export function checkManagedDatabaseHealth(path: string): ManagedHealthResult
```

Read an existing dataset's health **without mutating the filesystem**.

A read-only open of a WAL-mode database still creates `-wal`/`-shm` sidecar
files (SQLite needs shared memory to read the WAL), which would violate the
`check` command's zero-mutation contract. Opening the file through a
`file:…?immutable=1` URI tells SQLite the database cannot change, so it reads a
WAL-mode database directly and creates no sidecars. The URI is built with
`pathToFileURL` so paths containing spaces (e.g. macOS `Application Support`)
are correctly percent-encoded. This opens a standalone throwaway connection
(not a managed handle) purely for the integrity read.

### checkPreflightCheckSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:57`

```ts
export const checkPreflightCheckSchema: z.ZodObject<{ id: z.ZodString; label: z.ZodString; status: z.ZodEnum<{ pass: "pass"; fail: "fail"; warn: "warn"; skip: "skip"; }>; diagnostics: z.ZodArray<z.ZodObject<{ code: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; CHECK_OUTPUT_NOT_WRITABLE: "CHECK_OUTPUT_NOT_WRITABLE"; CHECK_OUTPU…
```

### checkSqliteHealth

- **Kind**: `function`
- **Source**: `src/internal/sqlite/health.ts:10`

```ts
export async function checkSqliteHealth( db: SqliteDatabase, options?: SqliteHealthOptions, ): Promise<SqliteHealthResult>
```

### checkTemplateReadinessSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:66`

```ts
export const checkTemplateReadinessSchema: z.ZodObject<{ ok: z.ZodBoolean; packs: z.ZodArray<z.ZodObject<{ packName: z.ZodString; packVersion: z.ZodString; templateCount: z.ZodNumber; }, z.core.$strict>>; }, z.core.$strict>
```

### closeDataset

- **Kind**: `function`
- **Source**: `src/dataset/open.ts:191`

```ts
export function closeDataset(dataset: Dataset): void
```

Close a dataset connection cleanly.

### closeSqliteDatabase

- **Kind**: `function`
- **Source**: `src/internal/sqlite/database.ts:257`

```ts
export async function closeSqliteDatabase(db: SqliteDatabase): Promise<void>
```

### commandEnvelopeSchemaVersions

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:297`

```ts
export const commandEnvelopeSchemaVersions: Readonly<{ readonly check: "ts-codegraph.check@1"; readonly load: "ts-codegraph.load@1"; readonly search: "ts-codegraph.search@1"; readonly generate: "ts-codegraph.generate@1"; }>
```

### commandEnvelopeSchemas

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:290`

```ts
export const commandEnvelopeSchemas: Readonly<{ check: z.ZodObject<{ ok: z.ZodBoolean; diagnostics: z.ZodArray<z.ZodObject<{ code: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; CHECK_OUTPUT_NOT_WRITABLE: "CHECK_OUTPUT_NOT_WRITABLE"; CHECK_OUTPUT_UNSAFE: "CHECK_OUTPUT_UNSAFE"; LOAD_ENVELOPE_INVALID: "LOAD_ENVELOPE_INVALID"; SEA…
```

### commitWritePlan

- **Kind**: `function`
- **Source**: `src/internal/source-files/write.ts:122`

```ts
export async function commitWritePlan(plan: AtomicWritePlan): Promise<void>
```

### compareCandidates

- **Kind**: `function`
- **Source**: `src/search/rank.ts:43`

```ts
export function compareCandidates(a: RankableCandidate, b: RankableCandidate): number
```

### compileStrict

- **Kind**: `function`
- **Source**: `src/render/engine.ts:65`

```ts
export function compileStrict(source: string, options: CompileStrictOptions = {}): StrictTemplate
```

Compile a template in strict mode. Accessing a field absent from the data
throws at render time; helpers are wrapped so they receive only data arguments
(the trailing Handlebars options object is stripped) and must return a string.

### computeSnapshotId

- **Kind**: `function`
- **Source**: `src/dataset/snapshot.ts:91`

```ts
export function computeSnapshotId(input: ComputeSnapshotInput): string
```

Build the snapshot ID string (decision record §7). Throws a clear error if a
clean git worktree has no commit hash rather than emitting a malformed ID.

### computeSnapshotIdentity

- **Kind**: `function`
- **Source**: `src/dataset/snapshot.ts:136`

```ts
export function computeSnapshotIdentity( input: ComputeSnapshotInput, ): SnapshotIdentity
```

Compute both the snapshot ID and its safe summary in one call.

### conceptPathFor

- **Kind**: `function`
- **Source**: `src/generate/document.ts:217`

```ts
export function conceptPathFor(pack: LoadedPack, packageName: string): string
```

### countRows

- **Kind**: `function`
- **Source**: `src/commands/load.ts:557`

```ts
export function countRows(dataset: Dataset, table: string): number
```

Count rows in a dataset table (used by rollback tests).

### createAppError

- **Kind**: `function`
- **Source**: `src/internal/errors/core.ts:168`

```ts
export function createAppError(opts: AppErrorOptions): AppError
```

### createAtomicWritePlan

- **Kind**: `function`
- **Source**: `src/internal/source-files/write.ts:59`

```ts
export function createAtomicWritePlan( root: string, entries: readonly AtomicWriteEntry[], ): AtomicWritePlan
```

### createCliOutput

- **Kind**: `function`
- **Source**: `src/internal/cli/output.ts:79`

```ts
export function createCliOutput(opts?: CliOutputOptions): CliOutput
```

### createCliProgram

- **Kind**: `function`
- **Source**: `src/internal/cli/program.ts:475`

```ts
export function createCliProgram(opts: CliProgramOptions): CliProgram
```

### createDiagnostic

- **Kind**: `function`
- **Source**: `src/contracts/diagnostics.ts:160`

```ts
export function createDiagnostic(input: DiagnosticInput): Diagnostic
```

### createDiagnosticCodeRegistry

- **Kind**: `function`
- **Source**: `src/contracts/diagnostics.ts:6`

```ts
export function createDiagnosticCodeRegistry<const T extends readonly string[]>( codes: T, ): T
```

### createErrorRegistry

- **Kind**: `function`
- **Source**: `src/internal/errors/registry.ts:41`

```ts
export function createErrorRegistry( family: string, entries: Readonly<Record<string, ErrorCodeMeta>>, ): ErrorRegistry
```

### createFtsTable

- **Kind**: `function`
- **Source**: `src/internal/sqlite/fts.ts:22`

```ts
export async function createFtsTable( db: SqliteDatabase, definition: SqliteFtsDefinition, options?: SqliteFtsOptions, ): Promise<void>
```

### createOutboundUrlPolicy

- **Kind**: `function`
- **Source**: `src/internal/security/url.ts:54`

```ts
export function createOutboundUrlPolicy( opts?: Partial<OutboundUrlPolicy>, ): OutboundUrlPolicy
```

### createProcessRunner

- **Kind**: `function`
- **Source**: `src/internal/process-runner/runner.ts:181`

```ts
export function createProcessRunner(policy: ProcessRunnerPolicy): ProcessRunner
```

### createRateLimitKey

- **Kind**: `function`
- **Source**: `src/internal/security/rate-limit.ts:9`

```ts
export function createRateLimitKey(opts: RateLimitKeyOptions): string
```

### createRedactor

- **Kind**: `function`
- **Source**: `src/internal/security/redaction.ts:31`

```ts
export function createRedactor( additionalRules?: readonly RedactionRule[], ): Redactor
```

### createSafePathPolicy

- **Kind**: `function`
- **Source**: `src/internal/security/path.ts:27`

```ts
export function createSafePathPolicy( root: string, opts?: { allowSymlinks?: boolean }, ): SafePathPolicy
```

### createSecurityAuditEvent

- **Kind**: `function`
- **Source**: `src/internal/security/audit.ts:46`

```ts
export function createSecurityAuditEvent(opts: { kind: SecurityAuditEventKind; component: string; decision: SecurityPolicyDecision; reason?: string; metadata?: Readonly<Record<string, string | number | boolean>>; }): SecurityAuditEvent
```

### createSourceExplorer

- **Kind**: `function`
- **Source**: `src/internal/source-files/scan.ts:428`

```ts
export function createSourceExplorer(explorerRoot: string, policy?: SourceFilePolicy): SourceExplorer
```

Creates a source explorer scoped to a declared root directory.
All read, detect, and hash operations enforce that the given path
is within the explorer root; paths outside throw SOURCE_FILES_TRAVERSAL_DENIED.

### createSqliteDatabase

- **Kind**: `function`
- **Source**: `src/internal/sqlite/database.ts:244`

```ts
export async function createSqliteDatabase(options: SqliteCreateOptions = {}): Promise<SqliteDatabase>
```

### createValidationDiagnostic

- **Kind**: `function`
- **Source**: `src/contracts/diagnostics.ts:164`

```ts
export function createValidationDiagnostic( code: DiagnosticCode, message: string, safeDetail?: SafeDetail, ): Diagnostic
```

### declaredTypeTextForUnannotatedExport

- **Kind**: `function`
- **Source**: `src/extractor/type-checker.ts:65`

```ts
export function declaredTypeTextForUnannotatedExport( declaration: VariableDeclaration, ): DeclaredTypeResolution
```

Exception 2 — declared-type text for an unannotated exported declaration.
Obtains the declared-type text for an exported `const` with no written
annotation (for example `export const x = createThing()`), where the API
reference would otherwise have no signature. Uses the checker via `getType`.
Failure degrades to a `LOAD_UNANNOTATED_TYPE_UNRESOLVED` diagnostic. The
returned text is unsanitized — it can embed `import("…")` module paths — so the
caller must run it through `sanitizeSignatureText` before emitting it.

### defineCliCommand

- **Kind**: `function`
- **Source**: `src/internal/cli/program.ts:479`

```ts
export function defineCliCommand<TOptions = Record<string, unknown>, TResult = unknown>( def: CliCommandDefinition<TOptions, TResult>, ): CliCommandDefinition<TOptions, TResult>
```

### defineCliCommandGroup

- **Kind**: `function`
- **Source**: `src/internal/cli/program.ts:486`

```ts
export function defineCliCommandGroup( def: CliCommandGroupDefinition, ): CliCommandGroupDefinition
```

### deriveProjectKey

- **Kind**: `function`
- **Source**: `src/commands/check.ts:640`

```ts
export function deriveProjectKey(manifestName: string | undefined, projectRoot: string): string
```

Derive the stable project key used to resolve the dataset location. `load`
(Row 4) must derive the same key so `check` inspects the dataset `load`
writes: the root package name when present, else the directory name.

### detectFileKind

- **Kind**: `function`
- **Source**: `src/internal/source-files/read.ts:38`

```ts
export async function detectFileKind( absPath: string, root: string, ): Promise<SourceFileKind>
```

Detects whether the file at absPath is text, binary, or unknown.
`root` is required and enforced: paths outside root throw SOURCE_FILES_TRAVERSAL_DENIED.
Missing or non-string root throws SOURCE_FILES_ROOT_INVALID (prevents raw TypeError at runtime).

### detectIdCollisions

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:359`

```ts
export function detectIdCollisions( entries: readonly IdCollisionEntry[], length: number = DEFAULT_HASH_HEX_LENGTH, ): IdCollisionResolution
```

Detect and resolve truncated-hash collisions within a snapshot scope.

Distinct hash inputs that share the same truncated hash at `length` are a
collision. For each colliding group the truncation is extended (16 hex at a
time, up to the full digest) until the group's IDs are distinct, and a single
`LOAD_ID_COLLISION` diagnostic is emitted per group. Entries that share a hash
input are the same logical ID and are not a collision.

`length` defaults to 16; tests force the extension path with a smaller length.

### detectPackageManager

- **Kind**: `function`
- **Source**: `src/internal/repo-inventory/package-manager.ts:14`

```ts
export async function detectPackageManager(root: string): Promise<PackageManagerInfo>
```

### determinismInputsSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:261`

```ts
export const determinismInputsSchema: z.ZodObject<{ snapshotId: z.ZodString; datasetSchemaVersion: z.ZodLiteral<"ts-codegraph.dataset@1">; templatePackVersion: z.ZodString; normalizedTimestamp: z.ZodString; }, z.core.$strict>
```

### diagnosticCodeSchema

- **Kind**: `constant`
- **Source**: `src/contracts/diagnostics.ts:86`

```ts
export const diagnosticCodeSchema: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; CHECK_OUTPUT_NOT_WRITABLE: "CHECK_OUTPUT_NOT_WRITABLE"; CHECK_OUTPUT_UNSAFE: "CHECK_OUTPUT_UNSAFE"; LOAD_ENVELOPE_INVALID: "LOAD_ENVELOPE_INVALID"; SEARCH_ENVELOPE_INVALID: "SEARCH_ENVELOPE_INVALID"; GENERATE_ENVELOPE_INVALID: "GENERATE_ENVELOPE_I…
```

### diagnosticSchema

- **Kind**: `constant`
- **Source**: `src/contracts/diagnostics.ts:136`

```ts
export const diagnosticSchema: z.ZodObject<{ code: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; CHECK_OUTPUT_NOT_WRITABLE: "CHECK_OUTPUT_NOT_WRITABLE"; CHECK_OUTPUT_UNSAFE: "CHECK_OUTPUT_UNSAFE"; LOAD_ENVELOPE_INVALID: "LOAD_ENVELOPE_INVALID"; SEARCH_ENVELOPE_INVALID: "SEARCH_ENVELOPE_INVALID"; GENERATE_ENVELOPE_INVALID: "GEN…
```

### diagnosticSeveritySchema

- **Kind**: `constant`
- **Source**: `src/contracts/diagnostics.ts:90`

```ts
export const diagnosticSeveritySchema: z.ZodEnum<{ error: "error"; warning: "warning"; info: "info"; }>
```

### discoverRepository

- **Kind**: `function`
- **Source**: `src/internal/repo-inventory/repo.ts:30`

```ts
export async function discoverRepository( root: string, opts?: DiscoverRepositoryOptions, ): Promise<RepoInventory>
```

### discoverWorkspace

- **Kind**: `function`
- **Source**: `src/internal/repo-inventory/workspace.ts:114`

```ts
export async function discoverWorkspace( root: string, opts?: DiscoverWorkspaceOptions, ): Promise<WorkspaceInventory>
```

### endSpanError

- **Kind**: `function`
- **Source**: `src/internal/sqlite/database.ts:197`

```ts
function endSpanError(span: ReturnType<ReturnType<typeof getTracer>['startSpan']>, err: unknown): void
```

### endSpanOk

- **Kind**: `function`
- **Source**: `src/internal/sqlite/database.ts:191`

```ts
function endSpanOk(span: ReturnType<ReturnType<typeof getTracer>['startSpan']>): void
```

### ensureAppPath

- **Kind**: `function`
- **Source**: `src/internal/app-paths/create.ts:7`

```ts
export async function ensureAppPath(pathRef: string, options?: EnsureAppPathOptions): Promise<void>
```

### envelopeMetaSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:32`

```ts
export const envelopeMetaSchema: z.ZodObject<{ toolVersion: z.ZodString; datasetSchemaVersion: z.ZodLiteral<"ts-codegraph.dataset@1">; timestamp: z.ZodString; }, z.core.$strict>
```

### executableLabel

- **Kind**: `function`
- **Source**: `src/internal/process-runner/policy.ts:536`

```ts
export function executableLabel(executable: string): string
```

### executeCheckCommand

- **Kind**: `function`
- **Source**: `src/cli/check-command.ts:138`

```ts
export async function executeCheckCommand(params: ExecuteCheckParams): Promise<number>
```

Execute `check` end to end. In `--json` mode stdout is exactly one validated
`ts-codegraph.check@1` envelope; otherwise a minimal human summary is written and
errors go through `writeCliResult`. Returns the POSIX exit code.

### executeGenerateCommand

- **Kind**: `function`
- **Source**: `src/cli/generate-command.ts:130`

```ts
export async function executeGenerateCommand(params: ExecuteGenerateParams): Promise<number>
```

### executeLoadCommand

- **Kind**: `function`
- **Source**: `src/cli/load-command.ts:101`

```ts
export async function executeLoadCommand(params: ExecuteLoadParams): Promise<number>
```

Execute `load` end to end. JSON mode writes exactly one validated
`ts-codegraph.load@1` envelope; a failed load (rolled back) reports a safe CLI error.

### executeSearch

- **Kind**: `function`
- **Source**: `src/search/execute.ts:212`

```ts
export async function executeSearch(input: SearchExecutionInput): Promise<SearchExecutionResult>
```

### executeSearchCommand

- **Kind**: `function`
- **Source**: `src/cli/search-command.ts:149`

```ts
export async function executeSearchCommand(params: ExecuteSearchParams): Promise<number>
```

### extractPackageFacts

- **Kind**: `function`
- **Source**: `src/extractor/extract.ts:344`

```ts
export async function extractPackageFacts(input: ExtractPackageFactsInput): Promise<PackageFacts>
```

Extract plain-serializable package facts from a set of TypeScript source files.
Never throws for a malformed export: unresolved exceptions degrade to
diagnostics. Output declarations and diagnostics are explicitly sorted.

### findTsconfigFiles

- **Kind**: `function`
- **Source**: `src/internal/repo-inventory/tsconfig.ts:15`

```ts
export async function findTsconfigFiles( root: string, opts?: FindTsconfigOptions, ): Promise<readonly string[]>
```

### fixtureRegistry

- **Kind**: `constant`
- **Source**: `src/contracts/fixtures.ts:26`

```ts
export const fixtureRegistry: Readonly<{ 'fixture-ts-tiny': { name: "fixture-ts-tiny"; kind: "synthetic"; proves: string[]; }; 'fixture-preflight-invalid': { name: "fixture-preflight-invalid"; kind: "invalid"; proves: string[]; }; 'fixture-redaction': { name: "fixture-redaction"; kind: "safety"; proves: string[]; }; 'fixture-search': { name: "fixture-search"; kind: "search"; proves: string[]; }; 'fixture-generate-missing-evidence': { name: "fixture-generate-missing-evidence"; kind: "generate"; proves: string[]; }; 'fixture-generate-determinism': { name: "fixture-generate-determinism"; kind: "generate"; proves: string[]; }; 'fixture-codegraph-errors': { name: "fixture-codegraph-errors"; kind: "real-package"; packageName: string; packagePath: string; proves: string[]; }; 'fixture-codegraph-http-client': { name: "fixture-codegraph-http-client"; kind: "real-package"; packageName: string; packagePath: string; proves: string[]; }; }>
```

### generateDataSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:270`

```ts
export const generateDataSchema: z.ZodObject<{ snapshotId: z.ZodString; templatePack: z.ZodObject<{ packName: z.ZodString; packVersion: z.ZodString; }, z.core.$strict>; generatedDocs: z.ZodArray<z.ZodObject<{ id: z.ZodString; conceptPath: z.ZodString; templateId: z.ZodString; contentHash: z.ZodString; }, z.core.$strict>>; skippedDocs: z.ZodArray<z.ZodObject<{ id: z.ZodString; conceptPath: z.ZodString; templateId: z.ZodString; reasonCode: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASE…
```

### generateEnvelopeSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:282`

```ts
export const generateEnvelopeSchema: z.ZodObject<{ ok: z.ZodBoolean; diagnostics: z.ZodArray<z.ZodObject<{ code: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; CHECK_OUTPUT_NOT_WRITABLE: "CHECK_OUTPUT_NOT_WRITABLE"; CHECK_OUTPUT_UNSAFE: "CHECK_OUTPUT_UNSAFE"; LOAD_ENVELOPE_INVALID: "LOAD_ENVELOPE_INVALID"; SEARCH_ENVELOPE_INVAL…
```

### generationManifestSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:252`

```ts
export const generationManifestSchema: z.ZodObject<{ manifestId: z.ZodString; manifestPath: z.ZodString; contentHash: z.ZodString; sections: z.ZodArray<z.ZodObject<{ sectionId: z.ZodString; slotId: z.ZodString; heading: z.ZodString; headingSlug: z.ZodString; }, z.core.$strict>>; }, z.core.$strict>
```

### getCacheDir

- **Kind**: `function`
- **Source**: `src/internal/app-paths/resolve.ts:174`

```ts
export function getCacheDir(options: AppPathOptions): string
```

### getCliExitCodeForError

- **Kind**: `function`
- **Source**: `src/internal/errors/registry.ts:56`

```ts
export function getCliExitCodeForError(error: AppError): number
```

### getConfigDir

- **Kind**: `function`
- **Source**: `src/internal/app-paths/resolve.ts:170`

```ts
export function getConfigDir(options: AppPathOptions): string
```

### getDataDir

- **Kind**: `function`
- **Source**: `src/internal/app-paths/resolve.ts:178`

```ts
export function getDataDir(options: AppPathOptions): string
```

### getHandle

- **Kind**: `function`
- **Source**: `src/internal/sqlite/database.ts:24`

```ts
export function getHandle(db: SqliteDatabase): DatabaseSync
```

### getHttpStatusForError

- **Kind**: `function`
- **Source**: `src/internal/errors/registry.ts:50`

```ts
export function getHttpStatusForError(error: AppError): number
```

### getLogDir

- **Kind**: `function`
- **Source**: `src/internal/app-paths/resolve.ts:186`

```ts
export function getLogDir(options: AppPathOptions): string
```

### getMeter

- **Kind**: `function`
- **Source**: `src/internal/telemetry/index.ts:63`

```ts
export function getMeter(_name?: string, _version?: string): Meter
```

### getStateDir

- **Kind**: `function`
- **Source**: `src/internal/app-paths/resolve.ts:182`

```ts
export function getStateDir(options: AppPathOptions): string
```

### getTempDir

- **Kind**: `function`
- **Source**: `src/internal/app-paths/resolve.ts:190`

```ts
export function getTempDir(options: AppPathOptions): string
```

### getTracer

- **Kind**: `function`
- **Source**: `src/internal/telemetry/index.ts:59`

```ts
export function getTracer(_name?: string, _version?: string): Tracer
```

### hashFileContent

- **Kind**: `function`
- **Source**: `src/internal/source-files/hash.ts:15`

```ts
export async function hashFileContent(absPath: string, root: string): Promise<string>
```

Computes the SHA-256 hex digest of the file at absPath.
`root` is required and enforced: paths outside root throw SOURCE_FILES_TRAVERSAL_DENIED.
Missing or non-string root throws SOURCE_FILES_ROOT_INVALID (prevents raw TypeError at runtime).

### headingSlug

- **Kind**: `function`
- **Source**: `src/generate/helpers.ts:17`

```ts
export function headingSlug(heading: string): string
```

A non-empty heading slug (falls back to `section` for degenerate headings).

### indexSearchDocument

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:540`

```ts
export function indexSearchDocument(dataset: Dataset, row: SearchDocumentRowInput): void
```

Populate the FTS index for a search document. Kept separate from
`insertSearchDocument` so persistence and indexing stay independently callable;
this is index population, not query logic.

### initMigration

- **Kind**: `constant`
- **Source**: `src/dataset/migrations/001-init.ts:156`

```ts
export const initMigration: SqliteMigration
```

The one numbered migration for the `ts-codegraph.dataset@1` schema.

### insertDiagnostic

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:452`

```ts
export function insertDiagnostic(dataset: Dataset, row: DiagnosticRowInput): void
```

### insertEvidence

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:406`

```ts
export function insertEvidence(dataset: Dataset, row: EvidenceRow): void
```

### insertGeneratedDoc

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:561`

```ts
export function insertGeneratedDoc(dataset: Dataset, row: GeneratedDocRow): void
```

### insertLoadRun

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:104`

```ts
export function insertLoadRun(dataset: Dataset, row: LoadRunRowInput): void
```

### insertPackage

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:153`

```ts
export function insertPackage(dataset: Dataset, row: PackageRowInput): void
```

### insertPackageDependency

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:218`

```ts
export function insertPackageDependency(dataset: Dataset, row: PackageDependencyRowInput): void
```

### insertPackageExport

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:185`

```ts
export function insertPackageExport(dataset: Dataset, row: PackageExportRowInput): void
```

### insertProject

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:33`

```ts
export function insertProject(dataset: Dataset, row: ProjectRow): void
```

### insertSearchDocument

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:507`

```ts
export function insertSearchDocument(dataset: Dataset, row: SearchDocumentRowInput): void
```

### insertSignature

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:380`

```ts
export function insertSignature(dataset: Dataset, row: SignatureRow): void
```

### insertSnapshot

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:61`

```ts
export function insertSnapshot(dataset: Dataset, row: SnapshotRowInput): void
```

### insertSourceFile

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:258`

```ts
export function insertSourceFile(dataset: Dataset, row: SourceFileRowInput): void
```

### insertSourceFileVersion

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:285`

```ts
export function insertSourceFileVersion(dataset: Dataset, row: SourceFileVersionRow): void
```

### insertSymbol

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:337`

```ts
export function insertSymbol(dataset: Dataset, row: SymbolRowInput): void
```

### isAppError

- **Kind**: `function`
- **Source**: `src/internal/errors/core.ts:164`

```ts
export function isAppError(value: unknown): value is AppError
```

### isExecutableAllowed

- **Kind**: `function`
- **Source**: `src/internal/process-runner/policy.ts:467`

```ts
export function isExecutableAllowed(executable: string, allowedExecutables: readonly string[]): boolean
```

Checks whether the executable is permitted by the allowlist.

Rules:
- If executable contains a path separator (absolute/relative path), it must
  exactly match an entry in allowedExecutables. Bare allowlist entries do NOT
  match absolute executable paths.
- If executable is a bare name (no separator), it must exactly match a bare
  entry in allowedExecutables (entries that themselves contain no separators).
  Absolute allowlist entries do NOT match bare executable names.

### isPathInside

- **Kind**: `function`
- **Source**: `src/internal/security/path.ts:45`

```ts
export function isPathInside(root: string, target: string): boolean
```

### isRetryableError

- **Kind**: `function`
- **Source**: `src/internal/errors/registry.ts:83`

```ts
export function isRetryableError(value: unknown): boolean
```

### kindOrder

- **Kind**: `function`
- **Source**: `src/search/rank.ts:26`

```ts
export function kindOrder(kind: SearchKind): number
```

### loadCommandDefinition

- **Kind**: `constant`
- **Source**: `src/cli/load-command.ts:75`

```ts
export const loadCommandDefinition: CliCommandDefinition<LoadCliOptions, LoadOutcome>
```

The `defineCliCommand` contract for `load` (used for registration/help).

### loadCountsSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:128`

```ts
export const loadCountsSchema: z.ZodObject<{ projects: z.ZodNumber; snapshots: z.ZodNumber; packages: z.ZodNumber; sourceFiles: z.ZodNumber; exports: z.ZodNumber; symbols: z.ZodNumber; signatures: z.ZodNumber; evidence: z.ZodNumber; diagnostics: z.ZodNumber; searchDocuments: z.ZodNumber; }, z.core.$strict>
```

### loadDataSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:151`

```ts
export const loadDataSchema: z.ZodObject<{ projectId: z.ZodString; snapshotId: z.ZodString; loadRunId: z.ZodString; counts: z.ZodObject<{ projects: z.ZodNumber; snapshots: z.ZodNumber; packages: z.ZodNumber; sourceFiles: z.ZodNumber; exports: z.ZodNumber; symbols: z.ZodNumber; signatures: z.ZodNumber; evidence: z.ZodNumber; diagnostics: z.ZodNumber; searchDocuments: z.ZodNumber; }, z.core.$strict>; changed: z.ZodArray<z.ZodObject<{ kind: z.ZodEnum<{ symbol: "symbol"; project: "project"; snapshot: "snapshot"; package: "package"; "source-file": "source-file"; export: "export"; diagnostic: "diagnostic"; "search-document": "search-document"; }>; id: z.ZodString; }, z.core.$strict>>; skipped: z.ZodArray<z.ZodObject<{ kind: z.ZodEnum<{ symbol: "symbol"; project: "project"; snapshot: "snapshot"; package: "package"; "source-file": "source-file"; export: "export"; diagnostic: "diagnostic"; "search-document": "search-document"; }>; id: z.ZodString; reasonCode: z.ZodEnum<{ CHECK_ENVELOPE_INVALID:…
```

### loadEnvelopeSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:164`

```ts
export const loadEnvelopeSchema: z.ZodObject<{ ok: z.ZodBoolean; diagnostics: z.ZodArray<z.ZodObject<{ code: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; CHECK_OUTPUT_NOT_WRITABLE: "CHECK_OUTPUT_NOT_WRITABLE"; CHECK_OUTPUT_UNSAFE: "CHECK_OUTPUT_UNSAFE"; LOAD_ENVELOPE_INVALID: "LOAD_ENVELOPE_INVALID"; SEARCH_ENVELOPE_INVALID: …
```

### loadGitignorePatterns

- **Kind**: `function`
- **Source**: `src/internal/source-files/ignore.ts:105`

```ts
export async function loadGitignorePatterns(root: string): Promise<string[]>
```

### loadPack

- **Kind**: `function`
- **Source**: `src/generate/packs.ts:24`

```ts
export async function loadPack(name: TemplateName, packsDir: string = DEFAULT_TEMPLATE_PACKS_DIR): Promise<LoadedPack>
```

### managedAll

- **Kind**: `function`
- **Source**: `src/dataset/sqlite-runtime.ts:281`

```ts
export function managedAll<T>( db: ManagedDatabase, sql: string, params: readonly SqlParam[] = [], ): T[]
```

Execute a parametrized read returning every row.

### managedGet

- **Kind**: `function`
- **Source**: `src/dataset/sqlite-runtime.ts:271`

```ts
export function managedGet<T>( db: ManagedDatabase, sql: string, params: readonly SqlParam[] = [], ): T | undefined
```

Execute a parametrized read returning the first row, or undefined.

### managedRun

- **Kind**: `function`
- **Source**: `src/dataset/sqlite-runtime.ts:260`

```ts
export function managedRun( db: ManagedDatabase, sql: string, params: readonly SqlParam[] = [], ): number
```

Execute a parametrized write; returns the affected row count.

### mapErrorToExitCode

- **Kind**: `function`
- **Source**: `src/internal/cli/exit.ts:3`

```ts
export function mapErrorToExitCode(error?: unknown): number
```

### normalizeAppError

- **Kind**: `function`
- **Source**: `src/internal/errors/core.ts:175`

```ts
export function normalizeAppError(value: unknown): AppError
```

### normalizeMarkdown

- **Kind**: `function`
- **Source**: `src/generate/helpers.ts:33`

```ts
export function normalizeMarkdown(body: string): string
```

Deterministic normalization of rendered Markdown: strips trailing whitespace per
line, collapses runs of blank lines to a single blank line, trims leading/trailing
blank lines, and ends with exactly one newline. Pure and idempotent.

### normalizeQuery

- **Kind**: `function`
- **Source**: `src/search/query.ts:37`

```ts
export function normalizeQuery(raw: string): NormalizedQuery
```

### normalizeRepoRelativePath

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:71`

```ts
export function normalizeRepoRelativePath(path: string): string
```

Normalize a repo-relative POSIX path for use as an ID input. Rejects absolute
paths, home shortcuts, and parent-directory escapes so a public ID can never
embed a machine-specific or out-of-tree location (decision record §6). Throws
a clear error rather than a raw runtime failure.

### normalizedTimestampForFixture

- **Kind**: `function`
- **Source**: `src/contracts/timestamp.ts:19`

```ts
export function normalizedTimestampForFixture( value = NORMALIZED_FIXTURE_TIMESTAMP, ): NormalizedTimestamp
```

### normalizedTimestampFromSnapshot

- **Kind**: `function`
- **Source**: `src/contracts/timestamp.ts:15`

```ts
export function normalizedTimestampFromSnapshot(value: string): NormalizedTimestamp
```

### normalizedTimestampSchema

- **Kind**: `constant`
- **Source**: `src/contracts/timestamp.ts:5`

```ts
export const normalizedTimestampSchema: z.ZodString
```

### openDataset

- **Kind**: `function`
- **Source**: `src/dataset/open.ts:151`

```ts
export async function openDataset( projectId: string, options: OpenDatasetOptions = {}, ): Promise<Dataset>
```

Open (or create) the dataset for a project. On `create`, the dataset directory
is created inside the app-paths boundary and the schema migration runs. On a
read-write open the migration runs idempotently (a no-op when up to date). A
read-only open skips creation and migration and requires an existing dataset.

### openManagedDatabase

- **Kind**: `function`
- **Source**: `src/dataset/sqlite-runtime.ts:92`

```ts
export function openManagedDatabase(options: ManagedOpenOptions): ManagedDatabase
```

Open (or create) a managed connection and apply the WAL/busy-timeout policy.

### openSqliteDatabase

- **Kind**: `function`
- **Source**: `src/internal/sqlite/database.ts:205`

```ts
export async function openSqliteDatabase(options: SqliteOpenOptions = {}): Promise<SqliteDatabase>
```

### packageOverviewDtoSchema

- **Kind**: `constant`
- **Source**: `src/projection/dto.ts:114`

```ts
export const packageOverviewDtoSchema: z.ZodObject<{ project: z.ZodObject<{ id: z.ZodString; name: z.ZodString; }, z.core.$strict>; repository: z.ZodObject<{ snapshotId: z.ZodString; kind: z.ZodEnum<{ "git-clean": "git-clean"; "git-dirty": "git-dirty"; "no-git": "no-git"; }>; baseCommit: z.ZodOptional<z.ZodString>; }, z.core.$strict>; pkg: z.ZodObject<{ id: z.ZodString; name: z.ZodString; version: z.ZodOptional<z.ZodString>; manifestPath: z.ZodString; description: z.ZodOptional<z.ZodString>; dependencies: z.ZodArray<z.ZodObject<{ name: z.ZodString; kind: z.ZodEnum<{ runtime: "runtime"; dev: "dev"; }>; versionRange: z.ZodOptional<z.ZodString>; }, z.core.$strict>>; }, z.core.$strict>; exports: z.ZodObject<{ present: z.ZodBoolean; items: z.ZodArray<z.ZodObject<{ exportPath: z.ZodString; }, z.core.$strict>>; }, z.core.$strict>; symbols: z.ZodObject<{ present: z.ZodBoolean; items: z.ZodArray<z.ZodObject<{ id: z.ZodString; name: z.ZodString; kind: z.ZodString; }, z.core.$strict>>; }, z.core.…
```

### packageSlug

- **Kind**: `function`
- **Source**: `src/generate/helpers.ts:23`

```ts
export function packageSlug(packageName: string): string
```

A filesystem-safe package slug for concept paths (falls back to `package`).

### parseCheckArgs

- **Kind**: `function`
- **Source**: `src/cli/check-command.ts:86`

```ts
export function parseCheckArgs(argv: readonly string[]): CheckCliOptions
```

Parse the two `check`-specific options from argv (globals come separately).

### parseCheckEnvelope

- **Kind**: `function`
- **Source**: `src/contracts/envelopes.ts:344`

```ts
export function parseCheckEnvelope(input: unknown): ContractParseResult<CheckEnvelope>
```

### parseGenerateArgs

- **Kind**: `function`
- **Source**: `src/cli/generate-command.ts:77`

```ts
export function parseGenerateArgs(argv: readonly string[]): GenerateCliOptions
```

### parseGenerateEnvelope

- **Kind**: `function`
- **Source**: `src/contracts/envelopes.ts:356`

```ts
export function parseGenerateEnvelope(input: unknown): ContractParseResult<GenerateEnvelope>
```

### parseGlobalCliOptions

- **Kind**: `function`
- **Source**: `src/internal/cli/program.ts:493`

```ts
export function parseGlobalCliOptions(argv: readonly string[]): CliGlobalOptions
```

### parseLoadArgs

- **Kind**: `function`
- **Source**: `src/cli/load-command.ts:52`

```ts
export function parseLoadArgs(argv: readonly string[]): LoadCliOptions
```

### parseLoadEnvelope

- **Kind**: `function`
- **Source**: `src/contracts/envelopes.ts:348`

```ts
export function parseLoadEnvelope(input: unknown): ContractParseResult<LoadEnvelope>
```

### parsePnpmWorkspaceYaml

- **Kind**: `function`
- **Source**: `src/internal/repo-inventory/workspace.ts:20`

```ts
export function parsePnpmWorkspaceYaml(content: string): string[]
```

Parse pnpm-workspace.yaml without a YAML library. Handles the common format:
  packages:
    - "packages/*"
    - "apps/*"

### parseSearchArgs

- **Kind**: `function`
- **Source**: `src/cli/search-command.ts:72`

```ts
export function parseSearchArgs(argv: readonly string[]): SearchCliOptions
```

### parseSearchEnvelope

- **Kind**: `function`
- **Source**: `src/contracts/envelopes.ts:352`

```ts
export function parseSearchEnvelope(input: unknown): ContractParseResult<SearchEnvelope>
```

### projectAllowedKeys

- **Kind**: `function`
- **Source**: `src/internal/security/serialization.ts:1`

```ts
export function projectAllowedKeys<T extends Record<string, unknown>>( obj: Readonly<T>, allowedKeys: readonly string[], ): Partial<T>
```

### projectDirKey

- **Kind**: `function`
- **Source**: `src/dataset/open.ts:87`

```ts
export function projectDirKey(projectId: string): string
```

Derive a filesystem-safe directory key from a public project ID. The ID is the
opaque `project:v1:<hash16>` string, so slugging its non-word characters keeps
it deterministic and path-safe while rejecting any separator or traversal that
could escape the datasets directory.

### rankValue

- **Kind**: `function`
- **Source**: `src/search/rank.ts:31`

```ts
export function rankValue(tier: SearchTier): number
```

### readBoundedTextFile

- **Kind**: `function`
- **Source**: `src/internal/source-files/read.ts:89`

```ts
export async function readBoundedTextFile( absPath: string, opts: ReadOptions, ): Promise<BoundedReadResult>
```

Reads up to opts.maxBytes bytes from absPath as text.
opts.root is required and enforced: paths outside root throw SOURCE_FILES_TRAVERSAL_DENIED.
Missing opts or non-string root throws SOURCE_FILES_ROOT_INVALID (prevents raw TypeError at runtime).

### readPackageManifest

- **Kind**: `function`
- **Source**: `src/internal/repo-inventory/manifest.ts:45`

```ts
export async function readPackageManifest( pathRef: string, repoRoot?: string, ): Promise<PackageInventory>
```

### redactObject

- **Kind**: `function`
- **Source**: `src/internal/security/redaction.ts:74`

```ts
export function redactObject( redactor: Redactor, obj: Readonly<Record<string, unknown>>, ): Record<string, unknown>
```

### redactProcessResult

- **Kind**: `function`
- **Source**: `src/internal/process-runner/redact.ts:8`

```ts
export function redactProcessResult(result: ProcessResult): ProcessResult
```

Returns a diagnostic-safe copy of the result with stdout and stderr replaced
by byte-count summaries using UTF-8 byte length (not character count).
Never log or emit telemetry with the raw result.

### redactText

- **Kind**: `function`
- **Source**: `src/extractor/sanitize.ts:41`

```ts
export function redactText(text: string): { readonly value: string; readonly redacted: boolean }
```

Control-strip + redact free text; returns the redacted value and a flag.

### redactValue

- **Kind**: `function`
- **Source**: `src/internal/security/redaction.ts:39`

```ts
export function redactValue(redactor: Redactor, value: string): RedactionResult
```

### resolveAppPath

- **Kind**: `function`
- **Source**: `src/internal/app-paths/resolve.ts:166`

```ts
export function resolveAppPath(kind: AppPathKind, options: AppPathOptions): string
```

### resolveAppPaths

- **Kind**: `function`
- **Source**: `src/internal/app-paths/resolve.ts:135`

```ts
export function resolveAppPaths(options: AppPathOptions): AppPathResolution
```

### resolveDatasetPaths

- **Kind**: `function`
- **Source**: `src/dataset/open.ts:124`

```ts
export function resolveDatasetPaths( projectId: string, options: Pick<OpenDatasetOptions, 'dataDirOverride'> = {}, ): DatasetPaths
```

Resolve the app-managed dataset paths for a project without touching disk.

### resolveExplicitReexport

- **Kind**: `function`
- **Source**: `src/extractor/type-checker.ts:34`

```ts
export function resolveExplicitReexport(specifier: ExportSpecifier): ReexportResolution
```

Exception 1 — explicit re-export resolution. Resolves `export { X } from './y'`
(including barrel entry points) to the declaration(s) it targets so exports can
link to symbols. Uses the checker via `getLocalTargetDeclarations`. Failure
degrades to a `LOAD_REEXPORT_UNRESOLVED` diagnostic.

### resolveSafePath

- **Kind**: `function`
- **Source**: `src/internal/security/path.ts:75`

```ts
export function resolveSafePath( policy: SafePathPolicy, target: string, ): SafePathResult
```

### runCheck

- **Kind**: `function`
- **Source**: `src/commands/check.ts:649`

```ts
export async function runCheck(options: RunCheckOptions): Promise<CheckOutcome>
```

Run the eight preflight gates and assemble a validated `ts-codegraph.check@1`
envelope. Never mutates the filesystem; an existing dataset's health is read
through an immutable open that creates no sidecars.

### runCliCommand

- **Kind**: `function`
- **Source**: `src/internal/cli/program.ts:326`

```ts
export async function runCliCommand<TOptions, TResult>( command: CliCommandDefinition<TOptions, TResult>, parsedOptions: TOptions, context: CliExecutionContext, ): Promise<CliResult<TResult>>
```

### runGenerate

- **Kind**: `function`
- **Source**: `src/commands/generate.ts:102`

```ts
export async function runGenerate(options: RunGenerateOptions): Promise<GenerateOutcome>
```

### runLoad

- **Kind**: `function`
- **Source**: `src/commands/load.ts:487`

```ts
export async function runLoad(options: RunLoadOptions): Promise<LoadOutcome>
```

Run a full load: build the model (async), persist it in one transaction, and
return a validated envelope. Throws (after rollback) if persistence fails.

### runManagedMigrations

- **Kind**: `function`
- **Source**: `src/dataset/sqlite-runtime.ts:170`

```ts
export function runManagedMigrations( db: ManagedDatabase, migrations: readonly SqliteMigration[], ): ManagedMigrationResult
```

Apply the migration set idempotently, mirroring `@codegraph/sqlite`
`runMigrations`: unique-id validation, an `_migrations` version table, a
sha256 checksum per migration (mismatch on an applied id throws), and each new
migration applied inside its own `BEGIN IMMEDIATE` transaction. Re-running an
up-to-date dataset applies nothing.

### runMigrations

- **Kind**: `function`
- **Source**: `src/internal/sqlite/migrations.ts:35`

```ts
export async function runMigrations( db: SqliteDatabase, migrations: readonly SqliteMigration[], options?: SqliteRunMigrationsOptions, ): Promise<SqliteMigrationResult>
```

### runProcess

- **Kind**: `function`
- **Source**: `src/internal/process-runner/runner.ts:142`

```ts
export async function runProcess( command: ProcessCommand, policy: ProcessRunnerPolicy, ): Promise<ProcessResult>
```

### runProcessJson

- **Kind**: `function`
- **Source**: `src/internal/process-runner/runner.ts:151`

```ts
export async function runProcessJson<T>( command: ProcessCommand, policy: ProcessRunnerPolicy, ): Promise<T>
```

### runSearch

- **Kind**: `function`
- **Source**: `src/commands/search.ts:71`

```ts
export async function runSearch(options: RunSearchOptions): Promise<SearchOutcome>
```

### safeDetailSchema

- **Kind**: `constant`
- **Source**: `src/contracts/diagnostics.ts:134`

```ts
export const safeDetailSchema: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>
```

### safePositiveInt

- **Kind**: `function`
- **Source**: `src/internal/repo-inventory/utils.ts:4`

```ts
export function safePositiveInt( value: number | undefined, defaultVal: number, hardMax: number = 100_000, ): number
```

Clamp a caller-supplied limit to a positive integer within [0, hardMax].
Returns defaultVal when the value is undefined, NaN, Infinity, or negative.

### sanitizeBaseType

- **Kind**: `function`
- **Source**: `src/internal/errors/sanitize.ts:81`

```ts
export function sanitizeBaseType(baseType: string): string
```

### sanitizeClientDetail

- **Kind**: `function`
- **Source**: `src/internal/errors/sanitize.ts:58`

```ts
export function sanitizeClientDetail(detail: string): string | undefined
```

### sanitizeCode

- **Kind**: `function`
- **Source**: `src/internal/errors/sanitize.ts:31`

```ts
export function sanitizeCode(code: string): string
```

### sanitizeDiagnosticText

- **Kind**: `function`
- **Source**: `src/internal/security/log-sanitization.ts:35`

```ts
export function sanitizeDiagnosticText(text: string): string
```

### sanitizeEvidenceText

- **Kind**: `function`
- **Source**: `src/extractor/sanitize.ts:59`

```ts
export function sanitizeEvidenceText(text: string): SanitizedEvidence
```

Sanitize JSDoc/comment evidence into bounded, redacted `SanitizedEvidence`.
Newlines are preserved (JSDoc structure); other control characters are stripped.

### sanitizeFieldViolations

- **Kind**: `function`
- **Source**: `src/internal/errors/sanitize.ts:116`

```ts
export function sanitizeFieldViolations( fields: readonly FieldViolation[], ): readonly FieldViolation[]
```

### sanitizeHeaderValue

- **Kind**: `function`
- **Source**: `src/internal/security/log-sanitization.ts:25`

```ts
export function sanitizeHeaderValue( headerName: string, headerValue: string, ): string
```

### sanitizeHttpStatus

- **Kind**: `function`
- **Source**: `src/internal/errors/sanitize.ts:39`

```ts
export function sanitizeHttpStatus(status: number, fallback: number): number
```

### sanitizeLogValue

- **Kind**: `function`
- **Source**: `src/internal/security/log-sanitization.ts:17`

```ts
export function sanitizeLogValue(value: string): string
```

### sanitizeSignatureText

- **Kind**: `function`
- **Source**: `src/extractor/sanitize.ts:49`

```ts
export function sanitizeSignatureText(text: string, max: number = MAX_SIGNATURE_LENGTH): string
```

Sanitize a signature/declaration/type fragment: control-strip, collapse
whitespace to single spaces, redact, and bound. Returns a plain string.

### sanitizeTitle

- **Kind**: `function`
- **Source**: `src/internal/errors/sanitize.ts:49`

```ts
export function sanitizeTitle(title: string, fallback: string = SAFE_TITLE_FALLBACK): string
```

### sanitizeTraceId

- **Kind**: `function`
- **Source**: `src/internal/errors/sanitize.ts:69`

```ts
export function sanitizeTraceId(traceId: string): string | undefined
```

### scanSourceFiles

- **Kind**: `function`
- **Source**: `src/internal/source-files/scan.ts:414`

```ts
export async function scanSourceFiles( root: string, policy?: SourceFilePolicy, ): Promise<SourceScanResult>
```

### searchCommandDefinition

- **Kind**: `constant`
- **Source**: `src/cli/search-command.ts:124`

```ts
export const searchCommandDefinition: CliCommandDefinition<SearchCliOptions, SearchOutcome>
```

### searchDataSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:200`

```ts
export const searchDataSchema: z.ZodObject<{ query: z.ZodString; snapshotId: z.ZodString; results: z.ZodArray<z.ZodObject<{ id: z.ZodString; kind: z.ZodEnum<{ symbol: "symbol"; file: "file"; package: "package"; export: "export"; diagnostic: "diagnostic"; "generated-doc": "generated-doc"; }>; label: z.ZodString; context: z.ZodString; rank: z.ZodNumber; matchReasons: z.ZodArray<z.ZodEnum<{ exact_label: "exact_label"; prefix_label: "prefix_label"; symbol_[REDACTED] package_name: "package_name"; file_path: "file_path"; export_name: "export_name"; diagnostic_code: "diagnostic_code"; }>>; }, z.core.$strict>>; resultLimit: z.ZodNumber; matchPolicy: z.ZodObject<{ tokenizerVersion: z.ZodLiteral<"identifier-v1">; rankingVersion: z.ZodLiteral<"exact-prefix-token-v1">; }, z.core.$strict>; }, z.core.$strict>
```

### searchEnvelopeSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:210`

```ts
export const searchEnvelopeSchema: z.ZodObject<{ ok: z.ZodBoolean; diagnostics: z.ZodArray<z.ZodObject<{ code: z.ZodEnum<{ CHECK_ENVELOPE_INVALID: "CHECK_ENVELOPE_INVALID"; CHECK_PROJECT_NOT_FOUND: "CHECK_PROJECT_NOT_FOUND"; CHECK_PROJECT_UNREADABLE: "CHECK_PROJECT_UNREADABLE"; CHECK_PROJECT_UNSAFE: "CHECK_PROJECT_UNSAFE"; CHECK_PACKAGE_MANIFEST_MISSING: "CHECK_PACKAGE_MANIFEST_MISSING"; CHECK_TSCONFIG_MISSING: "CHECK_TSCONFIG_MISSING"; CHECK_GIT_UNAVAILABLE: "CHECK_GIT_UNAVAILABLE"; CHECK_TRAVERSAL_POLICY_INVALID: "CHECK_TRAVERSAL_POLICY_INVALID"; CHECK_DATASET_MISSING: "CHECK_DATASET_MISSING"; CHECK_DATASET_UNREADABLE: "CHECK_DATASET_UNREADABLE"; CHECK_DATASET_UNHEALTHY: "CHECK_DATASET_UNHEALTHY"; CHECK_TEMPLATE_PACK_MISSING: "CHECK_TEMPLATE_PACK_MISSING"; CHECK_TEMPLATE_PACK_INVALID: "CHECK_TEMPLATE_PACK_INVALID"; CHECK_OUTPUT_NOT_WRITABLE: "CHECK_OUTPUT_NOT_WRITABLE"; CHECK_OUTPUT_UNSAFE: "CHECK_OUTPUT_UNSAFE"; LOAD_ENVELOPE_INVALID: "LOAD_ENVELOPE_INVALID"; SEARCH_ENVELOPE_INVALID…
```

### searchIndexStatusSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:143`

```ts
export const searchIndexStatusSchema: z.ZodObject<{ status: z.ZodEnum<{ ready: "ready"; skipped: "skipped"; failed: "failed"; }>; documentCount: z.ZodNumber; tokenizerVersion: z.ZodLiteral<"identifier-v1">; }, z.core.$strict>
```

### searchMatchPolicySchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:193`

```ts
export const searchMatchPolicySchema: z.ZodObject<{ tokenizerVersion: z.ZodLiteral<"identifier-v1">; rankingVersion: z.ZodLiteral<"exact-prefix-token-v1">; }, z.core.$strict>
```

### searchResultSchema

- **Kind**: `constant`
- **Source**: `src/contracts/envelopes.ts:182`

```ts
export const searchResultSchema: z.ZodObject<{ id: z.ZodString; kind: z.ZodEnum<{ symbol: "symbol"; file: "file"; package: "package"; export: "export"; diagnostic: "diagnostic"; "generated-doc": "generated-doc"; }>; label: z.ZodString; context: z.ZodString; rank: z.ZodNumber; matchReasons: z.ZodArray<z.ZodEnum<{ exact_label: "exact_label"; prefix_label: "prefix_label"; symbol_[REDACTED] package_name: "package_name"; file_path: "file_path"; export_name: "export_name"; diagnostic_code: "diagnostic_code"; }>>; }, z.core.$strict>
```

### selectDiagnostic

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:472`

```ts
export function selectDiagnostic(dataset: Dataset, id: string): DiagnosticRow | undefined
```

### selectEvidence

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:414`

```ts
export function selectEvidence(dataset: Dataset, id: string): EvidenceRow | undefined
```

### selectGeneratedDoc

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:578`

```ts
export function selectGeneratedDoc(dataset: Dataset, id: string): GeneratedDocRow | undefined
```

### selectLoadRun

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:122`

```ts
export function selectLoadRun(dataset: Dataset, id: string): LoadRunRow | undefined
```

### selectPackage

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:162`

```ts
export function selectPackage(dataset: Dataset, id: string): PackageRow | undefined
```

### selectPackageDependencies

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:227`

```ts
export function selectPackageDependencies( dataset: Dataset, packageId: string, ): PackageDependencyRow[]
```

### selectPackageExports

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:193`

```ts
export function selectPackageExports(dataset: Dataset, packageId: string): PackageExportRow[]
```

### selectProject

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:37`

```ts
export function selectProject(dataset: Dataset, id: string): ProjectRow | undefined
```

### selectSearchDocument

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:525`

```ts
export function selectSearchDocument(dataset: Dataset, id: string): SearchDocumentRow | undefined
```

### selectSignature

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:388`

```ts
export function selectSignature(dataset: Dataset, id: string): SignatureRow | undefined
```

### selectSnapshot

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:70`

```ts
export function selectSnapshot(dataset: Dataset, id: string): SnapshotRow | undefined
```

### selectSourceFile

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:267`

```ts
export function selectSourceFile(dataset: Dataset, id: string): SourceFileRow | undefined
```

### selectSourceFileVersion

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:293`

```ts
export function selectSourceFileVersion( dataset: Dataset, id: string, ): SourceFileVersionRow | undefined
```

### selectSymbol

- **Kind**: `function`
- **Source**: `src/dataset/rows.ts:357`

```ts
export function selectSymbol(dataset: Dataset, id: string): SymbolRow | undefined
```

### slugify

- **Kind**: `function`
- **Source**: `src/generate/helpers.ts:8`

```ts
export function slugify(text: string): string
```

Pure string helpers for generation (step-06b). No clock, I/O, or state — every
function is a deterministic map from its arguments to a string. Unit-tested in
test/generate/helpers.test.ts.

GitHub-style heading slug: lowercase, non-alphanumeric runs to single hyphens.

### snapshotAndValidateProcessCommand

- **Kind**: `function`
- **Source**: `src/internal/process-runner/policy.ts:290`

```ts
export function snapshotAndValidateProcessCommand(command: unknown, policySnap: ProcessRunnerPolicySnapshot): ProcessCommandSnapshot
```

Validates all fields of a ProcessCommand against a validated policy snapshot and returns
a frozen detached command snapshot. Reads each field exactly once via property descriptors;
rejects accessor descriptors. Use the returned snapshot for all subsequent reads.

### snapshotAndValidateProcessRunnerPolicy

- **Kind**: `function`
- **Source**: `src/internal/process-runner/policy.ts:145`

```ts
export function snapshotAndValidateProcessRunnerPolicy(policy: unknown): ProcessRunnerPolicySnapshot
```

Validates all fields of a ProcessRunnerPolicy and returns a frozen detached snapshot.
Reads each field and array element exactly once via property descriptors; rejects accessor
descriptors. Use the returned snapshot (not the original policy) for all subsequent reads.

### sourceRefSchema

- **Kind**: `constant`
- **Source**: `src/contracts/diagnostics.ts:108`

```ts
export const sourceRefSchema: z.ZodObject<{ path: z.ZodString; line: z.ZodOptional<z.ZodNumber>; endLine: z.ZodOptional<z.ZodNumber>; symbol: z.ZodOptional<z.ZodString>; }, z.core.$strict>
```

### spawnProcess

- **Kind**: `function`
- **Source**: `src/internal/process-runner/spawn.ts:59`

```ts
export async function spawnProcess( commandSnap: ProcessCommandSnapshot, policySnap: ProcessRunnerPolicySnapshot, ): Promise<ProcessResult>
```

### splitIdentifier

- **Kind**: `function`
- **Source**: `src/extractor/identifier.ts:25`

```ts
export function splitIdentifier(identifier: string): string[]
```

Split `identifier` into ordered, unique, lowercase tokens.

Examples:
 - `createWidget` → `['create', 'widget']`
 - `WidgetOptions` → `['widget', 'options']`
 - `snake_case_name` → `['snake', 'case', 'name']`
 - `@codegraph/http-client` → `['codegraph', 'http', 'client']`
 - `getHTTPResponseCode2` → `['get', 'http', 'response', 'code', '2']`
 - `answer42` → `['answer', '42']`

### startSpan

- **Kind**: `function`
- **Source**: `src/internal/sqlite/database.ts:181`

```ts
function startSpan(operation: string)
```

### summarizeGitState

- **Kind**: `function`
- **Source**: `src/internal/repo-inventory/git.ts:40`

```ts
export async function summarizeGitState( root: string, opts?: GitSummaryOptions, ): Promise<GitSummary>
```

### summarizeTimings

- **Kind**: `function`
- **Source**: `src/commands/load.ts:524`

```ts
export function summarizeTimings(input: { readonly target: string; readonly samplesMs: readonly number[]; readonly tsMorph: string; }): LoadTimingEntry
```

### templateFileSchema

- **Kind**: `constant`
- **Source**: `src/contracts/template-pack.ts:23`

```ts
export const templateFileSchema: z.ZodObject<{ templateId: z.ZodString; path: z.ZodString; outputPattern: z.ZodString; }, z.core.$strict>
```

### templatePackManifestSchema

- **Kind**: `constant`
- **Source**: `src/contracts/template-pack.ts:52`

```ts
export const templatePackManifestSchema: z.ZodObject<{ packName: z.ZodString; packVersion: z.ZodString; slotIds: z.ZodArray<z.ZodString>; requiredFacts: z.ZodArray<z.ZodString>; optionalFacts: z.ZodArray<z.ZodString>; templateFiles: z.ZodArray<z.ZodObject<{ templateId: z.ZodString; path: z.ZodString; outputPattern: z.ZodString; }, z.core.$strict>>; }, z.core.$strict>
```

### toProblemDetails

- **Kind**: `function`
- **Source**: `src/internal/errors/problem-details.ts:34`

```ts
export function toProblemDetails( error: AppError, opts?: ToProblemDetailsOptions, ): ProblemDetails
```

### toSafeError

- **Kind**: `function`
- **Source**: `src/internal/errors/problem-details.ts:81`

```ts
export function toSafeError(error: AppError): SafeError
```

### truncateHash

- **Kind**: `function`
- **Source**: `src/dataset/ids.ts:94`

```ts
export function truncateHash( hex: string, length: number = DEFAULT_HASH_HEX_LENGTH, ): string
```

Truncate a full hex digest to `length` characters.

### validateAppName

- **Kind**: `function`
- **Source**: `src/internal/app-paths/names.ts:26`

```ts
export function validateAppName(name: string): string
```

### validateCommandEnv

- **Kind**: `function`
- **Source**: `src/internal/process-runner/policy.ts:485`

```ts
export function validateCommandEnv( commandEnv: Readonly<Record<string, string>> | undefined, allowedEnvKeys: readonly string[] | undefined, ): void
```

Validates that command.env keys are all in the EFFECTIVE env allowlist.
The effective list is `allowedEnvKeys ?? SAFE_DEFAULT_ENV_KEYS` — so even
when no explicit allowedEnvKeys is provided, command.env is still validated
against the safe defaults. Never includes key names or values in clientDetail.

### validateGeneratedDoc

- **Kind**: `function`
- **Source**: `src/contracts/okf.ts:151`

```ts
export function validateGeneratedDoc( frontmatter: GeneratedDocFrontmatter, body: string, ): ValidateGeneratedDocResult
```

### validateIdentifier

- **Kind**: `function`
- **Source**: `src/internal/sqlite/fts.ts:11`

```ts
export function validateIdentifier(name: string): void
```

### validateOutboundUrl

- **Kind**: `function`
- **Source**: `src/internal/security/url.ts:65`

```ts
export function validateOutboundUrl( policy: OutboundUrlPolicy, rawUrl: string, ): OutboundUrlResult
```

### validatePolicy

- **Kind**: `function`
- **Source**: `src/internal/sqlite/database.ts:135`

```ts
export function validatePolicy(policy: SqlitePolicy): void
```

### validateProcessCommand

- **Kind**: `function`
- **Source**: `src/internal/process-runner/policy.ts:503`

```ts
export function validateProcessCommand(command: ProcessCommand, policy: ProcessRunnerPolicy): void
```

### validateProcessRunnerPolicy

- **Kind**: `function`
- **Source**: `src/internal/process-runner/policy.ts:281`

```ts
export function validateProcessRunnerPolicy(policy: unknown): asserts policy is ProcessRunnerPolicy
```

Validates all fields of a ProcessRunnerPolicy. Must be called before any span,
metric, env copy, or process spawn so that invalid policies cannot reach the OS.
Throws PROCESS_INVALID_POLICY for any invalid field; never includes raw field values.
For internal use, prefer snapshotAndValidateProcessRunnerPolicy which returns a snapshot.

### validateProfileName

- **Kind**: `function`
- **Source**: `src/internal/app-paths/names.ts:39`

```ts
export function validateProfileName(name: string): string
```

### validateSourceFilePolicy

- **Kind**: `function`
- **Source**: `src/internal/source-files/scan.ts:208`

```ts
export function validateSourceFilePolicy(policy: SourceFilePolicy | undefined): void
```

Validates all numeric and array fields of a SourceFilePolicy. Throws
SOURCE_FILES_ROOT_INVALID (validation category) for any invalid field.
Must be called before traversal, reads, spans, or file side effects.
For internal use, prefer snapshotAndValidateSourceFilePolicy which returns a snapshot.

### validateWritePlan

- **Kind**: `function`
- **Source**: `src/internal/source-files/write.ts:78`

```ts
export function validateWritePlan(plan: AtomicWritePlan): void
```

### withDatasetTransaction

- **Kind**: `function`
- **Source**: `src/dataset/open.ts:196`

```ts
export function withDatasetTransaction<T>(dataset: Dataset, fn: () => T): T
```

Run `fn` inside a transaction on the dataset connection.

### withErrorCause

- **Kind**: `function`
- **Source**: `src/internal/errors/core.ts:187`

```ts
export function withErrorCause(error: AppError, cause: unknown): AppError
```

### withManagedTransaction

- **Kind**: `function`
- **Source**: `src/dataset/sqlite-runtime.ts:238`

```ts
export function withManagedTransaction<T>( db: ManagedDatabase, fn: () => T, mode: 'deferred' | 'immediate' | 'exclusive' = 'deferred', ): T
```

Run `fn` inside a transaction on the single managed connection, committing on
success and rolling back on any thrown error. The callback is synchronous
because `node:sqlite` is synchronous; row helpers called inside it write on the
same connection, so their writes participate in this transaction.

### withTransaction

- **Kind**: `function`
- **Source**: `src/internal/sqlite/transaction.ts:22`

```ts
export async function withTransaction<T>( db: SqliteDatabase, callback: () => T | Promise<T>, options?: SqliteTransactionOptions, ): Promise<T>
```

### writeCliResult

- **Kind**: `function`
- **Source**: `src/internal/cli/output.ts:83`

```ts
export function writeCliResult<T>(result: CliResult<T>, output: CliOutput): void
```

## Sources Used

- `API_REFERENCE_DTO_SCHEMA_ID` — `src/projection/dto.ts:144`
- `APP_ERROR_CATEGORIES` — `src/internal/errors/core.ts:16`
- `APP_PATH_KINDS` — `src/internal/app-paths/types.ts:1`
- `ApiReferenceDto` — `src/projection/dto.ts:141`
- `AppError` — `src/internal/errors/core.ts:97`
- `AppErrorAttributes` — `src/internal/errors/core.ts:51`
- `AppErrorCategory` — `src/internal/errors/core.ts:28`
- `AppErrorCode` — `src/internal/errors/core.ts:14`
- `AppErrorOptions` — `src/internal/errors/core.ts:38`
- `AppPathErrorCode` — `src/internal/app-paths/types.ts:5`
- `AppPathKind` — `src/internal/app-paths/types.ts:3`
- `AppPathOptions` — `src/internal/app-paths/types.ts:29`
- `AppPathOverrides` — `src/internal/app-paths/types.ts:13`
- `AppPathPolicy` — `src/internal/app-paths/types.ts:22`
- `AppPathResolution` — `src/internal/app-paths/types.ts:39`
- `AtomicWriteEntry` — `src/internal/source-files/types.ts:38`
- `AtomicWritePlan` — `src/internal/source-files/types.ts:44`
- `AttributeName` — `src/internal/app-paths/generated/app-paths-entities.ts:26`
- `AttributeName` — `src/internal/cli/generated/cli-entities.ts:31`
- `AttributeName` — `src/internal/process-runner/generated/process-runner-entities.ts:27`
- `AttributeName` — `src/internal/repo-inventory/generated/repo-inventory-entities.ts:29`
- `AttributeName` — `src/internal/security/generated/security-entities.ts:35`
- `AttributeName` — `src/internal/source-files/generated/source-files-entities.ts:27`
- `AttributeName` — `src/internal/sqlite/generated/sqlite-entities.ts:30`
- `Attributes` — `src/internal/telemetry/index.ts:7`
- `BoundedReadResult` — `src/internal/source-files/types.ts:14`
- `BuildDocumentResult` — `src/generate/document.ts:39`
- `CHECK_GATE_IDS` — `src/commands/check.ts:85`
- `CHECK_TOOL_VERSION` — `src/commands/check.ts:51`
- `CheckCliOptions` — `src/cli/check-command.ts:29`
- `CheckCliOverrides` — `src/cli/check-command.ts:35`
- `CheckData` — `src/contracts/envelopes.ts:300`
- `CheckEnvelope` — `src/contracts/envelopes.ts:301`
- `CheckGateId` — `src/commands/check.ts:96`
- `CheckOutcome` — `src/commands/check.ts:118`
- `CliCommandDefinition` — `src/internal/cli/types.ts:37`
- `CliCommandGroupDefinition` — `src/internal/cli/types.ts:50`
- `CliCommandOption` — `src/internal/cli/types.ts:31`
- `CliErrorDetail` — `src/internal/cli/types.ts:17`
- `CliExecutionContext` — `src/internal/cli/types.ts:12`
- `CliGlobalOptions` — `src/internal/cli/types.ts:1`
- `CliOutput` — `src/internal/cli/types.ts:73`
- `CliOutputOptions` — `src/internal/cli/types.ts:65`
- `CliProgram` — `src/internal/cli/types.ts:84`
- `CliProgramOptions` — `src/internal/cli/types.ts:56`
- `CliResult` — `src/internal/cli/types.ts:24`
- `CommandEnvelope` — `src/contracts/envelopes.ts:308`
- `CompileStrictOptions` — `src/render/engine.ts:50`
- `ComputeSnapshotInput` — `src/dataset/snapshot.ts:36`
- `ContractParseResult` — `src/contracts/envelopes.ts:310`
- `Counter` — `src/internal/telemetry/index.ts:21`
- `DATASET_APP_NAME` — `src/dataset/open.ts:27`
- `DATASET_DB_FILENAME` — `src/dataset/open.ts:33`
- `DATASET_MIGRATIONS` — `src/dataset/migrations/index.ts:10`
- `DATASET_SCHEMA_ID` — `src/dataset/schema.ts:18`
- `DATASET_SCHEMA_VERSION` — `src/dataset/schema.ts:21`
- `DATASET_SUBDIR` — `src/dataset/open.ts:30`
- `DATASET_TABLES` — `src/dataset/schema.ts:27`
- `DEFAULT_HASH_HEX_LENGTH` — `src/dataset/ids.ts:35`
- `DEFAULT_IGNORE_PATTERNS` — `src/internal/source-files/ignore.ts:4`
- `DEFAULT_SEARCH_LIMIT` — `src/commands/search.ts:32`
- `DEFAULT_TEMPLATE_PACK` — `src/commands/check.ts:54`
- `DEFAULT_TEMPLATE_PACKS_DIR` — `src/commands/check.ts:80`
- `DIAGNOSTIC_CODE_REGISTRY` — `src/contracts/diagnostics.ts:26`
- `Dataset` — `src/dataset/open.ts:72`
- `DatasetContainmentError` — `src/dataset/open.ts:36`
- `DatasetPaths` — `src/dataset/open.ts:63`
- `DatasetTable` — `src/dataset/schema.ts:44`
- `DeclarationFact` — `src/extractor/types.ts:34`
- `DeclarationKind` — `src/extractor/types.ts:13`
- `DeclaredTypeResolution` — `src/extractor/type-checker.ts:50`
- `Diagnostic` — `src/contracts/diagnostics.ts:149`
- `DiagnosticCode` — `src/contracts/diagnostics.ts:78`
- `DiagnosticCodes` — `src/contracts/diagnostics.ts:80`
- `DiagnosticInput` — `src/contracts/diagnostics.ts:151`
- `DiagnosticRow` — `src/dataset/rows.ts:439`
- `DiagnosticRowInput` — `src/dataset/rows.ts:426`
- `DiagnosticSeverity` — `src/contracts/diagnostics.ts:92`
- `DiscoverRepositoryOptions` — `src/internal/repo-inventory/types.ts:49`
- `DiscoverWorkspaceOptions` — `src/internal/repo-inventory/types.ts:56`
- `ENTITY_IDS` — `src/internal/app-paths/generated/app-paths-entities.ts:6`
- `ENTITY_IDS` — `src/internal/cli/generated/cli-entities.ts:6`
- `ENTITY_IDS` — `src/internal/errors/generated/error-entities.ts:6`
- `ENTITY_IDS` — `src/internal/process-runner/generated/process-runner-entities.ts:6`
- `ENTITY_IDS` — `src/internal/repo-inventory/generated/repo-inventory-entities.ts:6`
- `ENTITY_IDS` — `src/internal/security/generated/security-entities.ts:6`
- `ENTITY_IDS` — `src/internal/source-files/generated/source-files-entities.ts:6`
- `ENTITY_IDS` — `src/internal/sqlite/generated/sqlite-entities.ts:6`
- `ERROR_CODES` — `src/internal/app-paths/generated/app-paths-entities.ts:29`
- `ERROR_CODES` — `src/internal/cli/generated/cli-entities.ts:34`
- `ERROR_CODES` — `src/internal/errors/generated/error-entities.ts:21`
- `ERROR_CODES` — `src/internal/process-runner/generated/process-runner-entities.ts:41`
- `ERROR_CODES` — `src/internal/repo-inventory/generated/repo-inventory-entities.ts:32`
- `ERROR_CODES` — `src/internal/security/generated/security-entities.ts:38`
- `ERROR_CODES` — `src/internal/source-files/generated/source-files-entities.ts:30`
- `ERROR_CODES` — `src/internal/sqlite/generated/sqlite-entities.ts:33`
- `EnsureAppPathOptions` — `src/internal/app-paths/types.ts:35`
- `EntityId` — `src/internal/app-paths/generated/app-paths-entities.ts:16`
- `EntityId` — `src/internal/cli/generated/cli-entities.ts:19`
- `EntityId` — `src/internal/errors/generated/error-entities.ts:18`
- `EntityId` — `src/internal/process-runner/generated/process-runner-entities.ts:16`
- `EntityId` — `src/internal/repo-inventory/generated/repo-inventory-entities.ts:17`
- `EntityId` — `src/internal/security/generated/security-entities.ts:25`
- `EntityId` — `src/internal/source-files/generated/source-files-entities.ts:17`
- `EntityId` — `src/internal/sqlite/generated/sqlite-entities.ts:18`
- `EnvelopeMeta` — `src/contracts/envelopes.ts:299`
- `ErrorCode` — `src/internal/app-paths/generated/app-paths-entities.ts:38`
- `ErrorCode` — `src/internal/cli/generated/cli-entities.ts:41`
- `ErrorCode` — `src/internal/errors/generated/error-entities.ts:34`
- `ErrorCode` — `src/internal/process-runner/generated/process-runner-entities.ts:54`
- `ErrorCode` — `src/internal/repo-inventory/generated/repo-inventory-entities.ts:41`
- `ErrorCode` — `src/internal/security/generated/security-entities.ts:46`
- `ErrorCode` — `src/internal/source-files/generated/source-files-entities.ts:42`
- `ErrorCode` — `src/internal/sqlite/generated/sqlite-entities.ts:48`
- `ErrorCodeMeta` — `src/internal/errors/registry.ts:4`
- `ErrorRegistry` — `src/internal/errors/registry.ts:14`
- `EvidenceRow` — `src/dataset/rows.ts:398`
- `ExecuteCheckParams` — `src/cli/check-command.ts:41`
- `ExecuteGenerateParams` — `src/cli/generate-command.ts:38`
- `ExecuteLoadParams` — `src/cli/load-command.ts:31`
- `ExecuteSearchParams` — `src/cli/search-command.ts:34`
- `ExtractPackageFactsInput` — `src/extractor/types.ts:57`
- `ExtractorSourceFile` — `src/extractor/types.ts:49`
- `FIXTURE_NAMES` — `src/contracts/fixtures.ts:14`
- `FORBIDDEN_TABLES` — `src/dataset/schema.ts:68`
- `FieldViolation` — `src/internal/errors/core.ts:30`
- `FindTsconfigOptions` — `src/internal/repo-inventory/types.ts:61`
- `FixtureDefinition` — `src/contracts/fixtures.ts:18`
- `FixtureKind` — `src/contracts/fixtures.ts:16`
- `FixtureName` — `src/contracts/fixtures.ts:12`
- `GENERATE_TEMPLATES` — `src/cli/generate-command.ts:45`
- `GENERATE_TOOL_VERSION` — `src/commands/generate.ts:43`
- `GenerateCliOptions` — `src/cli/generate-command.ts:26`
- `GenerateCliOverrides` — `src/cli/generate-command.ts:33`
- `GenerateData` — `src/contracts/envelopes.ts:306`
- `GenerateEnvelope` — `src/contracts/envelopes.ts:307`
- `GenerateOutcome` — `src/commands/generate.ts:57`
- `GenerateRefusedError` — `src/commands/generate.ts:65`
- `GenerateTemplate` — `src/commands/generate.ts:46`
- `GeneratedDocFrontmatter` — `src/contracts/okf.ts:9`
- `GeneratedDocRecord` — `src/generate/document.ts:29`
- `GeneratedDocRow` — `src/dataset/rows.ts:551`
- `GitSummary` — `src/internal/repo-inventory/types.ts:24`
- `GitSummaryOptions` — `src/internal/repo-inventory/types.ts:65`
- `HashedIdType` — `src/dataset/ids.ts:44`
- `Histogram` — `src/internal/telemetry/index.ts:25`
- `ID_VERSION` — `src/dataset/ids.ts:32`
- `IdCollisionEntry` — `src/dataset/ids.ts:328`
- `IdCollisionResolution` — `src/dataset/ids.ts:343`
- `IgnoreChecker` — `src/internal/source-files/ignore.ts:66`
- `IncludedFile` — `src/dataset/snapshot.ts:30`
- `KIND_ORDER` — `src/search/rank.ts:21`
- `LOAD_TOOL_VERSION` — `src/commands/load.ts:81`
- `LoadCliOptions` — `src/cli/load-command.ts:21`
- `LoadCliOverrides` — `src/cli/load-command.ts:26`
- `LoadData` — `src/contracts/envelopes.ts:302`
- `LoadEnvelope` — `src/contracts/envelopes.ts:303`
- `LoadOutcome` — `src/commands/load.ts:110`
- `LoadPhase` — `src/commands/load.ts:85`
- `LoadRunRow` — `src/dataset/rows.ts:93`
- `LoadRunRowInput` — `src/dataset/rows.ts:82`
- `LoadTimingEntry` — `src/commands/load.ts:508`
- `LoadedPack` — `src/generate/packs.ts:17`
- `MAX_ALLOWED_ENV_KEYS` — `src/internal/process-runner/policy.ts:45`
- `MAX_ALLOWED_EXECUTABLES` — `src/internal/process-runner/policy.ts:44`
- `MAX_EVIDENCE_LENGTH` — `src/extractor/sanitize.ts:15`
- `MAX_EXTENSION_ENTRIES` — `src/internal/source-files/scan.ts:32`
- `MAX_FILE_COUNT` — `src/internal/source-files/scan.ts:30`
- `MAX_FILE_SIZE_BYTES` — `src/internal/source-files/scan.ts:29`
- `MAX_IGNORE_PATTERNS` — `src/internal/source-files/scan.ts:33`
- `MAX_OUTPUT_BYTES` — `src/internal/process-runner/policy.ts:41`
- `MAX_POLICY_NAME_LENGTH` — `src/internal/process-runner/policy.ts:43`
- `MAX_READ_BYTES` — `src/internal/source-files/scan.ts:31`
- `MAX_SEARCH_LIMIT` — `src/commands/search.ts:33`
- `MAX_SIGNATURE_LENGTH` — `src/extractor/sanitize.ts:18`
- `MAX_TIMEOUT_MS` — `src/internal/process-runner/policy.ts:42`
- `ManagedDatabase` — `src/dataset/sqlite-runtime.ts:54`
- `ManagedHealthResult` — `src/dataset/sqlite-runtime.ts:129`
- `ManagedMigrationResult` — `src/dataset/sqlite-runtime.ts:60`
- `ManagedOpenOptions` — `src/dataset/sqlite-runtime.ts:36`
- `Meter` — `src/internal/telemetry/index.ts:29`
- `MetricName` — `src/internal/process-runner/generated/process-runner-entities.ts:38`
- `NORMALIZED_FIXTURE_TIMESTAMP` — `src/contracts/timestamp.ts:3`
- `NOW_TRAVERSAL_POLICY` — `src/commands/check.ts:63`
- `NormalizedQuery` — `src/search/query.ts:14`
- `NormalizedTimestamp` — `src/contracts/timestamp.ts:9`
- `OpenDatasetOptions` — `src/dataset/open.ts:46`
- `OutboundUrlPolicy` — `src/internal/security/url.ts:5`
- `OutboundUrlResult` — `src/internal/security/url.ts:12`
- `PACKAGE_OVERVIEW_DTO_SCHEMA_ID` — `src/projection/dto.ts:143`
- `PackageDependencyRow` — `src/dataset/rows.ts:211`
- `PackageDependencyRowInput` — `src/dataset/rows.ts:204`
- `PackageExportRow` — `src/dataset/rows.ts:179`
- `PackageExportRowInput` — `src/dataset/rows.ts:173`
- `PackageFacts` — `src/extractor/types.ts:65`
- `PackageInventory` — `src/internal/repo-inventory/types.ts:4`
- `PackageManagerInfo` — `src/internal/repo-inventory/types.ts:18`
- `PackageManagerName` — `src/internal/repo-inventory/types.ts:1`
- `PackageOverviewDto` — `src/projection/dto.ts:140`
- `PackageRow` — `src/dataset/rows.ts:144`
- `PackageRowInput` — `src/dataset/rows.ts:135`
- `ProblemDetails` — `src/internal/errors/problem-details.ts:6`
- `ProcessCommand` — `src/internal/process-runner/types.ts:1`
- `ProcessCommandSnapshot` — `src/internal/process-runner/policy.ts:18`
- `ProcessOutputLimit` — `src/internal/process-runner/types.ts:23`
- `ProcessResult` — `src/internal/process-runner/types.ts:27`
- `ProcessRunner` — `src/internal/process-runner/types.ts:38`
- `ProcessRunnerPolicy` — `src/internal/process-runner/types.ts:11`
- `ProcessRunnerPolicySnapshot` — `src/internal/process-runner/policy.ts:7`
- `ProjectRow` — `src/dataset/rows.ts:28`
- `ProjectionDto` — `src/generate/document.ts:48`
- `ProjectionOptions` — `src/projection/index.ts:30`
- `ProjectionOutcome` — `src/projection/index.ts:37`
- `PureHelper` — `src/render/engine.ts:48`
- `RankableCandidate` — `src/search/rank.ts:35`
- `RateLimitKeyOptions` — `src/internal/security/rate-limit.ts:3`
- `ReadOptions` — `src/internal/source-files/types.ts:32`
- `RedactionResult` — `src/internal/security/redaction.ts:6`
- `RedactionRule` — `src/internal/security/redaction.ts:1`
- `Redactor` — `src/internal/security/redaction.ts:11`
- `ReexportResolution` — `src/extractor/type-checker.ts:22`
- `RepoInventory` — `src/internal/repo-inventory/types.ts:40`
- `ResolvedId` — `src/dataset/ids.ts:336`
- `RunCheckOptions` — `src/commands/check.ts:103`
- `RunGenerateOptions` — `src/commands/generate.ts:48`
- `RunLoadOptions` — `src/commands/load.ts:100`
- `RunSearchOptions` — `src/commands/search.ts:38`
- `SAFE_DEFAULT_ENV_KEYS` — `src/internal/process-runner/policy.ts:28`
- `SEARCH_DOCUMENT_FTS_COLUMNS` — `src/dataset/schema.ts:54`
- `SEARCH_DOCUMENT_FTS_TABLE` — `src/dataset/schema.ts:47`
- `SEARCH_KINDS` — `src/commands/search.ts:36`
- `SEARCH_TOKENIZER_VERSION` — `src/commands/load.ts:82`
- `SEARCH_TOOL_VERSION` — `src/commands/search.ts:31`
- `SafeDetail` — `src/contracts/diagnostics.ts:148`
- `SafeError` — `src/internal/errors/problem-details.ts:18`
- `SafePathPolicy` — `src/internal/security/path.ts:9`
- `SafePathResult` — `src/internal/security/path.ts:14`
- `SanitizedEvidence` — `src/extractor/types.ts:23`
- `SearchCliOptions` — `src/cli/search-command.ts:22`
- `SearchCliOverrides` — `src/cli/search-command.ts:29`
- `SearchData` — `src/contracts/envelopes.ts:304`
- `SearchDocumentRow` — `src/dataset/rows.ts:496`
- `SearchDocumentRowInput` — `src/dataset/rows.ts:485`
- `SearchEnvelope` — `src/contracts/envelopes.ts:305`
- `SearchExecutionInput` — `src/search/execute.ts:24`
- `SearchExecutionResult` — `src/search/execute.ts:32`
- `SearchKind` — `src/search/rank.ts:17`
- `SearchOutcome` — `src/commands/search.ts:47`
- `SearchTier` — `src/search/rank.ts:18`
- `SectionRecord` — `src/generate/document.ts:21`
- `SecurityAuditEvent` — `src/internal/security/audit.ts:16`
- `SecurityAuditEventKind` — `src/internal/security/audit.ts:6`
- `SecurityPolicyDecision` — `src/internal/security/types.ts:1`
- `SignatureRow` — `src/dataset/rows.ts:374`
- `SnapshotIdentity` — `src/dataset/snapshot.ts:51`
- `SnapshotKind` — `src/dataset/snapshot.ts:27`
- `SnapshotRow` — `src/dataset/rows.ts:52`
- `SnapshotRowInput` — `src/dataset/rows.ts:43`
- `SnapshotSummary` — `src/dataset/snapshot.ts:44`
- `SourceExplorer` — `src/internal/source-files/types.ts:50`
- `SourceFileEntry` — `src/internal/source-files/types.ts:3`
- `SourceFileKind` — `src/internal/source-files/types.ts:1`
- `SourceFilePolicy` — `src/internal/source-files/types.ts:20`
- `SourceFileRow` — `src/dataset/rows.ts:250`
- `SourceFileRowInput` — `src/dataset/rows.ts:242`
- `SourceFileVersionRow` — `src/dataset/rows.ts:279`
- `SourceRange` — `src/extractor/types.ts:16`
- `SourceRef` — `src/contracts/diagnostics.ts:147`
- `SourceScanResult` — `src/internal/source-files/types.ts:9`
- `Span` — `src/internal/telemetry/index.ts:9`
- `SqlParam` — `src/dataset/sqlite-runtime.ts:34`
- `SqliteAdapter` — `src/internal/sqlite/types.ts:89`
- `SqliteCreateOptions` — `src/internal/sqlite/types.ts:25`
- `SqliteDatabase` — `src/internal/sqlite/types.ts:30`
- `SqliteFtsDefinition` — `src/internal/sqlite/types.ts:66`
- `SqliteFtsOptions` — `src/internal/sqlite/types.ts:73`
- `SqliteHealthOptions` — `src/internal/sqlite/types.ts:78`
- `SqliteHealthResult` — `src/internal/sqlite/types.ts:83`
- `SqliteMigration` — `src/internal/sqlite/types.ts:36`
- `SqliteMigrationResult` — `src/internal/sqlite/types.ts:48`
- `SqliteOpenOptions` — `src/internal/sqlite/types.ts:14`
- `SqlitePolicy` — `src/internal/sqlite/types.ts:1`
- `SqliteRunMigrationsOptions` — `src/internal/sqlite/types.ts:43`
- `SqliteTransactionOptions` — `src/internal/sqlite/types.ts:57`
- `StrictTemplate` — `src/render/engine.ts:58`
- `SymbolRow` — `src/dataset/rows.ts:320`
- `SymbolRowInput` — `src/dataset/rows.ts:307`
- `TELEMETRY_ATTRIBUTES` — `src/internal/app-paths/generated/app-paths-entities.ts:19`
- `TELEMETRY_ATTRIBUTES` — `src/internal/cli/generated/cli-entities.ts:22`
- `TELEMETRY_ATTRIBUTES` — `src/internal/process-runner/generated/process-runner-entities.ts:19`
- `TELEMETRY_ATTRIBUTES` — `src/internal/repo-inventory/generated/repo-inventory-entities.ts:20`
- `TELEMETRY_ATTRIBUTES` — `src/internal/security/generated/security-entities.ts:28`
- `TELEMETRY_ATTRIBUTES` — `src/internal/source-files/generated/source-files-entities.ts:20`
- `TELEMETRY_ATTRIBUTES` — `src/internal/sqlite/generated/sqlite-entities.ts:21`
- `TELEMETRY_METRICS` — `src/internal/process-runner/generated/process-runner-entities.ts:30`
- `TEMPLATE_PACK_MANIFEST_FILE` — `src/commands/check.ts:57`
- `TIER_RANK` — `src/search/rank.ts:24`
- `TemplateFile` — `src/contracts/template-pack.ts:63`
- `TemplateName` — `src/generate/packs.ts:15`
- `TemplatePackManifest` — `src/contracts/template-pack.ts:64`
- `ToProblemDetailsOptions` — `src/internal/errors/problem-details.ts:26`
- `Tracer` — `src/internal/telemetry/index.ts:17`
- `ValidateGeneratedDocResult` — `src/contracts/okf.ts:11`
- `WorkspaceInventory` — `src/internal/repo-inventory/types.ts:34`
- `WorkspaceKind` — `src/internal/repo-inventory/types.ts:2`
- `apiReferenceDtoSchema` — `src/projection/dto.ts:127`
- `appendLoadTimingEntry` — `src/commands/load.ts:542`
- `assertAppPathInside` — `src/internal/app-paths/create.ts:30`
- `assertDatasetIdentifiersSafe` — `src/dataset/schema.ts:89`
- `assertDatasetPathContained` — `src/dataset/open.ts:107`
- `assertNormalizedTimestamp` — `src/contracts/timestamp.ts:11`
- `assertOutboundUrlAllowed` — `src/internal/security/url.ts:106`
- `assertSafePath` — `src/internal/security/path.ts:96`
- `buildApiReferenceDto` — `src/projection/index.ts:239`
- `buildCitationId` — `src/dataset/ids.ts:320`
- `buildDiagnosticId` — `src/dataset/ids.ts:245`
- `buildDocument` — `src/generate/document.ts:159`
- `buildEvidenceId` — `src/dataset/ids.ts:224`
- `buildGeneratedDocId` — `src/dataset/ids.ts:279`
- `buildGeneratedSectionId` — `src/dataset/ids.ts:305`
- `buildHashedId` — `src/dataset/ids.ts:106`
- `buildIgnoreChecker` — `src/internal/source-files/ignore.ts:70`
- `buildPackageId` — `src/dataset/ids.ts:129`
- `buildPackageOverviewDto` — `src/projection/index.ts:190`
- `buildProcessEnv` — `src/internal/process-runner/policy.ts:508`
- `buildProjectId` — `src/dataset/ids.ts:120`
- `buildRunGenerateOptions` — `src/cli/generate-command.ts:96`
- `buildSearchDocId` — `src/dataset/ids.ts:264`
- `buildSearchFtsCreateStatement` — `src/dataset/schema.ts:105`
- `buildSignatureId` — `src/dataset/ids.ts:206`
- `buildSnapshotSummary` — `src/dataset/snapshot.ts:110`
- `buildSourceFileId` — `src/dataset/ids.ts:148`
- `buildSourceFileVersionId` — `src/dataset/ids.ts:166`
- `buildSymbolId` — `src/dataset/ids.ts:184`
- `checkCommandDefinition` — `src/cli/check-command.ts:105`
- `checkDataSchema` — `src/contracts/envelopes.ts:89`
- `checkDatabaseReadinessSchema` — `src/contracts/envelopes.ts:81`
- `checkEnvelopeSchema` — `src/contracts/envelopes.ts:98`
- `checkManagedDatabaseHealth` — `src/dataset/sqlite-runtime.ts:146`
- `checkPreflightCheckSchema` — `src/contracts/envelopes.ts:57`
- `checkSqliteHealth` — `src/internal/sqlite/health.ts:10`
- `checkTemplateReadinessSchema` — `src/contracts/envelopes.ts:66`
- `closeDataset` — `src/dataset/open.ts:191`
- `closeSqliteDatabase` — `src/internal/sqlite/database.ts:257`
- `commandEnvelopeSchemaVersions` — `src/contracts/envelopes.ts:297`
- `commandEnvelopeSchemas` — `src/contracts/envelopes.ts:290`
- `commitWritePlan` — `src/internal/source-files/write.ts:122`
- `compareCandidates` — `src/search/rank.ts:43`
- `compileStrict` — `src/render/engine.ts:65`
- `computeSnapshotId` — `src/dataset/snapshot.ts:91`
- `computeSnapshotIdentity` — `src/dataset/snapshot.ts:136`
- `conceptPathFor` — `src/generate/document.ts:217`
- `countRows` — `src/commands/load.ts:557`
- `createAppError` — `src/internal/errors/core.ts:168`
- `createAtomicWritePlan` — `src/internal/source-files/write.ts:59`
- `createCliOutput` — `src/internal/cli/output.ts:79`
- `createCliProgram` — `src/internal/cli/program.ts:475`
- `createDiagnostic` — `src/contracts/diagnostics.ts:160`
- `createDiagnosticCodeRegistry` — `src/contracts/diagnostics.ts:6`
- `createErrorRegistry` — `src/internal/errors/registry.ts:41`
- `createFtsTable` — `src/internal/sqlite/fts.ts:22`
- `createOutboundUrlPolicy` — `src/internal/security/url.ts:54`
- `createProcessRunner` — `src/internal/process-runner/runner.ts:181`
- `createRateLimitKey` — `src/internal/security/rate-limit.ts:9`
- `createRedactor` — `src/internal/security/redaction.ts:31`
- `createSafePathPolicy` — `src/internal/security/path.ts:27`
- `createSecurityAuditEvent` — `src/internal/security/audit.ts:46`
- `createSourceExplorer` — `src/internal/source-files/scan.ts:428`
- `createSqliteDatabase` — `src/internal/sqlite/database.ts:244`
- `createValidationDiagnostic` — `src/contracts/diagnostics.ts:164`
- `declaredTypeTextForUnannotatedExport` — `src/extractor/type-checker.ts:65`
- `defineCliCommand` — `src/internal/cli/program.ts:479`
- `defineCliCommandGroup` — `src/internal/cli/program.ts:486`
- `deriveProjectKey` — `src/commands/check.ts:640`
- `detectFileKind` — `src/internal/source-files/read.ts:38`
- `detectIdCollisions` — `src/dataset/ids.ts:359`
- `detectPackageManager` — `src/internal/repo-inventory/package-manager.ts:14`
- `determinismInputsSchema` — `src/contracts/envelopes.ts:261`
- `diagnosticCodeSchema` — `src/contracts/diagnostics.ts:86`
- `diagnosticSchema` — `src/contracts/diagnostics.ts:136`
- `diagnosticSeveritySchema` — `src/contracts/diagnostics.ts:90`
- `discoverRepository` — `src/internal/repo-inventory/repo.ts:30`
- `discoverWorkspace` — `src/internal/repo-inventory/workspace.ts:114`
- `endSpanError` — `src/internal/sqlite/database.ts:197`
- `endSpanOk` — `src/internal/sqlite/database.ts:191`
- `ensureAppPath` — `src/internal/app-paths/create.ts:7`
- `envelopeMetaSchema` — `src/contracts/envelopes.ts:32`
- `executableLabel` — `src/internal/process-runner/policy.ts:536`
- `executeCheckCommand` — `src/cli/check-command.ts:138`
- `executeGenerateCommand` — `src/cli/generate-command.ts:130`
- `executeLoadCommand` — `src/cli/load-command.ts:101`
- `executeSearch` — `src/search/execute.ts:212`
- `executeSearchCommand` — `src/cli/search-command.ts:149`
- `extractPackageFacts` — `src/extractor/extract.ts:344`
- `findTsconfigFiles` — `src/internal/repo-inventory/tsconfig.ts:15`
- `fixtureRegistry` — `src/contracts/fixtures.ts:26`
- `generateDataSchema` — `src/contracts/envelopes.ts:270`
- `generateEnvelopeSchema` — `src/contracts/envelopes.ts:282`
- `generationManifestSchema` — `src/contracts/envelopes.ts:252`
- `getCacheDir` — `src/internal/app-paths/resolve.ts:174`
- `getCliExitCodeForError` — `src/internal/errors/registry.ts:56`
- `getConfigDir` — `src/internal/app-paths/resolve.ts:170`
- `getDataDir` — `src/internal/app-paths/resolve.ts:178`
- `getHandle` — `src/internal/sqlite/database.ts:24`
- `getHttpStatusForError` — `src/internal/errors/registry.ts:50`
- `getLogDir` — `src/internal/app-paths/resolve.ts:186`
- `getMeter` — `src/internal/telemetry/index.ts:63`
- `getStateDir` — `src/internal/app-paths/resolve.ts:182`
- `getTempDir` — `src/internal/app-paths/resolve.ts:190`
- `getTracer` — `src/internal/telemetry/index.ts:59`
- `hashFileContent` — `src/internal/source-files/hash.ts:15`
- `headingSlug` — `src/generate/helpers.ts:17`
- `indexSearchDocument` — `src/dataset/rows.ts:540`
- `initMigration` — `src/dataset/migrations/001-init.ts:156`
- `insertDiagnostic` — `src/dataset/rows.ts:452`
- `insertEvidence` — `src/dataset/rows.ts:406`
- `insertGeneratedDoc` — `src/dataset/rows.ts:561`
- `insertLoadRun` — `src/dataset/rows.ts:104`
- `insertPackage` — `src/dataset/rows.ts:153`
- `insertPackageDependency` — `src/dataset/rows.ts:218`
- `insertPackageExport` — `src/dataset/rows.ts:185`
- `insertProject` — `src/dataset/rows.ts:33`
- `insertSearchDocument` — `src/dataset/rows.ts:507`
- `insertSignature` — `src/dataset/rows.ts:380`
- `insertSnapshot` — `src/dataset/rows.ts:61`
- `insertSourceFile` — `src/dataset/rows.ts:258`
- `insertSourceFileVersion` — `src/dataset/rows.ts:285`
- `insertSymbol` — `src/dataset/rows.ts:337`
- `isAppError` — `src/internal/errors/core.ts:164`
- `isExecutableAllowed` — `src/internal/process-runner/policy.ts:467`
- `isPathInside` — `src/internal/security/path.ts:45`
- `isRetryableError` — `src/internal/errors/registry.ts:83`
- `kindOrder` — `src/search/rank.ts:26`
- `loadCommandDefinition` — `src/cli/load-command.ts:75`
- `loadCountsSchema` — `src/contracts/envelopes.ts:128`
- `loadDataSchema` — `src/contracts/envelopes.ts:151`
- `loadEnvelopeSchema` — `src/contracts/envelopes.ts:164`
- `loadGitignorePatterns` — `src/internal/source-files/ignore.ts:105`
- `loadPack` — `src/generate/packs.ts:24`
- `managedAll` — `src/dataset/sqlite-runtime.ts:281`
- `managedGet` — `src/dataset/sqlite-runtime.ts:271`
- `managedRun` — `src/dataset/sqlite-runtime.ts:260`
- `mapErrorToExitCode` — `src/internal/cli/exit.ts:3`
- `normalizeAppError` — `src/internal/errors/core.ts:175`
- `normalizeMarkdown` — `src/generate/helpers.ts:33`
- `normalizeQuery` — `src/search/query.ts:37`
- `normalizeRepoRelativePath` — `src/dataset/ids.ts:71`
- `normalizedTimestampForFixture` — `src/contracts/timestamp.ts:19`
- `normalizedTimestampFromSnapshot` — `src/contracts/timestamp.ts:15`
- `normalizedTimestampSchema` — `src/contracts/timestamp.ts:5`
- `openDataset` — `src/dataset/open.ts:151`
- `openManagedDatabase` — `src/dataset/sqlite-runtime.ts:92`
- `openSqliteDatabase` — `src/internal/sqlite/database.ts:205`
- `packageOverviewDtoSchema` — `src/projection/dto.ts:114`
- `packageSlug` — `src/generate/helpers.ts:23`
- `parseCheckArgs` — `src/cli/check-command.ts:86`
- `parseCheckEnvelope` — `src/contracts/envelopes.ts:344`
- `parseGenerateArgs` — `src/cli/generate-command.ts:77`
- `parseGenerateEnvelope` — `src/contracts/envelopes.ts:356`
- `parseGlobalCliOptions` — `src/internal/cli/program.ts:493`
- `parseLoadArgs` — `src/cli/load-command.ts:52`
- `parseLoadEnvelope` — `src/contracts/envelopes.ts:348`
- `parsePnpmWorkspaceYaml` — `src/internal/repo-inventory/workspace.ts:20`
- `parseSearchArgs` — `src/cli/search-command.ts:72`
- `parseSearchEnvelope` — `src/contracts/envelopes.ts:352`
- `projectAllowedKeys` — `src/internal/security/serialization.ts:1`
- `projectDirKey` — `src/dataset/open.ts:87`
- `rankValue` — `src/search/rank.ts:31`
- `readBoundedTextFile` — `src/internal/source-files/read.ts:89`
- `readPackageManifest` — `src/internal/repo-inventory/manifest.ts:45`
- `redactObject` — `src/internal/security/redaction.ts:74`
- `redactProcessResult` — `src/internal/process-runner/redact.ts:8`
- `redactText` — `src/extractor/sanitize.ts:41`
- `redactValue` — `src/internal/security/redaction.ts:39`
- `resolveAppPath` — `src/internal/app-paths/resolve.ts:166`
- `resolveAppPaths` — `src/internal/app-paths/resolve.ts:135`
- `resolveDatasetPaths` — `src/dataset/open.ts:124`
- `resolveExplicitReexport` — `src/extractor/type-checker.ts:34`
- `resolveSafePath` — `src/internal/security/path.ts:75`
- `runCheck` — `src/commands/check.ts:649`
- `runCliCommand` — `src/internal/cli/program.ts:326`
- `runGenerate` — `src/commands/generate.ts:102`
- `runLoad` — `src/commands/load.ts:487`
- `runManagedMigrations` — `src/dataset/sqlite-runtime.ts:170`
- `runMigrations` — `src/internal/sqlite/migrations.ts:35`
- `runProcess` — `src/internal/process-runner/runner.ts:142`
- `runProcessJson` — `src/internal/process-runner/runner.ts:151`
- `runSearch` — `src/commands/search.ts:71`
- `safeDetailSchema` — `src/contracts/diagnostics.ts:134`
- `safePositiveInt` — `src/internal/repo-inventory/utils.ts:4`
- `sanitizeBaseType` — `src/internal/errors/sanitize.ts:81`
- `sanitizeClientDetail` — `src/internal/errors/sanitize.ts:58`
- `sanitizeCode` — `src/internal/errors/sanitize.ts:31`
- `sanitizeDiagnosticText` — `src/internal/security/log-sanitization.ts:35`
- `sanitizeEvidenceText` — `src/extractor/sanitize.ts:59`
- `sanitizeFieldViolations` — `src/internal/errors/sanitize.ts:116`
- `sanitizeHeaderValue` — `src/internal/security/log-sanitization.ts:25`
- `sanitizeHttpStatus` — `src/internal/errors/sanitize.ts:39`
- `sanitizeLogValue` — `src/internal/security/log-sanitization.ts:17`
- `sanitizeSignatureText` — `src/extractor/sanitize.ts:49`
- `sanitizeTitle` — `src/internal/errors/sanitize.ts:49`
- `sanitizeTraceId` — `src/internal/errors/sanitize.ts:69`
- `scanSourceFiles` — `src/internal/source-files/scan.ts:414`
- `searchCommandDefinition` — `src/cli/search-command.ts:124`
- `searchDataSchema` — `src/contracts/envelopes.ts:200`
- `searchEnvelopeSchema` — `src/contracts/envelopes.ts:210`
- `searchIndexStatusSchema` — `src/contracts/envelopes.ts:143`
- `searchMatchPolicySchema` — `src/contracts/envelopes.ts:193`
- `searchResultSchema` — `src/contracts/envelopes.ts:182`
- `selectDiagnostic` — `src/dataset/rows.ts:472`
- `selectEvidence` — `src/dataset/rows.ts:414`
- `selectGeneratedDoc` — `src/dataset/rows.ts:578`
- `selectLoadRun` — `src/dataset/rows.ts:122`
- `selectPackage` — `src/dataset/rows.ts:162`
- `selectPackageDependencies` — `src/dataset/rows.ts:227`
- `selectPackageExports` — `src/dataset/rows.ts:193`
- `selectProject` — `src/dataset/rows.ts:37`
- `selectSearchDocument` — `src/dataset/rows.ts:525`
- `selectSignature` — `src/dataset/rows.ts:388`
- `selectSnapshot` — `src/dataset/rows.ts:70`
- `selectSourceFile` — `src/dataset/rows.ts:267`
- `selectSourceFileVersion` — `src/dataset/rows.ts:293`
- `selectSymbol` — `src/dataset/rows.ts:357`
- `slugify` — `src/generate/helpers.ts:8`
- `snapshotAndValidateProcessCommand` — `src/internal/process-runner/policy.ts:290`
- `snapshotAndValidateProcessRunnerPolicy` — `src/internal/process-runner/policy.ts:145`
- `sourceRefSchema` — `src/contracts/diagnostics.ts:108`
- `spawnProcess` — `src/internal/process-runner/spawn.ts:59`
- `splitIdentifier` — `src/extractor/identifier.ts:25`
- `startSpan` — `src/internal/sqlite/database.ts:181`
- `summarizeGitState` — `src/internal/repo-inventory/git.ts:40`
- `summarizeTimings` — `src/commands/load.ts:524`
- `templateFileSchema` — `src/contracts/template-pack.ts:23`
- `templatePackManifestSchema` — `src/contracts/template-pack.ts:52`
- `toProblemDetails` — `src/internal/errors/problem-details.ts:34`
- `toSafeError` — `src/internal/errors/problem-details.ts:81`
- `truncateHash` — `src/dataset/ids.ts:94`
- `validateAppName` — `src/internal/app-paths/names.ts:26`
- `validateCommandEnv` — `src/internal/process-runner/policy.ts:485`
- `validateGeneratedDoc` — `src/contracts/okf.ts:151`
- `validateIdentifier` — `src/internal/sqlite/fts.ts:11`
- `validateOutboundUrl` — `src/internal/security/url.ts:65`
- `validatePolicy` — `src/internal/sqlite/database.ts:135`
- `validateProcessCommand` — `src/internal/process-runner/policy.ts:503`
- `validateProcessRunnerPolicy` — `src/internal/process-runner/policy.ts:281`
- `validateProfileName` — `src/internal/app-paths/names.ts:39`
- `validateSourceFilePolicy` — `src/internal/source-files/scan.ts:208`
- `validateWritePlan` — `src/internal/source-files/write.ts:78`
- `withDatasetTransaction` — `src/dataset/open.ts:196`
- `withErrorCause` — `src/internal/errors/core.ts:187`
- `withManagedTransaction` — `src/dataset/sqlite-runtime.ts:238`
- `withTransaction` — `src/internal/sqlite/transaction.ts:22`
- `writeCliResult` — `src/internal/cli/output.ts:83`

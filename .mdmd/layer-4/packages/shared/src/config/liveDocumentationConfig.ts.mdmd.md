# packages/shared/src/config/liveDocumentationConfig.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/config/liveDocumentationConfig.ts
- Live Doc ID: LD-implementation-packages-shared-src-config-livedocumentationconfig-ts
- Generated At: 2026-01-15T17:52:14.588Z

## Authored
### Purpose
Centralizes Live Documentation defaults—root, base layer, slug dialect, evidence strictness—so the generator, lint, and CLI flows share one configuration contract, as hardened during the Live Docs pipeline work in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760).

### Notes
Default globs now cover scripts and cross-language test fixtures so Live Docs remain authoritative for integration workspaces (e.g., the LD-402 queue-worker Hangfire scenario). Keep the follow-up plan in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310) handy—the same switches will power future `.mdmd` mirroring and CLI overrides.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T17:52:14.588Z","inputHash":"e9db7239f809877c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocumentationSlugDialect` {#symbol-livedocumentationslugdialect}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L3)

#### `LiveDocumentationArchetype` {#symbol-livedocumentationarchetype}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L5)

#### `LiveDocumentationEvidenceStrictMode` {#symbol-livedocumentationevidencestrictmode}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L17)

#### `LiveDocumentationEvidenceConfig` {#symbol-livedocumentationevidenceconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L19)

#### `LiveDocumentationConfig` {#symbol-livedocumentationconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L23)

#### `LiveDocumentationConfigInput` {#symbol-livedocumentationconfiginput}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L44)

#### `LIVE_DOCUMENTATION_DEFAULT_ROOT` {#symbol-live_documentation_default_root}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L52)

#### `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` {#symbol-live_documentation_default_base_layer}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L53)

#### `LIVE_DOCUMENTATION_FILE_EXTENSION` {#symbol-live_documentation_file_extension}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L54)

#### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` {#symbol-live_documentation_default_globs}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L55)

#### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` {#symbol-default_live_documentation_config}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L127)
- Returns: [`LiveDocumentationConfig`](#symbol-livedocumentationconfig)

#### `normalizeLiveDocumentationConfig` {#symbol-normalizelivedocumentationconfig}
- Type: function
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L141)
- Returns: [`LiveDocumentationConfig`](#symbol-livedocumentationconfig)
- Parameters: `input`: [`LiveDocumentationConfigInput`](#symbol-livedocumentationconfiginput)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [liveDocumentationConfig.test.ts](./liveDocumentationConfig.test.ts.mdmd.md)
- [coActivation.test.ts](../live-docs/analysis/coActivation.test.ts.mdmd.md)
- [core.docstring.test.ts](../live-docs/core.docstring.test.ts.mdmd.md)
- [generator.test.ts](../live-docs/generator.test.ts.mdmd.md)
- [schema.test.ts](../live-docs/schema.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

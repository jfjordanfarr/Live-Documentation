# packages/shared/src/config/liveDocumentationConfig.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/config/liveDocumentationConfig.ts
- Live Doc ID: LD-implementation-packages-shared-src-config-livedocumentationconfig-ts
- Generated At: 2026-02-16T03:54:28.228Z

## Authored
### Purpose
Centralizes Live Documentation defaults—root, base layer, slug dialect, evidence strictness—so the generator, lint, and CLI flows share one configuration contract, as hardened during the Live Docs pipeline work in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760).

### Notes
Default globs now cover scripts and cross-language test fixtures so Live Docs remain authoritative for integration workspaces (e.g., the LD-402 queue-worker Hangfire scenario). Keep the follow-up plan in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310) handy—the same switches will power future `.mdmd` mirroring and CLI overrides.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T03:54:28.228Z","inputHash":"f319a0e465aecfe1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocumentationSlugDialect` {#symbol-livedocumentationslugdialect}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L11)

##### `LiveDocumentationSlugDialect` — Summary
Dialect used to generate header-anchor slugs in Live Doc markdown.

Each platform slugifies `## Heading Text` differently (e.g. GitHub lowercases
and strips punctuation, Azure DevOps preserves casing). The chosen dialect
controls how `{#symbol-...}` anchors are produced so that cross-references
resolve correctly on the target hosting platform.

#### `LiveDocumentationArchetype` {#symbol-livedocumentationarchetype}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L21)

##### `LiveDocumentationArchetype` — Summary
Classifies a tracked workspace artifact into a structural role.

Archetypes drive how the Live Doc generator emits metadata sections
(e.g. `test` files get an "Observed Evidence" section, `asset` files
get a stub-only doc). The generator infers archetypes from path patterns
but consumers can force a value via {@link LiveDocumentationConfig.archetypeOverrides}.

#### `LiveDocumentationEvidenceStrictMode` {#symbol-livedocumentationevidencestrictmode}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L41)

##### `LiveDocumentationEvidenceStrictMode` — Summary
Controls lint severity when a non-test file lacks observed evidence
(coverage manifests, waivers, or fixture references).

- `"off"` — no diagnostic emitted.
- `"warning"` — lint emits a warning (default).
- `"error"` — lint treats missing evidence as a hard failure.

#### `LiveDocumentationEvidenceConfig` {#symbol-livedocumentationevidenceconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L47)

##### `LiveDocumentationEvidenceConfig` — Summary
Evidence-related settings that control how the Live Docs lint pipeline
reports missing test coverage or waivers on implementation files.

#### `LiveDocumentationConfig` {#symbol-livedocumentationconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L62)

##### `LiveDocumentationConfig` — Summary
Complete, resolved configuration for the Live Documentation pipeline.

Every CLI command, generator pass, lint rule, and explorer view reads from
this shape. Obtain an instance via {@link normalizeLiveDocumentationConfig}
which fills missing fields from {@link DEFAULT_LIVE_DOCUMENTATION_CONFIG}.

This interface is the single source of truth for how the pipeline maps
workspace source artifacts to their `.mdmd.md` mirror files, which slug
dialect to use, and how strictly evidence is enforced.

#### `LiveDocumentationConfigInput` {#symbol-livedocumentationconfiginput}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L90)

##### `LiveDocumentationConfigInput` — Summary
Partial input shape accepted by {@link normalizeLiveDocumentationConfig}.

Consumers (CLI flags, `.live-docs.config.json`) provide only the fields they
want to override; everything else falls back to
{@link DEFAULT_LIVE_DOCUMENTATION_CONFIG}.

#### `LIVE_DOCUMENTATION_DEFAULT_ROOT` {#symbol-live_documentation_default_root}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L99)

##### `LIVE_DOCUMENTATION_DEFAULT_ROOT` — Summary
Default root directory for the Live Docs mirror (`".live-documentation"`).

#### `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` {#symbol-live_documentation_default_base_layer}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L101)

##### `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` — Summary
Default base-layer subdirectory within the root (`"source"`).

#### `LIVE_DOCUMENTATION_FILE_EXTENSION` {#symbol-live_documentation_file_extension}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L103)

##### `LIVE_DOCUMENTATION_FILE_EXTENSION` — Summary
Default file extension for generated Live Doc files (`".md"`).

#### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` {#symbol-live_documentation_default_globs}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L111)

##### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` — Summary
Default glob patterns selecting workspace artifacts that receive Live Docs.

Covers TypeScript, JavaScript, PowerShell, C#/.NET view files, Python, Java,
Ruby, Rust, C/C++, Go, HTML/CSS, JSON, and static assets (images, fonts,
media). Static assets receive stub-only Live Docs for graph connectivity.

#### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` {#symbol-default_live_documentation_config}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L191)
- Returns: [`LiveDocumentationConfig`](#symbol-livedocumentationconfig)

##### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` — Summary
Fully-resolved default configuration used when no `.live-docs.config.json`
is present or when individual fields are omitted from the input.

This workspace typically overrides `root`, `baseLayer`, and `extension` to
`".mdmd"`, `"layer-4"`, and `".mdmd.md"` respectively via its repo-local
config file.

#### `normalizeLiveDocumentationConfig` {#symbol-normalizelivedocumentationconfig}
- Type: function
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L217)
- Returns: [`LiveDocumentationConfig`](#symbol-livedocumentationconfig)
- Parameters: `input`: [`LiveDocumentationConfigInput`](#symbol-livedocumentationconfiginput)

##### `normalizeLiveDocumentationConfig` — Summary
Merges a partial config input with {@link DEFAULT_LIVE_DOCUMENTATION_CONFIG},
producing a fully-resolved {@link LiveDocumentationConfig}.

Handles edge cases: blank strings fall back to defaults, globs are deduped,
and file extensions are normalized to start with `"."`. This is the canonical
entry point for every CLI and server path that needs a config object.

##### `normalizeLiveDocumentationConfig` — Parameters
- `input`: Partial overrides, typically parsed from `.live-docs.config.json`
or CLI flags. When `undefined`, returns the default config unchanged.

##### `normalizeLiveDocumentationConfig` — Returns
A complete, immutable configuration ready for pipeline consumption.
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

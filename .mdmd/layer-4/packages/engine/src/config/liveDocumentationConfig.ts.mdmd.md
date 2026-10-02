# packages/engine/src/config/liveDocumentationConfig.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/config/liveDocumentationConfig.ts
- Generated At: 2026-10-02T20:19:59.302Z

## Authored
### Purpose
Centralizes Live Documentation defaults—root, base layer, slug dialect—so the generator, lint, and CLI flows share one configuration contract, as hardened during the Live Docs pipeline work in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760).

### Notes
Default globs now cover scripts and cross-language test fixtures so Live Docs remain authoritative for integration workspaces (e.g., the LD-402 queue-worker Hangfire scenario). Keep the follow-up plan in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310) handy—the same switches will power future `.mdmd` mirroring and CLI overrides.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocumentationSlugDialect` {#symbol-livedocumentationslugdialect}
- Type: type
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L11)

##### `LiveDocumentationSlugDialect` — Summary
Dialect used to generate header-anchor slugs in Live Doc markdown.

Each platform slugifies `## Heading Text` differently (e.g. GitHub lowercases
and strips punctuation, Azure DevOps preserves casing). The chosen dialect
controls how `{#symbol-...}` anchors are produced so that cross-references
resolve correctly on the target hosting platform.

#### `LiveDocumentationArchetype` {#symbol-livedocumentationarchetype}
- Type: type
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L20)

##### `LiveDocumentationArchetype` — Summary
Classifies a tracked workspace artifact into a structural role.

The archetype is recorded in each Live Doc's metadata. The generator infers
it from path patterns, and consumers can force a value via
{@link LiveDocumentationConfig.archetypeOverrides}.

#### `LiveDocumentationConfig` {#symbol-livedocumentationconfig}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L43)

##### `LiveDocumentationConfig` — Summary
Complete, resolved configuration for the Live Documentation pipeline.

Every CLI command, generator pass, lint rule, and explorer view reads from
this shape. Obtain an instance via {@link normalizeLiveDocumentationConfig}
which fills missing fields from {@link DEFAULT_LIVE_DOCUMENTATION_CONFIG}.

This interface is the single source of truth for how the pipeline maps
workspace source artifacts to their Live Doc mirror files and which slug
dialect to use.

#### `LiveDocumentationConfigInput` {#symbol-livedocumentationconfiginput}
- Type: type
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L75)

##### `LiveDocumentationConfigInput` — Summary
Partial input shape accepted by {@link normalizeLiveDocumentationConfig}.

Consumers (CLI flags, `.live-docs.config.json`) provide only the fields they
want to override; everything else falls back to
{@link DEFAULT_LIVE_DOCUMENTATION_CONFIG}.

#### `LIVE_DOCUMENTATION_DEFAULT_ROOT` {#symbol-live_documentation_default_root}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L82)

##### `LIVE_DOCUMENTATION_DEFAULT_ROOT` — Summary
Default root directory for the Live Docs mirror (`".live-documentation"`).

#### `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` {#symbol-live_documentation_default_base_layer}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L84)

##### `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` — Summary
Default base-layer subdirectory within the root (`"source"`).

#### `LIVE_DOCUMENTATION_FILE_EXTENSION` {#symbol-live_documentation_file_extension}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L86)

##### `LIVE_DOCUMENTATION_FILE_EXTENSION` — Summary
Default file extension for generated Live Doc files (`".md"`).

#### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` {#symbol-live_documentation_default_globs}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L95)

##### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` — Summary
Default glob patterns selecting workspace artifacts that receive Live Docs.

Covers TypeScript, JavaScript, PowerShell, C#/.NET view files, Python, Java,
Ruby, Rust, C/C++, Go, HTML/CSS, JSON, SQL scripts, .NET project files, npm
package manifests, and static assets (images, fonts, media). Static assets
receive stub-only Live Docs for graph connectivity.

#### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` {#symbol-default_live_documentation_config}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L185)
- Returns: [`LiveDocumentationConfig`](#symbol-livedocumentationconfig)

##### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` — Summary
Fully-resolved default configuration used when no `.live-docs.config.json`
is present or when individual fields are omitted from the input.

This workspace typically overrides `root`, `baseLayer`, and `extension` to
`".mdmd"`, `"layer-4"`, and `".mdmd.md"` respectively via its repo-local
config file.

#### `normalizeLiveDocumentationConfig` {#symbol-normalizelivedocumentationconfig}
- Type: function
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L209)
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

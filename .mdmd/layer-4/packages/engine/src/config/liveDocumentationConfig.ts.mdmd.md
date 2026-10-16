# packages/engine/src/config/liveDocumentationConfig.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/config/liveDocumentationConfig.ts
- Generated At: 2026-10-16T16:21:39.534Z

## Authored
### Purpose
Centralizes Live Documentation defaults—root, base layer, slug dialect—so the generator, lint, and CLI flows share one configuration contract, as hardened during the Live Docs pipeline work in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760).

### Notes
Default globs now cover scripts and cross-language test fixtures so Live Docs remain authoritative for integration workspaces (e.g., the LD-402 queue-worker Hangfire scenario). Keep the follow-up plan in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310) handy—the same switches will power future `.mdmd` mirroring and CLI overrides.

- `entryPoints` (2026-10-15, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)): workspace-relative paths or globs of files declared as entry points, for what no rule infers, such as a bundler's entry named by a path string in code or a stylesheet a template links; each matching file's doc carries `- Entry: declared`. This repository declares the Explorer client's `index.ts` and `styles.css`.
- The shipped default globs are every file an adapter or the TypeScript parser can read, and every static asset, anywhere in the workspace (`**/*<ext>` from `LIVE_DOCUMENTATION_SOURCE_EXTENSIONS` and `LIVE_DOCUMENTATION_ASSET_EXTENSIONS`, and `**/<name>` from `LIVE_DOCUMENTATION_SOURCE_FILE_NAMES` for the manifests an adapter reads by name, `Cargo.toml`, `go.mod`, `pom.xml` and `pyproject.toml`, so that no other TOML or XML file is discovered by default; since 2026-10-16, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#c-and-c-read-by-the-grammar-the-include-rule-chosen-by-measurement-and-discovery-that-reads-every-suffix-anywhere-recorded-2026-10-16)). The eighty path-shaped patterns they replaced were this repository's own layout, which is why a cold run over another shape matched 49 of 1,842 files; `adapters/index.test.ts` holds every adapter's extensions to the list, so a new adapter without a default glob fails a test. Assets are a project's content, documented wherever they are found (the owner, 2026-10-15).
- `exclude` (2026-10-16): workspace-relative paths or globs discovery skips, a folder that documents itself or a vendored tree the `.gitignore` does not cover, normalized as `entryPoints` is; this repository excludes `AI-Agent-Workspace/**`, its development record.

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
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L90)

##### `LiveDocumentationConfigInput` — Summary
Partial input shape accepted by {@link normalizeLiveDocumentationConfig}.

Consumers (CLI flags, `.live-docs.config.json`) provide only the fields they
want to override; everything else falls back to
{@link DEFAULT_LIVE_DOCUMENTATION_CONFIG}.

#### `LIVE_DOCUMENTATION_DEFAULT_ROOT` {#symbol-live_documentation_default_root}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L97)

##### `LIVE_DOCUMENTATION_DEFAULT_ROOT` — Summary
Default root directory for the Live Docs mirror (`".live-documentation"`).

#### `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` {#symbol-live_documentation_default_base_layer}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L99)

##### `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` — Summary
Default base-layer subdirectory within the root (`"source"`).

#### `LIVE_DOCUMENTATION_FILE_EXTENSION` {#symbol-live_documentation_file_extension}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L101)

##### `LIVE_DOCUMENTATION_FILE_EXTENSION` — Summary
Default file extension for generated Live Doc files (`".md"`).

#### `LIVE_DOCUMENTATION_SOURCE_EXTENSIONS` {#symbol-live_documentation_source_extensions}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L108)

##### `LIVE_DOCUMENTATION_SOURCE_EXTENSIONS` — Summary
The extensions of every file the generator can read: the scripts the
built-in TypeScript parser reads, then each language adapter's files. Every
adapter's extensions are here, a test holds the registry to it, and each has
a default glob.

#### `LIVE_DOCUMENTATION_SOURCE_FILE_NAMES` {#symbol-live_documentation_source_file_names}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L136)

##### `LIVE_DOCUMENTATION_SOURCE_FILE_NAMES` — Summary
The names of the files an adapter reads by name rather than by extension:
the package manifests whose extension (`.toml`, `.xml`, `.mod`) is shared by
files that are not manifests. Each has a default glob for that name alone,
so that no other TOML or XML file of a workspace is discovered by default.
A test holds the registry's file names to this list.

#### `LIVE_DOCUMENTATION_ASSET_EXTENSIONS` {#symbol-live_documentation_asset_extensions}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L144)

##### `LIVE_DOCUMENTATION_ASSET_EXTENSIONS` — Summary
The extensions of the static assets, images, fonts and media, that receive stub Live Docs so that the graph reaches them.

#### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` {#symbol-live_documentation_default_globs}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L162)

##### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` — Summary
Default glob patterns selecting the workspace files that receive Live Docs:
every file an adapter or the TypeScript parser can read, by its extension
or, for a manifest, by its name, and every static asset, anywhere in the
workspace, so that a cold run over any repository is
honest about what it holds. Assets are a project's content and are
documented wherever they are found (the owner's decision, 2026-10-15).
Discovery removes what no project wants documented, `.git`, `node_modules`,
the docs root, lock files and what `.gitignore` ignores, and what the
configuration's `exclude` names. A repository that wants a narrower set
names its own globs.

#### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` {#symbol-default_live_documentation_config}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L176)
- Returns: [`LiveDocumentationConfig`](#symbol-livedocumentationconfig)

##### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` — Summary
Fully-resolved default configuration used when no `.live-docs.config.json`
is present or when individual fields are omitted from the input.

This workspace typically overrides `root`, `baseLayer`, and `extension` to
`".mdmd"`, `"layer-4"`, and `".mdmd.md"` respectively via its repo-local
config file.

#### `normalizeLiveDocumentationConfig` {#symbol-normalizelivedocumentationconfig}
- Type: function
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L202)
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

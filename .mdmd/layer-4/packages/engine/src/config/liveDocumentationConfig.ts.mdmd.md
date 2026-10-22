# packages/engine/src/config/liveDocumentationConfig.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/config/liveDocumentationConfig.ts
- Generated At: 2026-10-22T00:54:15.384Z

## Authored
### Purpose
Centralizes Live Documentation defaults—root, base layer, slug dialect—so the generator, lint, and CLI flows share one configuration contract, as hardened during the Live Docs pipeline work in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760).

### Notes
- `entryPoints` (2026-10-15, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)): workspace-relative paths or globs of files declared as entry points, for what no rule infers, such as a bundler's entry named by a path string in code or a stylesheet a template links; each matching file's doc carries `- Entry: declared`. This repository declares the Explorer client's `index.ts` and `styles.css`.
- The shipped default glob is every file, `**/*` (since 2026-10-22, [Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)): a file carries authorial intent or wiring whether or not a reader understands it, and discovery's own rules alone say what is never documented. From 2026-10-16 it had been every file an adapter or the TypeScript parser can read and every static asset (`**/*<ext>` from the lists, `**/<name>` for the manifests read by name), which replaced eighty path-shaped patterns that were this repository's own layout, the reason a cold run over another shape had matched 49 of 1,842 files ([the decision](../../../../../layer-3/architectural-decisions.mdmd.md#c-and-c-read-by-the-grammar-the-include-rule-chosen-by-measurement-and-discovery-that-reads-every-suffix-anywhere-recorded-2026-10-16)). The lists now say which files a reader handles: `hasReader` by extension, or by exact name for `Cargo.toml`, `go.mod`, `pom.xml` and `pyproject.toml`, so that no other TOML or XML file counts as read; `isMediaAsset` for images, fonts and recordings, which hold nothing to read; and `noReaderHandles` for the rest, whose new doc starts with a note in its authored block and which a walk along dependencies lists as not read rather than unreachable. `adapters/index.test.ts` holds every adapter's extensions and names to the lists, so a new adapter's files are not taken for unread ones. Assets are a project's content, documented wherever they are found (the owner, 2026-10-15).
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
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L109)

##### `LIVE_DOCUMENTATION_SOURCE_EXTENSIONS` — Summary
The extensions of every file the generator can read: the scripts the
built-in TypeScript parser reads, then each language adapter's files. Every
adapter's extensions are here, and a test holds the registry to it. Any
other file is documented too, but by a doc whose generated sections are
empty because nothing reads it ({@link hasReader}).

#### `LIVE_DOCUMENTATION_SOURCE_FILE_NAMES` {#symbol-live_documentation_source_file_names}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L136)

##### `LIVE_DOCUMENTATION_SOURCE_FILE_NAMES` — Summary
The names of the files an adapter reads by name rather than by extension:
the package manifests whose extension (`.toml`, `.xml`, `.mod`) is shared by
files that are not manifests, which no reader reads. A test holds the
registry's file names to this list.

#### `LIVE_DOCUMENTATION_ASSET_EXTENSIONS` {#symbol-live_documentation_asset_extensions}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L148)

##### `LIVE_DOCUMENTATION_ASSET_EXTENSIONS` — Summary
The extensions of the static assets, images, fonts and media: files with
nothing in them for a reader to find, so that the empty generated sections
of their docs are the whole truth and need no note saying otherwise.

#### `hasReader` {#symbol-hasreader}
- Type: function
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L163)

##### `hasReader` — Summary
True when the TypeScript parser or a language adapter reads the file, by
its name or its extension. A file no reader handles still gets a doc, and
that doc starts with a note in its authored block saying why its generated
sections are empty, unless it is an image, a font or a recording
({@link LIVE_DOCUMENTATION_ASSET_EXTENSIONS}), which has nothing to read.

##### `hasReader` — Parameters
- `relativePath`: Workspace-relative path with forward slashes.

#### `isMediaAsset` {#symbol-ismediaasset}
- Type: function
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L171)

##### `isMediaAsset` — Summary
True for an image, a font or a recording, by its extension: a file with nothing for a reader to find.

#### `noReaderHandles` {#symbol-noreaderhandles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L186)

##### `noReaderHandles` — Summary
True for a file no reader handles that could hold what a reader finds: not
read by its name or its extension ({@link hasReader}), and not an image, a
font or a recording ({@link isMediaAsset}). Its doc starts with a note
saying so, and a walk along dependencies lists it as not read rather than
unreachable, since the wires out of it and into it are unknown.

##### `noReaderHandles` — Parameters
- `relativePath`: Workspace-relative path with forward slashes.

#### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` {#symbol-live_documentation_default_globs}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L202)

##### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` — Summary
The default glob: every file, anywhere in the workspace, hidden ones
included, so that a cold run over any repository is honest about what it
holds. A file carries authorial intent or wiring whether or not a reader
understands it yet: "Is there authorial decisionmaking to convey here? If
so, there should be a live documentation file for it." (the owner,
2026-10-15). Discovery then removes the kinds of file that never get a doc
(`.git`, `node_modules`, the docs root, lock files and documents, which the
Explorer shows as linked documentation; the owner's list, 2026-10-22), what
git ignores, and what the configuration's `exclude` names. A repository
that wants a narrower set names its own globs.

#### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` {#symbol-default_live_documentation_config}
- Type: const
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L212)
- Returns: [`LiveDocumentationConfig`](#symbol-livedocumentationconfig)

##### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` — Summary
Fully-resolved default configuration used when no `.live-docs.config.json`
is present or when individual fields are omitted from the input.

This workspace typically overrides `root`, `baseLayer`, and `extension` to
`".mdmd"`, `"layer-4"`, and `".mdmd.md"` respectively via its repo-local
config file.

#### `normalizeLiveDocumentationConfig` {#symbol-normalizelivedocumentationconfig}
- Type: function
- Source: [source](../../../../../../packages/engine/src/config/liveDocumentationConfig.ts#L238)
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

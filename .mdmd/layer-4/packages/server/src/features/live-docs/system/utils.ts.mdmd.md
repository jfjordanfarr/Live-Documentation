# packages/server/src/features/live-docs/system/utils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/utils.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-utils-ts
- Generated At: 2026-02-16T18:46:23.624Z

## Authored
### Purpose
Utility functions for the System-layer generator. Path resolution, file operations, change classification, and document filtering helpers shared across plan builders and renderers.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (143 lines)
- `resolveSystemDocPaths()` computes doc absolute/relative paths for a given archetype and slug
- `includeInComponents()` filters out compiled artifacts (.d.ts, .js in dist/node_modules)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:23.624Z","inputHash":"ab6f4e8cfd543ae2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `resolveOutputDirectory` {#symbol-resolveoutputdirectory}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L23)

##### `resolveOutputDirectory` — Summary
Resolves the output directory for System-layer materialisation.

Absolute paths pass through normalised; relative paths are resolved
against the workspace root.

Extracted from the 1847-line generator during the 2025-12-07 decomposition.

#### `resolveSystemDocPaths` {#symbol-resolvesystemdocpaths}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L38)

##### `resolveSystemDocPaths` — Summary
Computes absolute and workspace-relative paths for a System-layer document.

Combines the Live Docs config root, system layer name, archetype subdirectory,
and slug to produce a deterministic `.mdmd.md` path. When {@link args.outputRoot}
is supplied, paths are resolved against that directory instead of the workspace.

#### `systemMetadataSourcePath` {#symbol-systemmetadatasourcepath}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L66)
- Parameters: `archetype`: [`Layer3Archetype`](./types.ts.mdmd.md#symbol-layer3archetype)

##### `systemMetadataSourcePath` — Summary
Constructs a normalised relative path used as the `source` metadata field
inside System-layer Live Docs (e.g. `system/components/my-module`).

#### `readIfExists` {#symbol-readifexists}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L81)

##### `readIfExists` — Summary
Reads a file and returns its contents, or `undefined` if the file does not exist.

Any error other than `ENOENT` is re-thrown. Used throughout the System-layer
pipeline to attempt loading existing documents before deciding whether to
create, update, or skip.

#### `classifyChange` {#symbol-classifychange}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L102)

##### `classifyChange` — Summary
Classifies a document write as `"created"`, `"updated"`, or `"unchanged"`
by comparing the rendered output against existing file content.

Drives the per-file counters reported by the System-layer generator.

#### `extractGeneratedAt` {#symbol-extractgeneratedat}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L115)

##### `extractGeneratedAt` — Summary
Extracts the `Generated At:` timestamp from an existing System-layer document.

Returns `undefined` when no timestamp is present, allowing the generator to
decide whether to preserve an existing timestamp or emit a new one.

#### `stripCodePathLine` {#symbol-stripcodepathline}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L135)

##### `stripCodePathLine` — Summary
Removes the `Code Path:` metadata line from a rendered document string.

Used during content comparison so that path-only differences do not
trigger unnecessary "updated" classifications.

#### `layer3Slug` {#symbol-layer3slug}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L149)

##### `layer3Slug` — Summary
Produces a GitHub-flavoured slug for a System-layer document heading.

Falls back to generic kebab-casing when the GitHub slugger returns an
empty result (e.g. for all-numeric inputs).

#### `formatDisplayName` {#symbol-formatdisplayname}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L160)

##### `formatDisplayName` — Summary
Converts a path-like string (e.g. `"some-module/my-util"`) into a
human-readable title-cased display name (`"My Util"`).

Takes only the last path segment and replaces hyphens/underscores with spaces.

#### `includeInComponents` {#symbol-includeincomponents}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L182)

##### `includeInComponents` — Summary
Determines whether a workspace path should appear in the System-layer
Components view.

A candidate qualifies when it is tracked by the Stage-0 loader, resides
under the Live Docs segment, and is not a compiled artifact (`.js`,
`.d.ts`, etc.).

#### `isCompiledArtifactPath` {#symbol-iscompiledartifactpath}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L204)

##### `isCompiledArtifactPath` — Summary
Returns `true` for paths that represent compiled/transpiled output
(`.js`, `.cjs`, `.mjs`, `.d.ts`) which should be excluded from
System-layer document generation.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:path` - `path`
- [`constants.LIVE_DOCS_SEGMENT`](./constants.ts.mdmd.md#symbol-live_docs_segment)
- [`constants.SYSTEM_LAYER_NAME`](./constants.ts.mdmd.md#symbol-system_layer_name)
- [`types.Layer3Archetype`](./types.ts.mdmd.md#symbol-layer3archetype) (type-only)
- [`LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`githubSlugger.slug`](../../../../../shared/src/tooling/githubSlugger.ts.mdmd.md#symbol-slug)
- [`pathUtils.normalizeWorkspacePath`](../../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

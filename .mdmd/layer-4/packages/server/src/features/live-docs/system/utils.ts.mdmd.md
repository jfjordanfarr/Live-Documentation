# packages/server/src/features/live-docs/system/utils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/utils.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-utils-ts
- Generated At: 2025-12-07T16:27:06.926Z

## Authored
### Purpose
Utility functions for the System-layer generator. Path resolution, file operations, change classification, and document filtering helpers shared across plan builders and renderers.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (143 lines)
- `resolveSystemDocPaths()` computes doc absolute/relative paths for a given archetype and slug
- `includeInComponents()` filters out compiled artifacts (.d.ts, .js in dist/node_modules)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T16:27:06.926Z","inputHash":"bb29934a99af9bcc"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `resolveOutputDirectory` {#symbol-resolveoutputdirectory}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L15)

#### `resolveSystemDocPaths` {#symbol-resolvesystemdocpaths}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L23)

#### `systemMetadataSourcePath` {#symbol-systemmetadatasourcepath}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L47)
- Parameters: `archetype`: [`Layer3Archetype`](./types.ts.mdmd.md#symbol-layer3archetype)

#### `readIfExists` {#symbol-readifexists}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L55)

#### `classifyChange` {#symbol-classifychange}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L70)

#### `extractGeneratedAt` {#symbol-extractgeneratedat}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L77)

#### `stripCodePathLine` {#symbol-stripcodepathline}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L91)

#### `layer3Slug` {#symbol-layer3slug}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L99)

#### `formatDisplayName` {#symbol-formatdisplayname}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L104)

#### `includeInComponents` {#symbol-includeincomponents}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L118)

#### `isCompiledArtifactPath` {#symbol-iscompiledartifactpath}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/utils.ts#L135)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `LiveDocumentationConfig` (type-only)
- `@live-documentation/shared/tooling/githubSlugger` - `slug`
- `@live-documentation/shared/tooling/pathUtils` - `normalizeWorkspacePath`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`constants.LIVE_DOCS_SEGMENT`](./constants.ts.mdmd.md#symbol-live_docs_segment)
- [`constants.SYSTEM_LAYER_NAME`](./constants.ts.mdmd.md#symbol-system_layer_name)
- [`types.Layer3Archetype`](./types.ts.mdmd.md#symbol-layer3archetype) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

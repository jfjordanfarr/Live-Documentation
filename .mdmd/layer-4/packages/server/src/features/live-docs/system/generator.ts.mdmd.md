# packages/server/src/features/live-docs/system/generator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/generator.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-generator-ts
- Generated At: 2025-11-24T15:19:58.854Z

## Authored
### Purpose
Synthesizes Stage-0 Live Docs, co-activation analytics, and optional target manifests into on-demand System-layer markdown so the CLI can emit statistically justified integration views ([2025-11-11 summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md)).

### Notes
- Applies the p/q/z thresholds produced by `coActivation.ts` before writing clusters, preventing the oversized views we rejected earlier in the 2025-11-11 session.
- Supports custom `outputDir` and mirror cleanup so headless harness and `npm run live-docs:system` executions materialize ephemeral System docs outside the repo, matching the on-demand plan agreed the same day.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.854Z","inputHash":"a3f1f18eb4c942ae"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GenerateSystemLiveDocsOptions` {#symbol-generatesystemlivedocsoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L44)

#### `SystemLiveDocWriteRecord` {#symbol-systemlivedocwriterecord}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L54)

#### `GeneratedSystemDocument` {#symbol-generatedsystemdocument}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L61)

#### `SystemLiveDocGeneratorResult` {#symbol-systemlivedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L70)

#### `generateSystemLiveDocs` {#symbol-generatesystemlivedocs}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L192)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `LiveDocumentationConfig`, `normalizeLiveDocumentationConfig`
- `@live-documentation/shared/live-docs/analysis/coActivation` - `CoActivationEdge`, `CoActivationReport` (type-only)
- `@live-documentation/shared/live-docs/core` - `cleanupEmptyParents`, `directoryExists`, `formatRelativePathFromDoc`, `hasMeaningfulAuthoredContent`
- `@live-documentation/shared/live-docs/markdown` - `LiveDocRenderSection`, `extractAuthoredBlock`, `renderLiveDocMarkdown`
- `@live-documentation/shared/live-docs/schema` - `LiveDocMetadata`, `LiveDocProvenance`, `normalizeLiveDocMetadata`
- `@live-documentation/shared/live-docs/types` - `Stage0Doc`, `Stage0Symbol`, `TargetManifest` (type-only)
- `@live-documentation/shared/tooling/githubSlugger` - `slug`
- `@live-documentation/shared/tooling/pathUtils` - `normalizeWorkspacePath`
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`docLoader.loadStage0Docs`](../stage0/docLoader.ts.mdmd.md#symbol-loadstage0docs)
- [`manifest.loadTargetManifest`](../targets/manifest.ts.mdmd.md#symbol-loadtargetmanifest)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

# packages/server/src/features/live-docs/generator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/generator.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-generator-ts
- Generated At: 2025-12-05T15:37:24.183Z

## Authored
### Purpose
Coordinates Live Documentation generation by analyzing source files, merging authored sections, recording provenance, and writing deterministic markdown mirrors for each artifact.

### Notes
- Refactored into a layer-agnostic pipeline to support both Stage‑0 and System docs; see [2025-11-10 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md).
- Exposes `__testUtils` hooks to validate rendering behaviour as documented in [2025-11-08 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:24.183Z","inputHash":"959403939f20950d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocGeneratorResult` {#symbol-livedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L72)

#### `generateLiveDocs` {#symbol-generatelivedocs}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L95)
- Parameters: `options`: `GenerateLiveDocsOptions`

#### `__testUtils` {#symbol-__testutils}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L780)

#### `withDefaultConfig` {#symbol-withdefaultconfig}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L789)
- Returns: [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationconfig)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LiveDocumentationArchetype`, `LiveDocumentationConfig`, `normalizeLiveDocumentationConfig`
- `@live-documentation/shared/live-docs/core` - `SourceAnalysisResult`, `WorkspaceSymbolIndex`, `analyzeSourceFile`, `buildWorkspaceSymbolIndex`, `cleanupEmptyParents`, `collectDependencies`, `collectExportedSymbols`, `computePublicSymbolHeadingInfo`, `directoryExists`, `discoverTargetFiles`, `formatRelativePathFromDoc`, `hasMeaningfulAuthoredContent`, `inferScriptKind`, `renderDependencyLines`, `renderPublicSymbolLines`, `renderReExportedAnchorLines`, `resolveArchetype`
- `@live-documentation/shared/live-docs/markdown` - `LiveDocRenderSection`, `composeLiveDocId`, `extractAuthoredBlock`, `renderLiveDocMarkdown`
- `@live-documentation/shared/live-docs/schema` - `LiveDocGeneratorProvenance`, `LiveDocMetadata`, `LiveDocProvenance` (type-only)
- `@live-documentation/shared/tooling/pathUtils` - `normalizeWorkspacePath`, `toWorkspaceFileUri`, `toWorkspaceRelativePath`
- `glob` - `glob`
- `node:crypto` - `createHash`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`evidenceBridge.CoverageSummary`](./evidenceBridge.ts.mdmd.md#symbol-coveragesummary)
- [`evidenceBridge.EvidenceSnapshot`](./evidenceBridge.ts.mdmd.md#symbol-evidencesnapshot)
- [`evidenceBridge.ImplementationEvidenceItem`](./evidenceBridge.ts.mdmd.md#symbol-implementationevidenceitem)
- [`evidenceBridge.TestEvidenceItem`](./evidenceBridge.ts.mdmd.md#symbol-testevidenceitem)
- [`evidenceBridge.loadEvidenceSnapshot`](./evidenceBridge.ts.mdmd.md#symbol-loadevidencesnapshot)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](./renderPublicSymbolLines.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

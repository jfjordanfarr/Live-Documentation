# packages/engine/src/live-docs/core.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/core.ts
- Generated At: 2026-10-22T16:47:52.716Z

## Authored
### Purpose
The engine's analysis facade: the names that consumers import through `core` rather than from the module that defines them. The analysis itself lives in the focused modules beside it (`coreTypes.ts`, `archetype.ts`, `discovery.ts`, `symbolExtraction.ts`, `compose.ts`, `document.ts`, `sourceAnalysis.ts`), each importable directly; the docs resolve a symbol to its origin, not to this barrel. Its history as the extraction engine itself is below.

### Notes
- Extracted from the server generator in the [November 10 shared-core refactor](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-36-shared-core-refactor-lines-18851920), committed as `1da1b96e` on November 11, 2025, so the source and system generators could share analysis.
- On November 12, 2025, the [C# adapter and polyglot fixture work](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md#turn-11-build-the-c-adapter--polyglot-test-lines-20612300) added the adapter registry to the shared analysis path.
- The [November 14 TypeScript docstring work](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-18-pivot-to-typescript-docstrings) added documentation to its public analysis functions and began the bridge that reads that documentation.
- Trimmed on 2026-10-08 from 58 re-exported names to the 24 some file imports through it, in [the dead code sweep](../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md): the rest were imported from their origins by every consumer.
- On 2026-10-15 `buildWorkspaceSymbolIndex` gave way to `buildWorkspaceIndexes`, which returns the symbol index and the entry index from one pass, and `composeEntries` and `WorkspaceEntryIndex` joined the names offered here, each imported by the generator.
- On 2026-10-19, the two filesystem helpers that [the December 6 extraction](../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-06.3.SUMMARIZED.md) placed in `fileUtils.ts` moved to their only consumer, the generator's stale-doc pruning. They were not part of source analysis or this facade's lasting contract.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SourceAnalysisResult` {#symbol-sourceanalysisresult}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L18)

#### `WorkspaceEntryIndex` {#symbol-workspaceentryindex}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L19)

#### `WorkspaceSymbolIndex` {#symbol-workspacesymbolindex}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L20)

#### `TypeReference` {#symbol-typereference}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L21)

#### `PublicSymbolEntry` {#symbol-publicsymbolentry}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L22)

#### `DependencyEntry` {#symbol-dependencyentry}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L23)

#### `SymbolDocumentationParameter` {#symbol-symboldocumentationparameter}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L24)

#### `SymbolDocumentationException` {#symbol-symboldocumentationexception}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L25)

#### `SymbolDocumentationExample` {#symbol-symboldocumentationexample}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L26)

#### `SymbolDocumentationLinkKind` {#symbol-symboldocumentationlinkkind}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L27)

#### `SymbolDocumentationLink` {#symbol-symboldocumentationlink}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L28)

#### `SymbolDocumentation` {#symbol-symboldocumentation}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L29)

#### `WorkspaceFileIndex` {#symbol-workspacefileindex}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L32)

#### `BINARY_SNIFF_BYTES` {#symbol-binary_sniff_bytes}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L34)

#### `hasMeaningfulAuthoredContent` {#symbol-hasmeaningfulauthoredcontent}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L34)

#### `isBinaryContent` {#symbol-isbinarycontent}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L34)

#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L34)

#### `discoverDocuments` {#symbol-discoverdocuments}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L37)

#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L38)

#### `buildWorkspaceIndexes` {#symbol-buildworkspaceindexes}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L39)

#### `collectExportedSymbols` {#symbol-collectexportedsymbols}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L42)

#### `computePublicSymbolHeadingInfo` {#symbol-computepublicsymbolheadinginfo}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L45)

#### `composeCitedBy` {#symbol-composecitedby}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L46)

#### `composeEntries` {#symbol-composeentries}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L47)

#### `composeSymbolBlocks` {#symbol-composesymbolblocks}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L48)

#### `composeDependencies` {#symbol-composedependencies}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L49)

#### `composeReExports` {#symbol-composereexports}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L50)

#### `analyzeSourceFile` {#symbol-analyzesourcefile}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L53)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.WorkspaceFileIndex`](./adapters/index.ts.mdmd.md#symbol-workspacefileindex) (re-export, type-only)
- [`archetype.BINARY_SNIFF_BYTES`](./archetype.ts.mdmd.md#symbol-binary_sniff_bytes) (re-export)
- [`archetype.hasMeaningfulAuthoredContent`](./archetype.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent) (re-export)
- [`archetype.isBinaryContent`](./archetype.ts.mdmd.md#symbol-isbinarycontent) (re-export)
- [`archetype.resolveArchetype`](./archetype.ts.mdmd.md#symbol-resolvearchetype) (re-export)
- [`compose.composeCitedBy`](./compose.ts.mdmd.md#symbol-composecitedby) (re-export)
- [`compose.composeDependencies`](./compose.ts.mdmd.md#symbol-composedependencies) (re-export)
- [`compose.composeEntries`](./compose.ts.mdmd.md#symbol-composeentries) (re-export)
- [`compose.composeReExports`](./compose.ts.mdmd.md#symbol-composereexports) (re-export)
- [`compose.composeSymbolBlocks`](./compose.ts.mdmd.md#symbol-composesymbolblocks) (re-export)
- [`compose.computePublicSymbolHeadingInfo`](./compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo) (re-export)
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (re-export, type-only)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (re-export, type-only)
- [`coreTypes.SourceAnalysisResult`](./coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (re-export, type-only)
- [`coreTypes.SymbolDocumentation`](./coreTypes.ts.mdmd.md#symbol-symboldocumentation) (re-export, type-only)
- [`coreTypes.SymbolDocumentationExample`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationexample) (re-export, type-only)
- [`coreTypes.SymbolDocumentationException`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationexception) (re-export, type-only)
- [`coreTypes.SymbolDocumentationLink`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationlink) (re-export, type-only)
- [`coreTypes.SymbolDocumentationLinkKind`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationlinkkind) (re-export, type-only)
- [`coreTypes.SymbolDocumentationParameter`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationparameter) (re-export, type-only)
- [`coreTypes.TypeReference`](./coreTypes.ts.mdmd.md#symbol-typereference) (re-export, type-only)
- [`coreTypes.WorkspaceEntryIndex`](./coreTypes.ts.mdmd.md#symbol-workspaceentryindex) (re-export, type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (re-export, type-only)
- [`discovery.buildWorkspaceIndexes`](./discovery.ts.mdmd.md#symbol-buildworkspaceindexes) (re-export)
- [`discovery.discoverDocuments`](./discovery.ts.mdmd.md#symbol-discoverdocuments) (re-export)
- [`discovery.discoverTargetFiles`](./discovery.ts.mdmd.md#symbol-discovertargetfiles) (re-export)
- [`sourceAnalysis.analyzeSourceFile`](./sourceAnalysis.ts.mdmd.md#symbol-analyzesourcefile) (re-export)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols) (re-export)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-engine.mdmd.md`](../../../../../layer-3/live-documentation-engine.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

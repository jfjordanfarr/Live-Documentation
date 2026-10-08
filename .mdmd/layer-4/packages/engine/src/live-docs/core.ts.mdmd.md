# packages/engine/src/live-docs/core.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/core.ts
- Generated At: 2026-10-08T16:03:27.230Z

## Authored
### Purpose
The engine's analysis facade: the names that consumers import through `core` rather than from the module that defines them. The analysis itself lives in the focused modules beside it (`coreTypes.ts`, `archetype.ts`, `discovery.ts`, `symbolExtraction.ts`, `compose.ts`, `document.ts`, `fileUtils.ts`, `sourceAnalysis.ts`), each importable directly; the docs resolve a symbol to its origin, not to this barrel. Its history as the extraction engine itself is below.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]

### Notes
- Refactored out of the server generator so adapters and CLI tooling could reuse a single discovery pipeline across packages.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]
- Extended on Nov 12 to power adapter registries and polyglot fixture generation, adding hooks the co-activation analytics now depend on.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md#turn-08-stand-up-co-activation-infrastructure-lines-1101-1220]
- Enriched with docstring extraction work that guarantees Live Docs capture structured JSDoc output for downstream evidence.
- Trimmed on 2026-10-08 from 58 re-exported names to the 24 some file imports through it, in [the dead code sweep](../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md): the rest were imported from their origins by every consumer.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-14-instructions-drift--legacy-layer-4-cleanup-lines-1321-1400]

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SourceAnalysisResult` {#symbol-sourceanalysisresult}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L18)

#### `WorkspaceSymbolIndex` {#symbol-workspacesymbolindex}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L19)

#### `TypeReference` {#symbol-typereference}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L20)

#### `PublicSymbolEntry` {#symbol-publicsymbolentry}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L21)

#### `DependencyEntry` {#symbol-dependencyentry}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L22)

#### `SymbolDocumentationParameter` {#symbol-symboldocumentationparameter}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L23)

#### `SymbolDocumentationException` {#symbol-symboldocumentationexception}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L24)

#### `SymbolDocumentationExample` {#symbol-symboldocumentationexample}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L25)

#### `SymbolDocumentationLinkKind` {#symbol-symboldocumentationlinkkind}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L26)

#### `SymbolDocumentationLink` {#symbol-symboldocumentationlink}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L27)

#### `SymbolDocumentation` {#symbol-symboldocumentation}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L28)

#### `WorkspaceFileIndex` {#symbol-workspacefileindex}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L31)

#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L34)

#### `hasMeaningfulAuthoredContent` {#symbol-hasmeaningfulauthoredcontent}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L35)

#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L39)

#### `buildWorkspaceSymbolIndex` {#symbol-buildworkspacesymbolindex}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L40)

#### `collectExportedSymbols` {#symbol-collectexportedsymbols}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L43)

#### `computePublicSymbolHeadingInfo` {#symbol-computepublicsymbolheadinginfo}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L46)

#### `composeSymbolBlocks` {#symbol-composesymbolblocks}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L47)

#### `composeDependencies` {#symbol-composedependencies}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L48)

#### `composeReExports` {#symbol-composereexports}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L49)

#### `directoryExists` {#symbol-directoryexists}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L53)

#### `cleanupEmptyParents` {#symbol-cleanupemptyparents}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L54)

#### `analyzeSourceFile` {#symbol-analyzesourcefile}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L57)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.WorkspaceFileIndex`](./adapters/index.ts.mdmd.md#symbol-workspacefileindex) (re-export, type-only)
- [`archetype.hasMeaningfulAuthoredContent`](./archetype.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent) (re-export)
- [`archetype.resolveArchetype`](./archetype.ts.mdmd.md#symbol-resolvearchetype) (re-export)
- [`compose.composeDependencies`](./compose.ts.mdmd.md#symbol-composedependencies) (re-export)
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
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (re-export, type-only)
- [`discovery.buildWorkspaceSymbolIndex`](./discovery.ts.mdmd.md#symbol-buildworkspacesymbolindex) (re-export)
- [`discovery.discoverTargetFiles`](./discovery.ts.mdmd.md#symbol-discovertargetfiles) (re-export)
- [`fileUtils.cleanupEmptyParents`](./fileUtils.ts.mdmd.md#symbol-cleanupemptyparents) (re-export)
- [`fileUtils.directoryExists`](./fileUtils.ts.mdmd.md#symbol-directoryexists) (re-export)
- [`sourceAnalysis.analyzeSourceFile`](./sourceAnalysis.ts.mdmd.md#symbol-analyzesourcefile) (re-export)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols) (re-export)
<!-- LIVE-DOC:END Dependencies -->

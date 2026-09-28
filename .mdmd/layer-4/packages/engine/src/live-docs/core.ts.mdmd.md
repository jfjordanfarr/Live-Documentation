# packages/engine/src/live-docs/core.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/core.ts
- Generated At: 2026-09-27T23:21:31.319Z

## Authored
### Purpose
Implements the shared Live Docs extraction engine—scanning source trees, collecting exports/dependencies, and emitting structured metadata consumed by generators and analytics.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]

### Notes
- Refactored out of the server generator so adapters and CLI tooling could reuse a single discovery pipeline across packages.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]
- Extended on Nov 12 to power adapter registries and polyglot fixture generation, adding hooks the co-activation analytics now depend on.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md#turn-08-stand-up-co-activation-infrastructure-lines-1101-1220]
- Enriched with docstring extraction work that guarantees Live Docs capture structured JSDoc output for downstream evidence.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-14-instructions-drift--legacy-layer-4-cleanup-lines-1321-1400]

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SourceAnalysisResult` {#symbol-sourceanalysisresult}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L32)

#### `ResolvedSymbolLocation` {#symbol-resolvedsymbollocation}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L33)

#### `WorkspaceSymbolIndex` {#symbol-workspacesymbolindex}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L34)

#### `TypeReference` {#symbol-typereference}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L35)

#### `PublicSymbolEntry` {#symbol-publicsymbolentry}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L36)

#### `DependencyEntry` {#symbol-dependencyentry}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L37)

#### `ReExportedSymbolInfo` {#symbol-reexportedsymbolinfo}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L38)

#### `LocationInfo` {#symbol-locationinfo}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L39)

#### `SymbolDocumentationField` {#symbol-symboldocumentationfield}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L40)

#### `SymbolDocumentationParameter` {#symbol-symboldocumentationparameter}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L41)

#### `SymbolDocumentationException` {#symbol-symboldocumentationexception}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L42)

#### `SymbolDocumentationExample` {#symbol-symboldocumentationexample}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L43)

#### `SymbolDocumentationLinkKind` {#symbol-symboldocumentationlinkkind}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L44)

#### `SymbolDocumentationLink` {#symbol-symboldocumentationlink}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L45)

#### `SymbolDocumentation` {#symbol-symboldocumentation}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L46)

#### `PublicSymbolHeadingInfo` {#symbol-publicsymbolheadinginfo}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L47)

#### `WorkspaceFileIndex` {#symbol-workspacefileindex}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L50)

#### `SUPPORTED_SCRIPT_EXTENSIONS` {#symbol-supported_script_extensions}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L57)

#### `IMPLEMENTATION_CODE_EXTENSIONS` {#symbol-implementation_code_extensions}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L58)

#### `MODULE_RESOLUTION_EXTENSIONS` {#symbol-module_resolution_extensions}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L59)

#### `RESERVED_HEADING_NAMES` {#symbol-reserved_heading_names}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L60)

#### `formatSourceLink` {#symbol-formatsourcelink}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L68)

#### `formatRelativePathFromDoc` {#symbol-formatrelativepathfromdoc}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L69)

#### `createSymbolSlug` {#symbol-createsymbolslug}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L70)

#### `toModuleLabel` {#symbol-tomodulelabel}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L71)

#### `formatInlineCode` {#symbol-formatinlinecode}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L72)

#### `formatDependencyQualifier` {#symbol-formatdependencyqualifier}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L73)

#### `resolveExportAssignmentName` {#symbol-resolveexportassignmentname}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L74)

#### `hasExportModifier` {#symbol-hasexportmodifier}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L75)

#### `hasDefaultModifier` {#symbol-hasdefaultmodifier}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L76)

#### `getNodeLocation` {#symbol-getnodelocation}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L77)

#### `displayDependencyKey` {#symbol-displaydependencykey}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L78)

#### `isBarrelFilePath` {#symbol-isbarrelfilepath}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L79)

#### `compareSymbolLocationsPreferOrigin` {#symbol-comparesymbollocationspreferorigin}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L80)

#### `commonDirectoryPrefixLength` {#symbol-commondirectoryprefixlength}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L81)

#### `createProximityAwareComparator` {#symbol-createproximityawarecomparator}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L82)

#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L90)

#### `hasMeaningfulAuthoredContent` {#symbol-hasmeaningfulauthoredcontent}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L91)

#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L99)

#### `buildWorkspaceSymbolIndex` {#symbol-buildworkspacesymbolindex}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L100)

#### `resolveTypeToLiveDoc` {#symbol-resolvetypetolivedoc}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L101)

#### `inferScriptKind` {#symbol-inferscriptkind}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L109)

#### `collectExportedSymbols` {#symbol-collectexportedsymbols}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L110)

#### `collectDependencies` {#symbol-collectdependencies}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L118)

#### `mergeDependencyEntries` {#symbol-mergedependencyentries}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L119)

#### `resolveDependency` {#symbol-resolvedependency}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L120)

#### `shouldInferDomDependencies` {#symbol-shouldinferdomdependencies}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L121)

#### `augmentWithReExportedSymbols` {#symbol-augmentwithreexportedsymbols}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L122)

#### `computePublicSymbolHeadingInfo` {#symbol-computepublicsymbolheadinginfo}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L130)

#### `composeSymbolBlocks` {#symbol-composesymbolblocks}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L131)

#### `composeDependencies` {#symbol-composedependencies}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L132)

#### `composeReExports` {#symbol-composereexports}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L133)

#### `extractJsDocDocumentation` {#symbol-extractjsdocdocumentation}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L140)

#### `detectChangedFiles` {#symbol-detectchangedfiles}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L147)

#### `parsePorcelainLine` {#symbol-parseporcelainline}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L148)

#### `execFileAsync` {#symbol-execfileasync}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L149)

#### `directoryExists` {#symbol-directoryexists}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L157)

#### `cleanupEmptyParents` {#symbol-cleanupemptyparents}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L158)

#### `analyzeSourceFile` {#symbol-analyzesourcefile}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/core.ts#L165)
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
- [`coreConstants.IMPLEMENTATION_CODE_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-implementation_code_extensions) (re-export)
- [`coreConstants.MODULE_RESOLUTION_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-module_resolution_extensions) (re-export)
- [`coreConstants.RESERVED_HEADING_NAMES`](./coreConstants.ts.mdmd.md#symbol-reserved_heading_names) (re-export)
- [`coreConstants.SUPPORTED_SCRIPT_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-supported_script_extensions) (re-export)
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (re-export, type-only)
- [`coreTypes.LocationInfo`](./coreTypes.ts.mdmd.md#symbol-locationinfo) (re-export, type-only)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (re-export, type-only)
- [`coreTypes.PublicSymbolHeadingInfo`](./coreTypes.ts.mdmd.md#symbol-publicsymbolheadinginfo) (re-export, type-only)
- [`coreTypes.ReExportedSymbolInfo`](./coreTypes.ts.mdmd.md#symbol-reexportedsymbolinfo) (re-export, type-only)
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (re-export, type-only)
- [`coreTypes.SourceAnalysisResult`](./coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (re-export, type-only)
- [`coreTypes.SymbolDocumentation`](./coreTypes.ts.mdmd.md#symbol-symboldocumentation) (re-export, type-only)
- [`coreTypes.SymbolDocumentationExample`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationexample) (re-export, type-only)
- [`coreTypes.SymbolDocumentationException`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationexception) (re-export, type-only)
- [`coreTypes.SymbolDocumentationField`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationfield) (re-export, type-only)
- [`coreTypes.SymbolDocumentationLink`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationlink) (re-export, type-only)
- [`coreTypes.SymbolDocumentationLinkKind`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationlinkkind) (re-export, type-only)
- [`coreTypes.SymbolDocumentationParameter`](./coreTypes.ts.mdmd.md#symbol-symboldocumentationparameter) (re-export, type-only)
- [`coreTypes.TypeReference`](./coreTypes.ts.mdmd.md#symbol-typereference) (re-export, type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (re-export, type-only)
- [`coreUtils.commonDirectoryPrefixLength`](./coreUtils.ts.mdmd.md#symbol-commondirectoryprefixlength) (re-export)
- [`coreUtils.compareSymbolLocationsPreferOrigin`](./coreUtils.ts.mdmd.md#symbol-comparesymbollocationspreferorigin) (re-export)
- [`coreUtils.createProximityAwareComparator`](./coreUtils.ts.mdmd.md#symbol-createproximityawarecomparator) (re-export)
- [`coreUtils.createSymbolSlug`](./coreUtils.ts.mdmd.md#symbol-createsymbolslug) (re-export)
- [`coreUtils.displayDependencyKey`](./coreUtils.ts.mdmd.md#symbol-displaydependencykey) (re-export)
- [`coreUtils.formatDependencyQualifier`](./coreUtils.ts.mdmd.md#symbol-formatdependencyqualifier) (re-export)
- [`coreUtils.formatInlineCode`](./coreUtils.ts.mdmd.md#symbol-formatinlinecode) (re-export)
- [`coreUtils.formatRelativePathFromDoc`](./coreUtils.ts.mdmd.md#symbol-formatrelativepathfromdoc) (re-export)
- [`coreUtils.formatSourceLink`](./coreUtils.ts.mdmd.md#symbol-formatsourcelink) (re-export)
- [`coreUtils.getNodeLocation`](./coreUtils.ts.mdmd.md#symbol-getnodelocation) (re-export)
- [`coreUtils.hasDefaultModifier`](./coreUtils.ts.mdmd.md#symbol-hasdefaultmodifier) (re-export)
- [`coreUtils.hasExportModifier`](./coreUtils.ts.mdmd.md#symbol-hasexportmodifier) (re-export)
- [`coreUtils.isBarrelFilePath`](./coreUtils.ts.mdmd.md#symbol-isbarrelfilepath) (re-export)
- [`coreUtils.resolveExportAssignmentName`](./coreUtils.ts.mdmd.md#symbol-resolveexportassignmentname) (re-export)
- [`coreUtils.toModuleLabel`](./coreUtils.ts.mdmd.md#symbol-tomodulelabel) (re-export)
- [`dependencies.augmentWithReExportedSymbols`](./dependencies.ts.mdmd.md#symbol-augmentwithreexportedsymbols) (re-export)
- [`dependencies.collectDependencies`](./dependencies.ts.mdmd.md#symbol-collectdependencies) (re-export)
- [`dependencies.mergeDependencyEntries`](./dependencies.ts.mdmd.md#symbol-mergedependencyentries) (re-export)
- [`dependencies.resolveDependency`](./dependencies.ts.mdmd.md#symbol-resolvedependency) (re-export)
- [`dependencies.shouldInferDomDependencies`](./dependencies.ts.mdmd.md#symbol-shouldinferdomdependencies) (re-export)
- [`discovery.buildWorkspaceSymbolIndex`](./discovery.ts.mdmd.md#symbol-buildworkspacesymbolindex) (re-export)
- [`discovery.discoverTargetFiles`](./discovery.ts.mdmd.md#symbol-discovertargetfiles) (re-export)
- [`discovery.resolveTypeToLiveDoc`](./discovery.ts.mdmd.md#symbol-resolvetypetolivedoc) (re-export)
- [`fileUtils.cleanupEmptyParents`](./fileUtils.ts.mdmd.md#symbol-cleanupemptyparents) (re-export)
- [`fileUtils.directoryExists`](./fileUtils.ts.mdmd.md#symbol-directoryexists) (re-export)
- [`gitUtils.detectChangedFiles`](./gitUtils.ts.mdmd.md#symbol-detectchangedfiles) (re-export)
- [`gitUtils.execFileAsync`](./gitUtils.ts.mdmd.md#symbol-execfileasync) (re-export)
- [`gitUtils.parsePorcelainLine`](./gitUtils.ts.mdmd.md#symbol-parseporcelainline) (re-export)
- [`jsDoc.extractJsDocDocumentation`](./jsDoc.ts.mdmd.md#symbol-extractjsdocdocumentation) (re-export)
- [`sourceAnalysis.analyzeSourceFile`](./sourceAnalysis.ts.mdmd.md#symbol-analyzesourcefile) (re-export)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols) (re-export)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind) (re-export)
<!-- LIVE-DOC:END Dependencies -->

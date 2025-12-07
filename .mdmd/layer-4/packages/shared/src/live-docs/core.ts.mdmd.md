# packages/shared/src/live-docs/core.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/core.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-core-ts
- Generated At: 2025-12-07T03:35:42.386Z

## Authored
### Purpose
Implements the shared Live Docs extraction engine—scanning source trees, collecting exports/dependencies, and emitting structured metadata consumed by generators and analytics.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]

### Notes
- Refactored out of the server generator so adapters and CLI tooling could reuse a single discovery pipeline across packages.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]
- Extended on Nov 12 to power adapter registries and polyglot fixture generation, adding hooks the co-activation analytics now depend on.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md#turn-08-stand-up-co-activation-infrastructure-lines-1101-1220]
- Enriched with docstring extraction work that guarantees Live Docs capture structured JSDoc output for downstream evidence.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-14-instructions-drift--legacy-layer-4-cleanup-lines-1321-1400]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T03:35:42.386Z","inputHash":"0cbaf08ee63239ca"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SourceAnalysisResult` {#symbol-sourceanalysisresult}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L31)

#### `ResolvedSymbolLocation` {#symbol-resolvedsymbollocation}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L32)

#### `WorkspaceSymbolIndex` {#symbol-workspacesymbolindex}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L33)

#### `TypeReference` {#symbol-typereference}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L34)

#### `PublicSymbolEntry` {#symbol-publicsymbolentry}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L35)

#### `DependencyEntry` {#symbol-dependencyentry}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L36)

#### `ReExportedSymbolInfo` {#symbol-reexportedsymbolinfo}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L37)

#### `LocationInfo` {#symbol-locationinfo}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L38)

#### `SymbolDocumentationField` {#symbol-symboldocumentationfield}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L39)

#### `SymbolDocumentationParameter` {#symbol-symboldocumentationparameter}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L40)

#### `SymbolDocumentationException` {#symbol-symboldocumentationexception}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L41)

#### `SymbolDocumentationExample` {#symbol-symboldocumentationexample}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L42)

#### `SymbolDocumentationLinkKind` {#symbol-symboldocumentationlinkkind}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L43)

#### `SymbolDocumentationLink` {#symbol-symboldocumentationlink}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L44)

#### `SymbolDocumentation` {#symbol-symboldocumentation}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L45)

#### `PublicSymbolHeadingInfo` {#symbol-publicsymbolheadinginfo}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L46)

#### `SUPPORTED_SCRIPT_EXTENSIONS` {#symbol-supported_script_extensions}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L54)

#### `IMPLEMENTATION_CODE_EXTENSIONS` {#symbol-implementation_code_extensions}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L55)

#### `MODULE_RESOLUTION_EXTENSIONS` {#symbol-module_resolution_extensions}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L56)

#### `RESERVED_HEADING_NAMES` {#symbol-reserved_heading_names}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L57)

#### `formatSourceLink` {#symbol-formatsourcelink}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L65)

#### `formatRelativePathFromDoc` {#symbol-formatrelativepathfromdoc}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L66)

#### `createSymbolSlug` {#symbol-createsymbolslug}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L67)

#### `toModuleLabel` {#symbol-tomodulelabel}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L68)

#### `formatInlineCode` {#symbol-formatinlinecode}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L69)

#### `formatDependencyQualifier` {#symbol-formatdependencyqualifier}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L70)

#### `resolveExportAssignmentName` {#symbol-resolveexportassignmentname}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L71)

#### `hasExportModifier` {#symbol-hasexportmodifier}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L72)

#### `hasDefaultModifier` {#symbol-hasdefaultmodifier}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L73)

#### `getNodeLocation` {#symbol-getnodelocation}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L74)

#### `displayDependencyKey` {#symbol-displaydependencykey}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L75)

#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L83)

#### `hasMeaningfulAuthoredContent` {#symbol-hasmeaningfulauthoredcontent}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L84)

#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L92)

#### `buildWorkspaceSymbolIndex` {#symbol-buildworkspacesymbolindex}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L93)

#### `resolveTypeToLiveDoc` {#symbol-resolvetypetolivedoc}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L94)

#### `inferScriptKind` {#symbol-inferscriptkind}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L102)

#### `collectExportedSymbols` {#symbol-collectexportedsymbols}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L103)

#### `collectDependencies` {#symbol-collectdependencies}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L111)

#### `mergeDependencyEntries` {#symbol-mergedependencyentries}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L112)

#### `resolveDependency` {#symbol-resolvedependency}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L113)

#### `shouldInferDomDependencies` {#symbol-shouldinferdomdependencies}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L114)

#### `augmentWithReExportedSymbols` {#symbol-augmentwithreexportedsymbols}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L115)

#### `computePublicSymbolHeadingInfo` {#symbol-computepublicsymbolheadinginfo}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L123)

#### `renderPublicSymbolLines` {#symbol-renderpublicsymbollines}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L124)

#### `renderDependencyLines` {#symbol-renderdependencylines}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L125)

#### `renderReExportedAnchorLines` {#symbol-renderreexportedanchorlines}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L126)

#### `extractJsDocDocumentation` {#symbol-extractjsdocdocumentation}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L133)

#### `detectChangedFiles` {#symbol-detectchangedfiles}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L140)

#### `parsePorcelainLine` {#symbol-parseporcelainline}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L141)

#### `execFileAsync` {#symbol-execfileasync}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L142)

#### `directoryExists` {#symbol-directoryexists}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L150)

#### `cleanupEmptyParents` {#symbol-cleanupemptyparents}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L151)

#### `analyzeSourceFile` {#symbol-analyzesourcefile}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L158)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`archetype.hasMeaningfulAuthoredContent`](./archetype.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent) (re-export)
- [`archetype.resolveArchetype`](./archetype.ts.mdmd.md#symbol-resolvearchetype) (re-export)
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
- [`coreUtils.createSymbolSlug`](./coreUtils.ts.mdmd.md#symbol-createsymbolslug) (re-export)
- [`coreUtils.displayDependencyKey`](./coreUtils.ts.mdmd.md#symbol-displaydependencykey) (re-export)
- [`coreUtils.formatDependencyQualifier`](./coreUtils.ts.mdmd.md#symbol-formatdependencyqualifier) (re-export)
- [`coreUtils.formatInlineCode`](./coreUtils.ts.mdmd.md#symbol-formatinlinecode) (re-export)
- [`coreUtils.formatRelativePathFromDoc`](./coreUtils.ts.mdmd.md#symbol-formatrelativepathfromdoc) (re-export)
- [`coreUtils.formatSourceLink`](./coreUtils.ts.mdmd.md#symbol-formatsourcelink) (re-export)
- [`coreUtils.getNodeLocation`](./coreUtils.ts.mdmd.md#symbol-getnodelocation) (re-export)
- [`coreUtils.hasDefaultModifier`](./coreUtils.ts.mdmd.md#symbol-hasdefaultmodifier) (re-export)
- [`coreUtils.hasExportModifier`](./coreUtils.ts.mdmd.md#symbol-hasexportmodifier) (re-export)
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
- [`rendering.computePublicSymbolHeadingInfo`](./rendering.ts.mdmd.md#symbol-computepublicsymbolheadinginfo) (re-export)
- [`rendering.renderDependencyLines`](./rendering.ts.mdmd.md#symbol-renderdependencylines) (re-export)
- [`rendering.renderPublicSymbolLines`](./rendering.ts.mdmd.md#symbol-renderpublicsymbollines) (re-export)
- [`rendering.renderReExportedAnchorLines`](./rendering.ts.mdmd.md#symbol-renderreexportedanchorlines) (re-export)
- [`sourceAnalysis.analyzeSourceFile`](./sourceAnalysis.ts.mdmd.md#symbol-analyzesourcefile) (re-export)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols) (re-export)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind) (re-export)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](./adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./adapters/csharp.hangfire.test.ts.mdmd.md)
- [powershell.test.ts](./adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./adapters/python.docstring.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./adapters/ruby.docstring.test.ts.mdmd.md)
- [rust.docstring.test.ts](./adapters/rust.docstring.test.ts.mdmd.md)
- [core.docstring.test.ts](./core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

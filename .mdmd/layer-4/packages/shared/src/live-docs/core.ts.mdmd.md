# packages/shared/src/live-docs/core.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/core.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-core-ts
- Generated At: 2025-12-06T23:12:00.516Z

## Authored
### Purpose
Implements the shared Live Docs extraction engine—scanning source trees, collecting exports/dependencies, and emitting structured metadata consumed by generators and analytics.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]

### Notes
- Refactored out of the server generator so adapters and CLI tooling could reuse a single discovery pipeline across packages.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]
- Extended on Nov 12 to power adapter registries and polyglot fixture generation, adding hooks the co-activation analytics now depend on.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md#turn-08-stand-up-co-activation-infrastructure-lines-1101-1220]
- Enriched with docstring extraction work that guarantees Live Docs capture structured JSDoc output for downstream evidence.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-14-instructions-drift--legacy-layer-4-cleanup-lines-1321-1400]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T23:12:00.516Z","inputHash":"eaf452094f50f0ca"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SourceAnalysisResult` {#symbol-sourceanalysisresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L16)

#### `ResolvedSymbolLocation` {#symbol-resolvedsymbollocation}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L31)

##### `ResolvedSymbolLocation` — Summary
Represents a resolved symbol location in the Live Documentation workspace.

##### `ResolvedSymbolLocation` — Remarks
This interface maps a symbol name to its Live Doc file path and anchor,
enabling cross-Live-Doc linking when type references are rendered.

##### `ResolvedSymbolLocation` — Links
- `WorkspaceSymbolIndex`

#### `WorkspaceSymbolIndex` {#symbol-workspacesymbolindex}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L77)

##### `WorkspaceSymbolIndex` — Summary
A workspace-wide index mapping symbol names to their Live Doc locations.

##### `WorkspaceSymbolIndex` — Remarks
This index is built during Live Doc generation by collecting all exported
symbols from all tracked files. It enables type reference resolution:
when a symbol's return type or parameter type is a type defined elsewhere
in the workspace, we can render it as a link to that type's Live Doc.

The index supports multiple symbols with the same name (from different files)
by storing an array of locations. Resolution prefers exact matches and
falls back to qualified name matching when ambiguous.

##### `WorkspaceSymbolIndex` — Examples
```typescript
const index: WorkspaceSymbolIndex = new Map([
  ["Widget", [{ liveDocPath: ".mdmd/layer-4/src/types.ts.mdmd.md", sourcePath: "src/types.ts", anchor: "symbol-widget", kind: "interface" }]],
  ["processWidget", [{ liveDocPath: ".mdmd/layer-4/src/core.ts.mdmd.md", sourcePath: "src/core.ts", anchor: "symbol-processwidget", kind: "function" }]]
]);
```

##### `WorkspaceSymbolIndex` — Links
- `buildWorkspaceSymbolIndex`
- `ResolvedSymbolLocation` — *

#### `TypeReference` {#symbol-typereference}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L90)

##### `TypeReference` — Summary
Represents a type reference extracted from a symbol's signature.

##### `TypeReference` — Remarks
Type references capture the relationship between a symbol and the types it uses,
enabling cross-Live-Doc linking when those types are defined in other workspace files.
This powers the "type-aware symbol linking" feature in the Explorer's Local Map.

##### `TypeReference` — Links
- `collectTypeReferences`
- `PublicSymbolEntry.typeReferences` — *

#### `PublicSymbolEntry` {#symbol-publicsymbolentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L159)

##### `PublicSymbolEntry` — Summary
Describes a public symbol exported from a source file.

##### `PublicSymbolEntry` — Remarks
This interface captures the essential metadata for each exported symbol,
including its name, kind, location, documentation, and type references.
The `typeReferences` field enables cross-Live-Doc linking when types
are defined in other workspace files.

##### `PublicSymbolEntry` — Links
- `collectExportedSymbols` — *
- `TypeReference`

#### `DependencyEntry` {#symbol-dependencyentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L196)

#### `ReExportedSymbolInfo` {#symbol-reexportedsymbolinfo}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L206)

#### `LocationInfo` {#symbol-locationinfo}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L214)

#### `SymbolDocumentationField` {#symbol-symboldocumentationfield}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L219)

#### `SymbolDocumentationParameter` {#symbol-symboldocumentationparameter}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L231)

#### `SymbolDocumentationException` {#symbol-symboldocumentationexception}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L236)

#### `SymbolDocumentationExample` {#symbol-symboldocumentationexample}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L241)

#### `SymbolDocumentationLinkKind` {#symbol-symboldocumentationlinkkind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L247)

#### `SymbolDocumentationLink` {#symbol-symboldocumentationlink}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L249)

#### `SymbolDocumentation` {#symbol-symboldocumentation}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L255)

#### `SUPPORTED_SCRIPT_EXTENSIONS` {#symbol-supported_script_extensions}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L270)

#### `IMPLEMENTATION_CODE_EXTENSIONS` {#symbol-implementation_code_extensions}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L285)

##### `IMPLEMENTATION_CODE_EXTENSIONS` — Summary
Extensions that are always treated as implementation code, even under fixture directories.
These files contain analyzable source code with symbols and dependencies.

#### `MODULE_RESOLUTION_EXTENSIONS` {#symbol-module_resolution_extensions}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L307)

#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L374)
- Parameters: `options`: `DiscoverOptions`

##### `discoverTargetFiles` — Summary
Locates workspace files that should receive Live Documentation generation.

##### `discoverTargetFiles` — Remarks
When `options.changedOnly` is `true`, the discovery set is intersected with
files currently marked as changed in git, allowing quick iterations that only
regenerate touched artifacts.

##### `discoverTargetFiles` — Parameters
- `options.changedOnly`: When `true`, restricts results to files with local modifications.
- `options.config`: Live Documentation configuration describing default globs and overrides.
- `options.include`: Optional override set limiting discovery to pre-selected relative paths.
- `options.workspaceRoot`: Absolute path to the repository root the CLI is operating in.

##### `discoverTargetFiles` — Returns
A sorted array of absolute, workspace-resolved file paths ready for analysis.

##### `discoverTargetFiles` — Examples
```ts
const files = await discoverTargetFiles({
  workspaceRoot,
  config,
  include: new Set(["packages/server/src/index.ts"]),
  changedOnly: false
});
```

##### `discoverTargetFiles` — Links
- `detectChangedFiles` — *

#### `buildWorkspaceSymbolIndex` {#symbol-buildworkspacesymbolindex}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L442)

##### `buildWorkspaceSymbolIndex` — Summary
Builds a workspace-wide symbol index for cross-Live-Doc type reference resolution.

##### `buildWorkspaceSymbolIndex` — Remarks
This function performs a lightweight pre-scan of all target files to collect
exported symbols and their locations. The resulting index enables type references
in one Live Doc to link to type definitions in other Live Docs.

The index is keyed by symbol name (case-sensitive) and maps to an array of
locations, allowing for multiple symbols with the same name from different files.

##### `buildWorkspaceSymbolIndex` — Parameters
- `options`: Configuration for the index build.
- `options.docExtension`: File extension for Live Docs (e.g., ".mdmd.md").
- `options.liveDocsRoot`: Workspace-relative path to the Live Docs root (e.g., ".mdmd/layer-4").
- `options.targetFiles`: Absolute paths to all files being processed.
- `options.workspaceRoot`: Absolute path to the workspace root.

##### `buildWorkspaceSymbolIndex` — Returns
A map from symbol names to their resolved Live Doc locations.

##### `buildWorkspaceSymbolIndex` — Examples
```typescript
const index = await buildWorkspaceSymbolIndex({
  targetFiles: ["/workspace/src/types.ts", "/workspace/src/core.ts"],
  workspaceRoot: "/workspace",
  liveDocsRoot: ".mdmd/layer-4",
  docExtension: ".mdmd.md"
});
// index.get("Widget") => [{ liveDocPath: ".mdmd/layer-4/src/types.ts.mdmd.md", ... }]
```

##### `buildWorkspaceSymbolIndex` — Links
- `ResolvedSymbolLocation`
- `WorkspaceSymbolIndex` — *

#### `resolveTypeToLiveDoc` {#symbol-resolvetypetolivedoc}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L528)
- Returns: `ResolvedSymbolLocation`
- Parameters: `index`: `WorkspaceSymbolIndex`

##### `resolveTypeToLiveDoc` — Summary
Resolves a type name to its Live Doc location using the workspace symbol index.

##### `resolveTypeToLiveDoc` — Remarks
Returns undefined if the type is not found in the index. When multiple
symbols with the same name exist, returns the first match (future enhancement:
could use import context to disambiguate).

##### `resolveTypeToLiveDoc` — Parameters
- `currentSourcePath`: The source path of the file being rendered (to avoid self-links).
- `index`: The workspace-wide symbol index.
- `typeName`: The type name to resolve (e.g., "Widget", "Foo.Bar").

##### `resolveTypeToLiveDoc` — Returns
The resolved location, or undefined if not found.

#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L570)
- Returns: [`LiveDocumentationArchetype`](../config/liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationarchetype)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationconfig)

##### `resolveArchetype` — Summary
Determines which Live Documentation archetype applies to a given source file.

##### `resolveArchetype` — Remarks
Explicit `archetypeOverrides` from the configuration take precedence. When no
overrides match, common fixture and test naming conventions are used as a
fallback before defaulting to the `implementation` archetype.

##### `resolveArchetype` — Parameters
- `config`: Live Documentation configuration containing archetype overrides.
- `sourcePath`: Workspace-relative source path using forward slashes.

##### `resolveArchetype` — Returns
The archetype that should be reflected in the generated markdown metadata.

##### `resolveArchetype` — Examples
```ts
const archetype = resolveArchetype("packages/app/src/main.test.ts", config);
// archetype === "test"
```

#### `hasMeaningfulAuthoredContent` {#symbol-hasmeaningfulauthoredcontent}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L616)

##### `hasMeaningfulAuthoredContent` — Summary
Checks whether an authored markdown block carries information beyond the default placeholders.

##### `hasMeaningfulAuthoredContent` — Parameters
- `authoredBlock`: Raw markdown captured between the `## Authored` markers.

##### `hasMeaningfulAuthoredContent` — Returns
`true` when the block contains substantive content, otherwise `false`.

#### `directoryExists` {#symbol-directoryexists}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L638)

#### `cleanupEmptyParents` {#symbol-cleanupemptyparents}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L658)

##### `cleanupEmptyParents` — Summary
Recursively removes empty directories from `startDir` up to (but excluding) `stopDir`.

##### `cleanupEmptyParents` — Remarks
The walk stops as soon as a directory contains any entries or when the
`stopDir` boundary is reached, preventing accidental deletion outside the Live
Doc mirror.

##### `cleanupEmptyParents` — Parameters
- `startDir`: Directory that was just emptied (for example, a deleted Live Doc path).
- `stopDir`: Absolute directory boundary that must remain intact.

#### `analyzeSourceFile` {#symbol-analyzesourcefile}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L705)

##### `analyzeSourceFile` — Summary
Produces symbol and dependency analysis for a single source artifact.

##### `analyzeSourceFile` — Remarks
Language-specific adapters run before falling back to the built-in
TypeScript/JavaScript parser. This lets polyglot fixtures supply rich metadata
without requiring the TypeScript compiler to understand those languages.

##### `analyzeSourceFile` — Parameters
- `absolutePath`: Absolute filesystem path to the source file under inspection.
- `workspaceRoot`: Workspace root used to normalise relative dependency paths.

##### `analyzeSourceFile` — Returns
Analyzer output describing exported symbols and detected dependencies.

##### `analyzeSourceFile` — Examples
```ts
const analysis = await analyzeSourceFile(srcPath, workspaceRoot);
if (analysis.symbols.length === 0) {
  console.warn("No exports detected");
}
```

#### `inferScriptKind` {#symbol-inferscriptkind}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L773)
- Returns: `ts.ScriptKind`

##### `inferScriptKind` — Summary
Maps a file extension to the TypeScript compiler script kind used for parsing.

##### `inferScriptKind` — Parameters
- `extension`: Lowercase file extension including the leading dot.

##### `inferScriptKind` — Returns
The matching `ts.ScriptKind`, defaulting to `Unknown` for unsupported types.

#### `collectExportedSymbols` {#symbol-collectexportedsymbols}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L799)
- Returns: `PublicSymbolEntry`[]
- Parameters: `sourceFile`: `ts.SourceFile`

##### `collectExportedSymbols` — Summary
Scans a TypeScript source file for exported declarations and captures their metadata.

##### `collectExportedSymbols` — Parameters
- `sourceFile`: Parsed TypeScript source file produced by the compiler host.

##### `collectExportedSymbols` — Returns
A location-sorted list of exported symbols suitable for Live Doc rendering.

#### `collectDependencies` {#symbol-collectdependencies}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1538)

##### `collectDependencies` — Summary
Enumerates import and export dependencies declared within a TypeScript source file.

##### `collectDependencies` — Remarks
Relative specifiers are resolved against the workspace using Node-style extension
fallbacks so the resulting Live Docs can point to concrete files when possible.

##### `collectDependencies` — Parameters
- `params.absolutePath`: Absolute path to the origin file, used for resolution.
- `params.sourceFile`: Parsed source file that acts as the dependency origin.
- `params.workspaceRoot`: Workspace root for normalising resolved paths.

##### `collectDependencies` — Returns
A sorted list of dependency entries describing specifiers and imported symbols.

##### `collectDependencies` — Links
- `resolveDependency` — *

#### `resolveDependency` {#symbol-resolvedependency}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1903)

##### `resolveDependency` — Summary
Resolves a relative module specifier to a workspace-relative file path.

##### `resolveDependency` — Parameters
- `fromFile`: Absolute path to the file containing the specifier.
- `specifier`: Module specifier as written in the source file (for example, "./utils").
- `workspaceRoot`: Workspace root used to convert to a relative path.

##### `resolveDependency` — Returns
The normalised relative path when resolution succeeds, otherwise `undefined`.

##### `resolveDependency` — Links
- `collectDependencies` — *

#### `PublicSymbolHeadingInfo` {#symbol-publicsymbolheadinginfo}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2059)

##### `PublicSymbolHeadingInfo` — Summary
Renders the markdown lines that populate the `Public Symbols` section for a Live Doc.

##### `PublicSymbolHeadingInfo` — Remarks
The output includes symbol metadata (type, location, qualifiers) followed by
deterministic `#####` subsections per documented field (summary, remarks,
parameters, returns, etc.). This structure keeps docstring bridges stable and
individually addressable across languages.

##### `PublicSymbolHeadingInfo` — Parameters
- `args.analysis`: Analyzer output describing exported symbols and dependencies.
- `args.docDir`: Absolute directory path of the Live Doc being written.
- `args.sourceAbsolute`: Absolute path to the source file backing this Live Doc.
- `args.sourceRelativePath`: Workspace-relative source path (unused here but
preserved for parity with other render helpers).
- `args.workspaceRoot`: Workspace root, used to resolve relative links.

##### `PublicSymbolHeadingInfo` — Returns
An array of markdown lines ready to insert beneath the `Public Symbols` heading.

##### `PublicSymbolHeadingInfo` — Examples
```ts
const lines = renderPublicSymbolLines({
  analysis,
  docDir,
  sourceAbsolute,
  workspaceRoot,
  sourceRelativePath
});
```

##### `PublicSymbolHeadingInfo` — Links
- `renderDependencyLines`

#### `computePublicSymbolHeadingInfo` {#symbol-computepublicsymbolheadinginfo}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2069)
- Returns: `PublicSymbolHeadingInfo`[]
- Parameters: `symbols`: `PublicSymbolEntry`[]

#### `renderPublicSymbolLines` {#symbol-renderpublicsymbollines}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2190)

#### `renderDependencyLines` {#symbol-renderdependencylines}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2581)

##### `renderDependencyLines` — Summary
Renders the markdown bullet list for a Live Doc's `Dependencies` section.

##### `renderDependencyLines` — Remarks
Module specifiers that resolve inside the workspace are linked directly to
their Live Doc counterparts, while external dependencies are emitted as inline
code with optional symbol suffixes.

##### `renderDependencyLines` — Parameters
- `args.analysis`: Analyzer output describing imported and re-exported modules.
- `args.docDir`: Directory containing the Live Doc being written.
- `args.liveDocsRootAbsolute`: Absolute path to the Live Docs mirror root.
- `args.workspaceRoot`: Workspace root used to compute relative links.

##### `renderDependencyLines` — Returns
Markdown lines suitable for the `Dependencies` section, or an empty array when none exist.

##### `renderDependencyLines` — Links
- `renderPublicSymbolLines` — *

#### `renderReExportedAnchorLines` {#symbol-renderreexportedanchorlines}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2716)

#### `formatSourceLink` {#symbol-formatsourcelink}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2766)

#### `formatRelativePathFromDoc` {#symbol-formatrelativepathfromdoc}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2771)

#### `createSymbolSlug` {#symbol-createsymbolslug}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2779)

#### `toModuleLabel` {#symbol-tomodulelabel}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2788)

#### `formatInlineCode` {#symbol-formatinlinecode}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2794)

#### `formatDependencyQualifier` {#symbol-formatdependencyqualifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2799)
- Parameters: `dependency`: `DependencyEntry`

#### `resolveExportAssignmentName` {#symbol-resolveexportassignmentname}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2813)
- Parameters: `expression`: `ts.Expression`

#### `hasExportModifier` {#symbol-hasexportmodifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2823)
- Parameters: `node`: `ts.Node`

#### `hasDefaultModifier` {#symbol-hasdefaultmodifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2831)
- Parameters: `node`: `ts.Node`

#### `getNodeLocation` {#symbol-getnodelocation}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2839)
- Returns: `LocationInfo`
- Parameters: `node`: `ts.Node`; `sourceFile`: `ts.SourceFile`

#### `extractJsDocDocumentation` {#symbol-extractjsdocdocumentation}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2848)
- Returns: `SymbolDocumentation`
- Parameters: `node`: `ts.Node`

#### `displayDependencyKey` {#symbol-displaydependencykey}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L3170)
- Parameters: `entry`: `DependencyEntry`

#### `detectChangedFiles` {#symbol-detectchangedfiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L3174)

#### `parsePorcelainLine` {#symbol-parseporcelainline}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L3196)

#### `execFileAsync` {#symbol-execfileasync}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L3218)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:child_process` - `execFile`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`liveDocumentationConfig.LiveDocumentationArchetype`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype)
- [`liveDocumentationConfig.LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`index.analyzeWithLanguageAdapters`](./adapters/index.ts.mdmd.md#symbol-analyzewithlanguageadapters)
- [`dom.inferDomDependencies`](./heuristics/dom.ts.mdmd.md#symbol-inferdomdependencies)
- [`githubSlugger.slug`](../tooling/githubSlugger.ts.mdmd.md#symbol-slug)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `typescript` - `ts`
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

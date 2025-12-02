# packages/shared/src/live-docs/core.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/core.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-core-ts
- Generated At: 2025-12-02T06:21:23.078Z

## Authored
### Purpose
Implements the shared Live Docs extraction engine—scanning source trees, collecting exports/dependencies, and emitting structured metadata consumed by generators and analytics.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]

### Notes
- Refactored out of the server generator so adapters and CLI tooling could reuse a single discovery pipeline across packages.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md#turn-12-stage-0-complete-with-config--staging-tree-lines-2021-2160]
- Extended on Nov 12 to power adapter registries and polyglot fixture generation, adding hooks the co-activation analytics now depend on.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md#turn-08-stand-up-co-activation-infrastructure-lines-1101-1220]
- Enriched with docstring extraction work that guarantees Live Docs capture structured JSDoc output for downstream evidence.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-14-instructions-drift--legacy-layer-4-cleanup-lines-1321-1400]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-02T06:21:23.078Z","inputHash":"61e2c03dfaa01c63"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SourceAnalysisResult` {#symbol-sourceanalysisresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L16)

#### `PublicSymbolEntry` {#symbol-publicsymbolentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L22)

#### `DependencyEntry` {#symbol-dependencyentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L32)

#### `ReExportedSymbolInfo` {#symbol-reexportedsymbolinfo}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L42)

#### `LocationInfo` {#symbol-locationinfo}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L50)

#### `SymbolDocumentationField` {#symbol-symboldocumentationfield}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L55)

#### `SymbolDocumentationParameter` {#symbol-symboldocumentationparameter}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L67)

#### `SymbolDocumentationException` {#symbol-symboldocumentationexception}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L72)

#### `SymbolDocumentationExample` {#symbol-symboldocumentationexample}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L77)

#### `SymbolDocumentationLinkKind` {#symbol-symboldocumentationlinkkind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L83)

#### `SymbolDocumentationLink` {#symbol-symboldocumentationlink}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L85)

#### `SymbolDocumentation` {#symbol-symboldocumentation}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L91)

#### `SUPPORTED_SCRIPT_EXTENSIONS` {#symbol-supported_script_extensions}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L106)

#### `MODULE_RESOLUTION_EXTENSIONS` {#symbol-module_resolution_extensions}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L117)

#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L184)

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

#### `resolveArchetype` {#symbol-resolvearchetype}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L238)

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
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L267)

##### `hasMeaningfulAuthoredContent` — Summary
Checks whether an authored markdown block carries information beyond the default placeholders.

##### `hasMeaningfulAuthoredContent` — Parameters
- `authoredBlock`: Raw markdown captured between the `## Authored` markers.

##### `hasMeaningfulAuthoredContent` — Returns
`true` when the block contains substantive content, otherwise `false`.

#### `directoryExists` {#symbol-directoryexists}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L289)

#### `cleanupEmptyParents` {#symbol-cleanupemptyparents}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L309)

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
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L356)

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
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L424)

##### `inferScriptKind` — Summary
Maps a file extension to the TypeScript compiler script kind used for parsing.

##### `inferScriptKind` — Parameters
- `extension`: Lowercase file extension including the leading dot.

##### `inferScriptKind` — Returns
The matching `ts.ScriptKind`, defaulting to `Unknown` for unsupported types.

#### `collectExportedSymbols` {#symbol-collectexportedsymbols}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L450)

##### `collectExportedSymbols` — Summary
Scans a TypeScript source file for exported declarations and captures their metadata.

##### `collectExportedSymbols` — Parameters
- `sourceFile`: Parsed TypeScript source file produced by the compiler host.

##### `collectExportedSymbols` — Returns
A location-sorted list of exported symbols suitable for Live Doc rendering.

#### `collectDependencies` {#symbol-collectdependencies}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L637)

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
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1002)

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
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1158)

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
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1168)

#### `renderPublicSymbolLines` {#symbol-renderpublicsymbollines}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1289)

#### `renderDependencyLines` {#symbol-renderdependencylines}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1509)

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
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1644)

#### `formatSourceLink` {#symbol-formatsourcelink}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1694)

#### `formatRelativePathFromDoc` {#symbol-formatrelativepathfromdoc}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1699)

#### `createSymbolSlug` {#symbol-createsymbolslug}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1707)

#### `toModuleLabel` {#symbol-tomodulelabel}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1716)

#### `formatInlineCode` {#symbol-formatinlinecode}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1722)

#### `formatDependencyQualifier` {#symbol-formatdependencyqualifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1727)

#### `resolveExportAssignmentName` {#symbol-resolveexportassignmentname}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1741)

#### `hasExportModifier` {#symbol-hasexportmodifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1751)

#### `hasDefaultModifier` {#symbol-hasdefaultmodifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1759)

#### `getNodeLocation` {#symbol-getnodelocation}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1767)

#### `extractJsDocDocumentation` {#symbol-extractjsdocdocumentation}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L1776)

#### `displayDependencyKey` {#symbol-displaydependencykey}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2098)

#### `detectChangedFiles` {#symbol-detectchangedfiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2102)

#### `parsePorcelainLine` {#symbol-parseporcelainline}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2124)

#### `execFileAsync` {#symbol-execfileasync}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/core.ts#L2146)
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

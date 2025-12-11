# packages/shared/src/live-docs/dependencies.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/dependencies.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-dependencies-ts
- Generated At: 2025-12-11T02:41:27.795Z

## Authored
### Purpose
Dependency collection and resolution for Live Documentation. Extracts import/export dependencies from TypeScript source files and resolves module specifiers to workspace-relative paths using Node-style extension fallbacks.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `collectDependencies()` walks AST statements for imports and re-exports, returning sorted `DependencyEntry[]`
- `resolveDependency()` handles relative specifiers with extension probing (`.ts`, `.tsx`, `.mts`, etc.)
- `mergeDependencyEntries()` combines symbol lists when multiple imports reference the same module
- `augmentWithReExportedSymbols()` handles star exports (`export * from`) by parsing target modules
- 561 lines — largest extraction from core.ts, reflecting the complexity of module resolution

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:41:27.795Z","inputHash":"fc2a3e4a7a81d479"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `collectDependencies` {#symbol-collectdependencies}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/dependencies.ts#L44)

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

#### `mergeDependencyEntries` {#symbol-mergedependencyentries}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/dependencies.ts#L148)
- Returns: [`DependencyEntry`](./core.ts.mdmd.md#symbol-dependencyentry)[]
- Parameters: `base`: [`DependencyEntry`](./core.ts.mdmd.md#symbol-dependencyentry)[]; `extras`: [`DependencyEntry`](./core.ts.mdmd.md#symbol-dependencyentry)[]

##### `mergeDependencyEntries` — Summary
Merges additional dependency entries into a base list, combining symbols.

##### `mergeDependencyEntries` — Parameters
- `base`: The original dependency list
- `extras`: Additional dependencies to merge

##### `mergeDependencyEntries` — Returns
A merged, sorted dependency list

#### `resolveDependency` {#symbol-resolvedependency}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/dependencies.ts#L237)

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

#### `shouldInferDomDependencies` {#symbol-shouldinferdomdependencies}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/dependencies.ts#L369)

##### `shouldInferDomDependencies` — Summary
Checks if DOM dependency inference should run for a file type.

#### `augmentWithReExportedSymbols` {#symbol-augmentwithreexportedsymbols}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/dependencies.ts#L393)

##### `augmentWithReExportedSymbols` — Summary
Augments symbol list with re-exported symbols from star exports.

For pure barrel files (no existing symbols), re-exports are returned in the
`reExports` array rather than being added to `symbols`. This ensures:
- The "Public Symbols" section correctly shows no declared symbols
- The "Re-Exported Symbol Anchors" section lists what the barrel re-exports
- Precision metrics remain accurate (re-exports aren't declared in the file)

##### `augmentWithReExportedSymbols` — Parameters
- `params`: Parameters for augmentation

##### `augmentWithReExportedSymbols` — Returns
Object containing augmented symbols and re-export info
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`coreConstants.MODULE_RESOLUTION_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-module_resolution_extensions)
- [`coreConstants.SUPPORTED_SCRIPT_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-supported_script_extensions)
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.ReExportedSymbolInfo`](./coreTypes.ts.mdmd.md#symbol-reexportedsymbolinfo) (type-only)
- [`coreUtils.displayDependencyKey`](./coreUtils.ts.mdmd.md#symbol-displaydependencykey)
- [`coreUtils.getNodeLocation`](./coreUtils.ts.mdmd.md#symbol-getnodelocation)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

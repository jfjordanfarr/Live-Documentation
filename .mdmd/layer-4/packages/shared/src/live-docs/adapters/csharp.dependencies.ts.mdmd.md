# packages/shared/src/live-docs/adapters/csharp.dependencies.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/csharp.dependencies.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-csharp-dependencies-ts
- Generated At: 2026-03-11T20:38:30.152Z

## Authored
### Purpose
Extracts dependencies from C# source files, including `using` directives, configuration key lookups, reflection-based type references, and Hangfire background job targets. Extracted from `csharp.ts` on 2025-12-10.

### Notes
- **Extraction Context:** This module handles the async/file-system-heavy portion of C# dependency analysis. The original `csharp.ts` had complex dependency resolution logic interleaved with symbol extraction — separating them improves testability and maintainability.
- **Configuration Detection:** `collectConfigKeys` and `collectConfigurationIndexerKeys` find `IConfiguration["key"]` and `GetValue<T>("key")` patterns, linking C# code to `appsettings.json` entries.
- **Reflection Resolution:** `resolveReflectionTargets` looks for `Type.GetType("Namespace.Class")` string literals and attempts to resolve them to actual `.cs` files by searching the workspace.
- **Hangfire Integration:** `collectHangfireTargets` detects `BackgroundJob.Enqueue<T>()` and `RecurringJob.AddOrUpdate<T>()` patterns, creating edges to the job handler types.
- **Companion Tests:** See [csharp.dependencies.unit.test.ts](./csharp.dependencies.unit.test.ts.mdmd.md) for 36 unit tests including file system operations with temp directory fixtures.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-11T20:38:30.152Z","inputHash":"a638349a98876c41"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExtractDependenciesParams` {#symbol-extractdependenciesparams}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L34)

##### `ExtractDependenciesParams` — Summary
Parameters for dependency extraction.

#### `extractDependencies` {#symbol-extractdependencies}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L51)
- Parameters: `params`: [`ExtractDependenciesParams`](#symbol-extractdependenciesparams)

##### `extractDependencies` — Summary
Extracts all dependencies from a C# source file.

##### `extractDependencies` — Parameters
- `params`: Extraction parameters

##### `extractDependencies` — Returns
Array of dependency entries

#### `collectConfigKeys` {#symbol-collectconfigkeys}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L152)

##### `collectConfigKeys` — Summary
Collects configuration keys using a given regex pattern.

##### `collectConfigKeys` — Parameters
- `content`: Source content to search
- `pattern`: Regex pattern with capture group for the key

##### `collectConfigKeys` — Returns
Set of matched keys

#### `collectConfigurationIndexerKeys` {#symbol-collectconfigurationindexerkeys}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L174)

##### `collectConfigurationIndexerKeys` — Summary
Collects configuration keys from IConfiguration indexer patterns.
Only matches identifiers that contain "config" (case-insensitive).

##### `collectConfigurationIndexerKeys` — Parameters
- `content`: Source content to search

##### `collectConfigurationIndexerKeys` — Returns
Set of configuration keys

#### `collectTypeNameLiterals` {#symbol-collecttypenameliterals}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L201)

##### `collectTypeNameLiterals` — Summary
Collects fully-qualified type name literals from string constants.
Looks for patterns like "MyNamespace.MyClass" in string literals.

##### `collectTypeNameLiterals` — Parameters
- `content`: Source content to search

##### `collectTypeNameLiterals` — Returns
Set of type names

#### `collectHangfireTargets` {#symbol-collecthangfiretargets}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L239)

##### `collectHangfireTargets` — Summary
Collects Hangfire background job target types.
Detects BackgroundJob.Enqueue<T>, RecurringJob.AddOrUpdate<T>, etc.

##### `collectHangfireTargets` — Parameters
- `content`: Source content to search

##### `collectHangfireTargets` — Returns
Set of target type names

#### `collectTypeIdentifiers` {#symbol-collecttypeidentifiers}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L296)

##### `collectTypeIdentifiers` — Summary
Collects variable identifiers declared with a specific type.

##### `collectTypeIdentifiers` — Parameters
- `content`: Source content to search
- `typeName`: Type name to search for (e.g., "IRecurringJobManager")

##### `collectTypeIdentifiers` — Returns
Set of variable identifiers

#### `locateNearestFile` {#symbol-locatenearestfile}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L321)

##### `locateNearestFile` — Summary
Locates the nearest file matching one of the candidate names,
searching from the source file's directory up to the workspace root.

##### `locateNearestFile` — Parameters
- `candidates`: List of filenames to search for
- `sourcePath`: Path to the source file
- `workspaceRoot`: Workspace root directory

##### `locateNearestFile` — Returns
Normalized workspace-relative path, or undefined if not found

#### `fileExists` {#symbol-fileexists}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L357)

##### `fileExists` — Summary
Checks if a file exists at the given path.

##### `fileExists` — Parameters
- `candidate`: Path to check

##### `fileExists` — Returns
True if the file exists

#### `resolveReflectionTargets` {#symbol-resolvereflectiontargets}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L374)
- Returns: [`PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry)[]

##### `resolveReflectionTargets` — Summary
Resolves reflection target type names to workspace files.

##### `resolveReflectionTargets` — Parameters
- `extractSymbolsFn`: Optional function to extract symbols from file content
- `typeNames`: Array of fully-qualified type names
- `workspaceRoot`: Workspace root directory

##### `resolveReflectionTargets` — Returns
Array of resolved dependency entries

#### `resolveReflectionTarget` {#symbol-resolvereflectiontarget}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L399)
- Returns: [`PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry)[]

##### `resolveReflectionTarget` — Summary
Resolves a single reflection target type name to a workspace file.

##### `resolveReflectionTarget` — Parameters
- `extractSymbolsFn`: Optional function to extract symbols from file content
- `typeName`: Fully-qualified type name (e.g., "MyNamespace.MyClass")
- `workspaceRoot`: Workspace root directory

##### `resolveReflectionTarget` — Returns
Resolved dependency entry, or undefined if not found

#### `readFileSafe` {#symbol-readfilesafe}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.dependencies.ts#L462)

##### `readFileSafe` — Summary
Safely reads a file, returning undefined on error.

##### `readFileSafe` — Parameters
- `filePath`: Path to the file

##### `readFileSafe` — Returns
File content or undefined
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

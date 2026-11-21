# `packages/engine/src/live-docs/adapters/csharp.dependencies.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/csharp.dependencies.ts`
- Generated At: 2026-11-21T18:54:36.672Z

## Authored
### Purpose
Extracts dependencies from C# source files, including `using` directives, configuration key lookups, reflection-based type references, and Hangfire background job targets. Extracted from `csharp.ts` on 2025-12-10.

### Notes
- **Extraction Context:** This module handles the async/file-system-heavy portion of C# dependency analysis. The original `csharp.ts` had complex dependency resolution logic interleaved with symbol extraction — separating them improves testability and maintainability.
- **Configuration Detection:** `collectConfigKeys` and `collectConfigurationIndexerKeys` find `IConfiguration["key"]` and `GetValue<T>("key")` patterns, linking C# code to `appsettings.json` entries.
- **Reflection Resolution:** `resolveReflectionTargets` looks for `Type.GetType("Namespace.Class")` string literals and attempts to resolve them to actual `.cs` files by searching the workspace.
- **Hangfire Integration:** `collectHangfireTargets` detects `BackgroundJob.Enqueue<T>()` and `RecurringJob.AddOrUpdate<T>()` patterns, creating edges to the job handler types.
- **Companion Tests:** See [csharp.dependencies.unit.test.ts](./csharp.dependencies.unit.test.ts.mdmd.md) for 36 unit tests including file system operations with temp directory fixtures.
- Since 2026-11-21 its patterns run over the file's text with every comment the syntax tree finds written over in spaces ([the comment guard](./commentGuard.test.ts.mdmd.md)): until then a key, a type or a job a comment named was read, `ConfigurationManager.AppSettings["EditContentImage"]` behind `//` among them, and a type a `<see cref="…"/>` named. On DNN 70 C# file pairs the compiler does not bind are gone and 16 it binds are no longer drawn, each found before only in a documentation comment while the compiler binds it through an inherited member or a member's type, which the reader does not read ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConfigReference` {#symbol-configreference}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L30)

##### `ConfigReference` — Summary
A configuration name the syntax tree found, with its key resolved from a literal or a constant.

#### `ResolvedTypeTarget` {#symbol-resolvedtypetarget}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L36)

##### `ResolvedTypeTarget` — Summary
A workspace file that declares the named type.

#### `TypeResolver` {#symbol-typeresolver}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L42)
- Returns: [`ResolvedTypeTarget`](#symbol-resolvedtypetarget)[]

##### `TypeResolver` — Summary
Resolves a simple or qualified type name to the workspace files that declare it.

#### `extractDynamicDependencies` {#symbol-extractdynamicdependencies}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L45)
- Returns: [`DependencyEntry`](../coreTypes.ts.mdmd.md#symbol-dependencyentry)[]

##### `extractDynamicDependencies` — Summary
Extracts the configuration, reflection and Hangfire dependencies of one C# file.

#### `collectConfigKeys` {#symbol-collectconfigkeys}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L85)

##### `collectConfigKeys` — Summary
Collects the first capture group of every match.

#### `collectConfigurationIndexerKeys` {#symbol-collectconfigurationindexerkeys}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L97)

##### `collectConfigurationIndexerKeys` — Summary
Keys read through an `IConfiguration` indexer, recognised by an identifier containing "config".

#### `collectTypeNameLiterals` {#symbol-collecttypenameliterals}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L110)

##### `collectTypeNameLiterals` — Summary
Dotted, capitalised names inside string literals, the shape of a type name passed to reflection.

#### `collectHangfireTargets` {#symbol-collecthangfiretargets}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L127)

##### `collectHangfireTargets` — Summary
Job types named in `BackgroundJob.Enqueue<T>`, `RecurringJob.AddOrUpdate<T>` and their instance forms.

#### `collectTypeIdentifiers` {#symbol-collecttypeidentifiers}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L156)

##### `collectTypeIdentifiers` — Summary
Variable identifiers declared with the given type name.

#### `locateNearestFile` {#symbol-locatenearestfile}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L174)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `locateNearestFile` — Summary
The nearest workspace file with one of the candidate names, from the source
file's folder up to the workspace root, named in any case as Windows reads
it (see {@link lookUpWorkspaceFile}). Candidates are tried in order in each
folder. Where a folder holds two files whose names differ only by case,
there is no answer: Windows could not hold both, and neither is chosen.

#### `resolveReflectionTargets` {#symbol-resolvereflectiontargets}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L188)
- Returns: [`DependencyEntry`](../coreTypes.ts.mdmd.md#symbol-dependencyentry)[]
- Parameters: `resolveType`: [`TypeResolver`](#symbol-typeresolver)

##### `resolveReflectionTargets` — Summary
One dependency per workspace file that declares any of the named types, carrying the type names as symbols.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dotnetPaths.folderOf`](./dotnetPaths.ts.mdmd.md#symbol-folderof)
- [`dotnetPaths.joinWorkspacePath`](./dotnetPaths.ts.mdmd.md#symbol-joinworkspacepath)
- [`dotnetPaths.lookUpWorkspaceFile`](./dotnetPaths.ts.mdmd.md#symbol-lookupworkspacefile)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`compareText`](../../tooling/compareText.ts.mdmd.md#symbol-comparetext)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

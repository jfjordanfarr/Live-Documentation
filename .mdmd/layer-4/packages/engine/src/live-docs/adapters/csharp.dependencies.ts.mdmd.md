# packages/engine/src/live-docs/adapters/csharp.dependencies.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/csharp.dependencies.ts
- Generated At: 2026-11-19T08:59:52.694Z

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
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConfigReference` {#symbol-configreference}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L29)

##### `ConfigReference` — Summary
A configuration name the syntax tree found, with its key resolved from a literal or a constant.

#### `ResolvedTypeTarget` {#symbol-resolvedtypetarget}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L35)

##### `ResolvedTypeTarget` — Summary
A workspace file that declares the named type.

#### `TypeResolver` {#symbol-typeresolver}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L41)
- Returns: [`ResolvedTypeTarget`](#symbol-resolvedtypetarget)[]

##### `TypeResolver` — Summary
Resolves a simple or qualified type name to the workspace files that declare it.

#### `extractDynamicDependencies` {#symbol-extractdynamicdependencies}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L44)

##### `extractDynamicDependencies` — Summary
Extracts the configuration, reflection and Hangfire dependencies of one C# file.

#### `collectConfigKeys` {#symbol-collectconfigkeys}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L82)

##### `collectConfigKeys` — Summary
Collects the first capture group of every match.

#### `collectConfigurationIndexerKeys` {#symbol-collectconfigurationindexerkeys}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L94)

##### `collectConfigurationIndexerKeys` — Summary
Keys read through an `IConfiguration` indexer, recognised by an identifier containing "config".

#### `collectTypeNameLiterals` {#symbol-collecttypenameliterals}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L107)

##### `collectTypeNameLiterals` — Summary
Dotted, capitalised names inside string literals, the shape of a type name passed to reflection.

#### `collectHangfireTargets` {#symbol-collecthangfiretargets}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L124)

##### `collectHangfireTargets` — Summary
Job types named in `BackgroundJob.Enqueue<T>`, `RecurringJob.AddOrUpdate<T>` and their instance forms.

#### `collectTypeIdentifiers` {#symbol-collecttypeidentifiers}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L153)

##### `collectTypeIdentifiers` — Summary
Variable identifiers declared with the given type name.

#### `locateNearestFile` {#symbol-locatenearestfile}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L165)

##### `locateNearestFile` — Summary
The nearest file with one of the candidate names, from the source file's directory up to the workspace root.

#### `fileExists` {#symbol-fileexists}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L184)

##### `fileExists` — Summary
True when the path names an existing file.

#### `resolveReflectionTargets` {#symbol-resolvereflectiontargets}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.dependencies.ts#L193)
- Returns: [`DependencyEntry`](../coreTypes.ts.mdmd.md#symbol-dependencyentry)[]
- Parameters: `resolveType`: [`TypeResolver`](#symbol-typeresolver)

##### `resolveReflectionTargets` — Summary
One dependency per workspace file that declares any of the named types, carrying the type names as symbols.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`compareText`](../../tooling/compareText.ts.mdmd.md#symbol-comparetext)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

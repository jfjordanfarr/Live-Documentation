# packages/engine/src/live-docs/adapters/manifest.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/manifest.ts
- Generated At: 2026-10-22T16:47:51.999Z

## Authored
### Purpose
What the package-manifest adapters share: the package as one `package` symbol at line 1, the context an adapter reads a manifest in, the lookup of a workspace manifest by the path a manifest writes or by the name it publishes, and the gathering of dependencies into the precedents' order (linked manifests by path, each with the names it publishes, then externals as `name@version` or the name alone). It also reads TOML for the two TOML manifests, through `smol-toml`.

### Notes
- Written on 2026-10-16 with the Cargo, pyproject, go.mod and pom adapters, which the `reachable` build of October 15 had left for a later pass ([the October 15–16 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-15.1.SUMMARIZED.md#turn-4)) and the owner approved with the TOML dependency ([Turn 3 of the October 16 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)): "That's a worthy dependency." The `package.json` branch of `json.ts` was moved onto it the same day, so that the five manifest readers write their dependencies one way.
- A manifest links only to a manifest of its own name (`manifestsPublishing` compares the basename): a crate, a Python distribution, a Go module, a Maven artifact and an npm package share one symbol kind, and before this filter a `package.json` dependency would have linked to any manifest publishing its name once other manifests published one.
- A workspace file is found through the file index only, never the file system, and never the manifest itself; without a file index nothing links and nothing is declared.
- A malformed TOML document reads as `undefined`, and the adapters then write an empty analysis, as the JSON adapter does for malformed JSON.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ManifestContext (interface)` {#symbol-manifestcontext-interface}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L26)

##### `ManifestContext (interface)` — Summary
What an adapter is given about the manifest it reads.

#### `manifestContext (function)` {#symbol-manifestcontext-function}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L36)
- Returns: [`ManifestContext`](#symbol-manifestcontext-interface)

##### `manifestContext (function)` — Summary
The context of the manifest at `absolutePath`.

#### `tableOf` {#symbol-tableof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L41)

##### `tableOf` — Summary
A TOML table as a record, or `undefined` for anything else (an array, a string, a date).

#### `stringOf` {#symbol-stringof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L47)

##### `stringOf` — Summary
A non-empty string, or `undefined`.

#### `readToml` {#symbol-readtoml}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L52)

##### `readToml` — Summary
A TOML document's root table, or `undefined` when the file cannot be read or is not valid TOML.

#### `packageSymbols` {#symbol-packagesymbols}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L61)
- Returns: [`PublicSymbolEntry`](../coreTypes.ts.mdmd.md#symbol-publicsymbolentry)[]

##### `packageSymbols` — Summary
The package a manifest names, as its one public symbol at line 1; none without a name.

#### `workspaceFile` {#symbol-workspacefile}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L66)
- Parameters: `context`: [`ManifestContext`](#symbol-manifestcontext-interface)

##### `workspaceFile` — Summary
The workspace-relative path of `absolute` when it is a workspace file other than the manifest itself.

#### `manifestIn` {#symbol-manifestin}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L73)
- Parameters: `context`: [`ManifestContext`](#symbol-manifestcontext-interface)

##### `manifestIn` — Summary
The manifest named `manifestName` in the directory a manifest writes, relative to `fromDirectory`, when the workspace holds it.

#### `manifestsPublishing` {#symbol-manifestspublishing}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L105)
- Returns: `PublishedPackage`[]
- Parameters: `context`: [`ManifestContext`](#symbol-manifestcontext-interface)

##### `manifestsPublishing` — Summary
The workspace manifests named `manifestName` that publish the package
`name`, the manifest itself left out, with the name each publishes. Names
are compared after `normalize`, for an ecosystem whose names are compared
loosely (Python's).

#### `publishedName` {#symbol-publishedname}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L115)
- Parameters: `context`: [`ManifestContext`](#symbol-manifestcontext-interface)

##### `publishedName` — Summary
The package a workspace manifest publishes, by the index, or `fallback` when the index does not say.

#### `ManifestDependencies` {#symbol-manifestdependencies}
- Type: class
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L124)

##### `ManifestDependencies` — Summary
What one manifest stands on, gathered and then written in the precedents' order: linked manifests by path, then externals by name.

#### `sortDeclared` {#symbol-sortdeclared}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/manifest.ts#L166)
- Returns: [`DeclaredEntry`](../coreTypes.ts.mdmd.md#symbol-declaredentry)[]
- Parameters: `declared`: `Iterable`

##### `sortDeclared` — Summary
Declared entries without repeats, in path order, then by reason and name.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`coreTypes.DeclaredEntry`](../coreTypes.ts.mdmd.md#symbol-declaredentry) (type-only)
- [`coreTypes.DependencyEntry`](../coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.PublicSymbolEntry`](../coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.ResolvedSymbolLocation`](../coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`openings.PACKAGE_KIND`](../openings.ts.mdmd.md#symbol-package_kind)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `smol-toml` - `parse`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

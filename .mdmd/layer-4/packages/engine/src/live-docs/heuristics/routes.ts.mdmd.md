# packages/engine/src/live-docs/heuristics/routes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/heuristics/routes.ts
- Generated At: 2026-09-28T16:48:39.092Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inferRouteDependencies` {#symbol-inferroutedependencies}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/heuristics/routes.ts#L38)
- Returns: [`DependencyEntry`](../coreTypes.ts.mdmd.md#symbol-dependencyentry)[]

##### `inferRouteDependencies` — Summary
Finds the route calls in a script and resolves each to the file that serves it.

##### `inferRouteDependencies` — Parameters
- `params.fileIndex`: The workspace's files, for the manifests that mark a home.
- `params.sourceFile`: The parsed script.
- `params.sourcePath`: Its workspace-relative path, to tell home from away.
- `params.symbolIndex`: The symbol index, which holds every served route.

#### `collectRouteCalls` {#symbol-collectroutecalls}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/heuristics/routes.ts#L84)
- Returns: `RouteCall`[]
- Parameters: `sourceFile`: `ts.SourceFile`

##### `collectRouteCalls` — Summary
Every route call in the script, in source order.

#### `urlText` {#symbol-urltext}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/heuristics/routes.ts#L165)
- Parameters: `node`: `ts.Expression`

##### `urlText` — Summary
The text of a URL expression, with `{}` standing for each part the script computes; undefined when nothing of it is written.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.WorkspaceFileIndex`](../adapters/index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`coreTypes.DependencyEntry`](../coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`openings.RoutePattern`](../openings.ts.mdmd.md#symbol-routepattern)
- [`openings.ServedRoute`](../openings.ts.mdmd.md#symbol-servedroute)
- [`openings.chooseServers`](../openings.ts.mdmd.md#symbol-chooseservers)
- [`openings.isHttpMethod`](../openings.ts.mdmd.md#symbol-ishttpmethod)
- [`openings.matchRoute`](../openings.ts.mdmd.md#symbol-matchroute)
- [`openings.routeSegments`](../openings.ts.mdmd.md#symbol-routesegments)
- [`openings.routeSymbolName`](../openings.ts.mdmd.md#symbol-routesymbolname)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

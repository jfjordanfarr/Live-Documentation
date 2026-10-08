# packages/engine/src/live-docs/heuristics/routes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/heuristics/routes.ts
- Generated At: 2026-10-08T19:04:55.313Z

## Authored
### Purpose
The routes a script calls. Over the TypeScript syntax tree of a script it finds the calls to `fetch`, `axios`, jQuery's `$.ajax` family and `XMLHttpRequest.open`, reads each one's method and URL as written with `{}` for the parts the script computes, and resolves each through `openings.ts` to the file that serves the route, as a dependency observed from a contract. A route nothing in the workspace serves stays as its name, an external dependency, so the map can still draw a door to something outside; a fetched file is not a route.

### Notes
- Written on 2026-09-28 with the openings ([Turn 34](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)); the estate's `portal.js` calling its own controllers is its case. `sourceAnalysis.ts` runs it on the script files the DOM heuristic runs on (`.js`, `.ts` and their kin), and only on the main pass, when it has the workspace symbol index that holds every served route; the pass that builds the index runs without it.
- Only what is written is read: a literal `method`, `type` or `url` property, a string, a template literal or a concatenation; a URL with nothing written is skipped, and an absolute URL looks away from home where a relative one looks at home. Adding a client library is one more branch in `routeCallOf` and a row in the design doc's table ([Openings](../../../../../../layer-3/openings.mdmd.md)).
- Measured by `routes.test.ts`.

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

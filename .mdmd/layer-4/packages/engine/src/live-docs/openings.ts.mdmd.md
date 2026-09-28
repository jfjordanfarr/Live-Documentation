# packages/engine/src/live-docs/openings.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/openings.ts
- Generated At: 2026-09-28T16:48:39.133Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ROUTE_KIND` {#symbol-route_kind}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L24)

##### `ROUTE_KIND` — Summary
The kind of a symbol that is a route a file serves.

#### `ADDRESS_KIND` {#symbol-address_kind}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L26)

##### `ADDRESS_KIND` — Summary
The kind of a symbol that is an address a service listens on.

#### `SQL_OBJECT_KINDS` {#symbol-sql_object_kinds}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L28)
- Returns: `ReadonlySet`

##### `SQL_OBJECT_KINDS` — Summary
The kinds of symbols a database script declares.

#### `RoutePattern` {#symbol-routepattern}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L37)

##### `RoutePattern` — Summary
A route as a call names it or a controller serves it: the method, when known, and the path's segments.

#### `routeSegments` {#symbol-routesegments}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L47)

##### `routeSegments` — Summary
The segments of a route template, without its scheme and host, leading `~/`
or `/`, query string, parameter constraints or optional marks.

#### `isHttpMethod` {#symbol-ishttpmethod}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L68)

##### `isHttpMethod` — Summary
True when the text looks like an HTTP method.

#### `routeSymbolName` {#symbol-routesymbolname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L73)

##### `routeSymbolName` — Summary
The name of a route symbol: the method, when known, then the normalised path.

#### `parseRouteSymbol` {#symbol-parseroutesymbol}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L79)
- Returns: [`RoutePattern`](#symbol-routepattern)

##### `parseRouteSymbol` — Summary
Reads a route symbol's name back into a pattern.

#### `routesMatch` {#symbol-routesmatch}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L89)
- Parameters: `call`: [`RoutePattern`](#symbol-routepattern); `served`: [`RoutePattern`](#symbol-routepattern)

##### `routesMatch` — Summary
True when a call names the served route: the same method when both are known, then segment by segment.

#### `ServedRoute` {#symbol-servedroute}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L112)

##### `ServedRoute` — Summary
A route some file serves, as the symbol index records it.

#### `servedRoutes` {#symbol-servedroutes}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L121)
- Returns: [`ServedRoute`](#symbol-servedroute)[]
- Parameters: `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `servedRoutes` — Summary
Every route symbol of the workspace, read once per index.

#### `matchRoute` {#symbol-matchroute}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L138)
- Returns: [`ServedRoute`](#symbol-servedroute)[]
- Parameters: `call`: [`RoutePattern`](#symbol-routepattern); `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `matchRoute` — Summary
The served routes a call matches, in index order.

#### `homeOf` {#symbol-homeof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L173)
- Parameters: `fileIndex`: `Iterable`

##### `homeOf` — Summary
The system a file belongs to: the directory of the nearest manifest above it
among the workspace's files, or the workspace root when there is none.

#### `chooseServers` {#symbol-chooseservers}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L200)
- Returns: [`ServedRoute`](#symbol-servedroute)[]
- Parameters: `matches`: [`ServedRoute`](#symbol-servedroute)[]; `fileIndex`: `Iterable`

##### `chooseServers` — Summary
Chooses among the files that serve a called route.

##### `chooseServers` — Remarks
A browser script calls its own site, so a server at home wins when there is
one; a server's HTTP client calls other systems, so a server away from home
wins. When only one side serves the route, that side is the answer, and
several servers on the chosen side are all kept, since the files alone
cannot say which one answers.

#### `SqlObjectName (interface)` {#symbol-sqlobjectname-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L213)

##### `SqlObjectName (interface)` — Summary
An object a database script declares or names: its last two name parts, lowercased, and whether a linked server carries it.

#### `sqlObjectName (function)` {#symbol-sqlobjectname-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L225)
- Returns: [`SqlObjectName`](#symbol-sqlobjectname-interface)

##### `sqlObjectName (function)` — Summary
Reads a written object name: brackets and quotes off, server and database qualifiers off, case folded.

#### `sqlDeclaredName` {#symbol-sqldeclaredname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L233)

##### `sqlDeclaredName` — Summary
The name of a database object as written, brackets and quotes off.

#### `stripSql` {#symbol-stripsql}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L244)

##### `stripSql` — Summary
SQL text without its comments and string literals, positions kept.

#### `SqlDeclaration` {#symbol-sqldeclaration}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L249)

##### `SqlDeclaration` — Summary
One object a script declares.

#### `sqlDeclarations` {#symbol-sqldeclarations}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L256)
- Returns: [`SqlDeclaration`](#symbol-sqldeclaration)[]

##### `sqlDeclarations` — Summary
Every object a script creates.

#### `SqlReference` {#symbol-sqlreference}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L266)

##### `SqlReference` — Summary
One object a script or a query names.

#### `sqlReferences` {#symbol-sqlreferences}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L274)
- Returns: [`SqlReference`](#symbol-sqlreference)[]

##### `sqlReferences` — Summary
Every object the text names after a verb that reads, writes, calls or alters it.

#### `DeclaredSqlObject` {#symbol-declaredsqlobject}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L298)

##### `DeclaredSqlObject` — Summary
A database object some script declares, as the symbol index records it.

#### `declaredSqlObjects` {#symbol-declaredsqlobjects}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L307)
- Returns: [`DeclaredSqlObject`](#symbol-declaredsqlobject)[]
- Parameters: `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `declaredSqlObjects` — Summary
Every procedure, table, view and function symbol of the workspace, read once per index.

#### `matchSqlObject` {#symbol-matchsqlobject}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L324)
- Returns: [`DeclaredSqlObject`](#symbol-declaredsqlobject)[]
- Parameters: `name`: [`SqlObjectName`](#symbol-sqlobjectname-interface); `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `matchSqlObject` — Summary
The declared objects a name matches: schema and object when both are written, the object alone otherwise.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
<!-- LIVE-DOC:END Dependencies -->

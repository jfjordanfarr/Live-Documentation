# packages/engine/src/live-docs/openings.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/openings.ts
- Generated At: 2026-10-09T20:42:16.370Z

## Authored
### Purpose
The vocabulary of what a file serves across a process boundary, and how a call finds the file that serves it. A route, an address, a procedure, a table, a view or a SQL function is a public symbol of the file that declares it, and its kind says which. This module names those kinds, normalises a route template to its segments and a served route to its symbol name, matches a call to the served routes segment by segment, tells a file's home by the nearest manifest above it and chooses between the servers at home and away, and reads what a SQL script declares and names with its comments and strings blanked. The edge that results carries the basis it was observed with, `contract` or `configuration`, never `source`.

### Notes
- Written on 2026-09-28 as the first of the five growths the vision's step 3 lists ([Turn 34](../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)), measured on the estate program: the hand-verified edges found went from 8 to 17 of 20 that day, the compiler's 37 unchanged. The design, the matching rules and what is not covered are in [Openings](../../../../../layer-3/openings.mdmd.md); the formats and prior art it was built from are in [the survey](../../../../../../AI-Agent-Workspace/Research/2026-09-28-system-scale-facts.md).
- Three places share these kinds: `board.ts` takes them as the door kinds a person may promise, `boardGraph.ts` reads them as the doors a thing serves, and the Explorer draws them. Since 2026-10-08 the kinds a manifest's doc publishes live here too (`PROJECT_KINDS`, `PACKAGE_KIND`, `MANIFEST_KINDS`), one vocabulary for the project and package adapters and the board's join, where three copies had been. A SQL function's kind is `sql-function`, not `function`, so that a database function is never read as a function of a source language; the first cut had it wrong and was corrected the same day ([Turn 45](../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-45)).
- Home and away is a presumption: a browser script calls its own site, so a server at home wins; a C# client calls other systems, so one away wins; when only one side serves the route it is taken, and several servers on the chosen side are all kept, since the files cannot say which answers. It decides the estate's one ambiguity, `api/payments` served by both the portal and the gateway. Confirming the host from configuration instead is a gap the design doc names.
- The caches are `WeakMap`s keyed on the symbol index and on the file index, so an index is scanned once per generation run and nothing outlives it; `homeOf` takes its file index as an object for that reason.
- The SQL scanner is regular expressions over text whose comments and string literals are replaced by spaces of the same length, so the line numbers of declarations stay right. A written name folds to its last two parts, lowercased; four parts, or an empty part in the middle, mark a linked server. Measured by `openings.test.ts`.

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

#### `PROJECT_KINDS` {#symbol-project_kinds}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L30)
- Returns: `ReadonlySet`

##### `PROJECT_KINDS` — Summary
The kinds of the symbol a project file publishes: what the project builds.

#### `PACKAGE_KIND` {#symbol-package_kind}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L32)

##### `PACKAGE_KIND` — Summary
The kind of the symbol a package manifest publishes.

#### `MANIFEST_KINDS` {#symbol-manifest_kinds}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L34)
- Returns: `ReadonlySet`

##### `MANIFEST_KINDS` — Summary
The kinds that mark a doc as a manifest's, whose external dependencies are what a thing stands on.

#### `RoutePattern` {#symbol-routepattern}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L43)

##### `RoutePattern` — Summary
A route as a call names it or a controller serves it: the method, when known, and the path's segments.

#### `routeSegments` {#symbol-routesegments}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L53)

##### `routeSegments` — Summary
The segments of a route template, without its scheme and host, leading `~/`
or `/`, query string, parameter constraints or optional marks.

#### `isHttpMethod` {#symbol-ishttpmethod}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L74)

##### `isHttpMethod` — Summary
True when the text looks like an HTTP method.

#### `routeSymbolName` {#symbol-routesymbolname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L79)

##### `routeSymbolName` — Summary
The name of a route symbol: the method, when known, then the normalised path.

#### `parseRouteSymbol` {#symbol-parseroutesymbol}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L85)
- Returns: [`RoutePattern`](#symbol-routepattern)

##### `parseRouteSymbol` — Summary
Reads a route symbol's name back into a pattern.

#### `routesMatch` {#symbol-routesmatch}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L95)
- Parameters: `call`: [`RoutePattern`](#symbol-routepattern); `served`: [`RoutePattern`](#symbol-routepattern)

##### `routesMatch` — Summary
True when a call names the served route: the same method when both are known, then segment by segment.

#### `ServedRoute` {#symbol-servedroute}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L118)

##### `ServedRoute` — Summary
A route some file serves, as the symbol index records it.

#### `servedRoutes` {#symbol-servedroutes}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L127)
- Returns: [`ServedRoute`](#symbol-servedroute)[]
- Parameters: `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `servedRoutes` — Summary
Every route symbol of the workspace, read once per index.

#### `matchRoute` {#symbol-matchroute}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L144)
- Returns: [`ServedRoute`](#symbol-servedroute)[]
- Parameters: `call`: [`RoutePattern`](#symbol-routepattern); `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `matchRoute` — Summary
The served routes a call matches, in index order.

#### `homeOf` {#symbol-homeof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L179)
- Parameters: `fileIndex`: `Iterable`

##### `homeOf` — Summary
The system a file belongs to: the directory of the nearest manifest above it
among the workspace's files, or the workspace root when there is none.

#### `chooseServers` {#symbol-chooseservers}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L206)
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
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L219)

##### `SqlObjectName (interface)` — Summary
An object a database script declares or names: its last two name parts, lowercased, and whether a linked server carries it.

#### `sqlObjectName (function)` {#symbol-sqlobjectname-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L231)
- Returns: [`SqlObjectName`](#symbol-sqlobjectname-interface)

##### `sqlObjectName (function)` — Summary
Reads a written object name: brackets and quotes off, server and database qualifiers off, case folded.

#### `sqlDeclaredName` {#symbol-sqldeclaredname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L239)

##### `sqlDeclaredName` — Summary
The name of a database object as written, brackets and quotes off.

#### `stripSql` {#symbol-stripsql}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L250)

##### `stripSql` — Summary
SQL text without its comments and string literals, positions kept.

#### `SqlDeclaration` {#symbol-sqldeclaration}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L255)

##### `SqlDeclaration` — Summary
One object a script declares.

#### `sqlDeclarations` {#symbol-sqldeclarations}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L262)
- Returns: [`SqlDeclaration`](#symbol-sqldeclaration)[]

##### `sqlDeclarations` — Summary
Every object a script creates.

#### `SqlReference` {#symbol-sqlreference}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L272)

##### `SqlReference` — Summary
One object a script or a query names.

#### `sqlReferences` {#symbol-sqlreferences}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L280)
- Returns: [`SqlReference`](#symbol-sqlreference)[]

##### `sqlReferences` — Summary
Every object the text names after a verb that reads, writes, calls or alters it.

#### `DeclaredSqlObject` {#symbol-declaredsqlobject}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L304)

##### `DeclaredSqlObject` — Summary
A database object some script declares, as the symbol index records it.

#### `declaredSqlObjects` {#symbol-declaredsqlobjects}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L313)
- Returns: [`DeclaredSqlObject`](#symbol-declaredsqlobject)[]
- Parameters: `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `declaredSqlObjects` — Summary
Every procedure, table, view and function symbol of the workspace, read once per index.

#### `sqlNameMatches` {#symbol-sqlnamematches}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L330)
- Parameters: `name`: [`SqlObjectName`](#symbol-sqlobjectname-interface); `declared`: [`SqlObjectName`](#symbol-sqlobjectname-interface)

##### `sqlNameMatches` — Summary
True when a written name names the declared object: schema and object when both are written, the object alone otherwise.

#### `matchSqlObject` {#symbol-matchsqlobject}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L338)
- Returns: [`DeclaredSqlObject`](#symbol-declaredsqlobject)[]
- Parameters: `name`: [`SqlObjectName`](#symbol-sqlobjectname-interface); `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `matchSqlObject` — Summary
The declared objects a name matches, by {@link sqlNameMatches}.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
<!-- LIVE-DOC:END Dependencies -->

# packages/engine/src/live-docs/openings.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/openings.ts
- Generated At: 2026-11-19T21:22:30.958Z

## Authored
### Purpose
The vocabulary of what a file serves across a process boundary, and how a call finds the file that serves it. A route, an address, a procedure, a table, a view or a SQL function is a public symbol of the file that declares it, and its kind says which. This module names those kinds, normalises a route template to its segments and a served route to its symbol name, matches a call to the served routes segment by segment, tells a file's home by the nearest manifest above it and chooses between the servers at home and away, and reads what a SQL script declares and names from its tokens. The edge that results carries the basis it was observed with, `contract` or `configuration`, never `source`.

### Notes
- Written on 2026-09-28 as the first of the five growths the vision's step 3 lists ([Turn 34](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)), measured on the estate program: the hand-verified edges found went from 8 to 17 of 20 that day, the compiler's 37 unchanged. The design, the matching rules and what is not covered are in [Openings](../../../../../layer-3/openings.mdmd.md); the formats and prior art it was built from are in [the survey](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/2026-09-28/Research/system-scale-facts.md).
- Three places share these kinds: `board.ts` takes them as the door kinds a person may promise, `boardGraph.ts` reads them as the doors a thing serves, and the Explorer draws them. Since 2026-10-08 the kinds a manifest's doc publishes live here too (`PROJECT_KINDS`, `PACKAGE_KIND`, `MANIFEST_KINDS`), one vocabulary for the project and package adapters and the board's join, where three copies had been. A SQL function's kind is `sql-function`, not `function`, so that a database function is never read as a function of a source language; the first cut had it wrong and was corrected the same day ([Turn 45](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-45)).
- Home and away is a presumption: a browser script calls its own site, so a server at home wins; a C# client calls other systems, so one away wins; when only one side serves the route it is taken, and several servers on the chosen side are all kept, since the files cannot say which answers. It decides the estate's one ambiguity, `api/payments` served by both the portal and the gateway. Confirming the host from configuration instead is a gap the design doc names.
- The caches are `WeakMap`s keyed on the symbol index and on the file index, so an index is scanned once per generation run and nothing outlives it; `homeOf` takes its file index as an object for that reason.
- The SQL reader reads tokens: a comment is dropped (T-SQL's block comments nest, and are read so), a string is one token, and a name quoted in brackets (`]]` standing for `]`) or double quotes is one token whose value is the name itself, whatever it holds. Each token carries the lines it spans in the file as it stands, so a declaration's line is its CREATE's. A `GO` alone on its line (T-SQL) or a `/` alone on its line (Oracle) ends a batch. A procedure, function or trigger must be the only statement of its T-SQL batch, so its body runs to the batch's end: a table created after one in the same batch is marked `inBody`, made when the module runs, which the SQL adapter does not publish (since 2026-11-19). A written name folds to its last two parts, lowercased; four parts, or an empty part in the middle, mark a linked server. A name is written back with `sqlWrittenName`, bare unless a part holds a dot, a bracket, a double quote or a space at either end, which is then bracketed, so that `sqlNameParts` reads it back into the same parts. Measured by `openings.test.ts`, and against Microsoft's T-SQL parser by `npm run oracle:sql` ([the SQL reader's probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)).
- Until 2026-11-19 the reader was regular expressions over the text with its comments and strings blanked by spaces. That blanking did not pass over a quoted name, so an apostrophe inside brackets opened a string: a tSQLt test named `[test that it doesn't fail]` ran its name across lines into the doc, which the graph reader then refused, and five tSQLt files stopped generation that way ([the cold run](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#every-crash)). It blanked line breaks too, so a comment or string spanning lines before a CREATE pulled its line up: 827 of the cold run's 1,620 tSQLt symbols pointed at the wrong line. And the text inside a bracketed name was read as code, so `[test it can execute if asked]` executed `if`. The first two were mended that day in the regular expressions, a commit each; the reader then moved to tokens, which ended the third and reads what the regular expressions could not tell.
- Since the evening of 2026-11-19 the reader reads the SQL a script executes from a string written out in full, as surely run as SQL standing bare: `EXEC ('…' + '…')`, `sp_executesql N'…'`, `OPENQUERY(server, '…')` and `EXEC (…) AT server`, with nested strings. What such a string creates is the script's symbol when the string runs in the script (inside a module's body it is made when the module runs, and on a linked server it is that server's); what it uses is the script's use, a name on the linked server written `server..schema.name` when it runs on one. A string with any computed part is not read. An `ALTER` of a procedure, function, view or trigger is a use; where the script itself creates the object (the "stub, then ALTER" idiom of an idempotent script: `EXEC('CREATE PROCEDURE x AS SELECT 1')` then `ALTER PROCEDURE x …`), the one symbol stands at the last `ALTER`, where its body is, since that is what a person reading the definition looks for; the stub is a placeholder. A written name's database and schema are now taken by their places, so a one-part name on a linked server, `server...name`, folds to `name`. On tSQLt this gave 28 symbols (`tSQLt.AssertStringIn` among them) and 32 dependency lines more, and ScriptDom's reading of the strings agreed with all of them ([the SQL reader's probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)).
- What a script names, since 2026-11-19: what it executes (`EXEC @rc = dbo.p` too), reads (`FROM`, each table of a comma list `FROM Users u, Roles r`, a table in parentheses `LEFT JOIN (dbo.T t JOIN …)`, `JOIN`, `APPLY`, a `MERGE`'s `USING`), writes (`INSERT`, `UPDATE`, `DELETE`, `MERGE`, with or without the optional `INTO` and `FROM`), truncates or alters as a table, what a foreign key `REFERENCES`, and every function it calls by a name of two or more parts (`tSQLt.Private_IsTestClass(@c)`), which is how T-SQL calls a scalar function of a schema; a call by one part (`CONVERT(…)`) is the engine's own. Before, the reader missed the calls, the comma lists, the parenthesised joins, `EXEC @rc =`, `APPLY`, `USING`, the foreign keys and the writes without their optional word; ScriptDom found them all missing on tSQLt and on DNN's provider scripts. A line ends at a line feed, a carriage return and line feed, or a carriage return alone, as ScriptDom and editors count them; a lone carriage return in one of DNN's scripts had put 23 declarations a line early.
- What a name stands for, read from the tokens around it: a temporary table (`#name`), a common table expression of the batch, a cursor a `FETCH … FROM` reads, an `UPDATE`'s or a `DELETE`'s target that is a table source of the statement's own `FROM` (an alias, `UPDATE c … FROM dbo.Customer AS c`, or a table variable's, `UPDATE Jobs … FROM @Jobs Jobs`), a service a `BEGIN DIALOG @h FROM SERVICE` names, an event or target an event session adds (`ADD EVENT sqlserver.rpc_completed (…)`), a method of the `xml` type on a column (`r.Lines.value('…', 'int')`, `CROSS APPLY r.Doc.nodes('…')`), the string PL/SQL's `EXECUTE IMMEDIATE` runs, the base type after `CREATE TYPE x FROM`, the login after `CREATE USER x FROM`, the `UPDATE` and `DELETE` of a foreign key's `ON UPDATE CASCADE`, and any word T-SQL reserves written bare (`EXECUTE AS`, `UPDATE STATISTICS`, `FROM OPENQUERY(…)`) are no objects, and make no reference. Nor, since a commit of its own the same day that revises the owner's rule of 2026-10-09 (see the SQL adapter's notes), is the engine's own: a name in the `sys` or `INFORMATION_SCHEMA` schema, or a one-part `OPENJSON`, `STRING_SPLIT` or `GENERATE_SERIES` called in a `FROM`. A common table expression is read across its batch, where T-SQL scopes it to its statement: a one-part name a later statement of the batch gives to a table of the same name is the price, which ScriptDom has not found on tSQLt.
- `OPENING_KINDS` and `isToolingFile` (2026-10-15): the symbol kinds that make a file an entry by what it serves, and the file names a tool reads and no file imports (`tsconfig*.json`, `*.config.*`, `Web.config`, `App.config`, `packages.config`, and since 2026-10-16 every package manifest by its name, from the list `homeOf` reads, whether or not it publishes a package), shared by the composition of the `Entry` lines and by the manifest reader, which passes such a file over when it looks for what a command runs.
- Since 2026-11-17 a development container's second configuration, one folder down (`.devcontainer/<name>/devcontainer.json`), is a tooling entry like the first: it is the third place the Dev Containers specification gives such a file, and this repository gained one that day for the host's graphics card, which the walk from the entry points then reported as a file nothing reaches ([the record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#work-notes-turns-8-to-10)). Two folders down is no documented place and is not one here.

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

#### `OPENING_KINDS` {#symbol-opening_kinds}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L36)
- Returns: `ReadonlySet`

##### `OPENING_KINDS` — Summary
The kinds of symbols that are openings: a file that serves one is an entry, since its caller is outside the scan.

#### `isToolingFile` {#symbol-istoolingfile}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L76)

##### `isToolingFile` — Summary
True when a file is one a tool reads and no file imports: by its name, a
package manifest ({@link isManifestFile}, whether or not it names a package, so
that a workspace's root `Cargo.toml` is one too), a compiler's or a runner's
configuration (`tsconfig.json`, `tsconfig.base.json`,
`vitest.config.ts`, `playwright.config.ts`), a .NET configuration
(`Web.config`, `App.config`) or package list (`packages.config`); by its
place, an editor's or a development container's configuration
(`.vscode/*.json`, `.devcontainer/devcontainer.json`, and since 2026-11-17 a
second configuration in a folder beside it), which discovery reads
since 2026-10-16 and nothing else names. Such a file is an entry by the
`tooling` reason, and a command that names one names an input, not the file
it runs.

#### `RoutePattern` {#symbol-routepattern}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L88)

##### `RoutePattern` — Summary
A route as a call names it or a controller serves it: the method, when known, and the path's segments.

#### `routeSegments` {#symbol-routesegments}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L98)

##### `routeSegments` — Summary
The segments of a route template, without its scheme and host, leading `~/`
or `/`, query string, parameter constraints or optional marks.

#### `isHttpMethod` {#symbol-ishttpmethod}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L119)

##### `isHttpMethod` — Summary
True when the text looks like an HTTP method.

#### `routeSymbolName` {#symbol-routesymbolname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L124)

##### `routeSymbolName` — Summary
The name of a route symbol: the method, when known, then the normalised path.

#### `parseRouteSymbol` {#symbol-parseroutesymbol}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L130)
- Returns: [`RoutePattern`](#symbol-routepattern)

##### `parseRouteSymbol` — Summary
Reads a route symbol's name back into a pattern.

#### `routesMatch` {#symbol-routesmatch}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L140)
- Parameters: `call`: [`RoutePattern`](#symbol-routepattern); `served`: [`RoutePattern`](#symbol-routepattern)

##### `routesMatch` — Summary
True when a call names the served route: the same method when both are known, then segment by segment.

#### `ServedRoute` {#symbol-servedroute}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L163)

##### `ServedRoute` — Summary
A route some file serves, as the symbol index records it.

#### `servedRoutes` {#symbol-servedroutes}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L172)
- Returns: [`ServedRoute`](#symbol-servedroute)[]
- Parameters: `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `servedRoutes` — Summary
Every route symbol of the workspace, read once per index.

#### `matchRoute` {#symbol-matchroute}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L189)
- Returns: [`ServedRoute`](#symbol-servedroute)[]
- Parameters: `call`: [`RoutePattern`](#symbol-routepattern); `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `matchRoute` — Summary
The served routes a call matches, in index order.

#### `homeOf` {#symbol-homeof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L222)
- Parameters: `fileIndex`: `Iterable`

##### `homeOf` — Summary
The system a file belongs to: the directory of the nearest manifest above it
among the workspace's files, or the workspace root when there is none.

#### `chooseServers` {#symbol-chooseservers}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L249)
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
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L262)

##### `SqlObjectName (interface)` — Summary
An object a database script declares or names: its last two name parts, lowercased, and whether a linked server carries it.

#### `sqlNameParts` {#symbol-sqlnameparts}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L268)

##### `sqlNameParts` — Summary
The parts of a written name, split at the dots outside its quoted names, each quoted name unquoted.

#### `sqlWrittenName` {#symbol-sqlwrittenname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L298)

##### `sqlWrittenName` — Summary
A name's parts written as one name: joined by dots, a part bare unless it
holds what would split it or misread it (a dot, a bracket, a double quote,
a space at either end), which is then quoted in brackets. So
`tests.[test it doesn't fail]` is written `tests.test it doesn't fail`, and
`[test fn.sums]` keeps its brackets, and {@link sqlNameParts} reads either
back into the same parts.

#### `sqlObjectName (function)` {#symbol-sqlobjectname-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L303)
- Returns: [`SqlObjectName`](#symbol-sqlobjectname-interface)

##### `sqlObjectName (function)` — Summary
Reads a written object name: quotes off, server and database qualifiers off, case folded.

#### `SqlDeclaration` {#symbol-sqldeclaration}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L682)

##### `SqlDeclaration` — Summary
One object a script declares.

#### `SqlReference` {#symbol-sqlreference}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L691)

##### `SqlReference` — Summary
One object a script or a query names.

#### `readSql` {#symbol-readsql}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L712)

##### `readSql` — Summary
What a script creates and what it names, read from its tokens batch by
batch: what it executes (`EXEC

##### `readSql` — Additional Documentation
- @rc = name` too; PL/SQL's `EXECUTE
IMMEDIATE` executes a string, which is not read), reads (`FROM`, `JOIN`,
`APPLY`, a `MERGE`'s `USING`), writes (`INSERT`, `UPDATE`, `DELETE`,
`MERGE`, with or without `INTO` and `FROM`), truncates or alters, what a
foreign key `REFERENCES`, and every function it calls by a name of two or
more parts. A name is no object of the database, and makes no reference,
when it is a temporary table (`#name`), a common table expression of its
batch, a cursor a `FETCH … FROM` reads, a service a `BEGIN DIALOG … FROM`
names, as an `UPDATE`'s or a `DELETE`'s target a table source of the
statement's own `FROM`, or the engine's own: a name in a system schema, a
built-in table function, or a method of the `xml` type.

#### `sqlDeclarations` {#symbol-sqldeclarations}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L878)
- Returns: [`SqlDeclaration`](#symbol-sqldeclaration)[]

##### `sqlDeclarations` — Summary
Every object a script creates.

#### `sqlReferences` {#symbol-sqlreferences}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L883)
- Returns: [`SqlReference`](#symbol-sqlreference)[]

##### `sqlReferences` — Summary
Every object the text names after a verb that reads, writes, calls or alters it.

#### `DeclaredSqlObject` {#symbol-declaredsqlobject}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L888)

##### `DeclaredSqlObject` — Summary
A database object some script declares, as the symbol index records it.

#### `declaredSqlObjects` {#symbol-declaredsqlobjects}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L897)
- Returns: [`DeclaredSqlObject`](#symbol-declaredsqlobject)[]
- Parameters: `index`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `declaredSqlObjects` — Summary
Every procedure, table, view and function symbol of the workspace, read once per index.

#### `sqlNameMatches` {#symbol-sqlnamematches}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L914)
- Parameters: `name`: [`SqlObjectName`](#symbol-sqlobjectname-interface); `declared`: [`SqlObjectName`](#symbol-sqlobjectname-interface)

##### `sqlNameMatches` — Summary
True when a written name names the declared object: schema and object when both are written, the object alone otherwise.

#### `matchSqlObject` {#symbol-matchsqlobject}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/openings.ts#L922)
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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-engine.mdmd.md`](../../../../../layer-3/live-documentation-engine.mdmd.md)
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../../layer-3/openings.mdmd.md)
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

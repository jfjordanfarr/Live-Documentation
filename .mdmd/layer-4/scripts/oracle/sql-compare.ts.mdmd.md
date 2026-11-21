# `scripts/oracle/sql-compare.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/sql-compare.ts`
- Entry: command `oracle:sql` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-21T05:37:49.995Z

## Authored
### Purpose
Grades the SQL reader against ScriptDom: `npm run oracle:sql -- <folder>` reads a folder's `.sql` files with the parser (or a fixture's kept record) and with the SQL adapter, a first pass for the symbols and a second with the index they make, as the generator does, and sets them side by side: the objects each script creates, by kind and name, and whether each found one stands at the CREATE's line; and the dependency lines each file's doc should carry, a link to the file that creates a used object or the name kept as written. It prints figures by kind and by how an object is used, every disagreement with `--detail`, a seeded draw of files with `--sample` and `--seed`, and what the scripts execute as strings.

### Notes
- Written on 2026-11-19 ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). What counts as a use, and what is set aside as no object of the folder, is stated once at the head of the file and applies to both sides alike: common table expressions, a statement's own table sources, temporary tables, SQL Server's `sys` and `INFORMATION_SCHEMA` schemas and the `xml` type's five methods. Until 2026-11-21 a one-part name matched an object of that name in any schema, the product's presumption too, so the grading could not fail on it.
- Since 2026-11-21 a used name is bound as T-SQL binds it, by the order Microsoft documents, each sentence quoted at the head of the file with its page: a written schema is itself; a one-part name in a procedure, function, view or trigger is its module's schema's, then `dbo`'s, except in the module's DDL and the strings it executes; everywhere else, and in `database..name`, it is the user's default schema's, which no text gives and is taken as `dbo`, the default a user is created with; a name neither schema holds binds to nothing, however many other schemas hold one. ScriptDom gives the parts of a name and the module that holds it; the documentation gives the binding. A link reached through a linked server is marked as such, as the adapter marks it a contract. An independent review had found the reader linking one name to every schema's object and reading `SisterDb..Orders` as a linked server's; on tSQLt, DNN and DNN's provider scripts the binding moved no figure, and `fixtures/sql-schemas` holds the cases ([the account](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).
- Ways of naming an object the reader does not claim (a drop, a grant, a type, SELECT INTO and the rest) are counted, with how many of them name an object the folder creates, and not graded, so that a reader of the figures sees what the map does not draw.
- Files the parser refuses are listed and left out of both sides' index; objects created only in such a file are therefore unresolved on both sides.
- Since the evening of 2026-11-19 it reads, through `readFacts`, every executed string written out in full that the parser reads: its creates are the script's objects when it runs in the script and not on a linked server, its uses are the script's (on the linked server, `server..schema.name`, when it runs on one), and an object the script creates and later alters stands at its last ALTER; an ALTER of a procedure, function, view or trigger is graded as a use ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)).
- The sample is a Fisher–Yates shuffle of the sorted list of graded files by a mulberry32 generator from the seed. The cold run's own draw of 2026-11-19 was not kept, so seed 1119 here is a draw of its own, not the cold run's twenty files.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GRADED_HOWS` {#symbol-graded_hows}
- Type: const
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L139)
- Returns: `ReadonlySet`

##### `GRADED_HOWS` — Summary
The ways of naming an object the grading counts as a use.

#### `readFacts` {#symbol-readfacts}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L152)
- Returns: `ReadFacts`

##### `readFacts` — Summary
The parser's facts of a file, and of every string it executes that is written out in full and parsed, nested strings included.

#### `writtenPart` {#symbol-writtenpart}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L189)

##### `writtenPart` — Summary
One name part as the product writes it in a symbol or a kept name: bare, or
in brackets when it holds what would split it or misread it (a dot, a
bracket, a double quote, a space at either end). Written here from the
product's documented form, not imported from it.

#### `writtenName` {#symbol-writtenname}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L194)
- Parameters: `name`: [`ScriptDomName`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomname)

##### `writtenName` — Summary
A parser's name in the product's written form: the parts written, from the first one present, a missing inner part empty.

#### `partsOfWritten` {#symbol-partsofwritten}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L201)

##### `partsOfWritten` — Summary
Reads a name the product wrote back into its parts: dots outside brackets split it, brackets come off and `]]` is `]`.

#### `isSqlServerOwn` {#symbol-issqlserverown}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L254)

##### `isSqlServerOwn` — Summary
Whether a used name is SQL Server's own: a system schema, or an `xml` method on a column.

#### `searchedSchemas` {#symbol-searchedschemas}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L274)

##### `searchedSchemas` — Summary
The schemas, in the order T-SQL searches them, in which a used name may bind, each case folded; a schema not written
is the default one. None when the name is on a linked server and omits its schema.

#### `bindName` {#symbol-bindname}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L287)
- Returns: `Created`[]
- Parameters: `created`: `Created`[]

##### `bindName` — Summary
The objects a used name binds to: those of its name in the first schema searched that holds one. An object created
without a written schema is in its creator's default schema, taken as `dbo`.

#### `SqlReport` {#symbol-sqlreport}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L426)

##### `SqlReport` — Summary
What the comparison found.

#### `drawSample` {#symbol-drawsample}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L474)

##### `drawSample` — Summary
Draws `count` of the files, in a Fisher–Yates shuffle of their sorted list by the seed, returned sorted.

#### `compareSql` {#symbol-comparesql}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L492)
- Parameters: `record`: [`ScriptDomRecord`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomrecord)

##### `compareSql` — Summary
Sets the adapter's reading of the graded files beside the parser's record.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- `node:process` - `process`
- [`sql.sqlAdapter`](../../packages/engine/src/live-docs/adapters/sql.ts.mdmd.md#symbol-sqladapter)
- [`core.DependencyEntry`](../../packages/engine/src/live-docs/core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../../packages/engine/src/live-docs/core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../../packages/engine/src/live-docs/coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`fixture.listFixtureFiles`](./fixture.ts.mdmd.md#symbol-listfixturefiles)
- [`sql-scriptdom.ScriptDomCreate`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomcreate)
- [`sql-scriptdom.ScriptDomDynamic`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomdynamic)
- [`sql-scriptdom.ScriptDomHow`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomhow)
- [`sql-scriptdom.ScriptDomModule`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdommodule)
- [`sql-scriptdom.ScriptDomName`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomname)
- [`sql-scriptdom.ScriptDomRecord`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomrecord)
- [`sql-scriptdom.ScriptDomReference`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomreference)
- [`sql-scriptdom.parseSqlFiles`](./sql-scriptdom.ts.mdmd.md#symbol-parsesqlfiles)
- [`sql-scriptdom.readScriptDomRecord`](./sql-scriptdom.ts.mdmd.md#symbol-readscriptdomrecord)
- [`sql-scriptdom.writeScriptDomRecord`](./sql-scriptdom.ts.mdmd.md#symbol-writescriptdomrecord)
<!-- LIVE-DOC:END Dependencies -->

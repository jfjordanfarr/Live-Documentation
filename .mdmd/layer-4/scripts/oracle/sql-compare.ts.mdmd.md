# scripts/oracle/sql-compare.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/sql-compare.ts
- Entry: command `oracle:sql` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-19T19:32:17.571Z

## Authored
### Purpose
Grades the SQL reader against ScriptDom: `npm run oracle:sql -- <folder>` reads a folder's `.sql` files with the parser (or a fixture's kept record) and with the SQL adapter, a first pass for the symbols and a second with the index they make, as the generator does, and sets them side by side: the objects each script creates, by kind and name, and whether each found one stands at the CREATE's line; and the dependency lines each file's doc should carry, a link to the file that creates a used object or the name kept as written. It prints figures by kind and by how an object is used, every disagreement with `--detail`, a seeded draw of files with `--sample` and `--seed`, and what the scripts execute as strings.

### Notes
- Written on 2026-11-19 ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). What counts as a use, and what is set aside as no object of the folder, is stated once at the head of the file and applies to both sides alike: common table expressions, a statement's own table sources, temporary tables, SQL Server's `sys` and `INFORMATION_SCHEMA` schemas and the `xml` type's five methods. Name matching is written here independently of the product: a one-part name matches an object of that name in any schema, two parts that schema and name, which is the product's presumption too, since T-SQL resolves a one-part name by the caller's default schema, which no text gives.
- Ways of naming an object the reader does not claim (a drop, a grant, a type, SELECT INTO and the rest) are counted, with how many of them name an object the folder creates, and not graded, so that a reader of the figures sees what the map does not draw.
- Files the parser refuses are listed and left out of both sides' index; objects created only in such a file are therefore unresolved on both sides.
- The sample is a Fisher–Yates shuffle of the sorted list of graded files by a mulberry32 generator from the seed. The cold run's own draw of 2026-11-19 was not kept, so seed 1119 here is a draw of its own, not the cold run's twenty files.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GRADED_HOWS` {#symbol-graded_hows}
- Type: const
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L73)
- Returns: `ReadonlySet`

##### `GRADED_HOWS` — Summary
The ways of naming an object the grading counts as a use.

#### `writtenPart` {#symbol-writtenpart}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L88)

##### `writtenPart` — Summary
One name part as the product writes it in a symbol or a kept name: bare, or in brackets when it holds what would split it.

#### `writtenName` {#symbol-writtenname}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L93)
- Parameters: `name`: [`ScriptDomName`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomname)

##### `writtenName` — Summary
A parser's name in the product's written form: the parts written, from the first one present, a missing inner part empty.

#### `partsOfWritten` {#symbol-partsofwritten}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L100)

##### `partsOfWritten` — Summary
Reads a name the product wrote back into its parts: dots outside brackets split it, brackets come off and `]]` is `]`.

#### `isSqlServerOwn` {#symbol-issqlserverown}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L151)

##### `isSqlServerOwn` — Summary
Whether a used name is SQL Server's own: a system schema, or an `xml` method on a column.

#### `SqlReport` {#symbol-sqlreport}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L281)

##### `SqlReport` — Summary
What the comparison found.

#### `drawSample` {#symbol-drawsample}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L329)

##### `drawSample` — Summary
Draws `count` of the files, in a Fisher–Yates shuffle of their sorted list by the seed, returned sorted.

#### `compareSql` {#symbol-comparesql}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-compare.ts#L347)
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
- [`sql-scriptdom.ScriptDomName`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomname)
- [`sql-scriptdom.ScriptDomRecord`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomrecord)
- [`sql-scriptdom.ScriptDomReference`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdomreference)
- [`sql-scriptdom.parseSqlFiles`](./sql-scriptdom.ts.mdmd.md#symbol-parsesqlfiles)
- [`sql-scriptdom.readScriptDomRecord`](./sql-scriptdom.ts.mdmd.md#symbol-readscriptdomrecord)
- [`sql-scriptdom.writeScriptDomRecord`](./sql-scriptdom.ts.mdmd.md#symbol-writescriptdomrecord)
<!-- LIVE-DOC:END Dependencies -->

# scripts/oracle/sql-scriptdom.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/sql-scriptdom.cs
- Entry: program
- Generated At: 2026-11-19T19:27:36.279Z

## Authored
### Purpose
The oracle for the SQL reader: a .NET file-based program that reads T-SQL files with Microsoft's own parser, ScriptDom, and prints, as JSON, what the parser says about each: its errors, every object it creates with the line of the CREATE and whether the script itself or a procedure's body creates it, every place a statement names a schema object and how (executed, read, written, called, referenced by a foreign key, dropped and so on), what a name stands for when the statement decides it (a common table expression, an alias, a temporary table), and every string the script executes with what the parser reads in it. Run through [`sql-scriptdom.ts`](./sql-scriptdom.ts.mdmd.md) by `npm run oracle:sql`.

### Notes
- Written on 2026-11-19, after a cold run on tSQLt found the SQL reader crashing on an apostrophe in a bracketed name and half its line numbers wrong ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). The guide's rule, that an adapter is graded by an oracle sharing no mechanism with it, had no oracle for SQL until then; ScriptDom was named as the candidate in [Openings](../../../layer-3/openings.mdmd.md).
- The package is pinned (170.191.0) in the file's `#:package` line; `dotnet run` fetches it from NuGet on the first run and caches it. The record names the parser's version, so a record kept by a fixture says which parser wrote it.
- Every node of the tree is held under its parent and property by reflection over the parser's public properties, so that a schema object's name is classified by what holds it; a name held anywhere the program does not know is still listed, as `other` with that parent and property, so nothing the parser sees is dropped. SQL Server's own data types (`SqlDataTypeReference`, `XmlDataTypeReference`) are not schema objects and are not listed.
- A file the parser cannot read gives only its errors: tSQLt's SQLCMD scripts and templates are such files, and the comparison sets them aside rather than grading the reader against a parser that has given up.
- Its types live in a namespace of their own: in the global namespace, the C# adapter, which takes every C# file of a workspace for one compilation, resolved the C# samples' own `Record` to this file's, as the first regeneration showed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ObjectName` {#symbol-objectname}
- Type: record
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L73)

##### `ObjectName` — Summary
A schema object's name as the parser holds it, each part unquoted; a part not written is null.

#### `ParseError` {#symbol-parseerror}
- Type: record
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L75)

#### `Create` {#symbol-create}
- Type: record
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L77)
- Parameters: `Name`: [`ObjectName`](#symbol-objectname)

#### `Reference` {#symbol-reference}
- Type: record
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L79)
- Parameters: `Name`: [`ObjectName`](#symbol-objectname)

#### `Dynamic (record)` {#symbol-dynamic-record}
- Type: record
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L81)
- Parameters: `ParseErrors`: [`ParseError`](#symbol-parseerror); `Creates`: [`Create`](#symbol-create); `References`: [`Reference`](#symbol-reference)

#### `FileFacts` {#symbol-filefacts}
- Type: record
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L83)
- Parameters: `ParseErrors`: [`ParseError`](#symbol-parseerror); `Creates`: [`Create`](#symbol-create); `References`: [`Reference`](#symbol-reference); `Dynamic`: [`Dynamic`](#symbol-dynamic-record)

#### `Record` {#symbol-record}
- Type: record
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L85)
- Parameters: `Files`: `SortedDictionary`, [`FileFacts`](#symbol-filefacts)

#### `Reading` {#symbol-reading}
- Type: class
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L88)

##### `Reading` — Summary
One file's, or one dynamic string's, reading.

#### `Read` {#symbol-read}
- Type: method
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L90)
- Returns: [`FileFacts`](#symbol-filefacts)

#### `Held` {#symbol-held}
- Type: record
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L104)
- Parameters: `Node`: `TSqlFragment`; `Parent`: `TSqlFragment`

##### `Held` — Summary
A node of the tree with the node and property that hold it.

#### `Walk (class)` {#symbol-walk-class}
- Type: class
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L106)

#### `Creates` {#symbol-creates}
- Type: property
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L108)

#### `References` {#symbol-references}
- Type: property
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L109)

#### `Dynamic (property)` {#symbol-dynamic-property}
- Type: property
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L110)

#### `Walk (constructor)` {#symbol-walk-constructor}
- Type: constructor
- Source: [source](../../../../scripts/oracle/sql-scriptdom.cs#L114)
- Parameters: `tree`: `TSqlFragment`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.SqlServer.TransactSql.ScriptDom`
<!-- LIVE-DOC:END Dependencies -->

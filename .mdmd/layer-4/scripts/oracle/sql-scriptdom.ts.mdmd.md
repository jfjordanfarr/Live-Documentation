# `scripts/oracle/sql-scriptdom.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/sql-scriptdom.ts`
- Generated At: 2026-11-21T07:25:44.873Z

## Authored
### Purpose
The TypeScript side of the SQL oracle: runs [`sql-scriptdom.cs`](./sql-scriptdom.cs.mdmd.md) through `dotnet` over the named files of a folder, types the record it prints, and keeps a fixture's record as `expected/sql-scriptdom.json` with its files named relative to the record, as [`files.ts`](./files.ts.mdmd.md) keeps the other oracles' records.

### Notes
- Written on 2026-11-19 with the emitter ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). The .NET SDK is needed only at development time; the integration suite reads the kept records.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ScriptDomName` {#symbol-scriptdomname}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L24)

##### `ScriptDomName` — Summary
A schema object's name as the parser holds it, each part unquoted; a part not written is absent.

#### `ScriptDomParseError` {#symbol-scriptdomparseerror}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L32)

##### `ScriptDomParseError` — Summary
An error the parser reported.

#### `ScriptDomKind` {#symbol-scriptdomkind}
- Type: type
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L39)

##### `ScriptDomKind` — Summary
The kinds of object a CREATE makes, as the record names them.

#### `ScriptDomCreate` {#symbol-scriptdomcreate}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L42)

##### `ScriptDomCreate` — Summary
A CREATE statement: what it makes, at the line and column of its first word, and whether the script itself runs it or a procedure's, function's or trigger's body does.

#### `ScriptDomHow` {#symbol-scriptdomhow}
- Type: type
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L51)

##### `ScriptDomHow` — Summary
How a statement names an object; `other` carries the parser's parent and property in `context`.

#### `ScriptDomModule` {#symbol-scriptdommodule}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L56)

##### `ScriptDomModule` — Summary
The procedure, function, view or trigger whose definition holds a reference: its name as written, and a trigger's table.

#### `ScriptDomReference` {#symbol-scriptdomreference}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L66)

##### `ScriptDomReference` — Summary
A place a statement names a schema object. `standsFor` says when the statement decides the name is not an object of
the database; `module` names the module whose definition holds it, when one does. The parser binds no name.

#### `ScriptDomDynamic` {#symbol-scriptdomdynamic}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L77)

##### `ScriptDomDynamic` — Summary
An `EXEC (…)` of a string, an `sp_executesql`, or an `EXEC

##### `ScriptDomDynamic` — Additional Documentation
- @variable `; when the text is written out, what the parser reads in it.

#### `ScriptDomFileFacts` {#symbol-scriptdomfilefacts}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L97)

##### `ScriptDomFileFacts` — Summary
What the parser says about one file.

#### `ScriptDomRecord` {#symbol-scriptdomrecord}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L105)

##### `ScriptDomRecord` — Summary
The parser's record of a folder, file by file, in folder-relative coordinates.

#### `parseSqlFiles` {#symbol-parsesqlfiles}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L115)
- Returns: [`ScriptDomRecord`](#symbol-scriptdomrecord)

##### `parseSqlFiles` — Summary
Runs the parser over the named files of a folder; `dotnet` must be on the path.

#### `writeScriptDomRecord` {#symbol-writescriptdomrecord}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L140)
- Parameters: `record`: [`ScriptDomRecord`](#symbol-scriptdomrecord)

##### `writeScriptDomRecord` — Summary
Writes the record beside a fixture's other expectations, each file named relative to the record, as the other oracles' records are.

#### `readScriptDomRecord` {#symbol-readscriptdomrecord}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-scriptdom.ts#L146)
- Returns: [`ScriptDomRecord`](#symbol-scriptdomrecord)

##### `readScriptDomRecord` — Summary
Reads a record a fixture keeps into fixture-relative coordinates, or undefined when it keeps none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:path` - `path`
- [`files.rebasePath`](./files.ts.mdmd.md#symbol-rebasepath)
<!-- LIVE-DOC:END Dependencies -->

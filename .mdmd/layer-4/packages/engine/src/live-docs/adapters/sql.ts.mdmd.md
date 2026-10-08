# packages/engine/src/live-docs/adapters/sql.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/sql.ts
- Generated At: 2026-09-28T16:48:38.737Z

## Authored
### Purpose
The adapter for SQL scripts. What a script creates, a procedure, a table, a view or a function, is a public symbol with that kind, so that a program's query can link to it and a board can show it as a door; what the script names after `FROM`, `JOIN`, `INSERT INTO`, `EXEC` and their kin is a dependency on the script that creates it, matched by name through the symbol index. A name in the same database is read from source; a name reached through a linked server is an edge observed from a contract, since only the name ties the two databases together.

### Notes
- Written on 2026-09-28 for the openings ([Turn 34](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)), so that the estate's posting procedure, which reads an Oracle table through a linked server, has an edge to that table's script. The owner's own chain ends there: "stored procedures in an onprem MS SQL Server, which itself may perform OraQueries into the (yuck) Oracle database at the center of everything" (their words of 2026-09-27 07:32 UTC in [the September 26 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/2026-09-26.1.md)). The scanning itself, declarations, references and the folding of names, lives in `openings.ts` so that the C# adapter reads SQL held in strings the same way; this file only maps it to symbols and dependencies.
- The whole adapter is one pass of regular expressions over the script with its comments and strings blanked; it reads the T-SQL and Oracle forms of `CREATE` and no dialect in full. [Openings](../../../../../../layer-3/openings.mdmd.md) names SQL Server's ScriptDom as a possible oracle; nothing measures this adapter against a parser yet.
- Measured by `sql.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `sqlAdapter` {#symbol-sqladapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/sql.ts#L20)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `sqlAdapter` — Summary
Language adapter for SQL scripts: created objects as symbols, named objects as dependencies.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`openings.matchSqlObject`](../openings.ts.mdmd.md#symbol-matchsqlobject)
- [`openings.sqlDeclarations`](../openings.ts.mdmd.md#symbol-sqldeclarations)
- [`openings.sqlReferences`](../openings.ts.mdmd.md#symbol-sqlreferences)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

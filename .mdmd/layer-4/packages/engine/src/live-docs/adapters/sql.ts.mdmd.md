# packages/engine/src/live-docs/adapters/sql.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/sql.ts
- Generated At: 2026-11-19T08:59:53.074Z

## Authored
### Purpose
The adapter for SQL scripts. What a script creates, a procedure, a table, a view or a function, is a public symbol with that kind, so that a program's query can link to it and a board can show it as a door; what the script names after `FROM`, `JOIN`, `INSERT INTO`, `EXEC` and their kin is a dependency on the script that creates it, matched by name through the symbol index. A name in the same database is read from source; a name reached through a linked server is an edge observed from a contract, since only the name ties the two databases together.

### Notes
- Written on 2026-09-28 for the openings ([Turn 34](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)), so that the estate's posting procedure, which reads an Oracle table through a linked server, has an edge to that table's script. The owner's own chain ends there: "stored procedures in an onprem MS SQL Server, which itself may perform OraQueries into the (yuck) Oracle database at the center of everything" (their words of 2026-09-27 07:32 UTC in [the September 26 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/2026-09-26/2026-09-26.1.md)). The scanning itself, declarations, references and the folding of names, lives in `openings.ts` so that the C# adapter reads SQL held in strings the same way; this file only maps it to symbols and dependencies.
- The whole adapter is one pass of regular expressions over the script with its comments and strings blanked; it reads the T-SQL and Oracle forms of `CREATE` and no dialect in full. [Openings](../../../../../../layer-3/openings.mdmd.md) names SQL Server's ScriptDom as a possible oracle; nothing measures this adapter against a parser yet.
- Measured by `sql.test.ts`.
- Since 2026-10-09 ([Turn 10 of the October 9 session](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-09/2026-10-09.1.record.md#turn-10)) a name the script uses that nothing in the scan creates is kept as written, a contract by name, the owner's choice of the wide rule with no builtins since the system schemas differ by database; a name the script itself creates is never kept. [The probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-09/Probes/two-scans.md) found the SQL Server to Oracle wire lost when the two databases were scanned apart, because the linked-server name was dropped; now it is a ghost of the script's doc that the estate graph matches to the table's.
- Revised on 2026-11-19, for the root to confirm with the owner ([the SQL reader's probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)): a name in the `sys` or `INFORMATION_SCHEMA` schema, and SQL Server's unreserved built-in table functions (`OPENJSON`, `STRING_SPLIT`, `GENERATE_SERIES`), are the engine's own and are no longer kept. The October 9 worry was that system schemas differ by database; these two are the catalog in SQL Server and in Oracle (`SYS`), and `INFORMATION_SCHEMA` in MySQL and PostgreSQL too, while no user object can live in SQL Server's. On tSQLt they were 207 of the 213 ghosts left after the other mends, a door to "outside" on most scripts. The change is its own commit, so that it can be dropped if the owner holds to October 9.
- Since 2026-11-19 a table a procedure's, function's or trigger's body creates is no symbol of the script: it is made when that module runs, not when the script does, as ScriptDom places it and as a SQL Server database project's model reads a script. It still counts as the script's own, so a use of it in the same file keeps no name. On tSQLt such tables were 374 of the reader's 376 symbols ScriptDom does not count as the scripts' objects (test fixtures such as `SchemaA.TableA`, created by many test procedures), and they drew links from one test file to another that made the same table. The price, for an estate, is a procedure that creates a permanent table at run time and no script that defines it: another script's use of that table is then a name kept, not a link to the procedure. A decision taken by the builder, for the root and the owner to confirm ([the SQL reader's probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `sqlAdapter` {#symbol-sqladapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/sql.ts#L23)
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
- [`openings.sqlNameMatches`](../openings.ts.mdmd.md#symbol-sqlnamematches)
- [`openings.sqlObjectName`](../openings.ts.mdmd.md#symbol-sqlobjectname-function)
- [`openings.sqlReferences`](../openings.ts.mdmd.md#symbol-sqlreferences)
- [`compareText`](../../tooling/compareText.ts.mdmd.md#symbol-comparetext)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../../../layer-3/openings.mdmd.md)
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

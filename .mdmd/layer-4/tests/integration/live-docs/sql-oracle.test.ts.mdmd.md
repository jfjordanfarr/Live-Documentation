# `tests/integration/live-docs/sql-oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/sql-oracle.test.ts`
- Generated At: 2026-11-21T02:15:35.423Z

## Authored
### Purpose
The SQL reader held to Microsoft's T-SQL parser, without .NET: over every fixture that keeps `expected/sql-scriptdom.json`, the comparison of [`sql-compare.ts`](../../../scripts/oracle/sql-compare.ts.mdmd.md) runs the SQL adapter over the files the record covers and lists every disagreement, in words: objects missing or invented, lines wrong, dependency lines missing or invented. The list must equal a register of measured misses exactly, so a miss mended or a new one fails the test until the register says so.

### Notes
- Written on 2026-11-19 ([the probe](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)) in the manner of the PowerShell oracle's test. The register for `fixtures/sql-server` first held every fault the cold run found on tSQLt, in a few files of its shape; each mend of the reader shortened it in the same commit. The estate's SQL Server files have agreed with the parser from the start.
- `npm run oracle:sql -- <fixture> --write` rewrites a record after a fixture changes; the register changes only by a reading of what changed.
- Since 2026-11-21 a third fixture, `fixtures/sql-schemas`, holds one table name in two schemas, named by one part from modules of each, from a module's DDL and executed string, a trigger and a loose script, and by `SisterDb..Orders`; the comparison binds each as T-SQL documents. Its register's one entry is a trigger, a kind the reader gives no symbol ([the account](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:path` - `path`
- [`sql-compare.SqlReport`](../../../scripts/oracle/sql-compare.ts.mdmd.md#symbol-sqlreport)
- [`sql-compare.compareSql`](../../../scripts/oracle/sql-compare.ts.mdmd.md#symbol-comparesql)
- [`sql-scriptdom.readScriptDomRecord`](../../../scripts/oracle/sql-scriptdom.ts.mdmd.md#symbol-readscriptdomrecord)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

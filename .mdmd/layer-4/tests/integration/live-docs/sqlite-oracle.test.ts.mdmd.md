# `tests/integration/live-docs/sqlite-oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/sqlite-oracle.test.ts`
- Generated At: 2026-11-22T07:13:00.058Z

## Authored
### Purpose
Holds the SQL reader to SQLite's own record of every fixture that keeps `expected/sqlite-schema.json`: what the reader declares of each script against the tables and views SQLite made of it, the list of differences equal to a register, and the record tied to its sources by their digests.

### Notes
- Made on 2026-11-21 with the grader `scripts/oracle/sql-sqlite.ts` ([the record](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs`
- `node:os`
- `node:path` - `path`
- [`knownDifferences.heldToLedger`](../../../packages/engine/src/live-docs/adapters/knownDifferences.ts.mdmd.md#symbol-heldtoledger)
- [`knownDifferences.listedButNotRun`](../../../packages/engine/src/live-docs/adapters/knownDifferences.ts.mdmd.md#symbol-listedbutnotrun)
- [`sources.sourceDigests`](../../../scripts/oracle/sources.ts.mdmd.md#symbol-sourcedigests)
- [`sources.sourcesDiffer`](../../../scripts/oracle/sources.ts.mdmd.md#symbol-sourcesdiffer)
- [`sql-sqlite.SqliteRecord`](../../../scripts/oracle/sql-sqlite.ts.mdmd.md#symbol-sqliterecord) (type-only)
- [`sql-sqlite.compareSqlite`](../../../scripts/oracle/sql-sqlite.ts.mdmd.md#symbol-comparesqlite)
- [`sql-sqlite.runSqlite`](../../../scripts/oracle/sql-sqlite.ts.mdmd.md#symbol-runsqlite)
- [`sql-sqlite.sqliteSources`](../../../scripts/oracle/sql-sqlite.ts.mdmd.md#symbol-sqlitesources)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

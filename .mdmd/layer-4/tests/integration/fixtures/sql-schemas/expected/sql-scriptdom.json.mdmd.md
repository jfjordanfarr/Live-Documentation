# `tests/integration/fixtures/sql-schemas/expected/sql-scriptdom.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/expected/sql-scriptdom.json`
- Generated At: 2026-11-21T07:25:47.631Z

## Authored
### Purpose
What Microsoft's T-SQL parser says about the schemas fixture's scripts, written by `npm run oracle:sql -- tests/integration/fixtures/sql-schemas --write`: each name's parts and the module whose definition holds it, which the comparison binds by the order Microsoft documents; the ground truth `sql-oracle.test.ts` holds the SQL reader to.

### Notes
- Never hand-edited ([the account](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)). Rewrite it after changing the fixture; nothing in it is trimmed to fit the reader.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `tool` {#symbol-tool}
- Type: key

#### `files` {#symbol-files}
- Type: key

#### `files:../archive.CountOrders.sql` {#symbol-filesarchivecountorderssql}
- Type: key

#### `files:../archive.CountOrders.sql:parseErrors` {#symbol-filesarchivecountorderssqlparseerrors}
- Type: key

#### `files:../archive.CountOrders.sql:creates` {#symbol-filesarchivecountorderssqlcreates}
- Type: key

#### `files:../archive.CountOrders.sql:references` {#symbol-filesarchivecountorderssqlreferences}
- Type: key

#### `files:../archive.CountOrders.sql:dynamic` {#symbol-filesarchivecountorderssqldynamic}
- Type: key

#### `files:../archive.ListOrders.sql` {#symbol-filesarchivelistorderssql}
- Type: key

#### `files:../archive.ListOrders.sql:parseErrors` {#symbol-filesarchivelistorderssqlparseerrors}
- Type: key

#### `files:../archive.ListOrders.sql:creates` {#symbol-filesarchivelistorderssqlcreates}
- Type: key

#### `files:../archive.ListOrders.sql:references` {#symbol-filesarchivelistorderssqlreferences}
- Type: key

#### `files:../archive.ListOrders.sql:dynamic` {#symbol-filesarchivelistorderssqldynamic}
- Type: key

#### `files:../archive.OrdersKept.sql` {#symbol-filesarchiveorderskeptsql}
- Type: key

#### `files:../archive.OrdersKept.sql:parseErrors` {#symbol-filesarchiveorderskeptsqlparseerrors}
- Type: key

#### `files:../archive.OrdersKept.sql:creates` {#symbol-filesarchiveorderskeptsqlcreates}
- Type: key

#### `files:../archive.OrdersKept.sql:references` {#symbol-filesarchiveorderskeptsqlreferences}
- Type: key

#### `files:../archive.OrdersKept.sql:dynamic` {#symbol-filesarchiveorderskeptsqldynamic}
- Type: key

#### `files:../archive.PurgeOrders.sql` {#symbol-filesarchivepurgeorderssql}
- Type: key

#### `files:../archive.PurgeOrders.sql:parseErrors` {#symbol-filesarchivepurgeorderssqlparseerrors}
- Type: key

#### `files:../archive.PurgeOrders.sql:creates` {#symbol-filesarchivepurgeorderssqlcreates}
- Type: key

#### `files:../archive.PurgeOrders.sql:references` {#symbol-filesarchivepurgeorderssqlreferences}
- Type: key

#### `files:../archive.PurgeOrders.sql:dynamic` {#symbol-filesarchivepurgeorderssqldynamic}
- Type: key

#### `files:../archive.sql` {#symbol-filesarchivesql}
- Type: key

#### `files:../archive.sql:parseErrors` {#symbol-filesarchivesqlparseerrors}
- Type: key

#### `files:../archive.sql:creates` {#symbol-filesarchivesqlcreates}
- Type: key

#### `files:../archive.sql:references` {#symbol-filesarchivesqlreferences}
- Type: key

#### `files:../archive.sql:dynamic` {#symbol-filesarchivesqldynamic}
- Type: key

#### `files:../legacy.sql` {#symbol-fileslegacysql}
- Type: key

#### `files:../legacy.sql:parseErrors` {#symbol-fileslegacysqlparseerrors}
- Type: key

#### `files:../legacy.sql:creates` {#symbol-fileslegacysqlcreates}
- Type: key

#### `files:../legacy.sql:references` {#symbol-fileslegacysqlreferences}
- Type: key

#### `files:../legacy.sql:dynamic` {#symbol-fileslegacysqldynamic}
- Type: key

#### `files:../linked.sql` {#symbol-fileslinkedsql}
- Type: key

#### `files:../linked.sql:parseErrors` {#symbol-fileslinkedsqlparseerrors}
- Type: key

#### `files:../linked.sql:creates` {#symbol-fileslinkedsqlcreates}
- Type: key

#### `files:../linked.sql:references` {#symbol-fileslinkedsqlreferences}
- Type: key

#### `files:../linked.sql:dynamic` {#symbol-fileslinkedsqldynamic}
- Type: key

#### `files:../notes.sql` {#symbol-filesnotessql}
- Type: key

#### `files:../notes.sql:parseErrors` {#symbol-filesnotessqlparseerrors}
- Type: key

#### `files:../notes.sql:creates` {#symbol-filesnotessqlcreates}
- Type: key

#### `files:../notes.sql:references` {#symbol-filesnotessqlreferences}
- Type: key

#### `files:../notes.sql:dynamic` {#symbol-filesnotessqldynamic}
- Type: key

#### `files:../procs.sql` {#symbol-filesprocssql}
- Type: key

#### `files:../procs.sql:parseErrors` {#symbol-filesprocssqlparseerrors}
- Type: key

#### `files:../procs.sql:creates` {#symbol-filesprocssqlcreates}
- Type: key

#### `files:../procs.sql:references` {#symbol-filesprocssqlreferences}
- Type: key

#### `files:../procs.sql:dynamic` {#symbol-filesprocssqldynamic}
- Type: key

#### `files:../report.sql` {#symbol-filesreportsql}
- Type: key

#### `files:../report.sql:parseErrors` {#symbol-filesreportsqlparseerrors}
- Type: key

#### `files:../report.sql:creates` {#symbol-filesreportsqlcreates}
- Type: key

#### `files:../report.sql:references` {#symbol-filesreportsqlreferences}
- Type: key

#### `files:../report.sql:dynamic` {#symbol-filesreportsqldynamic}
- Type: key

#### `files:../tables.sql` {#symbol-filestablessql}
- Type: key

#### `files:../tables.sql:parseErrors` {#symbol-filestablessqlparseerrors}
- Type: key

#### `files:../tables.sql:creates` {#symbol-filestablessqlcreates}
- Type: key

#### `files:../tables.sql:references` {#symbol-filestablessqlreferences}
- Type: key

#### `files:../tables.sql:dynamic` {#symbol-filestablessqldynamic}
- Type: key

#### `sources` {#symbol-sources}
- Type: key

#### `sources:../archive.CountOrders.sql` {#symbol-sourcesarchivecountorderssql}
- Type: key

#### `sources:../archive.ListOrders.sql` {#symbol-sourcesarchivelistorderssql}
- Type: key

#### `sources:../archive.OrdersKept.sql` {#symbol-sourcesarchiveorderskeptsql}
- Type: key

#### `sources:../archive.PurgeOrders.sql` {#symbol-sourcesarchivepurgeorderssql}
- Type: key

#### `sources:../archive.sql` {#symbol-sourcesarchivesql}
- Type: key

#### `sources:../legacy.sql` {#symbol-sourceslegacysql}
- Type: key

#### `sources:../linked.sql` {#symbol-sourceslinkedsql}
- Type: key

#### `sources:../notes.sql` {#symbol-sourcesnotessql}
- Type: key

#### `sources:../procs.sql` {#symbol-sourcesprocssql}
- Type: key

#### `sources:../report.sql` {#symbol-sourcesreportsql}
- Type: key

#### `sources:../tables.sql` {#symbol-sourcestablessql}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

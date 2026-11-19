# tests/integration/fixtures/sql-server/Procedures/Billing.usp_Settle.sql

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/sql-server/Procedures/Billing.usp_Settle.sql
- Generated At: 2026-11-19T21:16:04.627Z

## Authored
### Purpose
A procedure of the SQL Server fixture deployed as an idempotent script does it: a stub created by an executed string when the procedure is missing, then an ALTER with its body. The body executes strings written out in full (`sp_executesql N'…'`, `EXEC (N'…' + N'…')`), one computed from a variable, and reads Oracle through `OPENQUERY(ORACLE_CENTRAL, '…')`; the file then alters a view nothing in the folder creates.

### Notes
- Written on 2026-11-19, the evening the SQL oracle began reading the strings a script executes ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). The procedure's one symbol stands at its ALTER, where its body is; the stub's CREATE is a placeholder. The ALTER of `Billing.vw_Legacy` is a use kept by name, and the `OPENQUERY`'s table is a name on the linked server, `ORACLE_CENTRAL..CENTRAL.ACCOUNT`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `sp_executesql` (contract)
<!-- LIVE-DOC:END Dependencies -->

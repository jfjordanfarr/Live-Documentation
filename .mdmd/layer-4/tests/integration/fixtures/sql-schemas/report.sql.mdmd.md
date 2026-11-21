# `tests/integration/fixtures/sql-schemas/report.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/report.sql`
- Generated At: 2026-11-21T05:37:52.655Z

## Authored
### Purpose
A script outside any module: its one-part `Orders` binds by the caller's default schema, which the text does not give and is taken as dbo, the default a user is created with.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)) after an independent review found that the SQL reader linked a one-part name to an object of that name in every schema, and read `SisterDb..Orders` as a linked server's name. Each answer here is T-SQL's order of binding as Microsoft documents it, applied to the parts and modules ScriptDom reads.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dbo.ListLegacy` (contract)
- [`tables.dbo.Orders`](./tables.sql.mdmd.md#symbol-dboorders)
<!-- LIVE-DOC:END Dependencies -->

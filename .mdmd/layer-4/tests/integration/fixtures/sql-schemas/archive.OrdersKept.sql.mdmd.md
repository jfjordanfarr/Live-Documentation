# `tests/integration/fixtures/sql-schemas/archive.OrdersKept.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/archive.OrdersKept.sql`
- Generated At: 2026-11-21T05:00:41.272Z

## Authored
### Purpose
A trigger whose name writes no schema lives in its table's, archive, so its one-part `Orders` is `archive.Orders`. The reader gives a trigger no symbol, which is the fixture's one measured miss.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)) after an independent review found that the SQL reader linked a one-part name to an object of that name in every schema, and read `SisterDb..Orders` as a linked server's name. Each answer here is T-SQL's order of binding as Microsoft documents it, applied to the parts and modules ScriptDom reads.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`archive.archive.Orders`](./archive.sql.mdmd.md#symbol-archiveorders)
<!-- LIVE-DOC:END Dependencies -->

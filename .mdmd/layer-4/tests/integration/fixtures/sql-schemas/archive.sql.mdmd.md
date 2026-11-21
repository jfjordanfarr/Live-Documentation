# `tests/integration/fixtures/sql-schemas/archive.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/archive.sql`
- Entry: opening [`archive.Orders`](#symbol-archiveorders)
- Entry: opening [`archive.Notes`](#symbol-archivenotes)
- Generated At: 2026-11-21T04:55:45.788Z

## Authored
### Purpose
The fixture's second schema: `archive.Orders`, named like dbo's, and `archive.Notes`, which dbo does not hold.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)) after an independent review found that the SQL reader linked a one-part name to an object of that name in every schema, and read `SisterDb..Orders` as a linked server's name. Each answer here is T-SQL's order of binding as Microsoft documents it, applied to the parts and modules ScriptDom reads.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `archive.Orders` {#symbol-archiveorders}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/archive.sql#L4)

#### `archive.Notes` {#symbol-archivenotes}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/archive.sql#L6)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

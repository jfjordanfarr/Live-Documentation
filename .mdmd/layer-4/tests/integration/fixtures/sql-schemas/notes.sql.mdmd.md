# `tests/integration/fixtures/sql-schemas/notes.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/notes.sql`
- Entry: opening [`dbo.ListNotes`](#symbol-dbolistnotes)
- Generated At: 2026-11-21T05:00:41.285Z

## Authored
### Purpose
A one-part name that neither the module's schema nor dbo holds binds to nothing in the folder, though archive holds a `Notes`: its doc keeps the name instead of drawing a line to `archive.Notes`.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)) after an independent review found that the SQL reader linked a one-part name to an object of that name in every schema, and read `SisterDb..Orders` as a linked server's name. Each answer here is T-SQL's order of binding as Microsoft documents it, applied to the parts and modules ScriptDom reads.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `dbo.ListNotes` {#symbol-dbolistnotes}
- Type: procedure
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/notes.sql#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Notes` (contract)
<!-- LIVE-DOC:END Dependencies -->

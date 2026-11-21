# `tests/integration/fixtures/sql-schemas/legacy.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-schemas/legacy.sql`
- Entry: opening [`ListLegacy`](#symbol-listlegacy)
- Generated At: 2026-11-21T05:37:52.648Z

## Authored
### Purpose
A procedure created without a schema, as scripts written before schemas were (DNN's oldest upgrade scripts are such), and then altered as `dbo.ListLegacy`: an object created without a schema is in its creator's default schema, taken as dbo, so the `ALTER` is of the same procedure and stands for its body, and `report.sql`'s `EXEC dbo.ListLegacy` links here.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)), when the root ruled that the default schema is one presumption or none: the reader already took a schema-less object for dbo's when a one-part name used it, and not when `dbo.X` did. On DNN's provider scripts the one presumption adds 103 lines, ten of which were read and found true.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ListLegacy` {#symbol-listlegacy}
- Type: procedure
- Source: [source](../../../../../../tests/integration/fixtures/sql-schemas/legacy.sql#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dbo.ListLegacy` (contract)
- [`tables.dbo.Orders`](./tables.sql.mdmd.md#symbol-dboorders)
<!-- LIVE-DOC:END Dependencies -->

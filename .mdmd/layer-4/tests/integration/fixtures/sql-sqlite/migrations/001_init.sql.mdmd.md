# `tests/integration/fixtures/sql-sqlite/migrations/001_init.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-sqlite/migrations/001_init.sql`
- Entry: opening [`artifacts`](#symbol-artifacts)
- Entry: opening [`links`](#symbol-links)
- Entry: opening [`change_events`](#symbol-change_events)
- Entry: opening [`diagnostics`](#symbol-diagnostics)
- Entry: opening [`acknowledgements`](#symbol-acknowledgements)
- Entry: opening [`snapshots`](#symbol-snapshots)
- Generated At: 2026-11-21T19:30:06.974Z

## Authored
### Purpose
This repository's own SQLite migration of its first weeks, `data/migrations/001_init.sql` as committed on 2025-10-16 (`6bccf94be`) and removed in January 2026, kept as a real input of SQLite's `CREATE TABLE IF NOT EXISTS`, which the SQL reader read first as six tables named `IF` and then as none.

### Notes
- Its six tables are what SQLite holds after running it ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `artifacts` {#symbol-artifacts}
- Type: table
- Source: [source](../../../../../../../tests/integration/fixtures/sql-sqlite/migrations/001_init.sql#L2)

#### `links` {#symbol-links}
- Type: table
- Source: [source](../../../../../../../tests/integration/fixtures/sql-sqlite/migrations/001_init.sql#L13)

#### `change_events` {#symbol-change_events}
- Type: table
- Source: [source](../../../../../../../tests/integration/fixtures/sql-sqlite/migrations/001_init.sql#L27)

#### `diagnostics` {#symbol-diagnostics}
- Type: table
- Source: [source](../../../../../../../tests/integration/fixtures/sql-sqlite/migrations/001_init.sql#L38)

#### `acknowledgements` {#symbol-acknowledgements}
- Type: table
- Source: [source](../../../../../../../tests/integration/fixtures/sql-sqlite/migrations/001_init.sql#L54)

#### `snapshots` {#symbol-snapshots}
- Type: table
- Source: [source](../../../../../../../tests/integration/fixtures/sql-sqlite/migrations/001_init.sql#L64)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

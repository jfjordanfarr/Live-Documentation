# `tests/integration/fixtures/sql-sqlite/dialect.sql`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/sql-sqlite/dialect.sql`
- Entry: opening [`shop_customers`](#symbol-shop_customers)
- Entry: opening [`shop order lines`](#symbol-shop-order-lines)
- Entry: opening [`shop_audit`](#symbol-shop_audit)
- Entry: opening [`shop_legacy`](#symbol-shop_legacy)
- Entry: opening [``[shop_tick`ed]``](#symbol-shop_ticked)
- Entry: opening [`shop_customer_names`](#symbol-shop_customer_names)
- Entry: opening [`shop_notes`](#symbol-shop_notes)
- Entry: opening [`shop_customers_archive`](#symbol-shop_customers_archive)
- Entry: opening [`shop_after_the_trigger`](#symbol-shop_after_the_trigger)
- Generated At: 2026-11-21T19:30:56.954Z

## Authored
### Purpose
The SQLite fixture's catalogue of the spellings T-SQL does not write: `IF NOT EXISTS`, `DROP … IF EXISTS`, `TEMP` and `TEMPORARY` objects, backticked, quoted and bracketed names, a virtual table, a table made from a query, and a trigger written with its timing first, with a table after it.

### Notes
- Every name starts with `shop_`, so that no other fixture's script, read in this repository as one workspace, binds to one of its tables ([the fixture's README](../../../../../../tests/integration/fixtures/sql-sqlite/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `shop_customers` {#symbol-shop_customers}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-sqlite/dialect.sql#L3)

#### `shop order lines` {#symbol-shop-order-lines}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-sqlite/dialect.sql#L4)

#### `shop_audit` {#symbol-shop_audit}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-sqlite/dialect.sql#L5)

#### `shop_legacy` {#symbol-shop_legacy}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-sqlite/dialect.sql#L6)

#### ``[shop_tick`ed]`` {#symbol-shop_ticked}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-sqlite/dialect.sql#L7)

#### `shop_customer_names` {#symbol-shop_customer_names}
- Type: view
- Source: [source](../../../../../../tests/integration/fixtures/sql-sqlite/dialect.sql#L10)

#### `shop_notes` {#symbol-shop_notes}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-sqlite/dialect.sql#L18)

#### `shop_customers_archive` {#symbol-shop_customers_archive}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-sqlite/dialect.sql#L19)

#### `shop_after_the_trigger` {#symbol-shop_after_the_trigger}
- Type: table
- Source: [source](../../../../../../tests/integration/fixtures/sql-sqlite/dialect.sql#L23)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

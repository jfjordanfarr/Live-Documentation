# tests/integration/programs/python/ledger/ledger/models/account.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/ledger/ledger/models/account.py
- Live Doc ID: LD-test-tests-integration-programs-python-ledger-ledger-models-account-py
- Generated At: 2026-09-27T21:43:46.197Z

## Authored
### Purpose
`Account` for the ledger sample program: a named account that accumulates entries and knows its balance, with a nested `Snapshot` class.

### Notes
- Imports `money` as a submodule through a two-dot relative import and uses it as `money.Money` and `money.total`; the adapter must bind the name to the module to link those.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:46.197Z","inputHash":"ce9548c7c71afb08"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Account` {#symbol-account}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/account.py#L13)

##### `Account` — Summary
A named account with the entries posted to it.

#### `name` {#symbol-name}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/account.py#L16)

#### `entries` {#symbol-entries}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/account.py#L17)

#### `post` {#symbol-post}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/account.py#L19)
- Parameters: `entry`: [`Entry`](./entry.py.mdmd.md#symbol-entry)

##### `post` — Summary
Append an entry. Rejects an entry whose amount is not positive.

#### `balance` {#symbol-balance}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/account.py#L25)
- Returns: [`Money`](../util/money.py.mdmd.md#symbol-money)

##### `balance` — Summary
Debits minus credits over every entry.

#### `entries_of` {#symbol-entries_of}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/account.py#L29)
- Returns: `Iterable`
- Parameters: `kind`: [`EntryKind`](./entry.py.mdmd.md#symbol-entrykind)

#### `Snapshot` {#symbol-snapshot}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/account.py#L32)

##### `Snapshot` — Summary
The balance at a point in time, for reports.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dataclasses` - `dataclass`, `field`
- [`Entry`](./entry.py.mdmd.md#symbol-entry)
- [`entry.EntryKind`](./entry.py.mdmd.md#symbol-entrykind)
- [`util`](../util/__init__.py.mdmd.md)
- [`Money`](../util/money.py.mdmd.md#symbol-money)
- [`money.total`](../util/money.py.mdmd.md#symbol-total)
- `typing` - `Iterable`
<!-- LIVE-DOC:END Dependencies -->

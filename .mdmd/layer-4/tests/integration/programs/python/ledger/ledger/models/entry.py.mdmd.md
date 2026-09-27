# tests/integration/programs/python/ledger/ledger/models/entry.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/ledger/ledger/models/entry.py
- Generated At: 2026-09-27T23:21:37.333Z

## Authored
### Purpose
`Entry` and `EntryKind` for the ledger sample program: one debit or credit and the side it lands on.

### Notes
- Reaches `Money` through a two-dot relative import of a module, and carries a property and a dataclass field for the member-publishing rules.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `EntryKind` {#symbol-entrykind}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L10)
- Extends: `Enum`

##### `EntryKind` — Summary
Which side of the ledger an entry lands on.

#### `DEBIT` {#symbol-debit}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L13)

#### `CREDIT` {#symbol-credit}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L14)

#### `Entry` {#symbol-entry}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L18)

##### `Entry` — Summary
One debit or credit, with the money it moves and when it was posted.

#### `kind` {#symbol-kind}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L21)

#### `amount` {#symbol-amount}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L22)

#### `memo` {#symbol-memo}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L23)

#### `posted_at` {#symbol-posted_at}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L24)

#### `signed` {#symbol-signed}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L27)
- Returns: [`Money`](../util/money.py.mdmd.md#symbol-money)

##### `signed` — Summary
The amount with the sign of its side: debits positive, credits negative.

#### `describe` {#symbol-describe}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/models/entry.py#L31)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dataclasses` - `dataclass`, `field`
- `datetime` - `datetime`
- `enum` - `Enum`
- [`Money`](../util/money.py.mdmd.md#symbol-money)
<!-- LIVE-DOC:END Dependencies -->

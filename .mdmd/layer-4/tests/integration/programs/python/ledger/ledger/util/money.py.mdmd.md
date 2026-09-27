# tests/integration/programs/python/ledger/ledger/util/money.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/ledger/ledger/util/money.py
- Live Doc ID: LD-test-tests-integration-programs-python-ledger-ledger-util-money-py
- Generated At: 2026-09-27T21:43:46.556Z

## Authored
### Purpose
`Money` for the ledger sample program: an amount in cents, with `total` over a sequence and a private rounding helper.

### Notes
- The leaf of the program: it depends on nothing in the workspace. `_round_half_up` is the private name that must stay out of the published symbols.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:46.556Z","inputHash":"d17c6a3127c006a1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CENTS_PER_UNIT` {#symbol-cents_per_unit}
- Type: variable
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/util/money.py#L8)

#### `Money` {#symbol-money}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/util/money.py#L12)

##### `Money` — Summary
An amount in cents.

#### `cents` {#symbol-cents}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/util/money.py#L15)

#### `of` {#symbol-of}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/util/money.py#L18)
- Returns: [`Money`](#symbol-money)

##### `of` — Summary
Build from a decimal amount such as 12.34.

#### `negate` {#symbol-negate}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/util/money.py#L22)
- Returns: [`Money`](#symbol-money)

#### `is_positive` {#symbol-is_positive}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/util/money.py#L25)

#### `total` {#symbol-total}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/util/money.py#L35)
- Returns: [`Money`](#symbol-money)
- Parameters: `amounts`: `Iterable`

##### `total` — Summary
Sum of the amounts; zero when there are none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `dataclasses` - `dataclass`
- `typing` - `Iterable`
<!-- LIVE-DOC:END Dependencies -->

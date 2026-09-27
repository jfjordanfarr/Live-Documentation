# tests/integration/programs/python/ledger/ledger/services/posting.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/ledger/ledger/services/posting.py
- Live Doc ID: LD-test-tests-integration-programs-python-ledger-ledger-services-posting-py
- Generated At: 2026-09-27T21:43:46.435Z

## Authored
### Purpose
`PostingService` and `open_account` for the ledger sample program: a balanced transfer between two accounts, recorded in a repository.

### Notes
- Carries most of the shapes the program exists for: a multi-line parenthesized import through the `ledger.models` barrel, `import ledger.util.money as money`, an import under `if TYPE_CHECKING:`, an import inside a function, and the words `import os` inside its docstring and a commented-out import, neither of which is a dependency.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:46.435Z","inputHash":"c1fc143b498f4fa8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PostingService` {#symbol-postingservice}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/services/posting.py#L23)

##### `PostingService` — Summary
Posts balanced transfers and records them in a repository.

#### `transfer` {#symbol-transfer}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/services/posting.py#L29)
- Parameters: `source`: [`Account`](../models/account.py.mdmd.md#symbol-account); `target`: [`Account`](../models/account.py.mdmd.md#symbol-account); `amount`: [`Money`](../util/money.py.mdmd.md#symbol-money)

##### `transfer` — Summary
Debit ``target`` and credit ``source`` by ``amount``.

#### `transfer_units` {#symbol-transfer_units}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/services/posting.py#L36)
- Parameters: `source`: [`Account`](../models/account.py.mdmd.md#symbol-account); `target`: [`Account`](../models/account.py.mdmd.md#symbol-account)

##### `transfer_units` — Summary
Like :meth:`transfer`, taking a decimal amount.

#### `open_account` {#symbol-open_account}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/services/posting.py#L41)
- Returns: [`Account`](../models/account.py.mdmd.md#symbol-account)

##### `open_account` — Summary
Create an empty account and record it, importing the repository lazily.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models`](../models/__init__.py.mdmd.md)
- [`Account`](../models/account.py.mdmd.md#symbol-account)
- [`Entry`](../models/entry.py.mdmd.md#symbol-entry)
- [`entry.EntryKind`](../models/entry.py.mdmd.md#symbol-entrykind)
- [`Repository`](../storage/repository.py.mdmd.md#symbol-repository)
- [`Money`](../util/money.py.mdmd.md#symbol-money)
- `typing` - `TYPE_CHECKING`
<!-- LIVE-DOC:END Dependencies -->

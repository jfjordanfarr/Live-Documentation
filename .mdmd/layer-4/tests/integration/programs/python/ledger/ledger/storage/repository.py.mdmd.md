# tests/integration/programs/python/ledger/ledger/storage/repository.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/ledger/ledger/storage/repository.py
- Generated At: 2026-09-27T23:21:37.609Z

## Authored
### Purpose
`Repository` for the ledger sample program: in-memory storage of accounts by name, with one shared instance.

### Notes
- Imports `Account` from the package root, so the dependency on `models/account.py` is reached through two barrels.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Repository` {#symbol-repository}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/storage/repository.py#L8)

##### `Repository` — Summary
Keeps accounts by name; one shared instance serves the process.

#### `shared` {#symbol-shared}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/storage/repository.py#L17)
- Returns: [`Repository`](../../../../java/service/src/com/example/service/data/Repository.java.mdmd.md#symbol-repository-class)

#### `save` {#symbol-save}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/storage/repository.py#L22)
- Parameters: `account`: [`Account`](../models/account.py.mdmd.md#symbol-account)

#### `get` {#symbol-get}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/storage/repository.py#L25)
- Returns: [`Account`](../models/account.py.mdmd.md#symbol-account)

#### `names` {#symbol-names}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/python/ledger/ledger/storage/repository.py#L28)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ledger`](../__init__.py.mdmd.md)
- [`Account`](../models/account.py.mdmd.md#symbol-account)
<!-- LIVE-DOC:END Dependencies -->

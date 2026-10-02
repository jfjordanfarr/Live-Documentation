# tests/integration/programs/python/ledger/ledger/__init__.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/python/ledger/ledger/__init__.py
- Generated At: 2026-10-02T20:20:06.980Z

## Authored
### Purpose
The package root of the ledger sample program: re-exports the model types and `Money` so callers can import them from `ledger` without knowing the module layout.

### Notes
- A barrel. The adapter follows `from ledger import Account` through this file to `models/account.py`, and the oracle records both files as dependencies of the importer.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Account`](./models/account.py.mdmd.md#symbol-account)
- [`Entry`](./models/entry.py.mdmd.md#symbol-entry)
- [`entry.EntryKind`](./models/entry.py.mdmd.md#symbol-entrykind)
- [`Money`](./util/money.py.mdmd.md#symbol-money)
<!-- LIVE-DOC:END Dependencies -->

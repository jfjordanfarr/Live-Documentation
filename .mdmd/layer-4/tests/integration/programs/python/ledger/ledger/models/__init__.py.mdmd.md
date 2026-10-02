# tests/integration/programs/python/ledger/ledger/models/__init__.py

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/python/ledger/ledger/models/__init__.py
- Generated At: 2026-10-02T20:20:07.067Z

## Authored
### Purpose
The models package of the ledger sample program: re-exports `Account`, `Entry` and `EntryKind` from their modules.

### Notes
- A second barrel, one level down, so a re-export chain of two hops is exercised (`ledger` re-exports what `ledger.models` re-exports).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Account`](./account.py.mdmd.md#symbol-account)
- [`Entry`](./entry.py.mdmd.md#symbol-entry)
- [`entry.EntryKind`](./entry.py.mdmd.md#symbol-entrykind)
<!-- LIVE-DOC:END Dependencies -->

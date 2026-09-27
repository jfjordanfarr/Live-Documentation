# tests/integration/programs/python/ledger/ledger/__init__.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/ledger/ledger/__init__.py
- Live Doc ID: LD-test-tests-integration-programs-python-ledger-ledger-init-py
- Generated At: 2026-09-27T20:03:33.234Z

## Authored
### Purpose
The package root of the ledger sample program: re-exports the model types and `Money` so callers can import them from `ledger` without knowing the module layout.

### Notes
- A barrel. The adapter follows `from ledger import Account` through this file to `models/account.py`, and the oracle records both files as dependencies of the importer.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:03:33.234Z","inputHash":"0f2fd11916875e79"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

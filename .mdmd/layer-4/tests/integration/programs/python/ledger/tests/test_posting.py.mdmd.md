# tests/integration/programs/python/ledger/tests/test_posting.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/ledger/tests/test_posting.py
- Live Doc ID: LD-test-tests-integration-programs-python-ledger-tests-test-posting-py
- Generated At: 2026-09-27T20:03:33.679Z

## Authored
### Purpose
Tests for posting in the ledger sample program, written through the module import form and the package's wildcard export.

### Notes
- `from ledger import *` is the wildcard case: the adapter links only the public names the file uses (`Account`, `Money`), and the oracle attributes those calls to the barrel itself.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:03:33.679Z","inputHash":"130373f9688d8e7c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `test_transfer_balances_both_accounts` {#symbol-test_transfer_balances_both_accounts}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/ledger/tests/test_posting.py#L10)

#### `test_transfer_rejects_non_positive_amount` {#symbol-test_transfer_rejects_non_positive_amount}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/ledger/tests/test_posting.py#L18)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `ledger`
- `ledger.services` - `posting`
- `ledger.storage.repository` - `Repository`
- `pytest`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

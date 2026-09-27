# tests/integration/programs/python/ledger/ledger/cli.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/ledger/ledger/cli.py
- Live Doc ID: LD-test-tests-integration-programs-python-ledger-ledger-cli-py
- Generated At: 2026-09-27T20:03:33.278Z

## Authored
### Purpose
The command-line entry point of the ledger sample program: opens two accounts, moves money between them and prints both balances.

### Notes
- The one compiler edge the adapter does not find starts here: `account.balance()` on an object returned by `Repository.get`, which only type inference can attribute to `models/account.py`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:03:33.278Z","inputHash":"a27f42ba8b854714"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/ledger/ledger/cli.py#L9)

##### `main` — Summary
Transfer the amount given on the command line and print both balances.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `sys`
- [`posting.PostingService`](./services/posting.py.mdmd.md#symbol-postingservice)
- [`posting.open_account`](./services/posting.py.mdmd.md#symbol-open_account)
- [`Repository`](./storage/repository.py.mdmd.md#symbol-repository)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

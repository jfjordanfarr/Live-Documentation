# tests/integration/programs/python/ledger/ledger/cli.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/ledger/ledger/cli.py
- Generated At: 2026-09-27T23:21:37.147Z

## Authored
### Purpose
The command-line entry point of the ledger sample program: opens two accounts, moves money between them and prints both balances.

### Notes
- The one compiler edge the adapter does not find starts here: `account.balance()` on an object returned by `Repository.get`, which only type inference can attribute to `models/account.py`.

## Generated
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

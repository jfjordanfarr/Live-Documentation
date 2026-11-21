# `packages/engine/src/live-docs/adapters/knownDifferences.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/knownDifferences.ts`
- Generated At: 2026-11-21T21:13:43.270Z

## Authored
### Purpose
Holds the readers' tests to their ledger of known differences, `known-differences.json`: a case the ledger lists must still be wrong, and one it does not list must be right; each test file asks at its end that no case the ledger lists for it went unrun.

### Notes
- Made on 2026-11-21 for the cases of an independent review that need a reader to know a script's dialect or a page's own code, which were ledgered rather than mended ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md#the-second-round-after-an-independent-review)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `KnownCause` {#symbol-knowncause}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/knownDifferences.ts#L17)

##### `KnownCause` — Summary
One cause of known differences, as the ledger states it.

#### `KNOWN_CAUSES` {#symbol-known_causes}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/knownDifferences.ts#L26)

##### `KNOWN_CAUSES` — Summary
The ledger's causes, read beside this module's source; only the readers' tests ask for them.

#### `heldToLedger` {#symbol-heldtoledger}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/knownDifferences.ts#L37)

##### `heldToLedger` — Summary
Runs a case's check, held to the ledger: a listed case's check must fail, and one that passes throws, saying that
the case is no longer wrong and is to be taken out of the ledger; an unlisted case's failure is thrown as it is.

#### `listedButNotRun` {#symbol-listedbutnotrun}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/knownDifferences.ts#L52)

##### `listedButNotRun` — Summary
The cases the ledger lists for a test file that the file has not run through {@link heldToLedger}.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

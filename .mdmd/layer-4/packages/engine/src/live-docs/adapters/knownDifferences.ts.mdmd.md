# `packages/engine/src/live-docs/adapters/knownDifferences.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/knownDifferences.ts`
- Generated At: 2026-11-21T21:28:04.171Z

## Authored
### Purpose
The readers' ledger of known differences, `KNOWN_CAUSES`, one entry a cause with the cases it lists, and the step that holds their tests to it: a case the ledger lists must still be wrong, and one it does not list must be right; each test file asks at its end that no case the ledger lists for it went unrun.

### Notes
- Made on 2026-11-21 for the cases of an independent review that need a reader to know a script's dialect or a page's own code, which were ledgered rather than mended ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md#the-second-round-after-an-independent-review)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `KnownCause` {#symbol-knowncause}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/knownDifferences.ts#L14)

##### `KnownCause` — Summary
One cause of known differences, as the ledger states it.

#### `KNOWN_CAUSES` {#symbol-known_causes}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/knownDifferences.ts#L33)

##### `KNOWN_CAUSES` — Summary
The ledger's causes. Every case of the readers' tests in which a reader reads a text otherwise than its language does
and that is not yet mended, listed under its cause: what the reader reads, what is true and by what source, and how
many places the corpora hold (a plain search over the corpora of 2026-11-21, dnn, mojoportal, dbatools, tsqlt, algo,
azurestack, eshoponweb, nopcommerce and orchardcore, unless the cause says the independent reviewer of that day
counted it). A test runs each case through heldToLedger (knownDifferences.ts): a listed case that passes fails, so a
mend takes it out of the ledger in the same change, and a failing case this ledger does not list fails. Each case is
`<test file> > <the test's full name>`. Every cause here waits on one of two designs, measured before it is built: a
dialect for each SQL script, or a markup reader that reads the code a page holds by that code's own parse
(2026-11-21, the second review that broke the comment guard by new means).

#### `heldToLedger` {#symbol-heldtoledger}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/knownDifferences.ts#L146)

##### `heldToLedger` — Summary
Runs a case's check, held to the ledger: a listed case's check must fail, and one that passes throws, saying that
the case is no longer wrong and is to be taken out of the ledger; an unlisted case's failure is thrown as it is.

#### `listedButNotRun` {#symbol-listedbutnotrun}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/knownDifferences.ts#L161)

##### `listedButNotRun` — Summary
The cases the ledger lists for a test file that the file has not run through {@link heldToLedger}.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

# `tests/page-scan/compare.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/compare.ts`
- Generated At: 2026-11-21T03:40:56.632Z

## Authored
### Purpose
How the check compares the page's output with Node's, every file whole (the same, written by one side alone, or differing, told by its first differing line and the count of differing lines), and how it holds what it finds to the ledger `differences.json`: a difference not listed fails, and so does a listed one no longer found.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- Both runs are given the same clock, so the `Generated At` lines are compared like every other line rather than set aside.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Difference` {#symbol-difference}
- Type: interface
- Source: [source](../../../../tests/page-scan/compare.ts#L10)

##### `Difference` — Summary
One way the page's output differs from Node's for one file.

#### `LedgerEntry` {#symbol-ledgerentry}
- Type: interface
- Source: [source](../../../../tests/page-scan/compare.ts#L21)
- Extends: [`Difference`](#symbol-difference)

##### `LedgerEntry` — Summary
An entry of the ledger: a difference as found, and what is known of it.

#### `differencesBetween` {#symbol-differencesbetween}
- Type: function
- Source: [source](../../../../tests/page-scan/compare.ts#L32)
- Returns: [`Difference`](#symbol-difference)[]

##### `differencesBetween` — Summary
Every difference between the files each side wrote, each keyed by its path relative to the scanned folder.

#### `heldToLedger` {#symbol-heldtoledger}
- Type: function
- Source: [source](../../../../tests/page-scan/compare.ts#L57)

##### `heldToLedger` — Summary
The differences found that the ledger does not list for the fixture, and the ledger's entries for it no longer found.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

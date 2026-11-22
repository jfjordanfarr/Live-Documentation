# `tests/page-scan/compare.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/compare.test.ts`
- Generated At: 2026-11-22T07:13:00.714Z

## Authored
### Purpose
Unit cases of the comparison and the ledger: identical files find nothing, a file one side alone wrote and a file that differs are named, and the ledger fails both a difference it does not list and an entry that no longer occurs.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compare.LedgerEntry`](./compare.ts.mdmd.md#symbol-ledgerentry) (type-only)
- [`compare.MultipleReadEntry`](./compare.ts.mdmd.md#symbol-multiplereadentry) (type-only)
- [`compare.differencesBetween`](./compare.ts.mdmd.md#symbol-differencesbetween)
- [`compare.heldToLedger`](./compare.ts.mdmd.md#symbol-heldtoledger)
- [`compare.readMoreThanOnce`](./compare.ts.mdmd.md#symbol-readmorethanonce)
- [`compare.readsHeldToLedger`](./compare.ts.mdmd.md#symbol-readsheldtoledger)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

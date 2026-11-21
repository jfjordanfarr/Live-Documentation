# `tests/integration/live-docs/oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/oracle.test.ts`
- Generated At: 2026-11-21T05:11:47.652Z

## Authored
### Purpose
Holds the readers to the oracles of every sample program that carries compiler expectations, without a compiler present. The bookkeeping first: every expected compiler edge is either found or missing, nothing is both found and extra, every hand-verified edge is accounted for, and every expected project reference is found or missing. Then the hand-verified edges are held to the program's ledger, `expected/hand-verified-misses.json`: one the readers miss fails the test unless the ledger lists it with its cause, and a listed one that is drawn again fails it too. The compiler's missing and extra edges are reported, not yet held to a ledger.

### Notes
- Written on 2026-09-27 with the oracle ([Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-2)); the project-reference bucket came on 2026-09-28 ([Turn 34](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)). The programs are found by walking `tests/integration/programs/<language>/<program>` for an `expected/compiler-edges.json`, so a newly measured program joins the suite by carrying that file, and the estate is asserted present so the walk cannot silently find nothing.
- Until 2026-11-21 it asserted the bookkeeping alone, so no reader's regression on a sample program could fail it; the root found by hand that day that the estate's comparison reported three hand-verified edges missing and nothing said so. A hand-verified edge is a truth a person asserted, so those are now held to a ledger with their causes, in the manner of the page check's `tests/page-scan/differences.json`, and a case of its own shows the hold failing both ways. On that commit the compiler's edges were 50 missing and 4 extra over 26 programs, 39 of them C and C++ calls to the file that defines a function; a ledger for them waits on the root ([the account](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- [`compare.compareFixture`](../../../scripts/oracle/compare.ts.mdmd.md#symbol-comparefixture)
- [`compare.heldToLedger`](../../../scripts/oracle/compare.ts.mdmd.md#symbol-heldtoledger)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../layer-3/openings.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

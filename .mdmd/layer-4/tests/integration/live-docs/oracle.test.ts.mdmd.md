# `tests/integration/live-docs/oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/oracle.test.ts`
- Generated At: 2026-11-23T00:34:57.432Z

## Authored
### Purpose
Holds the readers to the oracles of every sample program that carries compiler expectations, without a compiler present. The bookkeeping first: every expected compiler edge is either found or missing, nothing is both found and extra, every hand-verified edge is accounted for, and every expected project reference is found, missing, or between projects with no manifest of their own. Then the differences are held to ledgers: a hand-verified edge the readers miss fails the test unless the program's `expected/hand-verified-misses.json` lists it with its cause, and a compiler's missing or extra edge fails it unless a cause of the programs' shared `compiler-differences.json` lists it; a listed edge no longer found fails either too, so a ledger can only shrink truthfully.

### Notes
- Written on 2026-09-27 with the oracle ([Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-2)); the project-reference bucket came on 2026-09-28 ([Turn 34](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)). The programs are found by walking `tests/integration/programs/<language>/<program>` for an `expected/compiler-edges.json`, so a newly measured program joins the suite by carrying that file, and the estate is asserted present so the walk cannot silently find nothing.
- Until 2026-11-21 it asserted the bookkeeping alone, so no reader's regression on a sample program could fail it; the root found by hand that day that the estate's comparison reported three hand-verified edges missing and nothing said so. A hand-verified edge is a truth a person asserted, so those are now held to a ledger with their causes, in the manner of the page check's `tests/page-scan/differences.json`, and a case of its own shows the hold failing both ways. The compiler's edges, 50 missing and 4 extra over 26 programs, followed the same day under seven causes, each confirmed by reading its reader, after the root ruled for a ledger by cause rather than edge by edge; the root then ruled that an edge the hand-verified list asserts is no extra, which took the estate's HTTP call and its cause out, leaving six; two more cases show the side of an edge telling a missing one from an extra, and the ledger naming only measured programs, each difference once ([the account](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- [`compare.COMPILER_LEDGER`](../../../scripts/oracle/compare.ts.mdmd.md#symbol-compiler_ledger)
- [`compare.compareFixture`](../../../scripts/oracle/compare.ts.mdmd.md#symbol-comparefixture)
- [`compare.heldToLedger`](../../../scripts/oracle/compare.ts.mdmd.md#symbol-heldtoledger)
- [`compare.readCompilerCauses`](../../../scripts/oracle/compare.ts.mdmd.md#symbol-readcompilercauses)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../layer-3/openings.mdmd.md)
- [`README.md`](../../../../../README.md)
<!-- LIVE-DOC:END Cited By -->

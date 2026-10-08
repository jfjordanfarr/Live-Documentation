# tests/integration/live-docs/oracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/oracle.test.ts
- Generated At: 2026-09-27T23:21:33.882Z

## Authored
### Purpose
Keeps the oracle comparison's bookkeeping on every sample program that carries compiler expectations, without a compiler present: every expected compiler edge is either found or missing, nothing is both found and extra, every hand-verified edge is accounted for where a program has them, and every expected project reference is found or missing. What the adapter scores is the report's business, not this test's.

### Notes
- Written on 2026-09-27 with the oracle ([Turn 2](../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-2)); the project-reference bucket came on 2026-09-28 ([Turn 34](../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)). The programs are found by walking `tests/integration/programs/<language>/<program>` for an `expected/compiler-edges.json`, so a newly measured program joins the suite by carrying that file, and the estate is asserted present so the walk cannot silently find nothing.

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
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

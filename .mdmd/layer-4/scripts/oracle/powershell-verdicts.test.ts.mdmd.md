# `scripts/oracle/powershell-verdicts.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/oracle/powershell-verdicts.test.ts`
- Generated At: 2026-11-22T07:12:57.997Z

## Authored
### Purpose
Holds the reading of the hand's table of 222 wires to the table's own counts (rows per corpus, verdicts, the two readers agreeing on every row), and the scoring to a small set of rows whose answers are known: a true wire not drawn and a false wire drawn differ, an arguable one is only counted, a row whose files are missing or whose corpus was never committed is not scored.

### Notes
- Written on 2026-11-21 with [`powershell-verdicts.ts`](./powershell-verdicts.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
- [`powershell-verdicts.HandVerdict`](./powershell-verdicts.ts.mdmd.md#symbol-handverdict) (type-only)
- [`powershell-verdicts.readVerdicts`](./powershell-verdicts.ts.mdmd.md#symbol-readverdicts)
- [`powershell-verdicts.scoreVerdicts`](./powershell-verdicts.ts.mdmd.md#symbol-scoreverdicts)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

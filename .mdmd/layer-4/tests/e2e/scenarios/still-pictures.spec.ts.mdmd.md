# tests/e2e/scenarios/still-pictures.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/scenarios/still-pictures.spec.ts
- Generated At: 2026-11-18T19:17:17.209Z

## Authored
### Purpose
Runs the scenario table over the nine Rosetta samples and this repository's own map, one case per scenario and map, reporting every broken promise of a scenario.

### Notes
Each case writes its readings, verdicts and screenshots to `reports/scenarios/<map>/` and shares nothing with another case, so the suite may run at more than one worker. A scenario the token table cannot serve is skipped with its reason. On 2026-11-18, at one worker on a quiet machine, the 43 cases that apply ran in 128 s and judged 713 promises, all kept. The first slice of [the owner's proposal](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-8), built on [the frame they accepted](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#roots-reply-to-turn-11-as-delivered).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- `node:fs` - `fs`
- `node:path` - `path`
- [`files.readOracleEdges`](../../../scripts/oracle/files.ts.mdmd.md#symbol-readoracleedges)
- [`instrument.readSettled`](./instrument.ts.mdmd.md#symbol-readsettled)
- [`instrument.watchPage`](./instrument.ts.mdmd.md#symbol-watchpage)
- [`judgments.Floor`](./judgments.ts.mdmd.md#symbol-floor)
- [`judgments.LAWS`](./judgments.ts.mdmd.md#symbol-laws)
- [`judgments.OracleEdge`](./judgments.ts.mdmd.md#symbol-oracleedge)
- [`judgments.Verdict`](./judgments.ts.mdmd.md#symbol-verdict)
- [`judgments.judgeFloor`](./judgments.ts.mdmd.md#symbol-judgefloor)
- [`judgments.samePicture`](./judgments.ts.mdmd.md#symbol-samepicture)
- [`judgments.tonesHeld`](./judgments.ts.mdmd.md#symbol-tonesheld)
- [`judgments.wiresMatchData`](./judgments.ts.mdmd.md#symbol-wiresmatchdata)
- [`judgments.wiresMatchOracle`](./judgments.ts.mdmd.md#symbol-wiresmatchoracle)
- [`Reading`](./reading.ts.mdmd.md#symbol-reading) (type-only)
- [`table.SCENARIOS`](./table.ts.mdmd.md#symbol-scenarios)
- [`table.Scenario`](./table.ts.mdmd.md#symbol-scenario)
- [`tokens.RosettaManifest`](./tokens.ts.mdmd.md#symbol-rosettamanifest)
- [`tokens.TokenError`](./tokens.ts.mdmd.md#symbol-tokenerror)
- [`tokens.TokenTable`](./tokens.ts.mdmd.md#symbol-tokentable-interface)
- [`tokens.resolveList`](./tokens.ts.mdmd.md#symbol-resolvelist)
- [`tokens.resolveText`](./tokens.ts.mdmd.md#symbol-resolvetext)
- [`tokens.tokenTable`](./tokens.ts.mdmd.md#symbol-tokentable-function)
- [`still-picture.displayNames`](../still-picture.ts.mdmd.md#symbol-displaynames)
- [`still-picture.loadGraph`](../still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.localMapStill`](../still-picture.ts.mdmd.md#symbol-localmapstill)
- [`still-picture.localRetainUrl`](../still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->

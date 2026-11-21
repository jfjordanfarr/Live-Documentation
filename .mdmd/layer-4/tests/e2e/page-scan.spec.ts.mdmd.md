# `tests/e2e/page-scan.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/page-scan.spec.ts`
- Generated At: 2026-11-21T03:40:54.454Z

## Authored
### Purpose
The check in Chromium: for each fixture the scanning page is opened from disk, handed a copy of the fixture through its `<input webkitdirectory>`, and scans it; Node's generator then scans the same copy, outside every repository; every file each wrote is compared whole and held to the ledger. Each case keeps, as its artifact `page-scan.json`, the calls made of the stand-ins, the files read and how often, and both sides' times, none of it asserted.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- Built first by `npm run e2e:bundles`; a page built from other sources than those on disk is refused before any case runs, naming the changed files.
- On 2026-11-21 the 45 cases ran in about 150 s at one worker through the lane, and in 250 s with the integration suite running beside them, so the whole set fits one hold of five minutes; `--grep "fixtures/"` and `--grep-invert "fixtures/"` halve it. Each case takes 2 to 6 s, most of it the page's opening and Node's start, and its own limit is 90 s.
- Shown red on 2026-11-21: with a doc altered in the page (an unlisted difference), with a ledger entry that does not occur (a gone entry), and with a stand-in changed after the page was built (the refusal).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- `node:child_process` - `spawnSync`
- `node:crypto` - `createHash`
- `node:fs` - `fs`
- `node:module` - `createRequire`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`fixture.copyFixture`](../../scripts/oracle/fixture.ts.mdmd.md#symbol-copyfixture)
- [`fixture.listFixtureFiles`](../../scripts/oracle/fixture.ts.mdmd.md#symbol-listfixturefiles)
- [`compare.LedgerEntry`](../page-scan/compare.ts.mdmd.md#symbol-ledgerentry)
- [`compare.differencesBetween`](../page-scan/compare.ts.mdmd.md#symbol-differencesbetween)
- [`compare.heldToLedger`](../page-scan/compare.ts.mdmd.md#symbol-heldtoledger)
- [`FIXTURES`](../page-scan/fixtures.ts.mdmd.md#symbol-fixtures)
<!-- LIVE-DOC:END Dependencies -->

# `tests/page-scan/node-needs.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/node-needs.test.ts`
- Generated At: 2026-11-21T03:40:56.663Z

## Authored
### Purpose
The check's first level, without a browser (in `npm run test:integration`): the scanning bundle builds from the engine as it stands with the check's stand-ins, what of Node it needs is the committed `node-needs.json`, it holds no module of the history engine, and each stand-in answers for exactly the members the list names.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- Shown red on 2026-11-21: with an `existsSync` added to the stand-in for `node:fs` ("exports existsSync, which the scan's path does not name"), and with `lstatSync` taken out of the committed list for `gitIgnored.ts`. With `url` taken out of the build's stand-ins the build itself refused, naming `pathUtils.ts` and `node:url`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`build-page.STAND_INS`](./build-page.mjs.mdmd.md#symbol-stand_ins)
- [`node-needs.NEEDS_FILE`](./node-needs.mjs.mdmd.md#symbol-needs_file)
- [`node-needs.nodeNeeds`](./node-needs.mjs.mdmd.md#symbol-nodeneeds)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

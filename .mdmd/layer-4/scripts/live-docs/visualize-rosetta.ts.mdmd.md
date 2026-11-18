# scripts/live-docs/visualize-rosetta.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-rosetta.ts
- Entry: command `live-docs:visualize:rosetta` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-18T19:06:09.467Z

## Authored
### Purpose
Builds the Explorer over each Rosetta program into `samples/rosetta/<language>/` of the site, for the browser tests' scenario table.

### Notes
Reads the programs from the Rosetta manifest and builds each with the estate sample's own function ([sample-build.ts](sample-build.ts.mdmd.md)). All nine take about 5.7 s (2026-11-18, quiet machine). `test:e2e` runs it before the browser passes. Written for [the slice's brief](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-scenario-suites-builder-dispatched).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path`
- [`cli.UsageError`](./cli.ts.mdmd.md#symbol-usageerror)
- [`cli.optionValue`](./cli.ts.mdmd.md#symbol-optionvalue)
- [`cli.runCommand`](./cli.ts.mdmd.md#symbol-runcommand)
- [`sample-build.buildSample`](./sample-build.ts.mdmd.md#symbol-buildsample)
<!-- LIVE-DOC:END Dependencies -->

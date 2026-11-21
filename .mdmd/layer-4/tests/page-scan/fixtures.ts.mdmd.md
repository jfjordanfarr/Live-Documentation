# `tests/page-scan/fixtures.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/page-scan/fixtures.ts`
- Generated At: 2026-11-21T03:40:56.644Z

## Authored
### Purpose
The folders the check scans: every sample program under `tests/integration/programs` and every fixture under `tests/integration/fixtures`, read from the folders, so that a sample added later joins the check.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- All of them, and not a chosen few, at the owner's word in the same turn: "exploring a wide variety of possibility space enabled (forced, really) more parsimonious and simple design to accommodate the ability to measure and detect honestly in more contexts." The 45 folders ran in about two and a half minutes at one worker on 2026-11-21.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PageScanFixture` {#symbol-pagescanfixture}
- Type: interface
- Source: [source](../../../../tests/page-scan/fixtures.ts#L14)

##### `PageScanFixture` — Summary
A folder the check scans: a short name (`csharp/estate`, `fixtures/link-targets`) and where it lies.

#### `FIXTURES` {#symbol-fixtures}
- Type: const
- Source: [source](../../../../tests/page-scan/fixtures.ts#L23)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

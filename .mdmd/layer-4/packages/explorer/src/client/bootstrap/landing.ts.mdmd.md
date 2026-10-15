# packages/explorer/src/client/bootstrap/landing.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/bootstrap/landing.ts
- Generated At: 2026-10-15T16:17:52.310Z

## Authored
### Purpose
Where the Explorer opens when no address, no remembered place and no configuration names a file, decided by the docs' `Entry` lines: the one program, command, module or declared entry outside the sample roots; the root landing with nothing pinned when there are several, or none a reading starts at; and the guess by file name only when the docs declare no entry at all. Pure function with Vitest tests.

### Notes
- Written 2026-10-15 ([Turn 4](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) for the landing rule the owner accepted: a tooling input, an opening served and a test are entries that start a file without being where a reading starts, so they never decide the landing; a sample program's entries are inputs to the tool, so they are left out by `underSampleRoot`. On this repository's bundle, which declares many commands, the map opens on the root; the rosetta sample's `main.ts`, which the file-name guess had picked, is under a sample root.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Landing` {#symbol-landing}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/landing.ts#L18)

##### `Landing` — Summary
Where to open: a file, the root landing with nothing pinned, or the file-name guess.

#### `underSampleRoot` {#symbol-undersampleroot}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/landing.ts#L23)

##### `underSampleRoot` — Summary
True when the path lies under one of the sample roots.

#### `landingOf` {#symbol-landingof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/landing.ts#L28)
- Returns: [`Landing`](#symbol-landing)
- Parameters: `graph`: [`LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `landingOf` — Summary
The landing a graph's Entry lines decide.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
<!-- LIVE-DOC:END Dependencies -->

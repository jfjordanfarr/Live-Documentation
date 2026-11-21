# `packages/engine/src/live-docs/adapters/spaces.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/spaces.ts`
- Generated At: 2026-11-21T21:13:43.698Z

## Authored
### Purpose
The one write-over every comment step of the readers uses: a text in spaces, one for each UTF-16 unit, its line breaks kept, so that each position and line of the result is the same as in the text.

### Notes
- Made on 2026-11-21, when an independent review showed each step writing a character outside the Basic Multilingual Plane as one space where the text holds two units, so that every position after it moved ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md#the-second-round-after-an-independent-review)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inSpaces` {#symbol-inspaces}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/spaces.ts#L12)

##### `inSpaces` — Summary
The text written over in spaces, one for each UTF-16 unit, its line breaks kept.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

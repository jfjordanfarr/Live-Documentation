# `scripts/devcontainer.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/devcontainer.test.ts`
- Generated At: 2026-11-19T21:10:18.220Z

## Authored
### Purpose
Holds the devcontainer configuration that passes the host's graphics card in to the ordinary one: the same in everything but its name and the two run arguments, with the same feature lock.

### Notes
- Written on 2026-11-17 ([Turn 1 of the November 17 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-1)). A devcontainer configuration cannot extend another, so `.devcontainer/wsl2-graphics-card/devcontainer.json` repeats `.devcontainer/devcontainer.json`, and a repeated file drifts unless something fails when it does; why there are two configurations at all is in [the measurements](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#work-notes-turn-2).
- Both files are JSON with comments, read here with TypeScript's own reader of such files, since the compiler is already a dependency. The test stands in `scripts/` because the unit project runs `scripts/**/*.test.ts` and `.devcontainer/` has no tests of its own.
- It also states the two run arguments exactly, so that a change to how the card is passed in is made in the test and the configuration together.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
- `typescript` - `ts`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

# scripts/steps.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/steps.test.ts
- Generated At: 2026-10-19T00:50:07.165Z

## Authored
### Purpose
Holds the gate's step runner in `steps.mjs` to its word: a command run as a step returns on a clean exit and throws its label and exit code otherwise.

### Notes
- Written on 2026-10-18 with the shared module, under [Turn 11 of the October 17 session](../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-11). The commands are one-line scripts run in a child node, so the test spawns nothing of the repository's. Three further tests held a concurrent runner that was removed the same night with the script it served; they were shown to fail under three mutations of it before that.
- The capture replaces `console.log` and `process.stdout.write` for the test's duration, so a failing assertion's own output is printed after the capture is restored.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`steps.runStep`](./steps.mjs.mdmd.md#symbol-runstep)
- `vitest` - `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

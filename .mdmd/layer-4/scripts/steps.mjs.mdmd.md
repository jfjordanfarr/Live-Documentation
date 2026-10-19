# scripts/steps.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/steps.mjs
- Generated At: 2026-10-19T00:50:07.155Z

## Authored
### Purpose
The steps of the gate's scripts, shared by `verify.mjs` and `safe-to-commit.mjs`: one command run to completion with its output on the console (`runStep`), and one npm script run that way (`runNpmScript`).

### Notes
- Extracted on 2026-10-18 from the two copies that `verify.mjs` and `safe-to-commit.mjs` had carried since October 2025, under [Turn 11 of the October 17 session](../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-11), the owner's go for a parallelization of the gate. A concurrent runner was built beside these for the browser tests' three bundles, and removed the same night when the gate measured the three builds at 4, 4 and 33 seconds, so that building them at once saved eight seconds; the browser tests themselves stay on one worker by the owner's rule (Turn 12).
- npm is run through the npm that started the script when `npm_execpath` names a JavaScript file, with no shell; otherwise through the platform's npm, which on Windows is a `.cmd` and needs one.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `runStep` {#symbol-runstep}
- Type: function
- Source: [source](../../../scripts/steps.mjs#L25)

##### `runStep` — Summary
Runs one command to completion with its output on this console; throws when it fails.

#### `runNpmScript` {#symbol-runnpmscript}
- Type: function
- Source: [source](../../../scripts/steps.mjs#L38)

##### `runNpmScript` — Summary
Runs one npm script as a step: `runNpmScript("Lint", ["run", "lint"])`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
<!-- LIVE-DOC:END Dependencies -->

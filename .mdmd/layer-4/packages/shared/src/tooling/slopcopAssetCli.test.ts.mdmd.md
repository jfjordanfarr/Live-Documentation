# packages/shared/src/tooling/slopcopAssetCli.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/tooling/slopcopAssetCli.test.ts
- Live Doc ID: LD-test-packages-shared-src-tooling-slopcopassetcli-test-ts
- Generated At: 2026-02-03T21:55:41.447Z

## Authored
### Purpose
Locks in the SlopCop asset CLI’s fail/repair workflow with a Vitest harness that replays the curated fixture workspace ([asset audit rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L4488-L4554)).

### Notes
- Verifies the CLI emits exit code 3 and names removed files when images/videos disappear, matching the regression we committed to catch ([commit briefing](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L4556-L4568)).
- Restores the fixture to ensure downstream runs stay green, keeping the asset audit opt-in until maintainers flip it on globally ([asset fixture summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L4488-L4554)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.447Z","inputHash":"f64631830c91f98d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- `node:process` - `process`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

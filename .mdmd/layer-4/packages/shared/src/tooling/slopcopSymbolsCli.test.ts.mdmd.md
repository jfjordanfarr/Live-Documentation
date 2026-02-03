# packages/shared/src/tooling/slopcopSymbolsCli.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/tooling/slopcopSymbolsCli.test.ts
- Live Doc ID: LD-test-packages-shared-src-tooling-slopcopsymbolscli-test-ts
- Generated At: 2026-02-03T21:55:41.461Z

## Authored
### Purpose
Exercises the `slopcop:symbols` CLI end to end so healthy workspaces exit cleanly and drifted headings surface duplicate/missing-anchor issues ([fixture harness](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L5400-L5480)).

### Notes
- Copies the dedicated fixture, runs the CLI, corrupts headings/anchors, and expects exit code 3 with both issue kinds before restoring the workspace ([fail→repair validation](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L6048-L6073)).
- Keeps the audit opt-in by proving the CLI works independently of the root config toggle, supporting the staged rollout we discussed for symbol lint ([rollout plan](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L6068-L6069)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.461Z","inputHash":"201f9c23dfb69e45"}]} -->
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

# packages/cli/src/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/cli/src/index.ts
- Live Doc ID: LD-implementation-packages-cli-src-index-ts
- Generated At: 2026-02-03T21:55:35.112Z

## Authored
### Purpose
Thin dispatcher entry point for the `live-docs` CLI that routes commands (generate, lint, inspect, visualize, system, report, orphans) to their respective TypeScript scripts.

### Notes
- Created 2025-12-15 (Dev Day 46) in chat 2025-12-15.2.md Turn 23 as part of npm-publish preparation
- Intentionally thin: spawns `npx tsx` on the underlying script rather than importing logic directly, keeping the dispatcher stable across script changes
- Supports `--help`, `--version`, and per-command help pass-through
- Single-package architecture decision: CLI/server/shared tightly coupled, no need for scoped monorepo overhead

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:35.112Z","inputHash":"f0f592b1fdc1c04b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawn`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->

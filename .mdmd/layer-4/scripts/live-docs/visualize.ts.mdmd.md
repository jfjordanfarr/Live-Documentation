# scripts/live-docs/visualize.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize.ts
- Live Doc ID: LD-implementation-scripts-live-docs-visualize-ts
- Generated At: 2026-01-12T21:24:49.029Z

## Authored
### Purpose
Provide a CLI that snapshots the workspace graph and renders an interactive 3D force layout focused on Layer-4 Live Docs so reviewers can see documentation coverage clusters and impact paths at a glance.

### Notes
Launches an ephemeral HTTP server, opens the default browser, and colours/weights nodes by archetype and induced dependency intensity (docs are linked when their underlying code artifacts interact).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:24:49.029Z","inputHash":"2b2382383d69126d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `../graph-tools/snapshot-workspace` - `snapshotWorkspace`
- `node:child_process` - `execFile`
- `node:fs/promises` - `fs`
- `node:http` - `createServer`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->

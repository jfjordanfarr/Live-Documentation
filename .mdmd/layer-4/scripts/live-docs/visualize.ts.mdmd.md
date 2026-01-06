# scripts/live-docs/visualize.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize.ts
- Live Doc ID: LD-implementation-scripts-live-docs-visualize-ts
- Generated At: 2026-01-06T20:05:23.837Z

## Authored
### Purpose
Provide a CLI that snapshots the workspace graph and renders an interactive 3D force layout focused on Layer-4 Live Docs so reviewers can see documentation coverage clusters and impact paths at a glance.

### Notes
Launches an ephemeral HTTP server, opens the default browser, and colours/weights nodes by archetype and induced dependency intensity (docs are linked when their underlying code artifacts interact).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-06T20:05:23.837Z","inputHash":"973fb1b4dc4c18a0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFile`
- `node:fs/promises` - `fs`
- `node:http` - `createServer`
- `node:path` - `path`
- `node:process` - `process`
- [`snapshot-workspace.snapshotWorkspace`](../graph-tools/snapshot-workspace.ts.mdmd.md#symbol-snapshotworkspace)
<!-- LIVE-DOC:END Dependencies -->

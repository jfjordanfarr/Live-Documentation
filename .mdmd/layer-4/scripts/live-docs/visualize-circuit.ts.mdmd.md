# scripts/live-docs/visualize-circuit.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-circuit.ts
- Live Doc ID: LD-implementation-scripts-live-docs-visualize-circuit-ts
- Generated At: 2026-01-12T21:24:49.018Z

## Authored
### Purpose
Render the Live Docs graph as a circuit-board style canvas, grouping markdown mirrors by directory and surfacing induced edges between related docs.

### Notes
The CLI snapshots the workspace graph, serves an HTML dashboard on port 3002, and reuses `snapshotWorkspace` to stay aligned with the canonical dependency graph.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:24:49.018Z","inputHash":"07550c61341a6dea"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `../graph-tools/snapshot-workspace` - `snapshotWorkspace`
- `child_process` - `execFile`
- `fs/promises` - `fs`
- `http` - `createServer`
- `path` - `path`
<!-- LIVE-DOC:END Dependencies -->

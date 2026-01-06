# scripts/live-docs/visualize-sonar.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-sonar.ts
- Live Doc ID: LD-implementation-scripts-live-docs-visualize-sonar-ts
- Generated At: 2026-01-06T20:05:23.833Z

## Authored
### Purpose
Project Live Docs relationships onto a radial “sonar” scan so reviewers can inspect impact rings around a chosen documentation node.

### Notes
The tool replays the snapshot graph, limits the view to three hops from the target, and serves the animated radar interface on port 3003.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-06T20:05:23.833Z","inputHash":"55132166e6cb6236"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `child_process` - `execFile`
- `http` - `createServer`
- `path` - `path`
- [`snapshot-workspace.snapshotWorkspace`](../graph-tools/snapshot-workspace.ts.mdmd.md#symbol-snapshotworkspace)
<!-- LIVE-DOC:END Dependencies -->

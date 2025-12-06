# scripts/live-docs/lib/liveDocGraph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/lib/liveDocGraph.ts
- Live Doc ID: LD-implementation-scripts-live-docs-lib-livedocgraph-ts
- Generated At: 2025-11-24T15:19:59.457Z

## Authored
### Purpose
Re-export shim providing backwards-compatible access to the `buildLiveDocGraph` function from its new home in `@live-documentation/scripts`. Created during the 11/21 package refactor to maintain CLI compatibility.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- This file contains only a re-export statement; the actual implementation lives in `packages/scripts/src/live-docs/graph/liveDocGraph.ts`.
- Exists to preserve import paths for scripts that predated the `packages/scripts` workspace package.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:59.457Z","inputHash":"4204629c79695397"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/scripts/live-docs/graph/liveDocGraph` (re-export)
<!-- LIVE-DOC:END Dependencies -->

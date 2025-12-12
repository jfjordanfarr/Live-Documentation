# scripts/live-docs/inspect.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect.ts
- Live Doc ID: LD-implementation-scripts-live-docs-inspect-ts
- Generated At: 2025-12-12T15:14:59.718Z

## Authored
### Purpose
Trace Live Documentation dependencies from the command line, supporting outbound and inbound lookups between artefacts as well as fan-out exploration when only a starting point is supplied.

### Notes
The CLI now emits stable JSON payloads for path, not-found, and fanout searches, flags max-depth cut-offs, and highlights missing documentation so LD-402 scenarios can assert failure diagnostics alongside happy-path chains. Symbol nodes carry any available documentation summaries and parameter notes so comment-based help from sources like PowerShell flows straight into inspect results.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-12T15:14:59.718Z","inputHash":"e4083375c38a2bce"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/scripts/live-docs/graph/liveDocGraph` - `LiveDocGraph`, `LiveDocGraphNode`, `buildLiveDocGraph`
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LiveDocumentationConfig`, `LiveDocumentationConfigInput`, `normalizeLiveDocumentationConfig`
- `@live-documentation/shared/tooling/pathUtils` - `normalizeWorkspacePath`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->

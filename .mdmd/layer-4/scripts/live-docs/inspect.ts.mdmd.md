# scripts/live-docs/inspect.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect.ts
- Live Doc ID: LD-implementation-scripts-live-docs-inspect-ts
- Generated At: 2025-12-15T00:38:07.458Z

## Authored
### Purpose
Trace Live Documentation dependencies from the command line, supporting outbound and inbound lookups between artefacts as well as fan-out exploration when only a starting point is supplied.

### Notes
The CLI now emits stable JSON payloads for path, not-found, and fanout searches, flags max-depth cut-offs, and highlights missing documentation so LD-402 scenarios can assert failure diagnostics alongside happy-path chains. Symbol nodes carry any available documentation summaries and parameter notes so comment-based help from sources like PowerShell flows straight into inspect results.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:07.458Z","inputHash":"4684701f3ddcbf42"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocGraph.LiveDocGraph`](../../packages/scripts/src/live-docs/graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)
- [`liveDocGraph.LiveDocGraphNode`](../../packages/scripts/src/live-docs/graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraphnode)
- [`liveDocGraph.buildLiveDocGraph`](../../packages/scripts/src/live-docs/graph/liveDocGraph.ts.mdmd.md#symbol-buildlivedocgraph)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`pathUtils.normalizeWorkspacePath`](../../packages/shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

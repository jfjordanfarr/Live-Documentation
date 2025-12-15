# packages/server/src/features/knowledge/rippleAnalyzer.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/knowledge/rippleAnalyzer.test.ts
- Live Doc ID: LD-test-packages-server-src-features-knowledge-rippleanalyzer-test-ts
- Generated At: 2025-12-15T00:38:06.397Z

## Authored
### Purpose
Confirms ripple analysis walks the graph correctly, respecting depth penalties, allowed relationship kinds, and path reporting.

### Notes
- Added with the ripple diagnostics rollout recorded in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md) to keep traversal scoring validated.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.397Z","inputHash":"7a53c922160ea2e5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `mkdtempSync`, `rmSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`rippleAnalyzer.RippleAnalyzer`](./rippleAnalyzer.ts.mdmd.md#symbol-rippleanalyzer)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.KnowledgeArtifact`](../../../../shared/src/index.ts.mdmd.md#symbol-knowledgeartifact)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/knowledge: [rippleAnalyzer.ts](./rippleAnalyzer.ts.mdmd.md)
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

# packages/server/src/features/knowledge/workspaceIndexProvider.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/knowledge/workspaceIndexProvider.test.ts
- Live Doc ID: LD-test-packages-server-src-features-knowledge-workspaceindexprovider-test-ts
- Generated At: 2025-12-11T02:38:00.870Z

## Authored
### Purpose
Exercises the workspace indexer against a miniature TypeScript project to confirm it surfaces dependency evidence between modules while ignoring unrelated files.

### Notes
- Authored with the initial indexer rollout described in [2025-10-19 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md) to keep graph seeding deterministic.
- Remained relevant after the metadata expansion on Oct 30 (see [2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md)), ensuring dependency capture stayed intact while MDMD parsing grew more sophisticated.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:00.870Z","inputHash":"ca86e0efff9b2e35"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:os` - `tmpdir`
- `node:path` - `path`
- `node:url` - `fileURLToPath`
- [`workspaceIndexProvider.createWorkspaceIndexProvider`](./workspaceIndexProvider.ts.mdmd.md#symbol-createworkspaceindexprovider)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/knowledge: [directoryScanner.ts](./directoryScanner.ts.mdmd.md), [importEvidenceExtractor.ts](./importEvidenceExtractor.ts.mdmd.md), [languageInference.ts](./languageInference.ts.mdmd.md), [linkHintExtractor.ts](./linkHintExtractor.ts.mdmd.md), [liveDocParser.ts](./liveDocParser.ts.mdmd.md), [tsSymbolExtractor.ts](./tsSymbolExtractor.ts.mdmd.md)
  [workspaceIndexProvider.ts](./workspaceIndexProvider.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

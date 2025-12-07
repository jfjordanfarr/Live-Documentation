# packages/server/src/features/live-docs/generator.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/live-docs/generator.test.ts
- Live Doc ID: LD-test-packages-server-src-features-live-docs-generator-test-ts
- Generated At: 2025-12-07T04:00:24.616Z

## Authored
### Purpose
Validates that `generateLiveDocs` prunes stale documents without authored context while preserving files that contain manual notes.

### Notes
- Ensures the Stage‑0 pruning safeguards added during the generator refactor (see [2025-11-10 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md)) remain regression-tested.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T04:00:24.616Z","inputHash":"c8f2546cfafa2c7e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LIVE_DOCUMENTATION_FILE_EXTENSION`, `normalizeLiveDocumentationConfig`
- `node:fs/promises` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`generator.generateLiveDocs`](./generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/live-docs: [evidenceBridge.ts](./evidenceBridge.ts.mdmd.md), [generator.ts](./generator.ts.mdmd.md)
- packages/shared/src/config: [liveDocumentationConfig.ts](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [archetype.ts](../../../../shared/src/live-docs/archetype.ts.mdmd.md), [core.ts](../../../../shared/src/live-docs/core.ts.mdmd.md), [coreConstants.ts](../../../../shared/src/live-docs/coreConstants.ts.mdmd.md), [coreTypes.ts](../../../../shared/src/live-docs/coreTypes.ts.mdmd.md), [coreUtils.ts](../../../../shared/src/live-docs/coreUtils.ts.mdmd.md), [dependencies.ts](../../../../shared/src/live-docs/dependencies.ts.mdmd.md)
  [discovery.ts](../../../../shared/src/live-docs/discovery.ts.mdmd.md), [fileUtils.ts](../../../../shared/src/live-docs/fileUtils.ts.mdmd.md), [gitUtils.ts](../../../../shared/src/live-docs/gitUtils.ts.mdmd.md), [jsDoc.ts](../../../../shared/src/live-docs/jsDoc.ts.mdmd.md), [markdown.ts](../../../../shared/src/live-docs/markdown.ts.mdmd.md), [rendering.ts](../../../../shared/src/live-docs/rendering.ts.mdmd.md)
  [schema.ts](../../../../shared/src/live-docs/schema.ts.mdmd.md), [sourceAnalysis.ts](../../../../shared/src/live-docs/sourceAnalysis.ts.mdmd.md), [symbolExtraction.ts](../../../../shared/src/live-docs/symbolExtraction.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](../../../../shared/src/live-docs/adapters/index.ts.mdmd.md), [aspnet.ts](../../../../shared/src/live-docs/adapters/aspnet.ts.mdmd.md), [c.ts](../../../../shared/src/live-docs/adapters/c.ts.mdmd.md), [csharp.ts](../../../../shared/src/live-docs/adapters/csharp.ts.mdmd.md), [java.ts](../../../../shared/src/live-docs/adapters/java.ts.mdmd.md), [powershell.ts](../../../../shared/src/live-docs/adapters/powershell.ts.mdmd.md)
  [python.ts](../../../../shared/src/live-docs/adapters/python.ts.mdmd.md), [ruby.ts](../../../../shared/src/live-docs/adapters/ruby.ts.mdmd.md), [rust.ts](../../../../shared/src/live-docs/adapters/rust.ts.mdmd.md)
- packages/shared/src/live-docs/heuristics: [dom.ts](../../../../shared/src/live-docs/heuristics/dom.ts.mdmd.md)
- packages/shared/src/tooling: [githubSlugger.ts](../../../../shared/src/tooling/githubSlugger.ts.mdmd.md), [githubSluggerRegex.ts](../../../../shared/src/tooling/githubSluggerRegex.ts.mdmd.md), [pathUtils.ts](../../../../shared/src/tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

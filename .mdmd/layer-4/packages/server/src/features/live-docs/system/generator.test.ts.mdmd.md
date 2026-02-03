# packages/server/src/features/live-docs/system/generator.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/live-docs/system/generator.test.ts
- Live Doc ID: LD-test-packages-server-src-features-live-docs-system-generator-test-ts
- Generated At: 2026-02-03T21:55:37.867Z

## Authored
### Purpose
Exercises `generateSystemLiveDocs` end-to-end against a temporary workspace to prove the Stage-0 loader, manifest reader, and statistical filters collaborate correctly before we rely on the CLI ([2025-11-11 summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md)).

### Notes
- Uses a throwaway workspace and baseline config to catch regressions in output-directory handling, mirroring the on-demand materialization strategy finalized on 2025-11-11.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.867Z","inputHash":"dda1238bbee7ecbd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`generator.generateSystemLiveDocs`](./generator.ts.mdmd.md#symbol-generatesystemlivedocs)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/live-docs/stage0: [docLoader.ts](../stage0/docLoader.ts.mdmd.md)
- packages/server/src/features/live-docs/system: [constants.ts](./constants.ts.mdmd.md), [formatting.ts](./formatting.ts.mdmd.md), [generator.ts](./generator.ts.mdmd.md), [rendering.ts](./rendering.ts.mdmd.md), [stageSequence.ts](./stageSequence.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
  [utils.ts](./utils.ts.mdmd.md)
- packages/server/src/features/live-docs/system/plans: [plans/index.ts](./plans/index.ts.mdmd.md)
- packages/server/src/features/live-docs/targets: [manifest.ts](../targets/manifest.ts.mdmd.md)
- packages/shared/src/config: [liveDocumentationConfig.ts](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [core.ts](../../../../../shared/src/live-docs/core.ts.mdmd.md), [markdown.ts](../../../../../shared/src/live-docs/markdown.ts.mdmd.md), [schema.ts](../../../../../shared/src/live-docs/schema.ts.mdmd.md), [types.ts](../../../../../shared/src/live-docs/types.ts.mdmd.md)
- packages/shared/src/live-docs/analysis: [coActivation.ts](../../../../../shared/src/live-docs/analysis/coActivation.ts.mdmd.md)
- packages/shared/src/tooling: [githubSlugger.ts](../../../../../shared/src/tooling/githubSlugger.ts.mdmd.md), [githubSluggerRegex.ts](../../../../../shared/src/tooling/githubSluggerRegex.ts.mdmd.md), [pathUtils.ts](../../../../../shared/src/tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

# packages/server/src/features/live-docs/system/generator.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/live-docs/system/generator.test.ts
- Live Doc ID: LD-test-packages-server-src-features-live-docs-system-generator-test-ts
- Generated At: 2025-12-07T16:27:06.614Z

## Authored
### Purpose
Exercises `generateSystemLiveDocs` end-to-end against a temporary workspace to prove the Stage-0 loader, manifest reader, and statistical filters collaborate correctly before we rely on the CLI ([2025-11-11 summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md)).

### Notes
- Uses a throwaway workspace and baseline config to catch regressions in output-directory handling, mirroring the on-demand materialization strategy finalized on 2025-11-11.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T16:27:06.614Z","inputHash":"d29335f2d13f994a"}]} -->
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
- [`generator.generateSystemLiveDocs`](./generator.ts.mdmd.md#symbol-generatesystemlivedocs)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/live-docs/stage0: [docLoader.ts](../stage0/docLoader.ts.mdmd.md)
- packages/server/src/features/live-docs/system: [constants.ts](./constants.ts.mdmd.md), [formatting.ts](./formatting.ts.mdmd.md), [generator.ts](./generator.ts.mdmd.md), [rendering.ts](./rendering.ts.mdmd.md), [stageSequence.ts](./stageSequence.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
  [utils.ts](./utils.ts.mdmd.md)
- packages/server/src/features/live-docs/system/plans: [coActivationPlan.ts](./plans/coActivationPlan.ts.mdmd.md), [componentPlan.ts](./plans/componentPlan.ts.mdmd.md), [interactionPlan.ts](./plans/interactionPlan.ts.mdmd.md), [plans/index.ts](./plans/index.ts.mdmd.md), [testingPlan.ts](./plans/testingPlan.ts.mdmd.md), [workflowPlan.ts](./plans/workflowPlan.ts.mdmd.md)
- packages/server/src/features/live-docs/targets: [manifest.ts](../targets/manifest.ts.mdmd.md)
- packages/shared/src/config: [liveDocumentationConfig.ts](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [archetype.ts](../../../../../shared/src/live-docs/archetype.ts.mdmd.md), [core.ts](../../../../../shared/src/live-docs/core.ts.mdmd.md), [coreConstants.ts](../../../../../shared/src/live-docs/coreConstants.ts.mdmd.md), [coreTypes.ts](../../../../../shared/src/live-docs/coreTypes.ts.mdmd.md), [coreUtils.ts](../../../../../shared/src/live-docs/coreUtils.ts.mdmd.md), [dependencies.ts](../../../../../shared/src/live-docs/dependencies.ts.mdmd.md)
  [discovery.ts](../../../../../shared/src/live-docs/discovery.ts.mdmd.md), [fileUtils.ts](../../../../../shared/src/live-docs/fileUtils.ts.mdmd.md), [gitUtils.ts](../../../../../shared/src/live-docs/gitUtils.ts.mdmd.md), [jsDoc.ts](../../../../../shared/src/live-docs/jsDoc.ts.mdmd.md), [markdown.ts](../../../../../shared/src/live-docs/markdown.ts.mdmd.md), [rendering.ts](../../../../../shared/src/live-docs/rendering.ts.mdmd.md)
  [schema.ts](../../../../../shared/src/live-docs/schema.ts.mdmd.md), [sourceAnalysis.ts](../../../../../shared/src/live-docs/sourceAnalysis.ts.mdmd.md), [symbolExtraction.ts](../../../../../shared/src/live-docs/symbolExtraction.ts.mdmd.md), [types.ts](../../../../../shared/src/live-docs/types.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](../../../../../shared/src/live-docs/adapters/index.ts.mdmd.md), [aspnet.ts](../../../../../shared/src/live-docs/adapters/aspnet.ts.mdmd.md), [c.ts](../../../../../shared/src/live-docs/adapters/c.ts.mdmd.md), [csharp.ts](../../../../../shared/src/live-docs/adapters/csharp.ts.mdmd.md), [java.ts](../../../../../shared/src/live-docs/adapters/java.ts.mdmd.md), [powershell.ts](../../../../../shared/src/live-docs/adapters/powershell.ts.mdmd.md)
  [python.ts](../../../../../shared/src/live-docs/adapters/python.ts.mdmd.md), [ruby.ts](../../../../../shared/src/live-docs/adapters/ruby.ts.mdmd.md), [rust.ts](../../../../../shared/src/live-docs/adapters/rust.ts.mdmd.md)
- packages/shared/src/live-docs/analysis: [coActivation.ts](../../../../../shared/src/live-docs/analysis/coActivation.ts.mdmd.md)
- packages/shared/src/live-docs/heuristics: [dom.ts](../../../../../shared/src/live-docs/heuristics/dom.ts.mdmd.md)
- packages/shared/src/tooling: [githubSlugger.ts](../../../../../shared/src/tooling/githubSlugger.ts.mdmd.md), [githubSluggerRegex.ts](../../../../../shared/src/tooling/githubSluggerRegex.ts.mdmd.md), [pathUtils.ts](../../../../../shared/src/tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

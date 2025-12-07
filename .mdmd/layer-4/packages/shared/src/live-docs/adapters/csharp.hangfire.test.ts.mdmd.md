# packages/shared/src/live-docs/adapters/csharp.hangfire.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/csharp.hangfire.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-csharp-hangfire-test-ts
- Generated At: 2025-12-07T04:00:25.586Z

## Authored
### Purpose
Verify the C# adapter resolves Hangfire `BackgroundJob.Enqueue<T>` calls to their worker implementations.

### Notes
Exercises the queue pipeline path in an isolated temp workspace to guard the LD-402 dependency hop.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T04:00:25.586Z","inputHash":"abf3669b1f7aac11"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`csharp.csharpAdapter`](./csharp.ts.mdmd.md#symbol-csharpadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/config: [liveDocumentationConfig.ts](../../config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [archetype.ts](../archetype.ts.mdmd.md), [core.ts](../core.ts.mdmd.md), [coreConstants.ts](../coreConstants.ts.mdmd.md), [coreTypes.ts](../coreTypes.ts.mdmd.md), [coreUtils.ts](../coreUtils.ts.mdmd.md), [dependencies.ts](../dependencies.ts.mdmd.md)
  [discovery.ts](../discovery.ts.mdmd.md), [fileUtils.ts](../fileUtils.ts.mdmd.md), [gitUtils.ts](../gitUtils.ts.mdmd.md), [jsDoc.ts](../jsDoc.ts.mdmd.md), [rendering.ts](../rendering.ts.mdmd.md), [sourceAnalysis.ts](../sourceAnalysis.ts.mdmd.md)
  [symbolExtraction.ts](../symbolExtraction.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [aspnet.ts](./aspnet.ts.mdmd.md), [c.ts](./c.ts.mdmd.md), [csharp.ts](./csharp.ts.mdmd.md), [java.ts](./java.ts.mdmd.md), [powershell.ts](./powershell.ts.mdmd.md)
  [python.ts](./python.ts.mdmd.md), [ruby.ts](./ruby.ts.mdmd.md), [rust.ts](./rust.ts.mdmd.md)
- packages/shared/src/live-docs/heuristics: [dom.ts](../heuristics/dom.ts.mdmd.md)
- packages/shared/src/tooling: [githubSlugger.ts](../../tooling/githubSlugger.ts.mdmd.md), [githubSluggerRegex.ts](../../tooling/githubSluggerRegex.ts.mdmd.md), [pathUtils.ts](../../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

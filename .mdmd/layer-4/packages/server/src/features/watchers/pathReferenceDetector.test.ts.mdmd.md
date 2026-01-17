# packages/server/src/features/watchers/pathReferenceDetector.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/watchers/pathReferenceDetector.test.ts
- Live Doc ID: LD-test-packages-server-src-features-watchers-pathreferencedetector-test-ts
- Generated At: 2026-01-17T19:21:09.983Z

## Authored
### Purpose
Proves the detector surfaces markdown-to-code links, import edges, and ignores external URLs so the watcher seeds only actionable path hints for the ripple pipeline <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2832-L2864>.

### Notes
- Refresh these scenarios whenever we adjust the hint heuristics or indexer globs—tests should mirror the real templates/docs/assets we expect to resolve <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2832-L2864> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L4504-L4572>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T19:21:09.983Z","inputHash":"8bd67aefe700f7b9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
- [`pathReferenceDetector.buildFileReferenceHints`](./pathReferenceDetector.ts.mdmd.md#symbol-buildfilereferencehints)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/server/src/features/watchers: [pathReferenceDetector.ts](./pathReferenceDetector.ts.mdmd.md)
- packages/shared/src/domain: [artifacts.ts](../../../../shared/src/domain/artifacts.ts.mdmd.md)
- packages/shared/src/inference: [fallbackHeuristicTypes.ts](../../../../shared/src/inference/fallbackHeuristicTypes.ts.mdmd.md), [fallbackInference.ts](../../../../shared/src/inference/fallbackInference.ts.mdmd.md)
- packages/shared/src/inference/heuristics: [artifactLayerUtils.ts](../../../../shared/src/inference/heuristics/artifactLayerUtils.ts.mdmd.md), [heuristics/index.ts](../../../../shared/src/inference/heuristics/index.ts.mdmd.md), [shared.ts](../../../../shared/src/inference/heuristics/shared.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

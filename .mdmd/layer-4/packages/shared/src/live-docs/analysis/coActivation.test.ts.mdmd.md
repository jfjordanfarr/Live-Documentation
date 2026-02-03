# packages/shared/src/live-docs/analysis/coActivation.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/analysis/coActivation.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-analysis-coactivation-test-ts
- Generated At: 2026-02-03T21:55:40.273Z

## Authored
### Purpose
Validates the co-activation analytics report so dependency edges, shared test weights, and threshold tuning stay deterministic for Live Docs impact analysis workflows. See `AI-Agent-Workspace/ChatHistory/2025/11/2025-11-11.md` for the original test pass that grounded these scenarios.

### Notes
Updated alongside the November 15 telemetry sweep that aligned Live Docs analytics with the canonical `.mdmd.md` extension handling; the same pass re-ran this suite under Vitest 4 to confirm compatibility. Provenance: `AI-Agent-Workspace/ChatHistory/2025/11/2025-11-15.md`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.273Z","inputHash":"f09020072b48114b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`coActivation.buildCoActivationReport`](./coActivation.ts.mdmd.md#symbol-buildcoactivationreport)
- [`types.Stage0Doc`](../types.ts.mdmd.md#symbol-stage0doc) (type-only)
- [`types.TargetManifest`](../types.ts.mdmd.md#symbol-targetmanifest) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/config: [liveDocumentationConfig.ts](../../config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [types.ts](../types.ts.mdmd.md)
- packages/shared/src/live-docs/analysis: [coActivation.ts](./coActivation.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

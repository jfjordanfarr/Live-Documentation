# packages/server/src/features/diagnostics/noiseFilter.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/diagnostics/noiseFilter.test.ts
- Live Doc ID: LD-test-packages-server-src-features-diagnostics-noisefilter-test-ts
- Generated At: 2026-01-17T19:21:09.921Z

## Authored
### Purpose
Verifies the ripple noise filter trims low-confidence, deep, and over-budget impacts, echoing the suppression safeguards introduced in [2025-10-23 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md).

### Notes
- Focuses on deterministic counter increments (confidence/depth/change/artifact) so diagnostics publishers inherit precise telemetry when thresholds shift.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T19:21:09.921Z","inputHash":"08454056f7d7b03b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`noiseFilter.NoiseFilterTotals`](./noiseFilter.ts.mdmd.md#symbol-noisefiltertotals)
- [`noiseFilter.ZERO_NOISE_FILTER_TOTALS`](./noiseFilter.ts.mdmd.md#symbol-zero_noise_filter_totals)
- [`noiseFilter.applyNoiseFilter`](./noiseFilter.ts.mdmd.md#symbol-applynoisefilter)
- [`rippleTypes.RippleImpact`](./rippleTypes.ts.mdmd.md#symbol-rippleimpact) (type-only)
- [`settingsBridge.NoiseFilterRuntimeConfig`](../settings/settingsBridge.ts.mdmd.md#symbol-noisefilterruntimeconfig) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/diagnostics: [noiseFilter.ts](./noiseFilter.ts.mdmd.md), [rippleTypes.ts](./rippleTypes.ts.mdmd.md)
- packages/server/src/features/settings: [providerGuard.ts](../settings/providerGuard.ts.mdmd.md), [settingsBridge.ts](../settings/settingsBridge.ts.mdmd.md)
- packages/shared/src/domain: [artifacts.ts](../../../../shared/src/domain/artifacts.ts.mdmd.md)
- packages/shared/src/inference: [fallbackHeuristicTypes.ts](../../../../shared/src/inference/fallbackHeuristicTypes.ts.mdmd.md), [fallbackInference.ts](../../../../shared/src/inference/fallbackInference.ts.mdmd.md)
- packages/shared/src/inference/heuristics: [artifactLayerUtils.ts](../../../../shared/src/inference/heuristics/artifactLayerUtils.ts.mdmd.md), [heuristics/index.ts](../../../../shared/src/inference/heuristics/index.ts.mdmd.md), [shared.ts](../../../../shared/src/inference/heuristics/shared.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

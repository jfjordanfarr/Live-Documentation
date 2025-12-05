# packages/server/src/features/diagnostics/noiseFilter.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/diagnostics/noiseFilter.ts
- Live Doc ID: LD-implementation-packages-server-src-features-diagnostics-noisefilter-ts
- Generated At: 2025-12-05T04:16:17.864Z

## Authored
### Purpose
Applies confidence, depth, and per-target budgets to ripple diagnostics so publisher batches stay actionable, matching the suppression work logged in [2025-10-23 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md).

### Notes
- Maintains per-change and per-artifact counters to coordinate with acknowledgement and hysteresis layers without duplicating their logic.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:17.864Z","inputHash":"5741acedb77b071c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NoiseFilterTotals` {#symbol-noisefiltertotals}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/noiseFilter.ts#L4)

#### `ZERO_NOISE_FILTER_TOTALS` {#symbol-zero_noise_filter_totals}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/noiseFilter.ts#L11)
- Returns: `NoiseFilterTotals`

#### `NoiseFilterResult` {#symbol-noisefilterresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/noiseFilter.ts#L46)
- Constraints: `HasRippleImpacts`

#### `applyNoiseFilter` {#symbol-applynoisefilter}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/noiseFilter.ts#L51)
- Returns: `NoiseFilterResult`
- Parameters: `config`: `NoiseFilterRuntimeConfig`
- Constraints: `HasRippleImpacts`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`rippleTypes.RippleImpact`](./rippleTypes.ts.mdmd.md#symbol-rippleimpact) (type-only)
- [`settingsBridge.NoiseFilterRuntimeConfig`](../settings/settingsBridge.ts.mdmd.md#symbol-noisefilterruntimeconfig) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [noiseFilter.test.ts](./noiseFilter.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](./publishDocDiagnostics.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

# packages/server/src/features/diagnostics/publishCodeDiagnostics.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/diagnostics/publishCodeDiagnostics.ts
- Live Doc ID: LD-implementation-packages-server-src-features-diagnostics-publishcodediagnostics-ts
- Generated At: 2025-12-05T04:16:17.890Z

## Authored
### Purpose
Issues ripple warnings for code artifacts impacted by upstream documentation or dependency changes, closing the diagnostics loop laid out in [2025-10-17 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md).

### Notes
- Shares the acknowledgement and hysteresis safeguards added on Oct 21 ([2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md)) and inherits the noise-filter tuning from Oct 23 ([2025-10-23 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:17.890Z","inputHash":"2e33bcc97d5ec4c5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CodeChangeContext` {#symbol-codechangecontext}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/publishCodeDiagnostics.ts#L16)

#### `PublishCodeDiagnosticsOptions` {#symbol-publishcodediagnosticsoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/publishCodeDiagnostics.ts#L23)

#### `PublishCodeDiagnosticsResult` {#symbol-publishcodediagnosticsresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/publishCodeDiagnostics.ts#L31)

#### `publishCodeDiagnostics` {#symbol-publishcodediagnostics}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/publishCodeDiagnostics.ts#L47)
- Returns: `PublishCodeDiagnosticsResult`
- Parameters: `options`: `PublishCodeDiagnosticsOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `KnowledgeArtifact` (type-only)
- [`acknowledgementService.AcknowledgementService`](./acknowledgementService.ts.mdmd.md#symbol-acknowledgementservice) (type-only)
- [`diagnosticUtils.DiagnosticSender`](./diagnosticUtils.ts.mdmd.md#symbol-diagnosticsender)
- [`diagnosticUtils.normaliseDisplayPath`](./diagnosticUtils.ts.mdmd.md#symbol-normalisedisplaypath)
- [`hysteresisController.HysteresisController`](./hysteresisController.ts.mdmd.md#symbol-hysteresiscontroller) (type-only)
- [`noiseFilter.NoiseFilterTotals`](./noiseFilter.ts.mdmd.md#symbol-noisefiltertotals)
- [`noiseFilter.ZERO_NOISE_FILTER_TOTALS`](./noiseFilter.ts.mdmd.md#symbol-zero_noise_filter_totals)
- [`noiseFilter.applyNoiseFilter`](./noiseFilter.ts.mdmd.md#symbol-applynoisefilter)
- [`rippleTypes.RippleImpact`](./rippleTypes.ts.mdmd.md#symbol-rippleimpact) (type-only)
- [`settingsBridge.RuntimeSettings`](../settings/settingsBridge.ts.mdmd.md#symbol-runtimesettings) (type-only)
- [`artifactWatcher.CodeTrackedArtifactChange`](../watchers/artifactWatcher.ts.mdmd.md#symbol-codetrackedartifactchange) (type-only)
- `vscode-languageserver/node` - `Diagnostic`, `DiagnosticSeverity`
<!-- LIVE-DOC:END Dependencies -->

# packages/server/src/features/diagnostics/publishDocDiagnostics.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/diagnostics/publishDocDiagnostics.test.ts
- Live Doc ID: LD-test-packages-server-src-features-diagnostics-publishdocdiagnostics-test-ts
- Generated At: 2025-12-11T02:38:00.483Z

## Authored
### Purpose
Exercises the document diagnostic publisher across emission, suppression, and acknowledgement paths, anchoring the workflow shipped in [2025-10-17 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md).

### Notes
- Tracks later resilience work by verifying hysteresis guards ([2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md)) and noise filter/acknowledgement suppression ([2025-10-23 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:00.483Z","inputHash":"9794aebdabb9e3c3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `DiagnosticRecord`, `KnowledgeArtifact` (type-only)
- [`acknowledgementService.AcknowledgementService`](./acknowledgementService.ts.mdmd.md#symbol-acknowledgementservice) (type-only)
- [`hysteresisController.HysteresisController`](./hysteresisController.ts.mdmd.md#symbol-hysteresiscontroller)
- [`noiseFilter.ZERO_NOISE_FILTER_TOTALS`](./noiseFilter.ts.mdmd.md#symbol-zero_noise_filter_totals)
- [`publishDocDiagnostics.DocumentChangeContext`](./publishDocDiagnostics.ts.mdmd.md#symbol-documentchangecontext)
- [`publishDocDiagnostics.publishDocDiagnostics`](./publishDocDiagnostics.ts.mdmd.md#symbol-publishdocdiagnostics)
- [`rippleTypes.RippleImpact`](./rippleTypes.ts.mdmd.md#symbol-rippleimpact) (type-only)
- [`settingsBridge.RuntimeSettings`](../settings/settingsBridge.ts.mdmd.md#symbol-runtimesettings) (type-only)
- [`artifactWatcher.DocumentTrackedArtifactChange`](../watchers/artifactWatcher.ts.mdmd.md#symbol-documenttrackedartifactchange) (type-only)
- `vitest` - `describe`, `expect`, `it`, `vi`
- `vscode-languageserver/node` - `Diagnostic` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/changeEvents: [changeQueue.ts](../changeEvents/changeQueue.ts.mdmd.md)
- packages/server/src/features/diagnostics: [acknowledgementService.ts](./acknowledgementService.ts.mdmd.md), [diagnosticUtils.ts](./diagnosticUtils.ts.mdmd.md), [hysteresisController.ts](./hysteresisController.ts.mdmd.md), [noiseFilter.ts](./noiseFilter.ts.mdmd.md), [publishDocDiagnostics.ts](./publishDocDiagnostics.ts.mdmd.md), [rippleTypes.ts](./rippleTypes.ts.mdmd.md)
- packages/server/src/features/settings: [providerGuard.ts](../settings/providerGuard.ts.mdmd.md), [settingsBridge.ts](../settings/settingsBridge.ts.mdmd.md)
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/server/src/features/watchers: [artifactWatcher.ts](../watchers/artifactWatcher.ts.mdmd.md), [pathReferenceDetector.ts](../watchers/pathReferenceDetector.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

# packages/server/src/features/diagnostics/acknowledgementService.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/diagnostics/acknowledgementService.test.ts
- Live Doc ID: LD-test-packages-server-src-features-diagnostics-acknowledgementservice-test-ts
- Generated At: 2025-12-11T02:38:00.391Z

## Authored
### Purpose
Validates the acknowledgement persistence and hysteresis gates introduced with T043 so diagnostic emissions stay suppressed until fresh change events, mirroring the behaviour shipped in [2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md).

### Notes
- Exercises temp GraphStore instances to prove acknowledgements survive restarts and honour default runtime throttles before publishers re-emit new ripples.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:00.391Z","inputHash":"6d91c01b1acccf4b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`
- `node:fs` - `mkdtempSync`, `rmSync`
- `node:os` - `tmpdir`
- `node:path` - `join`
- [`acknowledgementService.AcknowledgementService`](./acknowledgementService.ts.mdmd.md#symbol-acknowledgementservice)
- [`hysteresisController.HysteresisController`](./hysteresisController.ts.mdmd.md#symbol-hysteresiscontroller) (type-only)
- [`settingsBridge.DEFAULT_RUNTIME_SETTINGS`](../settings/settingsBridge.ts.mdmd.md#symbol-default_runtime_settings)
- [`driftHistoryStore.DriftHistoryStore`](../../telemetry/driftHistoryStore.ts.mdmd.md#symbol-drifthistorystore)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/diagnostics: [acknowledgementService.ts](./acknowledgementService.ts.mdmd.md), [hysteresisController.ts](./hysteresisController.ts.mdmd.md)
- packages/server/src/features/settings: [providerGuard.ts](../settings/providerGuard.ts.mdmd.md), [settingsBridge.ts](../settings/settingsBridge.ts.mdmd.md)
- packages/server/src/telemetry: [driftHistoryStore.ts](../../telemetry/driftHistoryStore.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

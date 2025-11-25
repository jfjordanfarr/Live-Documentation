# packages/server/src/features/diagnostics/acknowledgementService.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/diagnostics/acknowledgementService.ts
- Live Doc ID: LD-implementation-packages-server-src-features-diagnostics-acknowledgementservice-ts
- Generated At: 2025-11-24T15:19:58.520Z

## Authored
### Purpose
Persists diagnostic acknowledgements, decides whether follow-up alerts should emit, and records drift history, matching the Explorer workflow delivered in [2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md).

### Notes
- Coordinates with hysteresis release and noise-suppression runtime settings so manual acknowledgements immediately quiet reciprocal ripples.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.520Z","inputHash":"eee9166590f040f6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AcknowledgementServiceOptions` {#symbol-acknowledgementserviceoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/acknowledgementService.ts#L40)

#### `AcknowledgeDiagnosticInput` {#symbol-acknowledgediagnosticinput}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/acknowledgementService.ts#L49)

#### `ShouldEmitDiagnosticInput` {#symbol-shouldemitdiagnosticinput}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/acknowledgementService.ts#L55)

#### `RegisterDiagnosticEmissionInput` {#symbol-registerdiagnosticemissioninput}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/acknowledgementService.ts#L61)

#### `AcknowledgeOutcome` {#symbol-acknowledgeoutcome}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/acknowledgementService.ts#L67)

#### `AcknowledgementService` {#symbol-acknowledgementservice}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/acknowledgementService.ts#L72)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `AcknowledgementAction`, `DiagnosticRecord`, `DiagnosticSeverity`, `GraphStore` (type-only)
- `node:crypto` - `randomUUID`
- [`hysteresisController.HysteresisController`](./hysteresisController.ts.mdmd.md#symbol-hysteresiscontroller) (type-only)
- [`settingsBridge.RuntimeSettings`](../settings/settingsBridge.ts.mdmd.md#symbol-runtimesettings) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [acknowledgementService.test.ts](./acknowledgementService.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](./publishDocDiagnostics.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

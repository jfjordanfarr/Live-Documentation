# packages/extension/src/commands/exportDiagnostics.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/extension/src/commands/exportDiagnostics.test.ts
- Live Doc ID: LD-test-packages-extension-src-commands-exportdiagnostics-test-ts
- Generated At: 2026-01-17T19:21:09.684Z

## Authored
### Purpose
Exercises the export diagnostics command so CSV/JSON generation, cancellation handling, and empty states stay regression-proof after the Oct 22 T045 rollout documented in Turn 03 of [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-03-option-a-execution--t044t045-close-out-lines-521-1180](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-03-option-a-execution--t044t045-close-out-lines-521-1180).

### Notes
- Maintains the VS Code mock coverage captured in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L1460-L1545](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L1460-L1545); mirror any format or prompt changes in these tests before shipping.
- Pending work to include acknowledgement metadata in exports should extend this suite once the feature lands, matching the open acceptance criteria referenced later that day in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2720-L3410](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2720-L3410).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T19:21:09.684Z","inputHash":"c93e47fafc4f07f5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`vscodeMock.SharedVscodeMock`](../testUtils/vscodeMock.ts.mdmd.md#symbol-sharedvscodemock)
- [`vscodeMock.createVscodeMock`](../testUtils/vscodeMock.ts.mdmd.md#symbol-createvscodemock)
- [`diagnostics.ListOutstandingDiagnosticsResult`](../../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-listoutstandingdiagnosticsresult) (type-only)
- `vitest` - `afterAll`, `beforeAll`, `beforeEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/extension/src/commands: [exportDiagnostics.ts](./exportDiagnostics.ts.mdmd.md)
- packages/extension/src/testUtils: [vscodeMock.ts](../testUtils/vscodeMock.ts.mdmd.md)
- packages/shared/src/contracts: [diagnostics.ts](../../../shared/src/contracts/diagnostics.ts.mdmd.md)
- packages/shared/src/domain: [artifacts.ts](../../../shared/src/domain/artifacts.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

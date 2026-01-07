# packages/extension/src/testUtils/vscodeMock.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/testUtils/vscodeMock.ts
- Live Doc ID: LD-implementation-packages-extension-src-testutils-vscodemock-ts
- Generated At: 2026-01-07T22:04:53.486Z

## Authored
### Purpose
Supplies a shared VS Code mock for command/unit tests so we can simulate tree updates and client notifications without duplicating stub logic, introduced while stabilising command suites on [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-22-diagnose-command-test-failures-lines-3601-3740](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-22-diagnose-command-test-failures-lines-3601-3740).

### Notes
Keep the shared mock in sync with the command tests added that day—see [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-15.md#L3609-L3858](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-15.md#L3609-L3858)—so that diagnostics tree, Analyze with AI, and Inspect Symbol Neighbors suites keep reusing the same disposables instead of drifting into bespoke fakes.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-07T22:04:53.486Z","inputHash":"82b9c3f702487704"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SharedVscodeMock` {#symbol-sharedvscodemock}
- Type: interface
- Source: [source](../../../../../../packages/extension/src/testUtils/vscodeMock.ts#L4)

#### `createVscodeMock` {#symbol-createvscodemock}
- Type: function
- Source: [source](../../../../../../packages/extension/src/testUtils/vscodeMock.ts#L33)
- Returns: [`SharedVscodeMock`](#symbol-sharedvscodemock)

#### `getSharedVscodeMock` {#symbol-getsharedvscodemock}
- Type: function
- Source: [source](../../../../../../packages/extension/src/testUtils/vscodeMock.ts#L109)
- Returns: [`SharedVscodeMock`](#symbol-sharedvscodemock)

#### `resetSharedVscodeMock` {#symbol-resetsharedvscodemock}
- Type: function
- Source: [source](../../../../../../packages/extension/src/testUtils/vscodeMock.ts#L117)
- Returns: [`SharedVscodeMock`](#symbol-sharedvscodemock)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `vitest` - `vi`
- `vscode` - `vscode` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [analyzeWithAI.test.ts](../commands/analyzeWithAI.test.ts.mdmd.md)
- [exportDiagnostics.test.ts](../commands/exportDiagnostics.test.ts.mdmd.md)
- [docDiagnosticProvider.test.ts](../diagnostics/docDiagnosticProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

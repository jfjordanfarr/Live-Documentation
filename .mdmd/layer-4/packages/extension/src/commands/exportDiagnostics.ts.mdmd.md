# packages/extension/src/commands/exportDiagnostics.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/commands/exportDiagnostics.ts
- Live Doc ID: LD-implementation-packages-extension-src-commands-exportdiagnostics-ts
- Generated At: 2025-11-24T15:19:58.255Z

## Authored
### Purpose
Exports outstanding diagnostics to CSV or JSON so leads can archive triage status and acknowledgements outside VS Code, completing T045 as recorded in Turn 03 of [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-03-option-a-execution--t044t045-close-out-lines-521-1180](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-03-option-a-execution--t044t045-close-out-lines-521-1180).

### Notes
- Implementation details (format selection, save dialog, quick pick wiring, unit coverage) are documented in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L1460-L1545](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L1460-L1545); keep CSV escaping and JSON payloads aligned with that spec.
- Pending acceptance criteria still call for acknowledgement metadata in exports, as highlighted later that day - track completion against [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2720-L3410](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2720-L3410).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.255Z","inputHash":"4bee92e3760900b1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `EXPORT_DIAGNOSTICS_COMMAND` {#symbol-export_diagnostics_command}
- Type: const
- Source: [source](../../../../../../packages/extension/src/commands/exportDiagnostics.ts#L11)

#### `registerExportDiagnosticsCommand` {#symbol-registerexportdiagnosticscommand}
- Type: function
- Source: [source](../../../../../../packages/extension/src/commands/exportDiagnostics.ts#L67)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `LIST_OUTSTANDING_DIAGNOSTICS_REQUEST`, `ListOutstandingDiagnosticsResult`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `vscode` - `vscode`
- `vscode-languageclient/node` - `LanguageClient`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [exportDiagnostics.test.ts](./exportDiagnostics.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

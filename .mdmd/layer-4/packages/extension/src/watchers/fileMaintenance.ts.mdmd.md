# packages/extension/src/watchers/fileMaintenance.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/watchers/fileMaintenance.ts
- Live Doc ID: LD-implementation-packages-extension-src-watchers-filemaintenance-ts
- Generated At: 2025-12-05T04:16:17.268Z

## Authored
### Purpose
Registers the extension-side watcher that forwards delete/rename events to the language server, completing the runtime split introduced in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-10-option-review--runtime-modularization-commit-lines-2526-3070](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-10-option-review--runtime-modularization-commit-lines-2526-3070) so orphaned diagnostics can be cleared immediately.

### Notes
The server-side handlers live in `removeOrphans.ts`; keep the URI serialization (`toString(true)`) aligned with the normalization work captured in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L3048-L3230](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L3048-L3230) to ensure Git-ignored temp files and cross-drive paths do not leak stale diagnostics.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:17.268Z","inputHash":"1fcd17f691cfb038"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `registerFileMaintenanceWatcher` {#symbol-registerfilemaintenancewatcher}
- Type: function
- Source: [source](../../../../../../packages/extension/src/watchers/fileMaintenance.ts#L7)
- Returns: `vscode.Disposable`
- Parameters: `client`: `LanguageClient`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `vscode` - `vscode`
- `vscode-languageclient/node` - `LanguageClient`
<!-- LIVE-DOC:END Dependencies -->

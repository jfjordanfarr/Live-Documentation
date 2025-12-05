# packages/extension/src/prompts/rebindPrompt.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/prompts/rebindPrompt.ts
- Live Doc ID: LD-implementation-packages-extension-src-prompts-rebindprompt-ts
- Generated At: 2025-12-05T04:16:17.108Z

## Authored
### Purpose
Surfaces the rename/delete maintenance prompt that landed with T021 so users can repair drift by re-running the `linkDiagnostics.overrideLink` workflow after orphan cleanup detects broken relationships, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2320-L2363](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2320-L2363).

### Notes
- Triggered by the server’s orphan-removal payload and registered alongside the watcher updates called out in that same T021 delivery, with no automated coverage yet because the infrastructure was still pending; see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2320-L2363](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2320-L2363).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:17.108Z","inputHash":"ce7c2de30cf63cca"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `showRebindPrompt` {#symbol-showrebindprompt}
- Type: function
- Source: [source](../../../../../../packages/extension/src/prompts/rebindPrompt.ts#L7)
- Parameters: `payload`: `RebindRequiredPayload`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `RebindRequiredPayload`
- `vscode` - `vscode`
<!-- LIVE-DOC:END Dependencies -->

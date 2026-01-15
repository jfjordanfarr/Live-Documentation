# packages/extension/src/prompts/rebindPrompt.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/prompts/rebindPrompt.ts
- Live Doc ID: LD-implementation-packages-extension-src-prompts-rebindprompt-ts
- Generated At: 2026-01-15T02:41:18.275Z

## Authored
### Purpose
Surfaces the rename/delete maintenance prompt that landed with T021 so users can repair drift by re-running the `linkDiagnostics.overrideLink` workflow after orphan cleanup detects broken relationships, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2320-L2363](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2320-L2363).

### Notes
- Triggered by the server’s orphan-removal payload and registered alongside the watcher updates called out in that same T021 delivery, with no automated coverage yet because the infrastructure was still pending; see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2320-L2363](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2320-L2363).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.275Z","inputHash":"9a1b2ead6070faf1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `showRebindPrompt` {#symbol-showrebindprompt}
- Type: function
- Source: [source](../../../../../../packages/extension/src/prompts/rebindPrompt.ts#L7)
- Parameters: `payload`: [`RebindRequiredPayload`](../../../shared/src/contracts/maintenance.ts.mdmd.md#symbol-rebindrequiredpayload)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.RebindRequiredPayload`](../../../shared/src/index.ts.mdmd.md#symbol-rebindrequiredpayload)
- `vscode`
<!-- LIVE-DOC:END Dependencies -->

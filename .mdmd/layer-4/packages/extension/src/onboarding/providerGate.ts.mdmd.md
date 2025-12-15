# packages/extension/src/onboarding/providerGate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/onboarding/providerGate.ts
- Live Doc ID: LD-implementation-packages-extension-src-onboarding-providergate-ts
- Generated At: 2025-12-15T23:36:39.357Z

## Authored
### Purpose
Enforces the explicit LLM-provider consent gate mandated in Turn 9 of [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L170-L182](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L170-L182) so diagnostics stay disabled until the user (or policy) chooses a provider mode.

### Notes
- Test-mode runs auto-select `local-only` (or any injected `LINK_AWARE_PROVIDER_MODE`) to keep the integration harness headless, confirmed by the onboarding log during the successful `npm run test:integration` pass in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-19.md#L2008-L2042](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-19.md#L2008-L2042).
- The bypass was introduced after repeated QuickPick stalls, leading us to short-circuit the gate when `context.extensionMode === Test`; the design intent is captured in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-19.md#L1110-L1165](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-19.md#L1110-L1165).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T23:36:39.357Z","inputHash":"1bb21e8889c012ff"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ensureProviderSelection` {#symbol-ensureproviderselection}
- Type: function
- Source: [source](../../../../../../packages/extension/src/onboarding/providerGate.ts#L15)
- Parameters: `context`: `vscode.ExtensionContext`; `configService`: [`ConfigService`](../settings/configService.ts.mdmd.md#symbol-configservice)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`configService.ConfigService`](../settings/configService.ts.mdmd.md#symbol-configservice)
- `vscode` - `vscode`
<!-- LIVE-DOC:END Dependencies -->

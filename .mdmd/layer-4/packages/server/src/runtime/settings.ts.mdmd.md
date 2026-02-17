# packages/server/src/runtime/settings.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/runtime/settings.ts
- Live Doc ID: LD-implementation-packages-server-src-runtime-settings-ts
- Generated At: 2026-02-17T21:50:59.212Z

## Authored
### Purpose
Parses user/workspace configuration into runtime-ready settings, a responsibility carved out when we modularised the server bootstrap in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-10-option-review--runtime-modularization-commit-lines-2526-3070](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-10-option-review--runtime-modularization-commit-lines-2526-3070).

### Notes
Noise suppression thresholds, ripple depth caps, and test-mode overrides were added during the T046 noise-filter work in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-06-publisher-integration--runtime-wiring-lines-701-880](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-06-publisher-integration--runtime-wiring-lines-701-880); adjust `providerGuard` and diagnostic publishers in tandem when evolving these shapes.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:50:59.212Z","inputHash":"af3a9724ab4af064"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `extractExtensionSettings` {#symbol-extractextensionsettings}
- Type: function
- Source: [source](../../../../../../packages/server/src/runtime/settings.ts#L63)
- Returns: [`ExtensionSettings`](../features/settings/providerGuard.ts.mdmd.md#symbol-extensionsettings)

#### `extractTestModeOverrides` {#symbol-extracttestmodeoverrides}
- Type: function
- Source: [source](../../../../../../packages/server/src/runtime/settings.ts#L146)
- Returns: [`ExtensionSettings`](../features/settings/providerGuard.ts.mdmd.md#symbol-extensionsettings)

#### `mergeExtensionSettings` {#symbol-mergeextensionsettings}
- Type: function
- Source: [source](../../../../../../packages/server/src/runtime/settings.ts#L205)
- Returns: [`ExtensionSettings`](../features/settings/providerGuard.ts.mdmd.md#symbol-extensionsettings)
- Parameters: `base`: [`ExtensionSettings`](../features/settings/providerGuard.ts.mdmd.md#symbol-extensionsettings); `overrides`: [`ExtensionSettings`](../features/settings/providerGuard.ts.mdmd.md#symbol-extensionsettings)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`providerGuard.ExtensionSettings`](../features/settings/providerGuard.ts.mdmd.md#symbol-extensionsettings)
- [`artifacts.LinkRelationshipKind`](../../../shared/src/domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [settings.test.ts](./settings.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

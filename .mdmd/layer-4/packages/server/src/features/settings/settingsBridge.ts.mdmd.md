# packages/server/src/features/settings/settingsBridge.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/settings/settingsBridge.ts
- Live Doc ID: LD-implementation-packages-server-src-features-settings-settingsbridge-ts
- Generated At: 2026-01-12T21:47:40.584Z

## Authored
### Purpose
Transforms extension configuration into validated runtime settings for the language server so diagnostics, ripple exploration, and noise suppression components run with sane, bounded parameters even when users omit or misconfigure options.

### Notes
- Introduced while hardening activation flows to eliminate interactive prompts during automated runs; see [2025-10-19 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md).
- Expanded defaults for document-oriented relationship kinds during the Oct 21 diagnostic copy edit pass documented in [2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:47:40.584Z","inputHash":"23efd1044e3157cf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NoiseSuppressionLevel` {#symbol-noisesuppressionlevel}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L5)

#### `NoiseFilterRuntimeConfig` {#symbol-noisefilterruntimeconfig}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L7)

#### `NoiseSuppressionRuntime` {#symbol-noisesuppressionruntime}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L14)

#### `RippleRuntimeSettings` {#symbol-rippleruntimesettings}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L21)

#### `RuntimeSettings` {#symbol-runtimesettings}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L29)

#### `DEFAULT_RUNTIME_SETTINGS` {#symbol-default_runtime_settings}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L35)
- Returns: [`RuntimeSettings`](#symbol-runtimesettings)

#### `deriveRuntimeSettings` {#symbol-deriveruntimesettings}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L148)
- Returns: [`RuntimeSettings`](#symbol-runtimesettings)
- Parameters: `settings`: [`ExtensionSettings`](./providerGuard.ts.mdmd.md#symbol-extensionsettings)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`providerGuard.ExtensionSettings`](./providerGuard.ts.mdmd.md#symbol-extensionsettings)
- [`index.LinkRelationshipKind`](../../../../shared/src/index.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [noiseFilter.test.ts](../diagnostics/noiseFilter.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

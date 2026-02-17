# packages/server/src/features/settings/settingsBridge.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/settings/settingsBridge.ts
- Live Doc ID: LD-implementation-packages-server-src-features-settings-settingsbridge-ts
- Generated At: 2026-02-17T21:05:02.937Z

## Authored
### Purpose
Transforms extension configuration into validated runtime settings for the language server so diagnostics, ripple exploration, and noise suppression components run with sane, bounded parameters even when users omit or misconfigure options.

### Notes
- Introduced while hardening activation flows to eliminate interactive prompts during automated runs; see [2025-10-19 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md).
- Expanded defaults for document-oriented relationship kinds during the Oct 21 diagnostic copy edit pass documented in [2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:05:02.937Z","inputHash":"b032962052e7620b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NoiseSuppressionLevel` {#symbol-noisesuppressionlevel}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L6)

##### `NoiseSuppressionLevel` — Summary
Preset intensity level for diagnostic noise suppression.

#### `NoiseFilterRuntimeConfig` {#symbol-noisefilterruntimeconfig}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L11)

##### `NoiseFilterRuntimeConfig` — Summary
Concrete noise-filter thresholds applied at runtime.

#### `NoiseSuppressionRuntime` {#symbol-noisesuppressionruntime}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L26)

##### `NoiseSuppressionRuntime` — Summary
Fully resolved noise-suppression settings including the preset level,
batch limits, hysteresis window, and filter thresholds.

#### `RippleRuntimeSettings` {#symbol-rippleruntimesettings}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L39)

##### `RippleRuntimeSettings` — Summary
Resolved ripple (change-impact) traversal settings.

#### `RuntimeSettings` {#symbol-runtimesettings}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L56)

##### `RuntimeSettings` — Summary
Concrete runtime settings used by the language server, derived from
user-facing {@link ExtensionSettings} via {@link deriveRuntimeSettings}.

#### `DEFAULT_RUNTIME_SETTINGS` {#symbol-default_runtime_settings}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L66)
- Returns: [`RuntimeSettings`](#symbol-runtimesettings)

##### `DEFAULT_RUNTIME_SETTINGS` — Summary
Sensible defaults applied when no user settings are provided.

#### `deriveRuntimeSettings` {#symbol-deriveruntimesettings}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/settings/settingsBridge.ts#L188)
- Returns: [`RuntimeSettings`](#symbol-runtimesettings)
- Parameters: `settings`: [`ExtensionSettings`](./providerGuard.ts.mdmd.md#symbol-extensionsettings)

##### `deriveRuntimeSettings` — Summary
Normalises raw {@link ExtensionSettings} from the VS Code client into
concrete {@link RuntimeSettings} used by the language server.

Applies preset-based defaults for noise suppression, validates and clamps
numeric inputs, and filters link kinds against the allowed set.

##### `deriveRuntimeSettings` — Parameters
- `settings`: Raw extension settings; defaults are used when absent.

##### `deriveRuntimeSettings` — Returns
Fully resolved runtime settings.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`providerGuard.ExtensionSettings`](./providerGuard.ts.mdmd.md#symbol-extensionsettings)
- [`artifacts.LinkRelationshipKind`](../../../../shared/src/domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [noiseFilter.test.ts](../diagnostics/noiseFilter.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

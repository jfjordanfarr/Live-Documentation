# packages/server/src/runtime/settings.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/runtime/settings.ts
- Live Doc ID: LD-implementation-packages-server-src-runtime-settings-ts
- Generated At: 2025-12-05T04:16:19.136Z

## Authored
### Purpose
Parses user/workspace configuration into runtime-ready settings, a responsibility carved out when we modularised the server bootstrap in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-10-option-review--runtime-modularization-commit-lines-2526-3070](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-10-option-review--runtime-modularization-commit-lines-2526-3070).

### Notes
Noise suppression thresholds, ripple depth caps, and test-mode overrides were added during the T046 noise-filter work in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-06-publisher-integration--runtime-wiring-lines-701-880](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-06-publisher-integration--runtime-wiring-lines-701-880); adjust `providerGuard` and diagnostic publishers in tandem when evolving these shapes.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.136Z","inputHash":"8c1c2353e0eca9e9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `extractExtensionSettings` {#symbol-extractextensionsettings}
- Type: function
- Source: [source](../../../../../../packages/server/src/runtime/settings.ts#L69)
- Returns: `ExtensionSettings`

#### `extractTestModeOverrides` {#symbol-extracttestmodeoverrides}
- Type: function
- Source: [source](../../../../../../packages/server/src/runtime/settings.ts#L156)
- Returns: `ExtensionSettings`

#### `mergeExtensionSettings` {#symbol-mergeextensionsettings}
- Type: function
- Source: [source](../../../../../../packages/server/src/runtime/settings.ts#L219)
- Returns: `ExtensionSettings`
- Parameters: `base`: `ExtensionSettings`; `overrides`: `ExtensionSettings`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `LinkRelationshipKind` (type-only)
- [`providerGuard.ExtensionSettings`](../features/settings/providerGuard.ts.mdmd.md#symbol-extensionsettings)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [settings.test.ts](./settings.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

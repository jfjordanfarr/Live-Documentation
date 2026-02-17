# packages/server/src/features/settings/providerGuard.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/settings/providerGuard.ts
- Live Doc ID: LD-implementation-packages-server-src-features-settings-providerguard-ts
- Generated At: 2026-02-17T21:50:59.098Z

## Authored
### Purpose
Captures extension-scoped consent and configuration flags coming from the client and exposes a guarded view so the server only activates diagnostics and ripple features when the provider has explicitly opted in.

### Notes
- Emits console guidance when diagnostics remain disabled, preventing silent failures during automated runs; see [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).
- Works in tandem with `settingsBridge` to supply sanitized runtime defaults, a pairing reinforced in [2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:50:59.098Z","inputHash":"3fa14e9515926760"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RippleExtensionSettings` {#symbol-rippleextensionsettings}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/providerGuard.ts#L8)

##### `RippleExtensionSettings` — Summary
User-configurable settings for the ripple (change-impact) analysis.

#### `ExtensionSettings` {#symbol-extensionsettings}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/settings/providerGuard.ts#L25)

##### `ExtensionSettings` — Summary
Extension-wide settings received from the VS Code client via
`workspace/didChangeConfiguration`.

#### `ProviderGuard` {#symbol-providerguard}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/settings/providerGuard.ts#L51)

##### `ProviderGuard` — Summary
Manages extension settings received from the VS Code client and
gates features (e.g. diagnostics) that require explicit user consent.

The guard ensures diagnostics remain disabled until the client
records provider consent, preventing premature diagnostic noise.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.LinkRelationshipKind`](../../../../shared/src/domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
- `vscode-languageserver` - `Connection`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [noiseFilter.test.ts](../diagnostics/noiseFilter.test.ts.mdmd.md)
- [environment.test.ts](../../runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../runtime/settings.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

# packages/extension/src/settings/configService.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/settings/configService.ts
- Live Doc ID: LD-implementation-packages-extension-src-settings-configservice-ts
- Generated At: 2026-02-17T22:06:06.030Z

## Authored
### Purpose
Listens to the `linkAwareDiagnostics.*` workspace settings and emits typed updates (provider mode, debounce window, storage path, noise suppression budgets) so the extension can keep the language server in sync, part of the configuration bridge documented during the Oct 21 Layer‑4 sweep in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L2284-L2333](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L2284-L2333).

### Notes
Noise suppression parameters and LLm provider wiring were expanded two days later—see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L680-L807](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L680-L807)—so adjust this service in tandem with `providerGuard.ts` and `runtime/settings.ts` whenever new knobs (confidence, depth, per-artifact caps) are introduced.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T22:06:06.030Z","inputHash":"26bce1b66185046c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkDiagnosticsSettings` {#symbol-linkdiagnosticssettings}
- Type: interface
- Source: [source](../../../../../../packages/extension/src/settings/configService.ts#L7)

##### `LinkDiagnosticsSettings` — Summary
User-facing configuration for the Link-Aware Diagnostics extension,
read from `linkAwareDiagnostics.*` VS Code settings.

#### `ConfigService` {#symbol-configservice}
- Type: class
- Source: [source](../../../../../../packages/extension/src/settings/configService.ts#L31)
- Implements: `vscode.Disposable`

##### `ConfigService` — Summary
Reactive configuration service that reads `linkAwareDiagnostics.*`
settings and fires change events when they update.

Subscribes to `workspace.onDidChangeConfiguration` on construction
and disposes the subscription when {@link dispose} is called.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `vscode`
<!-- LIVE-DOC:END Dependencies -->

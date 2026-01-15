# packages/extension/src/settings/configService.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/settings/configService.ts
- Live Doc ID: LD-implementation-packages-extension-src-settings-configservice-ts
- Generated At: 2026-01-15T02:41:18.287Z

## Authored
### Purpose
Listens to the `linkAwareDiagnostics.*` workspace settings and emits typed updates (provider mode, debounce window, storage path, noise suppression budgets) so the extension can keep the language server in sync, part of the configuration bridge documented during the Oct 21 Layer‑4 sweep in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L2284-L2333](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L2284-L2333).

### Notes
Noise suppression parameters and LLm provider wiring were expanded two days later—see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L680-L807](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L680-L807)—so adjust this service in tandem with `providerGuard.ts` and `runtime/settings.ts` whenever new knobs (confidence, depth, per-artifact caps) are introduced.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.287Z","inputHash":"536576c2bdf13d91"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkDiagnosticsSettings` {#symbol-linkdiagnosticssettings}
- Type: interface
- Source: [source](../../../../../../packages/extension/src/settings/configService.ts#L3)

#### `ConfigService` {#symbol-configservice}
- Type: class
- Source: [source](../../../../../../packages/extension/src/settings/configService.ts#L17)
- Implements: `vscode.Disposable`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `vscode`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [analyzeWithAI.test.ts](../commands/analyzeWithAI.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

# packages/extension/src/extension.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/extension.ts
- Live Doc ID: LD-implementation-packages-extension-src-extension-ts
- Generated At: 2026-02-18T21:27:50.991Z

## Authored
### Purpose
Bootstraps the Live Documentation extension by spinning up the language client, wiring telemetry, and registering every workspace command exposed to end users ([extension activation sweep](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).

### Notes
- Cleans up the language client lifecycle—feeds handshake, diagnostics clearing, and connection retries—to satisfy the lint/verification gates after the 2025-10-22 rebuild incident ([lint recovery log](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L4320-L4380)).
- Registers command handlers (acknowledge diagnostics, symbol neighbors, override links, latency summary, etc.) as they landed so the activation surface mirrors the server feature set ([command rollout](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).
- Orchestrates onboarding prompts, file watchers, and diagnostics views that coordinate with the language server, which is why integration suites always touch this module during activation ([integration replay](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L5200-L5280)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:50.991Z","inputHash":"d2295f7147d33543"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `activate` {#symbol-activate}
- Type: function
- Source: [source](../../../../../packages/extension/src/extension.ts#L18)
- Parameters: `context`: `vscode.ExtensionContext`

##### `activate` — Summary
Activates the Live Documentation VS Code extension and starts the language server.

#### `deactivate` {#symbol-deactivate}
- Type: function
- Source: [source](../../../../../packages/extension/src/extension.ts#L70)

##### `deactivate` — Summary
Stops the language server and cleans up the extension resources.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `path`
- `process` - `process`
- `vscode`
- `vscode-languageclient/node` - `LanguageClient`, `LanguageClientOptions`, `ServerOptions`, `TransportKind`
<!-- LIVE-DOC:END Dependencies -->

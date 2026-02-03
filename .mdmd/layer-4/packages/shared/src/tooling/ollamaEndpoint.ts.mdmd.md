# packages/shared/src/tooling/ollamaEndpoint.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/ollamaEndpoint.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-ollamaendpoint-ts
- Generated At: 2026-02-03T21:55:41.378Z

## Authored
### Purpose
Resolves the workspace Ollama endpoint with a shared precedence stack (env vars → VS Code `github.copilot.chat.byok.ollamaEndpoint` → explicit fallback → localhost) so the local bridge and CLI talk to the same server when powering Link-Aware Diagnostics runs ([implementation phases](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L732-L756), [Local Ollama Bridge rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1106-L1112)).

### Notes
- Exported through `@live-documentation/shared` and consumed by `invokeLocalOllamaBridge` plus the `scripts/ollama/run-chat.ts` harness to keep extension, CLI, and integration workflows aligned on endpoint selection ([rollout summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1106-L1112)).
- Captures the VS Code setting uncovered during design (`github.copilot.chat.byok.ollamaEndpoint`) while preserving a deterministic `http://localhost:11434` default when no overrides exist ([design shard](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L693-L704)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.378Z","inputHash":"2e6fedfc917d900b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ResolveOllamaEndpointOptions` {#symbol-resolveollamaendpointoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaEndpoint.ts#L3)

#### `WorkspaceConfigurationLike` {#symbol-workspaceconfigurationlike}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaEndpoint.ts#L9)

#### `resolveOllamaEndpoint` {#symbol-resolveollamaendpoint}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaEndpoint.ts#L21)
- Parameters: `options`: [`ResolveOllamaEndpointOptions`](#symbol-resolveollamaendpointoptions)

##### `resolveOllamaEndpoint` — Summary
Resolve the Ollama endpoint that Link-Aware Diagnostics should talk to.
Priority order:
1. Explicit environment variables (`LINK_AWARE_OLLAMA_ENDPOINT`, `OLLAMA_ENDPOINT`).
2. VS Code setting `github.copilot.chat.byok.ollamaEndpoint` (if configuration is provided).
3. Callers may supply a custom fallback endpoint.
4. Default to `http://localhost:11434`.

#### `DEFAULT_OLLAMA_ENDPOINT` {#symbol-default_ollama_endpoint}
- Type: unknown
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaEndpoint.ts#L60)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [localOllamaBridge.test.ts](../../../extension/src/services/localOllamaBridge.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

# packages/shared/src/tooling/ollamaClient.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/ollamaClient.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-ollamaclient-ts
- Generated At: 2025-12-11T02:38:02.389Z

## Authored
### Purpose
Implements the shared HTTP client for Ollama chat requests—handling timeouts, usage metrics, deterministic error surfaces, and optional tracing—so both the extension and CLI can invoke workspace-local models without bespoke fetch logic ([bridge plan](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L695-L757), [runtime hardening](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5520-L5530)).

### Notes
- Exposed via `@live-documentation/shared` and used by `invokeLocalOllamaBridge` plus `scripts/ollama/run-chat.ts`, giving the extension, integration harness, and tooling identical retry/trace behaviour ([runtime hardening](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5520-L5530)).
- Captures raw responses and timing data into per-run traces when `LINK_AWARE_OLLAMA_TRACE_DIR` is set, supporting the telemetry/benchmark reporting workstream called out during the rollout ([runtime hardening](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5520-L5530)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.389Z","inputHash":"75e18e48dcde9ac5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OllamaChatRequest` {#symbol-ollamachatrequest}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L5)

#### `OllamaChatUsage` {#symbol-ollamachatusage}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L15)

#### `OllamaChatResult` {#symbol-ollamachatresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L21)

#### `OllamaInvocationError` {#symbol-ollamainvocationerror}
- Type: class
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L38)

#### `invokeOllamaChat` {#symbol-invokeollamachat}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L45)
- Parameters: `request`: [`OllamaChatRequest`](#symbol-ollamachatrequest)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `randomUUID`
- `node:fs` - `promises`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

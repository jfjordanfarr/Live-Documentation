# packages/shared/src/tooling/ollamaClient.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/ollamaClient.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-ollamaclient-ts
- Generated At: 2026-02-03T21:55:41.366Z

## Authored
### Purpose
Implements the shared HTTP client for Ollama chat requests—handling timeouts, usage metrics, deterministic error surfaces, and optional tracing—so both the extension and CLI can invoke workspace-local models without bespoke fetch logic ([bridge plan](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L695-L757), [runtime hardening](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5520-L5530)).

### Notes
- Exposed via `@live-documentation/shared` and used by `invokeLocalOllamaBridge` plus `scripts/ollama/run-chat.ts`, giving the extension, integration harness, and tooling identical retry/trace behaviour ([runtime hardening](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5520-L5530)).
- Captures raw responses and timing data into per-run traces when `LINK_AWARE_OLLAMA_TRACE_DIR` is set, supporting the telemetry/benchmark reporting workstream called out during the rollout ([runtime hardening](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5520-L5530)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.366Z","inputHash":"519c7653ebcfd5f0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OllamaChatRequest` {#symbol-ollamachatrequest}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L7)

#### `OllamaChatUsage` {#symbol-ollamachatusage}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L17)

#### `OllamaChatResult` {#symbol-ollamachatresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L23)

#### `OllamaInvocationError` {#symbol-ollamainvocationerror}
- Type: class
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L40)

#### `invokeOllamaChat` {#symbol-invokeollamachat}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/ollamaClient.ts#L47)
- Parameters: `request`: [`OllamaChatRequest`](#symbol-ollamachatrequest)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `randomUUID`
- `node:fs` - `promises`
- `node:path`
- [`safeFetch.NetworkPolicyViolation`](./safeFetch.ts.mdmd.md#symbol-networkpolicyviolation)
- [`safeFetch`](./safeFetch.ts.mdmd.md#symbol-safefetch)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [localOllamaBridge.test.ts](../../../extension/src/services/localOllamaBridge.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

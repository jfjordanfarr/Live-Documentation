# packages/server/src/main.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/main.ts
- Live Doc ID: LD-implementation-packages-server-src-main-ts
- Generated At: 2026-02-18T18:10:35.963Z

## Authored
### Purpose
Hosts the language server entrypoint, wiring the LSP connection, runtime services, and diagnostics pipelines that the extension relies on for Live Documentation guidance ([server bootstrap commits](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).

### Notes
- Spins up the GraphStore, drift history tracker, acknowledgement service, and change processor so diagnostics remain stateful across sessions ([drift history rollout](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).
- Registers dependency inspection, symbol neighbors, override, and latency routes exposed to the extension once those commands shipped ([symbol neighbor integration](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L180-L260)).
- Keeps telemetry and ingestion services alive during integration runs, which is why the benchmark and US suites exercise this file whenever the language server boots ([integration replay](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L5200-L5280)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T18:10:35.963Z","inputHash":"07ae5b216d678f1d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`environment.resolveWorkspaceRoot`](./runtime/environment.ts.mdmd.md#symbol-resolveworkspaceroot)
- `vscode-languageserver-textdocument` - `TextDocument`
- `vscode-languageserver/node` - `Connection`, `DidChangeConfigurationNotification`, `InitializeParams`, `InitializeResult`, `ProposedFeatures`, `TextDocumentChangeEvent`, `TextDocumentSyncKind`, `TextDocuments`, `TextDocumentsConfiguration`, `createConnection`
<!-- LIVE-DOC:END Dependencies -->

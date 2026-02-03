# packages/extension/src/commands/latencySummary.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/commands/latencySummary.ts
- Live Doc ID: LD-implementation-packages-extension-src-commands-latencysummary-ts
- Generated At: 2026-02-03T21:55:35.215Z

## Authored
### Purpose
Surfaces diagnostic latency telemetry inside VS Code by registering `linkDiagnostics.showLatencySummary`/`linkDiagnostics.getLatencySummary`, giving maintainers a quick pick that fetches the server’s `LATENCY_SUMMARY_REQUEST`, shows the latest percentiles, and optionally resets samples per [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-21-latency-command--perf-test-lines-2321-2385](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-21-latency-command--perf-test-lines-2321-2385).

### Notes
- The integration perf suite exercises this command to enforce the p95 latency ceiling, so regressions are caught by `tests/integration/perf/diagnosticLatency.test.ts`; see the recorded run in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L2329-L2380](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L2329-L2380).
- Follow-up doc cleanup on Oct 28 removed inline-code command IDs after SlopCop flagged them, keeping symbol coverage green per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L2700-L2764](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L2700-L2764).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:35.215Z","inputHash":"a04781849b1da2ea"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `registerLatencyTelemetryCommands` {#symbol-registerlatencytelemetrycommands}
- Type: function
- Source: [source](../../../../../../packages/extension/src/commands/latencySummary.ts#L59)
- Returns: `vscode.Disposable`
- Parameters: `client`: `LanguageClient`

#### `LATENCY_SUMMARY_COMMAND` {#symbol-latency_summary_command}
- Type: const
- Source: [source](../../../../../../packages/extension/src/commands/latencySummary.ts#L120)

#### `GET_LATENCY_SUMMARY_INTERNAL_COMMAND` {#symbol-get_latency_summary_internal_command}
- Type: const
- Source: [source](../../../../../../packages/extension/src/commands/latencySummary.ts#L121)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`telemetry.LATENCY_SUMMARY_REQUEST`](../../../shared/src/contracts/telemetry.ts.mdmd.md#symbol-latency_summary_request)
- [`telemetry.LatencySummary`](../../../shared/src/contracts/telemetry.ts.mdmd.md#symbol-latencysummary)
- [`telemetry.LatencySummaryRequest`](../../../shared/src/contracts/telemetry.ts.mdmd.md#symbol-latencysummaryrequest)
- [`telemetry.LatencySummaryResponse`](../../../shared/src/contracts/telemetry.ts.mdmd.md#symbol-latencysummaryresponse)
- `vscode`
- `vscode-languageclient/node` - `LanguageClient`
<!-- LIVE-DOC:END Dependencies -->

# packages/shared/src/contracts/telemetry.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/telemetry.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-telemetry-ts
- Generated At: 2025-12-11T02:38:01.558Z

## Authored
### Purpose
Defines the latency telemetry request/response surface emitted during the instrumentation pass in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-19-latency-tracker-implementation-lines-2041-2200](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-19-latency-tracker-implementation-lines-2041-2200), letting the server report queue→publish spans back to the extension.

### Notes
The extension command and perf spec consume this schema—see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-21-latency-command--perf-test-lines-2321-2385](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-21-latency-command--perf-test-lines-2321-2385)—so preserve field semantics when expanding telemetry sinks or thresholds.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.558Z","inputHash":"78f6f2dd48080ca8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LATENCY_SUMMARY_REQUEST` {#symbol-latency_summary_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/telemetry.ts#L1)

#### `LatencyChangeKind` {#symbol-latencychangekind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/telemetry.ts#L3)

#### `LatencySample` {#symbol-latencysample}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/telemetry.ts#L5)

#### `LatencySummary` {#symbol-latencysummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/telemetry.ts#L15)

#### `LatencySummaryRequest` {#symbol-latencysummaryrequest}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/telemetry.ts#L34)

#### `LatencySummaryResponse` {#symbol-latencysummaryresponse}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/telemetry.ts#L39)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

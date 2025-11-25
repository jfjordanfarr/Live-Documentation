# packages/server/src/telemetry/latencyTracker.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/telemetry/latencyTracker.ts
- Live Doc ID: LD-implementation-packages-server-src-telemetry-latencytracker-ts
- Generated At: 2025-11-24T15:19:58.976Z

## Authored
### Purpose
Implements the server-side latency recorder introduced in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-19-latency-tracker-implementation-lines-2041-2200](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-19-latency-tracker-implementation-lines-2041-2200), capturing enqueue→publish spans for diagnostics so the extension can surface performance metrics.

### Notes
The tracker normalizes URIs before emitting `LatencySample`s and brokers its summaries through the shared telemetry contract documented in [packages/shared/src/contracts/telemetry.ts.mdmd.md](../../../shared/src/contracts/telemetry.ts.mdmd.md); downstream consumers include the latency summary command and perf spec described in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-21-latency-command--perf-test-lines-2321-2385](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-21-latency-command--perf-test-lines-2321-2385).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.976Z","inputHash":"66c4177160f96faf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LatencyTrackerOptions` {#symbol-latencytrackeroptions}
- Type: interface
- Source: [source](../../../../../../packages/server/src/telemetry/latencyTracker.ts#L5)

#### `LatencyTracker` {#symbol-latencytracker}
- Type: class
- Source: [source](../../../../../../packages/server/src/telemetry/latencyTracker.ts#L36)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `LatencyChangeKind`, `LatencySample`, `LatencySummary`
- [`uri.normalizeFileUri`](../features/utils/uri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [latencyTracker.test.ts](./latencyTracker.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

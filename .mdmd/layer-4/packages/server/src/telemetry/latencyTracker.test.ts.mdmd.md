# packages/server/src/telemetry/latencyTracker.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/telemetry/latencyTracker.test.ts
- Live Doc ID: LD-test-packages-server-src-telemetry-latencytracker-test-ts
- Generated At: 2026-02-03T21:55:38.451Z

## Authored
### Purpose
Exercises the latency recorder scenarios delivered in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-20-continued-instrumentation--unit-coverage-lines-2201-2320](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-20-continued-instrumentation--unit-coverage-lines-2201-2320), confirming enqueue→persist→complete flows supply meaningful telemetry snapshots.

### Notes
Coverage ensures queued changes that never persist are ignored and that snapshot resets clear rolling metrics—guardrails the team depended on when wiring the latency command and perf test in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-21-latency-command--perf-test-lines-2321-2385](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-28.SUMMARIZED.md#turn-21-latency-command--perf-test-lines-2321-2385).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:38.451Z","inputHash":"cc43f8126336b2b2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`LatencyTracker`](./latencyTracker.ts.mdmd.md#symbol-latencytracker)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/utils: [uri.ts](../features/utils/uri.ts.mdmd.md)
- packages/server/src/telemetry: [latencyTracker.ts](./latencyTracker.ts.mdmd.md)
- packages/shared/src/contracts: [telemetry.ts](../../../shared/src/contracts/telemetry.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

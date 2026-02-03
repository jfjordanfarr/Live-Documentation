# tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs
- Live Doc ID: LD-implementation-tests-integration-fixtures-queue-worker-workspace-controllers-telemetrycontroller-cs
- Generated At: 2026-02-03T21:55:49.342Z

## Authored
### Purpose
Capture the enqueue boundary for the Hangfire-style telemetry pipeline so LD-402 can trace controller calls into background work.

### Notes
Mirrors the fixture-local doc but keeps repository-relative links, making the inspect CLI and graph audit share a single authoritative description while covering both the immediate enqueue and delayed maintenance schedule.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:49.342Z","inputHash":"b74eb6d3cd759894"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TelemetryController` {#symbol-telemetrycontroller}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs#L9)
- Extends: `ControllerBase`

#### `Record` {#symbol-record}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs#L13)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Hangfire`
- `Microsoft.AspNetCore.Mvc`
- `QueueWorker.Workers`
- [`TelemetryWorker`](../Workers/TelemetryWorker.cs.mdmd.md#symbol-telemetryworker-class)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs
- Generated At: 2026-09-27T23:21:32.912Z

## Authored
### Purpose
Capture the enqueue boundary for the Hangfire-style telemetry pipeline so LD-402 can trace controller calls into background work.

### Notes
Mirrors the fixture-local doc but keeps repository-relative links, making the inspect CLI and graph audit share a single authoritative description while covering both the immediate enqueue and delayed maintenance schedule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TelemetryController` {#symbol-telemetrycontroller}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs#L10)
- Extends: `ControllerBase`

#### `Record` {#symbol-record}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/queue-worker/workspace/Controllers/TelemetryController.cs#L13)
- Returns: `IActionResult`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Hangfire`
- `Microsoft.AspNetCore.Mvc`
- [`TelemetryWorker`](../Workers/TelemetryWorker.cs.mdmd.md#symbol-telemetryworker-class)
<!-- LIVE-DOC:END Dependencies -->

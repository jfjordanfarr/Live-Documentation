# tests/integration/fixtures/queue-worker/workspace/Services/TelemetryScheduler.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/queue-worker/workspace/Services/TelemetryScheduler.cs
- Live Doc ID: LD-implementation-tests-integration-fixtures-queue-worker-workspace-services-telemetryscheduler-cs
- Generated At: 2026-01-14T15:17:49.129Z

## Authored
### Purpose
Document the recurring Hangfire registration so LD-402 captures scheduled telemetry jobs that point back to the worker implementation.

### Notes
Calls the Hangfire recurring manager directly to keep the pathfinder's inbound edges honest when configuration feeds the worker and controller through scheduled hops.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T15:17:49.129Z","inputHash":"f890d82085ec19d7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TelemetryScheduler (class)` {#symbol-telemetryscheduler-class}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/queue-worker/workspace/Services/TelemetryScheduler.cs#L4)

#### `TelemetryScheduler (constructor)` {#symbol-telemetryscheduler-constructor}
- Type: constructor
- Source: [source](../../../../../../../../tests/integration/fixtures/queue-worker/workspace/Services/TelemetryScheduler.cs#L10)

#### `Configure` {#symbol-configure}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/queue-worker/workspace/Services/TelemetryScheduler.cs#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Hangfire`
- `QueueWorker.Workers`
- [`TelemetryWorker`](../Workers/TelemetryWorker.cs.mdmd.md#symbol-telemetryworker-class)
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/fixtures/queue-worker/workspace/appsettings.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/queue-worker/workspace/appsettings.json
- Generated At: 2026-09-27T23:21:32.976Z

## Authored
### Purpose
Record the Hangfire queue configuration consumed by the queue-worker telemetry pipeline.

### Notes
- A single setting keeps the inspect CLI assertions stable. `Hangfire:Queue` is read by `TelemetryWorker.cs` through the `IConfiguration` indexer, and the key path is the file's public symbol.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Hangfire` {#symbol-hangfire}
- Type: key

#### `Hangfire:Queue` {#symbol-hangfirequeue}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/fixtures/queue-worker/workspace/appsettings.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/queue-worker/workspace/appsettings.json
- Live Doc ID: LD-asset-tests-integration-fixtures-queue-worker-workspace-appsettings-json
- Generated At: 2026-02-03T21:55:50.370Z

## Authored
### Purpose
Record the Hangfire queue configuration consumed by the queue-worker telemetry pipeline.

### Notes
Single-setting payload keeps inspect-cli assertions stable while we expand to multi-queue scenarios.
#### HangfireQueue {#symbol-hangfirequeue}
- `TelemetryQueues:Primary` binds to the worker via `IOptions<HangfireOptions>` so we can validate queue discovery.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:50.370Z","inputHash":"4c3db88ef596ea1c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

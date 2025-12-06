# tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs
- Live Doc ID: LD-implementation-tests-integration-fixtures-csharp-reflection-workspace-services-telemetryhandler-cs
- Generated At: 2025-12-06T22:49:49.093Z

## Authored
### Purpose
Defines the reflection-only handler that the LD-402 pathfinder must rediscover when traversing factory-constructed telemetry processors.

### Notes
- Served alongside `ReflectionFactory.cs` to validate that reflection metadata emitted by the generator keeps dependencies precise even without explicit `new` expressions.
#### TelemetryHandler Class {#symbol-telemetryhandler-class}
- Outbound links expect this anchor when `ReflectionFactory` resolves types dynamically.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:49.093Z","inputHash":"d1dc3f73a0bba280"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TelemetryHandler` {#symbol-telemetryhandler}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs#L2)

#### `InstrumentationKey` {#symbol-instrumentationkey}
- Type: property
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

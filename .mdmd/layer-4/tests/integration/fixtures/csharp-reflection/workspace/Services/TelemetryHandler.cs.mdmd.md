# tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs
- Live Doc ID: LD-implementation-tests-integration-fixtures-csharp-reflection-workspace-services-telemetryhandler-cs
- Generated At: 2026-09-27T18:34:30.733Z

## Authored
### Purpose
Defines the reflection-only handler that the pathfinder must rediscover when traversing factory-constructed telemetry processors.

### Notes
- Served alongside `ReflectionFactory.cs` to validate that a type named only in a string passed to `Type.GetType` still becomes a dependency. The factory's link lands on the class symbol below.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:30.733Z","inputHash":"7e63b6d85bad54bb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TelemetryHandler` {#symbol-telemetryhandler}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs#L3)

#### `InstrumentationKey` {#symbol-instrumentationkey}
- Type: property
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

# tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/csharp-reflection/workspace/Services/TelemetryHandler.cs
- Generated At: 2026-09-27T23:21:32.790Z

## Authored
### Purpose
Defines the reflection-only handler that the pathfinder must rediscover when traversing factory-constructed telemetry processors.

### Notes
- Served alongside `ReflectionFactory.cs` to validate that a type named only in a string passed to `Type.GetType` still becomes a dependency. The factory's link lands on the class symbol below.

## Generated
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

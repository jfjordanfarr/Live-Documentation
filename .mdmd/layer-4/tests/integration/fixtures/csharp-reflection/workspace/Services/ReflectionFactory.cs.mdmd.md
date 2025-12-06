# tests/integration/fixtures/csharp-reflection/workspace/Services/ReflectionFactory.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/csharp-reflection/workspace/Services/ReflectionFactory.cs
- Live Doc ID: LD-implementation-tests-integration-fixtures-csharp-reflection-workspace-services-reflectionfactory-cs
- Generated At: 2025-12-06T22:49:49.089Z

## Authored
### Purpose
Models a reflection-based factory that wires telemetry handlers without direct type references so LD-402 can prove it resolves runtime-only edges.

### Notes
- Emits the fully-qualified type name as a dependency anchor, which the inspect CLI consumes when traversing from factories to generated handler docs.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:49.089Z","inputHash":"f211cf208c263464"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReflectionFactory` {#symbol-reflectionfactory}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-reflection/workspace/Services/ReflectionFactory.cs#L4)

#### `CreateHandler` {#symbol-createhandler}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-reflection/workspace/Services/ReflectionFactory.cs#L7)

#### `CreateTelemetryHandler` {#symbol-createtelemetryhandler}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-reflection/workspace/Services/ReflectionFactory.cs#L18)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`TelemetryHandler.LiveDocs.Reflection.TelemetryHandler`](./TelemetryHandler.cs.mdmd.md#symbol-telemetryhandler-class)
<!-- LIVE-DOC:END Dependencies -->

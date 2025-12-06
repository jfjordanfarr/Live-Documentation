# tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-service-src-com-example-service-appservice-java
- Generated At: 2025-12-06T22:49:48.466Z

## Authored
### Purpose
Coordinates repository and analyzer dependencies for the Java service benchmark so layered service wiring remains visible to the analyzer.

### Notes
Leave the constructor and `generate` method focused on delegation; additional logic belongs in the collaborators.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.466Z","inputHash":"babb11380d810ff7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AppService (class)` {#symbol-appservice-class}
- Type: class
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java#L7)

#### `AppService (constructor)` {#symbol-appservice-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java#L11)

#### `generate` {#symbol-generate}
- Type: method
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/service/src/com/example/service/AppService.java#L16)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `com.example.service.analytics.Analyzer`
- `com.example.service.data.Repository`
- `com.example.service.model.Summary`
<!-- LIVE-DOC:END Dependencies -->

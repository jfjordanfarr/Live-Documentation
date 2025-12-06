# tests/integration/benchmarks/fixtures/java/basic/src/com/example/app/App.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/basic/src/com/example/app/App.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-basic-src-com-example-app-app-java
- Generated At: 2025-12-06T22:49:48.442Z

## Authored
### Purpose
Coordinates the Java basic benchmark by routing datasets through the reader and report writer so package-level edges stay visible.

### Notes
Retain the argument guard and documentation—they help exercise exception paths and Javadoc parsing.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.442Z","inputHash":"5122e401b4d5dabc"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `App` {#symbol-app}
- Type: class
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/basic/src/com/example/app/App.java#L15)

##### `App` — Summary
Entry point for the reporting pipeline used by the fixture.

##### `App` — Remarks
Coordinates dataset loading and formatting so Live Docs can surface cross-language edges.

#### `run` {#symbol-run}
- Type: method
- Source: [source](../../../../../../../../../../../../tests/integration/benchmarks/fixtures/java/basic/src/com/example/app/App.java#L27)

##### `run` — Summary
Runs the reporting pipeline for the supplied dataset.

##### `run` — Parameters
- `dataset`: dataset identifier used to load records

##### `run` — Returns
formatted report summary

##### `run` — Exceptions
- `IllegalArgumentException`: if `dataset` is null or blank

##### `run` — Links
- `Reader#load(String)`
- `ReportWriter#write(java.util.List)`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `com.example.data.Reader`
- `com.example.format.ReportWriter`
- `com.example.model.Record`
<!-- LIVE-DOC:END Dependencies -->

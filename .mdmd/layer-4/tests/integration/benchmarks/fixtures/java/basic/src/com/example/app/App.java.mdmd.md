# tests/integration/benchmarks/fixtures/java/basic/src/com/example/app/App.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/java/basic/src/com/example/app/App.java
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-java-basic-src-com-example-app-app-java
- Generated At: 2026-01-14T02:54:35.081Z

## Authored
### Purpose
Entry point class for the `java-basic` polyglot benchmark fixture. Coordinates dataset loading via `Reader`, formatting via `ReportWriter`, and model classes like `Record`, demonstrating Java package-level imports and cross-package dependency resolution.

### Notes
- Created on [2025-11-01](../../../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md) as part of T060 (curating AST benchmark fixtures), extending the polyglot suite with Java package structure patterns.
- Java adapter dependency resolution was fixed on [2026-01-13](../../../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-13.1.md) by adding `extractPackage()`, `computeSourceRoot()`, and `resolveJavaImport()` functions that convert package names like `com.example.data.Reader` to workspace-relative file paths.
- The fixture uses standard Java package conventions (`com.example.app`, `com.example.data`, etc.) to stress-test import path resolution across nested package hierarchies.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T02:54:35.081Z","inputHash":"8f55161824e670ab"}]} -->
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
- [`Reader`](../data/Reader.java.mdmd.md)
- [`ReportWriter`](../format/ReportWriter.java.mdmd.md)
- [`Record`](../model/Record.java.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

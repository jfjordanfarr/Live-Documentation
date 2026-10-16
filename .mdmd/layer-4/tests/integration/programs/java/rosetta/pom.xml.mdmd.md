# tests/integration/programs/java/rosetta/pom.xml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/java/rosetta/pom.xml
- Entry: tooling
- Generated At: 2026-10-16T20:40:30.032Z

## Authored
### Purpose
The Java rosetta sample's project file: it names the artifact `com.rosetta:java-rosetta-fixture`, sets the source folder to `src` and depends on the JUnit Jupiter API the sample's tests use. Its presence is what makes `oracle:index` choose scip-java, which drives Maven, for the sample.

### Notes
- Plain on purpose; it is read by the pom adapter as a Live Doc since 2026-10-16 and must not change, since the sample's `expected/compiler-edges.json` is the indexer's output over it and names this file among its documents.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `com.rosetta:java-rosetta-fixture` {#symbol-comrosettajava-rosetta-fixture}
- Type: package
- Source: [source](../../../../../../../tests/integration/programs/java/rosetta/pom.xml#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `org.junit.jupiter:junit-jupiter-api@5.10.2`
<!-- LIVE-DOC:END Dependencies -->

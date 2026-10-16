# tests/integration/programs/java/warehouse/pom.xml

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/java/warehouse/pom.xml
- Entry: tooling
- Generated At: 2026-10-16T16:21:54.769Z

## Authored
### Purpose
The `programs/java/warehouse` sample's project file: it names the artifact `com.acme:warehouse`, keeps Maven's default source folders and depends on the JUnit Jupiter API in the test scope. Its presence is what makes `oracle:index` choose scip-java, which drives Maven, for the sample.

### Notes
- Plain on purpose; it is read by the pom adapter as a Live Doc since 2026-10-16 and must not change, since the sample's `expected/compiler-edges.json` is the indexer's output over it and names this file among its documents.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `com.acme:warehouse` {#symbol-comacmewarehouse}
- Type: package
- Source: [source](../../../../../../../tests/integration/programs/java/warehouse/pom.xml#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `org.junit.jupiter:junit-jupiter-api@5.10.2`
<!-- LIVE-DOC:END Dependencies -->

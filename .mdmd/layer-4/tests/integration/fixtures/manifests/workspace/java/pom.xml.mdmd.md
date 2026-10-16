# tests/integration/fixtures/manifests/workspace/java/pom.xml

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/manifests/workspace/java/pom.xml
- Entry: tooling
- Generated At: 2026-10-16T16:21:50.224Z

## Authored
### Purpose
The manifests fixture's Maven parent: it names the artifact `com.acme.tally:tally-parent` at version 1.2.0, packaged as `pom`, with the modules `core` and `app`, which its doc does not write as dependencies.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`. `mvn -o package` over a copy builds both modules.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `com.acme.tally:tally-parent` {#symbol-comacmetallytally-parent}
- Type: package
- Source: [source](../../../../../../../../tests/integration/fixtures/manifests/workspace/java/pom.xml#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

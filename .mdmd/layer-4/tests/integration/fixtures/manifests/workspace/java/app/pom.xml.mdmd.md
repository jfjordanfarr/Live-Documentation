# tests/integration/fixtures/manifests/workspace/java/app/pom.xml

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/manifests/workspace/java/app/pom.xml
- Entry: tooling
- Generated At: 2026-10-16T16:21:49.988Z

## Authored
### Purpose
The manifests fixture's application module: it inherits from the parent, depends on `tally-core` at `${project.groupId}` and `${project.version}`, and names `com.acme.tally.app.Main` as the jar's main class through `maven-jar-plugin`, so that its doc links both sibling manifests and the main class carries the `tally-app` command.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`. The jar plugin was chosen over `exec-maven-plugin` because it builds offline from this devcontainer's Maven cache.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `com.acme.tally:tally-app` {#symbol-comacmetallytally-app}
- Type: package
- Source: [source](../../../../../../../../../tests/integration/fixtures/manifests/workspace/java/app/pom.xml#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pom.com.acme.tally:tally-core`](../core/pom.xml.mdmd.md#symbol-comacmetallytally-core)
- [`pom.com.acme.tally:tally-parent`](../pom.xml.mdmd.md#symbol-comacmetallytally-parent)
<!-- LIVE-DOC:END Dependencies -->

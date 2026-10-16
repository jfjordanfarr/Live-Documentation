# tests/integration/fixtures/manifests/workspace/java/app/src/main/java/com/acme/tally/app/Main.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/manifests/workspace/java/app/src/main/java/com/acme/tally/app/Main.java
- Entry: program [`main`](#symbol-main-method)
- Entry: command `tally-app` of [`tests/integration/fixtures/manifests/workspace/java/app/pom.xml`](../../../../../../../pom.xml.mdmd.md)
- Generated At: 2026-10-16T16:21:50.021Z

## Authored
### Purpose
The manifests fixture's application: a `main` that adds its arguments to a `Ledger` and prints the total, so that its doc carries both the Java adapter's program mark and the command its module's pom declares.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Main (class)` {#symbol-main-class}
- Type: class
- Source: [source](../../../../../../../../../../../../../../../../tests/integration/fixtures/manifests/workspace/java/app/src/main/java/com/acme/tally/app/Main.java#L6)

##### `Main (class)` — Summary
Prints the sum of the counts given on the command line.

#### `main (method)` {#symbol-main-method}
- Type: method
- Source: [source](../../../../../../../../../../../../../../../../tests/integration/fixtures/manifests/workspace/java/app/src/main/java/com/acme/tally/app/Main.java#L7)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Ledger`](../../../../../../../../core/src/main/java/com/acme/tally/core/Ledger.java.mdmd.md#symbol-ledger)
<!-- LIVE-DOC:END Dependencies -->

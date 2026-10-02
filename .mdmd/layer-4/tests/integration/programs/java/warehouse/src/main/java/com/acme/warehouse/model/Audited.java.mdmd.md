# tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Audited.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Audited.java
- Generated At: 2026-10-02T20:20:06.673Z

## Authored
### Purpose
`Audited` for the warehouse sample program: an annotation type marking types whose changes are logged.

### Notes
- Used as `@Audited("stock")` on `store/MemoryInventory.java`; an annotation of the workspace is a dependency like any other type.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Audited` {#symbol-audited}
- Type: annotation
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Audited.java#L11)

##### `Audited` — Summary
Marks a type whose changes are written to the audit log.

#### `value` {#symbol-value}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Audited.java#L13)

##### `value` — Summary
The log the changes go to.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

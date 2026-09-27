# tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java
- Live Doc ID: LD-test-tests-integration-programs-java-warehouse-src-main-java-com-acme-warehouse-model-item-java
- Generated At: 2026-09-27T20:19:23.831Z

## Authored
### Purpose
`Item` for the warehouse sample program: something the warehouse keeps, identified by its SKU, plus the package-private `ItemFormatter` that shares its file.

### Notes
- Two top-level types in one file: the adapter publishes both and resolves `ItemFormatter` from `Item` as a type declared in the same file. The constructor shares the class's name, so the headings carry `(class)` and `(constructor)`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:19:23.831Z","inputHash":"1339d57beaffbde5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Item (class)` {#symbol-item-class}
- Type: class
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java#L6)

##### `Item (class)` — Summary
Something the warehouse keeps, identified by its SKU.

#### `Item (constructor)` {#symbol-item-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java#L11)
- Parameters: `unit`: [`Unit`](./Unit.java.mdmd.md#symbol-unit)

#### `sku` {#symbol-sku}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java#L17)

#### `name` {#symbol-name}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java#L21)

#### `unit` {#symbol-unit}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java#L25)
- Returns: [`Unit`](./Unit.java.mdmd.md#symbol-unit)

#### `describe` {#symbol-describe}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java#L30)
- Parameters: `quantity`: [`Quantity`](./Quantity.java.mdmd.md#symbol-quantity)

##### `describe` — Summary
The item as a report line, formatted by the package-private helper below.

#### `equals` {#symbol-equals}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java#L35)

#### `hashCode` {#symbol-hashcode}
- Type: method
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java#L40)

#### `ItemFormatter` {#symbol-itemformatter}
- Type: class
- Source: [source](../../../../../../../../../../../../../../tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/model/Item.java#L46)

##### `ItemFormatter` — Summary
Formats items; shares the file with `Item` and is visible only in this package.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Quantity`](./Quantity.java.mdmd.md#symbol-quantity)
- [`Unit`](./Unit.java.mdmd.md#symbol-unit)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->

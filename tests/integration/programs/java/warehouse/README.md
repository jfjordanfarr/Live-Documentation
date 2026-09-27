# warehouse

A small stock-keeping program laid out the way Maven projects are laid out, with the source shapes a line scanner gets wrong. It is the program the Java adapter is measured on; `expected/compiler-edges.json` holds what `scip-java` resolves.

What it exercises, and where:

| Shape                                                                 | Where                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------ |
| Same-package references with no import                               | `model/Quantity.java` (`Unit`), `store/MemoryInventory.java`  |
| Same package split across `src/main/java` and `src/test/java`         | `store/MemoryInventoryTest.java`                             |
| Wildcard import (`import com.acme.warehouse.model.*`)                 | `store/MemoryInventory.java`                                 |
| Static import of a member and of everything                          | `report/ReportWriter.java`, `report/ReportWriterTest.java`    |
| Fully qualified type with no import                                   | `report/ReportWriter.java`                                    |
| Nested types referenced as `Outer.Inner`                              | `App.java` (`Report.Builder`, `Inventory.Listener`)          |
| Two top-level types in one file                                       | `model/Item.java` (`Item`, package-private `ItemFormatter`)   |
| An annotation type of the workspace                                   | `model/Audited.java`, used in `store/MemoryInventory.java`    |
| Interface, enum, record, generic method with a bound                  | `store/Inventory.java`, `model/Unit.java`, `model/Quantity.java`, `report/ReportWriter.java` |
| Class names inside strings and comments                               | `App.java` (must not count)                                  |
| Javadoc with `{@link}`, `@param`, `@return`, `@throws`, `@see`        | `store/Inventory.java`, `report/Report.java`                  |

Build it: `mvn -q compile`. Run it: `java -cp target/classes com.acme.warehouse.App`.

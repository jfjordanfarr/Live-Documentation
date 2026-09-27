# stockroom

A small stock-keeping crate laid out the way Rust crates are laid out, with the shapes a line scanner gets wrong. It is the program the Rust adapter is measured on; `expected/compiler-edges.json` holds what `rust-analyzer` resolves.

What it exercises, and where:

| Shape                                                            | Where                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| A library crate and a binary crate in one package                | `src/lib.rs`, `src/main.rs` (uses the library by name)     |
| A module file with a submodule directory (2018 layout)           | `src/stock.rs` declares `mod item;` found in `src/stock/`  |
| A `mod.rs` directory module                                      | `src/store/mod.rs` declares `mod memory;`                  |
| `pub use` re-exports followed to the defining file               | `src/lib.rs`, `src/stock.rs`                               |
| `crate::`, `super::`, `self::` and bare child-module paths       | `src/store/memory.rs`, `src/stock/item.rs`, `src/report.rs`|
| A glob import                                                    | `src/report.rs` (`use crate::stock::*`)                    |
| A trait implemented for a type from another module               | `src/store/memory.rs` implements `store::Inventory`        |
| A generic function bounded by another module's trait             | `src/report.rs` (`total<T: stock::Countable>`)             |
| An inline `#[cfg(test)] mod tests` with `use super::*`           | `src/stock/quantity.rs`                                    |
| An integration test crate using the library by name              | `tests/report.rs`                                          |
| Type and module names inside strings and comments                | `src/main.rs` (must not count)                             |

Build it: `cargo build`. Test it: `cargo test`. Run it: `cargo run`.

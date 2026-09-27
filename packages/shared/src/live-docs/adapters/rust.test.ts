import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { rustAdapter } from "./rust";

describe("rustAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "rust-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  async function write(files: Record<string, string>): Promise<void> {
    for (const [relative, content] of Object.entries(files)) {
      const absolute = path.join(workspaceRoot, relative);
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, content, "utf8");
    }
  }

  async function analyze(relative: string) {
    const result = await rustAdapter.analyze({ absolutePath: path.join(workspaceRoot, relative), workspaceRoot });
    return result!;
  }

  function edges(dependencies: Array<{ resolvedPath?: string; specifier: string; symbols: string[] }>): Array<[string, string[]]> {
    return dependencies.map((dependency) => [dependency.resolvedPath ?? dependency.specifier, dependency.symbols]);
  }

  const CARGO = '[package]\nname = "stockroom"\nversion = "0.1.0"\nedition = "2021"\n';

  it("publishes public items, impl and trait methods, public fields and variants, with their rustdoc", async () => {
    await write({
      "Cargo.toml": CARGO,
      "src/lib.rs": [
        "/// The limit.",
        "pub const LIMIT: usize = 3;",
        "static HIDDEN: u8 = 1;",
        "",
        "/// An item.",
        "///",
        "/// With a SKU.",
        "#[derive(Debug)]",
        "pub struct Item {",
        "    pub sku: String,",
        "    note: String,",
        "}",
        "",
        "impl Item {",
        "    /// Makes one.",
        "    pub fn new() -> Self { Item { sku: String::new(), note: String::new() } }",
        "    fn tidy(&self) {}",
        "}",
        "",
        "pub trait Countable {",
        "    /// The amount.",
        "    fn amount(&self) -> f64;",
        "}",
        "",
        "impl Countable for Item {",
        "    fn amount(&self) -> f64 { 1.0 }",
        "}",
        "",
        "pub enum Unit { Each, Kilogram }",
        "",
        "fn helper() {}",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("src/lib.rs");
    expect(symbols.map((symbol) => [symbol.name, symbol.kind, symbol.qualifiedName])).toEqual([
      ["LIMIT", "constant", undefined],
      ["Item", "struct", undefined],
      ["sku", "field", "Item.sku"],
      ["new", "method", "Item.new"],
      ["Countable", "trait", undefined],
      ["amount", "method", "Countable.amount"],
      ["amount", "method", "Item.amount"],
      ["Unit", "enum", undefined],
      ["Each", "variant", "Unit.Each"],
      ["Kilogram", "variant", "Unit.Kilogram"]
    ]);
    expect(symbols[1].documentation?.summary).toBe("An item.");
    expect(symbols[1].documentation?.remarks).toBe("With a SKU.");
    expect(symbols[1].typeReferences).toEqual([{ name: "Countable", role: "implements" }]);
    expect(symbols[3].documentation?.summary).toBe("Makes one.");
  });

  it("follows mod declarations to their files in both layouts, and paths through the module tree", async () => {
    await write({
      "Cargo.toml": CARGO,
      "src/lib.rs":           "pub mod stock;\npub mod store;\n\npub use stock::Item;\n",
      "src/stock.rs":         "mod item;\n\npub use item::Item;\n",
      "src/stock/item.rs":    "pub struct Item;\n",
      "src/store/mod.rs":     "pub mod memory;\n\nuse crate::stock::Item;\n\npub trait Inventory { fn put(&mut self, item: Item); }\n",
      "src/store/memory.rs":  "use super::Inventory;\nuse crate::stock::Item;\n\npub struct Memory;\n\nimpl Inventory for Memory { fn put(&mut self, _item: Item) {} }\n"
    });

    expect(edges((await analyze("src/lib.rs")).dependencies)).toEqual([
      ["src/stock.rs", []],
      ["src/stock/item.rs", ["Item"]],
      ["src/store/mod.rs", []]
    ]);
    expect(edges((await analyze("src/stock.rs")).dependencies)).toEqual([["src/stock/item.rs", ["Item"]]]);
    expect(edges((await analyze("src/store/memory.rs")).dependencies)).toEqual([
      ["src/lib.rs", []],
      ["src/stock.rs", []],
      ["src/stock/item.rs", ["Item"]],
      ["src/store/mod.rs", ["Inventory"]]
    ]);
  });

  it("resolves the library crate by its package name from the binary and from an integration test", async () => {
    await write({
      "Cargo.toml": '[package]\nname = "stock-room"\nversion = "0.1.0"\n',
      "src/lib.rs":     "pub mod report;\n\npub use report::write;\n",
      "src/report.rs":  "pub fn write() -> Vec<String> { Vec::new() }\npub fn count(lines: &[String]) -> usize { lines.len() }\n",
      "src/main.rs":    "use stock_room::report::count;\nuse stock_room::write;\n\nfn main() { let _ = count(&write()); }\n",
      "tests/api.rs":   "#[test]\nfn works() { assert_eq!(stock_room::report::count(&[]), 0); }\n"
    });

    expect(edges((await analyze("src/main.rs")).dependencies)).toEqual([
      ["src/lib.rs", []],
      ["src/report.rs", ["count", "write"]]
    ]);
    expect(edges((await analyze("tests/api.rs")).dependencies)).toEqual([
      ["src/lib.rs", []],
      ["src/report.rs", ["count"]]
    ]);
  });

  it("links the names a glob import brings in only when the file uses them", async () => {
    await write({
      "Cargo.toml": CARGO,
      "src/lib.rs":    "pub mod stock;\npub mod report;\n",
      "src/stock.rs":  "pub struct Item;\npub struct Quantity;\npub fn unused() {}\n",
      "src/report.rs": "use crate::stock::*;\n\npub fn write(item: Item) -> Quantity { let _ = item; Quantity }\n"
    });

    expect(edges((await analyze("src/report.rs")).dependencies)).toEqual([
      ["src/lib.rs", []],
      ["src/stock.rs", ["Item", "Quantity"]]
    ]);
  });

  it("reads paths inside macro invocations, and nothing inside strings and comments", async () => {
    await write({
      "Cargo.toml": CARGO,
      "src/lib.rs":    "pub mod stock;\npub mod quiet;\npub mod noisy;\n",
      "src/stock.rs":  "pub fn total() -> f64 { 1.0 }\n",
      "src/quiet.rs":  "// stock::total is mentioned here\npub const TEXT: &str = \"crate::stock::total()\";\n",
      "src/noisy.rs":  "pub fn show() { println!(\"{}\", crate::stock::total()); }\n"
    });

    expect((await analyze("src/quiet.rs")).dependencies).toEqual([]);
    expect(edges((await analyze("src/noisy.rs")).dependencies)).toEqual([
      ["src/lib.rs", []],
      ["src/stock.rs", ["total"]]
    ]);
  });

  it("records field, parameter, return and bound types, and trait implementations, by simple name", async () => {
    await write({
      "Cargo.toml": CARGO,
      "src/lib.rs": [
        "pub mod stock { pub struct Item; pub struct Quantity; pub trait Countable {} }",
        "use stock::{Countable, Item, Quantity};",
        "",
        "pub struct Line { pub item: Item, pub on_hand: Quantity }",
        "pub fn total<T: Countable>(values: &[T], unit: Quantity) -> Line { unimplemented!() }",
        "impl std::fmt::Display for Line { fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result { Ok(()) } }",
        "impl Countable for Line {}",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("src/lib.rs");
    const named = Object.fromEntries(symbols.map((symbol) => [symbol.qualifiedName ?? symbol.name, symbol.typeReferences]));
    expect(named["Line"]).toEqual([{ name: "Countable", role: "implements" }]);
    expect(named["Line.item"]).toEqual([{ name: "Item", role: "property" }]);
    expect(named["total"]).toEqual([
      { name: "Countable", role: "generic-constraint" },
      { name: "Quantity", role: "parameter", parameterName: "unit" },
      { name: "Line", role: "return" }
    ]);
  });

  it("lists other crates by name with the names imported, and leaves the standard library out", async () => {
    await write({
      "Cargo.toml": CARGO,
      "src/lib.rs": "use std::collections::HashMap;\nuse regex::Regex;\nuse serde::{Deserialize, Serialize};\n\npub fn run() { let _ = HashMap::<u8, u8>::new(); }\n"
    });

    expect((await analyze("src/lib.rs")).dependencies).toEqual([
      { specifier: "regex", symbols: ["Regex"], kind: "import" },
      { specifier: "serde", symbols: ["Deserialize", "Serialize"], kind: "import" }
    ]);
  });
});

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { goAdapter } from "./go";

describe("goAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "go-adapter-"));
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
    const result = await goAdapter.analyze({ absolutePath: path.join(workspaceRoot, relative), workspaceRoot });
    return result!;
  }

  function edges(dependencies: Array<{ resolvedPath?: string; specifier: string; symbols: string[] }>): Array<[string, string[]]> {
    return dependencies.map((dependency) => [dependency.resolvedPath ?? dependency.specifier, dependency.symbols]);
  }

  const GO_MOD = "module example.com/depot\n\ngo 1.21\n";

  it("publishes package-level declarations, exported methods and fields, and interface methods, with their doc comments", async () => {
    await write({
      "go.mod": GO_MOD,
      "stock/stock.go": [
        "package stock",
        "",
        "// Limit is the most we keep.",
        "const Limit = 3",
        "",
        "var hidden = 1",
        "",
        "// Item is something kept.",
        "//",
        "// It has a SKU.",
        "type Item struct {",
        "\tSKU  string",
        "\tnote string",
        "}",
        "",
        "// Describe renders the item.",
        "func (i Item) Describe() string { return i.SKU }",
        "",
        "func (i Item) internal() {}",
        "",
        "// Store keeps items.",
        "type Store interface {",
        "\t// Put adds an item.",
        "\tPut(item Item) error",
        "}",
        "",
        "func helper() {}",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("stock/stock.go");
    expect(symbols.map((symbol) => [symbol.name, symbol.kind, symbol.qualifiedName])).toEqual([
      ["Limit", "constant", undefined],
      ["hidden", "variable", undefined],
      ["Item", "struct", undefined],
      ["SKU", "field", "Item.SKU"],
      ["Describe", "method", "Item.Describe"],
      ["Store", "interface", undefined],
      ["Put", "method", "Store.Put"],
      ["helper", "function", undefined]
    ]);
    expect(symbols[2].documentation).toEqual({ source: "godoc", summary: "Item is something kept.", remarks: "It has a SKU." });
    expect(symbols[6].documentation?.summary).toBe("Put adds an item.");
    expect(symbols[6].typeReferences).toEqual([{ name: "Item", role: "parameter", parameterName: "item" }]);
  });

  it("links a sibling file of the same package by the names it uses, unless a local shadows them", async () => {
    await write({
      "go.mod": GO_MOD,
      "report/format.go": "package report\n\nfunc format(line string) string { return line }\n\ntype Line struct{}\n",
      "report/report.go": "package report\n\nfunc Write(lines []string) []string {\n\tout := []string{}\n\tfor _, line := range lines {\n\t\tout = append(out, format(line))\n\t}\n\tvar l Line\n\t_ = l\n\treturn out\n}\n",
      "report/count.go":  "package report\n\nfunc Count(lines []string) int {\n\tformat := 0\n\tfor range lines {\n\t\tformat++\n\t}\n\treturn format\n}\n"
    });

    expect(edges((await analyze("report/report.go")).dependencies)).toEqual([["report/format.go", ["Line", "format"]]]);
    expect((await analyze("report/count.go")).dependencies).toEqual([]);
  });

  it("resolves pkg.Name through the module path to the file that declares it, by the package's own name or an alias", async () => {
    await write({
      "go.mod": GO_MOD,
      "stock/item.go":         "package stock\n\ntype Item struct{}\n",
      "stock/quantity.go":     "package stock\n\ntype Quantity struct{}\n\nfunc New() Quantity { return Quantity{} }\n",
      "store/memory/memory.go": "// Package memstore lives in a directory named memory.\npackage memstore\n\nfunc Open() {}\n",
      "cmd/main.go": [
        "package main",
        "",
        "import (",
        "\t\"fmt\"",
        "\t\"example.com/depot/stock\"",
        "\tms \"example.com/depot/store/memory\"",
        ")",
        "",
        "func main() {",
        "\tvar item stock.Item",
        "\tq := stock.New()",
        "\tms.Open()",
        "\tfmt.Println(item, q)",
        "}",
        ""
      ].join("\n")
    });

    expect(edges((await analyze("cmd/main.go")).dependencies)).toEqual([
      ["stock/item.go", ["Item"]],
      ["stock/quantity.go", ["New"]],
      ["store/memory/memory.go", ["Open"]]
    ]);
  });

  it("brings a dot import's exported names into scope and depends on a blank import's whole package", async () => {
    await write({
      "go.mod": GO_MOD,
      "stock/item.go":     "package stock\n\ntype Item struct{}\n\nfunc unexported() {}\n",
      "audit/audit.go":    "package audit\n\nfunc init() {}\n",
      "audit/log.go":      "package audit\n\nfunc Log() {}\n",
      "report/report_test.go": [
        "package report_test",
        "",
        "import (",
        "\t_ \"example.com/depot/audit\"",
        "\t. \"example.com/depot/stock\"",
        ")",
        "",
        "func use() { _ = Item{} }",
        ""
      ].join("\n")
    });

    expect(edges((await analyze("report/report_test.go")).dependencies)).toEqual([
      ["audit/audit.go", []],
      ["audit/log.go", []],
      ["stock/item.go", ["Item"]]
    ]);
  });

  it("lets a test file see other test files of its package, and keeps test files out of what other packages import", async () => {
    await write({
      "go.mod": GO_MOD,
      "stock/item.go":        "package stock\n\ntype Item struct{}\n",
      "stock/helpers_test.go": "package stock\n\nfunc fixture() Item { return Item{} }\n",
      "stock/item_test.go":   "package stock\n\nfunc TestItem() { _ = fixture() }\n",
      "app/app.go":           "package app\n\nimport \"example.com/depot/stock\"\n\nvar _ = stock.Item{}\nvar _ = stock.fixture\n"
    });

    expect(edges((await analyze("stock/item_test.go")).dependencies)).toEqual([["stock/helpers_test.go", ["fixture"]]]);
    expect(edges((await analyze("app/app.go")).dependencies)).toEqual([["stock/item.go", ["Item"]]]);
  });

  it("records field, embedded, parameter, result and constraint types", async () => {
    await write({
      "go.mod": GO_MOD,
      "stock/stock.go": [
        "package stock",
        "",
        "type Number interface{ ~int | ~float64 }",
        "type Base struct{}",
        "type Unit int",
        "",
        "type Item struct {",
        "\tBase",
        "\tUnit Unit",
        "}",
        "",
        "func Total[T Number](values []T, unit Unit) (Item, error) { return Item{}, nil }",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("stock/stock.go");
    const named = Object.fromEntries(symbols.map((symbol) => [symbol.qualifiedName ?? symbol.name, symbol.typeReferences]));
    expect(named["Item"]).toEqual([{ name: "Base", role: "extends" }]);
    expect(named["Item.Unit"]).toEqual([{ name: "Unit", role: "property" }]);
    expect(named["Total"]).toEqual([
      { name: "Number", role: "generic-constraint" },
      { name: "Unit", role: "parameter", parameterName: "unit" },
      { name: "Item", role: "return" }
    ]);
  });

  it("lists third-party imports as external and leaves the standard library out", async () => {
    await write({
      "go.mod": GO_MOD,
      "app/app.go": "package app\n\nimport (\n\t\"fmt\"\n\t\"net/http\"\n\t\"github.com/example/lib\"\n)\n\nvar _ = fmt.Sprint\nvar _ = http.Get\nvar _ = lib.Thing\n"
    });

    expect((await analyze("app/app.go")).dependencies).toEqual([{ specifier: "github.com/example/lib", symbols: [], kind: "import" }]);
  });

  it("ignores names inside strings and comments", async () => {
    await write({
      "go.mod": GO_MOD,
      "report/other.go": "package report\n\nfunc Other() {}\n",
      "report/quiet.go": "package report\n\n// Other is mentioned here.\nvar text = \"Other()\"\n"
    });

    expect((await analyze("report/quiet.go")).dependencies).toEqual([]);
  });
});

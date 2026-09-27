import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { javaAdapter } from "./java";

describe("javaAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "java-adapter-"));
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
    const result = await javaAdapter.analyze({ absolutePath: path.join(workspaceRoot, relative), workspaceRoot });
    return result!;
  }

  function edges(dependencies: Array<{ resolvedPath?: string; specifier: string; symbols: string[] }>): Array<[string, string[]]> {
    return dependencies.map((dependency) => [dependency.resolvedPath ?? dependency.specifier, dependency.symbols]);
  }

  it("publishes types, nested types and the members they expose", async () => {
    await write({
      "p/Shapes.java": [
        "package p;",
        "",
        "/** A shape. */",
        "public class Shapes {",
        "    public static final int LIMIT = 3;",
        "    private int hidden;",
        "    protected String name;",
        "",
        "    /** Builds one. */",
        "    public Shapes(String name) { this.name = name; }",
        "",
        "    public void draw() {}",
        "    private void tidy() {}",
        "",
        "    public interface Listener { void on(); }",
        "    public enum Mode { FAST, SLOW }",
        "    public record Pair(String left, int right) {}",
        "}",
        "",
        "class PackagePrivate {}",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("p/Shapes.java");
    expect(symbols.map((symbol) => [symbol.name, symbol.kind, symbol.qualifiedName])).toEqual([
      ["Shapes", "class", "p.Shapes"],
      ["LIMIT", "field", undefined],
      ["name", "field", undefined],
      ["Shapes", "constructor", undefined],
      ["draw", "method", undefined],
      ["Listener", "interface", "p.Shapes.Listener"],
      ["on", "method", undefined],
      ["Mode", "enum", "p.Shapes.Mode"],
      ["FAST", "field", undefined],
      ["SLOW", "field", undefined],
      ["Pair", "record", "p.Shapes.Pair"],
      ["left", "field", undefined],
      ["right", "field", undefined],
      ["PackagePrivate", "class", "p.PackagePrivate"]
    ]);
    expect(symbols[0].documentation?.summary).toBe("A shape.");
    expect(symbols[3].documentation?.summary).toBe("Builds one.");
  });

  it("resolves a same-package type with no import, across source roots", async () => {
    await write({
      "src/main/java/p/Thing.java":     "package p;\n\npublic class Thing {}\n",
      "src/test/java/p/ThingTest.java": "package p;\n\nclass ThingTest {\n    Thing subject = new Thing();\n}\n"
    });

    expect(edges((await analyze("src/test/java/p/ThingTest.java")).dependencies)).toEqual([
      ["src/main/java/p/Thing.java", ["Thing"]]
    ]);
  });

  it("resolves on-demand and static imports", async () => {
    await write({
      "p/model/Thing.java":    "package p.model;\n\npublic class Thing {}\n",
      "p/util/Helpers.java":   "package p.util;\n\npublic final class Helpers {\n    public static String format(int value) { return \"\" + value; }\n}\n",
      "p/app/App.java": [
        "package p.app;",
        "",
        "import p.model.*;",
        "import static p.util.Helpers.format;",
        "",
        "public class App {",
        "    Thing thing;",
        "    String text = format(1);",
        "}",
        ""
      ].join("\n")
    });

    expect(edges((await analyze("p/app/App.java")).dependencies)).toEqual([
      ["p/model/Thing.java", ["Thing"]],
      ["p/util/Helpers.java", ["Helpers"]]
    ]);
  });

  it("resolves a fully qualified name written without an import, and a nested type through its outer type", async () => {
    await write({
      "p/store/Inventory.java": "package p.store;\n\npublic interface Inventory {\n    interface Listener { void moved(); }\n}\n",
      "p/report/Report.java":   "package p.report;\n\npublic final class Report {\n    public static final class Builder { public Report build() { return null; } }\n}\n",
      "p/app/App.java": [
        "package p.app;",
        "",
        "import p.report.Report;",
        "",
        "public class App {",
        "    p.store.Inventory inventory;",
        "    p.store.Inventory.Listener listener;",
        "    Report.Builder builder = new Report.Builder();",
        "}",
        ""
      ].join("\n")
    });

    expect(edges((await analyze("p/app/App.java")).dependencies)).toEqual([
      ["p/report/Report.java", ["Builder", "Report"]],
      ["p/store/Inventory.java", ["Inventory", "Listener"]]
    ]);
  });

  it("links an annotation type of the workspace and the qualifier of a static call", async () => {
    await write({
      "p/Audited.java":  "package p;\n\npublic @interface Audited { String value() default \"\"; }\n",
      "p/Registry.java": "package p;\n\npublic final class Registry { public static void register(Object o) {} }\n",
      "p/Store.java":    "package p;\n\n@Audited(\"stock\")\npublic class Store {\n    void save() { Registry.register(this); }\n}\n"
    });

    expect(edges((await analyze("p/Store.java")).dependencies)).toEqual([
      ["p/Audited.java", ["Audited"]],
      ["p/Registry.java", ["Registry"]]
    ]);
  });

  it("ignores type names inside strings and comments", async () => {
    await write({
      "p/Other.java": "package p;\n\npublic class Other {}\n",
      "p/Quiet.java": [
        "package p;",
        "",
        "/** Mentions Other in Javadoc. */",
        "public class Quiet {",
        "    // Other again, in a comment",
        "    String text = \"new Other()\";",
        "}",
        ""
      ].join("\n")
    });

    expect((await analyze("p/Quiet.java")).dependencies).toEqual([]);
  });

  it("records inheritance, bounds, parameter and return types, leaving out the declaration's own type parameters", async () => {
    await write({
      "p/Box.java": [
        "package p;",
        "",
        "import java.util.List;",
        "",
        "public class Box<T extends Item> extends Base implements Holder<T> {",
        "    public T pick(List<T> items, Item fallback) { return fallback == null ? items.get(0) : null; }",
        "    public Item first;",
        "}",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("p/Box.java");
    expect(symbols.map((symbol) => [symbol.name, symbol.typeReferences])).toEqual([
      ["Box", [{ name: "Base", role: "extends" }, { name: "Holder", role: "implements" }, { name: "Item", role: "generic-constraint" }]],
      ["pick", [{ name: "List", role: "parameter", parameterName: "items" }, { name: "Item", role: "parameter", parameterName: "fallback" }]],
      ["first", [{ name: "Item", role: "property" }]]
    ]);
  });

  it("lists imports from outside the workspace as external, leaving out the JDK", async () => {
    await write({
      "p/Test.java": [
        "package p;",
        "",
        "import java.util.List;",
        "import org.junit.jupiter.api.Test;",
        "import static org.junit.jupiter.api.Assertions.*;",
        "",
        "class Suite {}",
        ""
      ].join("\n")
    });

    expect((await analyze("p/Test.java")).dependencies).toEqual([
      { specifier: "org.junit.jupiter.api.Assertions.*", symbols: [], kind: "import" },
      { specifier: "org.junit.jupiter.api.Test", symbols: ["Test"], kind: "import" }
    ]);
  });
});

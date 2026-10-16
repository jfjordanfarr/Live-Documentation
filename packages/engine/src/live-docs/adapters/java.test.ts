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

  const ROSETTA = path.resolve(__dirname, "../../../../..", "tests", "integration", "programs", "java", "rosetta");

  it("reports public static void main as the program's entry, written public or public as an interface member, and not an overload of another shape", async () => {
    await write({
      "p/App.java": [
        "package p;",
        "",
        "public final class App {",
        "    public static String main(int seed) { return \"\" + seed; }",
        "    public static void main(String[] args) { System.out.println(main(10)); }",
        "}",
        ""
      ].join("\n"),
      "p/Runner.java": "package p;\n\ninterface Runner {\n    static void main(String[] args) {}\n}\n"
    });

    expect((await analyze("p/App.java")).program).toEqual({ symbol: "main", line: 5 });
    expect((await analyze("p/Runner.java")).program).toEqual({ symbol: "main", line: 4 });

    const rosetta = await javaAdapter.analyze({ absolutePath: path.join(ROSETTA, "src", "com", "rosetta", "app", "Main.java"), workspaceRoot: ROSETTA });
    expect(rosetta?.program).toEqual({ symbol: "main", line: 41 });
  });

  it("reports the mains JEP 512 lets the launcher run: instance or static, not public, taking String[], String... or nothing", async () => {
    await write({
      "p/Hello.java":    "package p;\n\nclass Hello {\n    void main() {}\n}\n",
      "p/Echo.java":     "package p;\n\nclass Echo {\n    void main(String[] args) {}\n}\n",
      "p/Quiet.java":    "package p;\n\nclass Quiet {\n    static void main() {}\n}\n",
      "p/Spread.java":   "package p;\n\nclass Spread {\n    protected void main(final String... args) {}\n}\n",
      "p/OldStyle.java": "package p;\n\nclass OldStyle {\n    static void main(java.lang.String args[]) {}\n}\n",
      "p/Shape.java":    "package p;\n\nabstract class Shape {\n    static void main() {}\n}\n",
      "p/Unit.java":     "package p;\n\nrecord Unit() {\n    void main() {}\n}\n",
      "p/Built.java":    "package p;\n\nclass Built {\n    Built(int seed) {}\n    Built() { this(1); }\n    void main() {}\n}\n",
      "p/Outer.java":    "package p;\n\nclass Outer {\n    static class Inner {\n        void main() {}\n    }\n}\n"
    });

    const lines: Record<string, number> = {
      "p/Hello.java": 4, "p/Echo.java": 4, "p/Quiet.java": 4, "p/Spread.java": 4, "p/OldStyle.java": 4,
      "p/Shape.java": 4, "p/Unit.java": 4, "p/Built.java": 6, "p/Outer.java": 5
    };
    for (const [file, line] of Object.entries(lines)) {
      expect((await analyze(file)).program, file).toEqual({ symbol: "main", line });
    }
  });

  it("reports the main taking the arguments when a class declares both, as the launcher chooses it", async () => {
    await write({
      "p/Both.java": "package p;\n\nclass Both {\n    void main() {}\n    static void main(String[] args) {}\n}\n"
    });

    expect((await analyze("p/Both.java")).program).toEqual({ symbol: "main", line: 5 });
  });

  it("leaves program absent for a main the launcher cannot run", async () => {
    await write({
      "p/Hidden.java":   "package p;\n\nclass Hidden {\n    private void main() {}\n    private static void main(String[] args) {}\n}\n",
      "p/Counted.java":  "package p;\n\nclass Counted {\n    void main(int count) {}\n    void main(String[][] grid) {}\n    void main(java.util.List<String> args) {}\n    void main(String first, String second) {}\n    void main(String name) {}\n}\n",
      "p/Valued.java":   "package p;\n\nclass Valued {\n    int main() { return 0; }\n    static String main(String[] args) { return \"\"; }\n}\n",
      "p/Contract.java": "package p;\n\ninterface Contract {\n    void main();\n    default void main(String[] args) {}\n}\n",
      "p/Draft.java":    "package p;\n\nabstract class Draft {\n    abstract void main();\n    void main(String[] args) {}\n}\n",
      "p/Sealed.java":   "package p;\n\nclass Sealed {\n    private Sealed() {}\n    void main() {}\n}\n",
      "p/Seeded.java":   "package p;\n\nclass Seeded {\n    Seeded(int seed) {}\n    void main() {}\n}\n",
      "p/Point.java":    "package p;\n\nrecord Point(int x) {\n    void main() {}\n}\n",
      "p/Mode.java":     "package p;\n\nenum Mode {\n    ON;\n    void main() {}\n}\n",
      "p/Host.java":     "package p;\n\nclass Host {\n    class Guest {\n        void main() {}\n    }\n}\n",
      "p/Plain.java":    "package p;\n\npublic class Plain {\n    public void run() {}\n}\n"
    });

    for (const file of ["p/Hidden.java", "p/Counted.java", "p/Valued.java", "p/Contract.java", "p/Draft.java", "p/Sealed.java", "p/Seeded.java", "p/Point.java", "p/Mode.java", "p/Host.java", "p/Plain.java"]) {
      expect(await analyze(file), file).not.toHaveProperty("program");
    }
  });

  it("reports the top-level main of a compact source file, before a main of a class nested in it", async () => {
    await write({
      "Hello.java": "void main() {\n    IO.println(\"Hello\");\n}\n",
      "Tool.java": [
        "import java.util.List;",
        "",
        "class Helper {",
        "    static void main(String[] args) {}",
        "}",
        "",
        "String greeting = \"hi\";",
        "",
        "void main(String[] args) {",
        "    IO.println(greeting);",
        "}",
        ""
      ].join("\n"),
      "Inner.java":  "class Nested {\n    void main() {}\n}\n\nprivate void main() {}\n",
      "Static.java": "static class Nested {\n    void main() {}\n}\n\nprivate void main() {}\n"
    });

    expect((await analyze("Hello.java")).program).toEqual({ symbol: "main", line: 1 });
    expect((await analyze("Tool.java")).program).toEqual({ symbol: "main", line: 9 });
    expect(await analyze("Inner.java")).not.toHaveProperty("program");
    expect((await analyze("Static.java")).program).toEqual({ symbol: "main", line: 2 });
  });
});

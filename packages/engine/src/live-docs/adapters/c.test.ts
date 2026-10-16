import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { analyzeCSource, cAdapter, DEFAULT_INCLUDE_STRATEGY, resolveInclude, type IncludeStrategy } from "./c";

describe("cAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "c-adapter-"));
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
    const result = await cAdapter.analyze({ absolutePath: path.join(workspaceRoot, relative), workspaceRoot });
    return result!;
  }

  it("publishes what a C file offers at file scope, each with the comment above it, and leaves static definitions out", async () => {
    await write({
      "shapes.h": [
        "#ifndef SHAPES_H",
        "#define SHAPES_H",
        "#include <stddef.h>",
        "#define LIMIT 10",
        "#define SQUARE(x) ((x) * (x))",
        "/** A point. */",
        "struct point { int x; int y; };",
        "typedef struct { double w; double h; } extent;",
        "typedef enum { RED, GREEN } color;",
        "enum mode { ON, OFF };",
        "typedef int handle_t;",
        "typedef struct opaque opaque;",
        "typedef struct tag_s { int v; } alias_t;",
        "union pack { int i; float f; };",
        "int counter;",
        "extern int shared;",
        "static int hidden;",
        "static void helper(void);",
        "static int secret(void) { return 1; }",
        "/// Adds two numbers.",
        "int add(int a, int b);",
        "int (*callback)(int);",
        "int",
        "split(void)",
        "{ return 0; }",
        "struct point origin;",
        "struct forward;",
        "#endif",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("shapes.h");
    expect(symbols.map((symbol) => [symbol.name, symbol.kind, symbol.location?.line])).toEqual([
      ["SHAPES_H", "const", 2],
      ["LIMIT", "const", 4],
      ["SQUARE", "const", 5],
      ["point", "struct", 7],
      ["extent", "struct", 8],
      ["color", "enum", 9],
      ["mode", "enum", 10],
      ["handle_t", "type", 11],
      ["opaque", "type", 12],
      ["tag_s", "struct", 13],
      ["alias_t", "type", 13],
      ["pack", "union", 14],
      ["counter", "variable", 15],
      ["shared", "variable", 16],
      ["add", "function", 21],
      ["callback", "variable", 22],
      ["split", "function", 24],
      ["origin", "variable", 26]
    ]);
    expect(symbols.every((symbol) => symbol.qualifiedName === undefined)).toBe(true);
    expect(symbols[3].documentation).toEqual({ source: "doxygen", summary: "A point." });
    expect(symbols[14].documentation).toEqual({ source: "doxygen", summary: "Adds two numbers." });
  });

  it("publishes C++ classes with their public members, enum classes, namespaces, templates, aliases and extern \"C\" declarations", async () => {
    await write({
      "engine.hpp": [
        "namespace app {",
        "/// Runs things.",
        "class Engine : public Base {",
        "public:",
        "  /// Starts the engine.",
        "  explicit Engine(int size);",
        "  ~Engine();",
        "  void run(int steps) { steps++; }",
        "  static int count();",
        "  bool operator==(const Engine& other) const;",
        "  struct Inner { int x; };",
        "  int width;",
        "private:",
        "  void secret();",
        "  int depth;",
        "protected:",
        "  void guarded();",
        "};",
        "enum class Level { Low, High };",
        "template <typename T> T twice(T value) { return value * 2; }",
        "template <class T> struct Box { T item; };",
        "using Handle = int;",
        "namespace inner { void deep(); }",
        "namespace { void anonymous_fn(); }",
        "}",
        "extern \"C\" {",
        "  void c_api(void);",
        "}",
        "void app::Engine::secret() {}",
        "struct plain { void method(); int field; };",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("engine.hpp");
    expect(symbols.map((symbol) => [symbol.name, symbol.kind, symbol.qualifiedName])).toEqual([
      ["Engine", "class", "app.Engine"],
      ["Engine", "constructor", "app.Engine.Engine"],
      ["~Engine", "method", "app.Engine.~Engine"],
      ["run", "method", "app.Engine.run"],
      ["count", "method", "app.Engine.count"],
      ["operator==", "method", "app.Engine.operator=="],
      ["Inner", "struct", "app.Engine.Inner"],
      ["x", "field", "app.Engine.Inner.x"],
      ["width", "field", "app.Engine.width"],
      ["Level", "enum", "app.Level"],
      ["twice", "function", "app.twice"],
      ["Box", "struct", "app.Box"],
      ["item", "field", "app.Box.item"],
      ["Handle", "type", "app.Handle"],
      ["deep", "function", "app.inner.deep"],
      ["c_api", "function", undefined],
      ["secret", "method", "app.Engine.secret"],
      ["plain", "struct", undefined],
      ["method", "method", "plain.method"],
      ["field", "field", "plain.field"]
    ]);
    expect(symbols[0].documentation?.summary).toBe("Runs things.");
    expect(symbols[1].documentation?.summary).toBe("Starts the engine.");
    expect(symbols[10].location).toEqual({ line: 20, character: 25 });
  });

  const SHAPE_SOURCE = [
    "/// A point.",
    "struct Point {",
    "  int x;",
    "  int y;",
    "  /// Length from the origin.",
    "  double length() const;",
    "  Point(int x, int y);",
    "private:",
    "  int cache;",
    "};",
    "union Pack { int i; float f; };",
    "typedef struct { int w; int h; } Extent;",
    ""
  ].join("\n");

  it("lists a C++ struct's and union's public members as a class's, public until an access specifier says otherwise", async () => {
    await write({ "shape.hpp": SHAPE_SOURCE });

    const { symbols } = await analyze("shape.hpp");
    expect(symbols.map((symbol) => [symbol.name, symbol.kind, symbol.qualifiedName])).toEqual([
      ["Point", "struct", undefined],
      ["x", "field", "Point.x"],
      ["y", "field", "Point.y"],
      ["length", "method", "Point.length"],
      ["Point", "constructor", "Point.Point"],
      ["Pack", "union", undefined],
      ["i", "field", "Pack.i"],
      ["f", "field", "Pack.f"],
      ["Extent", "struct", undefined],
      ["w", "field", "Extent.w"],
      ["h", "field", "Extent.h"]
    ]);
    expect(symbols[3].documentation?.summary).toBe("Length from the origin.");
  });

  it("lists no members for a C struct or union, so a C doc gains no symbol per field", async () => {
    await write({ "shape.h": SHAPE_SOURCE });

    const { symbols } = await analyze("shape.h");
    expect(symbols.map((symbol) => [symbol.name, symbol.kind, symbol.qualifiedName])).toEqual([
      ["Point", "struct", undefined],
      ["Pack", "union", undefined],
      ["Extent", "struct", undefined]
    ]);
  });

  it("reads a C++ method's Doxygen comment", async () => {
    await write({
      "motor.hpp": [
        "class Motor {",
        "public:",
        "  /**",
        "   * @brief Spins the motor.",
        "   * @param speed Revolutions per minute.",
        "   * @return The speed reached.",
        "   * @throws std::range_error When the speed is negative.",
        "   */",
        "  int spin(int speed);",
        "};",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("motor.hpp");
    expect(symbols[1]).toMatchObject({
      name: "spin",
      kind: "method",
      qualifiedName: "Motor.spin",
      documentation: {
        source: "doxygen",
        summary: "Spins the motor.",
        parameters: [{ name: "speed", description: "Revolutions per minute." }],
        returns: "The speed reached.",
        exceptions: [{ type: "std::range_error", description: "When the speed is negative." }]
      }
    });
  });

  describe("include resolution", () => {
    const tree = {
      "src/app/main.cpp": "",
      "src/app/util.hpp": "int util(void);\n",
      "src/app/config.h": "#define CONFIGURED 1\n",
      "src/shared/log.hpp": "void log_line(const char *line);\n",
      "include/core/engine.hpp": "#include \"shared/log.hpp\"\nstruct engine { int id; };\n",
      "vendor/tool/main.cpp": "",
      "vendor/other/util.hpp": "int decoy(void);\n",
      "vendor/other/lost.hpp": "int lost(void);\n"
    };

    function resolve(includingFile: string, specifier: string, strategy: IncludeStrategy): string | undefined {
      return resolveInclude({ includingFile: path.join(workspaceRoot, includingFile), workspaceRoot, specifier, strategy });
    }

    it("tries only the including file's directory under including-directory, with .h for a bare name", async () => {
      await write(tree);
      expect(resolve("src/app/main.cpp", "util.hpp", "including-directory")).toBe("src/app/util.hpp");
      expect(resolve("src/app/main.cpp", "config", "including-directory")).toBe("src/app/config.h");
      expect(resolve("src/app/main.cpp", "core/engine.hpp", "including-directory")).toBeUndefined();
      expect(resolve("src/app/main.cpp", "src/shared/log.hpp", "including-directory")).toBeUndefined();
      expect(resolve("src/app/main.cpp", "lost.hpp", "including-directory")).toBeUndefined();
    });

    it("climbs to the workspace root under ancestors, so a root-relative include resolves", async () => {
      await write(tree);
      expect(resolve("src/app/main.cpp", "util.hpp", "ancestors")).toBe("src/app/util.hpp");
      expect(resolve("src/app/main.cpp", "../shared/log.hpp", "ancestors")).toBe("src/shared/log.hpp");
      expect(resolve("src/app/main.cpp", "src/shared/log.hpp", "ancestors")).toBe("src/shared/log.hpp");
      expect(resolve("src/app/main.cpp", "core/engine.hpp", "ancestors")).toBeUndefined();
      expect(resolve("src/app/main.cpp", "lost.hpp", "ancestors")).toBeUndefined();
    });

    it("also looks under each ancestor's include/ and src/ under ancestors-with-include-directories", async () => {
      await write(tree);
      expect(resolve("src/app/main.cpp", "util.hpp", "ancestors-with-include-directories")).toBe("src/app/util.hpp");
      expect(resolve("src/app/main.cpp", "core/engine.hpp", "ancestors-with-include-directories")).toBe("include/core/engine.hpp");
      expect(resolve("src/app/main.cpp", "shared/log.hpp", "ancestors-with-include-directories")).toBe("src/shared/log.hpp");
      expect(resolve("include/core/engine.hpp", "shared/log.hpp", "ancestors-with-include-directories")).toBe("src/shared/log.hpp");
      expect(resolve("src/app/main.cpp", "lost.hpp", "ancestors-with-include-directories")).toBeUndefined();
    });

    it("takes the nearest directory holding the file under any-directory, which can be a decoy", async () => {
      await write(tree);
      expect(resolve("src/app/main.cpp", "util.hpp", "any-directory")).toBe("src/app/util.hpp");
      expect(resolve("src/app/main.cpp", "core/engine.hpp", "any-directory")).toBe("include/core/engine.hpp");
      expect(resolve("src/app/main.cpp", "src/shared/log.hpp", "any-directory")).toBe("src/shared/log.hpp");
      expect(resolve("src/app/main.cpp", "lost.hpp", "any-directory")).toBe("vendor/other/lost.hpp");
      expect(resolve("vendor/tool/main.cpp", "util.hpp", "any-directory")).toBe("vendor/other/util.hpp");
    });

    it("names a file only as it is spelled on disk, and never one outside the workspace", async () => {
      await write(tree);
      for (const strategy of ["including-directory", "ancestors", "ancestors-with-include-directories", "any-directory"] as const) {
        expect(resolve("src/app/main.cpp", "Util.hpp", strategy)).toBeUndefined();
        expect(resolve("src/app/main.cpp", "../../../../../../etc/passwd", strategy)).toBeUndefined();
      }
    });

    it("reports every include once, a resolved header with the names used from it and the rest as external", async () => {
      await write({
        ...tree,
        "src/app/main.cpp": [
          "#include \"util.hpp\"",
          "#include \"util.hpp\"",
          "#include \"core/engine.hpp\"",
          "#include \"missing.hpp\"",
          "#include <vector>",
          "int main(void) { struct engine e = { util() }; return e.id; }",
          ""
        ].join("\n")
      });

      const absolutePath = path.join(workspaceRoot, "src/app/main.cpp");
      const content = await fs.readFile(absolutePath, "utf8");
      const { dependencies } = await analyzeCSource({ content, absolutePath, workspaceRoot, strategy: "any-directory" });
      expect(dependencies).toEqual([
        { specifier: "core/engine.hpp", resolvedPath: "include/core/engine.hpp", symbols: ["engine"], kind: "import" },
        { specifier: "missing.hpp", resolvedPath: undefined, symbols: [], kind: "import" },
        { specifier: "util.hpp", resolvedPath: "src/app/util.hpp", symbols: ["util"], kind: "import" },
        { specifier: "vector", resolvedPath: undefined, symbols: [], kind: "import" }
      ]);

      const byAdapter = await analyze("src/app/main.cpp");
      const byDefault = await analyzeCSource({ content, absolutePath, workspaceRoot, strategy: DEFAULT_INCLUDE_STRATEGY });
      expect(byAdapter.dependencies).toEqual(byDefault.dependencies);
    });
  });

  it("links a resolved header by the file-scope names the file uses, outside comments and strings, never by a class's members", async () => {
    await write({
      "geometry.h": [
        "#define LIMIT 10",
        "struct point { int x; int y; };",
        "typedef int handle_t;",
        "int add(int a, int b);",
        "int unused(void);",
        "int spin(void);",
        "class Widget { public: void spin(); };",
        ""
      ].join("\n"),
      "main.c": [
        "#include \"geometry.h\"",
        "#define TWICE (LIMIT * 2) /* add(unused) */",
        "/* add(unused) */",
        "static const char *text = \"unused add\";",
        "int main(void) {",
        "  struct point origin = { 0, 0 };",
        "  handle_t handle = add(origin.x, origin.y);",
        "  Widget w;",
        "  w.spin();",
        "  return handle + TWICE;",
        "}",
        ""
      ].join("\n")
    });

    expect((await analyze("main.c")).dependencies).toEqual([
      { specifier: "geometry.h", resolvedPath: "geometry.h", symbols: ["LIMIT", "Widget", "add", "handle_t", "point"], kind: "import" }
    ]);
  });

  it("reports the program entry of a source file that defines main or a Windows entry point, at the line of its name", async () => {
    await write({
      "app.cpp": "#include <cstdio>\n\nint\nmain(int argc, char **argv)\n{\n  return argc;\n}\n",
      "win.c": "int WinMain(void *instance, void *previous, char *command, int show) { return show; }\n",
      "lib.hpp": "int main(void) { return 0; }\n",
      "declared.cc": "int main(void);\n",
      "commented.cxx": "/*\nint main(void) { return 0; }\n*/\nconst char *text = \"int main(void) { return 0; }\";\n",
      "nested.cpp": "namespace app { int main() { return 0; } }\nclass Runner { public: int main() { return 0; } };\n"
    });

    expect((await analyze("app.cpp")).program).toEqual({ symbol: "main", line: 4 });
    expect((await analyze("app.cpp")).symbols.find((symbol) => symbol.name === "main")?.location?.line).toBe(4);
    expect((await analyze("win.c")).program).toEqual({ symbol: "WinMain", line: 1 });
    for (const file of ["lib.hpp", "declared.cc", "commented.cxx", "nested.cpp"]) {
      expect(await analyze(file)).not.toHaveProperty("program");
    }
  });
});

import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import ts from "typescript";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { augmentWithReExportedSymbols, collectDependencies, mergeDependencyEntries, resolveDependency } from "./dependencies";
import { collectExportedSymbols } from "./symbolExtraction";

describe("resolveDependency", () => {
  let workspace: string;

  beforeEach(async () => {
    workspace = await fs.mkdtemp(path.join(os.tmpdir(), "resolve-dependency-"));
    for (const file of ["csharp.ts", "csharp.dependencies.ts", "widget.ts", "widget.tsx", "lib/index.ts"]) {
      await fs.mkdir(path.dirname(path.join(workspace, file)), { recursive: true });
      await fs.writeFile(path.join(workspace, file), "export {};\n", "utf8");
    }
  });

  afterEach(async () => {
    await fs.rm(workspace, { recursive: true, force: true });
  });

  const from = () => path.join(workspace, "entry.ts");

  it("treats a dot inside a file name as part of the name, not as an extension", async () => {
    expect(await resolveDependency("./csharp.dependencies", from(), workspace)).toBe("csharp.dependencies.ts");
  });

  it("resolves a specifier written with a JavaScript extension to its TypeScript source", async () => {
    expect(await resolveDependency("./widget.js", from(), workspace)).toBe("widget.ts");
    expect(await resolveDependency("./widget.jsx", from(), workspace)).toBe("widget.tsx");
  });

  it("resolves an extensionless specifier by extension, then by index file", async () => {
    expect(await resolveDependency("./widget", from(), workspace)).toBe("widget.ts");
    expect(await resolveDependency("./lib", from(), workspace)).toBe("lib/index.ts");
  });

  it("gives up on a file that does not exist", async () => {
    expect(await resolveDependency("./missing", from(), workspace)).toBeUndefined();
  });
});

describe("collectDependencies", () => {
  let workspace: string;

  beforeEach(async () => {
    workspace = await fs.mkdtemp(path.join(os.tmpdir(), "collect-dependencies-"));
    for (const file of ["widget.ts", "lib/index.ts", "assets.ts"]) {
      await fs.mkdir(path.dirname(path.join(workspace, file)), { recursive: true });
      await fs.writeFile(path.join(workspace, file), "export {};\n", "utf8");
    }
  });

  afterEach(async () => {
    await fs.rm(workspace, { recursive: true, force: true });
  });

  it("records a dynamic import with a literal path, wherever it stands, and not one whose path is computed", async () => {
    const absolutePath = path.join(workspace, "entry.ts");
    const content = [
      'import { widget } from "./widget";',
      'const load = async () => (await import("./assets")).build;',
      "export async function run(name: string) {",
      '  const lib = await import("./lib");',
      "  const plugin = await import(`./plugins/${name}`);",
      "  return [widget, lib, plugin, load];",
      "}"
    ].join("\n");
    await fs.writeFile(absolutePath, content, "utf8");
    const sourceFile = ts.createSourceFile(absolutePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const dependencies = await collectDependencies({ sourceFile, absolutePath, workspaceRoot: workspace });
    expect(dependencies.map((entry) => [entry.specifier, entry.resolvedPath, entry.kind, entry.symbols])).toEqual([
      ["./assets", "assets.ts", "import", []],
      ["./lib", "lib/index.ts", "import", []],
      ["./widget", "widget.ts", "import", ["widget"]]
    ]);
    expect(dependencies.find((entry) => entry.specifier === "./lib")?.location).toEqual({ line: 4, character: 21 });
  });

  it("exports a namespace by its own name and expands only a bare star through the provider", async () => {
    const absolutePath = path.join(workspace, "entry.ts");
    await fs.writeFile(path.join(workspace, "widget.ts"), "export interface Item { id: string }\n", "utf8");
    const namespaceOnly = 'export * as Models from "./widget";\n';
    const namespaceSource = ts.createSourceFile(absolutePath, namespaceOnly, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const namespace = await collectDependencies({ sourceFile: namespaceSource, absolutePath, workspaceRoot: workspace });
    const symbols = collectExportedSymbols(namespaceSource);
    expect(symbols.map((entry) => [entry.name, entry.kind, entry.isReExport])).toEqual([["Models", "namespace", true]]);
    expect(namespace.map((entry) => [entry.resolvedPath, entry.symbols, entry.reExportAll])).toEqual([["widget.ts", [], false]]);
    expect((await augmentWithReExportedSymbols({ sourceAbsolute: absolutePath, workspaceRoot: workspace, dependencies: namespace, existingSymbols: symbols })).reExports).toEqual([]);

    const both = `${namespaceOnly}export * from "./widget";\n`;
    const bothSource = ts.createSourceFile(absolutePath, both, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const dependencies = await collectDependencies({ sourceFile: bothSource, absolutePath, workspaceRoot: workspace });
    const merged = mergeDependencyEntries(dependencies, [{ specifier: "./widget", resolvedPath: "widget.ts", symbols: [], kind: "import" }]);
    expect(merged.filter((entry) => entry.reExportAll)).toHaveLength(1);
    const reExports = (await augmentWithReExportedSymbols({ sourceAbsolute: absolutePath, workspaceRoot: workspace, dependencies: merged, existingSymbols: collectExportedSymbols(bothSource) })).reExports;
    expect(reExports.map((entry) => entry.name)).toEqual(["Item"]);
  });
});

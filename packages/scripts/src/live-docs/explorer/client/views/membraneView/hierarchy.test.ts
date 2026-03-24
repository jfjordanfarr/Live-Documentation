import { describe, expect, it } from "vitest";
import { isBarrelFile, applyBarrelSemantics } from "./hierarchy";
import type { DirectoryNode } from "../../types";

/** Helper: minimal file node stub for DirectoryNode.nodes. */
function fileNode(name: string, path: string) {
  return {
    id: path,
    name,
    codePath: path,
    codeRelativePath: path,
    docPath: "",
    docRelativePath: path,
    archetype: "implementation",
    dependencies: [],
    dependents: [],
    missingDependencies: [],
    publicSymbols: [],
    symbolDocumentation: undefined,
  };
}

/** Helper: create a DirectoryNode with files and subdirectories. */
function dir(
  name: string,
  path: string,
  children: DirectoryNode[] = [],
  files: ExplorerNodePayload[] = []
): DirectoryNode {
  const childMap = new Map<string, DirectoryNode>();
  for (const c of children) {
    childMap.set(c.name, c);
  }
  return { name, path, children: childMap, nodes: files };
}

describe("isBarrelFile", () => {
  it("detects TypeScript index files", () => {
    expect(isBarrelFile("index.ts")).toBe(true);
    expect(isBarrelFile("index.tsx")).toBe(true);
    expect(isBarrelFile("index.js")).toBe(true);
    expect(isBarrelFile("index.jsx")).toBe(true);
    expect(isBarrelFile("index.mts")).toBe(true);
    expect(isBarrelFile("index.mjs")).toBe(true);
  });

  it("detects Python __init__ files", () => {
    expect(isBarrelFile("__init__.py")).toBe(true);
    expect(isBarrelFile("__init__.pyi")).toBe(true);
  });

  it("detects Rust mod files", () => {
    expect(isBarrelFile("mod.rs")).toBe(true);
  });

  it("detects Go package files", () => {
    expect(isBarrelFile("doc.go")).toBe(true);
  });

  it("rejects non-barrel files", () => {
    expect(isBarrelFile("utils.ts")).toBe(false);
    expect(isBarrelFile("index.css")).toBe(false);
    expect(isBarrelFile("main.ts")).toBe(false);
    expect(isBarrelFile("setup.py")).toBe(false);
    expect(isBarrelFile("lib.rs")).toBe(false);
    expect(isBarrelFile("main.go")).toBe(false);
  });
});

describe("applyBarrelSemantics", () => {
  it("marks barrel files on their parent MembraneNode", () => {
    const indexFile = fileNode("index.ts", "src/utils/index.ts");
    const helperFile = fileNode("helpers.ts", "src/utils/helpers.ts");

    const root = dir("root", "__root__", [
      dir("src", "src", [
        dir("utils", "src/utils", [], [indexFile, helperFile]),
      ]),
    ]);

    const result = applyBarrelSemantics(root);

    // The utils dir should have only the non-barrel file left
    const utils = result.children.get("src")!.children.get("utils")!;
    expect(utils.nodes).toHaveLength(1);
    expect(utils.nodes[0].name).toBe("helpers.ts");
  });

  it("preserves directories without barrel files unchanged", () => {
    const file1 = fileNode("a.ts", "src/a.ts");
    const file2 = fileNode("b.ts", "src/b.ts");

    const root = dir("root", "__root__", [
      dir("src", "src", [], [file1, file2]),
    ]);

    const result = applyBarrelSemantics(root);
    const src = result.children.get("src")!;
    expect(src.nodes).toHaveLength(2);
  });

  it("handles nested barrel files at multiple levels", () => {
    const root = dir("root", "__root__", [
      dir("a", "a", [
        dir("b", "a/b", [], [
          fileNode("index.ts", "a/b/index.ts"),
          fileNode("util.ts", "a/b/util.ts"),
        ]),
      ], [
        fileNode("index.ts", "a/index.ts"),
        fileNode("main.ts", "a/main.ts"),
      ]),
    ]);

    const result = applyBarrelSemantics(root);
    const a = result.children.get("a")!;
    expect(a.nodes).toHaveLength(1); // only main.ts
    expect(a.nodes[0].name).toBe("main.ts");

    const b = a.children.get("b")!;
    expect(b.nodes).toHaveLength(1); // only util.ts
    expect(b.nodes[0].name).toBe("util.ts");
  });

  it("does not remove barrel file when it is the only file in a directory", () => {
    const root = dir("root", "__root__", [
      dir("solo", "solo", [], [
        fileNode("index.ts", "solo/index.ts"),
      ]),
    ]);

    const result = applyBarrelSemantics(root);
    const solo = result.children.get("solo")!;
    // Barrel is the only file — removing it would make the directory
    // appear empty. Keep it so the membrane still has content.
    expect(solo.nodes).toHaveLength(1);
  });
});

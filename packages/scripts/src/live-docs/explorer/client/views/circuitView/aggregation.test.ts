import { describe, expect, it } from "vitest";
import {
  computeDirectoryAggregates,
  computeChildAggregates,
  computeAggregateWeight,
  computeFileWeight,
  findDirectoryByPath,
  type DirectoryAggregate
} from "./aggregation";
import type { DirectoryNode } from "../../types";
import type { ExplorerNodePayload, ExplorerDependencyReference } from "../../../shared/types";

function createNode(
  id: string,
  docRelativePath: string,
  overrides: Partial<ExplorerNodePayload> = {}
): ExplorerNodePayload {
  return {
    id,
    name: id,
    codePath: `/${id}`,
    codeRelativePath: id,
    docPath: `/.live-documentation/source/${docRelativePath}`,
    docRelativePath,
    archetype: "implementation",
    dependencies: [],
    dependents: [],
    missingDependencies: [],
    publicSymbols: [],
    symbolDocumentation: undefined,
    ...overrides
  };
}

function buildTestHierarchy(nodes: ExplorerNodePayload[]): DirectoryNode {
  const root: DirectoryNode = { name: "", path: "__root__", children: new Map(), nodes: [] };
  for (const node of nodes) {
    const parts = (node.docRelativePath || "").split("/").filter(Boolean);
    if (parts.length === 0) {
      root.nodes.push(node);
      continue;
    }
    const dirParts = parts.slice(0, -1);
    let current = root;
    for (const part of dirParts) {
      if (!current.children.has(part)) {
        const segmentPath = current.path === "__root__" ? part : `${current.path}/${part}`;
        current.children.set(part, {
          name: part,
          path: segmentPath,
          children: new Map(),
          nodes: []
        });
      }
      current = current.children.get(part)!;
    }
    current.nodes.push(node);
  }
  return root;
}

describe("computeDirectoryAggregates", () => {
  it("computes correct file counts per directory", () => {
    const nodes = [
      createNode("a", "shared/a.ts"),
      createNode("b", "shared/b.ts"),
      createNode("c", "scripts/c.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    const aggregates = computeDirectoryAggregates(root, nodes);

    const shared = aggregates.get("shared");
    const scripts = aggregates.get("scripts");
    expect(shared).toBeDefined();
    expect(scripts).toBeDefined();
    expect(shared!.fileCount).toBe(2);
    expect(scripts!.fileCount).toBe(1);
  });

  it("counts public symbols across all files in a directory", () => {
    const nodes = [
      createNode("a", "src/a.ts", { publicSymbols: ["foo", "bar"] }),
      createNode("b", "src/b.ts", { publicSymbols: ["baz"] }),
    ];
    const root = buildTestHierarchy(nodes);
    const aggregates = computeDirectoryAggregates(root, nodes);
    const src = aggregates.get("src");
    expect(src).toBeDefined();
    expect(src!.symbolCount).toBe(3);
  });

  it("counts cross-boundary outbound dependencies", () => {
    const nodes = [
      createNode("a", "src/a.ts", {
        dependencies: [
          { targetId: "b", label: "", raw: "", resolved: true, kind: "dependency" } as ExplorerDependencyReference,
          { targetId: "c", label: "", raw: "", resolved: true, kind: "dependency" } as ExplorerDependencyReference
        ]
      }),
      createNode("b", "src/b.ts"),
      createNode("c", "lib/c.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    const aggregates = computeDirectoryAggregates(root, nodes);
    const src = aggregates.get("src");
    expect(src).toBeDefined();
    // a depends on b (internal) and c (external) → 1 outbound
    expect(src!.outboundDepCount).toBe(1);
  });

  it("counts cross-boundary inbound dependents", () => {
    const nodes = [
      createNode("a", "src/a.ts", { dependents: ["c"] }),
      createNode("b", "src/b.ts"),
      createNode("c", "lib/c.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    const aggregates = computeDirectoryAggregates(root, nodes);
    const src = aggregates.get("src");
    expect(src).toBeDefined();
    // a has dependent c which is outside src → 1 inbound
    expect(src!.inboundDepCount).toBe(1);
  });

  it("collects unique archetypes", () => {
    const nodes = [
      createNode("a", "src/a.ts", { archetype: "implementation" }),
      createNode("b", "src/b.test.ts", { archetype: "test" }),
      createNode("c", "src/c.ts", { archetype: "implementation" }),
    ];
    const root = buildTestHierarchy(nodes);
    const aggregates = computeDirectoryAggregates(root, nodes);
    const src = aggregates.get("src");
    expect(src).toBeDefined();
    expect(src!.archetypes.size).toBe(2);
    expect(src!.archetypes.has("implementation")).toBe(true);
    expect(src!.archetypes.has("test")).toBe(true);
  });

  it("collapses single-child directory chains", () => {
    // Structure: root → a → b → [files]
    const nodes = [
      createNode("x", "a/b/x.ts"),
      createNode("y", "a/b/y.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    const aggregates = computeDirectoryAggregates(root, nodes);
    // Single-child chain a → b should collapse to a/b
    expect(aggregates.has("a/b")).toBe(true);
    expect(aggregates.has("a")).toBe(false);
    expect(aggregates.get("a/b")!.fileCount).toBe(2);
  });

  it("returns empty map for empty hierarchy", () => {
    const root: DirectoryNode = { name: "", path: "__root__", children: new Map(), nodes: [] };
    const aggregates = computeDirectoryAggregates(root, []);
    expect(aggregates.size).toBe(0);
  });

  it("handles root-level files (no directories)", () => {
    const nodes = [
      createNode("a", "a.ts"),
      createNode("b", "b.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    const aggregates = computeDirectoryAggregates(root, nodes);
    // Root-level files have no child directories, so no aggregates
    expect(aggregates.size).toBe(0);
  });
});

describe("computeAggregateWeight", () => {
  it("uses file count as primary weight", () => {
    const agg: DirectoryAggregate = {
      path: "src",
      name: "src",
      fileCount: 10,
      symbolCount: 0,
      outboundDepCount: 0,
      inboundDepCount: 0,
      archetypes: new Set()
    };
    expect(computeAggregateWeight(agg)).toBe(10);
  });

  it("adds dependency bonus", () => {
    const agg: DirectoryAggregate = {
      path: "src",
      name: "src",
      fileCount: 10,
      symbolCount: 0,
      outboundDepCount: 4,
      inboundDepCount: 8,
      archetypes: new Set()
    };
    // 10 + (4 + 8) * 0.25 = 10 + 3 = 13
    expect(computeAggregateWeight(agg)).toBe(13);
  });
});

describe("computeChildAggregates", () => {
  it("returns aggregates for children of any directory", () => {
    const nodes = [
      createNode("a", "pkg/shared/a.ts"),
      createNode("b", "pkg/shared/b.ts"),
      createNode("c", "pkg/server/c.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    // Get the "pkg" directory
    const pkg = root.children.get("pkg")!;
    const aggregates = computeChildAggregates(pkg);

    expect(aggregates).toHaveLength(2);
    const shared = aggregates.find(a => a.path === "pkg/shared");
    const server = aggregates.find(a => a.path === "pkg/server");
    expect(shared).toBeDefined();
    expect(server).toBeDefined();
    expect(shared!.fileCount).toBe(2);
    expect(server!.fileCount).toBe(1);
  });

  it("collapses single-child chains at any level", () => {
    // Structure: root → pkg → shared → src → [files]
    const nodes = [
      createNode("x", "pkg/shared/src/x.ts"),
      createNode("y", "pkg/shared/src/y.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    const pkg = root.children.get("pkg")!;
    const aggregates = computeChildAggregates(pkg);

    // shared → src is a single-child chain, should collapse
    expect(aggregates).toHaveLength(1);
    expect(aggregates[0].path).toBe("pkg/shared/src");
    expect(aggregates[0].fileCount).toBe(2);
  });

  it("returns empty array for leaf directory", () => {
    const nodes = [
      createNode("a", "src/a.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    const src = root.children.get("src")!;
    const aggregates = computeChildAggregates(src);
    expect(aggregates).toHaveLength(0);
  });

  it("builds display name showing collapsed chain", () => {
    const nodes = [
      createNode("x", "a/b/c/x.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    const aggregates = computeChildAggregates(root);
    // a → b → c collapsed; display name should show the chain
    expect(aggregates).toHaveLength(1);
    expect(aggregates[0].name).toBe("a/b/c");
  });

  it("uses simple name when no chain collapsing occurs", () => {
    const nodes = [
      createNode("x", "src/x.ts"),
      createNode("y", "lib/y.ts"),
    ];
    const root = buildTestHierarchy(nodes);
    const aggregates = computeChildAggregates(root);
    const names = aggregates.map(a => a.name).sort();
    expect(names).toEqual(["lib", "src"]);
  });
});

describe("findDirectoryByPath", () => {
  it("returns root when given root path", () => {
    const root: DirectoryNode = { name: "", path: "__root__", children: new Map(), nodes: [] };
    expect(findDirectoryByPath(root, "__root__")).toBe(root);
  });

  it("finds a top-level directory", () => {
    const nodes = [createNode("a", "src/a.ts")];
    const root = buildTestHierarchy(nodes);
    const found = findDirectoryByPath(root, "src");
    expect(found).toBeDefined();
    expect(found!.path).toBe("src");
  });

  it("finds a deeply nested directory", () => {
    const nodes = [createNode("a", "pkg/shared/src/live-docs/a.ts")];
    const root = buildTestHierarchy(nodes);
    const found = findDirectoryByPath(root, "pkg/shared/src/live-docs");
    expect(found).toBeDefined();
    expect(found!.path).toBe("pkg/shared/src/live-docs");
  });

  it("returns null for non-existent path", () => {
    const nodes = [createNode("a", "src/a.ts")];
    const root = buildTestHierarchy(nodes);
    expect(findDirectoryByPath(root, "nonexistent")).toBeNull();
  });

  it("returns null for partial path mismatch", () => {
    const nodes = [createNode("a", "src/a.ts")];
    const root = buildTestHierarchy(nodes);
    expect(findDirectoryByPath(root, "src/missing/deep")).toBeNull();
  });
});

describe("computeFileWeight", () => {
  it("returns 1 for a file with no symbols", () => {
    const node = createNode("a", "a.ts");
    expect(computeFileWeight(node)).toBe(1);
  });

  it("adds symbol bonus", () => {
    const node = createNode("a", "a.ts", { publicSymbols: ["x", "y", "z"] });
    // 1 + 3 * 0.15 = 1.45
    expect(computeFileWeight(node)).toBeCloseTo(1.45);
  });
});

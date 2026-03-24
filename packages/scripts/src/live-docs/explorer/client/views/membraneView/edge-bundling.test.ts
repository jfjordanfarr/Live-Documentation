import { describe, expect, it } from "vitest";
import { aggregateEdges } from "./edge-bundling";
import type { MembraneNode, MembraneLayout } from "./types";
import type { LayoutRect } from "../layoutUtils";

const viewport: LayoutRect = { x: 0, y: 0, width: 1000, height: 800 };

function leaf(id: string, depth = 1): MembraneNode {
  const rect: LayoutRect = { x: 0, y: 0, width: 100, height: 100 };
  return {
    id, name: id, rect, contentRect: rect,
    isDirectory: false, children: [], depth, weight: 1, isBarrel: false,
  };
}

function membrane(id: string, children: MembraneNode[], depth = 0): MembraneNode {
  const rect: LayoutRect = { x: 0, y: 0, width: 500, height: 400 };
  return {
    id, name: id, rect,
    contentRect: { x: 8, y: 32, width: 484, height: 360 },
    isDirectory: true, children, depth,
    weight: children.reduce((s, c) => s + c.weight, 0),
    isBarrel: false,
  };
}

function makeLayout(root: MembraneNode): MembraneLayout {
  const index = new Map<string, MembraneNode>();
  function walk(n: MembraneNode) {
    index.set(n.id, n);
    for (const c of n.children) walk(c);
  }
  walk(root);
  return { root, viewport, index };
}

describe("aggregateEdges", () => {
  // Graph:
  //   root/
  //     dirA/
  //       a1.ts
  //       a2.ts
  //     dirB/
  //       b1.ts
  //       b2.ts
  //     solo.ts
  const a1 = leaf("a1.ts", 2);
  const a2 = leaf("a2.ts", 2);
  const b1 = leaf("b1.ts", 2);
  const b2 = leaf("b2.ts", 2);
  const solo = leaf("solo.ts", 1);
  const dirA = membrane("dirA", [a1, a2], 1);
  const dirB = membrane("dirB", [b1, b2], 1);
  const root = membrane("root", [dirA, dirB, solo]);
  const layout = makeLayout(root);

  it("bundles N edges between two collapsed directories into 1 bundled edge with count", () => {
    const edges: Array<[string, string]> = [
      ["a1.ts", "b1.ts"],
      ["a2.ts", "b1.ts"],
      ["a2.ts", "b2.ts"],
    ];
    // Both dirA and dirB are collapsed
    const collapsed = new Set(["dirA", "dirB"]);
    const bundles = aggregateEdges(layout, edges, collapsed);

    // Should produce 1 bundle: dirA → dirB with count 3
    const ab = bundles.find(b => b.sourceMembrane === "dirA" && b.targetMembrane === "dirB");
    expect(ab).toBeDefined();
    expect(ab!.count).toBe(3);
  });

  it("separates inbound and outbound bundles", () => {
    const edges: Array<[string, string]> = [
      ["a1.ts", "b1.ts"], // A → B
      ["b2.ts", "a2.ts"], // B → A
    ];
    const collapsed = new Set(["dirA", "dirB"]);
    const bundles = aggregateEdges(layout, edges, collapsed);

    const ab = bundles.find(b => b.sourceMembrane === "dirA" && b.targetMembrane === "dirB");
    const ba = bundles.find(b => b.sourceMembrane === "dirB" && b.targetMembrane === "dirA");
    expect(ab).toBeDefined();
    expect(ab!.count).toBe(1);
    expect(ba).toBeDefined();
    expect(ba!.count).toBe(1);
  });

  it("does not bundle edges when both endpoints are in an expanded directory", () => {
    const edges: Array<[string, string]> = [
      ["a1.ts", "b1.ts"],
    ];
    // Both directories are expanded (not collapsed)
    const collapsed = new Set<string>();
    const bundles = aggregateEdges(layout, edges, collapsed);

    // No bundled edges — individual edges should pass through
    const bundled = bundles.filter(b => b.count > 0);
    expect(bundled).toHaveLength(0);
  });

  it("bundles when only source directory is collapsed", () => {
    const edges: Array<[string, string]> = [
      ["a1.ts", "b1.ts"],
      ["a2.ts", "b1.ts"],
    ];
    // Only dirA is collapsed, dirB is expanded
    const collapsed = new Set(["dirA"]);
    const bundles = aggregateEdges(layout, edges, collapsed);

    // Should bundle at the source level: dirA → b1.ts
    const bundle = bundles.find(b => b.sourceMembrane === "dirA" && b.targetMembrane === "b1.ts");
    expect(bundle).toBeDefined();
    expect(bundle!.count).toBe(2);
  });

  it("does not externally bundle self-contained edges within same membrane", () => {
    const edges: Array<[string, string]> = [
      ["a1.ts", "a2.ts"], // both inside dirA
    ];
    const collapsed = new Set(["dirA"]);
    const bundles = aggregateEdges(layout, edges, collapsed);

    // Internal edges: source and target resolve to the same membrane
    // These should not produce any external bundle
    const external = bundles.filter(b => b.sourceMembrane !== b.targetMembrane);
    expect(external).toHaveLength(0);
  });

  it("handles edges involving nodes outside any collapsed membrane", () => {
    const edges: Array<[string, string]> = [
      ["solo.ts", "a1.ts"],
    ];
    const collapsed = new Set(["dirA"]);
    const bundles = aggregateEdges(layout, edges, collapsed);

    // solo.ts is not in any collapsed membrane → its id is itself
    // a1.ts is in dirA → resolves to dirA
    const bundle = bundles.find(b => b.sourceMembrane === "solo.ts" && b.targetMembrane === "dirA");
    expect(bundle).toBeDefined();
    expect(bundle!.count).toBe(1);
  });
});

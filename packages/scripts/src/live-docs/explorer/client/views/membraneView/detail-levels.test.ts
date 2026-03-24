import { describe, expect, it } from "vitest";
import { resolveDetailLevels, DetailLevel } from "./detail-levels";
import type { MembraneNode, MembraneLayout } from "./types";
import type { LayoutRect } from "../layoutUtils";

const viewport: LayoutRect = { x: 0, y: 0, width: 1000, height: 800 };

/**
 * Helper: create a minimal MembraneNode leaf.
 */
function leaf(id: string, rect: LayoutRect, depth = 1): MembraneNode {
  return {
    id,
    name: id.split("/").pop()!,
    rect,
    contentRect: rect,
    isDirectory: false,
    children: [],
    depth,
    weight: 1,
    isBarrel: false,
  };
}

/**
 * Helper: create a membrane directory node.
 */
function membrane(
  id: string,
  rect: LayoutRect,
  children: MembraneNode[],
  depth = 0
): MembraneNode {
  return {
    id,
    name: id,
    rect,
    contentRect: { x: rect.x + 8, y: rect.y + 32, width: rect.width - 16, height: rect.height - 40 },
    isDirectory: true,
    children,
    depth,
    weight: children.reduce((s, c) => s + c.weight, 0),
    isBarrel: false,
  };
}

/**
 * Helper: build a MembraneLayout from a root node.
 */
function makeLayout(root: MembraneNode): MembraneLayout {
  const index = new Map<string, MembraneNode>();
  function walk(n: MembraneNode) {
    index.set(n.id, n);
    for (const c of n.children) walk(c);
  }
  walk(root);
  return { root, viewport, index };
}

/** Simple edge list: [source, target] pairs. */
type EdgeList = Array<[string, string]>;

describe("resolveDetailLevels", () => {
  // Build a small graph:
  //   root/
  //     a.ts  (focal)
  //     b.ts  (neighbor of a)
  //     sub/
  //       c.ts (neighbor of a)
  //       d.ts (distant)
  const a = leaf("a.ts", { x: 10, y: 40, width: 200, height: 150 });
  const b = leaf("b.ts", { x: 220, y: 40, width: 200, height: 150 });
  const c = leaf("c.ts", { x: 440, y: 72, width: 150, height: 100 });
  const d = leaf("d.ts", { x: 600, y: 72, width: 150, height: 100 }, 2);
  const sub = membrane("sub", { x: 430, y: 40, width: 330, height: 150 }, [c, d], 1);
  const root = membrane("root", { x: 0, y: 0, width: 1000, height: 800 }, [a, b, sub]);
  const layout = makeLayout(root);

  const edges: EdgeList = [
    ["a.ts", "b.ts"],
    ["a.ts", "c.ts"],
  ];

  describe("single focal node", () => {
    it("gives the focal node 'full' detail", () => {
      const levels = resolveDetailLevels(layout, edges, { focal: "a.ts" });
      expect(levels.get("a.ts")).toBe(DetailLevel.Full);
    });

    it("gives direct neighbors 'summary' detail", () => {
      const levels = resolveDetailLevels(layout, edges, { focal: "a.ts" });
      expect(levels.get("b.ts")).toBe(DetailLevel.Summary);
      expect(levels.get("c.ts")).toBe(DetailLevel.Summary);
    });

    it("gives distant nodes 'badge' detail", () => {
      const levels = resolveDetailLevels(layout, edges, { focal: "a.ts" });
      expect(levels.get("d.ts")).toBe(DetailLevel.Badge);
    });

    it("gives directory membranes 'badge' detail", () => {
      const levels = resolveDetailLevels(layout, edges, { focal: "a.ts" });
      expect(levels.get("sub")).toBe(DetailLevel.Badge);
      expect(levels.get("root")).toBe(DetailLevel.Badge);
    });
  });

  describe("dual focal nodes (compare mode)", () => {
    const dualEdges: EdgeList = [
      ["a.ts", "b.ts"],
      ["b.ts", "c.ts"],
    ];

    it("gives both focal nodes 'full' detail", () => {
      const levels = resolveDetailLevels(layout, dualEdges, { focal: "a.ts", secondary: "b.ts" });
      expect(levels.get("a.ts")).toBe(DetailLevel.Full);
      expect(levels.get("b.ts")).toBe(DetailLevel.Full);
    });

    it("gives neighbors of either focal node 'summary' detail", () => {
      const levels = resolveDetailLevels(layout, dualEdges, { focal: "a.ts", secondary: "b.ts" });
      expect(levels.get("c.ts")).toBe(DetailLevel.Summary);
    });
  });

  describe("no focal node (browse mode)", () => {
    it("gives all nodes 'badge' detail", () => {
      const levels = resolveDetailLevels(layout, edges, {});
      for (const [, level] of levels) {
        expect(level).toBe(DetailLevel.Badge);
      }
    });
  });

  describe("viewport culling", () => {
    it("marks off-screen nodes as 'hidden'", () => {
      // Place d.ts far off-screen
      const offScreenD = leaf("d.ts", { x: 5000, y: 5000, width: 100, height: 100 }, 2);
      const sub2 = membrane("sub", { x: 430, y: 40, width: 330, height: 150 }, [c, offScreenD], 1);
      const root2 = membrane("root", { x: 0, y: 0, width: 1000, height: 800 }, [a, b, sub2]);
      const layout2 = makeLayout(root2);

      const customViewport: LayoutRect = { x: 0, y: 0, width: 1000, height: 800 };
      const levels = resolveDetailLevels(layout2, edges, { focal: "a.ts" }, customViewport);
      expect(levels.get("d.ts")).toBe(DetailLevel.Hidden);
    });
  });
});

import { describe, expect, it } from "vitest";
import { computeMembraneLayout } from "./layout";
import type { MembraneNode } from "./types";
import { DEFAULT_MEMBRANE_CONFIG } from "./types";
import type { LayoutRect } from "../layoutUtils";
import type { DirectoryNode } from "../../types";

const viewport: LayoutRect = { x: 0, y: 0, width: 1000, height: 800 };

/**
 * Helper: create a DirectoryNode tree.
 */
function dir(
  name: string,
  path: string,
  children: DirectoryNode[] = [],
  fileCount = 0
): DirectoryNode {
  const childMap = new Map<string, DirectoryNode>();
  for (const c of children) {
    childMap.set(c.name, c);
  }
  // Create fake ExplorerNodePayload stubs for the file count
  const nodes = Array.from({ length: fileCount }, (_, i) => ({
    id: `${path}/${name}-file-${i}.ts`,
    name: `${name}-file-${i}.ts`,
    codePath: `${path}/${name}-file-${i}.ts`,
    codeRelativePath: `${path}/${name}-file-${i}.ts`,
    docPath: "",
    docRelativePath: `${path}/${name}-file-${i}.ts`,
    archetype: "implementation",
    dependencies: [],
    dependents: [],
    missingDependencies: [],
    publicSymbols: [],
    symbolDocumentation: undefined,
  }));
  return { name, path, children: childMap, nodes };
}

/**
 * Recursively collect all membrane nodes into a flat list.
 */
function flattenNodes(node: MembraneNode): MembraneNode[] {
  return [node, ...node.children.flatMap(flattenNodes)];
}

/**
 * Assert that `inner` is fully contained within `outer`.
 */
function assertContainedIn(inner: LayoutRect, outer: LayoutRect, label = "") {
  const prefix = label ? `[${label}] ` : "";
  expect(inner.x, `${prefix}x >= outer.x`).toBeGreaterThanOrEqual(outer.x - 0.01);
  expect(inner.y, `${prefix}y >= outer.y`).toBeGreaterThanOrEqual(outer.y - 0.01);
  expect(
    inner.x + inner.width,
    `${prefix}x+w <= outer.x+w`
  ).toBeLessThanOrEqual(outer.x + outer.width + 0.01);
  expect(
    inner.y + inner.height,
    `${prefix}y+h <= outer.y+h`
  ).toBeLessThanOrEqual(outer.y + outer.height + 0.01);
}

/**
 * Assert that two rectangles do not overlap (allowing epsilon for float imprecision).
 */
function assertNoOverlap(a: LayoutRect, b: LayoutRect, labelA = "A", labelB = "B") {
  const eps = 0.01;
  const separatedX = a.x + a.width <= b.x + eps || b.x + b.width <= a.x + eps;
  const separatedY = a.y + a.height <= b.y + eps || b.y + b.height <= a.y + eps;
  expect(
    separatedX || separatedY,
    `${labelA} and ${labelB} should not overlap`
  ).toBe(true);
}

describe("computeMembraneLayout", () => {
  describe("basic structure", () => {
    it("produces a root node for a single-file tree", () => {
      const root = dir("root", "__root__", [], 1);
      const layout = computeMembraneLayout(root, viewport);

      expect(layout.root.isDirectory).toBe(true);
      expect(layout.root.children).toHaveLength(1);
      expect(layout.root.children[0].isDirectory).toBe(false);
    });

    it("produces nested membranes for subdirectories", () => {
      const root = dir("root", "__root__", [
        dir("src", "src", [
          dir("utils", "src/utils", [], 3),
        ], 2),
      ]);
      const layout = computeMembraneLayout(root, viewport);

      // root → src → utils
      expect(layout.root.children).toHaveLength(1);
      const src = layout.root.children[0];
      expect(src.name).toBe("src");
      expect(src.isDirectory).toBe(true);

      // src has child directory "utils" + 2 files
      const utilsChild = src.children.find(c => c.name === "utils");
      expect(utilsChild).toBeDefined();
      expect(utilsChild!.isDirectory).toBe(true);
    });

    it("returns an empty root for an empty tree", () => {
      const root = dir("root", "__root__");
      const layout = computeMembraneLayout(root, viewport);
      expect(layout.root.children).toHaveLength(0);
      expect(layout.root.weight).toBe(0);
    });
  });

  describe("containment", () => {
    it("all children are fully contained within their parent membrane", () => {
      const root = dir("root", "__root__", [
        dir("a", "a", [], 5),
        dir("b", "b", [
          dir("b1", "b/b1", [], 3),
          dir("b2", "b/b2", [], 2),
        ], 1),
      ]);
      const layout = computeMembraneLayout(root, viewport);

      function checkContainment(parent: MembraneNode) {
        for (const child of parent.children) {
          assertContainedIn(child.rect, parent.contentRect, `${child.id} in ${parent.id}`);
          if (child.isDirectory) {
            checkContainment(child);
          }
        }
      }
      checkContainment(layout.root);
    });
  });

  describe("non-overlap", () => {
    it("sibling membranes do not overlap", () => {
      const root = dir("root", "__root__", [
        dir("a", "a", [], 4),
        dir("b", "b", [], 3),
        dir("c", "c", [], 2),
        dir("d", "d", [], 1),
      ]);
      const layout = computeMembraneLayout(root, viewport);

      const siblings = layout.root.children;
      for (let i = 0; i < siblings.length; i++) {
        for (let j = i + 1; j < siblings.length; j++) {
          assertNoOverlap(siblings[i].rect, siblings[j].rect, siblings[i].id, siblings[j].id);
        }
      }
    });

    it("sibling files within a directory do not overlap", () => {
      const root = dir("root", "__root__", [
        dir("src", "src", [], 6),
      ]);
      const layout = computeMembraneLayout(root, viewport);
      const src = layout.root.children[0];
      const files = src.children.filter(c => !c.isDirectory);

      for (let i = 0; i < files.length; i++) {
        for (let j = i + 1; j < files.length; j++) {
          assertNoOverlap(files[i].rect, files[j].rect, files[i].id, files[j].id);
        }
      }
    });
  });

  describe("coordinate stability", () => {
    it("adding a file to directory B does not move directory A's rectangle", () => {
      const rootBefore = dir("root", "__root__", [
        dir("a", "a", [], 4),
        dir("b", "b", [], 3),
      ]);
      const layoutBefore = computeMembraneLayout(rootBefore, viewport);

      const rootAfter = dir("root", "__root__", [
        dir("a", "a", [], 4),
        dir("b", "b", [], 4), // added a file to B
      ]);
      const layoutAfter = computeMembraneLayout(rootAfter, viewport);

      // Directory A's rectangle should not change (or change minimally)
      // because A's weight didn't change. The total weight changed though,
      // so A's proportional area decreased. We verify A's position is stable
      // (x, y don't shift) even if its dimensions shrink proportionally.
      const aBefore = layoutBefore.root.children.find(c => c.id === "a")!;
      const aAfter = layoutAfter.root.children.find(c => c.id === "a")!;

      // The squarify algorithm lays out in weight-descending order.
      // A has the highest weight in both cases, so it should be placed first
      // and its position should be at the same origin.
      expect(aAfter.rect.x).toBeCloseTo(aBefore.rect.x, 0);
      expect(aAfter.rect.y).toBeCloseTo(aBefore.rect.y, 0);
    });
  });

  describe("weight proportionality", () => {
    it("total area is proportional to weight", () => {
      const root = dir("root", "__root__", [
        dir("big", "big", [], 8),
        dir("small", "small", [], 2),
      ]);
      const layout = computeMembraneLayout(root, viewport);

      const big = layout.root.children.find(c => c.id === "big")!;
      const small = layout.root.children.find(c => c.id === "small")!;

      const bigArea = big.rect.width * big.rect.height;
      const smallArea = small.rect.width * small.rect.height;

      // big has 4x the weight, should have ~4x the area (within tolerance for padding)
      expect(bigArea / smallArea).toBeGreaterThan(2.5);
      expect(bigArea / smallArea).toBeLessThan(5.5);
    });
  });

  describe("index", () => {
    it("the flat index contains every node", () => {
      const root = dir("root", "__root__", [
        dir("a", "a", [], 2),
        dir("b", "b", [
          dir("b1", "b/b1", [], 1),
        ], 1),
      ]);
      const layout = computeMembraneLayout(root, viewport);

      const allNodes = flattenNodes(layout.root);
      expect(layout.index.size).toBe(allNodes.length);
      for (const node of allNodes) {
        expect(layout.index.get(node.id)).toBe(node);
      }
    });
  });

  describe("positive dimensions", () => {
    it("all nodes have positive width and height", () => {
      const root = dir("root", "__root__", [
        dir("a", "a", [], 5),
        dir("b", "b", [
          dir("c", "b/c", [], 3),
        ], 2),
      ]);
      const layout = computeMembraneLayout(root, viewport);

      const allNodes = flattenNodes(layout.root);
      for (const node of allNodes) {
        expect(node.rect.width, `${node.id} width > 0`).toBeGreaterThan(0);
        expect(node.rect.height, `${node.id} height > 0`).toBeGreaterThan(0);
      }
    });
  });

  describe("depth tracking", () => {
    it("assigns correct depth to each level", () => {
      const root = dir("root", "__root__", [
        dir("a", "a", [
          dir("b", "a/b", [
            dir("c", "a/b/c", [], 1),
          ]),
        ]),
      ]);
      const layout = computeMembraneLayout(root, viewport);

      expect(layout.root.depth).toBe(0);
      const a = layout.root.children[0];
      expect(a.depth).toBe(1);
      const b = a.children[0];
      expect(b.depth).toBe(2);
      const c = b.children[0];
      expect(c.depth).toBe(3);
    });
  });

  describe("mixed-content focus target", () => {
    it("excludes files from squarify when the focused directory has mixed content", () => {
      // Directory "mixed" has 2 subdirectories (50 files total) and 2 leaf files.
      // Without the fix, files get ~2/52 ≈ 4% of the area.
      // With the fix, files are excluded from squarify and get zero-area rects.
      const root = dir("root", "__root__", [
        dir("mixed", "mixed", [
          dir("big-a", "mixed/big-a", [], 30),
          dir("big-b", "mixed/big-b", [], 20),
        ], 2),
      ]);

      const focusPath = new Set(["mixed"]);
      const layout = computeMembraneLayout(root, viewport, undefined, focusPath);

      const mixed = layout.root.children[0];
      expect(mixed.id).toBe("mixed");
      expect(mixed.children).toHaveLength(4); // 2 dirs + 2 files

      const dirs = mixed.children.filter(c => c.isDirectory);
      const files = mixed.children.filter(c => !c.isDirectory);

      expect(dirs).toHaveLength(2);
      expect(files).toHaveLength(2);

      // File nodes should have zero-area rects (excluded from squarify)
      for (const f of files) {
        expect(f.rect.width).toBe(0);
        expect(f.rect.height).toBe(0);
      }

      // Directory nodes should have positive rects and fill the content area
      for (const d of dirs) {
        expect(d.rect.width).toBeGreaterThan(0);
        expect(d.rect.height).toBeGreaterThan(0);
      }

      // Directories should collectively fill most of the content area
      const totalDirArea = dirs.reduce((sum, d) => sum + d.rect.width * d.rect.height, 0);
      const contentArea = mixed.contentRect.width * mixed.contentRect.height;
      expect(totalDirArea / contentArea).toBeGreaterThan(0.95);
    });

    it("does not affect layout when the directory is not the focus target", () => {
      // Same tree but without focusPath — files get normal squarified rects
      const root = dir("root", "__root__", [
        dir("mixed", "mixed", [
          dir("big-a", "mixed/big-a", [], 30),
          dir("big-b", "mixed/big-b", [], 20),
        ], 2),
      ]);

      const layout = computeMembraneLayout(root, viewport);

      const mixed = layout.root.children[0];
      const files = mixed.children.filter(c => !c.isDirectory);

      // Without focus, files get normal (small but positive) rects
      for (const f of files) {
        expect(f.rect.width).toBeGreaterThan(0);
        expect(f.rect.height).toBeGreaterThan(0);
      }
    });

    it("does not affect pure-file leaf directories", () => {
      // Directory with only files (no subdirectories) — no mixed-content logic
      const root = dir("root", "__root__", [
        dir("leaf", "leaf", [], 5),
      ]);

      const focusPath = new Set(["leaf"]);
      const layout = computeMembraneLayout(root, viewport, undefined, focusPath);

      const leaf = layout.root.children[0];
      const files = leaf.children.filter(c => !c.isDirectory);

      // All files should have positive rects (normal squarified layout)
      for (const f of files) {
        expect(f.rect.width).toBeGreaterThan(0);
        expect(f.rect.height).toBeGreaterThan(0);
      }
    });
  });
});

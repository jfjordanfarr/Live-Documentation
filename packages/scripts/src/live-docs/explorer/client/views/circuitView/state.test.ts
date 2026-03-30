import { describe, expect, it } from "vitest";
import {
  createInitialState,
  expandDirectory,
  collapseDirectory,
  collapseToDepth,
  collapseAll,
  hasExpandedDirectories,
  buildBreadcrumbs,
  findContainingDirectory,
  type CircuitBoardState
} from "./state";
import type { ExplorerNodePayload } from "../../../shared/types";

function createNode(id: string, docRelativePath: string): ExplorerNodePayload {
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
    symbolDocumentation: undefined
  };
}

describe("CircuitBoardState", () => {
  describe("createInitialState", () => {
    it("starts with no expanded directories", () => {
      const state = createInitialState();
      expect(state.expandedDirectories.size).toBe(0);
    });

    it("returns fresh instances each time", () => {
      const a = createInitialState();
      const b = createInitialState();
      expect(a).not.toBe(b);
      expect(a.expandedDirectories).not.toBe(b.expandedDirectories);
    });
  });

  describe("expandDirectory", () => {
    it("adds a directory to the expanded set", () => {
      const state = expandDirectory(createInitialState(), "packages/shared");
      expect(state.expandedDirectories.has("packages/shared")).toBe(true);
      expect(state.expandedDirectories.size).toBe(1);
    });

    it("is idempotent — expanding again returns same state", () => {
      const s1 = expandDirectory(createInitialState(), "src");
      const s2 = expandDirectory(s1, "src");
      expect(s2).toBe(s1);
    });

    it("allows expanding multiple directories", () => {
      let state = createInitialState();
      state = expandDirectory(state, "packages/shared");
      state = expandDirectory(state, "packages/scripts");
      expect(state.expandedDirectories.size).toBe(2);
      expect(state.expandedDirectories.has("packages/shared")).toBe(true);
      expect(state.expandedDirectories.has("packages/scripts")).toBe(true);
    });
  });

  describe("collapseDirectory", () => {
    it("removes a directory from the expanded set", () => {
      let state = expandDirectory(createInitialState(), "packages/shared");
      state = collapseDirectory(state, "packages/shared");
      expect(state.expandedDirectories.size).toBe(0);
    });

    it("is idempotent — collapsing non-expanded returns same state", () => {
      const state = createInitialState();
      const result = collapseDirectory(state, "packages/shared");
      expect(result).toBe(state);
    });

    it("does not affect other expanded directories", () => {
      let state = createInitialState();
      state = expandDirectory(state, "a");
      state = expandDirectory(state, "b");
      state = collapseDirectory(state, "a");
      expect(state.expandedDirectories.has("a")).toBe(false);
      expect(state.expandedDirectories.has("b")).toBe(true);
    });
  });

  describe("collapseToDepth", () => {
    it("keeps only directories in the keepPaths set", () => {
      let state = createInitialState();
      state = expandDirectory(state, "a");
      state = expandDirectory(state, "a/b");
      state = expandDirectory(state, "a/b/c");
      const keep = new Set(["a"]);
      const result = collapseToDepth(state, keep);
      expect(result.expandedDirectories.size).toBe(1);
      expect(result.expandedDirectories.has("a")).toBe(true);
    });

    it("returns same state if nothing to collapse", () => {
      let state = createInitialState();
      state = expandDirectory(state, "a");
      const keep = new Set(["a"]);
      const result = collapseToDepth(state, keep);
      expect(result).toBe(state);
    });
  });

  describe("collapseAll", () => {
    it("removes all expanded directories", () => {
      let state = createInitialState();
      state = expandDirectory(state, "a");
      state = expandDirectory(state, "b");
      const result = collapseAll(state);
      expect(result.expandedDirectories.size).toBe(0);
    });

    it("returns same state if already collapsed", () => {
      const state = createInitialState();
      expect(collapseAll(state)).toBe(state);
    });
  });

  describe("hasExpandedDirectories", () => {
    it("returns false for initial state", () => {
      expect(hasExpandedDirectories(createInitialState())).toBe(false);
    });

    it("returns true when directories are expanded", () => {
      const state = expandDirectory(createInitialState(), "src");
      expect(hasExpandedDirectories(state)).toBe(true);
    });
  });
});

describe("buildBreadcrumbs", () => {
  it("returns only root for __root__", () => {
    const crumbs = buildBreadcrumbs("__root__");
    expect(crumbs).toEqual([{ label: "Root", path: "__root__" }]);
  });

  it("returns only root for empty string", () => {
    const crumbs = buildBreadcrumbs("");
    expect(crumbs).toEqual([{ label: "Root", path: "__root__" }]);
  });

  it("builds crumbs for a nested path", () => {
    const crumbs = buildBreadcrumbs("packages/shared/src");
    expect(crumbs).toEqual([
      { label: "Root", path: "__root__" },
      { label: "packages", path: "packages" },
      { label: "shared", path: "packages/shared" },
      { label: "src", path: "packages/shared/src" }
    ]);
  });

  it("handles single-segment paths", () => {
    const crumbs = buildBreadcrumbs("src");
    expect(crumbs).toEqual([
      { label: "Root", path: "__root__" },
      { label: "src", path: "src" }
    ]);
  });
});

describe("findContainingDirectory", () => {
  it("returns __root__ for root-level files", () => {
    const node = createNode("file.ts", "file.ts");
    expect(findContainingDirectory(node)).toBe("__root__");
  });

  it("returns parent directory for nested files", () => {
    const node = createNode("packages/shared/src/file.ts", "packages/shared/src/file.ts");
    expect(findContainingDirectory(node)).toBe("packages/shared/src");
  });

  it("returns __root__ for empty id", () => {
    const node = createNode("", "");
    expect(findContainingDirectory(node)).toBe("__root__");
  });
});

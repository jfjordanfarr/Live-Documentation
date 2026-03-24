import { describe, expect, it } from "vitest";
import {
  EMPTY_PIN_SET,
  addPin,
  removePin,
  togglePin,
  removePinsForNode,
  clearPins,
  setPinsFromPath,
  getPinnedNodeIds,
  isSymbolPinned,
  hasActivePath,
  getPathEntries,
  getVisibleConnections,
  serializePins,
  deserializePins,
  getRequiredExpansions,
} from "./pin-state";
import type { PinSet } from "./pin-state";
import type { ExplorerLinkPayload } from "../../../shared/types";
import { hopLabel } from "./focal-overlay";

// ─── Helpers ───────────────────────────────────────────────────────

function link(
  source: string,
  target: string,
  sourceSymbol?: string,
  targetSymbol?: string
): ExplorerLinkPayload {
  return {
    source,
    target,
    kind: "dependency",
    sourceSymbol,
    targetSymbol,
  };
}

// ─── Pin Manipulation ──────────────────────────────────────────────

describe("pin manipulation", () => {
  it("starts with an empty pin set", () => {
    expect(EMPTY_PIN_SET.entries).toHaveLength(0);
  });

  it("addPin adds a new entry", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    expect(set.entries).toHaveLength(1);
    expect(set.entries[0]).toEqual({ nodeId: "a.ts", symbol: "fnA", hopIndex: undefined });
  });

  it("addPin is idempotent for the same (nodeId, symbol)", () => {
    const set1 = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    const set2 = addPin(set1, "a.ts", "fnA");
    expect(set2).toBe(set1); // reference equality — no change
  });

  it("addPin allows different symbols on the same node", () => {
    let set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    set = addPin(set, "a.ts", "fnB");
    expect(set.entries).toHaveLength(2);
  });

  it("addPin allows same symbol on different nodes", () => {
    let set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    set = addPin(set, "b.ts", "fnA");
    expect(set.entries).toHaveLength(2);
  });

  it("addPin preserves hopIndex when provided", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA", 3);
    expect(set.entries[0].hopIndex).toBe(3);
  });

  it("removePin removes by exact (nodeId, symbol) match", () => {
    let set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    set = addPin(set, "a.ts", "fnB");
    set = removePin(set, "a.ts", "fnA");
    expect(set.entries).toHaveLength(1);
    expect(set.entries[0].symbol).toBe("fnB");
  });

  it("removePin returns same set if not found", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    const result = removePin(set, "a.ts", "noSuchSymbol");
    expect(result).toBe(set);
  });

  it("togglePin adds when absent, removes when present", () => {
    const set1 = togglePin(EMPTY_PIN_SET, "a.ts", "fnA");
    expect(set1.entries).toHaveLength(1);
    const set2 = togglePin(set1, "a.ts", "fnA");
    expect(set2.entries).toHaveLength(0);
  });

  it("removePinsForNode removes all pins on one node, keeps others", () => {
    let set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    set = addPin(set, "a.ts", "fnB");
    set = addPin(set, "b.ts", "fnC");
    set = removePinsForNode(set, "a.ts");
    expect(set.entries).toHaveLength(1);
    expect(set.entries[0].nodeId).toBe("b.ts");
  });

  it("removePinsForNode returns same set if no pins match", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    const result = removePinsForNode(set, "noSuchNode");
    expect(result).toBe(set);
  });

  it("clearPins returns the empty set", () => {
    expect(clearPins()).toBe(EMPTY_PIN_SET);
  });
});

// ─── Path Population ───────────────────────────────────────────────

describe("setPinsFromPath (BFS population strategy)", () => {
  it("creates ordered pins with hop indices", () => {
    const set = setPinsFromPath([
      { nodeId: "a.ts", symbol: "fnA" },
      { nodeId: "b.ts", symbol: "fnB" },
      { nodeId: "c.ts", symbol: "fnC" },
    ]);
    expect(set.entries).toHaveLength(3);
    expect(set.entries[0]).toEqual({ nodeId: "a.ts", symbol: "fnA", hopIndex: 0 });
    expect(set.entries[1]).toEqual({ nodeId: "b.ts", symbol: "fnB", hopIndex: 1 });
    expect(set.entries[2]).toEqual({ nodeId: "c.ts", symbol: "fnC", hopIndex: 2 });
  });

  it("produces a set where hasActivePath returns true", () => {
    const set = setPinsFromPath([
      { nodeId: "a.ts", symbol: "fnA" },
      { nodeId: "b.ts", symbol: "fnB" },
    ]);
    expect(hasActivePath(set)).toBe(true);
  });

  it("empty path produces empty set", () => {
    const set = setPinsFromPath([]);
    expect(set.entries).toHaveLength(0);
    expect(hasActivePath(set)).toBe(false);
  });
});

// ─── Queries ───────────────────────────────────────────────────────

describe("queries", () => {
  it("getPinnedNodeIds returns distinct node IDs", () => {
    let set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    set = addPin(set, "a.ts", "fnB");
    set = addPin(set, "b.ts", "fnC");
    const ids = getPinnedNodeIds(set);
    expect(ids.size).toBe(2);
    expect(ids.has("a.ts")).toBe(true);
    expect(ids.has("b.ts")).toBe(true);
  });

  it("isSymbolPinned checks exact match", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    expect(isSymbolPinned(set, "a.ts", "fnA")).toBe(true);
    expect(isSymbolPinned(set, "a.ts", "fnB")).toBe(false);
    expect(isSymbolPinned(set, "b.ts", "fnA")).toBe(false);
  });

  it("hasActivePath is false for manually pinned symbols", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    expect(hasActivePath(set)).toBe(false);
  });

  it("getPathEntries returns hop-ordered entries only", () => {
    let set = setPinsFromPath([
      { nodeId: "c.ts", symbol: "fnC" },
      { nodeId: "a.ts", symbol: "fnA" },
    ]);
    // Add a manual pin (no hopIndex) — should not appear in path entries
    set = addPin(set, "d.ts", "fnD");
    const path = getPathEntries(set);
    expect(path).toHaveLength(2);
    expect(path[0].nodeId).toBe("c.ts");
    expect(path[1].nodeId).toBe("a.ts");
  });
});

// ─── Connection Visibility ─────────────────────────────────────────

describe("getVisibleConnections", () => {
  const links: ExplorerLinkPayload[] = [
    link("a.ts", "b.ts", "fnA", "fnB"),
    link("a.ts", "c.ts", "fnA", "fnC"),
    link("b.ts", "c.ts", "fnB", "fnC"),
    link("c.ts", "a.ts", "fnC", "fnA"), // cycle
  ];

  it("returns empty for empty pin set", () => {
    expect(getVisibleConnections(EMPTY_PIN_SET, links)).toHaveLength(0);
  });

  it("pinning fnA on a.ts reveals connections where a.ts:fnA is sourceSymbol", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    const visible = getVisibleConnections(set, links);
    // a→b (sourceSymbol=fnA), a→c (sourceSymbol=fnA), c→a (targetSymbol=fnA)
    expect(visible).toHaveLength(3);
    const sourceIds = visible.map(v => {
      const s = v.link.source;
      return typeof s === "string" ? s : s.id;
    });
    expect(sourceIds).toContain("a.ts");
    expect(sourceIds).toContain("c.ts");
  });

  it("pinning fnB on b.ts reveals the a→b and b→c edges", () => {
    const set = addPin(EMPTY_PIN_SET, "b.ts", "fnB");
    const visible = getVisibleConnections(set, links);
    // a→b (targetSymbol=fnB), b→c (sourceSymbol=fnB)
    expect(visible).toHaveLength(2);
  });

  it("pinning all symbols on one node ≡ its full neighborhood", () => {
    // Use wildcard pin to see ALL connections
    const set = addPin(EMPTY_PIN_SET, "a.ts", "*");
    const visible = getVisibleConnections(set, links);
    // a→b, a→c (source=a), c→a (target=a) = 3 connections
    expect(visible).toHaveLength(3);
  });

  it("multi-focal: pinning on two nodes shows union of connections", () => {
    let set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    set = addPin(set, "b.ts", "fnB");
    const visible = getVisibleConnections(set, links);
    // a.ts:fnA → a→b (source), a→c (source), c→a (target) = 3
    // b.ts:fnB → a→b (target), b→c (source) = 2
    // a→b is caused by BOTH pins, but appears once with both causes
    // Total unique links: a→b, a→c, b→c, c→a = 4
    expect(visible).toHaveLength(4);
    // a→b should have both pins as causes
    const abConn = visible.find(v => {
      const s = typeof v.link.source === "string" ? v.link.source : v.link.source.id;
      const t = typeof v.link.target === "string" ? v.link.target : v.link.target.id;
      return s === "a.ts" && t === "b.ts";
    });
    expect(abConn).toBeDefined();
    expect(abConn!.causedBy.length).toBe(2);
  });

  it("connections without matching symbols are not visible", () => {
    // Pin a symbol that doesn't appear on any edge
    const set = addPin(EMPTY_PIN_SET, "a.ts", "noSuchSymbol");
    const visible = getVisibleConnections(set, links);
    expect(visible).toHaveLength(0);
  });

  it("links without sourceSymbol/targetSymbol are only visible to wildcard pins", () => {
    const bareLinks: ExplorerLinkPayload[] = [
      link("a.ts", "b.ts"),  // no sourceSymbol or targetSymbol
    ];
    // Specific symbol pin should NOT match a bare link
    const specificSet = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    expect(getVisibleConnections(specificSet, bareLinks)).toHaveLength(0);

    // Wildcard pin SHOULD match
    const wildcardSet = addPin(EMPTY_PIN_SET, "a.ts", "*");
    expect(getVisibleConnections(wildcardSet, bareLinks)).toHaveLength(1);
  });

  it("a link matching both source and target pins appears exactly once", () => {
    const singleLink: ExplorerLinkPayload[] = [
      link("a.ts", "b.ts", "fnA", "fnB"),
    ];
    let set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    set = addPin(set, "b.ts", "fnB");
    const visible = getVisibleConnections(set, singleLink);
    // Should appear exactly once, not duplicated
    expect(visible).toHaveLength(1);
    // But causedBy should contain both pins
    expect(visible[0].causedBy.length).toBe(2);
  });

  it("handles links with object-style source/target", () => {
    const objLinks: ExplorerLinkPayload[] = [
      { source: { id: "a.ts" }, target: { id: "b.ts" }, kind: "dependency", sourceSymbol: "fnA", targetSymbol: "fnB" },
    ];
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    const visible = getVisibleConnections(set, objLinks);
    expect(visible).toHaveLength(1);
  });
});

// ─── Serialization ─────────────────────────────────────────────────

describe("serialization roundtrip", () => {
  it("roundtrips manually pinned symbols", () => {
    let set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    set = addPin(set, "b.ts", "fnB");
    const serialized = serializePins(set);
    const deserialized = deserializePins(serialized);
    expect(deserialized.entries).toEqual(set.entries);
  });

  it("roundtrips path pins with hop indices", () => {
    const set = setPinsFromPath([
      { nodeId: "a.ts", symbol: "fnA" },
      { nodeId: "b.ts", symbol: "fnB" },
    ]);
    const serialized = serializePins(set);
    expect(serialized[0].h).toBe(0);
    expect(serialized[1].h).toBe(1);
    const deserialized = deserializePins(serialized);
    expect(deserialized.entries).toEqual(set.entries);
  });

  it("omits hop index from serialization when undefined", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    const serialized = serializePins(set);
    expect(serialized[0]).not.toHaveProperty("h");
  });
});

// ─── Continuous Spectrum Assertions ────────────────────────────────

describe("continuous spectrum", () => {
  it("0 pins = Browse state", () => {
    expect(EMPTY_PIN_SET.entries).toHaveLength(0);
    expect(getPinnedNodeIds(EMPTY_PIN_SET).size).toBe(0);
    expect(hasActivePath(EMPTY_PIN_SET)).toBe(false);
  });

  it("1 pin = Partial Pins state (connections for one symbol)", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    expect(set.entries).toHaveLength(1);
    expect(getPinnedNodeIds(set).size).toBe(1);
    expect(hasActivePath(set)).toBe(false);
  });

  it("all symbols on one node ≡ full Local Map neighborhood", () => {
    const set = addPin(EMPTY_PIN_SET, "a.ts", "*");
    expect(getPinnedNodeIds(set).size).toBe(1);
    // Wildcard pin reveals all connections for the node
    const links: ExplorerLinkPayload[] = [
      link("a.ts", "b.ts", "fnA", "fnB"),
      link("c.ts", "a.ts", "fnC", "fnA"),
    ];
    const visible = getVisibleConnections(set, links);
    expect(visible).toHaveLength(2);
  });

  it("pins on 2+ nodes = Multi-focal / Compare", () => {
    let set = addPin(EMPTY_PIN_SET, "a.ts", "fnA");
    set = addPin(set, "b.ts", "fnB");
    expect(getPinnedNodeIds(set).size).toBe(2);
  });

  it("path population = Path state", () => {
    const set = setPinsFromPath([
      { nodeId: "a.ts", symbol: "fnA" },
      { nodeId: "b.ts", symbol: "fnB" },
      { nodeId: "c.ts", symbol: "fnC" },
    ]);
    expect(hasActivePath(set)).toBe(true);
    expect(getPathEntries(set)).toHaveLength(3);
    expect(getPinnedNodeIds(set).size).toBe(3);
  });
});

// ─── Auto-Expansion ────────────────────────────────────────────────

describe("getRequiredExpansions", () => {
  it("returns empty set for empty pins", () => {
    expect(getRequiredExpansions(EMPTY_PIN_SET).size).toBe(0);
  });

  it("returns empty set for root-level file (no directory ancestors)", () => {
    const set = addPin(EMPTY_PIN_SET, "README.md", "title");
    expect(getRequiredExpansions(set).size).toBe(0);
  });

  it("computes ancestor directories for a deeply nested file", () => {
    const set = addPin(EMPTY_PIN_SET, "packages/shared/src/types.ts", "MyType");
    const dirs = getRequiredExpansions(set);
    expect(dirs.size).toBe(3);
    expect(dirs.has("packages")).toBe(true);
    expect(dirs.has("packages/shared")).toBe(true);
    expect(dirs.has("packages/shared/src")).toBe(true);
    // Should NOT include the file itself
    expect(dirs.has("packages/shared/src/types.ts")).toBe(false);
  });

  it("deduplicates ancestors shared by multiple pinned nodes", () => {
    let set = addPin(EMPTY_PIN_SET, "packages/shared/src/a.ts", "fnA");
    set = addPin(set, "packages/shared/src/b.ts", "fnB");
    const dirs = getRequiredExpansions(set);
    // Both share packages, packages/shared, packages/shared/src
    expect(dirs.size).toBe(3);
  });

  it("unions ancestors from different subtrees", () => {
    let set = addPin(EMPTY_PIN_SET, "packages/server/src/index.ts", "main");
    set = addPin(set, "packages/shared/src/types.ts", "MyType");
    const dirs = getRequiredExpansions(set);
    // packages, packages/server, packages/server/src,
    // packages/shared, packages/shared/src = 5 unique dirs
    expect(dirs.size).toBe(5);
    expect(dirs.has("packages")).toBe(true);
    expect(dirs.has("packages/server")).toBe(true);
    expect(dirs.has("packages/server/src")).toBe(true);
    expect(dirs.has("packages/shared")).toBe(true);
    expect(dirs.has("packages/shared/src")).toBe(true);
  });

  it("handles path-populated pins identically to manual pins", () => {
    const set = setPinsFromPath([
      { nodeId: "src/a/x.ts", symbol: "fnX" },
      { nodeId: "src/b/y.ts", symbol: "fnY" },
    ]);
    const dirs = getRequiredExpansions(set);
    // src, src/a, src/b = 3 unique dirs
    expect(dirs.size).toBe(3);
    expect(dirs.has("src")).toBe(true);
    expect(dirs.has("src/a")).toBe(true);
    expect(dirs.has("src/b")).toBe(true);
  });
});

// ─── Hop Labels ────────────────────────────────────────────────────

describe("hopLabel", () => {
  it("returns circled numbers for indices 0-19", () => {
    expect(hopLabel(0)).toBe("①");
    expect(hopLabel(1)).toBe("②");
    expect(hopLabel(9)).toBe("⑩");
    expect(hopLabel(19)).toBe("⑳");
  });

  it("falls back to parenthesized number for indices >= 20", () => {
    expect(hopLabel(20)).toBe("(21)");
    expect(hopLabel(99)).toBe("(100)");
  });

  it("returns distinct labels for consecutive indices", () => {
    const labels = Array.from({ length: 25 }, (_, i) => hopLabel(i));
    const unique = new Set(labels);
    expect(unique.size).toBe(25);
  });
});

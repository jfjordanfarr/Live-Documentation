import { describe, expect, it } from "vitest";
import {
  snapshotToPayload,
  payloadToSnapshot,
  compressSnapshot,
  decompressSnapshot,
  DEFAULT_SNAPSHOT,
} from "./compressed-url-state";
import type { UrlStateSnapshot, CompressedPayload } from "./compressed-url-state";
import { EMPTY_PIN_SET } from "../views/membraneView/pin-state";
import type { PinSet } from "../views/membraneView/pin-state";

// ─── snapshotToPayload ─────────────────────────────────────────────

describe("snapshotToPayload", () => {
  it("omits all optional fields for default snapshot", () => {
    const payload = snapshotToPayload(DEFAULT_SNAPSHOT);
    expect(payload).toEqual({ v: 1 });
  });

  it("includes view when non-default", () => {
    const snap: UrlStateSnapshot = { ...DEFAULT_SNAPSHOT, view: "graph" };
    const payload = snapshotToPayload(snap);
    expect(payload.w).toBe("graph");
  });

  it("includes selected node when present", () => {
    const snap: UrlStateSnapshot = { ...DEFAULT_SNAPSHOT, selectedNodeId: "packages/shared/src/types.ts" };
    const payload = snapshotToPayload(snap);
    expect(payload.n).toBe("packages/shared/src/types.ts");
  });

  it("includes pins when non-empty", () => {
    const pinSet: PinSet = {
      entries: [
        { nodeId: "a.ts", symbol: "Foo" },
        { nodeId: "b.ts", symbol: "Bar", hopIndex: 2 },
      ],
    };
    const snap: UrlStateSnapshot = { ...DEFAULT_SNAPSHOT, pinSet };
    const payload = snapshotToPayload(snap);
    expect(payload.p).toEqual([
      { n: "a.ts", s: "Foo" },
      { n: "b.ts", s: "Bar", h: 2 },
    ]);
  });

  it("includes expanded directories when non-empty", () => {
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      expandedDirectories: new Set(["packages", "packages/shared"]),
    };
    const payload = snapshotToPayload(snap);
    expect(payload.e).toEqual(expect.arrayContaining(["packages", "packages/shared"]));
    expect(payload.e).toHaveLength(2);
  });

  it("includes expanded cards when non-empty", () => {
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      expandedCards: new Set(["packages/shared/src/types.ts", "packages/server/src/index.ts"]),
    };
    const payload = snapshotToPayload(snap);
    expect(payload.c).toEqual(expect.arrayContaining(["packages/shared/src/types.ts", "packages/server/src/index.ts"]));
    expect(payload.c).toHaveLength(2);
  });

  it("omits expanded cards when empty", () => {
    const payload = snapshotToPayload(DEFAULT_SNAPSHOT);
    expect(payload.c).toBeUndefined();
  });

  it("includes transform when non-default", () => {
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      transform: { x: 123.456, y: -78.9, k: 1.5 },
    };
    const payload = snapshotToPayload(snap);
    expect(payload.t).toEqual([123.46, -78.9, 1.5]);
  });

  it("rounds transform values to avoid float noise", () => {
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      transform: { x: 0.1 + 0.2, y: 0, k: 1 },
    };
    const payload = snapshotToPayload(snap);
    // 0.1 + 0.2 = 0.30000000000000004 → rounds to 0.3
    expect(payload.t![0]).toBe(0.3);
  });

  it("includes filters when non-default", () => {
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      filters: { showTests: false, showAssets: true },
    };
    const payload = snapshotToPayload(snap);
    expect(payload.f).toEqual([0, 1]);
  });

  it("does not include filters when both are true (default)", () => {
    const payload = snapshotToPayload(DEFAULT_SNAPSHOT);
    expect(payload.f).toBeUndefined();
  });
});

// ─── payloadToSnapshot ─────────────────────────────────────────────

describe("payloadToSnapshot", () => {
  it("returns defaults for minimal payload", () => {
    const snap = payloadToSnapshot({ v: 1 });
    expect(snap.view).toBe("membrane");
    expect(snap.selectedNodeId).toBeNull();
    expect(snap.pinSet).toEqual(EMPTY_PIN_SET);
    expect(snap.expandedDirectories.size).toBe(0);
    expect(snap.transform).toEqual({ x: 0, y: 0, k: 1 });
    expect(snap.filters).toEqual({ showTests: true, showAssets: true });
  });

  it("restores all fields from a full payload", () => {
    const payload: CompressedPayload = {
      v: 1,
      w: "graph",
      n: "foo.ts",
      p: [{ n: "a.ts", s: "X", h: 0 }],
      e: ["dir1", "dir2"],
      c: ["card1.ts", "card2.ts"],
      t: [10, 20, 2],
      f: [0, 1],
    };
    const snap = payloadToSnapshot(payload);
    expect(snap.view).toBe("graph");
    expect(snap.selectedNodeId).toBe("foo.ts");
    expect(snap.pinSet.entries).toHaveLength(1);
    expect(snap.pinSet.entries[0].nodeId).toBe("a.ts");
    expect(snap.pinSet.entries[0].hopIndex).toBe(0);
    expect(snap.expandedDirectories).toEqual(new Set(["dir1", "dir2"]));
    expect(snap.expandedCards).toEqual(new Set(["card1.ts", "card2.ts"]));
    expect(snap.transform).toEqual({ x: 10, y: 20, k: 2 });
    expect(snap.filters).toEqual({ showTests: false, showAssets: true });
  });

  it("returns defaults for invalid version", () => {
    const snap = payloadToSnapshot({ v: 0 } as CompressedPayload);
    expect(snap).toEqual(DEFAULT_SNAPSHOT);
  });

  it("returns defaults for negative version", () => {
    const snap = payloadToSnapshot({ v: -1 } as CompressedPayload);
    expect(snap).toEqual(DEFAULT_SNAPSHOT);
  });

  it("handles missing optional fields gracefully", () => {
    // A future v1 payload might have some fields omitted
    const payload: CompressedPayload = { v: 1, w: "sources" };
    const snap = payloadToSnapshot(payload);
    expect(snap.view).toBe("sources");
    expect(snap.pinSet).toEqual(EMPTY_PIN_SET);
    expect(snap.expandedDirectories.size).toBe(0);
    expect(snap.expandedCards.size).toBe(0);
  });
});

// ─── Round-trip (compress → decompress) ────────────────────────────

describe("compress/decompress round-trip", () => {
  it("round-trips the default snapshot", () => {
    const compressed = compressSnapshot(DEFAULT_SNAPSHOT);
    const restored = decompressSnapshot(compressed);
    expect(restored.view).toBe(DEFAULT_SNAPSHOT.view);
    expect(restored.selectedNodeId).toBe(DEFAULT_SNAPSHOT.selectedNodeId);
    expect(restored.pinSet).toEqual(DEFAULT_SNAPSHOT.pinSet);
    expect(restored.transform).toEqual(DEFAULT_SNAPSHOT.transform);
    expect(restored.filters).toEqual(DEFAULT_SNAPSHOT.filters);
  });

  it("round-trips a complex snapshot with pins, transform, and filters", () => {
    const original: UrlStateSnapshot = {
      view: "membrane",
      selectedNodeId: "packages/server/src/index.ts",
      pinSet: {
        entries: [
          { nodeId: "a.ts", symbol: "ClassA" },
          { nodeId: "b.ts", symbol: "fnB", hopIndex: 1 },
          { nodeId: "c.ts", symbol: "TypeC", hopIndex: 2 },
        ],
      },
      expandedDirectories: new Set(["packages", "packages/server", "packages/server/src"]),
      expandedCards: new Set(["packages/server/src/index.ts", "packages/server/src/main.ts"]),
      transform: { x: 150.5, y: -42.3, k: 1.75 },
      filters: { showTests: false, showAssets: false },
    };

    const compressed = compressSnapshot(original);
    const restored = decompressSnapshot(compressed);

    expect(restored.view).toBe(original.view);
    expect(restored.selectedNodeId).toBe(original.selectedNodeId);
    expect(restored.pinSet.entries).toHaveLength(3);
    expect(restored.pinSet.entries[1].hopIndex).toBe(1);
    expect(restored.expandedDirectories).toEqual(original.expandedDirectories);
    expect(restored.expandedCards).toEqual(original.expandedCards);
    expect(restored.transform.x).toBeCloseTo(150.5);
    expect(restored.transform.y).toBeCloseTo(-42.3);
    expect(restored.transform.k).toBeCloseTo(1.75);
    expect(restored.filters).toEqual({ showTests: false, showAssets: false });
  });

  it("produces a URL-safe string (no +, /, = characters)", () => {
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      selectedNodeId: "packages/shared/src/live-docs/adapters/typescript.ts",
      pinSet: {
        entries: [
          { nodeId: "packages/shared/src/live-docs/adapters/typescript.ts", symbol: "extractPublicSymbols" },
        ],
      },
    };
    const compressed = compressSnapshot(snap);
    // lz-string's compressToEncodedURIComponent should produce only URL-safe chars
    expect(compressed).not.toContain("+");
    expect(compressed).not.toContain("/");
    expect(compressed).not.toContain("=");
  });

  it("returns default snapshot for corrupted input", () => {
    const restored = decompressSnapshot("not-valid-compressed-data!!!");
    expect(restored).toEqual(DEFAULT_SNAPSHOT);
  });

  it("returns default snapshot for empty string", () => {
    const restored = decompressSnapshot("");
    expect(restored).toEqual(DEFAULT_SNAPSHOT);
  });
});

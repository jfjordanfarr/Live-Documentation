import { describe, expect, it } from "vitest";

import {
  snapshotToPayload,
  payloadToSnapshot,
  compressSnapshot,
  decompressSnapshot,
  scrubSnapshot,
  DEFAULT_SNAPSHOT,
} from "./compressed-url-state";
import type { UrlStateSnapshot, CompressedPayload } from "./compressed-url-state";
import { EMPTY_PIN_SET } from "../views/pin-state";
import type { PinSet } from "../views/pin-state";

// ─── snapshotToPayload ─────────────────────────────────────────────

describe("snapshotToPayload", () => {
  it("omits all optional fields for default snapshot", () => {
    const payload = snapshotToPayload(DEFAULT_SNAPSHOT);
    expect(payload).toEqual({ v: 3 });
  });

  it("includes view when non-default", () => {
    const snap: UrlStateSnapshot = { ...DEFAULT_SNAPSHOT, view: "world" };
    const payload = snapshotToPayload(snap);
    expect(payload.w).toBe("world");
  });

  it("includes selected node when present", () => {
    const snap: UrlStateSnapshot = { ...DEFAULT_SNAPSHOT, selectedNodeId: "packages/engine/src/types.ts" };
    const payload = snapshotToPayload(snap);
    expect(payload.n).toBe("packages/engine/src/types.ts");
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






  it("includes filters when non-default", () => {
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      filters: { showTests: false, showAssets: true },
    };
    const payload = snapshotToPayload(snap);
    expect(payload.f).toEqual([0, 1]);
  });

  it("leaves out the filters when they are the cold start's, tests shown and assets hidden, and writes them otherwise", () => {
    expect(DEFAULT_SNAPSHOT.filters).toEqual({ showTests: true, showAssets: false });
    expect(snapshotToPayload(DEFAULT_SNAPSHOT).f).toBeUndefined();
    expect(snapshotToPayload({ ...DEFAULT_SNAPSHOT, filters: { showTests: true, showAssets: true } }).f).toEqual([1, 1]);
  });
});

// ─── payloadToSnapshot ─────────────────────────────────────────────

describe("payloadToSnapshot", () => {
  it("returns defaults for minimal payload", () => {
    const snap = payloadToSnapshot({ v: 3 });
    expect(snap.view).toBe("map");
    expect(snap.selectedNodeId).toBeNull();
    expect(snap.pinSet).toEqual(EMPTY_PIN_SET);
    expect(snap.openDirectories.size).toBe(0);
    expect(snap.filters).toEqual({ showTests: true, showAssets: false });
  });

  it("reads an older link without filters as both shown, which is what it meant when it was written", () => {
    expect(payloadToSnapshot({ v: 1 }).filters).toEqual({ showTests: true, showAssets: true });
    expect(payloadToSnapshot({ v: 2 }).filters).toEqual({ showTests: true, showAssets: true });
    expect(payloadToSnapshot({ v: 2, f: [1, 0] }).filters).toEqual({ showTests: true, showAssets: false });
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
    expect(snap.view).toBe("map");
    expect(snap.perspective).toBe("3d");
    expect(snap.selectedNodeId).toBe("foo.ts");
    expect(snap.pinSet.entries).toHaveLength(1);
    expect(snap.pinSet.entries[0].nodeId).toBe("a.ts");
    expect(snap.pinSet.entries[0].hopIndex).toBe(0);
    expect(snap.openDirectories).toEqual(new Set());
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
    expect(snap.openDirectories.size).toBe(0);
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
    expect(restored.filters).toEqual(DEFAULT_SNAPSHOT.filters);
  });

  it("round-trips a complex snapshot with pins, a 3D perspective, directories and filters", () => {
    const original: UrlStateSnapshot = {
      view: "map",
      perspective: "3d",
      spatialLayout: "structure",
      selectedNodeId: "packages/server/src/index.ts",
      pinSet: {
        entries: [
          { nodeId: "a.ts", symbol: "ClassA" },
          { nodeId: "b.ts", symbol: "fnB", hopIndex: 1 },
          { nodeId: "c.ts", symbol: "TypeC", hopIndex: 2 },
        ],
      },
      openDirectories: new Set(["packages/server/src", "packages/client"]),
      filters: { showTests: false, showAssets: false },
      destination: { kind: "file", nodeId: "b.ts", symbol: "fnB" },
      reachFrom: { kind: "directory", directory: "packages/client" },
    };

    const compressed = compressSnapshot(original);
    const restored = decompressSnapshot(compressed);

    expect(restored.view).toBe(original.view);
    expect(restored.perspective).toBe("3d");
    expect(restored.spatialLayout).toBe("structure");
    expect(restored.selectedNodeId).toBe(original.selectedNodeId);
    expect(restored.destination).toEqual(original.destination);
    expect(restored.reachFrom).toEqual(original.reachFrom);
    expect([...restored.openDirectories].sort()).toEqual(["packages/client", "packages/server/src"]);
    expect(restored.pinSet.entries).toHaveLength(3);
    expect(restored.pinSet.entries[1].hopIndex).toBe(1);
    expect(restored.openDirectories).toEqual(original.openDirectories);
    expect(restored.filters).toEqual({ showTests: false, showAssets: false });
  });

  it("produces a string that survives the query string", () => {
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      selectedNodeId: "packages/engine/src/live-docs/adapters/typescript.ts",
      pinSet: {
        entries: [
          { nodeId: "packages/engine/src/live-docs/adapters/typescript.ts", symbol: "extractPublicSymbols" },
        ],
      },
    };
    const compressed = compressSnapshot(snap);
    // lz-string's URI alphabet is letters, digits, "+", "-" and "$"; a "+" reads back from a
    // query string as a space, which the decoder restores, so the round trip is what matters.
    expect(compressed).toMatch(/^[A-Za-z0-9+\-$]+$/u);
    const readBack = new URLSearchParams(`s=${compressed}`).get("s") ?? "";
    expect(decompressSnapshot(readBack).selectedNodeId).toBe(snap.selectedNodeId);
    expect(decompressSnapshot(readBack).pinSet).toEqual(snap.pinSet);
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

// ─── scrubSnapshot ─────────────────────────────────────────────────

describe("scrubSnapshot", () => {
  /** Minimal node-like map for look-ups. */
  function makeNodeMap(...ids: string[]): Map<string, unknown> {
    return new Map(ids.map(id => [id, {}]));
  }

  it("passes through a fully valid snapshot unchanged", () => {
    const nodesById = makeNodeMap("pkg/src/a.ts", "pkg/src/b.ts");
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      openDirectories: new Set(["pkg/src"]),
      selectedNodeId: "pkg/src/b.ts",
      pinSet: { entries: [{ nodeId: "pkg/src/a.ts", symbol: "Foo" }] },
    };
    const result = scrubSnapshot(snap, nodesById);
    expect([...result.openDirectories]).toEqual(["pkg/src"]);
    expect(result.selectedNodeId).toBe("pkg/src/b.ts");
    expect(result.pinSet.entries).toHaveLength(1);
  });

  it("drops stale expanded directories", () => {
    const nodesById = makeNodeMap("pkg/src/a.ts");
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      openDirectories: new Set(["pkg/src", "deleted/dir"]),
    };
    const result = scrubSnapshot(snap, nodesById);
    expect([...result.openDirectories]).toEqual(["pkg/src"]);
  });


  it("drops all-stale pins (falls to empty pinSet)", () => {
    const nodesById = makeNodeMap("pkg/src/a.ts");
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      pinSet: {
        entries: [
          { nodeId: "deleted/x.ts", symbol: "X" },
          { nodeId: "deleted/y.ts", symbol: "Y" },
        ],
      },
    };
    const result = scrubSnapshot(snap, nodesById);
    expect(result.pinSet.entries).toHaveLength(0);
  });

  it("keeps valid pins and drops stale ones", () => {
    const nodesById = makeNodeMap("pkg/src/a.ts");
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      pinSet: {
        entries: [
          { nodeId: "pkg/src/a.ts", symbol: "Foo" },
          { nodeId: "deleted/x.ts", symbol: "Bar" },
        ],
      },
    };
    const result = scrubSnapshot(snap, nodesById);
    expect(result.pinSet.entries).toHaveLength(1);
    expect(result.pinSet.entries[0].nodeId).toBe("pkg/src/a.ts");
  });

  it("clears stale selectedNodeId", () => {
    const nodesById = makeNodeMap("pkg/src/a.ts");
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      selectedNodeId: "deleted/file.ts",
    };
    const result = scrubSnapshot(snap, nodesById);
    expect(result.selectedNodeId).toBeNull();
  });

  it("preserves perspective and filters untouched", () => {
    const nodesById = makeNodeMap("a.ts");
    const snap: UrlStateSnapshot = {
      ...DEFAULT_SNAPSHOT,
      filters: { showTests: false, showAssets: true },
    };
    const result = scrubSnapshot(snap, nodesById);
    expect(result.filters).toEqual({ showTests: false, showAssets: true });
  });
});

// ─── The Local Map's opened directories (2026-10-08) ──────────────

describe("the opened directories", () => {
  it("ride the payload as `d`, sorted, and are left out when none is opened", () => {
    expect(snapshotToPayload(DEFAULT_SNAPSHOT).d).toBeUndefined();
    const payload = snapshotToPayload({ ...DEFAULT_SNAPSHOT, openDirectories: new Set(["b", "a/c"]) });
    expect(payload.d).toEqual(["a/c", "b"]);
    expect([...payloadToSnapshot({ v: 1, d: ["x/y"] }).openDirectories]).toEqual(["x/y"]);
    expect(payloadToSnapshot({ v: 1 }).openDirectories.size).toBe(0);
  });

  it("are scrubbed to those with a live file under them", () => {
    const nodes = new Map([["a/b/c.ts", {}], ["d.ts", {}]]);
    const scrubbed = scrubSnapshot({ ...DEFAULT_SNAPSHOT, openDirectories: new Set(["a", "a/b", "a/bc", "gone", ""]) }, nodes);
    expect([...scrubbed.openDirectories].sort()).toEqual(["", "a", "a/b"]);
  });
});

describe("retired view migration", () => {
  it("keeps the deepest opened folders and pins of old Membrane Map links", () => {
    const migrated = payloadToSnapshot({ v: 1, w: "membrane", n: "a/b/file.ts", e: ["a", "a/b", "other"], p: [{ n: "a/b/file.ts", s: "run" }], t: [50, -40, 2], c: ["a/b/file.ts"] });
    expect(migrated.view).toBe("map");
    expect(migrated.perspective).toBe("2d");
    expect(migrated.openDirectories).toEqual(new Set(["a/b", "other"]));
    expect(migrated.pinSet.entries).toEqual([{ nodeId: "a/b/file.ts", symbol: "run" }]);
    expect(snapshotToPayload(migrated)).toEqual({ v: 3, n: "a/b/file.ts", d: ["a/b", "other"], p: [{ n: "a/b/file.ts", s: "run" }], f: [1, 1] });
  });
  it("retains the representation while another view is active", () => {
    const snapshot = { ...DEFAULT_SNAPSHOT, view: "sources" as const, perspective: "3d" as const };
    expect(decompressSnapshot(compressSnapshot(snapshot))).toEqual(snapshot);
  });
});

describe("the path's destination", () => {
  it("is omitted when none is asked, and rides the payload as a file, a file's symbol or a directory", () => {
    expect(snapshotToPayload(DEFAULT_SNAPSHOT).x).toBeUndefined();
    const file = snapshotToPayload({ ...DEFAULT_SNAPSHOT, destination: { kind: "file", nodeId: "b.ts" } });
    expect(file.x).toEqual({ n: "b.ts" });
    const symbol = snapshotToPayload({ ...DEFAULT_SNAPSHOT, destination: { kind: "file", nodeId: "b.ts", symbol: "run" } });
    expect(symbol.x).toEqual({ n: "b.ts", s: "run" });
    const directory = snapshotToPayload({ ...DEFAULT_SNAPSHOT, destination: { kind: "directory", directory: "src" } });
    expect(directory.x).toEqual({ d: "src" });
    for (const snapshot of [
      { ...DEFAULT_SNAPSHOT, destination: { kind: "file", nodeId: "b.ts", symbol: "run" } as const },
      { ...DEFAULT_SNAPSHOT, destination: { kind: "directory", directory: "" } as const }
    ]) {
      expect(decompressSnapshot(compressSnapshot(snapshot)).destination).toEqual(snapshot.destination);
    }
    expect(payloadToSnapshot({ v: 2 }).destination).toBeNull();
    expect(payloadToSnapshot({ v: 2, x: { n: 7 } as unknown as { n: string } }).destination).toBeNull();
  });

  it("is scrubbed when its file is gone or its directory holds no live file, and kept otherwise", () => {
    const nodes = new Map([["src/a.ts", {}], ["src/b.ts", {}]]);
    const scrub = (destination: UrlStateSnapshot["destination"]) => scrubSnapshot({ ...DEFAULT_SNAPSHOT, destination }, nodes).destination;
    expect(scrub({ kind: "file", nodeId: "src/b.ts", symbol: "run" })).toEqual({ kind: "file", nodeId: "src/b.ts", symbol: "run" });
    expect(scrub({ kind: "file", nodeId: "gone.ts" })).toBeNull();
    expect(scrub({ kind: "directory", directory: "src" })).toEqual({ kind: "directory", directory: "src" });
    expect(scrub({ kind: "directory", directory: "" })).toEqual({ kind: "directory", directory: "" });
    expect(scrub({ kind: "directory", directory: "lib" })).toBeNull();
  });
});

describe("the Knowledge Sources panel's start", () => {
  it("is omitted for the entry points, rides the payload apart from the path's destination, and is scrubbed like it", () => {
    expect(snapshotToPayload(DEFAULT_SNAPSHOT).a).toBeUndefined();
    const file = snapshotToPayload({ ...DEFAULT_SNAPSHOT, reachFrom: { kind: "file", nodeId: "src/cli.ts" }, destination: { kind: "directory", directory: "src" } });
    expect(file.a).toEqual({ n: "src/cli.ts" });
    expect(file.x).toEqual({ d: "src" });
    for (const reachFrom of [{ kind: "file", nodeId: "src/cli.ts" } as const, { kind: "directory", directory: "scripts" } as const]) {
      expect(decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, reachFrom })).reachFrom).toEqual(reachFrom);
    }
    expect(payloadToSnapshot({ v: 2 }).reachFrom).toBeNull();
    const nodes = new Map([["src/a.ts", {}]]);
    expect(scrubSnapshot({ ...DEFAULT_SNAPSHOT, reachFrom: { kind: "file", nodeId: "src/a.ts" } }, nodes).reachFrom).toEqual({ kind: "file", nodeId: "src/a.ts" });
    expect(scrubSnapshot({ ...DEFAULT_SNAPSHOT, reachFrom: { kind: "file", nodeId: "gone.ts" } }, nodes).reachFrom).toBeNull();
    expect(scrubSnapshot({ ...DEFAULT_SNAPSHOT, reachFrom: { kind: "directory", directory: "lib" } }, nodes).reachFrom).toBeNull();
  });
});

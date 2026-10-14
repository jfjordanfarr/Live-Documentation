import { describe, expect, it } from "vitest";

import { addPin, EMPTY_PIN_SET, getVisibleConnections } from "./pin-state";
import { clearRetainedDirectory, reconcileRetained, releaseRetained, retainedItems, retainedKey, subjectAfterRelease, type RetainedState } from "./retained-state";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, scrubSnapshot } from "../persistence/compressed-url-state";

describe("independent retained selections", () => {
  it("replaces a released subject without clearing an independent direct-file inspection", () => {
    const previous = addPin(addPin(EMPTY_PIN_SET, "a.ts", "*"), "b.ts", "run");
    const next = addPin(EMPTY_PIN_SET, "a.ts", "*");
    expect(subjectAfterRelease(previous, next, "b.ts")).toBe("a.ts");
    expect(subjectAfterRelease(previous, next, "a.ts")).toBe("a.ts");
    expect(subjectAfterRelease(EMPTY_PIN_SET, EMPTY_PIN_SET, "preview.ts")).toBe("preview.ts");
    expect(subjectAfterRelease(EMPTY_PIN_SET, EMPTY_PIN_SET, "preview.ts", true)).toBeNull();
    expect(subjectAfterRelease(previous, EMPTY_PIN_SET, "b.ts")).toBeNull();
  });
  it("releases an opened parent while preserving its selected files, symbols and opened descendants", () => {
    const state: RetainedState = {
      pins: addPin(addPin(EMPTY_PIN_SET, "a/one.ts", "Thing"), "other/two.ts", "*"),
      openDirectories: new Set(["a", "a/nested", "other"])
    };
    const released = releaseRetained(state, { kind: "directory", directory: "a" });
    expect(released.pins).toBe(state.pins);
    expect([...released.openDirectories]).toEqual(["a/nested", "other"]);
    expect([...state.openDirectories]).toEqual(["a", "a/nested", "other"]);
  });

  it("bulk clearing removes contained selections without erasing relationships required by an outside pin", () => {
    const state: RetainedState = {
      pins: { entries: [
        { nodeId: "a/one.ts", symbol: "Thing" },
        { nodeId: "a/nested/two.ts", symbol: "*" },
        { nodeId: "ab/consumer.ts", symbol: "*" }
      ] },
      openDirectories: new Set(["", "a", "a/nested", "ab"])
    };
    const cleared = clearRetainedDirectory(state, "a");
    expect(cleared.pins.entries).toEqual([{ nodeId: "ab/consumer.ts", symbol: "*" }]);
    expect([...cleared.openDirectories]).toEqual(["", "ab"]);
    const links = [{ source: "ab/consumer.ts", target: "a/one.ts", kind: "dependency" as const, targetSymbol: "Thing" }];
    expect(getVisibleConnections(cleared.pins, links).map(connection => connection.link)).toEqual(links);
    const rootCleared = clearRetainedDirectory(state, "");
    expect(rootCleared.pins.entries).toEqual([]);
    expect(rootCleared.openDirectories.size).toBe(0);
  });

  it("interleaves directory and symbol selections across release, repinning and shared-link restoration", () => {
    let state = reconcileRetained({ pins: EMPTY_PIN_SET, openDirectories: new Set(["a"]) });
    state = reconcileRetained({ ...state, pins: addPin(state.pins, "a/one.ts", "Thing") });
    state = reconcileRetained({ ...state, openDirectories: new Set(["a", "a/nested"]) });
    const first = retainedItems(state)[0];
    const ordered = retainedItems(state).map(retainedKey);
    expect(ordered).toEqual([
      '["directory","a"]', '["pin","a/one.ts","Thing"]', '["directory","a/nested"]'
    ]);
    const restored = decompressSnapshot(compressSnapshot({
      ...DEFAULT_SNAPSHOT,
      pinSet: state.pins,
      openDirectories: state.openDirectories,
      retentionOrder: state.retentionOrder,
      filters: { showTests: true, showAssets: false },
      spatialLayout: "structure"
    }));
    expect(restored.retentionOrder).toEqual(ordered);
    expect(restored.spatialLayout).toBe("structure");
    state = releaseRetained(state, first);
    state = reconcileRetained({ ...state, openDirectories: new Set([...state.openDirectories, "a"]) });
    expect(retainedItems(state).map(retainedKey)).toEqual([...ordered.slice(1), ordered[0]]);
    const scrubbed = scrubSnapshot(restored, new Map([["a/nested/new.ts", {}]]));
    expect(scrubbed.retentionOrder).toEqual([ordered[0], ordered[2]]);
  });
});

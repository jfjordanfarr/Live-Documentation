import { describe, expect, it } from "vitest";

import { applyLayoutPreset, applyLayoutSettings, layoutSettingsOf, readLayoutSettings } from "./layout-presets";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "./persistence/compressed-url-state";
import { getDefaultTuning } from "./persistence/local-storage";

describe("shared packing preferences", () => {
  it("sets both layouts together while preserving coupling, symbol sizes and unrelated controls", () => {
    const original = getDefaultTuning();
    original.forceGraph.coupling = 1.7;
    original.forceGraph.symbolScale = 0.6;
    original.localMap.moveMs = 900;
    original.bezier.stubFactor = 0.4;
    const before = JSON.stringify(original);
    const compact = applyLayoutPreset(original, "compact");
    expect(compact.localMap.columnGap).toBeLessThan(original.localMap.columnGap);
    expect(compact.forceGraph.linkGap).toBeLessThan(original.forceGraph.linkGap);
    expect(compact.forceGraph).toMatchObject({ coupling: 1.7, symbolScale: 0.6 });
    expect(compact.localMap.moveMs).toBe(900);
    expect(compact.bezier.stubFactor).toBe(0.4);
    expect(applyLayoutPreset(compact, "relaxed")).toEqual(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("shares custom values exactly and keeps older addresses free of invented overrides", () => {
    const tuning = applyLayoutPreset(getDefaultTuning(), "compact");
    tuning.forceGraph.coupling = 1.7;
    tuning.localMap.itemGap = 18;
    const layout = layoutSettingsOf(tuning);
    const restored = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", layout,
      filters: { ...DEFAULT_SNAPSHOT.filters, showRelatedDocs: true } }));
    expect(restored.layout).toEqual(layout);
    expect(restored.filters.showRelatedDocs).toBe(true);
    expect(applyLayoutSettings(getDefaultTuning(), restored.layout)).toEqual(tuning);
    expect(decompressSnapshot(compressSnapshot(DEFAULT_SNAPSHOT)).layout).toBeUndefined();
    expect(decompressSnapshot(compressSnapshot(DEFAULT_SNAPSHOT)).filters.showRelatedDocs).toBeUndefined();
  });

  it("rejects malformed groups and nonnumeric values and bounds public controls", () => {
    expect(readLayoutSettings(null)).toBeUndefined();
    expect(readLayoutSettings({ localMap: [], forceGraph: { charge: Infinity, coupling: "2", nodeSize: null } })).toBeUndefined();
    expect(readLayoutSettings({ localMap: { itemGap: -1, unknown: 99 }, forceGraph: { nodeSize: 0, coupling: 100 } }))
      .toEqual({ localMap: { itemGap: 8 }, forceGraph: { nodeSize: 1, coupling: 3 } });
    expect(readLayoutSettings({ localMap: { columnGap: 73 }, forceGraph: { nodeSize: 4.1 } }))
      .toEqual({ localMap: { columnGap: 72 }, forceGraph: { nodeSize: 4 } });
  });

  it("carries the wrappers' look beside the numbers, for a link or a saved tuning, and drops an unknown one", () => {
    expect(readLayoutSettings({ forceGraph: { gravity: 0.1, groupWrappers: "cloud-rim" } })).toEqual({ forceGraph: { gravity: 0.1, groupWrappers: "cloud-rim" } });
    expect(readLayoutSettings({ forceGraph: { groupWrappers: "cloud-rim" } })).toEqual({ forceGraph: { groupWrappers: "cloud-rim" } });
    expect(readLayoutSettings({ forceGraph: { groupWrappers: "balloon" } })).toBeUndefined();
    expect(readLayoutSettings({ localMap: { groupWrappers: "cloud-rim" } })).toBeUndefined();
    const tuning = getDefaultTuning();
    tuning.forceGraph.groupWrappers = "skin";
    expect(layoutSettingsOf(tuning).forceGraph?.groupWrappers).toBe("skin");
    const restored = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", layout: layoutSettingsOf(tuning) }));
    expect(applyLayoutSettings(getDefaultTuning(), restored.layout).forceGraph.groupWrappers).toBe("skin");
  });

  it("carries how an opened directory stands only for the trial's layouts, and reads its absence as the grid", () => {
    // With the trial off a link is the link it was before the trial: the setting is not written.
    const grid = getDefaultTuning();
    expect(grid.localMap.directoryLayout).toBe("grid");
    expect(layoutSettingsOf(grid).localMap).not.toHaveProperty("directoryLayout");
    expect(readLayoutSettings({ localMap: { directoryLayout: "grid" } })).toBeUndefined();
    expect(readLayoutSettings({ localMap: { directoryLayout: "spiral" } })).toBeUndefined();
    // With it on, the link carries it through the address and back.
    for (const layout of ["flow", "flow-tall"] as const) {
      const tuning = getDefaultTuning();
      tuning.localMap.directoryLayout = layout;
      expect(readLayoutSettings({ localMap: { directoryLayout: layout } })).toEqual({ localMap: { directoryLayout: layout } });
      const restored = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(tuning) }));
      expect(applyLayoutSettings(getDefaultTuning(), restored.layout).localMap.directoryLayout).toBe(layout);
      // A link made with the trial off shows the grid in a browser whose own tuning last held the trial.
      const off = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(grid) }));
      expect(applyLayoutSettings(tuning, off.layout).localMap.directoryLayout).toBe("grid");
      // An address that carries no layout at all leaves the browser's own choice alone.
      expect(applyLayoutSettings(tuning, undefined).localMap.directoryLayout).toBe(layout);
    }
  });
});

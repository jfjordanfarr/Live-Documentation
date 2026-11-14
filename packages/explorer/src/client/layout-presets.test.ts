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

  it("opens a link in Flow unless it says the grid, which it carries only when chosen (2026-11-13)", () => {
    // The default is Flow, and a link made with it does not write it.
    const flow = getDefaultTuning();
    expect(flow.localMap.directoryLayout).toBe("flow");
    expect(layoutSettingsOf(flow).localMap).not.toHaveProperty("directoryLayout");
    expect(readLayoutSettings({ localMap: { directoryLayout: "spiral" } })).toBeUndefined();
    // The unwrapped flow was a second trial value for one afternoon; a link that names it carries nothing.
    expect(readLayoutSettings({ localMap: { directoryLayout: "flow-tall" } })).toBeUndefined();
    // A link with the grid chosen carries it through the address and opens in it, whatever the browser last held.
    const grid = getDefaultTuning();
    grid.localMap.directoryLayout = "grid";
    expect(readLayoutSettings({ localMap: { directoryLayout: "grid" } })).toEqual({ localMap: { directoryLayout: "grid" } });
    const restored = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(grid) }));
    expect(restored.layout?.localMap?.directoryLayout).toBe("grid");
    expect(applyLayoutSettings(getDefaultTuning(), restored.layout).localMap.directoryLayout).toBe("grid");
    // A link with the 2D map's settings and no Opened Directory, made with the grid on November 12 or 13, before the
    // trial, or since with the default, opens in Flow even in a browser whose own tuning holds the grid; one that says
    // "flow", as links made with the trial on November 12 and 13 do, likewise.
    const unsaid = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(flow) }));
    expect(applyLayoutSettings(grid, unsaid.layout).localMap.directoryLayout).toBe("flow");
    expect(readLayoutSettings({ localMap: { directoryLayout: "flow" } })).toBeUndefined();
    expect(applyLayoutSettings(grid, readLayoutSettings({ localMap: { columnGap: 72, directoryLayout: "flow" } })).localMap.directoryLayout).toBe("flow");
    // An address that carries no layout at all leaves the browser's own choice alone.
    expect(applyLayoutSettings(grid, undefined).localMap.directoryLayout).toBe("grid");
  });

  it("carries a closed directory's look only when it is one of the trial's, and reads its absence as the box (2026-11-13)", () => {
    const box = getDefaultTuning();
    expect(box.localMap.closedDirectory).toBe("box");
    expect(layoutSettingsOf(box).localMap).not.toHaveProperty("closedDirectory");
    expect(readLayoutSettings({ localMap: { closedDirectory: "box" } })).toBeUndefined();
    expect(readLayoutSettings({ localMap: { closedDirectory: "balloon" } })).toBeUndefined();
    for (const look of ["cells", "stack", "folded"] as const) {
      const tuning = getDefaultTuning();
      tuning.localMap.closedDirectory = look;
      expect(readLayoutSettings({ localMap: { closedDirectory: look } })).toEqual({ localMap: { closedDirectory: look } });
      const restored = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(tuning) }));
      expect(applyLayoutSettings(getDefaultTuning(), restored.layout).localMap.closedDirectory).toBe(look);
      // A link made with the box shows the box in a browser whose own tuning last held a trial's look.
      const plain = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(box) }));
      expect(applyLayoutSettings(tuning, plain.layout).localMap.closedDirectory).toBe("box");
      // An address that carries no layout at all leaves the browser's own choice alone.
      expect(applyLayoutSettings(tuning, undefined).localMap.closedDirectory).toBe(look);
    }
  });

  it("opens a link in the three looks unless it says the ladder, which it carries only when chosen (2026-11-13)", () => {
    // The default is the three looks, and a link made with it does not write it.
    const three = getDefaultTuning();
    expect(three.localMap.zoomLooks).toBe("three");
    expect(layoutSettingsOf(three).localMap).not.toHaveProperty("zoomLooks");
    // A link with the ladder chosen carries it through the address and opens in it, whatever the browser last held.
    const stepped = getDefaultTuning();
    stepped.localMap.zoomLooks = "stepped";
    const ladder = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(stepped) }));
    expect(ladder.layout?.localMap?.zoomLooks).toBe("stepped");
    expect(applyLayoutSettings(getDefaultTuning(), ladder.layout).localMap.zoomLooks).toBe("stepped");
    // A link with the 2D map's settings and no Zoom Looks, made before the trial or since with the default, opens in
    // the three looks even in a browser whose own tuning holds the ladder; one that says "three", as links of November
    // 10 to 13 may, likewise.
    const unsaid = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: { localMap: { columnGap: 72 } } }));
    expect(applyLayoutSettings(stepped, unsaid.layout).localMap.zoomLooks).toBe("three");
    expect(applyLayoutSettings(stepped, readLayoutSettings({ localMap: { columnGap: 72, zoomLooks: "three" } })).localMap.zoomLooks).toBe("three");
    expect(readLayoutSettings({ localMap: { zoomLooks: "three" } })).toBeUndefined();
    expect(readLayoutSettings({ localMap: { zoomLooks: "ladder" } })).toBeUndefined();
    // An address that carries no layout at all leaves the browser's own choice alone.
    expect(applyLayoutSettings(stepped, undefined).localMap.zoomLooks).toBe("stepped");
  });
});

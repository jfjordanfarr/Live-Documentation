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

  it("carries a closed directory's look only when it is not the skin with cells, and reads its absence as the skin (2026-11-15)", () => {
    const cells = getDefaultTuning();
    expect(cells.localMap.closedDirectory).toBe("cells");
    expect(layoutSettingsOf(cells).localMap).not.toHaveProperty("closedDirectory");
    expect(readLayoutSettings({ localMap: { closedDirectory: "cells" } })).toBeUndefined();
    expect(readLayoutSettings({ localMap: { closedDirectory: "balloon" } })).toBeUndefined();
    // The folded membrane was deleted on 2026-11-15: a link or a stored choice that names it shows the default.
    expect(readLayoutSettings({ localMap: { closedDirectory: "folded" } })).toBeUndefined();
    for (const look of ["box", "stack"] as const) {
      const tuning = getDefaultTuning();
      tuning.localMap.closedDirectory = look;
      expect(readLayoutSettings({ localMap: { closedDirectory: look } })).toEqual({ localMap: { closedDirectory: look } });
      const restored = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(tuning) }));
      expect(applyLayoutSettings(getDefaultTuning(), restored.layout).localMap.closedDirectory).toBe(look);
      // A link made with the skin shows the skin in a browser whose own tuning last held another look.
      const plain = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(cells) }));
      expect(applyLayoutSettings(tuning, plain.layout).localMap.closedDirectory).toBe("cells");
      // An address that carries no layout at all leaves the browser's own choice alone.
      expect(applyLayoutSettings(tuning, undefined).localMap.closedDirectory).toBe(look);
    }
  });

  it("carries Descriptions Zoomed Out only when it keeps the first line, and reads its absence as hidden (2026-11-13)", () => {
    const hidden = getDefaultTuning();
    expect(hidden.localMap.descriptionsZoomedOut).toBe("hidden");
    expect(layoutSettingsOf(hidden).localMap).not.toHaveProperty("descriptionsZoomedOut");
    expect(readLayoutSettings({ localMap: { descriptionsZoomedOut: "hidden" } })).toBeUndefined();
    expect(readLayoutSettings({ localMap: { descriptionsZoomedOut: "all" } })).toBeUndefined();
    const kept = getDefaultTuning();
    kept.localMap.descriptionsZoomedOut = "first-line";
    const restored = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(kept) }));
    expect(applyLayoutSettings(getDefaultTuning(), restored.layout).localMap.descriptionsZoomedOut).toBe("first-line");
    // A link made with it hidden shows it hidden in a browser whose own tuning keeps the first line.
    const plain = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(hidden) }));
    expect(applyLayoutSettings(kept, plain.layout).localMap.descriptionsZoomedOut).toBe("hidden");
    expect(applyLayoutSettings(kept, undefined).localMap.descriptionsZoomedOut).toBe("first-line");
  });

  it("carries the skin's shape and its cells' colour only when they are not the defaults: the tab, and the kinds' colours, the owner's choice of 2026-11-16", () => {
    const plain = getDefaultTuning();
    expect([plain.localMap.closedShape, plain.localMap.closedCells]).toEqual(["tab", "kind"]);
    expect(layoutSettingsOf(plain).localMap).not.toHaveProperty("closedShape");
    expect(layoutSettingsOf(plain).localMap).not.toHaveProperty("closedCells");
    expect(readLayoutSettings({ localMap: { closedShape: "tab", closedCells: "kind" } })).toBeUndefined();
    expect(readLayoutSettings({ localMap: { closedShape: "triangle", closedCells: "rainbow" } })).toBeUndefined();
    for (const shape of ["round", "square"] as const) {
      const tuning = getDefaultTuning();
      tuning.localMap.closedShape = shape;
      tuning.localMap.closedCells = "grey";
      const restored = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(tuning) }));
      expect(restored.layout?.localMap).toMatchObject({ closedShape: shape, closedCells: "grey" });
      expect(applyLayoutSettings(getDefaultTuning(), restored.layout).localMap).toMatchObject({ closedShape: shape, closedCells: "grey" });
      // A link made with the defaults shows them in a browser whose own tuning holds the other choices.
      const unsaid = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(plain) }));
      expect(applyLayoutSettings(tuning, unsaid.layout).localMap).toMatchObject({ closedShape: "tab", closedCells: "kind" });
      expect(applyLayoutSettings(tuning, undefined).localMap).toMatchObject({ closedShape: shape, closedCells: "grey" });
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

  it("opens a link with files only when zoomed out fully unless it says the cards keep their size, carried only when chosen", () => {
    // Files only is the default since 2026-11-15, a design change by the owner's eye and a comparison with the cards'
    // rows drawn as bars; until then the default kept the cards' size and a link wrote files only. A link made with the
    // default does not write it.
    const files = getDefaultTuning();
    expect(files.localMap.overviewFiles).toBe("files");
    expect(layoutSettingsOf(files).localMap).not.toHaveProperty("overviewFiles");
    // A link with the cards' size chosen carries it through the address and opens in it, whatever the browser last held.
    const keep = getDefaultTuning();
    keep.localMap.overviewFiles = "keep";
    const restored = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: layoutSettingsOf(keep) }));
    expect(restored.layout?.localMap?.overviewFiles).toBe("keep");
    expect(applyLayoutSettings(getDefaultTuning(), restored.layout).localMap.overviewFiles).toBe("keep");
    // A link with the 2D map's settings and no choice opens with files only even in a browser whose own tuning holds the
    // cards' size; a link of the trial's days that says files only says nothing now, and a value the control does not
    // offer carries nothing.
    const unsaid = decompressSnapshot(compressSnapshot({ ...DEFAULT_SNAPSHOT, layout: { localMap: { columnGap: 72 } } }));
    expect(applyLayoutSettings(keep, unsaid.layout).localMap.overviewFiles).toBe("files");
    expect(readLayoutSettings({ localMap: { overviewFiles: "files" } })).toBeUndefined();
    expect(readLayoutSettings({ localMap: { overviewFiles: "flow" } })).toBeUndefined();
    // An address that carries no layout at all leaves the browser's own choice alone.
    expect(applyLayoutSettings(keep, undefined).localMap.overviewFiles).toBe("keep");
  });
});

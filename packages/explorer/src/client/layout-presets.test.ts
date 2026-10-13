import { describe, expect, it } from "vitest";

import { applyLayoutPreset, applyLayoutSettings, layoutPresetOf, layoutSettingsOf, readLayoutSettings } from "./layout-presets";
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
    expect(layoutPresetOf(compact)).toBe("compact");
    expect(compact.localMap.columnGap).toBeLessThan(original.localMap.columnGap);
    expect(compact.forceGraph.linkGap).toBeLessThan(original.forceGraph.linkGap);
    expect(compact.forceGraph).toMatchObject({ coupling: 1.7, symbolScale: 0.6 });
    expect(compact.localMap.moveMs).toBe(900);
    expect(compact.bezier.stubFactor).toBe(0.4);
    expect(applyLayoutPreset(compact, "relaxed")).toEqual(original);
    expect(JSON.stringify(original)).toBe(before);
  });

  it("identifies advanced packing edits across either representation without relabeling encoding changes", () => {
    const tuning = getDefaultTuning();
    expect(layoutPresetOf(tuning)).toBe("relaxed");
    tuning.forceGraph.coupling = 0.5;
    expect(layoutPresetOf(tuning)).toBe("relaxed");
    tuning.forceGraph.charge += 1;
    expect(layoutPresetOf(tuning)).toBe("custom");
    const compact = applyLayoutPreset(tuning, "compact");
    compact.localMap.heightCost += 1;
    expect(layoutPresetOf(compact)).toBe("custom");
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
});

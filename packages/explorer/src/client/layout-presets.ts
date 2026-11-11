import { GROUP_WRAPPERS, ZOOM_LOOKS, type ForceGraphTuning, type LocalMapTuning, type TuningConfig } from "./types";

/** One packing preference interpreted by both Local Map representations. */
export type LayoutPreset = "compact" | "relaxed";

type FlatPacking = Pick<LocalMapTuning, "columnGap" | "itemGap" | "bandGap" | "heightCost" | "membraneEvenness" | "membraneSimplicity" | "rowLevelness">;
type SpatialPacking = Pick<ForceGraphTuning, "linkGap" | "charge" | "collisionGap">;

/** Portable numeric settings behind the presets and spatial encodings; older URLs may omit them. */
export interface LayoutSettings {
  localMap?: Partial<FlatPacking & Pick<LocalMapTuning, "zoomLooks">>;
  forceGraph?: Partial<ForceGraphTuning>;
}

/** Public control minimum, maximum and step, also used when reading saved or shared values. */
export const LAYOUT_RANGES = {
  localMap: {
    columnGap: [24, 160, 4], itemGap: [8, 80, 2], bandGap: [8, 80, 2], heightCost: [0, 40, 1],
    membraneEvenness: [0, 5, 0.25], membraneSimplicity: [0, 1000, 10], rowLevelness: [0, 5, 0.25]
  },
  forceGraph: {
    linkGap: [8, 200, 2], charge: [0, 300, 5], collisionGap: [0, 20, 0.5], coupling: [0, 3, 0.1], nodeSize: [1, 10, 0.25], symbolScale: [0, 2, 0.1],
    gravity: [0, 0.3, 0.005], componentSeparation: [0, 0.95, 0.05], chargeRange: [0, 1000, 10], approximation: [0, 0.5, 0.05], linkStrength: [0, 2, 0.05], updateEnergy: [0, 1, 0.01], tether: [0, 0.1, 0.001],
    citedByPull: [0, 1, 0.05], linkWidth: [0.1, 4, 0.1], nodeZoomResistance: [0, 1, 0.05], wireZoomResistance: [0, 1, 0.05], nameAt: [4, 60, 1],
    hops: [1, 4, 1], revealFrames: [1, 240, 1], shellDepth: [1, 6, 1]
  }
} as const;

/** Packing defaults only: selecting a preset preserves coupling, symbol scaling and unrelated controls. */
export const LAYOUT_PRESETS: Readonly<Record<LayoutPreset, { localMap: FlatPacking; forceGraph: SpatialPacking }>> = {
  compact: {
    localMap: { columnGap: 72, itemGap: 16, bandGap: 20, heightCost: 12, membraneEvenness: 1, membraneSimplicity: 100, rowLevelness: 0.25 },
    forceGraph: { linkGap: 32, charge: 30, collisionGap: 2 }
  },
  relaxed: {
    localMap: { columnGap: 100, itemGap: 24, bandGap: 28, heightCost: 5, membraneEvenness: 2, membraneSimplicity: 200, rowLevelness: 2 },
    forceGraph: { linkGap: 60, charge: 60, collisionGap: 5 }
  }
};

/** Return a fresh tuning record with both representations' packing set together. */
export function applyLayoutPreset(tuning: TuningConfig, preset: LayoutPreset): TuningConfig {
  const packing = LAYOUT_PRESETS[preset];
  return { ...tuning, localMap: { ...tuning.localMap, ...packing.localMap }, forceGraph: { ...tuning.forceGraph, ...packing.forceGraph } };
}

/**
 * Read only known settings: the finite numbers, bound to their public control ranges, and the named settings a link or a
 * saved tuning carries beside them: the 3D wrappers' look (2026-11-06, so that a shared link shows the group wrappers and
 * the directory shells without a switch) and the 2D Zoom Looks (2026-11-10, so that a link shows the trial's three looks).
 */
export function readLayoutSettings(value: unknown): LayoutSettings | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const result: LayoutSettings = {};
  for (const group of ["localMap", "forceGraph"] as const) {
    const input = (value as Record<string, unknown>)[group];
    if (!input || typeof input !== "object" || Array.isArray(input)) continue;
    const numbers: Record<string, number> = {};
    const ranges: Readonly<Record<string, readonly [number, number, number]>> = LAYOUT_RANGES[group];
    for (const [key, [min, max, step]] of Object.entries(ranges)) {
      const number = (input as Record<string, unknown>)[key];
      if (typeof number === "number" && Number.isFinite(number)) {
        const clamped = Math.max(min, Math.min(max, number));
        numbers[key] = Number((min + Math.round((clamped - min) / step) * step).toFixed(8));
      }
    }
    if (group === "localMap") {
      const zoomLooks = ZOOM_LOOKS.find(choice => choice === (input as Record<string, unknown>).zoomLooks);
      if (Object.keys(numbers).length || zoomLooks) result.localMap = { ...numbers, ...(zoomLooks ? { zoomLooks } : null) };
      continue;
    }
    const groupWrappers = GROUP_WRAPPERS.find(choice => choice === (input as Record<string, unknown>).groupWrappers);
    if (Object.keys(numbers).length || groupWrappers) result.forceGraph = { ...numbers, ...(groupWrappers ? { groupWrappers } : null) };
  }
  return Object.keys(result).length ? result : undefined;
}

/** Snapshot the controls that affect packing and spatial encodings, independent of the current perspective. */
export function layoutSettingsOf(tuning: TuningConfig): LayoutSettings {
  return readLayoutSettings(tuning)!;
}

/** Merge a validated partial snapshot over the current values, leaving unrelated preferences intact. */
export function applyLayoutSettings(tuning: TuningConfig, settings: LayoutSettings | undefined): TuningConfig {
  return { ...tuning, localMap: { ...tuning.localMap, ...settings?.localMap }, forceGraph: { ...tuning.forceGraph, ...settings?.forceGraph } };
}

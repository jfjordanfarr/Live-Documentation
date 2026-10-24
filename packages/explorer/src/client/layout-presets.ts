import type { ForceGraphTuning, LocalMapTuning, TuningConfig } from "./types";

/** One packing preference interpreted by both Local Map representations. */
export type LayoutPreset = "compact" | "relaxed";

type FlatPacking = Pick<LocalMapTuning, "columnGap" | "itemGap" | "bandGap" | "heightCost" | "membraneEvenness" | "membraneSimplicity" | "rowLevelness">;
type SpatialPacking = Pick<ForceGraphTuning, "linkGap" | "charge" | "collisionGap">;

/** Portable numeric settings behind the presets and spatial encodings; older URLs may omit them. */
export interface LayoutSettings {
  localMap?: Partial<FlatPacking>;
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
    gravity: [0, 0.3, 0.005], chargeRange: [0, 1000, 10], linkStrength: [0, 2, 0.05], updateEnergy: [0, 1, 0.01], tether: [0, 0.1, 0.001],
    citedByPull: [0, 1, 0.05], linkWidth: [0.1, 4, 0.1], nodeZoomResistance: [0, 1, 0.05], wireZoomResistance: [0, 1, 0.05]
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

/** Derive the label from actual settings, so advanced edits never masquerade as a stock preset. */
export function layoutPresetOf(tuning: TuningConfig): LayoutPreset | "custom" {
  for (const name of ["compact", "relaxed"] as const) {
    const preset = LAYOUT_PRESETS[name];
    if (Object.entries(preset.localMap).every(([key, value]) => tuning.localMap[key as keyof FlatPacking] === value)
      && Object.entries(preset.forceGraph).every(([key, value]) => tuning.forceGraph[key as keyof SpatialPacking] === value)) return name;
  }
  return "custom";
}

/** Read only known, finite settings and bound them to their public control ranges. */
export function readLayoutSettings(value: unknown): LayoutSettings | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const result: LayoutSettings = {};
  for (const group of ["localMap", "forceGraph"] as const) {
    const input = (value as Record<string, unknown>)[group];
    if (!input || typeof input !== "object" || Array.isArray(input)) continue;
    const settings: Record<string, number> = {};
    const ranges: Readonly<Record<string, readonly [number, number, number]>> = LAYOUT_RANGES[group];
    for (const [key, [min, max, step]] of Object.entries(ranges)) {
      const number = (input as Record<string, unknown>)[key];
      if (typeof number === "number" && Number.isFinite(number)) {
        const clamped = Math.max(min, Math.min(max, number));
        settings[key] = Number((min + Math.round((clamped - min) / step) * step).toFixed(8));
      }
    }
    if (Object.keys(settings).length) result[group] = settings;
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

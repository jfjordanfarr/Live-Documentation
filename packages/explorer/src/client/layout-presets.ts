import { BEYOND_HOPS, CLOSED_CELL_COLOURS, CLOSED_DIRECTORY_LOOKS, CLOSED_DIRECTORY_SHAPES, DESCRIPTIONS_ZOOMED_OUT, DIRECTORY_LAYOUTS, GROUP_WRAPPERS, HIDDEN_FILES_LOOKS, OVERVIEW_FILES, ZOOM_LOOKS, type ForceGraphTuning, type LocalMapTuning, type TuningConfig } from "./types";

/** One packing preference interpreted by both Local Map representations. */
export type LayoutPreset = "compact" | "relaxed";

type FlatPacking = Pick<LocalMapTuning, "columnGap" | "itemGap" | "bandGap" | "heightCost" | "widthCost" | "membraneEvenness" | "membraneSimplicity" | "rowLevelness">;
type SpatialPacking = Pick<ForceGraphTuning, "linkGap" | "charge" | "collisionGap">;

/** Portable numeric settings behind the presets and spatial encodings; older URLs may omit them. */
export interface LayoutSettings {
  localMap?: Partial<FlatPacking & Pick<LocalMapTuning, "returnCost" | "zoomLooks" | "directoryLayout" | "closedDirectory" | "closedShape" | "closedCells" | "hiddenFiles" | "overviewFiles" | "descriptionsZoomedOut">>;
  forceGraph?: Partial<ForceGraphTuning>;
}

/** Public control minimum, maximum and step, also used when reading saved or shared values. */
export const LAYOUT_RANGES = {
  localMap: {
    columnGap: [24, 160, 4], itemGap: [8, 80, 2], bandGap: [8, 80, 2], heightCost: [0, 40, 1], widthCost: [0, 40, 1],
    membraneEvenness: [0, 5, 0.25], membraneSimplicity: [0, 1000, 10], rowLevelness: [0, 5, 0.25], returnCost: [0, 5000, 25]
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
    localMap: { columnGap: 72, itemGap: 16, bandGap: 20, heightCost: 12, widthCost: 12, membraneEvenness: 1, membraneSimplicity: 100, rowLevelness: 0.25 },
    forceGraph: { linkGap: 32, charge: 30, collisionGap: 2 }
  },
  relaxed: {
    localMap: { columnGap: 100, itemGap: 24, bandGap: 28, heightCost: 5, widthCost: 5, membraneEvenness: 2, membraneSimplicity: 200, rowLevelness: 2 },
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
 * the directory shells without a switch), the 2D Zoom Looks (2026-11-10, so that a link shows the trial's three looks)
 * and how an opened directory stands (2026-11-12, so that the owner and the test agents compare that trial by link). Each
 * of the last two is carried only when it is not its default, and {@link applyLayoutSettings} reads its absence as the
 * default, so that a link shows what the build shows without a switch while a link that names the other choice still
 * opens in it. Zoom Looks: only the stepped ladder is carried since the three looks became the default (2026-11-13); a
 * link made between November 10 and 13 says either, since the default was written. Opened Directory: only the grid is
 * carried since Flow became the default (2026-11-13); a link made on November 12 or 13 says "flow" when Flow was chosen
 * and nothing when the grid was, so such a link now opens in Flow either way, and a link that says "grid" exists only
 * from now on. Closed Directory (2026-11-13): only a trial's look is carried, and its absence reads as today's box;
 * Descriptions Zoomed Out (2026-11-13) likewise: only the first line is carried, and its absence reads as hidden; and Hidden
 * Files (2026-11-17): only the cells are carried, and their absence reads as the count. Beyond the Hops (2026-11-18, a
 * trial of the 3D map): only the next step is carried, and its absence reads as everything.
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
      const zoomLooks = ZOOM_LOOKS.slice(1).find(choice => choice === (input as Record<string, unknown>).zoomLooks);
      const directoryLayout = DIRECTORY_LAYOUTS.slice(1).find(choice => choice === (input as Record<string, unknown>).directoryLayout);
      const closedDirectory = CLOSED_DIRECTORY_LOOKS.slice(1).find(choice => choice === (input as Record<string, unknown>).closedDirectory);
      const closedShape = CLOSED_DIRECTORY_SHAPES.slice(1).find(choice => choice === (input as Record<string, unknown>).closedShape);
      const closedCells = CLOSED_CELL_COLOURS.slice(1).find(choice => choice === (input as Record<string, unknown>).closedCells);
      const hiddenFiles = HIDDEN_FILES_LOOKS.slice(1).find(choice => choice === (input as Record<string, unknown>).hiddenFiles);
      const overviewFiles = OVERVIEW_FILES.slice(1).find(choice => choice === (input as Record<string, unknown>).overviewFiles);
      const descriptionsZoomedOut = DESCRIPTIONS_ZOOMED_OUT.slice(1).find(choice => choice === (input as Record<string, unknown>).descriptionsZoomedOut);
      if (Object.keys(numbers).length || zoomLooks || directoryLayout || closedDirectory || closedShape || closedCells || hiddenFiles || overviewFiles || descriptionsZoomedOut) {
        result.localMap = { ...numbers, ...(zoomLooks ? { zoomLooks } : null), ...(directoryLayout ? { directoryLayout } : null),
          ...(closedDirectory ? { closedDirectory } : null), ...(closedShape ? { closedShape } : null), ...(closedCells ? { closedCells } : null),
          ...(hiddenFiles ? { hiddenFiles } : null),
          ...(overviewFiles ? { overviewFiles } : null), ...(descriptionsZoomedOut ? { descriptionsZoomedOut } : null) };
      }
      continue;
    }
    const groupWrappers = GROUP_WRAPPERS.find(choice => choice === (input as Record<string, unknown>).groupWrappers);
    const beyondHops = BEYOND_HOPS.slice(1).find(choice => choice === (input as Record<string, unknown>).beyondHops);
    if (Object.keys(numbers).length || groupWrappers || beyondHops) {
      result.forceGraph = { ...numbers, ...(groupWrappers ? { groupWrappers } : null), ...(beyondHops ? { beyondHops } : null) };
    }
  }
  return Object.keys(result).length ? result : undefined;
}

/** Snapshot the controls that affect packing and spatial encodings, independent of the current perspective. */
export function layoutSettingsOf(tuning: TuningConfig): LayoutSettings {
  return readLayoutSettings(tuning)!;
}

/**
 * Merge a validated partial snapshot over the current values, leaving unrelated preferences intact. A snapshot that
 * carries the 2D map's settings without saying how an opened directory stands says Flow, the default, since only the
 * grid is written (2026-11-13); one that does not say its Zoom Looks says the three looks, since only the ladder is
 * written (2026-11-13); one that does not say its Closed Directory, its shape or its cells' colour says the skin with
 * cells, the folder's tab and the kinds' colours, the defaults since 2026-11-15 and 16, since only the other choices
 * are written; and one that does not say what the overview look draws says files only, since only cards at their size
 * is written (files only is the default since 2026-11-15; until then the link wrote files only and said nothing for
 * the cards' size, so a link of the trial's two days that says files only is read as saying nothing, which is the same
 * picture). So a link made with the defaults shows them in a browser whose own tuning holds the other choices.
 */
export function applyLayoutSettings(tuning: TuningConfig, settings: LayoutSettings | undefined): TuningConfig {
  const directory = settings?.localMap ? { directoryLayout: DIRECTORY_LAYOUTS[0] } : null;
  const looks = settings?.localMap ? { zoomLooks: ZOOM_LOOKS[0], overviewFiles: OVERVIEW_FILES[0] } : null;
  const closed = settings?.localMap ? { closedDirectory: CLOSED_DIRECTORY_LOOKS[0], closedShape: CLOSED_DIRECTORY_SHAPES[0], closedCells: CLOSED_CELL_COLOURS[0], hiddenFiles: HIDDEN_FILES_LOOKS[0] } : null;
  // Descriptions Zoomed Out likewise (2026-11-13): only a value that keeps a line is written, and its absence reads as hidden.
  const descriptions = settings?.localMap ? { descriptionsZoomedOut: DESCRIPTIONS_ZOOMED_OUT[0] } : null;
  // Beyond the Hops likewise (2026-11-18): only the next step is written, and its absence reads as everything.
  const beyond = settings?.forceGraph ? { beyondHops: BEYOND_HOPS[0] } : null;
  return { ...tuning, localMap: { ...tuning.localMap, ...directory, ...looks, ...closed, ...descriptions, ...settings?.localMap },
    forceGraph: { ...tuning.forceGraph, ...beyond, ...settings?.forceGraph } };
}

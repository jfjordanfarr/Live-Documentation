/**
 * LocalStorage Persistence
 * 
 * Handles persisting and restoring UI state (filters, tuning) and navigation
 * state (view, node selection) across browser sessions.
 */

import { readPerspective, readSpatialLayout, readView } from "./navigation";
import { LAYOUT_PRESETS, readLayoutSettings } from "../layout-presets";
import { HISTORY_GRANULARITIES, type HistoryAxis, type HistoryGranularity, type InspectionTarget, type LocalMapPerspective, type ExplorerFilters, type SpatialLayout, type SymbolOrder, type TuningConfig, type ViewName } from "../types";

// ─────────────────────────────────────────────────────────────────────────
// Persisted UI State (tuning + filters)
// ─────────────────────────────────────────────────────────────────────────

/** Tuning as saved: only the values that were read back, each merged over the defaults when the Explorer starts. */
type SavedTuning = { [K in keyof TuningConfig]?: Partial<TuningConfig[K]> };

/**
 * localStorage key for persisted UI state (filters + tuning). Version-suffixed to allow future migration. Version 2
 * (2026-10-22) holds only what differs from the defaults; version 1 held every setting as it stood, so that a changed
 * default never reached a returning viewer, and a version 1 entry cannot tell a choice from an old default. It is
 * removed unread ({@link RETIRED_UI_KEYS}).
 */
export const PERSISTED_UI_KEY = "live-docs-explorer:ui:v2";
/** Schema version tag embedded in persisted UI payloads for forward-compatible deserialisation. */
export const PERSISTED_UI_VERSION = 2 as const;
/** The keys of UI state that earlier versions wrote, removed when the state is read. */
const RETIRED_UI_KEYS: readonly string[] = ["live-docs-explorer:ui:v1"];

/** Shape of the versioned UI state written to localStorage under {@link PERSISTED_UI_KEY}. */
export type PersistedUi = {
  version: typeof PERSISTED_UI_VERSION;
  filters?: Partial<ExplorerFilters>;
  tuning?: SavedTuning;
};

/** Returns the factory-default filter set (tests visible; assets and documents, cited and citing, hidden). */
export const getDefaultFilters = (): ExplorerFilters => ({
  showTests: true,
  showAssets: false,
  showRelatedDocs: false,
  showCitingDocs: false
});

/** Returns the factory-default tuning configuration for bezier curves and the local-map layout. */
export const getDefaultTuning = (): TuningConfig => ({
  bezier: {
    stubFactor: 0.8,
    stubMin: 8,
    stubMaxOffset: 40,
    verticalOffset: 0
  },
  localMap: {
    hoverDimSymbols: 0.5,
    hoverDimConnections: 0.1,
    selfLoopTaper: 0.5,
    laceReach: 18,
    laceCurl: 12,
    laceWidth: 2.5,
    collapseOnHover: false,
    collapseOnPin: true,
    symbolOrder: "layout",
    moveMs: 450,
    holdStill: "click",
    searchStarts: 32,
    searchPatience: 8,
    rankingPull: 0,
    rankingTie: "fewest",
    orderSweeps: 4,
    orderSeed: null,
    orderStarts: 2,
    crossingCost: 80,
    churnCost: 100,
    membraneNeck: 60,
    membranePadding: 12,
    cardMaxWidth: null,
    membraneDepth: null,
    ...LAYOUT_PRESETS.relaxed.localMap
  },
  forceGraph: { ...LAYOUT_PRESETS.relaxed.forceGraph, coupling: 1, nodeSize: 4, symbolScale: 1, linkWidth: 1, nodeZoomResistance: 0.3, wireZoomResistance: 0.9, gravity: 0.025, chargeRange: 0, approximation: 0.3, linkStrength: 0.5, updateEnergy: 1, tether: 0.02, citedByPull: 1 },
  // The history's scrubber: steps laid out by date, linear time in which no month counts for more than another (the
  // owner, 2026-10-22), the ticks chosen by the number of steps, two steps a second when played.
  history: { axis: "time", granularity: "auto", playRate: 2 }
});

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const getRecord = (obj: Record<string, unknown>, key: string): Record<string, unknown> | null => {
  const val = obj[key];
  return isRecord(val) ? val : null;
};

const readBoolean = (value: unknown): boolean | undefined => {
  return typeof value === "boolean" ? value : undefined;
};

const readSymbolOrder = (value: unknown): SymbolOrder | undefined =>
  value === "layout" || value === "alphabetical" || value === "appearance" ? value : undefined;

const readFiniteNumber = (value: unknown): number | undefined => {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

/** A number, or null for a dial set to none; anything else is not read. */
const readNullableNumber = (value: unknown): number | null | undefined =>
  value === null ? null : readFiniteNumber(value);

const readRankingTie = (value: unknown): "fewest" | "right" | "left" | undefined =>
  value === "fewest" || value === "right" || value === "left" ? value : undefined;

const readHoldStill = (value: unknown): "click" | "hover" | undefined =>
  value === "click" || value === "hover" ? value : undefined;

const readHistoryAxis = (value: unknown): HistoryAxis | undefined =>
  value === "steps" || value === "time" ? value : undefined;

const readHistoryGranularity = (value: unknown): HistoryGranularity | undefined =>
  HISTORY_GRANULARITIES.find(granularity => granularity === value);

/** A play rate is steps a second: finite and positive. */
const readPlayRate = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;

/**
 * Reads and validates persisted UI state from localStorage.
 *
 * Returns `null` when no entry exists or the stored version does not match
 * {@link PERSISTED_UI_VERSION}. Stale/corrupt entries are removed, and so are
 * the entries of earlier versions.
 */
export const readPersistedUi = (): PersistedUi | null => {
  try {
    for (const retired of RETIRED_UI_KEYS) window.localStorage.removeItem(retired);
    const raw = window.localStorage.getItem(PERSISTED_UI_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      window.localStorage.removeItem(PERSISTED_UI_KEY);
      return null;
    }
    if (parsed.version !== PERSISTED_UI_VERSION) {
      window.localStorage.removeItem(PERSISTED_UI_KEY);
      return null;
    }

    const result: PersistedUi = { version: PERSISTED_UI_VERSION };

    const parsedFilters = getRecord(parsed, "filters");
    if (parsedFilters) {
      const showTests = readBoolean(parsedFilters.showTests);
      const showAssets = readBoolean(parsedFilters.showAssets);
      const showRelatedDocs = readBoolean(parsedFilters.showRelatedDocs);
      const showCitingDocs = readBoolean(parsedFilters.showCitingDocs);
      result.filters = {
        ...(showTests !== undefined ? { showTests } : null),
        ...(showAssets !== undefined ? { showAssets } : null),
        ...(showRelatedDocs !== undefined ? { showRelatedDocs } : null),
        ...(showCitingDocs !== undefined ? { showCitingDocs } : null)
      };
    }

     
    const parsedTuning = getRecord(parsed, "tuning");
    if (parsedTuning) {
      const tuning: SavedTuning = {};

      const layout = readLayoutSettings(parsedTuning);
      if (layout?.forceGraph) tuning.forceGraph = layout.forceGraph;

      const bezierRaw = getRecord(parsedTuning, "bezier");
      if (bezierRaw) {
        const stubFactor = readFiniteNumber(bezierRaw.stubFactor);
        const stubMin = readFiniteNumber(bezierRaw.stubMin);
        const stubMaxOffset = readFiniteNumber(bezierRaw.stubMaxOffset);
        const verticalOffset = readFiniteNumber(bezierRaw.verticalOffset);
        tuning.bezier = {
          ...(stubFactor !== undefined ? { stubFactor } : null),
          ...(stubMin !== undefined ? { stubMin } : null),
          ...(stubMaxOffset !== undefined ? { stubMaxOffset } : null),
          ...(verticalOffset !== undefined ? { verticalOffset } : null)
        };
      }

      const localMapRaw = getRecord(parsedTuning, "localMap");
      if (localMapRaw) {
        const columnGap = readFiniteNumber(localMapRaw.columnGap);
        const hoverDimSymbols = readFiniteNumber(localMapRaw.hoverDimSymbols);
        const hoverDimConnections = readFiniteNumber(localMapRaw.hoverDimConnections);
        const selfLoopTaper = readFiniteNumber(localMapRaw.selfLoopTaper);
        const laceReach = readFiniteNumber(localMapRaw.laceReach);
        const laceCurl = readFiniteNumber(localMapRaw.laceCurl);
        const laceWidth = readFiniteNumber(localMapRaw.laceWidth);
        const collapseOnHover = readBoolean(localMapRaw.collapseOnHover);
        const collapseOnPin = readBoolean(localMapRaw.collapseOnPin);
        const symbolOrder = readSymbolOrder(localMapRaw.symbolOrder);
        const moveMs = readFiniteNumber(localMapRaw.moveMs);
        const holdStill = readHoldStill(localMapRaw.holdStill);
        const searchStarts = readFiniteNumber(localMapRaw.searchStarts);
        const searchPatience = readFiniteNumber(localMapRaw.searchPatience);
        const rankingPull = readFiniteNumber(localMapRaw.rankingPull);
        const rankingTie = readRankingTie(localMapRaw.rankingTie);
        const orderSweeps = readFiniteNumber(localMapRaw.orderSweeps);
        const orderSeed = readNullableNumber(localMapRaw.orderSeed);
        const orderStarts = readFiniteNumber(localMapRaw.orderStarts);
        const crossingCost = readFiniteNumber(localMapRaw.crossingCost);
        const heightCost = readFiniteNumber(localMapRaw.heightCost);
        const churnCost = readFiniteNumber(localMapRaw.churnCost);
        const itemGap = readFiniteNumber(localMapRaw.itemGap);
        const bandGap = readFiniteNumber(localMapRaw.bandGap);
        const membraneNeck = readFiniteNumber(localMapRaw.membraneNeck);
        const membranePadding = readFiniteNumber(localMapRaw.membranePadding);
        const cardMaxWidth = readNullableNumber(localMapRaw.cardMaxWidth);
        const membraneEvenness = readFiniteNumber(localMapRaw.membraneEvenness);
        const membraneSimplicity = readFiniteNumber(localMapRaw.membraneSimplicity);
        const rowLevelness = readFiniteNumber(localMapRaw.rowLevelness);
        const membraneDepth = readNullableNumber(localMapRaw.membraneDepth);
        tuning.localMap = {
          ...(columnGap !== undefined ? { columnGap } : null),
          ...(hoverDimSymbols !== undefined ? { hoverDimSymbols } : null),
          ...(hoverDimConnections !== undefined ? { hoverDimConnections } : null),
          ...(selfLoopTaper !== undefined ? { selfLoopTaper } : null),
          ...(laceReach !== undefined ? { laceReach } : null),
          ...(laceCurl !== undefined ? { laceCurl } : null),
          ...(laceWidth !== undefined ? { laceWidth } : null),
          ...(collapseOnHover !== undefined ? { collapseOnHover } : null),
          ...(collapseOnPin !== undefined ? { collapseOnPin } : null),
          ...(symbolOrder !== undefined ? { symbolOrder } : null),
          ...(moveMs !== undefined ? { moveMs } : null),
          ...(holdStill !== undefined ? { holdStill } : null),
          ...(searchStarts !== undefined ? { searchStarts } : null),
          ...(searchPatience !== undefined ? { searchPatience } : null),
          ...(rankingPull !== undefined ? { rankingPull } : null),
          ...(rankingTie !== undefined ? { rankingTie } : null),
          ...(orderSweeps !== undefined ? { orderSweeps } : null),
          ...(orderSeed !== undefined ? { orderSeed } : null),
          ...(orderStarts !== undefined ? { orderStarts } : null),
          ...(crossingCost !== undefined ? { crossingCost } : null),
          ...(heightCost !== undefined ? { heightCost } : null),
          ...(churnCost !== undefined ? { churnCost } : null),
          ...(itemGap !== undefined ? { itemGap } : null),
          ...(bandGap !== undefined ? { bandGap } : null),
          ...(membraneNeck !== undefined ? { membraneNeck } : null),
          ...(membranePadding !== undefined ? { membranePadding } : null),
          ...(cardMaxWidth !== undefined ? { cardMaxWidth } : null),
          ...(membraneEvenness !== undefined ? { membraneEvenness } : null),
          ...(membraneSimplicity !== undefined ? { membraneSimplicity } : null),
          ...(rowLevelness !== undefined ? { rowLevelness } : null),
          ...(membraneDepth !== undefined ? { membraneDepth } : null),
          ...(layout?.localMap ?? {})
        };
      }

      const historyRaw = getRecord(parsedTuning, "history");
      if (historyRaw) {
        const axis = readHistoryAxis(historyRaw.axis);
        const granularity = readHistoryGranularity(historyRaw.granularity);
        const playRate = readPlayRate(historyRaw.playRate);
        tuning.history = {
          ...(axis !== undefined ? { axis } : null),
          ...(granularity !== undefined ? { granularity } : null),
          ...(playRate !== undefined ? { playRate } : null)
        };
      }

      result.tuning = tuning;
    }
     

    return result;
  } catch {
    try {
      window.localStorage.removeItem(PERSISTED_UI_KEY);
    } catch {
      // ignore
    }
    return null;
  }
};

/**
 * Merges persisted UI state onto factory defaults, producing a complete
 * filters + tuning pair suitable for initialising the Explorer.
 *
 * Each tuning sub-object is spread independently so that a partially-
 * persisted bezier config inherits missing keys from the defaults.
 */
export const applyPersistedUi = (
  defaults: { filters: ExplorerFilters; tuning: TuningConfig },
  persisted: PersistedUi | null
): { filters: ExplorerFilters; tuning: TuningConfig } => {
  if (!persisted) {
    return defaults;
  }

   
  const filters: ExplorerFilters = {
    ...defaults.filters,
    ...(persisted.filters ?? {})
  };

  const tuning: TuningConfig = {
    ...defaults.tuning,
    bezier: {
      ...defaults.tuning.bezier,
      ...(persisted.tuning?.bezier ?? {})
    },
    localMap: {
      ...defaults.tuning.localMap,
      ...(persisted.tuning?.localMap ?? {})
    },
    forceGraph: {
      ...defaults.tuning.forceGraph,
      ...(persisted.tuning?.forceGraph ?? {})
    },
    history: {
      ...defaults.tuning.history,
      ...(persisted.tuning?.history ?? {})
    }
  };
   

   
  return { filters, tuning };
};

// ─────────────────────────────────────────────────────────────────────────
// Persisted Navigation State (view + node selection)
// ─────────────────────────────────────────────────────────────────────────

/** localStorage key for persisted navigation state (active view + map subject). */
export const PERSISTED_NAV_KEY = "live-docs-explorer:nav:v1";
/** Schema version tag embedded in persisted navigation payloads. */
export const PERSISTED_NAV_VERSION = 1 as const;

/** Shape of the versioned navigation state written to localStorage under {@link PERSISTED_NAV_KEY}. */
export type PersistedNavV1 = {
  version: typeof PERSISTED_NAV_VERSION;
  view?: ViewName;
  perspective?: LocalMapPerspective;
  /** The 3D Local Map's layout, remembered with the perspective (2026-10-14). */
  spatialLayout?: SpatialLayout;
  openDirectories?: string[];
  nodeId?: string | null;
  /** Explicitly open evidence, separate from the remembered map subject. */
  inspection?: InspectionTarget | null;
};

/** Validate stored target syntax here; the application checks its membership against the current bundle. */
function readPersistedInspection(value: unknown): InspectionTarget | null {
  if (!isRecord(value)) return null;
  if (value.kind === "file" && typeof value.nodeId === "string" && value.nodeId) {
    return {
      kind: "file",
      nodeId: value.nodeId,
      ...(typeof value.symbol === "string" && value.symbol ? { symbol: value.symbol } : {})
    };
  }
  if (value.kind === "directory" && typeof value.directory === "string") {
    return { kind: "directory", directory: value.directory };
  }
  if (value.kind === "bundled-doc" && typeof value.path === "string" && value.path) {
    return {
      kind: "bundled-doc",
      path: value.path,
      ...(typeof value.fragment === "string" && value.fragment ? { fragment: value.fragment } : {})
    };
  }
  return null;
}

/**
 * Reads and validates persisted navigation state from localStorage.
 *
 * Returns `null` when no entry exists or the stored version does not match
 * {@link PERSISTED_NAV_VERSION}. Only known view names are accepted; unknown
 * values are silently discarded.
 */
export const readPersistedNav = (): PersistedNavV1 | null => {
  try {
    const raw = window.localStorage.getItem(PERSISTED_NAV_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      window.localStorage.removeItem(PERSISTED_NAV_KEY);
      return null;
    }
    if (parsed.version !== PERSISTED_NAV_VERSION) {
      window.localStorage.removeItem(PERSISTED_NAV_KEY);
      return null;
    }

    const viewCandidate = parsed.view;
    const nodeIdCandidate = parsed.nodeId;

    const view = typeof viewCandidate === "string" ? readView(viewCandidate) : undefined;
    const perspective = readPerspective(parsed.perspective, viewCandidate);
    const spatialLayout = readSpatialLayout(parsed.spatialLayout);
    const openDirectories = Array.isArray(parsed.openDirectories)
      ? parsed.openDirectories.filter((entry): entry is string => typeof entry === "string") : [];

    const nodeId: string | null | undefined =
      typeof nodeIdCandidate === "string" ? nodeIdCandidate : nodeIdCandidate === null ? null : undefined;

    return {
      version: PERSISTED_NAV_VERSION,
      ...(view ? { view } : null),
      perspective,
      spatialLayout,
      openDirectories,
      inspection: readPersistedInspection(parsed.inspection),
      ...(nodeId !== undefined ? { nodeId } : null)
    };
  } catch {
    try {
      window.localStorage.removeItem(PERSISTED_NAV_KEY);
    } catch {
      // ignore
    }
    return null;
  }
};

/** Timer handle for debounced UI persistence */
export type PersistUiScheduler = {
  schedule: () => void;
};

/** Timer handle for debounced nav persistence */
export type PersistNavScheduler = {
  schedule: () => void;
};

/** True when two settings hold the same value: numbers, strings, booleans, null, or a plain object or list of them. */
const sameSetting = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/** The settings of one group that differ from its defaults, or `undefined` when none does. */
const changedIn = <T extends object>(values: T, defaults: T): Partial<T> | undefined => {
  const changed: Partial<T> = {};
  let any = false;
  for (const key of Object.keys(values) as Array<keyof T>) {
    if (sameSetting(values[key], defaults[key])) continue;
    changed[key] = values[key];
    any = true;
  }
  return any ? changed : undefined;
};

/**
 * What of the filters and the tuning a person has changed: every setting that differs from the defaults, and nothing
 * else, so that a default changed later reaches every setting they never touched.
 */
export const changedFromDefaults = (
  state: { filters: ExplorerFilters; tuning: TuningConfig },
  defaults: { filters: ExplorerFilters; tuning: TuningConfig }
): Pick<PersistedUi, "filters" | "tuning"> => {
  const filters = changedIn(state.filters, defaults.filters);
  const tuning: SavedTuning = {};
  for (const group of Object.keys(state.tuning) as Array<keyof TuningConfig>) {
    const changed = changedIn<object>(state.tuning[group], defaults.tuning[group]);
    if (changed) (tuning as Record<string, object>)[group] = changed;
  }
  return { ...(filters ? { filters } : null), ...(Object.keys(tuning).length > 0 ? { tuning } : null) };
};

/**
 * Create a debounced UI persistence scheduler.
 * Writes what of the filters and tuning differs from the defaults to localStorage after a 150ms debounce.
 */
export const createPersistUiScheduler = (
  getState: () => { filters: ExplorerFilters; tuning: TuningConfig }
): PersistUiScheduler => {
  let timer: number | null = null;

  return {
    schedule: (): void => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        timer = null;
        try {
          const payload: PersistedUi = {
            version: PERSISTED_UI_VERSION,
            ...changedFromDefaults(getState(), { filters: getDefaultFilters(), tuning: getDefaultTuning() })
          };
          window.localStorage.setItem(PERSISTED_UI_KEY, JSON.stringify(payload));
        } catch {
          // ignore (storage may be unavailable/blocked)
        }
      }, 150);
    }
  };
};

/**
 * Create a debounced navigation persistence scheduler.
 * Writes view, map subject and independently open evidence to localStorage after a 150ms debounce.
 * Inspecting a different file never replaces the remembered subject.
 */
export const createPersistNavScheduler = (
  getState: () => { view: ViewName; perspective: LocalMapPerspective; spatialLayout: SpatialLayout; openDirectories: ReadonlySet<string>; selectedNodeId: string | null; inspection: InspectionTarget | null }
): PersistNavScheduler => {
  let timer: number | null = null;

  return {
    schedule: (): void => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        timer = null;
        try {
          const state = getState();
          const payload: PersistedNavV1 = {
            version: PERSISTED_NAV_VERSION,
            view: state.view,
            perspective: state.perspective,
            spatialLayout: state.spatialLayout,
            openDirectories: [...state.openDirectories],
            nodeId: state.selectedNodeId,
            inspection: readPersistedInspection(state.inspection)
          };
          window.localStorage.setItem(PERSISTED_NAV_KEY, JSON.stringify(payload));
        } catch {
          // ignore
        }
      }, 150);
    }
  };
};

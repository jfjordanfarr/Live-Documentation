/**
 * LocalStorage Persistence
 * 
 * Handles persisting and restoring UI state (filters, tuning) and navigation
 * state (view, node selection) across browser sessions.
 */

import type { ExplorerFilters, TuningConfig, ViewName } from "../types";

// ─────────────────────────────────────────────────────────────────────────
// Persisted UI State (tuning + filters)
// ─────────────────────────────────────────────────────────────────────────

export const PERSISTED_UI_KEY = "live-docs-explorer:ui:v1";
export const PERSISTED_UI_VERSION = 1 as const;

export type PersistedUiV1 = {
  version: typeof PERSISTED_UI_VERSION;
  filters?: Partial<ExplorerFilters>;
  tuning?: Partial<TuningConfig>;
};

export const getDefaultFilters = (): ExplorerFilters => ({
  showTests: true,
  showAssets: false,
  showRelatedDocs: false
});

export const getDefaultTuning = (): TuningConfig => ({
  bezier: {
    stubFactor: 0.8,
    stubMin: 8,
    stubMaxOffset: 40,
    verticalOffset: 0
  },
  clickBehavior: {
    singleClickFocusOnly: true,
    doubleClickRecenter: true
  },
  visual: {
    showTypeBadges: true,
    alchemyGlow: true
  },
  localMap: {
    columnGap: 100,
    hoverDimSymbols: 0.5,
    hoverDimConnections: 0.1,
    selfLoopTaper: 0.2,
    collapseOnHover: false,
    collapseOnPin: true
  }
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

const readFiniteNumber = (value: unknown): number | undefined => {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

export const readPersistedUi = (): PersistedUiV1 | null => {
  try {
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

    const result: PersistedUiV1 = { version: PERSISTED_UI_VERSION };

    const parsedFilters = getRecord(parsed, "filters");
    if (parsedFilters) {
      const showTests = readBoolean(parsedFilters.showTests);
      const showAssets = readBoolean(parsedFilters.showAssets);
      const showRelatedDocs = readBoolean(parsedFilters.showRelatedDocs);
      result.filters = {
        ...(showTests !== undefined ? { showTests } : null),
        ...(showAssets !== undefined ? { showAssets } : null),
        ...(showRelatedDocs !== undefined ? { showRelatedDocs } : null)
      };
    }

     
    const parsedTuning = getRecord(parsed, "tuning");
    if (parsedTuning) {
      const tuning: Partial<TuningConfig> = {};

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

      const clickBehaviorRaw = getRecord(parsedTuning, "clickBehavior");
      if (clickBehaviorRaw) {
        const singleClickFocusOnly = readBoolean(clickBehaviorRaw.singleClickFocusOnly);
        const doubleClickRecenter = readBoolean(clickBehaviorRaw.doubleClickRecenter);
        tuning.clickBehavior = {
          ...(singleClickFocusOnly !== undefined ? { singleClickFocusOnly } : null),
          ...(doubleClickRecenter !== undefined ? { doubleClickRecenter } : null)
        };
      }

      const visualRaw = getRecord(parsedTuning, "visual");
      if (visualRaw) {
        const showTypeBadges = readBoolean(visualRaw.showTypeBadges);
        const alchemyGlow = readBoolean(visualRaw.alchemyGlow);
        tuning.visual = {
          ...(showTypeBadges !== undefined ? { showTypeBadges } : null),
          ...(alchemyGlow !== undefined ? { alchemyGlow } : null)
        };
      }

      const localMapRaw = getRecord(parsedTuning, "localMap");
      if (localMapRaw) {
        const columnGap = readFiniteNumber(localMapRaw.columnGap);
        const hoverDimSymbols = readFiniteNumber(localMapRaw.hoverDimSymbols);
        const hoverDimConnections = readFiniteNumber(localMapRaw.hoverDimConnections);
        const selfLoopTaper = readFiniteNumber(localMapRaw.selfLoopTaper);
        const collapseOnHover = readBoolean(localMapRaw.collapseOnHover);
        const collapseOnPin = readBoolean(localMapRaw.collapseOnPin);
        tuning.localMap = {
          ...(columnGap !== undefined ? { columnGap } : null),
          ...(hoverDimSymbols !== undefined ? { hoverDimSymbols } : null),
          ...(hoverDimConnections !== undefined ? { hoverDimConnections } : null),
          ...(selfLoopTaper !== undefined ? { selfLoopTaper } : null),
          ...(collapseOnHover !== undefined ? { collapseOnHover } : null),
          ...(collapseOnPin !== undefined ? { collapseOnPin } : null)
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

export const applyPersistedUi = (
  defaults: { filters: ExplorerFilters; tuning: TuningConfig },
  persisted: PersistedUiV1 | null
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
    clickBehavior: {
      ...defaults.tuning.clickBehavior,
      ...(persisted.tuning?.clickBehavior ?? {})
    },
    visual: {
      ...defaults.tuning.visual,
      ...(persisted.tuning?.visual ?? {})
    },
    localMap: {
      ...defaults.tuning.localMap,
      ...(persisted.tuning?.localMap ?? {})
    }
  };
   

   
  return { filters, tuning };
};

// ─────────────────────────────────────────────────────────────────────────
// Persisted Navigation State (view + node selection)
// ─────────────────────────────────────────────────────────────────────────

export const PERSISTED_NAV_KEY = "live-docs-explorer:nav:v1";
export const PERSISTED_NAV_VERSION = 1 as const;

export type PersistedNavV1 = {
  version: typeof PERSISTED_NAV_VERSION;
  view?: ViewName;
  nodeId?: string | null;
};

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

    const view: ViewName | undefined =
      viewCandidate === "circuit" || viewCandidate === "map" || viewCandidate === "graph" || viewCandidate === "sources" ? viewCandidate : undefined;

    const nodeId: string | null | undefined =
      typeof nodeIdCandidate === "string" ? nodeIdCandidate : nodeIdCandidate === null ? null : undefined;

    return {
      version: PERSISTED_NAV_VERSION,
      ...(view ? { view } : null),
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

/**
 * Create a debounced UI persistence scheduler.
 * Writes filters and tuning to localStorage after a 150ms debounce.
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
          const state = getState();
          const payload: PersistedUiV1 = {
            version: PERSISTED_UI_VERSION,
            filters: state.filters,
            tuning: state.tuning
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
 * Writes view and focused node to localStorage after a 150ms debounce.
 */
export const createPersistNavScheduler = (
  getState: () => { view: ViewName; focusedNodeId: string | null; selectedNodeId: string | null }
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
            nodeId: state.focusedNodeId ?? state.selectedNodeId ?? null
          };
          window.localStorage.setItem(PERSISTED_NAV_KEY, JSON.stringify(payload));
        } catch {
          // ignore
        }
      }, 150);
    }
  };
};

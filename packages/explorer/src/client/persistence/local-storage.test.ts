import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_SNAPSHOT, scrubSnapshot } from "./compressed-url-state";
import {
  applyPersistedUi,
  changedFromDefaults,
  createPersistNavScheduler,
  createPersistUiScheduler,
  PERSISTED_NAV_KEY,
  readPersistedNav,
  getDefaultFilters,
  getDefaultTuning,
  PERSISTED_UI_KEY,
  PERSISTED_UI_VERSION,
  readPersistedUi
} from "./local-storage";
import type { InspectionTarget } from "../types";

const restoreTuning = (group: string, saved: string) => {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => key === PERSISTED_UI_KEY
        ? `{"version":${PERSISTED_UI_VERSION},"tuning":{"${group}":${saved}}}` : null,
      removeItem: vi.fn()
    }
  });
  return applyPersistedUi(
    { filters: getDefaultFilters(), tuning: getDefaultTuning() },
    readPersistedUi()
  ).tuning;
};

const restoreLocalMap = (saved: string) => restoreTuning("localMap", saved).localMap;

afterEach(() => vi.unstubAllGlobals());

describe("persisted membrane tuning", () => {
  it("adds the simplicity default to older settings while retaining the independent shape preferences", () => {
    expect(restoreLocalMap('{"membraneEvenness":2.5,"rowLevelness":1.25}')).toMatchObject({
      membraneEvenness: 2.5,
      membraneSimplicity: 200,
      rowLevelness: 1.25
    });
  });

  it.each([0, 50, 100, 1000])("restores a saved simplicity weight of %s", value => {
    expect(restoreLocalMap(`{"membraneSimplicity":${value}}`).membraneSimplicity).toBe(value);
  });

  it.each(["null", '"50"', "true", "{}", "[]", "1e999", "-1e999"])(
    "falls back from an invalid simplicity weight of %s without losing other saved tuning",
    value => {
      expect(restoreLocalMap(`{"membraneSimplicity":${value},"membraneEvenness":3,"rowLevelness":0.5}`))
        .toMatchObject({ membraneSimplicity: 200, membraneEvenness: 3, rowLevelness: 0.5 });
    }
  );
});

describe("persisted history tuning (2026-10-18)", () => {
  it("starts from steps laid out by date, linear time, since 2026-10-22, the ticks chosen automatically and two steps a second", () => {
    expect(getDefaultTuning().history).toEqual({ axis: "time", granularity: "auto", playRate: 2 });
  });

  it("restores a saved axis, granularity and play rate, and keeps the defaults for what is missing", () => {
    expect(restoreTuning("history", '{"axis":"steps","granularity":"month"}').history).toEqual({ axis: "steps", granularity: "month", playRate: 2 });
    expect(restoreTuning("history", '{"playRate":0.5}').history).toEqual({ axis: "time", granularity: "auto", playRate: 0.5 });
  });

  it.each(['{"axis":"sideways"}', '{"granularity":"fortnight"}', '{"playRate":0}', '{"playRate":"fast"}', '{"playRate":-2}'])(
    "falls back from an invalid history setting of %s to the default",
    saved => {
      expect(restoreTuning("history", saved).history).toEqual({ axis: "time", granularity: "auto", playRate: 2 });
    }
  );
});

describe("saving only what a person changed (2026-10-22)", () => {
  const defaults = () => ({ filters: getDefaultFilters(), tuning: getDefaultTuning() });

  it("finds nothing to save at the defaults, and only the settings that differ from them otherwise", () => {
    expect(changedFromDefaults(defaults(), defaults())).toEqual({});
    const state = defaults();
    state.filters.showAssets = true;
    state.tuning.forceGraph.tether = 0.02;
    state.tuning.history.axis = "steps";
    expect(changedFromDefaults(state, defaults())).toEqual({
      filters: { showAssets: true },
      tuning: { forceGraph: { tether: 0.02 }, history: { axis: "steps" } }
    });
  });

  it("writes only the changes, so that a default changed later reaches what was never touched", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) },
      setTimeout: (run: () => void) => { run(); return 1; },
      clearTimeout: () => undefined
    });
    const state = defaults();
    state.tuning.forceGraph.gravity = 0.03;
    createPersistUiScheduler(() => state).schedule();
    expect(JSON.parse(store.get(PERSISTED_UI_KEY)!)).toEqual({ version: PERSISTED_UI_VERSION, tuning: { forceGraph: { gravity: 0.03 } } });
    const restored = applyPersistedUi(defaults(), readPersistedUi());
    expect(restored.tuning.forceGraph.gravity).toBe(0.03);
    expect(restored.tuning.history.axis).toBe(getDefaultTuning().history.axis);
  });

  it("removes a version 1 entry unread, since it held every setting and cannot tell a choice from an old default", () => {
    const store = new Map<string, string>([["live-docs-explorer:ui:v1", '{"version":1,"tuning":{"history":{"axis":"steps"}}}']]);
    vi.stubGlobal("window", {
      localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) }
    });
    expect(readPersistedUi()).toBeNull();
    expect(store.size).toBe(0);
  });
});

describe("remembered map subject and reader evidence", () => {
  const saved = new Map<string, string>();

  beforeEach(() => {
    saved.clear();
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => saved.get(key) ?? null,
        setItem: (key: string, value: string) => { saved.set(key, value); },
        removeItem: (key: string) => { saved.delete(key); }
      },
      setTimeout,
      clearTimeout
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("saves and restores an independently inspected symbol, then remembers closing it", () => {
    let inspection: InspectionTarget | null = { kind: "file", nodeId: "src/b.ts", symbol: "run" };
    const scheduler = createPersistNavScheduler(() => ({
      view: "map",
      perspective: "3d",
      spatialLayout: "structure",
      selectedNodeId: "src/a.ts",
      openDirectories: new Set(["src"]),
      inspection
    }));
    scheduler.schedule();
    vi.advanceTimersByTime(150);
    expect(readPersistedNav()).toMatchObject({
      nodeId: "src/a.ts",
      inspection: { kind: "file", nodeId: "src/b.ts", symbol: "run" }
    });
    inspection = null;
    scheduler.schedule();
    vi.advanceTimersByTime(150);
    expect(JSON.parse(saved.get(PERSISTED_NAV_KEY)!)).toMatchObject({ nodeId: "src/a.ts", inspection: null });
    expect(readPersistedNav()?.inspection).toBeNull();
  });

  it("reads old places with the reader closed and keeps valid navigation when the evidence shape is invalid", () => {
    for (const inspection of [undefined, null, 7, [], { kind: "file", nodeId: "" }, { kind: "directory", directory: 1 }, { kind: "bundled-doc", path: false }]) {
      saved.set(PERSISTED_NAV_KEY, JSON.stringify({ version: 1, view: "map", nodeId: "src/a.ts", inspection }));
      expect(readPersistedNav()).toMatchObject({ nodeId: "src/a.ts", inspection: null });
    }
  });

  it("preserves a document section and the scan root while current-bundle validation removes stale targets", () => {
    const nodes = new Map([["src/a.ts", { publicSymbols: ["start"] }]]);
    for (const inspection of [
      { kind: "directory", directory: "" } as const,
      { kind: "bundled-doc", path: "docs/guide.notes", fragment: "turn-24" } as const
    ]) {
      saved.set(PERSISTED_NAV_KEY, JSON.stringify({ version: 1, nodeId: "src/a.ts", inspection }));
      const remembered = readPersistedNav()!;
      expect(remembered.inspection).toEqual(inspection);
      const live = scrubSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: remembered.nodeId ?? null, inspection: remembered.inspection },
        nodes, { "docs/guide.notes": "" });
      expect(live.inspection).toEqual(inspection);
      expect(live.selectedNodeId).toBe("src/a.ts");
    }
    saved.set(PERSISTED_NAV_KEY, JSON.stringify({ version: 1, nodeId: "src/a.ts", inspection: { kind: "file", nodeId: "removed.ts" } }));
    const remembered = readPersistedNav()!;
    expect(scrubSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: remembered.nodeId ?? null, inspection: remembered.inspection }, nodes))
      .toMatchObject({ selectedNodeId: "src/a.ts", inspection: null });
  });
});

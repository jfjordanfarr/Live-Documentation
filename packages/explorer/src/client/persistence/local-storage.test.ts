import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyPersistedUi,
  getDefaultFilters,
  getDefaultTuning,
  PERSISTED_UI_KEY,
  readPersistedUi
} from "./local-storage";

const restoreTuning = (group: string, saved: string) => {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => key === PERSISTED_UI_KEY
        ? `{"version":1,"tuning":{"${group}":${saved}}}` : null,
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
  it("starts from steps laid out evenly, the ticks chosen automatically and two steps a second", () => {
    expect(getDefaultTuning().history).toEqual({ axis: "steps", granularity: "auto", playRate: 2 });
  });

  it("restores a saved axis, granularity and play rate, and keeps the defaults for what is missing", () => {
    expect(restoreTuning("history", '{"axis":"time","granularity":"month"}').history).toEqual({ axis: "time", granularity: "month", playRate: 2 });
    expect(restoreTuning("history", '{"playRate":0.5}').history).toEqual({ axis: "steps", granularity: "auto", playRate: 0.5 });
  });

  it.each(['{"axis":"sideways"}', '{"granularity":"fortnight"}', '{"playRate":0}', '{"playRate":"fast"}', '{"playRate":-2}'])(
    "falls back from an invalid history setting of %s to the default",
    saved => {
      expect(restoreTuning("history", saved).history).toEqual({ axis: "steps", granularity: "auto", playRate: 2 });
    }
  );
});

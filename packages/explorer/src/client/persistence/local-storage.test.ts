import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyPersistedUi,
  getDefaultFilters,
  getDefaultTuning,
  PERSISTED_UI_KEY,
  readPersistedUi
} from "./local-storage";

const restoreLocalMap = (saved: string) => {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => key === PERSISTED_UI_KEY
        ? `{"version":1,"tuning":{"localMap":${saved}}}` : null,
      removeItem: vi.fn()
    }
  });
  return applyPersistedUi(
    { filters: getDefaultFilters(), tuning: getDefaultTuning() },
    readPersistedUi()
  ).tuning.localMap;
};

afterEach(() => vi.unstubAllGlobals());

describe("persisted membrane tuning", () => {
  it("adds the simplicity default to older settings while retaining the independent shape preferences", () => {
    expect(restoreLocalMap('{"membraneEvenness":2.5,"rowLevelness":1.25}')).toMatchObject({
      membraneEvenness: 2.5,
      membraneSimplicity: 100,
      rowLevelness: 1.25
    });
  });

  it.each([0, 50, 1000])("restores a saved simplicity weight of %s", value => {
    expect(restoreLocalMap(`{"membraneSimplicity":${value}}`).membraneSimplicity).toBe(value);
  });

  it.each(["null", '"50"', "true", "{}", "[]", "1e999", "-1e999"])(
    "falls back from an invalid simplicity weight of %s without losing other saved tuning",
    value => {
      expect(restoreLocalMap(`{"membraneSimplicity":${value},"membraneEvenness":3,"rowLevelness":0.5}`))
        .toMatchObject({ membraneSimplicity: 100, membraneEvenness: 3, rowLevelness: 0.5 });
    }
  );
});

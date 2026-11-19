import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { changedFromDefaults, getDefaultFilters, getDefaultTuning } from "../persistence/local-storage";
import type { TuningConfig } from "../types";
import { changedSettings, changedSettingsWords, tuningControlId, type ChangedSetting } from "./tuning-changes";

const template = readFileSync(path.resolve(__dirname, "../../shared/template.html"), "utf8");

/** The tuning controls the template declares: every range input and select whose id begins `tuning-`. */
const templateControlIds = (): string[] =>
  [...template.matchAll(/<(?:input type="range"|select)[^>]*\bid="(tuning-[^"]+)"/g)].map(match => match[1]);

/** Every setting the tuning holds, changed or not. */
const everySetting = (tuning: TuningConfig): ChangedSetting[] =>
  (Object.keys(tuning) as Array<keyof TuningConfig>).flatMap(group => Object.keys(tuning[group]).map(key => ({ group, key })));

describe("the Tuning settings that differ from the defaults", () => {
  it("are none at the defaults", () => {
    expect(changedSettings(getDefaultTuning(), getDefaultTuning())).toEqual([]);
  });

  it("are each setting moved, in any group, and only those", () => {
    const tuning = getDefaultTuning();
    tuning.bezier.stubMin = 20;
    tuning.appearance.palette = "proposed";
    tuning.forceGraph.hops = 3;
    tuning.localMap.directoryLayout = "grid";
    expect(changedSettings(tuning, getDefaultTuning())).toEqual([
      { group: "bezier", key: "stubMin" },
      { group: "localMap", key: "directoryLayout" },
      { group: "forceGraph", key: "hops" },
      { group: "appearance", key: "palette" }
    ]);
  });

  it("leave out the frame, which places the page's controls and draws nothing", () => {
    const tuning = getDefaultTuning();
    tuning.appearance.frame = "bare";
    expect(changedSettings(tuning, getDefaultTuning())).toEqual([]);
  });

  it("forget a setting moved and moved back, and read a dial set to none as a change from a number", () => {
    const tuning = getDefaultTuning();
    tuning.localMap.columnGap = 140;
    tuning.localMap.columnGap = getDefaultTuning().localMap.columnGap;
    expect(changedSettings(tuning, getDefaultTuning())).toEqual([]);
    tuning.localMap.orderSeed = 7;
    expect(changedSettings(tuning, getDefaultTuning())).toEqual([{ group: "localMap", key: "orderSeed" }]);
  });

  it("are exactly what the browser keeps of the tuning, and leave the filters out", () => {
    const tuning = getDefaultTuning();
    tuning.history.playRate = 4;
    tuning.localMap.laceCurl = 20;
    const filters = { ...getDefaultFilters(), showAssets: true };
    const kept = changedFromDefaults({ filters, tuning }, { filters: getDefaultFilters(), tuning: getDefaultTuning() });
    const keptSettings = Object.entries(kept.tuning ?? {}).flatMap(([group, values]) => Object.keys(values ?? {}).map(key => `${group}.${key}`));
    expect(changedSettings(tuning, getDefaultTuning()).map(({ group, key }) => `${group}.${key}`).sort()).toEqual(keptSettings.sort());
  });
});

describe("the control that shows a setting", () => {
  it("is named by the group's prefix and the key in kebab case", () => {
    expect(tuningControlId({ group: "forceGraph", key: "linkGap" })).toBe("tuning-force-link-gap");
    expect(tuningControlId({ group: "history", key: "changeEmphasis" })).toBe("tuning-history-change-emphasis");
    expect(tuningControlId({ group: "appearance", key: "palette" })).toBe("tuning-palette");
    expect(tuningControlId({ group: "bezier", key: "stubMaxOffset" })).toBe("tuning-stub-max-offset");
  });

  it("is found for every lever in the template, so that a changed lever is always marked", () => {
    const named = new Set(everySetting(getDefaultTuning()).map(tuningControlId));
    const unnamed = templateControlIds().filter(id => !named.has(id));
    expect(unnamed, "a lever whose id no setting names would never carry its mark").toEqual([]);
  });
});

describe("the count's words", () => {
  it("say how many settings differ, in the singular for one", () => {
    expect(changedSettingsWords(1)).toBe("1 setting changed from its default");
    expect(changedSettingsWords(3)).toBe("3 settings changed from their defaults");
  });
});

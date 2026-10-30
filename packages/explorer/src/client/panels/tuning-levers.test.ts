import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getDefaultTuning } from "../persistence/local-storage";
import type { TuningConfig } from "../types";
import { TUNING_HELP, tuningHelpId } from "./tuning-levers";

const template = readFileSync(path.resolve(__dirname, "../../shared/template.html"), "utf8");

/** The tuning controls the template declares: every range input and select whose id begins `tuning-`. */
const templateControlIds = (): string[] =>
  [...template.matchAll(/<(?:input type="range"|select)[^>]*\bid="(tuning-[^"]+)"/g)].map(match => match[1]);

describe("tuning help", () => {
  it("covers every tuning control in the template, and names no control the template lacks", () => {
    const ids = templateControlIds();
    expect(ids.length).toBe(43);
    expect(Object.keys(TUNING_HELP).sort()).toEqual([...ids].sort());
  });

  it("says each control's effect in one short sentence", () => {
    for (const [id, sentence] of Object.entries(TUNING_HELP)) {
      expect(sentence, id).toMatch(/^[A-Z][^.!?]*\.$/);
      expect(sentence.length, id).toBeLessThanOrEqual(120);
    }
  });

  it("leaves the sentences to the table: the template carries none of its own", () => {
    expect(template).not.toMatch(/class="tuning-slider" title=/);
  });

  it("names a description element apart from the control's own id", () => {
    expect(tuningHelpId("tuning-force-gravity")).toBe("tuning-force-gravity-help");
  });
});

/**
 * The setting a control stands for, from its id: `tuning-force-…` in the 3D layout's group, `tuning-history-…` in the
 * history's, and any other in whichever of the 2D groups, the wires' or the layout's, has the key. The key is the rest of
 * the id in camel case, `tuning-row-levelness` for `rowLevelness`.
 */
function settingOf(id: string, defaults: TuningConfig): { group: keyof TuningConfig; key: string } {
  const rest = id.replace(/^tuning-/, "");
  const camel = (name: string): string => name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
  if (rest.startsWith("force-")) return { group: "forceGraph", key: camel(rest.slice("force-".length)) };
  if (rest.startsWith("history-")) return { group: "history", key: camel(rest.slice("history-".length)) };
  const key = camel(rest);
  const groups = (["bezier", "localMap"] as const).filter(group => key in defaults[group]);
  if (groups.length !== 1) throw new Error(`${id}: ${key} names ${groups.length} settings`);
  return { group: groups[0], key };
}

/** What the template shows before the panel syncs from the state: a slider's value and its readout, a select's chosen option. */
function initialOf(id: string): { value: string; readout?: string } {
  const select = new RegExp(`<select id="${id}">([\\s\\S]*?)</select>`).exec(template);
  if (select) {
    const options = [...select[1].matchAll(/<option value="([^"]*)"( selected)?>/g)];
    return { value: (options.find(option => option[2]) ?? options[0])[1] };
  }
  const input = new RegExp(`<input type="range" id="${id}"[^>]*\\bvalue="([^"]*)"`).exec(template);
  const readout = new RegExp(`<output id="${id}-value">([^<]*)</output>`).exec(template);
  if (!input || !readout) throw new Error(`${id}: no slider with a value and a readout`);
  return { value: input[1], readout: readout[1] };
}

describe("the template's initial tuning values", () => {
  // The panel overwrites every control from the state as it starts, so a stale value here shows only before that sync,
  // and in the markup itself; on 2026-10-30 Row Levelness read 0.25 and Axis "By step" against defaults of 2 and by date.
  it("equal the defaults in getDefaultTuning for every control", () => {
    const defaults = getDefaultTuning();
    const ids = templateControlIds();
    expect(ids.length).toBe(43);
    for (const id of ids) {
      const { group, key } = settingOf(id, defaults);
      const expected = (defaults[group] as unknown as Record<string, unknown>)[key];
      expect(expected, `${id} names ${group}.${key}`).toBeDefined();
      const { value, readout } = initialOf(id);
      if (typeof expected === "number") {
        expect(Number(value), id).toBe(expected);
        expect(Number(readout), `${id}'s readout`).toBe(expected);
      } else {
        expect(value, id).toBe(expected);
      }
    }
  });
});

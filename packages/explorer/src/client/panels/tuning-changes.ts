/**
 * Which Tuning settings differ from the defaults: the one answer behind the count beside Tuning's heading, the mark on a
 * changed lever, and whether Reset to defaults has anything to do. It reads the same comparison the saved settings are
 * written by (`changedTuningFromDefaults`), so that what the panel says is changed is exactly what the browser keeps.
 *
 * Pure-function module: no DOM.
 *
 * @module tuning-changes
 */

import { changedTuningFromDefaults } from "../persistence/local-storage";
import type { TuningConfig } from "../types";

/** One setting that differs from its default: its group and its key in that group. */
export interface ChangedSetting {
  group: keyof TuningConfig;
  key: string;
}

/** Every Tuning setting that differs from `defaults`, group by group in the order the tuning holds them. */
export function changedSettings(tuning: TuningConfig, defaults: TuningConfig): ChangedSetting[] {
  const changed = changedTuningFromDefaults(tuning, defaults) ?? {};
  // The frame is where the page puts its controls, not how the picture is drawn: it is neither counted nor reset (the
  // Bare frame's trial, 2026-11-19), so that a viewer under Bare is not told of a change and Reset does not take the
  // sheet it stands in away. Which way the 2D picture reads is how a person looks at the map, not a tuned lever (the
  // toolbar's mirror button, 2026-11-22): it is neither counted nor reset either, so that a press the owner expects to
  // make "all the time" is not reported as a changed setting and Reset does not turn the picture round.
  return (Object.keys(changed) as Array<keyof TuningConfig>).flatMap(group =>
    Object.keys(changed[group] ?? {}).filter(key => !(group === "appearance" && VIEWERS_OWN.has(key))).map(key => ({ group, key })));
}

/** The appearance settings that are the viewer's own and no lever of Tuning's: neither counted nor reset. */
const VIEWERS_OWN: ReadonlySet<string> = new Set<keyof TuningConfig["appearance"]>(["frame", "reads"]);

/**
 * Writes `next` into the tuning the views hold, group by group, so that no view keeps a stale record; what is the
 * viewer's own and not counted stays as they have it. A reset and its taking back both go through here.
 */
export function takeTuning(into: TuningConfig, next: TuningConfig): void {
  const { frame, reads } = into.appearance;
  for (const group of Object.keys(next) as Array<keyof TuningConfig>) Object.assign(into[group], next[group]);
  Object.assign(into.appearance, { frame, reads });
}

/** The prefix of a group's controls' ids in the template: the 3D map's and the history's levers name their group. */
const CONTROL_PREFIX: Readonly<Record<keyof TuningConfig, string>> = {
  bezier: "tuning-",
  localMap: "tuning-",
  forceGraph: "tuning-force-",
  history: "tuning-history-",
  appearance: "tuning-"
};

/**
 * The element id of the control that sets a setting, by the template's naming: the group's prefix and the key in
 * kebab case (`forceGraph.linkGap` is `tuning-force-link-gap`). A setting no lever shows has no such element.
 */
export function tuningControlId(setting: ChangedSetting): string {
  return CONTROL_PREFIX[setting.group] + setting.key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/** What the count beside Tuning's heading says to a screen reader and on hover. */
export function changedSettingsWords(count: number): string {
  return count === 1 ? "1 setting changed from its default" : `${count} settings changed from their defaults`;
}

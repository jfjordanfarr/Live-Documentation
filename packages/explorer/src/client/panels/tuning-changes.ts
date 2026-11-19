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
  return (Object.keys(changed) as Array<keyof TuningConfig>).flatMap(group =>
    Object.keys(changed[group] ?? {}).map(key => ({ group, key })));
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

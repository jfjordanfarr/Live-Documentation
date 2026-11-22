/**
 * Reset to defaults, and what tells a person their Tuning differs from the defaults: the count beside Tuning's heading,
 * seen while the section is folded, and a mark on each changed lever and on each group heading that holds one. So that
 * the owner and the agent who sends them a link can tell at a glance whether they see the same picture, and make it so
 * with one press (the owner, 2026-11-19).
 *
 * The reset is the World Map's Reset layout in another place: a press puts every lever back at its default and keeps
 * what they were; a second press before any lever moves puts them back as they were; a toggle whose name stays and
 * whose pressed state says that a reset stands to be taken back.
 *
 * @module tuning-reset
 */

import { announce } from "../announce";
import { getDefaultTuning } from "../persistence/local-storage";
import type { ExplorerState, TuningConfig } from "../types";
import { changedSettings, changedSettingsWords, takeTuning, tuningControlId } from "./tuning-changes";

/** What the reset needs of the Tuning panel. */
export interface TuningResetConfig {
  state: ExplorerState;
  /** Shows `state.tuning` in every control and every picture, saves it and writes it into the address, as a lever's own change does. */
  apply: () => void;
}

/** The marked elements carry this attribute; nothing else sets it. */
const CHANGED = "data-tuning-changed";

/**
 * Wire Reset to defaults and the signs of a change. Returns `refresh`, which the panel calls after anything that may
 * have moved a setting: it counts the changed settings again, marks their levers, and, once something differs, lets go
 * of a reset that stood to be taken back.
 */
export function initTuningReset(config: TuningResetConfig): () => void {
  const { state, apply } = config;
  const button = document.getElementById("tuning-reset") as HTMLButtonElement | null;
  const count = document.getElementById("tuning-changed");
  const numeral = document.getElementById("tuning-changed-count");
  const words = document.getElementById("tuning-changed-words");
  /** The settings as they were before a reset, while the reset stands and can be taken back. */
  let beforeReset: TuningConfig | null = null;

  /** Write `next` into the tuning the views hold; the frame and the picture's reading stay as the viewer has them (`takeTuning`). */
  const take = (next: TuningConfig): void => takeTuning(state.tuning, next);

  const refresh = (): void => {
    const changes = changedSettings(state.tuning, getDefaultTuning());
    if (changes.length > 0) beforeReset = null;
    if (count && numeral && words) {
      count.hidden = changes.length === 0;
      numeral.textContent = String(changes.length);
      words.textContent = changes.length === 0 ? "" : changedSettingsWords(changes.length);
      count.title = words.textContent;
    }
    const marked = new Set<Element>();
    for (const setting of changes) {
      const lever = document.getElementById(tuningControlId(setting))?.closest(".tuning-slider");
      if (!lever) continue;
      marked.add(lever);
      for (let group = lever.closest("details.tuning-subsection"); group; group = group.parentElement?.closest("details.tuning-subsection") ?? null) {
        const heading = group.querySelector(":scope > summary");
        if (heading) marked.add(heading);
      }
    }
    for (const element of document.querySelectorAll(`[${CHANGED}]`)) if (!marked.has(element)) element.removeAttribute(CHANGED);
    for (const element of marked) element.setAttribute(CHANGED, "");
    if (button) {
      const resetStands = beforeReset !== null;
      button.disabled = !resetStands && changes.length === 0;
      button.setAttribute("aria-pressed", String(resetStands));
      button.title = resetStands ? "Put your settings back as you had them" : "Reset to defaults";
    }
  };

  button?.addEventListener("click", () => {
    if (beforeReset) {
      take(beforeReset);
      beforeReset = null;
      apply();
      announce("Tuning put back as you had it");
    } else {
      if (changedSettings(state.tuning, getDefaultTuning()).length === 0) return;
      // Kept before the change is applied, so that the refresh the change makes finds a reset standing and the button,
      // which may hold the focus, is never disabled on the way.
      beforeReset = structuredClone(state.tuning);
      take(getDefaultTuning());
      apply();
      announce("Tuning reset to defaults");
    }
    refresh();
  });

  return refresh;
}

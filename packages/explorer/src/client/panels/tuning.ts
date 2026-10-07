/**
 * Tuning Panel
 * 
 * Initializes and wires up the tuning/settings panel UI controls
 * for bezier curves, click behavior, visual options, and Local Map settings.
 */

import type { ExplorerState } from "../types";

/** Callback for when tuning values change */
export type TuningChangeCallback = () => void;

/** Callback for when the current view needs to re-render */
export type RenderCallback = () => void;

/** Tuning panel configuration */
export interface TuningPanelConfig {
  state: ExplorerState;
  onTuningChange: TuningChangeCallback;
  onRender: RenderCallback;
  drawLocalConnections: () => void;
  drawMembraneConnections: () => void;
}

/**
 * Initialize the tuning panel with all slider and checkbox controls.
 */
export function initTuningPanel(config: TuningPanelConfig): void {
  const { state, onTuningChange, onRender, drawLocalConnections, drawMembraneConnections } = config;

  const stubFactorInput = document.getElementById("tuning-stub-factor") as HTMLInputElement | null;
  const stubMinInput = document.getElementById("tuning-stub-min") as HTMLInputElement | null;
  const stubMaxOffsetInput = document.getElementById("tuning-stub-max-offset") as HTMLInputElement | null;
  const verticalOffsetInput = document.getElementById("tuning-vertical-offset") as HTMLInputElement | null;
  const columnGapInput = document.getElementById("tuning-column-gap") as HTMLInputElement | null;
  const hoverDimSymbolsInput = document.getElementById("tuning-hover-dim-symbols") as HTMLInputElement | null;
  const hoverDimConnectionsInput = document.getElementById("tuning-hover-dim-connections") as HTMLInputElement | null;
  const selfLoopTaperInput = document.getElementById("tuning-self-loop-taper") as HTMLInputElement | null;
  const laceReachInput = document.getElementById("tuning-lace-reach") as HTMLInputElement | null;
  const laceCurlInput = document.getElementById("tuning-lace-curl") as HTMLInputElement | null;
  const laceWidthInput = document.getElementById("tuning-lace-width") as HTMLInputElement | null;
  const strainNudgeInput = document.getElementById("tuning-strain-nudge") as HTMLInputElement | null;
  const symbolOrderSelect = document.getElementById("tuning-symbol-order") as HTMLSelectElement | null;
  const moveMsInput = document.getElementById("tuning-move-ms") as HTMLInputElement | null;
  const holdStillSelect = document.getElementById("tuning-hold-still") as HTMLSelectElement | null;
  const orderStartsInput = document.getElementById("tuning-order-starts") as HTMLInputElement | null;
  const searchStartsInput = document.getElementById("tuning-search-starts") as HTMLInputElement | null;
  const searchPatienceInput = document.getElementById("tuning-search-patience") as HTMLInputElement | null;

  const wireSlider = (input: HTMLInputElement | null, outputId: string, setter: (v: number) => void): void => {
    if (!input) return;
    const output = document.getElementById(outputId) as HTMLOutputElement | null;
    input.addEventListener("input", () => {
      const value = parseFloat(input.value);
      setter(value);
      if (output) output.textContent = input.value;
      onTuningChange();
      if (state.view === "map") {
        drawLocalConnections();
      } else if (state.view === "membrane") {
        onRender();
      }
    });
  };

  // Wire slider that also updates CSS custom property on the local-layout container
  const wireLocalMapSlider = (
    input: HTMLInputElement | null,
    outputId: string,
    cssProperty: string,
    setter: (v: number) => void
  ): void => {
    if (!input) return;
    const output = document.getElementById(outputId) as HTMLOutputElement | null;
    input.addEventListener("input", () => {
      const value = parseFloat(input.value);
      setter(value);
      if (output) output.textContent = input.value;
      onTuningChange();
      // Update CSS custom property on root (cascades to both Local Map and Membrane Map)
      const cssValue = cssProperty === "--local-column-gap" ? `${value}px` : String(value);
      document.documentElement.style.setProperty(cssProperty, cssValue);
      if (state.view === "map") {
        drawLocalConnections();
      } else if (state.view === "membrane") {
        drawMembraneConnections();
      }
    });
  };

  const clampToInput = (input: HTMLInputElement, value: number): number => {
    const min = input.min ? parseFloat(input.min) : Number.NEGATIVE_INFINITY;
    const max = input.max ? parseFloat(input.max) : Number.POSITIVE_INFINITY;
    if (!Number.isFinite(value)) {
      return parseFloat(input.value);
    }
    return Math.min(max, Math.max(min, value));
  };

  const setSlider = (input: HTMLInputElement | null, outputId: string, value: number, format?: (v: number) => string): number => {
    if (!input) return value;
    const clamped = clampToInput(input, value);
    input.value = String(clamped);
    const output = document.getElementById(outputId) as HTMLOutputElement | null;
    if (output) {
      output.textContent = format ? format(clamped) : input.value;
    }
    return clamped;
  };

  const syncTuningControlsFromState = (): void => {
    state.tuning.bezier.stubFactor = setSlider(stubFactorInput, "tuning-stub-factor-value", state.tuning.bezier.stubFactor);
    state.tuning.bezier.stubMin = setSlider(stubMinInput, "tuning-stub-min-value", state.tuning.bezier.stubMin);
    state.tuning.bezier.stubMaxOffset = setSlider(stubMaxOffsetInput, "tuning-stub-max-offset-value", state.tuning.bezier.stubMaxOffset);
    state.tuning.bezier.verticalOffset = setSlider(verticalOffsetInput, "tuning-vertical-offset-value", state.tuning.bezier.verticalOffset);

    state.tuning.localMap.columnGap = setSlider(columnGapInput, "tuning-column-gap-value", state.tuning.localMap.columnGap, v => String(v));
    state.tuning.localMap.hoverDimSymbols = setSlider(hoverDimSymbolsInput, "tuning-hover-dim-symbols-value", state.tuning.localMap.hoverDimSymbols);
    state.tuning.localMap.hoverDimConnections = setSlider(hoverDimConnectionsInput, "tuning-hover-dim-connections-value", state.tuning.localMap.hoverDimConnections);
    state.tuning.localMap.selfLoopTaper = setSlider(selfLoopTaperInput, "tuning-self-loop-taper-value", state.tuning.localMap.selfLoopTaper);
    state.tuning.localMap.laceReach = setSlider(laceReachInput, "tuning-lace-reach-value", state.tuning.localMap.laceReach);
    state.tuning.localMap.laceCurl = setSlider(laceCurlInput, "tuning-lace-curl-value", state.tuning.localMap.laceCurl);
    state.tuning.localMap.laceWidth = setSlider(laceWidthInput, "tuning-lace-width-value", state.tuning.localMap.laceWidth);
    state.tuning.localMap.strainNudge = setSlider(strainNudgeInput, "tuning-strain-nudge-value", state.tuning.localMap.strainNudge, v => String(v));
    if (symbolOrderSelect) symbolOrderSelect.value = state.tuning.localMap.symbolOrder;
    state.tuning.localMap.moveMs = setSlider(moveMsInput, "tuning-move-ms-value", state.tuning.localMap.moveMs, v => String(v));
    if (holdStillSelect) holdStillSelect.value = state.tuning.localMap.holdStill;
    state.tuning.localMap.orderStarts = setSlider(orderStartsInput, "tuning-order-starts-value", state.tuning.localMap.orderStarts, v => String(v));
    state.tuning.localMap.searchStarts = setSlider(searchStartsInput, "tuning-search-starts-value", state.tuning.localMap.searchStarts, v => String(v));
    state.tuning.localMap.searchPatience = setSlider(searchPatienceInput, "tuning-search-patience-value", state.tuning.localMap.searchPatience, v => String(v));

    // Set CSS custom properties on document root so they cascade to both views
    document.documentElement.style.setProperty("--local-column-gap", `${state.tuning.localMap.columnGap}px`);
    document.documentElement.style.setProperty("--hover-dim-symbols", String(state.tuning.localMap.hoverDimSymbols));
    document.documentElement.style.setProperty("--hover-dim-connections", String(state.tuning.localMap.hoverDimConnections));
    document.documentElement.style.setProperty("--self-loop-taper", String(state.tuning.localMap.selfLoopTaper));
  };

  // Ensure controls reflect restored state before wiring events.
  syncTuningControlsFromState();

  wireSlider(stubFactorInput, "tuning-stub-factor-value", v => { state.tuning.bezier.stubFactor = v; });
  wireSlider(stubMinInput, "tuning-stub-min-value", v => { state.tuning.bezier.stubMin = v; });
  wireSlider(stubMaxOffsetInput, "tuning-stub-max-offset-value", v => { state.tuning.bezier.stubMaxOffset = v; });
  wireSlider(verticalOffsetInput, "tuning-vertical-offset-value", v => { state.tuning.bezier.verticalOffset = v; });

  // Local Map tuning sliders
  wireLocalMapSlider(columnGapInput, "tuning-column-gap-value", "--local-column-gap", v => { state.tuning.localMap.columnGap = v; });
  wireLocalMapSlider(hoverDimSymbolsInput, "tuning-hover-dim-symbols-value", "--hover-dim-symbols", v => { state.tuning.localMap.hoverDimSymbols = v; });
  wireLocalMapSlider(hoverDimConnectionsInput, "tuning-hover-dim-connections-value", "--hover-dim-connections", v => { state.tuning.localMap.hoverDimConnections = v; });
  wireLocalMapSlider(selfLoopTaperInput, "tuning-self-loop-taper-value", "--self-loop-taper", v => { state.tuning.localMap.selfLoopTaper = v; });
  // The laces' shape: each dial redraws the wires, where the laces are, as it moves (the owner's ask, 2026-10-06).
  wireSlider(laceReachInput, "tuning-lace-reach-value", v => { state.tuning.localMap.laceReach = v; });
  wireSlider(laceCurlInput, "tuning-lace-curl-value", v => { state.tuning.localMap.laceCurl = v; });
  wireSlider(laceWidthInput, "tuning-lace-width-value", v => { state.tuning.localMap.laceWidth = v; });

  // The symbol order changes where every card's rows stand: the view re-renders.
  if (symbolOrderSelect) {
    symbolOrderSelect.addEventListener("change", () => {
      const value = symbolOrderSelect.value;
      state.tuning.localMap.symbolOrder = value === "alphabetical" || value === "appearance" ? value : "layout";
      onTuningChange();
      if (state.view === "map") onRender();
    });
  }

  // The move's length and the card it holds still take effect at the next change of picture; nothing redraws now.
  if (moveMsInput) {
    const output = document.getElementById("tuning-move-ms-value") as HTMLOutputElement | null;
    moveMsInput.addEventListener("input", () => {
      state.tuning.localMap.moveMs = parseFloat(moveMsInput.value);
      if (output) output.textContent = moveMsInput.value;
      onTuningChange();
    });
  }
  if (holdStillSelect) {
    holdStillSelect.addEventListener("change", () => {
      state.tuning.localMap.holdStill = holdStillSelect.value === "hover" ? "hover" : "click";
      onTuningChange();
    });
  }

  // The starts before paint and the continuing search's cap and patience change which picture is drawn: the view re-renders.
  const rerenderSlider = (input: HTMLInputElement | null, outputId: string, setter: (v: number) => void): void => {
    if (!input) return;
    const output = document.getElementById(outputId) as HTMLOutputElement | null;
    input.addEventListener("input", () => {
      setter(parseFloat(input.value));
      if (output) output.textContent = input.value;
      onTuningChange();
      if (state.view === "map") onRender();
    });
  };
  rerenderSlider(orderStartsInput, "tuning-order-starts-value", v => { state.tuning.localMap.orderStarts = v; });
  rerenderSlider(searchStartsInput, "tuning-search-starts-value", v => { state.tuning.localMap.searchStarts = v; });
  rerenderSlider(searchPatienceInput, "tuning-search-patience-value", v => { state.tuning.localMap.searchPatience = v; });

  // The nudge threshold changes a status, not a drawing: the view re-renders so the perspective controls read it again.
  if (strainNudgeInput) {
    const output = document.getElementById("tuning-strain-nudge-value") as HTMLOutputElement | null;
    strainNudgeInput.addEventListener("input", () => {
      state.tuning.localMap.strainNudge = parseFloat(strainNudgeInput.value);
      if (output) output.textContent = strainNudgeInput.value;
      onTuningChange();
      if (state.view === "map") onRender();
    });
  }
}

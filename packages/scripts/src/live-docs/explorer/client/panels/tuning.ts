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
}

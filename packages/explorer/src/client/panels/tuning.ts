/**
 * Tuning Panel
 * 
 * Initializes and wires up the tuning/settings panel UI controls
 * for bezier curves, click behavior, visual options, and Local Map settings.
 */

import { layoutSettingsOf } from "../layout-presets";
import { CHANGE_EMPHASES, GROUP_WRAPPERS, type ExplorerState } from "../types";
import { TUNING_HELP, tuningHelpId } from "./tuning-levers";

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
}

/**
 * Initialize the tuning panel with all slider and checkbox controls.
 */
export function initTuningPanel(config: TuningPanelConfig): () => void {
  const { state, onTuningChange: persistChange, onRender, drawLocalConnections } = config;
  describeTuningControls();
  let controlPerspective: ExplorerState["perspective"] | undefined;
  const onTuningChange = (): void => {
    persistChange();
  };
  const packingSliders = [
    ...([ ["itemGap", "item-gap"], ["bandGap", "band-gap"], ["heightCost", "height-cost"] ] as const).map(([key, name]) => ({
      id: `tuning-${name}`, get: () => state.tuning.localMap[key], set: (value: number) => { state.tuning.localMap[key] = value; }
    })),
    ...([ ["linkGap", "link-gap"], ["charge", "charge"], ["collisionGap", "collision-gap"],
      ["coupling", "coupling"], ["nodeSize", "node-size"], ["symbolScale", "symbol-scale"], ["linkWidth", "link-width"],
      ["nodeZoomResistance", "node-zoom-resistance"], ["wireZoomResistance", "wire-zoom-resistance"],
      ["gravity", "gravity"], ["componentSeparation", "component-separation"], ["chargeRange", "charge-range"], ["approximation", "approximation"], ["linkStrength", "link-strength"], ["updateEnergy", "update-energy"], ["tether", "tether"],
      ["citedByPull", "cited-by-pull"], ["hops", "hops"], ["revealFrames", "reveal-frames"], ["nameAt", "name-at"] ] as const).map(([key, name]) => ({
      id: `tuning-force-${name}`, get: () => state.tuning.forceGraph[key], set: (value: number) => { state.tuning.forceGraph[key] = value; }
    }))
  ];

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
  const symbolOrderSelect = document.getElementById("tuning-symbol-order") as HTMLSelectElement | null;
  const moveMsInput = document.getElementById("tuning-move-ms") as HTMLInputElement | null;
  const holdStillSelect = document.getElementById("tuning-hold-still") as HTMLSelectElement | null;
  const cardTextSelect = document.getElementById("tuning-card-text") as HTMLSelectElement | null;
  const slotLinesInput = document.getElementById("tuning-slot-lines") as HTMLInputElement | null;
  const textResistanceInput = document.getElementById("tuning-text-resistance") as HTMLInputElement | null;
  const controlResistanceInput = document.getElementById("tuning-control-resistance") as HTMLInputElement | null;
  const nameGrowthInput = document.getElementById("tuning-name-growth") as HTMLInputElement | null;
  const orderStartsInput = document.getElementById("tuning-order-starts") as HTMLInputElement | null;
  const searchStartsInput = document.getElementById("tuning-search-starts") as HTMLInputElement | null;
  const searchPatienceInput = document.getElementById("tuning-search-patience") as HTMLInputElement | null;
  const churnCostInput = document.getElementById("tuning-churn-cost") as HTMLInputElement | null;
  const membraneEvennessInput = document.getElementById("tuning-membrane-evenness") as HTMLInputElement | null;
  const membraneSimplicityInput = document.getElementById("tuning-membrane-simplicity") as HTMLInputElement | null;
  const rowLevelnessInput = document.getElementById("tuning-row-levelness") as HTMLInputElement | null;
  const historyAxisSelect = document.getElementById("tuning-history-axis") as HTMLSelectElement | null;
  const historyGranularitySelect = document.getElementById("tuning-history-granularity") as HTMLSelectElement | null;
  const historyPlayRateInput = document.getElementById("tuning-history-play-rate") as HTMLInputElement | null;
  const historyChangeEmphasisSelect = document.getElementById("tuning-history-change-emphasis") as HTMLSelectElement | null;
  const groupWrappersSelect = document.getElementById("tuning-force-group-wrappers") as HTMLSelectElement | null;

  const wireSlider = (input: HTMLInputElement | null, outputId: string, setter: (v: number) => void): void => {
    if (!input) return;
    const output = document.getElementById(outputId) as HTMLOutputElement | null;
    input.addEventListener("input", () => {
      const value = parseFloat(input.value);
      setter(value);
      if (output) output.textContent = input.value;
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") {
        drawLocalConnections();
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
      // Update CSS custom property on root (cascades to the Local Map)
      const cssValue = cssProperty === "--local-column-gap" ? `${value}px` : String(value);
      document.documentElement.style.setProperty(cssProperty, cssValue);
      if (state.view === "map" && state.perspective === "2d") {
        if (cssProperty === "--local-column-gap") onRender();
        else drawLocalConnections();
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
    if (controlPerspective !== state.perspective) {
      document.querySelectorAll<HTMLDetailsElement>("details[data-tuning-perspective]").forEach(group => {
        group.open = group.dataset.tuningPerspective === state.perspective;
      });
      controlPerspective = state.perspective;
    }
    for (const slider of packingSliders) {
      slider.set(setSlider(document.getElementById(slider.id) as HTMLInputElement | null, `${slider.id}-value`, slider.get()));
    }
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
    if (symbolOrderSelect) symbolOrderSelect.value = state.tuning.localMap.symbolOrder;
    state.tuning.localMap.moveMs = setSlider(moveMsInput, "tuning-move-ms-value", state.tuning.localMap.moveMs, v => String(v));
    if (holdStillSelect) holdStillSelect.value = state.tuning.localMap.holdStill;
    if (cardTextSelect) cardTextSelect.value = state.tuning.localMap.cardText;
    state.tuning.localMap.slotLines = setSlider(slotLinesInput, "tuning-slot-lines-value", state.tuning.localMap.slotLines, v => String(v));
    state.tuning.localMap.textResistance = setSlider(textResistanceInput, "tuning-text-resistance-value", state.tuning.localMap.textResistance, v => String(v));
    state.tuning.localMap.controlResistance = setSlider(controlResistanceInput, "tuning-control-resistance-value", state.tuning.localMap.controlResistance, v => String(v));
    state.tuning.localMap.nameGrowth = setSlider(nameGrowthInput, "tuning-name-growth-value", state.tuning.localMap.nameGrowth, v => String(v));
    state.tuning.localMap.orderStarts = setSlider(orderStartsInput, "tuning-order-starts-value", state.tuning.localMap.orderStarts, v => String(v));
    state.tuning.localMap.searchStarts = setSlider(searchStartsInput, "tuning-search-starts-value", state.tuning.localMap.searchStarts, v => String(v));
    state.tuning.localMap.searchPatience = setSlider(searchPatienceInput, "tuning-search-patience-value", state.tuning.localMap.searchPatience, v => String(v));
    state.tuning.localMap.churnCost = setSlider(churnCostInput, "tuning-churn-cost-value", state.tuning.localMap.churnCost, v => String(v));
    state.tuning.localMap.membraneEvenness = setSlider(membraneEvennessInput, "tuning-membrane-evenness-value", state.tuning.localMap.membraneEvenness, v => String(v));
    state.tuning.localMap.membraneSimplicity = setSlider(membraneSimplicityInput, "tuning-membrane-simplicity-value", state.tuning.localMap.membraneSimplicity, v => String(v));
    state.tuning.localMap.rowLevelness = setSlider(rowLevelnessInput, "tuning-row-levelness-value", state.tuning.localMap.rowLevelness, v => String(v));
    if (historyAxisSelect) historyAxisSelect.value = state.tuning.history.axis;
    if (historyGranularitySelect) historyGranularitySelect.value = state.tuning.history.granularity;
    state.tuning.history.playRate = setSlider(historyPlayRateInput, "tuning-history-play-rate-value", state.tuning.history.playRate, v => String(v));
    if (historyChangeEmphasisSelect) historyChangeEmphasisSelect.value = state.tuning.history.changeEmphasis;
    if (groupWrappersSelect) groupWrappersSelect.value = state.tuning.forceGraph.groupWrappers;

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
      if (state.view === "map" && state.perspective === "2d") onRender();
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
  // The card's composition changes every card's drawing and box: the view re-renders.
  if (cardTextSelect) {
    cardTextSelect.addEventListener("change", () => {
      state.tuning.localMap.cardText = cardTextSelect.value === "slot" ? "slot" : "grow";
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") onRender();
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
      if (state.view === "map" && state.perspective === "2d") onRender();
    });
  };
  rerenderSlider(orderStartsInput, "tuning-order-starts-value", v => { state.tuning.localMap.orderStarts = v; });
  rerenderSlider(slotLinesInput, "tuning-slot-lines-value", v => { state.tuning.localMap.slotLines = v; });
  rerenderSlider(textResistanceInput, "tuning-text-resistance-value", v => { state.tuning.localMap.textResistance = v; });
  rerenderSlider(controlResistanceInput, "tuning-control-resistance-value", v => { state.tuning.localMap.controlResistance = v; });
  rerenderSlider(nameGrowthInput, "tuning-name-growth-value", v => { state.tuning.localMap.nameGrowth = v; });
  rerenderSlider(searchStartsInput, "tuning-search-starts-value", v => { state.tuning.localMap.searchStarts = v; });
  rerenderSlider(searchPatienceInput, "tuning-search-patience-value", v => { state.tuning.localMap.searchPatience = v; });
  rerenderSlider(churnCostInput, "tuning-churn-cost-value", v => { state.tuning.localMap.churnCost = v; });
  rerenderSlider(membraneEvennessInput, "tuning-membrane-evenness-value", v => { state.tuning.localMap.membraneEvenness = v; });
  rerenderSlider(membraneSimplicityInput, "tuning-membrane-simplicity-value", v => { state.tuning.localMap.membraneSimplicity = v; });
  rerenderSlider(rowLevelnessInput, "tuning-row-levelness-value", v => { state.tuning.localMap.rowLevelness = v; });

  // The history's scrubber redraws its ticks from these; the picture itself does not change.
  if (historyAxisSelect) {
    historyAxisSelect.addEventListener("change", () => {
      state.tuning.history.axis = historyAxisSelect.value === "time" ? "time" : "steps";
      onTuningChange();
      if (state.view === "map" && state.perspective === "3d") onRender();
    });
  }
  if (historyGranularitySelect) {
    historyGranularitySelect.addEventListener("change", () => {
      const value = historyGranularitySelect.value;
      state.tuning.history.granularity = value === "step" || value === "day" || value === "week" || value === "month" || value === "salient" ? value : "auto";
      onTuningChange();
      if (state.view === "map" && state.perspective === "3d") onRender();
    });
  }
  if (historyPlayRateInput) {
    const output = document.getElementById("tuning-history-play-rate-value") as HTMLOutputElement | null;
    historyPlayRateInput.addEventListener("input", () => {
      state.tuning.history.playRate = parseFloat(historyPlayRateInput.value);
      if (output) output.textContent = historyPlayRateInput.value;
      onTuningChange();
    });
  }
  // How a step's changed files are told apart in the picture: the 3D view draws them again at once (2026-10-31).
  if (historyChangeEmphasisSelect) {
    historyChangeEmphasisSelect.addEventListener("change", () => {
      const value = historyChangeEmphasisSelect.value;
      state.tuning.history.changeEmphasis = CHANGE_EMPHASES.find(emphasis => emphasis === value) ?? "glow";
      onTuningChange();
      if (state.view === "map" && state.perspective === "3d") onRender();
    });
  }

  // How the groups shown only by their seed are wrapped, an experiment (2026-11-05): the 3D view draws again at once.
  if (groupWrappersSelect) {
    groupWrappersSelect.addEventListener("change", () => {
      const value = groupWrappersSelect.value;
      state.tuning.forceGraph.groupWrappers = GROUP_WRAPPERS.find(wrappers => wrappers === value) ?? "off";
      onTuningChange();
      if (state.view === "map" && state.perspective === "3d") onRender();
    });
  }

  for (const slider of packingSliders) {
    const input = document.getElementById(slider.id) as HTMLInputElement | null;
    input?.addEventListener("input", () => {
      slider.set(Number(input.value));
      syncTuningControlsFromState();
      onTuningChange();
      if (state.view === "map") onRender();
    });
  }
  document.getElementById("export-layout-settings")?.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(layoutSettingsOf(state.tuning), null, 2) + "\n"], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "local-map-layout.json"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });
  return syncTuningControlsFromState;
}

/**
 * Give every tuning control its sentence from {@link TUNING_HELP}: as the tooltip of the control and of its label, for a
 * pointer, and in a visually hidden element beside the label that the control names by `aria-describedby`, for a screen
 * reader. The element stands outside the label so that the sentence describes the control without joining its name.
 */
function describeTuningControls(): void {
  for (const [id, sentence] of Object.entries(TUNING_HELP)) {
    const control = document.getElementById(id);
    if (!control) continue;
    const label = control.closest<HTMLElement>(".tuning-slider");
    const helpId = tuningHelpId(id);
    let help = document.getElementById(helpId);
    if (!help) {
      help = document.createElement("span");
      help.id = helpId;
      help.className = "visually-hidden";
      (label ?? control).after(help);
    }
    help.textContent = sentence;
    control.title = sentence;
    if (label) label.title = sentence;
    control.setAttribute("aria-describedby", helpId);
  }
}

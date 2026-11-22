/**
 * Tuning Panel
 * 
 * Initializes and wires up the tuning/settings panel UI controls
 * for bezier curves, click behavior, visual options, and Local Map settings.
 */

import { applyMarbles, applyPalette } from "../dom";
import { layoutSettingsOf } from "../layout-presets";
import { DEFAULT_PALETTE, isPaletteName } from "../palette";
import { ARRIVAL_WAITS, ARRIVALS, CUT_COUNTED, DIRECTION_MARKS, WAY_DOWNS, WIRE_ANSWERS, FRAMINGS, STEPS, CHANGE_EMPHASES, CLOSED_CELL_COLOURS, CLOSED_DIRECTORY_LOOKS, CLOSED_DIRECTORY_SHAPES, DESCRIPTIONS_ZOOMED_OUT, DIRECTORY_LAYOUTS, GROUP_WRAPPERS, BEYOND_HOPS, SCAN_GROWTHS, SCAN_PACES, FRAME_CHOICES, HIDDEN_FILES_LOOKS, MARBLE_CHOICES, OVERVIEW_FILES, type ExplorerState, type FrameChoice } from "../types";
import { TUNING_HELP, tuningHelpId } from "./tuning-levers";
import { initTuningReset } from "./tuning-reset";

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
  /** Puts a frame in force: the sidebar, or the Bare trial's breadcrumb, key and sheet (frame.ts). */
  onFrame: (frame: FrameChoice) => void;
  /** The scan trial's order or pace was chosen: the 3D map, where it stands with nothing asked about, plays it from its start. */
  onScanGrowth: () => void;
}

/**
 * Initialize the tuning panel with all slider and checkbox controls.
 */
export function initTuningPanel(config: TuningPanelConfig): () => void {
  const { state, onTuningChange: persistChange, onRender, drawLocalConnections, onFrame, onScanGrowth } = config;
  describeTuningControls();
  let controlPerspective: ExplorerState["perspective"] | undefined;
  const onTuningChange = (): void => {
    persistChange();
    refreshChanges();
  };
  // Reset to defaults takes the path every lever's change takes: the looks the page wears, the controls, the save and
  // the address, and the picture drawn again.
  const refreshChanges = initTuningReset({ state, apply: () => {
    applyPalette(state.tuning.appearance.palette);
    applyMarbles(state.tuning.appearance.marbles);
    syncTuningControlsFromState();
    onTuningChange();
    if (state.view === "map") onRender();
    onScanGrowth();
  } });
  const packingSliders = [
    ...([ ["itemGap", "item-gap"], ["bandGap", "band-gap"], ["heightCost", "height-cost"], ["widthCost", "width-cost"] ] as const).map(([key, name]) => ({
      id: `tuning-${name}`, get: () => state.tuning.localMap[key], set: (value: number) => { state.tuning.localMap[key] = value; }
    })),
    ...([ ["linkGap", "link-gap"], ["charge", "charge"], ["collisionGap", "collision-gap"],
      ["coupling", "coupling"], ["nodeSize", "node-size"], ["symbolScale", "symbol-scale"], ["linkWidth", "link-width"],
      ["nodeZoomResistance", "node-zoom-resistance"], ["wireZoomResistance", "wire-zoom-resistance"],
      ["gravity", "gravity"], ["componentSeparation", "component-separation"], ["chargeRange", "charge-range"], ["approximation", "approximation"], ["linkStrength", "link-strength"], ["updateEnergy", "update-energy"], ["tether", "tether"], ["settleHold", "settle-hold"],
      ["citedByPull", "cited-by-pull"], ["hops", "hops"], ["shellDepth", "shell-depth"], ["revealFrames", "reveal-frames"], ["nameAt", "name-at"] ] as const).map(([key, name]) => ({
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
  const zoomLooksSelect = document.getElementById("tuning-zoom-looks") as HTMLSelectElement | null;
  const directoryLayoutSelect = document.getElementById("tuning-directory-layout") as HTMLSelectElement | null;
  const closedDirectorySelect = document.getElementById("tuning-closed-directory") as HTMLSelectElement | null;
  const closedShapeSelect = document.getElementById("tuning-closed-shape") as HTMLSelectElement | null;
  const closedCellsSelect = document.getElementById("tuning-closed-cells") as HTMLSelectElement | null;
  const hiddenFilesSelect = document.getElementById("tuning-hidden-files") as HTMLSelectElement | null;
  const arrivalSelect = document.getElementById("tuning-arrival") as HTMLSelectElement | null;
  const arrivalWaitsSelect = document.getElementById("tuning-arrival-waits") as HTMLSelectElement | null;
  const arrivalRestInput = document.getElementById("tuning-arrival-rest") as HTMLInputElement | null;
  const framingSelect = document.getElementById("tuning-framing") as HTMLSelectElement | null;
  const stepSelect = document.getElementById("tuning-step") as HTMLSelectElement | null;
  const cutCountedSelect = document.getElementById("tuning-cut-counted") as HTMLSelectElement | null;
  const wireAnswersSelect = document.getElementById("tuning-wire-answers") as HTMLSelectElement | null;
  const directionMarksSelect = document.getElementById("tuning-direction-marks") as HTMLSelectElement | null;
  const wayDownSelect = document.getElementById("tuning-way-down") as HTMLSelectElement | null;
  const paletteSelect = document.getElementById("tuning-palette") as HTMLSelectElement | null;
  const marblesSelect = document.getElementById("tuning-marbles") as HTMLSelectElement | null;
  const frameSelect = document.getElementById("tuning-frame") as HTMLSelectElement | null;
  /**
   * The skin's shape and its cells' colour are choices of the cells alone: shown only while a closed directory's skin or
   * a handle's hidden files draw them.
   */
  const syncClosedChoices = (): void => {
    const { closedDirectory, hiddenFiles } = state.tuning.localMap;
    for (const row of document.querySelectorAll<HTMLElement>("[data-closed-cells-only]")) row.hidden = closedDirectory !== "cells" && hiddenFiles === "count";
  };
  const overviewFilesSelect = document.getElementById("tuning-overview-files") as HTMLSelectElement | null;
  const descriptionsZoomedOutSelect = document.getElementById("tuning-descriptions-zoomed-out") as HTMLSelectElement | null;
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
  const returnCostInput = document.getElementById("tuning-return-cost") as HTMLInputElement | null;
  const historyAxisSelect = document.getElementById("tuning-history-axis") as HTMLSelectElement | null;
  const historyGranularitySelect = document.getElementById("tuning-history-granularity") as HTMLSelectElement | null;
  const historyPlayRateInput = document.getElementById("tuning-history-play-rate") as HTMLInputElement | null;
  const historyChangeEmphasisSelect = document.getElementById("tuning-history-change-emphasis") as HTMLSelectElement | null;
  const groupWrappersSelect = document.getElementById("tuning-force-group-wrappers") as HTMLSelectElement | null;
  const beyondHopsSelect = document.getElementById("tuning-force-beyond-hops") as HTMLSelectElement | null;
  const scanGrowthSelect = document.getElementById("tuning-force-scan-growth") as HTMLSelectElement | null;
  const scanPaceSelect = document.getElementById("tuning-force-scan-pace") as HTMLSelectElement | null;

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
    if (zoomLooksSelect) zoomLooksSelect.value = state.tuning.localMap.zoomLooks;
    if (directoryLayoutSelect) directoryLayoutSelect.value = state.tuning.localMap.directoryLayout;
    if (closedDirectorySelect) closedDirectorySelect.value = state.tuning.localMap.closedDirectory;
    if (closedShapeSelect) closedShapeSelect.value = state.tuning.localMap.closedShape;
    if (closedCellsSelect) closedCellsSelect.value = state.tuning.localMap.closedCells;
    if (hiddenFilesSelect) hiddenFilesSelect.value = state.tuning.localMap.hiddenFiles;
    if (arrivalSelect) arrivalSelect.value = state.tuning.localMap.arrival;
    if (arrivalWaitsSelect) arrivalWaitsSelect.value = state.tuning.localMap.arrivalWaits;
    state.tuning.localMap.arrivalRest = setSlider(arrivalRestInput, "tuning-arrival-rest-value", state.tuning.localMap.arrivalRest, v => String(v));
    if (framingSelect) framingSelect.value = state.tuning.localMap.framing;
    if (stepSelect) stepSelect.value = state.tuning.localMap.step;
    if (cutCountedSelect) cutCountedSelect.value = state.tuning.localMap.cutCounted;
    if (wireAnswersSelect) wireAnswersSelect.value = state.tuning.localMap.wireAnswers;
    if (directionMarksSelect) directionMarksSelect.value = state.tuning.localMap.directionMarks;
    if (wayDownSelect) wayDownSelect.value = state.tuning.localMap.wayDown;
    if (paletteSelect) paletteSelect.value = state.tuning.appearance.palette;
    if (marblesSelect) marblesSelect.value = state.tuning.appearance.marbles;
    if (frameSelect) frameSelect.value = state.tuning.appearance.frame;
    syncClosedChoices();
    if (overviewFilesSelect) overviewFilesSelect.value = state.tuning.localMap.overviewFiles;
    if (descriptionsZoomedOutSelect) descriptionsZoomedOutSelect.value = state.tuning.localMap.descriptionsZoomedOut;
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
    state.tuning.localMap.returnCost = setSlider(returnCostInput, "tuning-return-cost-value", state.tuning.localMap.returnCost, v => String(v));
    if (historyAxisSelect) historyAxisSelect.value = state.tuning.history.axis;
    if (historyGranularitySelect) historyGranularitySelect.value = state.tuning.history.granularity;
    state.tuning.history.playRate = setSlider(historyPlayRateInput, "tuning-history-play-rate-value", state.tuning.history.playRate, v => String(v));
    if (historyChangeEmphasisSelect) historyChangeEmphasisSelect.value = state.tuning.history.changeEmphasis;
    if (groupWrappersSelect) groupWrappersSelect.value = state.tuning.forceGraph.groupWrappers;
    if (beyondHopsSelect) beyondHopsSelect.value = state.tuning.forceGraph.beyondHops;
    if (scanGrowthSelect) scanGrowthSelect.value = state.tuning.forceGraph.scanGrowth;
    if (scanPaceSelect) scanPaceSelect.value = state.tuning.forceGraph.scanPace;

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
  // The looks a slot card takes as the map zooms out change how each card's held header is chosen: the view re-renders.
  if (zoomLooksSelect) {
    zoomLooksSelect.addEventListener("change", () => {
      state.tuning.localMap.zoomLooks = zoomLooksSelect.value === "stepped" ? "stepped" : "three";
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") onRender();
    });
  }
  // How an opened directory stands changes which cards are ranked and which lines are drawn: the view re-renders.
  if (directoryLayoutSelect) {
    directoryLayoutSelect.addEventListener("change", () => {
      state.tuning.localMap.directoryLayout = DIRECTORY_LAYOUTS.find(choice => choice === directoryLayoutSelect.value) ?? DIRECTORY_LAYOUTS[0];
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") onRender();
    });
  }
  // How a closed directory is drawn changes its box's drawing, never its size: the view re-renders.
  if (closedDirectorySelect) {
    closedDirectorySelect.addEventListener("change", () => {
      state.tuning.localMap.closedDirectory = CLOSED_DIRECTORY_LOOKS.find(choice => choice === closedDirectorySelect.value) ?? CLOSED_DIRECTORY_LOOKS[0];
      syncClosedChoices();
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") onRender();
    });
  }
  // What an encasing directory's handle says of what it does not draw changes the handle's drawing, never a size.
  if (hiddenFilesSelect) {
    hiddenFilesSelect.addEventListener("change", () => {
      state.tuning.localMap.hiddenFiles = HIDDEN_FILES_LOOKS.find(choice => choice === hiddenFilesSelect.value) ?? HIDDEN_FILES_LOOKS[0];
      syncClosedChoices();
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") onRender();
    });
  }
  // How the camera meets a new subject changes no picture: the next arrival reads it.
  if (arrivalSelect) {
    arrivalSelect.addEventListener("change", () => {
      state.tuning.localMap.arrival = ARRIVALS.find(choice => choice === arrivalSelect.value) ?? ARRIVALS[0];
      onTuningChange();
    });
  }
  if (arrivalWaitsSelect) {
    arrivalWaitsSelect.addEventListener("change", () => {
      state.tuning.localMap.arrivalWaits = ARRIVAL_WAITS.find(choice => choice === arrivalWaitsSelect.value) ?? ARRIVAL_WAITS[0];
      onTuningChange();
    });
  }
  if (arrivalRestInput) {
    const output = document.getElementById("tuning-arrival-rest-value") as HTMLOutputElement | null;
    arrivalRestInput.addEventListener("input", () => {
      state.tuning.localMap.arrivalRest = parseFloat(arrivalRestInput.value);
      if (output) output.textContent = arrivalRestInput.value;
      onTuningChange();
    });
  }
  // Who frames the camera changes no picture: the next re-frame or Fit reads it, and Fit's state says it at once.
  if (framingSelect) {
    framingSelect.addEventListener("change", () => {
      state.tuning.localMap.framing = FRAMINGS.find(choice => choice === framingSelect.value) ?? FRAMINGS[0];
      onTuningChange();
    });
  }
  // What a step frames changes no picture: the next step reads it.
  if (stepSelect) {
    stepSelect.addEventListener("change", () => {
      state.tuning.localMap.step = STEPS.find(choice => choice === stepSelect.value) ?? STEPS[0];
      onTuningChange();
    });
  }
  // The way down changes no picture: the next way down from the World Map reads it, and the board's panels and bar with it.
  if (wayDownSelect) {
    wayDownSelect.addEventListener("change", () => {
      state.tuning.localMap.wayDown = WAY_DOWNS.find(choice => choice === wayDownSelect.value) ?? WAY_DOWNS[0];
      onTuningChange();
    });
  }
  // Whether the cut is said changes no picture: the next step reads it.
  if (cutCountedSelect) {
    cutCountedSelect.addEventListener("change", () => {
      state.tuning.localMap.cutCounted = CUT_COUNTED.find(choice => choice === cutCountedSelect.value) ?? CUT_COUNTED[0];
      onTuningChange();
    });
  }
  // Both wire trials change how the wires are drawn, not where anything stands: the wires are drawn again.
  if (wireAnswersSelect) {
    wireAnswersSelect.addEventListener("change", () => {
      state.tuning.localMap.wireAnswers = WIRE_ANSWERS.find(choice => choice === wireAnswersSelect.value) ?? WIRE_ANSWERS[0];
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") drawLocalConnections();
    });
  }
  if (directionMarksSelect) {
    directionMarksSelect.addEventListener("change", () => {
      state.tuning.localMap.directionMarks = DIRECTION_MARKS.find(choice => choice === directionMarksSelect.value) ?? DIRECTION_MARKS[0];
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") drawLocalConnections();
    });
  }
  if (closedShapeSelect) {
    closedShapeSelect.addEventListener("change", () => {
      state.tuning.localMap.closedShape = CLOSED_DIRECTORY_SHAPES.find(choice => choice === closedShapeSelect.value) ?? CLOSED_DIRECTORY_SHAPES[0];
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") onRender();
    });
  }
  // The palette the page is drawn in (the colour pass, 2026-11-16): everything on screen takes it at once, nothing
  // moving, so that the choice can be judged and changed back in place; the viewer's own, saved and never in a link.
  if (paletteSelect) {
    paletteSelect.addEventListener("change", () => {
      state.tuning.appearance.palette = isPaletteName(paletteSelect.value) ? paletteSelect.value : DEFAULT_PALETTE;
      applyPalette(state.tuning.appearance.palette);
      onTuningChange();
    });
  }
  // Whether files are drawn as marbles (the marble trial, 2026-11-17): taken at once as a palette is, nothing moving.
  if (marblesSelect) {
    marblesSelect.addEventListener("change", () => {
      state.tuning.appearance.marbles = MARBLE_CHOICES.find(choice => choice === marblesSelect.value) ?? MARBLE_CHOICES[0];
      applyMarbles(state.tuning.appearance.marbles);
      onTuningChange();
    });
  }
  // What frames the map (the Bare trial, 2026-11-19): taken at once, the select keeping focus wherever it now stands.
  if (frameSelect) {
    frameSelect.addEventListener("change", () => {
      state.tuning.appearance.frame = FRAME_CHOICES.find(choice => choice === frameSelect.value) ?? FRAME_CHOICES[0];
      onFrame(state.tuning.appearance.frame);
      onTuningChange();
    });
  }
  if (closedCellsSelect) {
    closedCellsSelect.addEventListener("change", () => {
      state.tuning.localMap.closedCells = CLOSED_CELL_COLOURS.find(choice => choice === closedCellsSelect.value) ?? CLOSED_CELL_COLOURS[0];
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") onRender();
    });
  }
  // What a row keeps of its description in the connections look changes its head's height there: the view re-renders.
  if (descriptionsZoomedOutSelect) {
    descriptionsZoomedOutSelect.addEventListener("change", () => {
      state.tuning.localMap.descriptionsZoomedOut = DESCRIPTIONS_ZOOMED_OUT.find(choice => choice === descriptionsZoomedOutSelect.value) ?? DESCRIPTIONS_ZOOMED_OUT[0];
      onTuningChange();
      if (state.view === "map" && state.perspective === "2d") onRender();
    });
  }
  // What the overview look draws changes the cards' heights there and the wires: the view re-renders.
  if (overviewFilesSelect) {
    overviewFilesSelect.addEventListener("change", () => {
      state.tuning.localMap.overviewFiles = OVERVIEW_FILES.find(choice => choice === overviewFilesSelect.value) ?? OVERVIEW_FILES[0];
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
  rerenderSlider(returnCostInput, "tuning-return-cost-value", v => { state.tuning.localMap.returnCost = v; });

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

  // What stands beyond the hops, a trial (2026-11-18): the 3D view draws again at once.
  if (beyondHopsSelect) {
    beyondHopsSelect.addEventListener("change", () => {
      state.tuning.forceGraph.beyondHops = BEYOND_HOPS.find(choice => choice === beyondHopsSelect.value) ?? BEYOND_HOPS[0];
      onTuningChange();
      if (state.view === "map" && state.perspective === "3d") onRender();
    });
  }

  // The scan trial (2026-11-22): a choice of its order or its pace plays it from the start, so that it can be watched again.
  if (scanGrowthSelect) {
    scanGrowthSelect.addEventListener("change", () => {
      state.tuning.forceGraph.scanGrowth = SCAN_GROWTHS.find(choice => choice === scanGrowthSelect.value) ?? SCAN_GROWTHS[0];
      onTuningChange();
      onScanGrowth();
    });
  }
  if (scanPaceSelect) {
    scanPaceSelect.addEventListener("change", () => {
      state.tuning.forceGraph.scanPace = SCAN_PACES.find(choice => choice === scanPaceSelect.value) ?? SCAN_PACES[0];
      onTuningChange();
      onScanGrowth();
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
  refreshChanges();
  return () => { syncTuningControlsFromState(); refreshChanges(); };
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

/**
 * Where the browser cannot draw 3D (2026-11-21), the 3D layout's group is not offered, as the 3D control is not: its
 * levers would change a picture this browser never shows. The group stays where it stands, closed, its heading a focus
 * stop marked `aria-disabled` whose tooltip and description say why, and a press on it opens nothing. Its stored values
 * are left as they are, for the browser that draws 3D. The History group, also kept for 3D before 2026-11-19, drives the
 * scrubber both maps share and stays offered. The group is found by the lever it holds, the 3D map's Hops Shown. Called
 * once, when the browser is known to refuse WebGL, which may be after the page's first picture (`index.ts`).
 */
export function withholdThreeDLayout(why: string): void {
  const group = document.getElementById("tuning-force-hops")?.closest<HTMLDetailsElement>('details[data-tuning-perspective="3d"]');
  const heading = group?.querySelector<HTMLElement>(":scope > summary");
  if (!group || !heading) return;
  group.open = false;
  heading.setAttribute("aria-disabled", "true");
  heading.title = why;
  heading.addEventListener("click", event => event.preventDefault());
  group.addEventListener("toggle", () => { if (group.open) group.open = false; });
}

/**
 * Where the bundle carries no history (2026-11-22), the scan trial's first-commit order is not offered, since only a
 * history says when each file was first committed: the choice stays in its list, disabled, and the lever's tooltip and
 * description say why, as the 3D control does where the browser refuses WebGL. A stored choice of it is left as it is.
 */
export function withholdFirstCommitOrder(why: string): void {
  const select = document.getElementById("tuning-force-scan-growth") as HTMLSelectElement | null;
  const option = select?.querySelector<HTMLOptionElement>('option[value="first-commit"]');
  if (!select || !option) return;
  option.disabled = true;
  const sentence = `${TUNING_HELP["tuning-force-scan-growth"]} ${why}`;
  select.title = sentence;
  const label = select.closest<HTMLElement>(".tuning-slider");
  if (label) label.title = sentence;
  const help = document.getElementById(tuningHelpId("tuning-force-scan-growth"));
  if (help) help.textContent = sentence;
}

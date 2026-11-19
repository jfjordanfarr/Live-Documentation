/**
 * The lab's layout of a captured scope without what the page's search never does: the lab's routes and signals and its
 * cycle search. A picture is laid out exactly as `evaluate` and `evaluateAlignment` lay it out (the same exploration,
 * order, plan, captured card model and scene), so its price is theirs. A capture taken by `capture-addresses.ts` carries
 * its address's state (the subject, the pins, the directories opened), and the exploration is then built from that state
 * as the page builds it, where the lab's own scopes are pinned files only.
 *
 * @module layout-price/lean
 */
import { getDefaultTuning } from "../../../../../../../packages/explorer/src/client/persistence/local-storage";
import type { BoundaryAlignment } from "../../../../../../../packages/explorer/src/client/views/localView/branch-placement";
import { candidateStarts, layoutStarts, pictureScore, signalsOf, startName, startOrder, type StartCosts } from "../../../../../../../packages/explorer/src/client/views/localView/branch-restarts";
import { layoutScene, planBranches, type Scene } from "../../../../../../../packages/explorer/src/client/views/localView/branch-scene";
import { exploreBranches, orderExploration, type BranchGraph, type Exploration } from "../../../../../../../packages/explorer/src/client/views/localView/branches";
import { addPin, EMPTY_PIN_SET, type PinSet } from "../../../../../../../packages/explorer/src/client/views/pin-state";
import type { ExplorerGraphPayload } from "../../../../../../../packages/explorer/src/shared/types";
import type { Capture } from "../../../../../../../scripts/layout-lab/capture";
import { includeNode, scopePins, type LabConfig } from "../../../../../../../scripts/layout-lab/evaluate";
import { capturedMeasurer } from "../../../../../../../scripts/layout-lab/measurer";
import { retainedSubject, type ScopeRun } from "../../../../../../../scripts/layout-lab/scopes";

export interface Picture { branches: BranchGraph; scene: Scene; start: string }

/** The state of the address a capture was taken at, when `capture-addresses.ts` took it. */
export interface AddressState { subject: string | null; pins: Array<{ nodeId: string; symbol: string }>; open: string[] }

export class Lean {
  readonly exploration: Exploration;
  readonly costs: StartCosts;
  private readonly pins: PinSet;
  private readonly selected: string;
  constructor(private readonly capture: Capture, graph: ExplorerGraphPayload, run: ScopeRun, readonly config: LabConfig) {
    const state = (capture as Capture & { state?: AddressState }).state;
    this.pins = state ? state.pins.reduce((set, pin) => addPin(set, pin.nodeId, pin.symbol), EMPTY_PIN_SET) : scopePins(run);
    this.selected = state ? state.subject ?? "" : retainedSubject(run);
    const center = this.selected ? graph.nodes.find(node => node.id === this.selected) ?? null : null;
    if (this.selected && !center) throw new Error(`The bundle has no file ${JSON.stringify(this.selected)}.`);
    this.exploration = exploreBranches(center, graph, this.pins, includeNode(this.pins, this.selected, capture.filters), {
      symbolOrder: config.symbolOrder, ranking: { pull: config.rankingPull, tie: config.rankingTie }, membraneDepth: config.membraneDepth,
      // An opened directory stands in flow order, Tuning's default since 2026-11-13, its columns from the top.
      ...(state?.open.length ? { openDirectories: new Set(state.open), directoryFlow: true } : null)
    });
    this.costs = { crossing: config.crossingCost, height: config.heightCost, width: config.widthCost, churn: 0, evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity };
  }

  place(branches: BranchGraph, alignments: readonly BoundaryAlignment[] = [], anchor?: ReadonlyMap<string, number>): Scene {
    const plan = planBranches(branches, this.config.membranePadding);
    const measurer = capturedMeasurer(this.capture, branches, { pins: this.pins, selected: this.selected, collapseOnPin: getDefaultTuning().localMap.collapseOnPin, symbolOrder: this.config.symbolOrder });
    return layoutScene(plan, branches, measurer, {
      columnGap: this.config.columnGap, itemGap: this.config.itemGap, bandGap: this.config.bandGap, neck: this.config.membraneNeck, bandPadding: this.config.membranePadding, cardMaxWidth: this.config.cardMaxWidth,
      evenness: this.config.membraneEvenness, levelness: this.config.rowLevelness, ...(this.exploration.flow ? { fromTop: true } : null)
    }, alignments, anchor);
  }

  /**
   * The first picture as the page draws it: the ranking's order and the seeds before paint, the cheapest kept, by the
   * page's price or, given `extra`, by the page's price and what a candidate mend adds to it.
   */
  first(sweeps = this.config.orderSweeps, orderStarts = this.config.orderStarts, extra?: (picture: Picture) => number): Picture {
    const ranked = this.exploration.ranking.columns.map(column => column.map(node => node.id));
    const { chosen, outcomes } = layoutStarts(candidateStarts(orderStarts, null, null, ranked), start => {
      const branches = orderExploration(this.exploration, { sweeps, ...startOrder(start) });
      return { branches, scene: this.place(branches) };
    }, this.costs, this.config.returnCost, null);
    const pick = extra
      ? outcomes.reduce((best, o) => (o.score + extra({ branches: o.branches, scene: o.scene, start: "" }) < best.score + extra({ branches: best.branches, scene: best.scene, start: "" }) ? o : best))
      : chosen;
    return { branches: pick.branches, scene: pick.scene, start: startName(pick.start) };
  }

  /** One seed's picture alone, as the search tries it. */
  seed(seed: number, anchor?: ReadonlyMap<string, number>): Picture {
    const branches = orderExploration(this.exploration, { sweeps: this.config.orderSweeps, seed });
    return { branches, scene: this.place(branches, [], anchor), start: `seed ${seed}` };
  }

  price(picture: Picture, previousTops: ReadonlyMap<string, number> | null = null, churn = 0): number {
    return pictureScore(signalsOf(picture.branches, picture.scene, previousTops), { ...this.costs, churn }, this.config.returnCost, picture.scene, picture.branches);
  }
}

/**
 * The lab's layout of a captured scope without what the page's search never does: the lab's routes and signals and its
 * cycle search. A picture is laid out exactly as `evaluate` and `evaluateAlignment` lay it out (the same exploration,
 * order, plan, captured card model and scene), so its price is theirs.
 *
 * @module layout-price/lean
 */
import { getDefaultTuning } from "../../../../../../../packages/explorer/src/client/persistence/local-storage";
import type { BoundaryAlignment } from "../../../../../../../packages/explorer/src/client/views/localView/branch-placement";
import { candidateStarts, layoutStarts, pictureScore, signalsOf, startName, startOrder, type StartCosts } from "../../../../../../../packages/explorer/src/client/views/localView/branch-restarts";
import { layoutScene, planBranches, type Scene } from "../../../../../../../packages/explorer/src/client/views/localView/branch-scene";
import { exploreBranches, orderExploration, type BranchGraph, type Exploration } from "../../../../../../../packages/explorer/src/client/views/localView/branches";
import type { ExplorerGraphPayload } from "../../../../../../../packages/explorer/src/shared/types";
import type { Capture } from "../../../../../../../scripts/layout-lab/capture";
import { includeNode, scopePins, type LabConfig } from "../../../../../../../scripts/layout-lab/evaluate";
import { capturedMeasurer } from "../../../../../../../scripts/layout-lab/measurer";
import { retainedSubject, type ScopeRun } from "../../../../../../../scripts/layout-lab/scopes";

export interface Picture { branches: BranchGraph; scene: Scene; start: string }

export class Lean {
  readonly exploration: Exploration;
  readonly costs: StartCosts;
  constructor(private readonly capture: Capture, graph: ExplorerGraphPayload, private readonly run: ScopeRun, readonly config: LabConfig) {
    const center = graph.nodes.find(node => node.id === retainedSubject(run));
    if (!center) throw new Error(`The bundle has no file ${JSON.stringify(retainedSubject(run))}.`);
    const pins = scopePins(run);
    this.exploration = exploreBranches(center, graph, pins, includeNode(pins, retainedSubject(run), capture.filters), {
      symbolOrder: config.symbolOrder, ranking: { pull: config.rankingPull, tie: config.rankingTie }, membraneDepth: config.membraneDepth
    });
    this.costs = { crossing: config.crossingCost, height: config.heightCost, width: config.widthCost, churn: 0, evenness: config.membraneEvenness, levelness: config.rowLevelness, steps: config.membraneSimplicity };
  }

  place(branches: BranchGraph, alignments: readonly BoundaryAlignment[] = [], anchor?: ReadonlyMap<string, number>): Scene {
    const plan = planBranches(branches, this.config.membranePadding);
    const measurer = capturedMeasurer(this.capture, branches, { pins: scopePins(this.run), selected: retainedSubject(this.run), collapseOnPin: getDefaultTuning().localMap.collapseOnPin, symbolOrder: this.config.symbolOrder });
    return layoutScene(plan, branches, measurer, {
      columnGap: this.config.columnGap, itemGap: this.config.itemGap, bandGap: this.config.bandGap, neck: this.config.membraneNeck, bandPadding: this.config.membranePadding, cardMaxWidth: this.config.cardMaxWidth,
      evenness: this.config.membraneEvenness, levelness: this.config.rowLevelness
    }, alignments, anchor);
  }

  /** The first picture as the page draws it: the ranking's order and the seeds before paint, the cheapest kept. */
  first(sweeps = this.config.orderSweeps, orderStarts = this.config.orderStarts): Picture {
    const ranked = this.exploration.ranking.columns.map(column => column.map(node => node.id));
    const { chosen } = layoutStarts(candidateStarts(orderStarts, null, null, ranked), start => {
      const branches = orderExploration(this.exploration, { sweeps, ...startOrder(start) });
      return { branches, scene: this.place(branches) };
    }, this.costs, this.config.returnCost, null);
    return { branches: chosen.branches, scene: chosen.scene, start: startName(chosen.start) };
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

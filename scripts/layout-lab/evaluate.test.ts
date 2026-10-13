import { describe, expect, it, vi } from "vitest";

import type { Capture } from "./capture";
import { baselineConfig, evaluate, evaluateAlignment, includeNode } from "./evaluate";
import { refine, refinementJson } from "./refine";
import type { ScopeRun } from "./scopes";
import { alignmentCandidates } from "../../packages/explorer/src/client/views/localView/branch-alignments";
import type { SceneMeasurer } from "../../packages/explorer/src/client/views/localView/branch-scene";
import { addPin, EMPTY_PIN_SET } from "../../packages/explorer/src/client/views/pin-state";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../packages/explorer/src/shared/types";

// Measurements stand in for a capture's text; ranking, ordering, placement and shape scoring remain the product's.
vi.mock("./measurer", () => ({ capturedMeasurer: (): SceneMeasurer & { metrics: Map<string, never> } => ({
  metrics: new Map(),
  widths: () => new Map([["a/x.ts", 200], ["a/y.ts", 200]]),
  measure: () => ({ heights: new Map([["a/x.ts", 100], ["a/y.ts", 100]]), pin: id => id === "a/x.ts" ? 80 : 10, labelHeights: new Map() })
}) }));
// Routed-wire diagnostics do not participate in choosing a placement.
vi.mock("./routes", () => ({ routeScene: () => [] }));

function node(id: string): ExplorerNodePayload {
  return { id, name: id, codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`,
    archetype: "implementation", dependencies: [], dependents: [], missingDependencies: [], publicSymbols: ["value"] };
}

describe("the lab's alignment evaluation", () => {
  it("keeps the captured filters, including assets admitted by the retained URL's defaults", () => {
    const asset = { ...node("data.json"), archetype: "asset" };
    const test = { ...node("unit.test.ts"), archetype: "test" };
    expect(includeNode(EMPTY_PIN_SET, "subject")(asset)).toBe(true);
    const hidden = { showAssets: false, showTests: false };
    expect(includeNode(EMPTY_PIN_SET, "subject", hidden)(asset)).toBe(false);
    expect(includeNode(EMPTY_PIN_SET, "subject", hidden)(test)).toBe(false);
    expect(includeNode(addPin(EMPTY_PIN_SET, asset.id, "*"), "subject", hidden)(asset)).toBe(true);
    expect(includeNode(EMPTY_PIN_SET, test.id, hidden)(test)).toBe(true);
  });

  it("re-solves the same ordered branches from a fresh scene and prices all three shape signals", () => {
    const nodes = [node("a/x.ts"), node("a/y.ts")];
    const graph: ExplorerGraphPayload = { nodes, links: [{ source: "a/y.ts", target: "a/x.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" }], stats: { nodes: 2, links: 1, missingDependencies: 0 } };
    const run: ScopeRun = { bundle: "repository", base: "/", scopeName: "pair", subject: nodes[0].id, scope: nodes.map(file => file.id) };
    const capture = {} as Capture;
    const config = { ...baselineConfig(), orderStarts: 0, membraneEvenness: 0, membraneSimplicity: 50, rowLevelness: 0, crossingCost: 0, heightCost: 0 };
    const initial = evaluate(capture, graph, run, config);
    expect(initial.signals.steps).toBeGreaterThan(0);
    expect(initial.starts[0].score).toBe(initial.signals.placementCost + 50 * initial.signals.steps);
    expect(initial.alignments).toEqual([]);
    const before = initial.scene.boxes.map(box => box.segments.map(segment => ({ ...segment })));
    const candidates = alignmentCandidates(initial.scene);
    const trial = evaluateAlignment(initial, capture, run, candidates[0]);
    expect(trial.branches).toBe(initial.branches);
    expect(trial.scene).not.toBe(initial.scene);
    expect(initial.scene.boxes.map(box => box.segments)).toEqual(before);
    expect(trial.alignments).toEqual(candidates[0]);
    expect(trial.signals.steps).toBeLessThan(initial.signals.steps);
    expect(trial.scene.placement.optimal).toBe(true);
    expect(trial.starts[0].signals).toMatchObject({ churn: 0, unevenness: trial.signals.unevenness, steps: trial.signals.steps, unlevel: trial.signals.unlevel });
    expect(trial.starts[0].score).toBe(trial.signals.placementCost + 50 * trial.signals.steps);
    const priced = { ...initial, config: { ...config, membraneEvenness: 2, rowLevelness: 3 } };
    const repriced = evaluateAlignment(priced, capture, run, candidates[0]);
    expect(repriced.starts[0].score).toBe(repriced.signals.placementCost + 50 * repriced.signals.steps + 2 * repriced.signals.unevenness + 3 * repriced.signals.unlevel);
  });

  it("interleaves seed and alignment trials and exports the final geometry and every decision", () => {
    const nodes = [node("a/x.ts"), node("a/y.ts")];
    const graph: ExplorerGraphPayload = { nodes, links: [{ source: "a/y.ts", target: "a/x.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" }], stats: { nodes: 2, links: 1, missingDependencies: 0 } };
    const run: ScopeRun = { bundle: "repository", base: "/", scopeName: "pair", subject: nodes[0].id, scope: nodes.map(file => file.id) };
    const capture = { capturedAt: "2026-10-13" } as Capture;
    const config = { ...baselineConfig(), orderStarts: 0, membraneEvenness: 0, membraneSimplicity: 50, rowLevelness: 0, crossingCost: 0, heightCost: 0 };
    const settings = { searchStarts: 3, searchPatience: 2, churnCost: 0 };
    const result = refine(capture, graph, run, config, settings);
    expect(result.trials.slice(0, 3).map(trial => trial.kind)).toEqual(["alignment", "seed", "alignment"]);
    expect(result.alignmentAdopted).toBeGreaterThan(0);
    expect(result.state.status).toBe("settled");
    expect(result.state.tried).toBe(2);
    expect(result.final.signals.steps).toBe(0);
    expect(result.final.scene.placement.optimal).toBe(true);
    expect(result.final.branches.columns.map(column => column.map(file => file.id))).toEqual([["a/x.ts"], ["a/y.ts"]]);
    expect(JSON.parse(refinementJson(result, run, capture))).toMatchObject({
      settings, trials: result.trials, state: result.state,
      final: { start: result.final.start, signals: { steps: 0 }, tops: Object.fromEntries(result.final.scene.tops) }
    });
    expect(refine(capture, graph, run, config, settings).trials).toEqual(result.trials);

    for (const stopped of [{ ...settings, searchStarts: 0 }, { ...settings, searchPatience: 0 }]) {
      expect(refine(capture, graph, run, config, stopped).trials).toEqual([]);
    }
    expect(refine(capture, graph, run, { ...config, orderSeed: 2 }, settings).trials).toEqual([]);
    const free = refine(capture, graph, run, { ...config, membraneSimplicity: 0 }, settings);
    expect(free.trials.every(trial => trial.kind === "seed")).toBe(true);
    expect(free.alignmentTried).toBe(0);
  });
});

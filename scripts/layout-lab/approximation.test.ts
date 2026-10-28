import { describe, expect, it } from "vitest";

import { firstTick, forceErrors, renderApproximationReport, restPictures, restSubject, savedPicture, seatedPrefix, timeEvaluations, type ApproximationReport } from "./approximation";
import type { ScopeRun } from "./scopes";
import { parseLiveDoc, renderLiveDoc } from "../../packages/engine/src/live-docs/document";
import { deriveLiveDocGraph } from "../../packages/engine/src/live-docs/graph";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning } from "../../packages/explorer/src/client/persistence/local-storage";
import { SpatialField } from "../../packages/explorer/src/client/views/forceGraphPhysics";
import { addPin, EMPTY_PIN_SET } from "../../packages/explorer/src/client/views/pin-state";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../packages/explorer/src/shared/types";

/** A bundle of files in two folders, each folder's files referencing the next, with a test of each folder. */
function bundle(): StaticExplorerData {
  const location = { root: ".live-documentation", baseLayer: "source", extension: ".md" };
  const doc = (codePath: string, archetype: string, uses: string[]) => ({
    docPath: `${location.root}/${location.baseLayer}/${codePath}.md`,
    doc: parseLiveDoc(renderLiveDoc({ codePath, layer: 4, archetype, entries: [], authored: "### Purpose\nTest.\n\n### Notes\nNone.", symbols: [],
      dependencies: uses.map(target => ({ label: target, link: `${"../".repeat(codePath.split("/").length - 1)}${target}.md`, qualifiers: [] })) }))
  });
  const files = ["a/one.ts", "a/two.ts", "a/three.ts", "b/four.ts", "b/five.ts", "b/six.ts"];
  return {
    graph: deriveLiveDocGraph([
      ...files.map((file, i) => doc(file, "implementation", i + 1 < files.length ? [files[i + 1]] : [])),
      doc("a/one.test.ts", "test", ["a/one.ts"]), doc("b/four.test.ts", "test", ["b/four.ts"])
    ], location)
  } as StaticExplorerData;
}

const node = (id: string, symbols = 1): ExplorerNodePayload => ({ id, name: id, codePath: id, codeRelativePath: id, docPath: `docs/${id}.md`, docRelativePath: `docs/${id}.md`,
  archetype: "implementation", publicSymbols: Array.from({ length: symbols }, (_, i) => `s${i}`), dependencies: [], dependents: [], missingDependencies: [] });
/** Sixty-four files in a ring of references: four leaves of the tree at the least, so that far ones are taken whole. */
const ring: ExplorerGraphPayload = {
  nodes: Array.from({ length: 64 }, (_, i) => node(`f${i}.ts`, i % 5)),
  links: Array.from({ length: 64 }, (_, i) => ({ source: `f${i}.ts`, target: `f${(i + 1) % 64}.ts`, kind: "dependency" as const })),
  stats: { nodes: 64, links: 64, referencesOutsideScan: 0 }
};
const run: ScopeRun = { bundle: "repository", base: "/", scopeName: "ring", scope: ["f0.ts"], subject: "f0.ts" };

describe("the approximation's measure", () => {
  it("pictures a large bundle as its saved address shows it: the filters it names, its pins kept whatever their type, its layout settings", () => {
    const pins = addPin(EMPTY_PIN_SET, "a/one.test.ts", "*");
    const address = `http://lab.local/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", pinSet: pins, filters: { showTests: false, showAssets: false }, layout: { forceGraph: { charge: 30, approximation: 0.45 } } })}`;
    const picture = savedPicture(bundle(), address);
    // The tests hidden but the pinned one, the files all shown.
    expect(picture.nodes.map(file => file.id).sort()).toEqual(["a/one.test.ts", "a/one.ts", "a/three.ts", "a/two.ts", "b/five.ts", "b/four.ts", "b/six.ts"]);
    expect(picture.tuning).toMatchObject({ charge: 30, approximation: 0.45, gravity: getDefaultTuning().forceGraph.gravity });
    expect(picture.layout).toBe("connections");
    expect(() => savedPicture(bundle(), "http://lab.local/")).toThrow("no state");
    // Seated where D3 seats a first picture, with the links among the spheres kept and the rest left out.
    const seated = seatedPrefix(picture, 3);
    expect(seated.nodes).toHaveLength(3);
    expect(seated.positions.every(Number.isFinite)).toBe(true);
    expect(seated.links.every(link => [link.source, link.target].every(end => seated.nodes.some(file => file.id === end)))).toBe(true);
  });

  it("times each setting's evaluation and the first tick, and leaves the field as it found it", () => {
    const picture = savedPicture(bundle(), `http://lab.local/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d" })}`);
    const rows = timeEvaluations(picture, [4, 100], [0.5], 2);
    expect(rows.map(row => [row.spheres, row.approximation])).toEqual([[4, 0], [4, 0.5], [8, 0], [8, 0.5]]);
    expect(rows.every(row => row.ms >= 0 && row.runs === 2 && Number.isFinite(row.stiffness))).toBe(true);
    const forces = SpatialField.prototype.forces;
    const tick = firstTick(picture, 0.5);
    // The motion begun on the field, released twice for a first picture's unfolding, then one tick: four at the least.
    expect(tick.evaluations).toBeGreaterThanOrEqual(4);
    expect(SpatialField.prototype.forces).toBe(forces);
  });

  it("measures a setting's error against the exact repulsion, nothing when every cell is opened", () => {
    const { rows, resolution, rest } = restPictures(ring, run, getDefaultTuning().forceGraph, "connections", [1e-9, 0.9], 5_000);
    expect(rows.map(row => row.approximation)).toEqual([0, 1e-9, 0.9]);
    expect(rows[0]).toMatchObject({ meanShift: 0, maxShift: 0, spheres: 64 });
    expect(rows[1].maxShift).toBeLessThan(1e-9);
    expect(rows.every(row => row.ticks > 0 && row.bounds.width > 0)).toBe(true);
    expect(resolution).toMatchObject({ bundle: "repository", layout: "connections" });
    expect(resolution.maxShift).toBeGreaterThanOrEqual(resolution.meanShift);
    const errors = forceErrors(restSubject(run, "connections"), rest.nodes, rest.links, rest.positions, getDefaultTuning().forceGraph, "connections", [1e-9, 0.9]);
    expect(errors[0].relativeRms).toBeLessThan(1e-12);
    expect(errors[1].relativeRms).toBeGreaterThan(errors[0].relativeRms);
    expect(errors[1].maxRelative).toBeGreaterThanOrEqual(errors[1].relativeRms);
    expect(errors[0].subject).toBe("repository connections at rest");
  });

  it("renders the tables a person reads, a picture that never fell still said so", () => {
    const report: ApproximationReport = {
      measuredAt: "2026-10-28T00:00:00.000Z", scopes: ["repository/ring"], tuning: getDefaultTuning().forceGraph, maxTicks: 5_000,
      errors: [{ subject: "repository connections at rest", spheres: 24, approximation: 0.5, relativeRms: 0.012, maxRelative: 0.2, maxOfScale: 0.02 }],
      rests: [
        { bundle: "repository", layout: "connections", approximation: 0, spheres: 24, ticks: 300, still: true, overlaps: 0, worstOverlap: 0, bounds: { width: 1, height: 2, depth: 3 }, ms: 1200, meanShift: 0, maxShift: 0 },
        { bundle: "repository", layout: "connections", approximation: 0.9, spheres: 24, ticks: 5_000, still: false, overlaps: 1, worstOverlap: 0.5, bounds: { width: 1, height: 2, depth: 3 }, ms: 9000, meanShift: 0.029, maxShift: 0.094 }
      ],
      resolutions: [{ bundle: "repository", layout: "connections", ticks: 90, still: true, meanShift: 0.0038, maxShift: 0.018 }]
    };
    const table = renderApproximationReport(report);
    expect(table).toContain("| repository connections at rest | 24 | 0.5 | 0.0120 | 0.200 | 0.0200 |");
    expect(table).toContain("| repository | connections | 0 (exact) | 24 | 300 | 0 | 0.00 | 1.0 × 2.0 × 3.0 | 1.2 | 0.0% | 0.0% |");
    expect(table).toContain("| repository | connections | 0, its rest eased again | 24 | 90 | | | | | 0.38% | 1.8% |");
    expect(table).toContain("| not still after 5000 |");
    expect(table).not.toContain("One evaluation at D3's seed");
  });
});

// The ranking's own time on a picture: main's exploreBranches against this branch's, on the same graph, alternating.
import { performance } from "node:perf_hooks";

import { baselineConfig, includeNode, scopePins } from "../../../../scripts/layout-lab/evaluate";
import { loadBundleGraph, retainedSubject, type ScopeRun } from "../../../../scripts/layout-lab/scopes";
import * as mine from "../../../../packages/explorer/src/client/views/localView/branches";
import * as main from "./main-tree/packages/explorer/src/client/views/localView/branches";

const pictures = process.argv.slice(2);

async function run(): Promise<void> {
  for (const file of pictures) {
    const scope: ScopeRun = { bundle: "repository", base: "/", scopeName: file, scope: [file], subject: file };
    const graph = await loadBundleGraph(scope);
    const config = baselineConfig();
    const pins = scopePins(scope);
    const subject = graph.nodes.find(n => n.id === retainedSubject(scope))!;
    const options = { symbolOrder: config.symbolOrder, ranking: { pull: config.rankingPull, tie: config.rankingTie }, membraneDepth: config.membraneDepth };
    const times: Record<string, number[]> = { main: [], mine: [] };
    const sizes: Record<string, unknown> = {};
    for (let round = 0; round < 12; round++) {
      const order = round % 2 ? ["mine", "main"] : ["main", "mine"];
      for (const name of order) {
        const explore = name === "main" ? main.exploreBranches : mine.exploreBranches;
        const started = performance.now();
        const explored = explore(subject, graph, pins, includeNode(pins, retainedSubject(scope)), options as never);
        const ms = performance.now() - started;
        if (round >= 2) times[name].push(ms);
        sizes[name] = { nodes: explored.subgraph.nodes.length, back: explored.ranking.back.size, cycles: (explored.ranking as { cycles?: Array<{ candidates: unknown[]; order: unknown[] }> }).cycles?.map(c => [c.order.length, c.candidates.length]) };
      }
    }
    const median = (values: number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
    console.log(file.split("/").pop(), JSON.stringify(sizes), Object.entries(times).map(([name, values]) => `${name} ${median(values).toFixed(1)} (${Math.min(...values).toFixed(1)}-${Math.max(...values).toFixed(1)})`).join("  "));
  }
}
void run();

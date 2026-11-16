import { describe, expect, it } from "vitest";

import { scoreOf, signalsOf } from "./branch-restarts";
import { DEFAULT_SCENE_TUNING, layoutScene, planBranches } from "./branch-scene";
import { edgeKey, orderExploration, rankBranches, exploreBranches, type BranchGraph, type CycleOffer } from "./branches";
import { cycleOrdersOf, horizontalWire, nextCycleTrial, rankingTerms, returningLinks, standingOrders, walkCycleTrials, type WalkedPicture } from "./cycle-trials";
import { nominalMeasurer } from "./directory-flow";
import type { LocalEdge } from "./types";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../../shared/types";
import { addPin, EMPTY_PIN_SET } from "../pin-state";

function node(id: string): ExplorerNodePayload {
  return { id, name: id, codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`,
    archetype: "implementation", dependencies: [], dependents: [], missingDependencies: [], publicSymbols: ["value"] };
}
const uses = (user: string, provider: string, symbol = "value", gathered?: number): LocalEdge => ({
  sourceId: user, targetId: provider, targetSymbol: symbol, direction: "outbound", kind: "dependency", ...(gathered === undefined ? null : { gathered })
});

describe("what a ranking adds to a picture's price", () => {
  // p in column 0, q and r in column 1, s in column 2; columns 240 wide with gaps of 100.
  const columns = [[node("p")], [node("q"), node("r")], [node("s")]];
  const scene = { lefts: [0, 340, 680], widths: [240, 240, 240] };
  const links = [uses("q", "p"), uses("s", "p", "value", 2), uses("r", "q"), uses("p", "s", "other")];
  const graph = (back: LocalEdge[]): Pick<BranchGraph, "columns" | "subgraph" | "back"> =>
    ({ columns, back: new Set(back.map(edgeKey)), subgraph: { center: null, nodes: columns.flat(), links, inboundIds: new Set(), outboundIds: new Set() } });

  it("measures the wires' horizontal length from the provider's column's right edge to the consumer's left edge, weighed as the placement weighs them", () => {
    // q uses p: 340 - 240 = 100; s uses p, a pair line of 2: 2 x (680 - 240) = 880; r uses q in its own column: nothing;
    // p's use of s returns and draws no wire.
    expect(horizontalWire(scene, graph([links[3]]))).toBe(980);
  });

  it("counts the references a picture returns, a pair line by its links, and prices them at the Return Cost", () => {
    expect(returningLinks(graph([links[3], links[1]]))).toBe(3);
    expect(rankingTerms(scene, graph([links[3]]), 500)).toBe(980 + 500);
    expect(rankingTerms(scene, graph([links[3]]), -5), "a negative cost counts nothing").toBe(980);
  });
});

describe("a cycle's orders as the search's trials", () => {
  const offer = (key: string, candidates: string[][], order = candidates[0]): CycleOffer => ({ key, candidates, order });

  it("tries once every order but the one each cycle stands in when the search begins, and none a trial adopted", () => {
    const cycles = [offer("one", [["a", "b"], ["b", "a"]]), offer("two", [["c", "d", "e"], ["d", "c", "e"], ["d", "e", "c"]], ["d", "c", "e"])];
    const orders = cycleOrdersOf(cycles);
    expect(orders).toEqual([{ key: "one", order: ["b", "a"] }, { key: "two", order: ["c", "d", "e"] }, { key: "two", order: ["d", "e", "c"] }]);
    const standing = standingOrders(cycles);
    expect(nextCycleTrial(orders, standing, 0)).toEqual({ trial: orders[0], next: 1 });
    expect(nextCycleTrial(orders, standing, 1)).toEqual({ trial: orders[1], next: 2 });
    expect(nextCycleTrial(orders, standing, 3)).toBeNull();
    // Once c, d, e is adopted, the walk goes on to d, e, c; had d, e, c been adopted first, nothing would be left of two.
    expect(nextCycleTrial(orders, new Map([...standing, ["two", ["d", "e", "c"]]]), 2)).toBeNull();
  });

  /** A walk whose prices are given by the order tried: each trial's price without churn and with it. */
  const walk = (first: WalkedPicture, cycles: CycleOffer[], prices: Record<string, [number, number]>) =>
    walkCycleTrials(first, cycles, orders => {
      const order = [...orders.values()][0].join("");
      const [price, withChurn] = prices[order];
      return { picture: { orders, price }, withChurn };
    });

  it("keeps the greedy order on a tie, and when the cheaper order's gain is less than the move's churn costs", () => {
    const cycles = [offer("one", [["a", "b"], ["b", "a"]])];
    const first = { orders: standingOrders(cycles), price: 1000 };
    expect(walk(first, cycles, { ba: [1000, 1000] }).picture.orders.get("one")).toEqual(["a", "b"]);
    // Cheaper by 40 but its churn costs 100: refused.
    const refused = walk(first, cycles, { ba: [960, 1060] });
    expect(refused.picture.orders.get("one")).toEqual(["a", "b"]);
    expect(refused.tried).toEqual([{ key: "one", order: ["b", "a"], withChurn: 1060, price: 960, adopted: false }]);
    // Cheaper with its churn counted: adopted.
    expect(walk(first, cycles, { ba: [900, 990] }).picture.orders.get("one")).toEqual(["b", "a"]);
  });

  it("starts from a remembered order, which the search may overturn", () => {
    // The session remembered b, a; in this picture a, b is cheaper by more than the move costs, and the walk turns back.
    const cycles = [offer("one", [["a", "b"], ["b", "a"]], ["b", "a"])];
    const back = walk({ orders: standingOrders(cycles), price: 1200 }, cycles, { ab: [1000, 1100] });
    expect(back.tried.map(trial => trial.order)).toEqual([["a", "b"]]);
    expect(back.picture.orders.get("one")).toEqual(["a", "b"]);
    // Where the remembered order is the cheaper, it stands.
    expect(walk({ orders: standingOrders(cycles), price: 1000 }, cycles, { ab: [1100, 1100] }).picture.orders.get("one")).toEqual(["b", "a"]);
  });

  it("returns the lighter direction of a placed pair once its returns cost more than the wire they save", () => {
    // a uses three of b's symbols and b one of a's. Placed, both orders stand the two cards in two columns 100 apart: the
    // greedy order draws b's one use of a, 100 px, and returns three; the other draws a's three uses of b, 300 px, and
    // returns one. So 100 + 3 x cost against 300 + cost: the lighter direction returns once a return costs over 100.
    const files = ["a", "b"].map(node);
    const graph: ExplorerGraphPayload = { nodes: files, links: [
      ...["x", "y", "z"].map(symbol => ({ source: "a", target: "b", targetSymbol: symbol, kind: "dependency" as const })),
      { source: "b", target: "a", targetSymbol: "w", kind: "dependency" as const }
    ], stats: { nodes: 2, links: 4, references: 4, dependenciesOutsideScan: 0 } };
    const pins = files.reduce((set, file) => addPin(set, file.id, "*"), EMPTY_PIN_SET);
    const explore = (orders?: ReadonlyMap<string, readonly string[]>) => exploreBranches(files[0], graph, pins, () => true, { ranking: { orders } });
    const place = (orders?: ReadonlyMap<string, readonly string[]>) => {
      const branches = orderExploration(explore(orders));
      const plan = planBranches(branches);
      const scene = layoutScene(plan, branches, nominalMeasurer(plan.items.keys(), () => false), DEFAULT_SCENE_TUNING);
      return { branches, scene };
    };
    const at = (cost: number) => {
      const first = place();
      const price = (picture: ReturnType<typeof place>, tops: ReadonlyMap<string, number> | null, churn: number) =>
        scoreOf(signalsOf(picture.branches, picture.scene, tops), { crossing: 80, height: 5, width: 5, churn, evenness: 2, levelness: 2, steps: 200 }) + rankingTerms(picture.scene, picture.branches, cost);
      const cycles = explore().ranking.cycles;
      const start: WalkedPicture & ReturnType<typeof place> = { orders: standingOrders(cycles), price: price(first, null, 0), ...first };
      return walkCycleTrials(start, cycles, (orders, standing) => {
        const trial = place(orders);
        return { picture: { orders, price: price(trial, null, 0), ...trial }, withChurn: price(trial, standing.scene.tops, 100) };
      }).picture;
    };
    const returned = (picture: { branches: BranchGraph }): string[] => picture.branches.subgraph.links.filter(edge => picture.branches.back.has(edgeKey(edge))).map(edge => `${edge.sourceId} uses ${edge.targetId}`);
    expect(returned(at(90))).toEqual(["a uses b", "a uses b", "a uses b"]);
    expect(returned(at(110))).toEqual(["b uses a"]);
    expect(rankBranches(files, explore().subgraph.links).cycles[0].candidates).toHaveLength(2);
  });
});

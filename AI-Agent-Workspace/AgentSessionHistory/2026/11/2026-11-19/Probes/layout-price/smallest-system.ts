/**
 * The shuttle at the solver, in the fewest nodes: two pins `p` and `q` held 72 px apart, and a card `x` wired to both,
 * so that every place of `x` from `p` to `q` costs the same. The same system is solved under every numbering of its
 * nodes, as a levelling elsewhere renumbers the page's system (each joined run's nodes become one), and `x`'s place is
 * printed for each; then the same with the second objective choosing the place nearest a shown one.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file>
 */
import { rankByNetworkSimplex, type Constraint } from "../../../../../../../packages/explorer/src/client/views/localView/network-simplex";

type Named = { tail: string; head: string; delta: number; weight: number; tie?: number };
const system: Named[] = [
  // q stands 72 below p, held there by a heavy price on any more.
  { tail: "p", head: "q", delta: 72, weight: 1000 },
  // A wire from x to each pin: an auxiliary node both ends stay below, so that the cost is the distance between them.
  { tail: "w1", head: "x", delta: 0, weight: 1 }, { tail: "w1", head: "p", delta: 0, weight: 1 },
  { tail: "w2", head: "x", delta: 0, weight: 1 }, { tail: "w2", head: "q", delta: 0, weight: 1 }
];
const names = ["p", "q", "x", "w1", "w2"];

function permutations<T>(list: T[]): T[][] {
  if (list.length <= 1) return [list];
  return list.flatMap((first, i) => permutations([...list.slice(0, i), ...list.slice(i + 1)]).map(rest => [first, ...rest]));
}

function solve(order: string[], extra: Named[] = []): { x: number; cost: number } {
  const index = new Map(order.map((name, i) => [name, i]));
  const named = [...system, ...extra];
  const all = [...new Set([...order, ...named.flatMap(c => [c.tail, c.head])])];
  all.forEach(name => { if (!index.has(name)) index.set(name, index.size); });
  const constraints: Constraint[] = named.map(c => ({ tail: index.get(c.tail)!, head: index.get(c.head)!, delta: c.delta, weight: c.weight, ...(c.tie ? { tie: c.tie } : null) }));
  const ranking = rankByNetworkSimplex(index.size, constraints);
  return { x: ranking.position[index.get("x")!] - ranking.position[index.get("p")!], cost: costOf(named, index, ranking.position) };
}
const costOf = (named: Named[], index: Map<string, number>, position: number[]): number =>
  named.reduce((sum, c) => sum + c.weight * (position[index.get(c.head)!] - position[index.get(c.tail)!]), 0);

const seen = new Map<number, number>();
for (const order of permutations(names)) {
  const { x, cost } = solve(order);
  seen.set(x, (seen.get(x) ?? 0) + 1);
  if (cost !== solve(names).cost) throw new Error("The cost differs between numberings.");
}
console.log(`Over all ${permutations(names).length} numberings, x stands below p by: ${[...seen].map(([x, n]) => `${x} px in ${n}`).join(", ")}; cost ${solve(names).cost} in every one.`);

// A constraint that never binds: x at least `lead` below a node r that nothing else holds, so r can always rise to let x
// stand anywhere. It changes no cost and no feasible place of x; it changes only where the solver's first placement
// (each node as low as the constraints into it allow) puts x, and the solver ends where it began among equal costs.
for (const lead of [30, 50, 72, 100]) {
  const unrelated: Named[] = [{ tail: "r", head: "x", delta: lead, weight: 0 }];
  const { x, cost } = solve(names, unrelated);
  console.log(`With x held at least ${lead} px below a free node: x stands ${x} px below p; cost ${cost}.`);
}

for (const shown of [0, 30, 72]) {
  // Nearness to the shown places, p at 0, q at 72 and x at `shown`: each node's distance from o + its place, o an origin,
  // in the second objective only.
  const near: Named[] = (Object.entries({ p: 0, q: 72, x: shown })).flatMap(([node, at]) => [
    { tail: `n${node}`, head: node, delta: 0, weight: 0, tie: 1 }, { tail: `n${node}`, head: "o", delta: -at, weight: 0, tie: 1 }
  ]);
  const anchored = new Map<number, number>();
  for (const order of permutations(names)) {
    const { x, cost } = solve(order, near);
    if (cost !== solve(names).cost) throw new Error("Nearness changed the cost.");
    anchored.set(x, (anchored.get(x) ?? 0) + 1);
  }
  console.log(`Shown ${shown} px below p: x stands ${[...anchored].map(([x, n]) => `${x} px below p in ${n}`).join(", ")}.`);
}

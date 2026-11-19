/**
 * The solver's time on the recorded systems of the five-file scope, with and without every node drawn toward a seeded
 * place in the second objective, interleaved, and the first objective's cost of each.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file>
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { rankByNetworkSimplex, type Constraint } from "../../../../../../../packages/explorer/src/client/views/localView/network-simplex";

const file = path.resolve(__dirname, "../../../../../../../packages/explorer/src/client/views/localView/__fixtures__/network-simplex.systems.json");
const recorded = JSON.parse(readFileSync(file, "utf8")) as Array<[number, number[]]>;
for (const [index, [count, flat]] of recorded.entries()) {
  const constraints: Constraint[] = [];
  for (let i = 0; i < flat.length; i += 4) constraints.push({ tail: flat[i], head: flat[i + 1], delta: flat[i + 2], weight: flat[i + 3] });
  const plain = rankByNetworkSimplex(count, constraints);
  // Toward the plain solution's own places: the second objective then has nothing to choose but what the first chose.
  const toward = (places: number[]): Constraint[] => places.flatMap((place, node) => [
    { tail: count + 1 + node, head: node, delta: 0, weight: 0, tie: 1 }, { tail: count + 1 + node, head: count, delta: -place, weight: 0, tie: 1 }
  ]);
  let state = index + 1;
  const next = (): number => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
  const random = Array.from({ length: count }, () => Math.floor(next() * 4000));
  for (const [name, extra] of [["none", [] as Constraint[]], ["toward its own solution", toward(plain.position)], ["toward seeded places", toward(random)]] as const) {
    const started = performance.now();
    const ranking = rankByNetworkSimplex(extra.length ? 2 * count + 1 : count, [...constraints, ...extra]);
    console.log(`system ${index} (${count} nodes, ${constraints.length} constraints), ${name}: ${Math.round(performance.now() - started)} ms, cost ${ranking.cost === plain.cost ? "the same" : `${ranking.cost} against ${plain.cost}`}, optimal ${ranking.optimal}`);
  }
}

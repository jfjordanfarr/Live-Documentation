/**
 * The orders of a cycle's files, left to right, among which the 2D Local Map's ranking chooses. Files that use one
 * another in a cycle cannot all stand right of what they use, so some references must read backward, drawn as returns;
 * the order decides which. The placed picture's price chooses among the candidates (`cycle-choice`); this module gives
 * the ranking the candidates ({@link cycleCandidates}): the greedy order the ranking used until 2026-11-16, the
 * order that returns the fewest references ({@link fewestReturnsOrder}, by its own price {@link comparePrices}: exact for
 * a cycle of up to {@link EXACT_LIMIT} files by a search over its subsets, a greedy order improved by single moves
 * beyond), and the orders a single move reaches on the way from the one to the other.
 *
 * A cycle is given by index, its files in a fixed order (the ranking sorts them by id), and by its references:
 * `weight[p][c]` is how many references file c makes to file p, a pair line counting the links it stands for. The
 * picture reads provider first, so a reference from c to p reads backward when c stands left of p. An order is a list
 * of the files' indices, left to right.
 *
 * @module views/localView/cycle-order
 */

/** A cycle's references by its files' indices: `weight[p][c]` is how many references file c makes to file p. */
export type CycleWeights = readonly (readonly number[])[];

/** What an order of a cycle's files costs; {@link comparePrices} says which of two is cheaper. */
export interface CyclePrice {
  /** The references that read backward. */
  backward: number;
  /** The pairs of files with a return between them. */
  pairs: number;
  /** The pairs of files joined by a reference that stand the other way round from the greedy order. */
  turned: number;
}

/**
 * The cheaper of two orders' prices, as a comparison (negative when `a` is cheaper). First the fewest references read
 * backward: each is a wire that leaves a card on its right and walks leftward to its destination, against the reading
 * of the picture, which is what the owner asked the layout to avoid (2026-10-06) and what the cards' feet and the 3D
 * button count. Among equals, the fewest pairs of files with a return between them: every such pair is a lace and a
 * foot at both its cards, so the same returns between fewer pairs are fewer marks to read. Among equals, the order
 * nearest the greedy one ({@link greedyOrder}, unweighted), in which the ranking stood every cycle until 2026-11-16,
 * counted as the pairs of files joined by a reference that stand the other way round from it: so a picture whose order
 * was already a minimum does not move at all, and one that must move turns as few of its pairs as it can. Pairs that no
 * reference joins are not counted, so the price depends only on which references return, which is all the picture
 * shows of the order.
 */
export function comparePrices(a: CyclePrice, b: CyclePrice): number {
  return a.backward - b.backward || a.pairs - b.pairs || a.turned - b.turned;
}

/**
 * The largest cycle ordered exactly. The search's time doubles with each file: on a worst case, every file of the
 * cycle using every other by one to nine references, twelve files take about 2 ms and sixteen about 43 ms (measured
 * 2026-11-16 in the devcontainer), while this repository's largest cycles but one have eight files.
 */
export const EXACT_LIMIT = 12;

/**
 * What a reference read backward through a cycle costs a picture, in pixels of wire, when no tuning says otherwise:
 * Tuning → 2D Layout → Return Cost's default, a term of the placed picture's price (`cycle-choice`). Set from the
 * pictures the fewest-returns order changed in this repository (2026-11-16): every picture that reads better has left
 * the greedy order by 1,475 and none that only scores better leaves it below 2,675; the measurement is in the decisions
 * log. Kept here, in a module with no imports, so that the tuning's defaults can read it.
 */
export const DEFAULT_RETURN_COST = 1500;

/** The order of a cycle's files that returns the fewest references: exact up to {@link EXACT_LIMIT} files, a local minimum beyond. */
export function fewestReturnsOrder(weight: CycleWeights): number[] {
  const greedy = greedyOrder(weight, false);
  if (weight.length <= EXACT_LIMIT) return exactOrder(weight, greedy);
  return improvedOrder(greedyOrder(weight, true), weight, greedy);
}

/**
 * The orders the ranking prices for a cycle, the greedy order first: then, on the way to the fewest-returns order, the
 * order each single move reaches, a file taken to the place it has there, the leftmost that differs first, ending with
 * that order. Orders that return the same references draw the same picture, so each set of returns is given once, by
 * the first order found with it. So a cycle whose greedy order already returns the fewest has one candidate.
 */
export function cycleCandidates(weight: CycleWeights): number[][] {
  const greedy = greedyOrder(weight, false), fewest = fewestReturnsOrder(weight);
  const orders = [greedy];
  const order = [...greedy];
  fewest.forEach((file, place) => {
    if (order[place] === file) return;
    order.splice(order.indexOf(file), 1);
    order.splice(place, 0, file);
    orders.push([...order]);
  });
  const seen = new Set<string>();
  return orders.filter(candidate => {
    const at = placesOf(candidate);
    const returns = weight.flatMap((row, p) => row.flatMap((w, c) => (w > 0 && at[c] < at[p] ? [`${p} ${c}`] : []))).join(",");
    if (seen.has(returns)) return false;
    seen.add(returns);
    return true;
  });
}

/**
 * Eades, Lin and Smyth's greedy order of a cycle: a file nothing left serves goes to the back, one that uses nothing
 * left goes to the front, otherwise the one that serves the most more than it uses; what is left is looked at again,
 * each choice the first of the files in their given order. Unweighted it counts files, the rule the ranking used alone
 * until 2026-11-16 and the price's last tie-break since; weighted it counts references, the start of a large cycle's
 * search.
 */
export function greedyOrder(weight: CycleWeights, weighted: boolean): number[] {
  const n = weight.length;
  const remaining = new Set(Array.from({ length: n }, (_, i) => i));
  const measure = (w: number): number => (weighted ? w : w > 0 ? 1 : 0);
  const serves = (v: number): number => { let total = 0; for (const u of remaining) if (u !== v) total += measure(weight[v][u]); return total; };
  const uses = (v: number): number => { let total = 0; for (const u of remaining) if (u !== v) total += measure(weight[u][v]); return total; };
  const front: number[] = [], back: number[] = [];
  while (remaining.size) {
    const left = [...remaining];
    const sink = left.find(v => serves(v) === 0);
    if (sink !== undefined) { back.unshift(sink); remaining.delete(sink); continue; }
    const source = left.find(v => uses(v) === 0);
    if (source !== undefined) { front.push(source); remaining.delete(source); continue; }
    const choice = left.reduce((best, v) => (serves(v) - uses(v) > serves(best) - uses(best) ? v : best));
    front.push(choice);
    remaining.delete(choice);
  }
  return [...front, ...back];
}

/** The price of an order of a cycle's files, against the greedy order. */
export function priceOf(order: readonly number[], weight: CycleWeights, greedy: readonly number[]): CyclePrice {
  const place = placesOf(greedy);
  const price: CyclePrice = { backward: 0, pairs: 0, turned: 0 };
  for (let i = 0; i < order.length; i++) for (let j = i + 1; j < order.length; j++) {
    const u = order[i], v = order[j];
    // u stands left of v: what v offers u reads backward.
    price.backward += weight[v][u];
    if (weight[v][u] > 0) price.pairs++;
    if ((weight[u][v] > 0 || weight[v][u] > 0) && place[u] > place[v]) price.turned++;
  }
  return price;
}

/**
 * The cheapest order by the price, by a search over subsets: the cheapest order of each set of files is the cheapest,
 * over the file that stands last, of the cheapest order of the rest with that file after it, which adds the references
 * it offers to the rest, the pairs it returns to and the joined pairs it turns. Every part of the price is such a sum,
 * so the search is exact. Among orders of the same price it keeps the first found, by the files' given order.
 */
export function exactOrder(weight: CycleWeights, greedy: readonly number[]): number[] {
  const n = weight.length;
  const place = placesOf(greedy);
  const sets = 1 << n;
  const backward = new Float64Array(sets), pairs = new Int32Array(sets), turned = new Int32Array(sets), last = new Int8Array(sets);
  // For each file: the files it offers to, which return when they stand left of it; the files a reference joins it to
  // that the greedy order stands right of it, whose pair turns when they stand left of it.
  const offers = weight.map((row, v) => row.reduce((mask, w, u) => (u !== v && w > 0 ? mask | (1 << u) : mask), 0));
  const turns = weight.map((row, v) => row.reduce((mask, w, u) => (u !== v && (w > 0 || weight[u][v] > 0) && place[u] > place[v] ? mask | (1 << u) : mask), 0));
  for (let set = 1; set < sets; set++) {
    let bestB = Infinity, bestP = 0, bestT = 0, best = -1;
    for (let v = 0; v < n; v++) {
      if (!((set >> v) & 1)) continue;
      const rest = set & ~(1 << v);
      const returning = rest & offers[v];
      let b = backward[rest];
      for (let m = returning; m; m &= m - 1) b += weight[v][31 - Math.clz32(m & -m)];
      const p = pairs[rest] + bits(returning), t = turned[rest] + bits(rest & turns[v]);
      if (b < bestB || (b === bestB && (p < bestP || (p === bestP && t < bestT)))) { bestB = b; bestP = p; bestT = t; best = v; }
    }
    backward[set] = bestB; pairs[set] = bestP; turned[set] = bestT; last[set] = best;
  }
  const order: number[] = [];
  for (let set = sets - 1; set; set &= ~(1 << last[set])) order.unshift(last[set]);
  return order;
}

/**
 * An order improved by the price's cheapest local moves: each round tries every file at every other place, keeps the
 * move that lowers the price the most, the first found among equals, and stops when none lowers it.
 */
export function improvedOrder(start: readonly number[], weight: CycleWeights, greedy: readonly number[]): number[] {
  const place = placesOf(greedy);
  const order = [...start];
  const n = order.length;
  // What the price gains when u, standing left of v, comes to stand right of it.
  const flip = (u: number, v: number): CyclePrice => {
    const joined = weight[u][v] > 0 || weight[v][u] > 0;
    return {
      backward: weight[u][v] - weight[v][u],
      pairs: (weight[u][v] > 0 ? 1 : 0) - (weight[v][u] > 0 ? 1 : 0),
      turned: joined ? (place[v] > place[u] ? 1 : 0) - (place[u] > place[v] ? 1 : 0) : 0
    };
  };
  const add = (a: CyclePrice, b: CyclePrice): CyclePrice => ({ backward: a.backward + b.backward, pairs: a.pairs + b.pairs, turned: a.turned + b.turned });
  const none: CyclePrice = { backward: 0, pairs: 0, turned: 0 };
  for (;;) {
    let best = none, from = -1, to = -1;
    for (let i = 0; i < n; i++) {
      // The file at i moved right, past each file in turn, then moved left past each in turn.
      let gain = none;
      for (let j = i + 1; j < n; j++) {
        gain = add(gain, flip(order[i], order[j]));
        if (comparePrices(gain, best) < 0) { best = gain; from = i; to = j; }
      }
      gain = none;
      for (let j = i - 1; j >= 0; j--) {
        gain = add(gain, flip(order[j], order[i]));
        if (comparePrices(gain, best) < 0) { best = gain; from = i; to = j; }
      }
    }
    if (from < 0) return order;
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
  }
}

/** Each file's place in an order. */
function placesOf(order: readonly number[]): number[] {
  const place: number[] = [];
  order.forEach((v, i) => { place[v] = i; });
  return place;
}

/** How many files a set holds. */
function bits(set: number): number {
  let count = 0;
  for (let m = set; m; m &= m - 1) count++;
  return count;
}

/**
 * The shuttle in the smallest picture: card `x` has one pin, wired to the pins of `a`, `b`, `c` and `d` in the column to
 * its left, two above it and two below, so that every place between `b`'s pin and `c`'s costs the same wire. A card `y`
 * with no wire is then put above `x` in its column: it can stand anywhere above `x` and changes no cost, yet `x` moves to
 * the other end of its tie. Then the same with the first picture's tops given (`anchor`).
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file>
 */
import { placeBranches, type PlacementInput } from "../../../../../../../packages/explorer/src/client/views/localView/branch-placement";

const wire = (from: string, to: string) => ({ from: { item: from, offset: 10 }, to: { item: to, offset: 10 }, weight: 1 });
const root = (items: string[]) => ({ key: "root", insetTop: 0, insetBottom: 0, minColumn: 0, maxColumn: 1, row: 0, shaped: false, items, children: [] });
const first: PlacementInput = {
  columns: [["a", "b", "c", "d"], ["x"]],
  heights: new Map([["a", 50], ["b", 50], ["c", 50], ["d", 50], ["x", 50]]),
  wires: [wire("a", "x"), wire("b", "x"), wire("c", "x"), wire("d", "x")],
  bands: [root(["a", "b", "c", "d", "x"])], gap: 20, bandGap: 20, neck: 60
};
const withY = (height: number): PlacementInput => ({
  ...first, columns: [["a", "b", "c", "d"], ["y", "x"]], heights: new Map([...first.heights, ["y", height]]), bands: [root(["a", "b", "c", "d", "y", "x"])]
});

const report = (name: string, input: PlacementInput): Map<string, number> => {
  const placed = placeBranches(input);
  console.log(`${name}: x's top ${placed.top.get("x")! - placed.top.get("a")!} below a's (b ${placed.top.get("b")! - placed.top.get("a")!}, c ${placed.top.get("c")! - placed.top.get("a")!}); wire ${placed.cost}`);
  return placed.top;
};
const shown = report("first", first);
for (const height of [50, 100, 150, 200]) {
  report(`y ${height} px tall above x`, withY(height));
  report(`  the same, near the first picture`, { ...withY(height), anchor: shown });
}

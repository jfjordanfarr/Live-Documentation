/**
 * Two candidate mends of the 2D map's price, built here in the lab's probe and nowhere in the product: each is what it
 * adds to the page's price (`pictureScore`) for a picture.
 *
 * - `A`: an outline's steps counted only between neighbouring columns that both hold the directory's own cards. The page
 *   counts every nonzero step at Membrane Simplicity; A takes away the steps beside a column that holds none of the
 *   directory's own cards (an empty column of the outline, or one with only nested directories in it).
 * - `B:<rate>`: every drawn outline's height priced at `rate` pixels of wire a pixel, every segment of every directory,
 *   so that ground an outline encloses costs something. The placement still lays the picture out as today; B only judges.
 *
 * @module layout-price/candidates
 */
import { rowItemsOf, type Scene } from "../../../../../../../packages/explorer/src/client/views/localView/branch-scene";

/** The outline steps between columns that both hold the directory's own cards, and every outline step. */
export function stepCounts(scene: Scene): { cardSteps: number; steps: number } {
  let cardSteps = 0, steps = 0;
  for (const box of scene.boxes) {
    if (box.kind !== "directory") continue;
    const own = rowItemsOf(box);
    const holds = (column: number): boolean => own.some(id => scene.items.get(id)?.column === column);
    for (let i = 1; i < box.segments.length; i++) {
      const a = box.segments[i - 1], b = box.segments[i];
      const n = Number(a.top !== b.top) + Number(a.bottom !== b.bottom);
      steps += n;
      if (holds(a.column) && holds(b.column)) cardSteps += n;
    }
  }
  return { cardSteps, steps };
}

/** The pixels of height of every drawn outline's segments. */
export const outlineHeight = (scene: Scene): number =>
  scene.boxes.reduce((sum, box) => (box.kind !== "directory" ? sum : sum + box.segments.reduce((t, s) => t + s.bottom - s.top, 0)), 0);

/** What a candidate adds to the page's price: `today` nothing, `A`, or `B:<rate>`. */
export function candidateExtra(name: string, simplicity: number): (picture: { scene: Scene }) => number {
  if (name === "today") return () => 0;
  if (name === "A") return ({ scene }) => { const { cardSteps, steps } = stepCounts(scene); return simplicity * (cardSteps - steps); };
  const rate = /^B:(\d+(\.\d+)?)$/u.exec(name);
  if (rate) return ({ scene }) => Number(rate[1]) * outlineHeight(scene);
  throw new Error(`No candidate ${JSON.stringify(name)}: today, A or B:<rate>.`);
}

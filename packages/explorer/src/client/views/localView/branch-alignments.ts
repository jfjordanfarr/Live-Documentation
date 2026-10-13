import type { BoundaryAlignment } from "./branch-placement";
import type { Scene } from "./branch-scene";

/**
 * Alternatives for the Local Map's continuing search: join two neighboring
 * flat runs of a membrane's top or bottom, while keeping the picture's other
 * existing flat runs together. The placement re-solves the whole scene under
 * those equalities; cards, lanes and containing membranes remain subject to
 * the same constraints and may move. The shared score decides whether the
 * resulting picture earns that move.
 *
 * These are local-search candidates, not a globally optimal step-count solve.
 * Keeping complete runs matters: aligning only the two segments beside a
 * step can merely move that step into the next column or an ancestor.
 *
 * Pure-function module: no DOM or clock.
 * @module branch-alignments
 */

/**
 * One candidate per existing step, shortest first for an early opportunity
 * to remove a small distraction. Ties keep scene/edge/column order. Every
 * candidate retains all drawn membranes' already-flat runs, including those
 * of ancestors, and joins both complete runs beside its selected step.
 */
export function alignmentCandidates(scene: Scene): BoundaryAlignment[][] {
  const flat: BoundaryAlignment[] = [];
  const joins: Array<{ alignment: BoundaryAlignment; distance: number }> = [];
  for (const box of scene.boxes) {
    if (box.kind !== "directory") continue;
    for (const edge of ["top", "bottom"] as const) {
      const runs: Array<{ from: number; to: number; value: number }> = [];
      for (const segment of box.segments) {
        const previous = runs[runs.length - 1];
        if (previous && previous.value === segment[edge] && previous.to + 1 === segment.column) previous.to = segment.column;
        else runs.push({ from: segment.column, to: segment.column, value: segment[edge] });
      }
      for (const run of runs) {
        if (run.to > run.from) flat.push({ band: box.key, edge, fromColumn: run.from, toColumn: run.to });
      }
      for (let index = 1; index < runs.length; index++) {
        const before = runs[index - 1], after = runs[index];
        joins.push({ alignment: { band: box.key, edge, fromColumn: before.from, toColumn: after.to }, distance: Math.abs(before.value - after.value) });
      }
    }
  }
  return joins.sort((a, b) => a.distance - b.distance).map(join => [...flat, join.alignment]);
}

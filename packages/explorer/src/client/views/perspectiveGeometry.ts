/** A screen point shared by a symbol route and its file-level connection. */
export interface TransitionPoint { x: number; y: number }

/** Smooth a bounded phase without overshoot. */
export function transitionEase(value: number): number {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

/** Outward phase: remove containment, gather interfaces, then move file tokens. */
export function perspectivePhases(progress: number): { fold: number; move: number; background: number } {
  return {
    fold: transitionEase((progress - .22) / .3),
    move: transitionEase((progress - .52) / .42),
    background: transitionEase((progress - .5) / .5)
  };
}

/** Peel ancestors before children; running progress backward builds from leaves outward. */
export function directoryOpacity(progress: number, depth: number, levels: number): number {
  const step = .22 / Math.max(1, levels);
  return 1 - transitionEase((progress - depth * step) / step);
}

/** Gather a sampled native curve onto one file wire, preserving its exact endpoints at rest. */
export function gatherWire(
  points: readonly TransitionPoint[], provider: TransitionPoint, consumer: TransitionPoint, fold: number
): TransitionPoint[] {
  return points.map((point, i) => {
    const along = points.length > 1 ? i / (points.length - 1) : 0;
    const x = provider.x + (consumer.x - provider.x) * along;
    const y = provider.y + (consumer.y - provider.y) * along;
    return { x: point.x + (x - point.x) * fold, y: point.y + (y - point.y) * fold };
  });
}

/** A screen point shared by a symbol route and its file-level connection. */
export interface TransitionPoint { x: number; y: number }

/** Match each destination once, preferring its exact card over directory aliases derived from canonical containment. */
export function perspectiveCorrespondences(
  localIds: readonly string[], destinations: ReadonlySet<string>, directoryRepresentatives?: ReadonlyMap<string, string>
): Map<string, string> {
  const matches = new Map(localIds.filter(id => destinations.has(id)).map(id => [id, id]));
  const claimed = new Set(matches.values());
  for (const id of localIds) {
    if (matches.has(id)) continue;
    const representative = directoryRepresentatives?.get(id);
    if (!representative || !destinations.has(representative) || claimed.has(representative)) continue;
    matches.set(id, representative);
    claimed.add(representative);
  }
  return matches;
}

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

/**
 * A native wire's outline as a polyline, from the path data the Local Map writes (absolute M, L, C and Q, the commands
 * `connections.ts` and `branch-routing.ts` use), each curve flattened finely enough that its length and its points
 * agree with the browser's to a small fraction of a pixel; null for data of any other form, which the caller samples
 * through the browser instead. Until 2026-11-07 every wire was sampled by `getPointAtLength`, up to 257 calls a wire, about
 * 15 ms a wire and 2.5 s of the switch on this repository's picture pinned on one file.
 */
export function pathOutline(d: string): TransitionPoint[] | null {
  const tokens = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  const outline: TransitionPoint[] = [];
  let at = 0, current: TransitionPoint | null = null;
  const number = (): number => {
    const value = Number(tokens[at++]);
    if (!Number.isFinite(value)) throw new RangeError("not a number");
    return value;
  };
  const point = (): TransitionPoint => ({ x: number(), y: number() });
  // A curve's pieces: enough that each is nearly straight, by the length of its control polygon.
  const pieces = (...polygon: TransitionPoint[]): number => {
    let length = 0;
    for (let i = 1; i < polygon.length; i++) length += Math.hypot(polygon[i].x - polygon[i - 1].x, polygon[i].y - polygon[i - 1].y);
    return Math.max(8, Math.min(512, Math.ceil(length / 2)));
  };
  try {
    let command = "";
    while (at < tokens.length) {
      if (/[A-Za-z]/.test(tokens[at])) command = tokens[at++];
      if (command === "M") { current = point(); outline.push(current); command = "L"; continue; }
      if (!current) return null;
      const from: TransitionPoint = current;
      if (command === "L") { current = point(); outline.push(current); continue; }
      if (command === "C") {
        const c1 = point(), c2 = point(), to = point(), n = pieces(from, c1, c2, to);
        for (let i = 1; i <= n; i++) {
          const t = i / n, u = 1 - t;
          outline.push({ x: u * u * u * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x,
            y: u * u * u * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y });
        }
        current = to; continue;
      }
      if (command === "Q") {
        const c = point(), to = point(), n = pieces(from, c, to);
        for (let i = 1; i <= n; i++) {
          const t = i / n, u = 1 - t;
          outline.push({ x: u * u * from.x + 2 * u * t * c.x + t * t * to.x, y: u * u * from.y + 2 * u * t * c.y + t * t * to.y });
        }
        current = to; continue;
      }
      return null;
    }
  } catch {
    return null;
  }
  return outline.length ? outline : null;
}

/** A polygon's outline, closed, from its `points` attribute; null for an attribute it cannot read. */
export function polygonOutline(points: string): TransitionPoint[] | null {
  const values = (points.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? []).map(Number);
  if (values.length < 2 || values.length % 2) return null;
  const outline = Array.from({ length: values.length / 2 }, (_, i) => ({ x: values[2 * i], y: values[2 * i + 1] }));
  return [...outline, outline[0]];
}

/** An outline's length. */
export function outlineLength(outline: readonly TransitionPoint[]): number {
  let length = 0;
  for (let i = 1; i < outline.length; i++) length += Math.hypot(outline[i].x - outline[i - 1].x, outline[i].y - outline[i - 1].y);
  return length;
}

/** `steps + 1` points at equal distances along an outline, its ends exact, as the browser's `getPointAtLength` gives them. */
export function sampleOutline(outline: readonly TransitionPoint[], steps: number): TransitionPoint[] {
  const total = outlineLength(outline);
  const samples: TransitionPoint[] = [];
  let segment = 1, walked = 0;
  for (let i = 0; i <= steps; i++) {
    const wanted = total * i / steps;
    while (segment < outline.length - 1) {
      const length = Math.hypot(outline[segment].x - outline[segment - 1].x, outline[segment].y - outline[segment - 1].y);
      if (walked + length >= wanted) break;
      walked += length; segment++;
    }
    const a = outline[Math.min(segment - 1, outline.length - 1)], b = outline[Math.min(segment, outline.length - 1)];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const t = length > 0 ? Math.max(0, Math.min(1, (wanted - walked) / length)) : 0;
    samples.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return samples;
}

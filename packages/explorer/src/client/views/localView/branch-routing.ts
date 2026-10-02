/** A point in unscaled Local Map coordinates. */
export interface RoutePoint { x: number; y: number }

/** Route a skipped rank or cycle around the occupied columns, keeping both endpoint directions. */
export function branchDetourPoints(
  source: RoutePoint, target: RoutePoint, providerRight: number, consumerLeft: number, laneY: number
): RoutePoint[] {
  const exit = providerRight + 22, entry = consumerLeft - 22;
  return [source, { x: exit, y: source.y }, { x: exit, y: laneY },
    { x: entry, y: laneY }, { x: entry, y: target.y }, target];
}

/** Round orthogonal bends without overshooting a short segment. */
export function roundedBranchRoute(points: RoutePoint[]): string {
  if (!points.length) return "";
  const commands = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1], b = points[i], c = points[i + 1];
    const before = Math.hypot(b.x - a.x, b.y - a.y), after = Math.hypot(c.x - b.x, c.y - b.y);
    const radius = Math.min(12, before / 2, after / 2);
    if (!radius) { commands.push(`L ${b.x} ${b.y}`); continue; }
    commands.push(`L ${b.x + (a.x - b.x) * radius / before} ${b.y + (a.y - b.y) * radius / before}`);
    commands.push(`Q ${b.x} ${b.y} ${b.x + (c.x - b.x) * radius / after} ${b.y + (c.y - b.y) * radius / after}`);
  }
  const last = points[points.length - 1];
  return `${commands.join(" ")} L ${last.x} ${last.y}`;
}

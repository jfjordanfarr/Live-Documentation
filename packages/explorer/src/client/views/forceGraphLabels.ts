/** Screen-space placement for readable names beside the 3D Local Map's spheres. */
export interface LabelBox { x: number; y: number; width: number; height: number }

/** A measured name and its projected sphere; lower priorities are placed first. */
export interface SpatialLabel {
  id: string;
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
  priority: number;
}

/** Place names near their spheres, keeping text readable and leaving crowded names for a closer view. */
export function placeSpatialLabels(
  labels: readonly SpatialLabel[],
  viewport: { width: number; height: number },
  obstacles: readonly LabelBox[],
  previous: ReadonlyMap<string, number>
): Map<string, LabelBox & { side: number }> {
  const placed = new Map<string, LabelBox & { side: number }>();
  const occupied = [...obstacles];
  const overlaps = (a: LabelBox, b: LabelBox): boolean => a.x < b.x + b.width + 10 && a.x + a.width + 10 > b.x
    && a.y < b.y + b.height + 10 && a.y + a.height + 10 > b.y;
  for (const label of [...labels].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))) {
    const { x, y, width, height } = label;
    const gap = label.radius + 7;
    const candidates = [
      { x: x - width / 2, y: y + gap },
      { x: x - width / 2, y: y - gap - height },
      { x: x + gap, y: y - height / 2 },
      { x: x - gap - width, y: y - height / 2 },
      { x: x + gap * .7, y: y + gap * .7 },
      { x: x - gap * .7 - width, y: y + gap * .7 },
      { x: x + gap * .7, y: y - gap * .7 - height },
      { x: x - gap * .7 - width, y: y - gap * .7 - height }
    ];
    const remembered = previous.get(label.id);
    const sides = remembered === undefined ? candidates.map((_, i) => i)
      : [remembered, ...candidates.map((_, i) => i).filter(i => i !== remembered)];
    for (const side of sides) {
      const box = { ...candidates[side], width, height, side };
      if (box.x < 8 || box.y < 8 || box.x + width > viewport.width - 8 || box.y + height > viewport.height - 8) continue;
      if (occupied.some(other => overlaps(box, other))) continue;
      // A contextual name must not cover a more important sphere and look like that sphere's identity.
      if (labels.some(other => {
        if (other.id === label.id || other.priority > label.priority) return false;
        const dx = Math.max(box.x, Math.min(other.x, box.x + width)) - other.x;
        const dy = Math.max(box.y, Math.min(other.y, box.y + height)) - other.y;
        return dx * dx + dy * dy < (other.radius + 2) ** 2;
      })) continue;
      placed.set(label.id, box);
      occupied.push(box);
      break;
    }
  }
  return placed;
}

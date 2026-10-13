import { describe, expect, it } from "vitest";

import { alignmentCandidates } from "./branch-alignments";
import type { BoundaryAlignment } from "./branch-placement";
import type { Scene, SceneBox } from "./branch-scene";

/** Only the box identities and segment geometry enter candidate construction. */
const box = (key: string, tops: number[], bottoms: number[], firstColumn = 0, kind: SceneBox["kind"] = "directory"): SceneBox => ({
  key, kind, segments: tops.map((top, index) => ({ column: firstColumn + index, left: index * 200, right: index * 200 + 100, top, bottom: bottoms[index] }))
} as SceneBox);

const scene = (boxes: SceneBox[]): Scene => ({ boxes } as Scene);

const alignment = (band: string, edge: BoundaryAlignment["edge"], fromColumn: number, toColumn: number): BoundaryAlignment =>
  ({ band, edge, fromColumn, toColumn });

describe("membrane alignment alternatives", () => {
  it("keeps ancestors' complete flat runs when removing a descendant's small top step", () => {
    const parent = box("packages", [55, 55, 471], [1500, 1500, 1500]);
    const child = box("engine", [96, 68], [1417, 1417]);
    parent.children = [child];
    child.parent = parent;
    const original = parent.segments.map(segment => ({ ...segment }));
    const alternatives = alignmentCandidates(scene([parent, child]));
    expect(alternatives).toHaveLength(2);
    // Keeping packages' first two tops together prevents the engine's removed step from moving into its parent.
    expect(alternatives[0]).toEqual([
      alignment("packages", "top", 0, 1), alignment("packages", "bottom", 0, 2),
      alignment("engine", "bottom", 0, 1), alignment("engine", "top", 0, 1)
    ]);
    for (const candidate of alternatives) {
      expect(candidate).toContainEqual(alignment("packages", "top", 0, 1));
      expect(candidate).toContainEqual(alignment("packages", "bottom", 0, 2));
      expect(candidate).toContainEqual(alignment("engine", "bottom", 0, 1));
    }
    expect(parent.segments).toEqual(original);
  });

  it("joins both full warehouse bottom runs instead of moving the 27-pixel step one column right", () => {
    const warehouse = scene([box("main", [82, 82, 82, 82, 82], [527, 527, 500, 500, 353])]);
    const alternatives = alignmentCandidates(warehouse);
    expect(alternatives).toHaveLength(2);
    const retained = [alignment("main", "top", 0, 4), alignment("main", "bottom", 0, 1), alignment("main", "bottom", 2, 3)];
    expect(alternatives[0]).toEqual([...retained, alignment("main", "bottom", 0, 3)]);
    expect(alternatives[1]).toEqual([...retained, alignment("main", "bottom", 2, 4)]);
    expect(alternatives[0]).not.toContainEqual(alignment("main", "bottom", 1, 2));
  });

  it("offers only drawn directory boundaries, never the root, loose-file buckets or wire lanes", () => {
    const invisible = ["root", "files", "lane"].map(kind => box(kind, [0, 1, 1], [10, 10, 12], 0, kind as SceneBox["kind"]));
    const alternatives = alignmentCandidates(scene([...invisible, box("directory", [50, 70], [150, 150], 3)]));
    expect(alternatives).toEqual([[alignment("directory", "bottom", 3, 4), alignment("directory", "top", 3, 4)]]);
    expect(alignmentCandidates(scene(invisible))).toEqual([]);
  });

  it("has no alternatives for empty, single-column or already-flat directory scenes", () => {
    expect(alignmentCandidates(scene([]))).toEqual([]);
    expect(alignmentCandidates(scene([box("single", [25], [200], 4)]))).toEqual([]);
    expect(alignmentCandidates(scene([box("flat", [20, 20, 20], [200, 200, 200])]))).toEqual([]);
  });

  it("tries smaller steps first, with reproducible scene, edge and column order for ties", () => {
    const pictured = scene([box("z", [0, 10, 20], [100, 110, 120]), box("a", [30, 35], [100, 100], 4)]);
    const alternatives = alignmentCandidates(pictured);
    // The added join follows the common retained runs in each candidate.
    expect(alternatives.map(candidate => candidate.at(-1))).toEqual([
      alignment("a", "top", 4, 5), alignment("z", "top", 0, 1), alignment("z", "top", 1, 2),
      alignment("z", "bottom", 0, 1), alignment("z", "bottom", 1, 2)
    ]);
    expect(alignmentCandidates(pictured)).toEqual(alternatives);
  });
});

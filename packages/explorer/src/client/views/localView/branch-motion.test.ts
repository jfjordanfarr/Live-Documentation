import { describe, expect, it } from "vitest";

import { boxKeyOf, easeInOutCubic, scenePose, tweenPose, type Pose } from "./branch-motion";
import { DEFAULT_SCENE_TUNING, hostOf, layoutScene, planBranches, type SceneMeasurer } from "./branch-scene";
import { buildBranches } from "./branches";
import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../../shared/types";
import { addPin, EMPTY_PIN_SET } from "../pin-state";

function node(id: string, symbols: string[] = ["value"]): ExplorerNodePayload {
  return { id, name: id.slice(id.lastIndexOf("/") + 1), codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`,
    archetype: "implementation", dependencies: [], dependents: [], missingDependencies: [], publicSymbols: symbols };
}

// Three files in two directories: y uses x beside it, z uses y, and z uses x two columns away, so a lane threads column 1.
const files = [node("a/x.ts"), node("a/y.ts"), node("b/z.ts")];
const links = [
  { source: "a/y.ts", target: "a/x.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const },
  { source: "b/z.ts", target: "a/y.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const },
  { source: "b/z.ts", target: "a/x.ts", sourceSymbol: "value", targetSymbol: "value", kind: "dependency" as const }
];
const graph: ExplorerGraphPayload = { nodes: files, links, stats: { nodes: 3, links: 3, missingDependencies: 0 } };
const pins = files.reduce((set, file) => addPin(set, file.id, "*"), EMPTY_PIN_SET);
const branches = buildBranches(files[0], graph, pins, () => true);

/** A page that answers with fixed sizes: every card 100 tall with its pin at 40, every label 14 tall. */
const measurer: SceneMeasurer = {
  widths: () => new Map(files.map(file => [file.id, 200])),
  measure: (cardWidths, labelWidths) => ({
    heights: new Map([...cardWidths.keys()].map(id => [id, 100])),
    pin: () => 40,
    labelHeights: new Map([...labelWidths.keys()].map(key => [key, 14]))
  })
};

const scene = layoutScene(planBranches(branches), branches, measurer, DEFAULT_SCENE_TUNING);

describe("the picture's pose", () => {
  it("names every element by what it is, and places each where the scene stands it", () => {
    const pose = scenePose(scene);
    expect([...pose.boxes.keys()].sort()).toEqual(["directory\0a", "directory\0b", `lane\0${[...scene.lanes.keys()][0]}`, "root"].sort());
    expect([...pose.items.keys()].sort()).toEqual(["a/x.ts", "a/y.ts", "b/z.ts"]);
    for (const item of scene.items.values()) {
      const posed = pose.items.get(item.id)!;
      expect(posed.left).toBe(scene.lefts[item.column] + item.inset);
      expect(posed.top).toBe(scene.tops.get(item.id));
      expect(posed.width).toBe(scene.widths[item.column] - 2 * item.inset);
      expect(posed.host).toBe(boxKeyOf(hostOf(item.box)));
    }
    const a = pose.boxes.get("directory\0a")!;
    expect(a.host).toBe("root");
    expect(a.segments.map(segment => segment.column)).toEqual([0, 1]);
    expect(pose.boxes.get("root")!.host).toBeNull();
    expect(pose.pictureWidth).toBe(scene.pictureWidth);
    expect(pose.pictureHeight).toBe(scene.pictureHeight);
    // A directory's loose files are their directory's element, so their key is its.
    for (const box of scene.boxes) if (box.kind === "files") expect(boxKeyOf(box)).toBe(boxKeyOf(box.parent!));
  });

  const from: Pose = {
    items: new Map([
      ["kept", { id: "kept", host: "root", left: 0, top: 100, width: 200 }],
      ["gone", { id: "gone", host: "root", left: 0, top: 300, width: 200 }]
    ]),
    boxes: new Map([
      ["root", { key: "root", kind: "root", directory: "", host: null, inset: 0, left: 0, top: 0, right: 500, bottom: 400, segments: [{ column: 0, left: 0, right: 500, top: 0, bottom: 400 }] }],
      ["directory\0a", { key: "directory\0a", kind: "directory", directory: "a", host: "root", inset: 13, left: 0, top: 80, right: 220, bottom: 220, segments: [{ column: 0, left: 0, right: 220, top: 80, bottom: 220 }] }]
    ]),
    pictureWidth: 500, pictureHeight: 400
  };
  const to: Pose = {
    items: new Map([
      ["kept", { id: "kept", host: "directory\0a", left: 20, top: 200, width: 240 }],
      ["new", { id: "new", host: "root", left: 300, top: 50, width: 200 }]
    ]),
    boxes: new Map([
      ["root", { key: "root", kind: "root", directory: "", host: null, inset: 0, left: 0, top: 0, right: 700, bottom: 600, segments: [{ column: 0, left: 0, right: 700, top: 0, bottom: 600 }] }],
      ["directory\0a", { key: "directory\0a", kind: "directory", directory: "a", host: "root", inset: 13, left: 0, top: 180, right: 280, bottom: 340, segments: [{ column: 0, left: 0, right: 280, top: 180, bottom: 340 }] }],
      ["directory\0b", { key: "directory\0b", kind: "directory", directory: "b", host: "root", inset: 13, left: 300, top: 0, right: 520, bottom: 120, segments: [{ column: 1, left: 300, right: 520, top: 0, bottom: 120 }] }]
    ]),
    pictureWidth: 700, pictureHeight: 600
  };

  it("moves a kept element along the line between its places, stands a new one at its place, and leaves out what is gone", () => {
    const half = tweenPose(from, to, 0.5);
    expect([...half.items.keys()].sort()).toEqual(["kept", "new"]);
    expect(half.items.get("kept")).toEqual({ id: "kept", host: "directory\0a", left: 10, top: 150, width: 220 });
    expect(half.items.get("new")).toEqual(to.items.get("new"));
    const a = half.boxes.get("directory\0a")!;
    expect([a.left, a.top, a.right, a.bottom]).toEqual([0, 130, 250, 280]);
    expect(a.segments).toEqual([{ column: 0, left: 0, right: 250, top: 130, bottom: 280 }]);
    expect(half.boxes.get("directory\0b")).toEqual(to.boxes.get("directory\0b"));
    expect(half.pictureWidth).toBe(600);
    expect(half.pictureHeight).toBe(500);
  });

  it("is the previous pose's places at the start and the next pose itself at the end, or with no previous pose", () => {
    const start = tweenPose(from, to, 0);
    expect(start.items.get("kept")).toMatchObject({ left: 0, top: 100, width: 200, host: "directory\0a" });
    expect(start.boxes.get("directory\0a")).toMatchObject({ top: 80, bottom: 220 });
    expect(tweenPose(from, to, 1)).toBe(to);
    expect(tweenPose(from, to, 1.5)).toBe(to);
    expect(tweenPose(null, to, 0.3)).toBe(to);
  });

  it("snaps a membrane's outline to its new columns when they differ, moving its box all the same", () => {
    const grown: Pose = { ...to, boxes: new Map(to.boxes) };
    grown.boxes.set("directory\0a", { ...to.boxes.get("directory\0a")!, segments: [{ column: 0, left: 0, right: 280, top: 180, bottom: 340 }, { column: 1, left: 300, right: 520, top: 180, bottom: 340 }] });
    const half = tweenPose(from, grown, 0.5);
    expect(half.boxes.get("directory\0a")!.segments).toEqual(grown.boxes.get("directory\0a")!.segments);
    expect(half.boxes.get("directory\0a")!.top).toBe(130);
  });

  it("eases in and out: still at both ends, fastest in the middle, symmetric", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1, 10);
    expect(easeInOutCubic(0.1)).toBeLessThan(0.1);
    expect(easeInOutCubic(0.9)).toBeGreaterThan(0.9);
    expect(easeInOutCubic(-1)).toBe(0);
    expect(easeInOutCubic(2)).toBe(1);
  });
});

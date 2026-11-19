import { describe, expect, it } from "vitest";

import { edgeKey, type Shape } from "@live-documentation/engine/live-docs/history/shape";

import { NODE_HUB } from "../views/localView/wire-gathering";
import { fileLevelPicture } from "./moment-files";
import { snapshotGraphOf } from "./snapshot";

/**
 * The scripted history sample (`tests/integration/live-docs/scripted-repository.ts`, served as `samples/history/`) at
 * four of its moments, transcribed from its sequence (`seek` at steps 0, 1, 3 and 4): the base; "Rename the core to the
 * engine", which renamed src/core to src/engine; "Rewrite the big helper as a huge one", which deleted lib/big.ts and
 * created lib/huge.ts with a wire from main.ts; "Retire the legacy helper", which deleted lib/legacy.ts and its wire.
 */
type Files = Array<[string, string, number]>;
type Edges = Array<[string, string, number]>;
const shapeOf = (files: Files, edges: Edges): Shape => ({
  files: new Map(files.map(([path, archetype, symbols]) => [path, { archetype, symbols, entry: false }])),
  edges: new Map(edges.map(([from, to, count]) => [edgeKey(from, to), count])),
  docLinks: new Set()
});
const COMMON: Files = [[".live-docs.config.json", "implementation", 4], ["src/app/main.ts", "implementation", 1], ["tests/main.test.ts", "test", 0]];
const COMMON_EDGES: Edges = [[".live-docs.config.json", "src/app/main.ts", 1], ["tests/main.test.ts", "src/app/main.ts", 1]];
const base = shapeOf([...COMMON, ["lib/big.ts", "implementation", 1], ["lib/legacy.ts", "implementation", 1], ["src/app/view.ts", "implementation", 2], ["src/core/model.ts", "implementation", 2], ["src/core/util.ts", "implementation", 2]],
  [...COMMON_EDGES, ["src/app/main.ts", "lib/big.ts", 1], ["src/app/main.ts", "lib/legacy.ts", 1], ["src/app/main.ts", "src/app/view.ts", 1], ["src/app/main.ts", "src/core/model.ts", 1], ["src/app/main.ts", "src/core/util.ts", 1], ["src/app/view.ts", "src/core/model.ts", 3]]);
const renamed = shapeOf([...COMMON, ["lib/big.ts", "implementation", 1], ["lib/legacy.ts", "implementation", 1], ["src/app/view.ts", "implementation", 2], ["src/engine/model.ts", "implementation", 2], ["src/engine/util.ts", "implementation", 2]],
  [...COMMON_EDGES, ["src/app/main.ts", "lib/big.ts", 1], ["src/app/main.ts", "lib/legacy.ts", 1], ["src/app/main.ts", "src/app/view.ts", 1], ["src/app/main.ts", "src/engine/model.ts", 1], ["src/app/main.ts", "src/engine/util.ts", 1], ["src/app/view.ts", "src/engine/model.ts", 3]]);
const rewritten = shapeOf([...COMMON, ["lib/legacy.ts", "implementation", 1], ["src/app/screen.ts", "implementation", 2], ["src/engine/model.ts", "implementation", 2], ["src/engine/util.ts", "implementation", 2], ["lib/huge.ts", "implementation", 2]],
  [...COMMON_EDGES, ["src/app/main.ts", "lib/legacy.ts", 1], ["src/app/main.ts", "src/app/screen.ts", 1], ["src/app/main.ts", "src/engine/model.ts", 1], ["src/app/main.ts", "src/engine/util.ts", 1], ["src/app/screen.ts", "src/engine/model.ts", 3], ["src/app/main.ts", "lib/huge.ts", 1]]);
const retired = shapeOf([...COMMON, ["src/app/screen.ts", "implementation", 2], ["src/engine/model.ts", "implementation", 2], ["src/engine/util.ts", "implementation", 2], ["lib/huge.ts", "implementation", 2]],
  [...COMMON_EDGES, ["src/app/main.ts", "src/app/screen.ts", 1], ["src/app/main.ts", "src/engine/model.ts", 1], ["src/app/main.ts", "src/engine/util.ts", 1], ["src/app/screen.ts", "src/engine/model.ts", 3], ["src/app/main.ts", "lib/huge.ts", 1]]);

const ids = (shape: Shape): string[] => fileLevelPicture(shape).graph.nodes.map(node => node.id);
const pairs = (shape: Shape): string[] => fileLevelPicture(shape).lines.map(line => `${line.sourceId} -> ${line.targetId} ×${line.gathered}`);

describe("a moment of the history as the 2D map would draw it at file level", () => {
  it("draws a card per file with its kind and symbol count, no symbol named, from the graph the 3D map draws", () => {
    const picture = fileLevelPicture(base);
    expect(picture.graph).toEqual(snapshotGraphOf(base));
    const view = picture.graph.nodes.find(node => node.id === "src/app/view.ts")!;
    expect(view).toMatchObject({ archetype: "implementation", symbolCount: 2, publicSymbols: [], docPath: "" });
    expect(picture.graph.nodes.find(node => node.id === "tests/main.test.ts")).toMatchObject({ archetype: "test", symbolCount: 0 });
    expect(picture.directories).toEqual(["", "lib", "src", "src/app", "src/core", "tests"]);
  });

  it("joins each pair of files with one line each way between their node-level hubs, carrying the pair's count", () => {
    const lines = fileLevelPicture(base).lines;
    expect(lines.every(line => line.sourceSymbol === NODE_HUB && line.targetSymbol === NODE_HUB && line.kind === "dependency" && line.direction === "inbound")).toBe(true);
    expect(lines.find(line => line.sourceId === "src/app/view.ts" && line.targetId === "src/core/model.ts")).toMatchObject({ gathered: 3, referenceCount: 3 });
    // One line per pair each way: a reference back would be a second line, never folded into the first.
    const both = fileLevelPicture(shapeOf([["a.ts", "implementation", 1], ["b.ts", "implementation", 1]], [["a.ts", "b.ts", 2], ["b.ts", "a.ts", 1], ["a.ts", "a.ts", 4]]));
    expect(both.lines.map(line => [line.sourceId, line.targetId, line.gathered])).toEqual([["a.ts", "b.ts", 2], ["b.ts", "a.ts", 1]]);
  });

  it("follows a directory renamed whole: the files and their lines stand under the new names and the old directory is gone", () => {
    expect(ids(renamed)).toContain("src/engine/model.ts");
    expect(ids(renamed)).not.toContain("src/core/model.ts");
    expect(fileLevelPicture(renamed).directories).toEqual(["", "lib", "src", "src/app", "src/engine", "tests"]);
    expect(pairs(renamed)).toContain("src/app/view.ts -> src/engine/model.ts ×3");
  });

  it("shows a file created with the wire that came with it, and a file deleted with the wire that went", () => {
    expect(ids(rewritten)).toContain("lib/huge.ts");
    expect(ids(rewritten)).not.toContain("lib/big.ts");
    expect(pairs(rewritten)).toContain("src/app/main.ts -> lib/huge.ts ×1");
    expect(pairs(rewritten).some(pair => pair.includes("lib/big.ts"))).toBe(false);
    expect(ids(retired)).not.toContain("lib/legacy.ts");
    expect(pairs(retired).some(pair => pair.includes("lib/legacy.ts"))).toBe(false);
    expect(fileLevelPicture(retired).directories, "lib still holds huge.ts").toContain("lib");
    expect(pairs(retired)).toEqual([
      ".live-docs.config.json -> src/app/main.ts ×1",
      "src/app/main.ts -> lib/huge.ts ×1",
      "src/app/main.ts -> src/app/screen.ts ×1",
      "src/app/main.ts -> src/engine/model.ts ×1",
      "src/app/main.ts -> src/engine/util.ts ×1",
      "src/app/screen.ts -> src/engine/model.ts ×3",
      "tests/main.test.ts -> src/app/main.ts ×1"
    ]);
  });
});

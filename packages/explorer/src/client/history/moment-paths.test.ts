import { describe, expect, it } from "vitest";

import { edgeKey, type Shape } from "@live-documentation/engine/live-docs/history/shape";

import { endFiles, momentGround, reachToday, todayGround } from "./moment-paths";
import { snapshotGraphOf } from "./snapshot";
import { findPath, reachOf, referencesAgainstPath } from "../pathfind";

/**
 * A moment before two changes of today: the core is renamed to the engine since, and the legacy helper is deleted
 * since; the huge helper is created after it. Today's names are followed to the moment, and back, by the two maps.
 */
const shape: Shape = {
  files: new Map([
    ["src/core/model.ts", { archetype: "implementation", symbols: 2, entry: false }],
    ["src/app/main.ts", { archetype: "implementation", symbols: 1, entry: true }],
    ["lib/legacy.ts", { archetype: "implementation", symbols: 1, entry: false }],
    ["tests/main.test.ts", { archetype: "test", symbols: 0, entry: false }]
  ]),
  edges: new Map([
    // A link runs from the file that depends to the file it depends on.
    [edgeKey("src/app/main.ts", "src/core/model.ts"), 2],
    [edgeKey("src/app/main.ts", "lib/legacy.ts"), 1],
    [edgeKey("lib/legacy.ts", "src/app/main.ts"), 1],
    [edgeKey("tests/main.test.ts", "src/app/main.ts"), 1]
  ]),
  docLinks: new Set()
};
const toMoment = new Map([["src/engine/model.ts", "src/core/model.ts"], ["src/app/main.ts", "src/app/main.ts"], ["tests/main.test.ts", "tests/main.test.ts"]]);
const toToday = new Map([...toMoment].map(([today, then]) => [then, today]));
const moment = {
  graph: snapshotGraphOf(shape),
  fileAt: (id: string) => toMoment.get(id),
  directoryAt: (directory: string) => (directory === "src/engine" ? "src/core" : directory),
  fileToday: (id: string) => toToday.get(id) ?? null
};
const ground = momentGround(moment);

describe("endFiles", () => {
  it("names a pinned file of today as it stands at the moment, and gives none for a file not yet created", () => {
    expect(endFiles({ kind: "pin", pin: { nodeId: "src/engine/model.ts", symbol: "*" } }, ground)).toEqual(["src/core/model.ts"]);
    expect(endFiles({ kind: "pin", pin: { nodeId: "lib/huge.ts", symbol: "*" } }, ground)).toEqual([]);
  });

  it("gives every file of the moment under a directory of today, followed through its rename", () => {
    expect(endFiles({ kind: "directory", directory: "src/engine" }, ground)).toEqual(["src/core/model.ts"]);
    expect(endFiles({ kind: "directory", directory: "lib" }, ground)).toEqual(["lib/legacy.ts"]);
    expect(endFiles({ kind: "directory", directory: "" }, ground)).toHaveLength(4);
  });
});

describe("a moment's ground", () => {
  it("runs a path over the moment's own wires and names its hops as the moment does", () => {
    const result = findPath(
      endFiles({ kind: "pin", pin: { nodeId: "src/engine/model.ts", symbol: "*" } }, ground),
      endFiles({ kind: "pin", pin: { nodeId: "tests/main.test.ts", symbol: "*" } }, ground),
      ground.nodesById,
      ground.links
    );
    expect(result.path.map(hop => hop.nodeId)).toEqual(["src/core/model.ts", "src/app/main.ts", "tests/main.test.ts"]);
    // The hop's file is the moment's: its symbol count is the one it had then.
    expect(result.path[0].node.symbolCount).toBe(2);
  });

  it("counts the references that run against a path among the moment's wires", () => {
    // The legacy helper and the main file use each other: one of the two runs against a path from the helper.
    expect(referencesAgainstPath(["lib/legacy.ts", "src/app/main.ts"], ground.links)).toBe(1);
    expect(referencesAgainstPath(["src/core/model.ts", "src/app/main.ts"], ground.links)).toBe(0);
  });

  it("says a reach found at the moment in today's names, and drops a file deleted since", () => {
    const reach = reachOf(["src/app/main.ts"], ground.nodesById, ground.links);
    expect([...reach.reverse.keys()].sort()).toEqual(["lib/legacy.ts", "src/core/model.ts"]);
    const today = reachToday(reach, ground);
    expect(today.reverse).toEqual(new Map([["src/engine/model.ts", 2]]));
    expect(today.forward).toEqual(new Map([["tests/main.test.ts", 2]]));
  });
});

describe("todayGround", () => {
  it("is today's files and links, each name its own, and a file today's bundle lacks stands nowhere", () => {
    const today = snapshotGraphOf(shape);
    const nodes = new Map(today.nodes.map(node => [node.id, node]));
    const plain = todayGround(nodes, today.links);
    expect(plain.links).toBe(today.links);
    expect(plain.fileAt("src/app/main.ts")).toBe("src/app/main.ts");
    expect(plain.fileAt("lib/huge.ts")).toBeUndefined();
    expect(plain.fileToday("lib/huge.ts")).toBeNull();
    expect(plain.directoryAt("src/core")).toBe("src/core");
    expect(endFiles({ kind: "directory", directory: "src" }, plain).sort()).toEqual(["src/app/main.ts", "src/core/model.ts"]);
  });
});

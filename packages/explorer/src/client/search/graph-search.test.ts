import { describe, expect, it } from "vitest";

import { directoriesOf, directoryOf, searchGraph, searchIndexOf, searchRows, termsOf } from "./graph-search";
import type { ExplorerNodePayload } from "../../shared/types";

const file = (id: string, symbols: string[] = []): ExplorerNodePayload =>
  ({ id, name: id.split("/").pop()!, codeRelativePath: id, archetype: "code", publicSymbols: symbols }) as ExplorerNodePayload;

const nodes = [
  file("src/map/projection.ts", ["project", "projectPoint", "unproject", "Projection", "projectAll", "projectMany", "projectOne"]),
  file("src/map/camera.ts", ["Camera", "projectCamera"]),
  file("src/util/strings.ts", ["slug"]),
  file("README.md")
];
const index = searchIndexOf(nodes);

describe("directoriesOf", () => {
  it("lists the root and every directory above the files, once each, sorted", () => {
    expect(directoriesOf(nodes)).toEqual(["", "src", "src/map", "src/util"]);
    expect(directoryOf("src/map/projection.ts")).toBe("src/map");
    expect(directoryOf("README.md")).toBe("");
  });
});

describe("searchGraph", () => {
  it("finds nothing for an empty query and splits words", () => {
    expect(searchGraph("   ", index)).toEqual([]);
    expect(termsOf("  Map  Camera ")).toEqual(["map", "camera"]);
  });

  it("groups the files by directory, the file's own name scoring above a symbol match", () => {
    const groups = searchGraph("project", index);
    expect(groups.map(group => group.directory)).toEqual(["src/map"]);
    const [map] = groups;
    expect(map.matched).toBe(false);
    expect(map.files.map(entry => entry.node.id)).toEqual(["src/map/projection.ts", "src/map/camera.ts"]);
    expect(map.files[0].matched).toBe(true);
    expect(map.files[1].matched).toBe(false);
    expect(map.files[1].symbols).toEqual(["projectCamera"]);
  });

  it("caps a file's matched symbols at five with the rest counted, and lists them all once expanded", () => {
    const [capped] = searchGraph("project", index)[0].files;
    expect(capped.symbols).toHaveLength(5);
    expect(capped.moreSymbols).toBe(2);
    const [open] = searchGraph("project", index, { expanded: new Set(["src/map/projection.ts"]) })[0].files;
    expect(open.symbols).toHaveLength(7);
    expect(open.moreSymbols).toBe(0);
  });

  it("offers a directory by its own name, with the files found in it", () => {
    const groups = searchGraph("map", index);
    expect(groups.map(group => [group.directory, group.matched])).toEqual([["src/map", true]]);
    expect(groups[0].files.map(entry => entry.node.id).sort()).toEqual(["src/map/camera.ts", "src/map/projection.ts"]);
  });

  it("finds the root by no name, and a word that is only in a path matches the file", () => {
    expect(searchGraph("util", index).map(group => [group.directory, group.matched, group.files.length])).toEqual([["src/util", true, 1]]);
    const strings = searchGraph("util", index)[0].files[0];
    expect(strings.matched).toBe(true);
    expect(searchGraph("zzz", index)).toEqual([]);
  });

  it("keeps the best-scored files within the limit", () => {
    const many = searchIndexOf(Array.from({ length: 30 }, (_, i) => file(`a/thing${i}.ts`)));
    const groups = searchGraph("thing", many, { fileLimit: 4 });
    expect(groups[0].files).toHaveLength(4);
    expect(groups[0].files[0].node.id).toBe("a/thing0.ts");
  });
});

describe("searchRows", () => {
  it("walks a matched directory, then each file, its symbols and its fold, in reading order", () => {
    const rows = searchRows(searchGraph("project", index));
    expect(rows.map(row => row.kind)).toEqual(["file", "symbol", "symbol", "symbol", "symbol", "symbol", "more", "file", "symbol"]);
    const more = rows[6];
    expect(more.kind === "more" && more.count).toBe(2);
    const named = searchRows(searchGraph("map", index));
    expect(named[0]).toEqual({ kind: "directory", directory: "src/map" });
  });
});

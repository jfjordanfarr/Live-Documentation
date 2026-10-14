import { describe, expect, it } from "vitest";

import { destinationScope, directoriesOf, directoryOf, reachWords, searchGraph, searchIndexOf, searchRows, termsOf, type SearchIndex } from "./graph-search";
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
/** The groups a search returns; the count is tested on its own. */
const groupsOf = (query: string, over: SearchIndex = index, options?: Parameters<typeof searchGraph>[2]) => searchGraph(query, over, options).groups;

describe("directoriesOf", () => {
  it("lists the root and every directory above the files, once each, sorted", () => {
    expect(directoriesOf(nodes)).toEqual(["", "src", "src/map", "src/util"]);
    expect(directoryOf("src/map/projection.ts")).toBe("src/map");
    expect(directoryOf("README.md")).toBe("");
  });
});

describe("searchGraph", () => {
  it("finds nothing for an empty query and splits words", () => {
    expect(searchGraph("   ", index)).toEqual({ groups: [], files: 0 });
    expect(termsOf("  Map  Camera ")).toEqual(["map", "camera"]);
  });

  it("groups the files by directory, the file's own name scoring above a symbol match", () => {
    const groups = groupsOf("project", index);
    expect(groups.map(group => group.directory)).toEqual(["src/map"]);
    const [map] = groups;
    expect(map.matched).toBe(false);
    expect(map.files.map(entry => entry.node.id)).toEqual(["src/map/projection.ts", "src/map/camera.ts"]);
    expect(map.files[0].matched).toBe(true);
    expect(map.files[1].matched).toBe(false);
    expect(map.files[1].symbols).toEqual(["projectCamera"]);
  });

  it("caps a file's matched symbols at five with the rest counted, and lists them all once expanded", () => {
    const [capped] = groupsOf("project", index)[0].files;
    expect(capped.symbols).toHaveLength(5);
    expect(capped.moreSymbols).toBe(2);
    const [open] = groupsOf("project", index, { expanded: new Set(["src/map/projection.ts"]) })[0].files;
    expect(open.symbols).toHaveLength(7);
    expect(open.moreSymbols).toBe(0);
  });

  it("offers a directory by its own name, with the files found in it", () => {
    const groups = groupsOf("map", index);
    expect(groups.map(group => [group.directory, group.matched])).toEqual([["src/map", true]]);
    expect(groups[0].files.map(entry => entry.node.id).sort()).toEqual(["src/map/camera.ts", "src/map/projection.ts"]);
  });

  it("finds the root by no name, and a word that is only in a path matches the file", () => {
    expect(groupsOf("util", index).map(group => [group.directory, group.matched, group.files.length])).toEqual([["src/util", true, 1]]);
    const strings = groupsOf("util", index)[0].files[0];
    expect(strings.matched).toBe(true);
    expect(groupsOf("zzz", index)).toEqual([]);
  });

  it("keeps the best-scored files within the limit, and counts every file matched", () => {
    const many = searchIndexOf(Array.from({ length: 30 }, (_, i) => file(`a/thing${i}.ts`)));
    const result = searchGraph("thing", many, { fileLimit: 4 });
    expect(result.groups[0].files).toHaveLength(4);
    expect(result.groups[0].files[0].node.id).toBe("a/thing0.ts");
    expect(result.files).toBe(30);
    expect(searchGraph("project", index).files).toBe(2);
  });
});

describe("searchRows", () => {
  it("walks a matched directory, then each file, its symbols and its fold, in reading order", () => {
    const rows = searchRows(groupsOf("project", index));
    expect(rows.map(row => row.kind)).toEqual(["file", "symbol", "symbol", "symbol", "symbol", "symbol", "more", "file", "symbol"]);
    const more = rows[6];
    expect(more.kind === "more" && more.count).toBe(2);
    const named = searchRows(groupsOf("map", index));
    expect(named[0]).toEqual({ kind: "directory", directory: "src/map" });
  });
});

describe("destinationScope", () => {
  // From a pin that camera.ts depends on and that depends on strings.ts: projection.ts stands apart
  const reach = { forward: new Map([["src/map/camera.ts", 2]]), reverse: new Map([["src/util/strings.ts", 3]]) };
  const scope = destinationScope(index, reach);

  it("offers the connected files with their distance, and a directory by its nearest file, the drawable way first", () => {
    expect(scope.index.nodes.map(node => node.id)).toEqual(["src/map/camera.ts", "src/util/strings.ts"]);
    expect(scope.index.directories).toEqual(["", "src", "src/map", "src/util"]);
    expect(scope.badge!({ kind: "file", node: nodes[1] })).toBe("2 files");
    expect(scope.badge!({ kind: "file", node: nodes[2] })).toBe("3 files, the other way");
    expect(scope.badge!({ kind: "symbol", node: nodes[1], symbol: "Camera" })).toBeUndefined();
    expect(scope.badge!({ kind: "directory", directory: "src" })).toBe("2 files");
    expect(scope.badge!({ kind: "directory", directory: "src/util" })).toBe("3 files, the other way");
    expect(reachWords(reach, "src/map/camera.ts")).toBe("2 files");
  });

  it("keeps the rest apart under a fold whose words count them", () => {
    expect(scope.apart!.index.nodes.map(node => node.id)).toEqual(["src/map/projection.ts", "README.md"]);
    expect(scope.apart!.index.directories, "a directory with a connected file inside is offered, never apart").toEqual([]);
    const alone = destinationScope(index, { forward: new Map([["src/util/strings.ts", 2]]), reverse: new Map() });
    expect(alone.apart!.index.directories).toEqual(["src/map"]);
    expect(scope.apart!.badge).toBe("no path");
    expect(scope.apart!.fold(1, false)).toBe("1 file matches, but no path connects it");
    expect(scope.apart!.fold(3, true)).toBe("3 more files match, but no path connects them");
    expect(searchGraph("project", scope.index).files).toBe(1);
    expect(searchGraph("project", scope.apart!.index).files).toBe(1);
  });
});

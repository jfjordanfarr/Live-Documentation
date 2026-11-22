import { describe, expect, it } from "vitest";

import type { GraphFile, LiveDocGraph } from "./graph";
import { pathTo, searchGraph, searchSymbolPath, under, walkBetween } from "./pathfind";

/**
 * Two ends of a path that share files, found by the engine review of 2026-11-22: `walkBetween` drops from the targets
 * every file that is also a start, so that a path between two different files, one in each end, is lost whenever the
 * target is also a start. Its own rule is that "a file in both sets is not its own path"; a path from one file of an end
 * to another file of the other end is not a file's path to itself, and the walk must find it. The command line shows
 * it: `inspect --from src/ --to src/b.ts` answers "No path runs between src/ and src/b.ts, either way" where
 * `src/a.ts` uses `src/b.ts`.
 */

/** A graph from the files each file depends on. */
function graphOf(dependencies: Record<string, string[]>): LiveDocGraph {
  const files: Record<string, GraphFile> = {};
  const ids = new Set([...Object.keys(dependencies), ...Object.values(dependencies).flat()]);
  for (const id of ids) {
    files[id] = {
      codePath: id, docPath: `${id}.md`, archetype: "implementation", entries: [], exports: [],
      edges: (dependencies[id] ?? []).map((to) => ({ label: to, to })), outbound: [...(dependencies[id] ?? [])], inbound: []
    } as unknown as GraphFile;
  }
  for (const [from, tos] of Object.entries(dependencies)) for (const to of tos) (files[to].inbound as string[]).push(from);
  return { files } as unknown as LiveDocGraph;
}

const graph = graphOf({ "src/a.ts": ["src/b.ts"], "src/Pay/p.ts": ["src/a.ts"] });
const ids = Object.keys(graph.files);
const filesUnder = (directory: string): string[] => ids.filter((id) => under(id, directory)).sort();

describe("a path between two ends that share files", () => {
  it("is found from a directory to a file under it, when another file of the directory uses it", () => {
    const found = walkBetween(filesUnder("src"), ["src/b.ts"], (id) => graph.files[id]?.outbound ?? []);
    expect(found.reached).toBe("src/b.ts");
    expect(pathTo(found, "src/b.ts")).toEqual(["src/a.ts", "src/b.ts"]);
  });

  it("is found between overlapping sets, from the file only the starts hold to the file both hold", () => {
    const found = walkBetween(["src/a.ts", "src/b.ts"], ["src/b.ts"], (id) => graph.files[id]?.outbound ?? []);
    expect(found.reached).toBe("src/b.ts");
  });

  it("is found by the command line's search from a directory to a subdirectory of it, whichever way is asked", () => {
    const inbound = searchGraph(graph, filesUnder("src"), filesUnder("src/Pay"), "inbound", 10);
    expect(inbound.path).toEqual(["src/a.ts", "src/Pay/p.ts"]);
  });

  it("is not a file's path to itself when both ends are that one file, as before", () => {
    expect(walkBetween(["src/a.ts"], ["src/a.ts"], (id) => graph.files[id]?.outbound ?? []).reached).toBeUndefined();
  });
});

describe("a symbol's path to itself", () => {
  // Since 2026-11-22 a file asked as a path to itself is no path (`searchGraph(graph, "a", "a")`, pathfind.test.ts), on
  // the page and at the command line; the symbol search, which the command line runs for `--from a.ts#x --to a.ts#x`,
  // still answers a path of no hops (seen: "Symbol path from src/a.ts#a to src/a.ts#a (0 hop(s), outbound).", exit 0).
  it("is no path, as a file's is not", () => {
    expect(searchGraph(graph, "src/a.ts", "src/a.ts", "outbound", 10).path).toBeUndefined();
    expect(searchSymbolPath(graph, { codePath: "src/a.ts", symbol: "a" }, { codePath: "src/a.ts", symbol: "a" }, "outbound", 10).found).toBe(false);
  });
});

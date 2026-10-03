import { describe, expect, it } from "vitest";

import { findPath, referencesAgainstPath } from "./pathfind";
import type { ExplorerLinkPayload, ExplorerNodePayload } from "../shared/types";

/** A link from the file that depends to the file it depends on, as the bundle stores them. */
const link = (dependent: string, dependency: string): ExplorerLinkPayload =>
  ({ source: dependent, target: dependency, kind: "dependency" }) as ExplorerLinkPayload;

const node = (id: string): ExplorerNodePayload => ({ id, name: id, codeRelativePath: id, archetype: "code" }) as ExplorerNodePayload;

const nodesById = new Map(["a", "b", "c", "d"].map(id => [id, node(id)]));

// b uses a, c uses b: a offers to b, b offers to c. d stands alone.
const links = [link("b", "a"), link("c", "b")];

const ids = (hops: ReadonlyArray<{ nodeId: string }>): string[] => hops.map(hop => hop.nodeId);

describe("findPath", () => {
  it("draws the path when TO depends on FROM, what offers first", () => {
    const result = findPath("a", "c", nodesById, links);
    expect(ids(result.path)).toEqual(["a", "b", "c"]);
    expect(result.reversePath).toEqual([]);
  });

  it("draws nothing when only FROM depends on TO, and offers the reverse read provider first", () => {
    const result = findPath("c", "a", nodesById, links);
    expect(result.path).toEqual([]);
    expect(ids(result.reversePath)).toEqual(["a", "b", "c"]);
  });

  it("finds neither when the files are not connected, and says how far it looked", () => {
    const result = findPath("a", "d", nodesById, links);
    expect(result.path).toEqual([]);
    expect(result.reversePath).toEqual([]);
    expect(result.searchedNodes).toBeGreaterThan(0);
    expect(result.maxDepthReached).toBe(false);
  });

  it("finds a long route through a cyclic graph without a fixed ten-hop cutoff", () => {
    const names = Array.from({ length: 24 }, (_, i) => `file${i}`);
    const files = new Map([...names, "island"].map(id => [id, node(id)]));
    const chain = names.slice(1).map((id, i) => link(id, names[i]));
    chain.push(link("file3", "file5"));
    expect(ids(findPath("file0", "file23", files, chain).path)).toEqual(names);
    const missing = findPath("file0", "island", files, chain);
    expect(missing.path).toEqual([]);
    expect(missing.maxDepthReached).toBe(false);
    expect(missing.searchedNodes).toBeLessThanOrEqual(files.size * 2);
  });

  it("stops at the hop limit in both directions and says so", () => {
    const result = findPath("a", "c", nodesById, links, 1);
    expect(result.path).toEqual([]);
    expect(result.reversePath).toEqual([]);
    expect(result.maxDepthReached).toBe(true);
  });

  it("prefers the drawable direction when the files depend on each other", () => {
    const mutual = [...links, link("a", "c")];
    expect(ids(findPath("a", "c", nodesById, mutual).path)).toEqual(["a", "b", "c"]);
    expect(ids(findPath("c", "a", nodesById, mutual).path)).toEqual(["c", "a"]);
  });

  it("finds nothing for a file that is not in the bundle", () => {
    const result = findPath("a", "zz", nodesById, links);
    expect(result.path).toEqual([]);
    expect(result.reversePath).toEqual([]);
    expect(result.toEndpoint.node.id).toBe("zz");
  });
});

describe("referencesAgainstPath", () => {
  it("counts nothing when every reference runs with the path", () => {
    expect(referencesAgainstPath(["a", "b", "c"], links)).toBe(0);
  });

  it("counts an earlier file depending on a later one, adjacent or not", () => {
    expect(referencesAgainstPath(["a", "b", "c"], [...links, link("a", "b")])).toBe(1);
    expect(referencesAgainstPath(["a", "b", "c"], [...links, link("a", "c"), link("b", "c")])).toBe(2);
  });

  it("ignores references to files outside the path", () => {
    expect(referencesAgainstPath(["a", "b"], [...links, link("a", "d")])).toBe(0);
  });
});

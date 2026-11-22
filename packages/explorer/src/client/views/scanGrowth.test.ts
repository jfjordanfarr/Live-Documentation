import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { CommitInfo } from "@live-documentation/engine/live-docs/history/format";
import { SequenceBuilder } from "@live-documentation/engine/live-docs/history/sequence";
import type { Shape } from "@live-documentation/engine/live-docs/history/shape";

import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../shared/types";
import { arrivedAt, arrivedGraph, birthSteps, firstCommitOrder, MEASURED_SCAN, pathOrder, progressWords, scanProgress, scanSchedule } from "./scanGrowth";

const node = (id: string): ExplorerNodePayload => ({ id, name: id, codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`,
  publicSymbols: [], dependencies: [], dependents: [], missingDependencies: [] } as unknown as ExplorerNodePayload);

const graph: ExplorerGraphPayload = {
  nodes: ["b/two.ts", "a/one.ts", "c/three.ts"].map(node),
  links: [
    { source: "a/one.ts", target: "b/two.ts", kind: "dependency", referenceCount: 3 },
    { source: "c/three.ts", target: "a/one.ts", kind: "dependency" }
  ],
  stats: { nodes: 3, links: 2, references: 4 }
};

describe("a scan's rhythm", () => {
  it("is the measured scan for the measured number of files, and four times as long at the slower pace", () => {
    expect(scanSchedule(MEASURED_SCAN.files, "measured")).toEqual({ files: 1292, listing: 3000, firstPass: 5000, arriving: 12000 });
    expect(scanSchedule(MEASURED_SCAN.files, "slower")).toEqual({ files: 1292, listing: 12000, firstPass: 20000, arriving: 48000 });
  });

  it("scales each part with the files, so a small sample is over as soon as its scan would be", () => {
    const small = scanSchedule(323, "measured");
    expect(small.listing).toBeCloseTo(750);
    expect(small.firstPass).toBeCloseTo(1250);
    expect(small.arriving).toBeCloseTo(3000);
  });

  it("lists, then finishes no file through the first pass, then finishes them one by one to the end", () => {
    const schedule = scanSchedule(1292, "measured");
    expect(scanProgress(schedule, 0)).toEqual({ phase: "listing", listed: 0 });
    expect(scanProgress(schedule, 1500)).toEqual({ phase: "listing", listed: 646 });
    expect(scanProgress(schedule, 3000)).toEqual({ phase: "reading", read: 0, listed: 1292 });
    expect(scanProgress(schedule, 7999)).toEqual({ phase: "reading", read: 0, listed: 1292 });
    expect(scanProgress(schedule, 14000)).toEqual({ phase: "reading", read: 646, listed: 1292 });
    expect(scanProgress(schedule, 20000)).toEqual({ phase: "done" });
  });

  it("never lets the count of arrived files fall, and ends at every file", () => {
    const schedule = scanSchedule(37, "slower");
    let last = 0;
    for (let elapsed = 0; elapsed <= schedule.listing + schedule.firstPass + schedule.arriving + 10; elapsed += 7) {
      const arrived = arrivedAt(schedule, scanProgress(schedule, elapsed));
      expect(arrived).toBeGreaterThanOrEqual(last);
      last = arrived;
    }
    expect(last).toBe(37);
  });

  it("says the two phases in the owner's words, and nothing once done", () => {
    expect(progressWords({ phase: "listing", listed: 1203 })).toBe("Listing Files… (1,203)");
    expect(progressWords({ phase: "reading", read: 45, listed: 1292 })).toBe("Reading File Text… (45/1,292)");
    expect(progressWords({ phase: "done" })).toBe("");
  });
});

describe("the order files arrive in", () => {
  it("is by path, the same on every machine", () => {
    expect(pathOrder(["b/two.ts", "a/one.ts", "B/upper.ts", "a/One.ts"])).toEqual(["B/upper.ts", "a/One.ts", "a/one.ts", "b/two.ts"]);
  });

  it("is by the step each file was born at, files of one step by path, a file the history lacks last", () => {
    const births = new Map([["b/two.ts", 0], ["a/one.ts", 2], ["c/three.ts", 2]]);
    expect(firstCommitOrder(["new.ts", "c/three.ts", "a/one.ts", "b/two.ts"], births)).toEqual(["b/two.ts", "a/one.ts", "c/three.ts", "new.ts"]);
  });

  it("reads each file's birth from the history, following a rename back to the path it began under", () => {
    const commit = (n: number): CommitInfo => ({ id: `c${n}`, parents: [], date: `2026-01-0${n + 1}T10:00:00Z`, subject: `change ${n}` });
    const shape = (paths: string[]): Shape => ({
      files: new Map(paths.map(path => [path, { archetype: "implementation", symbols: 1, entry: false }])), edges: new Map(), docLinks: new Set()
    });
    const builder = new SequenceBuilder({
      lens: { key: "k", generator: { version: "0", code: null, commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG },
      source: { system: "git", root: ".", branch: "main", head: "c4", shallow: false, knowledgeBegins: "c0", sampling: { rule: "every-commit" }, authors: false }
    }, commit(0), shape(["old.ts", "live.ts"]));
    builder.add(commit(1), shape(["moved.ts", "live.ts", "temporary.ts"]), { renamed: [["old.ts", "moved.ts"]], modified: [] });
    builder.add(commit(2), shape(["live.ts", "temporary.ts"]), { renamed: [], modified: [] });
    builder.add(commit(3), shape(["moved.ts", "current.ts"]), { renamed: [["live.ts", "current.ts"]], modified: [] });
    builder.add(commit(4), shape(["moved.ts", "current.ts", "late.ts"]), { renamed: [], modified: [] });
    // The first moved.ts died at the second step; the one that stands was born at the third, beside a file renamed then.
    expect([...birthSteps(builder.finish())].sort()).toEqual([["current.ts", 0], ["late.ts", 4], ["moved.ts", 3]]);
  });
});

describe("the graph as a scan has it so far", () => {
  it("holds the files arrived, in the graph's own order, and the wires both of whose files have arrived", () => {
    const order = pathOrder(graph.nodes.map(file => file.id));
    expect(arrivedGraph(graph, order, 0)).toEqual({ nodes: [], links: [], stats: { nodes: 0, links: 0, references: 0 } });
    const two = arrivedGraph(graph, order, 2);
    expect(two.nodes.map(file => file.id)).toEqual(["b/two.ts", "a/one.ts"]);
    expect(two.links).toEqual([graph.links[0]]);
    expect(two.stats).toEqual({ nodes: 2, links: 1, references: 3 });
  });

  it("is the whole graph's files and wires once every file has arrived", () => {
    const whole = arrivedGraph(graph, pathOrder(graph.nodes.map(file => file.id)), 3);
    expect(whole.nodes).toEqual(graph.nodes);
    expect(whole.links).toEqual(graph.links);
    expect(whole.stats).toEqual(graph.stats);
  });
});

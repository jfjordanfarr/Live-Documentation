/**
 * This repository as the oracle's subject ("Because it's our repo, and we know
 * the shape of our repo", the owner, 2026-10-15): the entry points of its own
 * code, read by hand into `expected/repository-entries.json`, compared with
 * what the committed docs say, and the walk from those entries measured against
 * the hand's reading of what nothing reaches. The sample programs and fixtures
 * are inputs to the tool and stand aside.
 */
import * as fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { entryWords } from "@live-documentation/engine/live-docs/document";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { reachability } from "@live-documentation/engine/live-docs/pathfind";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

interface RepositoryEntries {
  entries: Record<string, string[]>;
  reachedThroughDynamicImport: Record<string, string>;
  unreachableByHand: string[];
}

const expected = JSON.parse(fs.readFileSync(path.join(__dirname, "expected", "repository-entries.json"), "utf8")) as RepositoryEntries;
const config = normalizeLiveDocumentationConfig(JSON.parse(fs.readFileSync(path.join(REPO_ROOT, ".live-docs.config.json"), "utf8")));

/** This repository's own code: not a sample program, not a fixture. */
function ownCode(codePath: string): boolean {
  return !config.sampleRoots.some((root) => codePath === root || codePath.startsWith(`${root}/`)) && !/(^|\/)(?:__fixtures__|fixtures)\//u.test(codePath);
}

describe("this repository's entry points, against the hand's reading", () => {
  it("writes on each file exactly the reasons the hand read, and on no other file of its own code", async () => {
    const graph = await readLiveDocGraph({ workspaceRoot: REPO_ROOT, config });
    const written: Record<string, string[]> = {};
    for (const file of Object.values(graph.files)) {
      if (ownCode(file.codePath) && file.entries.length > 0) {
        written[file.codePath] = file.entries.map(entryWords);
      }
    }
    expect(written).toEqual(expected.entries);
  });

  it("reaches every implementation file of its own code from those entries, the dynamic imports among the edges", async () => {
    const graph = await readLiveDocGraph({ workspaceRoot: REPO_ROOT, config });
    const result = reachability(graph);
    const reached = new Map(result.reached.map((file) => [file.codePath, file.hops]));
    for (const [imported, importer] of Object.entries(expected.reachedThroughDynamicImport)) {
      expect(graph.files[importer].outbound, `${importer} imports ${imported}`).toContain(imported);
      expect(reached.has(imported), `${imported} is reached`).toBe(true);
    }
    const unreachable = result.unreachable.filter((codePath) => ownCode(codePath) && (graph.files[codePath].archetype ?? "implementation") === "implementation");
    expect(unreachable).toEqual(expected.unreachableByHand);
  });
});

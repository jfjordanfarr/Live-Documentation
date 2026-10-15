/**
 * The entry points the docs declare, over the entry-points fixture: a
 * manifest's scripts, binary and main module written on the files they start,
 * a tsconfig a tool reads, a stylesheet the configuration declares, a test by
 * its archetype, a dynamic import recorded as an edge, and what the walk from
 * the entries then says: what is reached, what nothing reaches, and what only
 * a test reaches. The expectations are a reading of the fixture's files, not
 * a run of the generator.
 */
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { entryWords } from "@live-documentation/engine/live-docs/document";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { reachability } from "@live-documentation/engine/live-docs/pathfind";
import { generateLiveDocs } from "@live-documentation/generator/generator";

const FIXTURE = path.resolve(__dirname, "../fixtures/entry-points/workspace");

const config = normalizeLiveDocumentationConfig({
  glob: ["**/*.ts", "**/*.json", "**/*.css"],
  entryPoints: ["styles.css"]
});

let workspace: string;
let graph: LiveDocGraph;

beforeAll(async () => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "entry-points-"));
  fs.cpSync(FIXTURE, workspace, { recursive: true });
  await generateLiveDocs({ workspaceRoot: workspace, config, logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
  graph = await readLiveDocGraph({ workspaceRoot: workspace, config });
});

afterAll(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

const wordsOf = (codePath: string): string[] => graph.files[codePath].entries.map(entryWords);

describe("the Entry lines", () => {
  it("name, on each file, every reason something outside the code starts it, and nothing on the rest", () => {
    expect(wordsOf("src/cli.ts")).toEqual(["command demo of package.json", "command start of package.json"]);
    expect(wordsOf("src/lib.ts")).toEqual(["module of package.json"]);
    expect(wordsOf("package.json")).toEqual(["tooling"]);
    expect(wordsOf("tsconfig.json")).toEqual(["tooling"]);
    expect(wordsOf("styles.css")).toEqual(["declared"]);
    for (const codePath of ["src/util.ts", "src/loader.ts", "src/plugin.ts", "src/helper.ts", "src/orphan.ts", "src/lib.test.ts"]) {
      expect(wordsOf(codePath), codePath).toEqual([]);
    }
    expect(graph.files["src/lib.test.ts"].archetype).toBe("test");
  });

  it("are written in the Metadata block with the manifest linked, where the parser reads them back", () => {
    const text = fs.readFileSync(path.join(workspace, graph.files["src/cli.ts"].docPath), "utf8");
    expect(text).toContain([
      "- Code Path: src/cli.ts",
      "- Entry: command `demo` of [`package.json`](../package.json.md)",
      "- Entry: command `start` of [`package.json`](../package.json.md)",
      "- Generated At: "
    ].join("\n"));
    expect(graph.files["src/cli.ts"].entries[0].declarer).toEqual({ label: "package.json", link: "../package.json.md" });
  });

  it("record a dynamic import with a literal path as an import edge", () => {
    expect(graph.files["src/loader.ts"].outbound).toEqual(["src/plugin.ts"]);
    expect(graph.files["src/loader.ts"].dependencies.map((dependency) => dependency.label)).toEqual(["plugin"]);
  });
});

describe("the walk from the entry points", () => {
  it("starts at every entry, reaches what they depend on, and tells apart what nothing reaches and what only the test reaches", () => {
    const result = reachability(graph);
    expect(result.from).toBe("entries");
    expect(result.starts.map((start) => [start.codePath, start.test, start.entries.map(entryWords)])).toEqual([
      ["package.json", false, ["tooling"]],
      ["src/cli.ts", false, ["command demo of package.json", "command start of package.json"]],
      ["src/lib.test.ts", true, []],
      ["src/lib.ts", false, ["module of package.json"]],
      ["styles.css", false, ["declared"]],
      ["tsconfig.json", false, ["tooling"]]
    ]);
    expect(result.reached).toEqual([
      { codePath: "src/helper.ts", hops: 1 },
      { codePath: "src/loader.ts", hops: 1 },
      { codePath: "src/util.ts", hops: 1 },
      { codePath: "src/plugin.ts", hops: 2 }
    ]);
    expect(result.unreachable).toEqual(["src/orphan.ts"]);
    expect(result.testsOnly).toEqual(["src/helper.ts"]);
  });

  it("walks from the files asked for instead", () => {
    const result = reachability(graph, ["src/orphan.ts"]);
    expect(result.from).toBe("asked");
    expect(result.reached).toEqual([{ codePath: "src/util.ts", hops: 1 }]);
    expect(result.unreachable).not.toContain("src/util.ts");
    expect(result.testsOnly).toEqual([]);
  });
});

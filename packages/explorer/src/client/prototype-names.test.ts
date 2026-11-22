import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { Board } from "@live-documentation/engine/live-docs/board";
import { deriveBoardGraph } from "@live-documentation/engine/live-docs/boardGraph";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { generateLiveDocs } from "../../../generator/src/generator";
import { explorerGraphOf } from "../shared/graph";
import { sourcesFacts } from "./panels/sources-facts";
import { fileInspection } from "./reader-links";
import { buildWorldModel } from "./views/worldMap/model";

/**
 * The Explorer's lookups of a file by its path, asked of an index whose files are named as the members every plain
 * JavaScript object inherits (`__proto__`, `constructor`, `toString`, `hasOwnProperty`), parsed from JSON as the page
 * parses the index it carries, into plain objects. Each lookup goes through the engine's one way to ask a graph for a
 * path (`fileAt`), so that a name a plain object has and no file does (`valueOf`) is no file, and a file so named is
 * found. Written on 2026-11-22, the fixture of `tests/integration/live-docs/prototype-names.test.ts` generated here.
 */

const NAMES = ["__proto__", "constructor", "toString", "hasOwnProperty"] as const;
let workspace: string;
let graph: LiveDocGraph;

beforeAll(async () => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "explorer-prototype-names-"));
  for (const name of NAMES) fs.writeFileSync(path.join(workspace, name), `${name}\n`);
  fs.writeFileSync(path.join(workspace, "refs.json"), `${JSON.stringify(Object.fromEntries(NAMES.map((name, at) => [`file${at}`, `./${name}`])), null, 2)}\n`);
  const config = normalizeLiveDocumentationConfig();
  const quiet = (): undefined => undefined;
  const result = await generateLiveDocs({ workspaceRoot: workspace, config, logger: { info: quiet, warn: quiet, error: quiet } });
  expect(result.failed).toEqual([]);
  // As the page holds it: the index parsed from its JSON, its files a plain object.
  graph = JSON.parse(fs.readFileSync(path.join(workspace, config.root, "index.json"), "utf8")) as LiveDocGraph;
  expect(Object.getPrototypeOf(graph.files)).toBe(Object.prototype);
}, 120_000);

afterAll(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

describe("the Explorer's lookups of a path, over files named as a plain object's members", () => {
  it("the bundle's graph: every file a node, each named file the target of its edge, with its doc", () => {
    const payload = explorerGraphOf(graph);
    expect(payload.nodes.map((node) => node.id).sort()).toEqual([...NAMES, "refs.json"].sort());
    const refs = payload.nodes.find((node) => node.id === "refs.json")!;
    expect(refs.dependencies.map((dependency) => [dependency.targetId, dependency.targetDocPath]).sort()).toEqual(NAMES.map((name) => [name, graph.files[name].docPath]).sort());
  });

  it("the reader's links: a file so named is the file, and a name no file has is none", () => {
    const context = { nodesById: new Map(), files: graph.files };
    for (const name of NAMES) expect(fileInspection({ id: name, docPath: graph.files[name].docPath, publicSymbols: [] } as never, "no-such-symbol", context)).toEqual({ kind: "file", nodeId: name });
    expect(fileInspection({ id: "valueOf", docPath: "valueOf.md", publicSymbols: [] } as never, "no-such-symbol", context)).toEqual({ kind: "file", nodeId: "valueOf" });
  });

  it("the sources' facts: the walk from the configuration reaches each named file, each classed by its archetype", () => {
    const facts = sourcesFacts(graph, { references: 0, from: ["refs.json"] });
    const reached = JSON.stringify(facts.reach);
    for (const name of NAMES) expect(reached, name).toContain(`"${name}"`);
  });

  it("the world map: a piece made of the named files counts their symbols, and a name no file has counts none", () => {
    const board: Board = { title: "Names", layer: 3, authored: "### Purpose\nX.", things: [{ name: "all", kind: "library", serves: [], holds: [] }], connections: [], legend: [], layout: [] };
    const joined = deriveBoardGraph(board, graph, "board.md");
    // A board owns a folder's files; these lie at the root, so the piece is handed them, and a name no file has.
    joined.things[0].files = [...NAMES, "refs.json", "valueOf"];
    const model = buildWorldModel(board, joined, graph);
    expect(model.pieces.map((piece) => [piece.name, piece.symbols])).toEqual([["all", [...NAMES, "refs.json"].reduce((count, file) => count + graph.files[file].symbols.length, 0)]]);
  });
});

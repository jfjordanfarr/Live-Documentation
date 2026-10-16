/**
 * The C and C++ adapter's include rule, held to the compiler: over the
 * include-directories fixture, whose quoted includes a compiler resolves
 * through `-I include -I src -I .`, every include the generated docs resolve
 * must be the file scip-clang resolved, and nothing else. The compiler's
 * resolutions are the edges of `expected/compiler-edges.json` that carry the
 * included file's own symbol; `npm run oracle:index` writes them. The rule was
 * chosen by measurement on 2026-10-16 (the probe record under
 * `AI-Agent-Workspace/Probes/2026-10-16/include-rules`); this test keeps it.
 */
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { generateLiveDocs } from "@live-documentation/generator/generator";

const FIXTURE = path.resolve(__dirname, "../fixtures/include-dirs");

interface CompilerEdges {
  documents: string[];
  edges: Array<{ from: string; to: string; symbols: string[] }>;
}

/** A path in the expectation file is relative to the file's own directory, `expected/`. */
const fromExpected = (relative: string): string => path.posix.normalize(path.posix.join("expected", relative));

const config = normalizeLiveDocumentationConfig({ exclude: ["expected/**"] });

let workspace: string;
let graph: LiveDocGraph;
let compiler: CompilerEdges;

beforeAll(async () => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "include-dirs-"));
  fs.cpSync(FIXTURE, workspace, { recursive: true });
  await generateLiveDocs({ workspaceRoot: workspace, config, logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
  graph = await readLiveDocGraph({ workspaceRoot: workspace, config });
  compiler = JSON.parse(fs.readFileSync(path.join(FIXTURE, "expected", "compiler-edges.json"), "utf8")) as CompilerEdges;
});

afterAll(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

/** The files each source file's resolved includes point at, from the compiler's view and from the docs. */
function includesOf(): { compiled: Map<string, string[]>; documented: Map<string, string[]> } {
  const compiled = new Map<string, string[]>();
  for (const edge of compiler.edges) {
    if (!edge.symbols.some((symbol) => symbol.startsWith("`<file>/"))) continue;
    const from = fromExpected(edge.from);
    compiled.set(from, [...(compiled.get(from) ?? []), fromExpected(edge.to)].sort());
  }
  const documented = new Map<string, string[]>();
  for (const from of compiled.keys()) {
    const targets = new Set(graph.files[from].edges.map((edge) => edge.to).filter((to): to is string => to !== undefined && to !== from));
    documented.set(from, [...targets].sort());
  }
  return { compiled, documented };
}

describe("the include rule against the compiler", () => {
  it("documents every file the compiler compiled, and the decoys nothing includes", () => {
    const documents = compiler.documents.map(fromExpected).sort();
    for (const document of documents) expect(graph.files[document], document).toBeDefined();
    for (const decoy of ["extra/core/engine.hpp", "tests/core/engine.hpp", "vendor/other/util.hpp"]) {
      expect(graph.files[decoy], decoy).toBeDefined();
      expect(graph.files[decoy].inbound, `${decoy} is included by nothing`).toEqual([]);
    }
  });

  it("resolves every quoted include to the file the compiler resolved, and no other", () => {
    const { compiled, documented } = includesOf();
    expect(compiled.size).toBeGreaterThan(0);
    for (const [from, targets] of compiled) {
      expect(documented.get(from), `${from} includes`).toEqual(targets);
    }
  });

  it("leaves a system include as an external dependency", () => {
    const main = graph.files["src/app/main.cpp"];
    const vector = main.dependencies.find((dependency) => dependency.label.includes("vector"));
    expect(vector, "the <vector> include").toBeDefined();
    expect(main.edges.filter((edge) => edge.to === undefined).map((edge) => edge.label)).toContain(vector!.label);
  });
});

import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { readHandVerifiedEdges, readOracleEdges, rebaseHandVerifiedEdges, rebaseOracleEdges, writeOracleEdges } from "./files";
import type { OracleEdges } from "./scip-edges";

const graph: OracleEdges = {
  tool: "compiler 1.0",
  projectFile: "Estate.sln",
  projects: [
    { name: "App", directory: "", references: ["Models"], members: ["src/main.ts"] },
    { name: "Models", directory: "Models", references: [] }
  ],
  documents: ["src/main.ts", "Models/Payment data.ts"],
  outside: ["../generated/external.ts", "/sdk/runtime.ts", "C:/sdk/runtime.ts"],
  edges: [{ from: "src/main.ts", to: "Models/Payment data.ts", symbols: ["src/`main.ts`/opaque().", "a compiler symbol"] }],
  ambiguous: [{ from: "src/main.ts", symbol: "unchanged-symbol", candidates: ["Models/Payment data.ts", "src/alternative.ts"] }]
};

describe("oracle JSON paths", () => {
  it("rebases every location while leaving compiler identifiers and project names intact", () => {
    const before = structuredClone(graph);
    const stored = rebaseOracleEdges(graph, "/repo/fixture", "/repo/fixture/expected");
    expect(stored.projectFile).toBe("../Estate.sln");
    expect(stored.documents).toEqual(["../src/main.ts", "../Models/Payment data.ts"]);
    expect(stored.projects[0]).toEqual({ name: "App", directory: "..", references: ["Models"], members: ["../src/main.ts"] });
    expect(stored.outside).toEqual(["../../generated/external.ts", "/sdk/runtime.ts", "C:/sdk/runtime.ts"]);
    expect(stored.edges).toEqual([{ ...graph.edges[0], from: "../src/main.ts", to: "../Models/Payment data.ts" }]);
    expect(stored.ambiguous).toEqual([{ from: "../src/main.ts", symbol: "unchanged-symbol", candidates: ["../Models/Payment data.ts", "../src/alternative.ts"] }]);
    expect(graph).toEqual(before);
    expect(rebaseOracleEdges(stored, "/repo/fixture/expected", "/repo/fixture"))
      .toEqual(rebaseOracleEdges(graph, "/repo/fixture", "/repo/fixture"));
  });

  it("writes self-contained paths and reads equivalent observations from a nested output directory", () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "oracle-paths-"));
    try {
      const file = path.join(fixture, "expected", "nested", "compiler-edges.json");
      writeOracleEdges(file, fixture, graph);
      const text = JSON.parse(fs.readFileSync(file, "utf8")) as OracleEdges;
      expect(text.documents[0]).toBe("../../src/main.ts");
      expect(readOracleEdges(file, fixture)).toEqual(rebaseOracleEdges(graph, fixture, fixture));
      expect(readOracleEdges(path.join(fixture, "absent.json"), fixture)).toBeUndefined();
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("keeps hand-verified evidence and deployment markers while relocating its endpoints", () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "hand-paths-"));
    try {
      const original = { convention: "source depends on target", edges: [{ from: "Gateway/Web.config", to: "Hub/App.config", via: 'address in "Gateway/Web.config"', remote: true }] };
      const file = path.join(fixture, "expected", "hand-verified-edges.json");
      fs.mkdirSync(path.dirname(file));
      fs.writeFileSync(file, JSON.stringify(rebaseHandVerifiedEdges(original, fixture, path.dirname(file))));
      expect(readHandVerifiedEdges(file, fixture)).toEqual(original);
      expect(readHandVerifiedEdges(path.join(fixture, "absent.json"), fixture)).toBeUndefined();
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("does not introduce optional project fields absent from the observations", () => {
    const minimal = { ...graph, projectFile: undefined, projects: [{ name: "plain", directory: ".", references: [] }] };
    const stored = rebaseOracleEdges(minimal, "/repo/fixture", "/repo/fixture/expected");
    expect(stored.projectFile).toBeUndefined();
    expect(stored.projects[0]).not.toHaveProperty("members");
  });
});

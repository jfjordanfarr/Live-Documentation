import { describe, expect, it } from "vitest";

import type { Entry } from "@live-documentation/engine/live-docs/document";
import type { GraphFile, LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { landingOf, underSampleRoot } from "./landing";

function graphOf(entries: Record<string, Entry[]>, archetypes: Record<string, string> = {}): LiveDocGraph {
  const files: Record<string, GraphFile> = {};
  for (const [codePath, lines] of Object.entries(entries)) {
    files[codePath] = { codePath, docPath: `${codePath}.md`, layer: 4, archetype: archetypes[codePath] ?? "implementation", entries: lines, authored: "", symbols: [], dependencies: [], edges: [], outbound: [], inbound: [] };
  }
  return { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md", files };
}

const command: Entry = { reason: "command", command: "start", declarer: { label: "package.json", link: "../package.json.md" } };

describe("landingOf", () => {
  it("lands on the one program, command, module or declared entry outside the sample roots", () => {
    expect(landingOf(graphOf({ "src/cli.ts": [command], "src/lib.ts": [], "package.json": [{ reason: "tooling" }] }))).toEqual({ kind: "file", codePath: "src/cli.ts" });
    expect(landingOf(graphOf({ "src/index.ts": [{ reason: "declared" }], "src/lib.ts": [] }))).toEqual({ kind: "file", codePath: "src/index.ts" });
    expect(landingOf(graphOf({ "samples/a/main.py": [{ reason: "program" }], "src/app.ts": [{ reason: "module", declarer: { label: "package.json", link: "../package.json.md" } }] }), ["samples"])).toEqual({ kind: "file", codePath: "src/app.ts" });
  });

  it("lands on the root when several such entries exist, or none that a reading starts at", () => {
    expect(landingOf(graphOf({ "src/cli.ts": [command], "src/serve.ts": [command] }))).toEqual({ kind: "root" });
    expect(landingOf(graphOf({ "package.json": [{ reason: "tooling" }], "src/api.ts": [{ reason: "opening", symbol: { name: "GET api", link: "#symbol-get-api" } }] }))).toEqual({ kind: "root" });
    expect(landingOf(graphOf({ "samples/a/main.py": [{ reason: "program" }], "src/lib.ts": [] }), ["samples"])).toEqual({ kind: "root" });
  });

  it("guesses by file name only when the docs declare no entry at all, tests notwithstanding", () => {
    expect(landingOf(graphOf({ "src/main.ts": [], "src/main.test.ts": [] }, { "src/main.test.ts": "test" }))).toEqual({ kind: "guess" });
    expect(landingOf(graphOf({}))).toEqual({ kind: "guess" });
  });

  it("knows a path under a sample root, the root itself, and the whole workspace as a root", () => {
    expect(underSampleRoot("samples/a/main.py", ["samples"])).toBe(true);
    expect(underSampleRoot("samples", ["samples"])).toBe(true);
    expect(underSampleRoot("samples-extra/x.py", ["samples"])).toBe(false);
    expect(underSampleRoot("anything", ["."])).toBe(true);
    expect(underSampleRoot("anything", [])).toBe(false);
  });
});

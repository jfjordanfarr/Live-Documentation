/**
 * C's and Rust's caches of a file's facts, each held on its own. A worker of the history generates change after change
 * in one folder, so what an adapter keeps of a file by its path must live for one generation only (`beginRun` in
 * `c.ts` and `rust.ts`). The cases of `history-workers.test.ts` hold C's cache of folder listings and Rust's cache of
 * packages; with only the facts caches left to live for the process, they stayed green (the review of 2026-11-20). Here
 * a file is rewritten in place, its modification time held, as a coarse disk or a fast writer can leave it, so that a
 * fact kept from the first generation would give another graph than a fresh process derives.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import type { LiveDocGraph } from "../../../packages/engine/src/live-docs/graph";
import { generateLiveDocs } from "../../../packages/generator/src/generator";

const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "fc-"));
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

// A whole second, so that the time set reads back exactly.
const HELD_TIME = 1_700_000_000;

function writeOver(folder: string, files: Record<string, string>, held: readonly string[] = []): void {
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(folder, file)), { recursive: true });
    fs.writeFileSync(path.join(folder, file), text);
  }
  for (const relative of held) fs.utimesSync(path.join(folder, relative), HELD_TIME, HELD_TIME);
}

/** Every doc the generator derives of the workspace, as the graph carries it, but for when it was generated. */
async function generatedGraph(folder: string): Promise<LiveDocGraph["files"]> {
  const configuration = normalizeLiveDocumentationConfig({ root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" });
  const quiet = (): undefined => undefined;
  const result = await generateLiveDocs({ workspaceRoot: folder, config: configuration, keepAuthoredStaleDocs: false, logger: { info: quiet, warn: quiet, error: quiet } });
  expect(result.failed).toEqual([]);
  const graph = JSON.parse(fs.readFileSync(path.join(folder, result.index!), "utf8"), (key, value: unknown) => (key === "generatedAt" ? undefined : value)) as LiveDocGraph;
  return graph.files;
}

describe("an adapter's cache of a file's facts, in one process generating commit after commit in one folder", () => {
  it.each([
    [
      "C: a header is rewritten in place to declare the function a program calls",
      {
        "src/main.c": `#include "util.h"\n\nint main(void) {\n  return twice(1);\n}\n`,
        "src/util.h": `/** Halves a value. */\nint half(int value);\n`
      },
      { "src/util.h": `/** Twice a value. */\nint twice(int value);\n` },
      ["src/util.h"]
    ],
    [
      "Rust: a module is rewritten in place to declare the type a program uses",
      {
        "Cargo.toml": `[package]\nname = "demo"\nversion = "0.1.0"\n`,
        "src/main.rs": `mod shapes;\n\nuse shapes::Widget;\n\nfn main() {\n    let _w = Widget;\n}\n`,
        "src/shapes.rs": `/// A gadget.\npub struct Gadget;\n`
      },
      { "src/shapes.rs": `/// A widget.\npub struct Widget;\n` },
      ["src/shapes.rs"]
    ]
  ])("derives what a fresh process derives: %s", async (_name, first, second, held) => {
    const reused = fs.mkdtempSync(path.join(privateTemporary, "reused-"));
    writeOver(reused, first, held);
    const before = await generatedGraph(reused);
    // As a tree brought forward: the docs root removed whole, the change's files written over the last change's.
    fs.rmSync(path.join(reused, ".mdmd"), { recursive: true, force: true });
    writeOver(reused, second, held);
    const fresh = fs.mkdtempSync(path.join(privateTemporary, "fresh-"));
    writeOver(fresh, { ...first, ...second });
    const expected = await generatedGraph(fresh);
    // The case means something only where the change changes the graph.
    expect(expected).not.toEqual(before);
    expect(await generatedGraph(reused)).toEqual(expected);
  }, 120_000);
});

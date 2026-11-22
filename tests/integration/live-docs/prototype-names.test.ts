/**
 * Files named as the members every plain JavaScript object inherits (`__proto__`, `constructor`, `toString`,
 * `hasOwnProperty`) are files like any other: generated, in the graph, in the index on disk, and answered by the
 * inspect command, from them and to them. The graph keys its files by their paths, and a path is a stranger's word: a
 * key that is a plain object's inherited member must not read as a file that is there, nor be lost. Written on
 * 2026-11-22 after the stored form's reviewer broke the module's copy of that keying with a file named `__proto__`, and
 * read that the engine's would throw or lie for `constructor` and `toString`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { readLiveDocGraph } from "../../../packages/engine/src/live-docs/graphFiles";
import { generateLiveDocs } from "../../../packages/generator/src/generator";

const REPO = path.resolve(__dirname, "..", "..", "..");
const TSX = path.join(REPO, "node_modules", "tsx", "dist", "cli.mjs");
const INSPECT = path.join(REPO, "scripts", "live-docs", "inspect.ts");
const NAMES = ["__proto__", "constructor", "toString", "hasOwnProperty"] as const;
const config = normalizeLiveDocumentationConfig();

let workspace: string;

beforeAll(async () => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "prototype-names-"));
  for (const name of NAMES) fs.writeFileSync(path.join(workspace, name), `${name}\n`);
  // A configuration that names each, so that each has an edge in and the walk has somewhere to go.
  fs.writeFileSync(path.join(workspace, "refs.json"), `${JSON.stringify(Object.fromEntries(NAMES.map((name, at) => [`file${at}`, `./${name}`])), null, 2)}\n`);
  const quiet = (): undefined => undefined;
  const result = await generateLiveDocs({ workspaceRoot: workspace, config, logger: { info: quiet, warn: quiet, error: quiet } });
  expect(result.failed).toEqual([]);
}, 120_000);

afterAll(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

function inspect(args: string[]): { status: number | null; stdout: string; stderr: string } {
  const run = spawnSync(process.execPath, [TSX, "--tsconfig", path.join(REPO, "tsconfig.base.json"), INSPECT, "--workspace", workspace, ...args], { cwd: REPO, encoding: "utf8" });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr };
}

describe("files named as a plain object's inherited members", () => {
  it("are each a file of the graph, with its edge in, and no file is one they are not", async () => {
    const graph = await readLiveDocGraph({ workspaceRoot: workspace, config });
    expect(Object.keys(graph.files).sort()).toEqual([...NAMES, "refs.json"].sort());
    for (const name of NAMES) {
      expect(Object.hasOwn(graph.files, name), name).toBe(true);
      expect(graph.files[name].inbound, name).toEqual(["refs.json"]);
    }
    expect(graph.files["refs.json"].outbound.slice().sort()).toEqual([...NAMES].sort());
    expect(graph.files.valueOf === undefined || !Object.hasOwn(graph.files, "valueOf")).toBe(true);
  });

  it("are each a file of the index on disk", () => {
    const index = JSON.parse(fs.readFileSync(path.join(workspace, config.root, "index.json"), "utf8")) as { files: Record<string, { inbound: string[] }> };
    expect(Object.keys(index.files).sort()).toEqual([...NAMES, "refs.json"].sort());
    for (const name of NAMES) expect(index.files[name].inbound, name).toEqual(["refs.json"]);
  });

  it("are answered by the inspect command, from them, to them and on the way between", () => {
    const from = inspect(["--from", "refs.json", "--json"]);
    expect(from.status, from.stderr).toBe(0);
    for (const name of NAMES) expect(from.stdout, name).toContain(`"${name}"`);
    for (const name of NAMES) {
      const into = inspect(["--from", name, "--direction", "inbound", "--json"]);
      expect(into.status, `${name}: ${into.stderr}`).toBe(0);
      expect(into.stdout, name).toContain("refs.json");
    }
    const reachable = inspect(["--from", "refs.json", "--reachable", "--json"]);
    expect(reachable.status, reachable.stderr).toBe(0);
    for (const name of NAMES) expect(reachable.stdout, name).toContain(`"${name}"`);
    const between = inspect(["--from", "refs.json", "--to", "toString", "--json"]);
    expect(between.status, between.stderr).toBe(0);
    expect(between.stdout).toContain("toString");
    const unknown = inspect(["--from", "valueOf", "--json"]);
    expect(unknown.status, "a name no file has, though every object has it").not.toBe(0);
  }, 120_000);
});

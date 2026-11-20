/**
 * A JSDoc comment nested between a fresh process's limit and a warm one's, through the history command. TypeScript's
 * parser reads the type expressions of a JSDoc comment eagerly, by its recursive type parser, and `ts.forEachChild`
 * never reaches a node's JSDoc, so until 2026-11-20 the reading depth's measure saw a JSDoc tuple 650 deep as five
 * levels: a worker warmed by earlier changes read the file and published its summary unmarked, and a fresh process
 * given the change alone could not map it (the independent review of 2026-11-20, shown with real workers). The measure
 * now walks each node's JSDoc as nesting (`processMark.ts`), so the warm worker is marked and a fresh one decides.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { afterAll, describe, expect, it } from "vitest";

import { buildRepository, type ScriptedCommit } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const historyScript = path.join(repoRoot, "scripts", "live-docs", "history.ts");
const CONFIG = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };

// A private, short temporary folder for the trees and for tsx's socket, shared with no other run on the machine.
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "jd-"));
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

/** The history command over `workspace` with `jobs` workers; what it said. */
function history(workspace: string, jobs: number): string {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfigPath, historyScript, "--workspace", workspace, "--jobs", String(jobs)], {
    encoding: "utf8",
    env: { ...process.env, TMPDIR: privateTemporary }
  });
  if (result.error) throw result.error;
  expect(result.status, result.stderr).toBe(0);
  return result.stderr + result.stdout;
}

/** Every summary of the one lens's cache, unzipped, by its file's name. */
function summaries(workspace: string): Map<string, string> {
  const historyFolder = path.join(workspace, ".mdmd", "history");
  const lenses = fs.readdirSync(historyFolder, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^[0-9a-f]{16}$/u.test(entry.name));
  expect(lenses).toHaveLength(1);
  const cache = path.join(historyFolder, lenses[0].name);
  const found = new Map<string, string>();
  for (const name of fs.readdirSync(cache)) {
    if (/^[0-9a-f]{40}\.json\.gz$/u.test(name)) found.set(name, zlib.gunzipSync(fs.readFileSync(path.join(cache, name))).toString("utf8"));
  }
  return found;
}

const tuple = (levels: number): string => `${"[".repeat(levels)}number${"]".repeat(levels)}`;

describe("a JSDoc comment nested between a fresh process's limit and a warm one's", () => {
  it("gives the summary a fresh process makes of the change alone, whichever worker meets it", () => {
    // Forty files of JSDoc and type tuples 150 deep warm a worker's parser; the last change removes them and adds a
    // JSDoc tuple 650 deep, which a fresh worker cannot read.
    const warm = Object.fromEntries(Array.from({ length: 40 }, (_, index) => [`src/warm/w${index}.ts`, `/** @type {${tuple(150)}} */\nexport const w${index} = 1;\nexport type W${index} = ${tuple(150)};\n`]));
    const script: ScriptedCommit[] = [
      { message: "Warming files", date: "2026-01-05T10:00:00+00:00", write: { ".live-docs.config.json": `${JSON.stringify(CONFIG)}\n`, "src/a.ts": "export const a = 1;\n", ...warm } },
      { message: "A deep JSDoc", date: "2026-01-06T10:00:00+00:00", remove: Object.keys(warm), write: { "src/doc.ts": `/** @type {${tuple(650)}} */\nexport const x = 1;\n` } }
    ];
    const together = fs.mkdtempSync(path.join(privateTemporary, "together-"));
    const apart = fs.mkdtempSync(path.join(privateTemporary, "apart-"));
    const commits = buildRepository(together, script);
    expect(buildRepository(apart, script)).toEqual(commits);
    history(together, 1);
    history(apart, commits.length);
    const a = summaries(together);
    const b = summaries(apart);
    const last = `${commits[1]}.json.gz`;
    // The case shows something only while a fresh process cannot map the file: its summary names it as not mapped.
    expect(JSON.parse(b.get(last)!).unmapped, "what a fresh process could not map").toEqual([["src/doc.ts", "Maximum call stack size exceeded"]]);
    expect([...a.keys()].sort()).toEqual([...b.keys()].sort());
    for (const [file, text] of b) expect(a.get(file), file).toBe(text);
  }, 300_000);
});

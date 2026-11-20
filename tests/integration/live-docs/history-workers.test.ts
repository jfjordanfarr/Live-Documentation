/**
 * A worker of the history summarizes change after change in one process, its tree brought forward between them; each
 * of its summaries must be the summary a fresh process makes of that change in a tree written anew. The scripted
 * repository's seven commits hold what a process could carry wrongly from one change to the next: files git tracks
 * though an ignore file names them (asked of the tree's own index through the tree's git environment), documents
 * linked from the docs that come and go (asked of the same index), files renamed, removed and rewritten. One run gives
 * every change to one worker; another gives each change a worker of its own (as many workers as changes, each taking
 * one); the two caches must agree byte for byte, summaries and texts (the record of 2026-11-20,
 * `Probes/history-rebuild-fast`).
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { afterAll, describe, expect, it } from "vitest";

import { buildRepository, CHECKED_SCRIPT, COLLISION_SCRIPT, SCRIPT } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const historyScript = path.join(repoRoot, "scripts", "live-docs", "history.ts");

// A private, short temporary folder for the trees and for tsx's socket, shared with no other run on the machine.
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "lw-"));
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

function history(workspace: string, jobs: number): string {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfigPath, historyScript, "--workspace", workspace, "--jobs", String(jobs)], {
    encoding: "utf8",
    env: { ...process.env, TMPDIR: privateTemporary }
  });
  if (result.error) throw result.error;
  expect(result.status, result.stderr).toBe(0);
  return result.stderr + result.stdout;
}

/**
 * Every summary and text of a lens's cache folder by its path within it: a summary unzipped, a text as stored. The
 * run's own records beside them (`whole.json`, which names when and how the run went) are no part of a summary.
 */
function cacheOf(workspace: string): Map<string, string> {
  const historyFolder = path.join(workspace, ".mdmd", "history");
  const lenses = fs.readdirSync(historyFolder, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^[0-9a-f]{16}$/u.test(entry.name));
  expect(lenses).toHaveLength(1);
  const cache = path.join(historyFolder, lenses[0].name);
  const files = new Map<string, string>();
  for (const entry of fs.readdirSync(cache, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    const relative = path.relative(cache, file).split(path.sep).join("/");
    const summary = /^[0-9a-f]{40}\.json\.gz$/u.test(relative);
    if (!summary && !relative.startsWith("texts/")) continue;
    const bytes = fs.readFileSync(file);
    files.set(relative, summary ? zlib.gunzipSync(bytes).toString("utf8") : bytes.toString("utf8"));
  }
  return files;
}

describe("a worker's summaries, change after change in one process", () => {
  // The seven commits, with documents linked that come and go; a file git tracks though an ignore file names it; renames.
  it.each([
    ["the scripted repository", SCRIPT],
    ["the repository with a file tracked and ignored", CHECKED_SCRIPT],
    ["the repository of renames onto a dead file's path", COLLISION_SCRIPT]
  ])("are those of a fresh process for each change, byte for byte: %s", (name, script) => {
    const together = fs.mkdtempSync(path.join(privateTemporary, "together-"));
    const apart = fs.mkdtempSync(path.join(privateTemporary, "apart-"));
    const commits = buildRepository(together, script);
    expect(buildRepository(apart, script), name).toEqual(commits);
    const one = history(together, 1);
    // One worker, its tree brought forward at every change after the first.
    expect(one.match(/\d+\/\d+ regenerated: /gu)).toHaveLength(commits.length);
    expect(one.match(/its tree written anew/gu)).toHaveLength(1);
    history(apart, commits.length);
    const a = cacheOf(together);
    const b = cacheOf(apart);
    expect([...a.keys()].sort()).toEqual([...b.keys()].sort());
    for (const [file, text] of b) expect(a.get(file), file).toBe(text);
    expect([...a.keys()].filter((file) => file.endsWith(".json.gz"))).toHaveLength(commits.length);
  }, 300_000);
});

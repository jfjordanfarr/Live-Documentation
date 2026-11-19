/**
 * Which generator is running: the half of the history's lens that is the
 * tool, so that a sequence says whose reading of the past it is and the cache
 * never serves a summary another generator made (the plan's scenario 13; the
 * owner's "Live Documentation, as it gets better and better, will be capable
 * of producing a more and more accurate timeline reconstruction of its past",
 * 2026-10-16).
 *
 * @remarks
 * The lens keys on the code that makes a summary and on nothing else. Until
 * 2026-11-19 it keyed on the whole of the engine and generator packages, so
 * that an edit to a test, or to the modules that only read summaries into a
 * sequence (the codec, the queries, the ticks the Explorer draws), began a new
 * cache and a full rebuild of the history; since then the two packages' tests
 * and every module of their `history` folders but the summarizing process's
 * own ({@link SUMMARY_MODULES}) are left out of the key. Every other file of
 * the two packages stays in, so that a file whose part in a summary nobody
 * has weighed is keyed rather than trusted; `generatorIdentity.test.ts` holds
 * the summarizing process's imports to that list.
 *
 * @module
 */

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { execFileAsync } from "@live-documentation/engine/live-docs/gitUtils";
import type { GeneratorIdentity } from "@live-documentation/engine/live-docs/history/format";

// This module lies in `src/history` of the generator package, or in `dist/history` once built: the package is two folders up.
const PACKAGE_ROOT = path.resolve(__dirname, "..", "..");

// The folders whose code makes a summary, as they stand in a checkout of this repository.
const GENERATOR_FOLDERS = ["packages/engine", "packages/generator"];
// This repository's lock names the installed tool dependencies, including parser versions; a scanned project's lock is not ours.
const TOOL_DEPENDENCY_LOCK = "package-lock.json";

/** The folders of the history's own modules, most of which read summaries and never make one. */
export const HISTORY_FOLDERS = ["packages/engine/src/live-docs/history/", "packages/generator/src/history/"];

/** The modules of {@link HISTORY_FOLDERS} that run in a summarizing process and so decide what a summary says. */
export const SUMMARY_MODULES = [
  "packages/engine/src/live-docs/history/summary.ts",
  "packages/engine/src/live-docs/history/textStore.ts",
  "packages/generator/src/history/summarizeChange.ts"
];

/**
 * Whether a file of the two packages, by its repository-relative path, keys the lens: every file but a test and the
 * history modules that never run in a summarizing process.
 */
export function keysTheLens(file: string): boolean {
  if (!GENERATOR_FOLDERS.some((folder) => file.startsWith(`${folder}/`))) {
    return false;
  }
  if (file.endsWith(".test.ts")) {
    return false;
  }
  return !HISTORY_FOLDERS.some((folder) => file.startsWith(folder)) || SUMMARY_MODULES.includes(file);
}

/**
 * The generator's package version and, when it runs from a checkout of this
 * repository, a hash of the code that makes a summary and of the tool
 * dependency lock as committed (each keyed file's blob id at the commit, and
 * the lock's entry), the commit it runs from, and a hash of uncommitted
 * changes to those inputs. The lock's working bytes are compared to its
 * committed blob even when Git ignores it. An absent lock has its own stable
 * identity; a scanned project's lock is never read.
 */
export async function generatorIdentity(): Promise<GeneratorIdentity> {
  const manifest = JSON.parse(await fs.readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8")) as { version: string };
  const checkout = await checkoutOf(PACKAGE_ROOT);
  return { version: manifest.version, code: checkout?.code ?? null, commit: checkout?.commit ?? null, modified: checkout?.modified ?? null };
}

async function checkoutOf(packageRoot: string): Promise<{ code: string; commit: string; modified: string | null } | undefined> {
  let topLevel: string;
  try {
    topLevel = (await git(packageRoot, ["rev-parse", "--show-toplevel"])).trim();
  } catch {
    return undefined;
  }
  // A checkout of this repository holds the generator at packages/generator; a copy installed into another repository does not.
  const [realTop, realPackage] = await Promise.all([fs.realpath(topLevel), fs.realpath(packageRoot)]);
  if (path.relative(realTop, realPackage).split(path.sep).join("/") !== "packages/generator") {
    return undefined;
  }
  const commit = (await git(topLevel, ["rev-parse", "HEAD"])).trim();
  // The committed tool inputs: every keyed file's blob and this tool's dependency lock. ls-tree returns empty when the lock is absent.
  const [tree, lockEntry] = await Promise.all([
    git(topLevel, ["ls-tree", "-r", "-z", "--full-tree", "HEAD", "--", ...GENERATOR_FOLDERS]),
    git(topLevel, ["ls-tree", "HEAD", "--", TOOL_DEPENDENCY_LOCK])
  ]);
  // Each entry is `<mode> blob <id>\t<path>`.
  const keyed = tree.split("\0").filter((entry) => entry !== "" && keysTheLens(entry.slice(entry.indexOf("\t") + 1)));
  const code = createHash("sha256").update(keyed.join("\n")).update("tool-lock\0").update(lockEntry || "absent\n").digest("hex").slice(0, 16);
  const committedLock = lockEntry === "" ? null : /^\d+ blob ([0-9a-f]+)\tpackage-lock\.json\r?\n$/u.exec(lockEntry)?.[1];
  if (committedLock === undefined) throw new Error(`Cannot identify the committed ${TOOL_DEPENDENCY_LOCK} in ${topLevel}`);
  const workingLock = await workingLockBlob(topLevel);
  const changed = changedPaths(await git(topLevel, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...GENERATOR_FOLDERS])).filter(keysTheLens);
  if (changed.length === 0 && workingLock === committedLock) {
    return { code, commit, modified: null };
  }
  // What the keyed files hold in the working tree where they differ from the commit: their bytes, or their absence.
  const hash = createHash("sha256");
  for (const file of changed) {
    hash.update(`${file}\0`);
    try {
      hash.update(await fs.readFile(path.join(topLevel, file)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      hash.update("absent");
    }
    hash.update("\0");
  }
  if (workingLock !== committedLock) hash.update("tool-lock\0").update(workingLock ?? "absent");
  return { code, commit, modified: hash.digest("hex").slice(0, 16) };
}

/** Every path `git status --porcelain=v1 -z` names, a rename's both, sorted and each once. */
function changedPaths(status: string): string[] {
  const paths = new Set<string>();
  const fields = status.split("\0");
  for (let index = 0; index < fields.length; index += 1) {
    const entry = fields[index];
    if (entry === "") continue;
    paths.add(entry.slice(3));
    // A rename or a copy is followed by the field of its original path.
    if (/^[RC]|^.[RC]/u.test(entry)) {
      index += 1;
      if (fields[index]) paths.add(fields[index]);
    }
  }
  return [...paths].sort();
}

/** The working lock's Git blob id, regardless of whether Git tracks or ignores the file. */
async function workingLockBlob(topLevel: string): Promise<string | null> {
  try {
    await fs.access(path.join(topLevel, TOOL_DEPENDENCY_LOCK));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  return (await git(topLevel, ["hash-object", "--", TOOL_DEPENDENCY_LOCK])).trim();
}

async function git(cwd: string, args: readonly string[]): Promise<string> {
  return (await execFileAsync("git", ["-C", cwd, ...args], { cwd, maxBuffer: 1 << 30 })).stdout;
}

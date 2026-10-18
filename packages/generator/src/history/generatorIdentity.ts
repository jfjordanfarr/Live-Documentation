/**
 * Which generator is running: the half of the history's lens that is the
 * tool, so that a sequence says whose reading of the past it is and the cache
 * never serves a summary another generator made (the plan's scenario 13; the
 * owner's "Live Documentation, as it gets better and better, will be capable
 * of producing a more and more accurate timeline reconstruction of its past",
 * 2026-10-16).
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

/**
 * The generator's package version and, when it runs from a checkout of this
 * repository, the commit it runs from and a hash of any uncommitted change to
 * the engine or the generator there, so that a generator edited in place is a
 * new lens rather than the commit it started from.
 */
export async function generatorIdentity(): Promise<GeneratorIdentity> {
  const manifest = JSON.parse(await fs.readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8")) as { version: string };
  const checkout = await checkoutOf(PACKAGE_ROOT);
  return { version: manifest.version, commit: checkout?.commit ?? null, modified: checkout?.modified ?? null };
}

async function checkoutOf(packageRoot: string): Promise<{ commit: string; modified: string | null } | undefined> {
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
  const status = await git(topLevel, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...GENERATOR_FOLDERS]);
  if (status === "") {
    return { commit, modified: null };
  }
  const hash = createHash("sha256");
  hash.update(await git(topLevel, ["diff", "--binary", "HEAD", "--", ...GENERATOR_FOLDERS]));
  for (const entry of status.split("\0")) {
    if (entry.startsWith("?? ")) {
      const untracked = entry.slice(3);
      hash.update(untracked);
      hash.update(await fs.readFile(path.join(topLevel, untracked)));
    }
  }
  return { commit, modified: hash.digest("hex").slice(0, 16) };
}

async function git(cwd: string, args: readonly string[]): Promise<string> {
  return (await execFileAsync("git", ["-C", cwd, ...args], { cwd, maxBuffer: 1 << 30 })).stdout;
}

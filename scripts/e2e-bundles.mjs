#!/usr/bin/env node
// Every bundle the browser suite serves, in one list: built by `npm run e2e:bundles` (and so by `npm run test:e2e`
// before its passes), and checked at the suite's start by `node scripts/e2e-bundles.mjs --check`, which refuses a run
// whose bundles were not built together from the client as it stands. Each bundle carries its own copy of the client's script, built from the
// same sources by the same step, so the copies of bundles built together are the same bytes; a sample whose copy
// differs from the Explorer's was built at another time. On 2026-11-19 a check rebuilt the Explorer and the estate
// sample but not the history or Rosetta samples, and the history's cases then failed on a page hours old.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { runNpmScript } from "./steps.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Where the suite's site is built, the folder its server serves. */
export const SITE = path.join(repoRoot, "dist", "explorer");

/**
 * The npm scripts that build the suite's bundles, in order, each with the folders it writes under the site; a folder
 * ending in `/*` stands for each bundle one level beneath it. The scripts' own command lines name the same folders, and
 * the unit test of this file holds the two together.
 */
export const SUITE_BUNDLES = [
  { script: "live-docs:visualize", folders: ["."] },
  { script: "live-docs:visualize:estate", folders: ["samples/estate"] },
  { script: "live-docs:visualize:link-targets", folders: ["samples/link-targets"] },
  {
    script: "live-docs:visualize:history-sample",
    folders: ["samples/history", "samples/history-window", "samples/history-collision", "samples/history-growth", "samples/history-veil"]
  },
  { script: "live-docs:visualize:rosetta", folders: ["samples/rosetta/*"] }
];

/** The sources whose change changes the client's built script: the client's own files, tests aside, and its builder. */
const CLIENT_SOURCES = [
  path.join(repoRoot, "packages", "explorer", "src", "client"),
  path.join(repoRoot, "packages", "explorer", "src", "shared", "buildAssets.ts"),
  path.join(repoRoot, "packages", "explorer", "src", "shared", "template.html")
];

const SCRIPT = path.join("static", "index.js");

/** The newest file among the given files and folders, tests left out; undefined when there is none. */
function newestFile(places) {
  let newest;
  const visit = place => {
    let stat;
    try {
      stat = fs.statSync(place);
    } catch {
      return;
    }
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(place)) visit(path.join(place, entry));
    } else if (!/\.test\.ts$/.test(place) && (!newest || stat.mtimeMs > newest.mtimeMs)) {
      newest = { file: place, mtimeMs: stat.mtimeMs };
    }
  };
  places.forEach(visit);
  return newest;
}

/** The bundle folders a declared folder stands for, beneath the site: itself, or each folder beneath it for `/*`. */
function expand(site, folder) {
  if (!folder.endsWith("/*")) return [path.join(site, folder)];
  const parent = path.join(site, folder.slice(0, -2));
  try {
    return fs.readdirSync(parent, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => path.join(parent, entry.name));
  } catch {
    return [parent];
  }
}

const when = mtimeMs => new Date(mtimeMs).toISOString().replace("T", " ").slice(0, 19);

/**
 * Why the suite's bundles are not fit to test, one plain sentence each; an empty list when they are. The Explorer's
 * own script must be newer than every source of the client, and every sample's copy of it the same bytes.
 */
export function staleBundles(site = SITE, sources = CLIENT_SOURCES, bundles = SUITE_BUNDLES) {
  const named = place => path.relative(path.dirname(path.dirname(site)), place).split(path.sep).join("/");
  const reference = path.join(site, SCRIPT);
  let referenceStat;
  try {
    referenceStat = fs.statSync(reference);
  } catch {
    return [`${named(site)} holds no built Explorer (${named(reference)} is missing)`];
  }
  const faults = [];
  const newest = newestFile(sources);
  if (newest && newest.mtimeMs > referenceStat.mtimeMs) {
    faults.push(`${named(reference)} (built ${when(referenceStat.mtimeMs)}) is older than ${named(newest.file)} (changed ${when(newest.mtimeMs)})`);
  }
  const referenceBytes = fs.readFileSync(reference);
  for (const folder of bundles.flatMap(bundle => bundle.folders).filter(folder => folder !== ".").flatMap(folder => expand(site, folder))) {
    const copy = path.join(folder, SCRIPT);
    let stat;
    try {
      stat = fs.statSync(copy);
    } catch {
      faults.push(`${named(folder)} is missing`);
      continue;
    }
    if (stat.size === referenceBytes.length && fs.readFileSync(copy).equals(referenceBytes)) continue;
    faults.push(stat.mtimeMs < referenceStat.mtimeMs
      ? `${named(folder)} embeds a client script built ${when(stat.mtimeMs)}, older than ${named(reference)} (built ${when(referenceStat.mtimeMs)})`
      : `${named(folder)} embeds a client script built ${when(stat.mtimeMs)} that differs from ${named(reference)}, which is older (built ${when(referenceStat.mtimeMs)})`);
  }
  return faults;
}

/** The refusal for a list of faults, naming each and the command that rebuilds the bundles; undefined for none. */
export function refusal(faults) {
  if (faults.length === 0) return undefined;
  return `The browser suite will not run on bundles that were not built together from the client as it stands:\n${faults.map(fault => `  - ${fault}`).join("\n")}\nRun \`npm run e2e:bundles\`, which builds the Explorer and every sample the suite serves.`;
}

/** With `--check`, says nothing and exits 0 when the bundles are fit to test, else prints the refusal and exits 1. */
function check() {
  const refused = refusal(staleBundles());
  if (refused) {
    console.error(refused);
    process.exit(1);
  }
}

/** Builds every bundle of the suite, one npm script after another; stops at the first that fails. */
function buildAll() {
  try {
    for (const bundle of SUITE_BUNDLES) runNpmScript(`Bundle: ${bundle.script}`, ["run", bundle.script]);
  } catch (error) {
    console.error(`\nThe suite's bundles could not be built: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  if (process.argv[2] === "--check") check();
  else buildAll();
}

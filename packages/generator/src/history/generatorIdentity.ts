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
 * Since a later edit of 2026-11-19 the key also holds the code the history
 * command runs on a summary's behalf before the summarizing process starts:
 * the version control's reading of a commit's tree (`git.ts`) and the module
 * that writes the tree and starts the process with its task and environment
 * (`regenerate.ts`). Before, both ran outside the key, and the guard, which
 * read only the summarizing process's imports, could not see them. Every file
 * of the history folders that is not a TypeScript module, data a module might
 * import or read, is keyed too, and so is the version of Unicode the runtime
 * reads names by, which a summary's anchors and order depend on through the
 * case of letters and the classes of characters.
 *
 * Since 2026-11-20 this repository's dependency lock keys the lens only
 * through the entries of the packages the summarizing process can load
 * ({@link keyedLockEntries}): the two packages' dependencies as the lock
 * resolves them, and the packages loaded that neither declares
 * ({@link LOCK_ROOTS}). Until then the lock's whole bytes keyed it, so that a
 * tool that never touches a summary, the browser tests' Playwright pinned to
 * another version, began a new cache and a rebuild of the whole history. The
 * integration case `history-lens-lock.test.ts` holds the list to what a
 * worker really reads under `node_modules`. A link in the lock to any folder
 * but the two packages' is refused, since the key would hold such a folder's
 * files by its version alone. The key is the committed lock's, the same on
 * every platform; the installation is held to it where npm recorded what it
 * installed (`node_modules/.package-lock.json`): the record is walked as the
 * lock is, and a keyed place the installation reaches that the lock does not
 * (a nearer copy), a required one it does not reach, or one whose version or
 * integrity differs joins the modified half ({@link installationDifference});
 * another `resolved` for the same integrity, a registry mirror's, does not.
 * Where npm left
 * no record, nothing is checked, and a `node_modules` installed by other
 * means or changed by hand is trusted. The key holds neither the runtime's
 * own version, so that an upgrade of Node is outside it (only its version of
 * Unicode is held, for the reason above), nor git's.
 *
 * @module
 */

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { GeneratorIdentity } from "@live-documentation/engine/live-docs/history/format";
import { historyGit } from "@live-documentation/engine/live-docs/history/git";

// This module lies in `src/history` of the generator package, or in `dist/history` once built: the package is two folders up.
const PACKAGE_ROOT = path.resolve(__dirname, "..", "..");

// The folders whose code makes a summary, as they stand in a checkout of this repository.
const GENERATOR_FOLDERS = ["packages/engine", "packages/generator"];
// The file outside them that decides what the summarizing process loads: its paths make it load the packages' sources.
const GENERATOR_FILES = ["tsconfig.base.json"];
// This repository's lock names the installed tool dependencies, including parser versions; a scanned project's lock is not ours.
const TOOL_DEPENDENCY_LOCK = "package-lock.json";
// npm's record of what it installed, written by `npm ci` and `npm install` beside the packages.
const INSTALLATION_RECORD = "node_modules/.package-lock.json";

/**
 * The packages the summarizing process loads that neither {@link GENERATOR_FOLDERS} package declares, each found as
 * Node finds it from the folder it is loaded from, with why it is loaded: the lock's dependencies of the two packages
 * cannot show them.
 */
export const LOCK_ROOTS: ReadonlyArray<{ from: string; name: string; reason: string }> = [
  {
    from: "packages/generator",
    name: "tsx",
    // `summarizingFlags` in `regenerate.ts`, `require.resolve("tsx")`: the TypeScript loader every worker started from
    // the sources runs under; only the repository's own manifest declares it, as a tool of its development.
    reason: "the launcher that runs the summarizing process's TypeScript sources"
  },
  {
    from: "",
    name: "tsx",
    // `npm run live-docs:history` puts the top's `node_modules/.bin` on the path, so the command itself starts under the
    // tsx found from the repository's top, which compiles the command's side of a summary (`regenerate.ts`, `git.ts`,
    // `lens.ts`). Today it is the workers' entry too; a nested tsx under the generator would part them (the review of
    // 2026-11-20).
    reason: "the launcher the history command itself runs under"
  }
  // `glob`, which `generator.ts` and `summarizeChange.ts` import, was named here until 2026-11-21, when the generator's
  // manifest did not declare it and it was found only because npm hoists the engine's own; the manifest declares it now.
];

/**
 * What of a lock's entry decides the bytes installed at its place, which is all of it the key holds: the version, where
 * it was fetched from and its integrity hash, and, for an entry that is no download of its own, the folder it links to
 * or that it came inside its parent's download. The rest is left out: the ranges of its dependencies (what each
 * resolved to is keyed at its own place), its licence, funding, engines and deprecation, its commands, the platforms it
 * installs on and whether it has an install script (each read from the package's own manifest, which its integrity
 * covers), and whether it is a development or optional dependency of the repository, which changes with what else the
 * repository declares. Those two flags decide whether an install that omits development or optional packages installs
 * the package at all, never what it installs; where npm recorded the installation, a keyed package the lock does not
 * mark optional and that is not installed moves the key's modified half ({@link installationDifference}).
 */
const KEYED_FIELDS = ["version", "resolved", "integrity", "link", "inBundle"] as const;

/** An entry of a lock's `packages` map, of version 2 or 3, by the fields read here. */
interface LockEntry {
  version?: string;
  resolved?: string;
  integrity?: string;
  link?: boolean;
  inBundle?: boolean;
  optional?: boolean;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * The entries of a lock's `packages` map that the code of `starts` can load, by their places in the map, each with
 * {@link KEYED_FIELDS} as the lock has them: the entry of each start and of each of `roots`, and every entry reached
 * from them by their `dependencies`, `optionalDependencies` and `peerDependencies`, each name found as Node finds it,
 * at the nearest `node_modules` place upward from the entry that names it, and a link followed into the start it links
 * to. An optional dependency or a peer the lock does not hold is not installed, and is passed over; a dependency or a
 * root it does not hold cannot be keyed, and throws, as does a link to any folder but a start, whose files the code
 * half of the key does not hold.
 *
 * Walked over npm's record of an installation (`record`), whatever is missing is passed over rather than thrown at,
 * since the comparison with the lock's walk finds it not installed; a link to any folder but a start still throws,
 * naming the record.
 *
 * @param starts - The places of the workspaces whose code makes a summary.
 * @param roots - The packages loaded that no dependency of the workspaces names ({@link LOCK_ROOTS}).
 * @param record - Whether `packages` is npm's record of an installation rather than the lock.
 */
export function keyedLockEntries(
  packages: Readonly<Record<string, LockEntry>>,
  starts: readonly string[] = GENERATOR_FOLDERS,
  roots: ReadonlyArray<{ from: string; name: string }> = LOCK_ROOTS,
  record = false
): Map<string, Partial<Pick<LockEntry, (typeof KEYED_FIELDS)[number]>>> {
  const source = record ? INSTALLATION_RECORD : TOOL_DEPENDENCY_LOCK;
  const reached = new Map<string, Partial<Pick<LockEntry, (typeof KEYED_FIELDS)[number]>>>();
  const pending: string[] = [];
  const resolve = (from: string, name: string, required: boolean): void => {
    const place = nearestPlace(packages, from, name);
    if (place !== undefined) pending.push(place);
    else if (required && !record) throw new Error(`${source} holds no ${name} that ${from || "the repository"} can load`);
  };
  for (const start of starts) {
    if (packages[start] !== undefined) pending.push(start);
    else if (!record) throw new Error(`${source} holds no entry for ${start}`);
  }
  for (const root of roots) resolve(root.from, root.name, true);
  while (pending.length > 0) {
    const place = pending.pop()!;
    if (reached.has(place)) continue;
    const entry = packages[place];
    reached.set(place, keyedFieldsOf(entry));
    if (entry.link === true && entry.resolved !== undefined) {
      // A linked folder's files are keyed only where the code half keys them; any other folder the lock would key by
      // its version alone, so it is refused rather than trusted (the review of 2026-11-20).
      if (!starts.includes(entry.resolved)) throw new Error(`${source} links ${place} to ${entry.resolved}, a folder whose files the lens does not key; only ${starts.join(" and ")} may be linked`);
      if (packages[entry.resolved] === undefined) continue;
      pending.push(entry.resolved);
      continue;
    }
    for (const name of Object.keys(entry.dependencies ?? {})) resolve(place, name, true);
    for (const name of Object.keys(entry.optionalDependencies ?? {})) resolve(place, name, false);
    for (const name of Object.keys(entry.peerDependencies ?? {})) resolve(place, name, false);
  }
  return reached;
}

/**
 * The place in the lock where Node finds `name` from the code at `from`: `<folder>/node_modules/<name>` for the folder
 * of `from` and each folder above it, nearest first, a folder that is itself named `node_modules` passed over, as
 * Node's own search for a package passes it over.
 */
function nearestPlace(packages: Readonly<Record<string, LockEntry>>, from: string, name: string): string | undefined {
  const segments = from === "" ? [] : from.split("/");
  for (let length = segments.length; length >= 0; length -= 1) {
    if (length > 0 && segments[length - 1] === "node_modules") continue;
    const place = [...segments.slice(0, length), "node_modules", name].join("/");
    if (packages[place] !== undefined) return place;
  }
  return undefined;
}

/**
 * Where the installation differs from the lock in the entries the lens keys, as text for the key's modified half, or
 * `null` where it does not. The installation is read from npm's own record of it, `node_modules/.package-lock.json`,
 * which `npm ci` and `npm install` write, walked as the lock is walked ({@link keyedLockEntries}), so that a copy the
 * lock does not name and the code would load first, one nested under a workspace by an install that did not save it
 * say, is found where it stands. The two keyed sets are compared place by place: a place the installation reaches and
 * the lock does not differs; a place the lock reaches and the installation does not differs unless the lock marks it
 * optional (another platform's binary is optional, and is not installed here); a place both reach differs where its
 * content does, by its version and integrity where both hold an integrity, a registry mirror's other `resolved` being
 * no other content, and by every keyed field where they do not (a git source, a link). A link of the installation to a
 * folder whose files the lens does not key, as `npm link` writes, throws, naming the record. Where there is no record,
 * nothing is checked and `null` is returned, so that a `node_modules` installed by other means, or changed by hand, is
 * trusted to be the lock's.
 *
 * @param lock - The working lock, which the key's modified half already holds where it differs from the committed one.
 * @param installed - npm's record of what it installed, or `null` where there is none.
 */
export function installationDifference(lock: string | null, installed: string | null): string | null {
  if (lock === null || installed === null) return null;
  const packages = packagesOf(lock, TOOL_DEPENDENCY_LOCK);
  const locked = keyedLockEntries(packages);
  const present = keyedLockEntries(packagesOf(installed, INSTALLATION_RECORD), GENERATOR_FOLDERS, LOCK_ROOTS, true);
  const differing: Array<[string, unknown]> = [];
  for (const place of [...new Set([...locked.keys(), ...present.keys()])].sort()) {
    const want = locked.get(place);
    const have = present.get(place);
    if (have === undefined) {
      if (packages[place].optional !== true) differing.push([place, "not installed"]);
    } else if (want === undefined) {
      differing.push([place, have]);
    } else if (!sameContent(want, have)) {
      differing.push([place, have]);
    }
  }
  return differing.length === 0 ? null : JSON.stringify(differing);
}

/** Whether two keyed entries hold the same content: by version and integrity where both hold one, by every keyed field where not. */
function sameContent(a: Partial<Pick<LockEntry, (typeof KEYED_FIELDS)[number]>>, b: Partial<Pick<LockEntry, (typeof KEYED_FIELDS)[number]>>): boolean {
  if (a.integrity !== undefined && b.integrity !== undefined) return a.version === b.version && a.integrity === b.integrity;
  return JSON.stringify(a) === JSON.stringify(b);
}

/** The `packages` map of a lock, or of npm's record of an installation, of version 2 or 3, named in an error by `source`. */
function packagesOf(text: string, source: string): Record<string, LockEntry> {
  let packages: Record<string, LockEntry> | undefined;
  try {
    ({ packages } = JSON.parse(text) as { packages?: Record<string, LockEntry> });
  } catch (error) {
    throw new Error(`${source} cannot be read: ${(error as Error).message}`, { cause: error });
  }
  if (packages === undefined) throw new Error(`${source} has no packages map; only a lock of version 2 or 3 can be keyed`);
  return packages;
}

/** {@link KEYED_FIELDS} of an entry, in their order, those it holds. */
function keyedFieldsOf(entry: LockEntry): Partial<Pick<LockEntry, (typeof KEYED_FIELDS)[number]>> {
  return Object.fromEntries(KEYED_FIELDS.filter((field) => entry[field] !== undefined).map((field) => [field, entry[field]]));
}

/**
 * The half of the key a lock gives: a hash of {@link keyedLockEntries} in the order of their places, so that a change
 * to the lock that touches none of them, a tool of the repository's development pinned to another version say, leaves
 * it as it was. An absent lock has an identity of its own.
 */
export function lockIdentity(lock: string | null): string {
  if (lock === null) return "absent";
  const entries = [...keyedLockEntries(packagesOf(lock, TOOL_DEPENDENCY_LOCK))].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return createHash("sha256").update(JSON.stringify(entries)).digest("hex").slice(0, 16);
}

/** The folders of the history's own modules, most of which read summaries and never make one. */
export const HISTORY_FOLDERS = ["packages/engine/src/live-docs/history/", "packages/generator/src/history/"];

/**
 * The modules of {@link HISTORY_FOLDERS} that decide what a summary says: those the summarizing process runs, and those
 * the history command runs on its behalf, which write the commit's tree it reads and start it with its task and its
 * environment.
 */
export const SUMMARY_MODULES = [
  "packages/engine/src/live-docs/history/summary.ts",
  "packages/engine/src/live-docs/history/textStore.ts",
  "packages/generator/src/history/summarizeChange.ts",
  "packages/engine/src/live-docs/history/git.ts",
  "packages/generator/src/history/regenerate.ts",
  // Since 2026-11-19 it gives the configuration a summary is made under (`summarizedConfiguration`), as well as the key.
  "packages/engine/src/live-docs/history/lens.ts"
];

/** The modules from which the guard reads what decides a summary: the summarizing process, and the command's side of it. */
export const SUMMARY_ENTRIES = ["packages/generator/src/history/summarizeChange.ts", "packages/generator/src/history/regenerate.ts"];

/**
 * Whether a file, by its repository-relative path, keys the lens: every file of the two packages but a test and the
 * TypeScript modules of the history folders that decide nothing of a summary, and the base TypeScript configuration.
 */
export function keysTheLens(file: string): boolean {
  if (GENERATOR_FILES.includes(file)) {
    return true;
  }
  if (!GENERATOR_FOLDERS.some((folder) => file.startsWith(`${folder}/`))) {
    return false;
  }
  if (file.endsWith(".test.ts")) {
    return false;
  }
  return !HISTORY_FOLDERS.some((folder) => file.startsWith(folder)) || !file.endsWith(".ts") || SUMMARY_MODULES.includes(file);
}

/**
 * The generator's package version and, when it runs from a checkout of this
 * repository, a hash of the code that makes a summary and of the tool
 * dependency lock as committed (each keyed file's blob id at the commit, and
 * the lock's {@link lockIdentity}), the commit it runs from, and a hash of
 * uncommitted changes to those inputs. The working lock counts as changed
 * only where its keyed entries differ from the committed lock's, and is read
 * even when Git ignores it. An absent lock has its own stable identity; a
 * scanned project's lock is never read.
 */
export async function generatorIdentity(): Promise<GeneratorIdentity> {
  const manifest = JSON.parse(await fs.readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8")) as { version: string };
  const checkout = await checkoutOf(PACKAGE_ROOT, keysTheLens);
  return { version: manifest.version, code: checkout?.code ?? null, commit: checkout?.commit ?? null, modified: checkout?.modified ?? null, unicode: process.versions.unicode ?? null };
}

/**
 * Whether a file, by its repository-relative path, is code the history command may run while it reads summaries into
 * a sequence: every file of the two packages but a test, whether it keys the lens or not, and the base TypeScript
 * configuration. A superset of what does that work (`computeHistory.ts` and the modules of the history folders it
 * reads summaries with), so that a module whose part in the reading nobody has weighed is counted rather than trusted.
 */
export function readsSummaries(file: string): boolean {
  return GENERATOR_FILES.includes(file) || (GENERATOR_FOLDERS.some((folder) => file.startsWith(`${folder}/`)) && !file.endsWith(".test.ts"));
}

/**
 * The identity of the code that turns summaries into a sequence, as {@link generatorIdentity} is the identity of the
 * code that makes a summary: a hash of the generator's package version, of every file {@link readsSummaries} counts as
 * committed and of the tool dependency lock's {@link lockIdentity}, of their uncommitted changes, and of the runtime's version of Unicode,
 * which the order of names depends on. The commit it runs from is left out, as the lens leaves it out. Where the
 * generator is installed rather than run from a checkout, its version stands for its code. Added on 2026-11-20 for
 * the history command, which goes on from the sequence it wrote last only under the same identity.
 *
 * Since the independent review of that day it holds git's own version too (`git --version`): the steps carry git's
 * word on what each change renamed and touched, and another git, as in a container rebuilt, could give other words to
 * steps derived anew than those written.
 */
export async function sequenceCodeIdentity(): Promise<string> {
  const manifest = JSON.parse(await fs.readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8")) as { version: string };
  const checkout = await checkoutOf(PACKAGE_ROOT, readsSummaries);
  const identity = { version: manifest.version, code: checkout?.code ?? null, modified: checkout?.modified ?? null, unicode: process.versions.unicode ?? null, git: (await git(PACKAGE_ROOT, ["--version"])).trim() };
  return createHash("sha256").update(JSON.stringify(identity)).digest("hex").slice(0, 16);
}

/**
 * The keyed inputs of a checkout of this repository whose generator package stands at `packageRoot`, by the rule
 * `keyed`, or `undefined` where `packageRoot` is no such checkout's. Exported so that a test can compute it for a
 * repository of its own making.
 */
export async function checkoutOf(packageRoot: string, keyed: (file: string) => boolean): Promise<{ code: string; commit: string; modified: string | null } | undefined> {
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
    git(topLevel, ["ls-tree", "-r", "-z", "--full-tree", "HEAD", "--", ...GENERATOR_FOLDERS, ...GENERATOR_FILES]),
    git(topLevel, ["ls-tree", "HEAD", "--", TOOL_DEPENDENCY_LOCK])
  ]);
  // Each entry is `<mode> blob <id>\t<path>`.
  const files = tree.split("\0").filter((entry) => entry !== "" && keyed(entry.slice(entry.indexOf("\t") + 1)));
  const committedBlob = lockEntry === "" ? null : /^\d+ blob ([0-9a-f]+)\tpackage-lock\.json\r?\n$/u.exec(lockEntry)?.[1];
  if (committedBlob === undefined) throw new Error(`Cannot identify the committed ${TOOL_DEPENDENCY_LOCK} in ${topLevel}`);
  const committedText = committedBlob === null ? null : await git(topLevel, ["cat-file", "blob", committedBlob]);
  const committedLock = lockIdentity(committedText);
  const code = createHash("sha256").update(files.join("\n")).update("tool-lock\0").update(committedLock).digest("hex").slice(0, 16);
  // The working lock counts only where its keyed entries differ from the committed lock's, not wherever its bytes do.
  const workingBlob = await workingLockBlob(topLevel);
  const workingText = workingBlob === committedBlob ? committedText : workingBlob === null ? null : await fs.readFile(path.join(topLevel, TOOL_DEPENDENCY_LOCK), "utf8");
  const workingLock = workingBlob === committedBlob ? committedLock : lockIdentity(workingText);
  // The installation counts where npm's record of it differs from the working lock in a keyed entry (a pull without `npm ci`).
  const installed = installationDifference(workingText, await readIfPresent(path.join(topLevel, INSTALLATION_RECORD)));
  const changed = changedPaths(await git(topLevel, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...GENERATOR_FOLDERS, ...GENERATOR_FILES])).filter(keyed);
  if (changed.length === 0 && workingLock === committedLock && installed === null) {
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
  if (workingLock !== committedLock) hash.update("tool-lock\0").update(workingLock);
  if (installed !== null) hash.update("installed\0").update(installed);
  return { code, commit, modified: hash.digest("hex").slice(0, 16) };
}

/** A file's text, or `null` where it does not exist. */
async function readIfPresent(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
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
  return historyGit(["-C", cwd, ...args], { cwd });
}

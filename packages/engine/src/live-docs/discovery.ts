/**
 * File discovery and symbol indexing for Live Documentation.
 *
 * @remarks
 * This module handles discovering target files for Live Doc generation
 * and building the workspace-wide indexes: the symbols, for cross-file type
 * linking, and the entries manifests declare, for the `Entry` lines.
 *
 * @module
 */

import path from "node:path";
import ts from "typescript";

import type { LiveDocumentationConfig } from "../config/liveDocumentationConfig";
import { gitIgnores, gitIgnoresCase, liesInNoRepository, type GitIgnoreAnswer, type GitIgnores, type GitUnanswered } from "../tooling/gitIgnored";
import { fromGitignores, leaveOut, type LeaveOut, type LeaveOutInput } from "../tooling/leaveOut";
import { NODE_FILE_HOST } from "../tooling/nodeHost";
import { normalizeWorkspacePath } from "../tooling/pathUtils";
import { decodeSourceText, readSourceText, throwIfMachineFailure } from "../tooling/sourceText";
import type { FileHost, WorkspaceReads } from "../tooling/workspaceFiles";
import { walkWorkspace, type UnreadableFolder, type WalkedFile } from "../tooling/workspaceWalk";
import { analyzeWithLanguageAdapters, type WorkspaceFileIndex } from "./adapters";
import { matchesPathPattern } from "./archetype";
import { anchorReExports, computePublicSymbolHeadingInfo } from "./compose";
import { SUPPORTED_SCRIPT_EXTENSIONS } from "./coreConstants";
import type {
  DeclaredEntry,
  DependencyEntry,
  PublicSymbolEntry,
  ReExportedSymbolInfo,
  ResolvedSymbolLocation,
  TestFacts,
  WorkspaceEntryIndex,
  WorkspaceSymbolIndex,
  WorkspaceTestIndex
} from "./coreTypes";
import { collectDependencies, augmentWithReExportedSymbols } from "./dependencies";
import { detectChangedFiles } from "./gitUtils";
import { inferScriptKind, collectExportedSymbols } from "./symbolExtraction";

// ============================================================================
// Discovery Options
// ============================================================================

/** Options for discovering target source files and workspace documents. */
export interface DiscoverOptions {
  workspaceRoot: string;
  config: LiveDocumentationConfig;
  include: Set<string>;
  changedOnly: boolean;
  /** What discovery lists folders and reads `.gitignore` through; defaults to the Node disk host. */
  host?: FileHost;
  /** Optional shared per-run file reads so `.gitignore` is never read more than once in a scan. */
  reads?: WorkspaceReads;
  /**
   * Optional explicit leave-out pattern list (the owner's one list). When provided, it decides folder pruning and file
   * filtering directly on the host listing, bypassing git ignore rules.
   */
  leaveOut?: LeaveOutInput;
  /**
   * Told when the rule for no git judges what git should have: every file, where git could not be asked in the
   * repository that holds the workspace, or some, reached through a link that git does not ignore to a folder that is
   * not a repository's top, or in a folder holding a `.git` that git could not be asked about or said nothing of. Never
   * told of the files that lie in no repository, where the rule for no git is the rule.
   */
  warn?: (message: string) => void;
}

/** Result of {@link discoverWorkspaceTargetFiles}: the kept files and a predicate answering whether a path was left out. */
export interface DiscoveredTargets {
  files: string[];
  /** True when the scan's active leave-out, exclude, gitignore, or never-documented rules left this workspace-relative path out. */
  isLeftOut: (relativePath: string) => boolean;
}

// ============================================================================
// Root .gitignore Reading via Host + leaveOut.ts
// ============================================================================

/**
 * Reads the workspace's root `.gitignore` through the host (or the run's shared reads) and compiles it with
 * {@link fromGitignores} and {@link leaveOut}.
 *
 * @throws A read of `.gitignore` that fails for a cause of the machine's (a permission refused, too many open files):
 * read as no `.gitignore`, it would map what that file names (since 2026-11-20).
 */
async function loadRootGitignore(
  workspaceRoot: string,
  host: FileHost,
  reads: WorkspaceReads | undefined,
  ignoreCase: boolean,
  rootFiles: ReadonlySet<string> | undefined
): Promise<LeaveOut | null> {
  // When the root listing already showed no `.gitignore`, avoid a wasted host probe.
  if (rootFiles !== undefined && !rootFiles.has(".gitignore")) {
    return null;
  }
  const gitignorePath = path.join(workspaceRoot, ".gitignore");
  try {
    let text: string;
    if (reads) {
      const reading = await reads.readingOf(gitignorePath);
      text = reading.encoding === "unread" ? "" : reading.text;
    } else {
      const bytes = await host.read(gitignorePath);
      const reading = decodeSourceText(bytes);
      text = reading.encoding === "unread" ? "" : reading.text;
    }
    const taken = fromGitignores([{ path: ".gitignore", text }]);
    return leaveOut({ list: taken.lines.join("\n"), ignoreCase });
  } catch (error) {
    throwIfMachineFailure(error);
    // No `.gitignore`, or a name the disk cannot hold: nothing to ignore.
    return null;
  }
}

// ============================================================================
// File Discovery
// ============================================================================

/**
 * Dependency resolution files written by package and environment managers,
 * by name. Discovery keeps lock files outside the documented source set,
 * whatever the globs or an include name.
 */
const LOCK_FILE_NAMES: ReadonlySet<string> = new Set([
  "package-lock.json",
  "npm-shrinkwrap.json",
  "devcontainer-lock.json",
  ".devcontainer-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lock",
  "bun.lockb",
  "Cargo.lock",
  "composer.lock",
  "poetry.lock",
  "uv.lock",
  "Pipfile.lock",
  "Gemfile.lock",
  "Package.resolved",
  "packages.lock.json",
  ".terraform.lock.hcl",
  "Chart.lock",
  "pubspec.lock",
  "go.sum"
]);

/** The suffixes of documents, prose written for people to read: markdown, reStructuredText and AsciiDoc. */
const DOCUMENT_SUFFIXES: ReadonlySet<string> = new Set([".md", ".markdown", ".rst", ".adoc", ".asciidoc"]);

/**
 * The plain-text documents a repository conventionally holds, by name, with
 * no extension or `.txt`: a readme, a licence and its kin (`LICENSE-MIT`,
 * `COPYING`, `NOTICE`), a changelog, the authors, how to contribute. Anything
 * with another extension (`license.ts`, `readme-generator.ts`) is not one of them.
 */
const DOCUMENT_NAME = /^(?:readme|licen[cs]e|unlicense|copying|notice|changelog|authors|contributing)(?:[-_][a-z0-9-]+(?:\.[0-9]+)*)?(?:\.txt)?$/iu;

/**
 * True for a document: a file whose suffix says it is prose for people
 * ({@link DOCUMENT_SUFFIXES}), or a plain-text document by its conventional
 * name ({@link DOCUMENT_NAME}).
 */
function isDocument(name: string): boolean {
  const dot = name.lastIndexOf(".");
  return (dot > 0 && DOCUMENT_SUFFIXES.has(name.slice(dot).toLowerCase())) || DOCUMENT_NAME.test(name);
}

/**
 * True for a file no configuration can have documented. These are product
 * rules, applied to every match whether a configured glob or an include named
 * it, and nothing switches them off:
 *
 * - `.git` at any depth: the repository's own store.
 * - `node_modules` at any depth: installed packages, not the project's source.
 * - The configured docs root, where the generated docs and the graph index
 *   are written (`.live-documentation` by default): the generator never
 *   documents its own output.
 * - Lock files, by name: {@link LOCK_FILE_NAMES}.
 * - Documents ({@link isDocument}): a doc for a doc would only restate it.
 *   A document reaches the map as linked documentation instead, when a doc's
 *   authored words link to it. The owner: "I don't think we want to make a
 *   doc for a doc", and of licences, "they are docs and should be treated as
 *   such" (2026-10-22). Absolute for now, and expected to change as markdown
 *   becomes a program in its own right, an agent's `SKILL.md` or a prompt
 *   ("prompts as programs", the owner's words).
 *
 * @param relativePath - Workspace-relative path with forward slashes.
 * @param docsRoot - The configured docs root as a workspace-relative path, or `undefined` when it is not a folder within the workspace.
 */
function isNeverDocumented(relativePath: string, docsRoot: string | undefined): boolean {
  const segments = relativePath.split("/");
  if (segments.includes(".git") || segments.includes("node_modules")) {
    return true;
  }
  const name = segments[segments.length - 1];
  if (LOCK_FILE_NAMES.has(name) || isDocument(name)) {
    return true;
  }
  return docsRoot !== undefined && (relativePath === docsRoot || relativePath.startsWith(`${docsRoot}/`));
}

/**
 * The configured docs root as a workspace-relative path, however the
 * configuration spells it (`.mdmd`, `./.mdmd/`, an absolute path), or
 * `undefined` when it is not a folder within the workspace: the workspace
 * itself, or somewhere outside it.
 */
export function docsRootWithin(workspaceRoot: string, config: LiveDocumentationConfig): string | undefined {
  const relative = normalizeWorkspacePath(path.relative(workspaceRoot, path.resolve(workspaceRoot, config.root)));
  if (relative === "" || relative === ".." || relative.startsWith("../") || path.isAbsolute(relative)) {
    return undefined;
  }
  return relative;
}

/**
 * Locates workspace files that should receive Live Documentation generation.
 *
 * @remarks
 * The configured globs, or the include set when one is given, are matched
 * over the whole workspace in one walk, hidden files and folders included, so
 * that `.devcontainer/devcontainer.json` or `.vscode/settings.json` is read
 * like any other file; the folders that are never documented are not walked,
 * nor, where git can say so, the folders git ignores whole ({@link walkedAndKept}).
 * Then, in this order, the matches are dropped that are never documented
 * ({@link isNeverDocumented}: `.git`, `node_modules`, the docs root, lock
 * files, documents), that git ignores by its own word (a `.gitignore` at
 * any level, `.git/info/exclude` and the global excludes file, with a tracked
 * file never ignored: a file committed under an ignored folder is part of the
 * repository, as git itself holds; without git, the workspace's `.gitignore`
 * alone), and that the configuration's `exclude` names by path or glob. When
 * `options.changedOnly` is `true`, the result is intersected with the files
 * git marks as changed, for quick iterations over touched files.
 *
 * @param options.workspaceRoot - Absolute path to the repository root the CLI is operating in.
 * @param options.config - Live Documentation configuration describing default globs and overrides.
 * @param options.include - Optional override set limiting discovery to pre-selected relative paths.
 * @param options.changedOnly - When `true`, restricts results to files with local modifications.
 * @param options.warn - Told when git cannot judge some of the files found ({@link keptByGitAndConfiguration}).
 *
 * @see detectChangedFiles
 *
 * @returns A sorted array of absolute, workspace-resolved file paths ready for analysis.
 *
 * @example
 * ```ts
 * const files = await discoverTargetFiles({
 *   workspaceRoot,
 *   config,
 *   include: new Set(["packages/generator/src/generator.ts"]),
 *   changedOnly: false
 * });
 * ```
 */
export async function discoverWorkspaceTargetFiles(options: DiscoverOptions): Promise<DiscoveredTargets> {
  const patterns = options.include.size > 0 ? Array.from(options.include) : options.config.glob;
  const docsRoot = docsRootWithin(options.workspaceRoot, options.config);
  const { kept, isLeftOut } = await walkedAndKept({
    workspaceRoot: options.workspaceRoot,
    patterns,
    neverWalkedFolder: docsRoot,
    considers: (entry) => !isNeverDocumented(entry.relative, docsRoot),
    neverDocumented: (relative) => isNeverDocumented(relative, docsRoot),
    config: options.config,
    host: options.host ?? NODE_FILE_HOST,
    reads: options.reads,
    leaveOutInput: options.leaveOut,
    warn: options.warn
  });
  if (!options.changedOnly) {
    return { files: kept.map((entry) => entry.absolute), isLeftOut };
  }
  const changed = await detectChangedFiles(options.workspaceRoot);
  return {
    files: kept.filter((entry) => changed.has(entry.relative)).map((entry) => entry.absolute),
    isLeftOut
  };
}

/**
 * Locates workspace files that should receive Live Documentation generation, returning only the sorted absolute paths.
 *
 * @see discoverWorkspaceTargetFiles
 */
export async function discoverTargetFiles(options: DiscoverOptions): Promise<string[]> {
  return (await discoverWorkspaceTargetFiles(options)).files;
}

/**
 * The workspace's documents ({@link isDocument}), which never get a doc of
 * their own and reach the map as linked documentation instead: every one in
 * the workspace, whatever the configured globs name, since a doc's authored
 * words may link to a document anywhere and a document anywhere may link to a
 * file; held to the same rules as the files otherwise (what git ignores and
 * what the configuration's `exclude` names are left out), everywhere but
 * `.git`, `node_modules` and the generated docs themselves. The authored
 * documents a repository keeps beside its generated docs, under the docs root
 * but outside its base layer, are documents like any other. The generator
 * reads their links for the `Cited By` sections.
 *
 * @returns Workspace-relative paths with forward slashes, sorted.
 */
export async function discoverDocuments(options: Pick<DiscoverOptions, "workspaceRoot" | "config" | "host" | "reads" | "leaveOut" | "warn">): Promise<string[]> {
  const docsRoot = docsRootWithin(options.workspaceRoot, options.config);
  const baseLayer = docsRoot === undefined ? undefined : normalizeWorkspacePath(path.join(docsRoot, options.config.baseLayer));
  const { kept } = await walkedAndKept({
    workspaceRoot: options.workspaceRoot,
    patterns: ["**/*"],
    neverWalkedFolder: baseLayer,
    considers: (entry) => {
      const segments = entry.relative.split("/");
      return !segments.includes(".git") && !segments.includes("node_modules") && isDocument(segments[segments.length - 1]);
    },
    neverDocumented: () => false,
    config: options.config,
    host: options.host ?? NODE_FILE_HOST,
    reads: options.reads,
    leaveOutInput: options.leaveOut,
    warn: options.warn
  });
  return kept.map((entry) => entry.relative);
}

/** True when `relative` is `folder` itself or lies beneath `folder/`. */
function withinFolder(relative: string, folder: string | undefined): boolean {
  return folder !== undefined && (relative === folder || relative.startsWith(`${folder}/`));
}

/**
 * The files the patterns match that `considers` takes and the active leave-out / git / configuration rules keep,
 * found via a top-down walk over `host.entries()` that never enters ignored, excluded, or never-documented folders.
 */
async function walkedAndKept(args: {
  workspaceRoot: string;
  patterns: readonly string[];
  neverWalkedFolder: string | undefined;
  considers: (entry: WalkedFile) => boolean;
  neverDocumented: (relative: string) => boolean;
  config: LiveDocumentationConfig;
  host: FileHost;
  reads: WorkspaceReads | undefined;
  leaveOutInput: LeaveOutInput | undefined;
  warn?: (message: string) => void;
}): Promise<{ kept: WalkedFile[]; isLeftOut: (relativePath: string) => boolean }> {
  const { workspaceRoot, patterns, neverWalkedFolder, considers, neverDocumented, config, host, reads, leaveOutInput, warn } = args;

  // Explicit leave-out list path (the owner's one list): bypasses git completely and prunes folders before listing.
  if (leaveOutInput !== undefined) {
    const ownOutput = [...(leaveOutInput.ownOutput ?? []), ...(neverWalkedFolder !== undefined ? [neverWalkedFolder] : [])];
    const decider = leaveOut({ ...leaveOutInput, ownOutput });
    const ignoreCase = leaveOutInput.ignoreCase;
    const excluded = (relative: string): boolean => config.exclude.some((pattern) => matchesPathPattern(relative, pattern, ignoreCase));
    const excludedWhole = (folder: string): boolean =>
      folder !== "" && config.exclude.some((pattern) => [`${folder}/\0`, `${folder}/\0/\0`].every((probe) => matchesPathPattern(probe, pattern, ignoreCase)));
    const found = await walkWorkspace({
      workspaceRoot,
      host,
      patterns,
      shouldEnter: (relative) => {
        if (relative === "") return true;
        const name = relative.slice(relative.lastIndexOf("/") + 1);
        if (name === ".git" || name === "node_modules") return false;
        if (withinFolder(relative, neverWalkedFolder)) return false;
        if (decider.folder(relative).prunable) return false;
        if (excludedWhole(relative)) return false;
        return true;
      }
    });
    const blocked = found.unreadable.find(({ relative }) => decider.folder(relative).kept && !excludedWhole(relative));
    if (blocked) {
      throw new Error(`cannot read the folder ${blocked.absolute} (${blocked.error.message}), and the scan cannot tell that everything in it would be left out: make it readable, add ${blocked.relative}/ to the leave-out list, or name ${blocked.relative}/** in the configuration's exclude.`, { cause: blocked.error });
    }
    const kept = found.files.filter(considers).filter(({ relative }) => decider.file(relative).kept && !excluded(relative));
    const isLeftOut = (relative: string): boolean =>
      neverDocumented(relative) || excluded(relative) || !decider.file(relative).kept;
    return { kept, isLeftOut };
  }

  // Standard path: git when in a repository, else root `.gitignore` read through the host and judged by `leaveOut.ts`.
  const ignoreCase = (config.exclude.length > 0 || !liesInNoRepository(workspaceRoot)) && gitIgnoresCase(workspaceRoot);
  const excluded = (relative: string): boolean => config.exclude.some((pattern) => matchesPathPattern(relative, pattern, ignoreCase));
  const excludedWhole = (folder: string): boolean =>
    folder !== "" && config.exclude.some((pattern) => [`${folder}/\0`, `${folder}/\0/\0`].every((probe) => matchesPathPattern(probe, pattern, ignoreCase)));

  const doWalk = (unread: ReadonlySet<string> | undefined) => walkWorkspace({
    workspaceRoot,
    host,
    patterns,
    shouldEnter: (relative) => {
      if (unread?.has(relative)) return false;
      if (relative === "") return true;
      const name = relative.slice(relative.lastIndexOf("/") + 1);
      if (name === ".git" || name === "node_modules") return false;
      if (withinFolder(relative, neverWalkedFolder)) return false;
      if (excludedWhole(relative)) return false;
      return true;
    }
  });

  let unanswered: GitUnanswered | undefined;
  const told = (why: GitUnanswered): void => {
    unanswered = why;
  };
  const pruning = gitIgnores(workspaceRoot, told);
  let found = await doWalk(pruning?.folders);
  // Judged by a listing taken after the walk, so that a folder a build made while the walk ran is judged as git judges
  // it now. Where a folder left unread is not ignored whole by that listing, or it fails, the walk is made again with
  // that listing's folders unread, or whole, for the rule for no git.
  const judging = pruning && gitIgnores(workspaceRoot, told);
  const unread = [...(pruning?.folders ?? [])];
  if (unread.length > 0 && judging?.answer(unread).ignored.size !== unread.length) {
    found = await doWalk(judging?.folders);
  }
  if (!judging && unanswered) {
    warn?.(`git could not be asked what it ignores in ${workspaceRoot}${pruning ? " after the walk" : ""} (${unanswered.reason}): so only ${path.join(workspaceRoot, ".gitignore")} is read, by which a file the repository tracks may be left out, and what another .gitignore, .git/info/exclude or the global excludes hide gets docs; mend git, or name it in the configuration's exclude.`);
  }
  return keptByGitAndConfiguration({
    considered: found.files.filter(considers),
    unreadable: found.unreadable,
    rootFiles: found.rootFiles,
    workspaceRoot,
    host,
    reads,
    ignoreCase,
    excluded,
    excludedWhole,
    neverDocumented,
    gitIgnoresHere: judging,
    warn
  });
}

/**
 * Files in the order of their workspace-relative paths with forward slashes, by UTF-16 code unit, whatever the platform
 * spells their absolute paths with: on Windows a backslash sorts after the digits and the capitals, where a slash sorts
 * before them, so an order of absolute paths put `Shop.Data2\` before `Shop.Data\`, the reverse of Linux. The order is
 * the one in which files register their symbols, so it must not depend on the platform.
 */
export function inWorkspaceOrder<T extends { relative: string }>(files: T[]): T[] {
  return files.sort((a, b) => (a.relative < b.relative ? -1 : a.relative > b.relative ? 1 : 0));
}

async function keptByGitAndConfiguration(args: {
  considered: readonly WalkedFile[];
  unreadable: readonly UnreadableFolder[];
  rootFiles: ReadonlySet<string> | undefined;
  workspaceRoot: string;
  host: FileHost;
  reads: WorkspaceReads | undefined;
  ignoreCase: boolean;
  excluded: (relative: string) => boolean;
  excludedWhole: (folder: string) => boolean;
  neverDocumented: (relative: string) => boolean;
  gitIgnoresHere: GitIgnores | null;
  warn?: (message: string) => void;
}): Promise<{ kept: WalkedFile[]; isLeftOut: (relativePath: string) => boolean }> {
  const { considered, unreadable, rootFiles, workspaceRoot, host, reads, ignoreCase, excluded, excludedWhole, neverDocumented, gitIgnoresHere, warn } = args;
  const git = gitIgnoresHere?.answer(considered.map((entry) => entry.relative)) ?? null;
  if (git !== null && git.unjudged.size > 0) {
    const [first] = git.unjudged;
    warn?.(`git cannot say what it ignores of ${git.unjudged.size} file(s), such as ${first}, reached through a link to a folder that is not a repository's top, which git does not follow, or in a folder holding a .git that git could not be asked about: for them only ${path.join(workspaceRoot, ".gitignore")} is read, so a file their repository ignores may get a doc, and a file their repository tracks may be left out; name it in the configuration's exclude.`);
  }
  const folders = gitIgnoresHere?.answer(unreadable.map((entry) => entry.relative)) ?? null;
  const byRootRules = (answer: GitIgnoreAnswer | null): boolean => answer === null || answer.unjudged.size > 0 || answer.outside.size > 0;
  const rootLeaveOut = byRootRules(git) || (unreadable.length > 0 && byRootRules(folders))
    ? await loadRootGitignore(workspaceRoot, host, reads, ignoreCase, rootFiles)
    : null;
  const ignored = (answer: GitIgnoreAnswer | null, relative: string, folder: boolean): boolean =>
    answer !== null && !answer.unjudged.has(relative) && !answer.outside.has(relative)
      ? answer.ignored.has(relative)
      : rootLeaveOut !== null && !(folder ? rootLeaveOut.folder(relative).kept : rootLeaveOut.file(relative).kept);
  const blocked = unreadable.find(({ relative }) => !ignored(folders, relative, true) && !excludedWhole(relative));
  if (blocked) {
    throw new Error(`cannot read the folder ${blocked.absolute} (${blocked.error.message}), and the scan cannot tell that everything in it would be left out: make it readable, have git ignore the folder itself (${blocked.relative}/), or name ${blocked.relative}/** in the configuration's exclude.`, { cause: blocked.error });
  }
  const kept = considered.filter(({ relative }) => !ignored(git, relative, false) && !excluded(relative));
  const isLeftOut = (relative: string): boolean => {
    if (neverDocumented(relative) || excluded(relative)) return true;
    if (gitIgnoresHere !== null) {
      const verdict = gitIgnoresHere.answer([relative]);
      if (!verdict.unjudged.has(relative) && !verdict.outside.has(relative)) return verdict.ignored.has(relative);
    }
    return rootLeaveOut !== null && !rootLeaveOut.file(relative).kept;
  };
  return { kept, isLeftOut };
}

// ============================================================================
// Index Building
// ============================================================================

/** The indexes the first pass builds: the symbols every file publishes, the files manifests declare as entries, and what readers say exists for the tests. */
export interface WorkspaceIndexes {
  symbols: WorkspaceSymbolIndex;
  entries: WorkspaceEntryIndex;
  /** The readers' facts of which files exist for the tests, for the archetype's rules of tests (`archetype.ts`). */
  tests: WorkspaceTestIndex;
  /**
   * The files whose reading threw in this pass, by absolute path, with what was thrown: none of their symbols is in the
   * index, so the generator names each as a file it could not map, with that error, which the history reads as the
   * machine's or the file's as it reads any other (2026-11-20).
   */
  unmapped: Map<string, unknown>;
}

/**
 * Builds the workspace-wide indexes for cross-Live-Doc resolution in one pass
 * over the target files.
 *
 * @remarks
 * The symbol index maps each exported symbol's name (case-sensitive) to its
 * locations, so that a type reference in one Live Doc links to the type's
 * definition in another; several files may publish one name. The entry index
 * maps each file a manifest declares as an entry (a script it runs, a binary,
 * its main module) to what declares it, so that the file's doc carries the
 * `Entry` line. The test index gathers what readers say exists for the tests
 * where no path shows it (each .NET project and whether it is a test project,
 * Rust's modules compiled for the tests alone, the scripts that create the
 * procedures of a tSQLt test class), so that the file's doc carries its
 * `Archetype` by its language's rule of tests. TypeScript and JavaScript files
 * are read with the built-in parser; every other file is read by its language
 * adapter.
 *
 * Whatever a file throws while it is read, a failure of the machine's (too
 * many open files) or a stack run short, leaves its symbols out and names it in
 * `unmapped` with the error, which the generator carries to its list of files
 * it could not map, as it does a throw of its own per-file pass: there a
 * person's run names the file and goes on, and the history publishes no summary
 * made with a failure of the machine's. Until 2026-11-20 every throw was
 * swallowed, and a symbol whose file failed here was linked to the barrel that
 * re-exports it, with no mark and no warning.
 *
 * @param options.targetFiles - Absolute paths to all files being processed.
 * @param options.workspaceRoot - Absolute path to the workspace root.
 * @param options.liveDocsRoot - Workspace-relative path to the Live Docs root (e.g., ".live-documentation/source").
 * @param options.docExtension - File extension for Live Docs (e.g., ".md").
 * @param options.fileIndex - The workspace file index, for the adapters that resolve string references.
 */
export async function buildWorkspaceIndexes(options: {
  targetFiles: string[];
  workspaceRoot: string;
  liveDocsRoot: string;
  docExtension: string;
  fileIndex?: WorkspaceFileIndex;
}): Promise<WorkspaceIndexes> {
  const index: WorkspaceSymbolIndex = new Map();
  const entries: WorkspaceEntryIndex = new Map();
  const unmapped = new Map<string, unknown>();
  const tests: WorkspaceTestIndex = { projects: new Map(), files: new Set() };
  const testClasses = new Set<string>();
  const testProcedures: Array<{ sourcePath: string; schemas: string[] }> = [];

  const register = (name: string, location: ResolvedSymbolLocation): void => {
    const existing = index.get(name) ?? [];
    existing.push(location);
    index.set(name, existing);
  };

  for (const absolutePath of options.targetFiles) {
    const sourcePath = normalizeWorkspacePath(
      path.relative(options.workspaceRoot, absolutePath)
    );

    // Compute the Live Doc path for this source file
    const liveDocPath = normalizeWorkspacePath(
      path.join(options.liveDocsRoot, `${sourcePath}${options.docExtension}`)
    );

    // Try to extract symbols from the file
    let symbols: PublicSymbolEntry[] = [];
    let declares: DeclaredEntry[] = [];
    let reExports: ReExportedSymbolInfo[] = [];
    let exportDependencies: DependencyEntry[] = [];
    let testFacts: TestFacts | undefined;
    try {
      const ext = path.extname(absolutePath).toLowerCase();

      // Process JavaScript/TypeScript files with the built-in TypeScript parser
      if (SUPPORTED_SCRIPT_EXTENSIONS.has(ext)) {
        const content = await readSourceText(absolutePath, options.fileIndex);
        const scriptKind = inferScriptKind(ext);
        const sourceFile = ts.createSourceFile(
          absolutePath,
          content,
          ts.ScriptTarget.Latest,
          true,
          scriptKind
        );
        symbols = collectExportedSymbols(sourceFile);
        // Preserve providers named by export syntax; bare star exports also publish the peer resolver's anchors.
        if (sourceFile.statements.some((statement) => ts.isExportDeclaration(statement) && statement.moduleSpecifier)) {
          exportDependencies = (await collectDependencies({ sourceFile, absolutePath, workspaceRoot: options.workspaceRoot, files: options.fileIndex }))
            .filter(dependency => dependency.kind === "export");
          if (exportDependencies.some(dependency => dependency.reExportAll)) {
            ({ reExports } = await augmentWithReExportedSymbols({
              sourceAbsolute: absolutePath,
              workspaceRoot: options.workspaceRoot,
              dependencies: exportDependencies,
              existingSymbols: symbols,
              reads: options.fileIndex
            }));
          }
        }
      } else {
        // Try language-specific adapters for other file types (C#, Java, Python, etc.)
        const adapterResult = await analyzeWithLanguageAdapters({
          absolutePath,
          workspaceRoot: options.workspaceRoot,
          fileIndex: options.fileIndex
        });
        if (adapterResult) {
          symbols = adapterResult.symbols;
          declares = adapterResult.declares ?? [];
          testFacts = adapterResult.tests;
        }
      }
    } catch (error) {
      unmapped.set(absolutePath, error);
      continue;
    }

    for (const declared of declares) {
      const by = entries.get(declared.file) ?? [];
      by.push({ declarer: sourcePath, reason: declared.reason, ...(declared.name !== undefined ? { name: declared.name } : {}) });
      entries.set(declared.file, by);
    }

    if (testFacts?.project) tests.projects.set(testFacts.project.folder, testFacts.project.test);
    for (const file of testFacts?.files ?? []) tests.files.add(file);
    for (const schema of testFacts?.testClasses ?? []) testClasses.add(schema);
    if (testFacts?.testProcedureSchemas?.length) testProcedures.push({ sourcePath, schemas: testFacts.testProcedureSchemas });

    // Compute heading info for proper anchor slugs
    const headings = computePublicSymbolHeadingInfo(symbols);

    // Register each symbol in the index
    for (const heading of headings) {
      const symbol = heading.symbol;
      const provider = symbol.isReExport ? exportDependencies.find(dependency => dependency.symbols.includes(symbol.name)) : undefined;
      const location: ResolvedSymbolLocation = {
        liveDocPath,
        sourcePath,
        anchor: heading.slug,
        kind: symbol.kind,
        ...(symbol.location ? { line: symbol.location.line } : {}),
        ...(symbol.isReExport ? { isReExport: true } : {}),
        ...(provider?.resolvedPath ? { reExport: {
          sourcePath: provider.resolvedPath,
          exportedName: provider.symbolTargets?.[symbol.name] ?? symbol.name
        } } : {})
      };

      // Register by primary name
      register(symbol.name, location);
      if (symbol.isDefault && symbol.name !== "default") register("default", location);

      // Also register by qualified name if different
      if (symbol.qualifiedName && symbol.qualifiedName !== symbol.name) {
        register(symbol.qualifiedName, location);
      }
    }
    // Anchored as the doc's `Re-Exported Symbol Anchors` section anchors them, two that one anchor would name told apart.
    for (const { entry, slug } of anchorReExports(reExports, headings)) {
      register(entry.name, { liveDocPath, sourcePath, anchor: slug, kind: entry.kind, isReExport: true,
        ...(entry.sourceModulePath ? { reExport: { sourcePath: entry.sourceModulePath, exportedName: entry.name } } : {}) });
    }
  }

  // A script that creates a `test…` procedure in a schema some script of the workspace makes a tSQLt test class holds
  // tests: the class may be made in another script than its procedures.
  for (const { sourcePath, schemas } of testProcedures) {
    if (schemas.some((schema) => testClasses.has(schema))) tests.files.add(sourcePath);
  }

  return { symbols: index, entries, tests, unmapped };
}

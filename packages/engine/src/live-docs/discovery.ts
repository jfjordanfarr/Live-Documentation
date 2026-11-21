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

import { glob } from "glob";
import ignore, { type Ignore } from "ignore";
import * as fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

import type { LiveDocumentationConfig } from "../config/liveDocumentationConfig";
import { foldersReadAsEmpty, gitIgnores, gitIgnoresCase, type GitIgnoreAnswer, type GitIgnores, type GitUnanswered } from "../tooling/gitIgnored";
import { normalizeWorkspacePath } from "../tooling/pathUtils";
import { readSourceText, throwIfMachineFailure } from "../tooling/sourceText";
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
import { machineFailure } from "./processMark";
import { inferScriptKind, collectExportedSymbols } from "./symbolExtraction";

// ============================================================================
// Discovery Options
// ============================================================================

interface DiscoverOptions {
  workspaceRoot: string;
  config: LiveDocumentationConfig;
  include: Set<string>;
  changedOnly: boolean;
  /**
   * Told when the rule for no git judges what git should have: every file, where git could not be asked in the
   * repository that holds the workspace, or some, reached through a link that git does not ignore to a folder that is
   * not a repository's top, or in a folder holding a `.git` that git could not be asked about or said nothing of. Never
   * told of the files that lie in no repository, where the rule for no git is the rule.
   */
  warn?: (message: string) => void;
}

// ============================================================================
// Gitignore Filtering
// ============================================================================

/**
 * Creates an `ignore` instance seeded with the workspace's `.gitignore` patterns.
 *
 * @param workspaceRoot - Absolute path to the repository root.
 * @returns An `Ignore` instance if `.gitignore` exists, or `null` if there is none.
 * @throws A read of `.gitignore` that fails for a cause of the machine's (a permission refused, too many open files):
 * read as no `.gitignore`, it would map what that file names (since 2026-11-20).
 */
async function createGitignoreFilter(workspaceRoot: string): Promise<Ignore | null> {
  const gitignorePath = path.join(workspaceRoot, ".gitignore");
  try {
    const content = await fs.readFile(gitignorePath, "utf-8");
    const ig = ignore();
    ig.add(content);
    return ig;
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
export async function discoverTargetFiles(options: DiscoverOptions): Promise<string[]> {
  const patterns = options.include.size > 0 ? Array.from(options.include) : options.config.glob;
  const docsRoot = docsRootWithin(options.workspaceRoot, options.config);
  // Not walked at all: what isNeverDocumented would drop file by file, `node_modules` above all.
  const kept = await walkedAndKept(options.workspaceRoot, patterns, docsRoot !== undefined ? [`${docsRoot}/**`] : [],
    (entry) => !isNeverDocumented(entry.relative, docsRoot), options.config, options.warn);
  if (!options.changedOnly) {
    return kept.map((entry) => entry.absolute);
  }
  const changed = await detectChangedFiles(options.workspaceRoot);
  return kept.filter((entry) => changed.has(entry.relative)).map((entry) => entry.absolute);
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
export async function discoverDocuments(options: Pick<DiscoverOptions, "workspaceRoot" | "config" | "warn">): Promise<string[]> {
  const docsRoot = docsRootWithin(options.workspaceRoot, options.config);
  const baseLayer = docsRoot === undefined ? undefined : normalizeWorkspacePath(path.join(docsRoot, options.config.baseLayer));
  const kept = await walkedAndKept(options.workspaceRoot, ["**/*"], baseLayer !== undefined ? [`${baseLayer}/**`] : [], (entry) => {
    const segments = entry.relative.split("/");
    return !segments.includes(".git") && !segments.includes("node_modules") && isDocument(segments[segments.length - 1]);
  }, options.config, options.warn);
  return kept.map((entry) => entry.relative);
}

/**
 * The files the patterns match that `considers` takes and git and the configuration keep
 * ({@link keptByGitAndConfiguration}), found without reading the folders git ignores whole.
 *
 * @remarks
 * Until 2026-11-20 the walk read every folder git ignores, file by file, only for the filter to throw each file away:
 * in the main checkout, with its builders' worktrees under `.claude/worktrees/`, the walk of the files took 64 s where
 * a clean worktree took 1.4 s, as a repository's `bin/`, `obj/`, `target/` or `.venv/` costs every scan. Now git is
 * asked for what it ignores ({@link gitIgnores}) before the walk, which reads the folders it ignores whole as empty,
 * and again after it, to judge the files found as git judges them once the walk is done: a folder a build makes
 * during the walk is walked and then judged ignored, as it was before the walk was shortened. Where a folder the first
 * listing left unread is not ignored whole by the second (a file in it tracked during the walk), the walk is made again
 * by the second, so that no file is lost because its folder was left unwalked (2026-11-20). Where git cannot answer,
 * the walk is whole and the rule for no git judges it, and the run is told. The measurements and every case, each held
 * by a test: the probe of 2026-11-20 under `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`.
 */
async function walkedAndKept(
  workspaceRoot: string,
  patterns: readonly string[],
  neverWalked: readonly string[],
  considers: (entry: WalkedFile) => boolean,
  config: LiveDocumentationConfig,
  warn?: (message: string) => void
): Promise<WalkedFile[]> {
  let unanswered: GitUnanswered | undefined;
  const told = (why: GitUnanswered): void => {
    unanswered = why;
  };
  const pruning = gitIgnores(workspaceRoot, told);
  let found = await walk(workspaceRoot, patterns, neverWalked, pruning?.folders);
  // Judged by a listing taken after the walk, so that a folder a build made while the walk ran is judged as git judges
  // it now. Where a folder left unread is not ignored whole by that listing, or it fails, the walk is made again with
  // that listing's folders unread, or whole, for the rule for no git.
  const judging = pruning && gitIgnores(workspaceRoot, told);
  const unread = [...(pruning?.folders ?? [])];
  if (unread.length > 0 && judging?.answer(unread).ignored.size !== unread.length) found = await walk(workspaceRoot, patterns, neverWalked, judging?.folders);
  if (!judging && unanswered) {
    warn?.(`git could not be asked what it ignores in ${workspaceRoot}${pruning ? " after the walk" : ""} (${unanswered.reason}): so only ${path.join(workspaceRoot, ".gitignore")} is read, by which a file the repository tracks may be left out, and what another .gitignore, .git/info/exclude or the global excludes hide gets docs; mend git, or name it in the configuration's exclude.`);
  }
  return keptByGitAndConfiguration(found.files.filter(considers), found.unreadable, workspaceRoot, config, judging, warn);
}

/** A file the walk found: its absolute path and its workspace-relative path with forward slashes. */
interface WalkedFile {
  absolute: string;
  relative: string;
}

/** A folder the walk could not read for a cause of the machine's: its paths, and the failure. */
interface UnreadableFolder extends WalkedFile {
  error: NodeJS.ErrnoException;
}

/**
 * One walk of the workspace: the patterns matched over the whole of it, hidden
 * files and folders included, so that `.devcontainer/devcontainer.json` or
 * `.vscode/settings.json` is read like any other file; `.git`, `node_modules`
 * and the folders named are not walked at all, and the folders in `unread`
 * read as empty ({@link foldersReadAsEmpty}) and are not read. A folder whose
 * read fails for a cause of the machine's is named in `unreadable`, for the
 * judging to pass it over where its files would have been left out, and else
 * to stop the scan: glob reads it as empty, and its files would be missing
 * from the scan, and their docs pruned as stale, in silence (2026-11-20).
 * Absence, and a link that loops or passes through a file, are the folder's
 * own answer, read as glob reads them.
 */
async function walk(workspaceRoot: string, patterns: readonly string[], neverWalked: readonly string[], unread: ReadonlySet<string> | undefined): Promise<{ files: WalkedFile[]; unreadable: UnreadableFolder[] }> {
  const unreadable: UnreadableFolder[] = [];
  const matches = await glob([...patterns], {
    cwd: workspaceRoot,
    nodir: true,
    withFileTypes: true,
    dot: true,
    windowsPathsNoEscape: true,
    ignore: ["**/.git/**", "**/node_modules/**", ...neverWalked],
    fs: foldersReadAsEmpty(workspaceRoot, unread ?? new Set(), (error) => {
      if (machineFailure(error) && error.code !== "ENOENT") {
        const absolute = path.resolve(workspaceRoot, error.path ?? "");
        unreadable.push({ absolute, relative: normalizeWorkspacePath(path.relative(workspaceRoot, absolute)), error });
      }
    })
  });
  const files: WalkedFile[] = [];
  for (const match of matches) {
    const absolute = match.fullpath();
    // `nodir` excludes directory entries, but a symlink can still name a
    // directory. Read its target's kind without following directory links
    // during the walk. A link whose target is absent, loops (`loop -> loop`)
    // or passes through a file (`through -> file.ts/x`) leads to nothing to
    // document; until 2026-11-20 the last two stopped the whole walk. A
    // failure of the machine's is rethrown.
    if (match.isSymbolicLink()) {
      try {
        if (!(await fs.stat(absolute)).isFile()) continue;
      } catch (error) {
        throwIfMachineFailure(error);
        continue;
      }
    } else if (!match.isFile()) {
      continue;
    }
    files.push({ absolute, relative: normalizeWorkspacePath(path.relative(workspaceRoot, absolute)) });
  }
  return { files: inWorkspaceOrder(files), unreadable };
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

/**
 * The files git does not ignore and the configuration does not exclude, in
 * the order given. What git ignores is read by git's own word when the
 * workspace is a repository, from git's listing taken after the walk
 * ({@link gitIgnores}): a nested `.gitignore`, `.git/info/exclude` and the
 * global excludes file count, a tracked file is never ignored, as git itself
 * has it (committing a file under an ignored folder is a decision), and a
 * nested repository's files, one reached through a link to its top among
 * them, are judged by its own git, and so are a repository's files in a
 * workspace that lies in none, a folder of several clones. Without git, and
 * for the files that lie in no repository, the workspace's `.gitignore`
 * alone; and so too for a path git cannot judge, one that passes through a
 * link git does not ignore to a folder that is not a repository's top, or lies
 * in a folder holding a `.git` that git cannot be asked about or said nothing
 * of, which `warn` is told of, since there a file its repository ignores may
 * get a doc and one its repository tracks may be left out.
 *
 * A folder the walk could not read is judged by the same rules, as a folder:
 * where its files would have been left out (its own repository's git ignores
 * it, or `exclude` names everything in it) it is passed over in silence, as
 * they would have been, a database's unreadable volume beside the code among
 * them. Any other stops the scan, which is not to say its files would be kept:
 * git cannot read the folder either, so a rule for its contents (`cache/*`)
 * never names it, and the scan cannot tell. The error names the folder, the
 * system's reason and three ways past it that work: make it readable, have git
 * ignore the folder itself (`<folder>/`), or name `<folder>/**` in `exclude`,
 * which in the configuration's glob language names everything in it, where
 * `<folder>`, `<folder>/` and `<folder>/*` do not. It keeps the system's
 * failure as its cause, so that it is still read as the machine's (2026-11-20).
 */
async function keptByGitAndConfiguration(
  considered: readonly WalkedFile[],
  unreadable: readonly UnreadableFolder[],
  workspaceRoot: string,
  config: LiveDocumentationConfig,
  gitIgnoresHere: GitIgnores | null,
  warn?: (message: string) => void
): Promise<WalkedFile[]> {
  const git = gitIgnoresHere?.answer(considered.map((entry) => entry.relative)) ?? null;
  if (git !== null && git.unjudged.size > 0) {
    const [first] = git.unjudged;
    warn?.(`git cannot say what it ignores of ${git.unjudged.size} file(s), such as ${first}, reached through a link to a folder that is not a repository's top, which git does not follow, or in a folder holding a .git that git could not be asked about: for them only ${path.join(workspaceRoot, ".gitignore")} is read, so a file their repository ignores may get a doc, and a file their repository tracks may be left out; name it in the configuration's exclude.`);
  }
  const folders = gitIgnoresHere?.answer(unreadable.map((entry) => entry.relative)) ?? null;
  const byRootRules = (answer: GitIgnoreAnswer | null): boolean => answer === null || answer.unjudged.size > 0 || answer.outside.size > 0;
  const gitignoreFilter = byRootRules(git) || (unreadable.length > 0 && byRootRules(folders)) ? await createGitignoreFilter(workspaceRoot) : null;
  const ignored = (answer: GitIgnoreAnswer | null, relative: string, folder: boolean): boolean =>
    answer !== null && !answer.unjudged.has(relative) && !answer.outside.has(relative) ? answer.ignored.has(relative) : gitignoreFilter?.ignores(folder ? `${relative}/` : relative) === true;
  // `exclude` matches as git matches names in this repository: in any case where its `core.ignorecase` is true, as on
  // a clone made on Windows, else exactly (2026-11-19).
  const ignoreCase = config.exclude.length > 0 && gitIgnoresCase(workspaceRoot);
  const excluded = (relative: string): boolean => config.exclude.some((pattern) => matchesPathPattern(relative, pattern, ignoreCase));
  // A folder is excluded whole when a pattern matches every path below it: one segment and two, of a name no pattern holds.
  const excludedWhole = (folder: string): boolean => config.exclude.some((pattern) => [`${folder}/\0`, `${folder}/\0/\0`].every((probe) => matchesPathPattern(probe, pattern, ignoreCase)));
  const kept = unreadable.find(({ relative }) => !ignored(folders, relative, true) && !excludedWhole(relative));
  if (kept) {
    throw new Error(`cannot read the folder ${kept.absolute} (${kept.error.message}), and the scan cannot tell that everything in it would be left out: make it readable, have git ignore the folder itself (${kept.relative}/), or name ${kept.relative}/** in the configuration's exclude.`, { cause: kept.error });
  }
  return considered.filter(({ relative }) => !ignored(git, relative, false) && !excluded(relative));
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
        const content = await readSourceText(absolutePath);
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
          exportDependencies = (await collectDependencies({ sourceFile, absolutePath, workspaceRoot: options.workspaceRoot }))
            .filter(dependency => dependency.kind === "export");
          if (exportDependencies.some(dependency => dependency.reExportAll)) {
            ({ reExports } = await augmentWithReExportedSymbols({
              sourceAbsolute: absolutePath,
              workspaceRoot: options.workspaceRoot,
              dependencies: exportDependencies,
              existingSymbols: symbols
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

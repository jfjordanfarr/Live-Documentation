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

import { analyzeWithLanguageAdapters, type WorkspaceFileIndex } from "./adapters";
import { matchesPathPattern } from "./archetype";
import { computePublicSymbolHeadingInfo } from "./compose";
import { SUPPORTED_SCRIPT_EXTENSIONS } from "./coreConstants";
import type {
  DeclaredEntry,
  PublicSymbolEntry,
  ReExportedSymbolInfo,
  ResolvedSymbolLocation,
  WorkspaceEntryIndex,
  WorkspaceSymbolIndex
} from "./coreTypes";
import { createSymbolSlug } from "./coreUtils";
import { collectDependencies, augmentWithReExportedSymbols } from "./dependencies";
import { detectChangedFiles } from "./gitUtils";
import { inferScriptKind, collectExportedSymbols } from "./symbolExtraction";
import type { LiveDocumentationConfig } from "../config/liveDocumentationConfig";
import { gitIgnored } from "../tooling/gitIgnored";
import { normalizeWorkspacePath } from "../tooling/pathUtils";

// ============================================================================
// Discovery Options
// ============================================================================

interface DiscoverOptions {
  workspaceRoot: string;
  config: LiveDocumentationConfig;
  include: Set<string>;
  changedOnly: boolean;
}

// ============================================================================
// Gitignore Filtering
// ============================================================================

/**
 * Creates an `ignore` instance seeded with the workspace's `.gitignore` patterns.
 *
 * @param workspaceRoot - Absolute path to the repository root.
 * @returns An `Ignore` instance if `.gitignore` exists, or `null` if not found.
 */
async function createGitignoreFilter(workspaceRoot: string): Promise<Ignore | null> {
  const gitignorePath = path.join(workspaceRoot, ".gitignore");
  try {
    const content = await fs.readFile(gitignorePath, "utf-8");
    const ig = ignore();
    ig.add(content);
    return ig;
  } catch {
    // .gitignore does not exist or is unreadable
    return null;
  }
}

// ============================================================================
// File Discovery
// ============================================================================

/**
 * The files a package manager writes and no person edits, by name. A lock
 * file carries no authorial decision, so discovery never documents one,
 * whatever the globs or an include name.
 */
const LOCK_FILE_NAMES: ReadonlySet<string> = new Set([
  "package-lock.json",
  "npm-shrinkwrap.json",
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
function docsRootWithin(workspaceRoot: string, config: LiveDocumentationConfig): string | undefined {
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
 * like any other file; the folders that are never documented are not walked.
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
  const walked = await walk(options.workspaceRoot, patterns, docsRoot !== undefined ? [`${docsRoot}/**`] : []);
  const considered = walked.filter((entry) => !isNeverDocumented(entry.relative, docsRoot));
  const kept = await keptByGitAndConfiguration(considered, options.workspaceRoot, options.config);
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
export async function discoverDocuments(options: Pick<DiscoverOptions, "workspaceRoot" | "config">): Promise<string[]> {
  const docsRoot = docsRootWithin(options.workspaceRoot, options.config);
  const baseLayer = docsRoot === undefined ? undefined : normalizeWorkspacePath(path.join(docsRoot, options.config.baseLayer));
  const walked = await walk(options.workspaceRoot, ["**/*"], baseLayer !== undefined ? [`${baseLayer}/**`] : []);
  const considered = walked.filter((entry) => {
    const segments = entry.relative.split("/");
    return !segments.includes(".git") && !segments.includes("node_modules") && isDocument(segments[segments.length - 1]);
  });
  return (await keptByGitAndConfiguration(considered, options.workspaceRoot, options.config)).map((entry) => entry.relative);
}

/** A file the walk found: its absolute path and its workspace-relative path with forward slashes. */
interface WalkedFile {
  absolute: string;
  relative: string;
}

/**
 * One walk of the workspace: the patterns matched over the whole of it, hidden
 * files and folders included, so that `.devcontainer/devcontainer.json` or
 * `.vscode/settings.json` is read like any other file; `.git`, `node_modules`
 * and the folders named are not walked at all.
 */
async function walk(workspaceRoot: string, patterns: readonly string[], neverWalked: readonly string[]): Promise<WalkedFile[]> {
  const matches = await glob([...patterns], {
    cwd: workspaceRoot,
    absolute: true,
    nodir: true,
    dot: true,
    windowsPathsNoEscape: true,
    ignore: ["**/.git/**", "**/node_modules/**", ...neverWalked]
  });
  return matches.sort().map((match) => {
    const absolute = path.resolve(workspaceRoot, match);
    return { absolute, relative: normalizeWorkspacePath(path.relative(workspaceRoot, absolute)) };
  });
}

/**
 * The files git does not ignore and the configuration does not exclude, in
 * the order given. What git ignores is read by git's own word when the
 * workspace is a repository: a nested `.gitignore`, `.git/info/exclude` and
 * the global excludes file count, and a tracked file is never ignored, as git
 * itself has it (committing a file under an ignored folder is a decision).
 * Without git, the workspace's `.gitignore` alone.
 */
async function keptByGitAndConfiguration(considered: readonly WalkedFile[], workspaceRoot: string, config: LiveDocumentationConfig): Promise<WalkedFile[]> {
  const ignoredByGit = gitIgnored(workspaceRoot, considered.map((entry) => entry.relative));
  const gitignoreFilter = ignoredByGit ? null : await createGitignoreFilter(workspaceRoot);
  return considered.filter(({ relative }) => {
    if (ignoredByGit ? ignoredByGit.has(relative) : gitignoreFilter?.ignores(relative)) {
      return false;
    }
    return !config.exclude.some((pattern) => matchesPathPattern(relative, pattern));
  });
}

// ============================================================================
// Index Building
// ============================================================================

/** The two indexes the first pass builds: the symbols every file publishes, and the files manifests declare as entries. */
export interface WorkspaceIndexes {
  symbols: WorkspaceSymbolIndex;
  entries: WorkspaceEntryIndex;
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
 * `Entry` line. TypeScript and JavaScript files are read with the built-in
 * parser; every other file is read by its language adapter.
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
    try {
      const ext = path.extname(absolutePath).toLowerCase();

      // Process JavaScript/TypeScript files with the built-in TypeScript parser
      if (SUPPORTED_SCRIPT_EXTENSIONS.has(ext)) {
        const content = await fs.readFile(absolutePath, "utf8");
        const scriptKind = inferScriptKind(ext);
        const sourceFile = ts.createSourceFile(
          absolutePath,
          content,
          ts.ScriptTarget.Latest,
          true,
          scriptKind
        );
        symbols = collectExportedSymbols(sourceFile);
        // The doc's re-export section has anchors for bare star exports.
        // Index only files with that syntax, using the same resolver that renders those anchors.
        if (sourceFile.statements.some((statement) => ts.isExportDeclaration(statement) && statement.moduleSpecifier && !statement.exportClause)) {
          const dependencies = await collectDependencies({ sourceFile, absolutePath, workspaceRoot: options.workspaceRoot });
          ({ reExports } = await augmentWithReExportedSymbols({
            sourceAbsolute: absolutePath,
            workspaceRoot: options.workspaceRoot,
            dependencies,
            existingSymbols: symbols
          }));
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
        }
      }
    } catch {
      // Skip files that can't be read or parsed
      continue;
    }

    for (const declared of declares) {
      const by = entries.get(declared.file) ?? [];
      by.push({ declarer: sourcePath, reason: declared.reason, ...(declared.name !== undefined ? { name: declared.name } : {}) });
      entries.set(declared.file, by);
    }

    // Compute heading info for proper anchor slugs
    const headings = computePublicSymbolHeadingInfo(symbols);

    // Register each symbol in the index
    for (const heading of headings) {
      const symbol = heading.symbol;
      const location: ResolvedSymbolLocation = {
        liveDocPath,
        sourcePath,
        anchor: heading.slug,
        kind: symbol.kind,
        ...(symbol.isReExport ? { isReExport: true } : {})
      };

      // Register by primary name
      register(symbol.name, location);

      // Also register by qualified name if different
      if (symbol.qualifiedName && symbol.qualifiedName !== symbol.name) {
        register(symbol.qualifiedName, location);
      }
    }
    for (const entry of reExports) {
      const anchor = createSymbolSlug(entry.name);
      if (anchor) register(entry.name, { liveDocPath, sourcePath, anchor, kind: entry.kind, isReExport: true });
    }
  }

  return { symbols: index, entries };
}

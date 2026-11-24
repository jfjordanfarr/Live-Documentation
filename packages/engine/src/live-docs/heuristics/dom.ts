import ts from "typescript";

import path from "../../tooling/enginePath";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { readSourceText, type SourceReads, throwIfMachineFailure } from "../../tooling/sourceText";
import { folderChildren, type ListedFiles } from "../../tooling/workspaceProbes";
import { markupWithoutComments } from "../adapters/aspnet";
import type { DependencyEntry } from "../core";

interface DomDependencyParams {
  absolutePath: string;
  workspaceRoot: string;
  /** The parsed script, from which the calls are read, so that none a comment holds is. */
  sourceFile: ts.SourceFile;
  /** The files selected for this scan, with the run's reads of them; absent for standalone source analysis. */
  fileIndex?: ReadonlySet<string> & SourceReads & ListedFiles;
}

const CANDIDATE_EXTENSIONS = [".aspx", ".ascx", ".cshtml", ".razor", ".html"] as const;
const MAX_PARENT_ASCENT = 3;
const MAX_DIRECTORY_SCAN_DEPTH = 2;
const DESCENDABLE_DIRECTORY_NAMES = new Set([
  "pages",
  "views",
  "shared",
  "components",
  "partials",
  "wwwroot",
  "areas"
]);

type Extension = (typeof CANDIDATE_EXTENSIONS)[number];

type FileContentCache = Map<string, string | null>;

/**
 * Scans a code file for `document.getElementById` / `querySelector('#...')`
 * calls and attempts to locate nearby markup files (`.html`, `.cshtml`, etc.)
 * that define those DOM IDs, returning dependency entries. With a workspace
 * file index, only selected markup can become a dependency; without one,
 * standalone analysis keeps the nearby-file search. The calls are read from
 * the script's syntax tree and the ids from the markup with its comments
 * written over, so that neither is read inside a comment (the comment guard
 * of 2026-11-21, `commentGuard.test.ts`; until then both were patterns over
 * the raw text).
 */
export async function inferDomDependencies(params: DomDependencyParams): Promise<DependencyEntry[]> {
  const ids = collectSelectors(params.sourceFile);
  if (ids.size === 0) {
    return [];
  }

  const fileCache: FileContentCache = new Map();
  const nearbyFiles = gatherNearbyMarkupFiles(params.absolutePath, params.workspaceRoot, params.fileIndex);
  const fileIndex = params.fileIndex;
  const candidateFiles = fileIndex
    ? nearbyFiles.filter((absolute) => fileIndex.has(normalizeWorkspacePath(path.relative(params.workspaceRoot, absolute))))
    : nearbyFiles;
  const discovered = new Map<string, { entry: DependencyEntry; symbols: Set<string> }>();

  for (const elementId of ids) {
    const targets = await locateMarkupFilesForId({
      elementId,
      candidateFiles,
      workspaceRoot: params.workspaceRoot,
      fileCache,
      reads: fileIndex
    });

    for (const resolvedPath of targets) {
      const key = `${resolvedPath}`;
      const dependency: DependencyEntry = {
        specifier: resolvedPath,
        resolvedPath,
        symbols: [],
        kind: "import"
      };

      const bucket = discovered.get(key) ?? { entry: dependency, symbols: new Set<string>() };
      bucket.symbols.add(elementId);
      discovered.set(key, bucket);
    }
  }

  if (discovered.size === 0) {
    return [];
  }

  const dependencies: DependencyEntry[] = [];
  for (const bucket of discovered.values()) {
    if (bucket.symbols.size > 0) {
      bucket.entry.symbols = Array.from(bucket.symbols).sort();
    }
    dependencies.push(bucket.entry);
  }

  return dependencies;
}

/**
 * The ids the script asks the document for: the argument of each `document.getElementById(…)`, and of each
 * `document.querySelector("#…")` after its `#`, where the argument is a string written out (a literal, or a template
 * with no substitution), `document` being the name itself or a property of that name (`window.document`).
 */
function collectSelectors(sourceFile: ts.SourceFile): Set<string> {
  const ids = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && isDocument(node.expression.expression)) {
      const method = node.expression.name.text;
      const [argument] = node.arguments;
      const written = argument && ts.isStringLiteralLike(argument) ? argument.text : undefined;
      const candidate = written === undefined ? undefined
        : method === "getElementById" ? sanitiseId(written)
        : method === "querySelector" && written.startsWith("#") ? sanitiseId(written.slice(1))
        : undefined;
      if (candidate) {
        ids.add(candidate);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return ids;
}

function isDocument(node: ts.Expression): boolean {
  return (ts.isIdentifier(node) && node.text === "document") || (ts.isPropertyAccessExpression(node) && node.name.text === "document");
}

function sanitiseId(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed ? trimmed : undefined;
}

async function locateMarkupFilesForId(args: {
  elementId: string;
  candidateFiles: string[];
  workspaceRoot: string;
  fileCache: FileContentCache;
  reads: SourceReads | undefined;
}): Promise<string[]> {
  const matches: string[] = [];

  const searchPattern = buildAttributePattern(args.elementId);

  for (const absoluteFile of args.candidateFiles) {
    const content = await readFileCached(absoluteFile, args.fileCache, args.reads);
    if (!content) {
      continue;
    }

    if (!searchPattern.test(content)) {
      searchPattern.lastIndex = 0;
      continue;
    }

    searchPattern.lastIndex = 0;

    const relative = normalizeWorkspacePath(path.relative(args.workspaceRoot, absoluteFile));
    matches.push(relative);
  }

  return matches;
}

function gatherNearbyMarkupFiles(sourceFile: string, workspaceRoot: string, listed: ListedFiles | undefined): string[] {
  const directories = gatherCandidateDirectories(sourceFile, workspaceRoot);
  const files = new Set<string>();
  const visitedDirs = new Set<string>();
  const queue: Array<{ dir: string; depth: number }> = directories.map((dir) => ({
    dir,
    depth: 0
  }));

  while (queue.length > 0) {
    const { dir, depth } = queue.shift()!;
    if (visitedDirs.has(dir)) {
      continue;
    }
    visitedDirs.add(dir);

    // What the folder holds, from the run's listing (2026-11-22; before, the disk's own entries).
    const entries = folderChildren(dir, listed);
    if (!entries) {
      continue;
    }

    for (const name of entries.files) {
      const extension = path.extname(name).toLowerCase() as Extension;
      if (CANDIDATE_EXTENSIONS.includes(extension)) {
        files.add(path.join(dir, name));
      }
    }

    if (depth >= MAX_DIRECTORY_SCAN_DEPTH) {
      continue;
    }

    for (const name of entries.folders) {
      if (!shouldDescendIntoDirectory(name)) {
        continue;
      }

      queue.push({
        dir: path.join(dir, name),
        depth: depth + 1
      });
    }
  }

  return Array.from(files);
}

function shouldDescendIntoDirectory(directoryName: string): boolean {
  const normalized = directoryName.toLowerCase();
  if (normalized.startsWith(".")) {
    return false;
  }
  if (["node_modules", "dist", "build", "out", "bin", "obj"].includes(normalized)) {
    return false;
  }
  return DESCENDABLE_DIRECTORY_NAMES.has(normalized);
}

function gatherCandidateDirectories(sourceFile: string, workspaceRoot: string): string[] {
  const candidates: string[] = [];
  const workspaceAbsolute = path.resolve(workspaceRoot);
  let current = path.resolve(path.dirname(sourceFile));

  for (let depth = 0; depth <= MAX_PARENT_ASCENT; depth += 1) {
    if (current.startsWith(workspaceAbsolute)) {
      candidates.push(current);
    }

    if (current === workspaceAbsolute) {
      break;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return candidates;
}

function buildAttributePattern(elementId: string): RegExp {
  const escaped = escapeRegex(elementId);
  return new RegExp(`\\b(?:id|ID)\\s*=\\s*"${escaped}"`, "i");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** A markup file's text with its comments written over, so that an element a comment holds is no element; null when it cannot be read. */
async function readFileCached(filePath: string, cache: FileContentCache, reads: SourceReads | undefined): Promise<string | null> {
  if (cache.has(filePath)) {
    const cached = cache.get(filePath);
    return cached === undefined ? null : cached;
  }

  try {
    const content = markupWithoutComments(filePath, await readSourceText(filePath, reads));
    cache.set(filePath, content);
    return content;
  } catch (error) {
    throwIfMachineFailure(error);
    cache.set(filePath, null);
    return null;
  }
}

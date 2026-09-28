import type { Dirent } from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry } from "../core";

interface DomDependencyParams {
  absolutePath: string;
  workspaceRoot: string;
  content: string;
}

const DOM_ID_PATTERN = /document\.getElementById\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
const QUERY_SELECTOR_ID_PATTERN = /document\.querySelector\s*\(\s*["'`]#([^"'`]+)["'`]\s*\)/g;
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
 * that define those DOM IDs, returning dependency entries.
 */
export async function inferDomDependencies(params: DomDependencyParams): Promise<DependencyEntry[]> {
  const ids = collectSelectors(params.content);
  if (ids.size === 0) {
    return [];
  }

  const fileCache: FileContentCache = new Map();
  const candidateFiles = await gatherNearbyMarkupFiles(params.absolutePath, params.workspaceRoot);
  const discovered = new Map<string, { entry: DependencyEntry; symbols: Set<string> }>();

  for (const elementId of ids) {
    const targets = await locateMarkupFilesForId({
      elementId,
      candidateFiles,
      workspaceRoot: params.workspaceRoot,
      fileCache
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

function collectSelectors(content: string): Set<string> {
  const ids = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = DOM_ID_PATTERN.exec(content)) !== null) {
    const candidate = sanitiseId(match[1]);
    if (candidate) {
      ids.add(candidate);
    }
  }

  DOM_ID_PATTERN.lastIndex = 0;

  while ((match = QUERY_SELECTOR_ID_PATTERN.exec(content)) !== null) {
    const candidate = sanitiseId(match[1]);
    if (candidate) {
      ids.add(candidate);
    }
  }

  QUERY_SELECTOR_ID_PATTERN.lastIndex = 0;

  return ids;
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
}): Promise<string[]> {
  const matches: string[] = [];

  const searchPattern = buildAttributePattern(args.elementId);

  for (const absoluteFile of args.candidateFiles) {
    const content = await readFileCached(absoluteFile, args.fileCache);
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

async function gatherNearbyMarkupFiles(sourceFile: string, workspaceRoot: string): Promise<string[]> {
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

    const entries = await readDirectoryEntries(dir);
    if (!entries) {
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);

      if (entry.isFile()) {
        const extension = path.extname(entry.name).toLowerCase() as Extension;
        if (CANDIDATE_EXTENSIONS.includes(extension)) {
          files.add(entryPath);
        }
        continue;
      }

      if (!entry.isDirectory()) {
        continue;
      }

      if (depth >= MAX_DIRECTORY_SCAN_DEPTH) {
        continue;
      }

      if (!shouldDescendIntoDirectory(entry.name)) {
        continue;
      }

      queue.push({
        dir: entryPath,
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

async function readDirectoryEntries(dir: string): Promise<Dirent[] | null> {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }
}

async function readFileCached(filePath: string, cache: FileContentCache): Promise<string | null> {
  if (cache.has(filePath)) {
    const cached = cache.get(filePath);
    return cached === undefined ? null : cached;
  }

  try {
    const content = await fs.readFile(filePath, "utf8");
    cache.set(filePath, content);
    return content;
  } catch {
    cache.set(filePath, null);
    return null;
  }
}

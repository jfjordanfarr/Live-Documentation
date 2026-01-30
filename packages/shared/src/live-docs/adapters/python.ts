import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  TypeReference
} from "../core";
import type { LanguageAdapter } from "./index";
import { parseDocstring } from "./python.docstring";
import { PYTHON_STDLIB_MODULES } from "../../languages";

interface DependencyBucket {
  specifier: string;
  resolvedPath: string | undefined;
  symbols: Set<string>;
}

// Captures: [1] indent, [2] keyword, [3] name, [4] base classes (optional)
const TOP_LEVEL_PATTERN = /^([ \t]*)(async\s+def|def|class)\s+([A-Za-z_][A-Za-z0-9_]*)(?:\(([^)]+)\))?/;
const DECORATOR_PATTERN = /^\s*@/;

/**
 * Language adapter that extracts public symbols and docstring metadata from Python modules.
 *
 * @remarks
 * The adapter recognises reStructuredText, Google, and NumPy-style docstring conventions
 * to populate Live Doc summaries, parameter tables, and inline examples without relying
 * on Python runtime introspection.
 */
export const pythonAdapter: LanguageAdapter = {
  id: "python-basic",
  extensions: [".py"],
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols = extractSymbols(content);
    const dependencies = extractDependencies(content, absolutePath, workspaceRoot);

    if (symbols.length === 0 && dependencies.length === 0) {
      return {
        symbols: [],
        dependencies: []
      };
    }

    return {
      symbols,
      dependencies
    };
  }
};

function extractSymbols(content: string): PublicSymbolEntry[] {
  const lines = content.split(/\r?\n/);
  const results: PublicSymbolEntry[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (DECORATOR_PATTERN.test(line)) {
      continue;
    }

    const match = TOP_LEVEL_PATTERN.exec(line);
    TOP_LEVEL_PATTERN.lastIndex = 0;
    if (!match) {
      continue;
    }

    const indent = match[1] ?? "";
    if (indent.trim().length > 0) {
      continue;
    }

    const keyword = match[2];
    const name = match[3];
    const baseClasses = match[4];
    const kind = keyword.includes("class") ? "class" : "function";
    const docstring = extractDocstring(lines, index);
    const documentation = docstring ? parseDocstring(docstring) : undefined;

    // Extract type references from base classes for class definitions
    let typeReferences: TypeReference[] | undefined;
    if (kind === "class" && baseClasses) {
      const bases = baseClasses
        .split(",")
        .map(b => b.trim())
        .filter(b => b && !b.includes("=")) // Exclude keyword args like metaclass=
        .map(b => b.split("[")[0].trim()); // Strip generic params like List[int]
      
      if (bases.length > 0) {
        typeReferences = bases.map(baseName => ({
          name: baseName,
          role: "extends" as const
        }));
      }
    }

    results.push({
      name,
      kind,
      location: {
        line: index + 1,
        character: indent.length + 1
      },
      documentation,
      typeReferences
    } as PublicSymbolEntry);
  }

  results.sort((left, right) => {
    const lineDiff = (left.location?.line ?? 0) - (right.location?.line ?? 0);
    if (lineDiff !== 0) {
      return lineDiff;
    }
    const charDiff = (left.location?.character ?? 0) - (right.location?.character ?? 0);
    if (charDiff !== 0) {
      return charDiff;
    }
    return left.name.localeCompare(right.name);
  });

  return results;
}

function extractDocstring(lines: string[], definitionIndex: number): string | undefined {
  let cursor = definitionIndex + 1;
  while (cursor < lines.length) {
    const raw = lines[cursor];
    if (!raw.trim()) {
      cursor += 1;
      continue;
    }

    const trimmed = raw.trim();
    const quote = detectTripleQuote(trimmed);
    if (!quote) {
      return undefined;
    }

    const closingIndex = trimmed.indexOf(quote, quote.length);
    if (closingIndex >= 0) {
      const inner = trimmed.slice(quote.length, closingIndex);
      const normalizedInline = normalizeDocstring(inner);
      return normalizedInline || undefined;
    }

    const accumulator: string[] = [];
    accumulator.push(trimmed.slice(quote.length));
    cursor += 1;
    while (cursor < lines.length) {
      const candidate = lines[cursor];
      const closePos = candidate.indexOf(quote);
      if (closePos >= 0) {
        accumulator.push(candidate.slice(0, closePos));
        break;
      }
      accumulator.push(candidate);
      cursor += 1;
    }

    const normalized = normalizeDocstring(accumulator.join("\n"));
    return normalized || undefined;
  }

  return undefined;
}

function detectTripleQuote(candidate: string): string | undefined {
  if (candidate.startsWith('"""')) {
    return '"""';
  }
  if (candidate.startsWith("'''")) {
    return "'''";
  }
  return undefined;
}

function normalizeDocstring(raw: string): string {
  const replaced = raw.replace(/\r\n/g, "\n");
  const segments = replaced.split("\n");

  let start = 0;
  while (start < segments.length && !segments[start].trim()) {
    start += 1;
  }

  let end = segments.length - 1;
  while (end >= start && !segments[end].trim()) {
    end -= 1;
  }

  const sliced = segments.slice(start, end + 1);
  if (!sliced.length) {
    return "";
  }

  let minIndent = Infinity;
  for (const line of sliced.slice(1)) {
    if (!line.trim()) {
      continue;
    }
    const leading = line.match(/^\s+/);
    if (!leading) {
      minIndent = 0;
      break;
    }
    minIndent = Math.min(minIndent, leading[0].length);
  }

  if (!Number.isFinite(minIndent)) {
    minIndent = 0;
  }

  if (minIndent > 0) {
    for (let index = 1; index < sliced.length; index += 1) {
      const line = sliced[index];
      if (!line.trim()) {
        continue;
      }
      sliced[index] = line.slice(minIndent);
    }
  }

  return sliced.join("\n");
}

// ============================================================================
// Python Import Resolution
// ============================================================================

/**
 * Checks if a module name is a known standard library or common third-party package.
 *
 * @param moduleName - The top-level module name (e.g., "os", "typing", "dataclasses")
 * @returns True if the module is from the standard library or known third-party
 */
function isStdlibOrThirdParty(moduleName: string): boolean {
  const topLevel = moduleName.split(".")[0];
  return PYTHON_STDLIB_MODULES.has(topLevel);
}

/**
 * Resolves a Python import to a workspace-relative file path.
 *
 * @remarks
 * Python import resolution follows these patterns:
 * - `import util` → look for `util.py` or `util/__init__.py` in same directory
 * - `from util import func` → same resolution, symbol tracked separately
 * - `from .helpers import func` → relative import from current package
 * - `from ..utils import func` → relative import from parent package
 *
 * Standard library and known third-party modules are not resolved.
 *
 * @param moduleSpec - The module specifier (e.g., "util", ".helpers", "..utils")
 * @param absolutePath - Absolute path to the importing file
 * @param workspaceRoot - Workspace root for generating relative paths
 * @returns Workspace-relative path if resolved, undefined otherwise
 */
function resolvePythonImport(
  moduleSpec: string,
  absolutePath: string,
  workspaceRoot: string
): string | undefined {
  if (!moduleSpec) {
    return undefined;
  }

  // Check for relative import (starts with dots)
  const relativeMatch = moduleSpec.match(/^(\.+)(.*)$/);
  if (relativeMatch) {
    return resolveRelativeImport(relativeMatch[1], relativeMatch[2], absolutePath, workspaceRoot);
  }

  // Absolute import - check if it's stdlib/third-party first
  if (isStdlibOrThirdParty(moduleSpec)) {
    return undefined;
  }

  // Try to resolve as a local module
  return resolveLocalModule(moduleSpec, absolutePath, workspaceRoot);
}

/**
 * Resolves a relative Python import (one starting with dots).
 *
 * @param dots - The leading dots (e.g., ".", "..", "...")
 * @param remainder - The module path after the dots (e.g., "helpers", "utils.format")
 * @param absolutePath - Absolute path to the importing file
 * @param workspaceRoot - Workspace root for generating relative paths
 * @returns Workspace-relative path if resolved, undefined otherwise
 */
function resolveRelativeImport(
  dots: string,
  remainder: string,
  absolutePath: string,
  workspaceRoot: string
): string | undefined {
  const fileDir = path.dirname(absolutePath);
  const levels = dots.length;

  // Go up (levels - 1) directories from the current file's directory
  // One dot means current package, two dots means parent package, etc.
  let targetDir = fileDir;
  for (let i = 1; i < levels; i++) {
    targetDir = path.dirname(targetDir);
  }

  // If there's a remainder, resolve it as a module path
  if (remainder) {
    const parts = remainder.split(".");
    const modulePath = path.join(targetDir, ...parts);
    return probeModulePath(modulePath, workspaceRoot);
  }

  // Just dots with no remainder - refers to the package itself
  // Look for __init__.py in the target directory
  const initPath = path.join(targetDir, "__init__.py");
  if (existsSync(initPath)) {
    return path.relative(workspaceRoot, initPath).replace(/\\/g, "/");
  }

  return undefined;
}

/**
 * Resolves a local (non-relative, non-stdlib) module import.
 *
 * @param moduleSpec - The module specifier (e.g., "util", "package.submodule")
 * @param absolutePath - Absolute path to the importing file
 * @param workspaceRoot - Workspace root for generating relative paths
 * @returns Workspace-relative path if resolved, undefined otherwise
 */
function resolveLocalModule(
  moduleSpec: string,
  absolutePath: string,
  workspaceRoot: string
): string | undefined {
  const fileDir = path.dirname(absolutePath);
  const parts = moduleSpec.split(".");

  // For simple imports like "util", only take the first segment
  // (the remaining parts might be submodules or attributes)
  const moduleName = parts[0];

  // Try resolving from the current directory first
  const fromCurrentDir = probeModulePath(path.join(fileDir, moduleName), workspaceRoot);
  if (fromCurrentDir) {
    return fromCurrentDir;
  }

  // Try resolving from the package root (if we're in a package)
  const packageRoot = findPackageRoot(fileDir);
  if (packageRoot && packageRoot !== fileDir) {
    const fromPackageRoot = probeModulePath(path.join(packageRoot, moduleName), workspaceRoot);
    if (fromPackageRoot) {
      return fromPackageRoot;
    }
  }

  return undefined;
}

/**
 * Probes for a Python module at a given base path.
 *
 * @remarks
 * Checks for:
 * 1. `{basePath}.py` - single-file module
 * 2. `{basePath}/__init__.py` - package module
 *
 * @param basePath - Base path to probe (without extension)
 * @param workspaceRoot - Workspace root for generating relative paths
 * @returns Workspace-relative path if found, undefined otherwise
 */
function probeModulePath(basePath: string, workspaceRoot: string): string | undefined {
  // Try as single file module
  const asFile = `${basePath}.py`;
  if (existsSync(asFile)) {
    return path.relative(workspaceRoot, asFile).replace(/\\/g, "/");
  }

  // Try as package (directory with __init__.py)
  const asPackage = path.join(basePath, "__init__.py");
  if (existsSync(asPackage)) {
    return path.relative(workspaceRoot, asPackage).replace(/\\/g, "/");
  }

  return undefined;
}

/**
 * Finds the root of the Python package containing a given directory.
 *
 * @remarks
 * Walks up the directory tree looking for the topmost directory
 * that still contains an `__init__.py` file.
 *
 * @param startDir - Directory to start searching from
 * @returns Path to the package root, or undefined if not in a package
 */
function findPackageRoot(startDir: string): string | undefined {
  let currentDir = startDir;
  let packageRoot: string | undefined;

  // Walk up looking for __init__.py files
  while (currentDir && currentDir !== path.dirname(currentDir)) {
    const initPath = path.join(currentDir, "__init__.py");
    if (existsSync(initPath)) {
      packageRoot = currentDir;
      currentDir = path.dirname(currentDir);
    } else {
      // No more __init__.py, stop here
      break;
    }
  }

  return packageRoot;
}

// ============================================================================
// Dependency Extraction
// ============================================================================

/**
 * Extracts import dependencies from Python source code.
 *
 * @remarks
 * Handles both `import X` and `from X import Y` statements.
 * Resolves local modules to workspace-relative paths while leaving
 * standard library and third-party imports unresolved.
 *
 * @param content - Python source code content
 * @param absolutePath - Absolute path to the source file
 * @param workspaceRoot - Workspace root for path resolution
 * @returns Array of dependency entries
 */
function extractDependencies(
  content: string,
  absolutePath: string,
  workspaceRoot: string
): DependencyEntry[] {
  const lines = content.split(/\r?\n/);
  const dependencies = new Map<string, DependencyBucket>();

  /**
   * Registers a dependency with optional imported symbols.
   */
  const register = (
    specifier: string,
    resolvedPath: string | undefined,
    symbols: string[]
  ): void => {
    const normalized = specifier.trim();
    if (!normalized) {
      return;
    }

    const existing = dependencies.get(normalized);
    if (existing) {
      // Merge symbols into existing bucket
      for (const sym of symbols) {
        if (sym && sym.trim()) {
          existing.symbols.add(sym.trim());
        }
      }
      // Update resolvedPath if we now have one
      if (resolvedPath && !existing.resolvedPath) {
        existing.resolvedPath = resolvedPath;
      }
    } else {
      const symbolSet = new Set<string>();
      for (const sym of symbols) {
        if (sym && sym.trim()) {
          symbolSet.add(sym.trim());
        }
      }
      dependencies.set(normalized, {
        specifier: normalized,
        resolvedPath,
        symbols: symbolSet
      });
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Handle: import module1, module2 as alias, module3
    if (trimmed.startsWith("import ")) {
      const remainder = trimmed.slice("import ".length);
      const modules = remainder.split(",").map((segment) => {
        // Handle "module as alias" - extract original module name
        return segment.split(/\s+as\s+/)[0]?.trim();
      });

      for (const moduleName of modules) {
        if (!moduleName) {
          continue;
        }
        const resolvedPath = resolvePythonImport(moduleName, absolutePath, workspaceRoot);
        register(moduleName, resolvedPath, []);
      }
      continue;
    }

    // Handle: from module import name1, name2 as alias, name3
    if (trimmed.startsWith("from ")) {
      const fromMatch = /^from\s+([.\w]+)\s+import\s+(.+)$/.exec(trimmed);
      if (!fromMatch) {
        continue;
      }

      const moduleSpec = fromMatch[1];
      const importSegment = fromMatch[2];

      // Parse imported names (handling aliases and wildcards)
      const rawNames = importSegment
        .split(",")
        .map((segment) => segment.split(/\s+as\s+/)[0]?.trim())
        .filter((name): name is string => Boolean(name && name.trim()));

      // Filter out wildcards - we can't know what symbols * imports
      const symbols = rawNames.filter((name) => name !== "*");

      // Resolve the module path
      const resolvedPath = resolvePythonImport(moduleSpec, absolutePath, workspaceRoot);

      // Register with the module specifier and imported symbols
      register(moduleSpec, resolvedPath, symbols);
    }
  }

  return Array.from(dependencies.values())
    .map<DependencyEntry>((bucket) => ({
      specifier: bucket.specifier,
      resolvedPath: bucket.resolvedPath,
      symbols: Array.from(bucket.symbols).sort(),
      kind: "import"
    }))
    .sort((left, right) => left.specifier.localeCompare(right.specifier));
}
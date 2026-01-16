import path from "node:path";

import { isImplementationLayer } from "./artifactLayerUtils";
import { isWithinComment } from "./shared";
import type { FallbackHeuristic, HeuristicArtifact, MatchContext } from "../fallbackHeuristicTypes";

/**
 * Matches a single-line Go import: import "module/path"
 * Captures: (1) the import path
 */
const GO_SINGLE_IMPORT_PATTERN = /^\s*import\s+"([^"]+)"/gm;

/**
 * Matches a grouped Go import block: import ( ... )
 * Captures: (1) the block content
 */
const GO_GROUPED_IMPORT_PATTERN = /^\s*import\s+\(([\s\S]*?)\)/gm;

/**
 * Matches individual import lines within a grouped import block.
 * Captures: (1) optional alias, (2) the import path
 */
const GO_IMPORT_LINE_PATTERN = /^\s*(?:([A-Za-z_][A-Za-z0-9_]*)\s+)?"([^"]+)"/gm;

// Note: GO_PACKAGE_PATTERN could be used in future to extract package names
// const GO_PACKAGE_PATTERN = /^\s*package\s+([A-Za-z_][A-Za-z0-9_]*)/m;

interface GoContext {
  /**
   * Maps package directory paths to their artifacts.
   * Go uses directory-based packages, so src/models/*.go are all in the same package.
   */
  packageIndex: Map<string, HeuristicArtifact[]>;
  
  /**
   * Maps module-relative import paths to package directories.
   * e.g., "rosetta/models" → "src/models"
   */
  importPathIndex: Map<string, string>;
  
  /**
   * The module name from go.mod (e.g., "rosetta").
   */
  moduleName: string | undefined;
  
  /**
   * The directory containing go.mod (or src root).
   */
  moduleRoot: string | undefined;
}

export function createGoHeuristic(): FallbackHeuristic {
  let context: GoContext = {
    packageIndex: new Map(),
    importPathIndex: new Map(),
    moduleName: undefined,
    moduleRoot: undefined,
  };

  return {
    id: "go-package-relationships",
    initialize(artifacts) {
      context = buildGoContext(artifacts);
    },
    appliesTo(source) {
      return (
        isImplementationLayer(source.artifact.layer) &&
        source.comparablePath.endsWith(".go")
      );
    },
    evaluate(source, emit) {
      if (!source.content) {
        return;
      }

      const seenTargets = new Set<string>();
      const importPaths = extractImportPaths(source.content);

      for (const importPath of importPaths) {
        // Skip stdlib packages (no dots, single segment, or starts with known stdlib prefixes)
        if (isStdlibPackage(importPath)) {
          continue;
        }

        const targets = resolveGoImportTargets(importPath, context, source);
        for (const target of targets) {
          if (seenTargets.has(target.artifact.id)) {
            continue;
          }
          
          // Skip self-references (files in the same package)
          const sourceDir = path.dirname(source.comparablePath);
          const targetDir = path.dirname(target.comparablePath);
          if (sourceDir === targetDir) {
            continue;
          }

          seenTargets.add(target.artifact.id);
          
          const matchContext: MatchContext = source.basename === "main.go" ? "import" : "use";
          emit({
            target,
            confidence: 0.7,
            rationale: `go import ${importPath}`,
            context: matchContext,
          });
        }
      }
    },
  };
}

function buildGoContext(artifacts: readonly HeuristicArtifact[]): GoContext {
  const packageIndex = new Map<string, HeuristicArtifact[]>();
  const importPathIndex = new Map<string, string>();
  let moduleName: string | undefined;
  let moduleRoot: string | undefined;

  // First pass: find go.mod to determine module name and root
  for (const artifact of artifacts) {
    if (artifact.basename === "go.mod" && artifact.content) {
      const match = artifact.content.match(/^module\s+(\S+)/m);
      if (match) {
        moduleName = match[1];
        moduleRoot = path.dirname(artifact.comparablePath);
      }
      break;
    }
  }

  // Second pass: index Go files by their package directory
  for (const artifact of artifacts) {
    if (!artifact.comparablePath.endsWith(".go")) {
      continue;
    }
    if (artifact.basename.endsWith("_test.go")) {
      continue;
    }

    const dir = path.dirname(artifact.comparablePath);
    let existing = packageIndex.get(dir);
    if (!existing) {
      existing = [];
      packageIndex.set(dir, existing);
    }
    existing.push(artifact);

    // Build import path index if we know the module
    if (moduleName && moduleRoot) {
      const relativePath = path.relative(moduleRoot, dir).replace(/\\/g, "/");
      const importPath = relativePath ? `${moduleName}/${relativePath}` : moduleName;
      importPathIndex.set(importPath, dir);
    }
  }

  return { packageIndex, importPathIndex, moduleName, moduleRoot };
}

function extractImportPaths(content: string): string[] {
  const paths: string[] = [];

  // Single imports: import "path"
  const singlePattern = new RegExp(GO_SINGLE_IMPORT_PATTERN.source, "gm");
  for (const match of content.matchAll(singlePattern)) {
    const importStart = match.index ?? 0;
    if (!isWithinComment(content, importStart)) {
      paths.push(match[1]);
    }
  }

  // Grouped imports: import ( "path1" "path2" )
  const groupedPattern = new RegExp(GO_GROUPED_IMPORT_PATTERN.source, "gm");
  for (const match of content.matchAll(groupedPattern)) {
    const blockStart = match.index ?? 0;
    if (isWithinComment(content, blockStart)) {
      continue;
    }

    const blockContent = match[1];
    const linePattern = new RegExp(GO_IMPORT_LINE_PATTERN.source, "gm");
    for (const lineMatch of blockContent.matchAll(linePattern)) {
      paths.push(lineMatch[2]);
    }
  }

  return paths;
}

function resolveGoImportTargets(
  importPath: string,
  context: GoContext,
  _source: HeuristicArtifact
): HeuristicArtifact[] {
  const targets: HeuristicArtifact[] = [];

  // Try direct import path lookup
  const dir = context.importPathIndex.get(importPath);
  if (dir) {
    const files = context.packageIndex.get(dir);
    if (files) {
      // Emit one representative file per package (the first alphabetically)
      const sorted = [...files].sort((a, b) => a.basename.localeCompare(b.basename));
      if (sorted.length > 0) {
        targets.push(sorted[0]);
      }
    }
    return targets;
  }

  // Fallback: try to match by package suffix
  const suffix = importPath.split("/").pop();
  if (suffix) {
    for (const [dir, files] of context.packageIndex) {
      const dirSuffix = path.basename(dir);
      if (dirSuffix === suffix) {
        const sorted = [...files].sort((a, b) => a.basename.localeCompare(b.basename));
        if (sorted.length > 0) {
          targets.push(sorted[0]);
        }
      }
    }
  }

  return targets;
}

/**
 * Determines if an import path is likely a Go standard library package.
 * Go stdlib packages are single-segment names without dots (e.g., "fmt", "os", "io").
 */
function isStdlibPackage(importPath: string): boolean {
  // Standard library packages don't contain dots and are typically single segment
  if (importPath.includes(".")) {
    return false;
  }

  // Well-known stdlib packages and prefixes
  const stdlibPrefixes = new Set([
    "archive", "bufio", "bytes", "compress", "container", "context",
    "crypto", "database", "debug", "embed", "encoding", "errors",
    "expvar", "flag", "fmt", "go", "hash", "html", "image", "index",
    "internal", "io", "log", "maps", "math", "mime", "net", "os",
    "path", "plugin", "reflect", "regexp", "runtime", "slices",
    "sort", "strconv", "strings", "sync", "syscall", "testing",
    "text", "time", "unicode", "unsafe",
  ]);

  const firstSegment = importPath.split("/")[0];
  return stdlibPrefixes.has(firstSegment);
}

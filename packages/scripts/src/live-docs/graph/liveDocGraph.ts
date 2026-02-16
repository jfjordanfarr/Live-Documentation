import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_FILE_EXTENSION,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";
import {
  parseLiveDocMarkdown,
  type ParsedDependency,
  type ParsedSymbolDocumentationEntry
} from "@live-documentation/shared/live-docs/parse";

/**
 * A single node in the Live Doc dependency graph, representing one tracked
 * workspace artifact and its extracted metadata.
 *
 * Nodes are keyed by `codePath` (workspace-relative source path) and carry
 * resolved dependency edges, public symbol names, and per-symbol documentation
 * extracted from the corresponding `.mdmd.md` file.
 */
export interface LiveDocGraphNode {
  codePath: string;
  docPath: string;
  archetype: string;
  dependencies: Set<string>;
  rawDependencies: ParsedDependency[];
  publicSymbols: string[];
  symbolDocumentation: Record<string, ParsedSymbolDocumentationEntry>;
}

/**
 * The complete Live Documentation dependency graph.
 *
 * Built by {@link buildLiveDocGraph}, this structure powers the Explorer
 * visualizations (Circuit Board, Force Graph, Local Map), the `inspect`
 * pathfinder CLI, and the lint disconnected-node check.
 *
 * - `nodes` — forward lookup by source path.
 * - `inbound` — reverse index: for a given target, which sources depend on it.
 * - `docToCode` — maps `.mdmd.md` doc paths back to their source paths.
 */
export interface LiveDocGraph {
  nodes: Map<string, LiveDocGraphNode>;
  inbound: Map<string, Set<string>>;
  docToCode: Map<string, string>;
}

/**
 * Options accepted by {@link buildLiveDocGraph}.
 *
 * @property workspaceRoot - Absolute path to the workspace root directory.
 * @property config - Optional resolved Live Docs config; defaults to
 *   {@link DEFAULT_LIVE_DOCUMENTATION_CONFIG} if omitted.
 */
export interface BuildLiveDocGraphOptions {
  workspaceRoot: string;
  config?: LiveDocumentationConfig;
}

interface ParsedDocEntry {
  codePath: string;
  docPath: string;
  archetype: string;
  dependencies: ParsedDependency[];
  publicSymbols: string[];
  symbolDocumentation: Record<string, ParsedSymbolDocumentationEntry>;
}

/**
 * Scans all staged Live Doc markdown files, parses their `Dependencies` and
 * `Public Symbols` sections, and assembles a complete dependency graph.
 *
 * The resulting {@link LiveDocGraph} is consumed by the Explorer server/static
 * builder, the `inspect` CLI pathfinder, and the lint pipeline's disconnected-
 * node check.
 *
 * @param options - Workspace root and optional config overrides.
 * @returns A fully-resolved graph with forward edges, reverse (inbound) index,
 *   and doc-to-code path mapping.
 */
export async function buildLiveDocGraph(options: BuildLiveDocGraphOptions): Promise<LiveDocGraph> {
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const config = normalizeLiveDocumentationConfig(
    options.config ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG
  );

  const docGlob = path.join(
    config.root,
    config.baseLayer,
    "**",
    `*${config.extension ?? LIVE_DOCUMENTATION_FILE_EXTENSION}`
  );

  const docPaths = await glob(docGlob, {
    cwd: workspaceRoot,
    absolute: true,
    nodir: true,
    windowsPathsNoEscape: true
  });

  const entries = new Map<string, ParsedDocEntry>();

  for (const absoluteDocPath of docPaths) {
    const content = await fs.readFile(absoluteDocPath, "utf8");
    const parsed = parseLiveDocMarkdown(content, absoluteDocPath, workspaceRoot, config);
    if (!parsed) {
      continue;
    }

    entries.set(parsed.sourcePath, {
      codePath: parsed.sourcePath,
      docPath: parsed.docPath,
      archetype: parsed.archetype,
      dependencies: parsed.dependencies,
      publicSymbols: parsed.publicSymbols,
      symbolDocumentation: parsed.symbolDocumentation
    });
  }

  const nodes = new Map<string, LiveDocGraphNode>();
  const inbound = new Map<string, Set<string>>();
  const docToCode = new Map<string, string>();

  for (const entry of entries.values()) {
    docToCode.set(entry.docPath, entry.codePath);
  }

  for (const entry of entries.values()) {
    const adjacency = new Set<string>();
    const typeRefDependencies: ParsedDependency[] = [];
    
    // Add explicit dependencies from the Dependencies section
    for (const candidate of entry.dependencies) {
      if (candidate.codePath && entries.has(candidate.codePath)) {
        adjacency.add(candidate.codePath);
      }
    }

    // Add type references (extends/implements) from Public Symbols as dependencies
    const docDir = path.dirname(entry.docPath);
    for (const [symbolName, symbolDoc] of Object.entries(entry.symbolDocumentation)) {
      if (!symbolDoc.typeReferences) {
        continue;
      }
      for (const typeRef of symbolDoc.typeReferences) {
        // Only include resolved type references that point to workspace files
        if (!typeRef.isResolved || !typeRef.targetDocPath) {
          continue;
        }
        // Resolve the relative target doc path to a workspace-relative path
        const resolvedDocPath = path.posix.normalize(
          path.posix.join(docDir.replace(/\\/g, "/"), typeRef.targetDocPath)
        );
        const targetCodePath = docToCode.get(resolvedDocPath);
        if (targetCodePath && entries.has(targetCodePath)) {
          adjacency.add(targetCodePath);
          // Also add to rawDependencies so the visualization picks it up
          typeRefDependencies.push({
            codePath: targetCodePath,
            docPath: resolvedDocPath,
            anchor: typeRef.targetAnchor,
            sourceAnchor: symbolName, // The symbol on this file that extends/implements/references the type
            label: `${typeRef.role}: ${typeRef.typeName}`,
            raw: `${symbolName} ${typeRef.role} ${typeRef.typeName}`
          });
        }
      }
    }

    // Merge explicit dependencies with type reference dependencies
    const allRawDependencies = [...entry.dependencies, ...typeRefDependencies];

    nodes.set(entry.codePath, {
      codePath: entry.codePath,
      docPath: entry.docPath,
      archetype: entry.archetype,
      dependencies: adjacency,
      rawDependencies: allRawDependencies,
      publicSymbols: entry.publicSymbols,
      symbolDocumentation: entry.symbolDocumentation
    });

    for (const dependency of adjacency) {
      if (!inbound.has(dependency)) {
        inbound.set(dependency, new Set());
      }
      inbound.get(dependency)!.add(entry.codePath);
    }

    if (!inbound.has(entry.codePath)) {
      inbound.set(entry.codePath, new Set());
    }
  }

  return { nodes, inbound, docToCode };
}

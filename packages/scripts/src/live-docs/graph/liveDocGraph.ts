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

export interface LiveDocGraphNode {
  codePath: string;
  docPath: string;
  archetype: string;
  dependencies: Set<string>;
  rawDependencies: ParsedDependency[];
  publicSymbols: string[];
  symbolDocumentation: Record<string, ParsedSymbolDocumentationEntry>;
}

export interface LiveDocGraph {
  nodes: Map<string, LiveDocGraphNode>;
  inbound: Map<string, Set<string>>;
  docToCode: Map<string, string>;
}

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
    for (const candidate of entry.dependencies) {
      if (candidate.codePath && entries.has(candidate.codePath)) {
        adjacency.add(candidate.codePath);
      }
    }

    nodes.set(entry.codePath, {
      codePath: entry.codePath,
      docPath: entry.docPath,
      archetype: entry.archetype,
      dependencies: adjacency,
      rawDependencies: entry.dependencies,
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

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
  LiveDocSyntaxError,
  linkTarget,
  parseLiveDoc,
  type LiveDoc,
  type SymbolBlock,
  type TypeRef
} from "@live-documentation/shared/live-docs/document";

/**
 * A type reference of a public symbol, as the graph's consumers read it.
 */
export interface ParsedTypeReference {
  /** The name of the referenced type as displayed in the Live Doc. */
  typeName: string;
  /** The role this type plays in the symbol's signature. */
  role: "return" | "parameter" | "extends" | "implements" | "constraint";
  /** For parameter types, the name of the parameter. */
  parameterName?: string;
  /** Whether this type resolved to a Live Doc link. */
  isResolved: boolean;
  /** The relative path to the target Live Doc, if resolved and in another doc. */
  targetDocPath?: string;
  /** The anchor within the target Live Doc, if resolved. */
  targetAnchor?: string;
}

/** Documentation of a public symbol, as the graph's consumers read it. */
export interface ParsedSymbolDocumentationEntry {
  summary?: string;
  remarks?: string;
  parameters?: Array<{ name: string; description?: string }>;
  typeReferences?: ParsedTypeReference[];
}

/** A single dependency edge as the graph's consumers read it. */
export interface ParsedDependency {
  codePath?: string;
  docPath?: string;
  anchor?: string;
  /** Anchor of the symbol on the *source* file that declares this dependency */
  sourceAnchor?: string;
  label?: string;
  raw: string;
  /** The type-reference role when this dependency originates from a type reference (extends, implements, etc.). */
  role?: string;
}

/**
 * A single node in the Live Doc dependency graph, representing one tracked
 * workspace artifact and its extracted metadata.
 *
 * Nodes are keyed by `codePath` (workspace-relative source path) and carry
 * resolved dependency edges, public symbol names, and per-symbol documentation
 * extracted from the corresponding Live Doc file.
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
 * visualizations, the `inspect` pathfinder CLI, and the lint disconnected-node check.
 *
 * - `nodes` — forward lookup by source path.
 * - `inbound` — reverse index: for a given target, which sources depend on it.
 * - `docToCode` — maps Live Doc paths back to their source paths.
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
  doc: LiveDoc;
  docPath: string;
  dependencies: ParsedDependency[];
}

/**
 * Reads every Live Doc under the configured root and assembles the dependency graph.
 *
 * A doc that the grammar refuses stops the build with its path and line, since
 * a doc no one may hand-edit can only be malformed by a generator bug.
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
    const docPath = path.relative(workspaceRoot, absoluteDocPath).split(path.sep).join("/");
    const content = await fs.readFile(absoluteDocPath, "utf8");
    let doc: LiveDoc;
    try {
      doc = parseLiveDoc(content);
    } catch (error) {
      if (error instanceof LiveDocSyntaxError) {
        throw new Error(`${docPath}: ${error.message}`);
      }
      throw error;
    }
    entries.set(doc.codePath, {
      doc,
      docPath,
      dependencies: dependenciesOf(doc, docPath, config)
    });
  }

  const nodes = new Map<string, LiveDocGraphNode>();
  const inbound = new Map<string, Set<string>>();
  const docToCode = new Map<string, string>();

  for (const entry of entries.values()) {
    docToCode.set(entry.docPath, entry.doc.codePath);
  }

  for (const entry of entries.values()) {
    const adjacency = new Set<string>();
    const typeRefDependencies: ParsedDependency[] = [];

    for (const candidate of entry.dependencies) {
      if (candidate.codePath && entries.has(candidate.codePath)) {
        adjacency.add(candidate.codePath);
      }
    }

    const symbolDocumentation: Record<string, ParsedSymbolDocumentationEntry> = {};
    const docDir = path.posix.dirname(entry.docPath);
    for (const symbol of entry.doc.symbols) {
      const name = baseSymbolName(symbol.name);
      const documentation = documentationOf(symbol);
      if (Object.keys(documentation).length > 0) {
        symbolDocumentation[name] = documentation;
      }
      for (const typeRef of documentation.typeReferences ?? []) {
        if (!typeRef.isResolved || !typeRef.targetDocPath) {
          continue;
        }
        const resolvedDocPath = path.posix.normalize(path.posix.join(docDir, typeRef.targetDocPath));
        const targetCodePath = docToCode.get(resolvedDocPath);
        if (targetCodePath && entries.has(targetCodePath)) {
          adjacency.add(targetCodePath);
          typeRefDependencies.push({
            codePath: targetCodePath,
            docPath: resolvedDocPath,
            anchor: typeRef.targetAnchor,
            sourceAnchor: name,
            label: `${typeRef.role}: ${typeRef.typeName}`,
            raw: `${name} ${typeRef.role} ${typeRef.typeName}`,
            role: typeRef.role
          });
        }
      }
    }

    nodes.set(entry.doc.codePath, {
      codePath: entry.doc.codePath,
      docPath: entry.docPath,
      archetype: entry.doc.archetype ?? "implementation",
      dependencies: adjacency,
      rawDependencies: [...entry.dependencies, ...typeRefDependencies],
      publicSymbols: entry.doc.symbols.map((symbol) => baseSymbolName(symbol.name)),
      symbolDocumentation
    });

    for (const dependency of adjacency) {
      if (!inbound.has(dependency)) {
        inbound.set(dependency, new Set());
      }
      inbound.get(dependency)!.add(entry.doc.codePath);
    }

    if (!inbound.has(entry.doc.codePath)) {
      inbound.set(entry.doc.codePath, new Set());
    }
  }

  return { nodes, inbound, docToCode };
}

/** The symbol's name without the disambiguating kind a heading may carry, such as `Widget (interface)`. */
function baseSymbolName(displayName: string): string {
  return displayName.replace(/\s+\((interface|const|type|class|function|enum)\)$/iu, "");
}

function dependenciesOf(doc: LiveDoc, docPath: string, config: LiveDocumentationConfig): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];
  const seen = new Set<string>();
  for (const dependency of doc.dependencies) {
    const target = dependency.link ? linkTarget(docPath, dependency.link, config) : undefined;
    const entry: ParsedDependency = target
      ? { codePath: target.codePath, docPath: target.docPath, anchor: target.anchor, label: dependency.label, raw: dependency.link! }
      : { label: dependency.link ? dependency.label : undefined, raw: dependency.label };
    const key = [entry.codePath, entry.docPath, entry.anchor, entry.label, entry.raw].join("|");
    if (!seen.has(key)) {
      seen.add(key);
      dependencies.push(entry);
    }
  }
  return dependencies;
}

function documentationOf(symbol: SymbolBlock): ParsedSymbolDocumentationEntry {
  const entry: ParsedSymbolDocumentationEntry = {};
  for (const section of symbol.sections) {
    const text = section.body.join("\n");
    if (section.title === "Summary") {
      entry.summary = entry.summary ? `${entry.summary}\n${text}` : text;
    } else if (section.title === "Remarks") {
      entry.remarks = entry.remarks ? `${entry.remarks}\n${text}` : text;
    } else if (section.title === "Parameters") {
      entry.parameters = parametersOf(section.body);
    }
  }
  const typeReferences = symbol.references.flatMap(typeReferencesOf);
  if (typeReferences.length > 0) {
    entry.typeReferences = typeReferences;
  }
  return entry;
}

function parametersOf(body: string[]): Array<{ name: string; description?: string }> {
  const parameters: Array<{ name: string; description?: string }> = [];
  for (const line of body) {
    const bullet = /^\s*-\s+`([^`]+)`:\s*(.*)$/u.exec(line);
    if (bullet) {
      parameters.push({ name: bullet[1], description: bullet[2] ? bullet[2] : undefined });
    } else if (parameters.length > 0 && line.trim()) {
      const last = parameters[parameters.length - 1];
      last.description = last.description ? `${last.description}\n${line.trim()}` : line.trim();
    }
  }
  return parameters;
}

const ROLE_OF: Record<string, ParsedTypeReference["role"]> = {
  Returns: "return",
  Extends: "extends",
  Implements: "implements",
  Constraints: "constraint"
};

function typeReferencesOf(line: SymbolBlock["references"][number]): ParsedTypeReference[] {
  if (line.role === "Parameters") {
    return line.parameters.flatMap((parameter) =>
      parameter.types.map((type) => typeReferenceOf(type, "parameter", parameter.name))
    );
  }
  return line.types.map((type) => typeReferenceOf(type, ROLE_OF[line.role]));
}

function typeReferenceOf(type: TypeRef, role: ParsedTypeReference["role"], parameterName?: string): ParsedTypeReference {
  if (type.link) {
    const [targetDocPath, targetAnchor] = type.link.split("#", 2);
    return { typeName: type.name, role, parameterName, isResolved: true, targetDocPath: targetDocPath || undefined, targetAnchor: targetAnchor || undefined };
  }
  return { typeName: `${type.name}${type.array ? "[]" : ""}`, role, parameterName, isResolved: false };
}

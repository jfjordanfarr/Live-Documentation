/**
 * The derived graph index.
 *
 * @remarks
 * The Live Docs are the store. This module derives the graph from them: each
 * file of the graph is one parsed doc, exactly as `parseLiveDoc` returns it,
 * plus what only the whole corpus can say: which file each link lands on, and
 * which files point here. Every consumer of the docs reads this shape; the
 * generator also writes it to `<root>/index.json` after each run, for readers
 * outside this code base, and never commits it. Nothing here touches the file
 * system, so the Explorer client reads a graph the same way the CLI does.
 *
 * @module
 */

import type { LiveDoc, SymbolBlock, TypeRef } from "./document";

// ============================================================================
// The model
// ============================================================================

/** Where the docs are, relative to the workspace, and what they are named. */
export interface DocLocation {
  root: string;
  baseLayer: string;
  extension: string;
}

/** The graph of a workspace: every doc, with its links resolved. */
export interface LiveDocGraph extends DocLocation {
  /** Every doc, keyed by the source file's workspace-relative path, in path order. */
  files: Record<string, GraphFile>;
}

/** One doc of the graph: the parsed doc, and what the corpus adds to it. */
export interface GraphFile extends LiveDoc {
  /** Workspace-relative path of the doc, with forward slashes. */
  docPath: string;
  /** Every reference the doc makes: its dependency lines, then its linked type references. */
  edges: GraphEdge[];
  /** Files this one has a resolved edge to, other than itself, sorted. */
  outbound: string[];
  /** Files that have a resolved edge to this one, other than itself, sorted. */
  inbound: string[];
}

/** How an edge arose: a dependency line, or a type reference on a symbol. */
export type EdgeKind = "import" | "re-export" | "returns" | "parameter" | "extends" | "implements" | "constraint";

/** How an edge was observed when not from source: see `DependencyBasis`. */
export type EdgeBasis = "contract" | "configuration";

/** One reference a doc makes, resolved against the corpus. */
export interface GraphEdge {
  kind: EdgeKind;
  /** The dependency label, or the type name, as written. */
  label: string;
  /** The link as written on the doc. A dependency line without one names an external module. */
  link?: string;
  /** The file the link resolved to; absent when there is no link or no doc answers to it. */
  to?: string;
  /** The slug of the symbol the link names on the target. */
  toSymbol?: string;
  /** The slug of the symbol on this file whose type reference carries the edge; absent on a dependency line. */
  from?: string;
  /** For a `parameter` edge, the parameter whose type is referenced. */
  parameter?: string;
  /** The dependency is type-only. */
  typeOnly?: boolean;
  /** The dependency was observed from a contract or from configuration rather than from source. */
  basis?: EdgeBasis;
}

/** The name of the file the generator writes the graph to, under the docs root. */
export const GRAPH_INDEX_FILE = "index.json";

// ============================================================================
// Derivation
// ============================================================================

/**
 * Derives the graph from parsed docs.
 *
 * @param docs - Every doc of the workspace, each with its workspace-relative path.
 * @param location - Where the docs are, so that links between them resolve.
 */
export function deriveLiveDocGraph(docs: Iterable<{ docPath: string; doc: LiveDoc }>, location: DocLocation): LiveDocGraph {
  const files: Record<string, GraphFile> = {};
  const sorted = [...docs].sort((a, b) => compare(a.doc.codePath, b.doc.codePath));
  for (const { docPath, doc } of sorted) {
    const existing = files[doc.codePath];
    if (existing) {
      throw new Error(`two docs describe ${doc.codePath}: ${existing.docPath} and ${docPath}`);
    }
    files[doc.codePath] = {
      codePath: doc.codePath,
      docPath,
      layer: doc.layer,
      archetype: doc.archetype,
      generatedAt: doc.generatedAt,
      authored: doc.authored,
      symbols: doc.symbols,
      dependencies: doc.dependencies,
      reExports: doc.reExports,
      edges: [],
      outbound: [],
      inbound: []
    };
  }
  const resolve = (file: GraphFile, link: string): Pick<GraphEdge, "link" | "to" | "toSymbol"> => {
    const target = linkTarget(file.docPath, link, location);
    if (target && files[target.codePath]) {
      return { link, to: target.codePath, toSymbol: target.anchor };
    }
    return { link };
  };
  for (const file of Object.values(files)) {
    for (const dependency of file.dependencies) {
      const edge: GraphEdge = {
        kind: dependency.qualifiers.includes("re-export") ? "re-export" : "import",
        label: dependency.label,
        ...(dependency.link ? resolve(file, dependency.link) : {})
      };
      if (dependency.qualifiers.includes("type-only")) {
        edge.typeOnly = true;
      }
      const basis = dependency.qualifiers.find((qualifier): qualifier is EdgeBasis => qualifier === "contract" || qualifier === "configuration");
      if (basis) {
        edge.basis = basis;
      }
      file.edges.push(edge);
    }
    for (const symbol of file.symbols) {
      for (const reference of symbol.references) {
        if (reference.role === "Parameters") {
          for (const parameter of reference.parameters) {
            for (const type of parameter.types) {
              pushReference(file, symbol, type, "parameter", resolve, parameter.name);
            }
          }
        } else {
          for (const type of reference.types) {
            pushReference(file, symbol, type, REFERENCE_KIND[reference.role], resolve);
          }
        }
      }
    }
    file.outbound = unique(file.edges.map((edge) => edge.to).filter((to): to is string => to !== undefined && to !== file.codePath));
  }
  for (const file of Object.values(files)) {
    for (const to of file.outbound) {
      files[to].inbound.push(file.codePath);
    }
  }
  return { root: location.root, baseLayer: location.baseLayer, extension: location.extension, files };
}

const REFERENCE_KIND = { Returns: "returns", Extends: "extends", Implements: "implements", Constraints: "constraint" } as const;

function pushReference(
  file: GraphFile,
  symbol: SymbolBlock,
  type: TypeRef,
  kind: EdgeKind,
  resolve: (file: GraphFile, link: string) => Pick<GraphEdge, "link" | "to" | "toSymbol">,
  parameter?: string
): void {
  if (!type.link) {
    return;
  }
  const edge: GraphEdge = { kind, label: type.name, ...resolve(file, type.link) };
  if (symbol.slug) {
    edge.from = symbol.slug;
  }
  if (parameter !== undefined) {
    edge.parameter = parameter;
  }
  file.edges.push(edge);
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort(compare);
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// ============================================================================
// Links
// ============================================================================

/** The Live Doc a link in a doc points at, and the source file that doc mirrors. */
export interface LinkTarget {
  /** Workspace-relative path of the target doc, with forward slashes. */
  docPath: string;
  /** Workspace-relative path of the source file the target doc mirrors. */
  codePath: string;
  /** The fragment of the link, without `#`. */
  anchor?: string;
}

/**
 * Resolves a doc-relative link to the Live Doc it names.
 *
 * @param docPath - Workspace-relative path of the doc holding the link, with forward slashes.
 * @param link - The link as written, relative to the doc, with an optional `#fragment`. A bare fragment names the doc itself.
 * @param location - Where the docs are.
 * @returns The target, or undefined when the link leaves the docs or does not name a Live Doc.
 */
export function linkTarget(docPath: string, link: string, location: DocLocation): LinkTarget | undefined {
  const [target, fragment] = link.split("#", 2);
  if (/^[a-z]+:\/\//iu.test(target)) {
    return undefined;
  }
  const resolved = target ? normalizePath(`${dirname(docPath)}/${target}`) : docPath;
  const prefix = `${normalizePath(location.root)}/${normalizePath(location.baseLayer)}/`;
  if (resolved.startsWith("../") || resolved.startsWith("/") || !resolved.startsWith(prefix)) {
    return undefined;
  }
  const rest = resolved.slice(prefix.length);
  if (!rest.toLowerCase().endsWith(location.extension.toLowerCase())) {
    return undefined;
  }
  return { docPath: resolved, codePath: rest.slice(0, -location.extension.length), anchor: fragment || undefined };
}

function dirname(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "." : path.slice(0, slash);
}

/** Collapses `.` and `..` segments of a forward-slash path, as `path.posix.normalize` does. */
function normalizePath(path: string): string {
  const segments: string[] = [];
  for (const segment of path.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === ".." && segments.length > 0 && segments[segments.length - 1] !== "..") {
      segments.pop();
    } else {
      segments.push(segment);
    }
  }
  return `${path.startsWith("/") ? "/" : ""}${segments.join("/")}`;
}

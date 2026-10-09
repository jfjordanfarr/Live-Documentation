/**
 * The estate's graph: several scans, one graph.
 *
 * @remarks
 * A board may name things whose docs come from scans of their own, each a
 * folder scanned alone with nothing of the others in sight. This module merges
 * those graphs into one, keyed by each file's path from the estate's root, and
 * then does what no single scan could: it matches what a file names under a
 * basis, a route, an address or a database object, and what a manifest names
 * as a project, against the doors and projects the other scans publish, and
 * links the edge there, keeping its basis. A scan is never changed by it; what
 * it adds is only ever a link from one scan into another, and a name no scan
 * serves stays as it was, a ghost. Nothing here reads the file system.
 *
 * A route call a scan has already linked is matched too, since a server's
 * client that calls a route its own project also serves is linked at home when
 * the scan holds no server away, and the server away may be in another scan.
 * A browser script's call stays at home, as the generator keeps it: a script
 * calls its own site. The generator tells the two apart by language, and so
 * does this module, by the caller's extension.
 *
 * @module
 */

import { DOOR_KINDS } from "./board";
import { symbolName } from "./document";
import type { DocLocation, GraphEdge, GraphFile, LiveDocGraph } from "./graph";
import { ADDRESS_KIND, MANIFEST_KINDS, PROJECT_KINDS, ROUTE_KIND, SQL_OBJECT_KINDS, parseRouteSymbol, routesMatch, sqlNameMatches, sqlObjectName } from "./openings";

// ============================================================================
// The model
// ============================================================================

/** One scan of the estate: the folder it covers and the graph its docs derive. */
export interface EstateScan {
  /** The scan's root as a path from the estate's root, with forward slashes; empty for the estate's root itself. */
  folder: string;
  graph: LiveDocGraph;
}

/** A file of the browser's languages, whose route calls are its own site's. */
const BROWSER_SCRIPT = /\.(?:[cm]?[jt]s|[jt]sx)$/iu;

/** Something a scan publishes that another scan's edge may land on. */
interface Target {
  scan: number;
  file: string;
  name: string;
  kind: string;
  slug?: string;
}

// ============================================================================
// The merge
// ============================================================================

/**
 * Joins the scans of an estate into one graph.
 *
 * @param scans - The scans, none inside another. One scan at the estate's root is returned as it is.
 * @param location - Where the docs are, within each scan; the merged graph carries the same.
 * @throws When two scans share a folder or one lies inside another, which the reader refuses before it comes here.
 */
export function deriveEstateGraph(scans: EstateScan[], location: DocLocation): LiveDocGraph {
  for (const [index, scan] of scans.entries()) {
    for (const other of scans.slice(index + 1)) {
      if (scan.folder === other.folder) {
        throw new Error(`two scans cover ${scan.folder || "the estate's root"}`);
      }
      if (contains(scan.folder, other.folder) || contains(other.folder, scan.folder)) {
        throw new Error(`a scan lies inside another: ${scan.folder || "the estate's root"} and ${other.folder || "the estate's root"}`);
      }
    }
  }
  if (scans.length === 1 && scans[0].folder === "") {
    return scans[0].graph;
  }

  const files: Record<string, GraphFile> = {};
  const scanOf = new Map<string, number>();
  for (const [index, scan] of scans.entries()) {
    const prefixed = (p: string): string => (scan.folder ? `${scan.folder}/${p}` : p);
    for (const file of Object.values(scan.graph.files)) {
      const key = prefixed(file.codePath);
      files[key] = {
        ...file,
        codePath: key,
        docPath: prefixed(file.docPath),
        edges: file.edges.map((edge) => (edge.to === undefined ? { ...edge } : { ...edge, to: prefixed(edge.to) })),
        outbound: [],
        inbound: []
      };
      scanOf.set(key, index);
    }
  }

  const doors: Target[] = [];
  const projects: Target[] = [];
  for (const file of Object.values(files)) {
    const scan = scanOf.get(file.codePath)!;
    for (const symbol of file.symbols) {
      const target: Target = { scan, file: file.codePath, name: symbolName(symbol), kind: symbol.kind, ...(symbol.slug ? { slug: symbol.slug } : {}) };
      if (DOOR_KINDS.has(symbol.kind)) {
        doors.push(target);
      }
      if (PROJECT_KINDS.has(symbol.kind)) {
        projects.push(target);
      }
    }
  }

  for (const file of Object.values(files)) {
    const scan = scanOf.get(file.codePath)!;
    const manifest = file.symbols.some((symbol) => MANIFEST_KINDS.has(symbol.kind));
    const landed = new Set(file.edges.map((edge) => `${edge.to ?? ""}\u0000${edge.toSymbol ?? ""}`));
    const additions: GraphEdge[] = [];
    for (const edge of file.edges) {
      const targets = targetsOf(edge, file, scan, manifest, files, doors, projects);
      for (const target of targets) {
        const key = `${target.file}\u0000${target.slug ?? ""}`;
        if (landed.has(key)) {
          continue;
        }
        landed.add(key);
        if (edge.to === undefined) {
          edge.to = target.file;
          if (target.slug) {
            edge.toSymbol = target.slug;
          }
        } else {
          additions.push({ ...edge, to: target.file, ...(target.slug ? { toSymbol: target.slug } : {}) });
        }
      }
    }
    file.edges.push(...additions);
  }

  for (const file of Object.values(files)) {
    file.outbound = [...new Set(file.edges.map((edge) => edge.to).filter((to): to is string => to !== undefined && to !== file.codePath))].sort(compare);
  }
  for (const file of Object.values(files)) {
    for (const to of file.outbound) {
      files[to].inbound.push(file.codePath);
    }
  }
  for (const file of Object.values(files)) {
    file.inbound.sort(compare);
  }

  const sorted: Record<string, GraphFile> = {};
  for (const key of Object.keys(files).sort(compare)) {
    sorted[key] = files[key];
  }
  return { root: location.root, baseLayer: location.baseLayer, extension: location.extension, files: sorted };
}

/** The doors or projects of other scans an edge may land on, by the name the edge carries. */
function targetsOf(edge: GraphEdge, file: GraphFile, scan: number, manifest: boolean, files: Record<string, GraphFile>, doors: Target[], projects: Target[]): Target[] {
  if (edge.kind !== "import" && edge.kind !== "re-export") {
    return [];
  }
  if (edge.basis === undefined) {
    if (!manifest || edge.to !== undefined || edge.link !== undefined) {
      return [];
    }
    return projects.filter((project) => project.scan !== scan && (project.name === edge.label || stem(project.file) === edge.label));
  }
  const name = edge.to === undefined ? edge.label : doorName(files[edge.to], edge.toSymbol);
  if (name === undefined) {
    return [];
  }
  if (edge.basis === "configuration") {
    return doors.filter((door) => door.scan !== scan && door.kind === ADDRESS_KIND && door.name === name);
  }
  const route = parseRouteSymbol(name);
  const object = sqlObjectName(name);
  const routesToo = edge.to === undefined || !BROWSER_SCRIPT.test(file.codePath);
  return doors.filter((door) => door.scan !== scan && (
    (routesToo && door.kind === ROUTE_KIND && routesMatch(route, parseRouteSymbol(door.name))) ||
    (SQL_OBJECT_KINDS.has(door.kind) && sqlNameMatches(object, sqlObjectName(door.name)))
  ));
}

/** The name of the door a linked edge lands on, from the target's symbols. */
function doorName(target: GraphFile | undefined, slug: string | undefined): string | undefined {
  if (!target || slug === undefined) {
    return undefined;
  }
  const symbol = target.symbols.find((candidate) => candidate.slug === slug);
  return symbol && DOOR_KINDS.has(symbol.kind) ? symbolName(symbol) : undefined;
}

/** True when `inner` is the same folder as `outer` or lies inside it; the empty folder is the root and contains everything. */
export function contains(outer: string, inner: string): boolean {
  return outer === "" || inner === outer || inner.startsWith(`${outer}/`);
}

function stem(file: string): string {
  const base = file.slice(file.lastIndexOf("/") + 1);
  const dot = base.lastIndexOf(".");
  return dot === -1 ? base : base.slice(0, dot);
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

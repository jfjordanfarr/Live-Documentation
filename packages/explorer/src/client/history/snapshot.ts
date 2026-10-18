/**
 * A shape of the history as the 3D Local Map's graph payload: a node per file
 * with its archetype and its symbol count, a link per directed edge with its
 * count, and nothing the sequence does not carry. The docs of that commit are
 * not in the bundle, so a node has no symbol names, no doc path and no
 * dependency lines; the view sizes it by the count and labels it by the count.
 *
 * Pure-function module: no DOM.
 *
 * @module snapshot
 */

import { edgeEnds, type Shape } from "@live-documentation/engine/live-docs/history/shape";

import type { ExplorerGraphPayload, ExplorerLinkPayload, ExplorerNodePayload } from "../../shared/types";

const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** The payload the views render, for the shape at one step. */
export function snapshotGraphOf(shape: Shape): ExplorerGraphPayload {
  const inbound = new Map<string, string[]>();
  const links: ExplorerLinkPayload[] = [];
  for (const [key, count] of shape.edges) {
    const [from, to] = edgeEnds(key);
    links.push({ source: from, target: to, kind: "dependency", referenceCount: count });
    const users = inbound.get(to) ?? [];
    users.push(from);
    inbound.set(to, users);
  }
  links.sort((a, b) => compare(a.source as string, b.source as string) || compare(a.target as string, b.target as string));
  const nodes: ExplorerNodePayload[] = [...shape.files.keys()].sort(compare).map((path) => {
    const file = shape.files.get(path)!;
    return {
      id: path,
      name: path.slice(path.lastIndexOf("/") + 1),
      codePath: path,
      codeRelativePath: path,
      docPath: "",
      docRelativePath: "",
      archetype: file.archetype,
      dependencies: [],
      dependents: (inbound.get(path) ?? []).sort(compare),
      missingDependencies: [],
      publicSymbols: [],
      symbolCount: file.symbols
    };
  });
  return { nodes, links, stats: { nodes: nodes.length, links: links.length, referencesOutsideScan: 0 } };
}

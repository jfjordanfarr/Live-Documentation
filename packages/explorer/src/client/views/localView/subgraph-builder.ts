/**
 * Subgraph building functions for Local Map.
 *
 * These are pure functions that build subgraphs from graph data,
 * allowing the LocalViewController to delegate subgraph construction
 * while keeping the logic testable and independently improvable.
 *
 * @module subgraph-builder
 */

import type { LocalSubgraph, LocalSubgraphLink } from "./types";
import type { ExplorerNodePayload, ExplorerLinkPayload, ExplorerGraphPayload } from "../../../shared/types";

/**
 * Filter function to determine if a node should be included in the subgraph.
 */
export type NodeFilter = (node: ExplorerNodePayload) => boolean;

/**
 * Function to resolve a link endpoint to a node ID.
 */
export type LinkEndpointResolver = (endpoint: ExplorerLinkPayload["source"]) => string;

/**
 * Function to resolve a node by ID.
 */
export type NodeResolver = (id: string) => ExplorerNodePayload | undefined;

/**
 * Creates a local subgraph centered on a node.
 *
 * This is a pure function that builds a subgraph containing:
 * - The center node
 * - All direct neighbors (nodes connected by a single edge)
 * - All edges between the center and neighbors
 * - Self-loop edges from intra-file type references
 */
export function createLocalSubgraph(
  center: ExplorerNodePayload,
  graphData: ExplorerGraphPayload,
  resolveLinkEndpoint: LinkEndpointResolver,
  resolveNode: NodeResolver,
  shouldIncludeNode: NodeFilter
): LocalSubgraph {
  const neighbors = new Map<string, ExplorerNodePayload>();
  const linkResults: LocalSubgraphLink[] = [];
  const inboundIds = new Set<string>();
  const outboundIds = new Set<string>();

  graphData.links.forEach(edge => {
    const sourceId = resolveLinkEndpoint(edge.source);
    const targetId = resolveLinkEndpoint(edge.target);
    const kind = edge.kind ?? "dependency";

    if (sourceId === center.id) {
      const neighbor = resolveNode(targetId);
      if (neighbor) {
        if (!shouldIncludeNode(neighbor) && neighbor.id !== center.id) {
          return;
        }
        neighbors.set(neighbor.id, neighbor);
        outboundIds.add(neighbor.id);
        linkResults.push({
          sourceId,
          targetId,
          direction: "outbound",
          kind,
          sourceSymbol: edge.sourceSymbol,
          targetSymbol: edge.targetSymbol
        });
      }
    } else if (targetId === center.id) {
      const neighbor = resolveNode(sourceId);
      if (neighbor) {
        if (!shouldIncludeNode(neighbor) && neighbor.id !== center.id) {
          return;
        }
        neighbors.set(neighbor.id, neighbor);
        inboundIds.add(neighbor.id);
        linkResults.push({
          sourceId,
          targetId,
          direction: "inbound",
          kind,
          sourceSymbol: edge.sourceSymbol,
          targetSymbol: edge.targetSymbol
        });
      }
    }
  });

  // Generate self-loop edges from intra-file type references
  const selfLoopEdges = buildSelfLoopEdges(center);
  linkResults.push(...selfLoopEdges);

  return {
    center,
    nodes: [center, ...neighbors.values()],
    links: linkResults,
    inboundIds,
    outboundIds
  };
}

/**
 * Build self-loop edges from intra-file type references.
 *
 * When a symbol references another symbol in the same file, we create a self-loop edge.
 * These enable the "French Corset" wraparound bezier visualization.
 */
export function buildSelfLoopEdges(center: ExplorerNodePayload): LocalSubgraphLink[] {
  const selfLoopEdges: LocalSubgraphLink[] = [];
  const seenKeys = new Set<string>();

  const symbols = center.publicSymbolsExtended;
  if (!symbols) return selfLoopEdges;

  // Build a set of symbol names in this file for quick lookup
  const localSymbolNames = new Set(symbols.map(s => s.name));

  for (const symbol of symbols) {
    const typeRefs = symbol.typeReferences;
    if (!typeRefs) continue;

    for (const ref of typeRefs) {
      // Check if this type reference points to a symbol in the same file
      const isSelfReference =
        (ref.isResolved && ref.targetId === center.id) ||
        (!ref.isResolved && localSymbolNames.has(ref.typeName));

      if (isSelfReference) {
        const key = `${center.id}|${center.id}|type-reference|${symbol.name}|${ref.typeName}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        selfLoopEdges.push({
          sourceId: center.id,
          targetId: center.id,
          direction: "outbound",
          kind: "type-reference",
          sourceSymbol: symbol.name,
          targetSymbol: ref.typeName
        });
      }
    }
  }

  return selfLoopEdges;
}

/**
 * Builds a subgraph for path mode visualization.
 *
 * Unlike exploration mode which shows all neighbors of a center node,
 * path mode shows only the nodes in the path and edges between adjacent nodes.
 *
 * For a path [A, B, C]:
 * - A is the "origin" (FROM)
 * - C is the "destination" (TO)
 * - B is intermediate
 * - Edges are filtered to only include A→B and B→C connections
 */
export function buildPathSubgraph(
  pathNodeIds: string[],
  graphData: ExplorerGraphPayload,
  resolveLinkEndpoint: LinkEndpointResolver,
  resolveNode: NodeResolver
): LocalSubgraph | null {
  if (pathNodeIds.length < 2) return null;

  const nodes: ExplorerNodePayload[] = [];
  for (const id of pathNodeIds) {
    const node = resolveNode(id);
    if (!node) return null;
    nodes.push(node);
  }

  const center = nodes[0];
  const pathNodeIdSet = new Set(pathNodeIds);

  // Build set of valid adjacent pairs for edge filtering
  const adjacentPairs = new Set<string>();
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    adjacentPairs.add(`${pathNodeIds[i]}:${pathNodeIds[i + 1]}`);
    adjacentPairs.add(`${pathNodeIds[i + 1]}:${pathNodeIds[i]}`);
  }

  const linkResults: LocalSubgraphLink[] = [];
  const inboundIds = new Set<string>();
  const outboundIds = new Set<string>();

  graphData.links.forEach(edge => {
    const sourceId = resolveLinkEndpoint(edge.source);
    const targetId = resolveLinkEndpoint(edge.target);

    // Only include edges between adjacent path nodes
    const pairKey = `${sourceId}:${targetId}`;
    if (!adjacentPairs.has(pairKey)) return;

    // Both nodes must be in the path
    if (!pathNodeIdSet.has(sourceId) || !pathNodeIdSet.has(targetId)) return;

    const kind = edge.kind ?? "dependency";

    // Determine direction relative to the path flow
    const sourceIndex = pathNodeIds.indexOf(sourceId);
    const targetIndex = pathNodeIds.indexOf(targetId);
    const direction: "inbound" | "outbound" = sourceIndex < targetIndex ? "outbound" : "inbound";

    if (direction === "outbound") {
      outboundIds.add(targetId);
    } else {
      inboundIds.add(sourceId);
    }

    linkResults.push({
      sourceId,
      targetId,
      direction,
      kind,
      sourceSymbol: edge.sourceSymbol,
      targetSymbol: edge.targetSymbol
    });
  });

  return {
    center,
    nodes,
    links: linkResults,
    inboundIds,
    outboundIds
  };
}

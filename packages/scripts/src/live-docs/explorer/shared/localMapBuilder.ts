/**
 * @file localMapBuilder.ts
 * @description Builds LocalMapData from ExplorerGraphPayload for a given focus node.
 * This is the headless computation that powers both:
 * - Server-side JSON API responses
 * - Static export pre-computation
 *
 * The visual renderer becomes a pure function of the resulting LocalMapData.
 */

import {
    buildNormalizedAnchorKey,
    LOCAL_MAP_SCHEMA_VERSION,
    normalizeSymbolIdentifier,
    type BuildLocalMapOptions,
    type LocalMapColumn,
    type LocalMapData,
    type LocalMapEdge,
    type LocalMapNode,
    type LocalMapStats,
    type LocalMapSymbolAnchor
} from "./localMapData";
import type { ExplorerGraphPayload, ExplorerLinkPayload, ExplorerNodePayload } from "./types";

/**
 * Test coverage map: node ID → array of test file IDs that cover it.
 */
export type TestCoverageMap = Map<string, string[]>;

/**
 * Build a LocalMapData object for the given focus node.
 *
 * @param graphData - The full explorer graph.
 * @param testCoverage - Map of node IDs to covering test IDs.
 * @param options - Build options including the focus node ID.
 * @returns Complete LocalMapData ready for rendering or serialization.
 */
export function buildLocalMapData(
    graphData: ExplorerGraphPayload,
    testCoverage: TestCoverageMap,
    options: BuildLocalMapOptions
): LocalMapData | null {
    const { focusNodeId, includeExtendedSymbols = true, includeSymbolAnchors = true, commitHash } = options;

    // Build lookup maps
    const nodesById = new Map(graphData.nodes.map(n => [n.id, n]));
    const focusNode = nodesById.get(focusNodeId);

    if (!focusNode) {
        return null;
    }

    // Resolve link endpoints
    const resolveLinkEndpoint = (endpoint: ExplorerLinkPayload["source"]): string => {
        if (typeof endpoint === "string") return endpoint;
        if (endpoint && typeof endpoint === "object" && "id" in endpoint) {
            return typeof endpoint.id === "string" ? endpoint.id : "";
        }
        return "";
    };

    // Compute subgraph
    const subgraph = computeSubgraph(focusNode, graphData, resolveLinkEndpoint);

    // Build node representations
    const center = buildLocalMapNode(focusNode, "center", testCoverage, includeExtendedSymbols);
    const upstream = subgraph.upstreamNodes.map(n =>
        buildLocalMapNode(n, "upstream", testCoverage, includeExtendedSymbols)
    );
    const downstream = subgraph.downstreamNodes.map(n =>
        buildLocalMapNode(n, "downstream", testCoverage, includeExtendedSymbols)
    );

    // Build edges
    const edges = buildEdges(subgraph, focusNodeId);

    // Build symbol anchors if requested
    const symbolAnchors = includeSymbolAnchors
        ? buildSymbolAnchors(center, upstream, downstream, edges)
        : [];

    // Compute stats
    const stats = computeStats(center, upstream, downstream, edges);

    return {
        focusNodeId,
        center,
        upstream,
        downstream,
        edges,
        symbolAnchors,
        stats,
        metadata: {
            generatedAt: new Date().toISOString(),
            schemaVersion: LOCAL_MAP_SCHEMA_VERSION,
            commitHash
        }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Subgraph Computation
// ─────────────────────────────────────────────────────────────────────────────

interface SubgraphResult {
    upstreamNodes: ExplorerNodePayload[];
    downstreamNodes: ExplorerNodePayload[];
    upstreamEdges: EdgeInfo[];
    downstreamEdges: EdgeInfo[];
}

interface EdgeInfo {
    sourceId: string;
    targetId: string;
    kind: ExplorerLinkPayload["kind"];
    sourceSymbol?: string;
    targetSymbol?: string;
}

function computeSubgraph(
    focusNode: ExplorerNodePayload,
    graphData: ExplorerGraphPayload,
    resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string
): SubgraphResult {
    const nodesById = new Map(graphData.nodes.map(n => [n.id, n]));
    const upstreamIds = new Set<string>();
    const downstreamIds = new Set<string>();
    const upstreamEdges: EdgeInfo[] = [];
    const downstreamEdges: EdgeInfo[] = [];

    // Find upstream (dependencies): links where focus is the source
    for (const link of graphData.links) {
        const sourceId = resolveLinkEndpoint(link.source);
        const targetId = resolveLinkEndpoint(link.target);

        if (sourceId === focusNode.id && targetId !== focusNode.id) {
            upstreamIds.add(targetId);
            upstreamEdges.push({
                sourceId,
                targetId,
                kind: link.kind,
                sourceSymbol: link.sourceSymbol,
                targetSymbol: link.targetSymbol
            });
        }

        if (targetId === focusNode.id && sourceId !== focusNode.id) {
            downstreamIds.add(sourceId);
            downstreamEdges.push({
                sourceId,
                targetId,
                kind: link.kind,
                sourceSymbol: link.sourceSymbol,
                targetSymbol: link.targetSymbol
            });
        }
    }

    // Also check explicit dependents from the node payload
    for (const dependentId of focusNode.dependents) {
        if (dependentId !== focusNode.id) {
            downstreamIds.add(dependentId);
        }
    }

    // Resolve to node payloads
    const upstreamNodes = Array.from(upstreamIds)
        .map(id => nodesById.get(id))
        .filter((n): n is ExplorerNodePayload => n !== undefined)
        .sort((a, b) => a.name.localeCompare(b.name));

    const downstreamNodes = Array.from(downstreamIds)
        .map(id => nodesById.get(id))
        .filter((n): n is ExplorerNodePayload => n !== undefined)
        .sort((a, b) => a.name.localeCompare(b.name));

    return { upstreamNodes, downstreamNodes, upstreamEdges, downstreamEdges };
}

// ─────────────────────────────────────────────────────────────────────────────
// Node Building
// ─────────────────────────────────────────────────────────────────────────────

function buildLocalMapNode(
    node: ExplorerNodePayload,
    column: LocalMapColumn,
    testCoverage: TestCoverageMap,
    includeExtendedSymbols: boolean
): LocalMapNode {
    const coveringTests = testCoverage.get(node.id);
    const hasCoverage = coveringTests !== undefined && coveringTests.length > 0;

    return {
        id: node.id,
        name: node.name,
        codeRelativePath: node.codeRelativePath,
        docRelativePath: node.docRelativePath,
        archetype: node.archetype,
        column,
        publicSymbols: node.publicSymbols,
        publicSymbolsExtended: includeExtendedSymbols ? node.publicSymbolsExtended : undefined,
        hasCoverage,
        coveringTests: hasCoverage ? coveringTests : undefined
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Edge Building
// ─────────────────────────────────────────────────────────────────────────────

function buildEdges(subgraph: SubgraphResult, _focusNodeId: string): LocalMapEdge[] {
    const edges: LocalMapEdge[] = [];
    const seenKeys = new Set<string>();

    // Outbound edges: focus → upstream (dependencies)
    for (const edge of subgraph.upstreamEdges) {
        const key = `${edge.sourceId}|${edge.targetId}|${edge.kind}|${edge.sourceSymbol ?? ""}|${edge.targetSymbol ?? ""}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        edges.push({
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            direction: "outbound",
            kind: edge.kind,
            sourceSymbol: edge.sourceSymbol,
            targetSymbol: edge.targetSymbol,
            label: buildEdgeLabel(edge)
        });
    }

    // Inbound edges: downstream → focus (dependents)
    for (const edge of subgraph.downstreamEdges) {
        const key = `${edge.sourceId}|${edge.targetId}|${edge.kind}|${edge.sourceSymbol ?? ""}|${edge.targetSymbol ?? ""}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        edges.push({
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            direction: "inbound",
            kind: edge.kind,
            sourceSymbol: edge.sourceSymbol,
            targetSymbol: edge.targetSymbol,
            label: buildEdgeLabel(edge)
        });
    }

    return edges;
}

function buildEdgeLabel(edge: EdgeInfo): string {
    if (edge.kind === "extends") {
        return edge.sourceSymbol
            ? `${edge.sourceSymbol} extends ${edge.targetSymbol ?? "?"}`
            : "extends";
    }
    if (edge.kind === "implements") {
        return edge.sourceSymbol
            ? `${edge.sourceSymbol} implements ${edge.targetSymbol ?? "?"}`
            : "implements";
    }
    if (edge.kind === "type-reference") {
        return edge.sourceSymbol && edge.targetSymbol
            ? `${edge.sourceSymbol} uses ${edge.targetSymbol}`
            : "type reference";
    }
    // Default dependency label
    if (edge.sourceSymbol && edge.targetSymbol) {
        return `${edge.sourceSymbol} → ${edge.targetSymbol}`;
    }
    return "depends on";
}

// ─────────────────────────────────────────────────────────────────────────────
// Symbol Anchor Building
// ─────────────────────────────────────────────────────────────────────────────

function buildSymbolAnchors(
    center: LocalMapNode,
    upstream: LocalMapNode[],
    downstream: LocalMapNode[],
    edges: LocalMapEdge[]
): LocalMapSymbolAnchor[] {
    const anchors: LocalMapSymbolAnchor[] = [];
    let order = 0;

    // Build anchors for all symbols that have edges
    const relevantSymbols = new Map<string, { nodeId: string; column: LocalMapColumn; direction: "inbound" | "outbound" }>();

    for (const edge of edges) {
        // Source symbol anchors
        if (edge.sourceSymbol) {
            const node = findNodeForId(edge.sourceId, center, upstream, downstream);
            if (node) {
                const key = buildNormalizedAnchorKey(node.id, node.column, edge.direction, edge.sourceSymbol);
                if (!relevantSymbols.has(key)) {
                    relevantSymbols.set(key, {
                        nodeId: node.id,
                        column: node.column,
                        direction: edge.direction
                    });
                }
            }
        }

        // Target symbol anchors
        if (edge.targetSymbol) {
            const node = findNodeForId(edge.targetId, center, upstream, downstream);
            if (node) {
                // Target is on the receiving end, so opposite direction
                const dir = edge.direction === "inbound" ? "outbound" : "inbound";
                const key = buildNormalizedAnchorKey(node.id, node.column, dir, edge.targetSymbol);
                if (!relevantSymbols.has(key)) {
                    relevantSymbols.set(key, {
                        nodeId: node.id,
                        column: node.column,
                        direction: dir
                    });
                }
            }
        }
    }

    // Create anchor entries
    for (const [key, info] of relevantSymbols) {
        const parts = key.split("|");
        const symbol = parts[3] || "";

        anchors.push({
            symbol: symbol,
            normalizedKey: normalizeSymbolIdentifier(symbol),
            nodeId: info.nodeId,
            column: info.column,
            direction: info.direction,
            order: order++
        });
    }

    return anchors;
}

function findNodeForId(
    nodeId: string,
    center: LocalMapNode,
    upstream: LocalMapNode[],
    downstream: LocalMapNode[]
): LocalMapNode | undefined {
    if (center.id === nodeId) return center;
    return upstream.find(n => n.id === nodeId) ?? downstream.find(n => n.id === nodeId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats Computation
// ─────────────────────────────────────────────────────────────────────────────

function computeStats(
    center: LocalMapNode,
    upstream: LocalMapNode[],
    downstream: LocalMapNode[],
    edges: LocalMapEdge[]
): LocalMapStats {
    const allNodes = [center, ...upstream, ...downstream];
    const coveredCount = allNodes.filter(n => n.hasCoverage).length;
    const inheritanceCount = edges.filter(e => e.kind === "extends" || e.kind === "implements").length;
    const typeRefCount = edges.filter(e => e.kind === "type-reference").length;

    return {
        totalNodes: allNodes.length,
        upstreamCount: upstream.length,
        downstreamCount: downstream.length,
        edgeCount: edges.length,
        inheritanceEdgeCount: inheritanceCount,
        typeReferenceEdgeCount: typeRefCount,
        coveredNodeCount: coveredCount
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Coverage Builder (mirrors client-side logic)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build test coverage map from the graph.
 * This mirrors the client-side `buildTestCoverageMap` function.
 */
export function buildTestCoverageMap(
    graphData: ExplorerGraphPayload,
    resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string
): TestCoverageMap {
    const nodesById = new Map(graphData.nodes.map(n => [n.id, n]));
    const coverage = new Map<string, string[]>();

    // Find all test nodes
    const testNodes = graphData.nodes.filter(n => n.archetype === "test");

    for (const testNode of testNodes) {
        // Find nodes this test depends on (targets it tests)
        for (const link of graphData.links) {
            const sourceId = resolveLinkEndpoint(link.source);
            const targetId = resolveLinkEndpoint(link.target);

            // If this test depends on another node, that node is covered
            if (sourceId === testNode.id && targetId !== testNode.id) {
                const targetNode = nodesById.get(targetId);
                if (targetNode && targetNode.archetype !== "test") {
                    if (!coverage.has(targetId)) {
                        coverage.set(targetId, []);
                    }
                    coverage.get(targetId)!.push(testNode.id);
                }
            }
        }

        // Also check explicit dependencies from the test node
        for (const dep of testNode.dependencies) {
            if (dep.resolved && dep.targetId && dep.targetId !== testNode.id) {
                const targetNode = nodesById.get(dep.targetId);
                if (targetNode && targetNode.archetype !== "test") {
                    if (!coverage.has(dep.targetId)) {
                        coverage.set(dep.targetId, []);
                    }
                    const existing = coverage.get(dep.targetId)!;
                    if (!existing.includes(testNode.id)) {
                        existing.push(testNode.id);
                    }
                }
            }
        }
    }

    return coverage;
}

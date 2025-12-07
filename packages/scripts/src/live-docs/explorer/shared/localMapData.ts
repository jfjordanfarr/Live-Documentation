/**
 * @file localMapData.ts
 * @description Headless JSON schema for the Local Map view, enabling:
 * - LLM consumption without image analysis errors
 * - Static site embedding
 * - Programmatic graph queries
 * - Debugging without DOM inspection
 *
 * ## Design Rationale
 *
 * The Local Map is a 3-column view: upstream (dependencies) → center → downstream (dependents).
 * This JSON format captures the computed subgraph, symbol anchors, and edge metadata
 * so the visual renderer becomes a pure function of this data.
 *
 * ## Relationship to ExplorerGraphPayload
 *
 * - `ExplorerGraphPayload` is the full workspace graph
 * - `LocalMapData` is a computed subgraph for a specific focus node
 * - The viewer computes `LocalMapData` from `ExplorerGraphPayload` + focus node ID
 * - Static exports can pre-compute common focus points or generate on-demand
 */

import type {
    ExplorerLinkKind,
    ExplorerNodePayload,
    ExplorerPublicSymbol
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Column & Node Representation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Column role in the 3-column layout.
 * Uses semantic names for clarity and future multi-hop expansion.
 */
export type LocalMapColumn = "upstream" | "center" | "downstream";

/**
 * A node card as it appears in the Local Map.
 * Simpler than full `ExplorerNodePayload` — contains only render-relevant fields.
 */
export interface LocalMapNode {
    /** The node ID (code path). */
    id: string;

    /** Display name (file basename). */
    name: string;

    /** Relative code path for display. */
    codeRelativePath: string;

    /** Relative doc path for linking. */
    docRelativePath: string;

    /** Archetype for styling (implementation, test, config, etc.). */
    archetype: string;

    /** Which column this node appears in. */
    column: LocalMapColumn;

    /** Public symbols exported by this node. */
    publicSymbols: string[];

    /** Extended symbol info with type references (if available). */
    publicSymbolsExtended?: ExplorerPublicSymbol[];

    /** Whether this node has test coverage. */
    hasCoverage: boolean;

    /** Test files covering this node (if any). */
    coveringTests?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Edge Representation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * An edge in the Local Map connecting two nodes.
 * Includes symbol-level anchoring for precise connection rendering.
 */
export interface LocalMapEdge {
    /** Source node ID. */
    sourceId: string;

    /** Target node ID. */
    targetId: string;

    /** Edge direction relative to center node. */
    direction: "inbound" | "outbound";

    /** Relationship kind for styling (dependency, extends, implements, type-reference). */
    kind: ExplorerLinkKind;

    /** Symbol on the source node (e.g., the class that extends). */
    sourceSymbol?: string;

    /** Symbol on the target node (e.g., the parent class being extended). */
    targetSymbol?: string;

    /** Human-readable label for the connection. */
    label?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Symbol Anchors (for connection routing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A symbol anchor point for edge connection routing.
 * In the DOM, this corresponds to a `.symbol-item` element's position.
 */
export interface LocalMapSymbolAnchor {
    /** The symbol name. */
    symbol: string;

    /** Normalized key for matching (lowercase, trimmed). */
    normalizedKey: string;

    /** The node this symbol belongs to. */
    nodeId: string;

    /** Which column the anchor is in. */
    column: LocalMapColumn;

    /** Connection direction (inbound edge enters, outbound edge exits). */
    direction: "inbound" | "outbound";

    /** Visual order within the column (for layout hints). */
    order: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete Local Map data for a focus node.
 *
 * This is the JSON payload that:
 * - Powers the visual Local Map renderer
 * - Feeds LLM prompts for understanding node relationships
 * - Enables static site embedding
 * - Supports debugging without DOM inspection
 *
 * @example
 * ```json
 * {
 *   "focusNodeId": "packages/server/src/main.ts",
 *   "center": { ... },
 *   "upstream": [ ... ],
 *   "downstream": [ ... ],
 *   "edges": [ ... ],
 *   "symbolAnchors": [ ... ],
 *   "stats": { ... }
 * }
 * ```
 */
export interface LocalMapData {
    /**
     * The ID of the focus node (code path).
     */
    focusNodeId: string;

    /**
     * The center node (the focus of this Local Map).
     */
    center: LocalMapNode;

    /**
     * Upstream nodes (dependencies of the focus node).
     * These are in the "left" column visually.
     */
    upstream: LocalMapNode[];

    /**
     * Downstream nodes (dependents of the focus node).
     * These are in the "right" column visually.
     */
    downstream: LocalMapNode[];

    /**
     * All edges in this subgraph.
     */
    edges: LocalMapEdge[];

    /**
     * Symbol anchors for edge routing.
     * Pre-computed for static rendering; live rendering may compute dynamically.
     */
    symbolAnchors: LocalMapSymbolAnchor[];

    /**
     * Summary statistics.
     */
    stats: LocalMapStats;

    /**
     * Generation metadata.
     */
    metadata: LocalMapMetadata;
}

/**
 * Statistics about the Local Map subgraph.
 */
export interface LocalMapStats {
    /** Total nodes (upstream + center + downstream). */
    totalNodes: number;

    /** Number of upstream (dependency) nodes. */
    upstreamCount: number;

    /** Number of downstream (dependent) nodes. */
    downstreamCount: number;

    /** Number of edges. */
    edgeCount: number;

    /** Number of extends/implements inheritance edges. */
    inheritanceEdgeCount: number;

    /** Number of type-reference edges. */
    typeReferenceEdgeCount: number;

    /** Number of nodes with test coverage. */
    coveredNodeCount: number;
}

/**
 * Metadata about when/how this Local Map was generated.
 */
export interface LocalMapMetadata {
    /** ISO 8601 timestamp. */
    generatedAt: string;

    /** Schema version for forward compatibility. */
    schemaVersion: number;

    /** Optional: commit hash if generated from a specific version. */
    commitHash?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Current Local Map schema version.
 */
export const LOCAL_MAP_SCHEMA_VERSION = 1;

/**
 * Options for building a Local Map from the full graph.
 */
export interface BuildLocalMapOptions {
    /** The node ID to focus on. */
    focusNodeId: string;

    /** Include extended symbol information. */
    includeExtendedSymbols?: boolean;

    /** Include symbol anchors (for static rendering). */
    includeSymbolAnchors?: boolean;

    /** Optional commit hash for provenance. */
    commitHash?: string;
}

/**
 * Normalize a symbol identifier for anchor matching.
 * Mirrors the client-side `normalizeSymbolIdentifier` function.
 */
export function normalizeSymbolIdentifier(raw: string): string {
    return raw
        .replace(/<[^>]*>/g, "") // Strip generic parameters
        .replace(/\([^)]*\)/g, "") // Strip function parameters
        .replace(/\s+/g, "") // Remove whitespace
        .toLowerCase()
        .trim();
}

/**
 * Build a normalized anchor key for symbol matching.
 */
export function buildNormalizedAnchorKey(
    nodeId: string,
    column: LocalMapColumn,
    direction: "inbound" | "outbound",
    symbol?: string
): string {
    const normalizedSymbol = symbol ? normalizeSymbolIdentifier(symbol) : "";
    return `${nodeId}|${column}|${direction}|${normalizedSymbol}`;
}

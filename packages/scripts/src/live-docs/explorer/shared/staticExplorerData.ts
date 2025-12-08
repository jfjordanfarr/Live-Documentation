/**
 * @file staticExplorerData.ts
 * @description Schema for the Static Explorer JSON format, enabling zero-server
 * distribution of the Live Documentation Explorer via GitHub Pages, Teams Cards,
 * downloadable bundles, or any static hosting platform.
 *
 * ## Design Rationale
 *
 * The Static Explorer extends the existing `ExplorerGraphPayload` with:
 * - **Provenance metadata** for reproducibility and audit trails
 * - **View-specific payloads** so the client can render Circuit Board, Local Map,
 *   and Force Graph views without a server
 * - **Symbol index** for fast client-side search and anchor resolution
 * - **Configuration hints** so the viewer adapts to the workspace context
 *
 * ## Distribution Scenarios
 *
 * 1. **GitHub Pages**: Alongside Layer-1 markdown, enabling "Explore" links
 * 2. **Hosted Showcase Bundle**: Part of the downloadable artifact (REQ-H1)
 * 3. **Teams Card Embedding**: JSON URL + lightweight viewer for chat previews
 * 4. **Offline Analysis**: Saved snapshots for disconnected environments
 *
 * ## Relationship to Existing Types
 *
 * - `ExplorerGraphPayload` remains the runtime format for server ↔ client
 * - `StaticExplorerData` wraps the graph with distribution metadata
 * - The viewer detects static mode by checking for embedded data or JSON URL
 *
 * @see ../server/graph.ts for the graph builder that populates this data
 * @see ../../visualize-static.ts for the planned static bundle emitter
 */

import type {
    ExplorerGraphPayload,
    ExplorerNodePayload,
    ExplorerPublicSymbol,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Provenance & Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Provenance metadata for reproducibility and audit trails.
 *
 * @remarks
 * Every static bundle includes provenance so consumers can:
 * - Verify the bundle matches a known commit
 * - Reproduce the analysis locally using the same analyzer version
 * - Trace discrepancies back to specific configurations
 */
export interface StaticExplorerProvenance {
    /** ISO 8601 timestamp when the bundle was generated. */
    generatedAt: string;

    /** Git commit hash (full SHA) of the analyzed workspace. */
    commitHash?: string;

    /** Git branch or tag reference (e.g., "main", "v1.2.0"). */
    gitRef?: string;

    /** Version of the Live Docs generator that produced this bundle. */
    generatorVersion: string;

    /** Analyzer versions keyed by language ID (e.g., { typescript: "1.0.0" }). */
    analyzerVersions: Record<string, string>;

    /** The Live Documentation configuration used during generation. */
    configSnapshot?: {
        baseLayer: string;
        slugDialect: string;
        excludePatterns?: string[];
    };
}

/**
 * Viewer configuration hints embedded in the bundle.
 *
 * @remarks
 * Allows the static viewer to adapt to workspace-specific preferences
 * without requiring external configuration files.
 */
export interface StaticExplorerViewerConfig {
    /** Default view to display on load (circuit, local, force). */
    defaultView: "circuit" | "local" | "force";

    /** Initial node to focus in Local Map view (code path). */
    initialFocusNode?: string;

    /** Theme preference (respects system by default). */
    theme?: "light" | "dark" | "system";

    /** Whether to enable keyboard navigation hints on first load. */
    showKeyboardHints?: boolean;

    /** Base URL for "Open in VS Code" links (vscode://file/...). */
    vscodeBaseUrl?: string;

    /** Base URL for external documentation links. */
    docsBaseUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Symbol Index (Fast Client-Side Search)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * An entry in the symbol index for fast client-side lookup.
 */
export interface StaticExplorerSymbolEntry {
    /** The symbol name (e.g., "ExplorerGraphPayload"). */
    name: string;

    /** The node ID (code path) containing this symbol. */
    nodeId: string;

    /** The anchor slug within the Live Doc (e.g., "explorergraphpayload"). */
    anchorSlug: string;

    /** Symbol kind for filtering (function, class, interface, etc.). */
    kind?: string;

    /** Extended symbol data if available. */
    extended?: ExplorerPublicSymbol;
}

/**
 * Pre-computed symbol index for client-side search and navigation.
 *
 * @remarks
 * The index enables:
 * - Fast fuzzy search across all symbols without server roundtrips
 * - Click-to-navigate from type references in Local Map
 * - Anchor resolution for deep links
 */
export interface StaticExplorerSymbolIndex {
    /** All symbols flattened for search. */
    entries: StaticExplorerSymbolEntry[];

    /** Count of symbols by kind for UI badges. */
    countsByKind: Record<string, number>;

    /** Total symbol count. */
    total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// View-Specific Payloads (Optional Pre-Computation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pre-computed treemap layout for Circuit Board view.
 *
 * @remarks
 * Optional optimization: if present, the client skips layout computation.
 * Useful for very large workspaces where client-side d3-treemap is slow.
 */
export interface StaticExplorerTreemapLayout {
    /** Hierarchical structure with computed positions. */
    root: StaticExplorerTreemapNode;
    /** Layout algorithm identifier for reproducibility. */
    algorithm: "squarify" | "slice" | "dice" | "sliceDice";
    /** Viewport dimensions used during computation. */
    viewport: { width: number; height: number };
}

/**
 * A node in the pre-computed treemap hierarchy.
 */
export interface StaticExplorerTreemapNode {
    /** Node ID (folder path or code path). */
    id: string;
    /** Display name. */
    name: string;
    /** Computed position and size. */
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    /** Depth in hierarchy (0 = root). */
    depth: number;
    /** Children for folder nodes. */
    children?: StaticExplorerTreemapNode[];
    /** Reference to the full node payload for files. */
    nodeId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The complete Static Explorer data bundle.
 *
 * @remarks
 * This is the top-level schema for the JSON file emitted by
 * `npm run live-docs:visualize --static` or included in hosted showcase bundles.
 *
 * **File Structure**
 *
 * When distributed as files:
 * ```
 * explorer/
 *   index.html          # Viewer HTML (can load from CDN or inline)
 *   explorer-data.json  # This schema
 *   assets/             # Optional: CSS, JS if not using CDN
 * ```
 *
 * **Embedding**
 *
 * The viewer supports three loading modes:
 * 1. **Inline**: Data embedded as `<script id="explorer-data">` JSON
 * 2. **Fetch**: Data loaded from `explorer-data.json` relative URL
 * 3. **Remote**: Data loaded from configurable URL (Teams Card scenario)
 *
 * @example
 * ```json
 * {
 *   "version": "1.0.0",
 *   "schemaVersion": 1,
 *   "provenance": { ... },
 *   "graph": { ... },
 *   "symbolIndex": { ... },
 *   "viewerConfig": { ... }
 * }
 * ```
 */
export interface StaticExplorerData {
    /**
     * Bundle format version (semver).
     * Allows viewers to handle backward-compatible changes gracefully.
     */
    version: string;

    /**
     * Schema version (integer).
     * Incremented on breaking changes; viewers reject unknown schema versions.
     */
    schemaVersion: number;

    /**
     * Provenance metadata for reproducibility.
     */
    provenance: StaticExplorerProvenance;

    /**
     * The full graph payload (nodes, links, stats).
     * This is the same format as the server's `/api/graph` response.
     */
    graph: ExplorerGraphPayload;

    /**
     * Pre-computed symbol index for fast search.
     */
    symbolIndex: StaticExplorerSymbolIndex;

    /**
     * Full Live Doc markdown content keyed by node ID.
     * Enables complete documentation viewing without server access.
     * 
     * @remarks
     * The key is the node ID (code relative path), and the value is the
     * complete markdown content of the Live Doc file. This enables the
     * detail panel to render full documentation with proper formatting.
     */
    docs?: Record<string, string>;

    /**
     * Viewer configuration hints.
     */
    viewerConfig?: StaticExplorerViewerConfig;

    /**
     * Optional pre-computed treemap layout.
     * Omit for small workspaces; include for large graphs.
     */
    treemapLayout?: StaticExplorerTreemapLayout;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Types for Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for building a static explorer bundle.
 */
export interface StaticExplorerBuildOptions {
    /** Include pre-computed treemap layout (increases file size). */
    includeTreemapLayout?: boolean;

    /** Treemap viewport dimensions if layout is included. */
    treemapViewport?: { width: number; height: number };

    /** Custom viewer configuration overrides. */
    viewerConfig?: Partial<StaticExplorerViewerConfig>;

    /** Pretty-print JSON output (increases file size, aids debugging). */
    prettyPrint?: boolean;
}

/**
 * Build a symbol index from graph nodes.
 *
 * @param nodes - The graph nodes to index.
 * @returns A complete symbol index ready for client-side search.
 */
export function buildSymbolIndex(
    nodes: ExplorerNodePayload[]
): StaticExplorerSymbolIndex {
    const entries: StaticExplorerSymbolEntry[] = [];
    const countsByKind: Record<string, number> = {};

    for (const node of nodes) {
        // Index extended symbols if available
        if (node.publicSymbolsExtended) {
            for (const sym of node.publicSymbolsExtended) {
                const kind = extractSymbolKind(sym.name, node.archetype);
                entries.push({
                    name: sym.name,
                    nodeId: node.id,
                    anchorSlug: toAnchorSlug(sym.name),
                    kind,
                    extended: sym,
                });
                countsByKind[kind] = (countsByKind[kind] || 0) + 1;
            }
        } else {
            // Fall back to simple symbol names
            for (const name of node.publicSymbols) {
                const kind = extractSymbolKind(name, node.archetype);
                entries.push({
                    name,
                    nodeId: node.id,
                    anchorSlug: toAnchorSlug(name),
                    kind,
                });
                countsByKind[kind] = (countsByKind[kind] || 0) + 1;
            }
        }
    }

    return {
        entries,
        countsByKind,
        total: entries.length,
    };
}

/**
 * Convert a symbol name to an anchor slug (GitHub dialect by default).
 */
function toAnchorSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

/**
 * Infer symbol kind from name patterns and archetype.
 * This is a heuristic; precise kind detection requires analyzer metadata.
 */
function extractSymbolKind(name: string, archetype: string): string {
    // Class-like patterns
    if (/^[A-Z][a-z]/.test(name) && !name.includes("_")) {
        if (name.startsWith("I") && /^I[A-Z]/.test(name)) {
            return "interface";
        }
        return "class";
    }
    // Constant patterns
    if (/^[A-Z_]+$/.test(name)) {
        return "constant";
    }
    // Function patterns (camelCase starting lowercase)
    if (/^[a-z]/.test(name)) {
        return "function";
    }
    // Default based on archetype
    if (archetype === "test") {
        return "test";
    }
    return "symbol";
}

/**
 * Current schema version. Increment on breaking changes.
 */
export const STATIC_EXPLORER_SCHEMA_VERSION = 1;

/**
 * Current bundle format version.
 */
export const STATIC_EXPLORER_VERSION = "1.0.0";

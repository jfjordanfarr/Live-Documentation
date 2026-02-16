/**
 * Discriminant for the relationship kind carried on explorer graph edges.
 *
 * The core values (`"dependency"`, `"extends"`, `"implements"`) correspond to
 * the relationship kinds the Live Doc parser extracts from markdown dependency
 * bullets and symbol documentation. The branded `string &` intersection allows
 * future link kinds to flow through without breaking existing switch statements.
 *
 * @remarks
 * Created 2025-11-21 as a plain `string` in the original monolithic explorer
 * script; narrowed to a branded union on 2025-11-25 when symbol-level edge
 * metadata was threaded through the pipeline to honour the headless/UI parity
 * principle. Was the subject of a barrel-file resolution bug (2025-12-18)
 * where the symbol index resolved it to `index.ts` instead of this file.
 */
export type ExplorerLinkKind =
    | "dependency"
    | "extends"
    | "implements"
    | (string & { readonly __explorerLinkKindBrand?: never });

/**
 * A single dependency edge from the perspective of the owning node.
 *
 * Replaces the original bare `string[]` dependency representation that existed
 * prior to 2025-11-25. The user's assertion of headless/UI parity on 2025-11-24
 * drove the refactor: the UI must surface everything the Live Doc encodes,
 * including the target symbol anchor, originating source symbol, link kind,
 * and whether the target could be resolved to a known graph node.
 *
 * @remarks
 * `raw` preserves the verbatim markdown link source text,
 * while `label` is the human-readable display name. `resolved` is `false` when
 * the target path could not be matched to any node in the graph — these edges
 * populate `missingDependencies` on the node payload.
 */
export interface ExplorerDependencyReference {
    targetId?: string;
    targetDocPath?: string;
    targetSymbol?: string;
    /** Symbol on this file that references the target */
    sourceSymbol?: string;
    label: string;
    raw: string;
    resolved: boolean;
    kind: ExplorerLinkKind;
}

/**
 * Represents a type reference for a public symbol, enabling type-aware navigation.
 *
 * @remarks
 * When a symbol's return type, parameter type, or inheritance clause references
 * a type defined in another Live Doc, we capture this information to enable
 * click-to-navigate in the Local Map view.
 */
export interface ExplorerTypeReference {
    /** The name of the referenced type (e.g., "Widget", "Config"). */
    typeName: string;
    /** The role of this type in the symbol's signature. */
    role: "return" | "parameter" | "extends" | "implements" | "constraint";
    /** For parameter types, the name of the parameter. */
    parameterName?: string;
    /** Whether this type resolves to a Live Doc in the workspace. */
    isResolved: boolean;
    /** The target node ID (code path) if resolved. */
    targetId?: string;
    /** The anchor slug within the target Live Doc. */
    targetAnchor?: string;
}

/**
 * Extended symbol information including type references.
 */
export interface ExplorerPublicSymbol {
    /** The symbol name. */
    name: string;
    /** Type references extracted from the symbol's signature. */
    typeReferences?: ExplorerTypeReference[];
}

/**
 * The full payload for a single node in the explorer graph.
 *
 * Serialised to JSON by the explorer HTTP server and consumed by the client
 * to render the Circuit Board treemap, Force Graph, and Local Map views.
 * Each node maps 1:1 to a tracked workspace artifact and its corresponding
 * Live Doc.
 *
 * @remarks
 * Originally defined inline in the monolithic `visualize-explorer.ts` on
 * 2025-11-21 with `dependencies: string[]`. Extended on 2025-11-25 with
 * structured `ExplorerDependencyReference` and `missingDependencies` to
 * honour headless/UI parity. `publicSymbolsExtended` was added 2025-12-05
 * for type-reference navigation in the Local Map.
 */
export interface ExplorerNodePayload {
    id: string;
    name: string;
    codePath: string;
    codeRelativePath: string;
    docPath: string;
    docRelativePath: string;
    archetype: string;
    dependencies: ExplorerDependencyReference[];
    dependents: string[];
    missingDependencies: ExplorerDependencyReference[];
    /** Simple symbol names for backward compatibility. */
    publicSymbols: string[];
    /** Extended symbol information with type references. */
    publicSymbolsExtended?: ExplorerPublicSymbol[];
    symbolDocumentation: Record<string, unknown> | undefined;
}

/**
 * A directed edge in the explorer graph, connecting two node IDs.
 *
 * `source` and `target` are node IDs (code paths) or objects carrying an `id`
 * property — the dual representation accommodates both raw JSON and D3's
 * force-simulation node references which replace string IDs with object refs.
 *
 * @remarks
 * Originally `source: string; target: string; kind: string;` on 2025-11-21.
 * `sourceSymbol`/`targetSymbol` were added on 2025-11-25 to carry symbol-level
 * anchor information, enabling the Local Map to highlight individual symbols
 * in the dependency columns rather than just file-level cards.
 */
export interface ExplorerLinkPayload {
    source: string | { id: string };
    target: string | { id: string };
    kind: ExplorerLinkKind;
    sourceSymbol?: string;
    targetSymbol?: string;
}

/**
 * Summary statistics for the explorer graph, rendered in the Circuit Board
 * header and used by the static builder to emit a quick-access overview.
 */
export interface ExplorerGraphStats {
    nodes: number;
    links: number;
    missingDependencies: number;
}

/**
 * Top-level payload returned by the explorer server's `/graph` endpoint.
 *
 * Contains the complete graph (all nodes and edges) plus summary statistics.
 * Also serialised to `dist/explorer/explorer-data.json` by the static builder
 * for offline/GitHub Pages deployment.
 */
export interface ExplorerGraphPayload {
    nodes: ExplorerNodePayload[];
    links: ExplorerLinkPayload[];
    stats: ExplorerGraphStats;
}

/**
 * Payload returned by the explorer server's `/detail?nodeId=<path>` endpoint.
 *
 * Provides the full detail for a single node — intended for the right-panel
 * detail view in the Local Map. Includes the authored markdown (Purpose,
 * Notes, etc.) and all structured metadata the Live Doc encodes.
 *
 * @remarks
 * Added on 2026-01-03 as part of the "Full Authored rendering, archetype
 * badges, markdown download" feature. The `purpose` field is deprecated in
 * favour of the richer `authored` field which preserves the full authored
 * section markdown.
 */
export interface ExplorerDetailPayload {
    archetype: string;
    /** @deprecated Use authored instead. Kept for backward compatibility. */
    purpose: string;
    /** Full authored section markdown (Purpose, Notes, etc.) */
    authored: string;
    /** ISO timestamp when the Live Doc was generated */
    generatedAt?: string;
    publicSymbols: string[];
    dependencies: ExplorerDependencyReference[];
    dependents: string[];
    missingDependencies: ExplorerDependencyReference[];
    docRelativePath: string;
    codeRelativePath: string;
    symbolDocumentation: Record<string, unknown> | undefined;
}

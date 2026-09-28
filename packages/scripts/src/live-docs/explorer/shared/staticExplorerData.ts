/**
 * What the Explorer bundle holds: `explorer-data.json` as the static builder
 * writes it and the client reads it.
 */

import type { LiveDocGraph } from "@live-documentation/shared/live-docs/graph";

/** The bundle. */
export interface StaticExplorerData {
    /** The derived graph index, as the generator writes it to `<root>/index.json`. */
    graph: LiveDocGraph;

    /**
     * Markdown files that Live Docs link to, keyed by workspace-relative path,
     * so they can be read offline: READMEs, design notes, specifications.
     */
    bundledMarkdown?: Record<string, string>;

    /** Directory tree of the bundled markdown, for the Knowledge Sources view. */
    bundledMarkdownTree?: BundledMarkdownTreeNode;

    /** Which Live Doc links to which bundled file, for the Force Graph's related-documentation edges. */
    relatedDocLinks?: RelatedDocLink[];
}

/**
 * A node in the bundled markdown directory tree.
 */
export interface BundledMarkdownTreeNode {
    /** Display name (folder or file name). */
    name: string;

    /** Workspace-relative path. */
    path: string;

    /** Whether this is a folder or file. */
    type: "folder" | "file";

    /** Category for grouping (currently just 'markdown' for all files). */
    category?: "markdown";

    /** Children for folder nodes. */
    children?: BundledMarkdownTreeNode[];
}

/**
 * A link from a Live Doc to a bundled markdown file.
 * Used to render Related Documentation edges in the Force Graph view.
 *
 * @remarks
 * These links are directional: a Live Doc references a bundled document.
 * However, the Force Graph renders them as undirected edges for visual clarity.
 * The `related:` prefix on target IDs distinguishes bundled docs from Live Doc nodes.
 */
export interface RelatedDocLink {
    /** Source node ID (Live Doc code path). */
    sourceId: string;

    /** Target bundled doc path (becomes node ID with `related:` prefix in Force Graph). */
    targetPath: string;
}

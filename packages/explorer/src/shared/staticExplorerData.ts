/**
 * What the Explorer bundle holds: `explorer-data.json` as the static builder
 * writes it and the client reads it.
 */

import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import type { HistoryHead } from "@live-documentation/engine/live-docs/history/format";

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

    /** The board the World Map draws, as its text and its workspace-relative path, so that the client parses and joins it itself. */
    board?: BundledBoard;

    /**
     * The configuration's sample roots: workspace-relative directories whose
     * programs are inputs to the tool, not the scanned system's own code. The
     * Knowledge Sources panel groups their entry points apart, and the landing
     * leaves them out when it chooses where to open.
     */
    sampleRoots?: string[];

    /**
     * The history file that rides beside this one when the export carries
     * one, for the client to fetch when the history is asked for, so that a
     * page without it is no slower: the file's name, and what its sequence says
     * of itself (its lens, its source, its window and where its knowledge
     * begins and ends).
     */
    history?: BundledHistory;
}

/** The history a bundle carries: the file beside `explorer-data.json` and its sequence's head. */
export interface BundledHistory {
    file: string;
    head: HistoryHead;
}

/** A board's text, verbatim, and where it sits in the workspace. */
export interface BundledBoard {
    path: string;
    text: string;
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
 * Which way a file and a document are related: the file's doc cites the
 * document in its authored words, or the document cites the file in its own
 * links, which the doc's `Cited By` section records (2026-10-22). The two are
 * kept apart everywhere a person sees them, since the direction is a fact.
 */
export type RelatedDocDirection = "cites" | "cited-by";

/**
 * A link between a file and a bundled markdown document, one way or the other.
 * Used to render Related Documentation edges in the Force Graph view.
 *
 * @remarks
 * The `related:` prefix on target IDs distinguishes bundled docs from Live Doc nodes.
 */
export interface RelatedDocLink {
    /** Source node ID (Live Doc code path). */
    sourceId: string;

    /** Target bundled doc path (becomes node ID with `related:` prefix in Force Graph). */
    targetPath: string;

    /** Whether the file cites the document or the document cites the file. */
    direction: RelatedDocDirection;
}

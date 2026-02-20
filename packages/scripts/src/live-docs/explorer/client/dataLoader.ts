/**
 * Bundled Docs Data Loader
 *
 * Handles lazy-loading of bundled documentation from the server endpoint
 * (server mode) or returning embedded data (static mode).
 *
 * Extracted from index.ts during the Feb 2026 refactor to reduce the
 * monolith below the 1000-line threshold.
 */

import type { BundledDocsData } from "./panels/sources-view";
import type { BundledMarkdownTreeNode, RelatedDocLink } from "../shared/staticExplorerData";

// ─────────────────────────────────────────────────────────────────────────
// Server Bundled Docs State
// ─────────────────────────────────────────────────────────────────────────

/** Tracks the lazy-loading state for server-fetched bundled documentation. */
export interface ServerBundledDocsState {
  loaded: boolean;
  loading: boolean;
  tree?: BundledMarkdownTreeNode;
  paths?: string[];
  count?: number;
  relatedDocLinks?: RelatedDocLink[];
  error?: string;
}

/** Options for creating the data loader. */
export interface DataLoaderOptions {
  /** Whether the explorer is running in static (embedded) mode. */
  isStaticMode: boolean;
  /** Pre-embedded bundled markdown tree (static mode only). */
  bundledMarkdownTree?: BundledMarkdownTreeNode;
  /** Pre-embedded bundled markdown content map (static mode only). */
  bundledMarkdown?: Record<string, string>;
  /** Pre-embedded related doc links (static or server mode initial data). */
  relatedDocLinks?: RelatedDocLink[];
}

/** Public API for the data loader. */
export interface DataLoaderApi {
  /** The mutable server bundled docs state (for filter/download consumers). */
  readonly serverBundledDocs: ServerBundledDocsState;
  /** Load bundled docs tree; returns cached result if already loaded. */
  loadServerBundledDocs(): Promise<BundledDocsData | undefined>;
  /** Fetch a specific bundled doc's markdown content. */
  fetchBundledDocContent(docPath: string): Promise<string | undefined>;
}

/**
 * Creates a data loader that manages bundled documentation fetching.
 *
 * In static mode, returns embedded data immediately.
 * In server mode, lazily fetches from `/bundled-docs` on first access.
 */
export function createDataLoader(options: DataLoaderOptions): DataLoaderApi {
  const { isStaticMode, bundledMarkdownTree, bundledMarkdown, relatedDocLinks } = options;

  const serverBundledDocs: ServerBundledDocsState = {
    loaded: isStaticMode,
    loading: false,
    relatedDocLinks
  };

  async function loadServerBundledDocs(): Promise<BundledDocsData | undefined> {
    if (isStaticMode && bundledMarkdownTree) {
      return {
        tree: bundledMarkdownTree,
        count: bundledMarkdown ? Object.keys(bundledMarkdown).length : 0
      };
    }

    if (serverBundledDocs.loaded) {
      if (serverBundledDocs.tree) {
        return { tree: serverBundledDocs.tree, count: serverBundledDocs.count ?? 0 };
      }
      return undefined;
    }

    if (serverBundledDocs.loading) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return loadServerBundledDocs();
    }

    serverBundledDocs.loading = true;
    try {
      const response = await fetch("/bundled-docs");
      if (!response.ok) {
        throw new Error(`Failed to load bundled docs (${response.status})`);
      }
      const data = await response.json() as {
        tree: BundledMarkdownTreeNode;
        paths: string[];
        count: number;
        relatedDocLinks?: RelatedDocLink[];
      };
      serverBundledDocs.tree = data.tree;
      serverBundledDocs.paths = data.paths;
      serverBundledDocs.count = data.count;
      serverBundledDocs.relatedDocLinks = data.relatedDocLinks;
      serverBundledDocs.loaded = true;
      serverBundledDocs.loading = false;
      return { tree: data.tree, count: data.count };
    } catch (error) {
      serverBundledDocs.error = error instanceof Error ? error.message : "Unknown error";
      serverBundledDocs.loaded = true;
      serverBundledDocs.loading = false;
      console.error("Failed to load bundled docs:", error);
      return undefined;
    }
  }

  async function fetchBundledDocContent(docPath: string): Promise<string | undefined> {
    if (isStaticMode && bundledMarkdown) {
      return bundledMarkdown[docPath];
    }

    try {
      const response = await fetch(`/bundled-docs?path=${encodeURIComponent(docPath)}`);
      if (!response.ok) {
        return undefined;
      }
      return await response.text();
    } catch {
      return undefined;
    }
  }

  return {
    serverBundledDocs,
    loadServerBundledDocs,
    fetchBundledDocContent
  };
}

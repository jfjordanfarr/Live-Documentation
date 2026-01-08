/**
 * @file staticBuilder.ts
 * @description Builds static explorer bundles for distribution without a server.
 *
 * ## Usage
 *
 * ```typescript
 * const bundle = await buildStaticExplorer({
 *   workspaceRoot: process.cwd(),
 *   outputDir: './dist/explorer',
 *   includeLocalMaps: ['packages/server/src/main.ts'] // Optional: pre-compute specific focus nodes
 * });
 * ```
 *
 * ## Output Structure
 *
 * ```
 * dist/explorer/
 *   index.html           # Standalone viewer
 *   explorer-data.json   # Full graph + metadata
 *   local-maps/          # Pre-computed Local Maps (optional)
 *     packages-server-src-main-ts.json
 * ```
 */
import * as fs from "fs/promises";
import * as path from "path";

import type { LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";

import {
    buildLocalMapData,
    buildTestCoverageMap
} from "./localMapBuilder";
import type { LocalMapData } from "./localMapData";
import {
    buildSymbolIndex,
    STATIC_EXPLORER_SCHEMA_VERSION,
    STATIC_EXPLORER_VERSION
} from "./staticExplorerData";
import type {
    BundledMarkdownTreeNode,
    StaticExplorerBuildOptions,
    StaticExplorerData,
    StaticExplorerProvenance
} from "./staticExplorerData";
import type { ExplorerLinkPayload } from "./types";

// Lazy imports to avoid circular dependency issues
const buildExplorerAssetsModule = async () => (await import("../server/buildAssets")).buildExplorerAssets;
const buildExplorerGraphModule = async () => (await import("../server/graph")).buildExplorerGraph;

// ─────────────────────────────────────────────────────────────────────────────
// Build Options
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildStaticExplorerOptions {
    /** Workspace root directory. */
    workspaceRoot: string;

    /** Output directory for the static bundle. */
    outputDir: string;

    /** Live Docs configuration override controlling where docs are read from. */
    config?: LiveDocumentationConfig;

    /** Pre-compute Local Maps for these focus node IDs. */
    includeLocalMaps?: string[];

    /** Include all nodes as pre-computed Local Maps (can be large). */
    includeAllLocalMaps?: boolean;

    /** Static explorer build options. */
    buildOptions?: StaticExplorerBuildOptions;

    /** Git commit hash for provenance. */
    commitHash?: string;

    /** Git branch/tag reference. */
    gitRef?: string;

    /** Logger for progress output. */
    logger?: Pick<Console, "log" | "error">;
}

export interface BuildStaticExplorerResult {
    /** Path to the output directory. */
    outputDir: string;

    /** Path to the main data file. */
    dataFile: string;

    /** Paths to pre-computed Local Map files. */
    localMapFiles: string[];

    /** Statistics about the build. */
    stats: {
        nodeCount: number;
        linkCount: number;
        symbolCount: number;
        localMapCount: number;
        totalSizeBytes: number;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a complete static explorer bundle.
 */
export async function buildStaticExplorer(
    options: BuildStaticExplorerOptions
): Promise<BuildStaticExplorerResult> {
    const {
        workspaceRoot,
        outputDir,
        includeLocalMaps = [],
        includeAllLocalMaps = false,
        buildOptions = {},
        config,
        commitHash,
        gitRef,
        logger = console
    } = options;

    logger.log(`Building static explorer for ${workspaceRoot}...`);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    const localMapsDir = path.join(outputDir, "local-maps");

    // Lazy load server modules
    const buildExplorerGraph = await buildExplorerGraphModule();
    const buildExplorerAssets = await buildExplorerAssetsModule();

    // Build the graph
    logger.log("Building explorer graph...");
    const graph = await buildExplorerGraph(workspaceRoot, config);
    logger.log(`Graph: ${graph.stats.nodes} nodes, ${graph.stats.links} links`);

    // Build test coverage map
    const resolveLinkEndpoint = (endpoint: ExplorerLinkPayload["source"]): string => {
        if (typeof endpoint === "string") return endpoint;
        if (endpoint && typeof endpoint === "object" && "id" in endpoint) {
            return typeof endpoint.id === "string" ? endpoint.id : "";
        }
        return "";
    };
    const testCoverage = buildTestCoverageMap(graph, resolveLinkEndpoint);

    // Build provenance
    const provenance = buildProvenance(commitHash, gitRef);

    // Build symbol index
    logger.log("Building symbol index...");
    const symbolIndex = buildSymbolIndex(graph.nodes);
    logger.log(`Indexed ${symbolIndex.total} symbols`);

    // Read all Live Doc markdown content
    logger.log("Reading Live Doc content...");
    const docs: Record<string, string> = {};
    let docsRead = 0;
    for (const node of graph.nodes) {
        try {
            const absoluteDocPath = path.resolve(workspaceRoot, node.docPath);
            const content = await fs.readFile(absoluteDocPath, "utf-8");
            docs[node.id] = content;
            docsRead++;
        } catch {
            // Skip nodes where we can't read the doc (e.g., missing files)
        }
    }
    logger.log(`Read ${docsRead} Live Docs`);

    // Scan Live Docs for markdown links and bundle referenced files
    logger.log("Scanning for referenced markdown files...");
    const liveDocPaths = new Map<string, string>();
    for (const node of graph.nodes) {
        liveDocPaths.set(node.id, node.docPath);
    }
    const { bundledMarkdown, bundledMarkdownTree } = await scanAndBundleMarkdown(
        docs,
        workspaceRoot,
        liveDocPaths,
        2, // maxDepth
        logger
    );

    // Build the main static data
    const staticData: StaticExplorerData = {
        version: STATIC_EXPLORER_VERSION,
        schemaVersion: STATIC_EXPLORER_SCHEMA_VERSION,
        provenance,
        graph,
        symbolIndex,
        docs,
        bundledMarkdown: Object.keys(bundledMarkdown).length > 0 ? bundledMarkdown : undefined,
        bundledMarkdownTree: Object.keys(bundledMarkdown).length > 0 ? bundledMarkdownTree : undefined,
        viewerConfig: buildOptions.viewerConfig as StaticExplorerData["viewerConfig"]
    };

    // Write the main data file
    const dataFile = path.join(outputDir, "explorer-data.json");
    const jsonContent = buildOptions.prettyPrint
        ? JSON.stringify(staticData, null, 2)
        : JSON.stringify(staticData);
    await fs.writeFile(dataFile, jsonContent, "utf-8");
    logger.log(`Wrote ${dataFile} (${formatBytes(jsonContent.length)})`);

    // Build Local Maps if requested
    const localMapFiles: string[] = [];
    const nodesToMap = includeAllLocalMaps
        ? graph.nodes.map(n => n.id)
        : includeLocalMaps;

    if (nodesToMap.length > 0) {
        await fs.mkdir(localMapsDir, { recursive: true });
        logger.log(`Building ${nodesToMap.length} Local Maps...`);

        for (const nodeId of nodesToMap) {
            const localMap = buildLocalMapData(graph, testCoverage, {
                focusNodeId: nodeId,
                includeExtendedSymbols: true,
                includeSymbolAnchors: true,
                commitHash
            });

            if (localMap) {
                const filename = nodeIdToFilename(nodeId);
                const localMapFile = path.join(localMapsDir, filename);
                const localMapJson = buildOptions.prettyPrint
                    ? JSON.stringify(localMap, null, 2)
                    : JSON.stringify(localMap);
                await fs.writeFile(localMapFile, localMapJson, "utf-8");
                localMapFiles.push(localMapFile);
            }
        }
        logger.log(`Wrote ${localMapFiles.length} Local Map files`);
    }

    // Build the HTML viewer
    logger.log("Building HTML viewer...");
    const assets = await buildExplorerAssets({ workspaceRoot });
    const viewerHtml = buildStaticViewerHtml(assets.htmlTemplate);
    const viewerFile = path.join(outputDir, "index.html");
    await fs.writeFile(viewerFile, viewerHtml, "utf-8");
    logger.log(`Wrote ${viewerFile}`);

    // Copy static assets
    const assetsDir = path.join(outputDir, "static");
    await copyDirectory(assets.outDir, assetsDir);
    logger.log(`Copied static assets to ${assetsDir}`);

    // Calculate total size
    const totalSize = await calculateDirectorySize(outputDir);

    return {
        outputDir,
        dataFile,
        localMapFiles,
        stats: {
            nodeCount: graph.stats.nodes,
            linkCount: graph.stats.links,
            symbolCount: symbolIndex.total,
            localMapCount: localMapFiles.length,
            totalSizeBytes: totalSize
        }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Single Local Map Export (for API use)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a single Local Map JSON for a focus node.
 * This is the headless API that LLMs and scripts can consume.
 */
export async function buildLocalMapJson(
    workspaceRoot: string,
    focusNodeId: string,
    options: { commitHash?: string; prettyPrint?: boolean } = {}
): Promise<{ data: LocalMapData; json: string } | null> {
    const buildExplorerGraph = await buildExplorerGraphModule();
    const graph = await buildExplorerGraph(workspaceRoot);

    const resolveLinkEndpoint = (endpoint: ExplorerLinkPayload["source"]): string => {
        if (typeof endpoint === "string") return endpoint;
        if (endpoint && typeof endpoint === "object" && "id" in endpoint) {
            return typeof endpoint.id === "string" ? endpoint.id : "";
        }
        return "";
    };

    const testCoverage = buildTestCoverageMap(graph, resolveLinkEndpoint);

    const data = buildLocalMapData(graph, testCoverage, {
        focusNodeId,
        includeExtendedSymbols: true,
        includeSymbolAnchors: true,
        commitHash: options.commitHash
    });

    if (!data) {
        return null;
    }

    const json = options.prettyPrint
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

    return { data, json };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function buildProvenance(commitHash?: string, gitRef?: string): StaticExplorerProvenance {
    return {
        generatedAt: new Date().toISOString(),
        commitHash,
        gitRef,
        generatorVersion: STATIC_EXPLORER_VERSION,
        analyzerVersions: {
            // TODO: Populate from actual analyzer metadata
            typescript: "1.0.0"
        }
    };
}

function nodeIdToFilename(nodeId: string): string {
    // Convert path separators and special chars to dashes
    return nodeId
        .replace(/[/\\]/g, "-")
        .replace(/[^a-zA-Z0-9.-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        + ".json";
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

async function calculateDirectorySize(dir: string): Promise<number> {
    let size = 0;
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            size += await calculateDirectorySize(fullPath);
        } else {
            const stat = await fs.stat(fullPath);
            size += stat.size;
        }
    }

    return size;
}

/**
 * Transform the server HTML template into a static viewer.
 * - Removes server fetch, adds static JSON loading
 * - Adds data loading from explorer-data.json or inline
 */
function buildStaticViewerHtml(serverTemplate: string): string {
    // The server template fetches from /graph - we need to replace that
    // with static JSON loading

    // Find and replace the fetch call
    const staticBootstrap = `
<script>
// Static Explorer Bootstrap
// Loads data from explorer-data.json, inline <script id="explorer-data">, or remote URL
(function() {
  const inlineData = document.getElementById('explorer-data');
  const dataUrl = new URLSearchParams(window.location.search).get('data') || './explorer-data.json';

  async function loadData() {
    if (inlineData) {
      return JSON.parse(inlineData.textContent);
    }
    const response = await fetch(dataUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load explorer data');
    return response.json();
  }

  window.__staticExplorerDataPromise = loadData();
})();
</script>`;

    // Insert static bootstrap before the main script
    let modified = serverTemplate.replace(
        '</head>',
        `${staticBootstrap}\n</head>`
    );

    // The client script will need to be modified to use the static data
    // For now, we'll add a wrapper that provides the data
    modified = modified.replace(
        /\/graph\?ts=\$\{Date\.now\(\)\}/g,
        './explorer-data.json'
    );

    // Add a comment indicating this is a static build
    modified = modified.replace(
        '<html',
        '<!-- Static Explorer Build -->\n<html'
    );

    return modified;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled Markdown Scanning
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Regex to match markdown links: [text](path)
 * Captures the path portion, filtering for .md files.
 */
const MARKDOWN_LINK_REGEX = /\[([^\]]*)\]\(([^)]+\.md(?:#[^)]*)?)\)/gi;

/**
 * Scan markdown content for links to other markdown files.
 * Returns workspace-relative paths (without anchors).
 */
function extractMarkdownLinks(content: string, docPath: string, workspaceRoot: string): string[] {
    const links: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = MARKDOWN_LINK_REGEX.exec(content)) !== null) {
        const rawPath = match[2];
        // Remove anchor fragments
        const pathWithoutAnchor = rawPath.split("#")[0];

        // Skip external URLs
        if (pathWithoutAnchor.startsWith("http://") || pathWithoutAnchor.startsWith("https://")) {
            continue;
        }

        // Resolve relative path from the doc's location
        const docDir = path.dirname(path.join(workspaceRoot, docPath));
        const absolutePath = path.resolve(docDir, pathWithoutAnchor);

        // Convert back to workspace-relative
        const relativePath = path.relative(workspaceRoot, absolutePath);

        // Normalize to forward slashes
        const normalizedPath = relativePath.replace(/\\/g, "/");

        // Skip paths that escape the workspace
        if (normalizedPath.startsWith("..")) {
            continue;
        }

        links.push(normalizedPath);
    }

    return links;
}

/**
 * Categorize a markdown file path.
 */
function categorizeMarkdownPath(filePath: string): BundledMarkdownTreeNode["category"] {
    const lowerPath = filePath.toLowerCase();

    if (lowerPath.includes(".mdmd/layer-4/") || lowerPath.includes(".live-documentation/")) {
        return "liveDocs";
    }
    if (lowerPath.includes(".mdmd/")) {
        return "mdmd";
    }
    if (lowerPath.includes("chathistory/") || lowerPath.includes("chat-history/")) {
        return "chatHistory";
    }
    if (lowerPath.includes("readme")) {
        return "readme";
    }
    return "other";
}

/**
 * Build a directory tree from a flat list of file paths.
 */
function buildMarkdownTree(filePaths: string[]): BundledMarkdownTreeNode {
    const root: BundledMarkdownTreeNode = {
        name: "Bundled Docs",
        path: "",
        type: "folder",
        children: []
    };

    for (const filePath of filePaths) {
        const parts = filePath.split("/");
        let current = root;

        // Navigate/create folder structure
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            let child = current.children?.find(c => c.name === part && c.type === "folder");
            if (!child) {
                child = {
                    name: part,
                    path: parts.slice(0, i + 1).join("/"),
                    type: "folder",
                    children: []
                };
                current.children = current.children || [];
                current.children.push(child);
            }
            current = child;
        }

        // Add the file
        const fileName = parts[parts.length - 1];
        current.children = current.children || [];
        current.children.push({
            name: fileName,
            path: filePath,
            type: "file",
            category: categorizeMarkdownPath(filePath)
        });
    }

    // Sort children: folders first, then alphabetically
    const sortChildren = (node: BundledMarkdownTreeNode): void => {
        if (node.children) {
            node.children.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === "folder" ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
            node.children.forEach(sortChildren);
        }
    };
    sortChildren(root);

    return root;
}

/**
 * Scan Live Docs for markdown links and bundle the referenced files.
 * Uses breadth-first traversal with depth limit to avoid infinite recursion.
 */
async function scanAndBundleMarkdown(
    docs: Record<string, string>,
    workspaceRoot: string,
    liveDocPaths: Map<string, string>, // nodeId -> docPath
    maxDepth: number = 2,
    logger: Pick<Console, "log" | "error"> = console
): Promise<{ bundledMarkdown: Record<string, string>; bundledMarkdownTree: BundledMarkdownTreeNode }> {
    const bundledMarkdown: Record<string, string> = {};
    const visited = new Set<string>();
    const queue: Array<{ path: string; depth: number }> = [];

    // Seed the queue with links from Live Docs
    for (const [nodeId, content] of Object.entries(docs)) {
        const docPath = liveDocPaths.get(nodeId);
        if (!docPath) continue;

        const links = extractMarkdownLinks(content, docPath, workspaceRoot);
        for (const link of links) {
            if (!visited.has(link)) {
                visited.add(link);
                queue.push({ path: link, depth: 0 });
            }
        }
    }

    logger.log(`Found ${queue.length} unique markdown links in Live Docs`);

    // Process the queue
    let processedCount = 0;
    while (queue.length > 0) {
        const item = queue.shift()!;

        // Skip if it's a Live Doc (already in docs)
        // Normalize path for comparison
        const normalizedItemPath = item.path.replace(/\\/g, "/");
        let isLiveDoc = false;
        for (const docPath of liveDocPaths.values()) {
            if (docPath.replace(/\\/g, "/") === normalizedItemPath) {
                isLiveDoc = true;
                break;
            }
        }
        if (isLiveDoc) {
            continue;
        }

        try {
            const absolutePath = path.join(workspaceRoot, item.path);
            const content = await fs.readFile(absolutePath, "utf-8");
            bundledMarkdown[item.path] = content;
            processedCount++;

            // Scan for nested links if within depth limit
            if (item.depth < maxDepth) {
                const nestedLinks = extractMarkdownLinks(content, item.path, workspaceRoot);
                for (const link of nestedLinks) {
                    if (!visited.has(link)) {
                        visited.add(link);
                        queue.push({ path: link, depth: item.depth + 1 });
                    }
                }
            }
        } catch {
            // File doesn't exist or can't be read - skip silently
        }
    }

    logger.log(`Bundled ${processedCount} referenced markdown files`);

    // Build the directory tree
    const allPaths = Object.keys(bundledMarkdown);
    const bundledMarkdownTree = buildMarkdownTree(allPaths);

    return { bundledMarkdown, bundledMarkdownTree };
}

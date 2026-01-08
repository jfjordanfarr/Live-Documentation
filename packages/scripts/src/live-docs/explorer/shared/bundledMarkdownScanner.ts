/**
 * Bundled Markdown Scanner
 * 
 * Scans Live Docs for references to other markdown files (READMEs, chat history,
 * specs, etc.) and bundles them for inclusion in the explorer.
 */

import * as fs from "fs/promises";
import * as path from "path";

import type { BundledMarkdownTreeNode, RelatedDocLink } from "./staticExplorerData";

export type { BundledMarkdownTreeNode };

/**
 * Result from scanning and bundling markdown files.
 */
export interface BundledMarkdownResult {
    bundledMarkdown: Record<string, string>;
    bundledMarkdownTree: BundledMarkdownTreeNode;
    /** Links from source docs to bundled markdown files (for Force Graph Related Docs). */
    relatedDocLinks: RelatedDocLink[];
}

/**
 * Regex to match markdown links: [text](path)
 * Captures the path portion, filtering for .md files.
 */
const MARKDOWN_LINK_REGEX = /\[([^\]]*)\]\(([^)]+\.md(?:#[^)]*)?)\)/gi;

/**
 * Scan markdown content for links to other markdown files.
 * Returns workspace-relative paths (without anchors).
 */
export function extractMarkdownLinks(
    content: string,
    docPath: string,
    workspaceRoot: string
): string[] {
    const links: string[] = [];
    // Reset regex lastIndex for global regex
    MARKDOWN_LINK_REGEX.lastIndex = 0;
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
 * Currently returns 'markdown' for all files - no special categorization.
 */
export function categorizeMarkdownPath(_filePath: string): BundledMarkdownTreeNode["category"] {
    return "markdown";
}

/**
 * Build a directory tree from a flat list of file paths.
 */
export function buildMarkdownTree(filePaths: string[]): BundledMarkdownTreeNode {
    const root: BundledMarkdownTreeNode = {
        name: "Related Documentation",
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
 * Options for scanning bundled markdown.
 */
export interface ScanBundledMarkdownOptions {
    /** Map of Live Doc content, keyed by nodeId or docPath */
    docs: Record<string, string>;
    /** Workspace root directory */
    workspaceRoot: string;
    /** Map from nodeId to docPath for the Live Docs */
    liveDocPaths: Map<string, string>;
    /** Maximum depth for following nested links (default: 2) */
    maxDepth?: number;
    /** Logger for progress messages */
    logger?: Pick<Console, "log" | "error">;
}

/**
 * Scan Live Docs for markdown links and bundle the referenced files.
 * Single-hop only: bundles files directly linked from Live Docs, no nested traversal.
 */
export async function scanAndBundleMarkdown(
    options: ScanBundledMarkdownOptions
): Promise<BundledMarkdownResult> {
    const {
        docs,
        workspaceRoot,
        liveDocPaths,
        // maxDepth is now ignored - we only do single-hop
        logger = console
    } = options;

    const bundledMarkdown: Record<string, string> = {};
    const relatedDocLinks: RelatedDocLink[] = [];
    const visited = new Set<string>();

    // Collect all links from Live Docs (single hop only)
    const linksToProcess: Array<{ path: string; sourceId: string }> = [];

    for (const [nodeId, content] of Object.entries(docs)) {
        const docPath = liveDocPaths.get(nodeId);
        if (!docPath) continue;

        const links = extractMarkdownLinks(content, docPath, workspaceRoot);
        for (const link of links) {
            // Track the link from this Live Doc to the bundled doc
            relatedDocLinks.push({ sourceId: nodeId, targetPath: link });
            
            if (!visited.has(link)) {
                visited.add(link);
                linksToProcess.push({ path: link, sourceId: nodeId });
            }
        }
    }

    logger.log(`Found ${linksToProcess.length} unique markdown links in Live Docs`);

    // Process each link - single hop, no nested traversal
    let processedCount = 0;
    for (const item of linksToProcess) {
        // Skip if it's a Live Doc (already in docs)
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
            // No nested link scanning - single hop only
        } catch {
            // File doesn't exist or can't be read - skip silently
        }
    }

    logger.log(`Bundled ${processedCount} referenced markdown files`);

    // Build the directory tree
    const allPaths = Object.keys(bundledMarkdown);
    const bundledMarkdownTree = buildMarkdownTree(allPaths);

    return { bundledMarkdown, bundledMarkdownTree, relatedDocLinks };
}

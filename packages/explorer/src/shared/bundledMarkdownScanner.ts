/**
 * Bundled Markdown
 *
 * Reads the documents the graph says the Live Docs link to (READMEs, specs,
 * design notes, chat summaries) and bundles them for the Explorer's reader
 * and its Related Docs. Which documents a doc links to is the engine's rule,
 * `relatedDocsOf`, read from the authored words the graph carries; the
 * history reads the same rule at every past commit. Until 2026-10-20 this
 * module found the links itself by scanning each doc's rendered text.
 */

import * as fs from "fs/promises";
import * as path from "path";

import type { BundledMarkdownTreeNode, RelatedDocLink } from "./staticExplorerData";

export type { BundledMarkdownTreeNode };

/**
 * The bundled documents, their tree, and the links to them.
 */
export interface BundledMarkdownResult {
    bundledMarkdown: Record<string, string>;
    bundledMarkdownTree: BundledMarkdownTreeNode;
    /** Links from source docs to bundled markdown files (for Force Graph Related Docs). */
    relatedDocLinks: RelatedDocLink[];
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
 * Options for bundling the documents the Live Docs link to.
 */
export interface BundleRelatedDocsOptions {
    /** Each link from a file's doc to a document, as `relatedDocsOf` reads them from the graph. */
    links: readonly RelatedDocLink[];
    /** Workspace root directory */
    workspaceRoot: string;
    /** Logger for progress messages */
    logger?: Pick<Console, "log" | "error">;
}

/**
 * Bundle every linked document once, single hop: a document's own links are not followed. A link to a document
 * that cannot be read is dropped with it, so that the Related Docs name only what the bundle carries.
 */
export async function bundleRelatedDocs(options: BundleRelatedDocsOptions): Promise<BundledMarkdownResult> {
    const { links, workspaceRoot, logger = console } = options;
    const bundledMarkdown: Record<string, string> = {};
    const unreadable = new Set<string>();
    for (const documentPath of [...new Set(links.map(link => link.targetPath))]) {
        try {
            bundledMarkdown[documentPath] = await fs.readFile(path.join(workspaceRoot, documentPath), "utf-8");
        } catch {
            unreadable.add(documentPath);
        }
    }
    const relatedDocLinks = links.filter(link => !unreadable.has(link.targetPath));
    logger.log(`Bundled ${Object.keys(bundledMarkdown).length} linked documents${unreadable.size > 0 ? `; ${unreadable.size} linked documents could not be read` : ""}`);
    return { bundledMarkdown, bundledMarkdownTree: buildMarkdownTree(Object.keys(bundledMarkdown)), relatedDocLinks };
}

/**
 * @file staticBuilder.ts
 * @description Builds the static Explorer bundle: a folder any static host can serve.
 *
 * ## Output Structure
 *
 * ```
 * dist/explorer/
 *   index.html           # The viewer
 *   explorer-data.json   # The graph index and the related markdown
 *   static/              # Scripts and styles
 * ```
 */
import * as fs from "fs/promises";
import * as path from "path";

import {
    DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    normalizeLiveDocumentationConfig,
    type LiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";
import { renderLiveDoc } from "@live-documentation/shared/live-docs/document";
import { readLiveDocGraph } from "@live-documentation/shared/live-docs/graphFiles";

import { scanAndBundleMarkdown } from "./bundledMarkdownScanner";
import type { StaticExplorerData } from "./staticExplorerData";

// Lazy import to keep esbuild out of the initial module graph
const buildExplorerAssetsModule = async () => (await import("./buildAssets")).buildExplorerAssets;

/** Options controlling a static Explorer build. */
export interface BuildStaticExplorerOptions {
    /** Workspace root directory. */
    workspaceRoot: string;

    /** Output directory for the static bundle. */
    outputDir: string;

    /** Live Docs configuration controlling where docs are read from. */
    config?: LiveDocumentationConfig;

    /** Pretty-print the JSON (larger, easier to read). */
    prettyPrint?: boolean;

    /** Logger for progress output. */
    logger?: Pick<Console, "log" | "error">;
}

/** Outcome of {@link buildStaticExplorer}, including file paths and size statistics. */
export interface BuildStaticExplorerResult {
    /** Path to the output directory. */
    outputDir: string;

    /** Path to the main data file. */
    dataFile: string;

    /** Statistics about the build. */
    stats: {
        fileCount: number;
        edgeCount: number;
        bundledMarkdownCount: number;
        totalSizeBytes: number;
    };
}

/**
 * Build a complete static Explorer bundle.
 */
export async function buildStaticExplorer(
    options: BuildStaticExplorerOptions
): Promise<BuildStaticExplorerResult> {
    const {
        workspaceRoot,
        outputDir,
        config = normalizeLiveDocumentationConfig(DEFAULT_LIVE_DOCUMENTATION_CONFIG),
        prettyPrint = false,
        logger = console
    } = options;

    logger.log(`Building static explorer for ${workspaceRoot}...`);
    await fs.mkdir(outputDir, { recursive: true });

    logger.log("Reading the graph...");
    const graph = await readLiveDocGraph({ workspaceRoot, config });
    const files = Object.values(graph.files);
    const edgeCount = files.reduce((count, file) => count + file.outbound.length, 0);
    logger.log(`Graph: ${files.length} files, ${edgeCount} edges`);

    // The scanner reads the docs as text; rendering the graph's files gives back the same bytes.
    logger.log("Scanning for referenced markdown files...");
    const docs: Record<string, string> = {};
    const liveDocPaths = new Map<string, string>();
    for (const file of files) {
        docs[file.codePath] = renderLiveDoc(file);
        liveDocPaths.set(file.codePath, file.docPath);
    }
    const { bundledMarkdown, bundledMarkdownTree, relatedDocLinks } = await scanAndBundleMarkdown({
        docs,
        workspaceRoot,
        liveDocPaths,
        exclude: config.bundleExclude,
        logger
    });

    const bundledMarkdownCount = Object.keys(bundledMarkdown).length;
    const staticData: StaticExplorerData = {
        graph,
        bundledMarkdown: bundledMarkdownCount > 0 ? bundledMarkdown : undefined,
        bundledMarkdownTree: bundledMarkdownCount > 0 ? bundledMarkdownTree : undefined,
        relatedDocLinks: relatedDocLinks.length > 0 ? relatedDocLinks : undefined
    };

    const dataFile = path.join(outputDir, "explorer-data.json");
    const jsonContent = prettyPrint
        ? JSON.stringify(staticData, null, 2)
        : JSON.stringify(staticData);
    await fs.writeFile(dataFile, jsonContent, "utf-8");
    logger.log(`Wrote ${dataFile} (${formatBytes(jsonContent.length)})`);

    logger.log("Building HTML viewer...");
    const buildExplorerAssets = await buildExplorerAssetsModule();
    const assets = await buildExplorerAssets();
    const viewerFile = path.join(outputDir, "index.html");
    await fs.writeFile(viewerFile, assets.htmlTemplate, "utf-8");
    logger.log(`Wrote ${viewerFile}`);

    const assetsDir = path.join(outputDir, "static");
    await fs.rm(assetsDir, { recursive: true, force: true });
    await copyDirectory(assets.outDir, assetsDir);
    logger.log(`Copied static assets to ${assetsDir}`);

    const totalSize = await calculateDirectorySize(outputDir);

    return {
        outputDir,
        dataFile,
        stats: {
            fileCount: files.length,
            edgeCount,
            bundledMarkdownCount,
            totalSizeBytes: totalSize
        }
    };
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

/**
 * @file staticBuilder.ts
 * @description Builds the static Explorer bundle: a folder any static host can serve.
 *
 * ## Output Structure
 *
 * ```
 * dist/explorer/
 *   index.html              # The viewer
 *   explorer-data.json      # The graph index and the related markdown
 *   explorer-history.json   # The history the export carries, when it carries one
 *   static/                 # Scripts and styles
 * ```
 */
import * as fs from "fs/promises";
import * as path from "path";

import {
    DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    normalizeLiveDocumentationConfig,
    type LiveDocumentationConfig
} from "@live-documentation/engine/config/liveDocumentationConfig";
import { parseBoard } from "@live-documentation/engine/live-docs/board";
import { LiveDocSyntaxError } from "@live-documentation/engine/live-docs/document";
import { resolveDocLink } from "@live-documentation/engine/live-docs/graph";
import { readEstateGraph, readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { HISTORY_DIRECTORY, HISTORY_FILE, HISTORY_FORMAT, type HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { headOf } from "@live-documentation/engine/live-docs/history/sequence";
import { windowOf, type HistorySelection } from "@live-documentation/engine/live-docs/history/window";
import { relatedDocsOf } from "@live-documentation/engine/live-docs/relatedDocs";

import { bundleRelatedDocs } from "./bundledMarkdownScanner";
import type { StaticExplorerData } from "./staticExplorerData";

/** The name of the history file the bundle carries beside `explorer-data.json`. */
const BUNDLED_HISTORY_FILE = "explorer-history.json";

/** How much of the history an export carries: none of it, or the part a selection names. */
export type ExportedHistory = { rule: "none" } | HistorySelection;

// Lazy import to keep esbuild out of the initial module graph
const withExplorerAssetsModule = async () => (await import("./buildAssets")).withExplorerAssets;

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

    /** A board file to carry in the bundle, relative to the workspace root or absolute; the World Map draws it. */
    boardPath?: string;

    /**
     * How much of `<root>/history/history.json` to carry, by the exporter's
     * choice: by default all of it when the history command has written one,
     * and none otherwise.
     */
    history?: ExportedHistory;

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
        /** How many commits the carried history holds; absent when the bundle carries none. */
        historyCommits?: number;
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
        boardPath,
        history,
        logger = console
    } = options;

    logger.log(`Building static explorer for ${workspaceRoot}...`);
    await fs.mkdir(outputDir, { recursive: true });

    let board: StaticExplorerData["board"];
    if (boardPath) {
        const absolute = path.resolve(workspaceRoot, boardPath);
        const relative = path.relative(workspaceRoot, absolute).split(path.sep).join("/");
        board = { path: relative, text: await fs.readFile(absolute, "utf8") };
    }

    logger.log("Reading the graph...");
    const graph = await readGraph(workspaceRoot, config, board, logger);
    const files = Object.values(graph.files);
    const edgeCount = files.reduce((count, file) => count + file.outbound.length, 0);
    logger.log(`Graph: ${files.length} files, ${edgeCount} edges`);

    // The documents the docs' authored words link to, by the one rule the history reads at every past commit, and the
    // documents whose own links name each file, as the doc's `Cited By` section records them (2026-10-22).
    logger.log("Reading the documents the docs link to and the documents that cite them...");
    const links = files.flatMap(file => [
        ...relatedDocsOf(file, graph, config.bundleExclude).map(targetPath => ({ sourceId: file.codePath, targetPath, direction: "cites" as const })),
        ...(file.citedBy ?? []).map(entry => ({ sourceId: file.codePath, targetPath: resolveDocLink(file.docPath, entry.link) ?? entry.label, direction: "cited-by" as const }))
    ]);
    const { bundledMarkdown, bundledMarkdownTree, relatedDocLinks } = await bundleRelatedDocs({ links, workspaceRoot, logger });

    const bundledMarkdownCount = Object.keys(bundledMarkdown).length;
    const staticData: StaticExplorerData = {
        graph,
        bundledMarkdown: bundledMarkdownCount > 0 ? bundledMarkdown : undefined,
        bundledMarkdownTree: bundledMarkdownCount > 0 ? bundledMarkdownTree : undefined,
        relatedDocLinks: relatedDocLinks.length > 0 ? relatedDocLinks : undefined
    };
    if (board) {
        staticData.board = board;
        logger.log(`Board: ${board.path}`);
    }
    if (config.sampleRoots.length > 0) {
        staticData.sampleRoots = [...config.sampleRoots];
    }

    const carried = await writeHistory(workspaceRoot, config, outputDir, history, logger);
    if (carried) {
        staticData.history = { file: BUNDLED_HISTORY_FILE, head: headOf(carried) };
    }

    const dataFile = path.join(outputDir, "explorer-data.json");
    const jsonContent = prettyPrint
        ? JSON.stringify(staticData, null, 2)
        : JSON.stringify(staticData);
    await fs.writeFile(dataFile, jsonContent, "utf-8");
    logger.log(`Wrote ${dataFile} (${formatBytes(jsonContent.length)})`);

    logger.log("Building HTML viewer...");
    const withExplorerAssets = await withExplorerAssetsModule();
    await withExplorerAssets(async (assets) => {
        const viewerFile = path.join(outputDir, "index.html");
        await fs.writeFile(viewerFile, assets.htmlTemplate, "utf-8");
        logger.log(`Wrote ${viewerFile}`);

        const assetsDir = path.join(outputDir, "static");
        await fs.rm(assetsDir, { recursive: true, force: true });
        await copyDirectory(assets.outDir, assetsDir);
        logger.log(`Copied static assets to ${assetsDir}`);
    });

    const totalSize = await calculateDirectorySize(outputDir);

    return {
        outputDir,
        dataFile,
        stats: {
            fileCount: files.length,
            edgeCount,
            bundledMarkdownCount,
            totalSizeBytes: totalSize,
            ...(carried ? { historyCommits: carried.steps.length + 1 } : {})
        }
    };
}

/**
 * Writes the part of the history the export carries beside the data, a
 * window re-based on its first commit, and returns it; removes a history an
 * earlier build left when this one carries none.
 */
async function writeHistory(
    workspaceRoot: string,
    config: LiveDocumentationConfig,
    outputDir: string,
    asked: ExportedHistory | undefined,
    logger: Pick<Console, "log" | "error">
): Promise<HistorySequence | undefined> {
    const target = path.join(outputDir, BUNDLED_HISTORY_FILE);
    const source = path.join(workspaceRoot, config.root, HISTORY_DIRECTORY, HISTORY_FILE);
    const text = await fs.readFile(source, "utf8").catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT") {
            return undefined;
        }
        throw error;
    });
    const selection: ExportedHistory = asked ?? (text === undefined ? { rule: "none" } : { rule: "all" });
    if (selection.rule === "none") {
        await fs.rm(target, { force: true });
        return undefined;
    }
    const where = path.relative(workspaceRoot, source).split(path.sep).join("/");
    if (text === undefined) {
        throw new Error(`the export asks for history, and there is none at ${where}; run \`npm run live-docs:history\` first`);
    }
    const parsed = JSON.parse(text) as { format?: unknown };
    if (parsed.format !== HISTORY_FORMAT) {
        throw new Error(`${where} is written in ${String(parsed.format)}, and this builder reads ${HISTORY_FORMAT}; run \`npm run live-docs:history\` again`);
    }
    const sequence = parsed as HistorySequence;
    const window = windowOf(sequence, selection);
    const json = JSON.stringify(window);
    await fs.writeFile(target, json, "utf-8");
    logger.log(`Wrote ${target} (${window.steps.length + 1} commits, ${formatBytes(json.length)})`);
    return window;
}

/** The workspace's graph, or, with a board, the graph of the estate its things name, one scan or several. */
async function readGraph(workspaceRoot: string, config: LiveDocumentationConfig, board: StaticExplorerData["board"], logger: Pick<Console, "log" | "error">) {
    if (!board) {
        return readLiveDocGraph({ workspaceRoot, config });
    }
    let parsed;
    try {
        parsed = parseBoard(board.text);
    } catch (error) {
        throw error instanceof LiveDocSyntaxError ? new Error(`${board.path}: ${error.message}`) : error;
    }
    const reading = await readEstateGraph({ workspaceRoot, config, board: parsed, boardPath: board.path });
    logger.log(`Scans: ${reading.scans.map((scan) => scan || "the workspace root").join(", ") || "none"}`);
    for (const issue of reading.issues) {
        logger.error(issue);
    }
    return reading.graph;
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

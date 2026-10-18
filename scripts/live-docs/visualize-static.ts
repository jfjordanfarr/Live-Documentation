/**
 * @file visualize-static.ts
 * @description CLI for building the static Explorer bundle.
 *
 * ## Usage
 *
 * ```bash
 * # Basic usage - outputs to ./dist/explorer
 * npm run live-docs:visualize
 *
 * # Custom output directory
 * npm run live-docs:visualize -- --output ./docs/explorer
 *
 * # Pretty-print JSON for debugging
 * npm run live-docs:visualize -- --pretty
 *
 * # Carry a board for the World Map
 * npm run live-docs:visualize -- --board .mdmd/layer-3/board.mdmd.md
 *
 * # Carry part of the history, or none (all of it by default when the history command has written one)
 * npm run live-docs:visualize -- --history last 50
 * npm run live-docs:visualize -- --history since 2026-09-01
 * npm run live-docs:visualize -- --history none
 * ```
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

import {
    DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    normalizeLiveDocumentationConfig,
    type LiveDocumentationConfigInput
} from "@live-documentation/engine/config/liveDocumentationConfig";
import { buildStaticExplorer, type ExportedHistory } from "@live-documentation/explorer/shared/staticBuilder";

interface CliOptions {
    outputDir: string;
    prettyPrint: boolean;
    configPath?: string;
    boardPath?: string;
    history?: ExportedHistory;
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = {
        outputDir: "./dist/explorer",
        prettyPrint: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--output" || arg === "-o") {
            options.outputDir = args[++i] ?? options.outputDir;
        } else if (arg === "--pretty" || arg === "-p") {
            options.prettyPrint = true;
        } else if (arg === "--config") {
            options.configPath = args[++i];
        } else if (arg === "--board") {
            options.boardPath = args[++i];
        } else if (arg === "--history") {
            const rule = args[++i];
            if (rule === "none" || rule === "all") {
                options.history = { rule };
            } else if (rule === "since" && args[i + 1] !== undefined && !Number.isNaN(Date.parse(args[i + 1]))) {
                options.history = { rule, since: args[++i] };
            } else if (rule === "last" && /^[1-9]\d*$/u.test(args[i + 1] ?? "")) {
                options.history = { rule, count: Number(args[++i]) };
            } else {
                throw new Error("--history takes none, all, since <date> or last <n>.");
            }
        } else {
            throw new Error(`Unknown argument '${arg}'.`);
        }
    }

    return options;
}

async function readConfigFile(configPath: string): Promise<LiveDocumentationConfigInput> {
    const resolved = path.resolve(configPath);
    const raw = await fs.readFile(resolved, "utf8");
    return JSON.parse(raw) as LiveDocumentationConfigInput;
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const options = parseArgs(args);
    const workspaceRoot = process.cwd();

    let configInput: LiveDocumentationConfigInput = {};
    if (options.configPath) {
        configInput = await readConfigFile(options.configPath);
    }

    const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        ...configInput
    });

    console.log("Building static explorer bundle...");
    console.log(`  Workspace: ${workspaceRoot}`);
    console.log(`  Output: ${path.resolve(options.outputDir)}`);

    const result = await buildStaticExplorer({
        workspaceRoot,
        outputDir: options.outputDir,
        config,
        prettyPrint: options.prettyPrint,
        boardPath: options.boardPath,
        history: options.history
    });

    console.log("\nStatic explorer build complete!");
    console.log(`  Files: ${result.stats.fileCount}`);
    console.log(`  Edges: ${result.stats.edgeCount}`);
    console.log(`  Related markdown: ${result.stats.bundledMarkdownCount}`);
    console.log(`  History: ${result.stats.historyCommits === undefined ? "none" : `${result.stats.historyCommits} commits`}`);
    console.log(`  Total Size: ${formatBytes(result.stats.totalSizeBytes)}`);
    console.log(`\nOpen ${path.join(result.outputDir, "index.html")} in a browser to view.`);
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

main().catch(error => {
    console.error("Static explorer build failed:", error);
    process.exitCode = 1;
});

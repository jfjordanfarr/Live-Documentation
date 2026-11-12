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
 * # Carry a board for the World Map, in place of the one the configuration names as `board`
 * npm run live-docs:visualize -- --board .mdmd/layer-3/board.mdmd.md
 *
 * # Carry part of the history, or none (all of it by default when the history command has written one)
 * npm run live-docs:visualize -- --history last 50
 * npm run live-docs:visualize -- --history since 2026-09-01
 * npm run live-docs:visualize -- --history none
 *
 * # Another folder, documented first by `live-docs:generate -- --workspace`
 * npm run live-docs:visualize -- --workspace ../my-project
 * ```
 */

import * as path from "node:path";

import {
    DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    normalizeLiveDocumentationConfig
} from "@live-documentation/engine/config/liveDocumentationConfig";
import { buildStaticExplorer, type ExportedHistory } from "@live-documentation/explorer/shared/staticBuilder";

import { optionValue, readConfiguration, runCommand, UsageError } from "./cli";

interface CliOptions {
    help: boolean;
    workspace?: string;
    outputDir: string;
    prettyPrint: boolean;
    configPath?: string;
    boardPath?: string;
    history?: ExportedHistory;
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = {
        help: false,
        outputDir: "./dist/explorer",
        prettyPrint: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--help" || arg === "-h") {
            options.help = true;
        } else if (arg === "--workspace") {
            options.workspace = optionValue(args, ++i, arg);
        } else if (arg === "--output" || arg === "-o") {
            options.outputDir = optionValue(args, ++i, arg);
        } else if (arg === "--pretty" || arg === "-p") {
            options.prettyPrint = true;
        } else if (arg === "--config") {
            options.configPath = optionValue(args, ++i, arg);
        } else if (arg === "--board") {
            options.boardPath = optionValue(args, ++i, arg);
        } else if (arg === "--history") {
            const rule = args[++i];
            if (rule === "none" || rule === "all") {
                options.history = { rule };
            } else if (rule === "since" && args[i + 1] !== undefined && !Number.isNaN(Date.parse(args[i + 1]))) {
                options.history = { rule, since: args[++i] };
            } else if (rule === "last" && /^[1-9]\d*$/u.test(args[i + 1] ?? "")) {
                options.history = { rule, count: Number(args[++i]) };
            } else {
                throw new UsageError("--history takes none, all, since <date> or last <n>.");
            }
        } else {
            throw new UsageError(arg.startsWith("-") ? `${arg} is not an option.` : `${arg} is not an option; name the folder with --workspace.`);
        }
    }

    return options;
}

function usage(): string {
    return [
        "Usage: npm run live-docs:visualize -- [options]",
        "",
        "Builds the Explorer, a static site, from the workspace's Live Docs.",
        "",
        "Options:",
        "  --workspace <path>     The folder whose docs to read (default: the current directory).",
        "  --config <file>        The configuration (default: the workspace's .live-docs.config.json",
        "                         when it has one, else the shipped defaults).",
        "  -o, --output <dir>     Where to write the site (default: ./dist/explorer).",
        "  --board <file>         A board to draw the World Map from, relative to the workspace; the",
        "                         Explorer then opens on it (default: the configuration's \"board\", if any).",
        "  --history <rule>       How much of the history to carry: none, all, since <date> or last <n>",
        "                         (default: all of it when live-docs:history has written one).",
        "  -p, --pretty           Indent the JSON data, for reading it.",
        "  -h, --help             Print this help.",
        "",
        "The site must be served: a page opened as a file cannot load its data. For example:",
        "  npx http-server dist/explorer -a 127.0.0.1 -p 8766 -c-1"
    ].join("\n");
}

/** A folder as a person in the current directory would type it: relative when it lies beneath, quoted when it holds a space. */
function typed(folder: string): string {
    const relative = path.relative(process.cwd(), folder);
    const shown = relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative) ? relative : folder;
    return /\s/u.test(shown) ? `"${shown}"` : shown;
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        console.log(usage());
        return;
    }
    const workspaceRoot = path.resolve(options.workspace ?? process.cwd());

    const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        ...(await readConfiguration(workspaceRoot, options.configPath))
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
    console.log(`  Written: ${formatBytes(result.stats.bundleSizeBytes)}`);
    console.log("\nServe the folder to view it; a page opened as a file cannot load its data. For example:");
    console.log(`  npx http-server ${typed(path.resolve(result.outputDir))} -a 127.0.0.1 -p 8766 -c-1`);
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

runCommand("live-docs:visualize", main);

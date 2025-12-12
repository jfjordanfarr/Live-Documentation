/**
 * @file visualize-static.ts
 * @description CLI for building static explorer bundles.
 *
 * ## Usage
 *
 * ```bash
 * # Basic usage - outputs to ./dist/explorer
 * npm run live-docs:visualize -- --static
 *
 * # Custom output directory
 * npm run live-docs:visualize -- --static --output ./docs/explorer
 *
 * # Include pre-computed Local Maps for specific nodes
 * npm run live-docs:visualize -- --static --local-maps packages/server/src/main.ts
 *
 * # Include all Local Maps (large output)
 * npm run live-docs:visualize -- --static --all-local-maps
 *
 * # Pretty-print JSON for debugging
 * npm run live-docs:visualize -- --static --pretty
 * ```
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

import { buildStaticExplorer } from "@live-documentation/scripts/live-docs/explorer/shared/staticBuilder";
import {
    DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    normalizeLiveDocumentationConfig,
    type LiveDocumentationConfigInput
} from "@live-documentation/shared/config/liveDocumentationConfig";

interface CliOptions {
    outputDir: string;
    localMaps: string[];
    allLocalMaps: boolean;
    prettyPrint: boolean;
    commitHash?: string;
    gitRef?: string;
    configPath?: string;
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = {
        outputDir: "./dist/explorer",
        localMaps: [],
        allLocalMaps: false,
        prettyPrint: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--output" || arg === "-o") {
            options.outputDir = args[++i] ?? options.outputDir;
        } else if (arg === "--local-maps" || arg === "-l") {
            // Collect all following non-flag arguments
            while (i + 1 < args.length && !args[i + 1].startsWith("-")) {
                options.localMaps.push(args[++i]);
            }
        } else if (arg === "--all-local-maps") {
            options.allLocalMaps = true;
        } else if (arg === "--pretty" || arg === "-p") {
            options.prettyPrint = true;
        } else if (arg === "--commit") {
            options.commitHash = args[++i];
        } else if (arg === "--ref") {
            options.gitRef = args[++i];
        } else if (arg === "--config") {
            options.configPath = args[++i];
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
        includeLocalMaps: options.localMaps,
        includeAllLocalMaps: options.allLocalMaps,
        buildOptions: {
            prettyPrint: options.prettyPrint
        },
        commitHash: options.commitHash,
        gitRef: options.gitRef
    });

    console.log("\nStatic explorer build complete!");
    console.log(`  Nodes: ${result.stats.nodeCount}`);
    console.log(`  Links: ${result.stats.linkCount}`);
    console.log(`  Symbols: ${result.stats.symbolCount}`);
    console.log(`  Local Maps: ${result.stats.localMapCount}`);
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

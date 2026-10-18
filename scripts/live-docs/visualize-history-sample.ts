/**
 * @file visualize-history-sample.ts
 * @description Builds the static Explorer over the scripted repository of the
 * history command's integration test, with its history computed, so that the
 * history control can be looked at and tested over a sequence that is not this
 * repository's own and is the same on every machine (2026-10-18). Two bundles
 * come out of one build: the whole history, and a window of its last commits,
 * whose left edge the scrubber marks truncated. The repository is built in a
 * temporary folder and removed when the build is done.
 *
 * ## Usage
 *
 * ```bash
 * npm run live-docs:visualize:history-sample
 * npx tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-history-sample.ts --output dist/explorer/samples/history --window-output dist/explorer/samples/history-window --window 4
 * ```
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { buildStaticExplorer } from "@live-documentation/explorer/shared/staticBuilder";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { computeHistory } from "../../packages/generator/src/history/computeHistory";
import { buildRepository, SCRIPTED_CONFIG } from "../../tests/integration/live-docs/scripted-repository";

interface CliOptions {
    outputDir: string;
    windowOutputDir?: string;
    window: number;
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = { outputDir: "", window: 4 };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--output" || arg === "-o") {
            options.outputDir = args[++i] ?? "";
        } else if (arg === "--window-output") {
            options.windowOutputDir = args[++i];
        } else if (arg === "--window") {
            const count = Number(args[++i]);
            if (!Number.isInteger(count) || count < 1) {
                throw new Error("--window takes a count of one or more.");
            }
            options.window = count;
        } else {
            throw new Error(`Unknown argument '${arg}'.`);
        }
    }
    if (!options.outputDir) {
        throw new Error("Usage: visualize-history-sample.ts --output <folder> [--window-output <folder> --window <n>]");
    }
    return options;
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    const repository = fs.mkdtempSync(path.join(os.tmpdir(), "history-sample-"));
    try {
        const commits = buildRepository(repository);
        const quiet = { info: () => undefined, warn: () => undefined, error: (message: string) => console.error(message) };
        const run = await computeHistory({ workspace: repository, sampling: { rule: "every-commit" }, jobs: 1, keepIndex: false, authors: true, progress: () => undefined });
        const config = normalizeLiveDocumentationConfig(SCRIPTED_CONFIG);
        await generateLiveDocs({ workspaceRoot: repository, config, logger: quiet });
        const logger = { log: () => undefined, error: (message: string) => console.error(message) };
        const whole = await buildStaticExplorer({ workspaceRoot: repository, outputDir: path.resolve(options.outputDir), config, history: { rule: "all" }, logger });
        console.log(`Built the scripted repository: ${commits.length} commits, ${run.sequence.steps.length} steps, ${whole.stats.fileCount} files today, at ${path.resolve(options.outputDir)}`);
        if (options.windowOutputDir) {
            const window = await buildStaticExplorer({ workspaceRoot: repository, outputDir: path.resolve(options.windowOutputDir), config, history: { rule: "last", count: options.window }, logger });
            console.log(`Built its window of the last ${options.window}: ${window.stats.historyCommits} commits, at ${path.resolve(options.windowOutputDir)}`);
        }
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error("History sample bundle build failed:", error);
    process.exitCode = 1;
});

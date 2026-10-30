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
 * npx tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-history-sample.ts --output dist/explorer/samples/history --window-output dist/explorer/samples/history-window --window 4 --collision-output dist/explorer/samples/history-collision
 * ```
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { buildStaticExplorer } from "@live-documentation/explorer/shared/staticBuilder";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { computeHistory } from "../../packages/generator/src/history/computeHistory";
import { buildRepository, COLLISION_CONFIG, COLLISION_SCRIPT, SCRIPT, SCRIPTED_CONFIG, type ScriptedCommit } from "../../tests/integration/live-docs/scripted-repository";

interface CliOptions {
    outputDir: string;
    windowOutputDir?: string;
    window: number;
    /** Where the second script's bundle goes, the rename onto a deleted file's path (2026-10-18). */
    collisionOutputDir?: string;
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = { outputDir: "", window: 4 };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--output" || arg === "-o") {
            options.outputDir = args[++i] ?? "";
        } else if (arg === "--window-output") {
            options.windowOutputDir = args[++i];
        } else if (arg === "--collision-output") {
            options.collisionOutputDir = args[++i];
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
        throw new Error("Usage: visualize-history-sample.ts --output <folder> [--window-output <folder> --window <n>] [--collision-output <folder>]");
    }
    return options;
}

/** Builds a script's repository in a temporary folder, computes its history and writes the bundles asked for. */
async function buildSample(script: ScriptedCommit[], configInput: typeof SCRIPTED_CONFIG, outputs: Array<{ dir: string; history: Parameters<typeof buildStaticExplorer>[0]["history"]; label: string }>): Promise<void> {
    const repository = fs.mkdtempSync(path.join(os.tmpdir(), "history-sample-"));
    try {
        const commits = buildRepository(repository, script);
        const quiet = { info: () => undefined, warn: () => undefined, error: (message: string) => console.error(message) };
        const run = await computeHistory({ workspace: repository, sampling: { rule: "every-commit" }, jobs: 1, keepIndex: false, authors: true, progress: () => undefined });
        const config = normalizeLiveDocumentationConfig(configInput);
        await generateLiveDocs({ workspaceRoot: repository, config, logger: quiet });
        const logger = { log: () => undefined, error: (message: string) => console.error(message) };
        for (const output of outputs) {
            const built = await buildStaticExplorer({ workspaceRoot: repository, outputDir: path.resolve(output.dir), config, history: output.history, logger });
            console.log(`Built ${output.label}: ${commits.length} commits, ${run.sequence.steps.length} steps, ${built.stats.historyCommits ?? 0} carried, ${built.stats.fileCount} files today, at ${path.resolve(output.dir)}`);
        }
    } finally {
        fs.rmSync(repository, { recursive: true, force: true });
    }
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    const outputs = [{ dir: options.outputDir, history: { rule: "all" } as const, label: "the scripted repository" }];
    if (options.windowOutputDir) outputs.push({ dir: options.windowOutputDir, history: { rule: "last", count: options.window } as const, label: `its window of the last ${options.window}` });
    await buildSample(SCRIPT, SCRIPTED_CONFIG, outputs);
    if (options.collisionOutputDir) {
        await buildSample(COLLISION_SCRIPT, COLLISION_CONFIG, [{ dir: options.collisionOutputDir, history: { rule: "all" } as const, label: "the rename onto a deleted file's path" }]);
    }
}

main().catch(error => {
    console.error("History sample bundle build failed:", error);
    process.exitCode = 1;
});

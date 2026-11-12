/**
 * @file visualize-history-sample.ts
 * @description Builds the static Explorer over the scripted repository of the
 * history command's integration test, with its history computed, so that the
 * history control can be looked at and tested over a sequence that is not this
 * repository's own and is the same on every machine (2026-10-18). The whole
 * history and a window of its last commits share one repository; separate
 * repositories exercise a rename collision, large growth and, since 2026-11-11, a picture
 * large enough to veil. Each temporary
 * repository is removed when its bundles are built.
 *
 * ## Usage
 *
 * ```bash
 * npm run live-docs:visualize:history-sample
 * npx tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-history-sample.ts --output dist/explorer/samples/history --window-output dist/explorer/samples/history-window --window 4 --collision-output dist/explorer/samples/history-collision --growth-output dist/explorer/samples/history-growth --veil-output dist/explorer/samples/history-veil
 * ```
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { buildStaticExplorer } from "@live-documentation/explorer/shared/staticBuilder";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { optionValue, runCommand, UsageError } from "./cli";
import { computeHistory } from "../../packages/generator/src/history/computeHistory";
import { buildRepository, COLLISION_CONFIG, COLLISION_SCRIPT, GROWTH_CONFIG, GROWTH_SCRIPT, SCRIPT, SCRIPTED_CONFIG, VEIL_CONFIG, VEIL_SCRIPT, type ScriptedCommit } from "../../tests/integration/live-docs/scripted-repository";

interface CliOptions {
    help: boolean;
    outputDir: string;
    windowOutputDir?: string;
    window: number;
    /** Where the second script's bundle goes, the rename onto a deleted file's path (2026-10-18). */
    collisionOutputDir?: string;
    /** A separate history growing one to 64 TypeScript files plus its configuration. */
    growthOutputDir?: string;
    /** A history whose 3D picture veils, past the 1,024 files it draws within skins (2026-11-11). */
    veilOutputDir?: string;
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = { help: false, outputDir: "", window: 4 };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--help" || arg === "-h") {
            options.help = true;
        } else if (arg === "--output" || arg === "-o") {
            options.outputDir = optionValue(args, ++i, arg);
        } else if (arg === "--window-output") {
            options.windowOutputDir = optionValue(args, ++i, arg);
        } else if (arg === "--collision-output") {
            options.collisionOutputDir = optionValue(args, ++i, arg);
        } else if (arg === "--growth-output") {
            options.growthOutputDir = optionValue(args, ++i, arg);
        } else if (arg === "--veil-output") {
            options.veilOutputDir = optionValue(args, ++i, arg);
        } else if (arg === "--window") {
            const count = Number(optionValue(args, ++i, arg));
            if (!Number.isInteger(count) || count < 1) {
                throw new UsageError("--window takes a count of one or more.");
            }
            options.window = count;
        } else {
            throw new UsageError(`${arg} is not an option.`);
        }
    }
    if (!options.help && !options.outputDir) {
        throw new UsageError("Name where to write with --output.");
    }
    return options;
}

function usage(): string {
    return [
        "Usage: npm run live-docs:visualize:history-sample -- [options]",
        "",
        "Builds the Explorer over scripted repositories made in a temporary folder, each with its history",
        "computed. The npm script names every output below; options given after it replace those.",
        "",
        "Options:",
        "  -o, --output <dir>          The scripted repository with all of its history.",
        "  --window-output <dir>       The same repository carrying only its last commits.",
        "  --window <n>                How many last commits the window carries (default: 4).",
        "  --collision-output <dir>    A rename onto a deleted file's path.",
        "  --growth-output <dir>       A history growing to sixty-five documents.",
        "  --veil-output <dir>         A picture large enough to veil.",
        "  -h, --help                  Print this help."
    ].join("\n");
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
    if (options.help) {
        console.log(usage());
        return;
    }
    const outputs = [{ dir: options.outputDir, history: { rule: "all" } as const, label: "the scripted repository" }];
    if (options.windowOutputDir) outputs.push({ dir: options.windowOutputDir, history: { rule: "last", count: options.window } as const, label: `its window of the last ${options.window}` });
    await buildSample(SCRIPT, SCRIPTED_CONFIG, outputs);
    if (options.collisionOutputDir) {
        await buildSample(COLLISION_SCRIPT, COLLISION_CONFIG, [{ dir: options.collisionOutputDir, history: { rule: "all" } as const, label: "the rename onto a deleted file's path" }]);
    }
    if (options.growthOutputDir) {
        await buildSample(GROWTH_SCRIPT, GROWTH_CONFIG, [{ dir: options.growthOutputDir, history: { rule: "all" } as const, label: "the two-to-sixty-five-document growth" }]);
    }
    if (options.veilOutputDir) {
        await buildSample(VEIL_SCRIPT, VEIL_CONFIG, [{ dir: options.veilOutputDir, history: { rule: "all" } as const, label: "the picture that veils" }]);
    }
}

runCommand("live-docs:visualize:history-sample", main);

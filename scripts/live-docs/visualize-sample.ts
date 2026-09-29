/**
 * @file visualize-sample.ts
 * @description Builds the static Explorer over one of the sample programs under
 * `tests/integration/programs`, with Live Docs generated into a copy of it, so
 * that the World Map and the inside of a thing can be looked at, and tested,
 * over a shape that is not this repository's own. The sample itself is never
 * written to; the copy is removed when the build is done.
 *
 * ## Usage
 *
 * ```bash
 * # The estate, the owner's target shape, into the bundle's samples/estate/
 * npm run live-docs:visualize:estate
 *
 * # Any sample, any board it carries, anywhere
 * npx tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-sample.ts --program tests/integration/programs/csharp/estate --board board.md --output dist/explorer/samples/estate
 * ```
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG, normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { buildStaticExplorer } from "@live-documentation/explorer/shared/staticBuilder";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { fixtureGlobs } from "../oracle/compare";
import { copyFixture } from "../oracle/fixture";

interface CliOptions {
    program: string;
    outputDir: string;
    boardPath?: string;
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = { program: "", outputDir: "" };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--program") {
            options.program = args[++i] ?? "";
        } else if (arg === "--output" || arg === "-o") {
            options.outputDir = args[++i] ?? "";
        } else if (arg === "--board") {
            options.boardPath = args[++i];
        } else {
            throw new Error(`Unknown argument '${arg}'.`);
        }
    }
    if (!options.program || !options.outputDir) {
        throw new Error("Usage: visualize-sample.ts --program <folder> --output <folder> [--board <path inside the program>]");
    }
    return options;
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    const program = path.resolve(options.program);
    const outputDir = path.resolve(options.outputDir);
    if (!fs.existsSync(program)) {
        throw new Error(`No sample program at ${program}.`);
    }
    const quiet = { info: () => undefined, warn: () => undefined, error: (message: string) => console.error(message) };
    const workDir = copyFixture(program, "live-docs-sample-");
    try {
        const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: fixtureGlobs() });
        await generateLiveDocs({ workspaceRoot: workDir, config, logger: quiet });
        const result = await buildStaticExplorer({
            workspaceRoot: workDir,
            outputDir,
            config,
            boardPath: options.boardPath,
            logger: { log: () => undefined, error: (message: string) => console.error(message) }
        });
        console.log(`Built ${path.basename(program)}: ${result.stats.fileCount} files, ${result.stats.edgeCount} edges, at ${outputDir}`);
    } finally {
        fs.rmSync(workDir, { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error("Sample bundle build failed:", error);
    process.exitCode = 1;
});

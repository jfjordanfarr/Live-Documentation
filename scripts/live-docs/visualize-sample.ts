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

import * as path from "node:path";

import { optionValue, runCommand, UsageError } from "./cli";
import { buildSample } from "./sample-build";

interface CliOptions {
    help: boolean;
    program: string;
    outputDir: string;
    boardPath?: string;
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = { help: false, program: "", outputDir: "" };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--help" || arg === "-h") {
            options.help = true;
        } else if (arg === "--program") {
            options.program = optionValue(args, ++i, arg);
        } else if (arg === "--output" || arg === "-o") {
            options.outputDir = optionValue(args, ++i, arg);
        } else if (arg === "--board") {
            options.boardPath = optionValue(args, ++i, arg);
        } else {
            throw new UsageError(`${arg} is not an option.`);
        }
    }
    if (!options.help && (!options.program || !options.outputDir)) {
        throw new UsageError("Name the sample with --program and where to write with --output.");
    }
    return options;
}

function usage(): string {
    return [
        "Usage: npm run live-docs:visualize:estate -- [options]",
        "",
        "Builds the Explorer over a sample program, with its Live Docs generated into a temporary copy;",
        "the sample itself is never written to. The npm script names the estate sample and its board;",
        "options given after it replace those.",
        "",
        "Options:",
        "  --program <folder>     The sample program's folder.",
        "  -o, --output <dir>     Where to write the site.",
        "  --board <path>         A board inside the program to draw the World Map from.",
        "  -h, --help             Print this help."
    ].join("\n");
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        console.log(usage());
        return;
    }
    const built = await buildSample(options.program, options.outputDir, options.boardPath);
    console.log(`Built ${path.basename(path.resolve(options.program))}: ${built.fileCount} files, ${built.edgeCount} edges, at ${path.resolve(options.outputDir)}`);
}

runCommand("live-docs:visualize:estate", main);

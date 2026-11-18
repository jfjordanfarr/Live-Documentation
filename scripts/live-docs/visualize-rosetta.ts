/**
 * @file visualize-rosetta.ts
 * @description Builds the static Explorer over each Rosetta program, the same small program in nine languages, into
 * `samples/rosetta/<language>/` of the Explorer's site, by the step that builds the estate sample. The browser tests'
 * scenario table runs over these samples, resolving its `{processor}` tokens against each through the Rosetta
 * manifest, which names the programs and their parts.
 *
 * ## Usage
 *
 * ```bash
 * # Every program the manifest names, into dist/explorer/samples/rosetta/
 * npm run live-docs:visualize:rosetta
 *
 * # Some of them, anywhere
 * npx tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-rosetta.ts --output dist/explorer/samples/rosetta java go
 * ```
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { optionValue, runCommand, UsageError } from "./cli";
import { buildSample } from "./sample-build";

const PROGRAMS = "tests/integration/programs";
const MANIFEST = path.join(PROGRAMS, "rosetta-manifest.json");

interface CliOptions {
    help: boolean;
    outputDir: string;
    languages: string[];
}

function parseArgs(args: string[]): CliOptions {
    const options: CliOptions = { help: false, outputDir: "dist/explorer/samples/rosetta", languages: [] };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--help" || arg === "-h") options.help = true;
        else if (arg === "--output" || arg === "-o") options.outputDir = optionValue(args, ++i, arg);
        else if (arg.startsWith("-")) throw new UsageError(`${arg} is not an option.`);
        else options.languages.push(arg);
    }
    return options;
}

function usage(): string {
    return [
        "Usage: npm run live-docs:visualize:rosetta -- [options] [language ...]",
        "",
        "Builds the Explorer over each Rosetta program the manifest names, or over the languages given,",
        "into <output>/<language>/; the programs themselves are never written to.",
        "",
        "Options:",
        "  -o, --output <dir>     Where to write the sites (default dist/explorer/samples/rosetta).",
        "  -h, --help             Print this help."
    ].join("\n");
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        console.log(usage());
        return;
    }
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as { variants: Array<{ language: string; path: string }> };
    const known = new Set(manifest.variants.map(variant => variant.language));
    const unknown = options.languages.filter(language => !known.has(language));
    if (unknown.length > 0) throw new UsageError(`The manifest names no ${unknown.join(" or ")} program.`);
    const chosen = manifest.variants.filter(variant => options.languages.length === 0 || options.languages.includes(variant.language));
    for (const variant of chosen) {
        const outputDir = path.join(options.outputDir, variant.language);
        const built = await buildSample(path.join(PROGRAMS, variant.path), outputDir);
        console.log(`Built Rosetta in ${variant.language}: ${built.fileCount} files, ${built.edgeCount} edges, at ${path.resolve(outputDir)}`);
    }
}

runCommand("live-docs:visualize:rosetta", main);

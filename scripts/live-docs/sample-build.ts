/**
 * @file sample-build.ts
 * @description Builds the static Explorer over one sample program under `tests/integration/programs`, with its Live
 * Docs generated into a temporary copy, so that the sample itself is never written to. Shared by the commands that
 * build the estate sample (`visualize-sample.ts`) and the Rosetta samples (`visualize-rosetta.ts`).
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { buildStaticExplorer } from "@live-documentation/explorer/shared/staticBuilder";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { copyFixture } from "../oracle/fixture";

/** What a build made: how many files and edges the site carries. */
export interface SampleBuilt {
    fileCount: number;
    edgeCount: number;
}

/**
 * Generates the program's Live Docs in a copy, with the shipped default configuration, and writes the Explorer's site
 * to `outputDir`; `boardPath`, inside the program, draws the World Map from a board it carries.
 */
export async function buildSample(programDir: string, outputDir: string, boardPath?: string): Promise<SampleBuilt> {
    const program = path.resolve(programDir);
    if (!fs.existsSync(program)) {
        throw new Error(`No sample program at ${program}.`);
    }
    const quiet = { info: () => undefined, warn: () => undefined, error: (message: string) => console.error(message) };
    const workDir = copyFixture(program, "live-docs-sample-");
    try {
        const config = normalizeLiveDocumentationConfig();
        await generateLiveDocs({ workspaceRoot: workDir, config, logger: quiet });
        const result = await buildStaticExplorer({
            workspaceRoot: workDir,
            outputDir: path.resolve(outputDir),
            config,
            boardPath,
            logger: { log: () => undefined, error: (message: string) => console.error(message) }
        });
        return { fileCount: result.stats.fileCount, edgeCount: result.stats.edgeCount };
    } finally {
        fs.rmSync(workDir, { recursive: true, force: true });
    }
}

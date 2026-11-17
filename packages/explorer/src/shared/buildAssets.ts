import { build } from "esbuild";
import * as fs from "fs/promises";
import * as os from "node:os";
import * as path from "path";

import { DEFAULT_PALETTE, PALETTES, paletteStylesheet } from "../client/palette";

/** Paths and HTML template produced by the Explorer asset build step. */
export interface ExplorerAssets {
    outDir: string;
    htmlTemplate: string;
}

const moduleDirectory = __dirname;
const explorerRoot = path.resolve(moduleDirectory, "..", "");
const clientRoot = path.join(explorerRoot, "client");

/**
 * Builds the client assets in a temporary directory and keeps them available
 * only while the consumer writes its output. The directory is removed whether
 * building or consuming the assets succeeds or fails.
 */
export async function withExplorerAssets(consume: (assets: ExplorerAssets) => Promise<void>): Promise<void> {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-explorer-"));
    try {
        const entryPoint = path.join(clientRoot, "index.ts");
        const outFile = path.join(outDir, "index.js");

        await build({
            entryPoints: [entryPoint],
            outfile: outFile,
            bundle: true,
            // A classic script, not a module: a browser refuses a module script to a page opened as a file, and the
            // page must run there to say that it must be served (2026-11-12). esbuild keeps it strict, as the module was.
            format: "iife",
            sourcemap: true,
            // The force graph brings three.js, which unminified makes the bundle several times larger.
            minify: true,
            target: "es2022",
            logLevel: "silent",
            loader: { ".ts": "ts" }
        });

        // The palette's colours come first, as the custom properties every stylesheet reads, written from the one table
        // that the client's scripts read too (client/palette.ts); a palette chosen by name is written over them at startup.
        const cssSource = await fs.readFile(path.join(clientRoot, "styles.css"), "utf8");
        await fs.writeFile(path.join(outDir, "styles.css"), `@import url("./styles/palette.css");\n${cssSource}`, "utf8");

        const stylesDir = path.join(clientRoot, "styles");
        await fs.mkdir(path.join(outDir, "styles"), { recursive: true });
        const styleEntries = await fs.readdir(stylesDir);
        for (const entry of styleEntries) {
            if (entry.endsWith(".css")) {
                await fs.copyFile(path.join(stylesDir, entry), path.join(outDir, "styles", entry));
            }
        }

        await fs.writeFile(path.join(outDir, "styles", "palette.css"), paletteStylesheet(PALETTES[DEFAULT_PALETTE]), "utf8");

        const template = await fs.readFile(path.join(moduleDirectory, "template.html"), "utf8");
        await consume({ outDir, htmlTemplate: template });
    } finally {
        await fs.rm(outDir, { recursive: true, force: true });
    }
}

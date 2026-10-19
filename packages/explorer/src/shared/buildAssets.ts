import { build } from "esbuild";
import * as fs from "fs/promises";
import * as os from "node:os";
import * as path from "path";

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
            format: "esm",
            sourcemap: true,
            // The force graph brings three.js, which unminified makes the bundle several times larger.
            minify: true,
            target: "es2022",
            logLevel: "silent",
            loader: { ".ts": "ts" }
        });

        const cssSource = await fs.readFile(path.join(clientRoot, "styles.css"), "utf8");
        await fs.writeFile(path.join(outDir, "styles.css"), cssSource, "utf8");

        const stylesDir = path.join(clientRoot, "styles");
        await fs.mkdir(path.join(outDir, "styles"), { recursive: true });
        const styleEntries = await fs.readdir(stylesDir);
        for (const entry of styleEntries) {
            if (entry.endsWith(".css")) {
                await fs.copyFile(path.join(stylesDir, entry), path.join(outDir, "styles", entry));
            }
        }

        const template = await fs.readFile(path.join(moduleDirectory, "template.html"), "utf8");
        await consume({ outDir, htmlTemplate: template });
    } finally {
        await fs.rm(outDir, { recursive: true, force: true });
    }
}

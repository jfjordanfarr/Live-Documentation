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
const serverRoot = path.join(explorerRoot, "server");

/**
 * Bundles the Explorer client TypeScript + CSS into a temporary directory
 * and returns the output paths and HTML template.
 */
export async function buildExplorerAssets(): Promise<ExplorerAssets> {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-explorer-"));

    const entryPoint = path.join(clientRoot, "index.ts");
    const outFile = path.join(outDir, "index.js");

    await build({
        entryPoints: [entryPoint],
        outfile: outFile,
        bundle: true,
        format: "esm",
        sourcemap: true,
        target: "es2022",
        logLevel: "silent",
        loader: { ".ts": "ts" }
    });

    const cssSource = await fs.readFile(path.join(clientRoot, "styles.css"), "utf8");
    await fs.writeFile(path.join(outDir, "styles.css"), cssSource, "utf8");

    const stylesDir = path.join(clientRoot, "styles");
    await fs.mkdir(path.join(outDir, "styles"), { recursive: true });
    const styleEntries = await fs.readdir(stylesDir);
    await Promise.all(
        styleEntries
            .filter(entry => entry.endsWith(".css"))
            .map(entry => fs.copyFile(path.join(stylesDir, entry), path.join(outDir, "styles", entry)))
    );

    const template = await fs.readFile(path.join(serverRoot, "template.html"), "utf8");

    return {
        outDir,
        htmlTemplate: template
    };
}

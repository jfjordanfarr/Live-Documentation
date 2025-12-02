import { build } from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

export interface BuildExplorerAssetsOptions {
    workspaceRoot: string;
}

export interface ExplorerAssets {
    outDir: string;
    htmlTemplate: string;
}

const moduleDirectory = __dirname;
const explorerRoot = path.resolve(moduleDirectory, "..", "");
const clientRoot = path.join(explorerRoot, "client");
const serverRoot = path.join(explorerRoot, "server");

export async function buildExplorerAssets(options: BuildExplorerAssetsOptions): Promise<ExplorerAssets> {
    const outDir = path.resolve(options.workspaceRoot, "AI-Agent-Workspace/tmp/live-docs-explorer");
    await fs.mkdir(outDir, { recursive: true });

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

    const template = await fs.readFile(path.join(serverRoot, "template.html"), "utf8");

    return {
        outDir,
        htmlTemplate: template
    };
}

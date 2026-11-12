import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, expect, it } from "vitest";

import { buildStaticExplorer } from "./staticBuilder";

let scratch: string | undefined;
const tempVariables = ["TMPDIR", "TMP", "TEMP"] as const;
const originalTempVariables = {
    TMPDIR: process.env.TMPDIR,
    TMP: process.env.TMP,
    TEMP: process.env.TEMP
};
const quiet = { log: () => undefined, error: () => undefined };
// Each test runs the real client bundle through esbuild: about 1.2 s alone on 2026-10-20, and over the 5 s default
// under the unit suite's parallel load. What these tests check is the output and its cleanup, not the build's speed.
const BUNDLE_BUDGET_MS = 30_000;

afterEach(async () => {
    for (const name of tempVariables) {
        const original = originalTempVariables[name];
        if (original === undefined) delete process.env[name];
        else process.env[name] = original;
    }
    if (scratch) await fs.rm(scratch, { recursive: true, force: true });
    scratch = undefined;
});

async function workspace(): Promise<{ root: string; output: string; assetsTemp: string }> {
    scratch = await fs.mkdtemp(path.join(os.tmpdir(), "explorer-bundle-assets-"));
    const root = path.join(scratch, "workspace");
    const output = path.join(scratch, "output");
    const assetsTemp = path.join(scratch, "temporary-assets");
    await fs.mkdir(root);
    await fs.mkdir(assetsTemp);
    for (const name of tempVariables) process.env[name] = assetsTemp;
    expect(path.resolve(os.tmpdir())).toBe(path.resolve(assetsTemp));
    return { root, output, assetsTemp };
}

it("writes the existing folder bundle and removes its temporary assets", async () => {
    const { root, output, assetsTemp } = await workspace();
    const result = await buildStaticExplorer({ workspaceRoot: root, outputDir: output, logger: quiet });

    expect(await fs.readdir(assetsTemp)).toEqual([]);
    const html = await fs.readFile(path.join(output, "index.html"), "utf8");
    expect(html).toContain('./static/styles.css');
    // A classic script, which a page opened as a file still runs so that it can say it must be served; a browser
    // refuses such a page a module script, and the page then sat at "Loading..." (2026-11-12).
    expect(html).toContain('<script defer src="./static/index.js"></script>');
    expect(html).not.toContain('type="module"');
    await expect(fs.stat(path.join(output, "static", "index.js"))).resolves.toBeDefined();
    await expect(fs.stat(path.join(output, "static", "styles", "theme.css"))).resolves.toBeDefined();
    const script = await fs.readFile(path.join(output, "static", "index.js"), "utf8");
    // Strict, as the module it was, and wrapped, so that nothing it declares lands among the page's globals.
    expect(script.startsWith('"use strict";(()=>{')).toBe(true);
    const data = JSON.parse(await fs.readFile(path.join(output, "explorer-data.json"), "utf8")) as { graph: { files: Record<string, unknown> } };
    expect(data.graph.files).toEqual({});
    expect(result.stats.bundleSizeBytes).toBeGreaterThan(0);
}, BUNDLE_BUDGET_MS);

it("counts the bytes it wrote, not what else lies in the output folder", async () => {
    const { root, output } = await workspace();
    // Another build beside this one, as the samples lie under dist/explorer/samples (2026-11-12).
    const other = path.join(output, "samples", "other", "explorer-data.json");
    await fs.mkdir(path.dirname(other), { recursive: true });
    await fs.writeFile(other, "x".repeat(4 * 1024 * 1024), "utf8");

    const result = await buildStaticExplorer({ workspaceRoot: root, outputDir: output, logger: quiet });

    const written = ["index.html", "explorer-data.json", "static"].map(entry => path.join(output, entry));
    expect(result.stats.bundleSizeBytes).toBe((await Promise.all(written.map(bytesUnder))).reduce((sum, size) => sum + size, 0));
}, BUNDLE_BUDGET_MS);

async function bytesUnder(target: string): Promise<number> {
    const stat = await fs.stat(target);
    if (!stat.isDirectory()) return stat.size;
    const entries = await fs.readdir(target);
    return (await Promise.all(entries.map(entry => bytesUnder(path.join(target, entry))))).reduce((sum, size) => sum + size, 0);
}

it("removes temporary assets when the output writer fails", async () => {
    const { root, output, assetsTemp } = await workspace();
    const viewerFile = path.join(output, "index.html");
    await fs.mkdir(viewerFile, { recursive: true });

    await expect(buildStaticExplorer({ workspaceRoot: root, outputDir: output, logger: quiet })).rejects.toMatchObject({
        path: viewerFile,
        code: expect.stringMatching(/^(EISDIR|EPERM|EACCES)$/u)
    });
    expect(await fs.readdir(assetsTemp)).toEqual([]);
}, BUNDLE_BUDGET_MS);

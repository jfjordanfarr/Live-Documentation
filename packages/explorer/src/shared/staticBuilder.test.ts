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
    expect(html).toContain('./static/index.js');
    await expect(fs.stat(path.join(output, "static", "index.js"))).resolves.toBeDefined();
    await expect(fs.stat(path.join(output, "static", "styles", "theme.css"))).resolves.toBeDefined();
    expect((await fs.readFile(path.join(output, "static", "index.js"))).byteLength).toBeGreaterThan(0);
    const data = JSON.parse(await fs.readFile(path.join(output, "explorer-data.json"), "utf8")) as { graph: { files: Record<string, unknown> } };
    expect(data.graph.files).toEqual({});
    expect(result.stats.totalSizeBytes).toBeGreaterThan(0);
});

it("removes temporary assets when the output writer fails", async () => {
    const { root, output, assetsTemp } = await workspace();
    const viewerFile = path.join(output, "index.html");
    await fs.mkdir(viewerFile, { recursive: true });

    await expect(buildStaticExplorer({ workspaceRoot: root, outputDir: output, logger: quiet })).rejects.toMatchObject({
        path: viewerFile,
        code: expect.stringMatching(/^(EISDIR|EPERM|EACCES)$/u)
    });
    expect(await fs.readdir(assetsTemp)).toEqual([]);
});

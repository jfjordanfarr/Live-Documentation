import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, expect, it, vi } from "vitest";

import { withExplorerAssets } from "./buildAssets";

const fault = vi.hoisted(() => ({ compile: true, copy: false }));

vi.mock("esbuild", () => ({
    build: async () => {
        if (fault.compile) throw new Error("asset compilation failed");
    }
}));

vi.mock("fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("fs/promises")>();
    return {
        ...actual,
        copyFile: async (source: string, destination: string) => {
            if (fault.copy && source.endsWith(".css")) throw new Error("stylesheet copy failed");
            await actual.copyFile(source, destination);
        }
    };
});

let scratch: string | undefined;
const tempVariables = ["TMPDIR", "TMP", "TEMP"] as const;
const originalTempVariables = {
    TMPDIR: process.env.TMPDIR,
    TMP: process.env.TMP,
    TEMP: process.env.TEMP
};

afterEach(async () => {
    for (const name of tempVariables) {
        const original = originalTempVariables[name];
        if (original === undefined) delete process.env[name];
        else process.env[name] = original;
    }
    if (scratch) await fs.rm(scratch, { recursive: true, force: true });
    scratch = undefined;
    fault.compile = true;
    fault.copy = false;
});

async function isolatedTempRoot(): Promise<string> {
    scratch = await fs.mkdtemp(path.join(os.tmpdir(), "explorer-assets-failure-"));
    for (const name of tempVariables) process.env[name] = scratch;
    expect(path.resolve(os.tmpdir())).toBe(path.resolve(scratch));
    return scratch;
}

it("removes temporary assets when compilation fails before the consumer runs", async () => {
    const tempRoot = await isolatedTempRoot();
    let consumed = false;

    await expect(withExplorerAssets(async () => { consumed = true; })).rejects.toThrow("asset compilation failed");
    expect(consumed).toBe(false);
    expect(await fs.readdir(tempRoot)).toEqual([]);
});

it("removes temporary assets when a stylesheet copy fails", async () => {
    const tempRoot = await isolatedTempRoot();
    fault.compile = false;
    fault.copy = true;
    let consumed = false;

    await expect(withExplorerAssets(async () => { consumed = true; })).rejects.toThrow("stylesheet copy failed");
    expect(consumed).toBe(false);
    expect(await fs.readdir(tempRoot)).toEqual([]);
});

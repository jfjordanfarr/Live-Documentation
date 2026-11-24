import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { NODE_FILE_HOST } from "./nodeHost";
import { createNodeOutputSink, NODE_OUTPUT_SINK } from "./nodeOutputSink";
import type { FileHost } from "./workspaceFiles";

describe("NODE_OUTPUT_SINK", () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "node-output-sink-"));
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it("reads undefined for absent files, writes with recursive parent creation, and reads UTF-8 back intact", async () => {
    const target = path.join(root, ".mdmd", "layer-4", "a", "b", "sample.ts.mdmd.md");
    expect(await NODE_OUTPUT_SINK.readText(target)).toBeUndefined();

    const content = "\ufeff# Sample\nline\n";
    await NODE_OUTPUT_SINK.writeText(target, content);
    expect(await NODE_OUTPUT_SINK.readText(target)).toBe(content);
  });

  it("propagates ENAMETOOLONG on readText rather than mistaking it for absence", async () => {
    const tooLong = path.join(root, `${"n".repeat(300)}.md`);
    await expect(NODE_OUTPUT_SINK.readText(tooLong)).rejects.toMatchObject({ code: "ENAMETOOLONG" });
  });

  it("checks directory presence cleanly and distinguishes files from directories", async () => {
    const dir = path.join(root, "docs", "layer-4");
    const file = path.join(root, "plain.txt");
    expect(await NODE_OUTPUT_SINK.hasDirectory(dir)).toBe(false);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, "hello", "utf8");
    expect(await NODE_OUTPUT_SINK.hasDirectory(dir)).toBe(true);
    expect(await NODE_OUTPUT_SINK.hasDirectory(file)).toBe(false);
  });

  it("lists matching files sorted by absolute path, returns empty for an absent root, and throws on unreadable folders", async () => {
    const base = path.join(root, ".mdmd", "layer-4");
    expect(await NODE_OUTPUT_SINK.listFiles(base, ".mdmd.md")).toEqual([]);

    const bDoc = path.join(base, "z", "b.ts.mdmd.md");
    const aDoc = path.join(base, "a", "a.ts.mdmd.md");
    const other = path.join(base, "a", "notes.txt");
    await NODE_OUTPUT_SINK.writeText(bDoc, "b");
    await NODE_OUTPUT_SINK.writeText(aDoc, "a");
    await NODE_OUTPUT_SINK.writeText(other, "ignored");

    expect(await NODE_OUTPUT_SINK.listFiles(base, ".mdmd.md")).toEqual([aDoc, bDoc]);

    const unreadableError = Object.assign(new Error("EACCES: permission denied, scandir"), { code: "EACCES", syscall: "scandir" });
    const failingHost: FileHost = {
      ...NODE_FILE_HOST,
      entries: async (folder) => {
        if (folder === path.join(base, "z")) throw unreadableError;
        return NODE_FILE_HOST.entries(folder);
      }
    };
    const sink = createNodeOutputSink(failingHost);
    await expect(sink.listFiles(base, ".mdmd.md")).rejects.toThrow("EACCES");
  });

  it("removes files (ignoring absence) and tidies empty parents strictly beneath stopDir", async () => {
    const stopDir = path.join(root, ".mdmd", "layer-4");
    const deep = path.join(stopDir, "pkg", "nested", "orphan.ts.mdmd.md");
    const kept = path.join(stopDir, "pkg", "kept.ts.mdmd.md");
    await NODE_OUTPUT_SINK.writeText(deep, "orphan");
    await NODE_OUTPUT_SINK.writeText(kept, "kept");

    // Removing a missing file succeeds silently.
    await NODE_OUTPUT_SINK.removeFile(path.join(stopDir, "missing.mdmd.md"), stopDir);

    // Removing `deep` cleans `pkg/nested`, stops at `pkg` because `kept` remains.
    await NODE_OUTPUT_SINK.removeFile(deep, stopDir);
    expect(await NODE_OUTPUT_SINK.readText(deep)).toBeUndefined();
    expect(await NODE_OUTPUT_SINK.hasDirectory(path.join(stopDir, "pkg", "nested"))).toBe(false);
    expect(await NODE_OUTPUT_SINK.hasDirectory(path.join(stopDir, "pkg"))).toBe(true);

    // Removing `kept` cleans `pkg` as well, but preserves `stopDir` itself.
    await NODE_OUTPUT_SINK.removeFile(kept, stopDir);
    expect(await NODE_OUTPUT_SINK.hasDirectory(path.join(stopDir, "pkg"))).toBe(false);
    expect(await NODE_OUTPUT_SINK.hasDirectory(stopDir)).toBe(true);
  });
});

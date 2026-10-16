import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { LANGUAGE_ADAPTERS, analyzeWithLanguageAdapters } from "./index";
import { LIVE_DOCUMENTATION_SOURCE_EXTENSIONS, LIVE_DOCUMENTATION_SOURCE_FILE_NAMES } from "../../config/liveDocumentationConfig";

describe("the adapter registry", () => {
  it("has a default glob for every extension an adapter reads, so that a cold run reaches every file the generator can describe", () => {
    const withoutGlob = LANGUAGE_ADAPTERS.flatMap((adapter) =>
      adapter.extensions
        .filter((extension) => !LIVE_DOCUMENTATION_SOURCE_EXTENSIONS.includes(extension))
        .map((extension) => `${adapter.id} reads ${extension}`)
    );
    expect(withoutGlob).toEqual([]);
  });

  it("has a default glob for every file name an adapter reads, and lists no name that no adapter reads", () => {
    const names = LANGUAGE_ADAPTERS.flatMap((adapter) => adapter.fileNames ?? []);
    expect([...names].sort()).toEqual([...LIVE_DOCUMENTATION_SOURCE_FILE_NAMES].sort());
    expect(new Set(names).size).toBe(names.length);
  });

  it("declares every extension lowercase with its dot, as the registry matches them, and every adapter reads some file", () => {
    for (const adapter of LANGUAGE_ADAPTERS) {
      expect(adapter.extensions.length + (adapter.fileNames?.length ?? 0), adapter.id).toBeGreaterThan(0);
      for (const extension of adapter.extensions) {
        expect(extension, adapter.id).toMatch(/^\.[a-z0-9]+$/u);
      }
      for (const name of adapter.fileNames ?? []) {
        expect(name, adapter.id).toMatch(/^[^/\\]+\.[^/\\]+$/u);
      }
    }
  });

  it("reads a manifest by its exact name and leaves other files of its format unread", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "adapter-registry-"));
    try {
      const write = async (name: string, content: string): Promise<string> => {
        const file = path.join(workspaceRoot, name);
        await fs.writeFile(file, content, "utf8");
        return file;
      };
      const manifest = await write("Cargo.toml", "[package]\nname = \"engine\"\n");
      const other = await write("rustfmt.toml", "max_width = 100\n");
      // In a folder of its own: a case-insensitive file system holds one of the two names.
      await fs.mkdir(path.join(workspaceRoot, "lower"));
      const lookalike = await write("lower/cargo.toml", "[package]\nname = \"lookalike\"\n");
      expect((await analyzeWithLanguageAdapters({ absolutePath: manifest, workspaceRoot }))?.symbols.map((symbol) => symbol.name)).toEqual(["engine"]);
      expect(await analyzeWithLanguageAdapters({ absolutePath: other, workspaceRoot })).toBeNull();
      expect(await analyzeWithLanguageAdapters({ absolutePath: lookalike, workspaceRoot })).toBeNull();
      expect(await analyzeWithLanguageAdapters({ absolutePath: await write("settings.xml", "<settings/>"), workspaceRoot })).toBeNull();
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});

import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { scanAndBundleMarkdown } from "./bundledMarkdownScanner";

/**
 * A throwaway workspace with one Live Doc that links to a README and to a file
 * inside a chat archive, using the same relative-path shape as a real workspace
 * so the scanner's path resolution is exercised for real.
 */
async function createWorkspace(): Promise<string> {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "bundled-markdown-"));

    await fs.mkdir(path.join(root, "docs"),       { recursive: true });
    await fs.mkdir(path.join(root, "notes/chat"), { recursive: true });

    await fs.writeFile(path.join(root, "README.md"),                "# Readme\n");
    await fs.writeFile(path.join(root, "notes/chat/2025-11-01.md"), "# Chat\n");
    await fs.writeFile(
        path.join(root, "docs/a.ts.md"),
        "See [the readme](../README.md) and [a chat](../notes/chat/2025-11-01.md#turn-1).\n"
    );

    return root;
}

describe("scanAndBundleMarkdown", () => {
    let root: string;

    const docs: Record<string, string> = { "src/a.ts": "" };
    const liveDocPaths = new Map([["src/a.ts", "docs/a.ts.md"]]);
    const logger       = { log: () => {}, error: () => {} };

    beforeEach(async () => {
        root = await createWorkspace();
        docs["src/a.ts"] = await fs.readFile(path.join(root, "docs/a.ts.md"), "utf-8");
    });

    afterEach(async () => {
        await fs.rm(root, { recursive: true, force: true });
    });

    it("bundles every linked markdown file by default", async () => {
        const result = await scanAndBundleMarkdown({ docs, workspaceRoot: root, liveDocPaths, logger });

        expect(Object.keys(result.bundledMarkdown).sort()).toEqual(["README.md", "notes/chat/2025-11-01.md"]);
        expect(result.relatedDocLinks).toHaveLength(2);
    });

    it("keeps excluded files out of both the bundle and the related-doc links", async () => {
        const result = await scanAndBundleMarkdown({
            docs,
            workspaceRoot: root,
            liveDocPaths,
            logger,
            exclude: ["notes/chat/**"]
        });

        expect(Object.keys(result.bundledMarkdown)).toEqual(["README.md"]);
        expect(result.relatedDocLinks).toEqual([{ sourceId: "src/a.ts", targetPath: "README.md" }]);
        expect(result.bundledMarkdownTree.children?.map(child => child.name)).toEqual(["README.md"]);
    });
});

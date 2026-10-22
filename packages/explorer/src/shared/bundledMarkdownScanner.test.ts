import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { bundleRelatedDocs } from "./bundledMarkdownScanner";
import type { RelatedDocLink } from "./staticExplorerData";

/** A throwaway workspace with a README and a file inside a chat archive, as two docs' links name them. */
async function createWorkspace(): Promise<string> {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "bundled-markdown-"));
    await fs.mkdir(path.join(root, "notes/chat"), { recursive: true });
    await fs.writeFile(path.join(root, "README.md"), "# Readme\n");
    await fs.writeFile(path.join(root, "notes/chat/2025-11-01.md"), "# Chat\n");
    return root;
}

describe("bundleRelatedDocs", () => {
    let root: string;
    const logger = { log: () => {}, error: () => {} };

    beforeEach(async () => {
        root = await createWorkspace();
    });

    afterEach(async () => {
        await fs.rm(root, { recursive: true, force: true });
    });

    it("bundles each linked document once, keeps every link to it, and files it in the tree", async () => {
        const links: RelatedDocLink[] = [
            { sourceId: "src/a.ts", targetPath: "README.md", direction: "cites" },
            { sourceId: "src/b.ts", targetPath: "README.md", direction: "cited-by" },
            { sourceId: "src/a.ts", targetPath: "notes/chat/2025-11-01.md", direction: "cites" }
        ];
        const result = await bundleRelatedDocs({ links, workspaceRoot: root, logger });

        expect(result.bundledMarkdown).toEqual({ "README.md": "# Readme\n", "notes/chat/2025-11-01.md": "# Chat\n" });
        expect(result.relatedDocLinks).toEqual(links);
        expect(result.bundledMarkdownTree.children?.map(child => child.name)).toEqual(["notes", "README.md"]);
    });

    it("drops a link to a document that cannot be read, so the Related Docs name only what the bundle carries", async () => {
        const result = await bundleRelatedDocs({
            links: [{ sourceId: "src/a.ts", targetPath: "README.md", direction: "cites" }, { sourceId: "src/a.ts", targetPath: "docs/not-yet-written.md", direction: "cited-by" }],
            workspaceRoot: root,
            logger
        });

        expect(Object.keys(result.bundledMarkdown)).toEqual(["README.md"]);
        expect(result.relatedDocLinks).toEqual([{ sourceId: "src/a.ts", targetPath: "README.md", direction: "cites" }]);
    });
});

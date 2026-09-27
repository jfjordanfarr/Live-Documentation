import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_FILE_EXTENSION,
  normalizeLiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";

import { generateLiveDocs } from "./generator";

describe("generateLiveDocs pruning", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-live-docs-"));
    await fs.mkdir(path.join(workspaceRoot, "packages", "foo", "src"), { recursive: true });
    await fs.writeFile(
      path.join(workspaceRoot, "packages", "foo", "src", "index.ts"),
      [
        "export function example(): number {",
        "  return 1;",
        "}",
        ""
      ].join("\n"),
      "utf8"
    );
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("prunes stale docs without authored content while preserving authored stubs", async () => {
    const config = normalizeLiveDocumentationConfig({
      ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
      glob: ["packages/foo/src/**/*.ts"]
    });

    const initialResult = await generateLiveDocs({
      workspaceRoot,
      config,
      dryRun: false
    });

    expect(initialResult.deleted).toBe(0);
    expect(initialResult.deletedFiles).toHaveLength(0);

    const docRoot = path.join(
      workspaceRoot,
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.root,
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer
    );
    const orphanDocPath = path.join(
      docRoot,
      "packages",
      "foo",
      "src",
      `orphan.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
    );
    const preserveDocPath = path.join(
      docRoot,
      "packages",
      "foo",
      "src",
      `preserve.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
    );

    await fs.mkdir(path.dirname(orphanDocPath), { recursive: true });

    const orphanDoc = [
      "# packages/foo/src/orphan.ts",
      "",
      "## Metadata",
      "- Layer: 4",
      "- Archetype: implementation",
      "- Code Path: packages/foo/src/orphan.ts",
      "- Live Doc ID: LD-implementation-packages-foo-src-orphan-ts",
      "",
      "## Authored",
      "### Purpose",
      "_Pending authored purpose_",
      "",
      "### Notes",
      "_Pending notes_",
      "",
      "## Generated",
      "<!-- LIVE-DOC:BEGIN Public Symbols -->",
      "### Public Symbols",
      "_No public symbols detected_",
      "<!-- LIVE-DOC:END Public Symbols -->",
      "",
      "<!-- LIVE-DOC:BEGIN Dependencies -->",
      "### Dependencies",
      "_No dependencies documented yet_",
      "<!-- LIVE-DOC:END Dependencies -->",
      ""
    ].join("\n");

    const authoredDoc = [
      "# packages/foo/src/preserve.ts",
      "",
      "## Metadata",
      "- Layer: 4",
      "- Archetype: implementation",
      "- Code Path: packages/foo/src/preserve.ts",
      "- Live Doc ID: LD-implementation-packages-foo-src-preserve-ts",
      "",
      "## Authored",
      "### Purpose",
      "Meaningful purpose text",
      "",
      "### Notes",
      "Meaningful notes",
      "",
      "## Generated",
      "<!-- LIVE-DOC:BEGIN Public Symbols -->",
      "### Public Symbols",
      "_No public symbols detected_",
      "<!-- LIVE-DOC:END Public Symbols -->",
      "",
      "<!-- LIVE-DOC:BEGIN Dependencies -->",
      "### Dependencies",
      "_No dependencies documented yet_",
      "<!-- LIVE-DOC:END Dependencies -->",
      ""
    ].join("\n");

    await fs.writeFile(orphanDocPath, orphanDoc, "utf8");
    await fs.writeFile(preserveDocPath, authoredDoc, "utf8");

    const infoMessages: string[] = [];
    const warnMessages: string[] = [];

    const result = await generateLiveDocs({
      workspaceRoot,
      config,
      dryRun: false,
      logger: {
        info: (message) => infoMessages.push(message),
        warn: (message) => warnMessages.push(message),
        error: (message) => {
          throw new Error(message);
        }
      }
    });

    expect(result.deleted).toBe(1);
    const expectedRoot = path.join(
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.root,
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer,
      "packages",
      "foo",
      "src"
    );
    expect(result.deletedFiles).toContain(
      `${expectedRoot}/orphan.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`.replace(/\\/g, "/")
    );
    expect(result.deletedFiles).not.toContain(
      `${expectedRoot}/preserve.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`.replace(/\\/g, "/")
    );

    await expect(fs.stat(orphanDocPath)).rejects.toThrowError();
    await expect(fs.stat(preserveDocPath)).resolves.toBeDefined();

    expect(infoMessages.some((message) => message.includes("authored content detected"))).toBe(true);
    expect(infoMessages.some((message) => message.includes("Deleted stale Live Doc"))).toBe(true);
  });
});

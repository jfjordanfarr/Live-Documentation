import * as assert from "node:assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, it } from "vitest";

import { generateLiveDocs } from "../../../packages/generator/src/generator";
import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_FILE_EXTENSION,
  normalizeLiveDocumentationConfig
} from "../../../packages/shared/src/config/liveDocumentationConfig";
import type { LiveDocGraph } from "../../../packages/shared/src/live-docs/graph";
import { readLiveDocGraph } from "../../../packages/shared/src/live-docs/graphFiles";

const DEFAULT_LIVE_DOC_ROOT = DEFAULT_LIVE_DOCUMENTATION_CONFIG.root;
const DEFAULT_LIVE_DOC_LAYER = DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer;

describe("Live Docs generator", () => {
  it("preserves authored sections and produces deterministic output", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-generator-"));

    try {
      const sourcePath = path.join(workspaceRoot, "packages", "app", "src");
      await fs.mkdir(sourcePath, { recursive: true });

      const sourceFile = path.join(sourcePath, "example.ts");
      await fs.writeFile(
        sourceFile,
        [
          "export interface Greeter {",
          "  greet(name: string): string;",
          "}",
          "",
          "export function greet(name: string): string {",
          "  return `Hello, ${name}!`;",
          "}"
        ].join("\n"),
        "utf8"
      );

      const docDir = path.join(workspaceRoot, DEFAULT_LIVE_DOC_ROOT, DEFAULT_LIVE_DOC_LAYER, "packages", "app", "src");
      await fs.mkdir(docDir, { recursive: true });

      const docPath = path.join(docDir, `example.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`);
      await fs.writeFile(
        docPath,
        [
          "# packages/app/src/example.ts",
          "",
          "## Metadata",
          "- Layer: 4",
          "- Archetype: implementation",
          "- Code Path: packages/app/src/example.ts",
          "- Live Doc ID: LD-implementation-packages-app-src-example-ts",
          "",
          "## Authored",
          "### Description",
          "Existing description",
          "",
          "### Purpose",
          "Existing purpose",
          "",
          "### Notes",
          "Existing notes",
          "",
          "## Generated",
          "<!-- LIVE-DOC:BEGIN Public Symbols -->",
          "### Public Symbols",
          "_No data provided_",
          "<!-- LIVE-DOC:END Public Symbols -->",
          "",
          "<!-- LIVE-DOC:BEGIN Dependencies -->",
          "### Dependencies",
          "_No data provided_",
          "<!-- LIVE-DOC:END Dependencies -->"
        ].join("\n"),
        "utf8"
      );

      const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        glob: ["packages/**/*.ts"]
      });

      await generateLiveDocs({
        workspaceRoot,
        config,
        changedOnly: false,
        dryRun: false
      });

      const firstPass = await fs.readFile(docPath, "utf8");
      assert.match(firstPass, /Existing description/);
      assert.match(firstPass, /### Public Symbols/);
      assert.match(firstPass, /greet/);

      await generateLiveDocs({
        workspaceRoot,
        config,
        changedOnly: false,
        dryRun: false
      });

      const secondPass = await fs.readFile(docPath, "utf8");
      assert.strictEqual(firstPass, secondPass, "Regeneration should be deterministic");

      // The run also writes the graph index, which is the graph the docs derive to.
      const written = JSON.parse(await fs.readFile(path.join(workspaceRoot, DEFAULT_LIVE_DOC_ROOT, "index.json"), "utf8")) as LiveDocGraph;
      assert.deepStrictEqual(written, JSON.parse(JSON.stringify(await readLiveDocGraph({ workspaceRoot, config }))));
      assert.deepStrictEqual(Object.keys(written.files), ["packages/app/src/example.ts"]);
      assert.strictEqual(written.files["packages/app/src/example.ts"].authored.includes("Existing purpose"), true);
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});

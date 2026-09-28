import { glob } from "glob";
import * as fs from "node:fs";
import * as os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig
} from "../../../packages/engine/src/config/liveDocumentationConfig";
import { parseLiveDoc, renderLiveDoc } from "../../../packages/engine/src/live-docs/document";
import { generateLiveDocs } from "../../../packages/generator/src/generator";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const PROGRAMS = path.join(REPO_ROOT, "tests", "integration", "programs");

/** Every doc the grammar must describe: parsing and re-rendering it changes nothing. */
function expectRoundTrip(docPath: string): void {
  const text = fs.readFileSync(docPath, "utf8");
  let rendered: string;
  try {
    rendered = renderLiveDoc(parseLiveDoc(text));
  } catch (error) {
    throw new Error(`${path.relative(REPO_ROOT, docPath)}: ${(error as Error).message}`);
  }
  expect(rendered, path.relative(REPO_ROOT, docPath)).toBe(text);
}

describe("the Live Doc grammar over real docs", () => {
  it("describes every committed Live Doc of this repository", async () => {
    const config = normalizeLiveDocumentationConfig(
      JSON.parse(fs.readFileSync(path.join(REPO_ROOT, ".live-docs.config.json"), "utf8"))
    );
    const docs = await glob(`${config.root}/${config.baseLayer}/**/*${config.extension}`, { cwd: REPO_ROOT, absolute: true, nodir: true });
    expect(docs.length).toBeGreaterThan(100);
    for (const doc of docs.sort()) {
      expectRoundTrip(doc);
    }
  });

  it("describes what the generator writes for every sample program", async () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "live-docs-round-trip-"));
    try {
      fs.cpSync(PROGRAMS, path.join(workspaceRoot, "programs"), {
        recursive: true,
        filter: (source) => !/(^|\/)(bin|obj|target|node_modules|__pycache__|expected)(\/|$)/u.test(source) && !source.endsWith("index.scip")
      });
      const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        glob: DEFAULT_LIVE_DOCUMENTATION_CONFIG.glob.map((pattern) => pattern.replace(/^tests\//u, "programs/"))
      });
      const result = await generateLiveDocs({
        workspaceRoot,
        config,
        logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } }
      });
      expect(result.written).toBeGreaterThan(100);
      for (const record of result.files) {
        if (record.change !== "skipped") {
          expectRoundTrip(path.join(workspaceRoot, record.docPath));
        }
      }
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });
});

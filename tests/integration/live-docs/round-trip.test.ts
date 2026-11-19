import { glob } from "glob";
import * as fs from "node:fs";
import * as os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig
} from "../../../packages/engine/src/config/liveDocumentationConfig";
import { parseBoard } from "../../../packages/engine/src/live-docs/board";
import { parseLiveDoc, renderLiveDoc } from "../../../packages/engine/src/live-docs/document";
import { readLiveDocGraph } from "../../../packages/engine/src/live-docs/graphFiles";
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
    throw new Error(`${path.relative(REPO_ROOT, docPath)}: ${(error as Error).message}`, { cause: error });
  }
  expect(rendered, path.relative(REPO_ROOT, docPath)).toBe(text);
}

describe("the Live Doc grammar over real docs", () => {
  it("describes every committed Live Doc of this repository", async () => {
    const config = normalizeLiveDocumentationConfig(
      JSON.parse(fs.readFileSync(path.join(REPO_ROOT, ".live-docs.config.json"), "utf8"))
    );
    const docs = await glob(`${config.root}/${config.baseLayer}/**/*${config.extension}`, { cwd: REPO_ROOT, absolute: true, nodir: true, dot: true });
    expect(docs.length).toBeGreaterThan(100);
    for (const doc of docs.sort()) {
      expectRoundTrip(doc);
    }
  });

  it("reads every committed Live Doc, checked out with CRLF line endings as Git for Windows does, into the same graph", async () => {
    const config = normalizeLiveDocumentationConfig(
      JSON.parse(fs.readFileSync(path.join(REPO_ROOT, ".live-docs.config.json"), "utf8"))
    );
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "live-docs-crlf-"));
    try {
      const docs = await glob(`${config.root}/${config.baseLayer}/**/*${config.extension}`, { cwd: REPO_ROOT, nodir: true, dot: true });
      expect(docs.length).toBeGreaterThan(100);
      for (const doc of docs) {
        const target = path.join(workspaceRoot, doc);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, fs.readFileSync(path.join(REPO_ROOT, doc), "utf8").split("\n").join("\r\n"));
      }
      const [asWritten, asCheckedOut] = await Promise.all([readLiveDocGraph({ workspaceRoot: REPO_ROOT, config }), readLiveDocGraph({ workspaceRoot, config })]);
      expect(Object.keys(asCheckedOut.files)).toHaveLength(docs.length);
      expect(asCheckedOut).toEqual(asWritten);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("reads a doc and the board of this repository with a byte-order mark and CRLF line endings, as Windows PowerShell writes a file, as without", () => {
    const config = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, ".live-docs.config.json"), "utf8")) as { board: string };
    const asWindowsWrites = (text: string): string => `\ufeff${text.split("\n").join("\r\n")}`;
    const doc = fs.readFileSync(path.join(REPO_ROOT, ".mdmd/layer-4/packages/engine/src/live-docs/document.ts.mdmd.md"), "utf8");
    expect(parseLiveDoc(asWindowsWrites(doc))).toEqual(parseLiveDoc(doc));
    const board = fs.readFileSync(path.join(REPO_ROOT, config.board), "utf8");
    expect(parseBoard(asWindowsWrites(board))).toEqual(parseBoard(board));
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

      // Checked out again with CRLF line endings, as Git for Windows does, and every other doc with a byte-order mark, as
      // Windows PowerShell writes a file: the check calls no doc changed, and a run rewrites none, its timestamp, its
      // endings and its mark kept.
      const written = result.files.filter((record) => record.change !== "skipped").map((record) => path.join(workspaceRoot, record.docPath));
      for (const [index, doc] of written.entries()) {
        fs.writeFileSync(doc, `${index % 2 === 0 ? "\ufeff" : ""}${fs.readFileSync(doc, "utf8").split("\n").join("\r\n")}`);
      }
      const checkedOut = new Map(written.map((doc) => [doc, fs.readFileSync(doc, "utf8")]));
      const logger = { info: () => undefined, warn: () => undefined, error: (message: string) => { throw new Error(message); } };
      const check = await generateLiveDocs({ workspaceRoot, config, dryRun: true, logger });
      expect(check.files.filter((record) => record.change !== "unchanged" && record.change !== "skipped").map((record) => record.docPath)).toEqual([]);
      const rerun = await generateLiveDocs({ workspaceRoot, config, logger });
      expect(rerun.written).toBe(0);
      expect(written.filter((doc) => fs.readFileSync(doc, "utf8") !== checkedOut.get(doc))).toEqual([]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });
});

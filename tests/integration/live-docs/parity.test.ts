/**
 * The parity ledger's test (2026-11-22, the root's ruling on how the table of
 * `.mdmd/layer-2/parity.mdmd.md` is kept true). Each row's command runs over the
 * estate sample or a two-commit scripted repository with its history: an
 * equivalent fails the test when its output stops holding what the row expects,
 * and a gap fails it when its symptom goes, so that a mend which closes a gap
 * moves its row in the same commit. The document's table must be the one the
 * ledger prints. Not held: that every control of the page has a row.
 */
import * as assert from "node:assert";
import { spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { generateLiveDocs } from "../../../packages/generator/src/generator";
import { DOCUMENT_PATH, LEDGER_PATH, renderParityTable, withTable, type ParityLedger, type ParityRow } from "../../../scripts/doc-tools/parity-table";
import { NOT_FIXTURE } from "../../../scripts/oracle/fixture";
import { buildRepository, SCRIPT } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const ledger = JSON.parse(fs.readFileSync(path.join(repoRoot, LEDGER_PATH), "utf8")) as ParityLedger;
const workspaces: Record<string, string> = {};
const commits: Record<string, string> = {};
const outputs = new Map<ParityRow, string>();

function run(workspace: string, args: string[]): Promise<string> {
  const [command, ...rest] = args;
  const script = path.join(repoRoot, "scripts", "live-docs", `${command}.ts`);
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), script, "--workspace", workspace, ...rest], { cwd: workspace, stdio: ["ignore", "pipe", "pipe"] });
    let text = "";
    child.stdout.on("data", (chunk: Buffer) => (text += chunk.toString("utf8")));
    child.stderr.on("data", (chunk: Buffer) => (text += chunk.toString("utf8")));
    child.on("error", reject);
    child.on("close", () => resolve(text));
  });
}

beforeAll(async () => {
  const estate = fs.mkdtempSync(path.join(os.tmpdir(), "parity-estate-"));
  const source = path.join(repoRoot, "tests", "integration", "programs", "csharp", "estate");
  // A fixture is copied without what a compiler or an indexer left in it (`obj`, `bin`): a checkout that has run the
  // C# oracles holds such folders, ignored by git, and a copy that took them scanned thirty files more.
  fs.cpSync(source, estate, { recursive: true, filter: (from) => !NOT_FIXTURE.has(path.basename(from)) });
  await generateLiveDocs({ workspaceRoot: estate, config: normalizeLiveDocumentationConfig({}),
    logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
  workspaces.estate = estate;

  // The names sample, whose App/Documented.cs names six files only in its documentation.
  const names = fs.mkdtempSync(path.join(os.tmpdir(), "parity-names-"));
  const namesSource = path.join(repoRoot, "tests", "integration", "programs", "csharp", "names");
  fs.cpSync(namesSource, names, { recursive: true, filter: (from) => !NOT_FIXTURE.has(path.basename(from)) });
  await generateLiveDocs({ workspaceRoot: names, config: normalizeLiveDocumentationConfig({}),
    logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
  workspaces.names = names;

  const history = fs.mkdtempSync(path.join(os.tmpdir(), "parity-history-"));
  const ids = buildRepository(history, SCRIPT.slice(0, 2));
  commits.first = ids[0];
  commits.last = ids[1];
  const written = spawnSync(process.execPath, [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), path.join(repoRoot, "scripts", "live-docs", "history.ts"), "--workspace", history, "--jobs", "1"], { encoding: "utf8" });
  assert.strictEqual(written.status, 0, written.stderr);
  workspaces.history = history;

  // Four at a time: each command is a process of its own, most of its time tsx's start.
  const pending = ledger.rows.filter((row) => row.run);
  const lanes = Array.from({ length: 4 }, async () => {
    for (let row = pending.shift(); row; row = pending.shift()) {
      const [workspace, ...args] = row.run!;
      outputs.set(row, await run(workspaces[workspace], args.map((arg) => arg.replace(/\{(first|last)\}/g, (_, name: string) => commits[name]))));
    }
  });
  await Promise.all(lanes);
});

afterAll(() => {
  for (const folder of Object.values(workspaces)) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

describe("the parity ledger", () => {
  for (const row of ledger.rows) {
    const label = `${row.section}: ${row.page}`;
    it(row.status.startsWith("yes") || row.status === "the command line's own" ? `still answers: ${label}` : `is still a gap: ${label}`, () => {
      const text = row.file ? fs.readFileSync(path.join(workspaces[row.file[0]], row.file[1]), "utf8") : outputs.get(row) ?? "";
      if (row.status.startsWith("yes") || row.status === "the command line's own") {
        for (const fragment of row.expect ?? []) {
          assert.ok(text.includes(fragment), `${label}: the equivalent no longer says ${JSON.stringify(fragment)}; it printed:\n${text.slice(0, 2000)}`);
        }
      } else {
        assert.ok(row.symptom && text.includes(row.symptom), `${label}: the gap no longer shows ${JSON.stringify(row.symptom)}; if a mend closed it, move its row in the ledger. It printed:\n${text.slice(0, 2000)}`);
      }
    });
  }

  it("prints the document's table", () => {
    const document = fs.readFileSync(path.join(repoRoot, DOCUMENT_PATH), "utf8");
    assert.strictEqual(document, withTable(document, renderParityTable(ledger)), "the parity table differs from the ledger: run scripts/doc-tools/parity-table.ts --write");
  });
});

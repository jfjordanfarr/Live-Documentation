/**
 * The command line's answers mended after the parity probe of 2026-11-22
 * (`.mdmd/layer-2/parity.mdmd.md`): the lint's report in one order, the orphans
 * command reading the docs where the configuration puts them, a file's
 * neighbours in place of every terminal path, and a path that runs only the
 * other way offered as the command to run. Each case was seen failing before
 * its mend. Over the estate sample, its docs generated into a copy.
 */
import * as assert from "node:assert";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { generateLiveDocs } from "../../../packages/generator/src/generator";
import { NOT_FIXTURE } from "../../../scripts/oracle/fixture";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const estateSource = path.join(repoRoot, "tests", "integration", "programs", "csharp", "estate");
const folders: string[] = [];
let estate = "";
let elsewhere = "";

function cli(script: string, workspace: string, args: string[]): { status: number; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), path.join(repoRoot, "scripts", "live-docs", script), "--workspace", workspace, ...args],
    { cwd: workspace, encoding: "utf8" });
  return { status: result.status ?? 0, stdout: result.stdout, stderr: result.stderr };
}

async function estateCopy(config: Record<string, string>): Promise<string> {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "cli-answers-"));
  folders.push(folder);
  // A fixture is copied without what a compiler or an indexer left in it (`obj`, `bin`): a checkout that has run the
  // C# oracles holds such folders, ignored by git, and a copy that took them scanned thirty files more.
  fs.cpSync(estateSource, folder, { recursive: true, filter: (from) => !NOT_FIXTURE.has(path.basename(from)) });
  if (Object.keys(config).length) {
    fs.writeFileSync(path.join(folder, ".live-docs.config.json"), JSON.stringify(config), "utf8");
  }
  await generateLiveDocs({ workspaceRoot: folder, config: normalizeLiveDocumentationConfig(config),
    logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
  return folder;
}

beforeAll(async () => {
  estate = await estateCopy({});
  // A configuration that puts the docs neither where the defaults do nor where this repository does.
  elsewhere = await estateCopy({ root: "notes", baseLayer: "mirror", extension: ".live.md" });
});

afterAll(() => {
  for (const folder of folders) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

describe("live-docs:lint", () => {
  it("reports the same docs in the same order, the order of their paths", () => {
    const first = cli("lint.ts", estate, []);
    const second = cli("lint.ts", estate, []);
    assert.strictEqual(first.status, 0, first.stderr);
    const files = first.stderr.split("\n").filter((line) => line.startsWith("- ")).map((line) => line.slice(2, line.indexOf(": ")));
    assert.ok(files.length > 20, first.stderr);
    assert.deepStrictEqual(files, [...files].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    assert.strictEqual(second.stderr, first.stderr);
  });
});

describe("live-docs:orphans", () => {
  it("reads the docs where the folder's configuration puts them, and names the one whose source is gone", () => {
    fs.rmSync(path.join(elsewhere, "Hub", "ServiceRouting.cs"));
    const result = cli("find-orphans.ts", elsewhere, []);
    assert.strictEqual(result.status, 1, result.stdout + result.stderr);
    assert.strictEqual(result.stderr, "Found 1 orphan live documentation file(s):\n - notes/mirror/Hub/ServiceRouting.cs.live.md (expected code path: Hub/ServiceRouting.cs)\n");
  });
});

describe("live-docs:inspect, a file alone", () => {
  it("answers with its direct users, counted, one line each, not every terminal path whole", () => {
    const result = cli("inspect.ts", estate, ["--from", "Contracts/IPaymentService.cs", "--direction", "inbound"]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(result.stdout.replace(/ \[[^\]]+\]/g, ""),
      "Contracts/IPaymentService.cs is used by 4 files directly (inbound).\n  Hub/App.config\n  Hub/PaymentHub.cs\n  PaymentService/App.config\n  PaymentService/PaymentService.cs\n");
  });
});

describe("live-docs:inspect, no path this way", () => {
  it("says so in one line and gives the command that asks the way back, which answers", () => {
    const result = cli("inspect.ts", estate, ["--from", "Database/SqlServer/dbo.Payment.sql", "--to", "Portal/Pages/Default.aspx"]);
    assert.strictEqual(result.status, 1);
    assert.strictEqual(result.stdout,
      "No path runs from Database/SqlServer/dbo.Payment.sql to Portal/Pages/Default.aspx (outbound); one runs the other way, 11 hop(s): npm run live-docs:inspect -- --from Portal/Pages/Default.aspx --to Database/SqlServer/dbo.Payment.sql\n");
    const offered = result.stdout.slice(result.stdout.indexOf("-- ") + 3).trim().split(" ");
    const back = cli("inspect.ts", estate, offered);
    assert.strictEqual(back.status, 0, back.stderr);
    assert.match(back.stdout, /^Path from Portal\/Pages\/Default\.aspx to Database\/SqlServer\/dbo\.Payment\.sql \(11 hop\(s\), outbound\)\./u);
  });

  it("says that no path runs either way when none does", () => {
    const result = cli("inspect.ts", estate, ["--from", "Estate.sln", "--to", "Hub/ServiceRouting.cs"]);
    assert.strictEqual(result.status, 1);
    assert.strictEqual(result.stdout, "No path runs from Estate.sln to Hub/ServiceRouting.cs (outbound), nor the other way.\n");
  });
});

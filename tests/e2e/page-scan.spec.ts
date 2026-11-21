import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { copyFixture, listFixtureFiles } from "../../scripts/oracle/fixture";
import { differencesBetween, heldToLedger, type LedgerEntry } from "../page-scan/compare";
import { FIXTURES } from "../page-scan/fixtures";

/**
 * The standing check that the engine and generator as they stand, bundled for a browser with the stand-ins of
 * `tests/page-scan/`, map a folder inside a real Chromium page to the same Live Docs and index that Node writes for the
 * same folder. For each fixture the page is opened from disk, handed a copy of the fixture through its
 * `<input webkitdirectory>`, and scans it; then Node's generator scans the same copy, which lies outside every git
 * repository, so that both take the way for no git. Every file each wrote is compared whole, with both given the same
 * clock. A difference fails the case unless the ledger (`tests/page-scan/differences.json`) lists it, and a listed
 * difference that no longer occurs fails it too. Each case keeps, as an artifact of the run, what the page asked of the
 * stand-ins, what it read and how often, and both sides' times; nothing of that is asserted.
 *
 * The page is built by `npm run e2e:bundles` into `dist/page-scan/` (`tests/page-scan/build-page.mjs`); a page built
 * from other sources than those on disk is refused.
 */

const REPO = path.resolve(__dirname, "..", "..");
const PAGE_FOLDER = path.join(REPO, "dist", "page-scan");
const LEDGER: LedgerEntry[] = (JSON.parse(fs.readFileSync(path.join(REPO, "tests", "page-scan", "differences.json"), "utf8")) as { differences: LedgerEntry[] }).differences;
/** The instant both runs write as `Generated At`. */
const NOW = "2026-01-01T00:00:00.000Z";
const TSX = createRequire(__filename).resolve("tsx/cli");

interface PageRun {
  ms: number;
  files: number;
  bytes: number;
  processed: number;
  written: Record<string, string>;
  failed: Array<{ sourcePath: string; reason: string }>;
  warnings: string[];
  reads: Record<string, number>;
  calls: Record<string, number>;
  callsOnLoading: Record<string, number>;
  asked: string[];
}

declare global {
  interface Window {
    pageScan: { ready: boolean; result?: PageRun; error?: string };
  }
}

/** Why the built page is not the one the sources on disk would build, one line each; empty when it is. */
function stalePage(): string[] {
  let inputs: { grammars: Record<string, string>; script: Record<string, string> };
  try {
    inputs = JSON.parse(fs.readFileSync(path.join(PAGE_FOLDER, "inputs.json"), "utf8")) as typeof inputs;
  } catch {
    return ["dist/page-scan holds no built page"];
  }
  return Object.entries({ ...inputs.grammars, ...inputs.script }).flatMap(([input, digest]) => {
    const file = path.join(REPO, input);
    if (!fs.existsSync(file)) return [`${input} is gone`];
    return createHash("sha256").update(fs.readFileSync(file)).digest("hex") === digest ? [] : [`${input} changed`];
  });
}

/** Every file under a folder, relative to it, with its text. */
function filesUnder(folder: string, leaving: ReadonlySet<string>): Record<string, string> {
  const found: Record<string, string> = {};
  for (const entry of fs.readdirSync(folder, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const relative = path.relative(folder, path.join(entry.parentPath, entry.name)).split(path.sep).join("/");
    if (!leaving.has(relative)) found[relative] = fs.readFileSync(path.join(folder, relative), "utf8");
  }
  return found;
}

/** Node's generator over the folder, in a process of its own as the command line runs it, without git's variables. */
function scanUnderNode(folder: string): { ms: number; processed: number; failed: Array<{ sourcePath: string; reason: string }>; warnings: string[] } {
  const environment = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")));
  const run = spawnSync(process.execPath, [TSX, "--tsconfig", path.join(REPO, "tsconfig.base.json"), path.join(REPO, "tests", "page-scan", "node-scan.ts"), folder, NOW], { cwd: REPO, env: environment, encoding: "utf8", maxBuffer: 1 << 26 });
  if (run.status !== 0) throw new Error(`Node's scan failed: ${run.stderr || run.error?.message}`);
  return JSON.parse(run.stdout.trim().split("\n").pop() ?? "{}") as ReturnType<typeof scanUnderNode>;
}

test.describe("the engine in a page", () => {
  test.beforeAll(() => {
    const stale = stalePage();
    if (stale.length > 0) throw new Error(`The scanning page was not built from the sources on disk (${stale.slice(0, 5).join("; ")}${stale.length > 5 ? `; and ${stale.length - 5} more` : ""}). Run \`npm run e2e:bundles\`.`);
  });

  for (const fixture of FIXTURES) {
    test(`${fixture.name}: the page writes the docs and the index Node writes`, async ({ page }, testInfo) => {
      // Measured 2026-11-21: a fixture takes about 2 to 6 s here, most of it the page's 5.6 MB opening and Node's start.
      test.setTimeout(90_000);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      const copy = copyFixture(fixture.absolute, "page-scan-");
      try {
        const given = new Set(listFixtureFiles(copy));
        await page.goto(pathToFileURL(path.join(PAGE_FOLDER, "page.html")).href);
        await page.waitForFunction(() => window.pageScan.ready || window.pageScan.error !== undefined);
        await page.locator("#folder").evaluate((input: HTMLInputElement, now) => {
          input.dataset.now = now;
        }, NOW);
        await page.setInputFiles("#folder", copy);
        await page.waitForFunction(() => window.pageScan.result !== undefined || window.pageScan.error !== undefined, undefined, { timeout: 60_000 });
        const scanned = await page.evaluate(() => ({ result: window.pageScan.result, error: window.pageScan.error }));
        expect(scanned.error, "the page's scan threw").toBeUndefined();
        expect(errors, "the page threw").toEqual([]);
        const inPage = scanned.result!;

        const underNode = scanUnderNode(copy);
        const nodeWrote = filesUnder(copy, given);
        const found = differencesBetween(inPage.written, nodeWrote);

        const reads = Object.values(inPage.reads);
        const record = {
          fixture: fixture.name,
          files: inPage.files,
          docsAndIndex: { page: Object.keys(inPage.written).length, node: Object.keys(nodeWrote).length },
          seconds: { page: +(inPage.ms / 1000).toFixed(3), node: +(underNode.ms / 1000).toFixed(3) },
          filesRead: reads.length,
          reads: reads.reduce((sum, times) => sum + times, 0),
          mostReads: Math.max(0, ...reads),
          differences: found,
          calls: inPage.calls,
          callsOnLoading: inPage.callsOnLoading,
          asked: inPage.asked,
          readsByFile: inPage.reads,
          failed: { page: inPage.failed, node: underNode.failed },
          warnings: { page: inPage.warnings, node: underNode.warnings }
        };
        const artifact = testInfo.outputPath("page-scan.json");
        fs.writeFileSync(artifact, `${JSON.stringify(record, null, 2)}\n`);
        await testInfo.attach("page-scan", { path: artifact, contentType: "application/json" });
        console.log(`page-scan ${fixture.name}: ${record.docsAndIndex.page} files written in the page in ${record.seconds.page} s, ${record.docsAndIndex.node} under Node in ${record.seconds.node} s; ${record.filesRead} files read ${record.reads} times; ${found.length} differences; calls ${JSON.stringify(inPage.calls)}`);

        expect(heldToLedger(fixture.name, found, LEDGER), "differences from Node's output that the ledger does not list, and listed ones no longer found").toEqual({ unlisted: [], gone: [] });
      } finally {
        fs.rmSync(copy, { recursive: true, force: true });
      }
    });
  }
});

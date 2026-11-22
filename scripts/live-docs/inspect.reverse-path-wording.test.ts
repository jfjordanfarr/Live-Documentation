/**
 * What the command line says when the reverse search of `inspect --direction both` finds no path, held to the estate
 * sample's graph; found by the engine review of 2026-11-22. The reverse search walks from `--from` along what depends
 * on it and looks for `--to` there, so finding none means that `--to` does not depend on `--from`. The answer says
 * something else: `Nothing that depends on "PaymentService" also depends on "Contracts".` In the estate sample
 * `Hub/App.config` uses `PaymentService/App.config` and `Contracts/IPaymentService.cs`, so the sentence is false. The
 * message predates the day's work (`emitDualDirectionResult` in `inspect/emit.ts`); the day's directories as ends made
 * it name a directory by its last segment.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { generateLiveDocs } from "../../packages/generator/src/generator";
import { NOT_FIXTURE } from "../oracle/fixture";

const repoRoot = path.resolve(__dirname, "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
let estate = "";

function inspect(args: string[]): { status: number; stdout: string } {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), path.join(repoRoot, "scripts", "live-docs", "inspect.ts"), "--workspace", estate, ...args],
    { cwd: estate, encoding: "utf8" });
  return { status: result.status ?? 0, stdout: result.stdout };
}

beforeAll(async () => {
  estate = fs.mkdtempSync(path.join(os.tmpdir(), "reverse-wording-"));
  fs.cpSync(path.join(repoRoot, "tests", "integration", "programs", "csharp", "estate"), estate, { recursive: true, filter: (from) => !NOT_FIXTURE.has(path.basename(from)) });
  await generateLiveDocs({ workspaceRoot: estate, logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
}, 120_000);

afterAll(() => {
  fs.rmSync(estate, { recursive: true, force: true });
});

describe("the reverse search's answer when it finds no path", () => {
  it("does not claim that nothing depends on both ends where a file depends on both", () => {
    // The fact the sentence denies, by the command line's own neighbours of a file.
    const both = inspect(["--from", "Hub/App.config", "--direction", "outbound", "--json"]);
    const uses = (JSON.parse(both.stdout) as { neighbours: Array<{ files: Array<{ codePath: string }> }> }).neighbours[0].files.map((file) => file.codePath);
    expect(uses.some((file) => file.startsWith("PaymentService/"))).toBe(true);
    expect(uses.some((file) => file.startsWith("Contracts/"))).toBe(true);

    const answer = inspect(["--from", "PaymentService", "--to", "Contracts", "--direction", "both"]);
    expect(answer.stdout).toContain("REVERSE PATH (inbound): No path found.");
    // Seen 2026-11-22: `Nothing that depends on "PaymentService" also depends on "Contracts".`
    expect(answer.stdout).not.toContain('Nothing that depends on "PaymentService" also depends on "Contracts"');
  }, 60_000);
});

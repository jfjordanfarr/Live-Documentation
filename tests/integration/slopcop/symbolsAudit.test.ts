import { spawnSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

interface SlopcopRun {
  exitCode: number;
  stdout: string;
}

const repoRoot = path.resolve(__dirname, "../../..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const slopcopScript = path.join(repoRoot, "scripts", "slopcop", "check-symbols.ts");
const sourceFixture = path.join(
  repoRoot,
  "tests",
  "integration",
  "fixtures",
  "slopcop-symbols",
  "workspace"
);

async function withFixtureCopy(
  callback: (workspacePath: string) => Promise<void>
): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "slopcop-symbols-"));
  const workspacePath = path.join(tempRoot, "workspace");
  await fs.cp(sourceFixture, workspacePath, { recursive: true });

  try {
    await callback(workspacePath);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

function runSlopcopSymbols(workspacePath: string): SlopcopRun {
  const configPath = path.join(workspacePath, "slopcop.config.json");
  const result = spawnSync(
    process.execPath,
    [
      tsxCli,
      "--tsconfig",
      tsconfigPath,
      slopcopScript,
      "--workspace",
      workspacePath,
      "--config",
      configPath,
      "--json"
    ],
    {
      encoding: "utf8"
    }
  );

  if (result.error) {
    throw result.error;
  }

  return {
    exitCode: result.status ?? 0,
    stdout: result.stdout ?? ""
  };
}

const TEST_TIMEOUT_MS = 20000;

describe("SlopCop symbol audit fixture", () => {
  it("passes on the healed baseline workspace", async () => {
    await withFixtureCopy(async workspacePath => {
      const run = runSlopcopSymbols(workspacePath);
      expect(run.exitCode).toBe(0);

      const payload = JSON.parse(run.stdout);
      expect(payload.scannedFiles).toBeGreaterThan(0);
      expect(payload.issues).toHaveLength(0);
    });
  }, TEST_TIMEOUT_MS);

  it("flags duplicate headings introduced at runtime", async () => {
    await withFixtureCopy(async workspacePath => {
      const overviewPath = path.join(workspacePath, "docs", "overview.md");
      const original = await fs.readFile(overviewPath, "utf8");
      await fs.writeFile(overviewPath, `# Overview\n# Overview\n${original}`);

      const run = runSlopcopSymbols(workspacePath);
      expect(run.exitCode).toBe(3);

      const payload = JSON.parse(run.stdout);
      const duplicateIssue = payload.issues.find(
        (issue: { kind: string }) => issue.kind === "duplicate-heading"
      );
      expect(duplicateIssue).toBeTruthy();
    });
  }, TEST_TIMEOUT_MS);

  it("flags missing anchor references added during the test", async () => {
    await withFixtureCopy(async workspacePath => {
      const indexPath = path.join(workspacePath, "docs", "index.md");
      await fs.appendFile(indexPath, "\nBroken [missing anchor](symbol-map.md#unknown-section).\n");

      const run = runSlopcopSymbols(workspacePath);
      expect(run.exitCode).toBe(3);

      const payload = JSON.parse(run.stdout);
      const missingAnchorIssue = payload.issues.find(
        (issue: { kind: string }) => issue.kind === "missing-anchor"
      );
      expect(missingAnchorIssue).toBeTruthy();
    });
  }, TEST_TIMEOUT_MS);
});

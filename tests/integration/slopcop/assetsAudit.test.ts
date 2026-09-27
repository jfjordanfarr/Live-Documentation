import { spawnSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

interface SlopcopRun {
  exitCode: number;
  stdout: string;
  stderr: string;
}

const repoRoot = path.resolve(__dirname, "../../..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const slopcopScript = path.join(repoRoot, "scripts", "slopcop", "check-asset-paths.ts");
const sourceFixture = path.join(
  repoRoot,
  "tests",
  "integration",
  "fixtures",
  "slopcop-assets",
  "workspace"
);

const TEST_TIMEOUT_MS = 15_000; // CLI spawn and fixture copy can exceed Vitest's 5s default.

async function withFixtureCopy(
  callback: (workspacePath: string) => Promise<void>
): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "slopcop-assets-"));
  const workspacePath = path.join(tempRoot, "workspace");
  await fs.cp(sourceFixture, workspacePath, { recursive: true });

  try {
    await callback(workspacePath);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

function runSlopcopAssets(workspacePath: string): SlopcopRun {
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
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

describe("SlopCop asset audit fixture", () => {
  it("passes on the healed baseline workspace", async () => {
    await withFixtureCopy(async workspacePath => {
      const run = runSlopcopAssets(workspacePath);
      expect(run.exitCode).toBe(0);

      const payload = JSON.parse(run.stdout);
      expect(payload.scannedFiles).toBeGreaterThan(0);
      expect(payload.issues).toHaveLength(0);
    });
  }, TEST_TIMEOUT_MS);

  it("reports missing assets when files are removed at runtime", async () => {
    await withFixtureCopy(async workspacePath => {
      const missingAsset = path.join(workspacePath, "public", "images", "gallery.png");
      await fs.rm(missingAsset, { force: true });

      const run = runSlopcopAssets(workspacePath);
      expect(run.exitCode).toBe(3);

      const payload = JSON.parse(run.stdout);
      const galleryIssue = payload.issues.find(
        (issue: { target: string }) => issue.target === "/images/gallery.png"
      );

      expect(galleryIssue).toBeTruthy();
    });
  }, TEST_TIMEOUT_MS);
});

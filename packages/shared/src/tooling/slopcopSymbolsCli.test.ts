import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../../../..");
const CLI = path.resolve(ROOT, "scripts/slopcop/check-symbols.ts");
const TSX = require.resolve("tsx/cli");
const TSCONFIG = path.resolve(ROOT, "tsconfig.base.json");
const FIXTURE = path.resolve(ROOT, "tests/integration/fixtures/slopcop-symbols/workspace");

describe("SlopCop symbol CLI", () => {
  it("passes when docs are healthy and flags issues when headings drift", () => {
    withFixtureWorkspace((workspace) => {
      breakWorkspace(workspace);

      const failingRun = runCli(workspace);
      expect(failingRun.status).toBe(3);
      const parsed = JSON.parse(failingRun.stdout.trim() || "{}");
      expect(parsed.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind: "duplicate-heading" }),
          expect.objectContaining({ kind: "missing-anchor" })
        ])
      );

      restoreWorkspace(workspace);

      const repaired = runCli(workspace);
      expect(repaired.status).toBe(0);
      const repairedPayload = JSON.parse(repaired.stdout.trim() || "{}");
      expect(repairedPayload.scannedFiles).toBeGreaterThan(0);
      expect(repairedPayload.issues).toHaveLength(0);
    });
  }, 30_000);
});

function runCli(workspace: string) {
  return spawnSync(process.execPath, [TSX, "--tsconfig", TSCONFIG, CLI, "--workspace", workspace, "--json"], {
    cwd: ROOT,
    encoding: "utf8"
  });
}

function withFixtureWorkspace(callback: (workspace: string) => void): void {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "slopcop-symbols-fixture-"));
  fs.cpSync(FIXTURE, target, { recursive: true });
  try {
    callback(target);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function breakWorkspace(workspace: string): void {
  const overviewPath = path.join(workspace, "docs/overview.md");
  const overviewOriginal = fs.readFileSync(overviewPath, "utf8");
  fs.writeFileSync(overviewPath, `# Overview\n# Overview\n${overviewOriginal}`, "utf8");

  const indexPath = path.join(workspace, "docs/index.md");
  fs.appendFileSync(indexPath, "\nBroken [anchor](symbol-map.md#missing).\n");
}

function restoreWorkspace(workspace: string): void {
  const files = ["docs/overview.md", "docs/index.md"];

  for (const relativePath of files) {
    const source = path.join(FIXTURE, relativePath);
    const destination = path.join(workspace, relativePath);
    fs.copyFileSync(source, destination);
  }
}

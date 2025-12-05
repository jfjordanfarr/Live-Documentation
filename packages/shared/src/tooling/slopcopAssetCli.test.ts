import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../../../..");
const CLI = path.resolve(ROOT, "scripts/slopcop/check-asset-paths.ts");
const TSX = require.resolve("tsx/cli");
const TSCONFIG = path.resolve(ROOT, "tsconfig.base.json");
const FIXTURE = path.resolve(ROOT, "tests/integration/fixtures/slopcop-assets/workspace");

describe("SlopCop asset CLI", () => {
  it("passes on the baseline workspace and surfaces errors when assets disappear", () => {
    withFixtureWorkspace((workspace) => {
      breakWorkspace(workspace);

      const failingRun = runCli(workspace);
      expect(failingRun.status).toBe(3);
      const parsed = JSON.parse(failingRun.stdout.trim() || "{}");
      const missingTargets = parsed.issues.map((issue: { target: string }) => issue.target);
      expect(missingTargets).toEqual(
        expect.arrayContaining([
          "/images/gallery.png",
          "/videos/intro.mp4"
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
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "slopcop-assets-fixture-"));
  fs.cpSync(FIXTURE, target, { recursive: true });
  try {
    callback(target);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function breakWorkspace(workspace: string): void {
  const removals = ["public/images/gallery.png", "public/videos/intro.mp4"];

  for (const relativePath of removals) {
    const fullPath = path.join(workspace, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { force: true });
    }
  }
}

function restoreWorkspace(workspace: string): void {
  const targets = ["public/images/gallery.png", "public/videos/intro.mp4"];

  for (const relativePath of targets) {
    const source = path.join(FIXTURE, relativePath);
    const destination = path.join(workspace, relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}

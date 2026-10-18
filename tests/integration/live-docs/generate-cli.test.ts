/**
 * The generate CLI over a workspace given by `--workspace`: it reads that
 * workspace's own `.live-docs.config.json` when no `--config` is given, as
 * inspect does, and the file given when one is. Until 2026-10-17 it read
 * neither and wrote the shipped default root, which the history probe of
 * 2026-10-16 found.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const generateScript = path.join(repoRoot, "scripts", "live-docs", "generate.ts");
const workspaces: string[] = [];

afterEach(() => {
  for (const workspace of workspaces.splice(0)) {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});

describe("live-docs:generate --workspace", () => {
  it("reads the workspace's own configuration when none is given", () => {
    const workspace = makeWorkspace({ root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" });
    const result = generate(["--workspace", workspace]);
    expect(result.status, result.stderr).toBe(0);
    expect(fs.existsSync(path.join(workspace, ".mdmd", "layer-4", "src", "a.ts.mdmd.md"))).toBe(true);
    expect(fs.existsSync(path.join(workspace, ".live-documentation"))).toBe(false);
  });

  it("reads the configuration given over the workspace's own", () => {
    const workspace = makeWorkspace({ root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" });
    const given = path.join(workspace, "other.json");
    fs.writeFileSync(given, JSON.stringify({ root: "docs", baseLayer: "mirror" }), "utf8");
    const result = generate(["--workspace", workspace, "--config", given]);
    expect(result.status, result.stderr).toBe(0);
    expect(fs.existsSync(path.join(workspace, "docs", "mirror", "src", "a.ts.md"))).toBe(true);
    expect(fs.existsSync(path.join(workspace, ".mdmd"))).toBe(false);
  });
});

function makeWorkspace(config: Record<string, string>): string {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "generate-cli-"));
  workspaces.push(workspace);
  fs.mkdirSync(path.join(workspace, "src"));
  fs.writeFileSync(path.join(workspace, "src", "a.ts"), "export const a = 1;\n", "utf8");
  fs.writeFileSync(path.join(workspace, ".live-docs.config.json"), JSON.stringify(config), "utf8");
  return workspace;
}

function generate(args: string[]): { status: number | null; stderr: string } {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), generateScript, ...args], { encoding: "utf8" });
  return { status: result.status, stderr: result.stderr };
}

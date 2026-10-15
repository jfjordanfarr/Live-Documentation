import { spawnSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { powershellAdapter } from "./powershell";

const POWERSHELL_RUNTIME_AVAILABLE = detectPowerShellRuntime();
const describeIfRuntime = POWERSHELL_RUNTIME_AVAILABLE ? describe : describe.skip;

if (!POWERSHELL_RUNTIME_AVAILABLE) {
  console.warn("Skipping powershellAdapter tests because no PowerShell runtime was detected.");
}

const repoRoot = path.resolve(__dirname, "../../../../..");
const fixtureRoot = path.join(repoRoot, "tests", "integration", "fixtures", "powershell-compendium");

describeIfRuntime("powershellAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "powershell-adapter-"));
    await fs.cp(fixtureRoot, path.join(workspaceRoot, "powershell-compendium"), { recursive: true });
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("extracts public functions and dependency graph data from scripts", { timeout: 15000 }, async () => {
    const scriptPath = path.join(
      workspaceRoot,
      "powershell-compendium",
      "scripts",
      "deploy.ps1"
    );

    const analysis = await powershellAdapter.analyze({
      absolutePath: scriptPath,
      workspaceRoot
    });

    expect(analysis).not.toBeNull();
    expect(analysis?.symbols.map((symbol) => symbol.name)).toEqual(["Invoke-Deployment"]);

    const dependencies = analysis?.dependencies ?? [];
    const specifiers = dependencies.map((entry) => entry.specifier);

    expect(specifiers).toContain("MyCompany.Inventory");
    expect(specifiers).toContain("Microsoft.PowerShell.Management");
    expect(specifiers).toContain("powershell-compendium/common/logging.ps1");

    const dotSource = dependencies.find((entry) => entry.specifier === "powershell-compendium/common/logging.ps1");
    expect(dotSource?.resolvedPath).toBe("powershell-compendium/common/logging.ps1");
  });

  it("honors Export-ModuleMember filters when reporting module exports", { timeout: 15000 }, async () => {
    const modulePath = path.join(
      workspaceRoot,
      "powershell-compendium",
      "modules",
      "Inventory.psm1"
    );

    const analysis = await powershellAdapter.analyze({
      absolutePath: modulePath,
      workspaceRoot
    });

    expect(analysis).not.toBeNull();
    const symbolNames = analysis?.symbols.map((symbol) => symbol.name) ?? [];
    expect(symbolNames).toEqual(["Get-InventorySnapshot"]);
  });

  it("reports every script as the program entry, even one with nothing else to report, and no module", { timeout: 30000 }, async () => {
    const script = await powershellAdapter.analyze({
      absolutePath: path.join(workspaceRoot, "powershell-compendium", "scripts", "deploy.ps1"),
      workspaceRoot
    });
    expect(script?.program).toEqual({});

    const barePath = path.join(workspaceRoot, "bare.ps1");
    await fs.writeFile(barePath, "Write-Output 'hello'\n", "utf8");
    const bare = await powershellAdapter.analyze({ absolutePath: barePath, workspaceRoot });
    expect(bare).toStrictEqual({ symbols: [], dependencies: [], program: {} });

    const module = await powershellAdapter.analyze({
      absolutePath: path.join(workspaceRoot, "powershell-compendium", "modules", "Inventory.psm1"),
      workspaceRoot
    });
    expect(module).not.toHaveProperty("program");
  });
});

describe("powershellAdapter manifests", () => {
  it("does not report a manifest as the program entry, with or without a runtime", async () => {
    const analysis = await powershellAdapter.analyze({
      absolutePath: path.join(fixtureRoot, "config", "settings.psd1"),
      workspaceRoot: fixtureRoot
    });
    expect(analysis).toStrictEqual({ symbols: [], dependencies: [] });
    expect(analysis).not.toHaveProperty("program");
  });
});

function detectPowerShellRuntime(): boolean {
  const candidates = ["pwsh", "powershell"];
  for (const candidate of candidates) {
    const result = spawnSync(candidate, [
      "-NoLogo",
      "-NonInteractive",
      "-NoProfile",
      "-Command",
      "Write-Output __ping__"
    ], {
      encoding: "utf8"
    });

    if (result.status === 0 && typeof result.stdout === "string" && result.stdout.includes("__ping__")) {
      return true;
    }
  }
  return false;
}

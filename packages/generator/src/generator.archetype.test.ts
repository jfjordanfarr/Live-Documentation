/**
 * The file index the generator hands every reader answers each path's archetype under the run's own configuration
 * (`archetypeOf`), so that a reader telling a test from working code reads the workspace's overrides and sample roots
 * as the docs' `Archetype` lines do. The PowerShell reader's reach to the only definition of a name passes over a test
 * when the caller is not one; until the joining of 2026-11-21 it read the default configuration's conventions alone.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";

import { generateLiveDocs } from "./generator";

const folders: string[] = [];
afterAll(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

const quiet = { info: () => undefined, warn: () => undefined, error: () => undefined };

/** The doc the generator writes for `lib/Run.ps1`, which calls the one function `harness/Stubs.ps1` defines, under a configuration. */
async function runDoc(overrides: Record<string, "test">): Promise<string> {
  const workspace = mkdtempSync(path.join(tmpdir(), "generator-archetype-"));
  folders.push(workspace);
  mkdirSync(path.join(workspace, "harness"));
  mkdirSync(path.join(workspace, "lib"));
  writeFileSync(path.join(workspace, "harness", "Stubs.ps1"), "function Get-External { }\n");
  writeFileSync(path.join(workspace, "lib", "Run.ps1"), "Get-External\n");
  const result = await generateLiveDocs({ workspaceRoot: workspace, config: normalizeLiveDocumentationConfig({ archetypeOverrides: overrides }), logger: quiet });
  expect(result.failed).toEqual([]);
  return readFileSync(path.join(workspace, ".live-documentation", "source", "lib", "Run.ps1.md"), "utf8");
}

describe("the archetype the generator's file index answers", () => {
  it("is the workspace's own, overrides among it, for the reader that tells a test from working code", async () => {
    expect(await runDoc({})).toContain("harness/Stubs.ps1");
    expect(await runDoc({ "harness/*": "test" })).not.toContain("harness/Stubs.ps1");
  });
});

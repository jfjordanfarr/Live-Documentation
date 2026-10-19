import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repository = path.resolve(__dirname, "..", "..", "..");
const tsx = path.join(repository, "node_modules", "tsx", "dist", "cli.mjs");
const tsconfig = path.join(repository, "tsconfig.base.json");
const pipeline = path.join(repository, "scripts", "live-docs", "run-all.ts");
const temporary: string[] = [];

afterEach(() => {
  for (const workspace of temporary.splice(0))
    fs.rmSync(workspace, { recursive: true, force: true });
});

function workspace(): { root: string; source: string; doc: string; index: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "live-docs-pipeline-"));
  temporary.push(root);
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(
    path.join(root, ".live-docs.config.json"),
    JSON.stringify({
      root: ".live-documentation",
      baseLayer: "source",
      extension: ".md",
      glob: ["src/**/*.ts"],
    })
  );
  const source = path.join(root, "src", "app.ts");
  fs.writeFileSync(source, "export const value = 1;\n");
  return {
    root,
    source,
    doc: path.join(root, ".live-documentation", "source", "src", "app.ts.md"),
    index: path.join(root, ".live-documentation", "index.json"),
  };
}

function run(root: string, ...args: string[]): { status: number; stdout: string; stderr: string } {
  const result = spawnSync(
    process.execPath,
    [tsx, "--tsconfig", tsconfig, pipeline, "--workspace", root, ...args],
    { cwd: repository, encoding: "utf8" }
  );
  if (result.error) throw result.error;
  return { status: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

describe("the Live Docs pipeline", () => {
  it("finishes generation before lint reads a fresh workspace", () => {
    const { root, doc } = workspace();
    const result = run(root);
    expect(result.status, result.stderr).toBe(0);
    expect(fs.existsSync(doc)).toBe(true);
    expect(result.stdout).toContain("live-docs:lint — 1 file(s) validated");
    expect(result.stdout).toContain("Base layer processed 1 file(s)");
    expect(result.stdout.indexOf("Base layer processed 1 file(s)")).toBeLessThan(
      result.stdout.indexOf("Running live-docs:lint")
    );
    expect(result.stdout).not.toContain("no staged Live Docs found");
  });

  it("stops before lint when generation fails", () => {
    const { root } = workspace();
    fs.writeFileSync(path.join(root, ".live-docs.config.json"), "not JSON\n");
    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("live-docs:generate failed");
    expect(result.stdout).not.toContain("Running live-docs:lint");
  });

  it("propagates lint failure", () => {
    const { root, doc } = workspace();
    fs.mkdirSync(path.dirname(doc), { recursive: true });
    fs.writeFileSync(doc, "not a Live Doc\n");
    const result = run(root, "--skip-generate");
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Running live-docs:lint");
    expect(result.stdout).not.toContain("Pipeline complete");
  });

  it("checks created, changed and deleted docs without writing; dry-run remains a successful preview", () => {
    const { root, source, doc, index } = workspace();
    const created = run(root, "--check");
    expect(created.status).toBe(1);
    expect(created.stderr).toContain("1 would be created");
    expect(fs.existsSync(doc)).toBe(false);
    expect(fs.existsSync(index)).toBe(false);
    expect(run(root, "--dry-run").status).toBe(0);
    expect(fs.existsSync(doc)).toBe(false);

    expect(run(root).status).toBe(0);
    const originalDoc = fs.readFileSync(doc, "utf8");
    const originalIndex = fs.readFileSync(index, "utf8");
    expect(run(root, "--check").status).toBe(0);

    fs.writeFileSync(source, "export const value = 1;\nexport const extra = 2;\n");
    const changed = run(root, "--check");
    expect(changed.status).toBe(1);
    expect(changed.stderr).toContain("1 updated");
    expect(fs.readFileSync(doc, "utf8")).toBe(originalDoc);
    expect(fs.readFileSync(index, "utf8")).toBe(originalIndex);

    fs.rmSync(source);
    const deleted = run(root, "--check");
    expect(deleted.status).toBe(1);
    expect(deleted.stderr).toContain("1 deleted");
    expect(fs.readFileSync(doc, "utf8")).toBe(originalDoc);
    expect(fs.readFileSync(index, "utf8")).toBe(originalIndex);
  });
});

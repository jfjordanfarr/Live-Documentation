import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { GeneratorIdentity } from "@live-documentation/engine/live-docs/history/format";
import { lensOf } from "@live-documentation/engine/live-docs/history/lens";

const repository = path.resolve(__dirname, "..", "..", "..");
const source = path.join(repository, "packages", "generator", "src", "history", "generatorIdentity.ts");
const runIdentity = [
  "const { generatorIdentity } = require(process.argv[1]);",
  "generatorIdentity().then(value => process.stdout.write(JSON.stringify(value)), error => { console.error(error); process.exitCode = 1; });"
].join("\n");

let scratch: string;
let bundled: string;

beforeAll(async () => {
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), "history-tool-identity-"));
  bundled = path.join(scratch, "generatorIdentity.cjs");
  await build({ entryPoints: [source], outfile: bundled, bundle: true, platform: "node", format: "cjs", target: "node22", tsconfig: path.join(repository, "tsconfig.base.json"), logLevel: "silent" });
});

afterAll(() => {
  if (scratch) fs.rmSync(scratch, { recursive: true, force: true });
});

function git(root: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

function commit(root: string, message: string): void {
  git(root, "add", ".");
  git(root, "-c", "user.name=Identity Fixture", "-c", "user.email=identity@example.test", "commit", "-qm", message);
}

function fixture(withLock: boolean): { root: string; modulePath: string } {
  const root = fs.mkdtempSync(path.join(scratch, "tool-"));
  const engine = path.join(root, "packages", "engine");
  const generator = path.join(root, "packages", "generator");
  fs.mkdirSync(engine, { recursive: true });
  fs.mkdirSync(path.join(generator, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, ".gitignore"), "packages/generator/dist/\n");
  fs.writeFileSync(path.join(engine, "marker.ts"), "export const engine = 1;\n");
  fs.writeFileSync(path.join(generator, "src", "marker.ts"), "export const generator = 1;\n");
  fs.writeFileSync(path.join(generator, "package.json"), JSON.stringify({ name: "@live-documentation/generator", version: "0.0.0" }));
  if (withLock) fs.writeFileSync(path.join(root, "package-lock.json"), '{"lockfileVersion":3,"packages":{"tool":"first"}}\n');
  git(root, "init", "-q");
  git(root, "config", "core.autocrlf", "false");
  commit(root, "initial tool inputs");

  const modulePath = path.join(generator, "dist", "history", "generatorIdentity.js");
  fs.mkdirSync(path.dirname(modulePath), { recursive: true });
  fs.copyFileSync(bundled, modulePath);
  return { root, modulePath };
}

function identity(modulePath: string, cwd: string): GeneratorIdentity {
  return JSON.parse(execFileSync(process.execPath, ["-e", runIdentity, modulePath], { cwd, encoding: "utf8" })) as GeneratorIdentity;
}

function key(value: GeneratorIdentity): string {
  return lensOf(value, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key;
}

describe("the tool lock in the history lens", () => {
  it("invalidates for tracked dirty and committed lock changes, but not other checkout edits", () => {
    const { root, modulePath } = fixture(true);
    const initial = identity(modulePath, root);
    fs.writeFileSync(path.join(root, "package-lock.json"), '{"lockfileVersion":3,"packages":{"tool":"second"}}\n');
    const dirty = identity(modulePath, root);
    expect(dirty.code).toBe(initial.code);
    expect(dirty.modified).not.toBeNull();
    expect(key(dirty)).not.toBe(key(initial));

    commit(root, "change only the tool dependencies");
    const committed = identity(modulePath, root);
    expect(committed.modified).toBeNull();
    expect(committed.code).not.toBe(initial.code);
    expect(key(committed)).not.toBe(key(initial));

    fs.writeFileSync(path.join(root, "README.md"), "a change outside tool inputs\n");
    expect(key(identity(modulePath, root))).toBe(key(committed));
    commit(root, "document the fixture");
    const unrelatedCommit = identity(modulePath, root);
    expect(unrelatedCommit.commit).not.toBe(committed.commit);
    expect(key(unrelatedCommit)).toBe(key(committed));
  });

  it("distinguishes an absent lock from an untracked lock, including changes to the same untracked path", () => {
    const { root, modulePath } = fixture(false);
    const absent = identity(modulePath, root);
    expect(absent.modified).toBeNull();
    expect(identity(modulePath, root).code).toBe(absent.code);

    fs.writeFileSync(path.join(root, "package-lock.json"), "first dependency tree\n");
    const first = identity(modulePath, root);
    expect(first.code).toBe(absent.code);
    expect(first.modified).not.toBeNull();
    expect(key(first)).not.toBe(key(absent));
    fs.writeFileSync(path.join(root, "package-lock.json"), "second dependency tree\n");
    const second = identity(modulePath, root);
    expect(second.modified).not.toBe(first.modified);
    expect(key(second)).not.toBe(key(first));

    commit(root, "add the tool lock");
    const committed = identity(modulePath, root);
    expect(committed.modified).toBeNull();
    expect(committed.code).not.toBe(absent.code);
  });

  it("fingerprints an ignored tool lock and each later edit to its bytes", () => {
    const { root, modulePath } = fixture(false);
    fs.appendFileSync(path.join(root, ".gitignore"), "package-lock.json\n");
    commit(root, "ignore a local tool lock");
    const absent = identity(modulePath, root);
    fs.writeFileSync(path.join(root, "package-lock.json"), "first ignored dependency tree\n");
    expect(git(root, "status", "--porcelain")).toBe("");
    const first = identity(modulePath, root);
    expect(first.code).toBe(absent.code);
    expect(first.modified).not.toBeNull();
    expect(key(first)).not.toBe(key(absent));

    fs.writeFileSync(path.join(root, "package-lock.json"), "second ignored dependency tree\n");
    expect(git(root, "status", "--porcelain")).toBe("");
    const second = identity(modulePath, root);
    expect(second.modified).not.toBe(first.modified);
    expect(key(second)).not.toBe(key(first));
  });

  it("does not mistake an installed generator's host lock for this tool's lock", () => {
    const root = fs.mkdtempSync(path.join(scratch, "host-"));
    const installed = path.join(root, "node_modules", "@live-documentation", "generator");
    const modulePath = path.join(installed, "dist", "history", "generatorIdentity.js");
    fs.mkdirSync(path.dirname(modulePath), { recursive: true });
    fs.writeFileSync(path.join(root, ".gitignore"), "node_modules/\n");
    fs.writeFileSync(path.join(root, "package-lock.json"), "host dependency tree\n");
    fs.writeFileSync(path.join(installed, "package.json"), JSON.stringify({ name: "@live-documentation/generator", version: "0.0.0" }));
    fs.copyFileSync(bundled, modulePath);
    git(root, "init", "-q");
    git(root, "config", "core.autocrlf", "false");
    commit(root, "host dependencies");

    const initial = identity(modulePath, root);
    expect(initial).toEqual({ version: "0.0.0", code: null, commit: null, modified: null });
    fs.writeFileSync(path.join(root, "package-lock.json"), "another host dependency tree\n");
    expect(identity(modulePath, root)).toEqual(initial);
    commit(root, "change host dependencies");
    expect(identity(modulePath, root)).toEqual(initial);
  });
});

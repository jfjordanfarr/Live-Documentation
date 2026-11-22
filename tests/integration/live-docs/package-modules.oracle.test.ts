/**
 * The files a package's own name loads, as the reader of `package.json` takes them (`packageModules` in
 * `packages/engine/src/live-docs/adapters/json.ts`), held to Node's own resolver over real manifests: every package
 * installed under this repository's `node_modules`, nested ones among them. For each, Node is asked to resolve the
 * package's name from the folder that holds it, by `require.resolve` and by `import.meta.resolve`, and the reader's
 * files are set beside Node's. Each package is then one of: the two agree, or a disagreement of a cause named in
 * Node's documented algorithm. The count of each is the committed register
 * (`expected/package-modules.json`), and a count that moves fails the test, as the oracles' registers are kept, so that
 * a mend shows as a count that falls and a new kind of package as one that appears.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire, isBuiltin } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { packageModules } from "../../../packages/engine/src/live-docs/adapters/json";

const REPO = path.resolve(__dirname, "..", "..", "..");
const REGISTER = path.join(__dirname, "expected", "package-modules.json");

interface Installed {
  folder: string;
  /** The folder whose `node_modules` holds the package, from which its name is resolved. */
  owner: string;
  name: string;
  manifest: Record<string, unknown>;
}

/** Every package installed under a `node_modules`, nested ones among them, by its manifest; links to the workspace's own packages aside. */
function installed(nodeModules: string, owner: string, into: Installed[] = []): Installed[] {
  if (!fs.existsSync(nodeModules)) return into;
  for (const entry of fs.readdirSync(nodeModules, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const folders = entry.name.startsWith("@")
      ? fs.readdirSync(path.join(nodeModules, entry.name), { withFileTypes: true }).map((inner) => ({ entry: inner, folder: path.join(nodeModules, entry.name, inner.name) }))
      : [{ entry, folder: path.join(nodeModules, entry.name) }];
    for (const { entry: each, folder } of folders) {
      if (each.isSymbolicLink() || !each.isDirectory()) continue;
      const file = path.join(folder, "package.json");
      if (!fs.existsSync(file)) continue;
      const manifest = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
      if (typeof manifest.name === "string") into.push({ folder, owner, name: manifest.name, manifest });
      installed(path.join(folder, "node_modules"), folder, into);
    }
  }
  return into;
}

/** What Node's ESM resolver gives each package's name from its owner, asked in one process of its own: a path, or nothing. */
function importedByNode(packages: readonly Installed[]): Array<string | undefined> {
  const asked = JSON.stringify(packages.map(({ name, owner }) => [name, pathToFileURL(path.join(owner, "consumer.mjs")).href]));
  const script = `const asked = JSON.parse(process.argv[1]); console.log(JSON.stringify(asked.map(([name, parent]) => { try { return import.meta.resolve(name, parent); } catch { return null; } })));`;
  const answers = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", script, asked], { encoding: "utf8", maxBuffer: 1 << 26 })) as Array<string | null>;
  return answers.map((url) => (url && url.startsWith("file:") ? fileURLToPath(url) : undefined));
}

function requiredByNode({ name, owner }: Installed): string | undefined {
  try {
    return createRequire(path.join(owner, "consumer.js")).resolve(name);
  } catch {
    return undefined;
  }
}

/** Why the reader and Node disagree on a package, by the step of Node's algorithm the reader does not take. */
function causeOf(found: Installed, byNode: readonly string[]): string {
  const { manifest } = found;
  if (isBuiltin(found.name)) return "a name of one of Node's own modules: Node loads its own";
  // Measured on 2026-11-22: asked from the folder that holds a nested copy, and from inside the copy itself, Node 26's
  // `import.meta.resolve` gives the top-level copy's file of the same name (`eslint-visitor-keys` 5.0.1 nested under
  // `eslint` resolves to 3.4.3's `lib/index.js`), so for a nested copy the import side asks about another package.
  if (found.owner !== REPO) return "a nested copy: Node's ESM resolver answers with the top-level copy's file";
  const exported = manifest.exports;
  if (exported === undefined) {
    if (typeof manifest.main !== "string") return "no exports and no main: Node takes index.js";
    const main = path.resolve(found.folder, manifest.main);
    if (!fs.existsSync(main) || fs.statSync(main).isDirectory()) {
      return byNode.some((file) => file.startsWith(main)) ? "main without its extension, or a folder: Node completes it" : "main names no file: Node falls back to index.js";
    }
    return "main names a file Node takes otherwise";
  }
  if (exported && typeof exported === "object" && !Array.isArray(exported)) {
    const keys = Object.keys(exported);
    if (keys.some((key) => key.startsWith(".")) && keys.some((key) => !key.startsWith("."))) return "exports mixes subpaths and conditions: Node refuses";
  }
  return "unexplained";
}

describe("the files a package's own name loads, held to Node's own resolver over this repository's node_modules", () => {
  it("agree with Node, or disagree only by the causes registered, as many times as registered", () => {
    const packages = installed(path.join(REPO, "node_modules"), REPO);
    expect(packages.length).toBeGreaterThan(100);
    const imported = importedByNode(packages);
    const counts: Record<string, number> = {};
    const examples: Record<string, string[]> = {};
    packages.forEach((found, at) => {
      const real = fs.realpathSync(found.folder);
      // A file, as the reader takes the first of Node's candidates that its listing holds, and as Node loads only a file:
      // its ESM resolver does not ask whether the file an export names is there, so its answer may name none.
      const isFile = (file: string): boolean => fs.existsSync(file) && fs.statSync(file).isFile();
      const byNode = Array.from(new Set([requiredByNode(found), imported[at]].filter((file): file is string => file !== undefined && isFile(file)).map((file) => fs.realpathSync(file)))).filter((file) => file.startsWith(`${real}${path.sep}`)).sort();
      const byReader = Array.from(new Set(packageModules(found.manifest).map((candidates) => candidates.map((target) => path.resolve(real, target)).find(isFile)).filter((file): file is string => file !== undefined))).sort();
      const cause = JSON.stringify(byReader) === JSON.stringify(byNode) ? "agree" : causeOf(found, byNode);
      counts[cause] = (counts[cause] ?? 0) + 1;
      if (cause !== "agree" && (examples[cause] ??= []).length < 3) examples[cause].push(`${path.relative(REPO, found.folder)}: the reader ${JSON.stringify(byReader.map((file) => path.relative(real, file)))}, Node ${JSON.stringify(byNode.map((file) => path.relative(real, file)))}`);
    });
    console.log(JSON.stringify({ counts, examples }, null, 2));
    const register = JSON.parse(fs.readFileSync(REGISTER, "utf8")) as { counts: Record<string, number> };
    expect(counts).toEqual(register.counts);
  }, 120_000);
});

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { createRequire } from "node:module";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

import { jsonAdapter } from "./json";

/**
 * The files a package's own name loads, as the reader of `package.json` declares them (its `module` entries), held to
 * Node's own resolver: each manifest is installed as a package in a folder of its own, under `node_modules`, every file
 * it names written, and Node is asked to resolve the package's name both ways, by `require.resolve` and by
 * `import.meta.resolve` in a process of its own. The reader must declare exactly the files Node resolves to, no more and
 * no fewer. Written 2026-11-22, when the reader took a package's entry from `main` alone and so missed
 * `packages/stored-form`, which names its entry only in `exports`.
 */

const root = fs.mkdtempSync(path.join(os.tmpdir(), "package-exports-"));
afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

/** Every path a manifest's `main` and `exports` name, a pattern's aside, so that the package's files exist for Node. */
function namedPaths(value: unknown): string[] {
  if (typeof value === "string") return value.startsWith("./") && !value.includes("*") ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(namedPaths);
  if (value && typeof value === "object") return Object.values(value).flatMap(namedPaths);
  return [];
}

/** The files Node resolves a package's name to, relative to the package, by `require` and by `import`. */
function resolvedByNode(name: string, folder: string): string[] {
  const found = new Set<string>();
  try {
    found.add(createRequire(path.join(root, name, "consumer.js")).resolve(name));
  } catch {
    // Not exported to a program that requires it.
  }
  const imported = spawnSync(process.execPath, ["--input-type=module", "-e", `try { console.log(import.meta.resolve(${JSON.stringify(name)})) } catch { console.log("") }`], { cwd: path.join(root, name), encoding: "utf8" });
  const url = imported.stdout.trim();
  if (url.startsWith("file:")) found.add(fileURLToPath(url));
  return Array.from(found, (file) => path.relative(folder, file).split(path.sep).join("/")).sort();
}

const SHAPES: Array<[string, Record<string, unknown>]> = [
  ["main alone", { main: "./lib/main.js" }],
  ["exports as a string", { exports: "./lib/index.js" }],
  ["exports with the subpath `.` as a string", { exports: { ".": "./lib/index.js", "./package.json": "./package.json" } }],
  ["`.` as conditions with declarations first, as packages/stored-form", { exports: { ".": { types: "./dist/index.d.ts", default: "./dist/index.js" }, "./package.json": "./package.json" } }],
  ["conditions as the whole of exports, one for import and one for require", { exports: { import: "./esm/index.mjs", require: "./cjs/index.cjs" } }],
  ["conditions nested under `node`, with a default after", { exports: { ".": { node: { import: "./node/index.mjs", require: "./node/index.cjs" }, default: "./any/index.js" } } }],
  ["a list of fall-backs", { exports: { ".": ["./lib/first.js", "./lib/second.js"] } }],
  ["exports beside main, which Node does not read", { main: "./old/main.js", exports: { ".": "./new/index.js" } }],
  ["a condition no program under Node matches", { exports: { ".": { browser: "./browser/index.js" } } }],
  ["`.` not exported", { exports: { ".": null, "./feature": "./lib/feature.js" } }],
  ["patterns alone, as the engine's and the Explorer's own manifests", { exports: { "./*": { types: "./dist/*.d.ts", default: "./dist/*.js" }, "./package.json": "./package.json" } }],
  // The independent review of 2026-11-22: shapes no installed package holds. Its own test of them was folded in here.
  ["exports null beside main, which Node reads as no exports", { exports: null, main: "./lib/main.js" }],
  ["a null under a nested condition, which ends that side", { exports: { ".": { node: { import: null, require: "./n.cjs" }, default: "./d.js" } } }],
  ["an empty list under a condition", { exports: { ".": { import: [], require: "./r.cjs", default: "./d.js" } } }],
  ["a list of one null under a condition", { exports: { ".": { import: [null], require: "./r.cjs", default: "./d.js" } } }],
  ["a target that climbs out of the package, which Node refuses", { exports: "./../outside.js" }],
  ["a target with a `..` segment, which Node refuses", { exports: "./lib/../x.js" }],
  ["subpaths mixed with conditions, which Node refuses", { exports: { ".": "./a.js", import: "./b.js" } }]
];

describe("the files a package's own name loads, held to Node's own resolver", () => {
  it.each(SHAPES)("%s", async (_shape, fields) => {
    const name = `shape-${SHAPES.findIndex(([shape]) => shape === _shape)}`;
    const folder = path.join(root, name, "node_modules", name);
    const manifest = { name, version: "1.0.0", ...fields };
    const files = Array.from(new Set(["./package.json", ...namedPaths(fields.main), ...namedPaths(fields.exports)]));
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(folder, file)), { recursive: true });
      fs.writeFileSync(path.join(folder, file), file === "./package.json" ? JSON.stringify(manifest) : "export {};\n");
    }
    const byNode = resolvedByNode(name, folder);
    const fileIndex = new Set(files.map((file) => file.slice(2)));
    const result = await jsonAdapter.analyze({ absolutePath: path.join(folder, "package.json"), workspaceRoot: folder, fileIndex });
    const byReader = (result?.declares ?? []).filter((entry) => entry.reason === "module").map((entry) => entry.file).sort();
    expect(byReader).toEqual(byNode);
  });

  it("finds a module in every shape but the six Node resolves to nothing, so that the comparison is not empty throughout", () => {
    const resolving = SHAPES.filter(([shape]) => !/no program|not exported|patterns alone|Node refuses/u.test(shape)).length;
    expect(resolving).toBe(12);
  });
});

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { createRequire } from "node:module";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

import { jsonAdapter } from "./json";

/**
 * Shapes of `exports` that no package under this repository's `node_modules` holds, so that the oracle over them
 * (`tests/integration/live-docs/package-modules.oracle.test.ts`) could not see the reader of `package.json` miss them;
 * found by the engine review of 2026-11-22. Each is installed as a package in a folder of its own, the workspace being
 * the folder that holds its `node_modules`, so that a file outside the package is still a file of the workspace; Node
 * is asked both ways, as `json.exports.test.ts` asks it, and the reader must declare exactly the files Node resolves to.
 *
 * Node's algorithm (its documentation, "Resolution Algorithm Specification"): `exports` is read when it is "not null
 * or undefined", so `exports: null` falls to `main`; a condition whose target resolves to `null` (a `null`, an empty
 * list, a list of `null`, or conditions within it that end in one) ends the search with "not exported", it does not go
 * on to the next condition; and a target that is not `./` followed by segments free of `.`, `..` and `node_modules` is
 * invalid, as is an `exports` that mixes subpaths with conditions.
 */

const root = fs.mkdtempSync(path.join(os.tmpdir(), "exports-held-"));
afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

/** Every path a manifest's `main` and `exports` name, so that the package's files exist for Node. */
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
    // Not exported to a program that requires it, or refused.
  }
  // `import.meta.resolve` reads its second argument only under a flag, so the folder asked from is the process's own.
  const imported = spawnSync(process.execPath, ["--input-type=module", "-e", `try { console.log(import.meta.resolve(${JSON.stringify(name)})) } catch { console.log("") }`], { cwd: path.join(root, name), encoding: "utf8" });
  const url = imported.stdout.trim();
  if (url.startsWith("file:")) found.add(fileURLToPath(url));
  return Array.from(found, (file) => path.relative(folder, file).split(path.sep).join("/")).sort();
}

/** Each shape: its name, the manifest's fields, and files the package holds beyond those the fields name. */
const SHAPES: Array<[string, Record<string, unknown>, string[]]> = [
  // Node: lib/main.js both ways. The reader: nothing, as it reads `main` only when `exports` is undefined.
  ["exports null beside main", { exports: null, main: "./lib/main.js" }, []],
  // Node: n.cjs for require, not exported for import. The reader: d.js as well, going on past the null.
  ["a null under a nested condition", { exports: { ".": { node: { import: null, require: "./n.cjs" }, default: "./d.js" } } }, []],
  // Node: r.cjs for require, not exported for import. The reader: d.js as well.
  ["an empty list under a condition", { exports: { ".": { import: [], require: "./r.cjs", default: "./d.js" } } }, []],
  ["a list of null under a condition", { exports: { ".": { import: [null], require: "./r.cjs", default: "./d.js" } } }, []],
  // Node: ERR_INVALID_PACKAGE_TARGET both ways. The reader: a file outside the package, in the workspace beside it.
  ["a target that climbs out of the package", { exports: "./../outside.js" }, ["../outside.js"]],
  // Node: ERR_INVALID_PACKAGE_TARGET both ways. The reader: x.js.
  ["a target with a `..` segment inside the package", { exports: "./lib/../x.js" }, []],
  // Node: ERR_INVALID_PACKAGE_CONFIG both ways. The reader: b.js, reading the whole as conditions.
  ["subpaths mixed with conditions", { exports: { ".": "./a.js", import: "./b.js" } }, []]
];

describe("shapes of exports the installed packages do not hold, held to Node's own resolver", () => {
  it.each(SHAPES)("%s", async (shape, fields, extra) => {
    const name = `held-${SHAPES.findIndex(([each]) => each === shape)}`;
    const workspaceRoot = path.join(root, name);
    const folder = path.join(workspaceRoot, "node_modules", name);
    const manifest = { name, version: "1.0.0", ...fields };
    const files = Array.from(new Set(["./package.json", ...namedPaths(fields.main), ...namedPaths(fields.exports), ...extra.map((file) => `./${file}`)]));
    for (const file of files) {
      const at = path.resolve(folder, file);
      fs.mkdirSync(path.dirname(at), { recursive: true });
      fs.writeFileSync(at, file === "./package.json" ? JSON.stringify(manifest) : "export {};\n");
    }
    const byNode = resolvedByNode(name, folder);
    const fileIndex = new Set(files.map((file) => path.relative(workspaceRoot, path.resolve(folder, file)).split(path.sep).join("/")));
    const result = await jsonAdapter.analyze({ absolutePath: path.join(folder, "package.json"), workspaceRoot, fileIndex });
    const byReader = (result?.declares ?? [])
      .filter((entry) => entry.reason === "module")
      .map((entry) => path.relative(folder, path.join(workspaceRoot, entry.file)).split(path.sep).join("/"))
      .sort();
    expect(byReader).toEqual(byNode);
  });
});

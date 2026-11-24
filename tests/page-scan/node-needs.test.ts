import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { bundleScanner, GRAMMARS, REPO, STAND_INS } from "./build-page.mjs";
import { NEEDS_FILE, nodeNeedsOf } from "./node-needs.mjs";

/**
 * The first level of the check that the engine runs in a page, which needs no browser: the scanning page's bundle
 * builds from the engine as it stands with exactly the stand-ins the check ships, what of Node the scan's path needs
 * is the committed `node-needs.json`, and each stand-in answers for exactly what that list says. So a new dependence
 * of the engine on Node shows in review as a changed file, never in silence.
 */

/** What a stand-in exports for the page's own use, and not as Node's. */
const PAGE_SIDE = new Set(["default", "tree", "rules", "asked"]);

/**
 * The list's shape (`node-needs.mjs`): by engine module, by stand-in, the members of packages that exist only under
 * Node, the globals, the packages' imports, the history's modules.
 */
interface Needs {
  engine: Record<string, Record<string, string[]>>;
  standIns: Record<string, string[]>;
  hostedByNode: Record<string, string[]>;
  globals: Record<string, string>;
  packages: Record<string, Record<string, string>>;
  history: string[];
}

const committed = (): Needs => JSON.parse(fs.readFileSync(NEEDS_FILE, "utf8")) as Needs;

/** The value a member chain names on a module (`promises.readFile`), or undefined. */
function reach(module: Record<string, unknown>, chain: string): unknown {
  return chain.split(".").reduce<unknown>((at, member) => (at && typeof at === "object" ? (at as Record<string, unknown>)[member] : undefined), module);
}

describe("what of Node the scan's path needs", () => {
  let derived: Needs;

  it("is read from a bundle of the engine as it stands, built with zero Node stand-ins", async () => {
    const { metafile } = await bundleScanner({ minify: false });
    const inputs = Object.keys(metafile.inputs);
    expect(inputs.some((input) => input.startsWith("packages/engine/src/"))).toBe(true);
    expect(inputs.some((input) => input.startsWith("packages/generator/src/"))).toBe(true);
    derived = nodeNeedsOf(metafile) as Needs;
    expect(STAND_INS).toEqual({});
    expect(derived.engine).toEqual({});
    expect(derived.standIns).toEqual({});
    expect(derived.hostedByNode).toEqual({});
    expect(derived.globals).toEqual({});
  }, 60_000);

  it("is the committed list, so that a new dependence on Node changes a file in review", () => {
    expect(derived, `the scan's path needs other things of Node than ${path.basename(NEEDS_FILE)} says: run \`node tests/page-scan/node-needs.mjs --write\`, give each new need a stand-in, and review the change`).toEqual(committed());
  });

  it("drags in no part of the history engine, which runs git", () => {
    expect(derived.history).toEqual([]);
  });

  it("is answered by the stand-ins, each giving what the list names and nothing more", async () => {
    const faults: string[] = [];
    for (const [specifier, chains] of Object.entries(derived.standIns)) {
      if (specifier === "(global)") continue;
      const file = STAND_INS[specifier.replace(/^node:/u, "") as keyof typeof STAND_INS];
      if (!file) {
        faults.push(`${specifier} has no stand-in`);
        continue;
      }
      const module = (await import(/* @vite-ignore */ pathToFileURL(path.join(__dirname, "stand-ins", file)).href)) as Record<string, unknown>;
      for (const chain of chains) {
        if (chain === "(the module itself)") continue;
        if (reach(module, chain) === undefined) faults.push(`${file} exports no ${chain}`);
        if (reach(module.default as Record<string, unknown>, chain) === undefined) faults.push(`the default export of ${file} has no ${chain}`);
      }
      const named = new Set(chains.flatMap((chain) => chain.split(".")));
      for (const exported of Object.keys(module)) {
        if (!PAGE_SIDE.has(exported) && !named.has(exported)) faults.push(`${file} exports ${exported}, which the scan's path does not name: remove it`);
      }
    }
    for (const global of Object.keys(derived.globals)) {
      if (!derived.standIns["(global)"]?.some((member) => member === global || member.startsWith(`${global}.`))) faults.push(`the global ${global} is listed but not named`);
    }
    expect(faults).toEqual([]);
  });
});

describe("the grammars the page carries", () => {
  // A reader that comes to name a grammar (the Ruby reader, for its comments, on 2026-11-21) would find it missing in a
  // page, and only a browser case would say so; this says it without one.
  it("hold every grammar a reader of the engine names", () => {
    const sources = fs.readdirSync(path.join(REPO, "packages", "engine", "src"), { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));
    const named = new Set<string>();
    for (const file of sources) {
      for (const match of fs.readFileSync(path.join(REPO, "packages", "engine", "src", file), "utf8").matchAll(/\breadTree\(\s*"([^"]+)"/gu)) named.add(match[1]);
    }
    const carried = new Set(GRAMMARS.map((file) => /tree-sitter-([^/]+)\.wasm$/u.exec(file)?.[1]));
    expect(named.size).toBeGreaterThan(0);
    expect(Array.from(named).filter((grammar) => !carried.has(grammar)).sort()).toEqual([]);
  });
});

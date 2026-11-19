import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { refusal, staleBundles, SUITE_BUNDLES } from "./e2e-bundles.mjs";

/**
 * The browser suite's bundles: the one list of them agrees with the npm scripts that build them, and the check at the
 * suite's start refuses bundles not built together from the client as it stands.
 */

describe("the list of the suite's bundles", () => {
  const scripts = (JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")) as { scripts: Record<string, string> }).scripts;

  it("is what the browser suite's command builds, and each folder is one its script writes", () => {
    expect(scripts["test:e2e"]).toMatch(/^node \.\/scripts\/e2e-bundles\.mjs && /);
    for (const bundle of SUITE_BUNDLES) {
      const line = scripts[bundle.script];
      expect(line, bundle.script).toBeDefined();
      for (const folder of bundle.folders.filter(folder => folder !== "." && !folder.endsWith("/*"))) {
        expect(line, `${bundle.script} writes ${folder}`).toContain(`dist/explorer/${folder}`);
      }
    }
  });
});

describe("the check of the suite's bundles", () => {
  let root: string;
  let site: string;
  let client: string;
  const bundles = [{ script: "x", folders: [".", "samples/a", "samples/many/*"] }];
  const write = (file: string, text: string, at: number) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
    fs.utimesSync(file, at, at);
  };
  const script = (folder: string) => path.join(site, folder, "static", "index.js");

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-bundles-"));
    site = path.join(root, "dist", "explorer");
    client = path.join(root, "client");
    write(path.join(client, "index.ts"), "source", 1_000);
    write(path.join(client, "index.test.ts"), "a test, never bundled", 9_000);
    for (const folder of [".", "samples/a", "samples/many/x", "samples/many/y"]) write(script(folder), "built", 2_000);
  });

  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it("passes bundles built together after the client's last change, whatever a test file's time", () => {
    expect(staleBundles(site, [client], bundles)).toEqual([]);
    expect(refusal([])).toBeUndefined();
  });

  it("names a sample built from another client than the Explorer's, and the command that rebuilds them", () => {
    write(script("samples/many/y"), "built earlier", 1_500);
    const faults = staleBundles(site, [client], bundles);
    expect(faults).toHaveLength(1);
    expect(faults[0]).toMatch(/^dist\/explorer\/samples\/many\/y embeds a client script built .*, older than dist\/explorer\/static\/index\.js/);
    expect(refusal(faults)).toContain("npm run e2e:bundles");
  });

  it("names an Explorer older than a change to the client, and a sample that is missing", () => {
    write(path.join(client, "index.ts"), "changed", 3_000);
    fs.rmSync(path.join(site, "samples", "a"), { recursive: true });
    const faults = staleBundles(site, [client], bundles);
    expect(faults[0]).toMatch(/^dist\/explorer\/static\/index\.js \(built .*\) is older than client\/index\.ts/);
    expect(faults[1]).toBe("dist/explorer/samples/a is missing");
  });
});

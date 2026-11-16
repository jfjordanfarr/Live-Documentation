/**
 * The tidepool sample exists to be looked at: its directories hold visibly different mixes of the kinds of file, so
 * that colour by kind can be judged on a project that has all of them (the owner, 2026-11-16: "I love that we can see
 * at a glance that a directory is more tests than implementations, or more assets than tests"). This holds the sample
 * to that make-up as the generator reads it, and to the connections that put its assets and documents on the map.
 */
import * as fs from "node:fs";
import { expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { copyFixture } from "../../../scripts/oracle/fixture";

const TIDEPOOL = `${__dirname}/../programs/typescript/tidepool`;
const quiet = { info: () => undefined, warn: () => undefined, error: (message: string) => { throw new Error(message); } };

it("keeps each directory's mix of kinds, and connects every asset but the test snapshot", async () => {
  const workDir = copyFixture(TIDEPOOL, "tidepool-");
  try {
    const config = normalizeLiveDocumentationConfig();
    await generateLiveDocs({ workspaceRoot: workDir, config, logger: quiet });
    const files = Object.values((await readLiveDocGraph({ workspaceRoot: workDir, config })).files);

    const mix: Record<string, Record<string, number>> = {};
    for (const file of files) {
      const directory = file.codePath.includes("/") ? file.codePath.slice(0, file.codePath.lastIndexOf("/")) : ".";
      const kind = file.archetype ?? "unknown";
      (mix[directory] ??= {})[kind] = (mix[directory][kind] ?? 0) + 1;
    }
    expect(mix).toEqual({
      ".": { implementation: 3 },
      src: { implementation: 8, test: 1 },
      "src/render": { implementation: 3, test: 2, asset: 1 },
      "src/audio": { implementation: 2, asset: 2 },
      tests: { test: 8, asset: 1 },
      "assets/images": { asset: 5 },
      "assets/fonts": { asset: 2 },
      "assets/sounds": { asset: 2 },
      styles: { implementation: 1 },
      levels: { implementation: 2 }
    });

    // An asset is used through the page's attributes or the stylesheet's url(); the test reads its snapshot with
    // readFileSync, which the generator does not record.
    const unused = files.filter(file => file.archetype === "asset" && file.inbound.length === 0).map(file => file.codePath);
    expect(unused).toEqual(["tests/snapshot.png"]);

    // Show Related Docs: authored words that link to documents, carried from the sample's own authored blocks.
    const authoredLinks = files.filter(file => /\]\([^)]*\.md\)/u.test(file.authored)).map(file => file.codePath).sort();
    expect(authoredLinks).toEqual(["src/audio/sounds.ts", "src/creatures.ts", "src/game.ts", "src/render/canvas.ts", "src/tide.ts"]);
    // Show Citing Docs: the documents' own links name source files, and the generator writes them into Cited By.
    const cited = fs.readFileSync(`${workDir}/.live-documentation/source/src/pool.ts.md`, "utf8");
    expect(cited).toMatch(/docs\/design\.md/u);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
});

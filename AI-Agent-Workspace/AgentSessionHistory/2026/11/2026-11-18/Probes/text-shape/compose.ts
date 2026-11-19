/**
 * The text-shape probe's sheets (2026-11-19): lays out the pictures `run.ts` drew, each sheet a page of labelled rows,
 * and writes each as a PNG into the day's `Screenshots/text-shape/`. One browser for every sheet; run it under the
 * shared lock:
 *
 *   flock -x /tmp/live-docs-browser.lock npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/text-shape/compose.ts
 */

import { chromium } from "@playwright/test";
import * as fs from "node:fs";
import path from "node:path";

import { browserLaunchOptions } from "../../../../../../../tests/e2e/browser-launch";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const SHOTS = path.join(HERE, "../../Screenshots/text-shape");
const sheets = JSON.parse(fs.readFileSync(path.join(HERE, "sheets.json"), "utf8")) as Record<string, Array<{ heading: string; tiles: Array<{ image: string; caption: string }> }>>;
const escape = (text: string): string => text.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[ch]!);
const uri = (file: string): string => `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;

const TITLES: Record<string, string> = {
  fork: "Row 1. forceGraphView.ts over its last ten commits, each candidate at 96 px",
  small: "Row 2. A small file before and after a commit of one or two lines, at 160 px",
  sql: "Row 3. The owner's case: one query aligned by eye, and conventionally",
  kinds: "Row 4. Kinds, at 112 px",
  field: "Row 5. A field of forty files at the sizes spheres have on screen",
  pins: "2D. The Internals row's inbound pin as a rounded box holding the page, on the card's ground",
  "pairs-PG": "Threshold. PG: pairs of a touch's marble at 48 px, before and after, near several changes",
  "pairs-P": "Threshold. P: pairs of a touch's marble at 48 px, before and after, near several changes"
};

async function main(): Promise<void> {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch(browserLaunchOptions());
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    for (const [name, rows] of Object.entries(sheets)) {
      const today = name === "field" ? `<h2>Today's From Its Doc, for comparison (files-doc.png of the marble trial, near and far rows)</h2><img class="ref" src="${uri(path.join(HERE, "../../Screenshots/marble-patterns/files-doc.png"))}">` : "";
      const body = rows.map(row => `<h2>${escape(row.heading)}</h2><div class="row${name === "field" ? " field" : ""}">${row.tiles.map(tile =>
        `<figure><img src="${uri(path.join(HERE, "out", tile.image))}"><figcaption>${escape(tile.caption)}</figcaption></figure>`).join("")}</div>`).join("");
      await page.setContent(`<!doctype html><meta charset="utf-8"><style>
        body { margin: 0; padding: 24px; background: #101114; color: #e8e8ec; font: 13px/1.3 system-ui, sans-serif; width: 1552px; }
        h1 { font-size: 18px; margin: 0 0 8px; } h2 { font-size: 13px; margin: 14px 0 6px; font-weight: 600; }
        .row { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: flex-end; }
        .row.field { gap: 6px; align-items: center; }
        figure { margin: 0; display: flex; flex-direction: column; align-items: center; }
        figure img { image-rendering: auto; }
        figcaption { color: #c8cad2; font-size: 11px; white-space: pre; text-align: center; margin-top: 3px; }
        .ref { max-width: 1550px; }
      </style><h1>${escape(TITLES[name] ?? name)}</h1>${body}${today}`);
      await page.locator("body").screenshot({ path: path.join(SHOTS, `${name}.png`) });
      console.log(`Wrote ${name}.png`);
    }
  } finally {
    await browser.close();
  }
}

void main();

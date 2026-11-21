#!/usr/bin/env node
// Pictures of the trial page at 1,280 by 800, for judging by eye: a folder given through the folder input (automation
// cannot press the picker or make a drop that reaches the page), both layouts, a group opened, a pattern added, a
// folder kept back, and the keyboard's focus in the tree. Only through the browser lane, the page built first:
//   node look.mjs <folder> <label> <out folder>
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [folder, label, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const shot = async (name) => page.screenshot({ path: path.join(out, `${label}-${name}.png`) });
const settled = async () => page.waitForFunction(() => document.getElementById("progress").textContent === "" && !document.getElementById("choice").hidden, undefined, { timeout: 120_000 });
const record = { label };

await page.goto(pathToFileURL(path.join(here, "choice.html")).href);
await shot("0-empty");
const given = Date.now();
await page.setInputFiles("#folder-input", folder, { timeout: 200_000 });
await settled();
record.handedAndDecidedMs = Date.now() - given;
record.totals = await page.textContent("#totals");
record.timings = await page.textContent("#timings");
await shot("1-by-reason");

// A group opened.
const twisty = page.locator("#reasons .twisty").first();
if (await twisty.count()) {
  await twisty.click();
  await shot("2-group-opened");
  // A folder kept back, from the opened group's first member.
  const keep = page.locator("#reasons .members .keep").first();
  if (await keep.count()) {
    record.keptBack = await keep.getAttribute("aria-label");
    await keep.click();
    await settled();
    record.totalsAfterKeep = await page.textContent("#totals");
    await shot("3-folder-kept");
  }
}

// A pattern of one's own.
await page.fill("#pattern", "Build/");
await page.click("#pattern-form button[type=submit]");
await settled();
record.totalsAfterPattern = await page.textContent("#totals");
await shot("4-pattern-added");

// The folder tree, and the keyboard in it.
await page.click('[data-layout="tree"]');
await page.waitForSelector('[role="treeitem"]');
await page.focus('[role="treeitem"][tabindex="0"]');
for (const key of ["ArrowDown", "ArrowDown", "ArrowRight", "ArrowDown"]) await page.keyboard.press(key);
record.focused = await page.evaluate(() => document.activeElement?.dataset.path ?? null);
await shot("5-tree-focus");
record.errors = errors;
console.log(JSON.stringify(record));
await browser.close();

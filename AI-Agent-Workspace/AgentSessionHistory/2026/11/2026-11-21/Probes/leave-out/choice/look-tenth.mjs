#!/usr/bin/env node
// Pictures of the trial page at the tenth leg's mends, with what was counted beside them in `<label>-record.json`: the
// folders' offer taken, both offers kept in place, the taken one "In your list"; a press elsewhere, the offers still
// there; Replace, Add, then undo, the notice of Replace with its list; `packages/` typed, its row's sign and the top
// line's count of what looks like the team's own code, its folder first when opened; GitHub's Visual Studio list taken
// from its offer, `**/[Pp]ackages/*` opened, `Installer/Packages` first. Through the browser lane, the page built first:
//   node look-tenth.mjs <folder> <label> <out folder>
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [folder, label, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const record = { label };
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
const settled = async () => page.waitForFunction(() => document.getElementById("progress").textContent === "" && !document.getElementById("choice").hidden, undefined, { timeout: 300_000 });
const said = async (selector) => page.$$eval(selector, (nodes) => nodes.map((node) => node.innerText.replace(/\s+/gu, " ").trim()));
const look = async (name) => {
  record[name] = { totals: (await page.textContent("#totals")).replace(/\s+/gu, " "), notice: await page.textContent("#found-what").catch(() => null), choices: await said("#found-choices button"), offers: await said("#offers .offer") };
  // The timing line is kept out of the pictures: it says how long this machine took, not what the page shows.
  await page.screenshot({ path: path.join(out, `${label}-${name}.png`), style: "#timings { visibility: hidden; }" });
};
/** Opens the line of the list whose text is `text` inside the block titled `block`, and scrolls it to the top. */
const openLine = async (block, text) => {
  const row = page.locator("#by-line > li.block", { hasText: block }).first();
  if ((await row.locator(":scope > .row .twisty").getAttribute("aria-expanded")) !== "true") await row.locator(":scope > .row .twisty").click();
  const line = page.locator("#by-line > li.block", { hasText: block }).first().locator(".members > li").filter({ has: page.locator(":scope > .row .line-text", { hasText: text }) }).first();
  await line.locator(":scope > .row .twisty").click();
  const opened = page.locator("#by-line > li.block", { hasText: block }).first().locator(".members > li").filter({ has: page.locator(":scope > .row .line-text", { hasText: text }) }).first();
  await opened.evaluate((node) => node.scrollIntoView({ block: "start" }));
  return { line: (await opened.locator(":scope > .row").innerText()).replace(/\s+/gu, " "), first: (await opened.locator(".members > li").allInnerTexts()).slice(0, 4).map((row) => row.replace(/\s+/gu, " ")) };
};

await page.goto(pathToFileURL(path.join(here, "choice.html")).href);
await page.setInputFiles("#folder-input", folder, { timeout: 360_000 });
await settled();
await page.waitForSelector("#offers .offer", { timeout: 120_000 });
await page.click('#offers [data-offer="what-it-holds"]');
await settled();
await look("1-offer-kept");
await page.click('#read [aria-label="Open DNN Platform"]');
await look("2-after-a-press-elsewhere");

await page.click('#found-choices [data-take="use"]');
await settled();
await page.click('#found-choices [data-take="add"]');
await settled();
await page.click("#undo");
await settled();
await look("3-undo-after-replace-and-add");
await page.click("#undo");
await settled();

await page.click("#list");
await page.keyboard.press("Control+End");
await page.keyboard.type("\npackages/");
await page.waitForFunction(() => document.getElementById("progress").textContent !== "", undefined, { timeout: 10_000 }).catch(() => undefined);
await settled();
record.packagesTypedOpened = await openLine("What the folders hold", /^packages\/$/u);
await look("4-packages-typed");
await page.click("#undo");
await settled();
record.listEndsAfterUndo = await page.$eval("#list", (area) => area.value.trimEnd().split("\n").at(-1));
await page.click('[aria-label="Close What the folders hold"]');

await page.click('#offers [data-offer="visual-studio"]');
await settled();
record.blocks = await said("#by-line > li.block > .row");
try {
  record.visualStudioPackagesOpened = await openLine("Visual Studio", "Pp]ackages/*");
} catch (error) {
  record.openFailed = String(error).slice(0, 300);
}
await look("5-visual-studio-packages");

record.errors = errors;
fs.writeFileSync(path.join(out, `${label}-record.json`), `${JSON.stringify(record, null, 1)}\n`);
console.log(JSON.stringify(record, null, 1));
await browser.close();

#!/usr/bin/env node
// Pictures of the trial page at 1,280 by 800, for judging by eye, with what was counted beside them (written to
// `<label>-record.json`, so that no later run writes over it): a folder given through the folder input (automation
// cannot press the picker or make a drop that reaches the page) with an empty list; the notice of ignore files found,
// opened; Use; the lines proposed from what the folders hold; GitHub's Visual Studio list added; a kind and a folder
// left out by their minus; the end of the list. Only through the browser lane, the page built first:
//   node look.mjs <folder> <label> <out folder>
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [folder, label, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const record = { label, absent: [] };
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const settled = async () => page.waitForFunction(() => document.getElementById("progress").textContent === "" && !document.getElementById("choice").hidden, undefined, { timeout: 300_000 });
const shot = async (name) => page.screenshot({ path: path.join(out, `${label}-${name}.png`) });
const rows = () => page.$$eval("#by-line > li", (items) => items.slice(0, 20).map((item) => item.innerText.replace(/\s+/gu, " ").trim()));
const listLines = () => page.$eval("#list", (area) => area.value.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#")).length);
const look = async (name) => {
  record[name] = { totals: await page.textContent("#totals"), listLines: await listLines(), byLine: await rows() };
  await shot(name);
};

await page.goto(pathToFileURL(path.join(here, "choice.html")).href);
const given = Date.now();
// The made folder's 103,329 files take the browser over a minute to hand over, and longer on a loaded machine.
await page.setInputFiles("#folder-input", folder, { timeout: 360_000 });
await settled();
record.handedAndDecidedMs = Date.now() - given;
record.found = await page.textContent("#found-what").catch(() => null);
await look("1-first");

// The notice opened, its files and a choice each.
if (await page.isVisible("#found")) {
  await page.click("#found-open");
  record.foundFiles = await page.$$eval("#found-files li", (items) => items.length);
  await shot("2-found-open");
  await page.click('[data-take="use"]');
  await settled();
  record.foundSaid = await page.textContent("#found-said");
  await look("3-used");
} else record.absent.push("a notice of ignore files found");

// The lines proposed from what the folders hold.
await page.click("#prefill");
await page.click('[data-prefill="what-it-holds"]');
await settled();
record.proposedComment = await page.$eval("#list", (area) => area.value.split("\n").find((line) => line.startsWith("# From what the folders hold")) ?? null);
await page.$eval("#list", (area) => {
  area.scrollTop = area.scrollHeight;
});
await look("4-proposed");

// GitHub's Visual Studio list, and what each of its lines leaves out here, by kind.
await page.click("#prefill");
await page.click('[data-prefill="visual-studio"]');
await settled();
record.visualStudioSourceFiles = await page.$$eval("#by-line > li", (items) => items.map((item) => item.innerText.replace(/\s+/gu, " ").trim()).filter((text) => /\.cs \d/u.test(text)));
await look("5-visual-studio");

// A kind and a folder left out by their minus: each a line at the end of the list.
const png = page.locator('#read [aria-label="Leave out every .png file"]');
if (await png.count()) await png.click();
else record.absent.push("the minus of .png");
await settled();
const platform = page.locator('#read [aria-label="Open DNN Platform"]');
if (await platform.count()) {
  await platform.click();
  const tests = page.locator('#read [aria-label="Leave out DNN Platform/Tests/"]');
  if (await tests.count()) {
    await tests.click();
    await settled();
  } else record.absent.push("the minus of DNN Platform/Tests/");
} else record.absent.push("DNN Platform under Will be read");
await page.$eval("#list", (area) => {
  area.scrollTop = area.scrollHeight;
});
record.listEnd = await page.$eval("#list", (area) => area.value.trimEnd().split("\n").slice(-3));
await look("6-minus");

record.errors = errors;
fs.writeFileSync(path.join(out, `${label}-record.json`), `${JSON.stringify(record, null, 1)}\n`);
console.log(JSON.stringify({ label, absent: record.absent, errors }, null, 1));
await browser.close();

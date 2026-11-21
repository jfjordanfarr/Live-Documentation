#!/usr/bin/env node
// Pictures of the trial page at the states the strangers of 2026-11-21 met on the one list ("One list tried on
// strangers" in `Probes/blind-playtests/README.md`), on the ninth leg's mends, with what was counted beside them in
// `<label>-record.json`: the first screen; the second offer held in place after the first is taken; the notice's
// choices once the list holds lines; Replace, then Control+Z, then Add; the Visual Studio list's block opened, the
// kinds a reader reads first; `packages/` typed, and the count of code left out beside the totals; the folders' block
// opened and its column scrolled to its end, the totals and headings still in view. Through the browser lane, the page
// built first:
//   node look-strangers.mjs <folder> <label> <out folder>
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
const shot = async (name) => page.screenshot({ path: path.join(out, `${label}-${name}.png`) });
const said = async (selector) => page.$$eval(selector, (nodes) => nodes.map((node) => node.innerText.replace(/\s+/gu, " ").trim()));
const look = async (name) => {
  record[name] = { totals: await page.textContent("#totals"), notice: await page.textContent("#found-what").catch(() => null), choices: await said("#found-choices button"), offers: await said("#offers .offer"), listLines: await page.$eval("#list", (area) => area.value.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#")).length) };
  await shot(name);
};
/** Whether the totals and the three columns' headings stand inside the window. */
const inView = async () => page.evaluate(() => [document.getElementById("totals"), ...document.querySelectorAll(".column > h2")].every((node) => {
  const box = node.getBoundingClientRect();
  return box.top >= 0 && box.bottom <= window.innerHeight;
}));

await page.goto(pathToFileURL(path.join(here, "choice.html")).href);
await page.setInputFiles("#folder-input", folder, { timeout: 360_000 });
await settled();
await page.waitForSelector("#offers .offer", { timeout: 120_000 });
await look("1-first");

// The folders' offer taken: the other offer stays where it was, the pointer still on the offers.
await page.click('#offers [data-offer="what-it-holds"]');
await settled();
await look("2-offer-held");
// A press elsewhere: the offers go, now that the list holds lines.
await page.click(".column:nth-child(2) > h2");
record.offersAfterAPressElsewhere = await page.isVisible("#offers");

// The list holds lines: the notice's choices say what each does to them.
await look("3-choices-on-a-list");
await page.click('#found-choices [data-take="use"]');
await settled();
await look("4-replaced");
// Control+Z in the list takes the replacement back.
await page.click("#list");
await page.keyboard.press("Control+z");
await settled();
await look("5-taken-back");
await page.click('#found-choices [data-take="add"]');
await settled();
await look("6-added");

// `packages/` typed at the end of the list, as three strangers typed it: the count of code left out beside the totals.
record.codeBeforeTyping = await page.textContent("#totals .totals-code").catch(() => null);
await page.click("#list");
await page.keyboard.press("Control+End");
await page.keyboard.type("\npackages/");
await page.waitForFunction(() => document.getElementById("progress").textContent !== "", undefined, { timeout: 10_000 }).catch(() => undefined);
await settled();
record.codeAfterTyping = await page.textContent("#totals .totals-code").catch(() => null);
await look("7-packages-typed");
await page.keyboard.press("Control+z");
await settled();
record.totalsAfterUndoingTheTyping = await page.textContent("#totals");

// The Visual Studio list, its block opened: the kinds a reader reads come first in each row.
await page.click("#prefill");
await page.click('[data-prefill="visual-studio"]');
await settled();
const visualStudio = page.locator("#by-line > li.block", { hasText: "Visual Studio's list" });
await visualStudio.locator(".twisty").first().click();
record.packagesLine = (await said("#by-line .members > li")).find((row) => row.includes("[Pp]ackages/*")) ?? null;
await visualStudio.first().evaluate((row) => row.scrollIntoView({ block: "start" }));
await look("8-code-first");

// The folders' block opened, and its column scrolled to its end, as a stranger scrolled to reach line 38.
const folders = page.locator("#by-line > li.block", { hasText: "What the folders hold" });
await folders.locator(".twisty").first().click();
await page.$eval(".column:nth-child(2) .column-body", (body) => {
  body.scrollTop = body.scrollHeight;
});
record.totalsAndHeadingsInViewWhenScrolled = await inView();
await look("9-scrolled-to-the-end");

record.errors = errors;
fs.writeFileSync(path.join(out, `${label}-record.json`), `${JSON.stringify(record, null, 1)}\n`);
console.log(JSON.stringify(record, null, 1));
await browser.close();

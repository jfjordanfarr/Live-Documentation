#!/usr/bin/env node
// Pictures of the trial page at 1,280 by 800, for judging by eye, with what was counted beside them: a folder given
// through the folder input (automation cannot press the picker or make a drop that reaches the page); by reason, a
// reason opened to its top folders and one of those opened, a folder kept that both an ignore file and the evidence
// rules leave out, three patterns of one's own scrolled to the footer; and the folder tree under each of its two kinds
// of box, with the files at a level as a row of their own, one of those left out and the keyboard's focus. A step the
// page cannot take (an older build) is recorded as absent and skipped. Only through the browser lane, the page built
// first. A large folder takes the browser a minute to hand over each time, so the three pages can be taken in three
// holds of the lane (`reason`, `mixed`, `choice`):
//   node look.mjs <folder> <label> <out folder> [page.html, by default the built choice.html beside this] [part]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [folder, label, out, given = "", part = "all"] = process.argv.slice(2);
const pagePath = given || path.join(here, "choice.html");
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const record = { label, page: path.basename(pagePath), absent: [] };
const errors = [];

/** A page at the given link parameters, the folder handed to it and decided. */
async function open(query) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(`${pathToFileURL(pagePath).href}${query}`);
  const given = Date.now();
  await page.setInputFiles("#folder-input", folder, { timeout: 200_000 });
  await settled(page);
  record.handedAndDecidedMs ??= Date.now() - given;
  return page;
}
const settled = async (page) => page.waitForFunction(() => document.getElementById("progress").textContent === "" && !document.getElementById("choice").hidden, undefined, { timeout: 120_000 });
const shot = async (page, name) => page.screenshot({ path: path.join(out, `${label}-${name}.png`) });
const step = async (page, selector, name) => {
  const target = page.locator(selector).first();
  if (await target.count()) return target;
  record.absent.push(name);
  return null;
};
const reasonRows = (page) => page.$$eval("#reasons > li", (rows) => rows.map((row) => row.innerText.replace(/\s+/gu, " ").trim()));

// By reason.
if (part === "all" || part === "reason") await byReason();
async function byReason() {
  const page = await open("?layout=reason");
  record.totals = await page.textContent("#totals");
  record.timings = await page.textContent("#timings");
  record.switchShown = await page.isVisible(".segmented");
  await shot(page, "1-by-reason");

  // The largest reason opened: its folders under their top folders, and the largest of those opened.
  await page.locator("#reasons .twisty").first().click();
  await shot(page, "2-reason-opened");
  const top = await step(page, "#reasons .members .twisty", "a top folder to open");
  if (top) {
    record.topOpened = await top.getAttribute("aria-label");
    await top.click();
    // A folder's own quiet Keep given the keyboard's focus, to see the control and its name.
    const quiet = await step(page, "#reasons .members .members .quiet-keep", "a folder's quiet Keep");
    if (quiet) {
      record.quietKeepName = await quiet.getAttribute("aria-label");
      // Reached from the keyboard, so that the browser draws its focus as a person tabbing would see it.
      await quiet.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
    }
    record.notShown = await page.locator("#reasons .text-button").first().textContent().catch(() => null);
    await shot(page, "3-top-opened");
    await page.locator("#reasons .twisty").first().click();
  }

  // A folder kept that an ignore file and the evidence rules both leave out: shown once, under what it is.
  record.reasonsBeforeKeep = await reasonRows(page);
  const merged = "DNN Platform/Connectors/GoogleAnalytics/packages/";
  const nuget = page.locator("#reasons > li", { hasText: "NuGet packages" }).locator(".twisty").first();
  if (await nuget.count()) {
    await nuget.click();
    const inPlatform = page.locator("#reasons > li", { hasText: "NuGet packages" }).locator(".members .twisty").first();
    if (await inPlatform.count()) await inPlatform.click();
    const keep = page.locator(`#reasons [aria-label="Keep ${merged}"]`);
    if (await keep.count()) {
      await keep.click();
      await settled(page);
      record.keptMerged = merged;
      record.totalsAfterKeep = await page.textContent("#totals");
      record.reasonsAfterKeep = await reasonRows(page);
      record.patternsAfterKeep = await page.$$eval("#patterns code", (codes) => codes.map((code) => code.textContent));
      await page.locator("#reasons > li", { hasText: "NuGet packages" }).first().evaluate((row) => row.scrollIntoView({ block: "start" }));
      await shot(page, "4-merged-kept");
    } else record.absent.push("the quiet Keep of a merged folder");
  } else record.absent.push("a NuGet packages reason");

  // Three patterns of one's own, a note among what they make, and the page scrolled to its end above the footer.
  for (const pattern of ["Build/", "!/Build/Tools/", "*.md"]) {
    await page.fill("#pattern", pattern);
    await page.click("#pattern-form button[type=submit]");
    await settled(page);
  }
  record.totalsAfterPatterns = await page.textContent("#totals");
  record.notes = await page.$$eval("#notes li", (items) => items.map((item) => item.textContent));
  await page.evaluate(() => {
    const scroller = document.querySelector("main").scrollHeight > document.querySelector("main").clientHeight ? document.querySelector("main") : document.scrollingElement;
    scroller.scrollTop = scroller.scrollHeight;
  });
  record.lastPatternClearsFooter = await page.evaluate(() => {
    const last = [...document.querySelectorAll("#patterns li")].at(-1)?.getBoundingClientRect();
    const footer = document.querySelector("footer").getBoundingClientRect();
    return last ? { lastBottom: Math.round(last.bottom), footerTop: Math.round(footer.top), clear: last.bottom <= footer.top } : null;
  });
  await shot(page, "5-three-patterns");
  await page.close();
}

// The folder tree under each kind of box: the same folders opened, the files at a level a row of their own.
for (const boxes of ["mixed", "choice"].filter((each) => part === "all" || part === each)) {
  const tree = await open(`?layout=folders&switch=off&boxes=${boxes}`);
  if (await tree.isHidden("#by-tree")) await tree.click('[data-layout="tree"]');
  record[`switchShown-${boxes}`] = await tree.isVisible(".segmented");
  for (const name of ["Build", "DNN Platform"]) {
    const row = tree.locator(`[role="treeitem"][data-path="${name}"]`);
    if (await row.count()) await row.locator(".name").click();
  }
  const rows = await tree.$$eval('[role="treeitem"]', (items) => items.slice(0, 40).map((item) => `${item.getAttribute("aria-checked")} ${item.innerText.replace(/\s+/gu, " ").trim()}`));
  record[`tree-${boxes}`] = rows;
  await shot(tree, `6-tree-${boxes}`);
  // Scrolled down the tree: the totals and Scan stay in view.
  await tree.evaluate(() => {
    document.querySelector("main").scrollTop = 900;
  });
  record[`totalsInViewScrolled-${boxes}`] = await tree.evaluate(() => {
    const box = document.getElementById("totals").getBoundingClientRect();
    return box.top >= document.querySelector("main").getBoundingClientRect().top && box.bottom <= window.innerHeight;
  });
  await shot(tree, `6-tree-${boxes}-scrolled`);
  await tree.evaluate(() => {
    document.querySelector("main").scrollTop = 0;
  });
  if (boxes === "choice") {
    // The files at the top left out by their row's box, from the keyboard: End, then Space.
    await tree.focus('[role="treeitem"][tabindex="0"]');
    await tree.keyboard.press("End");
    record.focusedAtEnd = await tree.evaluate(() => document.activeElement?.textContent ?? null);
    await tree.keyboard.press(" ");
    await settled(tree);
    record.totalsAfterLoose = await tree.textContent("#totals");
    record.patternsAfterLoose = await tree.$$eval("#patterns code", (codes) => codes.length);
    record.looseRowAfter = await tree.evaluate(() => [...document.querySelectorAll('[role="treeitem"]')].at(-1)?.innerText.replace(/\s+/gu, " ").trim() ?? null);
    await shot(tree, "7-loose-left-out");
  }
  await tree.close();
}

record.errors = errors;
console.log(JSON.stringify(record, null, 1));
await browser.close();

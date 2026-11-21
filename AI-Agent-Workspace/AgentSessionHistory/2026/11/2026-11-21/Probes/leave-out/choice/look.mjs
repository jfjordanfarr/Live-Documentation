#!/usr/bin/env node
// Pictures of the trial page at 1,280 by 800, for judging by eye, with what was counted beside them: a folder given
// through the folder input (automation cannot press the picker or make a drop that reaches the page); the screen, By
// reason, as `byReason` below says; and the folder tree, kept behind its link parameter, under each of its two kinds of
// box. A step the page cannot take is recorded as absent and skipped. Only through the browser lane, the page built
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
  // The made folder's 103,329 files take the browser over a minute to hand over, and longer on a loaded machine.
  await page.setInputFiles("#folder-input", folder, { timeout: 360_000 });
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

// The screen, By reason: the first look; a folder under "Will be read" opened and one of its folders left out by its
// own control; a kind left out; a reason opened down to a folder an ignore file also names, with its file and line;
// the files at the top left out as one choice, three choices in all, and the page scrolled to them.
if (part === "all" || part === "reason") await byReason();
async function byReason() {
  const page = await open("");
  const scrollTop = async () => page.evaluate(() => {
    document.querySelector("main").scrollTop = 0;
  });
  const readRows = () => page.$$eval("#read .counts-list > li", (rows) => rows.slice(0, 14).map((row) => row.innerText.replace(/\s+/gu, " ").trim()));
  record.totals = await page.textContent("#totals");
  record.switchShown = await page.isVisible(".segmented");
  record.evidenceSwitch = await page.locator("#evidence").count();
  record.reasons = await reasonRows(page);
  record.read = await readRows();
  record.timings = await page.textContent("#timings");
  await shot(page, "1-first");

  // The largest folder under "Will be read", opened; then one of its folders left out by its quiet control.
  const largest = await step(page, "#read .counts-list .twisty", "a folder to open under Will be read");
  if (largest) {
    record.readOpened = await largest.getAttribute("aria-label");
    await largest.click();
    const leave = page.locator('#read [aria-label="Leave out DNN Platform/Tests/"]');
    if (await leave.count()) await leave.focus();
    await shot(page, "2-read-folder-opened");
    // How long an opened folder makes the page: the scrolling part's height against what the window shows, and where
    // each column ends.
    record.lengthAfterOpen = await page.evaluate(() => {
      const main = document.querySelector("main");
      return { scrollHeight: main.scrollHeight, shown: main.clientHeight, leftEnds: Math.round(document.getElementById("reasons").getBoundingClientRect().bottom), rightEnds: Math.round(document.getElementById("read").getBoundingClientRect().bottom) };
    });
    if (await leave.count()) {
      await leave.click();
      await settled(page);
      record.totalsAfterFolder = await page.textContent("#totals");
      record.reasonsAfterFolder = await reasonRows(page);
      // Scrolled down the opened folder on the right, as a person leaving out a folder deep in it would be: is the new
      // reason on the left still in view?
      await page.evaluate(() => {
        document.querySelector("main").scrollTop = 700;
      });
      record.leftInViewScrolled = await page.evaluate(() => {
        const row = [...document.querySelectorAll("#reasons > li")].find((each) => each.textContent.includes("Your pattern"));
        const box = row?.getBoundingClientRect();
        return box ? box.top >= document.querySelector(".summary").getBoundingClientRect().bottom && box.bottom <= document.querySelector("footer").getBoundingClientRect().top : null;
      });
      await shot(page, "3b-scrolled-down-the-right");
      await scrollTop();
      await shot(page, "3-folder-left-out");
    } else record.absent.push("the Leave out of DNN Platform/Tests/");
  }

  // A kind left out.
  const png = page.locator('#read [aria-label="Leave out every .png file"]');
  if (await png.count()) {
    await png.click();
    await settled(page);
    record.totalsAfterKind = await page.textContent("#totals");
    record.reasonsAfterKind = await reasonRows(page);
    record.readAfterKind = await readRows();
    await scrollTop();
    await shot(page, "4-kind-left-out");
  } else record.absent.push("the Leave out of .png");

  // A reason opened down to a folder that an ignore file also names: its file and line on its own row.
  const named = page.locator("#reasons > li", { has: page.locator(".also") }).first();
  if (await named.count()) {
    await named.locator(".twisty").first().click();
    const top = named.locator(".members .twisty").first();
    if (await top.count()) {
      record.ignoreLineOpened = await top.getAttribute("aria-label");
      await top.click();
    }
    const line = named.locator(".also-line").first();
    if (await line.count()) {
      record.ignoreLine = await line.textContent();
      record.ignoreLineRow = await line.evaluate((node) => node.closest(".row").innerText.replace(/\s+/gu, " ").trim());
      await line.evaluate((node) => node.closest(".row").scrollIntoView({ block: "center" }));
    } else record.absent.push("a folder's ignore line");
    await shot(page, "5-ignore-line");
    await named.locator(".twisty").first().click();
    await scrollTop();
  } else record.absent.push("a reason an ignore file also names");

  // The files at the top left out as one choice: three choices in all, listed one row each.
  const top = page.locator('#read [aria-label^="Leave out the "][aria-label$="in the top folder"]');
  if (await top.count()) {
    record.topFilesControl = await top.getAttribute("aria-label");
    await top.click();
    await settled(page);
    record.totalsAfterTopFiles = await page.textContent("#totals");
  } else record.absent.push("the Leave out of the files at the top");
  record.patterns = await page.$$eval("#patterns li", (items) => items.map((item) => item.innerText.replace(/\s+/gu, " ").trim()));
  record.reasonsAfterAll = await reasonRows(page);
  await page.evaluate(() => {
    document.querySelector("main").scrollTop = document.querySelector("main").scrollHeight;
  });
  record.lastPatternClearsFooter = await page.evaluate(() => {
    const last = [...document.querySelectorAll("#patterns li")].at(-1)?.getBoundingClientRect();
    const footer = document.querySelector("footer").getBoundingClientRect();
    return last ? { lastBottom: Math.round(last.bottom), footerTop: Math.round(footer.top), clear: last.bottom <= footer.top } : null;
  });
  await shot(page, "6-three-choices");

  // A choice of the person's own taken back by the Keep on its reason.
  const yours = page.locator("#reasons > li", { hasText: "Your pattern: *.png" }).locator(".keep");
  if (await yours.count()) {
    await yours.click();
    await settled(page);
    record.totalsAfterPngKept = await page.textContent("#totals");
    record.patternsAfterPngKept = await page.$$eval("#patterns li", (items) => items.length);
  }
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
// The record beside the pictures, under the run's own label and part, so that no later run writes over it.
fs.writeFileSync(path.join(out, `${label}-${part}-record.json`), `${JSON.stringify(record, null, 1)}\n`);
console.log(JSON.stringify(record, null, 1));
await browser.close();

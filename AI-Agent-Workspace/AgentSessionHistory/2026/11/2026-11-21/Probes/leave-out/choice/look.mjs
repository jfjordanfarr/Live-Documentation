#!/usr/bin/env node
// Pictures of the trial page at 1,280 by 800, for judging by eye, with what was counted beside them (written to
// `<label>-record.json`, so that no later run writes over it): a folder given through the folder input (automation
// cannot press the picker or make a drop that reaches the page) with an empty list and its offers; the offer of what
// the folders hold taken; the ignore files found added; GitHub's Visual Studio list added and its block opened; a kind
// and a folder left out by their minus; a list tool's name shown on focus. With `timing`, a run of its own whose pictures
// are not kept: how long an edit takes to show, at full speed and with the processor slowed four times on two cores,
// the slowed edit traced. Only through the browser lane, the page built first:
//   node look.mjs <folder> <label> <out folder> [pictures|timing]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [folder, label, out, mode = "pictures"] = process.argv.slice(2);

/**
 * A trace's main-thread time in the page, summed by kind of work: each task's own length, and how long the thread
 * stood idle between them over the traced window, so that time spent waiting on timers can be told from time worked.
 */
function summarize(events) {
  const named = events.filter((event) => event.ph === "M" && event.name === "thread_name" && event.args?.name === "CrRendererMain");
  const main = new Set(named.map((event) => `${event.pid}:${event.tid}`));
  const onMain = events.filter((event) => main.has(`${event.pid}:${event.tid}`) && event.ph === "X" && typeof event.dur === "number");
  const tasks = onMain.filter((event) => event.name === "RunTask" || event.name === "ThreadControllerImpl::RunTask");
  const start = Math.min(...tasks.map((event) => event.ts));
  const end = Math.max(...tasks.map((event) => event.ts + event.dur));
  const worked = tasks.reduce((sum, event) => sum + event.dur, 0);
  const byName = new Map();
  for (const event of onMain) byName.set(event.name, (byName.get(event.name) ?? 0) + event.dur);
  const ms = (us) => Math.round(us / 1000);
  // A task's wall time (`dur`) against the time the thread was given the processor (`tdur`): the browser's throttling
  // emulation, like a machine too busy to run the page, stretches the first and not the second.
  const longest = tasks.reduce((most, event) => (event.dur > most.dur ? event : most), tasks[0]);
  return {
    windowMs: ms(end - start),
    tasks: tasks.length,
    tasksMs: ms(worked),
    tasksOnTheProcessorMs: ms(tasks.reduce((sum, event) => sum + (event.tdur ?? 0), 0)),
    longestTaskOnTheProcessorMs: ms(longest?.tdur ?? 0),
    idleBetweenTasksMs: ms(end - start - worked),
    longestTaskMs: ms(Math.max(...tasks.map((event) => event.dur))),
    byNameMs: Object.fromEntries([...byName].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([name, us]) => [name, ms(us)]))
  };
}
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
const rows = () => page.$$eval("#by-line > li", (items) => items.slice(0, 12).map((item) => item.innerText.replace(/\s+/gu, " ").trim()));
const listLines = () => page.$eval("#list", (area) => area.value.split("\n").filter((line) => line.trim() && !line.trim().startsWith("#")).length);
const look = async (name) => {
  record[name] = { totals: await page.textContent("#totals"), listLines: await listLines(), blocks: await rows(), footer: await page.textContent("#timings") };
  await shot(name);
};
const scrollListToEnd = async () => page.$eval("#list", (area) => {
  area.scrollTop = area.scrollHeight;
  area.dispatchEvent(new Event("scroll"));
});

await page.goto(pathToFileURL(path.join(here, "choice.html")).href);
const given = Date.now();
// The made folder's 103,329 files take the browser over a minute to hand over, and longer on a loaded machine.
await page.setInputFiles("#folder-input", folder, { timeout: 360_000 });
await settled();
record.handedAndDecidedMs = Date.now() - given;
await page.waitForSelector("#offers .offer", { timeout: 120_000 });
record.offers = await page.$$eval("#offers .offer", (offers) => offers.map((offer) => offer.innerText.replace(/\s+/gu, " ").trim()));
record.found = await page.textContent("#found-what").catch(() => null);
await look("1-first");

// The offer of what the folders hold, taken from the list's empty place.
await page.click('#offers [data-offer="what-it-holds"]');
await settled();
await look("2-proposed");

// The ignore files found, added to the list.
if (await page.isVisible("#found")) {
  await page.click('[data-take="add"]');
  await settled();
  record.foundSaid = await page.textContent("#found-said");
  await look("3-added");
} else record.absent.push("a notice of ignore files found");

// GitHub's Visual Studio list, from the tool above the list, and its block opened: its lines that act, largest first.
await page.click("#prefill");
await page.click('[data-prefill="visual-studio"]');
await settled();
const visualStudio = page.locator("#by-line > li.block", { hasText: "Visual Studio's list" });
record.codeSigns = await page.$$eval("#by-line .code-sign", (signs) => signs.map((sign) => sign.getAttribute("aria-label")));
if (await visualStudio.count()) {
  await visualStudio.locator(".twisty").first().click();
  record.visualStudioLines = await visualStudio.locator(".members > li").evaluateAll((items) => items.slice(0, 12).map((item) => item.innerText.replace(/\s+/gu, " ").trim()));
  await visualStudio.first().evaluate((row) => row.scrollIntoView({ block: "start" }));
} else record.absent.push("a block for the Visual Studio list");
await look("4-visual-studio-opened");

// How long an edit takes to show: a line typed at the end of the list, at full speed, then with the processor slowed.
// Timed in the page itself, from the input event to the end of drawing the answer, the 400 ms pause for typing included.
const edit = async (line) => {
  await page.evaluate(() => {
    window.choicePage.state.lastEditShownMs = undefined;
  });
  await page.$eval("#list", (area, added) => {
    area.value = `${area.value.replace(/\s+$/u, "")}\n${added}\n`;
    area.dispatchEvent(new Event("input"));
  }, line);
  await page.waitForFunction(() => window.choicePage.state.lastEditShownMs !== undefined, undefined, { timeout: 120_000 });
  return {
    untilShownMs: await page.evaluate(() => window.choicePage.state.lastEditShownMs),
    decidedMs: await page.evaluate(() => Math.round(window.choicePage.state.result.timings.decideMs)),
    walkedMs: await page.evaluate(() => Math.round(window.choicePage.state.result.shownAfterMs)),
    countedMs: await page.evaluate(() => Math.round(window.choicePage.state.result.timings.countMs)),
    drawMs: await page.evaluate(() => window.choicePage.state.drawTimes)
  };
};
// How long an edit takes to show, on a run of its own (`timing`), so that no picture holds the lines it types: a line
// added at the end of the list, at full speed, then with the processor slowed four times on two cores, that edit traced
// by Chromium's own tracing and its main thread's time summed by kind of work.
if (mode === "timing") {
  record.editFullSpeed = await edit("/timing-line-at-full-speed/");
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Emulation.setHardwareConcurrencyOverride", { hardwareConcurrency: 2 });
  await browser.startTracing(page, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "v8", "blink"] });
  record.editSlowedFourTimesOnTwoCores = await edit("/timing-line-slowed/");
  const trace = JSON.parse((await browser.stopTracing()).toString("utf8"));
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  record.trace = summarize(trace.traceEvents ?? trace);
  record.errors = errors;
  fs.writeFileSync(path.join(out, `${label}-timing-record.json`), `${JSON.stringify(record, null, 1)}\n`);
  console.log(JSON.stringify({ label, editFullSpeed: record.editFullSpeed, editSlowed: record.editSlowedFourTimesOnTwoCores, trace: record.trace }, null, 1));
  await browser.close();
  process.exit(0);
}

// A kind and a folder left out by their minus: each a line in the block "Yours" at the end of the list.
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
await page.evaluate(() => {
  document.querySelector("main").scrollTop = 0;
});
await scrollListToEnd();
record.listEnd = await page.$eval("#list", (area) => area.value.trimEnd().split("\n").slice(-4));
await look("5-minus");

// A list tool's name, shown on keyboard focus.
await page.focus("#prefill");
await page.keyboard.press("Tab");
record.focusedTool = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
await shot("6-tool-named");

record.errors = errors;
fs.writeFileSync(path.join(out, `${label}-record.json`), `${JSON.stringify(record, null, 1)}\n`);
console.log(JSON.stringify({ label, absent: record.absent, errors, editFullSpeed: record.editFullSpeed, editSlowed: record.editSlowedFourTimesOnTwoCores }, null, 1));
await browser.close();

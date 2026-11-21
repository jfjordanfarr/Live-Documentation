#!/usr/bin/env node
// The page's checks of editing the list, each failing loudly (exit 1) where the page goes wrong:
// 1. Typing that goes on while a decision is in flight comes through whole. The processor is slowed eight times so
//    that a decision takes seconds whatever the machine's load: lines are typed at 25 ms a key, a pause of 500 ms lets
//    the page take the text in and begin deciding, and more lines are typed while it decides. The field must end
//    holding every key, in order, and the list must end as the field.
// 2. Undo takes the list and the notice back together: the folders' offer, Replace, Add, then one undo shows the
//    replaced list and the notice of Replace; a second shows the offer's list and the notice's first three choices.
// 3. The offers stay put: after one is taken, a press elsewhere (a folder opened under "Will be read") leaves both
//    offers where they were, and so does taking the second, though its list brings a note.
// 4. What looks like the team's own code is told apart from downloaded packages, on its row, first in its line, and in
//    the top line, said of the files left out.
// Through the browser lane, the page built first:
//   node check-edits.mjs <folder with ignore files found, as the strangers' nested folder>
import { chromium } from "@playwright/test";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [folder] = process.argv.slice(2);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const failures = [];
const check = (name, ok, detail) => {
  console.log(`${ok ? "pass" : "FAIL"}  ${name}${ok ? "" : `: ${detail}`}`);
  if (!ok) failures.push(name);
};
const settled = async () => page.waitForFunction(() => document.getElementById("progress").textContent === "" && !document.getElementById("choice").hidden, undefined, { timeout: 300_000 });
const list = () => page.evaluate(() => window.choicePage.state.list);
const notice = async () => ({ what: await page.textContent("#found-what"), choices: await page.$$eval("#found-choices button", (buttons) => buttons.map((button) => button.textContent)) });

await page.goto(pathToFileURL(path.join(here, "choice.html")).href);
await page.setInputFiles("#folder-input", folder, { timeout: 360_000 });
await settled();
await page.waitForSelector('#offers [data-offer="what-it-holds"]', { timeout: 120_000 });
await page.click('#offers [data-offer="what-it-holds"]');
await settled();

// 3. The offers stay put after a press elsewhere.
const offersBefore = await page.$$eval("#offers .offer", (offers) => offers.map((offer) => offer.getBoundingClientRect().top));
await page.click('#read [aria-label="Open DNN Platform"]');
const offersAfter = await page.$$eval("#offers .offer", (offers) => offers.filter((offer) => offer.offsetParent !== null).map((offer) => offer.getBoundingClientRect().top));
check("the offers stay where they were after a press elsewhere", JSON.stringify(offersAfter) === JSON.stringify(offersBefore), `before ${JSON.stringify(offersBefore)}, after ${JSON.stringify(offersAfter)}`);
// Nor does the other offer move when one is taken, though its list brings notes of its own (GitHub's Visual Studio list
// has three `!` lines that cannot keep what they name here).
const beforeSecond = await page.$$eval("#offers .offer", (offers) => offers.map((offer) => offer.getBoundingClientRect().top));
await page.click('#offers [data-offer="visual-studio"]');
await settled();
const afterSecond = await page.$$eval("#offers .offer", (offers) => offers.map((offer) => offer.getBoundingClientRect().top));
check("nor when the second is taken and its notes appear", JSON.stringify(afterSecond) === JSON.stringify(beforeSecond) && await page.isVisible("#notes"), `before ${JSON.stringify(beforeSecond)}, after ${JSON.stringify(afterSecond)}`);
await page.click("#undo");
await settled();

// 2. Undo takes the list and the notice back together.
const offered = await list();
await page.click('#found-choices [data-take="use"]');
await settled();
const replaced = await list();
const replacedNotice = await notice();
await page.click('#found-choices [data-take="add"]');
await settled();
await page.click("#undo");
await settled();
const once = { list: await list(), notice: await notice() };
check("one undo after Replace then Add shows the replaced list", once.list === replaced, `${once.list.length} characters, not ${replaced.length}`);
check("and the notice of Replace with it", JSON.stringify(once.notice) === JSON.stringify(replacedNotice), `${JSON.stringify(once.notice)} against ${JSON.stringify(replacedNotice)}`);
await page.click("#undo");
await settled();
const twice = { list: await list(), notice: await notice() };
check("a second undo shows the offer's list", twice.list === offered, `${twice.list.length} characters, not ${offered.length}`);
check("and the notice's three first choices", twice.notice.choices.length === 3 && twice.notice.what.startsWith("Found"), JSON.stringify(twice.notice));

// 1. Typing goes on while a decision is in flight.
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 8 });
await page.click("#list");
await page.keyboard.press("Control+End");
const first = "\ndist/\nbuild/";
const second = "\n# build output and downloaded packages\nnode_modules/\npackages/";
await page.keyboard.type(first, { delay: 25 });
await page.waitForTimeout(500);
await page.keyboard.type(second, { delay: 25 });
await page.waitForTimeout(500);
await settled();
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
const field = await page.$eval("#list", (area) => area.value);
check("every key typed while deciding is in the field, in order", field.endsWith(`${first}${second}`), JSON.stringify(field.slice(-90)));
check("and the list ends as the field", (await list()) === field, "the list and the field differ");
check("and the field holds what was there before and what was typed", field === `${twice.list}${first}${second}`, JSON.stringify(field.slice(-90)));

// 4. What looks like the team's own code is told apart from downloaded packages: the folders' offer leaves out only
//    what the evidence calls build output or packages, so its lines show no sign; of the lines typed, `packages/` takes
//    the 11 `.cs` files of `Installer/Packages` as well and `build/` the 66 of the top `Build` folder (its Cake tasks),
//    as `evidence-split.ts` counts them apart from the page; the row says 11, its folder first when opened, and the
//    top line says the sum of the rows, of the files left out.
const ownCode = await page.evaluate(() => window.choicePage.state.result.lines.filter((group) => group.restCode > 0).map((group) => `${group.line.text} ${group.restCode}`));
check("of the offer's lines and those typed, packages/ and build/ leave out what looks like the team's own code, 11 and 66", JSON.stringify(ownCode.toSorted()) === JSON.stringify(["build/ 66", "packages/ 11"]), JSON.stringify(ownCode));
await page.click('#by-line [aria-label="Open What the folders hold"]');
const row = page.locator("#by-line .members > li").filter({ has: page.locator(".line-text", { hasText: /^packages\/$/u }) }).first();
check("its row shows the sign with 11", (await row.locator(":scope > .row .code-sign").textContent()) === "11", await row.locator(":scope > .row").textContent());
await row.locator(":scope > .row .twisty").click();
const firstMember = await page.locator("#by-line .members > li").filter({ has: page.locator(".line-text", { hasText: /^packages\/$/u }) }).first().locator(".members > li").first().textContent();
check("and opened, its first folder is the team's own", firstMember.includes("Installer/Packages") && firstMember.includes("11"), firstMember);
const totals = (await page.textContent("#totals")).replace(/\s+/gu, " ");
check("the top line says their sum, of the files left out", /files left out, 77 of which look like your own code/u.test(totals), totals);

await browser.close();
console.log(failures.length ? `${failures.length} failed` : "all passed");
process.exit(failures.length ? 1 : 0);

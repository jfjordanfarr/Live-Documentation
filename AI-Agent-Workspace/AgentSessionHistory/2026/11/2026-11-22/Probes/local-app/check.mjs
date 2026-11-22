// What automation can check of the local app probe, in headless Chromium. From the repository root:
//   node <this file> seal <scratch folder>       rewrites the page's Content-Security-Policy hashes after an edit
//   node scripts/browser-lane.mjs --label <who> -- node <this file> check <scratch folder>
// The check copies the page to three folders under the scratch folder, opens them from disk in one browser profile over
// two launches, and stands in for the folder and save pickers (which no automation can press) with the browser's own
// private file system and a recording writer. Prints one line per finding and exits 1 if any fails.
import { chromium } from "@playwright/test";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.join(here, "probe.html");
const [mode, scratchArg] = process.argv.slice(2);
if (!["seal", "check"].includes(mode) || (mode === "check" && !scratchArg)) {
  console.error("usage: node check.mjs seal | check <scratch folder>");
  process.exit(2);
}

const sha = (text) => `'sha256-${crypto.createHash("sha256").update(text, "utf8").digest("base64")}'`;
function inlineHashes(html) {
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
  const style = /<style>([\s\S]*?)<\/style>/.exec(html)[1];
  return { script: sha(script), style: sha(style) };
}
function sealed(html) {
  const { script, style } = inlineHashes(html);
  return html.replace(/script-src '[^']*'/, `script-src ${script}`).replace(/style-src '[^']*'/, `style-src ${style}`);
}

if (mode === "seal") {
  const before = fs.readFileSync(pagePath, "utf8");
  const after = sealed(before);
  fs.writeFileSync(pagePath, after);
  console.log(before === after ? "hashes already current" : "hashes rewritten");
  process.exit(0);
}

const scratch = path.resolve(scratchArg);
fs.rmSync(scratch, { recursive: true, force: true });
const dirs = { a: path.join(scratch, "copy-a"), b: path.join(scratch, "copy-b"), c: path.join(scratch, "copy-c-saved") };
for (const d of Object.values(dirs)) fs.mkdirSync(d, { recursive: true });
const source = fs.readFileSync(pagePath, "utf8");
fs.copyFileSync(pagePath, path.join(dirs.a, "probe.html"));
fs.copyFileSync(pagePath, path.join(dirs.b, "probe.html"));

// A folder of known shape: 3 files at its top, 6 folders of 5 files, each holding 4 folders of 5 files.
const TREE = "probe-tree-private-name";
const treeDir = path.join(scratch, TREE);
const shape = [];
for (let i = 0; i < 3; i += 1) shape.push(`top-${i}.txt`);
for (let i = 0; i < 6; i += 1) {
  for (let f = 0; f < 5; f += 1) shape.push(`d${i}/file-${f}.txt`);
  for (let j = 0; j < 4; j += 1) for (let f = 0; f < 5; f += 1) shape.push(`d${i}/e${j}/file-${f}.txt`);
}
for (const rel of shape) { fs.mkdirSync(path.dirname(path.join(treeDir, rel)), { recursive: true }); fs.writeFileSync(path.join(treeDir, rel), "x"); }
const expectFiles = shape.length; // 153
const expectFolders = 6 + 24;

const findings = [];
const check = (name, ok, detail = "") => { findings.push({ name, ok }); console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` -- ${detail}` : ""}`); };

check("the page's CSP hashes match its script and style", sealed(source) === source);

// Headless Chromium offers showDirectoryPicker but aborts it at once, Playwright cannot intercept it, and the browser's
// private file system (whose handles are real) is refused to a page on disk with a SecurityError. So the walk is given
// an in-memory folder that answers as a directory handle does; it cannot be kept in IndexedDB, which the page must say.
const pickerStandIns = (paths) => {
  const folder = (name) => ({ kind: "directory", name, children: new Map(), async *values() { for (const child of this.children.values()) yield child; } });
  const root = folder("probe-tree-private-name");
  for (const rel of paths) {
    const parts = rel.split("/");
    let dir = root;
    for (const part of parts.slice(0, -1)) { if (!dir.children.has(part)) dir.children.set(part, folder(part)); dir = dir.children.get(part); }
    dir.children.set(parts[parts.length - 1], { kind: "file", name: parts[parts.length - 1] });
  }
  window.showDirectoryPicker = async () => root;
  window.__saved = [];
  window.showSaveFilePicker = async (options) => ({
    name: options.suggestedName,
    createWritable: async () => ({ write: async (data) => { window.__saved.push(String(data)); }, close: async () => {} })
  });
};

const profile = path.join(scratch, "profile");
const pageUrls = new Set(Object.values(dirs).map((d) => pathToFileURL(path.join(d, "probe.html")).href));
const strayRequests = [];
const errors = [];

async function launch(dir) {
  const context = await chromium.launchPersistentContext(dir, { viewport: { width: 1280, height: 900 } });
  await context.addInitScript(pickerStandIns, shape);
  return context;
}
async function open(context, folder) {
  const page = context.pages()[0] || (await context.newPage());
  if (!page.__watched) {
    page.__watched = true;
    page.on("request", (r) => { if (!pageUrls.has(r.url())) strayRequests.push(r.url()); });
    page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`); });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  }
  await page.goto(pathToFileURL(path.join(folder, "probe.html")).href);
  await page.waitForSelector("html[data-ready=yes]");
  return page;
}
const text = (page, id) => page.locator(`#${id}`).innerText();

// First launch, copy A.
let context = await launch(profile);
let page = await open(context, dirs.a);
check("it says it was opened from a file on disk", (await text(page, "where-answer")) === "This page was opened from a file on disk.");
check("a first copy sees only itself", (await text(page, "copies-answer")).startsWith("This storage has seen only this copy."));
check("no folder is remembered before one is picked", (await text(page, "remember-answer")) === "No folder picked yet. Pick one in section 4.");
check("a shortcut target is offered for Edge", (await text(page, "target-edge")).includes(`--app="file://${path.join(dirs.a, "probe.html")}"`));

await page.setInputFiles("#older", treeDir);
await page.waitForFunction(() => document.getElementById("walk-answer").textContent.startsWith("Listed"));
const older = await text(page, "walk-answer");
check("the older folder input counts the folder", older.startsWith(`Listed ${expectFiles} files in ${expectFolders} folders,`), older);

const privateFs = await page.evaluate(async () => {
  try { await navigator.storage.getDirectory(); return "open"; } catch (error) { return `refused: ${error.name}`; }
});
console.log(`note the browser's private file system, to a page on disk: ${privateFs}`);
await page.evaluate(() => {
  window.__walkTexts = [];
  const answer = document.getElementById("walk-answer");
  new MutationObserver(() => window.__walkTexts.push(answer.textContent)).observe(answer, { childList: true, characterData: true, subtree: true });
});
await page.click("#pick");
await page.waitForFunction(() => / in [\d.]+ s\.$/.test(document.getElementById("walk-answer").textContent));
const lazy = await text(page, "walk-answer");
check("the lazy walk counts the same folder", lazy.startsWith(`Listed ${expectFiles} files in ${expectFolders} folders in `), lazy);
const seen = await page.evaluate(() => window.__walkTexts);
check("the walk showed progress in the owner's wording", seen.some((t) => /^Listing Files\.\.\. \(\d[\d,]*\)$/.test(t)), seen.slice(0, 2).join(" | "));
const notKept = await text(page, "remember-answer");
check("a folder that could not be kept is said so, not claimed as remembered", notKept.includes("would not let this page keep the folder (DataCloneError)"), notKept);

await page.click("#save");
await page.waitForFunction(() => window.__saved.length > 0);
const saved = (await page.evaluate(() => window.__saved)).join("");
fs.writeFileSync(path.join(dirs.c, "probe.html"), saved);
check("the saved copy keeps the page's script and style unchanged", JSON.stringify(inlineHashes(saved)) === JSON.stringify(inlineHashes(source)));
check("saving says where it went", (await text(page, "save-answer")).includes("saved a copy where you chose, as probe.html"));

const plain = await page.inputValue("#results");
check("the results leave out folder and file names", !plain.includes(TREE) && !plain.includes("copy-a") && !plain.includes(scratch), plain.split("\n")[0]);
await page.check("#names");
const named = await page.inputValue("#results");
check("ticking the box puts the names in", named.includes(TREE) && named.includes("copy-a"));
await page.uncheck("#names");
await page.click("#copy-results");
await page.waitForFunction(() => document.getElementById("results-status").textContent !== "");
check("copying the results reports itself", (await text(page, "results-status")) === "Copied.", await text(page, "results-status"));
const firstResults = plain;
await context.close();

// Second launch of the same profile: copy A again, then copy B from another folder, then the saved copy.
context = await launch(profile);
page = await open(context, dirs.a);
check("copy A's second launch is counted", (await text(page, "copies-list")).includes("2 launches"));
page = await open(context, dirs.b);
const seesFirst = await text(page, "copies-answer");
check("a copy at another path sees the first copy's storage", seesFirst.includes("opened before it from another folder: they share one storage"), seesFirst);
check("localStorage and IndexedDB agree", (await text(page, "copies-raw")).includes("localStorage and IndexedDB agree"));
const shotDesktop = path.join(here, "probe-desktop.png");
await page.screenshot({ path: shotDesktop, fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("no sideways scroll at 390 px", overflow <= 0, `${overflow}px`);
await page.screenshot({ path: path.join(here, "probe-narrow.png"), fullPage: true });
await page.setViewportSize({ width: 1280, height: 900 });
page = await open(context, dirs.c);
check("the saved copy opens from disk under its own policy", (await text(page, "copies-answer")).includes("share one storage") && (await text(page, "copies-list")).split("\n").length === 3);
const lastResults = await page.inputValue("#results");
await context.close();

// A fresh profile opening copy B: the marks belong to the profile, not to the file.
context = await launch(path.join(scratch, "profile-fresh"));
page = await open(context, dirs.b);
check("a fresh profile sees no other copy", (await text(page, "copies-answer")).startsWith("This storage has seen only this copy."));
await context.close();

check("no request left the page", strayRequests.length === 0, strayRequests.slice(0, 3).join(" "));
check("no console error, warning or page error", errors.length === 0, errors.slice(0, 3).join(" | "));
console.log("\nresults of the first launch, as copied:\n" + firstResults);
console.log("\nresults of the saved copy on the second launch:\n" + lastResults);
const failed = findings.filter((f) => !f.ok).length;
console.log(`\n${findings.length - failed} of ${findings.length} held`);
process.exit(failed ? 1 : 0);

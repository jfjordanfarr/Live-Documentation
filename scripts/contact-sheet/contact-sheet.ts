/// <reference lib="dom" />
/**
 * @file contact-sheet.ts
 * @description Draws one built Explorer bundle in a fixed list of views and writes every picture and one contact
 * sheet of them, labelled tiles on a single PNG, so that a palette can be judged across many views at once and the
 * same sheet drawn again in another palette set beside it (the owner, 2026-11-16: "We'd need to see that across a ton
 * of views"). A caller's hook runs on each fresh browser context before its page loads, which is where a saved palette
 * setting is put in place.
 *
 * ## Usage
 *
 * ```bash
 * npm run contact:sheet -- --bundle dist/explorer/samples/tidepool --preset tidepool --out AI-Agent-Workspace/tmp/contact-sheets/tidepool
 * npm run contact:sheet -- --bundle dist/explorer --preset repository --hook ./night-palette.mjs --label Night --out <dir>
 * npm run contact:sheet -- --bundle dist/explorer/samples/tidepool --preset tidepool --palette proposed --out <dir>
 * ```
 *
 * `--palette <name>` draws every view in one of the Explorer's palettes (`today`, `proposed`, `vividKinds`), the
 * viewer's saved setting written before each page loads, and names the sheet for it; `--marbles` draws every file as a
 * marble (the trial of 2026-11-17), the same way.
 *
 * A hook is a module whose default export is `async (context, view) => void`, given the Playwright browser context
 * and the view about to load (`{ name, title }`); it usually calls `context.addInitScript` to write local storage.
 */

import { chromium, type BrowserContext, type Page } from "@playwright/test";
import * as fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { isPaletteName, PALETTES } from "../../packages/explorer/src/client/palette";
import { compressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { localMapStill } from "../../tests/e2e/still-picture";
import { optionValue, runCommand, UsageError } from "../live-docs/cli";

const ORIGIN = "http://sheet.local";
const VIEWPORT = { width: 1440, height: 900 };

/** What a subject opens and pins: a directory whose closed children show their make-up, and a file that has tests. */
interface Subject {
  directory: string;
  pinned: string;
}

/** The three subjects of the colour pass of 2026-11-16. */
const PRESETS: Record<string, Subject> = {
  repository: { directory: "scripts", pinned: "packages/engine/src/live-docs/archetype.ts" },
  estate: { directory: "Portal", pinned: "PaymentService/PaymentService.cs" },
  tidepool: { directory: "", pinned: "src/pool.ts" }
};

/** The hook a caller passes, run on every fresh context before the view's page loads. */
export type ContactSheetHook = (context: BrowserContext, view: { name: string; title: string }) => Promise<void> | void;

interface Shot {
  name: string;
  title: string;
  /** An element to picture alone, such as a key; the whole page otherwise. */
  selector?: string;
}

interface View {
  name: string;
  title: string;
  /** The address under the bundle, from `?`. */
  address: string;
  /** Before the page loads, after the caller's hook: settings this view needs in local storage. */
  storage?: Record<string, unknown>;
  /** What to do once the page has loaded, before the pictures. */
  act?: (page: Page) => Promise<void>;
  rest: "2d" | "3d" | "page";
  shots?: Shot[];
}

interface Bundle {
  hasBoard: boolean;
  historyCommit?: { id: string; subject: string; touched: number };
}

const snapshot = (overrides: Partial<UrlStateSnapshot>): string =>
  `?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, filters: { showTests: true, showAssets: true }, ...overrides })}`;

const press = async (page: Page, name: string, times: number): Promise<void> => {
  const button = page.getByRole("button", { name, exact: true });
  for (let i = 0; i < times && await button.isEnabled(); i++) {
    await button.click();
    await localMapStill(page);
  }
};

const check = async (page: Page, name: string): Promise<void> => {
  const box = page.getByRole("checkbox", { name, exact: true });
  if (!await box.isChecked()) await box.check();
};

/** The fixed list of views, as the brief of 2026-11-16 names them; those the bundle cannot show are left out. */
function viewsOf(subject: Subject, bundle: Bundle): View[] {
  const directory = { openDirectories: new Set([subject.directory]) };
  const pinned = { selectedNodeId: subject.pinned };
  const views: View[] = [
    { name: "2d-directory-reading", title: `2D, ${subject.directory || "the root"} open, reading look`, address: snapshot(directory), rest: "2d",
      shots: [{ name: "2d-directory-reading", title: `2D, ${subject.directory || "the root"} open, reading look` }, { name: "2d-key", title: "2D key", selector: "#map-legend" }] },
    { name: "2d-directory-out-3", title: "2D, three presses out", address: snapshot(directory), rest: "2d", act: page => press(page, "Zoom Out", 3) },
    { name: "2d-directory-out-full", title: "2D, fully zoomed out", address: snapshot(directory), rest: "2d", act: page => press(page, "Zoom Out", 40) },
    { name: "2d-pinned", title: `2D, ${path.posix.basename(subject.pinned)} pinned`, address: snapshot(pinned), rest: "2d" },
    { name: "3d-start", title: "3D at its start", address: snapshot({ perspective: "3d" }), rest: "3d",
      shots: [{ name: "3d-start", title: "3D at its start" }, { name: "3d-key", title: "3D key", selector: "#map-legend" }] },
    { name: "3d-pinned", title: `3D, ${path.posix.basename(subject.pinned)} pinned`, address: snapshot({ perspective: "3d", ...pinned }), rest: "3d" },
    { name: "3d-structure-docs", title: "3D Structure, assets and both kinds of docs", address: snapshot({ perspective: "3d", spatialLayout: "structure" }), rest: "3d",
      act: async page => {
        for (const name of ["Show Assets", "Show Related Docs", "Show Citing Docs"]) await check(page, name);
      } }
  ];
  if (bundle.historyCommit) {
    const commit = bundle.historyCommit;
    const step = snapshot({ perspective: "3d", commit: commit.id });
    for (const mode of ["dim", "glow"] as const) {
      views.push({ name: `history-${mode}`, title: `History, ${mode === "dim" ? "Dim" : "Glow"}: ${commit.subject} (${commit.touched} files)`, address: step, rest: "3d",
        storage: { tuning: { history: { changeEmphasis: mode } } } });
    }
  }
  if (bundle.hasBoard) {
    views.push({ name: "world-light", title: "World Map, light", address: "?view=world", rest: "page" });
    views.push({ name: "world-dark", title: "World Map, dark", address: "?view=world", rest: "page", act: page => page.getByRole("button", { name: "Dark board" }).click() });
  }
  views.push({ name: "reader", title: `Reader on ${path.posix.basename(subject.pinned)}`, rest: "2d",
    address: snapshot({ ...pinned, inspection: { kind: "file", nodeId: subject.pinned } }) });
  views.push({ name: "sources", title: "Knowledge Sources", address: "?view=sources", rest: "page" });
  return views;
}

/**
 * What the bundle can show: whether it has a board, and of its history the step among the last hundred that changed
 * the most files, the latest among equals, a step worth looking at.
 */
async function readBundle(bundleDir: string): Promise<Bundle> {
  const data = JSON.parse(await fs.readFile(path.join(bundleDir, "explorer-data.json"), "utf8")) as { history?: { file: string }; board?: unknown };
  const bundle: Bundle = { hasBoard: Boolean(data.board) };
  if (data.history) {
    const sequence = JSON.parse(await fs.readFile(path.join(bundleDir, data.history.file), "utf8")) as { steps: Array<{ commit: { id: string; subject: string }; delta: { touched?: unknown[] } }> };
    let best: Bundle["historyCommit"];
    for (const step of sequence.steps.slice(-100)) {
      const touched = step.delta.touched?.length ?? 0;
      if (!best || touched >= best.touched) best = { id: step.commit.id, subject: step.commit.subject, touched };
    }
    bundle.historyCommit = best;
  }
  return bundle;
}

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".map": "application/json", ".md": "text/markdown"
};

/** Answers the page's requests from the bundle on disk, under an origin of its own. */
async function serve(context: BrowserContext, bundleDir: string): Promise<void> {
  await context.route(`${ORIGIN}/**`, async route => {
    let file = path.join(bundleDir, decodeURIComponent(new URL(route.request().url()).pathname));
    try {
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html");
      await route.fulfill({ body: await fs.readFile(file), contentType: CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream" });
    } catch {
      await route.fulfill({ status: 404, body: "" });
    }
  });
}

/**
 * Merges this view's settings into the persisted UI the caller's hook may already have written. The script is given as
 * text: a function passed from here is compiled by tsx, which names its inner functions with a helper the page does not
 * have, and the script then failed in the page before writing anything (found 2026-11-17, when no setting reached a page).
 */
async function mergeStorage(context: BrowserContext, settings: Record<string, unknown>): Promise<void> {
  await context.addInitScript(`(() => {
    const key = ${JSON.stringify(PERSISTED_UI_KEY)};
    const merge = function (into, from) {
      for (const [k, v] of Object.entries(from)) into[k] = v && typeof v === "object" && !Array.isArray(v) ? merge(into[k] ?? {}, v) : v;
      return into;
    };
    let stored;
    try { stored = JSON.parse(window.localStorage.getItem(key) ?? "{}"); } catch { stored = {}; }
    window.localStorage.setItem(key, JSON.stringify(merge({ version: ${JSON.stringify(PERSISTED_UI_VERSION)}, ...stored }, ${JSON.stringify(settings)})));
  })();`);
}

async function rest(page: Page, kind: View["rest"]): Promise<void> {
  if (kind === "2d") {
    await localMapStill(page);
  } else if (kind === "3d") {
    await page.waitForFunction(() => document.querySelector("#graph-svg")?.getAttribute("aria-busy") === "false", undefined, { timeout: 90_000 });
  }
  if (kind === "page") await page.waitForLoadState("networkidle");
  // The World Map and the panels fade in; a still taken at once caught the World Map under its veil.
  await page.waitForTimeout(kind === "2d" ? 600 : 1500);
}

interface Picture { name: string; title: string; file: string; error?: string }

/** The sheet itself is drawn by the browser: the pictures as tiles in a grid, each under its label. */
async function drawSheet(context: BrowserContext, pictures: Picture[], heading: string, file: string): Promise<void> {
  const tiles = await Promise.all(pictures.map(async picture => {
    const data = picture.error ? "" : (await fs.readFile(picture.file)).toString("base64");
    const body = picture.error ? `<div class="missing">${escape(picture.error)}</div>` : `<img src="data:image/png;base64,${data}">`;
    return `<figure><figcaption>${escape(picture.title)}</figcaption><div class="frame">${body}</div></figure>`;
  }));
  const page = await context.newPage();
  await page.setViewportSize({ width: 2000, height: 1000 });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    body { margin: 0; padding: 24px; background: #1b1d22; color: #e8e8ec; font: 15px/1.3 system-ui, sans-serif; width: 1952px; }
    h1 { font-size: 20px; margin: 0 0 16px; }
    .grid { display: grid; grid-template-columns: repeat(4, 476px); gap: 16px; }
    figure { margin: 0; }
    figcaption { margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .frame { width: 476px; height: 298px; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; outline: 1px solid #3a3d45; }
    .frame img { max-width: 100%; max-height: 100%; }
    .missing { color: #e9b86d; padding: 12px; }
  </style><h1>${escape(heading)}</h1><div class="grid">${tiles.join("")}</div>`);
  await page.locator("body").screenshot({ path: file });
  await page.close();
}

const escape = (text: string): string => text.replace(/[&<>"]/gu, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[ch]!);

interface Options { bundle: string; out: string; preset?: string; directory?: string; pinned?: string; hook?: string; label: string; only?: string[]; palette?: string; marbles?: boolean }

function parseArgs(args: string[]): Options {
  const options: Partial<Options> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--bundle") options.bundle = optionValue(args, ++i, arg);
    else if (arg === "--out") options.out = optionValue(args, ++i, arg);
    else if (arg === "--preset") options.preset = optionValue(args, ++i, arg);
    else if (arg === "--dir") options.directory = optionValue(args, ++i, arg);
    else if (arg === "--pin") options.pinned = optionValue(args, ++i, arg);
    else if (arg === "--hook") options.hook = optionValue(args, ++i, arg);
    else if (arg === "--label") options.label = optionValue(args, ++i, arg);
    else if (arg === "--only") options.only = optionValue(args, ++i, arg).split(",");
    else if (arg === "--palette") options.palette = optionValue(args, ++i, arg);
    else if (arg === "--marbles") options.marbles = true;
    else throw new UsageError(`${arg} is not an option. Options: --bundle --out --preset (${Object.keys(PRESETS).join(", ")}) --dir --pin --hook --label --only --palette (${Object.keys(PALETTES).join(", ")}) --marbles`);
  }
  if (options.palette !== undefined && !isPaletteName(options.palette)) throw new UsageError(`No palette ${options.palette}; the palettes are ${Object.keys(PALETTES).join(", ")}.`);
  options.label ??= `${options.palette ? `the ${options.palette} palette` : "Today's palette"}${options.marbles ? ", marbles on" : ""}`;
  if (!options.bundle || !options.out) throw new UsageError("Name the built bundle with --bundle and where to write with --out.");
  return options as Options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const preset = options.preset ? PRESETS[options.preset] : undefined;
  if (options.preset && !preset) throw new UsageError(`No preset ${options.preset}.`);
  const subject: Subject = { directory: options.directory ?? preset?.directory ?? "", pinned: options.pinned ?? preset?.pinned ?? "" };
  if (!subject.pinned) throw new UsageError("Name a file to pin with --pin, or a --preset.");
  const bundleDir = path.resolve(options.bundle);
  const out = path.resolve(options.out);
  await fs.mkdir(out, { recursive: true });
  const hook = options.hook ? (await import(pathToFileURL(path.resolve(options.hook)).href) as { default: ContactSheetHook }).default : undefined;
  const bundle = await readBundle(bundleDir);
  const allViews = viewsOf(subject, bundle);
  const views = allViews.filter(view => !options.only || options.only.includes(view.name));

  const browser = await chromium.launch();
  const pictures: Picture[] = [];
  try {
    for (const view of views) {
      const context = await browser.newContext({ viewport: VIEWPORT });
      try {
        await serve(context, bundleDir);
        if (hook) await hook(context, { name: view.name, title: view.title });
        if (options.palette || options.marbles) {
          await mergeStorage(context, { tuning: { appearance: { ...(options.palette ? { palette: options.palette } : null), ...(options.marbles ? { marbles: "on" } : null) } } });
        }
        if (view.storage) await mergeStorage(context, view.storage);
        const page = await context.newPage();
        await page.goto(`${ORIGIN}/${view.address}`);
        await rest(page, view.rest);
        if (view.act) {
          await view.act(page);
          await rest(page, view.rest);
        }
        for (const shot of view.shots ?? [{ name: view.name, title: view.title }]) {
          const file = path.join(out, `${shot.name}.png`);
          if (shot.selector) await page.locator(shot.selector).screenshot({ path: file });
          else await page.screenshot({ path: file });
          pictures.push({ name: shot.name, title: shot.title, file });
        }
        console.log(`${view.name}: drawn`);
      } catch (error) {
        const message = error instanceof Error ? error.message.split("\n")[0] : String(error);
        pictures.push({ name: view.name, title: view.title, file: "", error: `Not drawn: ${message}` });
        console.error(`${view.name}: ${message}`);
      } finally {
        await context.close();
      }
    }
    // With --only, the views not redrawn keep the pictures an earlier run left in the folder, so the sheet stays whole.
    const drawn = new Map(pictures.map(picture => [picture.name, picture]));
    const sheet: Picture[] = [];
    for (const view of allViews) {
      for (const shot of view.shots ?? [{ name: view.name, title: view.title }]) {
        const picture = drawn.get(shot.name) ?? drawn.get(view.name);
        const earlier = path.join(out, `${shot.name}.png`);
        if (picture) sheet.push(picture);
        else if (await fs.stat(earlier).then(() => true, () => false)) sheet.push({ name: shot.name, title: shot.title, file: earlier });
      }
    }
    const sheetContext = await browser.newContext();
    try {
      await drawSheet(sheetContext, [...new Set(sheet)], `${options.preset ?? path.basename(bundleDir)}, ${options.label}, ${VIEWPORT.width} by ${VIEWPORT.height}`, path.join(out, "sheet.png"));
    } finally {
      await sheetContext.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`Wrote ${pictures.filter(p => !p.error).length} pictures and the sheet to ${out}`);
}

runCommand("contact:sheet", main);

#!/usr/bin/env node
// A blind playtester's eyes and hands: an MCP server over stdio that drives one Chromium page and offers only what a
// person at a browser window has. Made on 2026-11-18 for the owner's blind UX tests, in which ever smaller Claude models
// try a visitor's task with keyboard, mouse and screenshots alone (AI-Agent-Workspace/scripts/playtest/README.md).
//
// Usage (started by playtest.mjs, never by hand, and always under the shared browser lock):
//   flock -s /tmp/live-docs-browser.lock node browser-window.mjs --start <url> --record <dir> [--after-each] [--max-actions 60]
//        [--open-history] [--hide-step-words] [--setting <group>.<name>=<value> ...]
//        [--hand-folder <dir> --hand-input <selector> [--ready <selector>]] [--press <selector> ...]
//
// For the narrative playtest (2026-11-19), --open-history has the harness press the map's History button before the
// tester begins, and --hide-step-words keeps the history's words about each commit off the screen (see setUp below).
//
// The tools are the whole of what a tester can do: look, point, click, drag, scroll, type, press. Nothing reads the
// page's DOM or accessibility tree for the tester, runs the tester's script, opens an address of its choosing or touches
// a file. `look` shows the page and, as a browser window does, its address and title. With --after-each every action
// also returns the picture of the page once it has come to rest; without it only `look` returns a picture.
//
// What the harness itself does that the tester cannot: it blocks every request that leaves the site's origin, dismisses
// dialogs and says what they said, follows a new tab if the page opens one, refuses downloads, and after each action
// reads the clipboard so that whoever judges the run sees what the page copied. Every action is written to the record
// folder in order: actions.jsonl, a picture after each in shots/, and clipboard.jsonl.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const option = (name, fallback = null) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const startUrl = option('--start');
const recordDir = option('--record');
const afterEach = args.includes('--after-each');
const maxActions = Number(option('--max-actions', '60'));
const openHistory = args.includes('--open-history');
const hideStepWords = args.includes('--hide-step-words');
// A viewer's Tuning choice made before the page first loads (2026-11-21): `--setting <group>.<name>=<value>`, repeatable,
// as `localMap.framing=follows`. It is written where the page keeps a viewer's choices, its saved interface state, and
// the setup checks that Tuning's own control for it (`#tuning-<name>`) shows the value.
const settings = args.flatMap((arg, i) => (arg === '--setting' ? [args[i + 1]] : [])).map((text) => {
  const match = /^(\w+)\.(\w+)=(.+)$/.exec(text ?? '');
  if (!match) { console.error(`--setting takes <group>.<name>=<value>, not ${text}`); process.exit(2); }
  return { group: match[1], name: match[2], value: match[3] };
});
// A folder handed to the page's file input before the tester begins (2026-11-21), as a person who chose one would have:
// `--hand-folder <dir> --hand-input <selector> [--ready <selector>]`, the ready element's words awaited, then rest.
// `--press <selector>` (repeatable) presses a control of the page in the same setup.
const handFolder = option('--hand-folder');
const handInput = option('--hand-input', 'input[type=file]');
const readySelector = option('--ready');
const presses = args.flatMap((arg, i) => (arg === '--press' ? [args[i + 1]] : []));
const SAVED_INTERFACE_KEY = 'live-docs-explorer:ui:v2'; // PERSISTED_UI_KEY in packages/explorer/src/client/persistence/local-storage.ts
const viewport = { width: 1280, height: 800 }; // under the size at which the API scales a picture, so x, y stay page pixels
if (!startUrl || !recordDir) {
  console.error('usage: browser-window.mjs --start <url> --record <dir> [--after-each] [--max-actions N]');
  process.exit(2);
}
const origin = new URL(startUrl).origin;
fs.mkdirSync(path.join(recordDir, 'shots'), { recursive: true });
const actionsLog = fs.createWriteStream(path.join(recordDir, 'actions.jsonl'), { flags: 'a' });
const clipboardLog = fs.createWriteStream(path.join(recordDir, 'clipboard.jsonl'), { flags: 'a' });
const began = Date.now();

let browser, context, page;
let actionCount = 0;
let lastClipboard = '';
let lastShot = { data: null, file: null };
let pointer = null;
const pending = []; // what happened outside the tester's action that a person would have noticed
const blocked = [];

async function open() {
  // A run has one setup. Claude Code starts a window again after one exits; if this run's setup already failed, the new
  // window ends at once, before it can set the page up and overwrite the record of the failure.
  try {
    if (JSON.parse(fs.readFileSync(path.join(recordDir, 'setup.json'), 'utf8')).ok === false) process.exit(1);
  } catch { /* no setup yet */ }
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ viewport, deviceScaleFactor: 1, acceptDownloads: false });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(origin + '/') || url === origin) return route.continue();
    if (url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    blocked.push(url);
    return route.abort('blockedbyclient');
  });
  if (hideStepWords) {
    // Harness-side styling, before the page's own code runs and on every load: the history's words about a commit are
    // not drawn (the step panel, its dialog and toggle, and the subjects in the commit finder's results), so that the
    // tester has the picture, the ticks, the dates and the names on the map. The page's policy admits inline styles.
    await context.addInitScript((css) => {
      const add = () => { const style = document.createElement('style'); style.textContent = css; document.head.append(style); };
      if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
    }, HIDDEN_WORDS_CSS);
  }
  if (settings.length) {
    // Once a tab, before the page's own code first runs: a later load keeps whatever the page has saved since.
    await context.addInitScript(({ key, settings: chosen }) => {
      if (sessionStorage.getItem('playtest-settings-written')) return;
      const tuning = {};
      for (const { group, name, value } of chosen) (tuning[group] ??= {})[name] = value;
      localStorage.setItem(key, JSON.stringify({ version: 2, tuning }));
      sessionStorage.setItem('playtest-settings-written', '1');
    }, { key: SAVED_INTERFACE_KEY, settings });
  }
  page = await context.newPage();
  watch(page);
  context.on('page', (opened) => { watch(opened); page = opened; pending.push('A new tab opened and is now in front.'); });
  await page.goto(startUrl, { waitUntil: 'load', timeout: 60000 });
  await rest(15000);
  if (openHistory || settings.length || handFolder || presses.length) await setUp();
}

const HIDDEN_WORDS_CSS = '.history-step-panel, .history-step-dialog, .history-details, .history-step-more,'
  + ' .history-commit-result > span:not(.history-commit-meta) { display: none !important; }';

/**
 * Before the tester's first action, the harness checks that each --setting shows in Tuning's control for it, and under
 * --open-history opens the history with the map's own History button, as a setup the tester is told of, and checks that
 * the condition holds: the scrubber is open, and under --hide-step-words no step panel is drawn. The check goes to
 * setup.json; a setup that fails ends the window, so no tester works on the wrong page.
 */
async function setUp() {
  const check = {};
  if (handFolder) {
    check.handedFolder = { folder: path.basename(handFolder), input: handInput, ready: readySelector ?? null };
    try {
      const given = Date.now();
      await page.setInputFiles(handInput, handFolder, { timeout: 200000 });
      if (readySelector) {
        await page.waitForFunction((selector) => {
          const element = document.querySelector(selector);
          return Boolean(element && element.offsetParent !== null && element.textContent.trim());
        }, readySelector, { timeout: 200000 });
        check.handedFolder.readyText = (await page.textContent(readySelector)).trim();
      }
      check.handedFolder.ms = Date.now() - given;
      await rest(15000);
      check.handedFolder.ok = true;
    } catch (error) {
      check.handedFolder.ok = false;
      check.error = String(error?.message ?? error).split('\n')[0];
    }
  }
  if (presses.length && !check.error) {
    check.pressed = [];
    for (const selector of presses) {
      const done = await page.locator(selector).first().click({ timeout: 15000 }).then(() => true, () => false);
      check.pressed.push({ selector, done });
      await rest(8000);
    }
  }
  if (settings.length) {
    check.settings = [];
    for (const { group, name, value } of settings) {
      const shown = await page.locator(`#tuning-${name}`).first().inputValue({ timeout: 5000 }).catch(() => null);
      check.settings.push({ setting: `${group}.${name}`, wanted: value, shown });
    }
  }
  if (openHistory) {
    Object.assign(check, { openedHistory: false, scrubberVisible: false, stepPanelVisible: null, hideStepWords });
    try {
      await page.getByRole('button', { name: 'History', exact: true }).first().click({ timeout: 15000 });
      check.openedHistory = true;
      await page.locator('.history-scrubber').first().waitFor({ state: 'visible', timeout: 30000 });
      check.scrubberVisible = true;
      await rest(8000);
      check.stepPanelVisible = await page.locator('.history-step-panel').first().isVisible().catch(() => false);
    } catch (error) {
      check.error = String(error?.message ?? error).split('\n')[0];
    }
  }
  check.ok = (!handFolder || check.handedFolder.ok) && (check.pressed ?? []).every((p) => p.done)
    && (check.settings ?? []).every((s) => s.shown === s.wanted)
    && (!openHistory || (check.scrubberVisible && (hideStepWords ? check.stepPanelVisible === false : check.stepPanelVisible === true)));
  fs.writeFileSync(path.join(recordDir, 'setup.json'), JSON.stringify(check, null, 2) + '\n');
  if (!check.ok) { console.error('setup failed:', JSON.stringify(check)); await browser.close(); process.exit(1); }
}

function watch(p) {
  p.on('dialog', async (dialog) => { pending.push(`A dialog said: ${dialog.message()}`); await dialog.dismiss().catch(() => {}); });
  p.on('download', (download) => { pending.push('The page offered a download; this window does not keep downloads.'); download.cancel().catch(() => {}); });
}

/** Wait until two pictures in a row are the same, or the limit passes. Says whether the page came to rest. */
async function rest(limitMs = 4000) {
  const until = Date.now() + limitMs;
  let previous = null;
  await page.waitForTimeout(120);
  while (Date.now() < until) {
    const shot = await page.screenshot({ type: 'png' }).catch(() => null);
    if (shot && previous && shot.equals(previous)) return { settled: true, shot };
    previous = shot;
    await page.waitForTimeout(200);
  }
  return { settled: false, shot: previous ?? await page.screenshot({ type: 'png' }) };
}

/** The harness reads the clipboard for the judge; the tester learns of it only as a person would, from the page. */
async function readClipboard(n) {
  const text = await page.evaluate(() => navigator.clipboard.readText().catch(() => null)).catch(() => null);
  if (typeof text === 'string' && text !== lastClipboard) {
    lastClipboard = text;
    clipboardLog.write(JSON.stringify({ afterAction: n, at: new Date().toISOString(), text }) + '\n');
  }
}

const point = { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } }, required: ['x', 'y'] };
const modifiers = { type: 'array', items: { type: 'string', enum: ['Shift', 'Control', 'Alt', 'Meta'] }, description: 'Keys held during the action.' };
const tools = [
  { name: 'look', description: `See the browser window: a picture of the page (${viewport.width} by ${viewport.height} pixels, x to the right and y down from the top left), with the address and the tab's title.`,
    inputSchema: { type: 'object', properties: {} } },
  { name: 'point', description: 'Move the mouse pointer to x, y and leave it there, as when hovering.', inputSchema: point },
  { name: 'click', description: 'Click at x, y.',
    inputSchema: { type: 'object', properties: { ...point.properties, button: { type: 'string', enum: ['left', 'right', 'middle'] },
      count: { type: 'integer', minimum: 1, maximum: 3, description: '2 for a double click.' }, modifiers }, required: ['x', 'y'] } },
  { name: 'drag', description: 'Press a mouse button at x1, y1, move to x2, y2 and release.',
    inputSchema: { type: 'object', properties: { x1: { type: 'number' }, y1: { type: 'number' }, x2: { type: 'number' }, y2: { type: 'number' },
      button: { type: 'string', enum: ['left', 'right', 'middle'] }, modifiers }, required: ['x1', 'y1', 'x2', 'y2'] } },
  { name: 'scroll', description: 'Turn the mouse wheel with the pointer at x, y. Positive dy scrolls down, positive dx right; 100 is about one notch.',
    inputSchema: { type: 'object', properties: { ...point.properties, dx: { type: 'number' }, dy: { type: 'number' }, modifiers }, required: ['x', 'y'] } },
  { name: 'type', description: 'Type text on the keyboard, into whatever has focus.',
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
  { name: 'press', description: 'Press a key or a combination, for example Enter, Escape, Tab, Shift+Tab, ArrowDown, Backspace, Control+a.',
    inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] } }
];
// Each action says what it answers with, so that a tester does not look again after a picture it already has.
for (const tool of tools.slice(1)) {
  tool.description += afterEach ? ' Answers with a picture of the window, taken once the page has come to rest.' : ' Answers without a picture; look to see the result.';
}

async function hold(keys, action) {
  for (const key of keys ?? []) await page.keyboard.down(key);
  try { await action(); } finally { for (const key of [...(keys ?? [])].reverse()) await page.keyboard.up(key); }
}

const act = {
  look: async () => {},
  point: async ({ x, y }) => page.mouse.move(x, y, { steps: 4 }),
  click: async ({ x, y, button = 'left', count = 1, modifiers: keys }) => hold(keys, () => page.mouse.click(x, y, { button, clickCount: count, delay: 40 })),
  drag: async ({ x1, y1, x2, y2, button = 'left', modifiers: keys }) => hold(keys, async () => {
    await page.mouse.move(x1, y1, { steps: 3 });
    await page.mouse.down({ button });
    await page.mouse.move(x2, y2, { steps: 16 });
    await page.mouse.up({ button });
  }),
  scroll: async ({ x, y, dx = 0, dy = 0, modifiers: keys }) => hold(keys, async () => { await page.mouse.move(x, y, { steps: 2 }); await page.mouse.wheel(dx, dy); }),
  type: async ({ text }) => page.keyboard.type(String(text), { delay: 25 }),
  press: async ({ key }) => page.keyboard.press(String(key))
};

async function call(name, input) {
  if (!act[name]) return { isError: true, content: [{ type: 'text', text: `No such control: ${name}` }] };
  const n = ++actionCount;
  const at = new Date();
  if (n > maxActions) {
    actionsLog.write(JSON.stringify({ n, at: at.toISOString(), tool: name, args: input, refused: 'action limit' }) + '\n');
    return { content: [{ type: 'text', text: 'Your time with the window is over. Give your answer now from what you have seen.' }] };
  }
  let failure = null;
  try { await act[name](input ?? {}); } catch (error) { failure = String(error?.message ?? error).split('\n')[0]; }
  if (!failure && input) {
    if (Number.isFinite(input.x) && Number.isFinite(input.y)) pointer = { x: input.x, y: input.y };
    if (Number.isFinite(input.x2) && Number.isFinite(input.y2)) pointer = { x: input.x2, y: input.y2 };
  }
  const { settled, shot } = await rest(name === 'look' ? 1500 : 4000);
  const address = page.url();
  const title = await page.title().catch(() => '');
  await readClipboard(n);
  // A picture the same as the last one written is named, not written again (a look after an action is usually one).
  let file = lastShot.file;
  if (!lastShot.data || !shot.equals(lastShot.data)) {
    file = `shots/${String(n).padStart(3, '0')}-${name}.png`;
    fs.writeFileSync(path.join(recordDir, file), shot);
    lastShot = { data: shot, file };
  }
  const notes = pending.splice(0);
  actionsLog.write(JSON.stringify({ n, at: at.toISOString(), elapsedMs: Date.now() - began, tool: name, args: input ?? {}, settled,
    address, title, shot: file, notes, failure, blocked: blocked.splice(0) }) + '\n');
  const lines = [];
  if (failure) lines.push(`That did not work: ${failure}`);
  lines.push(...notes);
  const showPicture = name === 'look' || afterEach;
  if (showPicture) {
    // A headless picture has no pointer drawn in it; a person always sees theirs, so it is said in words.
    lines.push(`Address: ${address}`, `Title: ${title}`, pointer ? `Pointer: ${pointer.x}, ${pointer.y}` : 'Pointer: not yet over the page');
    if (!settled) lines.push('The page was still moving when this picture was taken.');
  } else if (!failure) lines.push('Done.');
  const content = [{ type: 'text', text: lines.join('\n') }];
  if (showPicture) content.push({ type: 'image', data: shot.toString('base64'), mimeType: 'image/png' });
  return { content };
}

// JSON-RPC 2.0 over stdio, one message a line: the small part of MCP a client needs for tools.
const send = (message) => process.stdout.write(JSON.stringify(message) + '\n');
const ready = open().catch((error) => { console.error('could not open the page:', error); process.exit(1); });
let queue = Promise.resolve();
readline.createInterface({ input: process.stdin }).on('line', (line) => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  queue = queue.then(() => handle(message)).catch((error) => console.error(error));
}).on('close', async () => { await queue; await browser?.close().catch(() => {}); actionsLog.end(); clipboardLog.end(); process.exit(0); });

async function handle({ id, method, params }) {
  if (id === undefined) return; // notifications need no answer
  if (method === 'initialize') {
    return send({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion ?? '2025-06-18',
      capabilities: { tools: {} }, serverInfo: { name: 'window', version: '1.0.0' } } });
  }
  if (method === 'ping') return send({ jsonrpc: '2.0', id, result: {} });
  if (method === 'tools/list') return send({ jsonrpc: '2.0', id, result: { tools } });
  if (method === 'tools/call') {
    await ready;
    return send({ jsonrpc: '2.0', id, result: await call(params?.name, params?.arguments) });
  }
  send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
}

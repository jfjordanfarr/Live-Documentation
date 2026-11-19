#!/usr/bin/env node
// A blind playtester's eyes and hands: an MCP server over stdio that drives one Chromium page and offers only what a
// person at a browser window has. Made on 2026-11-18 for the owner's blind UX tests, in which ever smaller Claude models
// try a visitor's task with keyboard, mouse and screenshots alone (AI-Agent-Workspace/scripts/playtest/README.md).
//
// Usage (started by playtest.mjs, never by hand, and always under the shared browser lock):
//   flock -s /tmp/live-docs-browser.lock node browser-window.mjs --start <url> --record <dir> [--after-each] [--max-actions 60]
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
  page = await context.newPage();
  watch(page);
  context.on('page', (opened) => { watch(opened); page = opened; pending.push('A new tab opened and is now in front.'); });
  await page.goto(startUrl, { waitUntil: 'load', timeout: 60000 });
  await rest(15000);
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

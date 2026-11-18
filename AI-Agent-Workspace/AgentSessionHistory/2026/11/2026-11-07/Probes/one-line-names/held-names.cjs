// Walk a 2D Local Map subject out one Zoom Out press at a time on a served bundle (a fresh visitor's settings, the
// background search off, as the suite keeps it) and, at each press, read every card's held file name as drawn: the
// lines its band and step's attribute holds, and whether the name stands whole on the first line beside the node's
// buttons, whole on a line below them, cut with an ellipsis, or on more than one line (the bundles before 2026-11-07).
// Prints one line a press and writes the reading as JSON, with pictures at chosen presses. An injected stylesheet
// (CSS, a file) pictures an alternative without changing the product.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapSettled, localMapStill } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const { choose } = require(path.join(root, 'tests/e2e/search-bar.ts'));
const subject = process.env.SUBJECT || 'tests/e2e/still-picture.ts';
const name = process.env.NAME || path.basename(subject).replace(/\.[^.]+$/, '');
const base = process.env.BASE || 'http://127.0.0.1:8911/';
// How the subject is retained: "none" (the subject alone), "whole" (pinned whole by address), "search" (typed in the
// search and chosen, as a person pins a file, and the address that gives loaded afresh), or "symbol:<name>" (that row's
// Pin pressed at reading scale).
const pin = process.env.PIN || 'none';
const out = process.env.OUT; const width = Number(process.env.W || 1440), height = Number(process.env.H || 960);
const shots = process.env.SHOTS === 'all' ? null : new Set((process.env.SHOTS || '').split(',').filter(Boolean).map(Number));
const css = process.env.CSS ? fs.readFileSync(process.env.CSS, 'utf8') : null;
const address = (snapshot) => base + '?s=' + compressSnapshot({ ...DEFAULT_SNAPSHOT, view: 'map', perspective: '2d', selectedNodeId: subject, ...snapshot });

const read = () => {
  const map = document.querySelector('#map-container');
  const lod = map.dataset.lod, step = Number(map.dataset.step);
  const k = new DOMMatrix(getComputedStyle(document.querySelector('#map-viewport')).transform).a;
  const names = [];
  for (const card of document.querySelectorAll('#map-container .node-card')) {
    const held = card.querySelector('.local-file-name-held');
    if (!held || getComputedStyle(held).display === 'none') continue;
    const file = held.dataset.name || '';
    const lines = (held.getAttribute(`data-lines-${lod}-${step}`) || '').split('\n');
    const drawn = lines.map((text, index) => ({ text, index })).filter(line => line.text);
    let kind;
    if (drawn.length === 0) kind = 'none';
    else if (drawn.length > 1) kind = drawn.map(line => line.text).join('') === file ? 'two lines, whole' : 'two lines, cut';
    else if (drawn[0].text !== file) kind = drawn[0].index === 0 ? 'cut beside' : 'cut below';
    else kind = drawn[0].index === 0 ? 'whole beside' : 'whole below';
    // The header's order (the header round, 2026-11-08): how many lines the name stands on, whether whole, whether its
    // first line is empty, and where the node's drawn controls stand against the name's lines as drawn: on its last
    // line ("shared"), on the line after ("own line"), or with a line of the name below them ("above").
    const style = getComputedStyle(held), heldRect = held.getBoundingClientRect();
    const lineOnScreen = parseFloat(style.lineHeight) * new DOMMatrix(style.transform).a * k;
    const buttons = [...card.querySelectorAll('.local-card-actions button')].map(button => button.getBoundingClientRect()).filter(rect => rect.width > 0.05);
    const top = buttons.length ? Math.min(...buttons.map(rect => rect.top)) : null;
    const lastTop = heldRect.top + (lines.length - 1) * lineOnScreen;
    const controls = top === null ? 'none' : top < lastTop - 0.5 ? 'above' : top < lastTop + lineOnScreen - 0.5 ? 'shared' : 'own line';
    const order = { lines: drawn.length, whole: drawn.map(line => line.text).join('') === file, firstEmpty: !lines[0] && !!file, controls };
    names.push({ file, kind, lines: drawn.map(line => line.text), order });
  }
  return { k: +k.toFixed(4), lod, step, names };
};

// With an injected style that changes the node's buttons (RECHOOSE=1), each held name's line for the band and step shown
// is chosen again in the page by the product's one-line rule (held-lines.ts), in the room the buttons as drawn leave:
// the room's width and height as the stylesheet gives them, More's box as drawn with the product's 4 px of air.
const rechoose = () => {
  const map = document.querySelector('#map-container');
  const lod = map.dataset.lod, step = Number(map.dataset.step);
  if (lod !== 'far' && lod !== 'overview') return [];
  const k = new DOMMatrix(getComputedStyle(document.querySelector('#map-viewport')).transform).a;
  const canvas = document.createElement('canvas').getContext('2d');
  const rooms = [];
  for (const card of document.querySelectorAll('#map-container .node-card')) {
    const held = card.querySelector('.local-file-name-held'), more = card.querySelector('.local-file-more');
    if (!held || !more || getComputedStyle(held).display === 'none') continue;
    const style = getComputedStyle(held), scale = new DOMMatrix(style.transform).a, line = parseFloat(style.lineHeight);
    const at = held.getBoundingClientRect(), button = more.getBoundingClientRect();
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;width:0;height:calc(var(--title-room-h) * 1px)';
    held.parentElement.append(probe);
    const roomH = probe.offsetHeight; probe.remove();
    const width = parseFloat(style.width);
    const besideWidth = Math.max(0, ((button.left - at.left) / k - 4) / scale);
    const besideLines = Math.ceil(((button.bottom - at.top) / k + 4) / scale / line - 1e-6);
    const lines = Math.max(1, Math.floor(roomH / (line * scale) + 1e-6));
    canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const measure = text => canvas.measureText(text).width;
    const name = held.dataset.name || '';
    const beside = besideLines > 0 ? besideWidth : width, below = besideLines > 0 && besideLines < lines;
    const standingBelow = text => [...Array(besideLines).fill(''), text];
    let chosen;
    if (measure(name) <= beside) chosen = [name];
    else if (below && measure(name) <= width) chosen = standingBelow(name);
    else {
      const room = below ? width : beside; let text = name;
      while (text && measure(text + '…') > room) text = text.slice(0, -1);
      const cut = measure(text + '…') <= room ? text + '…' : '';
      chosen = below ? standingBelow(cut) : [cut];
    }
    held.setAttribute(`data-lines-${lod}-${step}`, chosen.join('\n'));
    rooms.push({ file: name, besideLines, lines, moreHeightInLines: +(button.height / k / scale / line).toFixed(2) });
  }
  return rooms;
};

(async () => {
  if (out) fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const fresh = async () => {
    const context = await browser.newContext({ viewport: { width, height } });
    // tsx keeps functions' names with a helper the page lacks, which the search's helper hands to the page.
    await context.addInitScript({ content: 'window.__name = (f) => f;' });
    await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
    return context;
  };
  let url = address(pin === 'whole' ? { pinSet: { entries: [{ nodeId: subject, symbol: '*' }] } } : {});
  if (pin === 'search') {
    const context = await fresh(); const page = await context.newPage();
    await page.goto(address({ selectedNodeId: null })); await localMapSettled(page);
    await choose(page, 'subject', path.basename(subject), { file: subject });
    await localMapSettled(page); await localMapStill(page);
    url = page.url(); await context.close();
  }
  const context = await fresh(); const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  await page.goto(url); await page.locator(`.node-card[data-id="${subject}"]`).waitFor(); await localMapSettled(page); await localMapStill(page);
  if (css) await page.addStyleTag({ content: css });
  if (pin.startsWith('symbol:')) {
    await page.locator(`.node-card[data-id="${subject}"] .symbol-row[data-symbol="${pin.slice(7)}"] .local-symbol-pin`).click();
    await localMapStill(page);
  }
  const presses = [];
  for (let press = 0; ; press += 1) {
    if (press > 0) {
      const zoomOut = page.getByRole('button', { name: 'Zoom Out', exact: true });
      if (await zoomOut.isDisabled()) break;
      await zoomOut.click(); await localMapSettled(page); await localMapStill(page);
    }
    const rooms = process.env.RECHOOSE ? await page.evaluate(rechoose) : null;
    const reading = await page.evaluate(read); reading.press = press;
    if (rooms) reading.rooms = rooms;
    presses.push(reading);
    if (out && (!shots || shots.has(press))) await page.screenshot({ path: path.join(out, `${name}-${String(press).padStart(2, '0')}-${reading.lod}-${reading.step}.png`) });
    // A second picture with the map dragged by PAN ("dx,dy", screen pixels, from FROM "x,y", an empty point of the map)
    // at the presses PANAT names, and dragged back, so that cards outside the arrival's frame can be seen.
    if (out && process.env.PAN && process.env.PANAT.split(',').map(Number).includes(press)) {
      const [dx, dy] = process.env.PAN.split(',').map(Number), [x, y] = (process.env.FROM || '400,800').split(',').map(Number);
      const drag = async (fromX, fromY, byX, byY) => { await page.mouse.move(fromX, fromY); await page.mouse.down(); await page.mouse.move(fromX + byX, fromY + byY, { steps: 12 }); await page.mouse.up(); await localMapStill(page); };
      await drag(x, y, dx, dy);
      if (process.env.RECHOOSE) await page.evaluate(rechoose);
      await page.screenshot({ path: path.join(out, `${name}-${String(press).padStart(2, '0')}-${reading.lod}-${reading.step}-panned.png`) });
      await drag(x + dx, y + dy, -dx, -dy);
    }
  }
  if (out) fs.writeFileSync(path.join(out, `${name}-held-names.json`), JSON.stringify({ subject, pin, url, viewport: { width, height }, errors, presses }, null, 1));
  console.log(`${name} (${pin}) ${url}`);
  for (const p of presses) {
    // ORDER=1 counts the header round's way (2026-11-08): whole on one line sharing it with the controls, whole on one
    // line with the controls alone below, whole on two lines or more, cut; and where the controls stand.
    const kindOf = n => process.env.ORDER ? (!n.order.whole ? 'cut' : n.order.lines > 1 ? 'whole on two or more' : n.order.controls === 'shared' ? 'whole on one line, shared' : 'whole on one line, alone') : n.kind;
    const count = {}; for (const n of p.names) count[kindOf(n)] = (count[kindOf(n)] || 0) + 1;
    const places = {}; if (process.env.ORDER) for (const n of p.names) places[n.order.controls] = (places[n.order.controls] || 0) + 1;
    const listed = p.names.filter(n => process.env.ORDER ? kindOf(n) !== 'whole on one line, shared' && kindOf(n) !== 'whole on one line, alone' : n.kind !== 'whole beside' && n.kind !== 'whole below').map(n => `${n.file}: ${n.lines.join(' / ') || '(nothing)'}`);
    console.log(`press ${String(p.press).padStart(2)} scale ${p.k} ${p.lod}/${p.step} | ${Object.entries(count).map(([kind, n]) => `${kind} ${n}`).join(', ') || 'no held names'}${Object.keys(places).length ? ' | controls ' + Object.entries(places).map(([place, n]) => `${place} ${n}`).join(', ') : ''}${listed.length ? ' | ' + listed.join('; ') : ''}`);
  }
  if (errors.length) console.log('page errors:', errors.slice(0, 5));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

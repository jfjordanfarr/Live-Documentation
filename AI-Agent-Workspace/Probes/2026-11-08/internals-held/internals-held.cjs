// Picture the Internals row of the 2D Local Map in the forms of the November 8 round (as built, H, C1, C2, C3), each an
// injected stylesheet present before the page's first render, so that the layout, the ladder's room measurement and the
// product's held-size rules all see it; no script changes the page's elements. A subject is walked out by the Zoom Out
// button one step a press, in a private headless Chromium (a fresh context a form) at 1440 x 960 and device scale 2, the
// background search off. At the chosen presses it saves a crop round the subject card's Internals dot, the whole frame
// or the frame after a drag, and reads the Internals row and a public row of the measured cards: the names' height on
// screen, their drawn type size, and how far the row's head stands outside the row's box, the dashed outline and the card's bottom border.
// Prints the reading and writes it as JSON; with COMPOSE, assembles the crops into the November 6 README's composites.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapSettled, localMapStill } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const { choose } = require(path.join(root, 'tests/e2e/search-bar.ts'));

const here = __dirname;
const FORMS = { 'as-built': [], 'H': ['h.css'], 'C1': ['h.css', 'c1.css'], 'C2': ['h.css', 'c1.css', 'c2.css'], 'C3': ['h.css', 'c1.css', 'c3.css'] };
const forms = (process.env.FORMS || Object.keys(FORMS).join(',')).split(',');
const subject = process.env.SUBJECT || 'packages/explorer/src/client/views/localView/card-factory.ts';
const name = process.env.NAME || path.basename(subject).replace(/\.[^.]+$/, '');
const base = process.env.BASE || 'http://127.0.0.1:8900/';
const pin = process.env.PIN || 'none';
const out = process.env.OUT; const width = Number(process.env.W || 1440), height = Number(process.env.H || 960);
const presses = (process.env.PRESSES || '0,3,6,8').split(',').map(Number);
// What is saved at each chosen press: "crop" (a window round the subject's Internals dot, sized by CROP_<press> as
// "w,h", or CROP as the default), "whole" (the frame) at the presses WHOLE names, "panned" (the frame after a drag of PAN
// "dx,dy" from FROM "x,y", an empty point of the map) at every chosen press. BOTTOM keeps a crop's foot that many
// pixels above the frame's, clear of the toolbar.
const shot = process.env.SHOT || 'crop';
const whole = new Set((process.env.WHOLE || '').split(',').filter(Boolean).map(Number));
// Other cards to measure beside the subject, by file path.
const measured = [subject, ...(process.env.MEASURE || '').split(',').filter(Boolean)];
const address = (snapshot) => base + '?s=' + compressSnapshot({ ...DEFAULT_SNAPSHOT, view: 'map', perspective: '2d', selectedNodeId: subject, ...snapshot });

// Appended at the end of the head as soon as the parser has reached the body, so that it follows the bundle's own
// stylesheet in the cascade and is in place before any script of the page runs.
const inject = (css) => {
  const place = () => { const style = document.createElement('style'); style.dataset.probe = 'internals-held'; style.textContent = css; document.head.append(style); };
  if (document.body) { place(); return; }
  const watch = new MutationObserver(() => { if (document.body) { watch.disconnect(); place(); } });
  watch.observe(document, { childList: true, subtree: true });
};

const read = (ids) => {
  const map = document.querySelector('#map-container');
  const k = new DOMMatrix(getComputedStyle(document.querySelector('#map-viewport')).transform).a;
  const r1 = (v) => Math.round(v * 10) / 10;
  const shown = (el) => el && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0;
  const nameOf = (row) => {
    const text = row.querySelector('.symbol-label-text');
    if (!text) return null;
    const rect = text.getBoundingClientRect(), scale = new DOMMatrix(getComputedStyle(text).transform).a || 1;
    return { text: text.textContent, drawn: shown(text) && shown(row.querySelector('.symbol-label-wrapper')), heightPx: r1(rect.height), typePx: r1(parseFloat(getComputedStyle(text).fontSize) * k * scale), nameScale: +scale.toFixed(3) };
  };
  const cards = [];
  for (const id of ids) {
    const card = document.querySelector(`#map-container .node-card[data-id="${CSS.escape(id)}"]`);
    if (!card) { cards.push({ id, missing: true }); continue; }
    const internals = card.querySelector('.symbol-row.internals-row');
    const publicRow = [...card.querySelectorAll('.symbol-row:not(.internals-row)')].find(row => getComputedStyle(row).display !== 'none');
    const entry = { id, publicName: publicRow ? nameOf(publicRow) : null };
    if (internals) {
      const row = internals.getBoundingClientRect(), outline = internals.querySelector('.internals-label').getBoundingClientRect();
      const parts = ['.symbol-label-text', '.local-symbol-pin', '.local-symbol-more', '.internals-anchor'].map(sel => internals.querySelector(sel)).filter(shown);
      const rects = parts.map(el => el.getBoundingClientRect());
      const over = (box) => rects.length ? {
        top: r1(Math.max(0, box.top - Math.min(...rects.map(r => r.top)))),
        bottom: r1(Math.max(0, Math.max(...rects.map(r => r.bottom)) - box.bottom)),
        right: r1(Math.max(0, Math.max(...rects.map(r => r.right)) - box.right))
      } : null;
      const anchor = internals.querySelector('.internals-anchor').getBoundingClientRect();
      entry.internals = {
        name: nameOf(internals), rowHeightPx: r1(row.height), rowHeightMap: internals.clientHeight,
        anchorPx: { w: r1(anchor.width), h: r1(anchor.height), aboveRow: r1(Math.max(0, row.top - anchor.top)), belowRow: r1(Math.max(0, anchor.bottom - row.bottom)) },
        // How far the drawn head (the name, Pin, More and the dot) stands outside the row's box, the dashed outline and the card's bottom border.
        overRow: over(row), overOutline: over(outline),
        // How far it stands below the inner edge of the card's bottom border.
        overCardBottom: rects.length ? r1(Math.max(0, Math.max(...rects.map(r => r.bottom)) - (card.getBoundingClientRect().bottom - parseFloat(getComputedStyle(card).borderBottomWidth) * k))) : null
      };
    }
    cards.push(entry);
  }
  return { k: +k.toFixed(4), lod: map.dataset.lod, step: Number(map.dataset.step), cards };
};

(async () => {
  if (out) fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const fresh = async (css) => {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
    await context.addInitScript({ content: 'window.__name = (f) => f;' });
    await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
    if (css) await context.addInitScript(inject, css);
    return context;
  };
  let url = address(pin === 'whole' ? { pinSet: { entries: [{ nodeId: subject, symbol: '*' }] } } : {});
  if (pin === 'search') {
    const context = await fresh(null); const page = await context.newPage();
    await page.goto(address({ selectedNodeId: null })); await localMapSettled(page);
    await choose(page, 'subject', path.basename(subject), { file: subject });
    await localMapSettled(page); await localMapStill(page);
    url = page.url(); await context.close();
  }
  const result = { subject, pin, url, base, viewport: { width, height, deviceScaleFactor: 2 }, forms: {} };
  for (const form of forms) {
    const css = FORMS[form].map(file => fs.readFileSync(path.join(here, file), 'utf8')).join('\n');
    const context = await fresh(css || null); const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url); await page.locator(`.node-card[data-id="${subject}"]`).waitFor(); await localMapSettled(page); await localMapStill(page);
    const injected = await page.evaluate(() => document.querySelectorAll('style[data-probe="internals-held"]').length);
    if (css && injected !== 1) throw new Error(`${form}: the stylesheet was not injected`);
    const readings = [];
    const last = Math.max(...presses);
    for (let press = 0; press <= last; press += 1) {
      if (press > 0) {
        const zoomOut = page.getByRole('button', { name: 'Zoom Out', exact: true });
        if (await zoomOut.isDisabled()) break;
        await zoomOut.click(); await localMapSettled(page); await localMapStill(page);
      }
      if (!presses.includes(press)) continue;
      const reading = await page.evaluate(read, measured); reading.press = press; readings.push(reading);
      if (!out) continue;
      const file = (suffix) => path.join(out, `${name}-${form}-${String(press).padStart(2, '0')}-${reading.lod}-${reading.step}${suffix}.png`);
      if (shot === 'crop') {
        const anchor = await page.locator(`.node-card[data-id="${subject}"] .internals-anchor`).boundingBox();
        const [w, h] = (process.env[`CROP_${press}`] || process.env.CROP || '560,330').split(',').map(Number);
        const x = Math.max(0, Math.min(width - w, anchor.x + anchor.width / 2 - 0.42 * w));
        const y = Math.max(0, Math.min(height - Number(process.env.BOTTOM || 0) - h, anchor.y + anchor.height / 2 - 0.70 * h));
        await page.screenshot({ path: file(''), clip: { x, y, width: w, height: h } });
      }
      if (whole.has(press)) await page.screenshot({ path: file('-whole') });
      if (shot === 'panned') {
        const [dx, dy] = (process.env.PAN || '-700,0').split(',').map(Number), [x, y] = (process.env.FROM || '400,800').split(',').map(Number);
        const drag = async (fromX, fromY, byX, byY) => { await page.mouse.move(fromX, fromY); await page.mouse.down(); await page.mouse.move(fromX + byX, fromY + byY, { steps: 12 }); await page.mouse.up(); await localMapStill(page); };
        await drag(x, y, dx, dy);
        reading.panned = await page.evaluate(read, measured);
        await page.screenshot({ path: file('-panned') });
        // Dragged back for the next press; after the last there is none (a drag that starts off the page, as one from
        // FROM + PAN can, selects the page's text instead of moving the map).
        if (press < last) await drag(x + dx, y + dy, -dx, -dy);
      }
    }
    result.forms[form] = { errors, readings };
    for (const r of readings) {
      const cells = r.cards.filter(c => !c.missing).map(c => {
        const i = c.internals;
        return `${path.basename(c.id)}: internals ${i ? `${i.name.drawn ? '' : '(not drawn) '}${i.name.heightPx}px type ${i.name.typePx}px x${i.name.nameScale} row ${i.rowHeightPx}px over row ${JSON.stringify(i.overRow)} over outline ${JSON.stringify(i.overOutline)} below card ${i.overCardBottom} square/dot ${JSON.stringify(i.anchorPx)}` : '-'} | public ${c.publicName ? `${c.publicName.text} ${c.publicName.drawn ? '' : '(not drawn) '}${c.publicName.heightPx}px type ${c.publicName.typePx}px` : '-'}`;
      });
      console.log(`${form} press ${r.press} ${r.lod}/${r.step} k ${r.k} | ${cells.join(' || ')}`);
    }
    if (errors.length) console.log(form, 'page errors:', errors.slice(0, 5));
    await context.close();
  }
  if (out) fs.writeFileSync(path.join(out, `${name}-readings-${presses.join("-")}.json`), JSON.stringify(result, null, 1));
  console.log(url);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

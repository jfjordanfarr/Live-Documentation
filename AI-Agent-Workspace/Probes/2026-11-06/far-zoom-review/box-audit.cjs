// Walk a 2D Local Map subject out one Zoom Out press at a time on the served bundle (default settings, as a fresh visitor
// sees it), and at each step measure what is drawn outside the box it belongs to: a card's parts against the card, a row's
// parts against the row, a card's ink against its neighbours, a directory's label against its membrane.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { localMapSettled, localMapStill } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const subject = process.env.SUBJECT || 'tests/e2e/still-picture.ts';
const name = process.env.NAME || 'still-picture';
const base = process.env.BASE || 'http://127.0.0.1:8900/';
const out = process.env.OUT; const maxSteps = Number(process.env.STEPS || 20);
const width = Number(process.env.W || 1440), height = Number(process.env.H || 960);
const shots = new Set((process.env.SHOTS || '0,2,4,5,6,7,8,9,10,12,14,99').split(',').map(Number));
const url = base + '?s=' + compressSnapshot({ ...DEFAULT_SNAPSHOT, view: 'map', perspective: '2d', selectedNodeId: subject });

const audit = id => {
  const container = document.querySelector('#map-container');
  const scale = new DOMMatrix(getComputedStyle(document.querySelector('#map-viewport')).transform).a;
  const shown = el => { const r = el.getBoundingClientRect(); if (r.width < 0.05 || r.height < 0.05) return null; const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return null; return r; };
  const over = (r, box) => ({ left: box.left - r.left, right: r.right - box.right, top: box.top - r.top, bottom: r.bottom - box.bottom });
  const worst = o => Object.entries(o).sort((a, b) => b[1] - a[1])[0];
  const parts = { title: '.local-file-name-text', nodeButtons: '.local-card-actions button', name: '.symbol-label-text', dot: '.symbol-anchor.dot', hub: '.symbol-anchor.hub', rowPin: '.local-symbol-pin', rowMore: '.local-symbol-more', badges: '.type-refs-indicator', internals: '.internals-row', tests: '.node-tests', path: '.node-path', directory: '.node-directory', counts: '.local-reading-counts', prose: '.local-reading-prose' };
  const result = { scale: +scale.toFixed(4), lod: container.dataset.lod, step: Number(container.dataset.step), cards: 0, byPart: {}, rowOverflow: {}, inkOverNeighbours: [], labels: [] };
  const cards = [...document.querySelectorAll('.node-card')].map(el => ({ el, r: el.getBoundingClientRect(), id: el.dataset.id }));
  result.cards = cards.length;
  const note = (bucket, key, px, side, where) => { const b = bucket[key] || (bucket[key] = { shown: 0, outside: 0, maxPx: 0, side: '', where: '' }); b.shown += 1; if (px > 1.5) b.outside += 1; if (px > b.maxPx) { b.maxPx = +px.toFixed(1); b.side = side; b.where = where; } };
  for (const card of cards) {
    let ink = { left: card.r.left, right: card.r.right, top: card.r.top, bottom: card.r.bottom };
    for (const [key, selector] of Object.entries(parts)) for (const el of card.el.querySelectorAll(selector)) {
      const r = shown(el); if (!r) continue;
      const [side, px] = worst(over(r, card.r));
      const row = el.closest('.symbol-row');
      note(result.byPart, key, px, side, card.id.split('/').pop() + (row ? ':' + row.dataset.symbol : ''));
      ink = { left: Math.min(ink.left, r.left), right: Math.max(ink.right, r.right), top: Math.min(ink.top, r.top), bottom: Math.max(ink.bottom, r.bottom) };
      if (row && ['name', 'dot', 'rowPin', 'rowMore'].includes(key)) {
        const rr = row.getBoundingClientRect(); const o = over(r, rr); const v = Math.max(o.top, o.bottom);
        note(result.rowOverflow, key, v, o.top > o.bottom ? 'top' : 'bottom', card.id.split('/').pop() + ':' + row.dataset.symbol);
      }
    }
    for (const other of cards) { if (other === card) continue;
      const w = Math.min(ink.right, other.r.right) - Math.max(ink.left, other.r.left), h = Math.min(ink.bottom, other.r.bottom) - Math.max(ink.top, other.r.top);
      if (w > 1.5 && h > 1.5) result.inkOverNeighbours.push({ card: card.id.split('/').pop(), over: other.id.split('/').pop(), w: +w.toFixed(1), h: +h.toFixed(1) });
    }
  }
  for (const m of document.querySelectorAll('.local-membrane')) {
    const shape = m.querySelector('.local-membrane-shape'); const label = m.querySelector('.local-directory-label'); if (!shape || !label) continue;
    const sr = shape.getBoundingClientRect(); const lr = shown(label); if (!lr) continue;
    const nm = m.querySelector('.local-directory-name'); const nr = nm ? nm.getBoundingClientRect() : lr;
    const [side, px] = worst(over(lr, sr));
    result.labels.push({ dir: (nm ? nm.textContent : '').trim().slice(0, 40), shapeW: +sr.width.toFixed(1), shapeH: +sr.height.toFixed(1), labelW: +lr.width.toFixed(1), labelH: +lr.height.toFixed(1), nameH: +nr.height.toFixed(1), outsidePx: +px.toFixed(1), side });
  }
  const subjectCard = cards.find(c => c.id === id);
  result.subject = subjectCard ? { x: subjectCard.r.left, y: subjectCard.r.top, w: subjectCard.r.width, h: subjectCard.r.height } : null;
  const all = cards.reduce((a, c) => ({ left: Math.min(a.left, c.r.left), right: Math.max(a.right, c.r.right), top: Math.min(a.top, c.r.top), bottom: Math.max(a.bottom, c.r.bottom) }), { left: 1e9, right: -1e9, top: 1e9, bottom: -1e9 });
  result.picture = { x: all.left, y: all.top, w: all.right - all.left, h: all.bottom - all.top };
  return result;
};

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: Number(process.env.DSF || 1) });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url); await page.locator(`.node-card[data-id="${subject}"]`).waitFor(); await localMapSettled(page); await localMapStill(page); await page.waitForTimeout(400);
  const steps = []; let last = null;
  for (let i = 0; i <= maxSteps; i++) {
    if (i > 0) { await page.getByRole('button', { name: 'Zoom Out', exact: true }).click(); await localMapSettled(page); await localMapStill(page); await page.waitForTimeout(150); }
    const a = await page.evaluate(audit, subject); a.press = i;
    const atEnd = last !== null && Math.abs(a.scale - last) < 1e-4; last = a.scale;
    if (atEnd) break;
    steps.push(a);
    if (shots.has(i)) await page.screenshot({ path: path.join(out, `${name}-out-${String(i).padStart(2, '0')}.png`) });
  }
  await page.screenshot({ path: path.join(out, `${name}-out-farthest.png`) });
  fs.writeFileSync(path.join(out, `${name}-audit.json`), JSON.stringify({ subject, url, viewport: { width, height }, errors, steps }, null, 1));
  for (const s of steps) {
    const p = Object.entries(s.byPart).filter(([, v]) => v.outside > 0).map(([k, v]) => `${k} ${v.outside}/${v.shown} max ${v.maxPx}px ${v.side} (${v.where})`).join('; ');
    const r = Object.entries(s.rowOverflow).filter(([, v]) => v.outside > 0).map(([k, v]) => `${k} ${v.outside}/${v.shown} max ${v.maxPx}px ${v.side}`).join('; ');
    const l = s.labels.filter(x => x.outsidePx > 1.5).length;
    console.log(`press ${String(s.press).padStart(2)} scale ${s.scale} ${s.lod}/${s.step} | outside card: ${p || 'none'} | outside row: ${r || 'none'} | ink over neighbours: ${s.inkOverNeighbours.length} | labels outside membrane: ${l}/${s.labels.length}`);
  }
  if (errors.length) console.log('page errors:', errors.slice(0, 5));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

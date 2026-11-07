// Screen sizes of the text a far zoom-out must keep legible, per Zoom Out press, for a tuning variant; optional shots.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapSettled, localMapStill } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const subject = process.env.SUBJECT || 'tests/e2e/still-picture.ts'; const name = process.env.NAME || 'still-picture';
const tuning = process.env.TUNING ? JSON.parse(process.env.TUNING) : null; const out = process.env.OUT;
const shots = new Set((process.env.SHOTS || '').split(',').filter(Boolean).map(Number)); const css = process.env.CSS ? fs.readFileSync(process.env.CSS, 'utf8') : '';
const url = (process.env.BASE || 'http://127.0.0.1:8900/') + '?s=' + compressSnapshot({ ...DEFAULT_SNAPSHOT, view: 'map', perspective: '2d', selectedNodeId: subject });
const measure = id => {
  const container = document.querySelector('#map-container');
  const k = new DOMMatrix(getComputedStyle(document.querySelector('#map-viewport')).transform).a;
  const h = el => el.getBoundingClientRect().height; const shown = el => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0 && h(el) > 0.05; };
  const statsOf = v => { v = v.filter(x => x > 0.05).sort((a, b) => a - b); if (!v.length) return 'none'; const f = x => +x.toFixed(1); return `${f(v[0])}/${f(v[Math.floor(v.length / 2)])}/${f(v[v.length - 1])} (${v.length})`; };
  const stats = list => statsOf(list.filter(shown).map(h));
  const lineH = el => { const r = el.getClientRects(); return r.length ? r[0].height : 0; };
  // Since the far bands' round of 2026-11-06 a file's name and a directory's caption are drawn, from the middle band out,
  // by a held element or the label's generated content, the text in the layout kept but not drawn: read the line drawn.
  const titleOf = card => { const held = card.querySelector('.local-file-name-held'); const s = held && getComputedStyle(held);
    if (s && s.display !== 'none') return parseFloat(s.lineHeight) * new DOMMatrix(s.transform).a * k; const t = card.querySelector('.local-file-name-text'); return t && shown(t) ? lineH(t) : 0; };
  // The held caption: an aria-hidden child since the far bands' third review (2026-11-07), the label's own generated content before.
  const dirOf = label => { const child = label.querySelector(':scope > .local-directory-held'), c = child && getComputedStyle(child);
    if (c && c.display !== 'none') return parseFloat(c.lineHeight) * new DOMMatrix(c.transform).a * k;
    const a = getComputedStyle(label, '::after'); if (a.content && a.content !== 'none' && a.display !== 'none') return parseFloat(a.lineHeight) * new DOMMatrix(a.transform).a * k;
    const n = label.querySelector('.local-directory-name'); return n && shown(n) ? h(n) : 0; };
  const card = document.querySelector(`.node-card[data-id="${id}"]`);
  const names = [...card.querySelectorAll('.symbol-label-text')].filter(shown);
  const cut = names.filter(el => el.scrollWidth > el.clientWidth + 1 || /…$/.test(el.textContent || '')).length;
  return { scale: +k.toFixed(3), lod: container.dataset.lod, step: container.dataset.step,
    subjectTitle: +titleOf(card).toFixed(1), subjectNames: stats(names), subjectRowsCut: `${cut}/${names.length}`,
    allTitles: statsOf([...document.querySelectorAll('.node-card')].map(titleOf)), allNames: stats([...document.querySelectorAll('.symbol-label-text')]),
    dirNames: statsOf([...document.querySelectorAll('.local-directory-label')].map(dirOf)), dirLabels: document.querySelectorAll('.local-directory-label').length,
    cardW: +card.getBoundingClientRect().width.toFixed(1), rowH: +(card.querySelector('.symbol-row') ? card.querySelector('.symbol-row').getBoundingClientRect().height : 0).toFixed(1),
    dot: +(card.querySelector('.symbol-anchor.dot') ? card.querySelector('.symbol-anchor.dot').getBoundingClientRect().width : 0).toFixed(1) };
};
(async () => {
  if (out) fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  if (tuning) await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: tuning } }) });
  await page.goto(url); await page.locator(`.node-card[data-id="${subject}"]`).waitFor(); await localMapSettled(page); await localMapStill(page); await page.waitForTimeout(400);
  if (css) await page.addStyleTag({ content: css });
  let last = null;
  for (let i = 0; i <= Number(process.env.STEPS || 12); i++) {
    // Since 2026-11-06 the button is disabled at the farthest zoom: the walk ends there.
    if (i > 0 && await page.getByRole('button', { name: 'Zoom Out', exact: true }).isDisabled()) break;
    if (i > 0) { await page.getByRole('button', { name: 'Zoom Out', exact: true }).click(); await localMapSettled(page); await localMapStill(page); await page.waitForTimeout(150); }
    const m = await page.evaluate(measure, subject); if (last !== null && Math.abs(m.scale - last) < 1e-4) break; last = m.scale;
    console.log(`press ${String(i).padStart(2)} ${m.scale} ${m.lod}/${m.step} | subject: title ${m.subjectTitle}px, names min/med/max ${m.subjectNames}, cut ${m.subjectRowsCut}, card ${m.cardW}px wide, row ${m.rowH}px, dot ${m.dot}px | all titles ${m.allTitles} | all names ${m.allNames} | dir names ${m.dirNames}`);
    if (out && shots.has(i)) await page.screenshot({ path: path.join(out, `${name}-out-${String(i).padStart(2, '0')}.png`) });
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

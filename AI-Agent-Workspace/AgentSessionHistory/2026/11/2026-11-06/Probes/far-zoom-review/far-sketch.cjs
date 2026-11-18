// A sketch, by styles and labels injected into the served page (no product change): what a far zoom-out could hold instead.
// Far band: symbol names at one size, no row buttons, file and directory names held. Overview band: symbol rows silent,
// dots following the map, file and directory names held. Wires are the page's own, redrawn after the dots change.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapSettled, localMapStill } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const subject = process.env.SUBJECT || 'tests/e2e/still-picture.ts'; const out = process.env.OUT; const name = process.env.NAME || 'still-picture';
const url = 'http://127.0.0.1:8900/?s=' + compressSnapshot({ ...DEFAULT_SNAPSHOT, view: 'map', perspective: '2d', selectedNodeId: subject });
const sketch = mode => {
  document.querySelectorAll('.sketch-layer, .sketch-style').forEach(e => e.remove());
  const style = document.createElement('style'); style.className = 'sketch-style';
  style.textContent = (mode === 'overview'
    ? '.symbol-label, .local-symbol-more, .local-symbol-pin, .type-refs-indicator, .internals-label { visibility: hidden !important; } .symbol-anchor.dot { transform: none !important; }'
    : '.local-symbol-more, .local-symbol-pin { visibility: hidden !important; }')
    + ' .local-file-name-text, .local-card-actions, .local-directory-label { visibility: hidden !important; }'
    + ' .sketch-layer { position: fixed; inset: 0; pointer-events: none; z-index: 50; font-family: inherit; }'
    + ' .sketch-layer div { position: absolute; overflow: hidden; } .sketch-dir { white-space: nowrap; text-overflow: ellipsis; } .sketch-file { white-space: normal; overflow-wrap: anywhere; }'
    + ' .sketch-file { font: 600 13px/1.15 system-ui, sans-serif; color: #e6edf3; }'
    + ' .sketch-dir { font: 500 11px/1.1 system-ui, sans-serif; color: #9aa7b4; letter-spacing: .02em; }';
  document.head.appendChild(style);
  const layer = document.createElement('div'); layer.className = 'sketch-layer'; document.body.appendChild(layer);
  const frame = document.querySelector('#map-container').getBoundingClientRect();
  const put = (cls, text, x, y, w, h) => { if (w < 14 || y < frame.top || y > frame.bottom - 90 || x < frame.left) return; const d = document.createElement('div'); d.className = cls; d.textContent = cls === 'sketch-file' ? text.replace(/([-._])/g, '$1\u200b') : text; d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.maxWidth = w + 'px'; d.style.width = cls === 'sketch-file' ? w + 'px' : 'auto'; if (h) d.style.maxHeight = Math.max(15, Math.floor(Math.min(h, frame.bottom - 78 - y) / 15) * 15) + 'px'; layer.appendChild(d); };
  for (const card of document.querySelectorAll('.node-card')) { const r = card.getBoundingClientRect(); const s = r.width / card.offsetWidth; put('sketch-file', card.dataset.id.split('/').pop(), r.left + 8 * s + 2, r.top + 6 * s + 1, r.width - 10 * s - 4, r.height - 8 * s - 2); }
  for (const label of document.querySelectorAll('.local-directory-label')) { const r = label.getBoundingClientRect(); const nm = label.querySelector('.local-directory-name'); const host = label.closest('.local-membrane, .local-directory-band') || label.parentElement; const hr = host.getBoundingClientRect(); put('sketch-dir', (nm ? nm.textContent : label.textContent).trim(), r.left, r.top - 2, Math.max(hr.right - r.left - 4, 60)); }
  window.dispatchEvent(new Event('resize'));
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { nameGrowth: 1 } } }) });
  await page.goto(url); await page.locator(`.node-card[data-id="${subject}"]`).waitFor(); await localMapSettled(page); await localMapStill(page); await page.waitForTimeout(400);
  for (let i = 1; i <= 10; i++) {
    await page.getByRole('button', { name: 'Zoom Out', exact: true }).click(); await localMapSettled(page); await localMapStill(page); await page.waitForTimeout(150);
    const mode = i === 5 ? 'far' : i === 8 || i === 10 ? 'overview' : null; if (!mode) continue;
    await page.evaluate(sketch, mode); await page.waitForTimeout(700); await localMapStill(page);
    await page.evaluate(sketch, mode); await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `${name}-sketch-out-${String(i).padStart(2, '0')}.png`) });
    await page.evaluate(() => document.querySelectorAll('.sketch-layer, .sketch-style').forEach(e => e.remove()));
  }
  await browser.close();
})().catch(e => { console.error(String(e).slice(0, 600)); process.exit(1); });

// The frame instrument of the culling pass, grown from zoom-perf.cjs and zoom-perf-wheel.cjs beside it: per tuning variant, on
// one subject, a journey of camera moves, each followed for 1.2 s by Chromium's metrics and rAF intervals, and at the
// end of each the band, step, scale and how many cards the browser skipped. Run with `npx tsx` from the repository root.
// PORT, SUBJECT, BASE (the bundle's path, "/" or "/samples/estate/"), VARIANTS (comma list), CSS (extra CSS injected,
// for trials before code), OUT (a JSON file).
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapSettled, localRetainUrl } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const retain = process.env.RETAIN ? process.env.RETAIN.split(',') : null;
const subject = retain ? retain[0] : process.env.SUBJECT || 'tests/e2e/still-picture.ts';
const port = process.env.PORT || '8779';
const base = process.env.BASE || '/';
const css = process.env.CSS || '';
const url = retain ? `http://127.0.0.1:${port}` + localRetainUrl(base, retain) : `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, view: 'map', perspective: '2d', selectedNodeId: subject });
const allVariants = {
  ladder: { searchStarts: 0 },
  constantVars: { searchStarts: 0, textResistance: 0, controlResistance: 0, nameGrowth: 1 },
  grow: { searchStarts: 0, cardText: 'grow' },
};
const chosen = (process.env.VARIANTS || 'ladder,constantVars,grow').split(',');
const pick = ['LayoutCount', 'RecalcStyleCount', 'LayoutDuration', 'RecalcStyleDuration', 'ScriptDuration', 'TaskDuration'];
const journey = (process.env.JOURNEY || 'button-out,button-out,button-out,reset,wheel-out,wheel-out,wheel-out,drag-pan,trackpad-pan,wheel-in,wheel-in,wheel-in,reset,drag-pan,trackpad-pan').split(',');
(async () => {
  const browser = await chromium.launch();
  const out = { subject, retain, base, css, runs: {} };
  for (const name of chosen) {
    const tuning = allVariants[name];
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, bypassCSP: !!css });
    const page = await context.newPage();
    await page.addInitScript(({ key, value, css }) => {
      localStorage.setItem(key, value);
      if (css) document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.append(s); });
    }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: tuning } }), css });
    await page.goto(url); await page.locator(`.node-card[data-id="${subject}"]`).waitFor(); await localMapSettled(page); await page.waitForTimeout(500);
    const cdp = await context.newCDPSession(page); await cdp.send('Performance.enable');
    const box = await page.locator('#view-map').boundingBox();
    const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const runs = [];
    let direction = 1;
    const where = () => page.evaluate(() => {
      const map = document.querySelector('#map-container');
      const cards = [...document.querySelectorAll('.node-card')];
      const skipped = cards.filter(card => { const child = card.firstElementChild; return child && !child.checkVisibility({ contentVisibilityAuto: true }); }).length;
      return { lod: map.dataset.lod, ladderStep: map.dataset.step, scale: +new DOMMatrix(getComputedStyle(document.querySelector('#map-viewport')).transform).a.toFixed(3), cards: cards.length, skipped };
    });
    runs.push({ step: 'start', ...(await where()) });
    for (const step of journey) {
      if (step === 'reset') { await page.getByRole('button', { name: 'Reset Zoom', exact: true }).click(); await localMapSettled(page); await page.waitForTimeout(300); continue; }
      // A drag starts on the map's own ground, not on a card or a control, which take the press for themselves.
      const ground = step === 'drag-pan' ? await page.evaluate(({ x0, y0, w, h }) => {
        for (let gy = 0.2; gy < 0.9; gy += 0.05) for (let gx = 0.1; gx < 0.9; gx += 0.05) {
          const x = x0 + w * gx, y = y0 + h * gy, el = document.elementFromPoint(x, y);
          if (el && el.closest('#view-map') && !el.closest('.node-card, button, [role=button], a, input, select, .pathfind-toolbar, .perspective-controls, .pin-tray, #controls, .local-directory-label, .local-directory-closed')) return { x, y };
        }
        return null;
      }, { x0: box.x, y0: box.y, w: box.width, h: box.height }) : null;
      if (step === 'drag-pan' && !ground) { runs.push({ step, missing: 'no ground to press' }); continue; }
      const before = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
      const frames = page.evaluate(() => new Promise(resolve => {
        const stamps = []; let last = performance.now(); const start = last;
        const tick = now => { stamps.push(now - last); last = now; if (now - start < 1200) requestAnimationFrame(tick); else resolve(stamps); };
        requestAnimationFrame(tick);
      }));
      await page.waitForTimeout(50);
      if (step === 'button-out') await page.getByRole('button', { name: 'Zoom Out', exact: true }).click();
      else if (step === 'wheel-out' || step === 'wheel-in') {
        await page.mouse.move(centre.x, centre.y);
        for (let notch = 0; notch < 5; notch++) { await page.mouse.wheel(0, step === 'wheel-out' ? 40 : -40); await page.waitForTimeout(40); }
      } else if (step === 'drag-pan') {
        await page.mouse.move(ground.x, ground.y); await page.mouse.down();
        for (let i = 1; i <= 12; i++) { await page.mouse.move(ground.x - direction * 30 * i, ground.y - direction * 12 * i); await page.waitForTimeout(16); }
        await page.mouse.up();
      } else if (step === 'trackpad-pan') {
        await page.mouse.move(centre.x, centre.y);
        for (let i = 0; i < 20; i++) { await page.mouse.wheel(direction * 30, 0); await page.waitForTimeout(16); }
      }
      if (step.endsWith('pan')) direction = -direction;
      const stamps = await frames;
      const after = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
      const delta = Object.fromEntries(pick.map(k => [k, +(after[k] - before[k]).toFixed(3)]));
      const busy = stamps.filter(d => d > 20);
      await localMapSettled(page); await page.waitForTimeout(100);
      runs.push({ step, ...(await where()), frames: stamps.length, meanFrameMs: +(stamps.reduce((a, b) => a + b, 0) / stamps.length).toFixed(1), maxFrameMs: +Math.max(...stamps).toFixed(1), framesOver20ms: busy.length, ...delta });
    }
    out.runs[name] = runs; await context.close();
  }
  const text = JSON.stringify(out, null, 1);
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, text); else console.log(text);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

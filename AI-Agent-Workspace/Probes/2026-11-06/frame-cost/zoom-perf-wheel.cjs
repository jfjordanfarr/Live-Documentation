// The wheel copy of zoom-perf.cjs beside it: with MODE=wheel the zoom is five wheel notches, animated, instead of a press.
// Frame cost of one Zoom Out animation on the served bundle, by CDP performance metrics and rAF intervals, per tuning variant.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapSettled } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const subject = process.env.SUBJECT || 'tests/e2e/still-picture.ts';
const port = process.env.PORT || '8900';
const url = `http://127.0.0.1:${port}/?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, view: 'map', perspective: '2d', selectedNodeId: subject });
const variants = {
  ladder: { searchStarts: 0 },
  constantVars: { searchStarts: 0, textResistance: 0, controlResistance: 0, nameGrowth: 1 },
  grow: { searchStarts: 0, cardText: 'grow' },
};
const pick = ['LayoutCount', 'RecalcStyleCount', 'LayoutDuration', 'RecalcStyleDuration', 'ScriptDuration', 'TaskDuration'];
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const [name, tuning] of Object.entries(variants)) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: tuning } }) });
    await page.goto(url); await page.locator(`.node-card[data-id="${subject}"]`).waitFor(); await localMapSettled(page); await page.waitForTimeout(500);
    const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
    const runs = [];
    for (let step = 0; step < 3; step++) {
      const before = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
      const frames = page.evaluate(() => new Promise(resolve => {
        const stamps = []; let last = performance.now(); const start = last;
        const tick = now => { stamps.push(now - last); last = now; if (now - start < 1200) requestAnimationFrame(tick); else resolve(stamps); };
        requestAnimationFrame(tick);
      }));
      await page.waitForTimeout(50);
      if (process.env.MODE === 'wheel') {
        const box = await page.locator('#view-map').boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        for (let notch = 0; notch < 5; notch++) { await page.mouse.wheel(0, 40); await page.waitForTimeout(40); }
      } else await page.getByRole('button', { name: 'Zoom Out', exact: true }).click();
      const stamps = await frames;
      const after = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
      const delta = Object.fromEntries(pick.map(k => [k, +(after[k] - before[k]).toFixed(3)]));
      const busy = stamps.filter(d => d > 20);
      runs.push({ step, lod: await page.evaluate(() => document.querySelector('#map-container').dataset.lod), frames: stamps.length, meanFrameMs: +(stamps.reduce((a, b) => a + b, 0) / stamps.length).toFixed(1), maxFrameMs: +Math.max(...stamps).toFixed(1), framesOver20ms: busy.length, ...delta });
      await localMapSettled(page);
    }
    out[name] = runs; await page.close();
  }
  console.log(JSON.stringify(out, null, 1)); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

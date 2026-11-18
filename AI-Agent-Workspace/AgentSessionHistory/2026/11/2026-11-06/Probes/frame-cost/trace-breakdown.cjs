// Where a camera move's main-thread time goes: a Chromium trace over the 1.2 s after one move, summed by event name on
// the renderer's main thread (self time is not separated; nested events are counted under their own name too).
// PORT, SUBJECT, BASE, STEPS (comma list of moves before the traced one, untraced), MOVE (the traced move), CSS.
const path = require('node:path'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { compressSnapshot, DEFAULT_SNAPSHOT } = require(path.join(root, 'packages/explorer/src/client/persistence/compressed-url-state.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapSettled, localRetainUrl } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const retain = process.env.RETAIN ? process.env.RETAIN.split(',') : null;
const subject = retain ? retain[0] : process.env.SUBJECT || 'tests/e2e/still-picture.ts';
const port = process.env.PORT || '8779';
const base = process.env.BASE || '/';
const url = retain ? `http://127.0.0.1:${port}` + localRetainUrl(base, retain) : `http://127.0.0.1:${port}${base}?s=` + compressSnapshot({ ...DEFAULT_SNAPSHOT, view: 'map', perspective: '2d', selectedNodeId: subject });
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
  await page.goto(url); await page.locator(`.node-card[data-id="${subject}"]`).waitFor(); await localMapSettled(page); await page.waitForTimeout(500);
  const box = await page.locator('#view-map').boundingBox();
  const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const move = async name => {
    if (name === 'wheel-out' || name === 'wheel-in') {
      await page.mouse.move(centre.x, centre.y);
      for (let notch = 0; notch < 5; notch++) { await page.mouse.wheel(0, name === 'wheel-out' ? 40 : -40); await page.waitForTimeout(40); }
    } else if (name === 'trackpad-pan') {
      await page.mouse.move(centre.x, centre.y);
      for (let i = 0; i < 20; i++) { await page.mouse.wheel(30, 0); await page.waitForTimeout(16); }
    } else if (name === 'button-out') await page.getByRole('button', { name: 'Zoom Out', exact: true }).click();
  };
  for (const name of (process.env.STEPS || '').split(',').filter(Boolean)) { await move(name); await localMapSettled(page); await page.waitForTimeout(300); }
  await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'gpu'] });
  await move(process.env.MOVE || 'wheel-out');
  await page.waitForTimeout(1200);
  const buffer = await browser.stopTracing();
  const events = JSON.parse(buffer.toString()).traceEvents;
  const main = events.find(e => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
  const sums = new Map();
  for (const e of events) {
    if (!main || e.pid !== main.pid || e.tid !== main.tid || e.ph !== 'X' || !e.dur) continue;
    sums.set(e.name, (sums.get(e.name) ?? 0) + e.dur / 1000);
  }
  const want = ['ProxyMain::BeginMainFrame', 'UpdateLayoutTree', 'Layout', 'PrePaint', 'Paint', 'Layerize', 'Commit', 'Document::UpdateStyleAndLayout', 'FunctionCall'];
  console.log(JSON.stringify(Object.fromEntries(want.map(n => [n, +(sums.get(n) ?? 0).toFixed(1)]))));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

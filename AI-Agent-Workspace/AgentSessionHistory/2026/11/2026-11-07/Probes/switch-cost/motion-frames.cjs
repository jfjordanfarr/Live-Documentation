// Frames of the 2D/3D transition at fixed times from the moment its layer appears, on the focus case's picture (this
// repository's 3D map on graph.ts): a press of 2D, then a press of 3D, five frames each, composed as one strip a
// direction. The page's animation frames are given a frozen time while a frame is taken, so that a frame shows the
// transition at exactly its time however long the picture takes to draw on this machine; the clock is released after.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const base = process.env.BASE || 'http://127.0.0.1:8911/';
const name = process.env.NAME || 'after';
const out = process.env.OUT;
const times = [0, 0.35, 0.7, 1.05, 1.4];
const GRAPH = 'packages/engine/src/live-docs/graph.ts';

const freezeClock = `(() => {
  const real = window.requestAnimationFrame.bind(window);
  window.__frozenAt = null; window.__layerAt = null;
  window.requestAnimationFrame = callback => real(now => callback(window.__frozenAt ?? now));
  // The transition takes its start from the clock just after it appends its layer to the body, so the moment of that
  // append is its start to well under a millisecond. (A mutation observer would read it at the end of the press's task,
  // which goes on after the append: about 0.5 s later on this machine.)
  const append = Element.prototype.append;
  Element.prototype.append = function (...nodes) {
    const result = append.apply(this, nodes);
    if (this === document.body && window.__layerAt === null && nodes.some(node => node instanceof HTMLElement && node.classList.contains('perspective-transition') && node.dataset.graphFiles)) {
      window.__layerAt = performance.now();
      window.__frozenAt = window.__layerAt;
      // How long after its start the transition's next frame comes: the time it loses at its start, unseen.
      window.__firstFrame = null;
      real(() => { window.__firstFrame = performance.now() - window.__layerAt; });
    }
    return result;
  };
})();`;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
  await context.addInitScript({ content: freezeClock });
  // tsx keeps functions' names with a helper the page lacks.
  await context.addInitScript({ content: 'window.__name = (f) => f;' });
  const page = await context.newPage();
  await page.goto(`${base}?view=local&mode=3d&node=${encodeURIComponent(GRAPH)}`);
  await page.waitForFunction(() => document.querySelector('#graph-svg')?.getAttribute('aria-busy') === 'false', null, { timeout: 120_000 });
  await page.waitForTimeout(2000);
  const frames = async () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
  const strips = [];
  for (const label of ['2D', '3D']) {
    await page.evaluate(label => { window.__layerAt = null; window.__frozenAt = null;
      setTimeout(() => [...document.querySelectorAll('.perspective-controls button')].find(each => each.textContent === label).click(), 0); }, label);
    await page.waitForFunction(() => window.__layerAt !== null, null, { timeout: 120_000, polling: 50 });
    const shots = [];
    for (const time of times) {
      await page.evaluate(time => { window.__frozenAt = window.__layerAt + time * 1000; }, time);
      await frames();
      const progress = await page.evaluate(() => document.querySelector('.perspective-transition[data-graph-files]')?.dataset.progress ?? 'ended');
      const file = path.join(out, `${name}-to-${label.toLowerCase()}-${time.toFixed(2)}.png`);
      await page.screenshot({ path: file });
      shots.push({ file, time, progress });
    }
    const firstFrame = await page.evaluate(() => window.__firstFrame);
    await page.evaluate(() => { window.__frozenAt = null; });
    await page.waitForFunction(() => !document.querySelector('.perspective-transition'), null, { timeout: 60_000 });
    await page.waitForTimeout(label === '2D' ? 4000 : 2000);
    strips.push({ label, shots, firstFrame });
  }
  // One strip a direction: the five frames side by side, each at two fifths of its size, its time beneath.
  const composer = await browser.newPage({ viewport: { width: 5 * 576 + 4 * 8, height: 384 + 28 } });
  for (const { label, shots, firstFrame } of strips) {
    const cells = shots.map(shot => `<figure><img src="data:image/png;base64,${fs.readFileSync(shot.file).toString('base64')}"><figcaption>${shot.time.toFixed(2)} s (progress ${shot.progress === 'ended' ? 'ended' : Number(shot.progress).toFixed(2)})</figcaption></figure>`).join('');
    await composer.setContent(`<style>body{margin:0;background:#111;display:flex;gap:8px;font:13px sans-serif;color:#ccc}figure{margin:0}img{width:576px;height:384px;display:block}figcaption{height:28px;line-height:28px;text-align:center}</style>${cells}`);
    await composer.screenshot({ path: path.join(out, `${name}-to-${label.toLowerCase()}.png`) });
    for (const shot of shots) fs.rmSync(shot.file);
    console.log(`${name} to ${label}: the transition's next frame ${Math.round(firstFrame)} ms after its start; ${shots.map(shot => `${shot.time}s progress ${shot.progress}`).join(', ')}`);
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });

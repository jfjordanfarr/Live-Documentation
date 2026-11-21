// Pictures of the two wire trials (Wire Answers, Direction Marks) and the frame cost of panning with each.
// Usage: node shots.mjs <repository> <out folder> [jobs, comma-separated]
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out, jobsArg] = process.argv.slice(2);
const jobs = (jobsArg ?? 'estate,dense,cost').split(',');
const require = createRequire(path.join(repo, 'package.json'));
const { chromium } = require('@playwright/test');
const { browserLaunchOptions } = await import(path.join(repo, 'tests/e2e/browser-launch.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = await import(path.join(repo, 'packages/explorer/src/client/persistence/local-storage.ts'));
fs.mkdirSync(out, { recursive: true });
const root = path.join(repo, 'dist/explorer');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(8777, '127.0.0.1', r));
const base = 'http://127.0.0.1:8777';
const settled = page => page.waitForFunction(() => {
  const map = document.querySelector('#map-container'), placed = map?.querySelector('.local-placed');
  return !!placed && map.dataset.camera !== 'moving' && placed.dataset.moving !== 'true' && placed.dataset.searchStatus !== 'running';
}, undefined, { timeout: 60000 });
const rest = async page => { await settled(page); await page.waitForTimeout(500); await settled(page); };
const searchFolder = async (page, typed, directory) => {
  await page.click('#search-subject');
  await page.keyboard.type(typed);
  await page.waitForSelector('#search-subject-results .search-row');
  const index = await page.evaluate(name => [...document.querySelectorAll('#search-subject-results .search-row')]
    .findIndex(row => row.classList.contains('search-row--directory') && row.querySelector('.search-row-name')?.textContent?.trim() === name), directory);
  await page.click(`#search-subject-results .search-row[data-index="${index}"]`);
};
const browser = await chromium.launch(browserLaunchOptions());
async function open(localMap, address) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, tuning }) => localStorage.setItem(key, tuning), { key: PERSISTED_UI_KEY, tuning: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, ...localMap } } }) });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(address);
  await page.waitForTimeout(1500);
  return { context, page, errors };
}
/** The screen point at a fraction along a band's wire, and what the band says. */
const bandPoint = (page, selector, at = 0.5) => page.evaluate(([selector, at]) => {
  const bands = [...document.querySelectorAll(selector)];
  const view = document.querySelector('#view-map').getBoundingClientRect();
  for (const band of bands) {
    const point = band.getPointAtLength(band.getTotalLength() * at).matrixTransform(band.getScreenCTM());
    if (point.x > view.left + 40 && point.x < view.right - 340 && point.y > view.top + 60 && point.y < view.bottom - 160
      && document.elementFromPoint(point.x, point.y) === band) return { x: point.x, y: point.y, name: band.getAttribute('aria-label'), key: band.dataset.connectionKey };
  }
  return null;
}, [selector, at]);
const panelText = page => page.evaluate(() => { const p = document.querySelector('.wire-answer'); return p && !p.hidden ? { text: [...p.querySelectorAll('.h, .via')].map(e => e.textContent).join(' / '), pinned: p.classList.contains('pinned') } : null; });
const estateStart = async page => { await searchFolder(page, 'PaymentService', 'PaymentService'); await rest(page);
  await page.getByRole('button', { name: 'Open PaymentService/Data', exact: true }).click(); await rest(page); };
const report = [];
if (jobs.includes('estate')) {
  for (const marks of ['none', 'along', 'against']) {
    const { context, page, errors } = await open({ directionMarks: marks }, `${base}/samples/estate/`);
    await estateStart(page);
    await page.mouse.move(5, 790);
    await page.screenshot({ path: path.join(out, `estate-data--marks-${marks}.png`) });
    report.push({ shot: `marks-${marks}`, errors });
    await context.close();
  }
  const { context, page, errors } = await open({ wireAnswers: 'on' }, `${base}/samples/estate/`);
  await estateStart(page);
  await page.screenshot({ path: path.join(out, `estate-data--answers-on.png`) });
  const ordinary = await bandPoint(page, '.wire-band:not(.run-band)', 0.5);
  report.push({ ordinary });
  if (ordinary) {
    // Passing over: the pointer crosses the wire without stopping.
    await page.mouse.move(ordinary.x - 60, ordinary.y - 60);
    await page.mouse.move(ordinary.x + 60, ordinary.y + 60, { steps: 12 });
    report.push({ passOver: await panelText(page) });
    await page.mouse.move(ordinary.x, ordinary.y, { steps: 4 });
    await page.waitForTimeout(500);
    report.push({ rested: await panelText(page) });
    await page.screenshot({ path: path.join(out, `estate-data--wire-rested.png`) });
    await page.mouse.down(); await page.mouse.up();
    await page.mouse.move(40, 760, { steps: 6 });
    await page.waitForTimeout(500);
    report.push({ pinned: await panelText(page) });
    await page.screenshot({ path: path.join(out, `estate-data--wire-pinned.png`) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    report.push({ afterEscape: await panelText(page) });
  }
  for (const [name, selector] of [['gathered', '.wire-band[data-connection-key*="gathered"]'], ['run', '.wire-band.run-band']]) {
    const point = await bandPoint(page, selector, 0.5) ?? await bandPoint(page, selector, 0.3);
    report.push({ [name]: point });
    if (!point) continue;
    await page.mouse.move(point.x + 3, point.y + 3);
    await page.mouse.move(point.x, point.y, { steps: 3 });
    await page.waitForTimeout(500);
    report.push({ [`${name}Rested`]: await panelText(page) });
    await page.screenshot({ path: path.join(out, `estate-data--${name}-rested.png`) });
    await page.mouse.move(40, 760, { steps: 4 });
    await page.waitForTimeout(300);
  }
  report.push({ errors });
  await context.close();
}
if (jobs.includes('repo')) {
  // The arrival on pathfind.ts at reading size, where the wires are references between rows and some run in bundles.
  for (const marks of ['none', 'along']) {
    const { context, page, errors } = await open({ wireAnswers: 'on', directionMarks: marks }, `${base}/?view=local&node=${encodeURIComponent('packages/engine/src/live-docs/pathfind.ts')}`);
    await rest(page);
    await page.mouse.move(5, 790);
    await page.screenshot({ path: path.join(out, `repo-pathfind--marks-${marks}.png`) });
    if (marks === 'none') {
      for (const [name, selector] of [['reference', '.wire-band:not(.run-band):not([data-connection-key*="gathered"])'], ['run', '.wire-band.run-band']]) {
        const point = await bandPoint(page, selector, 0.5) ?? await bandPoint(page, selector, 0.25);
        report.push({ [name]: point });
        if (!point) continue;
        await page.mouse.move(point.x + 3, point.y + 3);
        await page.mouse.move(point.x, point.y, { steps: 3 });
        await page.waitForTimeout(500);
        report.push({ [`${name}Rested`]: await panelText(page) });
        await page.screenshot({ path: path.join(out, `repo-pathfind--${name}-rested.png`) });
        if (name === 'reference') {
          await page.mouse.down(); await page.mouse.up();
          await page.mouse.move(30, 700, { steps: 5 });
          await page.waitForTimeout(500);
          report.push({ referencePinned: await panelText(page) });
          await page.screenshot({ path: path.join(out, `repo-pathfind--reference-pinned.png`) });
          await page.keyboard.press('Escape');
        }
        await page.mouse.move(30, 700, { steps: 4 });
        await page.waitForTimeout(300);
      }
    }
    report.push({ shot: `repo-${marks}`, errors });
    await context.close();
  }
}
const denseStart = async page => { await rest(page);
  for (let i = 0; i < 2; i++) { await page.click('#controls [data-zoom="out"]'); await rest(page); } };
if (jobs.includes('dense')) {
  for (const marks of ['none', 'along', 'against']) {
    const { context, page, errors } = await open({ directionMarks: marks, wireAnswers: 'on' }, `${base}/?view=local&node=${encodeURIComponent('packages/engine/src/live-docs/pathfind.ts')}`);
    await denseStart(page);
    await page.mouse.move(5, 790);
    await page.screenshot({ path: path.join(out, `repo-dense--marks-${marks}.png`) });
    if (marks === 'along') {
      const point = await bandPoint(page, '.wire-band:not(.run-band)', 0.5);
      if (point) { await page.mouse.move(point.x + 3, point.y); await page.mouse.move(point.x, point.y, { steps: 3 }); await page.waitForTimeout(500);
        report.push({ denseRested: await panelText(page) }); await page.screenshot({ path: path.join(out, `repo-dense--wire-rested.png`) }); }
    }
    report.push({ shot: `dense-${marks}`, errors });
    await context.close();
  }
}
if (jobs.includes('cost')) {
  // A frame of panning on the largest opened folder: the median and the slowest tenth of the frames' intervals during a
  // drag of 120 moves, and the main thread's time in script, style, layout and paint over the drag, by the browser's own counters.
  const folder = 'packages/explorer/src/client/views/localView';
  for (const [label, localMap] of [['off', {}], ['answers', { wireAnswers: 'on' }], ['marks', { directionMarks: 'along' }], ['both', { wireAnswers: 'on', directionMarks: 'along' }]].filter(([label]) => !process.env.COSTS || process.env.COSTS.split(',').includes(label))) {
    const { context, page, errors } = await open(localMap, `${base}/?view=local&node=${encodeURIComponent(`${folder}/controller.ts`)}`);
    await rest(page);
    await page.getByRole('button', { name: `Open ${folder}`, exact: true }).evaluate(button => button.click());
    await rest(page);
    await page.screenshot({ path: path.join(out, `cost--${label}.png`) });
    const counts = await page.evaluate(() => ({ wires: document.querySelectorAll('#map-connections .connection-path').length, bands: document.querySelectorAll('#map-connections .wire-band').length, cards: document.querySelectorAll('.node-card').length }));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    const metric = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    const runs = [];
    for (let run = 0; run < 3; run++) {
      // A drag begun on a wire if there is one under the pointer's start, as a person would.
      const start = await bandPoint(page, '.wire-band', 0.5) ?? { x: 640, y: 400 };
      await page.evaluate(() => { window.__frames = []; let last = performance.now(); const tick = now => { window.__frames.push(now - last); last = now; if (window.__frames.length < 400) window.__frameId = requestAnimationFrame(tick); }; window.__frameId = requestAnimationFrame(tick); });
      const before = await metric();
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      for (let i = 1; i <= 120; i++) await page.mouse.move(start.x - i * 3 * (run % 2 ? -1 : 1), start.y - i * 1.5);
      await page.mouse.up();
      const after = await metric();
      const frames = await page.evaluate(() => { cancelAnimationFrame(window.__frameId); return window.__frames.slice(1); });
      const sorted = [...frames].sort((a, b) => a - b);
      const ms = name => +((after[name] - before[name]) * 1000).toFixed(1);
      runs.push({ frames: frames.length, median: +sorted[Math.floor(sorted.length / 2)].toFixed(2), p90: +sorted[Math.floor(sorted.length * 0.9)].toFixed(2),
        script: ms('ScriptDuration'), style: ms('RecalcStyleDuration'), layout: ms('LayoutDuration'), task: ms('TaskDuration') });
      await rest(page);
    }
    report.push({ cost: label, counts, runs, errors });
    console.log(JSON.stringify(report.at(-1)));
    await context.close();
  }
}
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
await browser.close();
server.close();

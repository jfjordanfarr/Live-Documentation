// A person reading the subject's card with the pointer on it, under Arrival Waits never and while pointed at: the
// pointer is brought onto the card's name during the rest at reading size, stays 3 s, then leaves; pictures at moments
// of that, and when the ease began.  node scripts/browser-lane.mjs --label explorer -- npx tsx waits-probe.mjs <repository> <out>
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out] = process.argv.slice(2);
const require = createRequire(path.join(repo, 'package.json'));
const { chromium } = require('@playwright/test');
const { browserLaunchOptions } = await import(path.join(repo, 'tests/e2e/browser-launch.ts'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = await import(path.join(repo, 'packages/explorer/src/client/persistence/local-storage.ts'));
fs.mkdirSync(out, { recursive: true });
const root = path.join(repo, 'dist/explorer');
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(8784, '127.0.0.1', r));
const SUBJECT = 'packages/engine/src/live-docs/pathfind.ts';
const browser = await chromium.launch(browserLaunchOptions());
const report = [];
for (const waits of ['never', 'pointed']) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, arrival: 'then-neighbours-before', arrivalWaits: waits } } }) });
  const page = await context.newPage();
  await page.mouse.move(5, 790);
  await page.goto(`http://127.0.0.1:8784/?view=local&mode=2d&node=${encodeURIComponent(SUBJECT)}`);
  await page.waitForSelector('#map-container .node-card.local-focus', { timeout: 60_000 });
  // Into the rest: the camera says it moves while the arrival holds; bring the pointer to the card's name at once.
  await page.waitForFunction(() => document.querySelector('#map-container')?.dataset.camera === 'moving', undefined, { timeout: 60_000 });
  const scale = () => page.evaluate(() => Number((document.querySelector('#map-viewport').style.transform.match(/scale\(([\d.e-]+)\)/) ?? [])[1]));
  const name = await page.locator(`#map-container .node-card[data-id="${SUBJECT}"] .local-file-name`).boundingBox();
  const t0 = Date.now();
  await page.mouse.move(name.x + name.width / 2, name.y + name.height / 2, { steps: 4 });
  const shots = [];
  const shoot = async label => { const file = path.join(out, `${waits}-${shots.length}.png`); await page.screenshot({ path: file }); shots.push(['-label', `${label} (scale ${(await scale()).toFixed(2)})`, file]); };
  await page.waitForTimeout(400); await shoot('pointer on the name, +0.4 s');
  await page.waitForTimeout(1600); await shoot('+2.0 s');
  await page.waitForTimeout(1000); await shoot('+3.0 s');
  const leftAt = Date.now() - t0;
  await page.mouse.move(5, 790, { steps: 4 });
  await page.waitForTimeout(600); await shoot('pointer left, +0.6 s');
  await page.waitForTimeout(1400); await shoot('pointer left, +2.0 s');
  execFileSync('montage', [...shots.flat(), '-tile', '5x1', '-geometry', '512x320+4+4', '-pointsize', '16', '-background', '#333', '-fill', 'white', path.join(out, `arrival-waits--${waits}--strip.png`)]);
  for (const [, , file] of shots) fs.rmSync(file);
  report.push({ waits, leftAt, scales: await scale() });
  await context.close();
}
console.log(JSON.stringify(report));
await browser.close();
server.close();

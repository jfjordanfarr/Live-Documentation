// Stills at rest in the three looks with Unseen Cards drawn and skipped, compared pixel for pixel: a skipped card that
// clips a dot or a halo, stacks differently, loses a wire's end or changes its box would show as a difference.
//   node scripts/browser-lane.mjs --label explorer -- npx tsx stills-probe.mjs <repository> <out>
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
await new Promise(r => server.listen(8785, '127.0.0.1', r));
const base = 'http://127.0.0.1:8785';
const subjects = {
  estate: `${base}/samples/estate/?view=local&mode=2d&node=${encodeURIComponent('Contracts/IPaymentService.cs')}`,
  pathfind: `${base}/?view=local&mode=2d&node=${encodeURIComponent('packages/engine/src/live-docs/pathfind.ts')}`,
  heavy: `${base}/?view=local&mode=2d&node=${encodeURIComponent('packages/engine/src/config/liveDocumentationConfig.ts')}`
};
const browser = await chromium.launch(browserLaunchOptions());
const settled = page => page.waitForFunction(() => { const m = document.querySelector('#map-container'); const p = m?.querySelector('.local-placed'); return p && !m.dataset.camera && p.dataset.moving !== 'true' && p.dataset.searchStatus !== 'running'; }, undefined, { timeout: 120_000 });
const report = [];
for (const [name, url] of Object.entries(subjects)) {
  const files = {};
  for (const unseenCards of ['drawn', 'again', 'skipped']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, arrival: 'reading', unseenCards: unseenCards === 'again' ? 'drawn' : unseenCards } } }) });
    const page = await context.newPage();
    await page.mouse.move(2, 790);
    await page.goto(url);
    await page.waitForSelector('#map-container .local-placed', { timeout: 120_000 });
    await settled(page); await page.waitForTimeout(800); await settled(page);
    for (const [look, presses] of [['reading', 0], ['connections', 3], ['overview', 4]]) {
      for (let i = 0; i < presses; i++) { await page.click('#controls [data-zoom="out"]'); await page.waitForTimeout(150); }
      await settled(page); await page.waitForTimeout(900); await settled(page);
      const file = path.join(out, `${name}--${look}--${unseenCards}.png`);
      await page.screenshot({ path: file });
      (files[look] ??= {})[unseenCards] = file;
      const said = await page.evaluate(() => ({ look: document.querySelector('#map-container').dataset.look, unseen: document.querySelector('#map-container').dataset.unseen ?? null }));
      report.push({ name, look, unseenCards, said });
    }
    await context.close();
  }
  for (const [look, pair] of Object.entries(files)) {
    // The map's own room only: the sidebar's Tuning badge counts a lever moved from its default, as it should.
    const diff = (a, b, tag) => {
      const crop = f => { const c = f.replace('.png', '--map.png'); execFileSync('convert', [f, '-crop', '1019x680+261+50', '+repage', c]); return c; };
      try { execFileSync('compare', ['-metric', 'AE', '-fuzz', '2%', crop(a), crop(b), path.join(out, `${name}--${look}--${tag}.png`)], { stdio: ['ignore', 'ignore', 'pipe'] }); return '0'; }
      catch (e) { return String(e.stderr ?? e.message).trim(); }
    };
    const row = { name, look, drawnTwice: diff(pair.drawn, pair.again, 'noise'), drawnSkipped: diff(pair.drawn, pair.skipped, 'diff') };
    report.push(row);
    console.log(JSON.stringify(row));
  }
}
fs.writeFileSync(path.join(out, 'stills.json'), JSON.stringify(report, null, 1));
await browser.close();
server.close();

// Pictures of the Explorer in a Chromium without WebGL (`--disable-3d-apis`), headed on an Xvfb screen of its own so that
// the browser's native tooltip is drawn and can be captured with the whole screen (ImageMagick's `import`); the pointer is
// moved by the X server itself (warp.py), since a pointer moved through Playwright reaches the page but not the browser's
// tooltip. Builder's script of 2026-11-21, run through the browser lane on a built site:
//   node scripts/browser-lane.mjs --label <who> -- node shots.mjs <repository> <out folder>
import { createRequire } from 'node:module';
import { execFileSync, spawn } from 'node:child_process';
const xvfb = spawn('Xvfb', [':97', '-screen', '0', '1280x860x24', '-nolisten', 'tcp'], { stdio: 'ignore' });
process.env.DISPLAY = ':97';
await new Promise(r => setTimeout(r, 1500));
process.on('exit', () => xvfb.kill());
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out] = process.argv.slice(2);
const require = createRequire(path.join(repo, 'package.json'));
const { chromium } = require('@playwright/test');
fs.mkdirSync(out, { recursive: true });
const root = path.join(repo, 'dist/explorer');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }); fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(8773, '127.0.0.1', r));
const base = 'http://127.0.0.1:8773';
const browser = await chromium.launch({ headless: false, args: ['--disable-3d-apis', '--window-position=0,0', '--window-size=1280,860'] });
const subjects = [
  { name: 'estate', url: `${base}/samples/estate/?view=local&mode=3d&node=${encodeURIComponent('PaymentService/PaymentService.cs')}` },
  { name: 'repo', url: `${base}/?view=local&mode=3d&node=${encodeURIComponent('packages/engine/src/live-docs/graph.ts')}` },
];
const report = [];
for (const s of subjects) {
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(s.url);
  await page.waitForFunction(() => {
    const root = document.querySelector('#map-container .local-placed');
    return root && root.dataset.moving !== 'true' && root.dataset.searchStatus !== 'running' && document.querySelector('#map-container')?.dataset.camera !== 'moving';
  }, undefined, { timeout: 120000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(out, `${s.name}--3d-link.png`) });
  const button = page.getByRole('button', { name: '3D', exact: true });
  const box = await button.boundingBox();
  await page.bringToFront();
  const offset = await page.evaluate(() => ({ x: window.screenX + (window.outerWidth - window.innerWidth), y: window.screenY + (window.outerHeight - window.innerHeight) }));
  execFileSync('python3', [path.join(path.dirname(new URL(import.meta.url).pathname), 'warp.py'), String(Math.round(offset.x + box.x + box.width / 2)), String(Math.round(offset.y + box.y + box.height / 2))]);
  await page.waitForTimeout(2500);
  execFileSync('import', ['-window', 'root', path.join(out, `${s.name}--3d-control-hovered.png`)]);
  await button.focus();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, `${s.name}--3d-control-focused.png`), clip: { x: box.x - 260, y: box.y - 120, width: box.width + 520, height: box.height + 160 } });
  if (s.name === 'estate') {
    await page.locator('.sidebar-details > summary').click();
    const heading = page.locator("details[data-tuning-perspective='3d']:has(#tuning-force-hops) > summary");
    await heading.scrollIntoViewIfNeeded();
    await heading.click();
    await page.waitForTimeout(300);
    const at = await heading.boundingBox();
    execFileSync('python3', [path.join(path.dirname(new URL(import.meta.url).pathname), 'warp.py'), String(Math.round(offset.x + at.x + 40)), String(Math.round(offset.y + at.y + at.height / 2))]);
    await page.waitForTimeout(2500);
    execFileSync('import', ['-window', 'root', path.join(out, `${s.name}--tuning-3d-layout-hovered.png`)]);
  }
  const facts = await button.evaluate(el => ({ ariaDisabled: el.getAttribute('aria-disabled'), pressed: el.getAttribute('aria-pressed'), title: el.title, disabled: el.disabled }));
  const snapshot = await page.locator('.perspective-controls').ariaSnapshot();
  const address = page.url();
  report.push({ subject: s.name, errors, facts, address, snapshot });
  await context.close();
}
fs.writeFileSync(path.join(out, 'facts.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
await browser.close();
server.close();
xvfb.kill();


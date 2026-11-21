// A first look at the built Explorer as a machine without a graphics card would run it: WebGL drawn in software, the
// processor throttled, and once with WebGL refused. Root's scratch probe of 2026-11-21; it changes nothing and is run
// through the browser lane. Usage: node probe.mjs <repository> <out folder>
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out] = process.argv.slice(2);
const require = createRequire(path.join(repo, 'package.json'));
const { chromium } = require('@playwright/test');
const { browserLaunchOptions } = await import(path.join(repo, 'tests/e2e/browser-launch.ts')).catch(() => ({ browserLaunchOptions: null }));
fs.mkdirSync(out, { recursive: true });
const root = path.join(repo, 'dist/explorer');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.map': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }); fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(8771, '127.0.0.1', r));
const base = 'http://127.0.0.1:8771';
const subjects = [
  { name: 'estate-2d', url: `${base}/samples/estate/?view=local&mode=2d&node=${encodeURIComponent('PaymentService/PaymentService.cs')}` },
  { name: 'estate-3d', url: `${base}/samples/estate/?view=local&mode=3d&node=${encodeURIComponent('PaymentService/PaymentService.cs')}` },
  { name: 'repo-2d',   url: `${base}/?view=local&mode=2d&node=${encodeURIComponent('packages/engine/src/live-docs/graph.ts')}` },
  { name: 'repo-3d',   url: `${base}/?view=local&mode=3d&node=${encodeURIComponent('packages/engine/src/live-docs/graph.ts')}` },
];
const card = browserLaunchOptions ? browserLaunchOptions() : {};
const conditions = [
  { name: 'card',        launch: card, throttle: 1 },
  { name: 'software-4x', launch: {}, throttle: 4 },
  { name: 'software-6x', launch: {}, throttle: 6 },
  { name: 'no-webgl',    launch: { args: ['--disable-3d-apis'] }, throttle: 1 },
];
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const rows = [];
for (const c of conditions) {
  if (only && !only.includes(c.name)) continue;
  const browser = await chromium.launch(c.launch);
  for (const s of subjects) {
    if (c.name === 'no-webgl' && !s.name.startsWith('estate')) continue;
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    const cdp = await page.context().newCDPSession(page);
    if (c.throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: c.throttle });
    await page.addInitScript(() => {
      window.__f = []; window.__long = 0;
      const tick = t => { window.__f.push(t); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
      try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__long += e.duration; }).observe({ type: 'longtask', buffered: true }); } catch {}
    });
    const t0 = Date.now();
    let navError = null;
    await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => { navError = String(e.message).slice(0, 120); });
    const shots = [3, 12];
    const stats = [];
    for (const at of shots) {
      const wait = at * 1000 - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
      await page.screenshot({ path: path.join(out, `${c.name}--${s.name}--${at}s.png`) }).catch(() => {});
      stats.push(await page.evaluate(() => {
        const f = window.__f || []; const now = performance.now();
        const last = f.filter(t => t > now - 2000).length / 2;
        const gl = (() => { try { const k = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl'); if (!k) return 'none'; const e = k.getExtension('WEBGL_debug_renderer_info'); return e ? k.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'webgl'; } catch (e) { return 'error'; } })();
        return { frames: f.length, fpsLast2s: last, longTaskMs: Math.round(window.__long || 0), heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, gl,
          busy: document.querySelector('[aria-busy="true"]') ? true : false, building: document.querySelector('[data-building]') ? true : false,
          canvases: document.querySelectorAll('canvas').length, cards: document.querySelectorAll('[data-card], .lm-card, .local-map-card, [data-node-id]').length, text: (document.body.innerText || '').length };
      }).catch(e => ({ error: String(e.message).slice(0, 100) })));
    }
    rows.push({ condition: c.name, subject: s.name, navError, at3s: stats[0], at12s: stats[1], errors: errors.slice(0, 4) });
    console.log(JSON.stringify(rows[rows.length - 1]));
    await page.close();
  }
  await browser.close();
}
fs.writeFileSync(path.join(out, 'rows.json'), JSON.stringify(rows, null, 1));
server.close();

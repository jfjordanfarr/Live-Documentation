// Pictures and motion of the default arrival of 2026-11-22 (Reading, Then Neighbours, Look After; Arrival Waits, While
// Pointed At Or Focused; Arrival Rest 1.5 s) and of a wire's words entered by the pointer, at 1,280 by 800, with nothing
// chosen in Tuning but the continuing search off. Run through the browser lane, on a built site:
//   node scripts/browser-lane.mjs --label arrival -- npx tsx <this file> <repository> <out folder> [jobs, comma-separated]
// Jobs: pointer, focus, wire. A screenshot draws no cursor, so the page is given a ring that follows the pointer; it is
// the script's, not the product's. Each strip is eight frames of the browser's own screencast across the ease.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [repo, out, jobsArg] = process.argv.slice(2);
const jobs = (jobsArg ?? 'pointer,focus,wire').split(',');
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
const port = Number(process.env.PORT ?? 8792);
await new Promise(r => server.listen(port, '127.0.0.1', r));
const base = `http://127.0.0.1:${port}`;
const SUBJECTS = {
  estate: { address: `${base}/samples/estate/?view=local&node=${encodeURIComponent('PaymentService/Data/PaymentsContext.cs')}`, id: 'PaymentService/Data/PaymentsContext.cs' },
  repo: { address: `${base}/?view=local&node=${encodeURIComponent('packages/engine/src/live-docs/pathfind.ts')}`, id: 'packages/engine/src/live-docs/pathfind.ts' }
};
const report = {};
const browser = await chromium.launch(browserLaunchOptions());

async function open(address) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, tuning }) => localStorage.setItem(key, tuning), { key: PERSISTED_UI_KEY, tuning: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
  await context.addInitScript(() => {
    // The pointer's ring, and every frame's time, scale, look and what the map says of its arrival.
    const ring = document.createElement('div');
    ring.style.cssText = 'position:fixed;z-index:99999;width:18px;height:18px;margin:-9px 0 0 -9px;border:2px solid #ff4fd8;border-radius:50%;pointer-events:none;display:none';
    document.addEventListener('DOMContentLoaded', () => document.body.append(ring));
    document.addEventListener('pointermove', event => { ring.style.display = 'block'; ring.style.left = `${event.clientX}px`; ring.style.top = `${event.clientY}px`; }, true);
    const log = window.__frames = [];
    const tick = t => {
      const map = document.querySelector('#map-container'), viewport = document.querySelector('#map-viewport');
      const k = Number((viewport?.style.transform.match(/scale\(([\d.e-]+)\)/) ?? [])[1]);
      if (map?.dataset.look && Number.isFinite(k)) log.push({ t, k, look: map.dataset.look, arrival: map.dataset.arrival ?? null });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const cdp = await context.newCDPSession(page);
  const shots = [];
  cdp.on('Page.screencastFrame', frame => { shots.push({ ts: frame.metadata.timestamp, data: frame.data }); cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {}); });
  await page.goto(address);
  return { context, page, cdp, shots, errors };
}
const says = (page, word, timeout = 30000) => page.waitForFunction(w => (document.querySelector('#map-container')?.dataset.arrival ?? null) === w, word, { timeout, polling: 30 });
const settled = page => page.waitForFunction(() => {
  const map = document.querySelector('#map-container'), placed = map?.querySelector('.local-placed');
  return !!placed && map.dataset.camera !== 'moving' && placed.dataset.moving !== 'true' && placed.dataset.searchStatus !== 'running';
}, undefined, { timeout: 60000 });
const rest = async page => { await settled(page); await page.waitForTimeout(500); await settled(page); };
const card = id => `#map-container .node-card[data-id="${id}"]`;

/** The screencast from a wall-clock moment on, as a strip of eight frames with each frame's time after the first. */
function strip(shots, fromWall, toWall, file) {
  const inside = shots.filter(s => s.ts >= fromWall && s.ts <= toWall);
  if (inside.length < 2) return { frames: inside.length };
  const pick = [...new Set(Array.from({ length: 8 }, (_, i) => inside[Math.round(i * (inside.length - 1) / 7)]))];
  const dir = `${file}--frames`; fs.mkdirSync(dir, { recursive: true });
  const args = [];
  pick.forEach((s, i) => { const f = path.join(dir, `${i}.jpg`); fs.writeFileSync(f, Buffer.from(s.data, 'base64')); args.push('-label', `+${Math.round((s.ts - fromWall) * 1000)} ms`, f); });
  execFileSync('montage', [...args, '-tile', '4x2', '-geometry', '+4+4', '-pointsize', '14', '-background', '#333', '-fill', 'white', file]);
  fs.rmSync(dir, { recursive: true });
  return { frames: inside.length, gaps: inside.slice(1).map((s, i) => Math.round((s.ts - inside[i].ts) * 1000)) };
}

/** The frames the page drew from a page-clock moment on: how many while the scale changed, their longest gap, and the looks. */
async function ease(page, since) {
  const frames = (await page.evaluate(() => window.__frames)).filter(f => f.t >= since);
  const first = frames.findIndex((f, i) => i > 0 && f.k < frames[i - 1].k - 1e-6);
  if (first < 0) return null;
  let last = first; for (let i = first; i < frames.length; i++) if (f(i) < f(i - 1) - 1e-6) last = i;
  function f(i) { return frames[i].k; }
  const moving = frames.slice(first - 1, last + 1), gaps = moving.slice(1).map((x, i) => +(x.t - moving[i].t).toFixed(1));
  const change = frames.findIndex((x, i) => i > 0 && x.look !== frames[i - 1].look);
  return { beganAfter: +(frames[first].t - since).toFixed(0), ms: +(moving.at(-1).t - moving[0].t).toFixed(0), frames: gaps.length, worst: Math.max(...gaps), fromK: +moving[0].k.toFixed(3), toK: +moving.at(-1).k.toFixed(3),
    looksInMotion: [...new Set(moving.slice(1, -1).map(x => x.look))], lookChange: change < 0 ? null : { afterEaseEnd: +(frames[change].t - moving.at(-1).t).toFixed(0), frame: +(frames[change].t - frames[change - 1].t).toFixed(1), to: frames[change].look } };
}

for (const [name, subject] of Object.entries(SUBJECTS)) {
  for (const how of ['pointer', 'focus'].filter(job => jobs.includes(job))) {
    const { context, page, cdp, shots, errors } = await open(subject.address);
    await page.waitForSelector(card(subject.id), { timeout: 60000 });
    await says(page, 'resting');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(out, `${name}--${how}--1-lands.png`) });
    const landed = await page.evaluate(() => performance.now());
    if (how === 'pointer') {
      const box = await page.locator(`${card(subject.id)} .local-file-name`).boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 });
    } else {
      await page.locator(`${card(subject.id)} .local-file-name`).focus();
    }
    await says(page, 'waiting');
    const waitedFrom = await page.evaluate(() => performance.now());
    // Four seconds on the card, well past the rest: the picture has not moved.
    await page.waitForTimeout(4000);
    const held = await page.evaluate(() => ({ arrival: document.querySelector('#map-container').dataset.arrival ?? null, camera: document.querySelector('#map-container').dataset.camera ?? null, k: window.__frames.at(-1).k, look: window.__frames.at(-1).look }));
    await page.screenshot({ path: path.join(out, `${name}--${how}--2-waits.png`) });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, maxWidth: 640, maxHeight: 400, everyNthFrame: 1 });
    await page.waitForTimeout(150);
    const sync = await page.evaluate(() => ({ now: performance.now(), wall: Date.now() / 1000 }));
    // Counted from just before the pointer or the focus begins to leave, so the time to the ease's first frame holds the leaving itself.
    const let_go = await page.evaluate(() => performance.now());
    if (how === 'pointer') await page.mouse.move(6, 792, { steps: 4 });
    else for (let i = 0; i < 6 && await page.evaluate(id => !!document.activeElement?.closest(`.node-card[data-id="${CSS.escape(id)}"]`), subject.id); i++) await page.keyboard.press('Shift+Tab');
    await page.waitForFunction(() => !document.querySelector('#map-container').dataset.arrival, undefined, { timeout: 30000, polling: 30 });
    await page.waitForTimeout(900);
    await cdp.send('Page.stopScreencast');
    await rest(page);
    await page.screenshot({ path: path.join(out, `${name}--${how}--3-released.png`) });
    const motion = await ease(page, sync.now);
    const from = sync.wall + (let_go - sync.now) / 1000;
    const cast = strip(shots, from - 0.1, from + ((motion?.beganAfter ?? 0) + (motion?.ms ?? 700)) / 1000 + 0.6, path.join(out, `${name}--${how}--release--strip.png`));
    report[`${name}--${how}`] = { landedToWaiting: +(waitedFrom - landed).toFixed(0), held, releasedAfterLeaving: motion ? +(motion.beganAfter - (let_go - sync.now)).toFixed(0) : null, motion, cast, errors };
    console.log(name, how, JSON.stringify(report[`${name}--${how}`]));
    await context.close();
  }
  if (jobs.includes('wire')) {
    const { context, page, errors } = await open(subject.address);
    await page.waitForSelector(card(subject.id), { timeout: 60000 });
    await page.waitForFunction(() => window.__frames?.some(f => f.arrival === 'resting'), undefined, { timeout: 30000 });
    await rest(page);
    const wire = await page.evaluate(() => {
      const view = document.querySelector('#view-map').getBoundingClientRect();
      for (const band of document.querySelectorAll('.wire-band:not(.run-band)')) for (const at of [0.5, 0.4, 0.6, 0.3, 0.7]) {
        const point = band.getPointAtLength(band.getTotalLength() * at).matrixTransform(band.getScreenCTM());
        if (point.x > view.left + 60 && point.x < view.right - 380 && point.y > view.top + 80 && point.y < view.bottom - 200 && document.elementFromPoint(point.x, point.y) === band) return { x: point.x, y: point.y, name: band.getAttribute('aria-label') };
      }
      return null;
    });
    if (!wire) { report[`${name}--wire`] = { errors: ['no wire in view'] }; await context.close(); continue; }
    await page.mouse.move(wire.x - 40, wire.y - 40);
    await page.mouse.move(wire.x, wire.y, { steps: 4 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, `${name}--wire--1-rested.png`) });
    const panel = await page.evaluate(() => { const r = document.querySelector('.wire-answer').getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, hidden: document.querySelector('.wire-answer').hidden }; });
    // Half way across the gap, then inside.
    const to = { x: (panel.left + panel.right) / 2, y: (panel.top + panel.bottom) / 2 };
    const edge = { x: Math.max(panel.left, Math.min(panel.right, wire.x)), y: Math.max(panel.top, Math.min(panel.bottom, wire.y)) };
    await page.mouse.move((wire.x + edge.x) / 2, (wire.y + edge.y) / 2, { steps: 3 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, `${name}--wire--2-on-the-way.png`) });
    const onTheWay = await page.evaluate(() => !document.querySelector('.wire-answer').hidden);
    await page.mouse.move(to.x, to.y, { steps: 6 });
    const head = await page.locator('.wire-answer .h').boundingBox();
    await page.mouse.move(head.x + 1, head.y + head.height / 2);
    await page.mouse.down();
    await page.mouse.move(head.x + head.width - 1, head.y + head.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `${name}--wire--3-inside-selected.png`) });
    const selected = await page.evaluate(() => getSelection()?.toString() ?? '');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `${name}--wire--4-escape.png`) });
    const dismissed = await page.evaluate(() => document.querySelector('.wire-answer').hidden);
    report[`${name}--wire`] = { wire, gap: +Math.hypot(edge.x - wire.x, edge.y - wire.y).toFixed(0), onTheWay, selected, dismissed, errors };
    console.log(name, 'wire', JSON.stringify(report[`${name}--wire`]));
    await context.close();
  }
}
fs.writeFileSync(path.join(out, 'shots.json'), JSON.stringify(report, null, 1));
await browser.close();
server.close();

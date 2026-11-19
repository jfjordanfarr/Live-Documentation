// A frame strip across a look's edge: Chromium's screencast during eight wheel notches out from the reading look, the
// frames around the change of look laid side by side, each labelled with its time since the one before (a screencast
// sends a frame only when the picture changes, so a long label is a frame the page did not draw in time). The strip is
// drawn in a page's canvas and written as one PNG. PORT (8827), BASE (`/`), SUBJECT, OUT (the PNG), COUNT (frames, 8).
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapSettled } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const { browserLaunchOptions } = require(path.join(root, 'tests/e2e/browser-launch.ts'));
const port = process.env.PORT || '8827', base = process.env.BASE || '/';
const subject = process.env.SUBJECT || 'packages/engine/src/live-docs/pathfind.ts';
const count = Number(process.env.COUNT || 8);
(async () => {
  const browser = await chromium.launch(browserLaunchOptions());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
  await page.goto(`http://127.0.0.1:${port}${base}?view=local&node=${encodeURIComponent(subject)}`);
  await page.locator(`.node-card[data-id="${subject}"]`).waitFor({ timeout: 60_000 });
  await localMapSettled(page, 60_000); await page.waitForTimeout(600);
  // The look on the container, sampled by the page at every frame it draws, with the time on the same clock as the
  // screencast's (seconds since the epoch).
  await page.evaluate(() => { window.__looks = []; const tick = () => { window.__looks.push([(performance.timeOrigin + performance.now()) / 1000, document.querySelector('#map-container')?.dataset.look]); requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => { frames.push({ data, t: metadata.timestamp }); await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: 720, maxHeight: 450, everyNthFrame: 1 });
  const box = await page.locator('#view-map').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let n = 0; n < 8; n++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(60); }
  await localMapSettled(page, 60_000); await page.waitForTimeout(500);
  await cdp.send('Page.stopScreencast');
  const looks = await page.evaluate(() => window.__looks);
  const change = looks.find((entry, i) => i > 0 && entry[1] !== looks[i - 1][1]);
  if (!change) throw new Error('no change of look');
  // The frames from three before the change to the rest after it, up to COUNT.
  const first = Math.max(0, frames.findIndex(frame => frame.t >= change[0]) - 3);
  const picked = frames.slice(first, first + count);
  // Drawn in a blank page: the Explorer's own page allows no image but its own site's.
  const blank = await browser.newPage();
  const strip = await blank.evaluate(async picked => {
    const images = await Promise.all(picked.map(frame => new Promise(resolve => { const image = new Image(); image.onload = () => resolve(image); image.src = `data:image/jpeg;base64,${frame.data}`; })));
    const w = images[0].width, h = images[0].height, columns = 4, rows = Math.ceil(images.length / columns);
    const canvas = document.createElement('canvas'); canvas.width = columns * w; canvas.height = rows * (h + 28);
    const g = canvas.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, canvas.width, canvas.height);
    images.forEach((image, i) => {
      const x = (i % columns) * w, y = Math.floor(i / columns) * (h + 28);
      g.drawImage(image, x, y + 28);
      g.fillStyle = '#000'; g.font = '18px sans-serif';
      g.fillText(`${i + 1}: ${picked[i].gap === null ? 'first' : `${picked[i].gap} ms after the one before`}${picked[i].look ? ' · ' + picked[i].look : ''}`, x + 8, y + 20);
    });
    return canvas.toDataURL('image/png').split(',')[1];
  }, picked.map((frame, i) => {
    const index = first + i, previous = frames[index - 1];
    const look = [...looks].reverse().find(entry => entry[0] <= frame.t)?.[1];
    return { data: frame.data, gap: previous ? Math.round((frame.t - previous.t) * 1000) : null, look };
  }));
  fs.writeFileSync(process.env.OUT, Buffer.from(strip, 'base64'));
  console.log('strip', process.env.OUT, picked.length, 'frames;', 'gaps', picked.map((frame, i) => frames[first + i - 1] ? Math.round((frame.t - frames[first + i - 1].t) * 1000) : 0).join(', '));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

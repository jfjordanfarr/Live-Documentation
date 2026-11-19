// The picture at rest in each look, reached each way, for comparing two bundles pixel by pixel: arrival (reading), three
// Zoom Out presses (connections, from reading), four more (overview, from connections), four Zoom In presses
// (connections, from overview) and three more (reading, from connections). After each, the map's rest and 700 ms more,
// past the 160 ms cross-fade and its end at 200 ms. Writes PNGs to OUT_DIR as <name>-<n>-<look>.png.
// PORT (8827), OUT_DIR, and the subjects: SUBJECTS as name=base|file,... (default this repository's pathfind.ts and the
// estate's PaymentsContext.cs). With COMPARE=dirA,dirB instead, compares the PNGs of the same names in the two
// directories in a page's canvas and prints the differing pixels and the largest channel difference of each.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = require(path.join(root, 'packages/explorer/src/client/persistence/local-storage.ts'));
const { localMapStill } = require(path.join(root, 'tests/e2e/still-picture.ts'));
const { browserLaunchOptions } = require(path.join(root, 'tests/e2e/browser-launch.ts'));
const port = process.env.PORT || '8827';
const subjects = (process.env.SUBJECTS || 'repo-pathfind=/|packages/engine/src/live-docs/pathfind.ts,estate-payments-context=/samples/estate/|PaymentService/Data/PaymentsContext.cs')
  .split(',').map(s => { const [name, rest] = s.split('='); const [base, file] = rest.split('|'); return { name, base, file }; });
const steps = [['arrival', null, 0], ['out3', 'Zoom Out', 3], ['out7', 'Zoom Out', 4], ['in4', 'Zoom In', 4], ['in7', 'Zoom In', 3]];

async function pictures() {
  const out = process.env.OUT_DIR; fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(browserLaunchOptions());
  for (const { name, base, file } of subjects) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
    await page.goto(`http://127.0.0.1:${port}${base}?view=local&node=${encodeURIComponent(file)}`);
    await page.locator(`.node-card[data-id="${file}"]`).waitFor({ timeout: 60_000 });
    for (const [step, button, presses] of steps) {
      for (let i = 0; i < presses; i++) { await page.getByRole('button', { name: button, exact: true }).click(); await page.waitForTimeout(250); }
      await localMapStill(page); await page.waitForTimeout(700);
      const look = await page.evaluate(() => document.querySelector('#map-container')?.dataset.look ?? '');
      // The pointer away from the map, so that no hover differs between runs.
      await page.mouse.move(1, 1); await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(out, `${name}-${step}-${look}.png`) });
      // What the map draws, element by element, independent of the raster: each element's box on screen and the styles
      // that decide whether and how it shows.
      const drawn = await page.evaluate(() => [...document.querySelectorAll('#map-container *')].map(element => {
        const r = element.getBoundingClientRect(), s = getComputedStyle(element);
        const pseudo = ['::before', '::after'].map(p => { const q = getComputedStyle(element, p); return q.content === 'none' ? '' : `${q.content}|${q.opacity}|${q.transform}|${q.width}`; }).join('/');
        return `${element.tagName}.${element.getAttribute('class') ?? ''} ${r.left.toFixed(2)},${r.top.toFixed(2)},${r.width.toFixed(2)},${r.height.toFixed(2)} ${s.display} ${s.visibility} ${s.opacity} ${s.transform} ${s.scale} ${s.fontSize} ${s.color} ${pseudo}`;
      }));
      fs.writeFileSync(path.join(out, `${name}-${step}-${look}.json`), JSON.stringify(drawn));
      console.log(name, step, look);
    }
    await context.close();
  }
  await browser.close();
}

async function compare() {
  const [a, b] = process.env.COMPARE.split(',');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const file of fs.readdirSync(a).filter(f => f.endsWith('.png')).sort()) {
    if (!fs.existsSync(path.join(b, file))) { console.log(file, 'missing in', b); continue; }
    const result = await page.evaluate(async ([x, y]) => {
      const load = src => new Promise(resolve => { const image = new Image(); image.onload = () => resolve(image); image.src = src; });
      const [i, j] = await Promise.all([load(x), load(y)]);
      if (i.width !== j.width || i.height !== j.height) return { size: true };
      const data = image => { const c = document.createElement('canvas'); c.width = image.width; c.height = image.height; const g = c.getContext('2d'); g.drawImage(image, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
      const p = data(i), q = data(j);
      let pixels = 0, most = 0, left = Infinity, top = Infinity, right = -1, bottom = -1;
      for (let k = 0; k < p.length; k += 4) {
        const d = Math.max(Math.abs(p[k] - q[k]), Math.abs(p[k + 1] - q[k + 1]), Math.abs(p[k + 2] - q[k + 2]));
        if (!d) continue;
        pixels++; most = Math.max(most, d);
        const x = (k / 4) % i.width, y = Math.floor(k / 4 / i.width);
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      return pixels ? { pixels, most, box: [left, top, right, bottom] } : { pixels, most };
    }, [`data:image/png;base64,${fs.readFileSync(path.join(a, file)).toString('base64')}`, `data:image/png;base64,${fs.readFileSync(path.join(b, file)).toString('base64')}`]);
    const dump = file.replace(/\.png$/, '.json');
    let elements = '';
    if (fs.existsSync(path.join(a, dump)) && fs.existsSync(path.join(b, dump))) {
      const x = JSON.parse(fs.readFileSync(path.join(a, dump))), y = JSON.parse(fs.readFileSync(path.join(b, dump)));
      const differ = x.length === y.length ? x.filter((line, i) => line !== y[i]) : null;
      elements = differ === null ? ` elements: ${x.length} against ${y.length}` : ` elements: ${differ.length} of ${x.length} differ${differ.length ? ', first: ' + differ[0].slice(0, 160) + ' | ' + y[x.indexOf(differ[0])].slice(0, 160) : ''}`;
    }
    console.log(file, JSON.stringify(result) + elements);
  }
  await browser.close();
}

(process.env.COMPARE ? compare() : pictures()).catch(e => { console.error(e); process.exit(1); });

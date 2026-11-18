// Assemble the crops internals-held.cjs saved into the November 6 README's two composites: the forms at reading scale
// side by side, and a row a form at three presses. The crops are drawn at their own pixels (device scale 2) on a dark
// page with a caption each; nothing in them is scaled. Run from the repository root with DIR (the folder of the crops).
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const dir = process.env.DIR; const name = process.env.NAME || 'card-factory';
const forms = (process.env.FORMS || 'as-built,H,C1,C2,C3').split(',');
const titles = { 'as-built': 'As built', H: 'H. Held', C1: 'C1. Square at the dot’s size', C2: 'C2. Square half again as large', C3: 'C3. Square on the card’s surface' };
const crop = (form, press) => fs.readdirSync(dir).find(file => file.startsWith(`${name}-${form}-${String(press).padStart(2, '0')}-`) && !/-(whole|panned)\.png$/.test(file));
const image = (file) => `<img src="data:image/png;base64,${fs.readFileSync(path.join(dir, file)).toString('base64')}" style="width:${sizeOf(file).w / 2}px;height:${sizeOf(file).h / 2}px">`;
const sizeOf = (file) => { const b = fs.readFileSync(path.join(dir, file)); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
const style = '<style>body{margin:0;background:#141414;color:#eee;font:600 15px/1.3 sans-serif}figure{margin:0 6px 10px}figcaption{padding:10px 2px 8px}.row{display:flex;align-items:flex-start;gap:8px}.wrap{display:flex;flex-wrap:wrap;width:max-content;max-width:1720px}</style>';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 2 });
  const save = async (html, file) => { await page.setContent(`<!doctype html>${style}<body>${html}</body>`); await page.screenshot({ path: path.join(dir, file), fullPage: true }); };
  const presses = (process.env.OUTER || '3,6,8').split(',').map(Number);
  await save(`<div class="wrap">${forms.map(form => `<figure><figcaption>${titles[form]}</figcaption>${image(crop(form, 0))}</figure>`).join('')}</div>`, 'forms-reading.png');
  await save(forms.map((form, index) => `<figure><figcaption>${titles[form]}${index === 0 ? '&nbsp;&nbsp; (three, six and eight presses out: the middle, far and overview bands)' : ''}</figcaption><div class="row">${presses.map(press => image(crop(form, press))).join('')}</div></figure>`).join(''), 'forms-zoomed-out.png');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

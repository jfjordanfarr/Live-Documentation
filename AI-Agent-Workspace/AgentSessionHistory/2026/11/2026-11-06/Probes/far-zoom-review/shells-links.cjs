// Load yesterday's shells links on the served bundle, wait for the 3D picture to rest, and take the pictures.
const path = require('node:path'); const fs = require('node:fs'); const root = process.cwd();
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const rec = fs.readFileSync(path.join(root, 'AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md'), 'utf8');
const link = letter => { const m = rec.match(new RegExp(`^- ${letter}, [^\\n]*?(http://localhost:8900/\\S+)`, 'm')); if (!m) throw new Error('no link ' + letter); return m[1].replace('localhost', '127.0.0.1'); };
const out = process.env.OUT;
(async () => {
  const browser = await chromium.launch();
  for (const letter of (process.env.LINKS || 'A,B').split(',')) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    const t0 = Date.now(); await page.goto(link(letter));
    await page.locator('#graph-svg[aria-busy="false"]').waitFor({ timeout: 240000 }).catch(() => console.log(letter, 'did not report rest in 240 s'));
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => { const g = document.querySelector('#graph-svg'); return { settings: g && g.getAttribute('data-layout-settings'), busy: g && g.getAttribute('aria-busy'), labels: document.querySelectorAll('.graph-label, .force-label, [data-graph-label]').length, legend: [...document.querySelectorAll('#legend li, .legend-row, .legend li')].map(e => e.textContent.trim()).slice(0, 12) }; });
    console.log(letter, 'rest after', ((Date.now() - t0) / 1000).toFixed(1), 's', JSON.stringify(info).slice(0, 700));
    await page.screenshot({ path: path.join(out, `shells-${letter}.png`) });
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
import crypto from 'node:crypto';
import snapshots from '../../../packages/explorer/src/client/persistence/compressed-url-state.ts';
import pictures from '../../../tests/e2e/still-picture.ts';
const { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } = snapshots;
const { localMapSettled } = pictures;
const out = 'AI-Agent-Workspace/Screenshots/2026-11-08/contained-spheres';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const readings = [], errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, recordVideo: { dir: 'AI-Agent-Workspace/tmp/2026-11-08-astra-review/video', size: { width: 1440, height: 960 } } });
  const page = await context.newPage(), video = page.video();
  page.on('pageerror', error => errors.push(String(error)));
  const target = compressSnapshot({ ...DEFAULT_SNAPSHOT, spatialLayout: 'structure', openDirectories: new Set(['Portal']), layout: { forceGraph: { groupWrappers: 'skin', hops: 1 } } });
  await page.goto('http://localhost:8911/samples/estate/?s=' + target);
  const asset = await (await page.request.get('http://localhost:8911/static/index.js')).body();
  const snapshot = () => { const s = decompressSnapshot(new URL(page.url()).searchParams.get('s')); return { selectedNodeId: s.selectedNodeId, pins: s.pinSet, directories: [...s.openDirectories] }; };
  const shot = async name => { await page.screenshot({ path: out + '/' + name + '.png' }); readings.push({ name, at: Date.now(), state: snapshot() }); };
  const rest3d = async () => { await expect(page.locator('.perspective-transition')).toHaveCount(0); await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy', 'false', { timeout: 25000 }); };
  const perspective = async (name, key) => { const start = Date.now(); await page.getByRole('button', { name: key, exact: true }).click(); await expect(page.locator('.perspective-transition')).toBeVisible(); await expect(page.locator('.perspective-transition')).toHaveCount(0); if (key === '3D') await rest3d(); else await localMapSettled(page); await shot(name); readings.at(-1).elapsedIncludingCapture = Date.now() - start; };
  const empty = async () => {
    const box = await page.locator('#graph-svg canvas').boundingBox();
    for (const [x, y] of [[.12,.8],[.8,.15],[.15,.15],[.8,.8],[.5,.15],[.12,.5]]) {
      const point = { x: box.x + box.width * x, y: box.y + box.height * y };
      await page.mouse.move(point.x, point.y);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      if (await page.locator('#graph-svg').getAttribute('data-hovered-node') === 'false') return point;
    }
    throw new Error('No observed empty canvas point for the normal camera gesture');
  };
  const look = async value => {
    const field = page.locator('#tuning-force-group-wrappers'), parents = field.locator('xpath=ancestor::details');
    for (let i = 0; i < await parents.count(); i++) if (await parents.nth(i).getAttribute('open') === null) await parents.nth(i).locator(':scope > summary').click();
    await field.selectOption(value);
    await parents.first().locator(':scope > summary').click();
    await rest3d();
  };
  await localMapSettled(page); await shot('root-source-2d'); const before = snapshot();
  await perspective('root-skin-arrival', '3D');
  const capabilities = await page.locator('#graph-svg canvas').evaluate(canvas => { const gl = canvas.getContext('webgl2'); return { samples: gl.getParameter(gl.SAMPLES), sampleVariables: !!gl.getExtension('OES_sample_variables'), sampleInterpolation: !!gl.getExtension('OES_shader_multisample_interpolation'), dpr: devicePixelRatio, backing: [canvas.width, canvas.height] }; });
  let point = await empty(); await page.mouse.down(); await page.mouse.move(point.x + 75, point.y + 25, { steps: 12 }); await page.mouse.up();
  point = await empty(); await page.mouse.down({ button: 'right' }); await page.mouse.move(point.x + 50, point.y - 20, { steps: 12 }); await page.mouse.up({ button: 'right' });
  point = await empty(); await page.mouse.wheel(0, -180); await page.waitForTimeout(300);
  await shot('root-skin-camera-gestures');
  await perspective('root-skin-return-2d', '2D');
  await perspective('root-skin-return-3d', '3D');
  await look('cloud'); await shot('root-cloud-3d');
  await perspective('root-cloud-return-2d', '2D');
  await perspective('root-cloud-return-3d', '3D');
  await look('skin'); await shot('root-skin-final');
  const after = snapshot();
  const report = { clock: 'real, unmodified; normal UI gestures and normal search; no routes or scene manipulation', viewport: '1440x960', assetSha256: crypto.createHash('sha256').update(asset).digest('hex'), before, after, capabilities, errors, readings };
  fs.writeFileSync(out + '/root-journey.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ before, after, capabilities, errors, assetSha256: report.assetSha256, stages: readings.map(({ name, elapsedIncludingCapture }) => ({ name, elapsedIncludingCapture })) }));
  await context.close(); fs.copyFileSync(await video.path(), out + '/root-journey.webm');
} finally { await browser.close(); }

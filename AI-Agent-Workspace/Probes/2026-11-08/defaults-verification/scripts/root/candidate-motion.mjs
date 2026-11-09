import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
import snapshots from '../../../packages/explorer/src/client/persistence/compressed-url-state.ts';
import pictures from '../../../tests/e2e/still-picture.ts';

const { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } = snapshots;
const { localMapSettled } = pictures;
const out = 'AI-Agent-Workspace/Screenshots/2026-11-08/skin-defaults';
const stem = process.argv[2] ?? 'portal-root';
const target = compressSnapshot({ ...DEFAULT_SNAPSHOT, spatialLayout: 'structure', openDirectories: new Set(['Portal']),
  layout: { forceGraph: { groupWrappers: 'skin', hops: 1 } } });
const browser = await chromium.launch({ headless: true });
const readings = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 },
    recordVideo: { dir: 'AI-Agent-Workspace/tmp/2026-11-08-astra-review/video', size: { width: 1440, height: 960 } } });
  const page = await context.newPage();
  const video = page.video();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(`http://localhost:8911/samples/estate/?s=${target}`);
  await localMapSettled(page);
  await page.screenshot({ path: `${out}/${stem}-source.png` });
  const snapshot = () => {
    const s = new URL(page.url()).searchParams.get('s');
    const data = decompressSnapshot(s);
    return { selectedNodeId: data.selectedNodeId, pins: data.pinSet, directories: [...data.openDirectories] };
  };
  const before = snapshot();
  for (const [direction, button] of [['out', '3D'], ['back', '2D']]) {
    const started = Date.now();
    await page.getByRole('button', { name: button, exact: true }).click();
    const layer = page.locator('.perspective-transition[data-graph-files]');
    await expect(layer).toBeVisible();
    for (const [step, phase] of [[1, 0.25], [2, 0.55], [3, 0.8]]) {
      await page.waitForFunction(phase => {
        const layer = document.querySelector('.perspective-transition[data-graph-files]');
        return !layer || Number(layer.dataset.progress) >= phase;
      }, phase);
      if (!await layer.count()) break;
      const beforeCapture = await layer.evaluate(layer => ({ progress: Number(layer.dataset.progress),
        labels: [...layer.querySelectorAll('.perspective-file-name')].map(label => ({ id: label.dataset.nodeId,
          opacity: label.style.opacity, left: label.style.left, top: label.style.top })) }));
      const name = `${stem}-${direction}-${step}.png`;
      await page.screenshot({ path: `${out}/${name}` });
      readings.push({ direction, name, beforeCapture, elapsedWithCapture: Date.now() - started });
    }
    await expect(layer).toHaveCount(0);
    if (direction === 'out') await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy', 'false', { timeout: 25_000 });
    else await localMapSettled(page);
    await page.screenshot({ path: `${out}/${stem}-${direction}-rest.png` });
    readings.push({ direction, rest: true, elapsed: Date.now() - started, snapshot: snapshot() });
  }
  const after = snapshot();
  fs.writeFileSync(`${out}/${stem}-motion.json`, JSON.stringify({ clock: 'real; unmodified', viewport: '1440x960',
    url: page.url(), before, after, errors, readings }, null, 2) + '\n');
  console.log(JSON.stringify({ before, after, errors, captured: readings.map(({ name, direction, elapsed, elapsedWithCapture }) => ({ name, direction, elapsed, elapsedWithCapture })) }));
  await context.close();
  fs.copyFileSync(await video.path(), `${out}/${stem}-roundtrip.webm`);
} finally { await browser.close(); }

import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
import crypto from 'node:crypto';
import state from '../../../packages/explorer/src/client/persistence/compressed-url-state.ts';
import pins from '../../../packages/explorer/src/client/views/pin-state.ts';
const out = 'AI-Agent-Workspace/Screenshots/2026-11-08/skin-defaults';
const subjects = {
  defaults: 'packages/explorer/src/client/persistence/local-storage.ts',
  scene: 'packages/explorer/src/client/views/perspectiveBodies.ts',
  types: 'packages/engine/src/live-docs/symbolExtraction.ts',
  search: 'packages/explorer/src/client/views/localView/network-simplex.ts'
};
const links = Object.entries(subjects).map(([name, nodeId]) => {
  const snapshot = { ...state.DEFAULT_SNAPSHOT, selectedNodeId: nodeId,
    pinSet: pins.retainFile(pins.EMPTY_PIN_SET, nodeId), layout: { forceGraph: { hops: 1, groupWrappers: 'skin' } } };
  return { name, nodeId, url: `http://localhost:8900/?s=${encodeURIComponent(state.compressSnapshot(snapshot))}` };
});
fs.writeFileSync('AI-Agent-Workspace/tmp/2026-11-08-astra-review/teaching-links.json', JSON.stringify(links, null, 2) + '\n');
const browser = await chromium.launch({ headless: true });
const readings = [], errors = [];
try {
  for (const link of links) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push({ name: link.name, message: String(error) }));
    await page.goto(link.url);
    const card = page.locator(`.node-card[data-id="${link.nodeId}"]`);
    await expect(card).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.pin-tray-toggle')).toBeVisible();
    await expect(page.locator('#pin-tray-count')).toHaveText('1 pin');
    await page.waitForTimeout(1200);
    const snapshot = state.decompressSnapshot(new URL(page.url()).searchParams.get('s'));
    expect(snapshot.pinSet.entries).toEqual([{ nodeId: link.nodeId, symbol: '*' }]);
    const status = await page.locator('.local-placed').evaluate(root => ({ moving: root.dataset.moving ?? '', search: root.dataset.searchStatus ?? '' }));
    const screenshot = `integration-${link.name}-pinned.png`;
    await page.screenshot({ path: `${out}/${screenshot}` });
    readings.push({ ...link, screenshot, pins: snapshot.pinSet.entries, status, note: 'Initial readable picture; ongoing background search is not awaited.' });
    console.log(JSON.stringify({ name: link.name, pins: snapshot.pinSet.entries, status }));
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push({ name: 'estate', message: String(error) }));
  await page.goto('http://localhost:8900/samples/estate/?view=local&mode=3d&layout=structure');
  await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy', 'false', { timeout: 25_000 });
  await expect(page.locator('#tuning-force-group-wrappers')).toHaveValue('skin');
  await expect(page.locator('#tuning-force-hops')).toHaveValue('1');
  await page.screenshot({ path: `${out}/integration-estate-default.png` });
  const asset = await (await page.request.get('http://localhost:8900/static/index.js')).body();
  readings.push({ name: 'estate', url: page.url(), screenshot: 'integration-estate-default.png', wrappers: 'skin', hops: 1, busy: false });
  await context.close();
  fs.writeFileSync(`${out}/integration-review.json`, JSON.stringify({ viewport: '1440x960', clock: 'normal', search: 'normal defaults', assetSha256: crypto.createHash('sha256').update(asset).digest('hex'), errors, readings }, null, 2) + '\n');
  console.log(JSON.stringify({ complete: true, errors }));
} finally { await browser.close(); }

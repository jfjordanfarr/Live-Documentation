import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { observeGraph, renderedNodes } from '../../tests/e2e/force-graph-observation';
import { compressSnapshot, DEFAULT_SNAPSHOT } from '../../packages/explorer/src/client/persistence/compressed-url-state';

const root = '/tmp/live-docs-20261108-defaults-evidence';
const browser = await chromium.launch({ headless: true });
const reports: unknown[] = [];
const cases = process.argv.includes('--main')
  ? [['repository-structure', '/', 'structure'], ['repository-connections', '/', 'connections']]
  : [['estate-structure', '/samples/estate/', 'structure'], ['estate-connections', '/samples/estate/', 'connections']];
try {
  for (const [name, base, layout] of cases) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await context.newPage();
    // tsx preserves function names through this helper in serialized page callbacks.
    await page.addInitScript("window.__name = (fn) => fn;");
    await observeGraph(page);
    const started = Date.now();
    const url = `http://localhost:8911${base}?view=local&mode=3d&layout=${layout}`;
    await page.goto(url);
    let settled = true;
    try { await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy', 'false', { timeout: name.startsWith('repository') ? 120_000 : 25_000 }); }
    catch { settled = false; }
    const read = async () => ({
      url: page.url(), seconds: (Date.now() - started) / 1000,
      busy: await page.locator('#graph-svg').getAttribute('aria-busy'),
      wrappers: await page.locator('#tuning-force-group-wrappers').inputValue(),
      hops: await page.getByRole('combobox', { name: 'Hops shown', exact: true }).inputValue(),
      stats: await page.locator('#stats-line').textContent(),
      nodes: (await renderedNodes(page)).map(n => ({ id: n.id, directory: n.directory, radius: n.radius })),
      mesh: await page.evaluate(() => {
        const found: Record<string, unknown> = {};
        (window as any).renderedGraph.scene.traverse((object: any) => {
          if (object.name === 'Spatial wrappers') found.wrappers = { ...object.userData.spatialWrappers, ranges: undefined };
          if (object.name === 'Spatial shell files') found.units = object.userData.spatialUnits;
        });
        return found;
      })
    });
    await page.screenshot({ path: `${root}/${name}.png` });
    reports.push({ name, settled, ...await read() });
    if (name === 'estate-structure') {
      const snapshot = { ...DEFAULT_SNAPSHOT, perspective: '3d' as const, spatialLayout: 'structure' as const,
        openDirectories: new Set(['Portal']), pinSet: { entries: [{ nodeId: 'Estate.sln', symbol: '*' }] } };
      await page.goto(`http://localhost:8911/samples/estate/?s=${compressSnapshot(snapshot)}`);
      await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy', 'false', { timeout: 25_000 });
      const before = (await renderedNodes(page)).map(n => n.id).sort();
      await page.getByRole('button', { name: 'Whole', exact: true }).click();
      await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy', 'false', { timeout: 25_000 });
      await page.screenshot({ path: `${root}/estate-structure-whole.png` });
      reports.push({ name: 'estate-structure-whole', ...await read() });
      await page.getByRole('button', { name: 'Whole', exact: true }).click();
      await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy', 'false', { timeout: 25_000 });
      const after = (await renderedNodes(page)).map(n => n.id).sort();
      reports.push({ name: 'estate-return-local', restoredMembership: JSON.stringify(before) === JSON.stringify(after), ...await read() });
    }
    await context.close();
    await writeFile(`${root}/${process.argv.includes('--main') ? 'main' : 'estate'}-report.json`, JSON.stringify(reports, null, 2));
    console.log(name, settled ? 'settled' : 'still busy', `${(Date.now() - started) / 1000}s`);
  }
} finally { await browser.close(); }

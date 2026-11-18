import { chromium, expect } from '@playwright/test';
import { observeGraph, renderedNodes } from '../../tests/e2e/force-graph-observation';
import { compressSnapshot, DEFAULT_SNAPSHOT } from '../../packages/explorer/src/client/persistence/compressed-url-state';
const browser = await chromium.launch({headless:true});
try {
 const page = await browser.newPage({viewport:{width:1440,height:960}});
 await page.addInitScript('window.__name=(fn)=>fn;');
 await observeGraph(page);
 await page.goto(`http://localhost:8911/samples/estate/?s=${compressSnapshot({...DEFAULT_SNAPSHOT,spatialLayout:'structure',openDirectories:new Set(['Portal'])})}`);
 await expect(page.locator('#map-container .local-placed')).toBeVisible();
 const identities=await page.locator('#map-container .node-card, #map-container .local-directory-closed').evaluateAll(els=>els.map(el=>(el as HTMLElement).dataset.id || `directory:${(el as HTMLElement).dataset.directory}`));
 await page.getByRole('button',{name:'3D',exact:true}).click();
 await expect(page.locator('.perspective-transition')).toBeVisible();
 console.log(JSON.stringify({point:'transition',identities,nodes:await renderedNodes(page)},null,2));
 await expect(page.locator('.perspective-transition')).toHaveCount(0);
 await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy','false',{timeout:25000});
 console.log(JSON.stringify({point:'settled',nodes:await renderedNodes(page)},null,2));
 await page.screenshot({path:'/tmp/live-docs-20261108-defaults-evidence/estate-portal-transition.png'});
} finally {await browser.close();}

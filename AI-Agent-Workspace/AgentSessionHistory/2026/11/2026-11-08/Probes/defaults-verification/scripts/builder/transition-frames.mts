import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { compressSnapshot, DEFAULT_SNAPSHOT } from '../../packages/explorer/src/client/persistence/compressed-url-state';
const browser = await chromium.launch({headless:true});
const evidence='/tmp/live-docs-20261108-defaults-evidence';
try {
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 await page.addInitScript('window.__name=(fn)=>fn;');
 await page.clock.install();
 await page.goto(`http://localhost:8911/samples/estate/?s=${compressSnapshot({...DEFAULT_SNAPSHOT,spatialLayout:'structure',openDirectories:new Set(['Portal'])})}`);
 await expect(page.locator('#map-container .local-placed')).toBeVisible();
 await page.screenshot({path:`${evidence}/portal-2d-source.png`});
 const result=[];
 for (const [direction,button,phase] of [['out','3D',.65],['back','2D',process.argv.includes('--late')?.85:.35]] as const) {
  await page.getByRole('button',{name:button,exact:true}).click();
  const layer=page.locator('.perspective-transition[data-graph-files]');
  await expect(layer).toBeVisible();
  await page.clock.pauseAt((await page.evaluate(()=>Date.now()))+20);
  const elapsed=Number(await layer.getAttribute('data-progress'));
  if (elapsed<phase) await page.clock.runFor(Math.round((phase-elapsed)*1400));
  await page.screenshot({path: process.argv.includes("--late") && direction === "back" ? `${evidence}/portal-corrected-return.png` : `${evidence}/portal-skin-transition-${direction}.png`});
  result.push({direction,progress:await layer.getAttribute('data-progress'),graphFiles:await layer.getAttribute('data-graph-files'),labels:await layer.locator('.perspective-file-name').evaluateAll(els=>els.map(el=>({id:(el as HTMLElement).dataset.nodeId,opacity:(el as HTMLElement).style.opacity,left:(el as HTMLElement).style.left,top:(el as HTMLElement).style.top})))});
  await page.clock.runFor(1600);
  await page.clock.resume();
  if(direction==='out') await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy','false',{timeout:25000});
 }
 await writeFile(`${evidence}/${process.argv.includes("--late") ? "portal-transition-corrected.json" : "portal-transition-frames.json"}`,JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
} finally {await browser.close();}

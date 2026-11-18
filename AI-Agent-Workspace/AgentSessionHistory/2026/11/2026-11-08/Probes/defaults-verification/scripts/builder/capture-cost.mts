import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { compressSnapshot, DEFAULT_SNAPSHOT } from '../../packages/explorer/src/client/persistence/compressed-url-state';
import { localMapSettled } from '../../tests/e2e/still-picture';
const browser=await chromium.launch({headless:true});
const reports=[];
try {
 for (const [name,base,dirs] of [['estate','/samples/estate/',['Portal']],['repository','/',[]]] as const) {
  const context=await browser.newContext({viewport:{width:1440,height:960}});
  const page=await context.newPage();
  await page.addInitScript('window.__name=(fn)=>fn;localStorage.setItem("live-docs-explorer:ui:v2",JSON.stringify({version:2,tuning:{localMap:{searchStarts:0}}}));');
  await page.goto(`http://localhost:8911${base}?s=${compressSnapshot({...DEFAULT_SNAPSHOT,perspective:'3d',spatialLayout:'structure',openDirectories:new Set(dirs)})}`);
  await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy','false',{timeout:120000});
  for(const mode of ['2D','3D']) {
   await page.evaluate(()=>performance.clearMeasures());
   const pressed=Date.now();
   await page.getByRole('button',{name:mode,exact:true}).click();
   const layer=page.locator('.perspective-transition[data-graph-files]');
   await expect(layer).toBeVisible();
   const startsAfter=Date.now()-pressed;
   const capture=await page.evaluate(()=>performance.getEntriesByType('measure').filter(entry=>entry.name.startsWith('live-docs:capture')||entry.name.startsWith('live-docs:switch')).map(entry=>({name:entry.name,ms:entry.duration})));
   reports.push({name,mode,startsAfter,capture});
   console.log(JSON.stringify(reports.at(-1)));
   await expect(layer).toHaveCount(0,{timeout:30000});
   if(mode==='2D') await localMapSettled(page);
  }
  await context.close();
  await writeFile('/tmp/live-docs-20261108-defaults-evidence/capture-cost.json',JSON.stringify(reports,null,2));
 }
}finally{await browser.close();}

import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { observeGraph } from "../../tests/e2e/force-graph-observation.ts";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state.ts";
import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage.ts";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800}}), page=await context.newPage();
const body=await readFile('/tmp/live-docs-20261108-defaults-diagnostics/profile.js','utf8');
await page.route('**/static/index.js',route=>route.fulfill({body,contentType:'application/javascript'}));
await page.addInitScript({content:'globalThis.__name=value=>value;'});
await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:2,tuning:{localMap:{searchStarts:0}}})),PERSISTED_UI_KEY);
await observeGraph(page);
const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
const results=[];
try {
  await page.goto(`http://localhost:8911/?s=${compressSnapshot({...DEFAULT_SNAPSHOT,perspective:'3d',spatialLayout:'connections',selectedNodeId:'packages/generator/src/generator.ts',filters:{showTests:true,showAssets:false},layout:{forceGraph:{groupWrappers:'skin',hops:1}}})}`);
  await page.waitForFunction(()=>Boolean((window as any).forceProfile&&(window as any).renderedGraph));
  for(let index=0;index<4;index++) {
    if(index)await page.waitForTimeout(20_000);
    const sample=await page.evaluate(()=>{
      const observed=(window as any).renderedGraph,drawn:any[]=[];
      observed.scene.traverse((object:any)=>{if(object.isMesh&&object.visible)drawn.push({name:object.name,count:object.count,triangles:(object.geometry.index?.count??object.geometry.getAttribute('position')?.count??0)/3,range:object.geometry.drawRange.count});});
      return {at:performance.now(),state:(window as any).forceProfile(),frames:(window as any).renderedFrames,render:{...observed.renderer.info.render},drawn};
    });
    const metrics=await cdp.send('Performance.getMetrics');
    results.push({...sample,metrics:Object.fromEntries(metrics.metrics.map(item=>[item.name,item.value]))});
    console.log(JSON.stringify(results.at(-1)));
  }
}finally{await writeFile('/tmp/live-docs-20261108-defaults-diagnostics/frame-profile.json',JSON.stringify(results,null,2)+'\n');await browser.close();}

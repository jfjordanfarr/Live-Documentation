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
  await page.waitForFunction(()=>{const s=(window as any).forceProfile();return s.reveal.shown===s.reveal.total&&s.reveal.total>0;},{},{timeout:30000});
  for(let index=0;index<2;index++) {
    if(index)await page.waitForTimeout(5_000);
    const sample=await page.evaluate(()=>{
      const observed=(window as any).renderedGraph,drawn:any[]=[];
      const ce=observed.camera.projectionMatrix.clone().multiply(observed.camera.matrixWorldInverse).elements;
      const planes=[[ce[3]+ce[0],ce[7]+ce[4],ce[11]+ce[8],ce[15]+ce[12]],[ce[3]-ce[0],ce[7]-ce[4],ce[11]-ce[8],ce[15]-ce[12]],[ce[3]+ce[1],ce[7]+ce[5],ce[11]+ce[9],ce[15]+ce[13]],[ce[3]-ce[1],ce[7]-ce[5],ce[11]-ce[9],ce[15]-ce[13]],[ce[3]+ce[2],ce[7]+ce[6],ce[11]+ce[10],ce[15]+ce[14]],[ce[3]-ce[2],ce[7]-ce[6],ce[11]-ce[10],ce[15]-ce[14]]].map(p=>{const length=Math.hypot(p[0],p[1],p[2]);return p.map(x=>x/length);});
      observed.scene.traverse((object:any)=>{if(object.isMesh&&object.visible){
        let frustumVisible:number|undefined;
        if(object.isInstancedMesh&&object.name.startsWith('Spatial shell')){
          if(!object.geometry.boundingSphere)object.geometry.computeBoundingSphere();
          frustumVisible=0;
          for(let slot=0;slot<object.count;slot++){
            const matrix=object.matrixWorld.clone();object.getMatrixAt(slot,matrix);matrix.premultiply(object.matrixWorld);
            const sphere=object.geometry.boundingSphere.clone().applyMatrix4(matrix),c=sphere.center;
            if(planes.every(p=>p[0]*c.x+p[1]*c.y+p[2]*c.z+p[3]>=-sphere.radius))frustumVisible++;
          }
        }
        drawn.push({name:object.name,count:object.count,frustumVisible,triangles:(object.geometry.index?.count??object.geometry.getAttribute('position')?.count??0)/3,range:object.geometry.drawRange.count});
      }});
      return {at:performance.now(),state:(window as any).forceProfile(),frames:(window as any).renderedFrames,render:{...observed.renderer.info.render},drawn};
    });
    const metrics=await cdp.send('Performance.getMetrics');
    results.push({...sample,metrics:Object.fromEntries(metrics.metrics.map(item=>[item.name,item.value]))});
    console.log(JSON.stringify(results.at(-1)));
  }
}finally{await writeFile('/tmp/live-docs-20261108-defaults-diagnostics/visibility-profile.json',JSON.stringify(results,null,2)+'\n');await browser.close();}

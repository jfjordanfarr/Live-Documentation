import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { observeGraph } from "../../tests/e2e/force-graph-observation.ts";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state.ts";
import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage.ts";
const out='/tmp/live-docs-20261108-defaults-diagnostics',browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage(),results=[];
const bundle=await readFile(out+'/frozen.js','utf8');
await page.route('**/static/index.js',route=>route.fulfill({body:bundle,contentType:'application/javascript'}));
await page.addInitScript({content:'globalThis.__name=value=>value;'});
await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:2,tuning:{localMap:{searchStarts:0}}})),PERSISTED_UI_KEY);
await observeGraph(page);
try{
  await page.goto(`http://localhost:8911/?s=${compressSnapshot({...DEFAULT_SNAPSHOT,perspective:'3d',spatialLayout:'connections',selectedNodeId:'packages/generator/src/generator.ts',filters:{showTests:true,showAssets:false},layout:{forceGraph:{groupWrappers:'skin',hops:1}}})}`);
  await page.waitForFunction(()=>{const s=(window as any).freezeState?.();return s&&s.shown===s.total&&s.total>0&&!s.packing&&!s.hulls;},{},{timeout:30000});
  await page.evaluate(()=>{
    const w=window as any;w.__freezeForDraw=true;w.__hiddenLayers=[];
    const renderer=w.renderedGraph.renderer,original=renderer.render.bind(renderer);w.__restoreRender=()=>{renderer.render=original;w.__freezeForDraw=false;};
    renderer.render=(scene:any,camera:any)=>{
      const hidden=w.__hiddenLayers.map((name:string)=>scene.getObjectByName(name)).filter(Boolean),saved=hidden.map((mesh:any)=>mesh.visible);
      hidden.forEach((mesh:any)=>{mesh.visible=false;});
      original(scene,camera);
      hidden.forEach((mesh:any,index:number)=>{mesh.visible=saved[index];});
    };
  });
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
  await page.locator('#graph-svg canvas').screenshot({path:out+'/diagnostic-frozen-baseline.png'});
  const layers=[['baseline',[]],['without-files',['Spatial shell files']],['without-balloons',['Spatial shell balloons']],['without-skins',['Spatial wrappers']],['without-all-interiors-and-skins',['Spatial shell files','Spatial shell balloons','Spatial wrappers']]] as const;
  for(const [name,hidden]of layers){
    await page.evaluate(hidden=>{(window as any).__hiddenLayers=[...hidden];},hidden);
    const first=await page.evaluate(()=>({at:performance.now(),frames:(window as any).renderedFrames}));
    await page.waitForTimeout(5000);
    const last=await page.evaluate(()=>({at:performance.now(),frames:(window as any).renderedFrames,render:{...(window as any).renderedGraph.renderer.info.render}}));
    const row={name,hidden,motionPaused:true,elapsed:last.at-first.at,frames:last.frames-first.frames,fps:1000*(last.frames-first.frames)/(last.at-first.at),render:last.render};results.push(row);console.log(JSON.stringify(row));
    if(name!=='baseline')await page.locator('#graph-svg canvas').screenshot({path:out+`/diagnostic-frozen-${name}.png`});
  }
  await page.evaluate(()=>{(window as any).__hiddenLayers=[];});
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  await page.locator('#graph-svg canvas').screenshot({path:out+'/diagnostic-frozen-restored.png'});
  await page.evaluate(()=>(window as any).__restoreRender());
}finally{await writeFile(out+'/frozen-layer-profile.json',JSON.stringify(results,null,2)+'\n');await browser.close();}

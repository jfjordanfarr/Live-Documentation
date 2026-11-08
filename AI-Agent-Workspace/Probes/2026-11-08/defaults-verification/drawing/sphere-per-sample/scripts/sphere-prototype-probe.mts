import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { observeGraph } from "../../tests/e2e/force-graph-observation.ts";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state.ts";
import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage.ts";
const out='/tmp/live-docs-20261108-defaults-diagnostics',browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage(),results:any={timings:[],errors:[]};
const body=await readFile(out+'/sphere-prototype.js','utf8');
await page.route('**/static/index.js',route=>route.fulfill({body,contentType:'application/javascript'}));
await page.addInitScript({content:'globalThis.__name=value=>value;'});
await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:2,tuning:{localMap:{searchStarts:0}}})),PERSISTED_UI_KEY);
await observeGraph(page);page.on('pageerror',error=>results.errors.push(String(error)));page.on('console',message=>{if(message.type()==='error')results.errors.push(message.text());});
try{
  await page.goto(`http://localhost:8911/?s=${compressSnapshot({...DEFAULT_SNAPSHOT,perspective:'3d',spatialLayout:'connections',selectedNodeId:'packages/generator/src/generator.ts',filters:{showTests:true,showAssets:false},layout:{forceGraph:{groupWrappers:'skin',hops:1}}})}`);
  await page.waitForFunction(()=>{const s=(window as any).freezeState?.();return s&&s.shown===s.total&&s.total>0&&!s.packing&&!s.hulls;},{},{timeout:30000});
  await page.evaluate(()=>{
    const w=window as any;w.__freezeForDraw=true;const mesh=w.renderedGraph.scene.getObjectByName('Spatial shell files');
    w.__nativeSphere={geometry:mesh.geometry,material:mesh.material};
    const analytic=w.spherePrototype.make();for(const[name,attribute]of Object.entries(mesh.geometry.attributes))if((attribute as any).isInstancedBufferAttribute)analytic.geometry.setAttribute(name,attribute);
    w.__analyticSphere=analytic;
    w.__sphereMode=(mode:string)=>{const selected=mode==='native'?w.__nativeSphere:w.__analyticSphere;mesh.geometry=selected.geometry;mesh.material=selected.material;};
    w.__spherePixels=()=>{const{renderer,scene,camera}=w.renderedGraph;renderer.render(scene,camera);const gl=renderer.getContext(),data=new Uint8Array(renderer.domElement.width*renderer.domElement.height*4);gl.readPixels(0,0,renderer.domElement.width,renderer.domElement.height,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;};
  });
  for(const mode of ['native','analytic','native']as const){
    await page.evaluate(mode=>(window as any).__sphereMode(mode),mode);
    await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
    const first=await page.evaluate(()=>({at:performance.now(),frames:(window as any).renderedFrames}));await page.waitForTimeout(5000);
    const last=await page.evaluate(()=>({at:performance.now(),frames:(window as any).renderedFrames,render:{...(window as any).renderedGraph.renderer.info.render}}));
    results.timings.push({mode,motionPaused:true,elapsed:last.at-first.at,frames:last.frames-first.frames,fps:1000*(last.frames-first.frames)/(last.at-first.at),render:last.render});
    const name=results.timings.length===3?'restored':mode;
    await page.locator('#graph-svg canvas').screenshot({path:out+`/sphere-main-${name}.png`});
    const pixels=await page.evaluate(mode=>{
      const w=window as any,data=w.__spherePixels();if(mode==='native'){w.__baselinePixels=data;return null;}
      let changed=0,max=0,total=0;for(let i=0;i<data.length;i+=4){const delta=Math.max(Math.abs(data[i]-w.__baselinePixels[i]),Math.abs(data[i+1]-w.__baselinePixels[i+1]),Math.abs(data[i+2]-w.__baselinePixels[i+2]));if(delta>3)changed++;max=Math.max(max,delta);total+=delta;}
      return{changedAbove3:changed,maxChannelDifference:max,meanPixelDifference:total/(data.length/4)};
    },mode);
    if(pixels)results.pixelComparison=pixels;
    console.log(JSON.stringify(results.timings.at(-1)));
  }
  console.log(JSON.stringify({errors:results.errors,pixelComparison:results.pixelComparison}));
}finally{await writeFile(out+'/sphere-main-prototype.json',JSON.stringify(results,null,2)+'\n');await browser.close();}

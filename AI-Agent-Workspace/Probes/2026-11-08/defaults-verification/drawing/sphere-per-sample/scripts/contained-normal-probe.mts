import { chromium,expect } from '@playwright/test';
import { readFile,writeFile } from 'node:fs/promises';
import { observeGraph } from '../../tests/e2e/force-graph-observation.ts';
import { compressSnapshot,DEFAULT_SNAPSHOT } from '../../packages/explorer/src/client/persistence/compressed-url-state.ts';
import { PERSISTED_UI_KEY } from '../../packages/explorer/src/client/persistence/local-storage.ts';
const out='/tmp/live-docs-20261108-defaults-diagnostics',browser=await chromium.launch({headless:true}),report:any={runs:[],errors:[]};
async function context(mode:string){
 const context=await browser.newContext({baseURL:'http://localhost:8911',viewport:{width:1280,height:800}}),page=await context.newPage();
 if(mode==='native'){const body=await readFile(out+'/native-contained-normal.js','utf8');await page.route('**/static/index.js',route=>route.fulfill({body,contentType:'application/javascript'}));}
 await page.addInitScript({content:'globalThis.__name=value=>value;'});
 await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:2,tuning:{localMap:{searchStarts:0}}})),PERSISTED_UI_KEY);
 await observeGraph(page);page.on('pageerror',e=>report.errors.push({mode,error:String(e)}));return{context,page};
}
async function state(page:any){return page.evaluate(()=>{
 const w=window as any,{scene,renderer,camera}=w.renderedGraph,files=scene.getObjectByName('Spatial shell files'),nodes=scene.getObjectByName('Spatial nodes');
 return{at:performance.now(),busy:document.getElementById('graph-svg')?.getAttribute('aria-busy'),frames:w.renderedFrames,files:{count:files.count,visible:files.visible,material:files.material.type,vertices:files.geometry.getAttribute('position').count},nodes:nodes.count,drawn:{...renderer.info.render},camera:camera.position.toArray()};
});}
try{
 for(const mode of ['native','analytic']){
  const{context:ctx,page}=await context(mode),run:any={mode,subject:'fresh default generator.ts Connections/Skin1',url:'http://localhost:8911/?view=local&mode=3d&node=packages%2Fgenerator%2Fsrc%2Fgenerator.ts',motionPaused:false};
  try{
   const started=Date.now();await page.goto(run.url);await page.waitForFunction(()=>!!(window as any).renderedGraph);
   await expect(page.locator('.force-graph-focus[data-node-id="packages/generator/src/generator.ts"]')).toBeVisible({timeout:15000});run.focusAvailableMs=Date.now()-started;run.first=await state(page);
   const control=Date.now();await page.getByText('Tuning',{exact:true}).click();for(const name of ['3D Layout','Discovery']){const summary=page.getByText(name,{exact:true});if(await summary.locator('..').getAttribute('open')===null)await summary.click();}await expect(page.locator('#tuning-force-group-wrappers')).toBeVisible();run.tuningAvailableMs=Date.now()-control;run.defaults={wrappers:await page.locator('#tuning-force-group-wrappers').inputValue(),hops:await page.locator('#tuning-force-hops').inputValue()};
   await page.getByText('Tuning',{exact:true}).click();
   try{await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy','false',{timeout:Math.max(1,60000-(Date.now()-started))});run.settled=true;}catch{run.settled=false;}
   run.elapsedMs=Date.now()-started;run.final=await state(page);await page.locator('#graph-svg').screenshot({path:out+'/normal-generator-'+mode+'.png'});
  }finally{report.runs.push(run);console.log(JSON.stringify(run));await ctx.close();await writeFile(out+'/contained-normal-arrivals.json',JSON.stringify(report,null,2)+'\n');}
 }
 for(const mode of ['native','analytic']){
  const{context:ctx,page}=await context(mode);
  try{
   const data=await(await page.request.get('/samples/history/explorer-data.json')).json(),sequence=await(await page.request.get('/samples/history/'+data.history.file)).json(),commits=[sequence.base.commit,...sequence.steps.map((s:any)=>s.commit)];
   for(const subject of ['today-selected','past-selected','whole']){
    const snapshot={...DEFAULT_SNAPSHOT,perspective:'3d',spatialLayout:'structure',filters:{showTests:true,showAssets:false},layout:{forceGraph:{hops:4,updateEnergy:subject==='whole'?.1:0}},...(subject==='whole'?{openDirectories:new Set([''])}:{selectedNodeId:subject==='today-selected'?'src/app/main.ts':'lib/legacy.ts',...(subject==='past-selected'?{commit:commits[3].id}:{})})};
    const url='/samples/history/?s='+compressSnapshot(snapshot as any),started=Date.now();await page.goto(url);await page.waitForFunction(()=>!!(window as any).renderedGraph);const first=await state(page);let settled=true;
    try{await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy','false',{timeout:60000});}catch{settled=false;}
    const run={mode,subject:'history '+subject,url:'http://localhost:8911'+url,motionPaused:false,elapsedMs:Date.now()-started,settled,first,final:await state(page)};report.runs.push(run);console.log(JSON.stringify(run));await writeFile(out+'/contained-normal-arrivals.json',JSON.stringify(report,null,2)+'\n');
   }
  }finally{await ctx.close();}
 }
}finally{await browser.close();await writeFile(out+'/contained-normal-arrivals.json',JSON.stringify(report,null,2)+'\n');}

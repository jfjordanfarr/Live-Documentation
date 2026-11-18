const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/tmp/live-docs-20261108-defaults/node_modules/playwright');
const { compressToEncodedURIComponent } = require('/tmp/live-docs-20261108-defaults/node_modules/lz-string');
const output = '/tmp/live-docs-20261108-search-review/candidate';
const baseURL = 'http://localhost:8913';
const files = ['packages/engine/src/live-docs/graph.ts', 'packages/engine/src/live-docs/document.ts', 'packages/engine/src/live-docs/graphFiles.ts', 'packages/explorer/src/shared/staticExplorerData.ts', 'packages/explorer/src/shared/staticBuilder.ts'];
const snapshot = {v:1,w:'map',n:files[0],p:files.map(n=>({n,s:'*'}))};
const url = `${baseURL}/?s=${compressToEncodedURIComponent(JSON.stringify(snapshot))}`;
const viewport = {width:1600,height:1000};
(async () => {
 const hashes = {};
 for (const name of ['explorer-data.json', 'static/index.js']) {
  const response = await fetch(`${baseURL}/${name}`);
  hashes[name] = crypto.createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
 }
 const browser = await chromium.launch({headless:true});
 const page = await browser.newPage({viewport});
 const errors=[]; page.on('pageerror', e=>errors.push(e.message));
 await page.addInitScript(() => {
  localStorage.setItem('live-docs-explorer:ui:v2', JSON.stringify({version:2,tuning:{localMap:{orderStarts:0,searchStarts:80,searchPatience:80,moveMs:0}}}));
  window.__searchReview = {readings:[], longTasks:[]};
  const keys = ['searchStatus','searchTried','searchNext','searchAdopted','searchAlignmentTried','searchAlignmentAdopted','searchShown','searchBest','searchPredicted','searchMeasured','orderStart','layoutMs','moving'];
  let previous = '';
  const read = () => {
   const root = document.querySelector('#map-container .local-placed');
   if (!root) return;
   const values = Object.fromEntries(keys.map(key=>[key,root.dataset[key]??null]));
   const said = JSON.stringify(values);
   if (said === previous) return;
   previous = said;
   window.__searchReview.readings.push({at:performance.now(),visibility:document.visibilityState,camera:document.querySelector('#map-container')?.dataset.camera,...values});
  };
  document.addEventListener('DOMContentLoaded', () => new MutationObserver(read).observe(document.body, {subtree:true,attributes:true,attributeFilter:keys.map(k=>'data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()))}));
  new PerformanceObserver(list=>window.__searchReview.longTasks.push(...list.getEntries().map(e=>({startTime:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
 });
 const read = () => page.evaluate(() => {
  const root=document.querySelector('#map-container .local-placed');
  return {at:performance.now(),...root?.dataset,camera:document.querySelector('#map-container')?.dataset.camera,cards:document.querySelectorAll('#map-container .node-card').length};
 });
 const visibility = value=>page.evaluate(value=>{Object.defineProperty(document,'visibilityState',{value,configurable:true});document.dispatchEvent(new Event('visibilitychange'));},value);
 const events=[];
 await page.goto(url);
 await page.waitForSelector('#map-container .branch-mode',{timeout:20000});
 await page.waitForSelector('#map-connections .connection-path:not(.bundle-run)',{state:'attached',timeout:15000});
 events.push({what:'opened',state:await read()});
 await visibility('hidden');
 await page.waitForTimeout(100); events.push({what:'hidden',state:await read()});
 await page.waitForTimeout(600); events.push({what:'still-hidden',state:await read()});
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Profiler.enable');
 await cdp.send('Profiler.setSamplingInterval',{interval:1000});
 await cdp.send('Profiler.start');
 await visibility('visible'); events.push({what:'visible',state:await read()});
 let finished=false;
 const settle=page.waitForFunction(()=>{const map=document.querySelector('#map-container');const root=map?.querySelector('.local-placed');return !!root&&map.dataset.camera!=='moving'&&root.dataset.moving!=='true'&&root.dataset.searchStatus!=='running';},undefined,{timeout:150000}).then(()=>{finished=true;}).catch(e=>{events.push({what:'observation-timeout',error:e.message});finished=true;});
 while (!finished) {
  await page.waitForTimeout(5000);
  const state=await read(); events.push({what:'progress',state});
  console.log(JSON.stringify({elapsed:Math.round(state.at-events.find(e=>e.what==='visible').state.at),tried:state.searchTried,alignmentTried:state.searchAlignmentTried,adopted:state.searchAdopted,status:state.searchStatus,camera:state.camera}));
 }
 await settle;
 const {profile}=await cdp.send('Profiler.stop');
 events.push({what:'finished',state:await read()});
 const measurements=await page.evaluate(()=>window.__searchReview);
 fs.writeFileSync(`${output}/search.cpuprofile`,JSON.stringify(profile));
 fs.writeFileSync(`${output}/measurements.json`,JSON.stringify({url,files,snapshot,viewport,hashes,events,errors,...measurements},null,2));
 await page.screenshot({path:`${output}/finished.png`});
 await browser.close();
 console.log(JSON.stringify({hashes,last:events[events.length-1],errors}));
})().catch(error=>{console.error(error);process.exitCode=1;});

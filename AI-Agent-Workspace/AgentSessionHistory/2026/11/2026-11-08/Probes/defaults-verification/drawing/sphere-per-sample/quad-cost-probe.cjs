const { chromium } = require('/tmp/live-docs-20261108-defaults/node_modules/playwright');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const dir = '/tmp/live-docs-20261108-defaults-diagnostics';
const report = {description:'Read-only actual uploaded sphere/camera capture every ten motion revisions; no freeze or tuning changes',viewport:{width:1280,height:800},runs:[]};
(async()=>{
 report.assetManifest=JSON.parse(await fs.readFile(dir+'/contained-normal-build.json','utf8'));
 const browser=await chromium.launch({headless:true});
 try { for(const mode of ['native','analytic']) {
  const body=await fs.readFile(`${dir}/dynamic-${mode}.js`,'utf8');
  const run={mode,bundleSha256:crypto.createHash('sha256').update(body).digest('hex'),errors:[]};report.runs.push(run);
  const context=await browser.newContext({viewport:report.viewport});
  try {
   const page=await context.newPage();await page.route('**/static/index.js',route=>route.fulfill({body,contentType:'application/javascript'}));
   await page.addInitScript(()=>{
    globalThis.__name=value=>value;
    // Same search-disabled diagnostic setup as prior 3D controls; no 3D tuning changes.
    localStorage.setItem('live-docs-explorer:ui:v2',JSON.stringify({version:2,tuning:{localMap:{searchStarts:0}}}));
    const w=window;w.quadSamples=[];w.__THREE_DEVTOOLS__=new EventTarget();let frames=0,lastBucket=-1,lastShown=-1;
    w.__THREE_DEVTOOLS__.addEventListener('observe',event=>{
     const renderer=event.detail;if(renderer.isWebGLRenderer!==true)return;
     const render=renderer.render.bind(renderer);renderer.render=(scene,camera)=>{
      render(scene,camera);frames++;const state=w.dynamicState?.();if(!state||state.revision===undefined)return;
      const bucket=Math.floor(state.revision/10);if(bucket===lastBucket&&state.revealed===lastShown)return;lastBucket=bucket;lastShown=state.revealed;
      const mesh=scene.getObjectByName('Spatial shell files');if(!mesh||!mesh.visible)return;
      const units=[],matrix=mesh.matrixWorld.clone();
      for(let i=0;i<mesh.count;i++){
       mesh.getMatrixAt(i,matrix);matrix.premultiply(mesh.matrixWorld).premultiply(camera.matrixWorldInverse);
       const e=matrix.elements;units.push({index:i,id:mesh.userData.spatialUnits?.[i]?.id,center:[e[12],e[13],e[14]],radius:Math.hypot(e[0],e[1],e[2]),alpha:mesh.geometry.getAttribute('spatialOpacity').getX(i)});
      }
      const canvas=renderer.domElement,rect=canvas.getBoundingClientRect();
      w.quadSamples.push({at:performance.now(),frames,state,drawn:{...renderer.info.render},material:mesh.material.type,unitCount:mesh.count,projection:camera.projectionMatrix.toArray(),view:camera.matrixWorldInverse.toArray(),camera:camera.position.toArray(),canvas:{width:canvas.width,height:canvas.height,cssWidth:rect.width,cssHeight:rect.height,dpr:devicePixelRatio},units});
     };
    });
   });
   page.on('pageerror',error=>run.errors.push(String(error)));
   page.on('response',async response=>{if(new URL(response.url()).pathname==='/explorer-data.json')run.dataSha256=crypto.createHash('sha256').update(await response.body()).digest('hex');});
   const start=Date.now();await page.goto('http://localhost:8911/?view=local&mode=3d&node=packages%2Fgenerator%2Fsrc%2Fgenerator.ts');
   await page.locator('.force-graph-focus[data-node-id="packages/generator/src/generator.ts"]').waitFor({timeout:15000});
   await page.getByText('Tuning',{exact:true}).click();for(const name of ['3D Layout','Discovery']){const summary=page.getByText(name,{exact:true});if(await summary.locator('..').getAttribute('open')===null)await summary.click();}
   run.defaults={wrappers:await page.locator('#tuning-force-group-wrappers').inputValue(),hops:await page.locator('#tuning-force-hops').inputValue()};await page.getByText('Tuning',{exact:true}).click();
   while(Date.now()-start<65000){await page.waitForTimeout(1000);if(await page.evaluate(()=>window.dynamicState?.().revision>=260))break;}
   run.elapsedMs=Date.now()-start;run.samples=await page.evaluate(()=>window.quadSamples);run.last=await page.evaluate(()=>window.dynamicState?.());
   console.log(JSON.stringify({mode,elapsed:run.elapsedMs,last:run.last,samples:run.samples.length,errors:run.errors}));
  } finally {await context.close();await fs.writeFile(`${dir}/quad-cost-raw.json`,JSON.stringify(report)+'\n');}
 }} finally {await browser.close();await fs.writeFile(`${dir}/quad-cost-raw.json`,JSON.stringify(report)+'\n');}
})().catch(error=>{console.error(error);process.exitCode=1;});

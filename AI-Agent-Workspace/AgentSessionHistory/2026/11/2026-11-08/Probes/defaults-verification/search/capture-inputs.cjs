const fs=require('node:fs');
const crypto=require('node:crypto');
const {chromium}=require('/tmp/live-docs-20261108-defaults/node_modules/playwright');
const provenance=JSON.parse(fs.readFileSync('/tmp/live-docs-20261108-search-review/measurements.json','utf8'));
const output='/tmp/live-docs-20261108-search-review';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:provenance.viewport});
 await page.addInitScript(()=>localStorage.setItem('live-docs-explorer:ui:v2',JSON.stringify({version:2,tuning:{localMap:{orderStarts:0,searchStarts:80,searchPatience:80,moveMs:0}}})));
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Debugger.enable');
 const {breakpointId}=await cdp.send('Debugger.setBreakpointByUrl',{url:'http://localhost:8911/static/index.js',lineNumber:4967,columnNumber:70052});
 const inputs=[];const seen=new Set();let failures=[];let resolveCapture;
 const complete=new Promise(resolve=>resolveCapture=resolve);
 cdp.on('Debugger.paused',async event=>{
  try{
   const frame=event.callFrames[0];
   const result=await cdp.send('Debugger.evaluateOnCallFrame',{callFrameId:frame.callFrameId,expression:'JSON.stringify({count:n,constraints:e})',returnByValue:true,silent:true});
   if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));
   const raw=result.result.value;const input=JSON.parse(raw);
   if(!Number.isInteger(input.count)||!Array.isArray(input.constraints))throw new Error('Unexpected solver scope: '+raw.slice(0,100));
   const sha256=crypto.createHash('sha256').update(raw).digest('hex');
   if(!seen.has(sha256)){seen.add(sha256);inputs.push({...input,sha256});console.log(JSON.stringify({captured:inputs.length,count:input.count,edges:input.constraints.length}));}
   if(inputs.length>=24){await cdp.send('Debugger.removeBreakpoint',{breakpointId});resolveCapture();}
  }catch(error){failures.push(String(error));await cdp.send('Debugger.removeBreakpoint',{breakpointId}).catch(()=>{});resolveCapture();}
  finally{await cdp.send('Debugger.resume').catch(()=>{});}
 });
 await page.goto(provenance.url,{timeout:30000,waitUntil:'domcontentloaded'});
 let deadline;
 await Promise.race([complete,new Promise(resolve=>{deadline=setTimeout(resolve,90000);})]);
 clearTimeout(deadline);
 fs.writeFileSync(output+'/real-solver-inputs.json',JSON.stringify({url:provenance.url,viewport:provenance.viewport,hashes:provenance.hashes,method:'CDP entry breakpoint; untouched exact gate3 input arrays; first 24 distinct solver calls',inputs,failures}));
 await browser.close();console.log(JSON.stringify({inputs:inputs.length,failures}));
 if(failures.length||inputs.length<24)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});

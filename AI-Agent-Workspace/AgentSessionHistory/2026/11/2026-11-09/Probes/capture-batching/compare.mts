import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
const root='/tmp/live-docs-20261109-reading',out='/tmp/live-docs-20261109-capture',origin='http://localhost:8911';
const require=createRequire(root+'/package.json'),{chromium,devices}=require('@playwright/test');
const oldModule=await import(out+'/capture-original-external.ts'),newModule=await import(root+'/scripts/layout-lab/capture.ts');
const oldCapture=oldModule.captureFromPage??oldModule.default.captureFromPage,newCapture=newModule.captureFromPage??newModule.default.captureFromPage;
const scopeModule=await import(root+'/tests/e2e/scopes.ts'),DECK_SCOPES=scopeModule.DECK_SCOPES??scopeModule.default.DECK_SCOPES;
const stillModule=await import(root+'/tests/e2e/still-picture.ts'),localMapSettled=stillModule.localMapSettled??stillModule.default.localMapSettled,localRetainUrl=stillModule.localRetainUrl??stillModule.default.localRetainUrl;
const modes=['slot','grow'];
const scenarios:any[]=DECK_SCOPES.flatMap((run:any,index:number)=>modes.map(mode=>({name:`${index}-${run.bundle}-${run.scopeName.replaceAll(' ','-')}-${mode}`,run,mode,width:1600,height:1000})));
scenarios.push({name:'repository-narrow-grow',run:DECK_SCOPES[0],mode:'grow',width:1600,height:1000,cap:400},
 {name:'estate-code-narrow-grow',run:DECK_SCOPES[3],mode:'grow',width:1600,height:1000,cap:400,code:true},
 {name:'phone-repository-narrow-grow',run:DECK_SCOPES[0],mode:'grow',width:390,height:844,cap:225,phone:true},
 {name:'phone-estate-code-narrow-grow',run:DECK_SCOPES[3],mode:'grow',width:390,height:844,cap:225,phone:true,code:true});
const sha=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const clean=(capture:any)=>{const{capturedAt,...value}=capture;return value;};
function differences(a:any,b:any,path='$',found:any[]=[]):any[]{
 if(found.length>=30||isDeepStrictEqual(a,b))return found;
 if(a&&b&&typeof a==='object'&&typeof b==='object')for(const key of new Set([...Object.keys(a),...Object.keys(b)]))differences(a[key],b[key],path+'.'+key,found);
 else found.push({path,old:a,candidate:b});return found;
}
const browser=await chromium.launch(),results:any[]=[];
try{
 for(const scenario of scenarios){
  const context=await browser.newContext({...devices['Desktop Chrome'],viewport:{width:scenario.width,height:scenario.height},...(scenario.phone?{isMobile:true,hasTouch:true}:{})});
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',(error:any)=>errors.push(String(error)));page.on('console',(message:any)=>{if(message.type()==='error')errors.push(message.text());});
  await page.addInitScript((config:any)=>{localStorage.setItem('live-docs-explorer:ui:v2',JSON.stringify({version:2,tuning:{localMap:{searchStarts:0,cardText:config.mode,...(config.cap?{cardMaxWidth:config.cap}:{})}}}));},{mode:scenario.mode,cap:scenario.cap});
  if(scenario.code)await page.route('**/samples/estate/explorer-data.json',async(route:any)=>{
   const response=await route.fetch(),bundle=await response.json();bundle.graph.files[scenario.run.subject].authored=['### Purpose','A **formatted** paragraph with `inline code`.','','```ts','            const aVeryLongVariableName = leftValue + middleValue + rightValue;','','    align     these     columns     without     collapsing     their     spaces;','```'].join('\n');
   await route.fulfill({response,json:bundle});
  });
  await page.goto(origin+localRetainUrl(scenario.run.base,scenario.run.scope));
  await localMapSettled(page);await page.evaluate(()=>document.fonts.ready);
  const captures:any[]=[],times:any[]=[],originalEvaluate=page.evaluate.bind(page);
  let evaluationTimes:number[]=[];
  page.evaluate=async(fn:any,arg:any)=>{const capture=typeof fn==='function'&&fn.toString().includes('GLYPHS');const start=performance.now();try{return await originalEvaluate(fn,arg);}finally{if(capture)evaluationTimes.push(performance.now()-start);}};
  for(const [label,capture]of [['old',oldCapture],['candidate',newCapture],['restored-old',oldCapture]]as const){
   evaluationTimes=[];const start=performance.now();const value=await capture(page,scenario.run);const totalMs=performance.now()-start;captures.push(clean(value));times.push({label,totalMs,readCaptureMs:evaluationTimes});
   await writeFile(`${out}/${scenario.name}-${label}.json.gz`,gzipSync(JSON.stringify(value)));
   await localMapSettled(page);
  }
  const row={name:scenario.name,scenario,cards:Object.keys(captures[0].cards).length,rows:Object.values(captures[0].cards).reduce((n:number,c:any)=>n+c.rows.length,0),warnings:captures.map(c=>c.warnings),equalCandidate:isDeepStrictEqual(captures[0],captures[1]),equalRestored:isDeepStrictEqual(captures[0],captures[2]),hashes:captures.map(sha),times,errors,differences:differences(captures[0],captures[1])};
  results.push(row);await writeFile(out+'/comparison.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({name:row.name,cards:row.cards,rows:row.rows,equalCandidate:row.equalCandidate,equalRestored:row.equalRestored,times,errors,differences:row.differences}));
  await context.close();
  if(!row.equalCandidate||!row.equalRestored||errors.length)throw Error('Capture delta: '+scenario.name);
 }
}finally{await browser.close();}

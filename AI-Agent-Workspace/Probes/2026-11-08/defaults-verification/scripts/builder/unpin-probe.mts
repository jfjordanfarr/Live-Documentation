import { chromium, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { observeGraph, renderedNodes } from "../../tests/e2e/force-graph-observation.ts";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state.ts";
import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage.ts";
const out='/tmp/live-docs-20261108-defaults-diagnostics',browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage(),result:any={};
const body=await readFile(out+'/candidate.js','utf8');
await page.route('**/static/index.js',route=>route.fulfill({body,contentType:'application/javascript'}));
await page.addInitScript({content:'globalThis.__name=value=>value;'});
await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:2,tuning:{localMap:{searchStarts:0}}})),PERSISTED_UI_KEY);
await observeGraph(page);
const read=async()=>({state:await page.evaluate(()=>({...(window as any).forceDiagnostic(),focusVisible:[...document.querySelectorAll(':focus-visible')].map(element=>({tag:element.tagName,id:(element as HTMLElement).dataset.nodeId??element.id}))})),alpha:(await renderedNodes(page)).find(node=>node.id==='Estate.sln')?.opacity});
try{
  await page.goto(`http://localhost:8911/samples/estate/?s=${compressSnapshot({...DEFAULT_SNAPSHOT,perspective:'3d',pinSet:{entries:[{nodeId:'Portal/Services/GatewayClient.cs',symbol:'*'},{nodeId:'Estate.sln',symbol:'*'}]}})}`);
  await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy','false',{timeout:25000});
  const label=page.locator('.force-graph-label[data-node-id="Estate.sln"], .force-graph-focus[data-node-id="Estate.sln"]');
  await label.hover();
  await expect.poll(()=>page.evaluate(()=>(window as any).forceDiagnostic().pointerHoverId)).toBe('Estate.sln');
  result.before=await read();await label.click();
  await expect(page.locator('.pin-tray-toggle')).toHaveText('1 pin');
  try{await expect.poll(async()=>(await read()).alpha,{timeout:5000}).toBeLessThan(.5);result.dimmedWhileHovered=true;}catch(error){result.dimmedWhileHovered=false;result.hoverFailure=String(error);}
  result.afterClick=await read();await page.screenshot({path:out+'/unpin-stable-hover.png'});
  const box=(await page.locator('#graph-svg canvas').boundingBox())!;
  for(const[fx,fy]of [[.95,.95],[.05,.95],[.95,.05],[.05,.05],[.5,.95]]){
    await page.mouse.move(box.x+box.width*fx,box.y+box.height*fy);
    try{await expect.poll(()=>page.evaluate(()=>(window as any).forceDiagnostic().pointerHoverId),{timeout:500}).toBeNull();break;}catch{}
  }
  await expect.poll(()=>page.evaluate(()=>(window as any).forceDiagnostic().pointerHoverId)).toBeNull();
  await expect.poll(async()=>(await read()).alpha).toBeLessThan(.5);
  result.afterLeave=await read();await page.screenshot({path:out+'/unpin-after-empty-point.png'});
  console.log(JSON.stringify(result));
}finally{await writeFile(out+'/unpin-hover.json',JSON.stringify(result,null,2)+'\n');await browser.close();}

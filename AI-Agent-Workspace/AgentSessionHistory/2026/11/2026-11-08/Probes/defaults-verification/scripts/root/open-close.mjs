import {chromium} from 'playwright';
import fs from 'node:fs';
const out='AI-Agent-Workspace/Screenshots/2026-11-08/astra-review';
const url=JSON.parse(fs.readFileSync(`${out}/structure-readings.json`,'utf8')).readings.find(x=>x.tag==='start').url;
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:1440,height:960}});
await page.goto(url);
const target=page.locator('button[data-node-id="directory:packages"]:visible');
await target.waitFor({state:'visible',timeout:60000});
console.log('Fresh start',JSON.stringify({title:await target.getAttribute('title'),busy:await page.locator('#graph-svg').getAttribute('aria-busy')}));
const start=Date.now();const box=await target.boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(2000);
await page.screenshot({path:`${out}/08-structure-packages-open.png`});
console.log('After open',JSON.stringify({elapsed:Date.now()-start,url:page.url(),title:await target.getAttribute('title'),pressed:await target.getAttribute('aria-pressed'),busy:await page.locator('#graph-svg').getAttribute('aria-busy'),labels:await page.locator('button[data-node-id]').evaluateAll(es=>es.map(e=>({text:e.textContent,id:e.getAttribute('data-node-id'),title:e.title,rect:e.getBoundingClientRect().toJSON()})))}));
const box2=await target.boundingBox();await page.mouse.click(box2.x+box2.width/2,box2.y+box2.height/2);await page.waitForTimeout(1500);
await page.screenshot({path:`${out}/09-structure-packages-second-click.png`});
console.log('After second click',JSON.stringify({url:page.url(),title:await target.getAttribute('title'),pressed:await target.getAttribute('aria-pressed'),busy:await page.locator('#graph-svg').getAttribute('aria-busy')}));
} finally { await browser.close(); }

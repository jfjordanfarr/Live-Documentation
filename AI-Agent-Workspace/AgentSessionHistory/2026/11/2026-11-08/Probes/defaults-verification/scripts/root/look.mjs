import { chromium } from 'playwright';
import fs from 'node:fs';
const out='AI-Agent-Workspace/Screenshots/2026-11-08/astra-review';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:8900/');
await page.getByRole('combobox',{name:'Search files, symbols and directories; a chosen one is pinned, and a path starts from the newest pin',exact:true}).fill('symbolAnchors.ts');
await page.getByRole('option',{name:'symbolAnchors.ts packages/explorer/src/client/views/symbolAnchors.ts implementation',exact:true}).click();
await page.waitForTimeout(1200);
const snapshots=[];
for(let step=0;step<=7;step++){
 if(step){await page.getByRole('button',{name:'Zoom Out',exact:true}).click();await page.waitForTimeout(350);}
 if([0,4,5,7].includes(step)){
  const name=`${step===0?'02':step===4?'03':step===5?'04':'05'}-symbol-anchors-step-${step}.png`;
  await page.screenshot({path:`${out}/${name}`});
  snapshots.push({step,file:name,url:page.url(),state:await page.locator('[data-lod], [aria-busy]').evaluateAll(els=>els.map(e=>({id:e.id,lod:e.getAttribute('data-lod'),step:e.getAttribute('data-step'),busy:e.getAttribute('aria-busy')})))});
  console.log('Captured',name);
 }
}
await page.getByRole('button',{name:'3D',exact:true}).click();await page.waitForTimeout(1800);
console.log('3D controls',await page.locator('button,select,input').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().width>0).map(e=>({tag:e.tagName,text:(e.innerText||'').slice(0,45),label:e.getAttribute('aria-label'),title:e.getAttribute('title'),id:e.id,value:e.value})).filter(e=>e.tag!=='BUTTON'||/hop|Structure|Whole|Connections|Tuning|pins|2D|3D/.test(e.text+' '+e.label+' '+e.title))));
await page.getByRole('button',{name:'Layout tuning',exact:true}).click();
console.log('Tuning controls',await page.locator('select,input').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().width>0).map(e=>({tag:e.tagName,label:e.getAttribute('aria-label'),id:e.id,value:e.value,options:e.tagName==='SELECT'?e.innerText:null}))));
fs.writeFileSync(`${out}/journey-readings.json`,JSON.stringify({viewport:[1440,960],snapshots,errors},null,2)+'\n');
await browser.close();

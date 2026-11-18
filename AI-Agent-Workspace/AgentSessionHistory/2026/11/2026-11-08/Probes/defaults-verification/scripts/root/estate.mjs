import {chromium} from 'playwright';
import fs from 'node:fs';
const out='AI-Agent-Workspace/Screenshots/2026-11-08/astra-review';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:960}}), results=[];
 await page.goto('http://localhost:8900/samples/estate/');
 await page.getByRole('combobox',{name:'Search files, symbols and directories; a chosen one is pinned, and a path starts from the newest pin',exact:true}).fill('PaymentService.cs');
 const option=page.getByRole('option').filter({hasText:'PaymentService/PaymentService.cs'}).filter({hasText:'implementation'});
 await option.first().click();await page.waitForTimeout(1200);
 for(let i=0;i<4;i++){await page.getByRole('button',{name:'Zoom Out',exact:true}).click();await page.waitForTimeout(250);}
 const partner=page.getByRole('button',{name:'Pin PaymentsContext.cs',exact:true});
 const box=await partner.boundingBox(); console.log('Partner geometry',JSON.stringify(box));
 await partner.click();await page.waitForTimeout(900);
 await page.screenshot({path:`${out}/10-estate-two-pins-2d.png`});results.push({stage:'two pins 2D',url:page.url()});
 await page.getByRole('button',{name:'3D',exact:true}).click();await page.waitForTimeout(1600);
 await page.getByRole('combobox',{name:'Hops shown',exact:true}).selectOption('1');
 await page.getByRole('button',{name:'Layout tuning',exact:true}).click();
 await page.locator('#tuning-force-group-wrappers').selectOption('skin');
 await page.locator('summary').filter({hasText:/^\s*Tuning\s*$/}).click();
 await page.waitForTimeout(1800);
 await page.screenshot({path:`${out}/11-estate-two-pins-3d.png`});results.push({stage:'two pins 3D',url:page.url()});
 const t=Date.now();await page.getByRole('button',{name:'2D',exact:true}).click();await page.waitForTimeout(1900);
 await page.screenshot({path:`${out}/12-estate-return-2d.png`});results.push({stage:'return 2D',url:page.url(),elapsedIncludingCapture:Date.now()-t,pins:await page.getByRole('button',{name:'Show pins',exact:true}).innerText()});
 await page.waitForTimeout(2500);
 await page.screenshot({path:`${out}/13-estate-return-after-wait.png`});
 console.log('After wait',JSON.stringify(await page.evaluate(()=>({overlays:[...document.querySelectorAll('[class*=perspective]')].map(e=>({tag:e.tagName,cls:e.className})).slice(0,12),names:[...document.querySelectorAll('button')].filter(e=>(e.getAttribute('aria-label')||'')==='PaymentService/PaymentService.cs').map(e=>({text:e.textContent,opacity:getComputedStyle(e).opacity,visibility:getComputedStyle(e).visibility,rect:e.getBoundingClientRect().toJSON()}))}))));
 await page.getByRole('button',{name:'More actions for PaymentService.cs',exact:true}).click();
 console.log('Return menus',JSON.stringify(await page.locator('[role=menu]:visible').innerText()));
 await page.keyboard.press('Escape');
 fs.writeFileSync(`${out}/estate-journey.json`,JSON.stringify({results},null,2)+'\n');
 console.log('Estate journey complete',JSON.stringify(results));
} finally {await browser.close();}

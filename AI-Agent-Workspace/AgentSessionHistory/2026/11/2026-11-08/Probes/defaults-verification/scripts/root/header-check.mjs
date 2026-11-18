import {chromium,expect} from '@playwright/test';
import fs from 'node:fs';
import snapshots from '../../../packages/explorer/src/client/persistence/compressed-url-state.ts';
import pictures from '../../../tests/e2e/still-picture.ts';
const {compressSnapshot,DEFAULT_SNAPSHOT}=snapshots;
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 await page.goto('http://localhost:8911/samples/estate/?s='+compressSnapshot({...DEFAULT_SNAPSHOT,spatialLayout:'structure',openDirectories:new Set(['Portal']),layout:{forceGraph:{groupWrappers:'skin',hops:1}}}));
 await pictures.localMapSettled(page);
 const readings=[];
 const read=async phase=>readings.push({phase,at:Date.now(),names:await page.locator('.node-card[data-id="Portal/Portal.csproj"],.node-card[data-id="Portal/Web.config"]').evaluateAll(cards=>cards.map(card=>({id:card.dataset.id,text:card.innerText,names:[...card.querySelectorAll('*')].filter(e=>e.childElementCount===0 && /^(Portal.csproj|Web.config)$/.test(e.textContent?.trim()??'')).map(e=>({className:e.className,text:e.textContent,style:e.getAttribute('style'),display:getComputedStyle(e).display,opacity:getComputedStyle(e).opacity,visibility:getComputedStyle(e).visibility}))})))});
 await read('source');
 for(const button of ['3D','2D']) {await page.getByRole('button',{name:button,exact:true}).click();await expect(page.locator('.perspective-transition')).toBeVisible();await expect(page.locator('.perspective-transition')).toHaveCount(0);if(button==='3D')await expect(page.locator('#graph-svg')).toHaveAttribute('aria-busy','false',{timeout:25000});else await pictures.localMapSettled(page);}
 await read('after-transition-and-search');
 await page.screenshot({path:'AI-Agent-Workspace/Screenshots/2026-11-08/contained-spheres/root-title-handoff.png'});
 await page.waitForTimeout(2500);await read('2500ms-later');
 await page.screenshot({path:'AI-Agent-Workspace/Screenshots/2026-11-08/contained-spheres/root-title-after-wait.png'});
 fs.writeFileSync('AI-Agent-Workspace/Screenshots/2026-11-08/contained-spheres/root-title-readings.json',JSON.stringify(readings,null,2)+'\n');console.log(JSON.stringify(readings));
} finally {await browser.close();}

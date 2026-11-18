import { chromium } from '@playwright/test';
import { readFile,writeFile } from 'node:fs/promises';
import { observeGraph } from '../../tests/e2e/force-graph-observation.ts';
import { PERSISTED_UI_KEY } from '../../packages/explorer/src/client/persistence/local-storage.ts';
const out='/tmp/live-docs-20261108-defaults-diagnostics',browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage(),report:any={errors:[]};
try{
 await page.route('**/static/index.js',async route=>route.fulfill({body:await readFile(out+'/sphere-prototype.js','utf8'),contentType:'application/javascript'}));
 await page.addInitScript({content:'globalThis.__name=value=>value;'});
 await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:2,tuning:{localMap:{searchStarts:0}}})),PERSISTED_UI_KEY);
 await observeGraph(page);page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.goto('http://localhost:8911/samples/estate/?view=local&mode=3d&layout=structure');
 await page.waitForFunction(()=>{const s=(window as any).freezeState?.();return s&&s.shown===s.total&&s.total>0&&!s.packing&&!s.hulls;},{},{timeout:30000});
 report.comparison=await page.evaluate(()=>{
  const w=window as any;w.__freezeForDraw=true;w.__staticGpuPose=true;
  const{renderer,scene,camera}=w.renderedGraph,gl=renderer.getContext(),mesh=scene.getObjectByName('Spatial shell files');
  const read=()=>{renderer.render(scene,camera);const data=new Uint8Array(renderer.domElement.width*renderer.domElement.height*4);gl.readPixels(0,0,renderer.domElement.width,renderer.domElement.height,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;};
  const before=read(),originalGeometry=mesh.geometry,originalMaterial=mesh.material,getExtension=gl.getExtension.bind(gl),calls:string[]=[];
  gl.getExtension=(name:string)=>{calls.push(name);return name==='OES_sample_variables'||name==='OES_shader_multisample_interpolation'?null:getExtension(name);};
  const fallback=w.spherePrototype.select(renderer);gl.getExtension=getExtension;
  for(const[name,attribute]of Object.entries(originalGeometry.attributes))if((attribute as any).isInstancedBufferAttribute)fallback.geometry.setAttribute(name,attribute);
  mesh.geometry=fallback.geometry;mesh.material=fallback.material??originalMaterial;
  const after=read();let changed=0,max=0;for(let i=0;i<before.length;i++){const d=Math.abs(before[i]-after[i]);if(d)changed++;max=Math.max(max,d);}
  w.__fallbackCanvas=renderer.domElement.toDataURL('image/png');
  mesh.geometry=originalGeometry;mesh.material=originalMaterial;read();w.__nativeCanvas=renderer.domElement.toDataURL('image/png');
  return{instances:mesh.count,capabilitiesForcedUnavailable:calls,material:mesh.material.type,fallbackMaterialCreated:!!fallback.material,geometry:fallback.geometry.type,triangles:fallback.geometry.index.count/3,changedChannels:changed,maxDifference:max,motionPaused:true};
 });
 for(const mode of ['native','fallback']){const data=await page.evaluate(mode=>(window as any)[mode==='native'?'__nativeCanvas':'__fallbackCanvas'],mode);await writeFile(out+'/sphere-'+mode+'-compatibility.png',Buffer.from(data.split(',')[1],'base64'));}
 console.log(JSON.stringify(report));
}finally{await writeFile(out+'/sphere-fallback.json',JSON.stringify(report,null,2)+'\n');await browser.close();}

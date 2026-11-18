import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { observeGraph } from "../../tests/e2e/force-graph-observation.ts";
import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage.ts";
const high=process.env.SPHERE_HIGH_RES==='1',only=process.env.SPHERE_ONLY;
const out='/tmp/live-docs-20261108-defaults-diagnostics',browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage(),report:any={cases:[],errors:[]};
const body=await readFile(out+'/sphere-prototype.js','utf8');
await page.route('**/static/index.js',route=>route.fulfill({body,contentType:'application/javascript'}));
await page.addInitScript({content:'globalThis.__name=value=>value;'});
await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:2,tuning:{localMap:{searchStarts:0}}})),PERSISTED_UI_KEY);
await observeGraph(page);page.on('pageerror',error=>report.errors.push(String(error)));page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
try{
  await page.goto('http://localhost:8911/samples/estate/?view=local&mode=3d&layout=structure');
  await page.waitForFunction(()=>{const s=(window as any).freezeState?.();return s&&s.shown===s.total&&s.total>0&&!s.packing&&!s.hulls;},{},{timeout:30000});
  report.target=await page.evaluate(()=>{
    const w=window as any;w.__freezeForDraw=true;w.__staticGpuPose=true;
    const{scene,camera,renderer}=w.renderedGraph,mesh=scene.getObjectByName('Spatial shell files');
    const slot=mesh.userData.spatialUnits.findIndex((record:any)=>record.id==='Portal/Models/PaymentRequestModel.cs');
    if(slot<0)throw new Error('Actual estate Models file is missing from submitted units');
    const matrix=camera.matrixWorld.clone();mesh.getMatrixAt(slot,matrix);matrix.premultiply(mesh.matrixWorld);
    const center=camera.position.clone().set(matrix.elements[12],matrix.elements[13],matrix.elements[14]),radius=Math.hypot(matrix.elements[0],matrix.elements[1],matrix.elements[2]);
    const direction=camera.position.clone().sub(center).normalize(),right=camera.up.clone().cross(direction).normalize();
    const reference=w.spherePrototype.reference(),referenceHigh=w.spherePrototype.reference(192,128),analytic=w.spherePrototype.make(),quad=w.spherePrototype.quad();
    for(const[name,attribute]of Object.entries(mesh.geometry.attributes))if((attribute as any).isInstancedBufferAttribute){reference.setAttribute(name,attribute);referenceHigh.setAttribute(name,attribute);analytic.geometry.setAttribute(name,attribute);quad.geometry.setAttribute(name,attribute);}
    const native=mesh.material,original={matrices:mesh.instanceMatrix.array.slice(),colors:mesh.instanceColor.array.slice(),alpha:mesh.geometry.getAttribute('spatialOpacity').array.slice(),count:mesh.count};
    const meshes:any[]=[];scene.traverse((object:any)=>{if(object.isMesh)meshes.push({object,visible:object.visible});});
    w.__referenceMode=(mode:string)=>{mesh.geometry=mode==='reference'?reference:mode==='referenceHigh'?referenceHigh:mode==='quad'?quad.geometry:analytic.geometry;mesh.material=mode==='reference'||mode==='referenceHigh'?native:mode==='quad'?quad.material:analytic.material;};
    w.__referencePose=(entry:any)=>{
      camera.clearViewOffset();camera.position.copy(center).addScaledVector(direction,entry.distance*radius).addScaledVector(right,(entry.lateral??0)*radius);
      camera.lookAt(entry.lateral?camera.position.clone().addScaledVector(direction,-3*radius):center.clone().addScaledVector(right,entry.offset*radius));
      camera.near=entry.near*radius;camera.far=entry.far*radius;camera.updateProjectionMatrix();
      if(entry.shift)camera.setViewOffset(1280,800,entry.shift*1280,0,1280,800);
      camera.updateMatrixWorld();
      mesh.instanceMatrix.array.set(original.matrices);mesh.instanceColor.array.set(original.colors);reference.getAttribute('spatialOpacity').array.set(original.alpha);mesh.count=original.count;
      for(const {object,visible}of meshes)object.visible=visible;
      if(entry.isolated||entry.overlap){
        for(const {object}of meshes)object.visible=object===mesh||(entry.overlap&&(object.name==='Spatial wrappers'||object.name==='Spatial shell balloons'));
        const n=entry.overlap?4:1;mesh.count=n;const opacity=reference.getAttribute('spatialOpacity');
        for(let i=0;i<n;i++){
          const from=entry.overlap?[slot,Math.max(0,slot-1),slot,Math.min(slot+1,original.count-1)][i]:slot;
          const transform=matrix.clone();
          if(entry.overlap){const offset=[[-.35,-.5],[.35,-.2],[-.15,.25],[.2,.5]][i];transform.setPosition(center.clone().addScaledVector(right,offset[0]*radius).addScaledVector(direction,offset[1]*radius));}
          mesh.setMatrixAt(i,transform);mesh.instanceColor.setXYZ(i,original.colors[3*from],original.colors[3*from+1],original.colors[3*from+2]);opacity.setX(i,.75);
        }
      }
      mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;reference.getAttribute('spatialOpacity').needsUpdate=true;
    };
    w.__referencePixels=()=>{renderer.render(scene,camera);const gl=renderer.getContext(),data=new Uint8Array(renderer.domElement.width*renderer.domElement.height*4);gl.readPixels(0,0,renderer.domElement.width,renderer.domElement.height,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;};
    w.__referenceBackground=()=>{const count=mesh.count;mesh.count=0;const data=w.__referencePixels();mesh.count=count;return data;};
    return{id:mesh.userData.spatialUnits[slot].id,slot,radius,center:center.toArray(),instances:mesh.count,referenceTriangles:reference.index.count/3,referenceHighTriangles:referenceHigh.index.count/3,samples:renderer.getContext().getParameter(renderer.getContext().SAMPLES),opacity:reference.getAttribute('spatialOpacity').getX(slot)};
  });
  const cases=[
    {name:'close',distance:5,near:.1,offset:0,far:500},
    {name:'off-axis',distance:5,near:.1,offset:2,far:500},
    {name:'near-cap',distance:3,near:2.1,offset:0,far:500},
    {name:'front-clipped',distance:3,near:2.8,offset:0,far:500},
    {name:'inside',distance:.4,near:.1,offset:0,far:500},
    {name:'far-cap',distance:3,near:.1,offset:0,far:2.2},
    {name:'shifted-lens',distance:5,near:.1,offset:0,far:500,shift:.25},
    {name:'eye-cross-outside',distance:.4,lateral:1.4,near:.1,offset:0,far:500},
    {name:'isolated-close',distance:5,near:.1,offset:0,far:500,isolated:true},
    {name:'isolated-near-rim',distance:3,near:2.1,offset:0,far:500,isolated:true},
    {name:'interleaved-overlap-skin',distance:5,near:.1,offset:0,far:500,overlap:true}
  ];
  for(const entry of cases.filter(entry=>(!high||entry.name==='near-cap')&&(!only||entry.name===only))){
    await page.evaluate(entry=>(window as any).__referencePose(entry),entry);
    const comparison:any={...entry,motionPaused:true,uploadedInstanceMatricesHeld:!entry.overlap};
    await page.evaluate(()=>{(window as any).__referenceBg=(window as any).__referenceBackground();});
    for(const mode of high?['reference','analytic96','referenceHigh','analytic']:['reference','quad','analytic']){
      await page.evaluate(mode=>(window as any).__referenceMode(mode),mode);
      await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
      await page.locator('#graph-svg canvas').screenshot({path:out+`/${high?'high-res':'per-sample'}-estate-${entry.name}-${mode}.png`});
      const measured=await page.evaluate(mode=>{
        const w=window as any,data=w.__referencePixels();if(mode==='reference'||mode==='referenceHigh'){
          w.__referenceBaseline=data;w.__referenceUnitMasks=[];
          const mesh=w.renderedGraph.scene.getObjectByName('Spatial shell files');
          if(mesh.count===4){
            const saved={count:mesh.count,matrices:mesh.instanceMatrix.array.slice(),colors:mesh.instanceColor.array.slice(),alphas:mesh.geometry.getAttribute('spatialOpacity').array.slice()};
            const matrix=w.renderedGraph.camera.matrixWorld.clone(),opacity=mesh.geometry.getAttribute('spatialOpacity'),bg=w.__referenceBg;
            for(let at=0;at<saved.count;at++){
              matrix.fromArray(saved.matrices,at*16);mesh.setMatrixAt(0,matrix);mesh.instanceColor.setXYZ(0,saved.colors[3*at],saved.colors[3*at+1],saved.colors[3*at+2]);opacity.setX(0,saved.alphas[at]);
              mesh.count=1;mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;opacity.needsUpdate=true;
              const single=w.__referencePixels(),mask=new Uint8Array(single.length/4);
              for(let p=0;p<mask.length;p++){const i=p*4;mask[p]=Number(Math.max(Math.abs(single[i]-bg[i]),Math.abs(single[i+1]-bg[i+1]),Math.abs(single[i+2]-bg[i+2]))>3);}
              w.__referenceUnitMasks.push(mask);
            }
            mesh.count=saved.count;mesh.instanceMatrix.array.set(saved.matrices);mesh.instanceColor.array.set(saved.colors);opacity.array.set(saved.alphas);mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;opacity.needsUpdate=true;
          }
          return null;
        }
        const baseline=w.__referenceBaseline,bg=w.__referenceBg,width=w.renderedGraph.renderer.domElement.width,height=w.renderedGraph.renderer.domElement.height;
        const mask=new Uint8Array(width*height);for(let p=0;p<mask.length;p++){const i=4*p;mask[p]=Number(Math.max(Math.abs(baseline[i]-bg[i]),Math.abs(baseline[i+1]-bg[i+1]),Math.abs(baseline[i+2]-bg[i+2]))>3);}
        const all={pixels:0,changedAbove3:0,maxChannelDifference:0,total:0},edge={...all},interior={...all};
        for(let p=0;p<mask.length;p++){
          const i=4*p,delta=Math.max(Math.abs(data[i]-baseline[i]),Math.abs(data[i+1]-baseline[i+1]),Math.abs(data[i+2]-baseline[i+2]));
          const x=p%width,y=Math.floor(p/width);let hasInside=false,hasOutside=false;
          for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(x+dx<0||x+dx>=width||y+dy<0||y+dy>=height)continue;if(mask[p+dy*width+dx])hasInside=true;else hasOutside=true;}
          let unitEdge=false;
          for(const unitMask of w.__referenceUnitMasks){let inside=false,outside=false;
            for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(x+dx<0||x+dx>=width||y+dy<0||y+dy>=height)continue;if(unitMask[p+dy*width+dx])inside=true;else outside=true;}
            if(inside&&outside){unitEdge=true;break;}
          }
          for(const region of [all,...(hasInside&&hasOutside||unitEdge?[edge]:[]),...(mask[p]&&!hasOutside&&!unitEdge?[interior]:[])]){region.pixels++;region.total+=delta;region.maxChannelDifference=Math.max(region.maxChannelDifference,delta);if(delta>3)region.changedAbove3++;}
        }
        return Object.fromEntries(Object.entries({all,edge,interior}).map(([name,region])=>[name,{...region,meanPixelDifference:region.total/Math.max(1,region.pixels)}]));
      },mode);
      if(measured)comparison[mode]=measured;
    }
    report.cases.push(comparison);console.log(JSON.stringify(comparison));
  }
  console.log(JSON.stringify({target:report.target,errors:report.errors}));
}finally{await writeFile(out+(high?'/high-res-estate-reference.json':only?'/per-sample-estate-'+only+'.json':'/per-sample-estate-reference.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}

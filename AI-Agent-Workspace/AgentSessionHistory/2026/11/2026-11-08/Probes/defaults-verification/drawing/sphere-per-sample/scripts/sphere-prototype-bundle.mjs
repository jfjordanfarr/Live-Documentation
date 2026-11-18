import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import path from "node:path";
const root=process.cwd();
await build({entryPoints:[path.join(root,'packages/explorer/src/client/index.ts')],outfile:'/tmp/live-docs-20261108-defaults-diagnostics/sphere-prototype.js',bundle:true,format:'esm',minify:true,target:'es2022',logLevel:'silent',loader:{'.ts':'ts'},
  plugins:[{name:'diagnostic-fixed-pose-only',setup(builder){
    builder.onResolve({filter:/^diagnostic-quad$/},()=>({path:'quad',namespace:'diagnostic-quad'}));
    builder.onLoad({filter:/.*/,namespace:'diagnostic-quad'},async()=>({contents:await readFile('/tmp/live-docs-20261108-defaults-diagnostics/containedSphere-quad.ts','utf8'),loader:'ts',resolveDir:path.join(root,'packages/explorer/src/client/views')}));
    builder.onLoad({filter:/forceGraphBatches\.ts$/},async args=>({contents:'import { ContainedSphereMaterial as QuadContainedSphereMaterial } from "diagnostic-quad";\nimport { containedSphereGeometry, containedSpherePrimitive } from "./containedSphere";\n'+await readFile(args.path,'utf8')+'\n(window as any).spherePrototype = {make:()=>({geometry:containedSphereGeometry(),material:new ContainedSphereMaterial()}),quad:()=>({geometry:containedSphereGeometry(),material:new QuadContainedSphereMaterial()}),select:(renderer)=>containedSpherePrimitive(renderer),reference:(width=96,height=64)=>new SphereGeometry(1,width,height)};\n',loader:'ts',resolveDir:path.dirname(args.path)}));
    builder.onLoad({filter:/forceGraphView\.ts$/},async args=>{
    let source=await readFile(args.path,'utf8');
    const marker='    if (!active || !instance) return;';
    if(!source.includes(marker))throw new Error('Missing frozen diagnostic seam');
    source=source.replace(marker,marker+`\n    if ((window as any).__freezeForDraw) { if ((window as any).__staticGpuPose) { const observed=(window as any).renderedGraph; observed.renderer.render(observed.scene,observed.camera); } else { instance.invalidateAppearance(); instance.draw(pictureRevision); } animation=requestAnimationFrame(animateFocus); return; }`);
    source=source.replace('  return { render, setActive, focusNode, focusDirectory',`  (window as any).freezeState=()=>({shown:reveal.shown,total:reveal.order.length,packing:packing.size,hulls:bodyWork.length});\n  return { render, setActive, focusNode, focusDirectory`);
    return{contents:source,loader:'ts',resolveDir:path.dirname(args.path)};
  });}}]});

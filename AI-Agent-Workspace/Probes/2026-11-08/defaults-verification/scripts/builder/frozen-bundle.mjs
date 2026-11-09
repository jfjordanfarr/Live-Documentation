import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import path from "node:path";
const root=process.cwd();
await build({entryPoints:[path.join(root,'packages/explorer/src/client/index.ts')],outfile:'/tmp/live-docs-20261108-defaults-diagnostics/frozen.js',bundle:true,format:'esm',minify:true,target:'es2022',logLevel:'silent',loader:{'.ts':'ts'},
  plugins:[{name:'diagnostic-fixed-pose-only',setup(builder){builder.onLoad({filter:/forceGraphView\.ts$/},async args=>{
    let source=await readFile(args.path,'utf8');
    const marker='    if (!active || !instance) return;';
    if(!source.includes(marker))throw new Error('Missing frozen diagnostic seam');
    source=source.replace(marker,marker+`\n    if ((window as any).__freezeForDraw) { instance.invalidateAppearance(); instance.draw(pictureRevision); animation=requestAnimationFrame(animateFocus); return; }`);
    source=source.replace('  return { render, setActive, focusNode, focusDirectory',`  (window as any).freezeState=()=>({shown:reveal.shown,total:reveal.order.length,packing:packing.size,hulls:bodyWork.length});\n  return { render, setActive, focusNode, focusDirectory`);
    return{contents:source,loader:'ts',resolveDir:path.dirname(args.path)};
  });}}]});

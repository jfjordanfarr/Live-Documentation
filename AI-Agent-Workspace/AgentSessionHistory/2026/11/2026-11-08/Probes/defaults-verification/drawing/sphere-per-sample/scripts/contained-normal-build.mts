import { withExplorerAssets } from '../../packages/explorer/src/shared/buildAssets.ts';
import { build } from 'esbuild';
import { readFile,writeFile,cp,mkdir,readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root=process.cwd(),out='/tmp/live-docs-20261108-defaults-diagnostics',saved='/tmp/live-docs-20261108-defaults-gate3/explorer';
const manifest:any={data:{},assets:[],source:'current source, native fallback before compile; no private production route/freeze'};
if(!process.env.ASSETS_ONLY)for(const sample of ['history','history-window','history-collision']){
 const relative='samples/'+sample;
 await mkdir(out+'/pre-normal-history/'+sample,{recursive:true});
 for(const name of ['explorer-data.json','explorer-history.json']){
  const target=path.join(root,'dist/explorer',relative,name);await cp(target,out+'/pre-normal-history/'+sample+'/'+name);
  await cp(path.join(saved,relative,name),target);
 }
}
await withExplorerAssets(async assets=>{
 const sites=['','samples/estate','samples/history','samples/history-window','samples/history-collision','samples/history-growth'];
 for(const site of sites){
  const target=path.join(root,'dist/explorer',site,'static');await cp(assets.outDir,target,{recursive:true});manifest.assets.push(site+'/static');
  const data=await readFile(path.join(root,'dist/explorer',site,'explorer-data.json'));manifest.data[site||'/']=createHash('sha256').update(data).digest('hex');
 }
});
// This comparison bundle changes only primitive selection. It has no freeze, alternate state, physics or timing hooks.
await build({entryPoints:[path.join(root,'packages/explorer/src/client/index.ts')],outfile:out+'/native-contained-normal.js',bundle:true,format:'esm',sourcemap:true,minify:true,target:'es2022',logLevel:'silent',loader:{'.ts':'ts'},plugins:[{name:'native-contained-control-only',setup(builder){builder.onLoad({filter:/forceGraphBatches\.ts$/},async args=>{
 const source=await readFile(args.path,'utf8'),from='const containedFile = containedSpherePrimitive(renderer);';if(!source.includes(from))throw Error('Missing primitive selection seam');
 return{contents:source.replace(from,'const containedFile = containedSpherePrimitive(undefined);'),loader:'ts',resolveDir:path.dirname(args.path)};
});}}]});
manifest.bundleSha256=createHash('sha256').update(await readFile(path.join(root,'dist/explorer/static/index.js'))).digest('hex');
manifest.nativeControlSha256=createHash('sha256').update(await readFile(out+'/native-contained-normal.js')).digest('hex');
await writeFile(out+'/contained-normal-build.json',JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest));

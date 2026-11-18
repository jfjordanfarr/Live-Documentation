import { createRequire } from 'node:module';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root='/workspaces/Live-Documentation',out='/tmp/live-docs-20261109-waits/energy-variant',frozen='/tmp/live-docs-20261108-defaults-gate5/explorer';
const require=createRequire(root+'/package.json'),{build}=require('esbuild');
const map=JSON.parse(await readFile(frozen+'/static/index.js.map','utf8'));
const sources=new Map(map.sources.map((p,i)=>[path.join(root,p.split('live-docs-20261108-defaults/')[1]),map.sourcesContent[i]]));
const sha=b=>createHash('sha256').update(b).digest('hex');
const originals={};for(const [p,s] of sources) originals[p]=sha(s);
await writeFile(out+'/frozen-source-sha256.json',JSON.stringify(originals,null,2));
const patch=(s,a,b)=>{if(s.split(a).length!==2)throw Error('Unmatched diagnostic seam: '+a.slice(0,90));return s.replace(a,b);};
function motionInstrument(s){
 s=patch(s,'  const force = ((): void => {',`  const __audit = { calls: 0, completeTicks: 0, cpuMs: 0, maxCpuMs: 0, initialized: 0, wakes: 0, invalidations: 0, stirs: 0, lastMoveMax: 0, lastDiagonal: 0 };
  const force = ((): void => {
    const __auditAt = performance.now();
    try {`);
 s=patch(s,'    const diagonal = diagonalOf(x, motion.field.radii);',`    __audit.completeTicks++;
    const diagonal = diagonalOf(x, motion.field.radii);
    __audit.lastMoveMax = tick.moveMax; __audit.lastDiagonal = diagonal;`);
 s=patch(s,'  }) as unknown as MotionForce<N>;',`    } finally {
      const cost = performance.now() - __auditAt; __audit.calls++; __audit.cpuMs += cost; __audit.maxCpuMs = Math.max(__audit.maxCpuMs, cost);
    }
  }) as unknown as MotionForce<N>;
  Object.defineProperty(force, "audit", { get: () => ({ ...__audit, quiet, still, holding, pendingStart: begin, nodes: nodes.length, fieldNodes: motion?.field.count,
    fixed: nodes.filter(node => node.fx != null || node.fy != null || node.fz != null).length,
    threshold: STILL_FRACTION * __audit.lastDiagonal, strength: source.strength(), revealReady: source.readyToAnchor?.() ?? true }) });`);
 s=patch(s,'initialize: (next: N[]): void => { keep();','initialize: (next: N[]): void => { __audit.initialized++; keep();');
 s=patch(s,'wake: (start: MotionStart = "hold"): void => { still','wake: (start: MotionStart = "hold"): void => { __audit.wakes++; still');
 s=patch(s,'invalidate: (): void => { keep();','invalidate: (): void => { __audit.invalidations++; keep();');
 s=patch(s,'stir: (): void => { still','stir: (): void => { __audit.stirs++; still');
 return s;
}
function viewInstrument(s){
 const from=s.indexOf('  function animateFocus(): void {'),to=s.indexOf('\n  function ',from+10);
 if(from<0||to<0)throw Error('Missing frame');
 let body=s.slice(from,to);
 body=patch(body,'    animation = 0;',`    const __frameAt = performance.now();
    if (__lastFrame) __record("cadence", __frameAt - __lastFrame); __lastFrame = __frameAt;
    animation = 0;`);
 for(const [name,call] of [['physics','simulation.tick()'],['frameDirectory','frameDirectory()'],['bodies','buildBodies()'],['bursts','advanceBursts()'],['controls','instance.updateControls()'],['focus','updateFocus(performance.now())'],['draw','instance.draw(pictureRevision)'],['hover','updatePointerHover()'],['grow','grow()']])
  body=patch(body,call+';',`__phase("${name}", () => ${call});`);
 body=patch(body,'    animation = requestAnimationFrame(animateFocus);','    __record("frameCpu", performance.now() - __frameAt);\n    animation = requestAnimationFrame(animateFocus);');
 const helper=`  const __times: Record<string, {count:number;total:number;max:number}> = {};
  let __lastFrame = 0, __lastSample = 0, __sampleCost = 0, __lastMembership = "";
  let __lastPositions = new Map<string, {x:number;y:number;z:number}>();
  function __record(name:string,time:number):void { const row = __times[name] ??= {count:0,total:0,max:0}; row.count++; row.total += time; row.max=Math.max(row.max,time); }
  function __phase(name:string,call:()=>unknown):void { const at=performance.now(); call(); __record(name,performance.now()-at); }
  function __sample(reason="timer"):void {
    const at=performance.now(), instance=forceGraphInstance;
    const nodes=instance?.graphData().nodes ?? [];
    let displacement=0;
    const positions=new Map<string,{x:number;y:number;z:number}>();
    for(const node of nodes){ const pos={x:node.x??0,y:node.y??0,z:node.z??0},old=__lastPositions.get(node.id); if(old)displacement=Math.max(displacement,Math.hypot(pos.x-old.x,pos.y-old.y,pos.z-old.z)); positions.set(node.id,pos); }
    __lastPositions=positions;
    const ids=nodes.map(node=>node.id),key=ids.join("\\0");
    const root=requireElement("graph-svg"), scene=instance?.renderer().info.render;
    const data={reason,epoch:performance.timeOrigin+at,elapsed:at,sincePrevious:__lastSample?at-__lastSample:0,active,ready,
      moment:moment?.step??null,commit:moment?.commit.id??null,canonicalFiles:(moment?.graph??graphData).nodes.length,
      busy:root.getAttribute("aria-busy"),simulationRunning,strength,motionStill:motion?.still,revision:motion?.revision,
      reveal:{shown:reveal.shown,total:reveal.order.length},packing:packing.size,packingFrame,
      actualNodes:nodes.length,actualFiles:nodes.filter(node=>node.directoryPath===undefined&&node.shellFiles===undefined).length,
      cells:cells.size,shells:shells.size,wrapped:wrapped.size,bodyWork:bodyWork.length,bursts:bursts.size,
      membership:key!==__lastMembership?ids:undefined,maxDisplacement:displacement,
      motion:(motion as MotionForce<ForceGraphNode>&{audit?:unknown})?.audit,phases:__times,
      triangles:scene?.triangles,drawCalls:scene?.calls,previousSampleCost:__sampleCost};
    __lastMembership=key;__lastSample=at;
    console.log("__LD_WAITS__",JSON.stringify(data));
    __sampleCost=performance.now()-at;
  }
  (window as unknown as {__ldWaitSnapshot:()=>void}).__ldWaitSnapshot=()=>__sample("requested");
  const __sampleTimer=window.setInterval(()=>__sample(),1000);
  window.addEventListener("pagehide",()=>window.clearInterval(__sampleTimer),{once:true});
`;
 let result=s.slice(0,from)+helper+body+s.slice(to);
 result=patch(result,'      container.setAttribute("aria-busy", "false");\n      return;\n    }\n    motion.wake(start);','      container.setAttribute("aria-busy", "false");\n      __sample("move-stop");\n      return;\n    }\n    motion.wake(start);');
 result=patch(result,'    container.setAttribute("aria-busy", "true");\n  }\n\n  return { render','    container.setAttribute("aria-busy", "true");\n    __sample("move-start");\n  }\n\n  return { render');
 return result;
}
async function compile(kind){
 await mkdir(out+'/'+kind,{recursive:true});
 await build({entryPoints:[root+'/packages/explorer/src/client/index.ts'],outfile:out+'/'+kind+'/index.js',bundle:true,format:'esm',sourcemap:true,minify:true,target:'es2022',logLevel:'silent',loader:{'.ts':'ts'},plugins:[{name:'frozen-gate5-only',setup(builder){builder.onLoad({filter:/\.[cm]?[jt]s$/},async args=>{
  if(!sources.has(args.path))return null;
  let source=sources.get(args.path);
  if(kind==='diagnostic'&&args.path.endsWith('/forceGraphLayout.ts'))source=motionInstrument(source);
  if(kind==='diagnostic'&&args.path.endsWith('/forceGraphView.ts'))source=viewInstrument(source);
  return{contents:source,loader:args.path.endsWith('.ts')?'ts':'js',resolveDir:path.dirname(args.path)};
 });}}]});
}
await compile('baseline');
const before=sha(await readFile(frozen+'/static/index.js')),baseline=sha(await readFile(out+'/baseline/index.js'));
await writeFile(out+'/baseline-proof.json',JSON.stringify({frozen:before,rebuilt:baseline,identical:before===baseline},null,2));
if(before!==baseline)throw Error('Rebuilt frozen baseline differs: stop before measurement');
await compile('diagnostic');
await writeFile(out+'/bundle-provenance.json',JSON.stringify({frozen:before,baseline,diagnostic:sha(await readFile(out+'/diagnostic/index.js')),sources:sources.size,changes:'read-only diagnostic state/counters/timers/logging in frozen forceGraphView and forceGraphLayout only'},null,2));
console.log('Frozen baseline byte-identical; diagnostic bundle built');

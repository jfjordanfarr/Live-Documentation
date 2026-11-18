import { readFile, writeFile } from 'node:fs/promises';
import { SpatialField, SpatialMotion, diagonalOf } from './replay-source/forceGraphPhysics';
const input=process.argv[2],nextInput=process.argv[3]?.startsWith("--")?undefined:process.argv[3];
if(!input)throw Error('Supply a captured complete-boundary snapshot, optionally its immediately following tick');
const saved=JSON.parse(await readFile(input,'utf8'));
if(saved.format!=='live-docs-motion-replay/1'||saved.motion.pending!==null||saved.motion.rereading!==null)throw Error('Wrong snapshot or partial tick');
const f=saved.field,m=saved.motion,w=saved.wrapper,limits=saved.limits;
const field=new SpatialField(Float64Array.from(f.radii),f.springs,f.settings,(i,j)=>f.directions[i+':'+j],f.softness?Float64Array.from(f.softness):undefined,f.mass?Float64Array.from(f.mass):undefined);
const motion=new SpatialMotion(field,Float64Array.from(m.positions),m.settings,Float64Array.from(m.velocity),Float64Array.from(m.anchor));
const raw=motion as unknown as Record<string,unknown>;
raw.held=m.held;for(const [name,values]of Object.entries(m.caches)) (raw[name]as Float64Array).set(values as number[]);
// This getter prevents accidental extra evaluation or fictitious potential energy in a replay.
raw.reading={...m.reading,get energy(){throw Error('Snapshot intentionally omits lazy energy; measure independently');}};
const fixed=new Set<number>(saved.nodes.flatMap((node:Record<string,unknown>,i:number)=>node.fx!=null||node.fy!=null||node.fz!=null?[i]:[]));
let quiet=w.quiet,holding=w.holding,first:unknown=null,stopped=false;
const maxTicks=process.argv.includes('--one-tick')?1:5000;
const report:Array<unknown>=[];
const began=performance.now(),cpuAt=process.cpuUsage(),initial=Float64Array.from(motion.positions);
let lastPositions=Float64Array.from(motion.positions);
for(let tick=1;tick<=maxTicks;tick++){
 const result=motion.tick(w.strength,fixed),diagonal=diagonalOf(motion.positions,field.radii);
 if(!holding&&w.revealReady&&result.moveMax<=limits.unfoldedFraction*diagonal){motion.anchorHere();holding=true;}
 quiet=holding&&!fixed.size&&result.moveMax<=limits.stillFraction*diagonal?quiet+1:0;
 if(tick===1){
  let comparison:unknown=null;
  if(nextInput){const expected=JSON.parse(await readFile(nextInput,'utf8'));const diff=(a:Float64Array,b:number[])=>Math.max(0,...Array.from(a,(v,i)=>Math.abs(v-b[i])));comparison={positions:diff(motion.positions,expected.motion.positions),velocity:diff(motion.velocity,expected.motion.velocity),anchor:diff(motion.anchor,expected.motion.anchor),forceCache:diff(raw.force as Float64Array,expected.motion.caches.force)};}
  first={tick,moveMax:result.moveMax,comparison};
 }
 if(tick<=2||tick%100===0||quiet>=limits.quietTicks){
  const bodies=saved.ids.map((id:string,i:number)=>{const a=3*i;return {id,travel:(raw.travelled as Float64Array)[i],speed:Math.hypot(...motion.velocity.subarray(a,a+3)),cachedForce:Math.hypot(...(raw.force as Float64Array).subarray(a,a+3)),fromStart:Math.hypot(...motion.positions.subarray(a,a+3).map((v,k)=>v-initial[a+k])),sincePrevious:Math.hypot(...motion.positions.subarray(a,a+3).map((v,k)=>v-lastPositions[a+k]))};}).sort((a:any,b:any)=>b.travel-a.travel);
  report.push({tick,moveMax:result.moveMax,threshold:limits.stillFraction*diagonal,quiet,overlaps:result.overlaps,worstOverlap:result.worstOverlap,stiffness:result.stiffness,dominant:bodies.slice(0,4),maxCachedForce:Math.max(...bodies.map((b:any)=>b.cachedForce)),maxFromStart:Math.max(...bodies.map((b:any)=>b.fromStart)),maxSincePrevious:Math.max(...bodies.map((b:any)=>b.sincePrevious))});
  lastPositions.set(motion.positions);
 }
 if(quiet>=limits.quietTicks){stopped=true;break;}
}
await writeFile(input+'.replay.json',JSON.stringify({input,nextInput,first,stopped,requestedTicks:maxTicks,wallMs:performance.now()-began,cpuMicroseconds:process.cpuUsage(cpuAt),report,tail:{positions:Array.from(motion.positions),velocity:Array.from(motion.velocity),anchor:Array.from(motion.anchor)}},null,2)+'\n');

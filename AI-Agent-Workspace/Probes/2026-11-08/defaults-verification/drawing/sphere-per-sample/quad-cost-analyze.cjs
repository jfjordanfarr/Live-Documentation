const fs=require('node:fs');
const dir='/tmp/live-docs-20261108-defaults-diagnostics';
const raw=JSON.parse(fs.readFileSync(dir+'/quad-cost-raw.json','utf8'));
function summary(sample){
 const p=sample.projection,planes=[];
 for(const [axis,name] of [[0,'x'],[1,'y'],[2,'z']])for(const sign of [-1,1]){
  const plane=[p[3]+sign*p[axis],p[7]+sign*p[4+axis],p[11]+sign*p[8+axis],p[15]+sign*p[12+axis]];
  planes.push({name:name+(sign===1?'-':'+'),plane,length:Math.hypot(...plane.slice(0,3))});
 }
 const stats={revision:sample.state.revision,at:sample.at,frames:sample.frames,canvas:sample.canvas,count:sample.units.length,revealed:sample.state.revealed,total:sample.state.total,packing:sample.state.packing,behind:0,eyeInside:0,eyeCrossing:0,frustumOutside:0,outsideByPlane:{},fullViewportQuads:0,fullViewportOutside:0,quadViewportAreas:0,outsideQuadViewportAreas:0,cases:[]};
 for(const u of sample.units){
  const [x,y,z]=u.center,r=u.radius,d=-z;
  const behind=d+r<=0,inside=x*x+y*y+z*z<=r*r;
  const rejected=planes.filter(({plane:a,length})=>a[0]*x+a[1]*y+a[2]*z+a[3]<-r*length).map(v=>v.name);
  if(behind)stats.behind++;if(inside)stats.eyeInside++;
  const crosses=d<=r&&!behind&&!inside;if(crosses)stats.eyeCrossing++;
  if(rejected.length){stats.frustumOutside++;for(const name of rejected)stats.outsideByPlane[name]=(stats.outsideByPlane[name]??0)+1;}
  let low=[-1,-1],high=[1,1];
  if(d>r+1e-6){const den=d*d-r*r;const half=[p[0]*r*Math.sqrt(x*x+den)/den,p[5]*r*Math.sqrt(y*y+den)/den];const mid=[p[0]*x*d/den-p[8],p[5]*y*d/den-p[9]];low=mid.map((v,i)=>v-half[i]);high=mid.map((v,i)=>v+half[i]);}
  const area=behind||inside?0:Math.max(0,Math.min(1,high[0])-Math.max(-1,low[0]))*Math.max(0,Math.min(1,high[1])-Math.max(-1,low[1]))/4;
  if(crosses){stats.fullViewportQuads++;if(rejected.length)stats.fullViewportOutside++;}
  stats.quadViewportAreas+=area;if(rejected.length)stats.outsideQuadViewportAreas+=area;
  stats.cases.push({...u,depth:d,behind,eyeInside:inside,eyeCrossing:crosses,rejected,quadNdc:{low,high},viewportArea:area});
 }
 stats.quadPixelAreas=stats.quadViewportAreas*sample.canvas.width*sample.canvas.height;
 stats.outsideQuadPixelAreas=stats.outsideQuadViewportAreas*sample.canvas.width*sample.canvas.height;
 return stats;
}
const report={description:'View-space sphere/six-plane separation and GPU-equivalent bounding quad clipped to viewport. Areas count overdraw, not union or covered sphere pixels. No depth occlusion assumptions.',runs:raw.runs.map(run=>({mode:run.mode,bundleSha256:run.bundleSha256,defaults:run.defaults,errors:run.errors,samples:run.samples.map(summary)}))};
fs.writeFileSync(dir+'/quad-cost-summary.json',JSON.stringify(report,null,2)+'\n');
for(const run of report.runs){console.log(run.mode);for(const s of run.samples.filter(s=>[10,50,100,110,150,200,250,260].includes(s.revision)))console.log(JSON.stringify({...s,cases:undefined}));}

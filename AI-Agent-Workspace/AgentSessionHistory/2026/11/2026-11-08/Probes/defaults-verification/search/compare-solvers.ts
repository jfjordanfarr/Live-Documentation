import assert from 'node:assert/strict';
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { rankByNetworkSimplex as original, type Constraint } from '/tmp/live-docs-20261108-search-review/network-simplex.original.ts';
import { rankByNetworkSimplex as current } from '/tmp/live-docs-20261108-defaults/packages/explorer/src/client/views/localView/network-simplex.ts';

const root='/tmp/live-docs-20261108-search-review';
const captured=JSON.parse(fs.readFileSync(root+'/real-solver-inputs.json','utf8'));
const cases:Array<{name:string,count:number,constraints:Constraint[]}>=captured.inputs.map((input:any,index:number)=>({name:'real-'+(index+1),count:input.count,constraints:input.constraints}));
for(let seed=1;seed<=400;seed++){
 let state=seed;
 const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const count=6+Math.floor(next()*40),mid=Math.floor(count/2);
 const constraints:Constraint[]=[];
 for(let edge=0;edge<count*3;edge++){
  const low=next()<.5?0:mid,high=low===0?mid:count-1;
  const tail=low+Math.floor(next()*(high-low-1)),head=tail+1+Math.floor(next()*(high-tail-1));
  constraints.push({tail,head,delta:Math.floor(next()*12)-5,weight:next()<.25?0:Math.floor(next()*9)});
  if(edge%4===0)constraints.push({tail,head,delta:Math.floor(next()*12)-5,weight:Math.floor(next()*4)});
 }
 if(seed%3===0)constraints.push({tail:0,head:0,delta:0,weight:5});
 cases.push({name:'seed-'+seed,count,constraints});
 if(seed<=12)cases.push({name:'zero-'+seed,count,constraints:constraints.map(edge=>({...edge,weight:0}))});
}
const comparisons=[];let originalMs=0,currentMs=0;
for(const input of cases){
 const before=JSON.stringify(input.constraints);
 let started=performance.now();const expected=original(input.count,input.constraints);const oldMs=performance.now()-started;originalMs+=oldMs;
 started=performance.now();const actual=current(input.count,input.constraints);const newMs=performance.now()-started;currentMs+=newMs;
 assert.deepStrictEqual(actual,expected,input.name+' exact positions/cost/optimal');
 assert.equal(JSON.stringify(input.constraints),before,input.name+' leaves input constraints unchanged');
 comparisons.push({name:input.name,count:input.count,edges:input.constraints.length,originalMs:oldMs,currentMs:newMs,result:expected});
}
const summary={cases:cases.length,real:captured.inputs.length,seeded:400,zero:12,exact:true,originalMs,currentMs,comparisons};
fs.writeFileSync(root+'/solver-equivalence.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify({cases:summary.cases,real:summary.real,seeded:summary.seeded,zero:summary.zero,exact:true,originalMs,currentMs}));

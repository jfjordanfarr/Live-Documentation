const fs=require('node:fs');
const {Page}=require('/workspaces/Live-Documentation/node_modules/playwright-core/lib/client/page.js');
const file=process.env.LD_AUDIT_EVENTS;
const write=data=>{if(file)fs.appendFileSync(file,JSON.stringify({hostEpoch:Date.now(),case:process.env.LD_AUDIT_CASE,...data})+'\n');};
const original=Page.prototype.goto;
Page.prototype.goto=async function(...args){
 if(!this.__ldAuditHook){this.__ldAuditHook=true;
  this.on('console',m=>{const value=m.text();if(value.startsWith('__LD_WAITS__ ')){try{write({type:'sample',...JSON.parse(value.slice(13))});}catch(error){write({type:'parse-error',value,error:String(error)});}}
   else if(m.type()==='error'||m.type()==='warning')write({type:'console',level:m.type(),text:value});});
  this.on('pageerror',error=>write({type:'page-error',message:String(error),stack:error.stack}));
 }
 write({type:'goto-issued',url:args[0]});const result=await original.apply(this,args);write({type:'goto-returned',url:this.url()});return result;
};

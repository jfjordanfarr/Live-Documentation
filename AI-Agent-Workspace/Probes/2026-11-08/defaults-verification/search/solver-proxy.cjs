const fs=require('node:fs');
const crypto=require('node:crypto');
const http=require('node:http');
const ts=require('/tmp/live-docs-20261108-defaults/node_modules/typescript');
const esbuild=require('/tmp/live-docs-20261108-defaults/node_modules/esbuild');
const root='/tmp/live-docs-20261108-search-review';
const original=fs.readFileSync('/tmp/live-docs-20261108-defaults-gate3/explorer/static/index.js','utf8');
const source=fs.readFileSync('/tmp/live-docs-20261108-defaults/packages/explorer/src/client/views/localView/network-simplex.ts','utf8');
const ast=ts.createSourceFile('gate3.js',original,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const matches=[];
const visit=node=>{if(ts.isFunctionDeclaration(node)&&node.name?.text==='hf'&&node.getText(ast).startsWith('function hf(n,e){let t=e.filter'))matches.push(node);ts.forEachChild(node,visit);};visit(ast);
if(matches.length!==1)throw new Error('Expected exactly the original gate3 solver declaration');
const compiled=esbuild.buildSync({stdin:{contents:source,loader:'ts',sourcefile:'network-simplex.candidate.ts'},bundle:true,format:'iife',globalName:'__liveDocsSolverCandidate',minify:true,target:'es2022',write:false}).outputFiles[0].text;
const declaration=matches[0];
const replacement=compiled+'\nfunction hf(n,e){return __liveDocsSolverCandidate.rankByNetworkSimplex(n,e)}';
const candidate=original.slice(0,declaration.getStart(ast))+replacement+original.slice(declaration.end);
const sha=text=>crypto.createHash('sha256').update(text).digest('hex');
fs.mkdirSync(root+'/candidate',{recursive:true});
fs.writeFileSync(root+'/candidate/index.js',candidate);
fs.writeFileSync(root+'/candidate/provenance.json',JSON.stringify({upstream:'http://localhost:8911',proxy:'http://localhost:8913',originalJsSha256:sha(original),candidateJsSha256:sha(candidate),solverSourceSha256:sha(source),replaced:{start:declaration.getStart(ast),end:declaration.end},method:'Only original solver function delegates to the compiled current source; original helpers remain unused; all other upstream bytes untouched.'},null,2));
http.createServer(async(req,res)=>{
 try{
  if(new URL(req.url,'http://localhost:8913').pathname==='/static/index.js'){
   res.writeHead(200,{'Content-Type':'application/javascript','Cache-Control':'no-store'});res.end(candidate);return;
  }
  const upstream=await fetch('http://localhost:8911'+req.url);
  const headers=Object.fromEntries(upstream.headers);delete headers['content-encoding'];delete headers['content-length'];headers['cache-control']='no-store';
  res.writeHead(upstream.status,headers);res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch(error){res.writeHead(500);res.end(String(error));}
}).listen(8913,()=>console.log('Solver-only candidate proxy ready on8913'));

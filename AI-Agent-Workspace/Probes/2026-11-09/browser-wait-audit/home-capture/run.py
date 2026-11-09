from pathlib import Path
import subprocess,os,time,json
ROOT=Path('/workspaces/Live-Documentation');BASE=Path('/tmp/live-docs-20261109-waits');OUT=BASE/'home-capture'
with (OUT/'build.log').open('w') as log:subprocess.run(['node',str(OUT/'build.mjs')],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,check=True)
env=dict(os.environ,LIVE_DOCS_E2E_PORT='8911',NODE_OPTIONS='--require='+str(OUT/'hook.cjs'),LD_AUDIT_CASE='home-full-state',LD_AUDIT_EVENTS=str(OUT/'events.jsonl'))
command=['node_modules/.bin/playwright','test','--config','tests/e2e/playwright.config.ts','tests/e2e/history-scrubber.spec.ts','--grep',"a drag places every step it crosses without a tick, and the rest settles at the tuning's energy$",'--output',str(OUT/'results'),'--reporter=list']
started=time.time()
with (OUT/'case.log').open('w') as log:r=subprocess.run(command,cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT)
result={'command':command,'exitCode':r.returncode,'startedEpoch':started*1000,'durationSeconds':time.time()-started};(OUT/'run-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result),flush=True)
events=[json.loads(x) for x in (OUT/'events.jsonl').read_text().splitlines()];states=[x for x in events if x.get('type')=='state']
for state in states:(OUT/('state-%04d.json'%state['relativeTick'])).write_text(json.dumps(state,indent=2)+'\n')
print('Captured complete-boundary states:',[s['relativeTick'] for s in states],flush=True)
if not {0,1}.issubset({s['relativeTick'] for s in states}):raise RuntimeError('Adjacent initial browser states not available')
with (OUT/'one-tick-validation.log').open('w') as log:subprocess.run(['node_modules/.bin/tsx',str(BASE/'replay.mts'),str(OUT/'state-0000.json'),str(OUT/'state-0001.json'),'--one-tick'],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,check=True)
proof=json.loads((OUT/'state-0000.json.replay.json').read_text());print('One-tick comparison:',json.dumps(proof['first']),flush=True)
if any(value!=0 for value in proof['first']['comparison'].values()):raise RuntimeError('One-tick replay differs: no ablations permitted')

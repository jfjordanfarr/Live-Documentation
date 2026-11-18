from pathlib import Path
import os,subprocess,time,json
ROOT=Path('/workspaces/Live-Documentation');OUT=Path('/tmp/live-docs-20261109-waits/energy-variant')
with (OUT/'build.log').open('w') as log:subprocess.run(['node',str(OUT/'build.mjs')],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,check=True)
env=dict(os.environ,LIVE_DOCS_E2E_PORT='8911',NODE_OPTIONS='--require='+str(OUT/'hook.cjs'),LD_AUDIT_CASE='energy-after-home-variant',LD_AUDIT_EVENTS=str(OUT/'events.jsonl'))
command=['node_modules/.bin/playwright','test','--config',str(OUT/'playwright.config.ts'),'--grep',"a drag places every step it crosses without a tick, and the rest settles at the tuning's energy$",'--reporter=list']
started=time.time()
with (OUT/'case.log').open('w') as log:r=subprocess.run(command,cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT)
(OUT/'run-result.json').write_text(json.dumps({'command':command,'exitCode':r.returncode,'startedEpoch':started*1000,'durationSeconds':time.time()-started,'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT).decode().strip()},indent=2)+'\n');print('Exit',r.returncode,flush=True)

from pathlib import Path
import subprocess,os,time,json,hashlib
ROOT=Path('/workspaces/Live-Documentation');OUT=Path('/tmp/live-docs-20261109-waits')
env=dict(os.environ,LIVE_DOCS_E2E_PORT='8911',NODE_OPTIONS='--require=/tmp/live-docs-20261109-waits/hook.cjs')
results=[]
cases=[('history-address','tests/e2e/history-scrubber.spec.ts','the address carries the commit and the authors toggle, a link to a moment opens on it, and leaving 3D returns the picture to today$'),('history-home','tests/e2e/history-scrubber.spec.ts',"a drag places every step it crosses without a tick, and the rest settles at the tuning's energy$"),('whole-initial','tests/e2e/force-graph-update.spec.ts',"a change at full energy and a gentler one each come to rest and stay still, both keep the lines' objects, and the levers ride the address$")]
for name,spec,grep in cases:
 env.update(LD_AUDIT_CASE=name,LD_AUDIT_EVENTS=str(OUT/(name+'.jsonl')))
 command=['node_modules/.bin/playwright','test','--config','tests/e2e/playwright.config.ts',spec,'--grep',grep,'--output',str(OUT/(name+'-results')),'--reporter=list']
 started=time.time()
 with (OUT/(name+'.log')).open('w') as log:r=subprocess.run(command,cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT)
 result={'case':name,'exitCode':r.returncode,'startedEpoch':started*1000,'durationSeconds':time.time()-started,'command':command};results.append(result);(OUT/'run-results.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(result),flush=True)

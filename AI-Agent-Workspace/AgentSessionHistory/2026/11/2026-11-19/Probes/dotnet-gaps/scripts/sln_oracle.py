"""The projects each solution names, by Microsoft's own parser (`dotnet sln <file> list`), checked against the disk.

Writes JSON: {solution: {"projects": [written paths], "exists": n, "caseOnly": n, "missing": n}}.
"""
import json, os, subprocess, sys
root = os.path.abspath(sys.argv[1])
SKIP = {'.' + 'git', '.live-documentation', 'node_modules'}
allf = []
for d, dirs, files in os.walk(root):
    dirs[:] = [x for x in dirs if x not in SKIP]
    for f in files:
        allf.append(os.path.relpath(os.path.join(d, f), root))
exact = set(allf)
folded = {}
for f in allf:
    folded.setdefault(f.lower(), []).append(f)
result = {}
for sln in sorted(f for f in allf if f.lower().endswith('.sln')):
    run = subprocess.run(['dotnet', 'sln', os.path.join(root, sln), 'list'], capture_output=True, text=True)
    lines = [l.strip() for l in run.stdout.splitlines()]
    if '----------' in lines:
        lines = lines[lines.index('----------') + 1:]
    projects = [l.replace('\\', '/') for l in lines if l]
    rec = {'projects': projects, 'exists': 0, 'caseOnly': 0, 'missing': 0, 'stderr': run.stderr.strip()[:300]}
    for p in projects:
        target = os.path.normpath(os.path.join(os.path.dirname(sln), p)).replace('\\', '/')
        if target in exact:
            rec['exists'] += 1
        elif target.lower() in folded:
            rec['caseOnly'] += 1
        else:
            rec['missing'] += 1
    result[sln] = rec
json.dump(result, open(sys.argv[2], 'w'), indent=1)
for k, v in result.items():
    print(k, 'projects', len(v['projects']), 'exists', v['exists'], 'caseOnly', v['caseOnly'], 'missing', v['missing'], v['stderr'][:120])

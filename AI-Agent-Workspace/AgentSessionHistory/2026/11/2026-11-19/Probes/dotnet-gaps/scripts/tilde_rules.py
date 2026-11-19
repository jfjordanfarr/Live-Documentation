"""Score rules for what `~/` in a directive resolves against, on one corpus.

own:     the folder of the nearest project file (.csproj/.vbproj) above the markup
web:     own, else the folder of a web project (classic web GUID or Sdk.Web) where the file exists, when exactly one
repo:    the workspace root (today's reader)
"""
import json, sys, os, re, collections
recs = [json.loads(l) for l in open(sys.argv[1])]
root = sys.argv[2]
SKIP = {'.' + 'git', '.live-documentation', 'node_modules'}
allf = []
for d, dirs, files in os.walk(root):
    dirs[:] = [x for x in dirs if x not in SKIP]
    for f in files:
        allf.append(os.path.relpath(os.path.join(d, f), root))
folded = collections.defaultdict(list)
for f in allf:
    folded[f.lower()].append(f)
projects = {}
for f in allf:
    if f.lower().endswith(('.csproj', '.vbproj')):
        text = open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
        web = '349c5851-65df-11da-9384-00065b846f21' in text.lower() or re.search(r'Sdk\s*=\s*"[^"]*\.Web"', text) is not None
        projects.setdefault(os.path.dirname(f), []).append((f, web))
web_roots = sorted(d for d, ps in projects.items() if any(w for _, w in ps))

def nearest_project(rel):
    d = os.path.dirname(rel)
    while True:
        if d in projects:
            return d
        if not d:
            return None
        d = os.path.dirname(d)

def hit(base, tail):
    p = ((base + '/') if base else '') + tail
    return folded.get(p.lower(), [])

score = collections.Counter(); examples = {}
for r in recs:
    if r['kind'] != 'path' or not r['written'].startswith('~/'):
        continue
    tail = r['written'][2:]
    own = nearest_project(r['file'])
    o = hit(own, tail) if own is not None else []
    webhits = [w for w in web_roots if hit(w, tail)]
    rp = hit('', tail)
    verdict = ('own' if o else 'web-unique' if len(webhits) == 1 else 'web-ambiguous' if webhits else 'repo' if rp else 'none')
    score[verdict] += 1
    examples.setdefault(verdict, (r['file'], r['written'], own, webhits[:3]))
print('web project roots:', web_roots)
for k, v in score.most_common():
    print(v, k, examples[k])

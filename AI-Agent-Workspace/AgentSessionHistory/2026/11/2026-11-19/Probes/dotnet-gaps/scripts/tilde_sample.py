"""A seeded draw (seed 1119) of 20 resolved `~/` directive wires from a corpus's derived index, with what is needed to
judge whether each is the file the application would load: the markup, the written path, the target, the markup's own
project, and whether the target is in that project or another one.
"""
import json, os, random, sys
corpus = sys.argv[1]
recs = [json.loads(l) for l in open(sys.argv[2])]
index = json.load(open(os.path.join(corpus, '.live-documentation', 'index.json')))['files']
projdirs = {os.path.dirname(k) for k in index if k.lower().endswith(('.csproj', '.vbproj'))}

def project_dir(rel):
    d = os.path.dirname(rel)
    while True:
        if d in projdirs:
            return d
        if not d:
            return None
        d = os.path.dirname(d)

wires = []
for r in recs:
    if r['kind'] != 'path' or not r['written'].startswith('~/'):
        continue
    tail = r['written'][2:].lower()
    targets = [t for t in index[r['file']].get('outbound', []) if t.lower().endswith('/' + tail) or t.lower() == tail]
    if targets:
        wires.append((r['file'], r['directive'], r['attr'], r['written'], targets[0]))
wires.sort()
print('resolved ~/ wires:', len(wires))
for file, directive, attr, written, target in random.Random(1119).sample(wires, min(20, len(wires))):
    own = project_dir(file)
    where = 'own project' if project_dir(target) == own else 'host ' + str(project_dir(target))
    print(f'{file} | {directive} {attr}={written} -> {target} | {where}')

"""A seeded draw (seed 1119) of 40 compiler edges we lack where a type is named that only the target declares, each
with the first source lines naming it and a first guess at the cause from the syntax around the name.
Usage: missing_sample.py <corpus> <compiler-edges.jsonl> <index dir> <roslyn.jsonl>"""
import collections, json, os, random, re, sys
corpus = sys.argv[1]
compiler = collections.defaultdict(dict)
for line in open(sys.argv[2]):
    e = json.loads(line)
    compiler[e['from']][e['to']] = e
index = json.load(open(os.path.join(sys.argv[3], 'index.json')))['files']
probe = {json.loads(l)['path']: json.loads(l) for l in open(sys.argv[4])}
declarers = collections.defaultdict(set)
for p, v in probe.items():
    for t in v['types']:
        declarers[t['name'].split('.')[-1].split('`')[0]].add(p)
projdirs = {os.path.dirname(k) for k in index if k.lower().endswith(('.csproj', '.vbproj'))}

def project(rel):
    d = os.path.dirname(rel)
    while True:
        if d in projdirs:
            return d
        if not d:
            return None
        d = os.path.dirname(d)

pool = []
for f in sorted(probe):
    ours = {e['to'] for e in index.get(f, {}).get('edges', []) if e['kind'] == 'import' and e.get('to', '').endswith('.cs')}
    for t, e in sorted(compiler.get(f, {}).items()):
        if t in ours or not e['type']:
            continue
        names = set(e['type'])
        if any(len(declarers[n]) > 1 for n in names):
            continue
        pool.append((f, t, sorted(names)))
print('pool', len(pool))
classes = collections.Counter()
for i, (f, t, names) in enumerate(random.Random(1119).sample(pool, min(40, len(pool))), 1):
    text = open(os.path.join(corpus, f), encoding='utf-8', errors='replace').read().split('\n')
    hits = [(n + 1, l.strip()) for n, l in enumerate(text) for name in names if re.search(r'(?<![\w.])' + re.escape(name) + r'(?!\w)', l) or re.search(r'\.' + re.escape(name) + r'(?!\w)', l)]
    code = [h for h in hits if not h[1].startswith('///') and not h[1].startswith('//')]
    target_ns = [x['name'] for x in probe[t]['types'] if x['name'].split('.')[-1].split('`')[0] in names]
    print(f'{i}. {f} -> {t}  names {names}  {target_ns[:2]}  projects {project(f)} -> {project(t)}')
    for n, l in (code or hits)[:3]:
        print(f'     {n}: {l[:170]}')

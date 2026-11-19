"""A seeded draw (seed 1119) of 30 C# dependency lines a change removed and 30 it kept where the target's type has a
namesake in another file, each with whether the compiler binds that file to that target.
Usage: reach_sample.py <compiler-edges.jsonl> <before index dir> <after index dir> <roslyn.jsonl>"""
import collections, json, os, random, sys
compiler = collections.defaultdict(dict)
for line in open(sys.argv[1]):
    e = json.loads(line)
    compiler[e['from']][e['to']] = e
probe = {json.loads(l)['path']: json.loads(l) for l in open(sys.argv[4])}
full = collections.defaultdict(set)
for p, v in probe.items():
    for t in v['types']:
        full[t['name'].split('`')[0]].add(p)

def deps(d):
    idx = json.load(open(os.path.join(d, 'index.json')))['files']
    return {f: {e['to'] for e in v.get('edges', []) if e['kind'] == 'import' and e.get('to', '').endswith('.cs')} for f, v in idx.items() if f.endswith('.cs')}

before, after = deps(sys.argv[2]), deps(sys.argv[3])
def has_namesake(target):
    return any(len(full[t['name'].split('`')[0]]) > 1 for t in probe.get(target, {}).get('types', []))
removed = sorted((f, t) for f in before for t in before[f] - after.get(f, set()))
kept = sorted((f, t) for f in before for t in before[f] & after.get(f, set()) if has_namesake(t))
rng = random.Random(1119)
for label, lines in (('removed', removed), ('kept with a namesake', kept)):
    sample = rng.sample(lines, min(30, len(lines)))
    agree = sum(1 for f, t in sample if t in compiler.get(f, {}))
    print(f'{label}: {len(lines)} lines; of 30 drawn, the compiler binds {agree}')
    for f, t in sample[:6]:
        print('   ', 'compiler binds' if t in compiler.get(f, {}) else 'compiler does not', '|', f, '->', t)

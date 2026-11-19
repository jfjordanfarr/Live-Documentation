"""Wires a C# file gained or lost between two generations, classified by whether the two files declare a common
partial type (Roslyn probe).

Usage: new_wires.py <roslyn.jsonl> <before index dir> <after index dir>
"""
import collections, json, os, sys
probe = {json.loads(l)['path']: json.loads(l) for l in open(sys.argv[1])}
before = json.load(open(os.path.join(sys.argv[2], 'index.json')))['files']
after = json.load(open(os.path.join(sys.argv[3], 'index.json')))['files']
partials = {p: {t['name'] for t in v['types'] if t['partial']} for p, v in probe.items()}
c = collections.Counter(); ex = collections.defaultdict(list)
for f in probe:
    if f not in before or f not in after:
        continue
    b, a = set(before[f].get('outbound', [])), set(after[f].get('outbound', []))
    for kind, edges in (('gained', a - b), ('lost', b - a)):
        for t in edges:
            same = bool(partials.get(f, set()) & partials.get(t, set()))
            key = (kind, 'between halves of one type' if same else 'other')
            c[key] += 1
            if len(ex[key]) < 3:
                ex[key].append((f, t))
for k in sorted(c):
    print(c[k], k, ex[k])

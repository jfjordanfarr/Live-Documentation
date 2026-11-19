"""Edges the compiler has that our dependency lines had before a change and lack after it.
Usage: lost_agreement.py <compiler-edges.jsonl> <before index dir> <after index dir>"""
import json, os, sys, collections
compiler = collections.defaultdict(dict)
for line in open(sys.argv[1]):
    e = json.loads(line)
    compiler[e['from']][e['to']] = e

def deps(d):
    idx = json.load(open(os.path.join(d, 'index.json')))['files']
    return {f: {e['to'] for e in v.get('edges', []) if e['kind'] == 'import' and e.get('to', '').endswith('.cs')} for f, v in idx.items() if f.endswith('.cs')}

before, after = deps(sys.argv[2]), deps(sys.argv[3])
lost = [(f, t) for f in before for t in before[f] - after.get(f, set()) if t in compiler.get(f, {})]
gained = [(f, t) for f in after for t in after[f] - before.get(f, set()) if t in compiler.get(f, {})]
print('lost agreements', len(lost), 'gained agreements', len(gained))
for f, t in lost[:12]:
    print('  ', f, '->', t, compiler[f][t]['type'][:3], compiler[f][t]['member'][:2])

"""Classes the seeded draw of missing compiler edges (missing_sample.py output) by a first, checkable cause.
Usage: missing_classes.py <corpus> <missing.txt> <roslyn.jsonl>"""
import collections, json, os, re, sys
corpus, sample, roslyn = sys.argv[1:4]
idx = json.load(open(os.path.join(corpus, '.live-documentation', 'index.json')))['files']
probe = {json.loads(l)['path']: json.loads(l) for l in open(roslyn)}
globals_by_project = collections.defaultdict(set)
projdirs = {os.path.dirname(k) for k in idx if k.lower().endswith(('.csproj', '.vbproj'))}

def project(rel):
    d = os.path.dirname(rel)
    while True:
        if d in projdirs:
            return d
        if not d:
            return None
        d = os.path.dirname(d)

for p in probe:
    text = open(os.path.join(corpus, p), encoding='utf-8', errors='replace').read()
    for g in re.findall(r'^\s*global\s+using\s+([\w.]+)\s*;', text, re.M):
        globals_by_project[project(p)].add(g)
c = collections.Counter(); rest = []
for l in open(sample):
    m = re.match(r"(\d+)\. (.*) -> (.*?)  names \[(.*?)\]", l)
    if not m:
        continue
    src, tgt, names = m.group(2), m.group(3), [n.strip("' ") for n in m.group(4).split(',')]
    text = open(os.path.join(corpus, src), encoding='utf-8', errors='replace').read()
    code = '\n'.join(x for x in text.split('\n') if not x.strip().startswith('//'))
    written = any(re.search(r'(?<![\w])' + re.escape(n) + r'(?!\w)', code) for n in names)
    declared = any(re.sub(r' \(.*\)$', '', s['name']) in names for s in idx[tgt].get('symbols', []))
    ns = {t['name'].rsplit('.', 1)[0] for t in probe[tgt]['types'] if t['name'].split('.')[-1].split('`')[0] in names}
    usings = set(re.findall(r'^\s*using\s+([\w.]+)\s*;', text, re.M))
    own_ns = set(re.findall(r'^\s*namespace\s+([\w.]+)', text, re.M))
    visible = bool(ns & usings) or any(o == n or o.startswith(n + '.') for o in own_ns for n in ns)
    through_global = bool(ns & globals_by_project[project(src)])
    if not declared:
        k = 'our doc of the target lacks the symbol'
    elif not written:
        k = 'the name is not written in the file (var, lambda parameter, return value)'
    elif not visible and through_global:
        k = 'visible only through a global using in another file of the project'
    elif not visible:
        k = 'written, but its namespace is neither used nor enclosing'
    else:
        k = 'written and visible'
        rest.append((m.group(1), src, tgt, names, sorted(ns)))
    c[k] += 1
for k, v in c.most_common():
    print(v, k)
for r in rest:
    print('  ', r)

"""Lists every line of ours the compiler does not have where the compiler bound one of the target's type names to a
type in another file: the file, its namespace and usings, the name, our target's full name and project, and the
compiler's target's full name and project. Usage: namesakes.py <corpus> <compiler-edges.jsonl> <index dir> <roslyn.jsonl>"""
import collections, json, os, re, sys
corpus = sys.argv[1]
compiler = collections.defaultdict(dict)
for line in open(sys.argv[2]):
    e = json.loads(line)
    compiler[e['from']][e['to']] = e
index = json.load(open(os.path.join(sys.argv[3], 'index.json')))['files']
probe = {json.loads(l)['path']: json.loads(l) for l in open(sys.argv[4])}
projdirs = {os.path.dirname(k) for k in index if k.lower().endswith(('.csproj', '.vbproj'))}

def project(rel):
    d = os.path.dirname(rel)
    while True:
        if d in projdirs:
            return d
        if not d:
            return None
        d = os.path.dirname(d)

def simple(name):
    return name.split('.')[-1].split('`')[0]

count = 0
for f in sorted(probe):
    ours = {e['to'] for e in index.get(f, {}).get('edges', []) if e['kind'] == 'import' and e.get('to', '').endswith('.cs')}
    for t in sorted(ours - set(compiler.get(f, {}))):
        names = {simple(x['name']): x['name'] for x in probe.get(t, {}).get('types', [])}
        hits = []
        for other, e in compiler.get(f, {}).items():
            for n in e['type']:
                if n in names:
                    full = [x['name'] for x in probe.get(other, {}).get('types', []) if simple(x['name']) == n]
                    hits.append((n, names[n], full[0] if full else '?', other))
        if not hits:
            continue
        count += 1
        text = open(os.path.join(corpus, f), encoding='utf-8', errors='replace').read()
        ns = re.findall(r'^\s*namespace\s+([\w.]+)', text, re.M)
        usings = re.findall(r'^\s*(?:global\s+)?using\s+(static\s+)?([\w.]+\s*=\s*)?([\w.]+)\s*;', text, re.M)
        print(f'{count}. {f}  [project {project(f)}]  namespace {ns}')
        print('     usings: ' + ', '.join((s + a + u).replace(' ', '') for s, a, u in usings))
        for n, ourfull, compfull, other in hits[:2]:
            print(f'     name {n}: ours -> {t} ({ourfull}, project {project(t)}); compiler -> {other} ({compfull}, project {project(other)})')

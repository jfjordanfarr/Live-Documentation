"""What the reader's map draws, from a corpus's derived index (.live-documentation/index.json), against the oracles.

Usage: drawn.py <corpus> <directives.jsonl> <roslyn.jsonl> <sln.json>
"""
import json, os, sys, collections
corpus = sys.argv[1]
index = json.load(open(os.path.join(corpus, '.live-documentation', 'index.json')))['files']
out = {k: set(v.get('outbound', [])) for k, v in index.items()}
folded = collections.defaultdict(list)
for k in index:
    folded[k.lower()].append(k)
projdirs = {os.path.dirname(k) for k in index if k.lower().endswith(('.csproj', '.vbproj'))}
web = set()
for k in index:
    if k.lower().endswith(('.csproj', '.vbproj')):
        if any(s.get('kind') == 'web' for s in index[k].get('symbols', [])):
            web.add(os.path.dirname(k))

def project_dir(rel):
    d = os.path.dirname(rel)
    while True:
        if d in projdirs:
            return d
        if not d:
            return None
        d = os.path.dirname(d)

def norm(p):
    parts = []
    for seg in p.split('/'):
        if seg in ('', '.'):
            continue
        if seg == '..':
            if not parts:
                return None
            parts.pop()
        else:
            parts.append(seg)
    return '/'.join(parts)

def find(path):
    if path is None:
        return []
    return [path] if path in index else folded.get(path.lower(), [])

# 1. Directives.
stats = collections.Counter()
for line in open(sys.argv[2]):
    r = json.loads(line)
    if r['kind'] != 'path':
        continue
    w = r['written']
    if w.startswith('~/'):
        own = project_dir(r['file'])
        hits = find(norm(((own + '/') if own else '') + w[2:])) if own is not None else []
        if not hits:
            webhits = [h for d in sorted(web) for h in find(norm(((d + '/') if d else '') + w[2:]))]
            hits = webhits if len(webhits) == 1 else []
    elif w.startswith('/'):
        hits = []
    else:
        hits = find(norm(((os.path.dirname(r['file']) + '/') if os.path.dirname(r['file']) else '') + w))
    key = f"{r['directive'].lower()} {r['attr']}"
    if len(hits) == 1:
        stats[(key, 'oracle link')] += 1
        if hits[0] in out.get(r['file'], set()):
            stats[(key, 'drawn')] += 1
    else:
        stats[(key, 'no single target' if hits else 'no file')] += 1
print('directives:')
for k in sorted({k for k, _ in stats}):
    print('  ', k, {s: stats[(k, s)] for s in ('oracle link', 'drawn', 'no file', 'no single target') if stats[(k, s)]})
ext = collections.Counter()
for k, v in index.items():
    e = os.path.splitext(k)[1].lower()
    if e in ('.aspx', '.ascx', '.master', '.ashx', '.asmx', '.asax', '.svc', '.sln', '.vb', '.cshtml'):
        ext[(e, 'files')] += 1
        if v.get('outbound'):
            ext[(e, 'with an outbound link')] += 1
        if v.get('inbound'):
            ext[(e, 'with an inbound link')] += 1
print('markup and solution files:', dict(sorted(ext.items())))

# 2. Designer pairs.
pairs = drawn_cb = drawn_d = 0
for k in index:
    if k.lower().endswith('.designer.cs'):
        cb = find(k[: -len('.designer.cs')] + '.cs')
        if cb:
            pairs += 1
            drawn_cb += k in out.get(cb[0], set())
            drawn_d += cb[0] in out.get(k, set())
print(f'designer pairs: {pairs}; code-behind -> designer drawn: {drawn_cb}; designer -> code-behind drawn: {drawn_d}')

# 3. Configuration reads.
reads = linked = 0
for line in open(sys.argv[3]):
    p = json.loads(line)
    keyed = [r for r in p['configReads'] if r['owner'].endswith('ConfigurationManager')]
    if keyed:
        reads += 1
        linked += any(t.lower().endswith(('web.config', 'app.config')) for t in out.get(p['path'], set()))
print(f'files reading ConfigurationManager: {reads}; linked to some Web.config/App.config: {linked}')

# 5. Solutions.
sln = json.load(open(sys.argv[4]))
named = drawn = 0
for s, v in sln.items():
    for pth in v['projects']:
        t = find(norm(((os.path.dirname(s) + '/') if os.path.dirname(s) else '') + pth))
        if len(t) == 1:
            named += 1
            drawn += t[0] in out.get(s, set())
print(f'solution -> project (oracle, resolved without regard to case): {named}; drawn: {drawn}')

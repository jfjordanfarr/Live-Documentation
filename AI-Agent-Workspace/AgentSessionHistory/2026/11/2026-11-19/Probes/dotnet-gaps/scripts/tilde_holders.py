"""`~/` directive paths by how many of the markup's own project and the workspace's web projects hold the file, and
how many of the single-holder paths the map draws. Usage: tilde_holders.py <corpus> <directives.jsonl>"""
import collections, json, os, sys
c = sys.argv[1]
index = json.load(open(os.path.join(c, '.live-documentation', 'index.json')))['files']
folded = collections.defaultdict(list)
for k in index:
    folded[k.lower()].append(k)
projects = [k for k in index if k.lower().endswith(('.csproj', '.vbproj', '.fsproj'))]
projdirs = {os.path.dirname(k) for k in projects}
web = {os.path.dirname(k) for k in projects if any(s.get('kind') == 'web' for s in index[k].get('symbols', []))}

def own(rel):
    d = os.path.dirname(rel)
    while True:
        if d in projdirs:
            return d
        if not d:
            return None
        d = os.path.dirname(d)

counts = collections.Counter(); several = collections.Counter()
for line in open(sys.argv[2]):
    r = json.loads(line)
    if r['kind'] != 'path' or not r['written'].startswith('~/'):
        continue
    roots = set(web)
    o = own(r['file'])
    if o is not None:
        roots.add(o)
    holders = [h for root in roots for h in folded.get(os.path.normpath(os.path.join(root, r['written'][2:])).lower(), [])]
    key = 'one holder' if len(holders) == 1 else 'several holders' if holders else 'no holder'
    counts[key] += 1
    if len(holders) == 1 and holders[0] in index[r['file']].get('outbound', []):
        counts['one holder, drawn'] += 1
    if len(holders) > 1:
        several[(r['directive'].lower(), r['attr'], r['written'])] += 1
print(dict(counts))
for k, v in several.most_common(6):
    print(v, k)

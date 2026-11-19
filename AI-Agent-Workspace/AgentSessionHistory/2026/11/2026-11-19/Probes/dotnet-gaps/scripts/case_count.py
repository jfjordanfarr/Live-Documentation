"""Paths written in .NET files that match a workspace file only without regard to case, by link kind.

Usage: case_count.py <corpus> <directives.jsonl> <sln.json>
"""
import collections, json, os, re, sys
root = os.path.abspath(sys.argv[1])
SKIP = {'.' + 'git', '.live-documentation', 'node_modules'}
allf = []
for d, dirs, files in os.walk(root):
    dirs[:] = [x for x in dirs if x not in SKIP]
    for f in files:
        allf.append(os.path.relpath(os.path.join(d, f), root).replace('\\', '/'))
exact = set(allf)
folded = collections.defaultdict(list)
for f in allf:
    folded[f.lower()].append(f)

def classify(p):
    if p is None:
        return 'outside'
    if p in exact:
        return 'exact'
    n = len(folded.get(p.lower(), []))
    return 'case only' if n == 1 else 'ambiguous' if n > 1 else 'missing'

def join(folder, written):
    p = os.path.normpath(os.path.join(folder, written.replace('\\', '/'))).replace('\\', '/')
    return None if p.startswith('..') else p

counts = collections.Counter(); examples = {}
for f in allf:
    if f.lower().endswith(('.csproj', '.vbproj', '.fsproj')):
        text = open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
        for m in re.finditer(r'<ProjectReference\b[^>]*?\bInclude\s*=\s*"([^"]+)"', text, re.I):
            c = classify(join(os.path.dirname(f), m.group(1)))
            counts[('ProjectReference', c)] += 1
            examples.setdefault(('ProjectReference', c), (f, m.group(1)))
for line in open(sys.argv[2]):
    r = json.loads(line)
    if r['kind'] != 'path' or r['written'].startswith(('~/', '/')):
        continue
    c = classify(join(os.path.dirname(r['file']), r['written']))
    counts[('directive, relative', c)] += 1
    examples.setdefault(('directive, relative', c), (r['file'], r['written']))
for s, v in json.load(open(sys.argv[3])).items():
    for p in v['projects']:
        c = classify(join(os.path.dirname(s), p))
        counts[('solution', c)] += 1
        examples.setdefault(('solution', c), (s, p))
spellings = collections.Counter(os.path.basename(f) for f in allf if os.path.basename(f).lower() in ('web.config', 'app.config'))
for k in sorted(counts):
    print(counts[k], k, examples[k] if k[1] != 'exact' else '')
print('configuration file spellings:', dict(spellings))

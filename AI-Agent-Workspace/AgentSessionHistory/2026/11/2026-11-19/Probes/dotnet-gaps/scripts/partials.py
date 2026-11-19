"""Halves of partial classes, from the Roslyn probe's output.

A partial group is one full type name (namespace, enclosing types, name, arity) declared `partial` in two or more
files of the same project (nearest folder with a project file; partial halves must be in one assembly).
For each ordered pair of halves (A uses B), counts whether A's simple names include a member B declares that A itself
does not declare: the evidence a "names a member" rule would wire on.
Prints totals and a seeded draw of 20 designer/code-behind pairs.
"""
import json, sys, os, random, collections
probe = [json.loads(l) for l in open(sys.argv[1])]
root = sys.argv[2]
SKIP = {'.' + 'git', '.live-documentation', 'node_modules'}
projdirs = set()
for d, dirs, files in os.walk(root):
    dirs[:] = [x for x in dirs if x not in SKIP]
    if any(f.lower().endswith(('.csproj', '.vbproj')) for f in files):
        projdirs.add(os.path.relpath(d, root) if d != root else '')

def project_of(rel):
    d = os.path.dirname(rel)
    while True:
        if d in projdirs:
            return d
        if not d:
            return None
        d = os.path.dirname(d)

by_file = {p['path']: p for p in probe}
groups = collections.defaultdict(lambda: collections.defaultdict(set))
for p in probe:
    for t in p['types']:
        if t['partial']:
            groups[(project_of(p['path']), t['name'])][p['path']].update(t['members'])
multi = {k: v for k, v in groups.items() if len(v) >= 2}
print('partial types declared in 2+ files:', len(multi), ' files involved:', len({f for v in multi.values() for f in v}))

def is_designer(f):
    return f.lower().endswith('.designer.cs')

designer_pairs = []
other_groups = []
for key, halves in multi.items():
    ds = [f for f in halves if is_designer(f)]
    if ds:
        for d in ds:
            stem = d[: -len('.designer.cs')]
            cb = [f for f in halves if f.lower() == (stem + '.cs').lower()]
            designer_pairs.append((key, d, cb[0] if cb else None, halves))
    else:
        other_groups.append((key, halves))
print('designer halves:', len(designer_pairs), ' with a code-behind named after it:', sum(1 for x in designer_pairs if x[2]))
print('partial groups with no designer half:', len(other_groups))

def uses(a, b, halves):
    """Members B declares, not declared by A, that A names."""
    used = set(by_file[a]['used'])
    return sorted((halves[b] - halves[a]) & used)

stats = collections.Counter()
for key, d, cb, halves in designer_pairs:
    if not cb:
        continue
    u_cb_d = uses(cb, d, halves)
    u_d_cb = uses(d, cb, halves)
    stats['code-behind names a designer-only member' if u_cb_d else 'code-behind names no designer-only member'] += 1
    stats['designer names a code-behind-only member' if u_d_cb else 'designer names no code-behind-only member'] += 1
for k, v in sorted(stats.items()):
    print(v, k)
og = collections.Counter()
for key, halves in other_groups:
    fs = sorted(halves)
    for a in fs:
        for b in fs:
            if a != b:
                og['pair uses' if uses(a, b, halves) else 'pair does not use'] += 1
print('ordered pairs among non-designer partial groups:', dict(og))

rng = random.Random(1119)
complete = sorted([x for x in designer_pairs if x[2]], key=lambda x: x[1])
for key, d, cb, halves in rng.sample(complete, min(20, len(complete))):
    print('---', d)
    print('   code-behind -> designer, names:', uses(cb, d, halves)[:6], 'of', len(halves[d]), 'designer members')
    print('   designer -> code-behind, names:', uses(d, cb, halves)[:6])

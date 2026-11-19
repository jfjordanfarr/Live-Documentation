"""For each designer/code-behind pair, whether the code-behind names a designer-only member bare (as `name`) or only
through `this.name`, against whether today's reader draws the code-behind -> designer link.

Usage: this_prefix.py <corpus> <roslyn.jsonl> <index dir>
"""
import collections, json, os, re, sys
corpus = sys.argv[1]
probe = {json.loads(l)['path']: json.loads(l) for l in open(sys.argv[2])}
index = json.load(open(os.path.join(sys.argv[3], 'index.json')))['files']
table = collections.Counter()
for path, p in probe.items():
    if not path.lower().endswith('.designer.cs'):
        continue
    cb = path[: -len('.designer.cs')] + '.cs'
    if cb not in probe:
        continue
    members = {m for t in p['types'] for m in t['members']}
    own = {m for t in probe[cb]['types'] for m in t['members']}
    text = re.sub(r'"(?:[^"\\]|\\.)*"|//[^\n]*', '', open(os.path.join(corpus, cb), encoding='utf-8', errors='replace').read())
    bare = this_only = 0
    for m in members - own:
        uses = [x for x in re.finditer(r'(?<![\w])' + re.escape(m) + r'(?![\w])', text)]
        if not uses:
            continue
        if any(not text[max(0, x.start() - 5):x.start()].endswith(('this.', '.')) for x in uses):
            bare += 1
        else:
            this_only += 1
    drawn = path in index[cb].get('outbound', [])
    kind = 'bare use' if bare else 'only this.' if this_only else 'no use'
    table[(kind, 'drawn' if drawn else 'not drawn')] += 1
for k in sorted(table):
    print(table[k], k)

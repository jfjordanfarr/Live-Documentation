import json, gzip, statistics, sys
D = '/tmp/claude-1000/-workspaces-Live-Documentation/6450141c-9e11-40e5-95a5-166121c231a3/scratchpad/history-cost/'
h = json.load(open('/workspaces/Live-Documentation/dist/explorer/explorer-history.json'))
p = json.load(open(D + 'perStep.json'))
kf = json.load(open(D + 'keyframes.json'))
t = json.load(open(D + 'tables.json'))
S = 291  # base of the usable stretch: the first commit whose mirror parses in today's grammar
c = lambda o: json.dumps(o, separators=(',', ':'), ensure_ascii=False)
gz = lambda s: len(gzip.compress(s.encode('utf8'), 9))
def b(o): return len(c(o).encode('utf8'))

stretch = [s for s in p if s['k'] > S]
def col(key):
    return [b(s[key]) if s[key] else 0 for s in stretch]
today = [b(h['steps'][s['k'] - 1]) for s in stretch]
r2 = col('r2'); r3f = col('r3full'); r3d = col('r3diff')
def pct(xs, q):
    xs = sorted(xs); return xs[min(len(xs) - 1, int(q * len(xs)))]
def dist(name, xs):
    print(f"{name:10s} total {sum(xs):>10,}  mean {sum(xs)/len(xs):>8.0f}  median {pct(xs,.5):>7,}  p90 {pct(xs,.9):>8,}  p99 {pct(xs,.99):>9,}  max {max(xs):>9,}  nonzero {sum(1 for x in xs if x)}")
print(f"stretch steps {len(stretch)} ({stretch[0]['k']}..{stretch[-1]['k']}) of {len(h['steps'])}")
dist('today', today); dist('rung2', r2); dist('rung3full', r3f); dist('rung3diff', r3d)

# counts
def cnt(key, field):
    return sum(len(s[key].get(field, [])) for s in stretch)
for f in ['symbolsAdded', 'symbolsRemoved', 'symbolsRenamed', 'linksAdded', 'linksRemoved', 'linksChanged']:
    print(f, cnt('r2', f))
for f in ['authored', 'descriptions']:
    print('r3', f, cnt('r3full', f))

# largest steps
print('\nlargest rung2+3 steps:')
order = sorted(range(len(stretch)), key=lambda i: -(r2[i] + r3f[i]))[:10]
for i in order:
    s = stretch[i]; st = h['steps'][s['k'] - 1]
    sym = sum(len(s['r2'].get(f, [])) for f in ['symbolsAdded', 'symbolsRemoved', 'symbolsRenamed'])
    lk = sum(len(s['r2'].get(f, [])) for f in ['linksAdded', 'linksRemoved', 'linksChanged'])
    print(f"  step {s['k']} {s['commit'][:8]} {st['commit']['date'][:10]} docs {s['docsChanged']} sym {sym} links {lk} descr {len(s['r3full'].get('descriptions',[]))} auth {len(s['r3full'].get('authored',[]))} | r2 {r2[i]:,} r3f {r3f[i]:,} r3d {r3d[i]:,} today {today[i]:,} | {st['commit']['subject'][:60]}")

# Augmented files: today's file plus the stretch's rung fields, the name/kind tables and keyframes.
def augmented(rungs, keyframe_fields):
    a = json.loads(c(h))
    a['symbolNames'] = t['nameList']; a['symbolKinds'] = t['kindList']
    for s in stretch:
        d = a['steps'][s['k'] - 1]['delta']
        for r in rungs:
            for k2, v in s[r].items(): d[(r + '.' + k2)] = v
    for k in a['keyframes']:
        snap = kf.get(str(k['step']))
        if snap:
            for f in keyframe_fields: k[f] = snap[f]
    return c(a)
base = c(h)
print(f"\ntoday's file: raw {len(base.encode()):,} gz {gz(base):,}")
for label, rungs, fields in [('rung2', ['r2'], ['symbols', 'links']), ('rung2+3 whole', ['r2', 'r3full'], ['symbols', 'links', 'authored', 'descriptions']), ('rung2+3 diffs', ['r2', 'r3diff'], ['symbols', 'links', 'authored', 'descriptions'])]:
    s = augmented(rungs, fields)
    print(f"{label:15s} raw {len(s.encode()):,} gz {gz(s):,}")
    no_kf = augmented(rungs, [])
    print(f"{'  without kf':15s} raw {len(no_kf.encode()):,} gz {gz(no_kf):,}")

# Keyframes
print('\nkeyframes:')
for key, snap in kf.items():
    r2s = {'symbols': snap['symbols'], 'links': snap['links']}
    r3s = {'authored': snap['authored'], 'descriptions': snap['descriptions']}
    print(f"  at {key}: symbols {len(snap['symbols'])} links {len(snap['links'])} authored {len(snap['authored'])} descr {len(snap['descriptions'])} | r2 raw {b(r2s):,} gz {gz(c(r2s)):,} | r3 raw {b(r3s):,} gz {gz(c(r3s)):,} | both gz {gz(c(snap)):,}")
tk = h['keyframes'][-1]; tk2 = {k: v for k, v in tk.items() if k != 'step'}
print(f"  today's keyframe at {tk['step']}: raw {b(tk2):,} gz {gz(c(tk2)):,}")
print(f"  name table: {len(t['nameList'])} names raw {b(t['nameList']):,} gz {gz(c(t['nameList'])):,}")

# r3 breakdown
for key in ['r3full', 'r3diff']:
    a = sum(b(s[key].get('authored', [])) for s in stretch if s[key].get('authored'))
    d = sum(b(s[key].get('descriptions', [])) for s in stretch if s[key].get('descriptions'))
    print(f"{key}: authored {a:,} symbol descriptions {d:,}")
ag = c([s['r3full'].get('authored', []) for s in stretch]); dg = c([s['r3full'].get('descriptions', []) for s in stretch])
print('r3full gz: authored', gz(ag), 'descriptions', gz(dg))
ag = c([s['r3diff'].get('authored', []) for s in stretch]); dg = c([s['r3diff'].get('descriptions', []) for s in stretch])
print('r3diff gz: authored', gz(ag), 'descriptions', gz(dg))
# per-step gz alone (as a lazily loaded chunk would be): median, p90 of nonzero
# keyframe interval trade-off over the stretch (steps 292..817, keyframes on multiples of N after 291)
print('\ninterval trade-off over the stretch (keyframes gz summed separately; deltas gz as one block):')
r2d = gz(c([s['r2'] for s in stretch])); r3d_ = gz(c([s['r3diff'] for s in stretch])); r3f_ = gz(c([s['r3full'] for s in stretch]))
print('deltas gz alone: r2', r2d, 'r3full', r3f_, 'r3diff', r3d_)
for N in [32, 64, 128, 256, 512]:
    ks = [k for k in kf if k != 'last' and int(k) % N == 0 and int(k) > S]
    g2 = sum(gz(c({'symbols': kf[k]['symbols'], 'links': kf[k]['links']})) for k in ks)
    g3 = sum(gz(c({'authored': kf[k]['authored'], 'descriptions': kf[k]['descriptions']})) for k in ks)
    # worst seek: deltas replayed <= N-1; bytes of the largest N-1 consecutive r2 deltas
    w2 = max(sum(r2[i:i + N - 1]) for i in range(len(r2)))
    w3 = max(sum(r3d[i:i + N - 1]) for i in range(len(r3d)))
    print(f"  N={N}: keyframes {len(ks)} r2 kf gz {g2:,} r3 kf gz {g3:,} | worst seek replays {N-1} steps: r2 raw {w2:,} r3diff raw {w3:,}")

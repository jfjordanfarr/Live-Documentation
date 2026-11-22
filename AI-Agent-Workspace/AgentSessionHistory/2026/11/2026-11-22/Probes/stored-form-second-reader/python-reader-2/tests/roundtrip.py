"""Random valid scans: text -> name, text -> bytes -> text, and the graph checked
against a derivation written separately from section 5. Also writes a few to tests/valid/."""
import io
import json
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import reader as R  # noqa: E402

POOL = ['', 'a', 'x\ny', '"q"', 'back\\slash', 'tab\there', '\x00nul', '\x1f\x7f\x85', '  ', '﻿bom',
        '😀', 'é', 'é', '名前', '/', '../up', '#frag', 'type-only', 're-export', 'contract', 'configuration',
        'Widget', '<script>', 'a b', '퟿￿']
SEGS = ['a', 'b', 'B', 'src', 'x.ts', '名', 'é', '\U00010000', '￿', 'a:b', 'c d', '\\w', '..x', '.hidden', '-']


def rs(rng):
    return rng.choice(POOL) if rng.random() < 0.8 else ''.join(rng.choice(POOL) for _ in range(rng.randint(2, 4)))


def rpath(rng):
    while True:
        p = '/'.join(rng.choice(SEGS) for _ in range(rng.randint(1, 3)))
        if R.path_problem(p) is None:
            return p


def rlink(rng):
    while True:
        s = rs(rng) if rng.random() < 0.5 else rpath(rng) + '.md#' + rs(rng)
        if R.link_problem(s) is None:
            return s


def scan(rng, nfiles):
    paths = sorted({rpath(rng) for _ in range(nfiles)}, key=lambda p: p.encode('utf-8'))
    outside = [rpath(rng) for _ in range(5)]

    def linked(o):
        r = rng.random()
        if r < 0.3:
            return
        o['link'] = rlink(rng)
        if r < 0.5:
            return
        o['target'] = rng.choice(paths if rng.random() < 0.7 else outside)
        if r < 0.75:
            o['anchor'] = rs(rng)

    def types():
        out = []
        for _ in range(rng.randint(0, 3)):
            t = {'name': rs(rng)}
            linked(t)
            if rng.random() < 0.3:
                t['array'] = True
            if rng.random() < 0.3:
                t['promise'] = True
            out.append(t)
        return out

    lines = [[None, 'format', 'fact-pack', 1],
             [None, 'location', rng.choice(['', '.mdmd', 'a/b']), rng.choice(['', 'layer-4']),
              rng.choice(['', '.mdmd.md', 'x:y'])],
             [None, 'scanner', rs(rng)]]
    for _ in range(rng.randint(0, 3)):
        lines.append([None, 'left-out', rs(rng), rng.choice([0, 1, 127, 128, 2 ** 32 - 1]), rs(rng)])
    for p in paths:
        lines.append([p, 'file', rng.choice([0, 4, 300, 2 ** 32 - 1]), rs(rng) if rng.random() < .3 else None,
                      rs(rng) if rng.random() < .3 else None])
        lines.append([p, 'authored', rs(rng)])
        for _ in range(rng.randint(0, 2)):
            e = {'reason': rng.choice(R.REASONS)}
            if rng.random() < .5:
                e['symbol'] = {'name': rs(rng)}
                if rng.random() < .5:
                    e['symbol']['link'] = rlink(rng)
            if rng.random() < .5:
                e['command'] = rs(rng)
            if rng.random() < .5:
                e['declarer'] = {'label': rs(rng), 'link': rlink(rng)}
            lines.append([p, 'entry', e])
        for _ in range(rng.randint(0, 3)):
            y = {'name': rs(rng)}
            if rng.random() < .6:
                y['slug'] = rs(rng)
            y['kind'] = rs(rng)
            y['flags'] = [rs(rng) for _ in range(rng.randint(0, 2))]
            if rng.random() < .5:
                y['source'] = {'path': rlink(rng), 'line': rng.randint(0, 5000)}
            refs = []
            for _ in range(rng.randint(0, 3)):
                role = rng.choice(R.ROLES)
                if role == 'Parameters':
                    refs.append({'role': role, 'parameters': [{'name': rs(rng), 'types': types()}
                                                              for _ in range(rng.randint(0, 2))]})
                else:
                    refs.append({'role': role, 'types': types()})
            y['references'] = refs
            y['sections'] = [{'title': rs(rng), 'body': [rs(rng) for _ in range(rng.randint(0, 2))]}
                             for _ in range(rng.randint(0, 2))]
            docs = []
            for _ in range(rng.randint(0, 3)):
                d = {'name': rs(rng)}
                if rng.random() < .4:
                    d['element'] = rs(rng)
                linked(d)
                docs.append(d)
            y['documentation'] = docs
            lines.append([p, 'symbol', y])
        for _ in range(rng.randint(0, 3)):
            d = {'label': rs(rng)}
            linked(d)
            if rng.random() < .4:
                d['symbols'] = [rs(rng) for _ in range(rng.randint(0, 2))]
            d['qualifiers'] = [rng.choice(POOL[16:21] + ['x']) for _ in range(rng.randint(0, 3))]
            lines.append([p, 'dependency', d])
        if rng.random() < .3:
            lines.append([p, 'cited-by', [{'label': rs(rng), 'link': rlink(rng)} for _ in range(rng.randint(0, 2))]])
        if rng.random() < .3:
            rx = []
            for _ in range(rng.randint(0, 2)):
                r = {'name': rs(rng)}
                if rng.random() < .5:
                    r['slug'] = rs(rng)
                if rng.random() < .5:
                    r['from'] = {'label': rs(rng), 'link': rlink(rng)}
                r['flags'] = [rs(rng) for _ in range(rng.randint(0, 2))]
                rx.append(r)
            lines.append([p, 're-exports', rx])
    lines.append([None, 'end', len(paths)])
    text = b''.join(json.dumps(l, ensure_ascii=False, separators=(',', ':')).encode('utf-8') + b'\n' for l in lines)
    return text, lines


def derive_graph(lines):
    """Section 5, from the text's facts."""
    loc = lines[1]
    files = [l[0] for l in lines if l[1] == 'file']
    fset = set(files)
    key = lambda p: p.encode('utf-8')
    per = {p: {'deps': [], 'syms': []} for p in files}
    for l in lines:
        if l[1] == 'dependency':
            per[l[0]]['deps'].append(l[2])
        elif l[1] == 'symbol':
            per[l[0]]['syms'].append(l[2])
    out = []
    for p in files:
        edges = []
        for d in per[p]['deps']:
            if 'link' not in d:
                continue
            e = {'kind': 're-export' if 're-export' in d['qualifiers'] else 'import', 'label': d['label'],
                 'link': d['link']}
            if d.get('target') in fset:
                e['to'] = d['target']
                if 'anchor' in d:
                    e['toSymbol'] = d['anchor']
            if 'type-only' in d['qualifiers']:
                e['typeOnly'] = True
            for q in d['qualifiers']:
                if q in ('contract', 'configuration'):
                    e['basis'] = q
                    break
            edges.append(e)
        docs = []
        for y in per[p]['syms']:
            for ref in y['references']:
                kind = {'Returns': 'returns', 'Extends': 'extends', 'Implements': 'implements',
                        'Constraints': 'constraint', 'Parameters': 'parameter'}[ref['role']]
                groups = [(pp['name'], pp['types']) for pp in ref['parameters']] if 'parameters' in ref \
                    else [(None, ref['types'])]
                for pname, ts in groups:
                    for t in ts:
                        if 'link' not in t:
                            continue
                        e = {'kind': kind, 'label': t['name'], 'link': t['link']}
                        if t.get('target') in fset:
                            e['to'] = t['target']
                            if 'anchor' in t:
                                e['toSymbol'] = t['anchor']
                        if 'slug' in y:
                            e['from'] = y['slug']
                        if pname is not None:
                            e['parameter'] = pname
                        edges.append(e)
            for d in y['documentation']:
                if 'link' in d and d.get('target') in fset:
                    item = {'label': d['name'], 'link': d['link'], 'to': d['target']}
                    if 'element' in d:
                        item['element'] = d['element']
                    if 'anchor' in d:
                        item['toSymbol'] = d['anchor']
                    if 'slug' in y:
                        item['from'] = y['slug']
                    docs.append(item)
        f = {'path': p, 'document': '/'.join([x for x in (loc[2], loc[3]) if x] + [p + loc[4]]), 'edges': edges,
             'outbound': sorted({e['to'] for e in edges if 'to' in e and e['to'] != p}, key=key)}
        if docs:
            f['documentation'] = docs
        out.append(f)
    for f in out:
        f['inbound'] = [g['path'] for g in out if f['path'] in g['outbound']]
        by = [g['path'] for g in out if g['path'] != f['path'] and any(d['to'] == f['path'] for d in g.get('documentation', []))]
        if by:
            f['documentedBy'] = by
    return {'files': out}


def run(mode, data):
    b = io.BytesIO()
    R.answer(mode, data, b)
    return b.getvalue()


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 300
    os.makedirs(os.path.join(HERE, 'valid'), exist_ok=True)
    for seed in range(n):
        rng = random.Random(seed)
        nf = rng.choice([0, 1, 2, 5, 30]) if seed % 50 else rng.choice([256, 257, 600])
        text, lines = scan(rng, nf)
        name = run('name', text)
        assert not name.startswith(b'refused'), (seed, name, text[:300])
        _, sections = R.scan_of_text(text)
        data = R.file_of_sections(sections, level=rng.choice([0, 1, 6, 9]))
        assert R.open_file(data).name.hex().encode() + b'\n' == name
        back = run('read', data)
        assert back == text, (seed, back[:300])
        g = json.loads(run('graph', data))
        want = derive_graph(lines)
        assert g == want, (seed, json.dumps(g)[:500], json.dumps(want)[:500])
        if seed < 5 or nf >= 256 and seed < 101:
            with open(os.path.join(HERE, 'valid', 'random-%d.fpk' % seed), 'wb') as f:
                f.write(data)
            with open(os.path.join(HERE, 'valid', 'random-%d.txt' % seed), 'wb') as f:
                f.write(text)
    print(n, 'random scans: name, read and graph agree')


main()

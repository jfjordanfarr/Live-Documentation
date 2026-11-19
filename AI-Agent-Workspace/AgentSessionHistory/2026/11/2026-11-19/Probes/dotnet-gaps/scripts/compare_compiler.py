"""Our C# file-to-file edges against the compiler's, both whole corpora, sorted by cause.

Usage: compare_compiler.py <compiler-edges.jsonl> <index dir> <roslyn.jsonl> [edge kinds, default import]
Ours: each .cs file's edges of the given kinds to another .cs file, from the derived index (import: its Dependencies lines). The compiler's: CompilerEdges output.
"""
import collections, json, os, sys
compiler = collections.defaultdict(dict)
for line in open(sys.argv[1]):
    e = json.loads(line)
    compiler[e['from']][e['to']] = e
index = json.load(open(os.path.join(sys.argv[2], 'index.json')))['files']
probe = {json.loads(l)['path']: json.loads(l) for l in open(sys.argv[3])}
declared = {p: {t['name'].split('.')[-1].split('`')[0] for t in v['types']} for p, v in probe.items()}
partial = {p: {t['name'] for t in v['types'] if t['partial']} for p, v in probe.items()}
declarers = collections.defaultdict(set)
for p, names in declared.items():
    for n in names:
        declarers[n].add(p)

ours = {}
for f, v in index.items():
    if f.endswith('.cs') and f in probe:
        kinds = sys.argv[4].split(',') if len(sys.argv) > 4 else ['import']
        ours[f] = {e['to'] for e in v.get('edges', []) if e['kind'] in kinds and e.get('to', '').endswith('.cs') and e['to'] != f}

agree = only_ours = only_compiler = 0
ours_causes = collections.Counter(); comp_causes = collections.Counter(); ex = collections.defaultdict(list)
def note(counter, key, example):
    counter[key] += 1
    if len(ex[key]) < 3:
        ex[key].append(example)

for f in sorted(probe):
    o = ours.get(f, set()); c = set(compiler.get(f, {}))
    agree += len(o & c)
    for t in sorted(o - c):
        only_ours += 1
        shared = declared.get(t, set())
        # Did the compiler bind a type of one of the target's names, declared in another file?
        namesake = any(n in declared.get(other, set()) and compiler[f][other]['type'] and n in compiler[f][other]['type']
                       for other in compiler.get(f, {}) for n in shared)
        used = set(probe[f]['used'])
        named = shared & used
        attributes = {n for n in shared if n.endswith('Attribute') and n[:-len('Attribute')] in used}
        if partial.get(f, set()) & partial.get(t, set()):
            note(ours_causes, 'halves of one partial type, no member use the compiler bound', (f, t))
        elif attributes:
            note(ours_causes, 'an attribute named without its suffix; the compiler, without the framework, did not bind it', (f, t))
        elif namesake:
            note(ours_causes, 'we chose a namesake: the compiler bound the name to a type in another file', (f, t))
        elif named and all(len(declarers[n]) > 1 for n in named):
            note(ours_causes, 'the name is declared in several files and the compiler bound none of them here', (f, t))
        elif named:
            note(ours_causes, 'the file names a type the target declares; the compiler did not bind it', (f, t))
        else:
            note(ours_causes, 'no name of the target appears in the file (strings, reflection, configuration)', (f, t))
    for t in sorted(c - o):
        only_compiler += 1
        e = compiler[f][t]
        if e['type']:
            names = set(e['type'])
            if any(len(declarers[n]) > 1 for n in names):
                note(comp_causes, 'a type named whose simple name several files declare', (f, t, sorted(names)[:2]))
            else:
                note(comp_causes, 'a type named that only this target declares', (f, t, sorted(names)[:2]))
        elif partial.get(f, set()) & partial.get(t, set()):
            note(comp_causes, 'a member of a partial peer', (f, t, e['member'][:2]))
        else:
            note(comp_causes, 'a member only, with no type named (inherited, extension, through a variable)', (f, t, e['member'][:2]))

total_ours = sum(len(v) for v in ours.values())
total_comp = sum(len(v) for v in compiler.values())
print(f'ours {total_ours}, compiler {total_comp}, both {agree}, ours only {only_ours}, compiler only {only_compiler}')
print('ours, not the compiler\'s:')
for k, v in ours_causes.most_common():
    print(f'  {v}  {k}  e.g. {ex[k][:2]}')
print('the compiler\'s, not ours:')
for k, v in comp_causes.most_common():
    print(f'  {v}  {k}  e.g. {ex[k][:2]}')

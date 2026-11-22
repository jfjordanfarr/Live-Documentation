"""Runs reader.py on every case in tests/refuse and checks it answers with exactly
one line beginning "refused:" (binary cases with read and graph, texts with name)."""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
READER = os.path.join(os.path.dirname(HERE), 'reader.py')
bad = 0
rows = [l.rstrip('\n').split('\t') for l in open(os.path.join(HERE, 'refuse', 'CASES.tsv'), encoding='utf-8')]
for name, section, what in rows:
    path = os.path.join(HERE, 'refuse', name)
    modes = ('read', 'graph') if name.endswith('.fpk') else ('name',)
    for mode in modes:
        p = subprocess.run([sys.executable, '-I', READER, mode, path], capture_output=True, timeout=60)
        out = p.stdout
        ok = out.startswith(b'refused: ') and out.endswith(b'\n') and out.count(b'\n') == 1 and not p.stderr \
            and b'internal error' not in out
        if not ok:
            bad += 1
            print('FAIL', mode, name, '--', what, '\n   ', out[:200], p.stderr[-300:])
        elif mode != 'graph' and '-v' in sys.argv:
            print('%-40s %-5s %s\n    -> %s' % (name, section, what, out.decode('utf-8', 'replace').strip()))
print('%d cases, %d failures' % (len(rows), bad))
sys.exit(1 if bad else 0)

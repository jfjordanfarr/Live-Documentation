"""Runs every test: the three samples, the refusal cases, random round trips and
mutation fuzzing. (stress.py, which builds large files in $TMPDIR and times them,
is run by hand.)  Usage: python3 -I tests/run_all.py"""
import hashlib
import os
import subprocess
import sys
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
READER = os.path.join(ROOT, 'reader.py')


def cli(*args):
    return subprocess.run([sys.executable, '-I', READER] + list(args), capture_output=True, timeout=600)


bad = 0
for s in ('made-empty', 'made-every-fact', 'made-seeded-5-30'):
    fpk, txt = os.path.join(ROOT, s + '.fpk'), os.path.join(ROOT, s + '.txt')
    data = open(fpk, 'rb').read()
    end = zlib.decompress(data[-35:], -15)            # every sample's end is stored in its last 35 bytes
    r, n, g = cli('read', fpk), cli('name', txt), cli('graph', fpk)
    ok = (r.stdout == open(txt, 'rb').read() and n.stdout == end.hex().encode() + b'\n' and
          g.stdout.startswith(b'{"files":[') and not (r.stderr or n.stderr or g.stderr))
    print('sample %-18s read %s, name %s, graph %s' % (s, 'same' if r.stdout == open(txt, 'rb').read() else 'DIFFERS',
                                                     n.stdout.decode().strip()[:16] + '…', 'ok' if g.returncode == 0 else 'FAIL'))
    bad += not ok
for script, args in (('make_cases.py', []), ('run_refusals.py', []), ('roundtrip.py', ['300']), ('mutate.py', ['2000'])):
    p = subprocess.run([sys.executable, '-I', os.path.join(HERE, script)] + args, capture_output=True, text=True)
    print(script, '->', (p.stdout.strip().splitlines() or [''])[0 if script != 'run_refusals.py' else -1], p.stderr[-500:])
    bad += p.returncode != 0
print('ALL PASSED' if not bad else '%d FAILED' % bad)
sys.exit(1 if bad else 0)

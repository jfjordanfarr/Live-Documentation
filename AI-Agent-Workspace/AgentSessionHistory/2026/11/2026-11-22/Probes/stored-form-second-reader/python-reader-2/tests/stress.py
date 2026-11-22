"""Valid files near the 64x inflation bound, one per shape of record, each built to
inflate to about RAW bytes; times read and graph on each (in tests/big/)."""
import os
import random
import resource
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
import reader as R  # noqa: E402

RAW = int(sys.argv[1]) if len(sys.argv) > 1 else 20_000_000
tmp = os.path.join(HERE, 'big')
os.makedirs(tmp, exist_ok=True)
rng = random.Random(3)


def v(n):
    b = bytearray()
    R.venc(n, b)
    return bytes(b)


def t(s):
    b = s.encode('utf-8')
    return v(len(b)) + b


def build(unit, n, prefix, suffix, ss=('a', '', 'l'), extra_strings=0):
    """One file "a": prefix + count n + unit * n + suffix. Strings: a, "", l, then fillers."""
    ss = list(ss) + ['s%d' % i for i in range(extra_strings)]
    rec = prefix + v(n) + unit * n + suffix
    pad = ''.join(rng.choice('abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ') for _ in range(len(rec) // 45))
    hd = bytes([1]) + t('') + t('') + t('') + t(pad) + v(0)
    secs = [(R.HEAD, 0, hd), (R.STRINGS, len(ss), b''.join(t(s) for s in ss)), (R.RECORDS, 1, rec),
            (R.PATHS, 1, v(0) + t('a')), (R.WIRES, 1, b'\x00')]
    return R.file_of_sections(secs)


# record prefix up to the symbols: path 0, layer 0, mark 0, 0 entries, authored 1
P0 = bytes([0, 0, 0, 0, 1])
# a symbol named "" of kind "", with a slug "l" so that graph edges get "from"
SYM = bytes([1, 1, 2, 1, 0])
shapes = {
    'types': (bytes([1, 0]), P0 + bytes([1]) + SYM + bytes([1, 0]), bytes([0, 0, 0])),
    'linked-types': (bytes([1, 7, 2, 0, 1]), P0 + bytes([1]) + SYM + bytes([1, 1]), bytes([0, 0, 0])),
    'symbols': (bytes([1, 0, 1, 0, 0, 0, 0]), P0, bytes([0])),
    'entries': (bytes([0, 0]), bytes([0, 0, 0]), bytes([1, 0, 0])),
    'dependencies': (bytes([1, 3, 2, 0, 1, 1]), P0 + bytes([0]), b''),
    'docrefs': (bytes([1, 3, 2, 0]), P0 + bytes([1]) + SYM + bytes([0, 0]), bytes([0])),
    'parameters': (bytes([1, 0]), P0 + bytes([1]) + SYM + bytes([1, 4]), bytes([0, 0, 0])),
    'two-byte-sids': (v(200), P0 + bytes([1]) + bytes([1, 0, 1]), bytes([0, 0, 0, 0])),
}
results = []
for name, (unit, prefix, suffix) in shapes.items():
    n = RAW // len(unit)
    if name == 'two-byte-sids':
        # sids 3..200 must be met in order first: flags list = 3..200 then 200 repeated
        first = b''.join(v(i) for i in range(2, 201))
        rec_unit = unit
        data = build(rec_unit, 0, b'', b'', extra_strings=198)          # placeholder, rebuilt below
        prefix2 = P0 + bytes([1]) + bytes([1, 0, 1])
        flags = first + unit * (n // 2)
        ss = ['a', '', 'l'] + ['s%d' % i for i in range(198)]
        rec = prefix2 + v(199 + n // 2) + flags + bytes([0, 0, 0, 0])
        pad = ''.join(rng.choice('abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ') for _ in range(len(rec) // 45))
        hd = bytes([1]) + t('') + t('') + t('') + t(pad) + v(0)
        secs = [(R.HEAD, 0, hd), (R.STRINGS, len(ss), b''.join(t(s) for s in ss)), (R.RECORDS, 1, rec),
                (R.PATHS, 1, v(0) + t('a')), (R.WIRES, 1, b'\x00')]
        data = R.file_of_sections(secs)
    elif name in ('symbols', 'entries'):
        data = build(unit, n, prefix, suffix, ss=('a', ''))
    else:
        data = build(unit, n, prefix, suffix)
    path = os.path.join(tmp, 'stress-%s.fpk' % name)
    open(path, 'wb').write(data)
    row = [name, len(data)]
    for mode in ('read', 'graph'):
        t0 = time.time()
        child = subprocess.Popen([sys.executable, '-I', os.path.join(ROOT, 'reader.py'), mode, path],
                                 stdout=subprocess.PIPE)
        start = child.stdout.read(200)
        size = len(start)
        while True:                                     # count the output without keeping it
            piece = child.stdout.read(1 << 20)
            if not piece:
                break
            size += len(piece)
        _, status, ru = os.wait4(child.pid, 0)
        child.returncode = status
        row.append('%s %.1fs %dMB out, RSS %d MB' % (mode, time.time() - t0, size >> 20, ru.ru_maxrss >> 10))
        assert not start.startswith(b'refused'), (name, start)
    print(*row, sep='  |  ', flush=True)

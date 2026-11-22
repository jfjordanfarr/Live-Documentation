"""Valid files that are hard on a reader: near the 64x inflation bound, and past the
text bound of section 3.5. Written to tests/big/."""
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import reader as R  # noqa: E402


def v(n):
    b = bytearray()
    R.venc(n, b)
    return bytes(b)


def t(s):
    b = s.encode('utf-8')
    return v(len(b)) + b


def head(scanner='s'):
    return bytes([1]) + t('') + t('') + t('') + t(scanner) + v(0)


def paths(p):
    return v(0) + t(p)


tmp = os.path.join(HERE, 'big')
os.makedirs(tmp, exist_ok=True)
rng = random.Random(7)

# 1. one symbol with N flags naming "": records ~N bytes; padded by an incompressible scanner
N = int(sys.argv[1]) if len(sys.argv) > 1 else 20_000_000
pad = ''.join(rng.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(N // 50))
rec = bytes([0, 0, 0, 0, 1, 1, 1, 0, 1]) + v(N) + b'\x01' * N + bytes([0, 0, 0, 0])
secs = [(R.HEAD, 0, head(scanner=pad)), (R.STRINGS, 2, t('a') + t('')), (R.RECORDS, 1, rec),
        (R.PATHS, 1, paths('a')), (R.WIRES, 1, b'\x00')]
data = R.file_of_sections(secs)
open(os.path.join(tmp, 'big-flags.fpk'), 'wb').write(data)
print('big-flags.fpk', len(data), 'bytes; raw', sum(len(r) for _, _, r in secs) + 32,
      'bound', 64 * len(data) + 1048576)

# 2. section 3.5's example: one 32 KiB string named 9,000 times
S = 'x' * 32768
rec = bytes([0, 0, 0, 0, 1, 1, 1, 0, 1]) + v(9000) + v(2) * 9000 + bytes([0, 0, 0, 0])
secs = [(R.HEAD, 0, head()), (R.STRINGS, 3, t('a') + t('') + t(S)), (R.RECORDS, 1, rec),
        (R.PATHS, 1, paths('a')), (R.WIRES, 1, b'\x00')]
data = R.file_of_sections(secs)
open(os.path.join(tmp, 'text-bomb.fpk'), 'wb').write(data)
print('text-bomb.fpk', len(data), 'bytes')

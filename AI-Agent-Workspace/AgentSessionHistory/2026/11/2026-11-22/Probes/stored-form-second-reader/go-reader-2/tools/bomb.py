# Hostile but valid: one record with E two-byte entries plus an incompressible
# string to make the file long enough that the sections stay within 64x.
import os, sys, random
sys.path.insert(0, os.path.dirname(__file__))
from fpklib import *
E = int(sys.argv[1]); out = sys.argv[2]; junk = int(sys.argv[3])
r = random.Random(5)
big = ''.join(chr(r.randrange(33, 127)) for _ in range(junk))
head = bytes([1]) + text('') + text('') + text('') + text('b') + uv(0)
strs = ['a', '', big]
rec = uv(0) + uv(0) + uv(0) + uv(E) + b'\x00\x00' * E + uv(1) + uv(1) + uv(2) + uv(0) + uv(3) + uv(0) + uv(0) + uv(0) + uv(0)
# one symbol: name '' (1), mark 0, kind big(2) ... flags 0 refs 0 sections 0 docs 0; deps 0
rec = uv(0) + uv(0) + uv(0) + uv(E) + b'\x00\x00' * E + uv(1) + uv(1) + uv(1) + uv(0) + uv(2) + uv(0) * 4 + uv(0)
fr = [[1, 0, head], [2, 3, b''.join(text(s) for s in strs)], [3, 1, rec], [4, 1, uv(0) + uv(1) + b'a'], [5, 1, uv(0)], [6, 0, b'']]
d = pack(fr)
open(out, 'wb').write(d)
print(len(d), 'bytes; raw', sum(len(f[2]) for f in fr), 'bound', 64 * len(d) + 1048576)

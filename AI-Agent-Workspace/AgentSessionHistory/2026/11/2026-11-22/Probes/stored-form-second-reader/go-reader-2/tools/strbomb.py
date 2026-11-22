# Valid file with as many short distinct strings as fit: a worst case for the
# string table's memory.
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from fpklib import *
K = int(sys.argv[1]); out = sys.argv[2]
strs = ['a', ''] + [format(i, 'x') + '!' for i in range(K)]
head = bytes([1]) + text('') + text('') + text('') + text('b') + uv(0)
body = b''.join(uv(i + 2) for i in range(K))
rec = uv(0) + uv(0) + uv(0) + uv(0) + uv(1) + uv(1) + uv(1) + uv(0) + uv(1) + uv(0) + uv(0) + uv(1) + uv(1) + uv(K) + body + uv(0) + uv(0)
fr = [[1, 0, head], [2, len(strs), b''.join(text(s) for s in strs)], [3, 1, rec], [4, 1, uv(0) + uv(1) + b'a'], [5, 1, uv(0)], [6, 0, b'']]
d = pack(fr); open(out, 'wb').write(d)
print(len(d), 'bytes; raw', sum(len(f[2]) for f in fr))

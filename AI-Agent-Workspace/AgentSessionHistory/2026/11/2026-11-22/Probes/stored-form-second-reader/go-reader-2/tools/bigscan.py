# Writes a large valid scan (independently of the Go program) to test
# chunking across records frames, first-met numbering, wires, and speed.
import os, sys, hashlib
sys.path.insert(0, os.path.dirname(__file__))
from fpklib import *
N = int(sys.argv[1]); out = sys.argv[2]
paths = sorted(f'd{i % 10}/f{i:06}.ts' for i in range(N))
idx = {p: i for i, p in enumerate(paths)}
sids = {}; frames = []
head = bytes([1]) + text('.mdmd') + text('') + text('.md') + text('big') + uv(1) + text('why') + uv(3) + text('é')
frames.append([1, 0, head])
wires = []
for c0 in range(0, N, 256):
    new = []; rb = bytearray()
    def sid(s):
        if s not in sids: sids[s] = len(sids); new.append(s)
        rb.extend(uv(sids[s]))
    for i in range(c0, min(N, c0 + 256)):
        p = paths[i]; t1 = paths[(i + 1) % N]; t2 = paths[(i * 7 + 3) % N]
        sid(p); rb += uv(i % 5); rb += uv(1 if i % 3 == 0 else 0)
        if i % 3 == 0: sid('impl')
        rb += uv(0)              # entries
        sid('authored ' + str(i % 50))
        rb += uv(1)              # one symbol
        sid('fn'); rb += uv(1); sid('s' + str(i % 9)); sid('function'); rb += uv(0)
        rb += uv(1) + uv(0) + uv(1)  # Returns, one type
        sid('T'); rb += uv(7); sid('t.md#x'); sid(t2); sid('x')
        rb += uv(0) + uv(1)      # no sections, one doc ref
        sid('D'); rb += uv(3); sid('d.md'); sid(t1)
        rb += uv(1); sid('dep'); rb += uv(3); sid('dep.md'); sid(t1); rb += uv(1); sid('type-only')
        w = sorted({idx[t] for t in (t1, t2) if idx[t] != i})
        wires.append(w)
    if new: frames.append([2, len(new), b''.join(text(s) for s in new)])
    frames.append([3, min(N, c0 + 256) - c0, bytes(rb)])
pb = b''; prev = b''
for p in paths:
    p = p.encode(); sh = 0
    while sh < len(prev) and sh < len(p) and prev[sh] == p[sh]: sh += 1
    pb += uv(sh) + uv(len(p) - sh) + p[sh:]; prev = p
wb = b''
for w in wires:
    wb += uv(len(w))
    for k, x in enumerate(w): wb += uv(x if k == 0 else x - w[k-1] - 1)
frames += [[4, N, pb], [5, N, wb], [6, 0, b'']]
open(out, 'wb').write(pack(frames))
print(hashlib.sha256(b''.join(hashlib.sha256(f[2]).digest() for f in frames[:-1])).hexdigest())

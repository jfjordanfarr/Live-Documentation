"""Time and memory of reading crafted files near section 3.5's limits."""
import copy, hashlib, os, resource, struct, subprocess, sys, time, zlib
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT); sys.path.insert(0, HERE)
import reader as R
from fpktools import assemble, frames_from, load, deflate, CASES

def measure(name, data, mode="read"):
    p = os.path.join(CASES, name + ".fpk"); open(p, "wb").write(data)
    t = time.time()
    proc = subprocess.Popen([sys.executable, "-I", os.path.join(ROOT, "reader.py"), mode, p],
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    n = 0; first = b""
    while True:
        chunk = proc.stdout.read(1 << 20)
        if not chunk: break
        if not first: first = chunk[:100]
        n += len(chunk)
    proc.wait()
    print("%-28s file %8d B  out %11d B  %6.2fs  %s"
          % (name, len(data), n, time.time() - t, first[:70]))

h, recs = load("made-every-fact")
# 1. a bomb: 64 MiB claimed from 65 KB of deflated zeros
z = deflate(b"\0" * R.MAX_SECTION)
measure("bomb-64MiB-zeros", assemble([{"kind": 1, "count": 0, "raw": b"\0" * 0, "stored": z,
                                       "rawLength": R.MAX_SECTION}] + frames_from(h, recs)[1:]))
# 2. as much raw as the bound allows from a small file: one symbol with a long flags list
r = copy.deepcopy(recs)
r[2]["symbols"] = [{"name": "s", "kind": "k", "flags": ["f"] * 1000000, "references": [], "sections": []}]
measure("flags-1M", assemble(frames_from(h, r)))
# 3. a text far larger than its file: a 1 KB string named 300,000 times, and padding of random strings
import random
rng = random.Random(3)
r = copy.deepcopy(recs)
big = "".join(rng.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(1000))
pad = ["".join(chr(rng.randrange(0x4e00, 0x9fff)) for _ in range(50)) for _ in range(40)]
r[2]["symbols"] = [{"name": "s", "kind": "k", "flags": [big] * 300000 + pad, "references": [], "sections": []}]
measure("text-expansion-300MB", assemble(frames_from(h, r)))
print("(peak memory: measure from a fresh shell, e.g. zsh: TIMEFMT='%M MB %E'; time python3 -I reader.py read tests/cases/text-expansion-300MB.fpk >/dev/null)")

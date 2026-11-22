# Mutation fuzzer: mutates samples (whole bytes, or uncompressed sections
# repacked with good hashes), runs read and graph, and checks every answer is
# either one refused: line or a valid output that round-trips through name.
import os, random, subprocess, sys, json, hashlib
sys.path.insert(0, os.path.dirname(__file__))
import fpklib

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIN = os.path.join(HERE, 'fpk')
TMP = os.environ.get('TMPDIR', '/tmp')
rnd = random.Random(int(sys.argv[1]) if len(sys.argv) > 1 else 1)
N = int(sys.argv[2]) if len(sys.argv) > 2 else 500

samples = [open(os.path.join(HERE, f), 'rb').read() for f in sorted(os.listdir(HERE)) if f.endswith('.fpk')]

def mutate_bytes(b):
    b = bytearray(b)
    for _ in range(rnd.randint(1, 4)):
        op = rnd.random()
        if op < 0.5 and b:
            i = rnd.randrange(len(b)); b[i] = rnd.randrange(256)
        elif op < 0.7 and b:
            i = rnd.randrange(len(b)); del b[i:i+rnd.randint(1, 8)]
        elif op < 0.85:
            i = rnd.randrange(len(b)+1); b[i:i] = bytes(rnd.randrange(256) for _ in range(rnd.randint(1, 4)))
        else:
            b = b[:rnd.randrange(len(b)+1)]
    return bytes(b)

def mutate_section(d):
    fr = fpklib.unpack(d)
    i = rnd.randrange(len(fr) - 1)
    fr[i][2] = mutate_bytes(fr[i][2]) if fr[i][2] else bytes([rnd.randrange(256)])
    if rnd.random() < 0.1:
        fr[i][1] = max(0, fr[i][1] + rnd.choice([-1, 1]))
    return fpklib.pack(fr)

stats = {}
def run(mode, path):
    p = subprocess.run([BIN, mode, path], capture_output=True, timeout=20)
    return p

bad = 0
for n in range(N):
    base = rnd.choice(samples)
    data = mutate_section(base) if rnd.random() < 0.7 else mutate_bytes(base)
    path = os.path.join(TMP, 'fuzz.fpk')
    open(path, 'wb').write(data)
    r = run('read', path)
    out = r.stdout
    ok = r.returncode == 0 and not r.stderr
    if out.startswith(b'refused:'):
        ok = ok and out.count(b'\n') == 1 and b'internal error' not in out
        key = out.decode(errors='replace').split(':')[1][:40]
        stats[key] = stats.get(key, 0) + 1
    else:
        stats['ACCEPTED'] = stats.get('ACCEPTED', 0) + 1
        tp = os.path.join(TMP, 'fuzz.txt'); open(tp, 'wb').write(out)
        nm = run('name', tp).stdout.decode().strip()
        want = hashlib.sha256(b''.join(hashlib.sha256(f[2]).digest() for f in fpklib.unpack(data)[:-1])).hexdigest()
        ok = ok and nm == want
        g = run('graph', path)
        try: json.loads(g.stdout)
        except Exception: ok = False
    if not ok:
        bad += 1
        keep = os.path.join(TMP, f'fuzzbad{bad}.fpk'); open(keep, 'wb').write(data)
        print('BAD', keep, r.returncode, out[:200], r.stderr[:300])
print('cases', N, 'bad', bad)
for k, v in sorted(stats.items(), key=lambda x: -x[1]): print(v, k)

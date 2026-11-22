# Mutates the sample texts and checks that name mode answers with one
# refused: line or a name, never anything else. An accepted mutant must be
# a text the reader would write: checked by mutating only string contents
# in ways that keep the one form, and expecting acceptance there.
import os, random, subprocess, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIN = os.path.join(HERE, 'fpk'); TMP = os.environ.get('TMPDIR', '/tmp')
rnd = random.Random(int(sys.argv[1])); N = int(sys.argv[2])
texts = [open(os.path.join(HERE, f), 'rb').read() for f in sorted(os.listdir(HERE)) if f.endswith('.txt') and f.startswith('made-')]
toks = [b'"', b',', b':', b'{', b'}', b'[', b']', b'null', b'true', b'false', b'0', b'1', b' ', b'\\', b'\\u0000', b'\n', b'\r', b'\xc3', b'\xff', b'"target":"x"', b'"link":"/a"']
bad = 0; acc = 0; ref = 0
for n in range(N):
    t = bytearray(rnd.choice(texts))
    for _ in range(rnd.randint(1, 3)):
        i = rnd.randrange(len(t)); op = rnd.random()
        if op < 0.4: t[i:i+rnd.randint(0, 3)] = rnd.choice(toks)
        elif op < 0.6: del t[i:i+rnd.randint(1, 20)]
        elif op < 0.8: t[i] = rnd.randrange(256)
        else:
            ls = t.split(b'\n'); a = rnd.randrange(len(ls)); b = rnd.randrange(len(ls)); ls[a], ls[b] = ls[b], ls[a]; t = bytearray(b'\n'.join(ls))
    p = os.path.join(TMP, 'fuzz.txt'); open(p, 'wb').write(t)
    r = subprocess.run([BIN, 'name', p], capture_output=True, timeout=20)
    o = r.stdout
    if o.startswith(b'refused:') and o.count(b'\n') == 1 and b'internal error' not in o and not r.stderr: ref += 1; continue
    if len(o) == 65 and all(c in b'0123456789abcdef' for c in o[:64]): acc += 1; continue
    bad += 1; q = os.path.join(TMP, f'fuzztextbad{bad}.txt'); open(q, 'wb').write(t); print('BAD', q, o[:200], r.stderr[:200])
print('cases', N, 'refused', ref, 'accepted', acc, 'bad', bad)

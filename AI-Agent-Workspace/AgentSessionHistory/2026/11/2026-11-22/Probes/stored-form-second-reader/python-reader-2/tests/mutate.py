"""Mutation fuzzing. Mutates whole files and, re-sealed with correct hashes and end,
single uncompressed sections. Every answer must be a refusal or facts; any facts
must be canonical: their text must be valid and name the same content."""
import io
import os
import random
import sys
import time
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
import reader as R  # noqa: E402


def run(mode, data):
    b = io.BytesIO()
    R.answer(mode, data, b)
    return b.getvalue()


def sections_of(data):
    frames = R.hop_frames(data)
    return [(f.kind, f.count, zlib.decompress(data[f.off:f.off + f.stored], -15)) for f in frames[:-1]]


def mutate_bytes(rng, b):
    b = bytearray(b)
    for _ in range(rng.randint(1, 4)):
        op = rng.random()
        if not b:
            b.append(rng.randrange(256))
            continue
        i = rng.randrange(len(b))
        if op < 0.4:
            b[i] = rng.randrange(256)
        elif op < 0.55:
            b[i] ^= 1 << rng.randrange(8)
        elif op < 0.7:
            del b[i:i + rng.randint(1, 3)]
        elif op < 0.85:
            b[i:i] = bytes(rng.randrange(256) for _ in range(rng.randint(1, 3)))
        else:
            b[i] = rng.choice([0, 1, 2, 0x7f, 0x80, 0xff])
    return bytes(b)


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    seeds = [open(os.path.join(ROOT, f), 'rb').read() for f in
             ('made-empty.fpk', 'made-every-fact.fpk', 'made-seeded-5-30.fpk')]
    vdir = os.path.join(HERE, 'valid')
    seeds += [open(os.path.join(vdir, f), 'rb').read() for f in sorted(os.listdir(vdir)) if f.endswith(".fpk")]
    rng = random.Random(1)
    stats = {'refused': 0, 'accepted': 0}
    worst = 0
    reasons = {}
    for it in range(n):
        base = rng.choice(seeds)
        if rng.random() < 0.3:
            data = mutate_bytes(rng, base)
        else:
            secs = sections_of(base)
            k = rng.randrange(len(secs))
            kind, count, raw = secs[k]
            if rng.random() < 0.1:
                count = max(0, count + rng.choice([-1, 1]))
            secs[k] = (kind, count, mutate_bytes(rng, raw))
            data = R.file_of_sections(secs)
        t0 = time.time()
        out = run('read', data)
        gout = run('graph', data)
        worst = max(worst, time.time() - t0)
        assert b'internal error' not in out and b'internal error' not in gout, (it, out)
        if out.startswith(b'refused: '):
            assert out.count(b'\n') == 1 and gout.startswith(b'refused: ')
            stats['refused'] += 1
            r = out.split(b':')[1][:40]
            reasons[r] = reasons.get(r, 0) + 1
        else:
            stats['accepted'] += 1
            name = run('name', out)
            assert name == R.open_file(data).name.hex().encode() + b'\n', (it, name)
            assert not gout.startswith(b'refused')
    print(n, 'mutants:', stats, 'slowest %.3fs' % worst)
    for r, c in sorted(reasons.items(), key=lambda x: -x[1])[:12]:
        print('  %5d %s' % (c, r.decode('utf-8', 'replace')))


main()

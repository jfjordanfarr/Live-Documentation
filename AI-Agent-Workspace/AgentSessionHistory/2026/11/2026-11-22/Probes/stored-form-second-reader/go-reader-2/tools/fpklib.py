# Test helpers (not part of the program): unpack an .fpk into its frames'
# uncompressed sections, and pack sections back with correct hashes and name.
import hashlib, struct, zlib

SIG = bytes([0x89, 0x46, 0x50, 0x4B, 0x0D, 0x0A, 0x1A, 0x0A])

def unpack(d):
    assert d[:8] == SIG
    p = 8; frames = []
    while True:
        k, c, r, s = struct.unpack_from('<BIII', d, p)
        st = d[p+45:p+45+s]; p += 45 + s
        frames.append([k, c, zlib.decompressobj(-15).decompress(st)])
        if k == 6: break
    return frames

def deflate(raw, level=6):
    c = zlib.compressobj(level, zlib.DEFLATED, -15)
    return c.compress(raw) + c.flush()

def frame(kind, count, raw, stored=None, rawlen=None, h=None):
    if stored is None: stored = deflate(raw)
    if rawlen is None: rawlen = len(raw)
    if h is None: h = hashlib.sha256(raw).digest()
    return struct.pack('<BIII', kind, count, rawlen, len(stored)) + h + stored

def pack(frames, fix_end=True):
    """frames: list of [kind, count, raw]; the end's raw and count are recomputed."""
    out = bytearray(SIG); hs = []
    for k, c, raw in frames:
        if k == 6 and fix_end:
            name = hashlib.sha256(b''.join(hs)).digest()
            out += frame(6, len(hs), name)
            break
        hs.append(hashlib.sha256(raw).digest())
        out += frame(k, c, raw)
    return bytes(out)

def uv(n):
    b = bytearray()
    while True:
        x = n & 0x7f; n >>= 7
        if n: b.append(x | 0x80)
        else: b.append(x); return bytes(b)

def text(s):
    if isinstance(s, str): s = s.encode()
    return uv(len(s)) + s

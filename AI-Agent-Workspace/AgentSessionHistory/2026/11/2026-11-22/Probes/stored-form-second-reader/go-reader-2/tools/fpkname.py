# Independent check: content name computed from a binary's frame headers,
# and the end section inflated, for comparison with `name` mode.
import sys, hashlib, struct, zlib
d = open(sys.argv[1], 'rb').read()
p = 8; hs = []
while True:
    k, c, r, s = struct.unpack_from('<BIII', d, p); h = d[p+13:p+45]
    st = d[p+45:p+45+s]; p += 45 + s
    if k == 6:
        end = zlib.decompressobj(-15).decompress(st); break
    hs.append(h)
print(hashlib.sha256(b''.join(hs)).hexdigest(), end.hex())

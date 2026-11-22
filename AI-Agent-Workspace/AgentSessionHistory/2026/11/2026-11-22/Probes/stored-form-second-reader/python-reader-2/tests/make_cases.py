"""Writes files a reader must refuse into tests/refuse/, one per case.

Binary cases are named *.fpk, texts *.txt; each case is listed in
tests/refuse/CASES.tsv as  file<TAB>section<TAB>what it breaks.
Binary cases that do not break the container itself are written with correct
hashes and a correct end, so the refusal must come from the check named."""

import hashlib
import os
import struct
import sys
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
import reader as R  # noqa: E402

OUT = os.path.join(HERE, 'refuse')
os.makedirs(OUT, exist_ok=True)
for _f in os.listdir(OUT):
    os.remove(os.path.join(OUT, _f))
CASES = []


def put(name, data, section, what):
    with open(os.path.join(OUT, name), 'wb') as f:
        f.write(data)
    CASES.append((name, section, what))


def v(n):
    b = bytearray()
    R.venc(n, b)
    return bytes(b)


def t(s):
    b = s.encode('utf-8') if isinstance(s, str) else s
    return v(len(b)) + b


def head(root='.mdmd', base='layer-4', ext='.mdmd.md', scanner='s', left=(), version=1):
    b = bytes([version]) + t(root) + t(base) + t(ext) + t(scanner) + v(len(left))
    for r, n, d in left:
        b += t(r) + v(n) + t(d)
    return b


def strings(*ss):
    return b''.join(t(s) for s in ss)


def paths(*ps, raw=None):
    if raw is not None:
        return raw
    b = b''
    prev = b''
    for p in ps:
        p = p.encode('utf-8')
        k = 0
        while k < min(len(p), len(prev)) and p[k] == prev[k]:
            k += 1
        b += v(k) + v(len(p) - k) + p[k:]
        prev = p
    return b


# one file "a" whose authored words are "": strings 0 "a", 1 ""
REC_A = bytes([0, 0, 0, 0, 1, 0, 0])


def one(record=REC_A, ss=('a', ''), ps=('a',), wires=b'\x00', hd=None, nfiles=1):
    secs = [(R.HEAD, 0, hd if hd is not None else head())]
    if ss:
        secs.append((R.STRINGS, len(ss), strings(*ss)))
    secs.append((R.RECORDS, nfiles, record))
    secs.append((R.PATHS, nfiles, paths(*ps) if isinstance(ps, tuple) else ps))
    secs.append((R.WIRES, nfiles, wires))
    return secs


def pack(secs, level=9):
    return R.file_of_sections(secs, level)


def frame(kind, count, raw, stored=None, h=None, rawlen=None):
    if stored is None:
        co = zlib.compressobj(9, zlib.DEFLATED, -15)
        stored = co.compress(raw) + co.flush()
    if h is None:
        h = hashlib.sha256(raw).digest()
    return struct.pack('<BIII', kind, count, len(raw) if rawlen is None else rawlen, len(stored)) + h + stored


def end_for(hashes, count, content=None, endhash=None):
    name = hashlib.sha256(b''.join(hashes)).digest()
    return frame(R.END, count, name if content is None else content, h=endhash)


def assemble(frames_raw, count=None):
    """(kind, count, raw) frames -> a file with a correct end."""
    body = b''.join(frame(k, c, r) for k, c, r in frames_raw)
    hs = [hashlib.sha256(r).digest() for _, _, r in frames_raw]
    return R.SIGNATURE + body + end_for(hs, len(frames_raw) if count is None else count)


GOOD = pack(one())
R.open_file(GOOD).validate()          # the base case is valid

# ------------------------------------------------------------------ container (3.1, 3.2, 3.3, 3.5)
put('sig-empty.fpk', b'', '3.1', 'an empty file')
put('sig-short.fpk', R.SIGNATURE[:7], '3.1', 'seven bytes of the signature')
put('sig-wrong.fpk', b'\x89PNG\r\n\x1a\n' + GOOD[8:], '3.1', 'another signature (PNG)')
put('sig-crlf.fpk', GOOD[:4] + b'\n' + GOOD[6:], '3.1', 'the signature with its CR LF turned to LF')
put('unfinished-signature-only.fpk', R.SIGNATURE, '3.3', 'the signature alone, no end frame')
put('unfinished-header-cut.fpk', GOOD[:8 + 20], '3.3', 'a frame header cut short')
put('unfinished-no-end.fpk', GOOD[:GOOD.rindex(b'\x06\x05\x00\x00\x00')], '3.3', 'every frame but the end')
put('unfinished-stored-past-end.fpk', GOOD[:-3], '3.5', 'the end frame stored bytes run past the file end')
put('trailing-byte.fpk', GOOD + b'\x00', '3.3', 'a byte after the end frame')
put('kind-0.fpk', R.SIGNATURE + b'\x00' + GOOD[9:], '3.2', 'a frame of kind 0')
put('kind-7.fpk', R.SIGNATURE + b'\x07' + GOOD[9:], '3.2', 'a frame of kind 7')
big = bytearray(GOOD)
struct.pack_into('<I', big, 8 + 5, R.MAX_SECTION + 1)
put('raw-over-max.fpk', bytes(big), '3.5', 'a rawLength above 64 MiB')
big = bytearray(GOOD)
struct.pack_into('<I', big, 8 + 5, 1032 * struct.unpack_from('<I', big, 8 + 9)[0] + 1025)
put('raw-over-deflate-max.fpk', bytes(big), '3.5', 'a rawLength above 1032 x storedLength + 1024')
put('total-over-bound.fpk', R.SIGNATURE + frame(R.HEAD, 0, b'\x00' * (2 * 1024 * 1024)), '3.5',
    'a deflate bomb: sections inflating past 64 x file length + 1 MiB')
h = head()
put('order-no-head.fpk', assemble([(R.PATHS, 0, b''), (R.WIRES, 0, b'')]), '3.3', 'no head frame')
put('order-head-count.fpk', assemble([(R.HEAD, 1, h), (R.PATHS, 0, b''), (R.WIRES, 0, b'')]), '3.3',
    'a head whose count is not 0')
put('order-two-heads.fpk', assemble([(R.HEAD, 0, h), (R.HEAD, 0, h), (R.PATHS, 0, b''), (R.WIRES, 0, b'')]),
    '3.3', 'two heads')
put('order-no-paths.fpk', assemble([(R.HEAD, 0, h), (R.WIRES, 0, b'')]), '3.3', 'no paths frame')
put('order-wires-before-paths.fpk', assemble([(R.HEAD, 0, h), (R.WIRES, 0, b''), (R.PATHS, 0, b'')]), '3.3',
    'wires before paths')
put('order-end-only.fpk', R.SIGNATURE + end_for([], 0), '3.3', 'an end frame alone')
s1 = one()
put('order-strings-without-records.fpk', assemble([s1[0], s1[1], s1[3], s1[4]]), '3.3',
    'a strings frame not followed by records')
put('order-strings-empty.fpk', assemble([s1[0], (R.STRINGS, 0, b''), s1[1], s1[2], s1[3], s1[4]]), '3.3',
    'a strings frame holding no string')
put('order-strings-after-records.fpk', assemble([s1[0], s1[2], s1[1], s1[3], s1[4]]), '3.3',
    'a strings frame after the records')
put('order-records-count-0.fpk',
    assemble([s1[0], s1[1], (R.RECORDS, 0, b''), (R.PATHS, 0, b''), (R.WIRES, 0, b'')]), '3.3',
    'a records frame of 0 files')
put('order-records-count-257.fpk', assemble([s1[0], s1[1], (R.RECORDS, 257, REC_A * 257), s1[3], s1[4]]), '3.3',
    'a records frame of 257 files')
r_b = bytes([2, 0, 0, 0, 1, 0, 0])
put('order-short-records-not-last.fpk',
    assemble([s1[0], (R.STRINGS, 2, strings('a', '')), (R.RECORDS, 1, REC_A), (R.STRINGS, 1, strings('b')),
              (R.RECORDS, 1, r_b), (R.PATHS, 2, paths('a', 'b')), (R.WIRES, 2, b'\x00\x00')]),
    '3.3', 'a records frame of fewer than 256 files that is not the last')
put('order-paths-count.fpk', assemble([s1[0], s1[1], s1[2], (R.PATHS, 2, paths('a')), s1[4]]), '3.3',
    'a paths count other than the number of files')
put('order-wires-count.fpk', assemble([s1[0], s1[1], s1[2], s1[3], (R.WIRES, 0, b'\x00')]), '3.3',
    'a wires count other than the number of files')
put('order-end-count.fpk', assemble(one(), count=4), '3.3', 'an end count other than the frames before it')
hs = [hashlib.sha256(r).digest() for _, _, r in s1]
name = hashlib.sha256(b''.join(hs)).digest()
body = R.SIGNATURE + b''.join(frame(k, c, r) for k, c, r in s1)
put('end-raw-33.fpk', body + frame(R.END, 5, name + b'\x00'), '3.3', 'an end whose rawLength is not 32')
put('end-wrong-name.fpk', body + frame(R.END, 5, b'\x00' * 32), '3.4', 'an end that does not hold the name')
put('end-wrong-header-hash.fpk', body + frame(R.END, 5, name, h=b'\x11' * 32), '3.4',
    'an end whose header hash is not SHA-256 of the name')
put('end-content-not-name.fpk', body + frame(R.END, 5, b'\x00' * 32, h=hashlib.sha256(name).digest()), '3.4',
    'an end whose header hash is right but whose content is not the name')


def with_head_frame(fr):
    """The one-file scan with its head frame replaced by fr, its end made from the headers' hashes."""
    return R.SIGNATURE + fr + b''.join(frame(k, c, r) for k, c, r in s1[1:]) + end_for([fr[13:45]] + hs[1:], 5)


h0 = head()
co = zlib.compressobj(9, zlib.DEFLATED, -15)
good_stream = co.compress(h0) + co.flush()
put('deflate-garbage.fpk', with_head_frame(frame(R.HEAD, 0, h0, stored=b'\xff' * 20)), '3.2',
    'stored bytes that are not a deflate stream')
put('deflate-cut.fpk', with_head_frame(frame(R.HEAD, 0, h0, stored=good_stream[:-2])), '3.2',
    'a deflate stream cut short')
put('deflate-trailing.fpk', with_head_frame(frame(R.HEAD, 0, h0, stored=good_stream + b'\x00')), '3.2',
    'a whole byte after the deflate stream end')
put('deflate-longer.fpk', with_head_frame(frame(R.HEAD, 0, h0, rawlen=len(h0) - 1)), '3.5',
    'a stream that inflates to more than rawLength')
put('deflate-shorter.fpk', with_head_frame(frame(R.HEAD, 0, h0, rawlen=len(h0) + 1)), '3.2',
    'a stream that inflates to less than rawLength')
put('deflate-zlib-wrapped.fpk', with_head_frame(frame(R.HEAD, 0, h0, stored=zlib.compress(h0))), '3.2',
    'a zlib-wrapped stream, not raw deflate')
put('hash-wrong.fpk', with_head_frame(frame(R.HEAD, 0, h0, h=b'\x22' * 32)), '3.2',
    'a section whose SHA-256 is not its hash')

# ------------------------------------------------------------------ head (4.1, 2.2, 2.4) and numbers (2.1)
def H(name, hd, sec, what):
    put(name, pack(one(hd=hd)), sec, what)


H('head-version-2.fpk', head(version=2), '4.1', 'version 2')
H('head-version-0.fpk', head(version=0), '4.1', 'version 0')
H('head-empty.fpk', b'', '4.1', 'an empty head')
H('head-trailing.fpk', head() + b'\x00', '3.2', 'a byte after the head last item')
H('head-cut.fpk', head()[:-1], '4.1', 'a head cut before its left-out count')
H('head-root-absolute.fpk', head(root='/abs'), '2.4', 'a root that begins with /')
H('head-root-backslash.fpk', head(root='\\abs'), '2.4', 'a root that begins with a backslash')
H('head-root-drive.fpk', head(root='C:x'), '2.4', 'a root that begins with a drive')
H('head-root-file.fpk', head(root='FiLe:x'), '2.4', 'a root that begins with file: in mixed case')
H('head-root-dotdot.fpk', head(root='a/../b'), '2.4', 'a root with a .. segment')
H('head-base-dot.fpk', head(base='./x'), '2.4', 'a baseLayer with a . segment')
H('head-base-trailing-slash.fpk', head(base='x/'), '2.4', 'a baseLayer with an empty segment')
H('head-root-nul.fpk', head(root='a\x00b'), '2.4', 'a root holding U+0000')
H('head-ext-slash.fpk', head(ext='.md/x'), '4.1', 'an extension holding /')
H('head-ext-backslash.fpk', head(ext='.md\\x'), '4.1', 'an extension holding a backslash')
H('head-ext-nul.fpk', head(ext='.md\x00'), '4.1', 'an extension holding U+0000')
E4 = bytes([1]) + t('') + t('') + t('')
H('utf8-overlong.fpk', E4 + t(b'\xc0\xaf') + v(0), '2.2', 'an overlong form (C0 AF)')
H('utf8-overlong-3.fpk', E4 + t(b'\xe0\x80\xaf') + v(0), '2.2', 'a three-byte overlong form (E0 80 AF)')
H('utf8-surrogate.fpk', E4 + t(b'\xed\xa0\x80') + v(0), '2.2', 'an encoded surrogate (ED A0 80)')
H('utf8-above-10ffff.fpk', E4 + t(b'\xf4\x90\x80\x80') + v(0), '2.2', 'a code point above U+10FFFF')
H('utf8-cut.fpk', E4 + t(b'\xe2\x82') + v(0), '2.2', 'a sequence cut short')
H('utf8-lone-continuation.fpk', E4 + t(b'\x80') + v(0), '2.2', 'a byte that cannot begin a sequence')
H('utf8-ff.fpk', E4 + t(b'\xff') + v(0), '2.2', 'a byte FF')
H('varint-not-shortest.fpk', E4 + t('') + b'\x80\x00', '2.1', 'a varint not in its shortest form (80 00)')
H('varint-six-bytes.fpk', E4 + t('') + b'\x80\x80\x80\x80\x80\x01', '2.1', 'a varint of six bytes')
H('varint-above-u32.fpk', E4 + t('') + b'\xff\xff\xff\xff\x1f', '2.1', 'a varint above 2^32 - 1')
H('varint-cut.fpk', E4 + t('') + b'\x80', '2.1', 'a varint cut short at the section end')
H('count-too-large.fpk', E4 + t('') + v(1000), '2.1', 'a left-out count larger than the bytes left')
H('text-length-past-end.fpk', E4 + v(50) + b'ab' + v(0), '2.2', 'a text whose length runs past its section')

# ------------------------------------------------------------------ strings (4.2)
put('strings-duplicate.fpk', pack(one(ss=('a', '', 'a'))), '4.2', 'a string that appears twice')
put('strings-unmet.fpk', pack(one(ss=('a', '', 'z'))), '4.2', 'a string nobody names')
put('strings-trailing.fpk', pack([s1[0], (R.STRINGS, 2, strings('a', '') + b'\x00'), s1[2], s1[3], s1[4]]),
    '3.2', 'a byte after the strings section last text')
put('strings-count-short.fpk', pack([s1[0], (R.STRINGS, 3, strings('a', '')), s1[2], s1[3], s1[4]]), '4.2',
    'fewer texts than the strings count')
put('strings-bad-utf8.fpk', pack(one(ss=('a', b'\xed\xbf\xbf'))), '2.2', 'a string table entry holding a surrogate')

# ------------------------------------------------------------------ records (4.3, 4.2, 2.1, 2.4)
def Rc(name, record, sec, what, **kw):
    put(name, pack(one(record=record, **kw)), sec, what)


Rc('sid-skips.fpk', bytes([1, 0, 0, 0, 0, 0, 0]), '4.2', 'a sid larger than the next not yet met')
Rc('sid-no-string.fpk', REC_A, '4.2', 'a sid naming a string not set down', ss=('a',))
Rc('sid-out-of-order.fpk', bytes([0, 0, 0, 0, 2, 0, 0]), '4.2', 'a new sid beyond the next', ss=('a', '', 'x'))
Rc('records-trailing.fpk', REC_A + b'\x00', '4.3', 'a byte after the last record')
Rc('records-cut.fpk', REC_A[:-1], '4.3', 'a record cut short')
Rc('mark-file-bit4.fpk', bytes([0, 0, 0x10, 0, 1, 0, 0]), '2.1', 'a file mark with bit 4 set')
Rc('mark-file-not-shortest.fpk', bytes([0, 0, 0x80, 0x00, 0, 1, 0, 0]), '2.1', 'a mark not in its shortest form')


def ent(reason, mark):
    return bytes([0, 0, 0, 1, reason, mark, 1, 0, 0])


Rc('entry-reason-6.fpk', ent(6, 0), '4.3', 'an entry reason of 6')
Rc('entry-mark-bit4.fpk', ent(0, 0x10), '2.1', 'an entry mark with bit 4 set')
Rc('entry-link-without-name.fpk', bytes([0, 0, 0, 1, 0, 2, 2, 1, 0, 0]), '4.3',
   'an entry symbol link without its symbol name', ss=('a', '', 'x'))
Rc('entry-link-absolute.fpk', bytes([0, 0, 0, 1, 0, 3, 1, 2, 1, 0, 0]), '2.4',
   'an entry symbol link that begins with /', ss=('a', '', '/x'))
Rc('entry-declarer-link-drive.fpk', bytes([0, 0, 0, 1, 5, 8, 1, 2, 1, 0, 0]), '2.4',
   'an entry declarer link that begins with a drive (c:foo)', ss=('a', '', 'c:foo'))


def sym(body):
    return bytes([0, 0, 0, 0, 1, 1]) + bytes(body) + bytes([0])


Rc('symbol-mark-bit2.fpk', sym([2, 4, 1, 0, 0, 0, 0]), '2.1', 'a symbol mark with bit 2 set', ss=('a', '', 'n'))
Rc('symbol-source-file.fpk', sym([2, 2, 1, 0, 3, 5, 0, 0, 0]), '2.4', 'a source path that begins with FILE:',
   ss=('a', '', 'n', 'FILE:///x'))
Rc('reference-role-5.fpk', sym([1, 0, 1, 0, 1, 5, 0, 0, 0]), '4.3', 'a reference role of 5')
Rc('type-mark-bit5.fpk', sym([1, 0, 1, 0, 1, 0, 1, 1, 0x20, 0, 0]), '2.1', 'a type mark with bit 5 set')
Rc('type-target-without-link.fpk', sym([1, 0, 1, 0, 1, 0, 1, 1, 2, 0, 0, 0]), '4.3',
   'a type with a target and no link')
Rc('type-anchor-without-target.fpk', sym([1, 0, 1, 0, 1, 0, 1, 1, 5, 2, 1, 0, 0]), '4.3',
   'a type with an anchor and no target', ss=('a', '', 'x'))
Rc('type-target-not-path.fpk', sym([1, 0, 1, 0, 1, 0, 1, 1, 3, 2, 3, 0, 0]), '2.4',
   'a type whose target is not a path (../x)', ss=('a', '', 'l', '../x'))
Rc('type-link-backslash.fpk', sym([1, 0, 1, 0, 1, 0, 1, 1, 1, 2, 0, 0]), '2.4',
   'a type whose link begins with a backslash', ss=('a', '', '\\\\server\\x'))
Rc('docref-mark-bit4.fpk', sym([1, 0, 1, 0, 0, 0, 1, 1, 0x10]), '2.1', 'a documentation reference mark with bit 4')
Rc('docref-anchor-without-target.fpk', sym([1, 0, 1, 0, 0, 0, 1, 1, 5, 2, 1]), '4.3',
   'a documentation reference with an anchor and no target', ss=('a', '', 'x'))


def dep(body):
    return bytes([0, 0, 0, 0, 1, 0, 1]) + bytes(body)


Rc('dep-mark-bit4.fpk', dep([1, 0x10, 0]), '2.1', 'a dependency mark with bit 4 set')
Rc('dep-target-empty-segment.fpk', dep([1, 3, 2, 3, 0]), '2.4', 'a dependency target with an empty segment (a//b)',
   ss=('a', '', 'l', 'a//b'))
Rc('dep-target-empty.fpk', dep([1, 3, 2, 1, 0]), '2.4', 'a dependency target that is empty', ss=('a', '', 'l'))
Rc('cited-link-absolute.fpk', bytes([0, 0, 4, 0, 1, 0, 0, 1, 1, 2]), '2.4', 'a cited-by link that begins with /',
   ss=('a', '', '/README.md'))
Rc('reexport-mark-bit2.fpk', bytes([0, 0, 8, 0, 1, 0, 0, 1, 1, 4, 0]), '2.1', 'a re-export mark with bit 2 set')
Rc('reexport-from-link-file.fpk', bytes([0, 0, 8, 0, 1, 0, 0, 1, 1, 2, 1, 2, 0]), '2.4',
   'a re-export origin link that begins with file:', ss=('a', '', 'file:x'))
Rc('record-path-absolute.fpk', REC_A, '2.4', 'a file path that begins with /', ss=('/a', ''),
   ps=paths(raw=b'\x00\x02/a'))
Rc('record-path-not-paths.fpk', REC_A, '4.4', 'a record path that is not the paths section path', ps=('b',))
Rc('record-path-dotdot.fpk', REC_A, '2.4', 'a file path with a .. segment', ss=('../a', ''),
   ps=paths(raw=b'\x00\x04../a'))

# ------------------------------------------------------------------ paths (4.4) and wires (4.5): two files a, b
TWO = bytes([0, 0, 0, 0, 1, 0, 0]) + bytes([2, 0, 0, 0, 1, 0, 0])


def P(name, praw, sec, what, ss=('a', '', 'b'), wires=b'\x00\x00', record=TWO):
    put(name, pack(one(record=record, ss=ss, ps=praw, wires=wires, nfiles=2)), sec, what)


AB = b'\x00\x01a\x00\x01b'
P('paths-shared-too-long.fpk', b'\x00\x01a\x02\x00', '4.4', 'a shared length above the path before it')
P('paths-first-shared.fpk', b'\x01\x01a\x00\x01b', '4.4', 'a first path that shares bytes with nothing')
P('paths-not-longest.fpk', b'\x00\x02ab\x00\x02ac', '4.4', 'a path not front-coded by its longest shared beginning',
  ss=('ab', '', 'ac'))
P('paths-order.fpk', b'\x00\x01b\x00\x01a', '4.4', 'paths out of path order', ss=('b', '', 'a'))
P('paths-repeat.fpk', b'\x00\x01a\x01\x00', '4.4', 'a path repeated')
P('paths-trailing.fpk', AB + b'\x00', '3.2', 'a byte after the last path')
P('paths-total-over-strings.fpk', b'\x00\x01a\x01\x7f' + b'a' * 127, '4.4',
  'paths whose bytes exceed the strings frames raw lengths')
P('paths-invalid-utf8.fpk', b'\x00\x01a\x00\x01\xff', '2.2', 'a path that is not UTF-8')
P('wires-to-self.fpk', AB, '4.5', 'a wire from a file to itself', wires=b'\x01\x00\x00')
P('wires-out-of-range.fpk', AB, '4.5', 'a wire to a file number past the last', wires=b'\x01\x05\x00')
P('wires-trailing.fpk', AB, '3.2', 'a byte after the last file wires', wires=b'\x00\x00\x00')
P('wires-count-too-large.fpk', AB, '2.1', 'a wires count larger than the bytes left', wires=b'\x00\x09')
P('wires-not-records.fpk', AB, '4.5', 'a wire the records do not give', wires=b'\x01\x01\x00')
P('wires-gap-overflow.fpk', AB, '4.5', 'a wire whose gap runs past the last file', wires=b'\x02\x01\x00\x00')
P('wires-missing.fpk', AB, '4.5', 'a dependency landing on another file with its wire left out',
  ss=('a', '', 'l', 'b'), record=bytes([0, 0, 0, 0, 1, 0, 1, 1, 3, 2, 3, 0]) + bytes([3, 0, 0, 0, 1, 0, 0]))
P('wires-from-docref.fpk', AB, '4.5', 'a wire made from a documentation reference', wires=b'\x01\x01\x00',
  ss=('a', '', 'l', 'b'), record=bytes([0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 3, 2, 3, 0]) + bytes([3, 0, 0, 0, 1, 0, 0]))

# ------------------------------------------------------------------ texts (section 8)
EF = open(os.path.join(ROOT, 'made-every-fact.txt'), 'rb').read()
EM = open(os.path.join(ROOT, 'made-empty.txt'), 'rb').read()
F = b'[null,"format","fact-pack",1]\n[null,"location","","",""]\n[null,"scanner","s"]\n'
FILE_A = b'["a","file",0,null,null]\n["a","authored",""]\n'
ONE_A = F + FILE_A + b'[null,"end",1]\n'


def sub(old, new, base=EF):
    assert old in base, old
    return base.replace(old, new, 1)


T = put
T('text-empty.txt', b'', '8', 'an empty text')
T('text-bom.txt', b'\xef\xbb\xbf' + EM, '8', 'a byte-order mark')
T('text-crlf.txt', EM.replace(b'\n', b'\r\n'), '8', 'CR LF line ends')
T('text-no-final-lf.txt', EM[:-1], '8', 'a last line without its LF')
T('text-blank-line.txt', EM.replace(b'\n[null,"end"', b'\n\n[null,"end"'), '8', 'an empty line')
T('text-bad-utf8.txt', sub(b'"a test 1.0"', b'"a test \xc0\xae"', EM), '8', 'bytes that are not UTF-8')
T('text-space.txt', sub(b'[null,"end",0]', b'[null, "end",0]', EM), '8.1', 'a space between tokens')
T('text-trailing-space.txt', sub(b'[null,"end",0]', b'[null,"end",0] ', EM), '8.1', 'a space after the value')
T('text-4.0.txt', sub(b',2,"AI', b',2.0,"AI', EM), '8.1', '2.0 for 2')
T('text-exponent.txt', sub(b',2,"AI', b',2e0,"AI', EM), '8.1', '2e0 for 2')
T('text-leading-zero.txt', sub(b',2,"AI', b',02,"AI', EM), '8.1', 'a leading zero')
T('text-negative.txt', sub(b',2,"AI', b',-2,"AI', EM), '8.1', 'a negative number')
T('text-number-too-big.txt', sub(b',2,"AI', b',4294967296,"AI', EM), '8.1', 'a number above 2^32 - 1')
T('text-nan.txt', sub(b',2,"AI', b',NaN,"AI', EM), '8.1', 'NaN')
T('text-u-escape-letter.txt', sub(b'"a test 1.0"', b'"\\u0061 test 1.0"', EM), '8.1', 'a letter as a \\u escape')
T('text-escaped-slash.txt', sub(b'"AI-Agent-Workspace/**"', b'"AI-Agent-Workspace\\/**"', EM), '8.1', '/ written \\/')
T('text-uppercase-hex.txt', sub(b'"a test 1.0"', b'"a\\u001F"', EM), '8.1', 'uppercase hex in a \\u escape')
T('text-tab-as-u.txt', sub(b'"a test 1.0"', b'"a\\u0009"', EM), '8.1', 'a tab written \\u0009, not \\t')
T('text-raw-control.txt', sub(b'"a test 1.0"', b'"a\x01"', EM), '8.1', 'a control character written raw')
T('text-surrogate-pair-escape.txt', sub('\U0001F600'.encode(), b'\\ud83d\\ude00'), '8.1',
  'a code point above U+FFFF written as a pair of \\u escapes')
T('text-lone-surrogate.txt', sub(b'"a test 1.0"', b'"a\\ud800"', EM), '2.2', 'a lone surrogate')
T('text-false-mark.txt', sub(b',"promise":true}', b',"promise":true,"array":false}'), '8', 'false for an absent mark')
T('text-true-string.txt', sub(b'"promise":true', b'"promise":"true"'), '8', 'a mark written as a string')
T('text-member-order.txt', sub(b'{"name":"Widget","slug":"widget","kind":"class"',
                               b'{"slug":"widget","name":"Widget","kind":"class"'), '8', 'members in another order')
T('text-member-twice.txt', sub(b'{"name":"Widget","slug":"widget"',
                               b'{"name":"Widget","name":"Widget","slug":"widget"'), '8', 'a member written twice')
T('text-member-unknown.txt', sub(b'"kind":"class",', b'"kind":"class","colour":"red",'), '8',
  'a member the line does not have')
T('text-member-missing.txt', sub(b'"kind":"class","flags":[],', b'"kind":"class",'), '8',
  'an always-present member left out')
T('text-null-for-absent.txt', sub(b'{"name":"Thing (interface)","kind"', b'{"name":"Thing (interface)","slug":null,"kind"'),
  '8', 'null for an absent member')
T('text-source-line-string.txt', sub(b'"line":3', b'"line":"3"'), '8', 'a number written as a string')
T('text-no-end.txt', EM[:EM.rindex(b'[null,"end"')], '8', 'no end line')
T('text-after-end.txt', EM + b'[null,"scanner","x"]\n', '8', 'a line after the end')
T('text-end-count.txt', sub(b'[null,"end",3]', b'[null,"end",2]'), '8', 'an end count other than the files')
T('text-version-2.txt', sub(b'"fact-pack",1]', b'"fact-pack",2]', EM), '4.1', 'version 2')
T('text-format-name.txt', sub(b'"fact-pack"', b'"fact-park"', EM), '8', 'another format name')
T('text-no-location.txt', EM.replace(b'[null,"location",".mdmd","layer-4",".mdmd.md"]\n', b''), '8',
  'no location line')
T('text-object-line.txt', sub(b'[null,"end",0]', b'{"end":0}', EM), '8', 'a line that is an object')
T('text-deep-nesting.txt', F + b'[' * 100000 + b']' * 100000 + b'\n', '8', 'an array nested 100000 deep')
T('text-left-out-after-file.txt', F + FILE_A + b'[null,"left-out","r",1,"d"]\n[null,"end",1]\n', '8',
  'a left-out line after a file')
T('text-unknown-kind.txt', F + FILE_A + b'["a","comment","x"]\n[null,"end",1]\n', '8', 'a line of an unknown kind')
T('text-no-authored.txt', F + b'["a","file",0,null,null]\n[null,"end",1]\n', '8', 'a file without its authored line')
T('text-two-authored.txt', F + FILE_A + b'["a","authored",""]\n[null,"end",1]\n', '8', 'two authored lines')
T('text-two-file-lines.txt', F + b'["a","file",0,null,null]\n' + FILE_A + b'[null,"end",1]\n', '8',
  'a file line twice for one path')
T('text-cited-twice.txt', F + FILE_A + b'["a","cited-by",[]]\n["a","cited-by",[]]\n[null,"end",1]\n', '8',
  'two cited-by lines')
T('text-dep-before-symbol.txt',
  F + FILE_A + b'["a","dependency",{"label":"x","qualifiers":[]}]\n'
  b'["a","symbol",{"name":"n","kind":"k","flags":[],"references":[],"sections":[],"documentation":[]}]\n'
  b'[null,"end",1]\n', '8', 'a dependency line before a symbol line')
T('text-reexports-before-cited.txt', F + FILE_A + b'["a","re-exports",[]]\n["a","cited-by",[]]\n[null,"end",1]\n', '8',
  're-exports before cited-by')
T('text-line-of-other-file.txt', F + FILE_A + b'["b","authored",""]\n[null,"end",1]\n', '8',
  'a line whose path is not its file')
T('text-path-order.txt', F + b'["b","file",0,null,null]\n["b","authored",""]\n' + FILE_A + b'[null,"end",2]\n',
  '2.3', 'files out of path order')
T('text-path-repeat.txt', F + FILE_A + FILE_A + b'[null,"end",2]\n', '4.3', 'a path repeated')
T('text-path-utf16-order.txt',
  F + '["\U00010000","file",0,null,null]\n["\U00010000","authored",""]\n["￿","file",0,null,null]\n'
  '["￿","authored",""]\n[null,"end",2]\n'.encode(), '2.3', 'files in UTF-16 code unit order')
T('text-path-absolute.txt', ONE_A.replace(b'["a"', b'["/a"'), '2.4', 'an absolute file path')
T('text-path-drive.txt', ONE_A.replace(b'["a"', b'["c:dir/x.ts"'), '2.4', 'a file path that begins with a drive')
T('text-path-trailing-slash.txt', ONE_A.replace(b'["a"', b'["a/"'), '2.4', 'a file path with an empty segment')
T('text-path-nul.txt', ONE_A.replace(b'["a"', b'["a\\u0000"'), '2.4', 'a file path holding U+0000')
T('text-path-null.txt', ONE_A.replace(b'["a","file"', b'[null,"file"'), '8', 'a file line with a null path')
T('text-root-absolute.txt', sub(b'".mdmd","layer-4"', b'"/mdmd","layer-4"', EM), '2.4', 'an absolute root')
T('text-ext-slash.txt', sub(b'".mdmd.md"]', b'".md/md"]', EM), '4.1', 'an extension holding /')
T('text-reason-word.txt', sub(b'"reason":"tooling"', b'"reason":"Tooling"'), '4.3', 'an entry reason not a word of 4.3')
T('text-role-word.txt', sub(b'"role":"Extends"', b'"role":"extends"'), '4.3', 'a role in the wrong case')
T('text-target-without-link.txt', sub(b'{"name":"Item","link":"b.ts.mdmd.md","target"', b'{"name":"Item","target"'),
  '8', 'a target without a link')
T('text-anchor-without-target.txt', sub(b'{"name":"Unlinked"}', b'{"name":"Unlinked","anchor":"x"}'), '8',
  'an anchor without a target')
T('text-link-absolute.txt', sub(b'"link":"../../README.md"', b'"link":"/README.md"'), '2.4', 'an absolute link')
T('text-link-file.txt', sub(b'"link":"b.ts.mdmd.md#widget"', b'"link":"File:b.ts.mdmd.md#widget"'), '2.4',
  'a link that begins with file:')
T('text-target-dotdot.txt', sub(b'"target":"src/gone.ts"', b'"target":"../gone.ts"'), '2.4', 'a target with a .. segment')
T('text-symbol-no-name.txt', sub(b'"symbol":{"name":"main","link":"#main"}', b'"symbol":{"link":"#main"}'), '8',
  'an entry symbol without its name')
T('text-declarer-no-link.txt', sub(b',"link":"../package.json.mdmd.md"}', b'}'), '8', 'a declarer without its link')
T('text-file-line-short.txt', sub(b'["src/c.ts","file",4,null,null]', b'["src/c.ts","file",4,null]'), '8',
  'a file line missing its generatedAt')
T('text-params-as-types.txt', sub(b'{"role":"Parameters","parameters":[', b'{"role":"Parameters","types":['), '8',
  'a Parameters reference written with types')

with open(os.path.join(OUT, 'CASES.tsv'), 'w') as f:
    for c in CASES:
        f.write('\t'.join(c) + '\n')
print(len(CASES), 'cases written to', OUT)

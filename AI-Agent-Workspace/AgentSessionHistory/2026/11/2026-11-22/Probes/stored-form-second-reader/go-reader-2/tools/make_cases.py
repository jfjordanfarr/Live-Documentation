# Builds the refusal cases (tests/binary/*.fpk, tests/text/*.txt) and the
# list of what each must be refused for (tests/expected.tsv).
import os, sys, struct, hashlib
sys.path.insert(0, os.path.dirname(__file__))
from fpklib import *

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BD = os.path.join(HERE, 'tests', 'binary'); TD = os.path.join(HERE, 'tests', 'text')
os.makedirs(BD, exist_ok=True); os.makedirs(TD, exist_ok=True)
expected = []

def head(version=1, root='.mdmd', base='layer-4', ext='.mdmd.md', scanner='t', left=()):
    b = bytes([version]) + text(root) + text(base) + text(ext) + text(scanner) + uv(len(left))
    for r, n, d in left: b += text(r) + uv(n) + text(d)
    return b

def strings(ss):
    return b''.join(text(s) for s in ss)

def rec(path, authored, mark=0, rest=b'', entries=b'\x00', symbols=b'\x00', deps=b'\x00', layer=4, pre=b'', mid=b''):
    return uv(path) + uv(layer) + uv(mark) + pre + entries + mid + uv(authored) + symbols + deps + rest

def paths(ps):
    out = b''; prev = b''
    for p in ps:
        p = p.encode() if isinstance(p, str) else p
        sh = 0
        while sh < len(prev) and sh < len(p) and prev[sh] == p[sh]: sh += 1
        out += uv(sh) + uv(len(p) - sh) + p[sh:]; prev = p
    return out

def wires(ws):
    out = b''
    for w in ws:
        out += uv(len(w))
        for i, x in enumerate(w): out += uv(x if i == 0 else x - w[i-1] - 1)
    return out

def scan(strs, recs, ps, ws, hd=None):
    fr = [[1, 0, hd if hd is not None else head()]]
    if strs: fr.append([2, len(strs), strings(strs)])
    fr.append([3, len(recs), b''.join(recs)])
    fr += [[4, len(ps), paths(ps)], [5, len(ps), wires(ws)], [6, 0, b'']]
    return fr

# a valid two-file scan: a.ts depends on b.ts by a link with a target
def good_frames():
    strs = ['a.ts', '', 'b', 'b.ts.md', 'b.ts']
    dep = uv(1) + uv(2) + uv(3) + uv(3) + uv(4) + uv(0)
    return scan(strs, [rec(0, 1, deps=dep), rec(4, 1)], ['a.ts', 'b.ts'], [[1], []])

def case(name, data, why):
    open(os.path.join(BD, name + '.fpk'), 'wb').write(data)
    expected.append(('read', 'tests/binary/' + name + '.fpk', why))

def fcase(name, frames, why):
    case(name, pack(frames), why)

open(os.path.join(HERE, 'tests', 'good-two-files.fpk'), 'wb').write(pack(good_frames()))

# --- signature and frames (3.1, 3.2, 3.3, 3.5)
G = pack(good_frames())
case('empty-file', b'', 'signature')
case('bad-signature', b'\x89FPK\r\n\n\n' + G[8:], 'signature')
case('signature-only', SIG, 'unfinished')
case('header-cut-short', G[:8+30], 'unfinished')
case('stops-before-end', G[:len(G) - 45 - 34], 'unfinished')
case('stored-past-end', G[:-3], 'unfinished')
case('byte-after-end', G + b'\x00', 'follow the end frame')
def tamper_header(data, idx, field, value):
    d = bytearray(data); p = 8
    for i in range(idx):
        s = struct.unpack_from('<I', d, p+9)[0]; p += 45 + s
    off = {'kind': 0, 'count': 1, 'raw': 5, 'stored': 9}[field]
    if field == 'kind': d[p] = value
    else: struct.pack_into('<I', d, p+off, value)
    return bytes(d)
case('kind-0', tamper_header(G, 1, 'kind', 0), 'not a kind')
case('kind-7', tamper_header(G, 1, 'kind', 7), 'not a kind')
case('raw-over-max-section', tamper_header(G, 1, 'raw', 67108865), 'MAX_SECTION')
case('raw-over-deflate-ratio', SIG + frame(1, 0, head()) + frame(2, 1, b'', stored=b'\x03\x00', rawlen=4000), 'most raw deflate can give')
d = SIG + frame(1, 0, head())
for i in range(3): d += frame(2, 1, b'', stored=b'\x00' * 1000, rawlen=1000000)
case('total-inflation-bound', d, 'sections together would inflate')
fr = good_frames(); fr[0][1] = 1; fcase('head-count-not-0', fr, "head frame's count")
fr = good_frames(); fr.insert(0, fr.pop(1)); fcase('strings-first', fr, 'head must come first')
fr = good_frames(); fr.insert(1, [2, 1, strings(['zz'])]); fcase('strings-before-strings', fr, 'not immediately before a records')
fr = good_frames(); fr[1][1] = 0; fr[1][2] = b''; fcase('strings-count-0', fr, 'holds no strings')
fr = good_frames(); fr[2][1] = 0; fcase('records-count-0', fr, 'must hold 1 to 256')
fr = good_frames(); fr[2][1] = 257; fcase('records-count-257', fr, 'must hold 1 to 256')
fr = good_frames(); r = fr[2][2]; fr[2:3] = [[3, 1, r[:12]], [3, 1, r[12:]]]; fcase('short-records-not-last', fr, 'only the last may hold fewer')
fr = good_frames(); fr[3][1] = 3; fcase('paths-count-wrong', fr, "paths frame's count")
fr = good_frames(); fr[4][1] = 1; fcase('wires-count-wrong', fr, "wires frame's count")
fr = good_frames(); del fr[3]; fcase('no-paths-frame', fr, 'where the paths frame is due')
fr = good_frames(); fr[3], fr[4] = fr[4], fr[3]; fcase('wires-before-paths', fr, 'where the paths frame is due')
fcase('head-then-end', [[1, 0, head()], [6, 0, b'']], 'where the paths frame is due')
fr = good_frames(); fr.insert(1, [1, 0, head()]); fcase('two-heads', fr, 'where the paths frame is due')
def with_end(frames, count=None, raw=None, h=None):
    out = bytearray(SIG); hs = []
    for k, c, r in frames[:-1]:
        hs.append(hashlib.sha256(r).digest()); out += frame(k, c, r)
    name = hashlib.sha256(b''.join(hs)).digest()
    raw = name if raw is None else raw
    out += frame(6, len(hs) if count is None else count, raw, h=h)
    return bytes(out)
case('end-count-wrong', with_end(good_frames(), count=4), "end frame's count")
case('end-rawlength-not-32', with_end(good_frames(), raw=b'\x00' * 33), 'must be 32')
case('end-wrong-name', with_end(good_frames(), raw=b'\x00' * 32), "content's name")
nm = hashlib.sha256(b''.join(hashlib.sha256(f[2]).digest() for f in good_frames()[:-1])).digest()
case('end-content-not-name', with_end(good_frames(), raw=b'\x01' * 32, h=hashlib.sha256(nm).digest()), 'SHA-256 of the inflated')
# --- deflate and hashes (3.2)
def raw_frames_file(fr, idx, stored=None, rawlen=None, h=None):
    out = bytearray(SIG); hs = []
    for i, (k, c, r) in enumerate(fr[:-1]):
        hh = hashlib.sha256(r).digest()
        if i == idx:
            if h is not None: hh = h
            out += frame(k, c, r, stored=stored, rawlen=rawlen, h=hh)
        else:
            out += frame(k, c, r)
        hs.append(hh)
    out += frame(6, len(hs), hashlib.sha256(b''.join(hs)).digest())
    return bytes(out)
fr = good_frames()
case('section-hash-wrong', raw_frames_file(fr, 1, h=b'\x00' * 32), "not the header's hash")
case('deflate-garbage', raw_frames_file(fr, 1, stored=b'\xff\xff\xff\xff'), 'deflate')
case('inflates-short', raw_frames_file(fr, 1, rawlen=len(fr[1][2]) + 1), 'do not inflate to rawLength')
case('inflates-long', raw_frames_file(fr, 1, rawlen=len(fr[1][2]) - 1), 'more than rawLength')
case('byte-after-deflate-stream', raw_frames_file(fr, 1, stored=deflate(fr[1][2]) + b'\x00'), 'follow the end of the deflate stream')
case('deflate-cut-short', raw_frames_file(fr, 1, stored=deflate(fr[1][2])[:-1]), 'deflate')
st = b'\x00' + struct.pack('<HH', len(fr[1][2]), 0xffff ^ len(fr[1][2])) + fr[1][2]
case('deflate-no-final-block', raw_frames_file(fr, 1, stored=st), 'deflate')
# --- the head (4.1) and varints (2.1)
fr = good_frames(); fr[0][2] = head(version=2); fcase('head-version-2', fr, 'version is 2')
fr = good_frames(); fr[0][2] = head(root='/abs'); fcase('head-root-absolute', fr, 'root is not a folder')
fr = good_frames(); fr[0][2] = head(base='a/../b'); fcase('head-baselayer-dotdot', fr, 'baseLayer is not a folder')
fr = good_frames(); fr[0][2] = head(root='C:x'); fcase('head-root-drive', fr, 'root is not a folder')
fr = good_frames(); fr[0][2] = head(ext='.md/x'); fcase('head-extension-slash', fr, 'extension')
fr = good_frames(); fr[0][2] = head(ext='.md\\x'); fcase('head-extension-backslash', fr, 'extension')
fr = good_frames(); fr[0][2] = head(ext='.md\x00'); fcase('head-extension-nul', fr, 'extension')
fr = good_frames(); fr[0][2] = head(scanner=b'\xc0\x80'); fcase('head-overlong-utf8', fr, 'UTF-8')
fr = good_frames(); fr[0][2] = head() + b'\x00'; fcase('head-trailing-byte', fr, 'follow its last item')
fr = good_frames(); fr[0][2] = head()[:-1] + uv(100); fcase('head-left-out-count-too-big', fr, 'count of 100')
fr = good_frames(); fr[0][2] = head()[:-1] + b'\x80\x00'; fcase('varint-not-shortest', fr, 'shortest form')
fr = good_frames(); fr[0][2] = head()[:-1] + b'\xff\xff\xff\xff\x1f'; fcase('varint-above-2-32', fr, 'above 2^32')
fr = good_frames(); fr[0][2] = head()[:-1] + b'\x80\x80\x80\x80\x80\x00'; fcase('varint-sixth-byte', fr, 'sixth byte')
fr = good_frames(); fr[0][2] = head()[:-1] + b'\x81'; fcase('varint-cut-short', fr, 'cut short')
# --- strings (2.2, 4.2)
def with_strings(ss, name, why):
    fr = good_frames(); fr[1] = [2, len(ss), b''.join(text(s) if isinstance(s, str) else uv(len(s)) + s for s in ss)]
    fcase(name, fr, why)
base = ['a.ts', '', 'b', 'b.ts.md', 'b.ts']
with_strings(base + ['b'], 'string-twice', 'appears twice')
with_strings(base[:2] + [b'\xc0\xaf'] + base[3:], 'utf8-overlong', 'UTF-8')
with_strings(base[:2] + [b'\xed\xa0\x80'] + base[3:], 'utf8-surrogate', 'UTF-8')
with_strings(base[:2] + [b'\xf4\x90\x80\x80'] + base[3:], 'utf8-above-10ffff', 'UTF-8')
with_strings(base[:2] + [b'\x80'] + base[3:], 'utf8-lone-continuation', 'UTF-8')
with_strings(base[:2] + [b'\xe2\x82'] + base[3:], 'utf8-cut-short', 'UTF-8')
with_strings(base[:2] + [b'\xff'] + base[3:], 'utf8-ff-byte', 'UTF-8')
with_strings(base + ['never-named'], 'string-not-met', 'not met')
fr = good_frames(); fr[1][2] += b'\x00'; fcase('strings-trailing-byte', fr, 'follow its last item')
fr = good_frames(); fr[1][1] = 6; fcase('strings-count-too-big', fr, 'cut short')
# --- records (4.3)
def recs(r1, r2=None, ss=None, ps=None, ws=None):
    strs = ss if ss is not None else ['a.ts', '', 'b', 'b.ts.md', 'b.ts']
    r2 = r2 if r2 is not None else rec(4, 1)
    return scan(strs, [r1, r2], ps or ['a.ts', 'b.ts'], ws if ws is not None else [[], []])
dep = lambda m, *s: uv(1) + uv(2) + uv(m) + b''.join(uv(x) for x in s) + uv(0)
R1 = rec(0, 1, deps=dep(1, 3))
sym = lambda refs: uv(1) + uv(2) + uv(0) + uv(3) + uv(0) + refs + uv(0) + uv(0)
fcase('sid-out-of-order', recs(rec(0, 1, deps=uv(1) + uv(3) + uv(1) + uv(2) + uv(0)), ws=[[1], []]), 'first-met order')
fcase('sid-not-set-down', recs(rec(0, 1, deps=dep(1, 3)), rec(4, 1), ss=['a.ts', '', 'b', 'b.ts.md']), 'no strings section before it sets down')
fcase('file-mark-bit-4', recs(rec(0, 1, mark=16)), 'does not define')
fcase('dependency-mark-bit-4', recs(rec(0, 1, deps=dep(16))), 'does not define')
fcase('target-without-link', recs(rec(0, 1, deps=dep(2, 3, 4)), ws=[[1], []]), 'target without a link')
fcase('anchor-without-target', recs(rec(0, 1, deps=dep(5, 3, 4))), 'anchor without a target')
fcase('entry-link-without-name', recs(rec(0, 1, entries=uv(1) + uv(0) + uv(2) + uv(2))), 'without bit 0')
fcase('entry-reason-6', recs(rec(0, 1, entries=uv(1) + uv(6) + uv(0))), 'reason 6')
fcase('reference-role-5', recs(rec(0, 1, symbols=sym(uv(1) + uv(5) + uv(0)))), 'role 5')
fcase('symbol-mark-bit-2', recs(rec(0, 1, symbols=uv(1) + uv(2) + uv(4) + uv(3) + uv(0) * 4)), 'does not define')
fcase('type-mark-bit-5', recs(rec(0, 1, symbols=sym(uv(1) + uv(0) + uv(1) + uv(2) + uv(32)))), 'does not define')
fcase('records-trailing-byte', [f if f[0] != 3 else [3, 2, f[2] + b'\x00'] for f in recs(R1)], 'follow its last item')
fcase('records-count-too-big', recs(rec(0, 1, symbols=uv(200))), 'count of 200')
fcase('record-path-differs', recs(R1, ps=['a.ts', 'b.tt']), 'not the paths section')
fcase('wires-not-records', recs(rec(0, 1), ws=[[1], []]), 'not the other scanned files its links land on')
fcase('wires-missing-a-link', recs(rec(0, 1, deps=dep(3, 3, 4)), ws=[[], []]), 'not the other scanned files its links land on')
fcase('target-empty', recs(rec(0, 1, deps=dep(3, 3, 1))), 'is empty')
for nm, p, why in [('slash', '/a', 'begins with /'), ('backslash', '\\a', 'begins with /'),
                   ('drive', 'c:dir/x.ts', 'drive'), ('file-scheme', 'FiLe:x', 'file:'), ('nul', 'a\x00b', 'U+0000'),
                   ('empty-segment', 'a//b', 'empty segment'), ('dot', 'a/./b', "'.' segment"),
                   ('dotdot', 'a/..', "'..' segment"), ('trailing-slash', 'a/', 'empty segment')]:
    fcase('target-' + nm, recs(rec(0, 1, deps=dep(3, 3, 2)), ss=['a.ts', '', p, 'b.ts.md', 'b.ts']), why)
for nm, l, why in [('link-slash', '/etc/x', 'begins with /'), ('link-backslash', '\\\\srv\\x', 'begins with /'),
                   ('link-drive', 'c:foo', 'drive'), ('link-file-scheme', 'FILE:///x', 'file:')]:
    fcase(nm, recs(rec(0, 1, deps=dep(1, 3)), ss=['a.ts', '', 'b', l, 'b.ts']), why)
fcase('source-link-absolute', recs(rec(0, 1, symbols=uv(1) + uv(2) + uv(2) + uv(3) + uv(0) + uv(3) + uv(7) + uv(0) * 3), ss=['a.ts', '', 'b', '/abs', 'b.ts']), 'sourcePath')
fcase('cited-by-link-drive', recs(rec(0, 1, mark=4, rest=uv(1) + uv(2) + uv(3)), ss=['a.ts', '', 'b', 'C:/x', 'b.ts']), 'drive')
# --- paths (4.4)
def ppaths(raw, name, why):
    fr = recs(R1); fr[3][2] = raw; fcase(name, fr, why)
ppaths(uv(0) + uv(4) + b'a.ts' + uv(5) + uv(0), 'paths-shared-too-long', 'shares 5 bytes')
ppaths(uv(0) + uv(4) + b'a.ts' + uv(1) + uv(3) + b'.ts', 'paths-not-longest-shared', 'longest beginning')
ppaths(uv(0) + uv(4) + b'a.ts' + uv(4) + uv(1) + b'x', 'paths-prefix-path-differs', 'not the paths section')
ppaths(uv(0) + uv(60) + b'a' * 60 + uv(60) + uv(1) + b'b', 'paths-over-strings-budget', "strings frames' raw lengths")
ppaths(paths(['a.ts', 'b.ts']) + b'\x00', 'paths-trailing-byte', 'follow its last item')
ppaths(uv(0) + uv(4) + b'a.ts' + uv(0) + uv(4) + b'\xff.ts', 'paths-bad-utf8', 'UTF-8')
fcase('paths-out-of-order', scan(['b.ts', '', 'a.ts'], [rec(0, 1), rec(2, 1)], ['b.ts', 'a.ts'], [[], []]), 'strict path order')
fcase('paths-repeated', scan(['a.ts', '', 'padding'], [rec(0, 1), rec(0, 1)], ['a.ts', 'a.ts'], [[], []]), 'strict path order')
fcase('paths-absolute', scan(['/a.ts', ''], [rec(0, 1)], ['/a.ts'], [[]]), 'not a path')
fcase('paths-dotdot', scan(['../a.ts', ''], [rec(0, 1)], ['../a.ts'], [[]]), 'not a path')
# --- wires (4.5)
def pw(raw, name, why):
    fr = recs(R1); fr[4][2] = raw; fcase(name, fr, why)
pw(wires([[0], []]), 'wire-to-itself', 'wire to itself')
pw(wires([[2], []]), 'wire-past-files', 'the scan has 2 files')
pw(uv(2) + uv(1) + uv(0) + uv(0), 'wire-gap-past-files', 'the scan has 2 files')
pw(wires([[], []]) + b'\x00', 'wires-trailing-byte', 'follow its last item')
pw(uv(9) + uv(0), 'wires-count-too-big', 'count of 9')

# --- the text bound (3.5): valid, but its text is refused; graph and name still given
ndeps = 2200
deps = uv(ndeps) + (uv(2) + uv(0) + uv(0)) * ndeps
open(os.path.join(HERE, 'tests', 'valid-past-text-bound.fpk'), 'wb').write(
    pack(scan(['a.ts', '', 'x' * 32768], [rec(0, 1, deps=deps)], ['a.ts'], [[]])))
expected.append(('read', 'tests/valid-past-text-bound.fpk', 'the text is not offered, though the file is valid'))

# --- text-form refusals (section 8), made from the every-fact sample
T = open(os.path.join(HERE, 'made-every-fact.txt'), 'rb').read()
L = T.split(b'\n')[:-1]
def tcase(name, data, why):
    open(os.path.join(TD, name + '.txt'), 'wb').write(data)
    expected.append(('name', 'tests/text/' + name + '.txt', why))
def lines(ls): return b''.join(l + b'\n' for l in ls)
def repl(i, old, new):
    ls = list(L); assert old in ls[i], (i, old); ls[i] = ls[i].replace(old, new, 1); return lines(ls)
tcase('empty', b'', 'empty')
tcase('bom', b'\xef\xbb\xbf' + T, 'byte-order mark')
tcase('crlf', T.replace(b'\n', b'\r\n'), 'CR')
tcase('no-final-lf', T[:-1], 'LF')
tcase('bad-utf8', repl(2, b'a test', b'a \xc0\xaf'), 'UTF-8')
tcase('no-end-line', lines(L[:-1]), 'no end line')
tcase('line-after-end', T + b'[null,"end",3]\n', 'after the end line')
tcase('end-count-wrong', repl(len(L)-1, b'3]', b'2]'), 'counts 2 files')
tcase('space-outside-string', repl(0, b',"format"', b', "format"'), 'whitespace')
tcase('number-4.0', repl(4, b',4,', b',4.0,'), 'decimal point')
tcase('number-4e0', repl(4, b',4,', b',4e0,'), 'exponent')
tcase('number-leading-zero', repl(4, b',4,', b',04,'), 'leading zero')
tcase('number-negative', repl(4, b',4,', b',-4,'), 'sign')
tcase('number-too-big', repl(4, b',4,', b',4294967296,'), 'above 2^32')
tcase('letter-u-escape', repl(2, b'a test', b'\\u0061 test'), 'escape')
tcase('uppercase-u-escape', repl(2, b'a test', b'a\\u001F test'), 'uppercase')
tcase('slash-escape', repl(1, b'.mdmd.md"]', b'.mdmd\\/md"]'), '\\/')
tcase('surrogate-pair-escape', repl(2, b'a test', b'\\ud83d\\ude00'), 'escape')
tcase('tab-as-u-escape', repl(2, b'a test', b'a\\u0009test'), 'escape')
tcase('raw-control-char', repl(2, b'a test', b'a\x01test'), 'control character')
tcase('false-for-absent', repl(9, b'"promise":true', b'"promise":false'), 'never written false')
tcase('member-twice', repl(6, b'{"reason":"program",', b'{"reason":"program","reason":"program",'), 'written twice')
tcase('member-unknown', repl(8, b'{"reason":"tooling"}', b'{"reason":"tooling","extra":1}'), 'does not have')
tcase('members-out-of-order', repl(11, b'{"label":"src/b.ts","link":"b.ts.mdmd.md"', b'{"link":"b.ts.mdmd.md","label":"src/b.ts"'), 'one form')
tcase('member-missing', repl(10, b',"flags":[]', b''), 'always present')
tcase('line-order-symbol-before-entry', lines(L[:8] + [L[9], L[8]] + L[10:]), 'out of its place')
tcase('authored-missing', lines(L[:5] + L[6:]), 'authored')
tcase('two-cited-by', lines(L[:15] + [L[14]] + L[15:]), 'out of its place')
tcase('unknown-kind', lines(L[:5] + [b'["src/a.ts","comment","x"]'] + L[5:]), 'does not have')
tcase('path-mismatch-line', repl(5, b'["src/a.ts","authored"', b'["src/z.ts","authored"'), 'path is not that of')
tcase('files-out-of-order', lines(L[:4] + L[15:20] + L[4:15] + L[20:]), 'strict path order')
tcase('file-repeated', lines(L[:15] + [L[4], L[5]] + L[15:]).replace(b'[null,"end",3]', b'[null,"end",4]'), 'strict path order')
tcase('version-2', repl(0, b'1]', b'2]'), 'version is 2')
tcase('format-name', repl(0, b'fact-pack', b'fact-pak'), 'fact-pak')
tcase('head-order', lines([L[1], L[0]] + L[2:]), 'format line is due')
tcase('left-out-after-files', lines(L[:3] + L[4:20] + [L[3]] + L[20:]), 'after the files began')
tcase('reason-unknown', repl(8, b'"tooling"', b'"tools"'), 'words of section 4.3')
tcase('role-lowercase', repl(9, b'"Returns"', b'"returns"'), 'words of section 4.3')
tcase('target-without-link', repl(18, b'"link":"a.ts.mdmd.md","target"', b'"target"'), 'target without a link')
tcase('anchor-without-target', repl(9, b'"target":"src/b.ts","anchor":"widget","promise"', b'"anchor":"widget","promise"'), 'anchor without a target')
tcase('absolute-path', T.replace(b'["src/b.ts"', b'["/src/b.ts"'), 'not a path')
tcase('absolute-link', repl(13, b'"link":"../../../outside.md"', b'"link":"/outside.md"'), 'begins with /')
tcase('drive-link', repl(13, b'"link":"../../../outside.md"', b'"link":"c:outside.md"'), 'drive')
tcase('file-link', repl(13, b'"link":"../../../outside.md"', b'"link":"File:outside.md"'), 'file:')
tcase('target-dotdot', repl(11, b'"target":"src/b.ts"', b'"target":"src/../b.ts"'), "'..' segment")
tcase('root-absolute', repl(1, b'".mdmd"', b'"/mdmd"'), 'root is not a folder')
tcase('extension-slash', repl(1, b'".mdmd.md"', b'"/.md"'), 'extension')
tcase('file-line-too-short', repl(15, b',null,null]', b',null]'), 'file line is')
tcase('nesting-too-deep', lines(L[:5] + [b'["src/a.ts","authored",' + b'[' * 100 + b']' * 100 + b']'] + L[6:]), 'nest deeper')
tcase('archetype-number', repl(4, b'"implementation"', b'7'), 'not a string')
tcase('true-as-string', repl(9, b'"promise":true', b'"promise":"true"'), 'never written false')
tcase('format-line-path', repl(0, b'[null,', b'["x",'), 'not null')

with open(os.path.join(HERE, 'tests', 'expected.tsv'), 'w') as f:
    for m, p, why in expected: f.write(f'{m}\t{p}\t{why}\n')
print(len(expected), 'cases')

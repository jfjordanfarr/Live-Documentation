#!/usr/bin/env python3
"""Reader of the stored form of a scan's facts (specification.md).

    reader.py read  <file>   print the text form (section 8) of a binary file
    reader.py name  <file>   print the content's name (section 3.4) of a text form
    reader.py graph <file>   print the graph (section 5) of a binary file as JSON

Anything that is not valid is answered with one line beginning "refused:".
Python standard library only.
"""

import hashlib
import io
import json
import re
import struct
import sys
import zlib
from array import array

SIGNATURE = b'\x89FPK\r\n\x1a\n'            # section 3.1
HEADER = 45                                  # section 3.2
MAX_SECTION = 67108864                       # section 3.5
U32 = 0xFFFFFFFF                             # section 2.1
HEAD, STRINGS, RECORDS, PATHS, WIRES, END = 1, 2, 3, 4, 5, 6
KIND_NAMES = {1: 'head', 2: 'strings', 3: 'records', 4: 'paths', 5: 'wires', 6: 'end'}
REASONS = ('program', 'command', 'module', 'opening', 'tooling', 'declared')        # 4.3
ROLES = ('Returns', 'Extends', 'Implements', 'Constraints', 'Parameters')         # 4.3
EDGE_KINDS = ('returns', 'extends', 'implements', 'constraint', 'parameter')     # 5
ASCII_LETTERS = frozenset('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')


class Refused(Exception):
    pass


def refuse(why):
    raise Refused(why)


# ---------------------------------------------------------------- section 8.1

_ESC_RE = re.compile('[\x00-\x1f"\\\\]')
_ESC = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r'}
for _c in range(0x20):
    _ESC.setdefault(chr(_c), '\\u%04x' % _c)


def jstr(s):
    """A string written as section 8.1 writes it, as UTF-8 bytes."""
    if _ESC_RE.search(s):
        s = _ESC_RE.sub(lambda m: _ESC[m.group()], s)
    return b'"' + s.encode('utf-8') + b'"'


def jnum(n):
    return str(n).encode('ascii')


REASONS_J = tuple(jstr(r) for r in REASONS)
ROLES_J = tuple(jstr(r) for r in ROLES)
EDGE_KINDS_J = tuple(jstr(k) for k in EDGE_KINDS)


# ---------------------------------------------------------------- section 2.4

def path_problem(s):
    """Why the string s is not a path (section 2.4), or None."""
    if s == '':
        return 'is empty'
    if s[0] == '/' or s[0] == '\\':
        return 'begins with / or \\ (absolute)'
    if len(s) >= 2 and s[0] in ASCII_LETTERS and s[1] == ':':
        return 'begins with a drive letter and :'
    if s[:5].encode('utf-8').lower() == b'file:':
        return 'begins with file:'
    if '\x00' in s:
        return 'holds U+0000'
    for seg in s.split('/'):
        if seg == '' or seg == '.' or seg == '..':
            return 'has an empty, "." or ".." segment'
    return None


def link_problem(s):
    """Why the string s is not a link (section 2.4), or None."""
    if s == '':
        return None
    if s[0] == '/' or s[0] == '\\':
        return 'begins with / or \\ (absolute)'
    if len(s) >= 2 and s[0] in ASCII_LETTERS and s[1] == ':':
        return 'begins with a drive letter and :'
    if s[:5].encode('utf-8').lower() == b'file:':
        return 'begins with file:'
    return None


def folder_problem(s):
    return None if s == '' else path_problem(s)


def extension_problem(s):
    if '/' in s or '\\' in s or '\x00' in s:
        return 'holds /, \\ or U+0000'
    return None


# ---------------------------------------------------------------- section 2.1, 2.2

class Cur:
    """A cursor over one section's uncompressed bytes."""
    __slots__ = ('b', 'p', 'n', 'what')

    def __init__(self, b, what, p=0):
        self.b = b
        self.p = p
        self.n = len(b)
        self.what = what

    def bad(self, why):
        refuse('%s section, byte %d: %s' % (self.what, self.p, why))

    def u8(self):
        if self.p >= self.n:
            self.bad('ends where a byte was expected')
        v = self.b[self.p]
        self.p += 1
        return v

    def varint(self):
        b = self.b
        p = self.p
        if p >= self.n:
            self.bad('ends where a varint was expected (section 2.1)')
        c = b[p]
        p += 1
        if c < 0x80:
            self.p = p
            return c
        v = c & 0x7F
        shift = 7
        n = self.n
        while True:
            if p >= n:
                self.p = p
                self.bad('varint cut short (section 2.1)')
            c = b[p]
            p += 1
            if c == 0:
                self.p = p
                self.bad('varint not in its shortest form (section 2.1)')
            if shift == 28:
                if c & 0x80:
                    self.p = p
                    self.bad('varint longer than five bytes (section 2.1)')
                if c > 0x0F:
                    self.p = p
                    self.bad('varint above 2^32 - 1 (section 2.1)')
            v |= (c & 0x7F) << shift
            if c < 0x80:
                self.p = p
                return v
            shift += 7

    def count(self, least=1):
        c = self.varint()
        if c * least > self.n - self.p:
            self.bad('count %d larger than the bytes left (section 2.1)' % c)
        return c

    def take(self, k):
        if k > self.n - self.p:
            self.bad('length %d runs past the section (section 2.1)' % k)
        v = self.b[self.p:self.p + k]
        self.p += k
        return v

    def text(self):
        raw = self.take(self.varint())
        return decode(raw, self)

    def done(self):
        if self.p != self.n:
            self.bad('bytes after the section\'s last item (section 3.2)')


def decode(raw, cur=None):
    try:
        return raw.decode('utf-8')          # strict: refuses overlongs, surrogates, > U+10FFFF
    except UnicodeDecodeError as e:
        msg = 'a string is not well-formed UTF-8 (section 2.2): %s' % e.reason
        if cur is not None:
            cur.bad(msg)
        refuse(msg)


# ---------------------------------------------------------------- sections 3, 6: the container

class Frame:
    __slots__ = ('kind', 'count', 'raw', 'stored', 'hash', 'off')

    def __init__(self, kind, count, raw, stored, h, off):
        self.kind, self.count, self.raw, self.stored, self.hash, self.off = kind, count, raw, stored, h, off


def hop_frames(data):
    """Steps 1 and 2 of section 6."""
    size = len(data)
    if size < 8 or data[:8] != SIGNATURE:
        refuse('the file does not begin with the signature 89 46 50 4B 0D 0A 1A 0A (section 3.1)')
    bound = 64 * size + 1048576
    total = 0
    pos = 8
    frames = []
    while True:
        if pos == size:
            refuse('unfinished: the file stops before an end frame (section 3.3)')
        if size - pos < HEADER:
            refuse('unfinished: frame %d\'s header is cut short (section 3.3)' % len(frames))
        kind = data[pos]
        count, raw, stored = struct.unpack_from('<III', data, pos + 1)
        h = data[pos + 13:pos + 45]
        n = len(frames)
        if kind not in KIND_NAMES:
            refuse('frame %d has kind %d, which is not 1 to 6 (section 3.2)' % (n, kind))
        if raw > MAX_SECTION:
            refuse('frame %d\'s rawLength %d is above MAX_SECTION, 64 MiB (section 3.5)' % (n, raw))
        if raw > 1032 * stored + 1024:
            refuse('frame %d\'s rawLength %d is above 1032 x storedLength + 1024 (section 3.5)' % (n, raw))
        total += raw
        if total > bound:
            refuse('the sections together would inflate to more than 64 x file length + 1 MiB (section 3.5)')
        if stored > size - pos - HEADER:
            refuse('unfinished: frame %d\'s stored bytes run past the file\'s end (section 3.5)' % n)
        frames.append(Frame(kind, count, raw, stored, h, pos + HEADER))
        pos += HEADER + stored
        if kind == END:
            break
    if pos != size:
        refuse('bytes after the end frame (section 3.3)')
    return frames


def check_order(frames):
    """Step 3 of section 6: head (strings? records)* paths wires end, and the counts (section 3.3)."""
    kinds = [f.kind for f in frames]
    if kinds[0] != HEAD:
        refuse('the first frame is not the head (section 3.3)')
    if frames[0].count != 0:
        refuse('the head\'s count is not 0 (section 3.3)')
    if len(kinds) < 4 or kinds[-3] != PATHS or kinds[-2] != WIRES or kinds[-1] != END:
        refuse('the frames do not end with paths, wires and end (section 3.3)')
    files = 0
    last_records = None
    i = 1
    while i < len(kinds) - 3:
        k = kinds[i]
        if k == STRINGS:
            if kinds[i + 1] != RECORDS:
                refuse('frame %d: a strings frame not immediately before a records frame (section 3.3)' % i)
            if frames[i].count < 1:
                refuse('frame %d: a strings frame holds no string (section 3.3)' % i)
            if frames[i].count > frames[i].raw:
                refuse('frame %d: strings count exceeds its raw length (section 2.1)' % i)
        elif k == RECORDS:
            if last_records is not None and frames[last_records].count != 256:
                refuse('frame %d: a records frame other than the last holds %d files, not 256 (section 3.3)'
                       % (last_records, frames[last_records].count))
            c = frames[i].count
            if c < 1 or c > 256:
                refuse('frame %d: a records frame holds %d files, not 1 to 256 (section 3.3)' % (i, c))
            if c > frames[i].raw:
                refuse('frame %d: records count exceeds its raw length (section 2.1)' % i)
            files += c
            last_records = i
        else:
            refuse('frame %d: a %s frame out of order (section 3.3)' % (i, KIND_NAMES[k]))
        i += 1
    paths, wires, end = frames[-3], frames[-2], frames[-1]
    if paths.count != files:
        refuse('the paths frame\'s count %d is not the %d files of the records (section 3.3)' % (paths.count, files))
    if wires.count != files:
        refuse('the wires frame\'s count %d is not the %d files of the records (section 3.3)' % (wires.count, files))
    if 2 * paths.count > paths.raw:
        refuse('the paths count exceeds what its raw length can hold (section 2.1)')
    if wires.count > wires.raw:
        refuse('the wires count exceeds its raw length (section 2.1)')
    if end.count != len(frames) - 1:
        refuse('the end\'s count %d is not the %d frames before it (section 3.3)' % (end.count, len(frames) - 1))
    if end.raw != 32:
        refuse('the end\'s rawLength is not 32 (section 3.3)')


def inflate(data, f, n):
    """Inflate frame n, exactly to rawLength, and check its hash (section 3.2)."""
    what = 'frame %d (%s)' % (n, KIND_NAMES[f.kind])
    d = zlib.decompressobj(-15)
    try:
        out = d.decompress(data[f.off:f.off + f.stored], f.raw + 1)   # never more than rawLength + 1
    except zlib.error as e:
        refuse('%s: the deflate stream is refused by the inflater: %s (section 3.2)' % (what, e))
    if len(out) > f.raw:
        refuse('%s inflates to more than its rawLength (section 3.5)' % what)
    if not d.eof:
        refuse('%s: the deflate stream does not end (section 3.2)' % what)
    if d.unused_data:
        refuse('%s: bytes after the deflate stream\'s end (section 3.2)' % what)
    if len(out) != f.raw:
        refuse('%s inflates to %d bytes, not its rawLength %d (section 3.2)' % (what, len(out), f.raw))
    if hashlib.sha256(out).digest() != f.hash:
        refuse('%s: the SHA-256 of its uncompressed bytes is not its hash (section 3.2)' % what)
    return out


def open_file(data):
    """Steps 1 to 4 of section 6, then every section inflated and hash-checked."""
    frames = hop_frames(data)
    check_order(frames)
    name = hashlib.sha256(b''.join(f.hash for f in frames[:-1])).digest()
    end = frames[-1]
    if end.hash != hashlib.sha256(name).digest():
        refuse('the end\'s hash is not the SHA-256 of the content\'s name (section 3.4)')
    if inflate(data, end, len(frames) - 1) != name:
        refuse('the end does not hold the content\'s name (section 3.4)')
    sections = [None] * (len(frames) - 1)
    order = [0, len(frames) - 3, len(frames) - 2] + list(range(1, len(frames) - 3))   # head, paths, wires, rest
    for i in order:
        f = frames[i]
        sections[i] = (f.kind, f.count, inflate(data, f, i))
    strings_declared = sum(f.raw for f in frames if f.kind == STRINGS)
    return Scan(sections, strings_declared, name)


# ---------------------------------------------------------------- sections 4 and 6: the content

class Scan:
    def __init__(self, sections, strings_declared, name):
        """sections: (kind, count, raw) for every frame before the end, in order."""
        self.name = name
        for k, c, raw in sections:
            if len(raw) > MAX_SECTION:
                refuse('a section is longer than MAX_SECTION, 64 MiB (section 3.5)')
        self.read_head(sections[0][2])
        self.nfiles = sections[-2][1]
        self.read_paths(sections[-2][2], strings_declared)
        self.read_wires(sections[-1][2])
        self.body = sections[1:-2]
        self.strings = []
        self.ej = []          # each string as section 8.1 writes it, made after the whole read

    # -- 4.1
    def read_head(self, raw):
        c = Cur(raw, 'head')
        v = c.u8()
        if v != 1:
            refuse('the head\'s version is %d; this reader reads version 1 (section 4.1)' % v)
        self.root = c.text()
        self.base = c.text()
        self.ext = c.text()
        self.scanner = c.text()
        for what, s in (('root', self.root), ('baseLayer', self.base)):
            p = folder_problem(s)
            if p:
                refuse('the head\'s %s is not a folder: it %s (sections 2.4, 4.1)' % (what, p))
        p = extension_problem(self.ext)
        if p:
            refuse('the head\'s extension %s (section 4.1)' % p)
        n = c.count(3)
        self.left_out = []
        for _ in range(n):
            reason = c.text()
            number = c.varint()
            detail = c.text()
            self.left_out.append((reason, number, detail))
        c.done()

    # -- 4.4
    def read_paths(self, raw, strings_declared):
        c = Cur(raw, 'paths')
        n = self.nfiles
        prev = b''
        total = 0
        self.paths = []
        self.path_index = {}
        for i in range(n):
            shared = c.varint()
            rest_len = c.varint()
            if shared > len(prev):
                c.bad('path %d shares %d bytes of a path of %d (section 4.4)' % (i, shared, len(prev)))
            total += shared + rest_len
            if total > strings_declared:
                c.bad('the paths\' bytes exceed the strings frames\' raw lengths (section 4.4)')
            rest = c.take(rest_len)
            if rest and shared < len(prev) and rest[0] == prev[shared]:
                c.bad('path %d is not front-coded with its longest shared beginning (section 4.4)' % i)
            pb = prev[:shared] + rest
            s = decode(pb, c)
            p = path_problem(s)
            if p:
                c.bad('path %d is not a path: it %s (section 2.4)' % (i, p))
            if i and not prev < pb:
                c.bad('path %d is not after the one before it in path order (section 4.4)' % i)
            self.paths.append(s)
            self.path_index[s] = i
            prev = pb
        c.done()

    # -- 4.5
    def read_wires(self, raw):
        c = Cur(raw, 'wires')
        n = self.nfiles
        self.wires = []
        inbound = [[] for _ in range(n)]
        for i in range(n):
            k = c.count()
            ws = []
            if k:
                w = c.varint()
                while True:
                    if w >= n:
                        c.bad('file %d has a wire to file %d of %d (section 4.5)' % (i, w, n))
                    if w == i:
                        c.bad('file %d has a wire to itself (section 4.5)' % i)
                    ws.append(w)
                    inbound[w].append(i)
                    if len(ws) == k:
                        break
                    w = w + c.varint() + 1
            self.wires.append(ws)
        c.done()
        self.inbound = inbound

    # -- 4.2, 4.3, section 6 step 6
    def esc(self, sid):
        return self.ej[sid]

    def validate(self):
        """The whole read: every strings and records section, with every check (section 6, step 6)."""
        seen = set()
        strings = self.strings
        n = self.nfiles
        self.gen = array('q', [-1]) * n
        self.auth = array('q', [0]) * n
        self.rec_sec = array('q', [0]) * n
        self.sym_off = array('q', [0]) * n
        self.dep_off = array('q', [0]) * n
        self.has_doc = bytearray(n)
        self.doc_pairs = {}
        checker = Checker(self)
        index = 0
        for si, (kind, count, raw) in enumerate(self.body):
            what = '%s frame %d' % (KIND_NAMES[kind], si + 1)
            if kind == STRINGS:
                c = Cur(raw, what)
                for _ in range(count):
                    s = c.text()
                    if s in seen:
                        c.bad('a string appears twice (section 4.2)')
                    seen.add(s)
                    strings.append(s)
                c.done()
                continue
            for k in range(index, index + count):
                self.rec_sec[k] = si
            try:
                checker.section(raw, count, index, what)
            except At as e:
                refuse('%s section, byte %d: %s' % (what, e.p, e.why))
            index += count
        documented_by = [[] for _ in range(n)]
        for i in sorted(self.doc_pairs):
            for j in self.doc_pairs[i]:
                documented_by[j].append(i)
        self.documented_by = documented_by
        self.file_of = checker.file_of
        self.ej = [jstr(x) for x in strings]

    # -- section 8
    def write_text(self, out):
        w = out.write
        w(b'[null,"format","fact-pack",1]\n')
        w(b'[null,"location",' + jstr(self.root) + b',' + jstr(self.base) + b',' + jstr(self.ext) + b']\n')
        w(b'[null,"scanner",' + jstr(self.scanner) + b']\n')
        for reason, number, detail in self.left_out:
            w(b'[null,"left-out",' + jstr(reason) + b',' + jnum(number) + b',' + jstr(detail) + b']\n')
        tw = TextWriter(self, out)
        index = 0
        for kind, count, raw in self.body:
            if kind == RECORDS:
                tw.records(raw, count, index)
                index += count
        tw.flush()
        w(b'[null,"end",' + jnum(self.nfiles) + b']\n')

    # -- section 5
    def document_path(self, path):
        parts = [p for p in (self.root, self.base) if p != '']
        parts.append(path + self.ext)
        return '/'.join(parts)

    def write_graph(self, out):
        pj = [jstr(p) for p in self.paths]
        gw = GraphWriter(self, out)
        o = gw.o
        o += b'{"files":['
        for i in range(self.nfiles):
            if i:
                o += b','
            o += b'{"path":' + pj[i] + b',"document":' + jstr(self.document_path(self.paths[i])) + b',"edges":['
            raw = self.body[self.rec_sec[i]][2]
            gw.first = True
            gw.dependencies(raw, self.dep_off[i])
            gw.symbols(raw, self.sym_off[i], False)
            o += (b'],"outbound":[' + b','.join(pj[j] for j in self.wires[i]) +
                  b'],"inbound":[' + b','.join(pj[j] for j in self.inbound[i]) + b']')
            if self.has_doc[i]:
                o += b',"documentation":['
                gw.first = True
                gw.symbols(raw, self.sym_off[i], True)
                o += b']'
            if self.documented_by[i]:
                o += b',"documentedBy":[' + b','.join(pj[j] for j in self.documented_by[i]) + b']'
            o += b'}'
            if len(o) > LIMIT:
                gw.flush()
        o += b']}\n'
        gw.flush()


# ---------------------------------------------------------------- walking records (section 4.3)
#
# Three walkers follow the grammar of section 4.3: the checker makes every check
# of section 6 step 6; the text writer (section 8) and the graph writer
# (section 5) run only over bytes the checker has passed. Each reads a varint
# inline when it is one byte (b[p] < 0x80) and calls rv() otherwise; reading
# past a section's end raises IndexError, which the checker turns into a refusal.

class At(Exception):
    """A refusal at byte p of the section being walked."""

    def __init__(self, why, p):
        Exception.__init__(self, why)
        self.why = why
        self.p = p


def rv(b, p):
    """The varint at b[p] (section 2.1); returns it and the position after it."""
    n = len(b)
    if p >= n:
        raise At('the section ends where a varint was expected (section 2.1)', p)
    c = b[p]
    p += 1
    if c < 0x80:
        return c, p
    v = c & 0x7F
    shift = 7
    while True:
        if p >= n:
            raise At('varint cut short (section 2.1)', p)
        c = b[p]
        p += 1
        if c == 0:
            raise At('varint not in its shortest form (section 2.1)', p)
        if shift == 28:
            if c & 0x80:
                raise At('varint longer than five bytes (section 2.1)', p)
            if c > 0x0F:
                raise At('varint above 2^32 - 1 (section 2.1)', p)
        v |= (c & 0x7F) << shift
        if c < 0x80:
            return v, p
        shift += 7


RUN = 65536


class Checker:
    """The whole read of the records (section 6, step 6), section by section."""

    def __init__(self, scan):
        self.scan = scan
        self.S = scan.strings
        self.met = 0
        self.nstr = 0
        self.prev = None
        self.ok_link = set()
        self.file_of = {}            # sid of a valid path -> its file number, or -1

    # -- helpers, each taking and returning the position (and the met count where sids are read)
    def new(self, x, p):
        if x > self.met:
            raise At('sid %d is beyond the next string not yet met, %d (section 4.2)' % (x, self.met), p)
        if x >= self.nstr:
            raise At('sid %d names a string not set down before these records (section 4.2)' % x, p)
        self.met += 1

    def link(self, x, what, p):
        if x not in self.ok_link:
            pr = link_problem(self.S[x])
            if pr:
                raise At('%s is not a link: it %s (section 2.4)' % (what, pr), p)
            self.ok_link.add(x)

    def path(self, x, what, p):
        """Checks that sid x is a path; returns its file number in the scan or -1."""
        j = self.file_of.get(x)
        if j is None:
            pr = path_problem(self.S[x])
            if pr:
                raise At('%s is not a path: it %s (section 2.4)' % (what, pr), p)
            j = self.file_of[x] = self.scan.path_index.get(self.S[x], -1)
        return j

    def sid(self, b, p):
        x = b[p]
        if x < 0x80:
            p += 1
        else:
            x, p = rv(b, p)
        if x >= self.met:
            self.new(x, p)
        return x, p

    def count(self, b, p):
        x = b[p]
        if x < 0x80:
            p += 1
        else:
            x, p = rv(b, p)
        if x > len(b) - p:
            raise At('count %d larger than the bytes left (section 2.1)' % x, p)
        return x, p

    def mark(self, b, p, allowed, what):
        m = b[p]
        if m < 0x80:
            p += 1
        else:
            m, p = rv(b, p)
        if m & ~allowed:
            raise At('%s mark %d sets a bit the layout does not define (section 2.1)' % (what, m), p)
        return m, p

    def sids(self, b, p):
        """list(sid)"""
        k, p = self.count(b, p)
        while k:
            c = k if k < RUN else RUN
            chunk = b[p:p + c]
            if max(chunk) < 0x80:
                if max(chunk) >= self.met:
                    for i, x in enumerate(chunk):
                        if x >= self.met:
                            self.new(x, p + i)
                p += c
            else:
                for _ in range(c):
                    _, p = self.sid(b, p)
            k -= c
        return p

    def linked(self, b, p, m, what):
        """[link] [target] [anchor] by mark m; returns the position and the target's file or -1."""
        m &= 7
        if m != 1 and m != 3 and m != 7:
            if m & 2 and not m & 1:
                raise At('%s has a target without a link (section 4.3)' % what, p)
            raise At('%s has an anchor without a target (section 4.3)' % what, p)
        x = b[p]
        if x < 0x80:
            p += 1
        else:
            x, p = rv(b, p)
        if x >= self.met:
            self.new(x, p)
        if x not in self.ok_link:
            self.link(x, what + ' link', p)
        if m == 1:
            return p, -1
        x = b[p]
        if x < 0x80:
            p += 1
        else:
            x, p = rv(b, p)
        if x >= self.met:
            self.new(x, p)
        j = self.file_of.get(x)
        if j is None:
            j = self.path(x, what + ' target', p)
        if m == 7:
            x = b[p]
            if x < 0x80:
                p += 1
            else:
                x, p = rv(b, p)
            if x >= self.met:
                self.new(x, p)
        return p, j

    def types(self, b, p, targets):
        """list(type)"""
        k, p = self.count(b, p)
        if k >= 16 and len(b) - p >= 2 * k:
            w = b[p:p + 2 * k]
            marks = w[1::2]
            tm = marks[0]
            if not tm & 7 and tm <= 0x1F and marks.count(tm) == k and max(w) < 0x80:
                names = w[0::2]
                if max(names) >= self.met:
                    for i, x in enumerate(names):
                        if x >= self.met:
                            self.new(x, p + 2 * i)
                return p + 2 * k
        linked = self.linked
        for _ in range(k):
            x = b[p]
            if x < 0x80:
                p += 1
            else:
                x, p = rv(b, p)
            if x >= self.met:
                self.new(x, p)
            tm = b[p]
            if tm < 0x80:
                p += 1
            else:
                tm, p = rv(b, p)
            if tm & ~0x1F:
                raise At('a type mark %d sets a bit the layout does not define (section 2.1)' % tm, p)
            if tm & 7:
                p, j = linked(b, p, tm, 'a type')
                if j >= 0:
                    targets.add(j)
        return p

    def section(self, raw, count, index, what):
        """Checks one records section of count records, the first being file number index."""
        self.nstr = len(self.S)
        try:
            p = self.records(raw, count, index)
        except IndexError:
            raise At('the section ends inside a record (section 4.3)', len(raw))
        if p != len(raw):
            raise At('bytes after the last record (section 4.3)', p)
        if self.met != len(self.S):
            raise At('a string set down before these records is never met in them (section 4.2)', p)

    def records(self, b, count, index):
        scan = self.scan
        S = self.S
        sid = self.sid
        cnt = self.count
        mark = self.mark
        sids = self.sids
        link = self.link
        n = len(b)
        p = 0
        for i in range(index, index + count):
            targets = set()
            doc_targets = None
            # path
            x, p = sid(b, p)
            self.path(x, 'a record\'s path', p)
            pb = S[x].encode('utf-8')
            if self.prev is not None and not self.prev < pb:
                raise At('record %d is not after the one before it in path order (section 4.3)' % i, p)
            self.prev = pb
            if S[x] != scan.paths[i]:
                raise At('record %d\'s path is not the paths section\'s path %d (section 4.4)' % (i, i), p)
            x = b[p]                                       # layer
            if x < 0x80:
                p += 1
            else:
                x, p = rv(b, p)
            fm, p = mark(b, p, 0xF, 'a file')
            if fm & 1:
                _, p = sid(b, p)
            k, p = cnt(b, p)
            for _ in range(k):                             # entries
                x = b[p]
                if x < 0x80:
                    p += 1
                else:
                    x, p = rv(b, p)
                if x > 5:
                    raise At('an entry\'s reason %d is not 0 to 5 (section 4.3)' % x, p)
                em, p = mark(b, p, 0xF, 'an entry')
                if em:
                    if em & 2 and not em & 1:
                        raise At('an entry has a symbol link without a symbol name (section 4.3)', p)
                    if em & 1:
                        _, p = sid(b, p)
                    if em & 2:
                        x, p = sid(b, p)
                        link(x, 'an entry\'s symbol link', p)
                    if em & 4:
                        _, p = sid(b, p)
                    if em & 8:
                        _, p = sid(b, p)
                        x, p = sid(b, p)
                        link(x, 'an entry\'s declarer link', p)
            if fm & 2:
                x, p = sid(b, p)
                scan.gen[i] = x
            x, p = sid(b, p)
            scan.auth[i] = x
            scan.sym_off[i] = p
            k, p = cnt(b, p)
            for _ in range(k):                             # symbols
                x = b[p]                                   # name
                if x < 0x80:
                    p += 1
                else:
                    x, p = rv(b, p)
                if x >= self.met:
                    self.new(x, p)
                sm = b[p]
                if sm < 0x80:
                    p += 1
                else:
                    sm, p = rv(b, p)
                if sm & ~3:
                    raise At('a symbol mark %d sets a bit the layout does not define (section 2.1)' % sm, p)
                if sm & 1:
                    _, p = sid(b, p)
                x = b[p]                                   # kind
                if x < 0x80:
                    p += 1
                else:
                    x, p = rv(b, p)
                if x >= self.met:
                    self.new(x, p)
                if b[p] == 0:                              # flags
                    p += 1
                else:
                    p = sids(b, p)
                if sm & 2:
                    x, p = sid(b, p)
                    link(x, 'a symbol\'s source path', p)
                    x = b[p]
                    if x < 0x80:
                        p += 1
                    else:
                        x, p = rv(b, p)
                if b[p] == 0:                              # references
                    p += 1
                else:
                    r, p = cnt(b, p)
                    for _ in range(r):
                        role = b[p]
                        if role < 0x80:
                            p += 1
                        else:
                            role, p = rv(b, p)
                        if role > 4:
                            raise At('a reference\'s role %d is not 0 to 4 (section 4.3)' % role, p)
                        if role == 4:
                            q, p = cnt(b, p)
                            for _ in range(q):
                                _, p = sid(b, p)
                                p = self.types(b, p, targets)
                        else:
                            p = self.types(b, p, targets)
                if b[p] == 0:                              # sections
                    p += 1
                else:
                    r, p = cnt(b, p)
                    for _ in range(r):
                        _, p = sid(b, p)
                        p = sids(b, p)
                if b[p] == 0:                              # documentation references
                    p += 1
                else:
                    r, p = cnt(b, p)
                    for _ in range(r):
                        _, p = sid(b, p)
                        dm, p = mark(b, p, 0xF, 'a documentation reference')
                        if dm & 8:
                            _, p = sid(b, p)
                        if dm & 7:
                            p, j = self.linked(b, p, dm, 'a documentation reference')
                            if j >= 0:
                                scan.has_doc[i] = 1
                                if j != i:
                                    if doc_targets is None:
                                        doc_targets = set()
                                    doc_targets.add(j)
            scan.dep_off[i] = p
            k, p = cnt(b, p)
            for _ in range(k):                             # dependencies
                _, p = sid(b, p)
                dm, p = mark(b, p, 0xF, 'a dependency')
                if dm & 7:
                    p, j = self.linked(b, p, dm, 'a dependency')
                    if j >= 0:
                        targets.add(j)
                if dm & 8:
                    p = sids(b, p)
                if b[p] == 0:
                    p += 1
                else:
                    p = sids(b, p)
            if fm & 4:                                     # cited-by
                k, p = cnt(b, p)
                for _ in range(k):
                    _, p = sid(b, p)
                    x, p = sid(b, p)
                    link(x, 'a cited-by link', p)
            if fm & 8:                                     # re-exports
                k, p = cnt(b, p)
                for _ in range(k):
                    _, p = sid(b, p)
                    rm, p = mark(b, p, 0x3, 'a re-export')
                    if rm & 1:
                        _, p = sid(b, p)
                    if rm & 2:
                        _, p = sid(b, p)
                        x, p = sid(b, p)
                        link(x, 'a re-export\'s origin link', p)
                    p = sids(b, p)
            targets.discard(i)
            if sorted(targets) != scan.wires[i]:
                raise At('record %d\'s wires are not what its links give (section 4.5)' % i, p)
            if doc_targets:
                scan.doc_pairs[i] = doc_targets
        return p


LIMIT = 1 << 20


class TextWriter:
    """Writes the text form's lines (section 8) of checked records, streaming."""

    def __init__(self, scan, out):
        self.scan = scan
        self.E = scan.ej
        self.Eg = scan.ej.__getitem__
        self.L = array('q', map(len, scan.ej)).__getitem__
        self.longest = max(map(len, scan.ej), default=0)
        self.o = bytearray()
        self.w = out.write

    def flush(self):
        if self.o:
            self.w(self.o)
            del self.o[:]

    def join(self, seq, first):
        """The strings of the sids seq, joined by commas, after a comma unless first."""
        o = self.o
        if (len(seq) > 1 and len(seq) * self.longest > LIMIT and sum(map(self.L, seq)) > LIMIT):
            h = len(seq) // 2
            self.join(seq[:h], first)
            self.join(seq[h:], False)
            return
        if not first:
            o += b','
        o += b','.join(map(self.Eg, seq))
        if len(o) > LIMIT:
            self.flush()

    def sids(self, b, p):
        """list(sid), written as strings joined by commas."""
        x = b[p]
        if x < 0x80:
            p += 1
        else:
            x, p = rv(b, p)
        k = x
        first = True
        while k:
            c = k if k < RUN else RUN
            chunk = b[p:p + c]
            if max(chunk) < 0x80:
                p += c
            else:
                seq = []
                for _ in range(c):
                    x = b[p]
                    if x < 0x80:
                        p += 1
                    else:
                        x, p = rv(b, p)
                    seq.append(x)
                chunk = seq
            self.join(chunk, first)
            first = False
            k -= c
        return p

    def linked(self, b, p, m):
        E = self.E
        o = self.o
        if m & 1:
            x = b[p]
            if x < 0x80:
                p += 1
            else:
                x, p = rv(b, p)
            o += b',"link":' + E[x]
        if m & 2:
            x = b[p]
            if x < 0x80:
                p += 1
            else:
                x, p = rv(b, p)
            o += b',"target":' + E[x]
        if m & 4:
            x = b[p]
            if x < 0x80:
                p += 1
            else:
                x, p = rv(b, p)
            o += b',"anchor":' + E[x]
        return p

    def types(self, b, p):
        E = self.E
        o = self.o
        k = b[p]
        if k < 0x80:
            p += 1
        else:
            k, p = rv(b, p)
        if k >= 16:
            w = b[p:p + 2 * k]
            marks = w[1::2]
            tm = marks[0]
            if not tm & 7 and marks.count(tm) == k and max(w) < 0x80:
                tail = (b',"array":true' if tm & 8 else b'') + (b',"promise":true' if tm & 16 else b'') + b'}'
                names = w[0::2]
                piece = {x: b'{"name":' + E[x] + tail for x in set(names)}
                step = max(1, LIMIT // max(map(len, piece.values())))
                get = piece.__getitem__
                for s in range(0, k, step):
                    if s:
                        o += b','
                    o += b','.join(map(get, names[s:s + step]))
                    if len(o) > LIMIT:
                        self.flush()
                return p + 2 * k
        for t in range(k):
            x = b[p]
            if x < 0x80:
                p += 1
            else:
                x, p = rv(b, p)
            tm = b[p]
            if tm < 0x80:
                p += 1
            else:
                tm, p = rv(b, p)
            o += (b',{"name":' if t else b'{"name":') + E[x]
            if tm & 7:
                p = self.linked(b, p, tm)
            if tm & 8:
                o += b',"array":true'
            if tm & 16:
                o += b',"promise":true'
            o += b'}'
            if len(o) > LIMIT:
                self.flush()
        return p

    def records(self, b, count, index):
        scan = self.scan
        E = self.E
        o = self.o
        sids = self.sids
        types = self.types
        linked = self.linked
        p = 0
        for i in range(index, index + count):
            x = b[p]
            if x < 0x80:
                p += 1
            else:
                x, p = rv(b, p)
            P = b'[' + E[x] + b','
            layer = b[p]
            if layer < 0x80:
                p += 1
            else:
                layer, p = rv(b, p)
            fm = b[p]
            p += 1
            arch = b'null'
            if fm & 1:
                x = b[p]
                if x < 0x80:
                    p += 1
                else:
                    x, p = rv(b, p)
                arch = E[x]
            gen = scan.gen[i]
            o += (P + b'"file",' + jnum(layer) + b',' + arch + b',' + (b'null' if gen < 0 else E[gen]) + b']\n' +
                  P + b'"authored",' + E[scan.auth[i]] + b']\n')
            k = b[p]
            if k < 0x80:
                p += 1
            else:
                k, p = rv(b, p)
            for _ in range(k):                             # entries
                reason = b[p]
                em = b[p + 1]
                p += 2
                o += P + b'"entry",{"reason":' + REASONS_J[reason]
                if em & 1:
                    x = b[p]
                    if x < 0x80:
                        p += 1
                    else:
                        x, p = rv(b, p)
                    o += b',"symbol":{"name":' + E[x]
                    if em & 2:
                        x = b[p]
                        if x < 0x80:
                            p += 1
                        else:
                            x, p = rv(b, p)
                        o += b',"link":' + E[x]
                    o += b'}'
                if em & 4:
                    x = b[p]
                    if x < 0x80:
                        p += 1
                    else:
                        x, p = rv(b, p)
                    o += b',"command":' + E[x]
                if em & 8:
                    x, p = rv(b, p)
                    y, p = rv(b, p)
                    o += b',"declarer":{"label":' + E[x] + b',"link":' + E[y] + b'}'
                o += b'}]\n'
                if len(o) > LIMIT:
                    self.flush()
            p = scan.sym_off[i]                            # past generatedAt and authored, already written
            k = b[p]
            if k < 0x80:
                p += 1
            else:
                k, p = rv(b, p)
            for _ in range(k):                             # symbols
                x = b[p]
                if x < 0x80:
                    p += 1
                else:
                    x, p = rv(b, p)
                sm = b[p]
                p += 1
                o += P + b'"symbol",{"name":' + E[x]
                if sm & 1:
                    x, p = rv(b, p)
                    o += b',"slug":' + E[x]
                x = b[p]
                if x < 0x80:
                    p += 1
                else:
                    x, p = rv(b, p)
                o += b',"kind":' + E[x] + b',"flags":['
                if b[p] == 0:
                    p += 1
                else:
                    p = sids(b, p)
                o += b']'
                if sm & 2:
                    x, p = rv(b, p)
                    y, p = rv(b, p)
                    o += b',"source":{"path":' + E[x] + b',"line":' + jnum(y) + b'}'
                o += b',"references":['
                if b[p] == 0:
                    p += 1
                else:
                    r, p = rv(b, p)
                    for t in range(r):
                        role = b[p]
                        p += 1
                        if t:
                            o += b','
                        if role == 4:
                            o += b'{"role":"Parameters","parameters":['
                            q, p = rv(b, p)
                            for u in range(q):
                                x, p = rv(b, p)
                                o += (b',{"name":' if u else b'{"name":') + E[x] + b',"types":['
                                p = types(b, p)
                                o += b']}'
                                if len(o) > LIMIT:
                                    self.flush()
                            o += b']}'
                        else:
                            o += b'{"role":' + ROLES_J[role] + b',"types":['
                            p = types(b, p)
                            o += b']}'
                        if len(o) > LIMIT:
                            self.flush()
                o += b'],"sections":['
                if b[p] == 0:
                    p += 1
                else:
                    r, p = rv(b, p)
                    for t in range(r):
                        x, p = rv(b, p)
                        o += (b',{"title":' if t else b'{"title":') + E[x] + b',"body":['
                        p = sids(b, p)
                        o += b']}'
                        if len(o) > LIMIT:
                            self.flush()
                o += b'],"documentation":['
                if b[p] == 0:
                    p += 1
                else:
                    r, p = rv(b, p)
                    for t in range(r):
                        x, p = rv(b, p)
                        dm = b[p]
                        p += 1
                        o += (b',{"name":' if t else b'{"name":') + E[x]
                        if dm & 8:
                            x, p = rv(b, p)
                            o += b',"element":' + E[x]
                        if dm & 7:
                            p = linked(b, p, dm)
                        o += b'}'
                        if len(o) > LIMIT:
                            self.flush()
                o += b']}]\n'
                if len(o) > LIMIT:
                    self.flush()
            k = b[p]
            if k < 0x80:
                p += 1
            else:
                k, p = rv(b, p)
            for _ in range(k):                             # dependencies
                x = b[p]
                if x < 0x80:
                    p += 1
                else:
                    x, p = rv(b, p)
                dm = b[p]
                p += 1
                o += P + b'"dependency",{"label":' + E[x]
                if dm & 7:
                    p = linked(b, p, dm)
                if dm & 8:
                    o += b',"symbols":['
                    p = sids(b, p)
                    o += b']'
                o += b',"qualifiers":['
                if b[p] == 0:
                    p += 1
                else:
                    p = sids(b, p)
                o += b']}]\n'
                if len(o) > LIMIT:
                    self.flush()
            if fm & 4:
                k, p = rv(b, p)
                o += P + b'"cited-by",['
                for t in range(k):
                    x, p = rv(b, p)
                    y, p = rv(b, p)
                    o += (b',{"label":' if t else b'{"label":') + E[x] + b',"link":' + E[y] + b'}'
                    if len(o) > LIMIT:
                        self.flush()
                o += b']]\n'
            if fm & 8:
                k, p = rv(b, p)
                o += P + b'"re-exports",['
                for t in range(k):
                    x, p = rv(b, p)
                    rm = b[p]
                    p += 1
                    o += (b',{"name":' if t else b'{"name":') + E[x]
                    if rm & 1:
                        x, p = rv(b, p)
                        o += b',"slug":' + E[x]
                    if rm & 2:
                        x, p = rv(b, p)
                        y, p = rv(b, p)
                        o += b',"from":{"label":' + E[x] + b',"link":' + E[y] + b'}'
                    o += b',"flags":['
                    p = sids(b, p)
                    o += b']}'
                    if len(o) > LIMIT:
                        self.flush()
                o += b']]\n'
            if len(o) > LIMIT:
                self.flush()
        return p


class GraphWriter:
    """Writes the graph (section 5) of checked records: each file's edges and documentation."""

    def __init__(self, scan, out):
        self.scan = scan
        self.E = scan.ej
        self.S = scan.strings
        self.file_of = scan.file_of
        self.o = bytearray()
        self.w = out.write
        self.first = True
        find = {}
        for i, s in enumerate(scan.strings):
            if s in ('re-export', 'type-only', 'contract', 'configuration'):
                find[s] = i
        self.q_re = find.get('re-export', -1)
        self.q_type = find.get('type-only', -1)
        self.q_contract = find.get('contract', -1)
        self.q_config = find.get('configuration', -1)

    def flush(self):
        if self.o:
            self.w(self.o)
            del self.o[:]

    def emit(self, b):
        o = self.o
        if self.first:
            self.first = False
        else:
            o += b','
        o += b
        if len(o) > LIMIT:
            self.flush()

    def to(self, target, anchor):
        if target >= 0 and self.file_of.get(target, -1) >= 0:
            b = b',"to":' + self.E[target]
            if anchor >= 0:
                b += b',"toSymbol":' + self.E[anchor]
            return b
        return b''

    @staticmethod
    def linked(b, p, m):
        link = target = anchor = -1
        if m & 1:
            link = b[p]
            if link < 0x80:
                p += 1
            else:
                link, p = rv(b, p)
            if m & 2:
                target = b[p]
                if target < 0x80:
                    p += 1
                else:
                    target, p = rv(b, p)
                if m & 4:
                    anchor = b[p]
                    if anchor < 0x80:
                        p += 1
                    else:
                        anchor, p = rv(b, p)
        return p, link, target, anchor

    @staticmethod
    def skip_sids(b, p):
        k, p = rv(b, p)
        if k and max(b[p:p + k]) < 0x80:
            return p + k
        for _ in range(k):
            _, p = rv(b, p)
        return p

    def sid_list(self, b, p):
        """list(sid) as chunks: bytes when every sid is one byte, else lists."""
        k, p = rv(b, p)
        out = []
        while k:
            c = k if k < RUN else RUN
            chunk = b[p:p + c]
            if max(chunk) < 0x80:
                p += c
            else:
                chunk = []
                for _ in range(c):
                    x, p = rv(b, p)
                    chunk.append(x)
            out.append(chunk)
            k -= c
        return p, out

    def dependencies(self, b, p):
        E = self.E
        k, p = rv(b, p)
        for _ in range(k):
            label, p = rv(b, p)
            dm = b[p]
            p += 1
            p, link, target, anchor = self.linked(b, p, dm)
            if dm & 8:
                p = self.skip_sids(b, p)
            re_export = type_only = False
            basis = -1
            p, chunks = self.sid_list(b, p)
            for ch in chunks:
                if not re_export and self.q_re >= 0 and self.q_re in ch:
                    re_export = True
                if not type_only and self.q_type >= 0 and self.q_type in ch:
                    type_only = True
                if basis < 0:
                    at = [ch.index(q) for q in (self.q_contract, self.q_config) if q >= 0 and q in ch]
                    if at:
                        basis = ch[min(at)]
            if link < 0:
                continue
            e = (b'{"kind":' + (b'"re-export"' if re_export else b'"import"') + b',"label":' + E[label] +
                 b',"link":' + E[link] + self.to(target, anchor))
            if type_only:
                e += b',"typeOnly":true'
            if basis >= 0:
                e += b',"basis":' + E[basis]
            self.emit(e + b'}')
        return p

    def types(self, b, p, kind, slug, param):
        """list(type): an edge for each type with a link, unless kind is None (skipping)."""
        E = self.E
        k, p = rv(b, p)
        if k >= 16:
            w = b[p:p + 2 * k]
            marks = w[1::2]
            tm = marks[0]
            if not tm & 7 and marks.count(tm) == k and max(w) < 0x80:
                return p + 2 * k
        for _ in range(k):
            name, p = rv(b, p)
            tm = b[p]
            p += 1
            if not tm & 7:
                continue
            p, link, target, anchor = self.linked(b, p, tm)
            if kind is None:
                continue
            e = b'{"kind":' + kind + b',"label":' + E[name] + b',"link":' + E[link] + self.to(target, anchor)
            if slug >= 0:
                e += b',"from":' + E[slug]
            if param >= 0:
                e += b',"parameter":' + E[param]
            self.emit(e + b'}')
        return p

    def symbols(self, b, p, docs):
        """Type edges (docs false) or documentation items (docs true) of each symbol."""
        E = self.E
        k, p = rv(b, p)
        for _ in range(k):
            _, p = rv(b, p)
            sm = b[p]
            p += 1
            slug = -1
            if sm & 1:
                slug, p = rv(b, p)
            _, p = rv(b, p)
            p = self.skip_sids(b, p)
            if sm & 2:
                _, p = rv(b, p)
                _, p = rv(b, p)
            r, p = rv(b, p)
            for _ in range(r):
                role = b[p]
                p += 1
                kind = None if docs else EDGE_KINDS_J[role]
                if role == 4:
                    q, p = rv(b, p)
                    for _ in range(q):
                        pname, p = rv(b, p)
                        p = self.types(b, p, kind, slug, pname)
                else:
                    p = self.types(b, p, kind, slug, -1)
            r, p = rv(b, p)
            for _ in range(r):
                _, p = rv(b, p)
                p = self.skip_sids(b, p)
            r, p = rv(b, p)
            if not docs:                                   # skip the documentation references
                for _ in range(r):
                    while b[p] & 0x80:                     # name
                        p += 1
                    dm = b[p + 1]
                    p += 2
                    for _ in range(((dm >> 3) & 1) + (dm & 1) + ((dm >> 1) & 1) + ((dm >> 2) & 1)):
                        while b[p] & 0x80:
                            p += 1
                        p += 1
                continue
            o = self.o
            file_of = self.file_of
            linked = self.linked
            for _ in range(r):
                name, p = rv(b, p)
                dm = b[p]
                p += 1
                element = -1
                if dm & 8:
                    element, p = rv(b, p)
                p, link, target, anchor = linked(b, p, dm)
                if link < 0 or target < 0 or file_of.get(target, -1) < 0:
                    continue
                if self.first:
                    self.first = False
                    o += b'{"label":' + E[name]
                else:
                    o += b',{"label":' + E[name]
                o += b',"link":' + E[link] + b',"to":' + E[target]
                if element >= 0:
                    o += b',"element":' + E[element]
                if anchor >= 0:
                    o += b',"toSymbol":' + E[anchor]
                if slug >= 0:
                    o += b',"from":' + E[slug]
                o += b'}'
                if len(o) > LIMIT:
                    self.flush()
        return p



# ---------------------------------------------------------------- section 8: reading a text form

def _pairs(pairs):
    d = {}
    for k, v in pairs:
        if k in d:
            refuse('a member written twice (section 8)')
        d[k] = v
    return d


def _no_constant(c):
    refuse('%s is not a value the text writes (section 8.1)' % c)


_DECODER = json.JSONDecoder(object_pairs_hook=_pairs, parse_constant=_no_constant)
STAGES = {'file': 0, 'authored': 1, 'entry': 2, 'symbol': 3, 'dependency': 4, 'cited-by': 5, 're-exports': 6}


class TextReader:
    """Turns a text form into facts, line by line, refusing what it cannot hold.

    Whether the text is in its one form is decided afterwards, by writing the
    facts as a reader would and comparing bytes (section 8)."""

    def __init__(self):
        self.line_no = 0

    def bad(self, why):
        refuse('line %d: %s' % (self.line_no, why))

    def s(self, v, what):
        if type(v) is not str:
            self.bad('%s is not a string' % what)
        try:
            v.encode('utf-8')
        except UnicodeEncodeError:
            self.bad('%s holds a lone surrogate, which no string holds (section 2.2)' % what)
        return v

    def opt_s(self, d, key, what):
        if key in d:
            return self.s(d[key], what)
        return None

    def n(self, v, what):
        if type(v) is not int:
            self.bad('%s is not a whole number (section 8.1)' % what)
        if v < 0 or v > U32:
            self.bad('%s is not from 0 to 2^32 - 1 (section 8.1)' % what)
        return v

    def lst(self, v, what):
        if type(v) is not list:
            self.bad('%s is not an array' % what)
        return v

    def obj(self, v, what, required, optional=()):
        if type(v) is not dict:
            self.bad('%s is not an object' % what)
        for k in v:
            if k not in required and k not in optional:
                self.bad('%s has a member it does not have (section 8)' % what)
        for k in required:
            if k not in v:
                self.bad('%s lacks its member "%s" (section 8)' % (what, k))
        return v

    def strs(self, v, what):
        return [self.s(x, what) for x in self.lst(v, what + 's')]

    def linked(self, d, what):
        link = self.opt_s(d, 'link', what + ' link')
        target = self.opt_s(d, 'target', what + ' target')
        anchor = self.opt_s(d, 'anchor', what + ' anchor')
        if target is not None and link is None:
            self.bad('%s has a target without a link (section 8)' % what)
        if anchor is not None and target is None:
            self.bad('%s has an anchor without a target (section 8)' % what)
        return link, target, anchor

    def flag_true(self, d, key, what):
        if key in d:
            if d[key] is not True:
                self.bad('%s\'s "%s" is not true; an absent mark is left out (section 8)' % (what, key))
            return True
        return False

    def types(self, v):
        out = []
        for t in self.lst(v, 'types'):
            t = self.obj(t, 'a type', ('name',), ('link', 'target', 'anchor', 'array', 'promise'))
            link, target, anchor = self.linked(t, 'a type')
            out.append((self.s(t['name'], 'a type\'s name'), link, target, anchor,
                        self.flag_true(t, 'array', 'a type'), self.flag_true(t, 'promise', 'a type')))
        return out

    def entry(self, v):
        e = self.obj(v, 'an entry', ('reason',), ('symbol', 'command', 'declarer'))
        r = e['reason']
        if type(r) is not str or r not in REASONS:
            self.bad('an entry\'s reason is not one of the words of section 4.3')
        sn = sl = dl = dk = None
        if 'symbol' in e:
            sy = self.obj(e['symbol'], 'an entry\'s symbol', ('name',), ('link',))
            sn = self.s(sy['name'], 'an entry\'s symbol name')
            sl = self.opt_s(sy, 'link', 'an entry\'s symbol link')
        cmd = self.opt_s(e, 'command', 'an entry\'s command')
        if 'declarer' in e:
            de = self.obj(e['declarer'], 'an entry\'s declarer', ('label', 'link'))
            dl = self.s(de['label'], 'a declarer\'s label')
            dk = self.s(de['link'], 'a declarer\'s link')
        return (REASONS.index(r), sn, sl, cmd, dl, dk)

    def symbol(self, v):
        y = self.obj(v, 'a symbol', ('name', 'kind', 'flags', 'references', 'sections', 'documentation'),
                     ('slug', 'source'))
        source = None
        if 'source' in y:
            so = self.obj(y['source'], 'a symbol\'s source', ('path', 'line'))
            source = (self.s(so['path'], 'a source\'s path'), self.n(so['line'], 'a source\'s line'))
        refs = []
        for r in self.lst(y['references'], 'references'):
            if type(r) is not dict:
                self.bad('a reference is not an object')
            role = r.get('role')
            if type(role) is not str or role not in ROLES:
                self.bad('a reference\'s role is not one of the words of section 4.3')
            if role == 'Parameters':
                r = self.obj(r, 'a reference', ('role', 'parameters'))
                params = []
                for p in self.lst(r['parameters'], 'parameters'):
                    p = self.obj(p, 'a parameter', ('name', 'types'))
                    params.append((self.s(p['name'], 'a parameter\'s name'), self.types(p['types'])))
                refs.append((4, params))
            else:
                r = self.obj(r, 'a reference', ('role', 'types'))
                refs.append((ROLES.index(role), self.types(r['types'])))
        sections = []
        for sec in self.lst(y['sections'], 'sections'):
            sec = self.obj(sec, 'a section', ('title', 'body'))
            sections.append((self.s(sec['title'], 'a section\'s title'), self.strs(sec['body'], 'a section\'s line')))
        docs = []
        for d in self.lst(y['documentation'], 'documentation'):
            d = self.obj(d, 'a documentation reference', ('name',), ('element', 'link', 'target', 'anchor'))
            link, target, anchor = self.linked(d, 'a documentation reference')
            docs.append((self.s(d['name'], 'a documentation reference\'s name'),
                         self.opt_s(d, 'element', 'an element'), link, target, anchor))
        return (self.s(y['name'], 'a symbol\'s name'), self.opt_s(y, 'slug', 'a symbol\'s slug'),
                self.s(y['kind'], 'a symbol\'s kind'), self.strs(y['flags'], 'a flag'), source, refs, sections, docs)

    def dependency(self, v):
        d = self.obj(v, 'a dependency', ('label', 'qualifiers'), ('link', 'target', 'anchor', 'symbols'))
        link, target, anchor = self.linked(d, 'a dependency')
        syms = self.strs(d['symbols'], 'a dependency\'s symbol') if 'symbols' in d else None
        return (self.s(d['label'], 'a dependency\'s label'), link, target, anchor, syms,
                self.strs(d['qualifiers'], 'a qualifier'))

    def cited(self, v):
        out = []
        for c in self.lst(v, 'cited-by'):
            c = self.obj(c, 'a cited-by item', ('label', 'link'))
            out.append((self.s(c['label'], 'a cited-by label'), self.s(c['link'], 'a cited-by link')))
        return out

    def reexports(self, v):
        out = []
        for r in self.lst(v, 're-exports'):
            r = self.obj(r, 'a re-export', ('name', 'flags'), ('slug', 'from'))
            fl = fk = None
            if 'from' in r:
                f = self.obj(r['from'], 'a re-export\'s origin', ('label', 'link'))
                fl = self.s(f['label'], 'an origin\'s label')
                fk = self.s(f['link'], 'an origin\'s link')
            out.append((self.s(r['name'], 'a re-export\'s name'), self.opt_s(r, 'slug', 'a re-export\'s slug'),
                        fl, fk, self.strs(r['flags'], 'a re-export flag')))
        return out

    def read(self, data):
        if data.startswith(b'\xef\xbb\xbf'):
            refuse('the text begins with a byte-order mark (section 8)')
        try:
            data.decode('utf-8')
        except UnicodeDecodeError as e:
            refuse('the text is not well-formed UTF-8 at byte %d (sections 8, 2.2)' % e.start)
        if b'\r' in data:
            refuse('line %d holds a CR (section 8)' % (data.count(b'\n', 0, data.index(b'\r')) + 1))
        if not data:
            refuse('the text is empty: it has no format line (section 8)')
        if not data.endswith(b'\n'):
            refuse('the last line does not end with LF (section 8)')
        lines = data[:-1].split(b'\n')
        head = None
        left_out = []
        records = []
        rec = None
        stage = 0
        ended = False
        for no, line in enumerate(lines, 1):
            self.line_no = no
            if ended:
                self.bad('a line after the end line (section 8)')
            try:
                v = _DECODER.decode(line.decode('utf-8'))
            except (ValueError, RecursionError) as e:
                self.bad('not one JSON value (sections 8, 8.1): %s' % str(e).split('\n')[0][:80])
            if type(v) is not list or len(v) < 2 or type(v[1]) is not str:
                self.bad('not an array of a subject and a kind (section 8)')
            kind = v[1]
            if no == 1:
                if kind != 'format' or v[0] is not None or len(v) != 4 or v[2] != 'fact-pack':
                    self.bad('the first line is not the format line (section 8)')
                if type(v[3]) is not int or v[3] != 1:
                    self.bad('the format\'s version is not 1, the version this reader reads (section 4.1)')
                continue
            if no == 2:
                if kind != 'location' or v[0] is not None or len(v) != 5:
                    self.bad('the second line is not the location line (section 8)')
                head = [self.s(v[2], 'root'), self.s(v[3], 'baseLayer'), self.s(v[4], 'extension')]
                continue
            if no == 3:
                if kind != 'scanner' or v[0] is not None or len(v) != 3:
                    self.bad('the third line is not the scanner line (section 8)')
                head.append(self.s(v[2], 'scanner'))
                continue
            if v[0] is None:
                if kind == 'left-out':
                    if records:
                        self.bad('a left-out line after the files (section 8)')
                    if len(v) != 5:
                        self.bad('a left-out line is not [null,"left-out",reason,number,detail] (section 8)')
                    left_out.append((self.s(v[2], 'a left-out reason'), self.n(v[3], 'a left-out number'),
                                     self.s(v[4], 'a left-out detail')))
                elif kind == 'end':
                    if len(v) != 3:
                        self.bad('the end line is not [null,"end",numberOfFiles] (section 8)')
                    if rec is not None and stage < 1:
                        self.bad('a file has no authored line (section 8)')
                    if self.n(v[2], 'the end\'s number') != len(records):
                        self.bad('the end\'s number is not the count of files (section 8)')
                    ended = True
                else:
                    self.bad('a line of a kind the text does not have (section 8)')
                continue
            path = self.s(v[0], 'a line\'s path')
            if kind not in STAGES:
                self.bad('a line of a kind the text does not have (section 8)')
            st = STAGES[kind]
            if st == 0:
                if rec is not None and stage < 1:
                    self.bad('a file has no authored line (section 8)')
                if len(v) != 5:
                    self.bad('a file line is not [path,"file",layer,archetype,generatedAt] (section 8)')
                arch = None if v[3] is None else self.s(v[3], 'an archetype')
                gen = None if v[4] is None else self.s(v[4], 'generatedAt')
                rec = {'path': path, 'layer': self.n(v[2], 'a layer'), 'arch': arch, 'gen': gen,
                       'auth': None, 'entries': [], 'symbols': [], 'deps': [], 'cited': None, 'rex': None}
                records.append(rec)
                stage = 0
                continue
            if rec is None or path != rec['path']:
                self.bad('a line of kind %s not among its file\'s lines, after its file line (section 8)' % kind)
            if len(v) != 3:
                self.bad('a %s line is not [path,"%s",value] (section 8)' % (kind, kind))
            if st < stage or (st == stage and st in (1, 5, 6)) or (stage == 0 and st != 1):
                self.bad('a line of kind %s out of its one order (section 8)' % kind)
            stage = st
            if st == 1:
                rec['auth'] = self.s(v[2], 'authored')
            elif st == 2:
                rec['entries'].append(self.entry(v[2]))
            elif st == 3:
                rec['symbols'].append(self.symbol(v[2]))
            elif st == 4:
                rec['deps'].append(self.dependency(v[2]))
            elif st == 5:
                rec['cited'] = self.cited(v[2])
            else:
                rec['rex'] = self.reexports(v[2])
        if len(lines) < 3:
            refuse('the text stops before its location and scanner lines (section 8)')
        if not ended:
            refuse('the text has no end line (section 8)')
        return head, left_out, records


# ---------------------------------------------------------------- section 7: the facts set down

def venc(n, buf):
    if n < 0 or n > U32:
        refuse('a number out of range 0 to 2^32 - 1 (section 2.1)')
    while n >= 0x80:
        buf.append((n & 0x7F) | 0x80)
        n >>= 7
    buf.append(n)


def tenc(s, buf):
    b = s.encode('utf-8')
    venc(len(b), buf)
    buf += b


def check_size(b):
    if len(b) > MAX_SECTION:
        refuse('the facts need a section longer than MAX_SECTION, 64 MiB, which no writer stores (section 3.5)')


class SectionWriter:
    """Sets facts down as uncompressed sections, as a writer does (sections 4 and 7).

    It does not judge the facts: reading the sections back does (section 6)."""

    def __init__(self, head, left_out, records):
        self.table = {}
        root, base, ext, scanner = head
        h = bytearray([1])
        for s in (root, base, ext, scanner):
            tenc(s, h)
        venc(len(left_out), h)
        for reason, number, detail in left_out:
            tenc(reason, h)
            venc(number, h)
            tenc(detail, h)
        check_size(h)
        sections = [(HEAD, 0, bytes(h))]
        self.index = {}
        for i, r in enumerate(records):
            self.index.setdefault(r['path'], i)
        wires = bytearray()
        for g in range(0, len(records), 256):
            group = records[g:g + 256]
            buf = bytearray()
            self.new = []
            for k, r in enumerate(group):
                self.targets = set()
                self.record(r, buf)
                check_size(buf)
                self.targets.discard(g + k)
                ws = sorted(self.targets)
                venc(len(ws), wires)
                prev = None
                for w in ws:
                    venc(w if prev is None else w - prev - 1, wires)
                    prev = w
            if self.new:
                sb = bytearray()
                for s in self.new:
                    tenc(s, sb)
                check_size(sb)
                sections.append((STRINGS, len(self.new), bytes(sb)))
            sections.append((RECORDS, len(group), bytes(buf)))
        pb = bytearray()
        prev = b''
        for r in records:
            cur = r['path'].encode('utf-8')
            k = 0
            m = min(len(prev), len(cur))
            while k < m and prev[k] == cur[k]:
                k += 1
            venc(k, pb)
            venc(len(cur) - k, pb)
            pb += cur[k:]
            prev = cur
        check_size(pb)
        check_size(wires)
        sections.append((PATHS, len(records), bytes(pb)))
        sections.append((WIRES, len(records), bytes(wires)))
        self.sections = sections

    def sid(self, s, buf):
        i = self.table.get(s)
        if i is None:
            i = self.table[s] = len(self.table)
            self.new.append(s)
        venc(i, buf)

    def linked(self, link, target, anchor, buf, wire):
        if link is not None:
            self.sid(link, buf)
        if target is not None:
            self.sid(target, buf)
            if wire and target in self.index:
                self.targets.add(self.index[target])
        if anchor is not None:
            self.sid(anchor, buf)

    @staticmethod
    def mark(link, target, anchor):
        return (1 if link is not None else 0) | (2 if target is not None else 0) | (4 if anchor is not None else 0)

    def types(self, types, buf):
        venc(len(types), buf)
        for name, link, target, anchor, arr, prom in types:
            self.sid(name, buf)
            venc(self.mark(link, target, anchor) | (8 if arr else 0) | (16 if prom else 0), buf)
            self.linked(link, target, anchor, buf, True)

    def record(self, r, buf):
        sid = self.sid
        sid(r['path'], buf)
        venc(r['layer'], buf)
        fm = ((1 if r['arch'] is not None else 0) | (2 if r['gen'] is not None else 0) |
              (4 if r['cited'] is not None else 0) | (8 if r['rex'] is not None else 0))
        venc(fm, buf)
        if r['arch'] is not None:
            sid(r['arch'], buf)
        venc(len(r['entries']), buf)
        for reason, sn, sl, cmd, dl, dk in r['entries']:
            venc(reason, buf)
            venc((1 if sn is not None else 0) | (2 if sl is not None else 0) | (4 if cmd is not None else 0) |
                 (8 if dl is not None else 0), buf)
            for s in (sn, sl, cmd, dl, dk):
                if s is not None:
                    sid(s, buf)
        if r['gen'] is not None:
            sid(r['gen'], buf)
        if r['auth'] is None:
            refuse('a file has no authored line (section 8)')
        sid(r['auth'], buf)
        venc(len(r['symbols']), buf)
        for name, slug, kind, flags, source, refs, sections, docs in r['symbols']:
            sid(name, buf)
            venc((1 if slug is not None else 0) | (2 if source is not None else 0), buf)
            if slug is not None:
                sid(slug, buf)
            sid(kind, buf)
            venc(len(flags), buf)
            for f in flags:
                sid(f, buf)
            if source is not None:
                sid(source[0], buf)
                venc(source[1], buf)
            venc(len(refs), buf)
            for role, items in refs:
                venc(role, buf)
                if role == 4:
                    venc(len(items), buf)
                    for pname, types in items:
                        sid(pname, buf)
                        self.types(types, buf)
                else:
                    self.types(items, buf)
            venc(len(sections), buf)
            for title, lines in sections:
                sid(title, buf)
                venc(len(lines), buf)
                for line in lines:
                    sid(line, buf)
            venc(len(docs), buf)
            for dname, element, link, target, anchor in docs:
                sid(dname, buf)
                venc(self.mark(link, target, anchor) | (8 if element is not None else 0), buf)
                if element is not None:
                    sid(element, buf)
                self.linked(link, target, anchor, buf, False)
        venc(len(r['deps']), buf)
        for label, link, target, anchor, syms, quals in r['deps']:
            sid(label, buf)
            venc(self.mark(link, target, anchor) | (8 if syms is not None else 0), buf)
            self.linked(link, target, anchor, buf, True)
            if syms is not None:
                venc(len(syms), buf)
                for s in syms:
                    sid(s, buf)
            venc(len(quals), buf)
            for q in quals:
                sid(q, buf)
        if r['cited'] is not None:
            venc(len(r['cited']), buf)
            for label, link in r['cited']:
                sid(label, buf)
                sid(link, buf)
        if r['rex'] is not None:
            venc(len(r['rex']), buf)
            for name, slug, fl, fk, flags in r['rex']:
                sid(name, buf)
                venc((1 if slug is not None else 0) | (2 if fl is not None else 0), buf)
                if slug is not None:
                    sid(slug, buf)
                if fl is not None:
                    sid(fl, buf)
                    sid(fk, buf)
                venc(len(flags), buf)
                for f in flags:
                    sid(f, buf)


def content_name(sections):
    """Section 3.4: the SHA-256 of every frame's hash before the end, joined in order."""
    return hashlib.sha256(b''.join(hashlib.sha256(raw).digest() for _, _, raw in sections)).digest()


def scan_of_text(data):
    """The facts of a text form, set down, read back with every check, and written
    again as text: the text is valid exactly when that gives its own bytes (section 8)."""
    head, left_out, records = TextReader().read(data)
    sections = SectionWriter(head, left_out, records).sections
    strings_declared = sum(len(raw) for k, _, raw in sections if k == STRINGS)
    scan = Scan(sections, strings_declared, content_name(sections))
    scan.validate()
    buf = io.BytesIO()
    scan.write_text(buf)
    again = buf.getvalue()
    if again != data:
        a = data.split(b'\n')
        b = again.split(b'\n')
        for i in range(min(len(a), len(b))):
            if a[i] != b[i]:
                refuse('line %d is not written in the text\'s one form (sections 8, 8.1)' % (i + 1))
        refuse('the text is not in its one form (section 8)')
    return scan, sections


def file_of_sections(sections, level=9):
    """The bytes of a finished file holding these uncompressed sections (zlib's raw deflate).
    Not used by the three modes; the tests use it to make files."""
    parts = [SIGNATURE]
    hashes = []
    for kind, count, raw in sections:
        co = zlib.compressobj(level, zlib.DEFLATED, -15)
        st = co.compress(raw) + co.flush()
        h = hashlib.sha256(raw).digest()
        hashes.append(h)
        parts.append(struct.pack('<BIII', kind, count, len(raw), len(st)) + h + st)
    name = hashlib.sha256(b''.join(hashes)).digest()
    co = zlib.compressobj(level, zlib.DEFLATED, -15)
    st = co.compress(name) + co.flush()
    parts.append(struct.pack('<BIII', END, len(sections), 32, len(st)) + hashlib.sha256(name).digest() + st)
    return b''.join(parts)


# ---------------------------------------------------------------- the program

def answer(mode, data, stdout):
    """Write the answer for one input; return 0 for facts, 1 for a refusal."""
    try:
        if mode == 'name':
            scan, _ = scan_of_text(data)
        else:
            scan = open_file(data)
            scan.validate()
    except Refused as e:
        msg = ' '.join(str(e).split())
        stdout.write(b'refused: ' + msg.encode('utf-8', 'backslashreplace') + b'\n')
        return 1
    if mode == 'name':
        stdout.write(scan.name.hex().encode('ascii') + b'\n')
        return 0
    if mode == 'read':
        scan.write_text(stdout)
    else:
        scan.write_graph(stdout)
    return 0


def main(argv):
    sys.stdout.flush()
    stdout = io.BufferedWriter(io.FileIO(sys.stdout.fileno(), 'wb', closefd=False), 1 << 20)
    if len(argv) != 3 or argv[1] not in ('read', 'name', 'graph'):
        stdout.write(b'refused: usage: reader.py read|name|graph <file>\n')
        return 2
    try:
        with open(argv[2], 'rb') as f:
            data = f.read()
    except OSError as e:
        stdout.write(b'refused: cannot read the file: ' + str(e.strerror or 'error').encode('utf-8', 'replace') + b'\n')
        return 1
    code = answer(argv[1], data, stdout)
    stdout.flush()
    return code


def run():
    try:
        code = main(sys.argv)
    except BrokenPipeError:
        code = 0
    except MemoryError:
        sys.stdout.write('refused: out of memory\n')
        code = 1
    except Exception as e:          # never a traceback; reaching here is a bug in this reader
        sys.stdout.write('refused: internal error (%s)\n' % type(e).__name__)
        code = 3
    try:
        sys.stdout.flush()
    except Exception:
        pass
    sys.exit(code)


if __name__ == '__main__':
    run()

#!/usr/bin/env python3
"""Reader of the stored form of a scan's facts (specification.md).

    python3 reader.py read <file.fpk>   print the text form (section 8), or one `refused:` line
    python3 reader.py name <file.txt>   print the content's name (section 3.4), or one `refused:` line

Standard library only.  Exit status: 0 for an answer, 1 for a refusal, 2 for a usage error.
"""
import hashlib
import json
import struct
import sys
import zlib

SIGNATURE = bytes([0x89, 0x46, 0x50, 0x4B, 0x0D, 0x0A, 0x1A, 0x0A])
MAX_U32 = 2 ** 32 - 1
MIB = 1048576
MAX_SECTION = 64 * MIB
HEADER = 45
RECORDS_PER_SECTION = 256
K_HEAD, K_STRINGS, K_RECORDS, K_PATHS, K_WIRES, K_END = 1, 2, 3, 4, 5, 6
KIND_NAMES = {1: "head", 2: "strings", 3: "records", 4: "paths", 5: "wires", 6: "end"}
REASONS = ["program", "command", "module", "opening", "tooling", "declared"]
ROLES = ["Returns", "Extends", "Implements", "Constraints", "Parameters"]
ROLE_PARAMETERS = 4


class Refused(Exception):
    pass


def refuse(why):
    raise Refused(why)


def q(s):
    """A string from the file, quoted for a refusal: escaped to one line, and cut short."""
    r = repr(s)
    return r if len(r) <= 80 else r[:60] + "...(%d characters)" % len(s)


# ---------------------------------------------------------------- section 2.4

def _ascii_letter(c):
    return ("A" <= c <= "Z") or ("a" <= c <= "z")


def _ascii_lower(s):
    return "".join(chr(ord(c) + 32) if "A" <= c <= "Z" else c for c in s)


def _absolute_why(s):
    """The three refusals a link and a path share; None when there is none."""
    if s[:1] in ("/", "\\"):
        return "begins with / or \\"
    if len(s) >= 2 and _ascii_letter(s[0]) and s[1] == ":":
        return "begins with a drive"
    if _ascii_lower(s[:5]) == "file:":
        return "begins with file:"
    return None


def check_path(s, what):
    if s == "":
        refuse("%s is empty" % what)
    why = _absolute_why(s)
    if why:
        refuse("%s %s %s" % (what, q(s), why))
    if "\x00" in s:
        refuse("%s %s holds U+0000" % (what, q(s)))
    for seg in s.split("/"):
        if seg in ("", ".", ".."):
            refuse("%s %s has a segment that is empty, . or .." % (what, q(s)))
    return s


def check_link(s, what):
    why = _absolute_why(s)
    if why:
        refuse("%s %s %s" % (what, q(s), why))
    return s


def check_folder(s, what):
    if s != "":
        check_path(s, what)
    return s


def check_extension(s):
    if "/" in s:
        refuse("extension %s holds /" % q(s))
    return s


# ---------------------------------------------------------------- section 2.1, 2.2

def decode_utf8(b, what):
    # Python's strict UTF-8 codec follows table 3-7: it refuses overlong forms, surrogates,
    # code points above U+10FFFF, stray bytes and cut sequences, and keeps a leading U+FEFF.
    try:
        return bytes(b).decode("utf-8", "strict")
    except UnicodeDecodeError as e:
        refuse("%s is not well-formed UTF-8 (byte %d)" % (what, e.start))


class Buf:
    def __init__(self, data, what):
        self.d = data
        self.p = 0
        self.n = len(data)
        self.what = what

    def left(self):
        return self.n - self.p

    def u8(self):
        if self.p >= self.n:
            refuse("%s ends inside a value" % self.what)
        v = self.d[self.p]
        self.p += 1
        return v

    def varint(self):
        p = self.p
        if p < self.n and self.d[p] < 0x80:
            self.p = p + 1
            return self.d[p]
        v = 0
        for i in range(5):
            if self.p >= self.n:
                refuse("%s ends inside a varint" % self.what)
            b = self.d[self.p]
            self.p += 1
            v |= (b & 0x7F) << (7 * i)
            if not b & 0x80:
                if b == 0 and i > 0:
                    refuse("%s: varint not in its shortest form" % self.what)
                if v > MAX_U32:
                    refuse("%s: varint above 2^32-1" % self.what)
                return v
        refuse("%s: varint longer than five bytes" % self.what)

    def count(self, least=1):
        n = self.varint()
        if n * least > self.left():
            refuse("%s: count %d is larger than the bytes left" % (self.what, n))
        return n

    def mark(self, defined, what):
        m = self.varint()
        if m & ~defined:
            refuse("%s: %s mark has an undefined bit (%d)" % (self.what, what, m))
        return m

    def take(self, n):
        if n > self.left():
            refuse("%s: length %d runs past the section's end" % (self.what, n))
        b = self.d[self.p:self.p + n]
        self.p += n
        return b

    def text_bytes(self):
        return bytes(self.take(self.varint()))

    def text(self, what):
        return decode_utf8(self.text_bytes(), "%s: %s" % (self.what, what))

    def end(self):
        if self.p != self.n:
            refuse("%s: %d bytes after its last item" % (self.what, self.n - self.p))


def varint_bytes(v):
    out = bytearray()
    while True:
        b = v & 0x7F
        v >>= 7
        if v:
            out.append(b | 0x80)
        else:
            out.append(b)
            return bytes(out)


# ---------------------------------------------------------------- section 8.1

_ESC = {0x22: '\\"', 0x5C: "\\\\", 0x08: "\\b", 0x09: "\\t", 0x0A: "\\n", 0x0C: "\\f", 0x0D: "\\r"}
for _c in range(0x20):
    _ESC.setdefault(_c, "\\u%04x" % _c)


def jstr(s):
    return '"' + s.translate(_ESC) + '"'


def render(v, out):
    """Write the one form of JSON value v (section 8.1), piece by piece, into out (a list)."""
    if v is None:
        out.append("null")
    elif v is True:
        out.append("true")
    elif type(v) is int:
        out.append(str(v))
    elif type(v) is str:
        out.append(jstr(v))
    elif type(v) is list:
        out.append("[")
        first = True
        for x in v:
            if not first:
                out.append(",")
            first = False
            render(x, out)
        out.append("]")
    elif type(v) is dict:
        out.append("{")
        first = True
        for k, x in v.items():
            if not first:
                out.append(",")
            first = False
            out.append(jstr(k))
            out.append(":")
            render(x, out)
        out.append("}")
    else:
        raise AssertionError("no form for %r" % (v,))


def head_lines(head):
    yield [None, "format", "fact-pack", 1]
    yield [None, "location", head["root"], head["baseLayer"], head["extension"]]
    yield [None, "scanner", head["scanner"]]
    for reason, number, detail in head["leftOut"]:
        yield [None, "left-out", reason, number, detail]


def record_lines(r):
    p = r["path"]
    yield [p, "file", r["layer"], r["archetype"], r["generatedAt"]]
    yield [p, "authored", r["authored"]]
    for e in r["entries"]:
        yield [p, "entry", e]
    for s in r["symbols"]:
        yield [p, "symbol", s]
    for d in r["dependencies"]:
        yield [p, "dependency", d]
    if r["citedBy"] is not None:
        yield [p, "cited-by", r["citedBy"]]
    if r["reExports"] is not None:
        yield [p, "re-exports", r["reExports"]]


class Pieces:
    """Gathers rendered pieces and hands them on in blocks of about a mebibyte, so that a line
    far longer than the file (a string named many times) is written without being held whole."""

    def __init__(self, sink):
        self.sink = sink
        self.parts = []
        self.size = 0

    def append(self, s):
        self.parts.append(s)
        self.size += len(s)
        if self.size >= MIB:
            self.flush()

    def flush(self):
        if self.parts:
            self.sink("".join(self.parts).encode("utf-8"))
            self.parts = []
            self.size = 0


def write_line(v, out):
    render(v, out)
    out.append("\n")


# ---------------------------------------------------------------- section 3: frames

def inflate(data, f):
    """Inflate one frame's stored bytes, bounded by its rawLength (section 3.2, 3.5)."""
    name = KIND_NAMES[f["kind"]]
    raw = f["raw"]
    d = zlib.decompressobj(-15)
    try:
        out = d.decompress(data[f["at"]:f["at"] + f["stored"]], raw + 1)
    except zlib.error as e:
        refuse("%s section (frame %d): not a raw deflate stream (%s)" % (name, f["index"], e))
    if len(out) > raw:
        refuse("%s section (frame %d) inflates to more than its rawLength %d" % (name, f["index"], raw))
    if not d.eof:
        refuse("%s section (frame %d): deflate stream does not end" % (name, f["index"]))
    if d.unused_data or d.unconsumed_tail:
        refuse("%s section (frame %d): bytes after the deflate stream's end" % (name, f["index"]))
    if len(out) != raw:
        refuse("%s section (frame %d) inflates to %d bytes, not its rawLength %d"
               % (name, f["index"], len(out), raw))
    if hashlib.sha256(out).digest() != f["hash"]:
        refuse("%s section (frame %d): SHA-256 does not match its hash" % (name, f["index"]))
    return out


def hop_frames(data):
    """Steps 1 and 2 of section 6."""
    if len(data) < 8 or data[:8] != SIGNATURE:
        refuse("not this format: the signature is wrong")
    bound = 64 * len(data) + MIB
    total = 0
    frames = []
    p = 8
    while True:
        if p == len(data):
            refuse("unfinished: the file stops before an end frame")
        if len(data) - p < HEADER:
            refuse("unfinished: a frame header is cut short at byte %d" % p)
        kind, count, raw, stored = struct.unpack_from("<BIII", data, p)
        i = len(frames)
        if kind not in KIND_NAMES:
            refuse("frame %d has kind %d, which is not a kind" % (i, kind))
        if raw > MAX_SECTION:
            refuse("limit: frame %d's rawLength %d is above MAX_SECTION" % (i, raw))
        if raw > 1032 * stored + 1024:
            refuse("limit: frame %d's rawLength %d is more than raw deflate can give from %d bytes"
                   % (i, raw, stored))
        total += raw
        if total > bound:
            refuse("limit: the sections together inflate to more than 64 x file length + 1 MiB")
        if stored > len(data) - p - HEADER:
            refuse("limit: frame %d's storedLength runs past the file's end" % i)
        frames.append({"index": i, "kind": kind, "count": count, "raw": raw, "stored": stored,
                       "hash": bytes(data[p + 13:p + 45]), "at": p + HEADER})
        p += HEADER + stored
        if kind == K_END:
            break
    if p != len(data):
        refuse("%d bytes after the end frame" % (len(data) - p))
    return frames


def check_order(frames):
    """Step 3 of section 6 (section 3.3).  Returns the strings/records frames and the file count."""
    kinds = [f["kind"] for f in frames]
    if kinds[0] != K_HEAD:
        refuse("order: the first frame is not the head")
    if frames[0]["count"] != 0:
        refuse("order: the head's count is not 0")
    i = 1
    body = []
    records = []
    while kinds[i] in (K_STRINGS, K_RECORDS):
        if kinds[i] == K_STRINGS:
            if kinds[i + 1] != K_RECORDS:
                refuse("order: strings frame %d is not immediately before a records frame" % i)
            if frames[i]["count"] < 1:
                refuse("order: strings frame %d holds no string" % i)
            if frames[i]["count"] > frames[i]["raw"]:
                refuse("strings frame %d: count is larger than its raw length" % i)
            body.append(frames[i])
            i += 1
        f = frames[i]
        if f["count"] > f["raw"]:
            refuse("records frame %d: count is larger than its raw length" % i)
        records.append(f)
        body.append(f)
        i += 1
    for j, f in enumerate(records):
        c = f["count"]
        if j < len(records) - 1 and c != RECORDS_PER_SECTION:
            refuse("order: records frame %d holds %d files; only the last may hold fewer than 256"
                   % (f["index"], c))
        if not 1 <= c <= RECORDS_PER_SECTION:
            refuse("order: records frame %d holds %d files, not 1 to 256" % (f["index"], c))
    if kinds[i:] != [K_PATHS, K_WIRES, K_END]:
        refuse("order: after the head and the strings and records come not paths, wires, end")
    n = sum(f["count"] for f in records)
    paths, wires, end = frames[i], frames[i + 1], frames[i + 2]
    if paths["count"] != n:
        refuse("order: the paths' count %d is not the %d files the records hold" % (paths["count"], n))
    if wires["count"] != n:
        refuse("order: the wires' count %d is not the %d files the records hold" % (wires["count"], n))
    if 2 * paths["count"] > paths["raw"]:
        refuse("paths frame: count is larger than its raw length allows")
    if wires["count"] > wires["raw"]:
        refuse("wires frame: count is larger than its raw length")
    if end["count"] != len(frames) - 1:
        refuse("order: the end's count %d is not the %d frames before it" % (end["count"], len(frames) - 1))
    if end["raw"] != 32:
        refuse("order: the end's rawLength is not 32")
    return body, paths, wires, end, n


# ---------------------------------------------------------------- section 4: the sections

def read_head(raw):
    b = Buf(raw, "head")
    v = b.u8()
    if v != 1:
        refuse("head: version %d is not 1, the version this reader reads" % v)
    head = {"root": b.text("root"), "baseLayer": b.text("baseLayer"),
            "extension": b.text("extension"), "scanner": b.text("scanner")}
    check_folder(head["root"], "head: root")
    check_folder(head["baseLayer"], "head: baseLayer")
    check_extension(head["extension"])
    left = []
    for _ in range(b.count(3)):
        reason = b.text("left-out reason")
        number = b.varint()
        detail = b.text("left-out detail")
        left.append((reason, number, detail))
    b.end()
    head["leftOut"] = left
    return head


def read_paths(raw, n, limit):
    b = Buf(raw, "paths")
    prev = b""
    out = []
    total = 0
    for i in range(n):
        shared = b.varint()
        rest_len = b.varint()
        if shared > len(prev):
            refuse("paths: path %d shares %d bytes of a %d-byte path" % (i, shared, len(prev)))
        rest = bytes(b.take(rest_len))
        if rest and shared < len(prev) and rest[0] == prev[shared]:
            refuse("paths: path %d does not share the longest beginning" % i)
        total += shared + rest_len
        if total > limit:
            refuse("paths: the paths together are longer than the strings sections")
        pb = prev[:shared] + rest
        s = decode_utf8(pb, "paths: path %d" % i)
        check_path(s, "paths: path %d" % i)
        if i > 0 and not pb > prev:
            refuse("paths: path %d %s is not after the one before in path order" % (i, q(s)))
        out.append(s)
        prev = pb
    b.end()
    return out


def read_wires(raw, n):
    b = Buf(raw, "wires")
    out = []
    for i in range(n):
        k = b.count()
        lst = []
        if k:
            w = b.varint()
            if w >= n:
                refuse("wires: file %d names file %d, beyond the %d files" % (i, w, n))
            lst.append(w)
            for _ in range(k - 1):
                w = w + b.varint() + 1
                if w >= n:
                    refuse("wires: file %d names file %d, beyond the %d files" % (i, w, n))
                lst.append(w)
            if i in lst:
                refuse("wires: file %d names itself" % i)
        out.append(lst)
    b.end()
    return out


def read_strings(raw, count, table, seen):
    b = Buf(raw, "strings")
    for _ in range(count):
        tb = b.text_bytes()
        if tb in seen:
            refuse("strings: string %d appears twice" % len(table))
        seen.add(tb)
        table.append(decode_utf8(tb, "strings: string %d" % len(table)))
    b.end()


class RecordReader:
    """Reads records (section 4.3) in first-met sid order."""

    def __init__(self, table):
        self.table = table
        self.met = 0

    def start(self, raw, what):
        self.b = Buf(raw, what)

    def sid(self):
        v = self.b.varint()
        if v < self.met:
            return self.table[v]
        if v == self.met:
            if v >= len(self.table):
                refuse("%s: sid %d names a string not yet set down" % (self.b.what, v))
            self.met += 1
            return self.table[v]
        refuse("%s: sid %d is past the next string to be met (%d)" % (self.b.what, v, self.met))

    def list(self, item):
        return [item() for _ in range(self.b.count())]

    def link(self, what):
        return check_link(self.sid(), "%s: %s" % (self.b.what, what))

    def linked(self, m, d):
        if m & 2 and not m & 1:
            refuse("%s: a target without a link" % self.b.what)
        if m & 4 and not m & 2:
            refuse("%s: an anchor without a target" % self.b.what)
        if m & 1:
            d["link"] = self.link("link")
        if m & 2:
            d["target"] = check_path(self.sid(), "%s: target" % self.b.what)
        if m & 4:
            d["anchor"] = self.sid()

    def record(self):
        b = self.b
        r = {"path": check_path(self.sid(), "%s: path" % b.what)}
        r["layer"] = b.varint()
        fm = b.mark(0xF, "file")
        r["archetype"] = self.sid() if fm & 1 else None
        r["entries"] = self.list(self.entry)
        r["generatedAt"] = self.sid() if fm & 2 else None
        r["authored"] = self.sid()
        r["symbols"] = self.list(self.symbol)
        r["dependencies"] = self.list(self.dependency)
        r["citedBy"] = self.list(self.cited_by) if fm & 4 else None
        r["reExports"] = self.list(self.re_export) if fm & 8 else None
        return r

    def entry(self):
        b = self.b
        reason = b.varint()
        if reason >= len(REASONS):
            refuse("%s: entry reason %d is not one of 0 to 5" % (b.what, reason))
        m = b.mark(0xF, "entry")
        if m & 2 and not m & 1:
            refuse("%s: entry has a symbol link without a symbol name" % b.what)
        e = {"reason": REASONS[reason]}
        if m & 1:
            s = {"name": self.sid()}
            if m & 2:
                s["link"] = self.link("symbol link")
            e["symbol"] = s
        if m & 4:
            e["command"] = self.sid()
        if m & 8:
            label = self.sid()
            e["declarer"] = {"label": label, "link": self.link("declarer link")}
        return e

    def symbol(self):
        b = self.b
        s = {"name": self.sid()}
        m = b.mark(3, "symbol")
        if m & 1:
            s["slug"] = self.sid()
        s["kind"] = self.sid()
        s["flags"] = self.list(self.sid)
        if m & 2:
            path = self.link("source path")
            s["source"] = {"path": path, "line": b.varint()}
        s["references"] = self.list(self.reference)
        s["sections"] = self.list(self.section)
        return s

    def reference(self):
        role = self.b.varint()
        if role >= len(ROLES):
            refuse("%s: reference role %d is not one of 0 to 4" % (self.b.what, role))
        if role == ROLE_PARAMETERS:
            return {"role": "Parameters", "parameters": self.list(self.parameter)}
        return {"role": ROLES[role], "types": self.list(self.type)}

    def parameter(self):
        name = self.sid()
        return {"name": name, "types": self.list(self.type)}

    def type(self):
        t = {"name": self.sid()}
        m = self.b.mark(0x1F, "type")
        self.linked(m, t)
        if m & 8:
            t["array"] = True
        if m & 16:
            t["promise"] = True
        return t

    def section(self):
        title = self.sid()
        return {"title": title, "body": self.list(self.sid)}

    def dependency(self):
        d = {"label": self.sid()}
        m = self.b.mark(0xF, "dependency")
        self.linked(m, d)
        if m & 8:
            d["symbols"] = self.list(self.sid)
        d["qualifiers"] = self.list(self.sid)
        return d

    def cited_by(self):
        label = self.sid()
        return {"label": label, "link": self.link("cited-by link")}

    def re_export(self):
        r = {"name": self.sid()}
        m = self.b.mark(3, "re-export")
        if m & 1:
            r["slug"] = self.sid()
        if m & 2:
            label = self.sid()
            r["from"] = {"label": label, "link": self.link("re-export from link")}
        r["flags"] = self.list(self.sid)
        return r


def record_targets(r):
    """The targets of the links that make edges (section 5), in order."""
    for d in r["dependencies"]:
        if "target" in d:
            yield d["target"]
    for s in r["symbols"]:
        for ref in s["references"]:
            groups = [p["types"] for p in ref["parameters"]] if "parameters" in ref else [ref["types"]]
            for types in groups:
                for t in types:
                    if "target" in t:
                        yield t["target"]


def wires_of(r, index_of, own):
    out = set()
    for t in record_targets(r):
        j = index_of.get(t)
        if j is not None and j != own:
            out.add(j)
    return sorted(out)


# ---------------------------------------------------------------- section 6: reading

def read_scan(data, write):
    frames = hop_frames(data)                                          # 1, 2
    body, paths_f, wires_f, end_f, n = check_order(frames)             # 3
    name = hashlib.sha256(b"".join(f["hash"] for f in frames[:-1])).digest()
    if inflate(data, end_f) != name:                                   # 4
        refuse("end: the content's name does not match the frames' hashes")
    head = read_head(inflate(data, frames[0]))                         # 5
    strings_len = sum(f["raw"] for f in body if f["kind"] == K_STRINGS)
    paths = read_paths(inflate(data, paths_f), n, strings_len)
    wires = read_wires(inflate(data, wires_f), n)
    index_of = {p: i for i, p in enumerate(paths)}

    # 6: the whole read.  Every check is made before a byte is written; the records'
    # uncompressed bytes are kept so that the text can then be written record by record.
    table, seen = [], set()
    rr = RecordReader(table)
    kept = []
    i = 0
    for f in body:
        raw = inflate(data, f)
        if f["kind"] == K_STRINGS:
            read_strings(raw, f["count"], table, seen)
            continue
        rr.start(raw, "records (frame %d)" % f["index"])
        for _ in range(f["count"]):
            r = rr.record()
            if r["path"] != paths[i]:
                refuse("records: file %d's path %s is not the paths section's %s" % (i, q(r["path"]), q(paths[i])))
            if wires_of(r, index_of, i) != wires[i]:
                refuse("records: file %d's links do not give the wires section's wires" % i)
            i += 1
        rr.b.end()
        if rr.met != len(table):
            refuse("strings: string %d is set down but never met" % rr.met)
        kept.append((raw, f["count"], f["index"]))

    # The file is canonical; write its text.
    sink = Pieces(write)
    for v in head_lines(head):
        write_line(v, sink)
    rr.met = 0
    for raw, count, index in kept:
        rr.start(raw, "records (frame %d)" % index)
        for _ in range(count):
            for v in record_lines(rr.record()):
                write_line(v, sink)
    write_line([None, "end", n], sink)
    sink.flush()


# ---------------------------------------------------------------- section 8: the text form

def t_str(x, what):
    if type(x) is not str:
        refuse("%s is not a string" % what)
    try:
        x.encode("utf-8")
    except UnicodeEncodeError:
        refuse("%s holds an unpaired surrogate" % what)
    return x


def t_num(x, what):
    if type(x) is not int or not 0 <= x <= MAX_U32:
        refuse("%s is not a whole number from 0 to 2^32-1" % what)
    return x


def t_list(x, item, what):
    if type(x) is not list:
        refuse("%s is not an array" % what)
    return [item(v, what) for v in x]


def t_obj(x, keys, required, what):
    if type(x) is not dict:
        refuse("%s is not an object" % what)
    for k in x:
        if k not in keys:
            refuse("%s has a member %s it does not have" % (what, q(k)))
    for k in required:
        if k not in x:
            refuse("%s lacks its member %s" % (what, q(k)))
    return x


def t_true(x, what):
    if x is not True:
        refuse("%s is not true" % what)
    return True


def t_link(x, what):
    return check_link(t_str(x, what), what)


def t_linked(o, d, what):
    if "link" in o:
        d["link"] = t_link(o["link"], what + " link")
    if "target" in o:
        if "link" not in o:
            refuse("%s has a target without a link" % what)
        d["target"] = check_path(t_str(o["target"], what + " target"), what + " target")
    if "anchor" in o:
        if "target" not in o:
            refuse("%s has an anchor without a target" % what)
        d["anchor"] = t_str(o["anchor"], what + " anchor")


def t_type(x, what):
    o = t_obj(x, ("name", "link", "target", "anchor", "array", "promise"), ("name",), "type")
    t = {"name": t_str(o["name"], "type name")}
    t_linked(o, t, "type")
    if "array" in o:
        t["array"] = t_true(o["array"], "type array")
    if "promise" in o:
        t["promise"] = t_true(o["promise"], "type promise")
    return t


def t_parameter(x, what):
    o = t_obj(x, ("name", "types"), ("name", "types"), "parameter")
    return {"name": t_str(o["name"], "parameter name"), "types": t_list(o["types"], t_type, "types")}


def t_reference(x, what):
    if type(x) is dict and x.get("role") == "Parameters":
        o = t_obj(x, ("role", "parameters"), ("role", "parameters"), "reference")
        return {"role": "Parameters", "parameters": t_list(o["parameters"], t_parameter, "parameters")}
    o = t_obj(x, ("role", "types"), ("role", "types"), "reference")
    if o["role"] not in ROLES[:ROLE_PARAMETERS]:
        refuse("reference role %s is not a role" % q(o["role"]))
    return {"role": o["role"], "types": t_list(o["types"], t_type, "types")}


def t_section(x, what):
    o = t_obj(x, ("title", "body"), ("title", "body"), "section")
    return {"title": t_str(o["title"], "section title"), "body": t_list(o["body"], t_str, "section line")}


def t_entry(x):
    o = t_obj(x, ("reason", "symbol", "command", "declarer"), ("reason",), "entry")
    if o["reason"] not in REASONS:
        refuse("entry reason %s is not a reason" % q(o["reason"]))
    e = {"reason": o["reason"]}
    if "symbol" in o:
        so = t_obj(o["symbol"], ("name", "link"), ("name",), "entry symbol")
        s = {"name": t_str(so["name"], "entry symbol name")}
        if "link" in so:
            s["link"] = t_link(so["link"], "entry symbol link")
        e["symbol"] = s
    if "command" in o:
        e["command"] = t_str(o["command"], "entry command")
    if "declarer" in o:
        do = t_obj(o["declarer"], ("label", "link"), ("label", "link"), "entry declarer")
        e["declarer"] = {"label": t_str(do["label"], "declarer label"),
                         "link": t_link(do["link"], "declarer link")}
    return e


def t_symbol(x):
    o = t_obj(x, ("name", "slug", "kind", "flags", "source", "references", "sections"),
              ("name", "kind", "flags", "references", "sections"), "symbol")
    s = {"name": t_str(o["name"], "symbol name")}
    if "slug" in o:
        s["slug"] = t_str(o["slug"], "symbol slug")
    s["kind"] = t_str(o["kind"], "symbol kind")
    s["flags"] = t_list(o["flags"], t_str, "symbol flag")
    if "source" in o:
        so = t_obj(o["source"], ("path", "line"), ("path", "line"), "symbol source")
        s["source"] = {"path": t_link(so["path"], "source path"), "line": t_num(so["line"], "source line")}
    s["references"] = t_list(o["references"], t_reference, "references")
    s["sections"] = t_list(o["sections"], t_section, "sections")
    return s


def t_dependency(x):
    o = t_obj(x, ("label", "link", "target", "anchor", "symbols", "qualifiers"),
              ("label", "qualifiers"), "dependency")
    d = {"label": t_str(o["label"], "dependency label")}
    t_linked(o, d, "dependency")
    if "symbols" in o:
        d["symbols"] = t_list(o["symbols"], t_str, "dependency symbol")
    d["qualifiers"] = t_list(o["qualifiers"], t_str, "dependency qualifier")
    return d


def t_cited(x, what):
    o = t_obj(x, ("label", "link"), ("label", "link"), "cited-by")
    return {"label": t_str(o["label"], "cited-by label"), "link": t_link(o["link"], "cited-by link")}


def t_reexport(x, what):
    o = t_obj(x, ("name", "slug", "from", "flags"), ("name", "flags"), "re-export")
    r = {"name": t_str(o["name"], "re-export name")}
    if "slug" in o:
        r["slug"] = t_str(o["slug"], "re-export slug")
    if "from" in o:
        fo = t_obj(o["from"], ("label", "link"), ("label", "link"), "re-export from")
        r["from"] = {"label": t_str(fo["label"], "from label"), "link": t_link(fo["link"], "from link")}
    r["flags"] = t_list(o["flags"], t_str, "re-export flag")
    return r


def t_opt_str(x, what):
    return None if x is None else t_str(x, what)


def parse_text(data):
    """Reads a text form into facts (head, records), refusing any text that is not the one text."""
    text = decode_utf8(data, "the text")
    if not text.endswith("\n"):
        refuse("the text's last line does not end with LF")
    lines = text[:-1].split("\n")
    values = []
    for k, line in enumerate(lines):
        if "\r" in line:
            refuse("line %d holds a CR" % (k + 1))
        try:
            v = json.loads(line)
        except (ValueError, RecursionError) as e:
            refuse("line %d is not one JSON value (%s)" % (k + 1, str(e).split("\n")[0][:80]))
        if type(v) is not list or len(v) < 2 or type(v[1]) is not str:
            refuse("line %d is not a fact line" % (k + 1))
        values.append(v)

    pos = 0

    def at(k, n, what):
        if k >= len(values):
            refuse("the text stops before its %s line" % what)
        v = values[k]
        if v[1] != what or v[0] is not None or len(v) != n:
            refuse("line %d is not the %s line" % (k + 1, what))
        return v

    v = at(0, 4, "format")
    if v[2] != "fact-pack" or type(v[3]) is not int:
        refuse("line 1 is not the format line")
    if v[3] != 1:
        refuse("version %s is not 1, the version this reader reads" % q(v[3]))
    v = at(1, 5, "location")
    head = {"root": check_folder(t_str(v[2], "root"), "root"),
            "baseLayer": check_folder(t_str(v[3], "baseLayer"), "baseLayer"),
            "extension": check_extension(t_str(v[4], "extension"))}
    v = at(2, 3, "scanner")
    head["scanner"] = t_str(v[2], "scanner")
    head["leftOut"] = []
    pos = 3
    while pos < len(values) and values[pos][0] is None and values[pos][1] == "left-out":
        v = at(pos, 5, "left-out")
        head["leftOut"].append((t_str(v[2], "left-out reason"), t_num(v[3], "left-out number"),
                                t_str(v[4], "left-out detail")))
        pos += 1

    records = []
    prev = None
    while pos < len(values) and values[pos][0] is not None:
        v = values[pos]
        path = t_str(v[0], "line %d's path" % (pos + 1))
        if v[1] != "file" or len(v) != 5:
            refuse("line %d is not a file line, which must begin each file" % (pos + 1))
        check_path(path, "path")
        pb = path.encode("utf-8")
        if prev is not None and not pb > prev:
            refuse("file %s is not after the one before in path order" % q(path))
        prev = pb
        r = {"path": path, "layer": t_num(v[2], "layer"),
             "archetype": t_opt_str(v[3], "archetype"), "generatedAt": t_opt_str(v[4], "generatedAt"),
             "entries": [], "symbols": [], "dependencies": [], "citedBy": None, "reExports": None}
        pos += 1
        if pos >= len(values) or values[pos][0] != path or values[pos][1] != "authored" \
                or len(values[pos]) != 3:
            refuse("line %d is not the authored line of %s" % (pos + 1, q(path)))
        r["authored"] = t_str(values[pos][2], "authored")
        pos += 1
        while pos < len(values) and values[pos][0] == path:
            v = values[pos]
            if len(v) != 3:
                refuse("line %d does not have three values" % (pos + 1))
            what = v[1]
            if what == "entry":
                r["entries"].append(t_entry(v[2]))
            elif what == "symbol":
                r["symbols"].append(t_symbol(v[2]))
            elif what == "dependency":
                r["dependencies"].append(t_dependency(v[2]))
            elif what == "cited-by" and r["citedBy"] is None:
                r["citedBy"] = t_list(v[2], t_cited, "cited-by")
            elif what == "re-exports" and r["reExports"] is None:
                r["reExports"] = t_list(v[2], t_reexport, "re-exports")
            else:
                refuse("line %d is not a fact line of %s here" % (pos + 1, q(path)))
            pos += 1
        records.append(r)

    v = at(pos, 3, "end")
    if t_num(v[2], "the end's number") != len(records):
        refuse("the end line says %s files, but the text has %d" % (q(v[2]), len(records)))
    if pos + 1 != len(values):
        refuse("line %d comes after the end line" % (pos + 2))

    # The one text for these facts must be the text given, byte for byte.
    out = []
    sink = Pieces(out.append)
    for v in head_lines(head):
        write_line(v, sink)
    for r in records:
        for v in record_lines(r):
            write_line(v, sink)
    write_line([None, "end", len(records)], sink)
    sink.flush()
    again = b"".join(out)
    if again != data:
        a, b = again.split(b"\n"), data.split(b"\n")
        k = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
        refuse("line %d is not written in the one form of section 8 for what it says" % (k + 1))
    return head, records


# ---------------------------------------------------------------- writing sections (for the name)

def text_bytes(s):
    b = s.encode("utf-8")
    return varint_bytes(len(b)) + b


class RecordWriter:
    def __init__(self):
        self.ids = {}
        self.new = []
        self.out = bytearray()

    def sid(self, s):
        b = s.encode("utf-8")
        i = self.ids.get(b)
        if i is None:
            i = self.ids[b] = len(self.ids)
            self.new.append(b)
        self.out += varint_bytes(i)

    def v(self, n):
        self.out += varint_bytes(n)

    def list(self, items, f):
        self.v(len(items))
        for x in items:
            f(x)

    def linked_mark(self, d):
        return (1 if "link" in d else 0) | (2 if "target" in d else 0) | (4 if "anchor" in d else 0)

    def linked(self, d):
        for k in ("link", "target", "anchor"):
            if k in d:
                self.sid(d[k])

    def record(self, r):
        self.sid(r["path"])
        self.v(r["layer"])
        fm = ((1 if r["archetype"] is not None else 0) | (2 if r["generatedAt"] is not None else 0)
              | (4 if r["citedBy"] is not None else 0) | (8 if r["reExports"] is not None else 0))
        self.v(fm)
        if fm & 1:
            self.sid(r["archetype"])
        self.list(r["entries"], self.entry)
        if fm & 2:
            self.sid(r["generatedAt"])
        self.sid(r["authored"])
        self.list(r["symbols"], self.symbol)
        self.list(r["dependencies"], self.dependency)
        if fm & 4:
            self.list(r["citedBy"], lambda c: (self.sid(c["label"]), self.sid(c["link"])))
        if fm & 8:
            self.list(r["reExports"], self.re_export)

    def entry(self, e):
        self.v(REASONS.index(e["reason"]))
        s = e.get("symbol")
        m = ((1 if s else 0) | (2 if s and "link" in s else 0) | (4 if "command" in e else 0)
             | (8 if "declarer" in e else 0))
        self.v(m)
        if s:
            self.sid(s["name"])
            if "link" in s:
                self.sid(s["link"])
        if "command" in e:
            self.sid(e["command"])
        if "declarer" in e:
            self.sid(e["declarer"]["label"])
            self.sid(e["declarer"]["link"])

    def symbol(self, s):
        self.sid(s["name"])
        self.v((1 if "slug" in s else 0) | (2 if "source" in s else 0))
        if "slug" in s:
            self.sid(s["slug"])
        self.sid(s["kind"])
        self.list(s["flags"], self.sid)
        if "source" in s:
            self.sid(s["source"]["path"])
            self.v(s["source"]["line"])
        self.list(s["references"], self.reference)
        self.list(s["sections"], self.section)

    def reference(self, ref):
        self.v(ROLES.index(ref["role"]))
        if "parameters" in ref:
            self.list(ref["parameters"], lambda p: (self.sid(p["name"]), self.list(p["types"], self.type)))
        else:
            self.list(ref["types"], self.type)

    def type(self, t):
        self.sid(t["name"])
        self.v(self.linked_mark(t) | (8 if "array" in t else 0) | (16 if "promise" in t else 0))
        self.linked(t)

    def section(self, s):
        self.sid(s["title"])
        self.list(s["body"], self.sid)

    def dependency(self, d):
        self.sid(d["label"])
        self.v(self.linked_mark(d) | (8 if "symbols" in d else 0))
        self.linked(d)
        if "symbols" in d:
            self.list(d["symbols"], self.sid)
        self.list(d["qualifiers"], self.sid)

    def re_export(self, r):
        self.sid(r["name"])
        self.v((1 if "slug" in r else 0) | (2 if "from" in r else 0))
        if "slug" in r:
            self.sid(r["slug"])
        if "from" in r:
            self.sid(r["from"]["label"])
            self.sid(r["from"]["link"])
        self.list(r["flags"], self.sid)


def sections_of(head, records):
    """The uncompressed sections, as (kind, count, bytes), before the end (section 3.3, 4)."""
    h = bytearray([1])
    for k in ("root", "baseLayer", "extension", "scanner"):
        h += text_bytes(head[k])
    h += varint_bytes(len(head["leftOut"]))
    for reason, number, detail in head["leftOut"]:
        h += text_bytes(reason) + varint_bytes(number) + text_bytes(detail)
    out = [(K_HEAD, 0, bytes(h))]
    w = RecordWriter()
    for i in range(0, len(records), RECORDS_PER_SECTION):
        chunk = records[i:i + RECORDS_PER_SECTION]
        w.new, w.out = [], bytearray()
        for r in chunk:
            w.record(r)
        if w.new:
            out.append((K_STRINGS, len(w.new), b"".join(varint_bytes(len(b)) + b for b in w.new)))
        out.append((K_RECORDS, len(chunk), bytes(w.out)))
    n = len(records)
    p = bytearray()
    prev = b""
    for r in records:
        b = r["path"].encode("utf-8")
        shared = 0
        while shared < len(prev) and shared < len(b) and prev[shared] == b[shared]:
            shared += 1
        p += varint_bytes(shared) + varint_bytes(len(b) - shared) + b[shared:]
        prev = b
    out.append((K_PATHS, n, bytes(p)))
    index_of = {r["path"]: i for i, r in enumerate(records)}
    wb = bytearray()
    for i, r in enumerate(records):
        ws = wires_of(r, index_of, i)
        wb += varint_bytes(len(ws))
        for k, x in enumerate(ws):
            wb += varint_bytes(x if k == 0 else x - ws[k - 1] - 1)
    out.append((K_WIRES, n, bytes(wb)))
    return out


def deflate(raw):
    c = zlib.compressobj(-1, zlib.DEFLATED, -15)
    return c.compress(raw) + c.flush()


def frames_of(head, records):
    """The whole file as a writer would set it down, with zlib at its default level.
    Refuses, as a writer does, facts that break section 3.5's limits."""
    secs = sections_of(head, records)
    for kind, count, raw in secs:
        if len(raw) > MAX_SECTION:
            refuse("limit: the %s section would be %d bytes, above MAX_SECTION" % (KIND_NAMES[kind], len(raw)))
    hashes = [hashlib.sha256(raw).digest() for _, _, raw in secs]
    name = hashlib.sha256(b"".join(hashes)).digest()
    secs.append((K_END, len(secs), name))
    hashes.append(hashlib.sha256(name).digest())
    parts = [SIGNATURE]
    for (kind, count, raw), h in zip(secs, hashes):
        stored = deflate(raw)
        parts.append(struct.pack("<BIII", kind, count, len(raw), len(stored)) + h + stored)
    blob = b"".join(parts)
    if sum(len(raw) for _, _, raw in secs) > 64 * len(blob) + MIB:
        refuse("limit: the sections together would inflate to more than 64 x file length + 1 MiB")
    return name, blob


def name_of_text(data):
    head, records = parse_text(data)
    name, _ = frames_of(head, records)
    return name.hex()


# ---------------------------------------------------------------- the program

def main(argv):
    if len(argv) != 3 or argv[1] not in ("read", "name"):
        sys.stderr.write("usage: reader.py read <file.fpk> | reader.py name <file.txt>\n")
        return 2
    out = sys.stdout.buffer
    try:
        try:
            with open(argv[2], "rb") as fh:
                data = fh.read()
        except OSError as e:
            refuse("cannot read the file (%s)" % e.strerror)
        if argv[1] == "read":
            read_scan(data, out.write)
        else:
            out.write((name_of_text(data) + "\n").encode("ascii"))
        out.flush()
        return 0
    except Refused as e:
        msg = str(e).replace("\n", " ").replace("\r", " ")
        out.write(("refused: %s\n" % msg).encode("utf-8", "backslashreplace"))
        out.flush()
        return 1
    except MemoryError:
        out.write(b"refused: out of memory\n")
        out.flush()
        return 1
    except BrokenPipeError:
        return 1
    except Exception as e:   # never a traceback
        out.write(("refused: the reader could not read it (%s)\n" % type(e).__name__).encode())
        out.flush()
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))

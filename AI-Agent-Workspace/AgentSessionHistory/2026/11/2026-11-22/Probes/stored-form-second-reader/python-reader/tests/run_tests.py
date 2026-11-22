"""Tests for reader.py: the samples, then files and texts a reader must refuse.

    python3 -I tests/run_tests.py            (from the folder holding reader.py)

Each bad case is written to tests/cases/ so that it can be run by hand."""
import copy, hashlib, json, os, random, struct, subprocess, sys, time, zlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fpktools import *
from fpktools import R
failures = []

bad_files = {}   # name -> bytes
bad_texts = {}

# ---------------------------------------------------------------- byte-level files
EF = load("made-every-fact")
base = frames_from(*EF)
good = assemble(base)
bad_files["empty"] = b""
bad_files["signature-only"] = R.SIGNATURE
bad_files["wrong-signature"] = b"\x89FPK\r\n\x1a\x0b" + good[8:]
bad_files["crlf-mangled-signature"] = b"\x89FPK\n\x1a\n" + good[8:]
bad_files["trailing-byte"] = good + b"\x00"
bad_files["no-end-frame"] = assemble(base, end=False)
bad_files["header-cut"] = good[:8 + 20]


def with_frame(i, **kw):
    fs = copy.deepcopy(base)
    fs[i].update(kw)
    return fs


bad_files["kind-7"] = assemble(with_frame(1, kind=7))
bad_files["kind-0"] = assemble(with_frame(1, kind=0))
bad_files["raw-above-max-section"] = assemble(with_frame(1, rawLength=R.MAX_SECTION + 1))
bad_files["raw-above-deflate-ratio"] = assemble(with_frame(0, rawLength=1032 * 83 + 1025, ))
junk = bytes(random.Random(1).randrange(256) for _ in range(2000))
bad_files["total-inflation-bound"] = assemble([{"kind": 1, "count": 0, "raw": b"x", "stored": junk,
                                                "rawLength": 2000000}] + base[1:])
_e = len(good) - 45 - len(deflate(hashlib.sha256(b"".join(hashlib.sha256(f["raw"]).digest() for f in base)).digest()))
bad_files["stored-past-end"] = good[:_e + 9] + struct.pack("<I", len(good) - _e - 45 + 1) + good[_e + 13:]
bad_files["stored-past-end-middle"] = good[:8 + 9] + struct.pack("<I", 10 ** 6) + good[8 + 13:]
bad_files["not-deflate"] = assemble(with_frame(0, stored=b"\xff\xff\xff\xff"))
hraw = base[0]["raw"]
bad_files["inflates-more"] = assemble(with_frame(0, stored=deflate(hraw + b"x"), hash=hashlib.sha256(hraw).digest(), rawLength=len(hraw)))
bad_files["inflates-fewer"] = assemble(with_frame(0, stored=deflate(hraw[:-1]), rawLength=len(hraw), hash=hashlib.sha256(hraw).digest()))
bad_files["after-deflate-end"] = assemble(with_frame(0, stored=deflate(hraw) + b"\x00"))
bad_files["deflate-cut"] = assemble(with_frame(0, stored=deflate(hraw)[:-2]))
bad_files["zlib-wrapped"] = assemble(with_frame(0, stored=zlib.compress(hraw)))
bad_files["hash-mismatch"] = assemble(with_frame(1, hash=b"\x00" * 32))
bad_files["name-mismatch"] = assemble(base, name=b"\x11" * 32)
bad_files["end-count-wrong"] = assemble(base, end={"count": 4})
# order
bad_files["head-not-first"] = assemble([base[1], base[0]] + base[2:])
bad_files["two-heads"] = assemble([base[0]] + base)
bad_files["head-count-1"] = assemble(with_frame(0, count=1))
bad_files["strings-not-before-records"] = assemble(base[:2] + base[3:])
bad_files["records-without-strings"] = assemble([base[0]] + base[2:])
bad_files["paths-wires-swapped"] = assemble(base[:3] + [base[4], base[3]])
bad_files["no-wires"] = assemble(base[:4])
bad_files["paths-count-wrong"] = assemble(with_frame(3, count=2))
bad_files["wires-count-wrong"] = assemble(with_frame(4, count=4))
bad_files["records-count-wrong"] = assemble(with_frame(2, count=2))
bad_files["strings-count-wrong"] = assemble(with_frame(1, count=45))
bad_files["strings-count-0"] = assemble(with_frame(1, count=0, raw=b""))
bad_files["end-raw-33"] = assemble(base, end=False) + struct.pack("<BIII", 6, 5, 33, 5) + b"\x00" * 32 + deflate(b"\x00" * 33)[:5]

# head
def head_raw(version=1, root=".mdmd", base_=b"layer-4", ext=b".mdmd.md", scanner=b"s", left=b"\x00", extra=b""):
    t = lambda b: R.varint_bytes(len(b)) + b
    if isinstance(root, str):
        root = root.encode()
    return bytes([version]) + t(root) + t(base_) + t(ext) + t(scanner) + left + extra


for nm, kw in {"head-version-2": dict(version=2), "head-version-0": dict(version=0),
               "root-absolute": dict(root="/abs"), "root-drive": dict(root="C:x"),
               "root-dotdot": dict(root="a/../b"), "root-trailing-slash": dict(root="a/"),
               "extension-slash": dict(ext=b"a/b"), "head-trailing-byte": dict(extra=b"\x00"),
               "head-bad-utf8": dict(scanner=b"\xc0\xaf"),
               "head-leftout-count-too-big": dict(left=b"\x05\x01a\x00"),
               "head-leftout-cut": dict(left=b"\x01\x01a\x00"),
               "head-varint-not-shortest": dict(left=b"\x80\x00"),
               "head-varint-six-bytes": dict(left=b"\x80\x80\x80\x80\x80\x00"),
               "head-varint-above-u32": dict(left=b"\x80\x80\x80\x80\x10"),
               }.items():
    bad_files[nm] = assemble([{"kind": 1, "count": 0, "raw": head_raw(**kw)}] + base[1:])

# strings section bytes
sraw = base[1]["raw"]
def strings_frame(raw, count=46):
    return assemble([base[0], {"kind": 2, "count": count, "raw": raw}] + base[2:])

first = sraw[1:9]  # "src/a.ts"
bad_files["strings-trailing-byte"] = strings_frame(sraw + b"\x00")
bad_files["strings-unmet-extra"] = strings_frame(sraw + b"\x03zzz", 47)
bad_files["strings-duplicate"] = strings_frame(sraw + b"\x08src/a.ts", 47)
for nm, bad in {"overlong": b"\xc0\xaf", "surrogate": b"\xed\xa0\x80", "above-10ffff": b"\xf4\x90\x80\x80",
                "lone-continuation": b"\x80", "cut-sequence": b"\xe2\x82", "ff-byte": b"\xff",
                "overlong-3": b"\xe0\x80\xaf"}.items():
    # replace the scanner-independent last string (an unused-looking one) keeping its length
    i = sraw.rfind(b"\x05Other")
    assert i > 0
    rep = bad + b"x" * (5 - len(bad))
    bad_files["utf8-" + nm] = strings_frame(sraw[:i] + b"\x05" + rep + sraw[i + 6:])

# records section bytes: tamper and fix hashes
rraw = base[2]["raw"]
def records_frame(raw, count=3):
    return assemble(base[:2] + [{"kind": 3, "count": count, "raw": raw}] + base[3:])

bad_files["records-trailing-byte"] = records_frame(rraw + b"\x00")
bad_files["records-sid-skips-ahead"] = records_frame(b"\x01" + rraw[1:])
bad_files["records-file-mark-bit-4"] = records_frame(rraw[:2] + b"\x17" + rraw[3:])
bad_files["records-cut"] = records_frame(rraw[:-1])
# entry at offset 5: reason 0, mark 3
assert rraw[5:7] == b"\x00\x03"
bad_files["entry-reason-6"] = records_frame(rraw[:5] + b"\x06" + rraw[6:])
bad_files["entry-link-without-name"] = records_frame(rraw[:6] + b"\x02" + rraw[7:])

# ---------------------------------------------------------------- fact-level files
def facts_case(name, mutate, sample="made-every-fact"):
    head, records = copy.deepcopy(load(sample))
    mutate(head, records)
    bad_files[name] = assemble(frames_from(head, records))

a = lambda recs: recs[0]
facts_case("dep-link-absolute", lambda h, r: a(r)["dependencies"][0].update(link="/etc/passwd"))
facts_case("dep-link-backslash", lambda h, r: a(r)["dependencies"][0].update(link="\\\\server\\x"))
facts_case("dep-link-drive", lambda h, r: a(r)["dependencies"][0].update(link="c:x"))
facts_case("dep-link-file-scheme", lambda h, r: a(r)["dependencies"][0].update(link="FiLe:x"))
facts_case("dep-target-dotdot", lambda h, r: a(r)["dependencies"][0].update(target="src/../b.ts"))
facts_case("dep-target-dot", lambda h, r: a(r)["dependencies"][0].update(target="./b.ts"))
facts_case("dep-target-empty", lambda h, r: a(r)["dependencies"][0].update(target=""))
facts_case("source-path-absolute", lambda h, r: a(r)["symbols"][0]["source"].update(path="/src/a.ts"))
facts_case("cited-by-link-drive", lambda h, r: a(r)["citedBy"][0].update(link="Z:/x"))
facts_case("reexport-from-link-abs", lambda h, r: r[1]["reExports"][0]["from"].update(link="/a"))
facts_case("entry-symbol-link-abs", lambda h, r: a(r)["entries"][0]["symbol"].update(link="/main"))
facts_case("declarer-link-abs", lambda h, r: a(r)["entries"][1]["declarer"].update(link="file:///p"))
facts_case("type-target-abs", lambda h, r: a(r)["symbols"][0]["references"][0]["types"][0].update(target="/src/b.ts"))
facts_case("type-target-no-link", lambda h, r: a(r)["symbols"][0]["references"][0]["types"][0].pop("link"))
facts_case("dep-anchor-no-target", lambda h, r: a(r)["dependencies"][0].update(anchor="x") or a(r)["dependencies"][0].pop("target"))
facts_case("path-absolute", lambda h, r: r[0].update(path="/src/a.ts"))
facts_case("path-nul", lambda h, r: r[0].update(path="src/a\x00.ts"))
facts_case("path-empty-segment", lambda h, r: r[0].update(path="src//a.ts"))
facts_case("path-drive", lambda h, r: r[0].update(path="C:/a.ts"))
facts_case("path-backslash-start", lambda h, r: r[0].update(path="\\a.ts"))
facts_case("paths-out-of-order", lambda h, r: r.reverse())
facts_case("paths-repeat", lambda h, r: r[1].update(path="src/a.ts"))
facts_case("head-root-file", lambda h, r: h.update(root="file:x"))

# Wires that disagree with the records; paths that disagree with the records
def fs_replace(kind, raw, sample="made-every-fact", count=None):
    fs = frames_from(*copy.deepcopy(load(sample)))
    for f in fs:
        if f["kind"] == kind:
            f["raw"] = raw
            if count is not None:
                f["count"] = count
    return assemble(fs)

bad_files["wires-disagree"] = fs_replace(5, b"\x01\x02\x01\x00\x00")
bad_files["wires-missing-one"] = fs_replace(5, b"\x00\x01\x00\x00")
bad_files["wires-self"] = fs_replace(5, b"\x01\x00\x01\x00\x00")
bad_files["wires-beyond"] = fs_replace(5, b"\x01\x03\x01\x00\x00")
bad_files["wires-unsorted-dup"] = fs_replace(5, b"\x02\x01\x00\x01\x00\x00")  # 1, then 1+0+1=2 -> beyond
bad_files["wires-trailing"] = fs_replace(5, b"\x01\x01\x01\x00\x00\x00")
bad_files["wires-n0-with-first"] = fs_replace(5, b"\x01\x01\x01\x00\x00\x00\x00")
bad_files["paths-not-longest-shared"] = fs_replace(4, b"\x00\x08src/a.ts\x03\x05/b.ts\x04\x04c.ts")
bad_files["paths-shared-too-long"] = fs_replace(4, b"\x09\x08src/a.ts\x04\x04b.ts\x04\x04c.ts")
bad_files["paths-differ-from-records"] = fs_replace(4, b"\x00\x08src/a.ts\x04\x04b.ts\x04\x04d.ts")
bad_files["paths-out-of-order-idx"] = fs_replace(4, b"\x00\x08src/b.ts\x04\x04a.ts\x04\x04c.ts")
bad_files["paths-trailing"] = fs_replace(4, b"\x00\x08src/a.ts\x04\x04b.ts\x04\x04c.ts\x00")
bad_files["paths-dotdot"] = fs_replace(4, b"\x00\x08src/a.ts\x04\x04b.ts\x00\x05../xx")

# 257 files: a records frame of more than 256, and a non-last frame of fewer
def many(n):
    h, recs = copy.deepcopy(load("made-every-fact"))
    tmpl = recs[2]
    return h, [dict(copy.deepcopy(tmpl), path="f%04d" % i) for i in range(n)]

h, recs = many(300)
fs = frames_from(h, recs)
# the good one should be read; then merge records frames into one of 300
good300 = assemble(fs)
kinds = [f["kind"] for f in fs]
assert kinds == [1, 2, 3, 2, 3, 4, 5], kinds
merged_strings = {"kind": 2, "count": fs[1]["count"] + fs[3]["count"], "raw": fs[1]["raw"] + fs[3]["raw"]}
merged_records = {"kind": 3, "count": 300, "raw": fs[2]["raw"] + fs[4]["raw"]}
bad_files["records-frame-of-300"] = assemble([fs[0], merged_strings, merged_records, fs[5], fs[6]])
# split as 100 + 200: the first frame short
w = R.RecordWriter()
parts = []
for chunk in (recs[:100], recs[100:]):
    w.new, w.out = [], bytearray()
    for r in chunk:
        w.record(r)
    if w.new:
        parts.append({"kind": 2, "count": len(w.new), "raw": b"".join(R.varint_bytes(len(b)) + b for b in w.new)})
    parts.append({"kind": 3, "count": len(chunk), "raw": bytes(w.out)})
bad_files["records-short-before-last"] = assemble([fs[0]] + parts + fs[5:])
# strings of the second chunk moved into the first strings frame (set down before they are met)
bad_files["strings-set-down-early"] = assemble([fs[0], merged_strings, fs[2], fs[4], fs[5], fs[6]])

# ---------------------------------------------------------------- texts
EFT = open(os.path.join(ROOT, "made-every-fact.txt"), "rb").read()
ET = open(os.path.join(ROOT, "made-empty.txt"), "rb").read()
L = EFT.split(b"\n")


def tline(i, new):
    ls = list(L)
    ls[i] = new
    return b"\n".join(ls)


def sub(old, new, text=EFT, count=1):
    assert old in text, old
    return text.replace(old, new, count)


bad_texts.update({
    "space-after-comma": sub(b'[null,"scanner",', b'[null, "scanner",'),
    "space-at-end": sub(b'"a test 1.0"]', b'"a test 1.0"] '),
    "number-4.0": sub(b'"file",4,', b'"file",4.0,'),
    "number-4e0": sub(b'"file",4,', b'"file",4e0,'),
    "number-leading-zero": sub(b'"file",4,', b'"file",04,'),
    "number-negative": sub(b'"file",4,', b'"file",-4,'),
    "number-above-u32": sub(b'"file",4,', b'"file",4294967296,'),
    "escaped-letter": sub(b'"a test 1.0"', b'"\\u0061 test 1.0"'),
    "escaped-slash": sub(b'"AI-Agent-Workspace/**"', b'"AI-Agent-Workspace\\/**"'),
    "uppercase-hex-escape": sub(b'"a test 1.0"', b'"a test 1.0\\u001F"'),
    "u-escape-for-tab": sub(b'tab\\tand', b'tab\\u0009and'),
    "raw-tab-in-string": sub(b'tab\\tand', b'tab\tand'),
    "surrogate-pair-escape": sub("😀".encode(), b"\\ud83d\\ude00"),
    "lone-surrogate-escape": sub("😀".encode(), b"\\ud83d"),
    "false-for-absent": sub(b'"array":true}', b'"array":true,"promise":false}'),
    "members-reordered": sub(b'{"name":"Widget","slug":"widget"', b'{"slug":"widget","name":"Widget"'),
    "member-not-had": sub(b'{"reason":"tooling"}', b'{"reason":"tooling","x":1}'),
    "member-twice": sub(b'{"reason":"tooling"}', b'{"reason":"tooling","reason":"tooling"}'),
    "missing-end": EFT[:EFT.rfind(b"[null,\"end\"")],
    "after-end": EFT + b"[null,\"end\",3]\n",
    "blank-after-end": EFT + b"\n",
    "end-count-wrong": sub(b'[null,"end",3]', b'[null,"end",2]'),
    "no-final-lf": EFT[:-1],
    "crlf": EFT.replace(b"\n", b"\r\n"),
    "bom": b"\xef\xbb\xbf" + EFT,
    "bad-utf8": sub(b"a test 1.0", b"a test \xc0\xaf"),
    "version-2": sub(b'"fact-pack",1]', b'"fact-pack",2]'),
    "format-name-other": sub(b'"fact-pack"', b'"fact-park"'),
    "files-out-of-order": sub(b'src/c.ts', b'src/0.ts', count=4),
    "path-absolute": EFT.replace(b'["src/c.ts"', b'["/src/c.ts"'),
    "path-dotdot": EFT.replace(b'["src/c.ts"', b'["src/../c.ts"'),
    "target-without-link": sub(b'{"name":"Gone","link":"gone.ts.mdmd.md","target"', b'{"name":"Gone","target"'),
    "link-absolute": sub(b'"link":"../../README.md"', b'"link":"/README.md"'),
    "root-absolute": sub(b'".mdmd","layer-4"', b'"/mdmd","layer-4"'),
    "extension-slash": sub(b'".mdmd.md"]', b'"/.md"]'),
    "entry-before-authored": tline(5, L[6]).replace(L[6] + b"\n" + L[7], L[5] + b"\n" + L[7], 1) if False else
        b"\n".join(L[:5] + [L[6], L[5]] + L[7:]),
    "symbol-before-entry": b"\n".join(L[:8] + [L[9], L[8]] + L[10:]),
    "two-cited-by": sub(b'["src/c.ts","cited-by",[]]\n', b'["src/c.ts","cited-by",[]]\n["src/c.ts","cited-by",[]]\n'),
    "no-authored": b"\n".join(L[:-5] + L[-4:]),
    "cited-by-dropped-is-valid-so-not-here": None,
    "unknown-line": sub(b'["src/c.ts","cited-by",[]]', b'["src/c.ts","cites",[]]'),
    "role-unknown": sub(b'"role":"Extends"', b'"role":"Extend"'),
    "reason-unknown": sub(b'"reason":"tooling"', b'"reason":"Tooling"'),
    "array-1": sub(b'"array":true', b'"array":1'),
    "flags-not-list": sub(b'"flags":["default"]', b'"flags":"default"'),
    "nested-deep": sub(b'"flags":["default"]', b'"flags":' + b"[" * 100000 + b"]" * 100000),
    "nan": sub(b'"line":3', b'"line":NaN'),
    "huge-int": sub(b'"line":3', b'"line":' + b"9" * 5000),
    "line-true": sub(b'"line":3', b'"line":true'),
    "empty": b"",
    "only-lf": b"\n",
    "empty-text-bom": b"\xef\xbb\xbf" + ET,
})

# ---------------------------------------------------------------- run
def check_refused(kind, name, data, mode):
    path = os.path.join(CASES, name + (".fpk" if mode == "read" else ".txt"))
    with open(path, "wb") as fh:
        fh.write(data)
    out, err, rc, dt = run(mode, path)
    lines = out.split(b"\n")
    ok = out.startswith(b"refused: ") and out.endswith(b"\n") and out.count(b"\n") == 1 and not err \
        and b"could not read it" not in out
    print("%-5s %-34s %s %5.2fs  %s" % (mode, name, "ok " if ok else "BAD", dt, out[:110].decode("utf-8", "replace").rstrip()))
    if not ok:
        failures.append((mode, name, out[:300], err[-500:]))


print("== samples")
for s in SAMPLES:
    out, err, rc, dt = run("read", os.path.join(ROOT, s + ".fpk"))
    same = out == open(os.path.join(ROOT, s + ".txt"), "rb").read() and rc == 0 and not err
    out2, err2, rc2, _ = run("name", os.path.join(ROOT, s + ".txt"))
    d = open(os.path.join(ROOT, s + ".fpk"), "rb").read()
    endname = zlib.decompress(d[-(len(d) - d.rfind(b"\x06", 0, len(d) - 32)):][45:], -15) if False else None
    frames = R.hop_frames(d)
    expect = zlib.decompress(d[frames[-1]["at"]:], -15).hex().encode() + b"\n"
    print("%-16s read %s  name %s" % (s, "ok" if same else "BAD", "ok" if out2 == expect else "BAD"))
    if not same or out2 != expect:
        failures.append(("sample", s, out2, err + err2))

print("== a good file of 300 files (two records frames) and its text, both ways")
p = os.path.join(CASES, "good-300.fpk")
open(p, "wb").write(good300)
out, err, rc, _ = run("read", p)
tp = os.path.join(CASES, "good-300.txt")
open(tp, "wb").write(out)
out2, _, _, _ = run("name", tp)
nm = hashlib.sha256(b"".join(hashlib.sha256(f["raw"]).digest() for f in fs)).hexdigest().encode() + b"\n"
print("good-300 read", "ok" if rc == 0 and out.endswith(b'[null,"end",300]\n') else "BAD", " name", "ok" if out2 == nm else "BAD")
if not (rc == 0 and out2 == nm):
    failures.append(("good", "good-300", out[:200], err))

print("== files to refuse")
for name, data in bad_files.items():
    check_refused("file", name, data, "read")
print("== texts to refuse")
for name, data in bad_texts.items():
    if data is None:
        continue
    check_refused("text", name, data, "name")

print("== every prefix of made-every-fact.fpk is refused (in-process)")
d = open(os.path.join(ROOT, "made-every-fact.fpk"), "rb").read()
for n in range(len(d)):
    try:
        R.read_scan(d[:n], lambda b: None)
        failures.append(("prefix", n, b"accepted", b""))
    except R.Refused:
        pass
    except Exception as e:
        failures.append(("prefix", n, repr(e).encode(), b""))

print("== random damage to the samples (in-process): never an exception but a refusal")
rng = random.Random(7)
count = {"refused": 0, "accepted": 0}
for s in SAMPLES:
    d = open(os.path.join(ROOT, s + ".fpk"), "rb").read()
    for _ in range(1500 if s != "corpus-estate" else 300):
        b = bytearray(d)
        for _ in range(rng.choice([1, 1, 2, 5])):
            op = rng.random()
            i = rng.randrange(len(b))
            if op < 0.7:
                b[i] = rng.randrange(256)
            elif op < 0.85:
                del b[i]
            else:
                b.insert(i, rng.randrange(256))
        try:
            R.read_scan(bytes(b), lambda x: None)
            count["accepted"] += 1      # only possible if the damage missed every checked byte
        except R.Refused:
            count["refused"] += 1
        except Exception as e:
            failures.append(("fuzz", s, repr(e).encode(), b""))
print(count)

print("== random damage inside sections, rehashed so the deep checks are reached")
count = {"refused": 0, "accepted": 0}
for s in SAMPLES:
    fsx = frames_from(*load(s))
    for _ in range(600):
        g = copy.deepcopy(fsx)
        f = g[rng.randrange(len(g))]
        b = bytearray(f["raw"])
        if not b:
            continue
        for _ in range(rng.choice([1, 1, 3])):
            b[rng.randrange(len(b))] = rng.randrange(256)
        f["raw"] = bytes(b)
        blob = assemble(g)
        out = []
        try:
            R.read_scan(blob, out.append)
            count["accepted"] += 1
        except R.Refused:
            count["refused"] += 1
            continue
        except Exception as e:
            failures.append(("deepfuzz", s, repr(e).encode(), b""))
            continue
        # an accepted file's text must name the file: text -> name equals the end section
        fr = R.hop_frames(blob)
        want = zlib.decompress(blob[fr[-1]["at"]:], -15).hex()
        try:
            got = R.name_of_text(b"".join(out))
        except Exception as e:
            got = repr(e)
        if got != want:
            failures.append(("roundtrip", s, got.encode(), b""))
print(count, "(accepted ones are damage that made other valid facts)")

print("== random damage to texts: never an exception")
count = {"refused": 0, "accepted": 0}
t = open(os.path.join(ROOT, "made-every-fact.txt"), "rb").read()
for _ in range(1500):
    b = bytearray(t)
    i = rng.randrange(len(b))
    b[i] = rng.choice(b' ,:"[]{}\\0123456789nultrefa\n\rx')
    try:
        R.name_of_text(bytes(b))
        count["accepted"] += 1
    except R.Refused:
        count["refused"] += 1
    except Exception as e:
        failures.append(("textfuzz", i, repr(e).encode(), b""))
print(count)

print()
print("FAILURES: %d" % len(failures))
for f in failures:
    print(f)
sys.exit(1 if failures else 0)

"""Helpers for the tests: build .fpk files from sections, with chosen damage."""

import copy, hashlib, json, os, random, struct, subprocess, sys, time, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
import reader as R  # noqa: E402

CASES = os.path.join(HERE, "cases")
os.makedirs(CASES, exist_ok=True)
SAMPLES = ["made-empty", "made-every-fact", "corpus-estate"]


def run(mode, path, timeout=60):
    t = time.time()
    p = subprocess.run([sys.executable, "-I", os.path.join(ROOT, "reader.py"), mode, path],
                       capture_output=True, timeout=timeout)
    return p.stdout, p.stderr, p.returncode, time.time() - t


def deflate(raw):
    c = zlib.compressobj(9, zlib.DEFLATED, -15)
    return c.compress(raw) + c.flush()


def assemble(frames, end=True, name=None, trailing=b"", sig=R.SIGNATURE):
    """frames: dicts with kind, count, raw and optional overrides stored/rawLength/hash."""
    out = [sig]
    hashes = []
    for f in frames:
        stored = f.get("stored", deflate(f["raw"]))
        h = f.get("hash", hashlib.sha256(f["raw"]).digest())
        hashes.append(h)
        out.append(struct.pack("<BIII", f["kind"], f["count"], f.get("rawLength", len(f["raw"])),
                               f.get("storedLength", len(stored))) + h + stored)
    if end:
        nm = name if name is not None else hashlib.sha256(b"".join(hashes)).digest()
        e = end if isinstance(end, dict) else {}
        out.append(struct.pack("<BIII", 6, e.get("count", len(frames)), 32, len(deflate(nm)))
                   + hashlib.sha256(nm).digest() + deflate(nm))
    return b"".join(out) + trailing


def frames_from(head, records):
    return [{"kind": k, "count": c, "raw": raw} for k, c, raw in R.sections_of(head, records)]


def load(sample):
    return R.parse_text(open(os.path.join(ROOT, sample + ".txt"), "rb").read())



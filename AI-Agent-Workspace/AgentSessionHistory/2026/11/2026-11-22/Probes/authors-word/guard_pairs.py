"""Classes the C# file pairs the comment guard removed from DNN: an explicit cref the compiler resolves to the target,
a cref written with a name the target declares that the compiler resolves elsewhere or not at all, or prose."""
import json, re, sys

diff, record_path, corpus = sys.argv[1], sys.argv[2], sys.argv[3]
record = json.load(open(record_path))
edges = {(e["from"], e["to"]) for e in record["edges"]}
declared = record["declared"]
by_from = {}
for c in record["crefs"]:
    by_from.setdefault(c["from"], []).append(c)

pairs = []
for line in open(diff, encoding="utf8"):
    m = re.match(r"^- (.+?)\tto\t(.+)$", line.rstrip("\n"))
    if m and m.group(1).endswith(".cs") and m.group(2).endswith(".cs"):
        pairs.append((m.group(1), m.group(2)))
pairs = sorted(set(pairs))

rows = []
for f, t in pairs:
    crefs = by_from.get(f, [])
    hit = [c for c in crefs if any(t in s["files"] and s["kind"] != "Namespace" for s in c["resolved"])]
    names = set(declared.get(t, []))
    written = [c for c in crefs if not hit and set(re.findall(r"[A-Za-z_][A-Za-z0-9_]*", c["written"])) & names]
    if hit:
        cls = "cref, resolved to the target"
        ev = hit[0]["element"] + " " + hit[0]["written"]
    elif written:
        cls = "cref naming the target's type, resolved " + ("elsewhere" if written[0]["resolved"] else "to nothing")
        ev = written[0]["element"] + " " + written[0]["written"]
    else:
        text = open(f"{corpus}/{f}", encoding="utf8", errors="replace").read()
        written_in_text = [n for n in names if re.search(r"cref=\"[^\"]*\b" + re.escape(n) + r"\b", text)]
        if written_in_text:
            cls = "cref in a section the oracle's preprocessor symbols leave inactive"
            ev = ",".join(sorted(written_in_text))
        else:
            found = [n for n in names if re.search(r"(//|/\*|\*)[^\n]*\b" + re.escape(n) + r"\b", text)]
            cls = "a name in a comment's prose"
            ev = ",".join(sorted(found)) or "?"
    rows.append((cls, (f, t) in edges, f, t, ev))

from collections import Counter
print("pairs", len(rows))
for (cls, code), n in sorted(Counter((r[0], r[1]) for r in rows).items()):
    print(f"{n:4d}  {cls}; compiler binds through code: {code}")
print()
for r in rows:
    print("\t".join([r[0], "code" if r[1] else "-", r[2], r[3], r[4]]))

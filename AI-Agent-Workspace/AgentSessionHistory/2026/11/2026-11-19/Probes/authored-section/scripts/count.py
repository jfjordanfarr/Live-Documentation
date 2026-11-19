"""Count the Live Docs, their authored Purpose and Notes, and their source files' opening comments.

Usage, from the repository root:
    python3 -I AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/authored-section/scripts/count.py [--tsv OUT]
"""
import collections
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402

LINK = re.compile(r"\]\(([^)\s]+)\)")
PICTURE = re.compile(r"\.(png|jpe?g|gif|svg|webm|mp4)(#|$)", re.I)
# Provenance by its marks: a date, a record turn, a link into the session history, the 2025-26 planning words.
PROVENANCE = re.compile(r"\b(19|20)\d\d-\d\d-\d\d\b|\bTurns? \d+|AgentSessionHistory|\bDev Day \d+", re.I)


def link_kind(target):
    if target.startswith("http"):
        return "web"
    if "AgentSessionHistory" in target:
        if "/Probes/" in target:
            return "probe"
        if "/Screenshots/" in target or PICTURE.search(target):
            return "picture"
        return "record"
    if PICTURE.search(target):
        return "picture"
    if "AI-Agent-Workspace" in target:
        return "workspace"
    if target.endswith(".mdmd.md") or ".mdmd.md#" in target:
        return "live-doc" if "layer-4" in target or "/layer-" not in target else "design-doc"
    if target.startswith("#"):
        return "same-doc"
    return "source-or-other"


def main():
    rows = []
    for source, doc in lib.live_docs():
        text = open(doc, encoding="utf8").read()
        sections = lib.authored_sections(text) or {}
        purpose = sections.get("Purpose", "")
        notes = sections.get("Notes", "")
        others = [k for k in sections if k not in ("Purpose", "Notes") and lib.meaningful(sections[k])]
        archetype = re.search(r"^- Archetype: (\S+)", text, re.M)
        try:
            src = open(source, encoding="utf8", errors="replace").read() if os.path.exists(source) else ""
            state, words = lib.opening_comment(source, src)
        except IsADirectoryError:
            state, words = "none", ""
        authored = "\n".join(v for v in sections.values())
        links = [link_kind(t) for t in LINK.findall(authored)]
        rows.append({
            "source": source, "ext": lib.ext_of(source), "archetype": archetype.group(1) if archetype else "?",
            "purpose": lib.meaningful(purpose), "notes": lib.meaningful(notes), "other": others,
            "purpose_words": len(purpose.split()) if lib.meaningful(purpose) else 0,
            "notes_words": len(notes.split()) if lib.meaningful(notes) else 0,
            "opening": state, "opening_words": len(words.split()),
            "purpose_links": [link_kind(t) for t in LINK.findall(purpose)],
            "notes_links": [link_kind(t) for t in LINK.findall(notes)], "links": links,
            "purpose_prov": bool(PROVENANCE.search(purpose)), "notes_prov": bool(PROVENANCE.search(notes)),
            "comment_prov": bool(PROVENANCE.search(words)),
        })

    total = len(rows)
    print(f"Live Docs: {total}")
    print(f"  with a meaningful Purpose: {sum(r['purpose'] for r in rows)}")
    print(f"  with meaningful Notes: {sum(r['notes'] for r in rows)}")
    print(f"  with another authored section: {sum(bool(r['other']) for r in rows)} {collections.Counter(h for r in rows for h in r['other']).most_common()}")
    print(f"  test archetype: {sum(r['archetype'] == 'test' for r in rows)}")
    words = sorted(r["purpose_words"] for r in rows if r["purpose"])
    print(f"  Purpose words: median {words[len(words)//2]}, max {words[-1]}, total {sum(words)}")
    nwords = sorted(r["notes_words"] for r in rows if r["notes"])
    print(f"  Notes words: median {nwords[len(nwords)//2]}, max {nwords[-1]}, total {sum(nwords)}")

    print("\nOpening comment of the source file, by state:")
    for state, n in collections.Counter(r["opening"] for r in rows).most_common():
        print(f"  {state}: {n}  (with a meaningful Purpose: {sum(r['purpose'] for r in rows if r['opening'] == state)})")
    have = [r for r in rows if r["opening"] in ("file", "help")]
    ow = sorted(r["opening_words"] for r in have)
    print(f"  file-level comment words: median {ow[len(ow)//2]}, max {ow[-1]}")

    print("\nBy extension: docs / Purpose / Notes / file-level comment / attached / directive / none / no-syntax+binary")
    by = collections.defaultdict(list)
    for r in rows:
        by[r["ext"]].append(r)
    for ext, rs in sorted(by.items(), key=lambda kv: -len(kv[1])):
        c = collections.Counter(r["opening"] for r in rs)
        print(f"  {ext:15} {len(rs):4} {sum(r['purpose'] for r in rs):4} {sum(r['notes'] for r in rs):4} "
              f"{c['file'] + c['help']:4} {c['attached']:4} {c['directive']:4} {c['none']:4} {c['no-syntax'] + c['binary']:4}")

    print("\nTest and non-test, among docs whose file has a file-level comment:")
    for label, pick in (("test", lambda r: r["archetype"] == "test"), ("non-test", lambda r: r["archetype"] != "test")):
        rs = [r for r in rows if pick(r)]
        print(f"  {label}: {len(rs)} docs, {sum(r['opening'] in ('file', 'help') for r in rs)} with a file-level comment")

    print("\nLinks in authored blocks:")
    print(f"  docs whose Purpose links anywhere: {sum(bool(r['purpose_links']) for r in rows)}")
    print(f"  docs whose Notes link anywhere: {sum(bool(r['notes_links']) for r in rows)}")
    print(f"  Purpose links by kind: {collections.Counter(k for r in rows for k in r['purpose_links']).most_common()}")
    print(f"  Notes links by kind: {collections.Counter(k for r in rows for k in r['notes_links']).most_common()}")
    for kind in ("record", "picture", "probe"):
        print(f"  docs linking a {kind}: {sum(kind in r['links'] for r in rows)}")

    print("\nProvenance marks (a date, a record turn, a history link, a Dev Day):")
    print(f"  in the Purpose: {sum(r['purpose_prov'] for r in rows)}; in the Notes: {sum(r['notes_prov'] for r in rows)}; "
          f"in either: {sum(r['purpose_prov'] or r['notes_prov'] for r in rows)}")
    syntax = [r for r in rows if r["opening"] not in ("no-syntax", "binary")]
    print(f"  files that have comment syntax: {len(syntax)}; of them with provenance in either: "
          f"{sum(r['purpose_prov'] or r['notes_prov'] for r in syntax)}, "
          f"and with a file-level comment already: {sum((r['purpose_prov'] or r['notes_prov']) and r['opening'] in ('file', 'help') for r in syntax)}")
    print(f"  file-level comments that carry a provenance mark themselves: {sum(r['comment_prov'] for r in rows)} "
          f"of {sum(r['opening'] in ('file', 'help') for r in rows)}")

    if "--tsv" in sys.argv:
        out = sys.argv[sys.argv.index("--tsv") + 1]
        with open(out, "w", encoding="utf8") as handle:
            handle.write("source\text\tarchetype\tpurpose\tnotes\topening\tpurpose_words\tnotes_words\topening_words\tlinks\n")
            for r in rows:
                handle.write(f"{r['source']}\t{r['ext']}\t{r['archetype']}\t{int(r['purpose'])}\t{int(r['notes'])}\t{r['opening']}\t"
                             f"{r['purpose_words']}\t{r['notes_words']}\t{r['opening_words']}\t{','.join(r['links'])}\n")


if __name__ == "__main__":
    main()

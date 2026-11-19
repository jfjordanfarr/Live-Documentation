"""What every Live Doc's Notes hold: links and where they go, dates and turns, measurements, warnings, placeholders.

Usage, from the repository root:
    python3 -I AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/authored-section/scripts/notes.py
"""
import collections
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402
from count import LINK, link_kind  # noqa: E402

KINDS = {
    "dated (a YYYY-MM-DD date)": re.compile(r"\b(19|20)\d\d-\d\d-\d\d\b"),
    "names a record turn": re.compile(r"\bTurns? \d+", re.I),
    "Dev Day / Goal / phase (the 2025-26 planning words)": re.compile(r"\bDev Day \d+|\bGoal \d+|\bPhase \d+|\bP0\b", re.I),
    "quotes the owner": re.compile(r"\bowner\b[^.]{0,80}[\"“]", re.I),
    "a measurement (%, ms, s, MB, a count of tests)": re.compile(r"\d\s?(%|ms\b|s\b|seconds|MB|KB|GB)|\b\d+ (unit )?tests\b", re.I),
    "a warning or rule (never, must, do not)": re.compile(r"\b(never|must not|must|do not|don't|careful|beware)\b", re.I),
    "a trial or decision state": re.compile(r"\btrial\b|\bdecision\b|not a (production )?decision", re.I),
    "names a test that measures it": re.compile(r"\b(measured by|tested by|held by|its own cases)\b|\.(test|spec)\.ts", re.I),
}


def main():
    docs = 0
    only_placeholder = 0
    unread = 0
    kind_docs = collections.Counter()
    link_docs = collections.Counter()
    link_count = collections.Counter()
    targets = collections.Counter()
    words = []
    for source, doc in lib.live_docs():
        sections = lib.authored_sections(open(doc, encoding="utf8").read()) or {}
        notes = sections.get("Notes", "")
        if "No reader handles this kind of file yet" in notes:
            unread += 1
        if not lib.meaningful(notes):
            only_placeholder += 1
            continue
        docs += 1
        words.append(len(lib.PLACEHOLDER.sub("", notes).split()))
        for name, rx in KINDS.items():
            if rx.search(notes):
                kind_docs[name] += 1
        seen = set()
        for target in LINK.findall(notes):
            kind = link_kind(target)
            link_count[kind] += 1
            seen.add(kind)
            if kind in ("record", "probe", "picture"):
                targets[re.sub(r"#.*$", "", target.split("AI-Agent-Workspace/")[-1])] += 1
        for kind in seen:
            link_docs[kind] += 1
        if seen:
            link_docs["(any)"] += 1
    words.sort()
    print(f"Docs with meaningful Notes: {docs}; Notes that are placeholders only: {only_placeholder}; "
          f"Notes carrying the generator's no-reader note: {unread}")
    print(f"Notes words: median {words[len(words) // 2]}, 90th percentile {words[int(len(words) * 0.9)]}, max {words[-1]}, total {sum(words)}")
    print("Docs whose Notes contain:")
    for name in KINDS:
        print(f"  {name}: {kind_docs[name]}")
    print("Docs whose Notes link to (links in all):")
    for kind, n in link_docs.most_common():
        print(f"  {kind}: {n} docs" + (f", {link_count[kind]} links" if kind in link_count else ""))
    print(f"Distinct record, probe and picture files linked from Notes: {len(targets)}")
    for target, n in targets.most_common(8):
        print(f"  {n:3}  {target}")


if __name__ == "__main__":
    main()

"""Draw the seeded sample of files whose source has a file-level comment, split each authored Purpose and Notes into
claims, give each claim a first-pass class by rule, apply the hand classification in ../classes.tsv, and tally.

Usage, from the repository root:
    python3 -I .../authored-section/scripts/sample.py --dump OUT.txt   # the pairs in full, each claim numbered
    python3 -I .../authored-section/scripts/sample.py                  # the tally

Classes: a = already said by the file's own comment; b = could be said there with no loss (what the file is for, how
it fits, how it works); c = provenance (when or why it came to be, a record turn, a decision, history); d = a relation
to other files or documents; e = not about this file's text at all (measurements, warnings about the workspace, notes
about the doc itself or its generator).
"""
import collections
import os
import random
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402

SEED = 20261119
NON_TEST, TEST = 32, 12
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STOP = set("the a an of to and or in on is it its for by as at be that this with from are was not no one each which "
           "what when so than then their there they them into has have had but if only all any".split())


def content_words(text):
    return {w for w in re.findall(r"[a-z][a-z0-9]+", text.lower()) if w not in STOP and len(w) > 2}


def auto_class(claim, comment):
    if re.search(r"\b(19|20)\d\d-\d\d-\d\d\b|\bTurn \d+|\bsince\b|\buntil\b|\bborn\b|\bwritten (on|for)\b|\bdecision\b|"
                 r"\bowner\b|\bwas (added|removed|renamed|moved)\b|AgentSessionHistory", claim, re.I):
        return "c"
    if re.search(r"\b(measured|benchmark|takes \d|ms\b|seconds?\b|lint|this doc\b|the generator)\b", claim, re.I):
        return "e"
    words = content_words(claim)
    if words and len(words & content_words(comment)) / len(words) >= 0.5:
        return "a"
    if re.search(r"\]\(|`[\w./-]+\.(ts|js|mjs|py|cs|rs|go|md|json|css)`", claim):
        return "d"
    return "b"


def draw():
    rows = []
    for source, doc in lib.live_docs():
        if not os.path.isfile(source):
            continue
        state, comment = lib.opening_comment(source, open(source, encoding="utf8", errors="replace").read())
        if state not in ("file", "help"):
            continue
        text = open(doc, encoding="utf8").read()
        test = re.search(r"^- Archetype: test", text, re.M) is not None
        rows.append((source, doc, comment, test, lib.authored_sections(text)))
    rng = random.Random(SEED)
    picked = []
    for want, test in ((NON_TEST, False), (TEST, True)):
        pool = [r for r in rows if r[3] == test]
        # Strata: the first two folders (packages/engine, packages/explorer, scripts/layout-lab, tests/integration, ...),
        # each given a share of the draw proportional to its size, at least one; within a stratum, a seeded shuffle.
        by_dir = collections.defaultdict(list)
        for r in pool:
            by_dir["/".join(r[0].split("/")[:2]) if r[0].count("/") >= 2 else "(top)"].append(r)
        dirs = sorted(by_dir)
        share = {d: max(1, round(want * len(by_dir[d]) / len(pool))) for d in dirs}
        while sum(share.values()) > want:
            share[max(dirs, key=lambda d: (share[d], d))] -= 1
        while sum(share.values()) < want:
            share[max(dirs, key=lambda d: (len(by_dir[d]) - share[d], d))] += 1
        for d in dirs:
            group = sorted(by_dir[d])
            rng.shuffle(group)
            picked.extend(group[: share[d]])
    return len(rows), picked


def claims_of(sections):
    out = []
    for heading in ("Purpose", "Notes"):
        for claim in lib.sentences(sections.get(heading, "")):
            out.append((heading, claim))
    return out


def load_classes():
    path = os.path.join(HERE, "classes.tsv")
    hand = {}
    if os.path.exists(path):
        for line in open(path, encoding="utf8"):
            if line.strip() and not line.startswith("#") and not line.startswith("source\t"):
                source, index, cls = line.rstrip("\n").split("\t")[:3]
                hand[(source, int(index))] = cls
    return hand


def main():
    population, picked = draw()
    hand = load_classes()
    if "--dump" in sys.argv:
        with open(sys.argv[sys.argv.index("--dump") + 1], "w", encoding="utf8") as out:
            for source, _, comment, test, sections in picked:
                out.write(f"\n######## {source}  ({'test' if test else 'non-test'})\n--- comment ---\n{comment}\n--- claims ---\n")
                for i, (heading, claim) in enumerate(claims_of(sections)):
                    out.write(f"[{i}] {heading[0]} {auto_class(claim, comment)}: {claim}\n")
        return
    tally = {h: collections.Counter() for h in ("Purpose", "Notes")}
    words = {h: collections.Counter() for h in ("Purpose", "Notes")}
    for source, _, comment, _, sections in picked:
        for i, (heading, claim) in enumerate(claims_of(sections)):
            cls = hand.get((source, i), auto_class(claim, comment))
            tally[heading][cls] += 1
            words[heading][cls] += len(claim.split())
    print(f"Population (docs whose source has a file-level comment): {population}; sample {len(picked)}, seed {SEED}")
    print(f"Hand classes applied: {len(hand)}")
    for heading in ("Purpose", "Notes"):
        total = sum(tally[heading].values())
        print(f"{heading}: {total} claims, {sum(words[heading].values())} words")
        for cls in "abcde":
            print(f"  {cls}: {tally[heading][cls]:4} claims ({100 * tally[heading][cls] / max(total, 1):4.0f}%), {words[heading][cls]:5} words")
    # The other direction: how much of the comment's own vocabulary the authored words never use.
    longer, novel_p, novel_all = 0, [], []
    for source, _, comment, _, sections in picked:
        cw = content_words(comment)
        purpose, notes = sections.get("Purpose", ""), sections.get("Notes", "")
        longer += len(comment.split()) > len(purpose.split())
        if cw:
            novel_p.append(len(cw - content_words(purpose)) / len(cw))
            novel_all.append(len(cw - content_words(purpose + " " + notes)) / len(cw))
    novel_p.sort()
    novel_all.sort()
    print(f"Comments longer than their Purpose: {longer} of {len(picked)}")
    print(f"Share of a comment's content words absent from its Purpose: median {novel_p[len(novel_p) // 2]:.0%}; "
          f"absent from Purpose and Notes together: median {novel_all[len(novel_all) // 2]:.0%}")


if __name__ == "__main__":
    main()

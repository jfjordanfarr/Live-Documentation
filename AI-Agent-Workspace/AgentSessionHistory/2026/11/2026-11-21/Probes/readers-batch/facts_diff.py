"""Compare two facts files (facts.ts): every dependency target, dependency symbol and symbol gained or lost, by file.

python3 -I facts_diff.py before.jsonl after.jsonl
"""
import json
import sys
from collections import Counter


def load(path):
    out = {}
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            facts = set()
            for dep in record.get("deps", []):
                facts.add(("to", dep["to"]))
                for symbol in dep["symbols"]:
                    facts.add(("use", dep["to"] + "#" + symbol))
            for symbol in record.get("symbols", []):
                facts.add(("sym", symbol))
            if record.get("program"):
                facts.add(("program", ""))
            if "error" in record:
                facts.add(("error", record["error"]))
            out[record["file"]] = facts
    return out


before, after = load(sys.argv[1]), load(sys.argv[2])
counts = Counter()
for file in sorted(set(before) | set(after)):
    lost = before.get(file, set()) - after.get(file, set())
    gained = after.get(file, set()) - before.get(file, set())
    for kind, value in sorted(lost):
        counts[("lost", kind)] += 1
        print(f"- {file}\t{kind}\t{value}")
    for kind, value in sorted(gained):
        counts[("gained", kind)] += 1
        print(f"+ {file}\t{kind}\t{value}")
print("totals:", dict(sorted(counts.items())), "files:", len(before), len(after))

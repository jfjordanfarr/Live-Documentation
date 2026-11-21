"""mojoPortal keeps one data layer per database (mojoPortal.Data.MSSQL, .MySql, .SQLite, .pgsql, …, and the same for
Features): count each file's links to .sql files by whether the script lies in the same database's folder.
python3 -I dialect_links.py facts.jsonl"""
import json
import re
import sys
from collections import Counter

DIALECT = re.compile(r"(?:^|/)mojoPortal\.(?:Features\.)?Data\.([A-Za-z]+)/", re.I)


def dialect(path):
    match = DIALECT.search(path)
    return match.group(1).lower() if match else None


counts = Counter()
for line in open(sys.argv[1], encoding="utf-8"):
    if not line.strip():
        continue
    record = json.loads(line)
    source = dialect(record["file"])
    kind = "sql" if record["file"].lower().endswith(".sql") else "code"
    for dep in record.get("deps", []):
        if not dep["resolved"] or not dep["to"].lower().endswith(".sql"):
            continue
        target = dialect(dep["to"])
        if source is None or target is None:
            counts[(kind, "outside a data layer")] += 1
        else:
            counts[(kind, "same database" if source == target else "another database")] += 1
for key in sorted(counts):
    print(key, counts[key])

"""Split a facts file into its .sql files' lines and the rest: python3 -I split_facts.py in.jsonl sql.jsonl rest.jsonl"""
import json
import sys

source, sql_out, rest_out = sys.argv[1:4]
with open(source, encoding="utf-8") as handle, open(sql_out, "w", encoding="utf-8") as sql, open(rest_out, "w", encoding="utf-8") as rest:
    for line in handle:
        if not line.strip():
            continue
        (sql if json.loads(line)["file"].lower().endswith(".sql") else rest).write(line)

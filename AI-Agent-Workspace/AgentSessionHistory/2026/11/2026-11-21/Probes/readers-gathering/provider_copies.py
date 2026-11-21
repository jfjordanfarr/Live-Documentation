"""Copies DNN's .SqlDataProvider scripts as .sql, {databaseOwner} filled as dbo. and {objectQualifier} as nothing,
as the SQL reader's probe graded them (2026-11-19)."""
import os
import sys

source, target = sys.argv[1], sys.argv[2]
count = 0
for folder, dirs, files in os.walk(source):
    dirs[:] = [d for d in dirs if d not in (".git", "bin", "obj", "node_modules")]
    for name in files:
        if not name.lower().endswith(".sqldataprovider"):
            continue
        relative = os.path.relpath(os.path.join(folder, name), source)
        with open(os.path.join(folder, name), "rb") as handle:
            data = handle.read()
        text = data.decode("utf-8-sig", errors="surrogateescape")
        text = text.replace("{databaseOwner}", "dbo.").replace("{objectQualifier}", "")
        out = os.path.join(target, relative[: -len(".SqlDataProvider")] + ".sql")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "wb") as handle:
            handle.write(text.encode("utf-8", errors="surrogateescape"))
        count += 1
print(count)

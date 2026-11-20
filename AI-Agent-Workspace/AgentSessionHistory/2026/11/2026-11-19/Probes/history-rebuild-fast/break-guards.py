import sys

# Breaks, or puts back, four guards at once, to see each test that holds one go red:
#   git.ts: a kept entry's blob not compared (the property); the walk of names skipped (the stray case);
#           the folders above a nested docs root left (the nested case);
#   summarizeChange.ts: every task summarized with the first task's tree environment (history.test.ts).
# usage: break.py apply|revert
root = "/workspaces/Live-Documentation/.claude/worktrees/agent-ac4457f22534d6432/"
edits = [
    ("packages/engine/src/live-docs/history/git.ts",
     "wanted.mode === entry.mode && wanted.id === entry.id && wanted.empty === entry.empty",
     "wanted.mode === entry.mode && wanted.empty === entry.empty"),
    ("packages/engine/src/live-docs/history/git.ts",
     "  if (!(await holdsOnly(directory, written))) return undefined;\n",
     "  if (written.size < 0 && !(await holdsOnly(directory, written))) return undefined;\n"),
    ("packages/engine/src/live-docs/history/git.ts",
     "    for (const folder of above.reverse().filter(",
     "    for (const folder of [].filter("),
    ("packages/generator/src/history/summarizeChange.ts",
     "    Object.assign(process.env, tree.environment);\n",
     "    firstEnvironment ??= tree.environment;\n    Object.assign(process.env, firstEnvironment);\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "  let count = 0;\n  const summarize",
     "  let count = 0;\n  let firstEnvironment: Record<string, string> | undefined;\n  const summarize"),
]
mode = sys.argv[1]
for file, good, bad in edits:
    path = root + file
    text = open(path).read()
    old, new = (bad, good) if mode == "revert" else (good, bad)
    if text.count(old) != 1:
        sys.exit(f"{file}: expected one {old!r}, found {text.count(old)}")
    if mode != "check":
        open(path, "w").write(text.replace(old, new))
print(mode, len(edits), "edits")

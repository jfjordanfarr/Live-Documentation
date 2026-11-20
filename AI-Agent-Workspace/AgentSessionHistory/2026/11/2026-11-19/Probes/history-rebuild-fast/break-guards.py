import sys

# Breaks, or puts back, five guards, one or all at once, to see each test that holds one go red:
#   git.ts: a kept entry's blob not compared (the property); the walk of names skipped (the stray case);
#           the folders above a nested docs root left (the nested case);
#   summarizeChange.ts: every task summarized with the first task's tree environment (history.test.ts).
# usage: break-guards.py apply|revert|check [guard], a guard by its number (1 the blob, 2 the walk, 3 the stamp,
#   4 the folders above, 5 the environment); with none, every guard at once. Since the second review of 2026-11-20 each guard is
#   broken by itself in a run of its own, so that one held by no test shows.
# Updated 2026-11-20 for the review's mends (the worktree, and the worker's tree environment as it now reads); the
# caches' and the git directory's guards are broken one at a time by hand, as the record's section on the review says.
root = "/workspaces/Live-Documentation/.claude/worktrees/agent-ac9957babf9636e7b/"
edits = [
    ("packages/engine/src/live-docs/history/git.ts",
     "wanted.mode === entry.mode && wanted.id === entry.id && wanted.empty === entry.empty",
     "wanted.mode === entry.mode && wanted.empty === entry.empty"),
    ("packages/engine/src/live-docs/history/git.ts",
     "  if (checked === undefined) return undefined;\n",
     "  if (checked === undefined) return { unwritten, written };\n"),
    # Since the review's fourth finding: a kept file's stamp not compared (git.test.ts, the file changed in place).
    ("packages/engine/src/live-docs/history/git.ts",
     "      if (entry.stamp !== undefined && !sameStamp(entry.stamp, stamp)) return undefined;\n",
     "      if (entry.stamp !== undefined && !sameStamp(entry.stamp, stamp) && written.size < 0) return undefined;\n"),
    ("packages/engine/src/live-docs/history/git.ts",
     "    for (const folder of above.reverse().filter(",
     "    for (const folder of [].filter("),
    ("packages/generator/src/history/summarizeChange.ts",
     "    Object.assign(process.env, environment);\n",
     "    firstEnvironment ??= environment;\n    Object.assign(process.env, firstEnvironment);\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "  let tree: WorkingTree | undefined;\n  const summarize",
     "  let tree: WorkingTree | undefined;\n  let firstEnvironment: Record<string, string> | undefined;\n  const summarize"),
]
mode = sys.argv[1]
# Each edit by the guard it breaks: the environment's takes two edits.
guards = [1, 2, 3, 4, 5, 5]
chosen = int(sys.argv[2]) if len(sys.argv) > 2 else None
edits = [edit for edit, guard in zip(edits, guards) if chosen is None or guard == chosen]
for file, good, bad in edits:
    path = root + file
    text = open(path).read()
    old, new = (bad, good) if mode == "revert" else (good, bad)
    if text.count(old) != 1:
        sys.exit(f"{file}: expected one {old!r}, found {text.count(old)}")
    if mode != "check":
        open(path, "w").write(text.replace(old, new))
print(mode, len(edits), "edits")

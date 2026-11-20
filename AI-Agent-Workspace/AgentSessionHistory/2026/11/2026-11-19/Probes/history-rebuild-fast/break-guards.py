import os
import sys

# Breaks, or puts back, ten guards, one or all at once, to see each test that holds one go red:
#   git.ts: a kept entry's blob not compared (the property); the walk of names skipped (the stray case);
#           the folders above a nested docs root left (the nested case);
#   summarizeChange.ts: every task summarized with the first task's tree environment (history.test.ts).
#   Since the review's fourth round: a throw while a tree is taken, read or released left unmarked (treeSitter.test.ts);
#   a worker writing a change in which its runtime faulted, after its first (regenerate.test.ts, history-workers);
#   a worker refusing its first change too (history-workers); the pool not giving a refused change to a fresh worker
#   (regenerate.test.ts); a worker's memory left unbounded (regenerate.test.ts).
# usage: break-guards.py apply|revert|check [guard], a guard by its number (1 the blob, 2 the walk, 3 the stamp,
#   4 the folders above, 5 the environment, 6 the mark, 7 the refusal, 8 the first change, 9 the fresh worker,
#   10 the memory bound, 11 the walk's counts, 12 the identity, 13 the short names, 14 nothing remote, 15 one place,
#   16 the repository's settings, 17 the reason written anew); with none, every guard at once. Since the second review of 2026-11-20 each guard is
#   broken by itself in a run of its own, so that one held by no test shows.
# Updated 2026-11-20 for the review's mends (the worker's tree environment as it now reads); the caches' and the git
# directory's guards are broken one at a time by hand, as the record's section on the review says. Since the fourth
# round the root is the checkout this script lies in, seven folders up.
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), *[".."] * 7) + "/"
edits = [
    ("packages/engine/src/live-docs/history/git.ts",
     "wanted.mode === entry.mode && wanted.id === entry.id && wanted.empty === entry.empty",
     "wanted.mode === entry.mode && wanted.empty === entry.empty"),
    ("packages/engine/src/live-docs/history/git.ts",
     "  if (!(checked instanceof Map)) return checked;\n",
     "  if (!(checked instanceof Map)) return { unwritten, written };\n"),
    # Since the review's fourth finding: a kept file's stamp not compared (git.test.ts, the file changed in place).
    ("packages/engine/src/live-docs/history/git.ts",
     "      if (entry.stamp !== undefined && !sameStamp(entry.stamp, stamp)) return {",
     "      if (entry.stamp !== undefined && !sameStamp(entry.stamp, stamp) && written.size < 0) return {"),
    ("packages/engine/src/live-docs/history/git.ts",
     "    for (const folder of above.reverse().filter(",
     "    for (const folder of [].filter("),
    ("packages/generator/src/history/summarizeChange.ts",
     "    Object.assign(process.env, environment);\n",
     "    firstEnvironment ??= environment;\n    Object.assign(process.env, firstEnvironment);\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "  let tree: WorkingTree | undefined;\n  const summarize",
     "  let tree: WorkingTree | undefined;\n  let firstEnvironment: Record<string, string> | undefined;\n  const summarize"),
    ("packages/engine/src/live-docs/adapters/treeSitter.ts",
     "    faulted = true;\n",
     "    faulted = faulted;\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "  if (!publishable()) return false;\n",
     "  publishable();\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "warn, () => first || !runtimeFaulted());",
     "warn, () => !runtimeFaulted());"),
    ("packages/generator/src/history/regenerate.ts",
     "          if (!report.published) {\n",
     "          if (false as boolean) {\n"),
    ("packages/generator/src/history/regenerate.ts",
     "      const full = report.heldMemory > bound || report.heapShare > 1 / 2;\n",
     "      const full = report.heldMemory < 0;\n"),
    # Since the review of the workers' final code (2026-11-20, the tree and git round): 11 the walk's counts ignored;
    # 12 the identity left out of the stamp; 13 the short names' rule off; 14 the command's own calls reaching a remote;
    # 15 a git call of the command added without what every call sets; 16 the repository's own settings let into the
    # tree's calls; 17 the reason a tree was written anew not carried to the worker's report.
    ("packages/engine/src/live-docs/history/git.ts",
     "  return foundFiles === files && foundFolders === folders.size ? checked : {",
     "  return foundFiles >= 0 ? checked : {"),
    ("packages/engine/src/live-docs/history/git.ts",
     " && a.mode === b.mode && a.ino === b.ino;",
     " && a.mode === b.mode;"),
    ("packages/engine/src/live-docs/history/git.ts",
     "  if ((options?.platform ?? process.platform) === \"win32\" && [...previous.keys()",
     "  if ((options?.platform ?? process.platform) === \"none\" && [...previous.keys()"),
    ("packages/engine/src/live-docs/history/git.ts",
     "{ GIT_NO_REPLACE_OBJECTS: \"1\", GIT_NO_LAZY_FETCH: \"1\", GIT_TERMINAL_PROMPT: \"0\" };",
     "{ GIT_NO_REPLACE_OBJECTS: \"1\", GIT_TERMINAL_PROMPT: \"0\" };"),
    ("packages/engine/src/live-docs/history/git.ts",
     "    return historyGit([\"-C\", this.root, ...args], { cwd: this.root });\n",
     "    return execFileAsync(\"git\", [\"-C\", this.root, ...args], { cwd: this.root, maxBuffer: LARGEST_OUTPUT }).then((result) => result.stdout);\n"),
    ("packages/engine/src/live-docs/history/git.ts",
     "  GIT_CONFIG_COUNT: String(SET_ASIDE.length),\n",
     "  GIT_CONFIG_COUNT: \"0\",\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "...(tree.writtenAnew !== undefined ? { writtenAnew: tree.writtenAnew } : {}), runtimeFaulted",
     "runtimeFaulted"),
]
mode = sys.argv[1]
# Each edit by the guard it breaks: the environment's takes two edits.
guards = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
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

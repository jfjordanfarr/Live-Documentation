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
#   10 the memory bound, 11 the depth, 12 the unmapped mark, 13 the old doc, 14 the machine's failure, 15 the
#   TypeScript depth, 16 the tree's folder in a reason, 17 the environment removed, 18 the machine's stop); with none,
#   every guard at once. Since the second review of 2026-11-20 each guard is
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
    ("packages/engine/src/live-docs/adapters/treeSitter.ts",
     "    markProcess(\"runtime\");\n",
     "    void 0;\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "  if (!publishable()) return { published: false, unmapped };\n",
     "  publishable();\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "warn, () => first || processMarks().length === 0);",
     "warn, () => processMarks().length === 0);"),
    ("packages/generator/src/history/regenerate.ts",
     "          if (!report.published) {\n",
     "          if (false as boolean) {\n"),
    ("packages/generator/src/history/regenerate.ts",
     "      const full = report.heldMemory > bound || report.heapShare > 1 / 2;\n",
     "      const full = report.heldMemory < 0;\n"),
    # Since the review of 2026-11-20 at e1e27e33a: a tree-sitter tree beyond the reading depth left unmarked
    # (treeSitter.test.ts); a file the generator could not map left unmarked; its committed doc kept in the history's
    # tree (history-workers); a machine's failure published (regenerate.test.ts's stand-ins hold the pool's side).
    ("packages/engine/src/live-docs/adapters/treeSitter.ts",
     "      if (beyondDepth(tree)) markProcess(\"deep\");\n",
     "      beyondDepth(tree);\n"),
    ("packages/generator/src/generator.ts",
     "      markProcess(\"unmapped\");\n",
     "      void 0;\n"),
    ("packages/generator/src/generator.ts",
     "      if (options.keepAuthoredStaleDocs === false && !options.dryRun) await removeDocOfUnmapped(docAbsolutePath);\n",
     "      if (options.keepAuthoredStaleDocs === undefined && !options.dryRun) await removeDocOfUnmapped(docAbsolutePath);\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "  if (machine !== undefined) return",
     "  if (machine === null) return"),
    # A TypeScript tree beyond the reading depth left unmarked (history-workers, the four changes); a reason left
    # naming the tree's folder (history-workers, two workers in two folders).
    ("packages/engine/src/live-docs/processMark.ts",
     "      markProcess(\"deep\");\n      return true;\n",
     "      return true;\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "reason: withoutTree(failure.reason, tree),",
     "reason: failure.reason,"),
    # The tree's environment left in the worker after its summary (history-workers, the tree's git environment).
    ("packages/generator/src/history/summarizeChange.ts",
     "      for (const name of Object.keys(environment)) delete process.env[name];\n",
     "      void environment;\n"),
    # The pool going on after a fresh worker's failure of the machine's (regenerate.test.ts's stand-ins, history-workers).
    ("packages/generator/src/history/regenerate.ts",
     "            if (report.machineFailure) throw new Error(",
     "            if (report.machineFailure && false) throw new Error("),
]
mode = sys.argv[1]
# Each edit by the guard it breaks: the environment's takes two edits.
guards = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
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

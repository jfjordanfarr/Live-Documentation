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
#   16 the repository's settings, 17 the reason written anew, 18 to 21 the stamp's size, modification time, change
#   time and mode, 22 nothing of the product writes a kept file, 23 the case setting pinned in a tree, 24 the case
#   setting keyed; and, renumbered when the two rounds of 2026-11-20 were joined, the summaries' round's guards, which
#   its own record numbers 11 to 21: 25 the depth, 26 the unmapped mark, 27 the old doc, 28 the machine's failure,
#   29 the TypeScript depth, 30 the tree's folder in a reason, 31 the environment removed, 32 the machine's stop,
#   33 the JSON depth, 34 an adapter's own read, 35 a doc path too long, 36 C's cache of facts, 37 Rust's cache of
#   facts, 38 the nesting bound raised; and the leftovers' round of 2026-11-20: 39 the re-export reader's rethrow,
#   40 a provider's depth, 41 a tsconfig's depth, 42 a script's count, 43 that count's bound, 44 a tsconfig's failure
#   of the machine's, 45 a POM's depth, 46 the chain of causes, 47 a reason's separator, 48 the task's case setting
#   carried to the tree, 49 a nearer copy of the installation's, 50 the index pass's throw handed to the file's pass;
#   51 and 52 the case setting keyed by the command and carried on a task; 53 to 55 the depth measure's reach past
#   forEachChild: a node's JSDoc, a bracketed JSDoc parameter's default, the left operand of a less-than; 56 to 65
#   the read rule's second look, each named where its edit stands);
#   with none, every guard at once. Since the second review
#   of 2026-11-20 each guard is broken by itself in a run of its own, so that one held by no test shows; the leftovers'
#   round found guard 17 (the reason written anew) and the branch of guard 49 held by no test before it, and gave each one.
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
     "    GIT_CONFIG_COUNT: String(settings.length),\n",
     "    GIT_CONFIG_COUNT: \"0\",\n"),
    ("packages/generator/src/history/summarizeChange.ts",
     "broughtForward: tree.broughtForward, ...(tree.writtenAnew !== undefined ? { writtenAnew: tree.writtenAnew } : {}), marked",
     "broughtForward: tree.broughtForward, marked"),
    # The second pass of that round: 18 to 21 each field of the stamp but the identity left out of its comparison
    # (git.test.ts, sameStamp); 22 the generator rewriting each source file, same bytes, after writing its doc
    # (history-tree-forward.test.ts, the samples case, which holds that nothing of the product writes a kept file).
    ("packages/engine/src/live-docs/history/git.ts",
     "  return a.size === b.size && a.mtimeMs",
     "  return a.mtimeMs"),
    ("packages/engine/src/live-docs/history/git.ts",
     " && a.mtimeMs === b.mtimeMs && a.ctimeMs",
     " && a.ctimeMs"),
    ("packages/engine/src/live-docs/history/git.ts",
     " && a.ctimeMs === b.ctimeMs && a.mode",
     " && a.mode"),
    ("packages/engine/src/live-docs/history/git.ts",
     " && a.mode === b.mode && a.ino === b.ino;",
     " && a.ino === b.ino;"),
    ("packages/generator/src/generator.ts",
     "      await fs.writeFile(docPaths.absolute, rendered, \"utf8\");\n",
     "      await fs.writeFile(docPaths.absolute, rendered, \"utf8\");\n      await fs.writeFile(path.join(workspaceRoot, normalizedSourcePath), await fs.readFile(path.join(workspaceRoot, normalizedSourcePath)));\n"),
    # 23 the tree not answering with the value of `core.ignorecase` the lens keyed; 24 the lens not keying it (git.test.ts).
    ("packages/engine/src/live-docs/history/git.ts",
     "      ...treeSettings(options?.ignoresCase),\n",
     "      ...treeSettings(),\n"),
    ("packages/engine/src/live-docs/history/lens.ts",
     "  const made = repository.ignoresCase ? { repository: { ignoresCase: true } } : {};\n",
     "  const made = {};\n"),
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
    # Since the two bounds of 2026-11-20, the mark of either.
    ("packages/engine/src/live-docs/processMark.ts",
     "  if (beyond) markProcess(\"deep\");\n",
     "  void beyond;\n"),
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
    # A JSON document beyond the reading depth left unmarked (json.test.ts).
    ("packages/engine/src/live-docs/adapters/json.ts",
     "    nestingBeyondDepth(parsed, jsonChildren, TREE_DEPTH);\n",
     "    void parsed;\n"),
    # A failure of the machine's swallowed by an adapter's own read (history-workers, the C reader's include).
    ("packages/engine/src/live-docs/adapters/c.ts",
     "    header = await fileFacts(headerPath);\n  } catch (error) {\n    throwIfMachineFailure(error);\n",
     "    header = await fileFacts(headerPath);\n  } catch (error) {\n    void error;\n"),
    # A doc path the disk cannot hold stopping a person's whole run (generator.test.ts).
    ("packages/generator/src/generator.ts",
     "code === \"ENAMETOOLONG\") return undefined;",
     "code === \"ENAMETOOLONG\") throw error;"),
    # C's and Rust's caches of a file's facts kept past a run (adapter-fact-caches.test.ts, a case each).
    ("packages/engine/src/live-docs/adapters/c.ts",
     "    factsCache.clear();\n    listingCache.clear();\n",
     "    listingCache.clear();\n"),
    ("packages/engine/src/live-docs/adapters/rust.ts",
     "    factsCache.clear();\n    packageCache.clear();\n",
     "    packageCache.clear();\n"),
    # The nesting bound raised past half a fresh process's limits (reading-depth.test.ts: 8 nesting constructs at 800).
    ("packages/engine/src/live-docs/processMark.ts",
     "export const READING_DEPTH = 200;\n",
     "export const READING_DEPTH = 400;\n"),
    # Since the review of the workers' leftovers (2026-11-20, from 15:30 UTC), each held by a case of its own:
    # 39 the re-export reader swallowing a failure of the machine's, 40 a provider behind `export *` left unmeasured
    # (dependencies.test.ts); 41 the tsconfig beside a manifest left unmeasured, 42 a script's quoted command lines left
    # uncounted, 43 their count held to the nesting bound again, 44 a failure of the machine's in reading a tsconfig
    # read as no tsconfig (json.test.ts); 45 a POM left unmeasured (pom.test.ts); 46 a failed call wrapped by a library
    # sorted as the file's (processMark.test.ts); 47 a path within the tree left in the machine's separator
    # (summarizeChange.test.ts); 48 the task's case setting not carried to the worker's tree (history-workers);
    # 49 a nearer copy reached only through the installation not reported (generatorIdentity.test.ts).
    ("packages/engine/src/live-docs/dependencies.ts",
     "    throwIfMachineFailure(error);\n    params.stack.delete(normalized);\n",
     "    void error;\n    params.stack.delete(normalized);\n"),
    ("packages/engine/src/live-docs/dependencies.ts",
     "  typeScriptBeyondDepth(sourceFile);\n",
     "  void sourceFile;\n"),
    ("packages/engine/src/live-docs/adapters/json.ts",
     "  nestingBeyondDepth(read.config as unknown, jsonChildren, READING_DEPTH);\n",
     "  void read;\n"),
    ("packages/engine/src/live-docs/adapters/json.ts",
     "  if (depth > TREE_DEPTH) markProcess(\"deep\");\n",
     "  void depth;\n"),
    ("packages/engine/src/live-docs/adapters/json.ts",
     "  if (depth > TREE_DEPTH) markProcess(\"deep\");\n",
     "  if (depth > READING_DEPTH) markProcess(\"deep\");\n"),
    ("packages/engine/src/live-docs/adapters/json.ts",
     "      failures.push(error);\n",
     "      void error;\n"),
    ("packages/engine/src/live-docs/adapters/pom.ts",
     "    nestingBeyondDepth(document, (element) => element.children, TREE_DEPTH);\n",
     "    void document;\n"),
    ("packages/engine/src/live-docs/processMark.ts",
     "link = (link as { cause?: unknown }).cause)",
     "link = undefined)"),
    ("packages/generator/src/history/summarizeChange.ts",
     "(rest) => rest.split(paths.sep).join(\"/\")",
     "(rest) => rest"),
    ("packages/generator/src/history/summarizeChange.ts",
     "\"tree00\")), ...(task.ignoresCase !== undefined ? { ignoresCase: task.ignoresCase } : {}) };",
     "\"tree00\")) };"),
    ("packages/generator/src/history/generatorIdentity.ts",
     "    } else if (want === undefined) {\n      differing.push([place, have]);\n",
     "    } else if (want === undefined) {\n      void have;\n"),
    # 50 a throw of discovery's first pass not handed to the generator's pass over that file (history-workers, the
    # index pass's first read of a file failing for a cause of the machine's, and for one of the file's own).
    ("packages/generator/src/generator.ts",
     "      if (unindexed.has(absoluteSourcePath)) throw unindexed.get(absoluteSourcePath);\n",
     "      void unindexed;\n"),
    # Joined by the root on 2026-11-20, from the builder of what the history tells: 51 the command never keying the
    # case setting true (history.test.ts, the repository that matches names without regard to case); 52 the worker's
    # task carrying no case setting (regenerate.test.ts, the task a worker is sent).
    ("packages/generator/src/history/computeHistory.ts",
     "  const lens = lensOf(generator, configuration, { ignoresCase: await versionControl.ignoresCase() });\n",
     "  const lens = lensOf(generator, configuration, { ignoresCase: (await versionControl.ignoresCase()) && false });\n"),
    ("packages/generator/src/history/regenerate.ts",
     "    ignoresCase: context.lens.ignoresCase === true,\n",
     "    // guard 52: the case setting left out of the task\n"),
    # The depth measure's mend of 2026-11-20, after the review found a JSDoc comment counted shallow: 53 a node's JSDoc
    # not walked (jsdoc-depth-workers.test.ts; reading-depth.test.ts's JSDoc constructs); 54 a bracketed JSDoc
    # parameter's default not read again (reading-depth.test.ts, "a parameter's default"); 55 the left operand of `<`
    # taken as a chain step (reading-depth.test.ts, "a < b < …").
    ("packages/engine/src/live-docs/processMark.ts",
     "  const comments = (node as { jsDoc?: readonly ts.JSDoc[] }).jsDoc ?? NONE;\n",
     "  const comments = NONE;\n"),
    ("packages/engine/src/live-docs/processMark.ts",
     "|| !node.isBracketed) return comments;",
     "|| node.isBracketed) return comments;"),
    ("packages/engine/src/live-docs/processMark.ts",
     "parent.left === child && parent.operatorToken.kind !== ts.SyntaxKind.LessThanToken",
     "parent.left === child"),
    # The read rule's second look, 2026-11-20, as its builder gave them: 56 a mended catch round a read swallowing again
    # (sourceText.boundary.test.ts); 57 the docs root's probe before pruning read as gone, and 58 a folder above the
    # workspace read as no scan (generator.test.ts, and the structural test); 59 the tidying after a pruned doc stopping
    # the run (generator.test.ts, and the structural test's list); 60 the estate's probe for a scan's docs read as none
    # (the structural test alone); 61 a failed read of .gitignore read as none where git cannot judge
    # (discovery.test.ts); 62 a failed probe of the engine's own grammar loading the bundled one (treeSitter.test.ts);
    # 63 a failed probe of a folder's .git read as no repository (gitIgnored.test.ts); 64 a worker's warning of a file
    # it could not map (history-worker-warning.test.ts); 65 the command's words for a failure of the machine's
    # (generate-cli.test.ts). The broken forms of 63 and 65 leave an import unused, which tsx runs all the same.
    ("packages/engine/src/live-docs/adapters/go.ts",
     "      facts = await fileFacts(path.join(workspaceRoot, file));\n    } catch (error) {\n      throwIfMachineFailure(error);\n      continue;\n",
     "      facts = await fileFacts(path.join(workspaceRoot, file));\n    } catch (error) {\n      continue;\n"),
    ("packages/generator/src/generator.ts",
     "    return stats.isDirectory();\n  } catch (error) {\n    throwIfMachineFailure(error);\n    return false;\n",
     "    return stats.isDirectory();\n  } catch (error) {\n    return false;\n"),
    ("packages/generator/src/generator.ts",
     "      return true;\n    } catch (error) {\n      throwIfMachineFailure(error);\n    }\n",
     "      return true;\n    } catch (error) {\n      void error;\n    }\n"),
    ("packages/generator/src/generator.ts",
     "    } catch {\n      break;\n    }\n",
     "    } catch (error) {\n      throwIfMachineFailure(error);\n      break;\n    }\n"),
    ("packages/engine/src/live-docs/graphFiles.ts",
     "    } catch (error) {\n      throwIfMachineFailure(error);\n      return false;\n",
     "    } catch (error) {\n      return false;\n"),
    ("packages/engine/src/live-docs/discovery.ts",
     "  } catch (error) {\n    throwIfMachineFailure(error);\n    // No `.gitignore`, or a name the disk cannot hold: nothing to ignore.\n",
     "  } catch (error) {\n    // No `.gitignore`, or a name the disk cannot hold: nothing to ignore.\n"),
    ("packages/engine/src/live-docs/adapters/treeSitter.ts",
     "    // A name too long, or a loop of links, is not there either; any other failure is the machine's.\n    throwIfMachineFailure(error);\n",
     "    // A name too long, or a loop of links, is not there either; any other failure is the machine's.\n    void error;\n"),
    ("packages/engine/src/tooling/gitIgnored.ts",
     'fs.statSync(path.join(at, ".git"), { throwIfNoEntry: false }) !== undefined',
     'fs.existsSync(path.join(at, ".git"))'),
    ("packages/generator/src/history/summarizeChange.ts",
     "  for (const failure of unmapped) warn(`could not map ${failure.path}: ${failure.reason}`);\n",
     ""),
    ("scripts/live-docs/generate.ts",
     "  const unreadable = layer4Result.failed.filter(({ error }) => machineFailure(error));\n  const unmapped = layer4Result.failed.filter(({ error }) => !machineFailure(error));\n",
     "  const unreadable = layer4Result.failed.filter(() => false);\n  const unmapped = layer4Result.failed;\n"),
]
mode = sys.argv[1]
# Each edit by the guard it breaks: the environment's takes two edits.
guards = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
          39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65]
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

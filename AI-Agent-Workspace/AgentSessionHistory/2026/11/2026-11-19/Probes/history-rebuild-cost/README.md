# Where a history rebuild's time and disk writes go

Current as of November 19, 2026: a measurement made read-only by a builder for the root, with `main` at `892833fc` and the history cache of lens `c186af7356b58191` (1,224 summaries, head `c84fd00f`). Nothing under `packages/` or in `.live-docs.config.json` changed, nothing was rebuilt, and the cache on the main checkout was only read. The measuring scripts lived in the builder's scratch folder and were not kept: each is described below well enough to write again in a few minutes. They ran the main checkout's build of 15:17 that day, the build that made the cache.

**Answer.**
- A cold rebuild writes **521 GB** of trees. Of that, **511 GB** lies under `AI-Agent-Workspace/`, a folder the configuration excludes. At today's head the summarizing process opens no file there, and it opens 14 MB of the 1,017 MB tree in all.
- Writing the tree is 17% of a commit's wall time early in the line, 26% in the middle and 42–51% at the head.
- Writing only what is read would cut the writes by 98% and most of that time. That is the first thing to build.
- Moving one tree from commit to commit would save little once that is done, and it carries real risk.
- Per-blob reuse of analysis has a large ceiling: 7,203 distinct versions behind 977,305 analysed file-moments. But the generator's time is mostly in its workspace index pass, whose content-only share is not known. Measure that before building anything there.

## 1. One commit's anatomy

Each phase ran as the history command runs it:
- **Tree:** `workingTree` of the built `git.ts`.
- **Generator, summary and text store:** the built `summarizeChange` given its task, in a process of its own with the tree's git environment. Its generator pass, `summarizeGraph` and `putTexts` were timed apart by wrapping those exports.
- **Removal:** `rm -rf` of the tree.

Processor seconds are user plus system and include child processes (git). Three other builders shared the 20-core machine, at a load of 1.9–4.9.

| Commit (position on the line) | Tree | Write the tree: wall / processor s | Summarizing process: wall / processor s | of which the generator | Remove | Write share of wall |
| --- | --- | --- | --- | --- | --- | ---: |
| `87b9e7b5` (100, early) | 1,213 files, 16.7 MB | 2.3 / 2.5 | 10.9 / 13.3 | 9.5 / 11.8 | 0.05 | 17% |
| `535ceefc` (612, middle) | 3,020 files, 258 MB | 5.7 / 7.1; again 5.9 / 7.3 | 16.5 / 20.4; again 15.5 / 19.0 | 13.1 / 16.4 | 0.11 | 26% |
| `c84fd00f` (1,224, head) | 7,532 files, 1,017 MB | 28.5 / 39.4; again 18.7 / 26.9 and 17.2 / 24.8 | 27.4 / 33.8; again 23.4 / 28.8 | 21.6 / 26.0; again 18.5 / 21.9 | 0.3–0.5 | 42–51% |

Notes on the table:
- **`summarizeGraph`** took 0.01–0.09 s everywhere.
- **`putTexts`** took 0.4 / 2.4 / 3.4–3.7 s here, but each run wrote into an empty text store. In a rebuild the store already holds most texts and `putTexts` skips them (`fs.access` first), so these figures overstate it.
- **Peak memory** was 390–464 MB.
- **Removing the tree** costs nothing that matters.

**The generator's passes** were timed by wrapping the engine's exports, and their wall times were summed.

| Pass | Head (18.5 s) | Middle (13.1 s) |
| --- | ---: | ---: |
| `buildWorkspaceIndexes` (the index pass over every file) | 9.3 s | 7.6 s |
| `analyzeSourceFile` (1,091 and 858 calls) | 4.7 s | 2.3 s |
| `discoverTargetFiles` + `discoverDocuments` | 2.0 s | 0.4 s |
| read + write of the graph | 0.4 s | 0.3 s |
| `citingDocuments`, `renderLiveDoc` | 0.1 s | 0.1 s |

The rest (process start, reading the mirror's existing docs, pruning) is about 2 s. On October 19 [the generation-cost probe](../../../../10/2026-10-19/Probes/generation-cost/README.md) found a pause of about 2.5 s inside the index pass after the PowerShell adapter, not parse time. It was not diagnosed then and was not diagnosed here.

**The oracle reproduces.** Four commits were summarized afresh: the three above and `85ba619f`, once under strace. Each summary, unzipped, was identical byte for byte to the cached one, though it ran in another folder, another process and under other load.

## 2. What the summarizing process opens

The summarizing process ran at the head under `strace -f -e trace=openat,execve`. Opens that succeeded under the scratch tree, other than of directories, were matched against `git ls-tree -r -l` of the commit.

| Top-level folder | Files | MB | Files opened to read | MB of them |
| --- | ---: | ---: | ---: | ---: |
| `AI-Agent-Workspace/` | 5,287 | 1,002.3 | **0** | **0** |
| `packages/` | 422 | 6.2 | 421 | 6.21 |
| `.mdmd/` | 1,114 | 5.2 | 1,112 | 4.94 |
| `tests/` | 594 | 2.4 | 582 | 2.41 |
| `scripts/` | 83 | 0.7 | 83 | 0.73 |
| the rest (root files, `.github/` and other dot folders) | 32 | 0.3 | 27 | 0.09 |
| **All** | **7,532** | **1,017.1** | **2,225** | **14.4** |

By kind:

| Kind | Files | MB | Files read | MB read |
| --- | ---: | ---: | ---: | ---: |
| Pictures (png, jpg, gif, webp, svg, ico) | 3,509 | 711.0 | 15 | 0.00 |
| Other (no listed suffix: logs, binaries, txt) | 531 | 231.7 | 101 | 1.07 |
| Markdown (not Live Docs) | 871 | 46.6 | 21 | 0.06 |
| Manifests and data | 471 | 13.5 | 85 | 0.21 |
| Code | 1,035 | 9.0 | 890 | 8.09 |
| Live Docs | 1,115 | 5.2 | 1,113 | 4.94 |

- **The 15 pictures read** are the small fixture images under `tests/integration/fixtures/slopcop-assets/`. Not one picture under `AI-Agent-Workspace/` is opened.
- **Git.** The git children (`git check-ignore`) open nothing in the tree: they read the index and the repository.
- **At an old commit**, `85ba619f`, traced for stats and directory reads, nothing under `AI-Agent-Workspace/` was opened for its content either. Two things touch that folder:
  - discovery's walk opens its directories (850 directory opens);
  - the summarizer checks that each linked document exists. There were 114 `statx` calls on records, summaries and their folders (`standingRelatedDocs` in `summarizeChange.ts`).

  So the excluded folder's files matter at an old commit only by whether a linked document exists, never by their bytes.

## 3. How much is new at each commit

These counts cover the first-parent line up to `c84fd00f`, 1,224 commits, from one `git ls-tree -r -l` per commit. "Analysed" means the file has a doc in that commit's cached summary.

| Count over the line | (path, blob) file-moments | Bytes | Distinct blobs |
| --- | ---: | ---: | ---: |
| Every file: what a cold rebuild writes | 4,632,597 | 521.5 GB | 28,902 (1.64 GB) |
| Outside `AI-Agent-Workspace/` | 1,995,516 | 11.0 GB | 20,954 |
| Outside it, plus every markdown file under it | 2,592,249 | 51.3 GB | 24,524 |
| New against the previous commit, every file | 34,276 | 2.56 GB | — |
| New against the previous commit, outside `AI-Agent-Workspace/` | 21,505 | 0.35 GB | — |
| New against the previous commit, outside it plus its markdown | 25,865 | 0.71 GB | — |
| Analysed files | 977,305 | 6.9 GB | 7,203 (232 MB); 7,721 distinct (path, blob) |

- **Analysed files per commit:** median 858.
- **Analysed files new per commit:** median 0, 90th percentile 18, at most 209.
- **Live Docs in the trees:** 976,587 moments, 12,799 of them new against the previous commit.

So 99.2% of per-file analyses repeat a version already analysed.

## 4. What depends on a file's bytes alone, and what on the whole tree

This section is from reading `generator.ts`, `discovery.ts`, `sourceAnalysis.ts` and `summarizeChange.ts` as of `892833fc`.

**Bytes alone:**
- the TypeScript parse;
- `collectExportedSymbols` (names, kinds, doc comments);
- the raw import and export specifiers;
- the binary sniff;
- the path-and-configuration part of the archetype.

**The rest of the tree:**
- the index pass itself: a workspace symbol index and the entry index from every manifest;
- `collectDependencies`, which resolves specifiers against the files on disk;
- `augmentWithReExportedSymbols`, which reads the providers;
- DOM inference, which reads markup within the file index;
- route inference, which uses the symbol index;
- every language adapter, which is given the file index and the symbol index, and several of which mix extraction with resolution;
- Cited By, which reads every markdown document discovery finds;
- each doc's authored block, from the commit's committed mirror;
- the existence of linked documents;
- the graph, which is read back from all the docs.

**What of October 19 exists today.**
- The accepted boundary, between extracting a file's own facts and resolving them against the workspace, is a principle. It is not a seam in the code.
- Only in-process caches exist (several adapters' maps), and they live for one run.
- No serializable form of unresolved facts exists, and there is no store across runs.
- The bounded prototype of October 19, which reused TypeScript symbol entries within a run, saved nothing and was removed.
- Each per-commit process therefore starts from nothing. It can use none of this across commits until such a seam and store exist.

## The three shapes, costed

**(i) Write only what is read.**
- **What it is.** The tree writer leaves out every file the configuration's `exclude` names, by discovery's own matcher, never a second copy of the rule.
- **The existence check must change with it.** The summarizer's check that a linked document exists would ask the commit's listing (the tree's index, or a list in the task) instead of the disk. If it asks the disk, the markdown under excluded folders has to be written too: that is 51 GB rather than 11 GB, because records are large.
- **Saves.** Writes fall from 521 GB to 11 GB (98%). At late commits it removes most of the 17–28 s of tree writing; early, it removes little. By the head's rate of 25–39 processor-seconds per GB written, the line's writes are about 3.6–5.6 of the rebuild's 22 processor-hours. Their share of the twelve-wide pool's wall time was not measured: twelve processes no faster than eight hints at a shared disk or memory limit.
- **Cost.** A small change in `git.ts` and in `summarizeChange.ts`. Both are in the lens key, so it rides with the rebuild already owed. The unwritten entries need no record in the summary: they are excluded by the configuration, which is in the key.
- **What could go wrong.** A future reader of excluded files, such as an adapter reading context outside the scan (the DOM case of October 19), would silently see less. The oracle comparison is the guard.

**(ii) Move one tree from commit to commit.**
- **Saves.** Alone: 521 GB → 2.6 GB. After (i): 11 GB → 0.35–0.7 GB, about 2% of the original writes.
- **What it needs of the order.** Each process would take a contiguous run of the first-parent line in order. Today the pool hands commits out one by one to whichever lane frees, so neighbours land in different processes. Contiguous runs lose load balancing (late commits cost three to five times early ones), and a partial cache leaves scattered gaps.
- **Cleaning.** The generator writes into the tree (the mirror's docs, `index.json`, prunes), so each step must restore the mirror and remove untracked output before the next commit.
- **Applying the difference.** If git checkout applies it, git's own rules for names, links and case replace the writer's rules, which record every entry it cannot write. If the writer applies the difference itself, that is a new piece of exactly the code that has needed the most care.
- **What could go wrong.** A leftover from the previous commit silently enters a summary.
- **Verdict.** Do not build it, at least not after (i).

**(iii) Analyse each distinct version of a file once.**
- **Ceiling.** 977,305 file-moments rest on 7,203 versions.
- **The time it can reach.** The index pass (7.6–9.3 s) and `analyzeSourceFile` (2.3–4.7 s) are 75% of the generator's time at the head and the middle. How much of that is extraction, as against resolution, and fixed costs such as loading grammars and the unexplained pause, is unmeasured.
- **Cost.**
  - A serializable form of each adapter's unresolved facts, and many adapters mix the two.
  - A store keyed by the blob and by the code identity that reads it.
  - A second pass that resolves from those facts alone.
  - The far end, reading blobs from git's object store with no tree, also replaces the disk seam that every adapter reads through.
- **What could go wrong.** A cached fact that secretly depended on its neighbours, which October 19 found twice.
- **Verdict.** Do not build it until the index pass is decomposed. A fixed per-process cost would make a cheaper fix: the 2.5 s pause alone is about 50 processor-minutes across the line.

**How they compose.**
- (i) composes with both (ii) and (iii).
- (iii) without a tree on disk subsumes (i) and (ii).
- Build (i) first, with the owed rebuild.
- Then measure the index pass: per-file time split into parse, resolution and fixed cost.
- Do not build (ii).

## The oracle

Summaries are gzipped JSON, one per commit, holding `format`, `lens`, `commit`, `files` and `docLinks`. Texts sit in a content-addressed store, so identical summaries name identical texts.

**Deterministic in practice.** Four of four fresh summaries matched the cached ones after unzipping. Compare unzipped bytes, not gzip bytes, which depend on the zlib build.

**What a changed key means.** Any of the shapes above changes code in the key (`git.ts`, `summarizeChange.ts`). The new summaries then carry another `lens` value, so the comparison must set `lens` aside. The `lens` field is the only part that names the key. The comparison must also run under the same configuration as the oracle, because the configuration is in the key. A configuration change such as naming the archive's former layout is a separate step, compared on its own.

**As a test.** A comparison over all 1,224 commits is itself a rebuild. A sample is practical: every 25th commit plus chosen hard ones is about 50 commits, around 15–20 minutes at four processes. A probe's driver that hands `summarizeChange` a task with the oracle's `lens` and configuration (read from the history file) reproduces a summary outside the real cache. The main checkout's cache must never be the place it writes.

## Not measured

- The pool's behaviour at twelve processes: where the shared limit lies (disk, page cache or memory bandwidth), and so the wall-clock saving of (i) under the pool.
- The index pass's decomposition, and the October 19 pause.
- The text store's cost in a warm rebuild.
- Device-level write bytes. The bytes reported are logical sizes from git and `du`.
- More than three commits for the anatomy, and only one under strace for opens.

## Who asks about the excluded folder by name (measured later on November 19)

Opening counts reading, but a walk or a `stat` reads only names, and a tree that leaves the excluded folder out changes their answers. Before the tree writer began to leave out what `exclude` names (`df0f792b`), the summarizing process of the code before that commit was run again at the head (`c84fd00f`) and at an early commit (`87b9e7b5`, 83 files under `AI-Agent-Workspace/`). It ran under `strace -f` for `getdents64`, `stat`, `lstat`, `statx`, `access`, `readlink` and `openat`, with a preloaded hook on node's `fs` and on `glob` that named the code behind each call beneath `AI-Agent-Workspace/`.

| Calls beneath the excluded folder | Head | Early |
| --- | ---: | ---: |
| folders opened (`openat`) | 1,489 | 42 |
| folders listed (`getdents64`) | 4,754 | 1,267 |
| `statx` | 8,210 | 201 |
| files opened for their content | 0 | 0 |

| Caller | What it asks | Can its answer reach a summary, a warning or an exit code? |
| --- | --- | --- |
| Discovery's walk (`discovery.ts`, `walk`, `glob(["**/*"])`), run twice: for the files to document and for the documents | every name in the tree | No. Every path the walk finds is then held to `exclude` (`keptByGitAndConfiguration`) before anything uses it; a file `exclude` names is dropped whatever the walk said. |
| The search for nested scans (`generator.ts`, `scansWithin`, `glob(["**/<root>/<baseLayer>", "**/.live-docs.config.json"])`) | whether a docs root or a configuration file stands anywhere | **Yes, a warning.** Mended: `scanMarkers` names the two marks once, `scansWithin` and `marksScan` both read them, and `unread` never leaves out a file `marksScan` names. A test (`regenerate.test.ts`) fails without it. |
| The JSON adapter's `compilerPaths` (`adapters/json.ts`), through TypeScript's `parseJsonConfigFileContent` for the `tsconfig.json` beside a manifest | TypeScript lists every folder under the tsconfig's folder for its file list (`readdirSync`, `realpathSync`; 1,246 calls at the head) | No. Only the parsed `options` are read (`outDir`, `rootDir`); the file list, the one thing the walk decides, is discarded. Left to the builder who owns `json.ts`. |
| Whether a linked document stands (`summarizeChange.ts`, `stands`, `fs.stat`; 116 at the head, 55 early) | the records a doc links to | **Yes, a summary.** Mended in `df0f792b`: the commit's own listing is asked, not the disk (`standingFiles`). |
| `git check-ignore`, which the generator starts | given the walked paths on its input | No file under the tree is opened by it (the head's earlier trace with `execve`); it answers from the tree's index, and a tracked file is never ignored. Any answer about an excluded path is dropped by the `exclude` filter after it. |

The language adapters that glob the whole workspace for their own files (`go.ts`, `java.ts`, `rust.ts`, `csharp.ts`) do so only when they are given no file index. The generator always gives one, held to `exclude`, and no such glob ran at either commit.

## The new tree writer, the same three commits one at a time (November 19)

The tree writer of `df0f792b` leaves out what `exclude` names. Measured as in section 1, one commit at a time, at a load of 2.9 to 3.0 (six other agents shared the machine). Bytes are the tree's logical size (`du -sb`), the writer process's `wchar` (bytes it passed to `write`) and `write_bytes` (bytes it sent towards storage), from `/proc/self/io`.

| Commit | Tree written | Bytes: logical / `wchar` / `write_bytes` | Write the tree: wall / processor s | Before (section 1) | Summarizing process: wall / processor s |
| --- | --- | --- | --- | --- | --- |
| `87b9e7b5` | 1,130 of 1,213 files | 6.3 MB / 13.0 MB / 9.2 MB | 1.0 / 1.1 | 2.3 / 2.5, 16.7 MB | 12.1 / 14.9 |
| `535ceefc` | 1,746 of 3,020 files | 8.6 MB / 18.3 MB / 13.4 MB | 1.8 / 2.0 | 5.7 / 7.1, 258 MB | 16.5 / 20.4 |
| `c84fd00f` | 2,245 of 7,532 files | 14.9 MB / 32.4 MB / 21.4 MB | 2.3 / 2.7 | 17.2–28.5 / 24.8–39.4, 1,017 MB | 20.0 / 24.3 |

The summarizing process's own time is unchanged within the load's noise; its text store was empty for each run, as in section 1. At `87b9e7b5` and `535ceefc` the summary is identical byte for byte to the cache's. At the head it differs only by the links to the session archive it now keeps, which the history takes out where it reads the summaries (the oracle sample of 54 commits).

## After the independent review: every name written, and the tree timed again (later on November 19)

[The independent review of the engine round](../engine-round-review/README.md) showed by runs that the section above's "nothing is opened under the excluded folder" was this repository's luck: elsewhere the generator reads excluded files that included code imports or re-exports, and probes the disk for others. The tree writer now writes every name; an excluded file no reader handles, outside the docs root, is written empty; a symbolic link to a file of the tree is written as a copy of it.

At the head (`c84fd00f`): 7,532 files written, 4,734 of them empty where 988 MB stood, and the 553 excluded files with a reader written whole, 14.1 MB. Logical bytes 29.0 MB, `wchar` 60.9 MB, `write_bytes` 36.8 MB. The same three commits, one at a time, at a load of 8 to 12 (other agents' runs), so the seconds are not comparable with the table above:

| Commit | Files | Bytes: logical / `write_bytes` | Write the tree: wall / processor s |
| --- | --- | --- | --- |
| `87b9e7b5` | 1,213 | 6.3 MB / 9.2 MB | 2.6 / 2.9 |
| `535ceefc` | 3,020 | 10.8 MB / 15.6 MB | 4.5 / 5.1 |
| `c84fd00f` | 7,532 | 29.0 MB / 36.8 MB | 11.0 / 12.0 |

The rule is held to the whole tree as the oracle: over all 43 sample workspaces of the integration tests, each top-level folder excluded in turn (100 exclusions), the docs written over the history's tree equal those written over the whole tree byte for byte (`tests/integration/live-docs/history-tree-equivalence.test.ts`). A hook on node's file reads over the same runs found no reader opening the content of any of the 34 files written empty.

## The signal case that went red three times in ten (later on November 19)

The integration case that a signal leaves no scratch tree behind looked for any `live-docs-history-*` folder in the system's temporary folder, which every history run on the machine shares. Instrumented over 13 runs, the command always did what it should: at the signal two summarizing processes were alive, every removal ran and succeeded, the folders were gone, and the command exited 130 about 40 ms before the tsx wrapper the case waited for. The folders the case found in its red runs belonged to other runs, named by the caches their tasks wrote to (another worktree's `history-checked-*`, another test file's `history-fixture-*`). With a second history run of the probe's own going on in the shared folder, the case at `0fd0d7e4` went red 6 times in 10. The test files now give themselves and every command they start a private, short `TMPDIR`, and the signal case starts the command itself under tsx's loader rather than tsx's wrapper. Beside the same second run, the mended case (`ca266bf7`) was green 50 times in 50.

## The rule narrowed again (later on November 19)

The review's second pass found the C reader opening an excluded `.def` an include names, a kind no reader handles on its own, so the rule above lost such a file's symbols. A file is now written empty only when `exclude` names it, it lies outside the docs root, and it is an image, a font or a recording (`isMediaAsset`). At the head that is 3,554 files, 867 MB, where the rule above emptied 4,734 files, 988 MB; about 150 MB is written where a checkout writes 1,017 MB. Archives (191 files, 68 MB at the head) are written whole until that is decided.

## The joined round's one rebuild and its comparison, prepared for the root (later on November 19)

Prepared on the engine round's branch at its joined tip, not run. The tip joins `main`, the names', links', Windows and command line, script entries' and `packages/cli` deletion's branches, and the move to Node 26 (the container still runs Node 22.23.5; both report Unicode 17.0). The two scripts named below are in this folder.

**Where it writes, and under what key.** The history command writes its cache under the workspace's docs root, `.mdmd/history/<key>/`, beside the old cache, which it neither moves nor removes unless `--remove-superseded` is given: never give it here. It also rewrites `.mdmd/history/history.json`, the words folder `.mdmd/history/history-words-<hash>/`, `pool.json`, and `unwritten.txt` when an entry is left unwritten. The key at the joined tip (`6aa816da`) is `b4294caf0e7d629f`; after the merge into `main` it is the same if `main` brings no other change to the keyed files (the engine's and the generator's code, `tsconfig.base.json`, the lock), and `lens-key.ts` prints it for whatever checkout it runs in.

**The rebuild,** from the main checkout after the merge, under the Node on PATH, with a private, short temporary folder (tsx makes its socket there):

```sh
cd /workspaces/Live-Documentation
npm ci && npm run build
npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-cost/lens-key.ts
mkdir -p /tmp/claude-1000/rb
cp .mdmd/history/history.json /tmp/claude-1000/rb/history-before.json
TMPDIR=/tmp/claude-1000/rb npm run live-docs:history -- --check-head --jobs 10 --stop-after 300 > /tmp/claude-1000/rb/run.log 2>&1
```

- **How long.** About 1,270 commits. A commit's summarizing process took 15 to 44 processor-seconds alone at the three anatomy commits, early to head; the tree is now about 150 MB at the head where it was 1,017 MB. At ten processes on this 20-core machine with other agents at a load of 20 to 40, expect two to three hours; on a quiet machine, about an hour and a half. `--jobs` may be left out on a quiet machine, when the pool is sized by `pool.json` (a process's peak was 566 MB).
- **What heap.** A process peaked at about 570 MB; node's default heap is enough. If a process dies for want of heap, raise it as usual, `NODE_OPTIONS=--max-old-space-size=4096`, which the history carries to the summarizing process.
- **If it stops.** Run the same command again: the cache keeps every summary written and the run regenerates only what is missing or damaged. `--stop-after 300` starts no commit after five hours and exits with code 3, writing no history; a second run resumes.
- **What must hold.** The run ends with "the last step's … files … are those of the Live Docs committed at <head>" (`--check-head`); anything else stops it.

**The comparison** of every commit's summary with the old cache, `c186af7356b58191/`, read only on both sides:

```sh
npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-cost/compare-summaries.ts \
  .mdmd/history/c186af7356b58191 .mdmd/history/<key> --samples 5 --json /tmp/claude-1000/rb/compare.json
```

What "the same" means, since the lens changed on purpose:

- `lens` and `format` are set aside: the key moved with the code, and format 4 keeps citing documents by path.
- The new summaries keep every linked and citing document; the old ones were made under the old configuration's bundle exclusions. The script reads each new summary through `bundledSummary` with the old configuration's `bundleExclude` (`.live-docs.config.json` at `c84fd00f`, the old cache's head), so that both are held to one exclusion; the archive's former layout, which this round added to the configuration, changes the sequence, not the summaries.
- Every other field must be equal, but where a branch of the joining is meant to move it. Those differences are counted as **meant**, with the branch, and a few samples of each are printed for a person to read:
  - `docLinks` and `citedBy`: the markdown links' branch, which reads links by CommonMark's rule.
  - `entries`: the script entries' branch, which reads package scripts as a shell splits them.
  - `symbols`, `dependencies`, `reExports`, `archetype` of a file whose bytes at the commit are not plain UTF-8: the Windows branch's one reading step.
  - a symbol whose name holds a character the names' branch writes otherwise.
- Anything else is a **fault**: a file in one summary and not the other, `authored`, `unread`, `unwritten`, or a field above outside what its branch explains. The script prints its counts, exits 1 on any fault, and writes every finding to the JSON file. A fault is run down, not explained away.
- Checked before handing over: the script over the old cache against itself reports 1,263 commits identical and no fault. The old cache's 1,263 commits are compared; the commits since it was made are only in the new one.

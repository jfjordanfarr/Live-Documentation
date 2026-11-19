# An independent review of the round that makes the history carry symbol rows and words

Historical record of a review, November 19, 2026. A reviewer given the branch `history-symbols-and-words` at `230ac603` and no conclusions of root's read its changes for correctness before a merge and changed nothing. The round is described in [the day's record](../../2026-11-18.1.record.md#work-notes-the-historys-data-handed-back-measured-and-sent-to-an-independent-review); what was done about each finding is in the notes that follow there. The report below is the reviewer's, as handed back; its paths are of the branch as it stood.

The branch's history unit tests (14 files, 92 tests) and the two integration files `history.test.ts` and `generator-identity.test.ts` (24 tests) all pass. One finding is confirmed by a run and blocks other repositories. Two more change cached content or CI behaviour. The rest are smaller.

**Housekeeping:** I briefly put a probe file (`.slugprobe.ts`) in the worktree root and removed it. The worktree is clean (`git status` empty), and my scratch files are deleted.

## Findings, most serious first

**1. Any repository that exports a symbol named `$` (or `$$`, `€`, `+`) cannot produce a history at all.** Confirmed by a run.
- **Where:** `packages/engine/src/live-docs/history/summary.ts:192-194` throws `lists $ without an anchor` whenever a symbol has no slug.
- **Why it happens:** `createSymbolSlug` (`coreUtils.ts:60`) returns `undefined` for names that are only punctuation, and the generator then writes the heading with no `{#…}` anchor.
- **What I ran:** a one-file repository with `export const $ = …`. The generator gave `$` slug `undefined`, and `summarizeGraph` threw.
- **Consequence:** the summarizing process fails, `inPool` stops at the first failure, and the whole run fails. This is the same at every rerun for every commit containing such an export. `main` kept only counts and did not throw here, so this is new on the branch.

**2. The lens key leaves out code and state that change what a summary contains.**
- **Unkeyed code:** `history/git.ts` and the environment `computeHistory.ts` passes to the child are not in the key (`generatorIdentity.ts:44-63`). Yet they decide which files a summary sees:
  - the tree's bytes: autocrlf, LFS skip, attributes;
  - the `GIT_DIR`, `GIT_WORK_TREE` and `GIT_INDEX_FILE` environment, without which tracked-but-ignored files drop out.
- **A concrete case from this branch:** that environment fix changed summary content. If it had landed alone, every cached summary would have been reused without the missing files.
- **The guard test cannot catch this:** the code runs in the parent process, not in `summarizeChange.ts`'s import closure.
- **Confirmed by a run (git 2.56.1):** I compared `read-tree` plus `checkout-index` against a real worktree.
  - `checkout-index` applies the `.gitattributes` of the person's current checkout, not the commit's own.
  - A commit with no attributes came out CRLF because today's HEAD has `*.ts text eol=crlf`; a `git worktree add` of the same commit gave LF.
  - So summaries depend on the live state of the working tree, including uncommitted `.gitattributes` edits, `.git/info/attributes`, `working-tree-encoding` and filters. None of it is keyed.
  - The doc comments at `git.ts:7-14` and `git.ts:95-97` ("its own attributes declare it") are false.
  - Impact on TypeScript is small: the generator normalises CRLF in descriptions, which I checked by a run. Other encodings and filters are not normalised.
- **Also not keyed, by reading:** the Node and git versions. `jsDoc.ts` sorts with `localeCompare`, which depends on ICU.
- **Guard test gaps:**
  - It does not follow non-`.ts` imports: a JSON file imported from a history folder is neither followed nor keyed.
  - It does not follow `import x = require()` or dynamic imports with non-literal arguments.
  - It does not see runtime `fs` reads.

**3. `pages.yml`: a cold run probably cannot finish within the step's 160 minutes, and consecutive engine pushes can keep Pages from ever deploying.** This is an estimate from the branch's own figures, not measured.
- **The arithmetic:** 5.4 s of wall clock per commit at 8 processes is about 43 s of process time per commit. `ubuntu-latest` (4 vCPU, 16 GB) gets `poolSize` = min(3, 10) = 3 processes. 1,173 commits at 3 processes is about 280 minutes, or about 160 minutes even at 25 s per commit unloaded.
- **Why it can loop:** the key still changes with nearly every non-test engine or generator edit. With `--remove-superseded`, each new cold run:
  1. restores the previous lens's partial cache,
  2. deletes it,
  3. starts cold again.

  Two engine pushes in a row can therefore each time out, and Pages is never updated.
- **What is safe:** a failed or timed-out step skips the build and deploy steps, so no partial or stale history is ever published; the save step still runs.

**4. A missing or tampered text is a permanent failure, and the error's advice does not recover it.**
- **Where:** `computeHistory.ts:336-346` treats a commit as cached when its summary file exists. It never checks that the texts the summary names exist.
- **What happens:** `writeWords` (`:597`) then fails on ENOENT, or `readText` throws "remove it and run the history again" (`textStore.ts:77`). Removing the text only turns that into ENOENT on every later run. The real fix is to delete the summaries that name it, or the lens folder, and no message says so.
- **How it can happen:**
  - someone deletes `texts/`;
  - a partial copy of the cache;
  - a concurrent run with another lens using `--remove-superseded`, which deletes this lens's store while its summarizers are writing (they recreate the folder through a recursive `mkdir`).

**5. The tracked-but-gitignored fix has no test.**
- `scripted-repository.ts` has no tracked file named by a `.gitignore`.
- The integration test's independent oracle uses `git worktree add`, so dropping `environment` from `git.ts` would still pass every test. Confirmed by grep.
- "Over 48 commits identical to worktrees" was a one-off check, not a test.

**6. The head check is weaker than described, and is usually skipped.**
- **Not fully independent (`computeHistory.ts:585-587`):** the rows side runs the committed graph through the same `summarizeGraph` and `rowsOfSummary` that produced the summaries. Only the source of the graph is independent; the links side is independent.
- **When it is skipped (`:548`):**
  - with an installed generator;
  - with any uncommitted change to keyed files;
  - with an explicit `--config`, even the same file;
  - for every repository other than this tool's own, since the generator's commit must equal the analysed head.
- **A reader error becomes a skip:** at `:557-558`, an error from `readLiveDocGraph` is reported as "does not apply".
- **How a skip is reported:** only as a progress line.
- **What is not tested:** the gating and the end-to-end path. The scripted repository always takes the skip.
- **In CI it does apply:** a stale committed mirror fails the history step, though `ci-check --check-live-docs` already catches that.

**7. Pool sizing ignores container limits** (`computeHistory.ts:130-133, 168`). Found by reading.
- `os.totalmem()` and `os.cpus()` report the host, not cgroup limits. In a memory-limited container on a large host, you get up to cores−1 processes at about 540 MB each, which risks out-of-memory kills.
- `process.constrainedMemory()` exists for this.
- Under a new lens, `pool.json` records only that run's peak. A small sampled run can understate the full-history peak.

**8. Scaling and atomicity.**
- `writeWords` reads every text at once with `Promise.all` and holds the whole words store in memory; `staticBuilder` reads every part. That is fine at 11 MB, a risk for very large histories.
- `writeWords` deletes `history-words/` before `history.json` is replaced. A crash in between leaves the old sequence pointing at missing parts.

**9. Cleanup gaps.**
- A tree being written when SIGINT arrives is not yet in `trees`, so it leaks in `/tmp`.
- The head check's tree runs after the signal handlers are removed.
- Children killed mid-write leave `*.pid.partial` files in the cache and `texts/`. They are never cleaned and get saved into the CI cache.
- The comment and message at `computeHistory.ts:414-418` still speak of registered worktrees and "incomplete Git cleanup".

**10. Symbol renames can be misread.** Two unrelated symbols with identical boilerplate descriptions, one gone and one born in the same file and step, are read as a rename. The rows still replay exactly; only the "renamed" reading that consumers may show is wrong. Low.

## Plan claims with no test that could fail
- A process in the tree being given git's environment: finding 5.
- The last step held to the committed graph, end to end, including when it is skipped: finding 6.
- Trees "as the repository stores it": tested only against `core.autocrlf`, not attributes (finding 2).
- The Pages cache behaviour: untestable here.

## Checked and sound
- **Tests:** history unit and the two integration files pass in the worktree (92 and 24).
- **Codec:** `trimmed` defaults line up with every decoder's defaults for symbol, reference, dependency, entry, re-export and file-rows tuples. Read line by line.
- **Rows replay:** gone, then changed, then born at final indices, then a full reorder only when the stayed symbols moved. This is exact, and renamed files carry their rows and every inbound reference. Read; the builder also compares each replay against the summary's rows, independently of derive and the codec.
- **Keyframes:** rows sought from a keyframe are tested (`sequence.test.ts`, "replays to every step's rows…"), and windows re-base rows (tested).
- **Words store:** `textReferences` names texts at the base, on renames across directories, on authored changes and on changed or born symbols. Read, plus `words.test.ts`.
- **Text store writes:** each text goes to a temporary file and is renamed into place. Two writers produce identical bytes, a read verifies the hash, and `textPath` refuses non-hex names. Read and tested.
- **Summarizer loads source:** the forked summarizer loads `packages/*/src` (which is keyed) via tsx's tsconfig paths, not the gitignored `dist`. Confirmed by a fork probe.
- **No env or HEAD leaks:** engine and generator read no `process.env`. Their only git call is `check-ignore`, so `GIT_DIR` pointing at the common dir cannot leak HEAD-dependent data. The `GIT_*` variables go only to the child process. Checked by grep.
- **Concurrent trees:** private index per tree, nothing registered (`git.test.ts` and the integration test).
- **No hardcoded paths:** no `.mdmd`, `layer-4` or suffix in added product code; only tests. Checked by grep of the diff.
- **Format bump:** every consumer (static builder, Explorer client, inspect) compares against the `HISTORY_FORMAT` constant, so format 3 is read consistently.
- **Lock and dirty-tree keying:** tested by `generator-identity.test.ts`.
- **Grammars:** the engine's own grammar `.wasm` files are tracked and therefore keyed.

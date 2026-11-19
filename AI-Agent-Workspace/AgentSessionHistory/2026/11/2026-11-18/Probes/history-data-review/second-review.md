# A second independent review, of the mends

Historical record of a review, November 19, 2026. A second reviewer, given the branch `history-data-mended` at `05c0b350` and [the first review](README.md) and no conclusions of root's, read the mends for correctness before a merge and changed nothing. The report below is the reviewer's, as handed back; its paths are of the branch as it stood.

**Verdict: don't merge it as it stands.** Two problems in the new tree writer need fixing first, and both fixes are small: a commit can make the writer put files outside its scratch folder, and its error path crashes the whole process. The ten earlier findings are otherwise answered, and I confirmed the mends below. Nothing in the worktree changed (`git status` is clean), and my scratch files are deleted.

**Tests I ran:**
- Unit tests for the two history folders, `compareText`, the json adapter, `compose` and `generator`: 18 files, 170 tests, all pass.
- `generator-identity.test.ts`: passes in the worktree.
- `history.test.ts`: 28 tests pass. I ran it in a `git archive` copy of the tip with `node_modules` linked, because the worktree has no `node_modules`.
- `generate --check` on a clone of `05c0b350`: all 1,091 docs unchanged. So the committed mirror matches this generator, with the new sort order and anchors.

## Findings, most serious first

**1. A commit can make the tree writer write anywhere the user can.** Confirmed by a run. `packages/engine/src/live-docs/history/git.ts:153-210`
- **What's wrong:**
  - Each entry's path is joined and written with `fs.mkdir(recursive)`, `writeFile` and `symlink`.
  - Nothing checks whether a leading part of the path is a symbolic link the writer itself made a moment earlier. Git's own checkout refuses exactly this.
- **What I ran:**
  - I built a tree with `git mktree` that holds a link `a -> <absolute dir>` and a tree `a/` holding `evil.txt`.
  - `writeStoredTree` wrote `evil.txt` into that outside directory.
  - Such a duplicate-entry tree fails `fsck`. GitHub rejects it on push, but a clone does not check it by default (`transfer.fsckObjects` is off).
- **No crafted objects needed elsewhere (by reading):** on a case-insensitive disk (macOS's default temp folder, Windows) an ordinary commit does it. A link `A -> ~/somewhere` plus a file `a/x` writes `x` through the link.
- **Windows path traversal (by reading):** the check splits only on `/`. So a name like `..\..\x` passes it, and `path.join` on Windows climbs out of the folder. Git for Windows refuses such names; this code doesn't.
- **Fix:** before each write, refuse any entry with a parent that is a link the writer made. Also refuse `\` (and `:`) on Windows, and refuse paths that clash by case on such a disk.

**2. Any error while blobs are still being requested crashes the parent with an uncaught `write EPIPE`.** Confirmed by a run. `git.ts:166-221`
- **What's wrong:** `reader.stdin` has no `'error'` listener. In the catch path, `reader.kill()` runs while the request (about 41 bytes per blob, already past the 64 KB pipe buffer at roughly 1,600 blobs) is still being written.
- **What I ran:** a tree holding two links named `aa` (the second `symlink` throws `EEXIST`), followed by 30,000 files. The process died with `Error: write EPIPE` / "Unhandled 'error' event", exit 1. The real error was lost.
- **What leaks when it happens:** the parent dies outside `Scratch`'s signal path. So the run lock, the scratch folders and the running summarizers (which keep writing into the cache) are all left behind.
- **Realistic triggers:**
  - a full temp disk;
  - a case clash on a case-insensitive disk (`Foo` a file and `foo/bar.ts` gives `ENOTDIR`);
  - names that are not valid UTF-8 and collapse to the same text;
  - on Windows without symlink rights, any link (`EPERM`).
- **Also by reading:** if `cat-file` exits non-zero while a write is being awaited, `exited` rejects with no handler. That is an unhandled rejection.
- **Fix:** add `reader.stdin.on("error", () => {})` (or route it into the error) and attach a catch to `exited` straight away.

**3. Package scripts: the new `--` rule turns arguments into entries.** Confirmed by a run. `packages/engine/src/live-docs/adapters/json.ts:148`
- **What's wrong:** everything after `--` is read as a new command, so its first file word becomes "what the script runs".
- **What I ran:** a workspace whose script is `"gen": "node scripts/gen.mjs -- data/input.json"`. Its generated docs list `data/input.json` as a `command` entry of `gen`. Before this branch only `scripts/gen.mjs` was an entry.
- **The same happens with** `tsx a.ts -- --out docs/x.md` (gives `docs/x.md`) and `vitest run -- tests/a.test.ts`. Entries drive reachability and "is it dead code", so this is a real new false result.
- **Smaller (by run):**
  - A quoted path with a space adds a stray candidate. `node "scripts/my script.js"` also tries `script.js` at the manifest's level.
  - `&>` splits the command.
  - `#` comments are not treated as comments: `node a.js # node b.js` names `b.js`.
- **Pathological input is fine (by run):** unbalanced quotes end cleanly; 20,000 open quotes take 40 ms; 50,000 quoted words take 134 ms; deep nesting is bounded. Nothing throws.

**4. Pages: a real failure now deploys a green run that silently drops the site's history, and the saved cache can grow while engine pushes keep arriving.** By reading the parsed YAML (parsed with `js-yaml`).
- **The YAML does what it claims:**
  - With `continue-on-error`, the step's outcome is `failure`, so `--history ${{ outcome=='success' && 'all' || 'none' }}` and the summary step's implicit `success()` behave as intended.
  - `set +e` and `$GITHUB_OUTPUT` carry exit code 3. I checked that `npm run` passes 3 through.
  - The cache is saved under `always()`.
  - The site never deploys a partial history or another generator's: `all` is used only when this run wrote `history.json`.
- **Problem: real failures look like budget stops.**
  - A crash, a stale committed mirror (the head check applies in CI) or a bug is treated like a budget stop. The run is green, with only a step-summary note and the step's own annotation.
  - Before this branch, a failure kept the previous site, history included, live. Now it replaces it with a site with no history, and nobody is notified.
  - Suggest a `::error::` annotation, or failing the job after deploy, when the code is not 3.
  - On a step timeout no code is written, so the summary says "failed".
- **Problem: partial caches accumulate.**
  - Other lenses' caches are removed only once the current lens is whole. If engine pushes arrive faster than a cold fill finishes (about 280 min of work at 3 processes, so two or more runs), each run saves the old whole lens plus every partial newer lens.
  - A full lens is 140–210 MB here (local `.mdmd/history`), and every run stores a new cache entry.
  - So the cache grows until some lens finishes, and pushes out other caches, such as setup-node's npm cache, under the 10 GB repository limit.
  - Main's recent rate (0–4 key-changing commits a day) makes this occasional, not constant.
- **Cancellation edge:** a run cancelled before the history step has `outcome` empty rather than `skipped`. It then saves the restored cache again under a new key; harmless.

**5. The run lock's takeover races.** By reading. `packages/generator/src/history/computeHistory.ts:322-345`
- **Two runs after a crash:** A and B both read the dead lock. A removes it and creates its own. B then runs its `rm` and deletes A's live lock. Both now run.
- **An empty lock file is taken over:** `writeFile(..., {flag:"wx"})` creates the file and writes it in a later turn of the event loop. A reader in between parses `""`, gets `{}`, and takes the lock over ("Unreadable … taken over").
- **Ctrl-C and SIGTERM always leave the lock:** `Scratch.during` calls `process.exit(130)` (`regenerate.ts:83`), so `release` never runs. The next run on the same host takes it over with a message; if another process has reused the pid, it refuses, with advice to remove the lock.
- **The repair cannot loop:** a damaged commit is summarized once per run. Text hashing and reading are both UTF-8, so even lone surrogates hash the same both ways.

**6. Anchors: a symbol-only name that is disambiguated loses the new form.** Confirmed by a run. `packages/engine/src/live-docs/compose.ts:132`
- **What happens:** with `$` const and `$` type (both legal in TypeScript) plus `$$` const and type, the anchors come out as `symbol--const`, `symbol--type`, `symbol--const-1` and `symbol--type-1`. So `$$`'s anchor depends on whether `$` exists, and the history would read adding `$` as a change to `$$`.
- **Fix:** build the disambiguated slug from `createSymbolSlug(name)` plus the kind.
- **Related, not a regression (by run):** a JSON key containing a backtick (`{"a`b": 1}`) makes the generator itself fail. The heading regex `#### \`([^`]+)\`` does not read it back. The same holds for an empty key. JSON keys are symbols, so such a file still stops a whole history.
- **Otherwise sound:**
  - Tilde forms cannot collide: the slug drops `~`. `~2a` gives `symbol-2a`; `*` gives `symbol-~2a`.
  - No existing anchor changed: the `--check` was clean.
  - Doc reader and writer agree on the new form.

**7. The key's guard is a heuristic with known blind spots.** By reading. `generatorIdentity.test.ts:107`
- **What it can't see:**
  - `actsForASummary` matches only a static `from "child_process"`. It misses `require` or `import()` of it, processes started through `gitUtils.execFileAsync`, and `fs` writes into the tree.
  - Nothing checks data that `computeHistory.ts` (not keyed) passes through `RegenerationContext`. A future field, such as an extra environment, would bypass the key without failing the test.
- **Not keyed:**
  - `tsconfig.base.json`, which decides how the forked summarizer resolves modules;
  - git replace refs and grafts: `ls-tree` and `cat-file` honour `refs/replace`, and no `--no-replace-objects` or `GIT_NO_REPLACE_OBJECTS` is set, so local repository state can change a summary.
- **Environment handling is safe:**
  - Stripping `GIT_*` and setting `GIT_CONFIG_GLOBAL`/`NOSYSTEM` is fine. Git older than 2.32 ignores `GIT_CONFIG_GLOBAL`, which is harmless because a tracked file is never ignored. On Windows, `os.devNull` is `\\.\nul`, which should open; I did not check on Windows.
  - The case-sensitive `GIT_` prefix misses a mixed-case variable name on Windows (negligible).

**8. Smaller points**
- **Memory:** `writeStoredTree` holds each whole blob in memory, times the number of jobs. `writeSequence` still reads every text into memory at once (old finding 8, partly open).
- **Warm-run cost:** `uncached` now unzips and parses every cached summary and reads every text on every warm run, then `buildSequence` reads the summaries again. That is extra cost; it is correct.

## Claims with no test that could fail
- The path refusal (`..`, `.git`), submodule handling, links pointing outside the tree, and duplicate or case-clashing entries.
- The tree writer's error and cleanup path (finding 2).
- The `cat-file` framing across chunk boundaries. The unit test's blobs are tiny. My probe passed: a 5 MB blob, an empty blob, content that looks like a header, 300 random blobs and a file with no trailing newline all came out byte-identical, the submodule became an empty folder, and an empty tree was handled.
- The lock's takeover and its races; only refusal by a live pid is tested.
- `--stop-after` and exit 3, and `usableMachine`'s use of the container limit (only the pure functions are tested).
- Everything in `pages.yml`.
- `--` and quoted-word entries producing no false entries.

## Checked and sound
- **The ignored-but-tracked fix now has a test that can fail.** I removed `GIT_DIR`, `GIT_WORK_TREE` and `GIT_INDEX_FILE` from `git.ts` in a copy, and that test failed.
- **Trees now ignore attributes and filters:** the test compares against a real worktree, with today's head asking for CRLF.
- **`compareText`** is a total, stable order: lowercase first, then code unit. It returns 0 only for equal strings and uses no locale. No `localeCompare` is left in engine or generator code; the only one left in that sweep is a non-summary line in `scripts/live-docs/inspect.ts:267`. Committed docs match. The intended changes in order are B before b, accented letters after z, and `-` and `_` by code unit.
- **Self-repair:** missing or changed texts are re-summarized, and the integration test covers it.
- **Words store:** written under a content-named folder before `history.json`, and old stores removed afterwards.
- **Partials and scratch:**
  - `.partial` files are removed under the lock.
  - Scratch folders are held from creation.
  - The head check's tree is now made inside the signal handling.
- **Head check:**
  - It compares field by field, apart from `summarizeGraph` and `rowsOfSummary`.
  - A docs reader error is now an error, not a skip.
  - Every skip prints a line, and the integration test covers asked, skipped and stale.
- **Pool sizing:** the `constrainedMemory` handling is correct for 0 and no limit, and `nextPoolRecord` keeps the larger peak.
- **Lens key:** includes git.ts, regenerate.ts, data files in the history folders and the Unicode version, and the identity integration test checks that.

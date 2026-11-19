# A third independent review, of the second pass of mends

Historical record of a review, November 19, 2026. A third reviewer, given the branch `history-data-mended` at `fcc650a5` and [the first](README.md) and [second](second-review.md) reviews and no conclusions of root's, read the second pass of mends before a merge and changed nothing. The report below is the reviewer's, as handed back; its paths are of the branch as it stood.

**Verdict: I would not merge it as it stands.** The pass added a new way for one commit to stop the whole history, which I confirmed by a run. The wrapper rule now misses real entries that the base found. The tree writer still writes through a link on a disk whose rules for treating two names as one differ from `toLowerCase`. Each fix is small.

I changed nothing. The worktree is clean and the rebuild was not touched. All my scratch (under `review3/` and `/tmp/claude-1000/r3s`) is deleted. The 12 `live-docs-history-*` folders and `summarizeChange` processes under `/tmp` belong to the running rebuild, so I left them.

## Findings, most serious first

**1. A commit with about 1,000 refused entries stops the whole history with `spawn E2BIG`.** This is new in this pass. Confirmed by a run.
- **Where:** `packages/generator/src/history/regenerate.ts:145` and `runSummary` (`fork(worker, [JSON.stringify(task)])`). The task now carries `unwritten`, and the whole task travels as one command-line argument.
- **Limits:** Linux caps a single argument at 128 KB (`MAX_ARG_STRLEN`). Windows caps the whole command line at about 32K characters, which is roughly 250 entries.
- **What I ran:** a scratch repository whose second commit holds a link `vendor` and 1,500 files under a tree `vendor`, through the real history command (`--jobs 1`). Result: `live-docs:history failed: spawn E2BIG`, exit 1. The message does not name the commit.
- **Ordinary commits that trigger it:**
  - On macOS or Windows, a repository that tracks both `Docs/` and `docs/` with many files (every file under the second is refused).
  - On Windows, a vendored folder of names holding `:`.
- **Why it repeats:** every run meets the same commit, so the history can never complete.
- **Fix:** pass the task over IPC, stdin or a file in the scratch folder, not argv.

**2. The tree writer still writes outside its folder on a case-insensitive disk.** By reading on the disk side; the writer's own decision confirmed by a run.
- **Where:** `packages/engine/src/live-docs/history/git.ts:216` (`fold = toLowerCase`) and `:243-252`.
- **Why it misses:** clashes are found by comparing `toLowerCase()` strings, not by asking the disk. The disk's own rule for treating names as one differs from that.
- **What I ran:** `writeStoredTree` with `caseInsensitive: true`, each tree a link followed by `<other>/evil.txt`. It refused nothing for any of these pairs:
  - `s` / `ſ`
  - NFC `é` / NFD `é`
  - `µ` / `Μ`
  - `σ` / `ς`
  - `LONGNAME` / `LONGNA~1`
- **Where that escapes:**
  - On APFS (macOS's default, case- and normalization-insensitive), several of these pairs name one file. The second entry's `mkdir`/`open` then resolves through the link `A`, and `evil.txt` lands outside. These are ordinary commits that git accepts.
  - On NTFS with 8.3 short names, `LONGNA~1` resolves to the link `LONGNAME`.
- **Git's own checkout is not fooled** because it `lstat`s each leading path on the real disk.
- **Fix:** do the same before each write — `lstat` each parent component under the directory and refuse a link — or create folders one level at a time with `O_NOFOLLOW`. Then the folding rules no longer matter.
- **Linux is sound.** Exact names held for every crafted tree I tried (case 3 below).

**3. The wrapper rule now misses real entries the base found, and still makes some false ones.** Confirmed by running `jsonAdapter.analyze` on base `05c0b350` and on the tip. Script text, then base result, then tip result:

*Missed entries (regressions):*
- `concurrently "pnpm exec tsx scripts/a.ts" "yarn tsx scripts/b.ts"`: base [a.ts, b.ts], tip [].
- `concurrently "npm exec -- tsx scripts/a.ts"`: base [a.ts], tip [].
- `concurrently "cross-env NODE_ENV=dev node a.js" "node b.js"`: base [a.js, b.js], tip [b.js].
- `sh -c "NODE_ENV=prod node a.js"`: base [a.js], tip [].
- `nodemon --exec "vite-node src/main.ts"`: base [main.ts], tip [].
- `dotenv -e config/dev.env -- vite-node scripts/a.ts`: base [dev.env, a.ts], tip [dev.env].
- `concurrently "esbuild src/main.ts --watch" "node b.js"`: base [b.js, main.ts], tip [b.js].

The cause is that `LAUNCHERS` (`json.ts:138`) lacks `npm`, `pnpm`, `yarn`, `cross-env`, `vite-node`, `esno`, `babel-node` and similar, and a quoted command that starts with an environment assignment is not read as a command. Anything missing from the list drops silently, so a list may be the wrong shape for this rule.

*False entries still present (unchanged from base):*
- `node scripts/gen.mjs -- ./data/input.json` gives `data/input.json`: `./` counts as "a path run itself".
- `node scripts/gen.mjs "./data/my input.json"` still adds a stray `input.json`. The quoted-space fix only covers paths without `./`.
- `node scripts/gen.mjs -- go x.js` gives `x.js`.
- `cat <<< "node b.js"` gives `b.js`.
- `echo "node b.js must run first" && node a.js` gives `b.js`.

*Fixed (confirmed):*
- `node a.js; # node b.js`
- `node a.js '# node b.js'`
- `-- --watch x.js`
- `&>`
- the second review's three cases

*Pre-existing and unchanged:* backslash paths (`node scripts\a.ts` gives nothing), `(cd x && node ../a.js)`, `%VAR%`, `$(…)`.

*Stale docs:* the remarks at `json.ts:74-75` still say "what follows a `--` is a command of its own".

**4. Generation can still throw on names, so one such file still stops a history.** Confirmed by running `generateLiveDocs` and `readLiveDocGraph`.
- **Where:** `packages/engine/src/live-docs/document.ts` (`renderEntry`, `COMMAND_EVIDENCE`, `DECLARER`, `MODULE_EVIDENCE`, which still use `` `([^`]+)` ``) and the symbol heading for names with line breaks.
- **What throws:**
  - A JSON key with a newline, `{"a\nb":1}`: "expected a symbol heading, found "#### `a"".
  - A JSON key with CRLF, `{"a\r\nb":1}`: the same.
  - A package.json script named `` a`b ``, an empty script name `""`, or a script name with a newline: "unexpected evidence on the command entry".
  - A `bin` named `` a`b ``: the same.
  - A package.json with `main` inside a folder named `` d`x ``: "unexpected evidence on the module entry".
- **Read back but ambiguous:**
  - The keys `""` (empty) and `"\"\""` both show as `""` (anchors differ).
  - Two lone-surrogate keys (`\ud800`, `\udc00`) both become `�` with the same anchor `symbol-�` in one doc.
- **Fine:**
  - backticks, `{#…}`, `#`, markdown, a heading-like key, a section-like key, tab, NUL, U+2028, nbsp, leading and trailing spaces, a 70,000-character key
  - the `$`/`$$` anchors

**5. Refused entries are recorded but never shown.** By reading (grep for consumers).
- `summary.unwritten` (`summary.ts:143`) is written into the cached summary, and nothing reads it: not `buildSequence`, `history.json`, inspect or the Explorer.
- So a file refused at a commit simply reads as deleted at that commit and reborn later. The only sign is a progress line naming the first three.
- What is refused depends on the disk and platform, which the lens key does not hold. The guard's reason for `unwritten` ("the entries the keyed tree writer left out") is therefore incomplete: the same key can give different summaries on Linux and macOS.

**6. A name the disk cannot hold still fails the whole commit, and so the history.** Confirmed by a run.
- A 301-character name among 30,000 blobs: one clean rejection (`ENAMETOOLONG`), no `EPIPE`, nothing left behind. A path over 4,096 bytes: the same.
- Git cannot check these out either. But the pass's stated rule — leave out and name what cannot be written — does not cover them, and one such commit stops every run.

**7. Pages: sound for the cases asked, with two notes.** By reading only. `js-yaml` is not installed in `node_modules` and PyYAML is absent, so I could not parse it.
- **Walked:**
  - A budget stop: exit 3, outcome `failure`, `--history none`, deploy runs, verdict skipped, so the run is green.
  - Any other code: verdict runs after `[build, deploy]` under `always()`, so it ends red after deploying.
  - A step timeout: the output is empty, `'' != '0' && '' != '3'`, so red.
  - Nothing red runs before the deploy, so a red ending cannot stop it.
  - `all` is used only on this run's success, so the deploy never carries a partial or another generator's history.
  - The cache save covers success, failure and cancelled, and excludes skipped and empty.
- **Pruning:** at the start, `--remove-superseded` keeps only the current lens plus the newest lens with `whole.json`; at the end of a whole run it removes all others. So an entry holds at most two lenses.
- **Note 1:** each run still saves a new cache entry, so entries grow in count. GitHub's least-recently-used eviction removes old history entries first, and npm's cache is read every run, so it survives.
- **Note 2:** if a job-level timeout (180 min) is ever reached, nothing deploys and the run is red. That is acceptable, but it is a fourth path the step summary does not describe.
- **Note 3:** the first run after this merge deletes the old whole lens (it has no `whole.json`). That is harmless because the key changes anyway.

**8. Lock: sound on one machine; one note.** Confirmed by runs.
- Eight and twelve real processes raced repeatedly, with dead claims seeded: no overlap ever, and every claim was cleaned.
- A claim with a reused pid (1) gives a clean refusal after about 1 s, with advice.
- SIGINT during a real run removed the claim and the scratch trees.
- The note: a claim from another machine is removed unconditionally, so two machines or containers sharing one history folder (or two containers with different PID namespaces and the same hostname) can both run. This is by design for restored caches; it is worth stating as a limit.

**9. Key: sound for what was added.**
- `tsconfig.base.json` is keyed, and status and `ls-tree` cover it.
- `GIT_NO_REPLACE_OBJECTS` is set on every git call and handed to the summarizer.
- The guard now holds the members of `RegenerationContext` and `SummaryTask`.
- Still unseen:
  - The forked process's environment (the whole `process.env` minus `GIT_*`, so for example `NODE_OPTIONS`) is not a `SummaryTask` member, so the guard cannot see it.
  - The disk and platform dependence in item 5.

## Checked and sound
- The tree writer on Linux, with my own `git mktree` and literal `hash-object --literally` trees:
  - a link then a tree of one name, and a tree then a link (the link is refused);
  - a link deep in a path (`x/y/l` plus `x/y/l/evil.txt`);
  - a link to a link;
  - a relative link climbing out (written as a link only);
  - non-UTF-8 names that collapse to `U+FFFD` (refused, and said, though the reason "names it twice" is misleading).
  Nothing was ever written outside.
- Errors partway through 30,000 pending blobs give one rejection and no orphaned `cat-file`.
- Unit files for `git`, `json`, `compose`, `computeHistory` and `generatorIdentity`: 80 tests pass on a `git archive` copy of `fcc650a5`.
- The `$`/`$$` anchor fix holds, and the second review's backtick and empty-key cases now read back.

# A fourth independent review, of the narrowed pass

Historical record of a review, November 19, 2026. A fourth reviewer, given the branch `history-data-mended` at `923c7a95` and the three earlier reviews ([first](README.md), [second](second-review.md), [third](third-review.md)) and no conclusions of root's, read the narrowed pass's three commits before a merge and changed nothing. The report below is the reviewer's, as handed back; its paths are of the branch as it stood.

**Verdict: I would not merge it quite as it stands.** The pass's own mends hold under every attack I ran. One small mend is still owed: the history still writes outside its scratch folder, and deletes there, through a link that a commit holds at its docs root. That is not new, but the decision now says plainly that it cannot happen. Two kinds of link still stop the whole history.

I changed nothing and committed nothing. The worktree is clean at `923c7a95` and the rebuild was not touched. My copy (`scratchpad/review4`) and my temporary folder (`/tmp/claude-1000/r4t`) are deleted. I had to use a short temporary folder because tsx's socket path is too long under the scratchpad (`EADDRINUSE`).

## Findings, most serious first

**1. The generator writes and deletes outside the scratch folder through a link at or inside the docs root.** Confirmed by a run. Present on `main` too; not new in this pass.
- **Where:** `summarizeChange.ts:81-92` runs `generateLiveDocs` in the tree, and it writes and prunes under the configured docs root. `git.ts` writes a link entry as a real link (`git.ts:387`).
- **What I ran:** a repository whose first commit holds `.live-documentation -> <absolute folder outside>` and `src/a.ts`, through the real `history.ts`.
  - It wrote `outside/source/src/a.ts.md` and `outside/index.json`.
  - On a second run I put `outside/source/notes/gone.ts.md` there, holding an `## Authored` block. The history deleted it.
- **The same holds for:**
  - a link anywhere along the docs root's path (for example `.mdmd/layer-4/src -> /abs`);
  - the head check's tree (`computeHistory.ts:701`);
  - a relative link such as `../..`, which lands in the system's temporary folder.
- **Why it matters now:** the decision (`architectural-decisions.mdmd.md`, "A commit's tree") and `git.ts`'s remarks now say "nothing is ever written outside the tree's folder". The tree writer keeps that promise; the generator after it does not.
- **Fix:** the tree writer leaves out (and names) any link at, above or beneath the configured docs root, since the generator writes there. Alternatively, the summarizer refuses to run when the docs root's real path leaves the tree.
- **How sure:** certain (a run).

**2. A link whose target is empty or holds a NUL byte fails the commit, and so every run.** Confirmed by a run.
- **Where:** `git.ts:386-392`. `symlink` throws `ENOENT` for an empty target and `ERR_INVALID_ARG_VALUE` for a NUL. Neither is in `NAME_FAILURES`, so `writeStoredTree` rejects.
- **Why it matters:** these need a hand-made or tool-made commit (`update-index --cacheinfo`, `mktree`). But one such commit is exactly the "fail the commit" outcome this pass set out to remove.
- **Fix:** treat any failure of `symlink` for one entry as that entry left out.
- **Also:** a link target longer than 4,096 bytes is already left out, but under the reason "this disk cannot hold its name". It is the target, not the name, that is too long.

**3. On Windows without symlink rights, any commit holding a link stops the history.** By reading; I could not run Windows here.
- **Where:** `fs.symlink` fails with `EPERM` there, which is not in `NAME_FAILURES` (`git.ts:212`, `:390`). The whole tree rejects.
- **Before this branch:** `checkout-index` honoured `core.symlinks=false` and wrote the link as a file holding its target.
- **History of it:** the second review listed `EPERM` as a crash trigger. The mend turned the crash into one clean rejection, which still ends the history.
- **Fix:** on `EPERM` from `symlink`, write a file holding the target (as git does), or leave the entry out and name it.

**4. The tree writer is now about 1.5 times slower.** Measured, but noisily.
- **Why:** `placeEntry` (`git.ts:222-243`) runs an `lstat` on every parent level, one after another, for every entry, and remembers nothing.
- **What I ran:** writing `main`'s tree (7,504 entries) at load 15 to 20, taking turns with `fcc650a5`'s writer.
  - New: 34, 41, 55 and 59 s.
  - Old: 22, 31, 32 and 49 s.
- **Fix:** remember the folders this writer has made or checked. That is safe, because the writer never replaces a folder it has checked, and nothing else writes in the scratch folder meanwhile.

**5. Stale words about the environment.** By reading.
- `regenerate.ts:17-19` still says "The summarizing process is given the person's environment without git's variables".
- `.mdmd/layer-4/packages/generator/src/history/regenerate.ts.mdmd.md:15` (authored) says the same.

**6. Hand-off check: `json.ts` is not byte-identical to `main`.** By `git diff main 923c7a95`. Expected; nothing to mend.
- `json.test.ts` is identical, and the wrapper detection and its two tests are wholly gone.
- Two hunks remain in `json.ts`, and the commit message says they stay deliberately:
  - `compareText` in place of `localeCompare` (from `351dc65f`);
  - `collectKeyPaths` keeping a leading `:` beneath an empty key (from `2ce2f723`, tested in `generator.test.ts:785`).

**7. The summarizing environment: what is still inherited.** By reading, with a grep of engine and generator code outside tests.
- **Still inherited: `process.execArgv`.** `fork` passes it by default. So node flags given to tsx or node (such as `--conditions`, `--stack-size` or `--max-old-space-size`) still reach the process. The guard cannot see this.
- **A consequence of dropping `NODE_OPTIONS`:** someone who raised the heap that way for a large repository can no longer do so for the summarizer.
- **Dropped, and nothing in summary code depends on them:**
  - `LANG`/`LC_*`: no `localeCompare`, `Intl` or `toLocale*` is left.
  - `TZ`: no local-time call.
  - `HOME`: no `os.homedir()` call.
  - On Windows, ICU takes its locale from the system rather than the environment, which would only matter if such a call returned.
- **Windows and macOS needs:** `SystemRoot` and `PATH` are kept. `PATHEXT`, `ComSpec`, `APPDATA` and `USERPROFILE` are not needed: git is started by `execFile` with no shell, and libuv appends `.exe` itself. `TMPDIR` is kept for macOS.
- **The guard test** checks the function's output and the call's text. It does not know about `execArgv`.
- **Known limit:** I would write `execArgv` down as a limit rather than mend it, or pass `execArgv: []` plus tsx's own two flags.

**8. Smaller wording points.** By runs and reading. Each can simply be written down.
- An entry clashing with an identically named one of another type (a folder then a file `f`, or a folder then a link `a`) gets the reason "the disk … takes the two names for one". The names are the same, not two.
- The `unwritten.txt` header says "because this disk could not hold them". Some reasons hold on every disk (a link in the commit, a `.git`, a name that is not UTF-8).
- The CLI reference (`cli-reference.mdmd.md:150`) does not mention `unwritten.txt`.
- On Pages the list lives only in the cached history folder. A person sees only the count line in the log.

## Remaining decisions made by comparing strings
- `.git` (by `toLowerCase`), `WINDOWS_FORBIDDEN`, the U+FFFD test, and exact duplicates (`named`).
- None of them decides where a write lands.
- `.git‌` and `git~1` are written. Git refuses both under `protectHFS`/`protectNTFS`. That is harmless here, because `GIT_DIR` is pinned for the summarizer.

## Checked and found sound
- **The tree writer**, with raw trees (`hash-object --literally -t tree`, so both orders were possible), on Linux. Every refused entry was named, nothing landed outside, the parent never died, and every case returned rather than threw:
  - a link then a tree of one name, and the reverse;
  - a link deep in a path;
  - a link to a link, in both orders;
  - links to `..`, to `../../..` and to an absolute path;
  - a file where a folder is needed, and the reverse;
  - a 256-byte name;
  - a 5,038-byte path;
  - 6,000 entries with a long name, a link and its tree, and a file and its tree in the middle;
  - an empty tree;
  - a submodule, a submodule under a link, and a link and a submodule of one name;
  - duplicate names;
  - names that are not UTF-8.
- **Case-insensitive or normalising disks:** not testable here, since `/tmp` is case-sensitive overlay. By reading:
  - every folder is checked with `lstat` under the exact spelling just before use;
  - files open with `wx` (O_EXCL), and `symlink` fails wherever the disk already holds the name by its own rule;
  - the writer is strictly one entry at a time, so there is no window between the check and the write.
  So APFS, NTFS short names and case folding are decided by the disk. The stand-in disk test exercises the same decision.
- **The task by file:** a real run on a commit with 4,000 refused entries and 4,000 real files completed (exit 0).
  - `task.json` was 540 KB, read once from the scratch folder, and gone afterwards.
  - Every one of the 4,000 entries was printed, and `unwritten.txt` holds 4,000 lines.
  - Nothing was left in the cache.
  - The write is not atomic, but it does not need to be: the child starts only after it completes, and the folder is held by `Scratch`.
- **A signal:** SIGINT to the process group while the summarizer ran removed the scratch folder (task included) and ended every process. No summary, partial file or lock was left behind.
- **Tests on a `git archive` copy of `923c7a95`:**
  - history folders' unit tests plus `json.test.ts`: 16 files, 147 tests pass;
  - `history.test.ts` and `generator-identity.test.ts`: 35 tests pass, including the new 3,000-entry case.
- **Documentation:** the plan and the decision now say what the history cannot tell (files not read read as gone, the disk is not keyed, and the limit of the cross-machine lock). Finding 1 is the one exception.

## Which items can be written down as known limits
- **Items 4, 7 and 8:** limits or quick follow-ups.
- **Item 3 (Windows `EPERM`):** a one-line mend, or a stated limit if Windows is not supported for the history.
- **Items 1, 2 and 5:** small, and I would mend them before the merge, since item 1 contradicts a claim the decision now states plainly.

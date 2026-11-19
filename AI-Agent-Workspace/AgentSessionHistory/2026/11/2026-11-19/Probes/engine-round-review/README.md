Current as of November 19, 2026.

# An independent review of the history engine's round of November 19

Historical record of a review. An independent reviewer (a subagent, Opus 5.5) was given the two commits `167cba33..5de1c931` on its own worktree reset to `5de1c931`, and no one's opinion of them:

- `df0f792b` "Write only what the history reads, and apply the bundle's exclusions where summaries are read"
- `5de1c931` "Name the session archive's former layout among the bundle's exclusions"

The reviewer changed no product code and committed only this file. The cache in the main checkout, `.mdmd/history/c186af7356b58191/` (1,224 summaries made by the code before the change), was read and never written. Every run went to a scratch folder.

## Verdict

**Do not rebuild on this as it stands.** The tree writer now holds back files the generator does read: excluded files that included code imports, and the target of every symbolic link. On a repository that has either, the history now contradicts the generator's own docs, and the check at the head refuses to finish.

This repository has neither, so a rebuild today would give the right data here. But the fixes all land in files that key the cache (`git.ts`, `regenerate.ts`, `summarizeChange.ts`, the doc reader). A rebuild made now would be thrown away by the fix.

## What the change claims

The first commit is meant to change no fact of any commit's history as a person or a command reads it, while doing six things:

- The tree writer leaves out the files that the configuration's `exclude` names.
- A summary checks the commit's own file list to see whether a linked document exists.
- `bundleExclude` is applied when summaries are read, and leaves the cache's key.
- No symbolic link is written.
- Folders are remembered once made.
- The forked process gets node flags of its own.

The second commit adds the archive's former folder to `bundleExclude`.

## Findings, most serious first

### 1. Leaving out excluded files changes what included code depends on

- **Confirmed by a run.** The test repository has two excluded files and one included file that uses them:
  - `exclude: ["generated/**"]`;
  - `src/index.ts` holds `export * from "../generated/api"` and `import { thing } from "../generated/types"`.
- **What a checkout gives:** the generator, run in a real checkout and committed, writes two dependency lines, `api` (re-export) and `types.thing`. It also writes two re-exported anchors, `Api` and `api`.
- **What the old history command gives:** exactly those, and the check at the head (`--check-head`) passes.
- **What the new command gives:**
  - The dependency lines become the raw specifiers `../generated/api` and `../generated/types` (with the symbol `thing`).
  - The re-exported anchors are gone.
  - The run ends with exit 1: "the history's last step is not the graph of the Live Docs committed at …: the dependencies of src/index.ts differ … the reExports of src/index.ts differ".
- **Why:** the generator does read files that `exclude` names.
  - It probes the disk when it resolves an import (`fileExists` in `packages/engine/src/live-docs/dependencies.ts:391-404`).
  - It reads the target of `export *` to list its symbols (`dependencies.ts:538-544`).
  - Most language adapters probe the disk the same way (`statSync`/`readdirSync` in `c.ts`, `python.ts`, `ruby.ts`, `css.ts`, `html.ts`, `csharp.dependencies.ts`, `project.ts`, `aspnet.ts`; `go.mod` and `Cargo.toml` in `go.ts` and `rust.ts`).
- **Where the error starts:** `unread` (`packages/generator/src/history/regenerate.ts:193-196`) takes "never opened" from one measurement of this repository and makes it a rule for every repository.
  - Its doc comment, and the ones on `writeStoredTree` and `VersionControl.workingTree`, all say the summarizing process "never opens" these files. That is not true in general.
- **This repository:** unaffected.
  - At none of the 1,224 cached commits does a file outside `AI-Agent-Workspace/` hold an import, require, `src=`, `href=` or include that names `AI-Agent-Workspace`. The only such text is a string inside `relatedDocs.test.ts`.
- **Fix:** leave out only the excluded files that no reader handles (`hasReader` false in `liveDocumentationConfig.ts:183`): pictures, video, archives, markdown, text. A resolver that probes a kind with no reader would have to be listed too.
  - At this repository's head, that is about 97% of the excluded folder's 1.0 GB: png 711 MB, webm 156 MB, zip 58 MB, md 47 MB, gz 9 MB, txt 7 MB.
  - The roughly 14 MB of `.ts`, `.mjs`, `.cjs`, `.mts` and `.json` there would still be written.
  - Add an integration case in which included code imports an excluded file.

### 2. With no link written and nothing in its place, a linked file and a linked document drop out of the history

- **Confirmed by a run.** The test repository holds three links, and its mirror is generated in a real checkout and committed:
  - `CLAUDE.md -> AGENTS.md`, where `AGENTS.md` cites `src/a.ts`;
  - `lib/b.ts -> ../src/b.ts`;
  - `docs/alias.md -> guide.md`, which the authored words of `src/a.ts` link to.
- **What the generator and the old command agree on:**
  - `lib/b.ts` has a doc.
  - `src/a.ts` is cited by `AGENTS.md` and `CLAUDE.md`.
  - `src/a.ts` links to both `docs/alias.md` and `docs/guide.md`.
- **What the new command does:**
  - It drops `lib/b.ts`, the citation from `CLAUDE.md`, and the link to `docs/alias.md`.
  - It says on every run that "3 files … were not read, since the disk … could not hold them".
  - With `--check-head` it exits 1: "lib/b.ts has a committed doc and is not in the history's last step; the citedBy of src/a.ts differ".
- **What the decision asked for:** the mend owed in the decisions log (`.mdmd/layer-3/architectural-decisions.mdmd.md:614`, "A commit's tree") had three parts. The history was "to write no link at all, name each as not followed, **and read the file a link points to at its own path**". The third part was not built.
  - Linking `CLAUDE.md` to `AGENTS.md` is a common habit in exactly the repositories this tool serves.
- **Where:**
  - `packages/engine/src/live-docs/history/git.ts:301-302` (link refused);
  - `packages/generator/src/history/summarizeChange.ts:141-154` (a link never counts as a file that exists).
- **This repository:** unaffected. No commit in the whole history holds a link (mode 120000) or a submodule (mode 160000).
- **Fix:**
  - Write a link whose target resolves to a file inside the tree as a plain copy of that file's blob, so no link is on disk and readers see what a checkout's readers see.
  - Leave out every other link, and name it: one that points outside the tree, at a folder, or nowhere, and one at or along the docs root.
  - Count the copied links as files that exist in `standingFiles`.
  - Add the `CLAUDE.md -> AGENTS.md` case to the integration test, with the check at the head.

### 3. The summary now runs a generation no person runs, and a hostile name in an excluded document stops the history

- **Confirmed by a run.**
  - The test repository has `bundleExclude: ["notes/**"]` and a document `notes/plan (draft).md` that cites `src/a.ts`.
  - The old command finishes.
  - The new command exits 1: the summarizing process fails in `readLiveDocGraph`, and one failed commit stops the pool.
- **Why:**
  - The summary now generates with no bundle exclusions (`summarizeChange.ts:84`), so the generator writes a `Cited By` line for this document.
  - The doc reader's grammar cannot read a link holding `)` (`packages/engine/src/live-docs/document.ts:672`): "unexpected Cited By line".
  - The same error stops `live-docs:generate` once the exclusion is removed, so the fault in the reader is older than this change. The change exposes it for documents the configuration had kept out.
- **Related, confirmed by a run:** `--keep-index` now writes each commit's index with the `Cited By` entries the bundle excludes (`notes/plan.md` in the test). The old command left them out. The sequence itself is unchanged: the old and new `history.json` are equal but for the lens.
- **Related, by reading:**
  - The summary's `citedBy` holds the doc's labels, which are paths with every backtick replaced by an apostrophe (`formatInlineCode`).
  - `bundled.ts` therefore tests a label against `bundleExclude`, where the generator tested the path. The two differ for a document whose name holds a backtick.
- **Fix:**
  - Write the `Cited By` link so that any path reads back, in angle brackets or percent-encoded. That needs a test with `(` and `)`.
  - Let `bundled.ts` filter on the document's path, not its label.

### 4. The three behaviours this change rests on are not tested end to end

**Confirmed by mutation.** Each change below was made alone, in the worktree. Each time all 133 unit tests of the two history folders and all 30 history integration tests passed. Every change was then reverted.

- **(a) Asking the disk again whether a linked document exists**, instead of the file list (`summarizeChange.ts:151`).
  - In this repository that would drop from the summaries every link to a document under `AI-Agent-Workspace`, over a thousand at each recent commit.
  - From the sequence it would drop the links to probe, screenshot, research and memory documents that the bundle keeps.
- **(b) Applying `bundleExclude` inside the summary again** (`summarizeChange.ts:84`).
  - Since `bundleExclude` no longer keys the cache, that would serve stale summaries after an edit of it.
- **(c) Not applying `bundleExclude` when summaries are read** (`computeHistory.ts:638`).
  - That would put the archive's records back at every step.

The integration fixtures (`tests/integration/live-docs/scripted-repository.ts`) have no `exclude`, no `bundleExclude` and no link.

The new tests that can fail did fail when their change was taken away:

- the lens test, with `bundleExclude` put back in the key;
- the folder-memory test, with the memory switched off;
- the node-flags test, which is a regular expression over `regenerate.ts`'s source and fails if `execArgv` is dropped.

**Fix:** extend the scripted repository with:

- an excluded folder holding a linked document and an imported module;
- a `bundleExclude`;
- a link.

Then assert the sequence, and assert that an edit of `bundleExclude` changes the sequence on the next run without summarizing again.

### 5. Nothing now raises the summarizing process's heap

- **By reading.** The last round dropped `NODE_OPTIONS`; this round replaces `execArgv` (`regenerate.ts:223-225`, `:241`).
- **Consequence:** on a repository whose single summary outgrows node's default heap, the history fails, and no flag or variable can help.
- **Fix:** pass `--max-old-space-size` through, from either source. It decides whether a summary is made, never what it says. Or size it from the measured peak the pool already records.

### 6. A warning the generator gives no longer appears

- **Confirmed by a run.** With `exclude: ["examples/**"]` and `examples/inner/.live-docs.config.json`:
  - The old command reports "the generator warned at 1 of the 1 changes regenerated: A scan lies inside this folder at examples/inner …".
  - The new command says nothing.
  - The generator run in a checkout still warns.
- **Where:** `scansWithin` globs the disk with no regard to `exclude` (`packages/generator/src/generator.ts:329`).
- **This repository:** no nested configuration or docs root ever stood under `AI-Agent-Workspace`.

### 7. On macOS and Windows a linked document spelled another way no longer counts

- **By reading. I could not run either platform here.**
- **Before:** `fs.stat` on a disk that folds case and Unicode form found `Docs/Design.md` for `docs/design.md`.
- **Now:** the file list does not.
- This makes the history the same on every platform, which I think is right, but it is a change.
- Windows gains from the change: before it, `fs.symlink` failed with `EPERM` there without symlink rights, and that stopped the whole history at any commit holding a link.

### 8. Words that are no longer true

- **The "never opens" doc comments:** `regenerate.ts:22` and `:186`, `git.ts:260` and `:311`, and `versionControl.ts:80` say the files `unread` names are never opened. Finding 1 shows otherwise.
- **The run's line and the list's header.** For a link, now every link at every commit, both are false. They are:
  - "… were not read, since the disk their trees were written to could not hold them" (`computeHistory.ts:317`);
  - the header of `unwritten.txt` (`computeHistory.ts:667`).
- **The decisions log** (`architectural-decisions.mdmd.md:614`):
  - It still says "A symbolic link is written as a link to the target its blob holds".
  - It still says the generator can write outside through a link.
  - Its "mend owed" was only partly built (finding 2).
- **`git.ts:29-39`, the module's remarks:**
  - They still say the disk is asked "before each entry is written" so that "an entry beneath a link" is left out.
  - Since this change, folders are asked once, and no link is ever on the disk.
  - The branch of `placeEntry` that reports "a symbolic link on this disk" (`git.ts:231-232`) can now be reached only by a test's stand-in disk.
- **Authored Notes:**
  - `.mdmd/layer-4/packages/generator/src/history/regenerate.ts.mdmd.md:15` still says the process "still inherits the command's `execArgv`", and that the module's own comment is stale. Both were mended in this change.
  - `.mdmd/layer-4/packages/engine/src/live-docs/history/git.ts.mdmd.md:20` still says the generator can write "through a link at or along the docs root".
- **The new Live Docs** of `bundled.ts` and `bundled.test.ts` have placeholder Purpose and Notes. The repository's guide asks for authored words on a new file.
- **The commit message** reports 54 commits "summarized afresh" matching the cache.
  - The builder's oracle (`scratchpad/probe/oracle.js`) ran the built JavaScript worker through `spawn`, not the command's own `fork` under tsx with `summarizingEnvironment` and `summarizingFlags`.
  - My sample (below) went through the command's own path.

### 9. Smaller points of form

- **Two spellings of the docs root.** `unread` derives the docs root by editing the configured string (`regenerate.ts:194`). Discovery resolves it as a path (`docsRootWithin`, `discovery.ts:166-172`).
  - A root such as `docs/../.mdmd` passes the command's check, but `unread` would not recognise files under it.
  - Reusing discovery's function would leave one rule.
- **`excluded` stays in a keyed file.** It now serves the reading side, yet lives in `relatedDocs.ts`, which keys the lens; in the summary it is only ever called with an empty list. An edit to it moves the key for no reason.
- **Fields the key need not hold.** By the change's own reasoning, `board` keys the lens without ever reaching a summary. So, I believe, do `requireRelativeLinks` and `slugDialect`: no module of the engine or the generator reads them. Each still forces a full rebuild when edited. This is older than the change.

## What I checked and found sound

- **This repository's 1,224 commits.** I expect no difference from the old cache but the one the second commit intends, and found none. The reasons:
  - No commit holds a link or a submodule.
  - No included file references the excluded folder.
  - No nested scan stood inside it.
  - Every `bundleExclude` pattern lies under `exclude`, so `Cited By` never depended on `bundleExclude`.
  - The generator creates and deletes documents only in the base layer, whose links it never counts as documents. So on Linux, the file list and the disk give the same answer to "does this document exist".
- **Filtering when summaries are read.** Applying `bundleExclude` when summaries are read gives the same links as applying it inside the summary: the filter depends only on the resolved path, so the order of the two steps does not matter. The sequence is built from the cache on every run, so an edit of `bundleExclude` takes effect at the next run.
  - Confirmed in the keep-index test: the old and new `history.json` are equal but for the lens.
- **The key.** Removing `bundleExclude` from it is right. Nothing new that a summary depends on lies outside the key:
  - `exclude`, `root` and `matchesPathPattern` are keyed;
  - tsx's version is held by the keyed lock.
- **Writes outside the scratch folder.** A commit whose docs root is a link to a folder outside, plus a link `src/up -> ../..`, now leaves the outside folder empty (run). I found no other new path for reading or writing outside the scratch folder. `scansAbove` reads the scratch tree's ancestors for a configuration, but that is older than this change.
- **The folder memory.** It is sound on disks that fold names: the writer never replaces a folder it made or found, and nothing else writes in the tree meanwhile.
- **The second commit.** Its two patterns are verbatim those that stood from `fb648601` to `c6da091e`, and they match no file at the head. After them, the archive files still linked at old commits are:
  - the `*.SUMMARIZED.md` files the old patterns kept on purpose;
  - probes, screenshots, research and memory documents, which the new layout's patterns keep too.
- **The forked process under tsx with its new flags** works: the integration test passes, and so did my sample through `regenerate`.
- **My own oracle sample.** I took 31 cached commits the builder's sample did not hold:
  - every 50th commit, offset by 12;
  - the second and third commits;
  - the two commits around the archive's move;
  - the last two commits in the cache.

  I summarized them through `regenerate` itself (the tree writer with `unread`, the forked worker under tsx), applied the old configuration's `bundleExclude`, and compared each with the cache, the lens field set aside.

  **All 31 were identical byte for byte**, unzipped, with up to 1,864 raw links each. The only warnings were the known nested scans of `tests/integration/fixtures`. Together with the builder's 54, that makes 85 of the 1,224 commits held to the oracle.

## What I did not check

- **Windows and macOS.** Not run; findings 5 and 7 and the Windows points are by reading.
- **The other adapters' disk probes** (finding 1). Read, not each run.
- **The whole 1,224 commits.** Not summarized; this repository's equivalence rests on the scans and reasoning above plus the samples.
- **The figures in the second commit's message** (1,318 links, 188 steps) were not recomputed.
- **The full gate** (`safe:commit -- --e2e`) and the browser were not run.

## Where the evidence is

The scripts are in the session's scratch folder, `scratchpad/review/`, which a reboot may clear. They are:

- `make-repos.sh`, which builds the test repositories;
- `run-both.sh`, which runs the old code (`167cba33`) and the new over a copy of each;
- `dump.js` and `seqdiff.js`, which compare the summaries and the sequences;
- `regen.ts`, the oracle sample through `regenerate`;
- `refs.sh` and `linked-archive.js`, the scans of this repository's 1,224 commits;
- `make-escape.sh` and `make-nested.sh`.

## A note for the rebuild itself

- **Scratch folders vanished mid-run.** Twice during this review, a history test using the shared `/tmp` failed with `ENOENT` on its own scratch `task.json`, and it passed with a private `TMPDIR`. On this machine, something else removes `/tmp/live-docs-history-*` while a run uses them, and one lost commit stops the whole pool.
- **Use a private `TMPDIR` for the two-hour rebuild,** and keep it short. tsx makes its socket there, and a long path fails with `EADDRINUSE`.

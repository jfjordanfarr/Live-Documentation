Current as of November 19, 2026.

# An independent review of the history engine's round of November 19

Historical record of a review in two passes. The first pass is directly below; the second pass, of the mends, is the last section, [Second pass](#second-pass-the-mends-5de1c931d2e9b1cd).

An independent reviewer (a subagent, Opus 5.5) was given the two commits `167cba33..5de1c931` on its own worktree reset to `5de1c931`, and no one's opinion of them:

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

## Second pass: the mends, `5de1c931..d2e9b1cd`

Added later on November 19, 2026. The same reviewer was given the builder's nine commits on its own worktree, reset to `d2e9b1cd`. It was given what they claim and no one's opinion of them. It changed no product code: every change it made to test a claim was reverted, and it committed only this file. The main checkout's `.mdmd/history` was read and never written. Everything ran under a private `TMPDIR` (`~/.t-rev/tmp`), and nothing in `/tmp` was removed.

Two corrections to the first pass:

- **The vanished scratch trees.** The builder says it deleted `/tmp/live-docs-history-*` by hand while the first pass ran. That is the likeliest cause of the two `ENOENT` failures noted above.
- **The first pass's scripts are gone.** The folder `scratchpad/review/` named under "Where the evidence is" was removed by someone else before this pass. This pass's scripts are in `~/.t-rev/`.

### Verdict of the second pass

**Do not rebuild on this yet.** Four of the faults still open, and the one already acknowledged, all lie in files that key the cache:

- `summary.ts`, `regenerate.ts` and `git.ts`;
- the doc reader, for the `)` fault.

Any fix to them moves the key and forces the two hours again.

This repository's own data would be right today. This repository has none of the things the open faults need:

- no link;
- no C or C++ include of an excluded file;
- no citing document whose name holds `#` or `%`.

My sample (below) matched the old cache. If the owner wants this repository's history now and accepts a second rebuild later, the data would be sound.

### The first pass's nine findings

| Finding | Now | How I know |
| --- | --- | --- |
| 1. Excluded files that included code imports | **Closed for every file a reader handles; open for a reader that reads files `hasReader` says none does** | Run. The new `history-reading.test.ts` passes. Emptying excluded files that have readers fails both oracles (I tried it). A C file including an excluded `.def` still differs (new finding 2). |
| 2. Links | **Closed for links to files; open in part** | Run. `CLAUDE.md`, `lib/b.ts` and `docs/alias.md` read as in a checkout (`history-reading.test.ts`, `git.test.ts`). Links beneath the docs root, links to folders, and `..` after a link still differ (new findings 3–5). |
| 3. Generation with no bundle exclusion | **Open in part** | Run and reading. The `)` fault stands: the case is marked as an expected failure (`it.fails`) and waits on the doc reader's builder. Filtering by label is closed: a summary keeps paths (format 4). But format 4 reads the path wrongly for some names (new finding 1). `--keep-index` still carries citations the bundle excludes (reading; low). |
| 4. Untested behaviours | **Two of three closed** | Run. Handing the worker the whole configuration fails `history-reading.test.ts` and the guard test. Reading summaries with no exclusions fails `history-reading.test.ts`. Asking the disk, instead of the listing, whether a linked document stands still leaves all tests green (new finding 7). |
| 5. The summarizing process's heap | **Closed in part** | Run. `npx tsx --max-old-space-size=N …` puts the flag in the command's own flags, so it reaches the summary. The usual route through `npm run`, `NODE_OPTIONS=--max-old-space-size=N`, does not: the command's flags lack it, and `summarizingEnvironment` drops `NODE_OPTIONS`. No user-facing page says which route works. |
| 6. The nested-scan warning | **Closed** | Reading, and `regenerate.test.ts` (passes). A nested configuration is written whole and a nested docs root's names stand. |
| 7. macOS and Windows | **Unchanged, now written in the decision** | Reading. |
| 8. Words | **Mostly closed** | Reading. What is still untrue is in new finding 9. |
| 9. Smaller points | **Closed or decided** | Reading. The docs root is read as discovery reads it (`docsRootWithin`). `board` has left the key. `requireRelativeLinks` and `slugDialect` stay in the key on purpose. |

### New findings, most serious first

**1. Format 4 misreads a citing document whose name holds `#` or a percent-escape.** Confirmed by run.

- **The case.** A repository holds `docs/C#.md` citing `src/a.ts`; its mirror is generated in a checkout and committed.
  - The committed doc says `Cited By: docs/C#.md`.
  - The history stores `docs/C`, a path that does not exist.
  - With `--check-head` it exits 1: "the citedBy of src/a.ts differ: committed ["docs/C#.md"], replayed ["docs/C"]".
- **The same with `docs/50%41off.md`.** The history reads it as `docs/50Aoff.md`, and the run exits 1.
- **Where:** `summary.ts`, `citingPath`. It percent-decodes the `Cited By` link and resolves it with `resolveDocLink`, which drops everything after `#`. But that link is a plain relative path the generator wrote (`compose.ts:757-761`), never encoded.
- **Who it reaches:**
  - In a repository with a note such as `C#.md` or `F#-interop.md`, every step names a citing document that never existed.
  - The check at the head stops the run.
- **This repository:** none of the citing labels in the 1,263 cached summaries holds `#`, `%`, `'` or `?`.
- **Fix:** join the link to the doc's folder and normalise it, with no decoding and no fragment. Add the two names to `summary.test.ts`.

**2. Writing an excluded file empty still changes what C and C++ code depends on.** Confirmed by run.

- **The case.**
  - `exclude: ["gen/**"]`.
  - `src/main.c` includes `../gen/table.def` and `../gen/colours.inc` and uses what they declare.
- **What a checkout gives:** three dependency lines, `table.table_size`, `table.table_lookup` and `colours.colour_count`.
- **What the history gives:** `table` and `colours`, with no symbols, and with `--check-head` it exits 1.
- **Why:**
  - `hasReader` says no reader handles `.def` or `.inc`.
  - But the C adapter reads the content of whatever file an include names, to find the names the including file takes from it (`adapters/c.ts`, `usedNames` and `fileFacts`). So `.def`, `.inc`, `.tpp` and `.ipp` are all read.
  - "Content exact for every file a reader can open" is therefore not true.
- **Where:** `regenerate.ts`, `treeOptions`.
- **Why the oracles miss it:** none of the 43 sample workspaces includes such a file across top-level folders.
- **Fix:** empty only what no reader can read whatever names it: pictures, fonts and recordings (`isMediaAsset`), plus archives.
  - At this repository's head that is 934 MB of the 988 MB now emptied, 95% of the saving.
  - Markdown, text and the rest, about 54 MB, would be written whole.
  - Add a C include of an excluded `.def` to the equivalence fixtures.

**3. A link at or beneath the docs root to a file is still refused, though its copy would be safe.** Confirmed by run.

- **The case.** `.mdmd/layer-1/guide.md -> ../../notes/x/guide.md`, a document that cites `src/a.ts` and that `src/a.ts`'s authored words link to.
- **In a checkout:** both the citation and the link count.
- **In the history:** the link is named unwritten ("at or along the docs root"), both drop out, and with `--check-head` it exits 1.
- **Why the refusal is not needed beneath the root:**
  - The danger the fourth review found was writing *through* a link.
  - A copy is a plain file, and a link to a folder is never written.
  - Beneath the root, the generator can only overwrite or remove the copy.
- **Where:** `git.ts`, `alongDocsRoot`, and the `git.test.ts` case that pins it.
- **Fix:** refuse only a link at the docs root or above it. A copy there would stand where the generator needs a folder, and the commit would fail. Copy the links beneath it.

**4. A link to a folder changes dependencies, not only "reads as gone".** Confirmed by run.

- **The case.** `src/shared -> ../shared`, and `src/index.ts` imports `./shared/util`.
- **In a checkout:** the import resolves through the link.
- **In the history:** it is the raw specifier, and with `--check-head` it exits 1.
- **The decision** names this limit, for a document or file reached through a linked folder. It should also say that code importing through one gets different dependency lines and the check at the head refuses.

**5. A link's target is resolved by text, not as the disk resolves it.** Confirmed by a direct call.

- **The case.**
  - `a/b -> ../x/y` (a folder);
  - `l -> a/b/../z.txt`;
  - both `a/z.txt` and `x/z.txt` exist.
- **The disk** reads `l` as `x/z.txt`.
- **`followLink`** returns `a/z.txt`, because `path.posix.normalize` removes the `..` before the link `a/b` is followed.
- **How serious:** rare and hostile.
- **Fix:** resolve one part of the path at a time, following a link before applying the next part.

**6. The usual way to raise the heap still does not reach the summary.** See finding 5 in the table: run.

**7. Whether a linked document stands: the listing is right, but nothing tests it, and its comment claims too much.** Confirmed by run: asking the disk instead leaves every test green.

- **Why it should be kept:**
  - The lens does not key the platform.
  - On Linux, with every name written, the listing and the disk agree.
  - They differ only on a disk that folds case or Unicode form.
- **How it can be tested on Linux:** export `standingFiles`, and give it a tree whose index names a file the disk lacks. The disk-asking version would then fail.
- **What its comment claims:** "a summary must not depend on the disk it was made on".
  - That holds for this one check only.
  - The generator's own resolution still finds `foo.ts` for `./Foo` on such a disk.

**8. `--keep-index` still writes citations the bundle excludes.** By reading; low. It is unchanged from the first pass and not mentioned in the decision.

**9. Words still untrue.** By reading, and by findings 1–3.

- **The decision's Rationale** says "Existence is exact for every path and content for every file a reader can read". Findings 2–4 show otherwise.
- **The decision** also says "no reader opened the content of a file written empty". That held over the sample workspaces only.
- **The decision's "What it cannot tell"** speaks of "a future reader". A present reader, the C adapter, reads such files.
- **`treeOptions`'s comment** makes the same claim about content.
- **`standingFiles`'s comment** still says the tree writer "leaves out the files the generator never opens". It also claims more than holds about the disk (finding 7).
- **`SummaryFile.citedBy`'s comment** says paths are "read from the lines' links". That is wrong for `#` and `%` (finding 1).
- **`.mdmd/layer-3/change-over-time.mdmd.md:136`** still calls the summary "format 3".
- **The decisions log's "A commit's tree" (line 614)** still says the disk is asked "before each entry" and speaks of "an entry beneath a link".

### Is the equivalence test a real oracle?

**Yes, within what its samples hold.** Taking away either half of the rule makes it fail. I ran both:

- Leaving the emptied files out instead of writing them fails `programs/typescript/tidepool`.
- Emptying excluded files that have readers fails `fixtures/include-dirs` and `programs/python/ledger`.

**It cannot see:**

- **Readers that read files of kinds with no reader** (finding 2). No sample includes such a file across top-level folders. In all, one workspace exercises the existence of an emptied file, and the 100 exclusions empty 34 files.
- **Links.** The samples hold none, and the test asserts that nothing is unwritten.
- **Exclusions narrower than a whole top-level folder.**
- **Warnings**, since its logger is silent. A separate test covers nested scans.
- **Everything the summarizing process adds after the generator.** It calls `generateLiveDocs` directly, so the listing check, the authored reading, format 4's citing paths and the bundle filter are outside it.
- **Hostile names, a file's size, and a file's first bytes.** No reader I found asks a no-reader file for its size or first bytes. Only documented files are sniffed, and they are never emptied.

### The key

- **`summarizedConfiguration` is the whole of what a summary depends on in the configuration.**
  - The worker is handed exactly it.
  - The tree writer reads `exclude` and `root`, both inside it.
  - Every other field is inside it except `bundleExclude`, which the worker never sees, and `board`.
- **Dropping `board` is sound.** No module of the engine or the generator reads it (searched); the estate reader takes a board document, not the field.
- **Keeping `requireRelativeLinks` and `slugDialect`** costs only an unnecessary rebuild when they are edited.
- **`lens.ts` is now keyed**, rightly, since it decides what the worker is handed.

### Simplest complete form

Each change below makes the code smaller as well as more correct:

- emptying by kind of content (`isMediaAsset` plus archives) instead of by `hasReader`;
- refusing only links at or above the docs root;
- reading a `Cited By` link as a plain path;
- following a link one part at a time.

`readSmallBlobs` and `followLink`'s listing of folders are sound.

### What the second pass checked and found sound

- **The tests as the builder left them.** All pass with a private `TMPDIR`: 226 tests, plus 1 expected failure, in 21 files (history unit tests, `history.test.ts`, `history-reading.test.ts`, `history-tree-equivalence.test.ts`).
- **The tests catch what they should.** Each of these changes, made alone and reverted, fails a test:
  - storing labels instead of paths;
  - handing the worker the whole configuration;
  - reading summaries with no exclusions;
  - emptying reader files;
  - leaving no-reader files out.
- **Pictures and assets.** An HTML page and a stylesheet naming excluded pictures and an excluded stylesheet give the same docs as a checkout, and the check at the head passes (run).
- **This repository.** No commit holds a link. No file outside `AI-Agent-Workspace` includes or imports anything inside it. No citing document has a name format 4 misreads.
- **My sample.** The first pass's 31 commits, run again through the mended `regenerate`, with `format` and `lens` set aside: **all 31 identical** to the cache made before the round.
  - That covers up to 1,864 links each, with no entry left unwritten.
  - The warnings were the same nested fixture scans as before.
- **This pass's scripts** are in `~/.t-rev/`:
  - `make-repos2.sh`, `make-repos3.sh` and `make-c.sh` build the test repositories;
  - `follow.ts` is the link-following check;
  - `regen2.ts` and `sample.sh` are the oracle sample;
  - `kinds.ts` measures the excluded bytes by kind;
  - `citers.js` scans the cache's citing labels.

### What the second pass did not check

- **Windows and macOS.** By reading only.
- **Each language adapter's every way of reading another file.** I found the C one by reading the adapters for calls that open a file other than their own, not by running each.
- **The builder's 84 commits.** Not rerun; my 31 are separate.
- **The signal case's new form, and the builder's timings.** Read, not rerun.
- **The full gate and the browser.**

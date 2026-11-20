# Not walking what git ignores whole: the audits' and discovery's walks, measured before and after

_Historical evidence: a record of November 20, 2026 (UTC), taken from 06:07 UTC by a builder for the root (the `walk-prune` holds of the browser lane), on `26d734043` and the commits it describes, in the builder's own worktree; the main checkout was only read. It is not current documentation. Numbers are of this machine (ten cores, twenty threads) on this date, shared with other builders; each timing carries the load average beside it._

## The answer in short

- **The walks read every folder git ignores, file by file, only to drop each file afterwards.** In the main checkout, with 28 builders' worktrees under `.claude/worktrees/`, discovery's walk of the files took 63.6 s and of the documents 19.6 s, where this worktree took 1.4 s and 0.4 s; the markdown audit took 16.9 s and the symbol audit 19.0 s.
- **The mend asks git once, before the walk, for the folders it ignores whole** (`git ls-files -z --others --ignored --exclude-standard --directory`: 38 ms in the main checkout, 37 folders), and the walk reads them as empty. What is kept is the same by construction, with three rules for the paths git refuses (below).
- **The audits (first commit): the same files and findings, about a tenth of the time.** In the main checkout, alternated twice at a load of 4 falling to 2: markdown 16.9 and 16.6 s before, 1.8 and 1.7 s after; symbols 19.0 and 18.7 s, 1.9 and 1.8 s; assets 2.5 and 2.5 s, 0.4 and 0.4 s (each the whole command, about a second of it starting `tsx`). The lists of files read were compared exactly (1,695, 1,692 and 21, identical), and each command's JSON output was byte for byte the same.
- **Discovery (second commit, held on the branch for review): the same files and documents, a fortieth of the time.** In the main checkout, in one hold at a load of 2.7: the files' walk 52.5 s before, 1.3 s after; the documents' 18.7 s, 0.4 s; 1,120 files and 65 documents, identical, and identical on all 35 sample workspaces. The Live Docs pipeline in its writing-free form (`npm run livedocs -- --check`) took 84.2 s before and **14.6 s** after in the main checkout, which is the clean worktree's 14.2 s. The gate without the browser, over both commits in the builder's worktree, was green in 194 s. The commit moves the history's key, and gives a history rebuild nothing ([below](#what-the-second-commit-gives-a-history-rebuild)).
- **A defect kept on purpose, written down to be mended:** in a repository with a submodule (or a top-level name beginning with `:`, or a link to a folder under a configured glob), git refuses the whole question, and discovery and the audits silently lose git's answer for every file ([the reproductions](#a-defect-found-and-left)).

## What was found, and why the walks were slow

The gate without the browser took 193 s in a builder's clean worktree and 287 s in the main checkout, the difference all in the stages that walk the workspace. Both walkers matched their patterns over the whole workspace, leaving out only `.git`, `node_modules` and the docs root, and only then asked git (`git check-ignore`) which of the files found it ignores. The main checkout holds 28 builders' worktrees under `.claude/worktrees/` (git ignores the folder; each is a whole copy of the repository), and `dist/`, `.mdmd/history/`, `AI-Agent-Workspace/tmp/`: every file in them was read by the walk and handed to git only to be dropped.

Before, in the main checkout, with the unchanged code frozen in a copy (`/tmp/claude-1000/wp/before`) and run with the main checkout as its working folder; load 3.9 at the start, 2.2 at the end:

| Walk | Main checkout | This worktree |
| --- | ---: | ---: |
| Discovery, files (`discoverTargetFiles`, 1,120 files kept) | 63.6 s | 1.4 s |
| Discovery, documents (`discoverDocuments`, 65 kept) | 19.6 s | 0.4 s |
| The generator's search for scans within (`scansWithin`'s glob, not changed) | 2.9 s | |
| Git's listing of the folders it ignores whole | 0.04 s (37 folders) | 0.04 s (2) |
| SlopCop markdown audit, whole command | 19.5 s | |
| SlopCop symbol audit, whole command | 20.9 s | |
| SlopCop asset audit, whole command | 2.8 s | |

The files walk costs three times the documents walk, though both match `**/*`: it hands git every file found, where the documents walk hands it only the documents. How the 63.6 s divide between the walk and git's answer was not measured.

## The mend: ask git first which folders it ignores whole

`git ls-files -z --others --ignored --exclude-standard --directory` names, with a trailing slash, each folder that is untracked and ignored as a whole, once, and not its contents. The walk then reads each of those folders as empty: glob is handed a file system (its `fs` option) whose `readdir` answers `[]` for them. The files kept are the same by construction, since every file under such a folder is untracked and ignored, and the filter that follows the walk, unchanged, would have dropped it.

Why a file system and not glob's `ignore` object: glob takes ignore patterns or an object with `ignored` and `childrenIgnored`, not both, and both walkers already pass patterns (`**/.git/**`, the audits' configured ignores). An object would have had to rebuild glob's pattern matcher with glob's own private defaults (the case rule per platform, where a pattern beginning with `/` is rooted), and could silently differ; turning a folder's name into an escaped pattern would have to survive spaces, `[`, `*`, `{`, a newline and brace expansion. Reading the folders as empty leaves the patterns as they are, needs no escaping, and if a later glob stopped calling these functions the folders would simply be walked again: no file can be lost that way.

### What git prints, tried by experiment (git 2.56.1)

In a repository built for the purpose (under the worktree's ignored `AI-Agent-Workspace/tmp/`, removed at the end), with plain `git -C <folder> ls-files -z --others --ignored --exclude-standard --directory`:

- A folder an excludes pattern names, with nothing in it tracked, is printed once with a trailing slash (`ign/`), and none of its contents.
- A folder the patterns do not name but whose every entry is ignored (`onlylogs/`, holding only `*.log` files) is printed with a trailing slash too, and its files are printed as well. A folder with one entry that is not ignored is not printed; its ignored files are, one by one.
- A folder an excludes pattern names that holds a tracked file (`mixed/`, with `mixed/tracked.txt` added with `git add -f`) is not printed; git descends, and prints `mixed/untracked.txt` and the wholly untracked `mixed/sub/`.
- An empty ignored folder is printed (`emptyign/`). With `--no-empty-directory` it is not, and, unexpectedly, neither are the single ignored files inside untracked folders that are not themselves ignored (`mixok/a.log`, `onlylogs/1.log`); the folder entries are otherwise the same. The option is not used: only the entries with a trailing slash are read, and empty folders hold nothing to walk.
- A nested repository inside an ignored folder (`ign/nestedrepo/`, with its own `.git`) and a worktree added inside one (`wt/`, the very case of `.claude/worktrees/`) are inside a printed folder, and so not walked. A nested repository inside a folder git does not ignore (`nonign/nestedrepo2/`) is not printed, and git does not descend into it, so nothing in it is ever printed: it is walked as before. (`git check-ignore` reads its own `.gitignore` for the paths it is given: `nonign/nestedrepo2/build/out.txt` is ignored by `nonign/nestedrepo2/.gitignore`, before and after.)
- `.git/info/exclude` (`excl/`), a nested `.gitignore` (`sub1/localign/`, `sub1/deep/r.tmp`) and the global excludes file (`core.excludesFile`, `globalx/`) all count. With `core.ignorecase=true`, a pattern `CaseDir/` prints the folder by its name on disk, `casedir/`.
- Names with spaces, `[`, `]`, `{`, `}`, `*`, non-ASCII letters (`café/`) and a newline come through `-z` as they are.
- From a folder inside the repository, the paths are relative to that folder (`sub1/` prints `localign/`). From an ignored folder, git prints `./`.

And `git check-ignore`, which both walkers ask after the walk, refuses the whole call (exit 128, no answer for any path) when one path:

- lies inside a submodule: `fatal: Pathspec 'nonign/nestedrepo2/m.txt' is in submodule 'nonign/nestedrepo2'`;
- passes through a link to a folder: `fatal: pathspec 'src/linkok/r.ts' is beyond a symbolic link`;
- begins with a `:` git reads as pathspec magic: `fatal: Invalid pathspec magic 'bogus' in ':(bogus)x.log'`, and `:!x.log` (magic not supported by this command). Only the start of the path counts: `keep/:!neg.log` is answered.

And glob (14.0.6): under `**/*` it follows no link to a folder (`ign/linkdir` is found as an entry and never entered); under `*/**/*.ts` and `src/**/*` it follows one (`ign/linkdir/r.ts`, `src/linkok/r.ts`).

### Where "the same by construction" needed three more rules

Each walker's rule when git refuses differs, and both depend on whether git refused: discovery then reads the root `.gitignore` alone, which may keep files in a folder that `.git/info/exclude`, a nested `.gitignore` or the global excludes file ignores; the audits then read every file found. So the shortened walk must leave git's refusal exactly as it was:

1. **A second, full walk when git refuses the short one.** Every path git could refuse in the full walk but a path in a folder git ignores whole is in the short walk too, so git refuses the short walk exactly when it would have refused the full one; then the walk is made again in full and judged by the old rule. This is what keeps a repository with a submodule as it was: a submodule's folder is tracked, so it never lies in a folder git ignores whole, and is always walked.
2. **Only walks that pass no link to a folder are shortened** (`walksNoLinkToAFolder`): patterns that are a leading `**` and one name with no `/` or `\` and at most one `*` (`**/*`, `**/*.md`, `**/*.{html,htm,css}`), so that no expansion of the braces makes a deeper part or a second `**`. Under any other pattern, glob may pass a link inside an ignored folder, git refuses that path, and leaving the folder out would turn a refusal into an answer. Discovery's own walks (`**/*` for the files by default and for the documents) and the audits' default and configured patterns are shortened; an include set of named files, or a configured glob such as `src/**/*.ts`, is walked as before.
3. **Neither the workspace itself (`./`) nor a folder whose path begins with `:` is left unwalked**: a top-level name beginning with `:` may be refused, and must be found where it was found before.

And one test holds that the walk is shortened at all, since the oracle alone would pass as well if nothing were pruned, and the speed would then be lost without a word: through the file system the walk hands glob, a folder git ignores whole is never read and a folder that holds a tracked file is (`never reads a folder git ignores whole, and reads one that holds a tracked file`, in the audits' test and in discovery's). With the pruning switched off it is red.

## The audits, before and after (first commit)

`scripts/slopcop/auditedFiles.ts` replaces the three audits' identical copies of the walk. Its git helpers live there, under `scripts/`, so that the commit changes no file the history's cache keys on: `generatorIdentity.ts` hashes every file under `packages/engine/` and `packages/generator/` but the tests and the history folders' modules that make no summary, `tsconfig.base.json`, and the entry of `package-lock.json`.

In the main checkout, one hold, load 4.4 at the start and 1.7 at the end, each command whole (`tsx` and all), before and after alternated:

| Audit | Before, round 1 / 2 | After, round 1 / 2 | Files read | Findings |
| --- | ---: | ---: | ---: | ---: |
| Markdown links | 16.9 / 16.6 s | 1.8 / 1.7 s | 1,695 | 0 |
| Symbols | 19.0 / 18.7 s | 1.9 / 1.8 s | 1,692 | 0 |
| Assets | 2.5 / 2.5 s | 0.4 / 0.4 s | 21 | 0 |

Each command's `--json` output was byte for byte the same before and after, in both rounds. Beside that, the lists themselves were compared: the old walk (each pattern globbed, then `withoutGitIgnored`, from the frozen copy) and `auditedFiles` gave identical lists for each audit's configured patterns, the collection alone taking 17.1 s against 0.57 s (markdown), 19.7 s against 0.59 s (symbols) and 2.2 s against 0.12 s (assets).

## Discovery, before and after

The second commit (on the builder's branch, held for an independent review) shortens discovery's two walks the same way, with the helpers moved beside `gitIgnored` in the engine. It changes two files the history's cache keys on, `packages/engine/src/live-docs/discovery.ts` and `packages/engine/src/tooling/gitIgnored.ts`, so it **moves the history's key** and costs a rebuild of every past commit's summary; its other files (`discovery.test.ts`, `gitIgnored.test.ts`, the audits under `scripts/`, the Live Docs under `.mdmd/`, this record) are not keyed.

`walkedAndKept` serves both walks: when every pattern passes no link (the default `**/*` and the documents' `**/*`; not an include set), it asks git for the folders it ignores whole, walks with them read as empty, and asks git about the files found; if git refuses, it walks again in full and judges as before (`keptByGitAndConfiguration`, which now takes git's answer when the caller has it). The helpers moved from `scripts/slopcop/auditedFiles.ts` to `packages/engine/src/tooling/gitIgnored.ts`, and the audits import them from there.

In one hold from 07:53 to 08:00, load 2.6 at the start and 1.7 before the gate, with the frozen copy of `26d734043` against the second commit's code (`/tmp/claude-1000/wp/after2`):

| Walk, main checkout | Before | After | Kept, before and after |
| --- | ---: | ---: | --- |
| Files (`discoverTargetFiles`) | 52.5 s | 1.29 s | 1,120 and 1,120, identical |
| Documents (`discoverDocuments`) | 18.7 s | 0.40 s | 65 and 65, identical |
| Git's listing of the folders it ignores whole | | 0.03 s (37 folders) | |
| `npm run livedocs -- --check` (generate and lint, writing nothing) | 84.2 s | 14.6 s | |

- The lists were also identical to the first measurement's, at 06:29 (63.6 s and 19.6 s then, at a load of 3.9).
- On the samples, run again before and after in the same hold since this worktree's own files had changed: every folder under `tests/integration/fixtures` and `tests/integration/programs`, the experiment repositories (`e2`, which holds a submodule, `e3` and four folders inside it: a subfolder, an ignored folder, a worktree inside an ignored folder, a nested repository), the three reproductions of the defect below, and this worktree: **35 workspaces, no list differing**.
- `npm run livedocs` whole, writing, in this worktree: 12.0 s.
- So the pipeline's 82.7 s in the main checkout, measured before this round, was discovery: with it mended, the main checkout's pipeline takes what a clean worktree's does. `scansWithin`'s 2.9 s (below) did not show as a difference in this run.

The new tests: `discovery.test.ts` gains nine cases (`the folders git ignores whole`), `gitIgnored.test.ts` the helpers' cases. Run first with the new tests and helpers but the **old** `discovery.ts`, 66 of the 67 cases of discovery's, the helpers' and the audits' test files passed: the expected lists are today's behaviour; the one red case was discovery's count of folders read, which is red without the shortening. With the new `discovery.ts`, 67 of 67. Seven mutations, each turned at least one case red:

| Mutation | Red cases |
| --- | --- |
| No second walk after git refuses | the submodule case; the colon case |
| Every pattern shortened | the configured glob through a link |
| Pruning switched off in discovery | the count of folders read |
| Pruning switched off in the audits | the audits' count of folders read |
| The workspace itself (`./`) left unwalked | the helpers' listing case; the workspace inside an ignored folder |
| A folder beginning with `:` left unwalked | the helpers' listing case; the colon case |
| A folder holding a tracked file (`mixed`) added to those left unwalked | eight cases, the tracked file's among them |

The engine's build and eslint over the changed files were clean. **The gate without the browser** (`npm run safe:commit`), over both commits in this worktree, through the lane: **green in 194 s** (unit tests 214 files, 2,703 cases; integration 24 files, 231 cases; the markdown audit 1,698 files, assets 21, symbols 1,695, nothing found). The first commit was not gated by itself.

### What the second commit gives a history rebuild

Nothing, and a little more work: about two `git ls-files` calls per commit, at tens of milliseconds each. This is read from the code, not measured in a history tree.

- **No folder can be left unwalked.** A history tree (`workingTree` in `packages/engine/src/live-docs/history/git.ts`) holds only the commit's tracked files, written out beside an index read from the commit's tree. Git then has no untracked file to name, so `foldersGitIgnoresWhole` comes back empty and the walk runs in full, exactly as before.
- **The cost is one extra call per walk.** Discovery walks twice, once for the files and once for the documents. The extra call took 31 to 41 ms in the main checkout and in this worktree tonight. A history tree has no `node_modules`, so it should cost no more.
- **`git check-ignore` is unchanged.** It is asked about the same list as before. It costs 1.3 s a commit in a history tree by the other builder's measure, and it can only answer "nothing", since a tracked file is never ignored.

The two changes can be joined knowingly. Skipping `check-ignore` where every file found is tracked is that builder's to weigh. It would be a third rule beside this commit's two walks, which it does not touch.

## The cases and the tests that hold them

The audits' cases are in `scripts/slopcop/auditedFiles.test.ts`, whose oracle is the old walk itself, kept in the test (each pattern globbed over the whole workspace, then `withoutGitIgnored`): every case asserts the new list equals the oracle's and names the expected files. Discovery's are in `packages/engine/src/live-docs/discovery.test.ts` (`the folders git ignores whole`), with the expected lists written out; the helpers' own cases are in `packages/engine/src/tooling/gitIgnored.test.ts`. The audits' tests were run against seven wrong shortenings, by mutating the source and running the tests (`/tmp/claude-1000/wp/mutate.sh`, removed at the end); the last column names the mutation that turned each case red, and every mutation turned at least one red:

| Case | Audits' test | Discovery's test (second commit) | Red under |
| --- | --- | --- | --- |
| The walk is shortened at all: a folder git ignores whole is never read, a folder that holds a tracked file is | `never reads a folder git ignores whole, and reads one that holds a tracked file` | the same | the pruning switched off; no folder read as empty |
| A tracked file inside an ignored folder is found | `leaves out what every kind of excludes file ignores, keeps a tracked file…` | `keeps a tracked file inside an ignored folder…` | a folder holding a tracked file (`mixed`) added to the folders git names |
| A nested `.gitignore`, `.git/info/exclude` and the global excludes file (through `GIT_CONFIG_GLOBAL`) count | the same | the same | the same |
| A nested repository or worktree inside an ignored folder is not walked; one elsewhere is walked as before, its own `.gitignore` read by git | `does not walk a nested repository or a worktree…` | `does not walk a nested repository or a worktree…` | the same, through the folders it asserts |
| Spaces, `[`, `*`, `{`, non-ASCII letters, a newline | `reads names with spaces…` | `reads names with spaces…` | the same, through the folders it asserts; no mutation of its own |
| `core.ignorecase` true and false | `follows git's case rule…` | `follows git's case rule…` | the same; no mutation of its own |
| A submodule: git refuses, the old rule holds (audits: every file; discovery: the root `.gitignore` alone) | `reads every file, as before, where git refuses a path in a submodule` | `reads the root .gitignore alone, as before, where git refuses a path inside a submodule` | no second walk after a refusal |
| A link to a folder inside an ignored folder, under `*/**/*` | `walks in full a pattern that may pass through a link…` | `walks in full a configured glob that may pass through a link…` | every pattern shortened |
| A folder beginning with `:` | `walks a folder whose path begins with a colon…` | the same | such a folder left unwalked; also no second walk |
| A workspace inside a folder an outer repository ignores (git prints `./`) | `walks a workspace that lies inside a folder…` | the same | the workspace itself left unwalked |
| No git on the path; not a repository | `walks everything where git cannot answer…` | the first `discoverTargetFiles` cases (their workspaces are no repository) and `gitIgnored.test.ts` | — (nothing is shortened; the old walk runs) |
| Git refusing a folder whose owner it does not trust | not simulated: this container's global configuration trusts every folder (`safe.directory=*`), and the refusal is the same exit 128 as outside a repository, the branch the case above holds | | |

## A defect found and left

When git refuses one path, both walkers lose git's answer for every file. Not mended in this round, whose contract was that the lists do not change; written down so that it can be. What a scan should do with a submodule's files at all is a question for the owner (git tracks the submodule's commit, not its files), so no mend is designed here.

Both walkers ask `git check-ignore` about every file their walk found in one call, and git refuses the whole call (exit 128, no answer for any path) when one path lies inside a submodule, passes through a link to a folder, or begins with a `:` it reads as pathspec magic. `gitIgnored` then returns `null`, and:

- **discovery** reads the workspace's root `.gitignore` alone (`createGitignoreFilter`), so a file that a nested `.gitignore`, `.git/info/exclude` or the global excludes file hides gets a doc;
- **the audits** keep every file the walk found, ignored or not (`withoutGitIgnored` returns its input);
- **the CLI does not warn**: its check (`gitIgnored(workspaceRoot, ["."])` in `scripts/live-docs/cli.ts`) asks git about the folder alone, which git answers.

Each reproduction below is the smallest found: a nested `app/.gitignore` that hides `app/secret.ts` and `app/notes.md` (which holds one broken link), and one thing that makes git refuse. Git itself ignores both files in each (`git check-ignore app/secret.ts app/notes.md` prints both). The commands were run in folders under this worktree's ignored `AI-Agent-Workspace/tmp/wp/repro/`, from this repository's checkout, with the first commit's code.

What every reproduction starts from, in an empty folder:

```bash
git init -q
mkdir app
printf 'secret.ts\nnotes.md\n' > app/.gitignore
echo 'export const main = 1;' > app/main.ts
echo 'export const secret = 1;' > app/secret.ts
printf '[gone](missing.md)\n' > app/notes.md
git check-ignore app/secret.ts app/notes.md      # prints both: git ignores them
```

Then one of the following, and from this repository's checkout `npm run live-docs:generate -- --workspace <folder> --dry-run` (which writes nothing) and `npm run slopcop:markdown -- --workspace <folder>`. Neither printed a warning in any case.

**1. A submodule.** (`git submodule add` of a local path needs `-c protocol.file.allow=always`, which the harness refused; the run here added a nested repository with a commit, which puts the same gitlink, mode 160000, in the index, and git refuses its paths the same way.)

```bash
mkdir lib && echo 'export const lib = 1;' > lib/lib.ts
git -C lib init -q && git -C lib add lib.ts && git -C lib commit -qm lib
git add lib                                       # 160000 … lib
```

Discovery: `Would create 4 Live Doc(s): …/app/.gitignore.md, …/app/main.ts.md, …/app/secret.ts.md, …/lib/lib.ts.md`. `app/secret.ts` gets a doc, and so does the submodule's own `lib/lib.ts`. The markdown audit scanned 0 files: none of its markdown lies in the submodule, so git answered for `app/notes.md` and dropped it. When the submodule holds a markdown file, git refuses and the audit reads every file; that case is `reads every file, as before, where git refuses a path in a submodule` in `scripts/slopcop/auditedFiles.test.ts`.

**2. A top-level name beginning with `:`.**

```bash
echo 'export const x = 1;' > ':(x).ts'
echo 'x' > ':(x).md'
```

Discovery: `Would create 4 Live Doc(s): …/:(x).ts.md, …/app/.gitignore.md, …/app/main.ts.md, …/app/secret.ts.md`. The markdown audit: `Scanned files: 2`, and it reports `app/notes.md:1:1 -> missing.md`, a broken link in a file git ignores.

**3. A link to a folder under a configured glob that does not begin with `**`.**

```bash
mkdir shared && echo 'export const shared = 1;' > shared/shared.ts && echo 'shared' > shared/shared.md
ln -s ../shared app/linked
echo '{"glob": ["app/**/*.ts"]}' > .live-docs.config.json
echo '{"markdown": {"includeGlobs": ["app/**/*.md"]}}' > slopcop.config.json
```

Discovery: `Would create 3 Live Doc(s): …/app/linked/shared.ts.md, …/app/main.ts.md, …/app/secret.ts.md`. The markdown audit: `Scanned files: 2`, and it reports the same broken link in `app/notes.md`.

`git --literal-pathspecs check-ignore` (or `GIT_LITERAL_PATHSPECS=1`) is git's way to read every path as a name, which would answer the second case; it was not tried. The other two are refusals by design: git will not say what a submodule's own rules ignore, nor follow a path through a link.

## Left unmended outside this round

- **The generator's search for scans within the workspace** (`scansWithin` in `packages/generator/src/generator.ts`, which looks for `**/.mdmd/layer-4` and `**/.live-docs.config.json`) also walks the whole workspace, every ignored folder included, and asks git afterwards: **2.9 s in the main checkout** tonight (the bench's copy of its glob, before). The generator is not this round's; the same helpers would shorten it, though its patterns name a deeper part, so the care about links applies.
- **Concurrent change.** A file created inside a folder after git has listed the folder as wholly ignored, and before the walk reads its parent, is not found; the old walk had the same window between its walk and git's answer, the other way round.

## Commands

Every run that loaded the machine went through the lane (`node scripts/browser-lane.mjs --label walk-prune --max-seconds <n> -- bash <script>`), with `TMPDIR=/tmp/claude-1000/wp/tmp`. The scripts and their outputs were kept under `/tmp/claude-1000/wp/` and the builder's scratchpad until the round ended, and are summarised here:

- *Before*: the code at `26d734043` copied to `/tmp/claude-1000/wp/before` (its `packages/`, `scripts/`, `tsconfig.base.json` and `package.json`, with `node_modules` linked), so that the builder could edit its worktree while the hold waited. A bench script (`bench-discovery.mts`) imports discovery from a given copy, times `discoverTargetFiles` and `discoverDocuments` over each workspace named, times git's listing and `scansWithin`'s glob, and writes both lists for an exact comparison; it was run over every sample under `tests/integration/fixtures` and `tests/integration/programs`, the experiment repositories, this worktree, and, with its working folder set there, the main checkout. Each audit was run as `tsx --tsconfig <copy>/tsconfig.base.json <copy>/scripts/slopcop/<audit>.ts --json` with the main checkout as the working folder (each audit only reads, and its git calls are `check-ignore` and `ls-files`).
- *After the first commit*: the same, with the committed code copied to `/tmp/claude-1000/wp/after1`, the audits alternated before and after twice, and a second bench script (`bench-audits.mts`) comparing the old walk's lists with `auditedFiles`'s for each audit's configured patterns.
- *The first commit's tree* was checked in one hold, from 07:52 to 07:53 at a load of 2.7 (after 59 minutes behind a browser stage): `npm run livedocs` (1,122 files validated), the markdown audit (1,698 files, no broken link) and the symbol audit (1,695, no issue), eslint and the type-check of `scripts/slopcop`, its tests (42 passed), the reads test red with the pruning switched off, and the three reproductions above. The full gate was not run on this commit by itself; it ran over both commits together.
- *Mutations*: each wrong shortening was applied to a copy of the source with `perl`, the tests run, and the file restored and compared byte for byte.
- *The second commit* was tested and measured in one hold, 07:53 to 08:00: its drafted files put in place, the tests run against the old `discovery.ts` and then the new, the mutations, the engine's build and eslint, the code copied to `/tmp/claude-1000/wp/after2`, discovery timed and its lists compared before and after on the samples and the main checkout, `run-all.ts --check` from each copy with the main checkout as the working folder (the generator's `--check` writes nothing, and lint only reads), `npm run livedocs` in this worktree, and the gate. The hold first kept a copy of the first commit's files, from which that commit was made afterwards; nothing was committed inside a hold.
- The lane was held by others for most of the round: the first commit's files waited 59 minutes behind a browser stage for their 32-second hold.

## Temporary files

Removed at the end of the round: the experiment repositories and reproductions under this worktree's `AI-Agent-Workspace/tmp/wp/`, everything under `/tmp/claude-1000/wp/` (the frozen copies, drafts, scripts, outputs and `TMPDIR`), and the bench and fixture scripts in the builder's scratchpad.

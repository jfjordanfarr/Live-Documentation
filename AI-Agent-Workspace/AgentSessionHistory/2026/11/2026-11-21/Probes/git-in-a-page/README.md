# Can a page read a repository's history out of its `.git` folder?

Historical evidence, taken on November 21, 2026 by a builder: the first milestone on the day branch at `a11f7d007`, the second (renames, section 10) at `c20007784`. It changed no product code. What remains is listed at the end.

## The question, in the owner's words

The proposal [One Engine, Two Hosts](../../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) says, in its section 4, that a page cannot run git, so the history "does without" in a page. The owner answered on 2026-11-21: "Fair. I can understand why that might be unavailable for the pure browser version, but do ponder whether there is some way we can have our cake and eat it too. Git is just a hidden directory of files. Complex as can be, but we can read files from the browser..." On the same design: "wherever you see yourself reaching for two implementations to maintain for the same problem, ask whether the right architectural choices have been made." And on their machine at work ([Turn 1](../../2026-11-21.1.record.md#turn-1)): "Absolute crap VM ... 8GB of RAM and a handful of GB of remaining storage ... We want this to be able to run on absolute garbage, even if some amount of precomputation time with reasonable progress indicators is required to do so."

## The answer first

- **A page can reach `.git`.** A folder handed to `<input type="file" webkitdirectory>` arrives with its `.git` folder in it, every file: packs, indexes, refs, loose objects. This was run, in headless Chromium 149, on two repositories. Chromium's own source says the same of a person's choice (section 2).
- **One reader of `.git` in plain JavaScript runs unchanged under Node and in a page, and gives git's own answers.** It reads the head and refs (loose and packed), loose objects, pack indexes and packs with both kinds of delta, commits, trees and blobs. On this repository and on eslint (11,130 commits, MIT), held to git: every mainline commit's id, parents, date, author and subject, in order; every reachable commit; every commit's changed paths; the tags; the head's full tree; 2,000 blobs byte for byte, and every changed blob by its id. There are **no differences**, after two corrections of the reader (git writes a zone of zero as `Z`, and gives a shallow clone's boundary commit no parents). In the page, each run's fingerprint of every commit and its changes equals the fingerprint of git's own answer.
- **It is small:** 624 lines for the reader and 144 for the inflate it needs, comments included (537 and 131 without). The probe page that carries both, with its workload and its controls, is one file of 42 KB.
- **It costs more than git and less than the work it feeds.** All of eslint's mainline with its changed paths takes 8 s under Node and in a tab, about 40 s in a tab slowed four times on two cores. Git does it in about 1 s. Reading every changed file's bytes across the whole history takes 17 to 21 s for eslint's 812 MB. For comparison, a rebuild of this repository's whole history on 2026-11-20 regenerated 1,444 changes in 71.2 minutes, 19 at a time, a process and a written tree for each change ([that day's record](../../../2026-11-19/2026-11-19.1.record.md)).
- **It answers everything the history asks of git.** That is the mainline, the tags, the files changed between two commits, what a commit holds, a blob's bytes, `core.ignorecase` and whether the clone is shallow. Since the second milestone it also answers **the renames, by git's own estimate**: [`renames.mjs`](renames.mjs), 206 lines ported from git 2.56.1.
  - Held to git with no difference on every step of both histories: 6,622 renames, 1,035 of them found by similarity. Also on twelve histories made with git to make each of its rules decide.
  - In the page, a run's fingerprint of every step's records equals git's (section 10).
  - What it does not answer is what `git status` gives `--changed` on a living folder, and the identity of the tool's own checkout; neither is the history's.
- **isomorphic-git gives the same answers, too slowly and too heavily for a weak machine.** Held to the same fingerprint it agrees. On this repository's newest hundred commits it took 16 s where this reader took 1 s, and peaked at 2.8 GB, because it reads each pack whole into memory. This repository has an 842 MB pack.

## 1. What the engine and generator ask of git today

Read from the code on `a11f7d007` (`packages/engine/src/live-docs/history/git.ts`, `gitUtils.ts`, `tooling/gitIgnored.ts`, `packages/generator/src/history/*.ts`, `generator.ts`). [`node-needs.json`](../../../../../../../tests/page-scan/node-needs.json)'s `history` list is empty: the scanning page pulls in no history module today. The counts per rebuild are read from the code, not counted by running one, for a rebuild of this repository's 1,549 mainline changes with every change sampled.

| Git command | What for | How often in a rebuild | From `.git` alone |
| --- | --- | --- | --- |
| `rev-parse --show-toplevel`, `--git-common-dir` | find the repository and its object store | once each | A `.git` file's `gitdir:` and a `commondir` file, followed. Done (this repository's worktree was read through both). A page cannot follow a pointer out of the folder it was given. |
| `config --get core.ignorecase` | how `exclude` and the lens match names | once, and once per scan inside each tree | Read from `config`. Done (a small reader; `include` directives are not followed). |
| `rev-parse --abbrev-ref HEAD`, `rev-parse HEAD`, `--is-shallow-repository` | the mainline's end | once each | `HEAD`, refs, the `shallow` file. Done, held to git. |
| `rev-list --first-parent --reverse --format=%H %P %cI %an %s` | the mainline | once | First parents walked. Done, every field held to git on 10,348 commits. `%s` joins the first paragraph's lines; `%cI` writes `Z` for a zone of zero; a commit's `encoding` header (none met) is not re-encoded. |
| `for-each-ref refs/tags` (peeled) | the tag sampling rule | once, under that rule | `packed-refs` with its peeled lines, loose tags, tag objects. Done, 432 tags held to git. |
| `diff --name-status -z -M50% -l0` | the renames and content changes between two sampled changes | once per step, about 1,548 | The changed paths are two trees walked together, equal subtrees passed over unread. Done, held to git on every step. A rename with identical content is the same blob id leaving one path and arriving at another: 5,003 of this repository's renames are of that kind. **Renames found by similarity: done in the second milestone**, git's `diffcore-rename` and `diffcore-delta` ported and held to git on every step (section 10). |
| `read-tree` into a private index, `ls-tree -r`, `cat-file --batch` | write each change's working tree to a scratch folder, then let the generator ask git about it | once each per change, about 4,600 processes | `files(tree)` and `blob(id)`. Done, the head's tree and the blob bytes held to git. Under the engine's port, nothing would be written: a commit's tree is itself a host, where `list()` is the tree's paths and `read(path)` is that blob's bytes (section 9). |
| `ls-files --others --ignored --directory` and `rev-parse` (`gitIgnores`, twice per discovery), `gitIgnored` in the generator | what git ignores, inside each change's tree | about 6 to 9 processes per change | Inside a commit's tree every file is tracked, and git never ignores a tracked file, so the answer is "nothing" by construction (`git.ts` says the same). On a living folder, [`leaveOut.ts`](../../../../../../../packages/engine/src/tooling/leaveOut.ts) already answers from the `.gitignore` files, held to git on 48,931 paths, except a tracked file under an ignoring rule, which needs `.git/index`. |
| `ls-files --stage` (`standingFiles`) | which documents stand in the change's tree | once per change | The tree's own listing. Done, as `files(tree)`. |
| `status --porcelain` (`--changed`), and `rev-parse --show-prefix` | a scan of what changed since the last commit | once per `--changed` run | Needs `.git/index` read, and each file's size and time compared or its bytes hashed. Not done here; section 4 of the proposal already offers a way without git. |
| `--version`, `rev-parse`, `ls-tree`, `cat-file`, `status`, `hash-object` (`generatorIdentity.ts`) | the identity of the tool's own checkout, which keys the cache | about 8, once | About this tool, not the scanned repository, so it is the Node host's alone. The reader could answer it, but a page has no checkout of the tool. |

So, as estimated from the code, a rebuild of this repository starts git roughly 15,000 to 22,000 times. Nearly all of those calls write and question working trees that a reader of `.git` would not need.

## 2. Whether a page can reach `.git`

| Way | What was established | How |
| --- | --- | --- |
| `<input type="file" webkitdirectory>` | **Yes, with every file under `.git`.** eslint's folder arrived as 2,391 files, 28 of them under `.git`; the copy of this repository's `.git` arrived as 5,778 files (4 packs, 5,429 loose objects). The page then read the whole history from them. | Run: Playwright's `setInputFiles` hands the folder's path to Chromium (`DOM.setFileInputFiles`), and Chromium lists the folder itself. The listing code is `FileSelectHelper` with `net::DirectoryLister`, which neither skips names beginning with a dot nor caps the count. It keeps files only and drops symbolic links ([`file_select_helper.cc`](https://chromium.googlesource.com/chromium/src/+/main/chrome/browser/file_select_helper.cc), [`directory_lister.cc`](https://chromium.googlesource.com/chromium/src/+/main/net/base/directory_lister.cc), [`file_chooser_impl.cc`](https://chromium.googlesource.com/chromium/src/+/main/content/browser/web_contents/file_chooser_impl.cc)). Whether the DevTools path today runs the very same enumeration as a person's choice was read from Blink's `FileInputType::SetFilesFromPaths` and not confirmed in the inspector's own code. |
| `showDirectoryPicker()` | **Reading a `.git` folder is allowed; writing into one is blocked.** Chromium's list of sensitive folders marks any `.git` folder `kBlockWrite`. The home folder, Desktop, Documents and Downloads are refused as the folder picked, but a project folder inside them is fine. | Sourced: `GenerateBlockPaths` in [`chrome_file_system_access_permission_context.cc`](https://chromium.googlesource.com/chromium/src/+/main/chrome/browser/file_system_access/chrome_file_system_access_permission_context.cc). Not run: automation cannot answer the picker. The probe page has a button for it, so whoever opens it by hand gets the same one-line answer. Whether the picker works on a page opened from `file://` is not known. |
| A dropped folder | Not run (earlier today a drop through the debugging protocol crashed this headless Chromium). Chromium's `readEntries` returns at most 100 entries a call ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries)), which the probe page loops over. No source says whether dot-folders are listed. | The probe page has a drop zone for it. |
| A company's policy | `AllowFileSelectionDialogs` off turns every file chooser into a cancel, the folder input among them ([Edge](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/allowfileselectiondialogs)). `DefaultFileSystemReadGuardSetting` and `FileSystemReadBlockedForUrls` guard only the picker ([Edge](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/defaultfilesystemreadguardsetting)). No policy aimed at folder inputs alone was found. | Sourced, through a subagent of this builder that read the pages named. |

**For whoever opens it by hand:** open [`probe.html`](probe.html) from disk in Edge or Chrome and give it a folder by any of the three ways. It says in one line whether the folder holds `.git`, how many pack files, how many loose objects and how many refs. Then "Read the history" reads every mainline commit newest first and every changed file's bytes, saying how far it has come. Nothing leaves the machine: the page's policy admits its one script by hash and nothing from any network.

## 3. The reader, and git as its oracle

[`git-reader.mjs`](git-reader.mjs) (624 lines) and [`inflate.mjs`](inflate.mjs) (144 lines) use only what Node and a browser both have: typed arrays, `TextDecoder`, Web Crypto's SHA-1, and optionally `DecompressionStream`. The reader reaches files through four functions: the port's `list` and `read`, and two that a pack needs, `size` and `slice(path, start, end)`. `slice` is the port's `head` grown into a ranged read. [`node-host.mjs`](node-host.mjs) answers them from a disk, and the page answers them from the `File` objects it was given ([`page-main.mjs`](page-main.mjs)).

Two choices, each made by measurement:

- **The inflate is written out in plain JavaScript, not `DecompressionStream`.** A history is hundreds of thousands of small objects, and a `DecompressionStream` per object costs about 330 µs in Node, where zlib takes 10 µs. A table-driven inflate of 144 lines brought the reading of eslint's 41,122 changed blobs, each checked by its SHA-1, from 29 s to between 13 and 16 s. `DecompressionStream` stays selectable (`inflate: "stream"`). **Inside Chromium the written inflate is the right choice too**, though by less than in Node. All of eslint's mainline with its changed paths, the two run back to back at load 3 (`results/page-rows-inflate.jsonl`), with the same answer either way:

  | Host | Written inflate | `DecompressionStream` | Ratio |
  | --- | ---: | ---: | ---: |
  | tab | 6.1 s | 9.6 s | 1.6 |
  | tab slowed | 23.0 s | 36.7 s | 1.6 |
  | Node | 6.1 s | 20.3 s | 3.3 |

  An earlier pair under shifting load, in `page-rows-renames.jsonl`, said the same less cleanly.
- **Packs are read through 64 KB windows, not 4 MB ones.** With 4 MB windows, reading this repository's history read 32 GB from about 1 GB of packs, because objects are scattered. 64 KB windows read 81 MB for the same walk, and the walk took 1.8 s where it had taken 7.7 s. `results/oracle-this-repository.json` is the run with 4 MB windows, its `hostCalls` showing the 32 GB; the other files are runs with 64 KB windows.

[`oracle.mjs`](oracle.mjs) asks git (2.56.1) and the reader the same questions and writes every difference to `results/oracle-<name>.json`.

| | This repository, through the worktree's `.git` file | A copy of this repository's `.git` | eslint, cloned anonymously |
| --- | ---: | ---: | ---: |
| Mainline commits, every field held to git | 1,544 | 1,549 | 8,799 |
| Reachable commits | 2,071 | 2,076 | 11,130 |
| Changed paths, every commit against its first parent | 46,191 | 46,206 | 43,558 |
| Changed blobs, each checked by its SHA-1 | 33,134 | 33,149 | 41,122 |
| Blobs held to `git cat-file` byte for byte | 2,000 | 2,000 | 2,000 |
| Tags | 0 | 0 | 432 |
| Head tree entries | 9,793 | 9,793 | 2,363 |
| What the store held | 4 packs (one of 842 MB, one a cruft pack), a multi-pack index, a split commit-graph, 5,401 loose objects | the same, 5,429 loose | 1 pack of 57 MB |
| **Differences from git** | **0** | **0** | **0** |

The first run on eslint differed on every commit whose zone was `+0000`: git's `%cI` writes `2016-12-15T19:48:29Z`, and the reader wrote `+00:00`. That was the only kind of difference; the reader was corrected. This repository's two columns differ because the day branch moved five commits between the runs.

## 4. isomorphic-git, the alternative of not writing one

isomorphic-git 1.44.18 (MIT) was installed outside the repository, and [`measure-isomorphic-git.mjs`](measure-isomorphic-git.mjs) asked it the same questions under Node: first parents, changed paths by its `walk` with equal subtrees pruned, bytes by `readBlob`.

| Newest hundred commits, Node | Reader: commits / bytes / peak | isomorphic-git: commits / bytes / peak | Same fingerprint |
| --- | --- | --- | --- |
| eslint | 0.16–0.74 s / 0.16–0.49 s / 164 MB | 20.6 s / 1.6 s / 265 MB | yes |
| this repository | 1.0 s / 8.2 s / 503 MB | 16.2 s / 9.7 s / 2,846 MB | yes |

- **Size in a page:** its browser bundle is 270 KB minified (80 KB gzipped), and it brings `pako` and `sha.js` with it.
- **What it needs of a file system:** `readFile`, `readdir`, `stat` and `lstat` at least, plus `readlink` for links. It reads each pack whole into one buffer (the research subagent read this in its source, `GitPackIndex.js`), which explains the 2.8 GB. On a machine with 8 GB this rules it out for this repository.
- It has no first-parent walk of its own: its `log` walks every parent, sorted by date. It finds no renames by similarity (its `follow` follows one file). It reads no SHA-256 repository, no reftable and no commit-graph.
- Its slowness on commits was not chased far. A profile shows its pack index being parsed again and again (`fromIdx`), so it might be used faster than here. Its memory is its design, not its use.

## 5. What it costs

The machine is shared: twenty threads, load 5 to 25 during these runs because of other builders and, for some page rows, this builder's own Node runs. Treat differences under about a factor of two as noise. Every row is in [`results/`](results/) with the load before and after it. "Slowed" means Chromium's `Emulation.setCPUThrottlingRate` 4 with the whole browser held to two cores (`taskset -c 0,1`), the conditions of [the scan in a tab](../scan-in-a-tab/README.md). The page rows were taken before the reader learned to follow alternates and to read a shallow boundary as git does; neither changes anything on these two repositories. The committed `probe.html` is built from the corrected reader.

| Run | Open | First commit shown | Every commit with its changed paths | Every changed file's bytes | Peak memory |
| --- | ---: | ---: | ---: | ---: | ---: |
| eslint, git itself | | | 1.1 s | | |
| eslint, Node | 10 ms | 26 ms | 7.9 s | 16.6 s (812 MB) | 521 MB |
| eslint, tab | 18 ms | 35 ms | 8.5 s | 21.0 s | 540 MB renderer |
| eslint, tab slowed | 58 ms | | 42.5 s | 132.5 s | 539 MB renderer |
| this repository, git itself | | | 0.3 s | | |
| this repository, Node | 97 ms | 13 ms | 3.2 s | 46.8 s (1.8 GB) | 587 MB |
| this repository, tab | 78 ms | 84 ms | 18.8 s (load 21) | 83.4 s | 570 MB renderer |
| this repository, tab slowed | 105 ms | 131 ms | 28.6 s | 166.8 s | 541 MB renderer |

| The newest hundred commits | Commits and changes | Their changed files' bytes | Every file of the head |
| --- | ---: | ---: | ---: |
| eslint, Node | 0.16 s | 0.16 s (7.9 MB) | 1.0 s (2,363 files, 23 MB) |
| eslint, tab | 0.38 s | 0.25 s | 1.6 s |
| eslint, tab slowed | 2.1 s | 1.5 s | 8.8 s |
| this repository, Node | 1.0 s | 8.2 s (93 MB) | 62 s (9,793 files, 1.1 GB) |
| this repository, tab | 4.2 s | 7.2 s | 45.7 s |
| this repository, tab slowed | 8.0 s | 21.8 s | 201 s |

**Renames, every step, as the history asks them** (second milestone; `results/page-rows-renames.jsonl`, `results/node-rows-renames.jsonl`; load 4 to 6 for the tab rows):

| Run | Commits with changed paths, renames included | Renames alone | Slowest step | Longest stretch between breaths | Same fingerprint as git |
| --- | ---: | ---: | --- | ---: | --- |
| eslint, Node | 7.2 s | 0.49 s | `219aecb`, 0.11 s | | yes |
| eslint, tab | 7.2 s | 0.54 s | `219aecb`, 0.13 s | 0.16 s | yes |
| eslint, tab slowed | 35.3 s | 2.6 s | `219aecb`, 0.54 s | 0.53 s | yes |
| this repository, Node | 5.4 s | 3.1 s | `48ac509`, 1.0 s | | yes |
| this repository, tab | 14.5 s | 6.4 s | `48ac509`, 2.6 s | 1.7 s | yes |
| this repository, tab slowed | 32.6 s | 12.1 s | `48ac509`, 3.8 s | 3.2 s | yes |

- **What can be shown first:** the newest commit and its changes, within 40 ms in a tab. The walk goes newest first, and the page names how many commits it has read and back to which date. The workload hands the thread back every 25 commits and every 200 files, and the rename port every 256 estimates.
- **The longest stretches:** measured between the workload's own breaths, so they are an upper bound. A read from a `File` also lets the page draw while it waits.
  - Full-speed tab: 0.5 s on eslint and 3.7 s on this repository, where single blobs are large.
  - Slowed tab: 2.4 s on eslint, and 15.6 s on this repository's head, whose files run to 1.1 GB.
  - With renames: 3.2 s slowed, in `48ac509`, where 256 estimates over large text files run between breaths.
- **The 15.6 s and what would end it.** The workload hands the thread back every 200 files whatever their size, and inflates each file in one go. The head holds 117 files over 1 MB; the largest, a 36.7 MB recording, takes 1.2 s to read in Node (`results/largest-files.json`) and about four times that slowed. Three things would end it, each cheaper than the last:
  1. Hand the thread back by bytes read rather than by files, which bounds a stretch to the largest single file.
  2. Inflate in pieces, handing back inside a large file, or read in a worker, so the page's own thread never waits.
  3. Do not read what no reader reads. The history writes such files empty today (`contentless`), and the five largest of those 117 files are screen recordings and test-trace archives. The other 112 were not looked at.

  The same holds for the rename port: handing back by bytes hashed rather than by the count of estimates would bound its 3.2 s.
- **Stopping and resuming:** the reader keeps no state but its caches. A walk resumes from any commit id, since a commit names its parents. The bytes are keyed by blob id, which never changes. So "how far it has come" is one commit id and the set of blob ids done, small enough to keep as the scan's own progress (the store's research showed a page can keep pieces in IndexedDB as it goes). Not run here.
- **Memory** stays near half a gigabyte in both hosts, set mostly by the reader's own caches: 64 MB of objects, 32 MB of pack windows, 16 MB of trees, plus the garbage collector's slack. It does not grow with the history. All of them can be made smaller for a weak machine; how much smaller costs how much time is not measured.

## 6. What does not cross

| Form | Status |
| --- | --- |
| Linked worktree, or a submodule whose `.git` is a file | **Tested.** Under Node the reader follows `gitdir:` and `commondir` (this repository's worktree). A page cannot follow a pointer out of the folder it was given: the page says so in its one line. The person would pick the main checkout instead. |
| Multi-pack index, commit-graph, cruft pack, `.rev` and `.mtimes` files | **Tested by presence:** this repository has all of them, and the reader ignores them and reads every pack's own `.idx`, which git keeps beside a multi-pack index. A commit-graph would only make the walk faster. |
| Many loose objects | **Tested:** 5,401 to 5,429 in this repository. |
| Shallow clone | **Tested, held to git** (a clone of eslint 200 commits deep; [`forms.mjs`](forms.mjs), `results/forms.json`, `results/oracle-shallow-eslint.json`). The walk stops at the `shallow` file's commits. The first run differed in one field: git gives a boundary commit no parents (`%P` empty), and the reader gave the parent stored in it. The reader was corrected and the clone then read with no difference, in a page's host and in the command line's. |
| Alternates | **Tested** (a `git clone --shared` of eslint). Under the command line the reader follows `objects/info/alternates` and reads the whole history (8,799 commits). In a page the store it names lies outside the folder, and the reader refuses at once, naming the path, rather than failing on the first missing object. |
| Reftable | **Tested: refused by name** (a `git clone --ref-format=reftable`), from `extensions.refStorage`, before any placeholder `HEAD` could be misread. Such a repository keeps a placeholder `HEAD` and `refs/heads` file ([git's reftable document](https://git-scm.com/docs/reftable)). It is not the default in any released git (2.56.1); the default is announced for git 3.0, undated ([BreakingChanges](https://git-scm.com/docs/BreakingChanges)). Reading it would mean reading the reftable format's blocks. |
| SHA-256 repository | **Tested: refused by name** (`git init --object-format=sha256` with one commit), from `extensions.objectFormat`. Reading one would mean 32-byte ids throughout and Web Crypto's SHA-256; that is git 3.0's announced default too. |
| Partial clone (promisor packs) | **Not tested: the harness refused** both ways of letting the local source serve a filtered clone (`--upload-pack` with a setting, and setting `uploadpack.allowFilter` in the source). The clone then fell back to a full one. As written, the reader notes a promisor pack, and a missing object fails its read, as `GIT_NO_LAZY_FETCH` makes git fail today. |
| Sparse checkout | Changes nothing read from objects, since the history reads commits, not the checkout. |
| LFS pointers | Read as the pointer files they are, as today's tree writer writes them. |
| Renames by similarity | **Done** in the second milestone (section 10). The one thing of git's that the port does not take is attributes: git judges a file binary by the checkout's `diff` attributes before its bytes, and the port by its bytes alone. Neither repository sets any. |
| `.git/index`, for `--changed` and for a tracked file under an ignoring rule | Not done. The index is a documented binary format (versions 2 to 4). |
| `core.ignorecase` | Read from `config`. A value given only in an `include`d file, or in the person's global configuration, would be missed. |

## 7. TFVC, for completeness

From Microsoft's documentation, through the research subagent:

- **A local workspace** keeps a hidden `$tf` folder. It holds a compressed copy of each file as it was last got (named by GUID, `.gz` or `.rw`), the local version table, and the pending changes ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/repos/tfvc/decide-between-using-local-server-workspace); [a Microsoft engineer's post](https://learn.microsoft.com/en-us/archive/blogs/phkelley/server-workspaces-vs-local-workspaces)).
- **A server workspace** keeps only the files, read-only until checked out.
- **History:** "viewing the history of an item ... still require[s] you to have a connection". **No history can be read offline from either kind.** At most a local workspace yields one earlier version of each file, the one last got.
- **The `$tf` format** is undocumented. Microsoft's open-source Java client reads it ([Team Explorer Everywhere, `localworkspace`](https://github.com/microsoft/team-explorer-everywhere/tree/master/source/com.microsoft.tfs.core/src/com/microsoft/tfs/core/clients/versioncontrol/internal/localworkspace)).

So the owner's TFVC folders have no history to read on the machine, under either host. The two sites under git do.

## 8. The judgment

_Brought level with the second milestone (section 10) the same day._

**After the second milestone, yes: one reader of `.git`, with git's rename estimate ported beside it, is an honest replacement for every call the history makes of the git program, on both hosts.**

- **What it covers:** the mainline, the tags, the changes between commits with their renames, every commit's files and bytes, the configuration and the shallow mark.
- **How it was held to git:** with no difference on every step of two real histories of different shapes (10,351 mainline commits, 6,622 renames), and on twelve histories made so that each rule of git's rename detection decides. It agrees in Node and in a tab.
- **What it would change:** the command line would no longer need git installed for the history, and the page would gain the history. It is one implementation, not two, which is the owner's test.

What is left, by name, none of it the history's:

1. **`--changed` on a living folder** (`git status`). The engine's proposal already has a way without git: sizes and times, or fingerprints, compared with the last scan.
2. **A tracked file under an ignoring rule, on a living folder.** By the root's ruling it is a non-question under the owner's model of one list of patterns.
3. **The tool's own identity** (`generatorIdentity.ts`): which checkout of this tool made a summary. It is the Node host's alone. The reader could answer it too, but there is no need.
4. **What git itself would only do differently by state outside the commit.** Git's binary test reads the checkout's attributes, and git's renames depend on its version (section 10). The port answers from the commit alone, the same everywhere. That changes nothing on the repositories measured.
5. **What the reader refuses, by name:** reftable, SHA-256, alternates out of the page's reach, and a linked worktree's pointer out of the page's folder. A partial clone stays untested (the harness refused to make one).

**The smallest first step**, now that renames are in hand:

- Put the reader and the port into the engine behind a version-control port shaped like today's `VersionControl`: `mainline`, `mainlineEnd`, `tagged`, `changesBetween`, and, in place of `workingTree`, a host over a commit's tree.
- Keep git as the oracle in the tests (this probe's `oracle.mjs` and `rename-oracle.mjs`, and the generated histories).
- That deletes the history's need for the git program on both hosts.
- It makes much of `git.ts`'s 1,085 lines unnecessary wherever the generator reads through the port, the tree writer's defences against what a disk cannot hold among them, since nothing is written to a disk.

**What would overturn it:**

- A history whose renames the port gives otherwise than git, which the oracle would show at once. None has been found in 12,751 steps across fourteen histories.
- A repository whose packs, at the owner's scale, make the walk far slower than measured here. The 842 MB pack here did not.
- Edge at work refusing folder inputs by policy.
- The owner choosing that a page should show only history precomputed by the command line, which section 4 of the proposal already offers.

**Beside the alternatives:**

| Way | What it buys | What it costs |
| --- | --- | --- |
| The command line computes the history and the page only shows it (the proposal today) | Nothing new to build. | Two ways of getting history, one per host, which the owner names as drift. |
| isomorphic-git | Its own maintenance, not ours. | 16 times slower on commits here, 2.8 GB on this repository, 270 KB in the page, no first-parent walk and no similarity renames: the hard part stays ours. |
| This reader and the rename port | One code for both hosts, about 1,000 lines, git's answers. | Ours to keep, against git's formats. Those formats change slowly and say so in `extensions`, and git itself stays the oracle in the tests. |

## 9. One more thing the numbers suggest

Today a change's tree is written to a scratch folder so that the generator can read it as a folder: about 4,600 git processes, and `git.ts`'s defences against names a disk cannot hold. Under the port, a commit's tree is already a host: `list()` is `files(tree)` and `read(path)` is `blob(id)`. The scan would read a change's files straight from the object store, and a change's neighbour would share every unchanged blob's bytes by id. That would make the history the scan run over many hosts, and the same in both places. It is a consequence of this probe, not something it measured.

## 10. Renames: git's estimate, ported and held to git (second milestone)

The root decided the fork of section 8 the way that changes nothing the product says: port git's own rename detection and hold it to git. An engine rule of its own was not built; that stays the owner's to ask for.

**What was read.** git's own source at the version installed here, tag v2.56.1 (tag object `766ce5124ba61f18476de30c3b3cc8ee846eeb34`): `diffcore-rename.c` (`diffcore_rename_extended`), `diffcore-delta.c` (`hash_chars`, `diffcore_count_changes`), and from `diff.c` the parsing of `-M50%`, the printing of a score and the test for binary. The port is [`renames.mjs`](renames.mjs), 206 lines (171 without comments), plain JavaScript beside the reader, the same file in Node and the page.

**What it does, in git's order,** for `git diff --name-status -M50% -l0`:

1. **Destinations and sources.** Every added path is a destination and every deleted path a source, in the tree's order. Empty files take part, since git's `rename_empty` is on by default.
2. **Exact renames first.** Each destination in turn takes the first unused source with its blob id, preferring one whose file name ends the same, and weighs at most 100 candidates. A symbolic link or submodule moves only with the same mode, and only exactly.
3. **Unique file names.** For a destination and a source whose file name each is alone in having, the pair is taken if it is at least 75 % alike: halfway between the 50 % minimum and identical (`GIT_BASENAME_FACTOR` unset).
4. **The full comparison.** Every destination left is weighed against every source left, keeping the best four per destination. A tie never replaces a candidate already kept.
5. **Taking the pairs.** The kept candidates are sorted, stably, by score, then by a same file name, and taken in turn while unused and at least 50 % alike.

**How alike two files are** is git's estimate:

- Only regular files are compared. A pair is rejected on sizes alone when they differ by more than the minimum allows; git asks only for the size here, and so does the port, through a size-only read added to the reader.
- Otherwise each file is cut at every LF or every 64 bytes, each piece is hashed (two 32-bit accumulators, modulo 107,927), and the bytes of the source's pieces that the destination keeps are counted. The score is those bytes over the larger size, truncated, in git's units of 60,000.
- A text file's CR before an LF is not counted. A file is binary when its first 8,000 bytes hold a NUL. The printed score is the truncated percentage, `R087`.
- `-l0` means no limit, so the full comparison is never skipped.
- Because nothing passes a directory-rename hint in a plain diff, git's guess of where a folder went is never used here.

**Held to git, every step** ([`rename-oracle.mjs`](rename-oracle.mjs); `results/renames-*.json`). The oracle compares:

- Git's own `git log --first-parent --diff-merges=first-parent -M50% -l0 --name-status -z`, every record of every step in git's order: status letter, score, both paths.
- Each step that git gives a rename, asked again exactly as the history asks it (`git diff --no-ext-diff --name-status -z -M50% -l0 <parent> <commit>`).

| History | Steps | Renames | By similarity | Steps asked again as the history asks | Differences |
| --- | ---: | ---: | ---: | ---: | ---: |
| this repository, at `c20007784` | 1,552 | 5,845 | 842 | 31 | **0** |
| eslint | 8,799 | 777 | 193 | 72 | **0** |
| 12 generated histories, 200 steps each | 2,400 | 104,002 | 3,694 | 2,388 | **0** |

**Whether the oracle can fail** ([`rename-mutations.mjs`](rename-mutations.mjs); `results/rename-mutations*.json`):

- A port that finds no renames gives 144 differences on eslint.
- Seven narrower mutants each change one of git's rules. **On the two real histories, none of the seven is caught. Every rename in both was decided by score alone:** no file-name pass, tie, name preference, CR or choice among identical sources ever changed an answer there. Real histories alone therefore do not show that the port is git's in its subtler rules.
- So [`rename-cases.mjs`](rename-cases.mjs) makes histories with git itself (`git init` and `git fast-import`, from a seeded generator). Their content is random: edits around the 50 % and 75 % bars, shared and unique file names, empty, binary, CRLF, executable and linked files. Half of its commits also set up one of three scenarios, each built so that one rule decides.

| Mutant | Steps differing from git, 6 random histories | 6 histories with scenarios | this repository, eslint |
| --- | --- | --- | --- |
| no file-name pass | 0 | 6 to 14 each | 0, 0 |
| file-name pass at the plain 50 % | 0 | 2 to 16 each | 0, 0 |
| a tie replaces a kept candidate | 0 | 24 to 40 each | 0, 0 |
| no preference for a same file name among equal scores | 2 in one | 2 in one | 0, 0 |
| CR before LF counted | 22 to 60 each | 36 to 68 each | 0, 0 |
| exact renames take the last identical source | 292 to 382 each | 344 to 388 each | 0, 0 |
| score rounded, not truncated | 0 | 0 | 0, 0 |

- Six of the seven rules are caught. The seventh, truncating a score rather than rounding it, decides only where a score falls within one unit below a printed percentage boundary, about once in 1,200 renames. None of the 110,624 renames met one, so it stands on reading git's code alone. The mutants were run on the port before its size-only read; that read changes no answer, and the oracle after it found no difference on any history.
- Each difference count above is in steps. The oracle counts a step twice when both git's `log` and its `diff` disagree with the port.

**What git's own estimate depends on, stated plainly.** Within one version of git the estimate is deterministic, and it is order-dependent by design: the first unused source wins among identical ones, the first four candidates are kept on ties, and the sort is stable. The port reproduces that order and was held to it. Beyond that:

- **The checkout's attributes.** Git decides "binary" from the attributes of the checkout it is run in (a `diff` or `-diff` or `binary` attribute, from the working tree's `.gitattributes`, `info/attributes` and the person's global attributes file), not from the commit. Neither repository sets one, so here the NUL test decides alone. A repository that marks files `-diff` in a later checkout could make today's history read an earlier step's renames otherwise than a rebuild from another checkout; the port reads the NUL test only, the same for every checkout. That is a difference the product would choose by design, and it does not arise on the repositories measured.
- **The version of git.** Renames are version-dependent across git's history. The pass over unique file names came with git's rework of rename detection in 2021. The release notes of 2.31 and 2.32 say only "Performance improvements for rename detection" and "Rename detection rework continues"; which release brought the pass was not pinned down here. Before it, the full comparison alone decided. The port is git 2.56.1's rule. A person whose git predates the pass can get other renames from today's command line than the port gives; with the port, every machine gets the same answer, whatever git it has. On the two real histories the pass decided nothing (the mutants above), so there the versions agree.

**What it costs** (Node at full speed; the tab rows are in section 5):

- The whole rename work of a history: this repository 3.7 s for 1,552 steps, eslint 0.7 s for 8,799 (`results/renames-*.json`, under load 5 to 20).
- **The worst step** of this repository is `48ac509` (304 added, 450 deleted, up to 137,000 pairs, most refused on size): 0.6 to 1.1 s. Before the size-only read it was `cb2617b`, where twelve deleted images were read whole to learn their sizes: 1.5 s, now gone.
- The largest matrix, `796ee87` (4,505 added and 4,505 deleted), is all exact renames: 20 ms.
- eslint's worst step is now `219aecb` (131 added, 125 deleted): 0.15 s. Before the size-only read it was `b8995a4` (231 added, 6 deleted), at 0.34 s.
- **It hands the thread back:** the port awaits the caller's `pause` every 256 estimates, and the workload passes the page's.

## Files

| File | What it is |
| --- | --- |
| [`git-reader.mjs`](git-reader.mjs), [`inflate.mjs`](inflate.mjs) | The reader and its inflate. |
| [`node-host.mjs`](node-host.mjs) | The four functions from a disk. |
| [`workload.mjs`](workload.mjs) | What is measured, the same code in both hosts, and the folder's one-line description. |
| [`page-main.mjs`](page-main.mjs), [`build-page.mjs`](build-page.mjs), [`probe.html`](probe.html) | The page's part, the build that inlines the modules unchanged, and the built page. |
| [`oracle.mjs`](oracle.mjs) | The reader held to git. |
| [`measure-node.mjs`](measure-node.mjs), [`measure-page.mjs`](measure-page.mjs), [`run-rows.mjs`](run-rows.mjs) | The measurements and their runner. |
| [`measure-isomorphic-git.mjs`](measure-isomorphic-git.mjs) | The same questions of isomorphic-git. |
| [`count-renames.mjs`](count-renames.mjs) | How many of a history's renames git finds by similarity. |
| [`forms.mjs`](forms.mjs) | The reader on a shallow clone, alternates, reftable and SHA-256, as a page and as the command line. |
| [`renames.mjs`](renames.mjs) | git's rename detection, ported. |
| [`rename-oracle.mjs`](rename-oracle.mjs) | The port held to git on every step of a history. |
| [`rename-cases.mjs`](rename-cases.mjs) | Histories made with git to make each rule of its rename detection decide. |
| [`rename-mutations.mjs`](rename-mutations.mjs) | Whether the rename oracle can fail: seven mutants of the port, each held to git. |
| [`largest-files.mjs`](largest-files.mjs) | A head's largest files and how long each takes to read. |
| [`results/`](results/) | Every row: `oracle-*.json`, `node-rows*.jsonl`, `page-rows*.jsonl`, `isomorphic-git-rows.jsonl`, `renames.jsonl` (the first milestone's counts), `renames-*.json` (the port held to git), `rename-mutations*.json`, `largest-files.json`. |

To run again, from this folder: `node oracle.mjs <host root> <git dir> HEAD <folder git runs in> <name>`. Then `node build-page.mjs`. Then, from the repository's root, `node scripts/browser-lane.mjs --label git-probe --max-seconds 2400 -- node <this folder>/run-rows.mjs page-rows.jsonl page <folder>:<rate>:<all|newest100|commits> ...`.

## What remains

As left by the root's brief for the second milestone:

- **isomorphic-git in a page:** not done. The judgment does not need it.
- **A partial clone:** untested; the harness refused to make one, and it stays an unknown.
- **`.git/index`:** not read. Tracked-but-ignored is a non-question under the owner's model of one list of patterns, and "only what changed" has a way without git in the engine's proposal.
- **A count of git processes in a real rebuild,** taken by running one rather than read from the code.
- **The page handing the thread back by work done rather than by count** (section 5), and the reader in a worker. Neither is built.

Rename rows run again from this folder: `node rename-oracle.mjs <folder holding .git> <name>`. Then `node rename-cases.mjs <new folder> <seed> 200` makes a generated history, and `node rename-mutations.mjs <scratch folder> <name>=<folder> ...` runs the mutants.

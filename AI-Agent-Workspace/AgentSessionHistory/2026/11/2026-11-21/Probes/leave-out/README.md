# What a scan leaves out, decided before it reads: the function and its oracles

Historical evidence, taken on November 21, 2026 by a builder for the root, on branch `page-check`. It records the first leg of building the one function that decides what a scan leaves out, which [the design of one engine with two hosts](../../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) names. The function is `packages/engine/src/tooling/leaveOut.ts`. It is standalone: nothing in discovery calls it yet. **This leg is unfinished**; what is not done is listed at the end.

## Second leg, later on 2026-11-21: the root's five rulings, built and measured

### What changed in the function

1. **A folder left out is left out whole, under either syntax.**
   - It is not entered. A `!` line keeps something only where its folder is kept: git's rule, and TFVC's in `tf add /recursive`.
   - Where a `!` line at or above could have named something inside, the folder's answer carries a note naming the line. For example: ".tfignore line 2, `!packages\keep\x.targets`, may name files inside folders left out whole; they are not looked for".
   - `folder()` reports every folder left out as prunable.
   - In the TFVC oracle test, the scanner's verdicts stay recorded. The re-recording also holds `tf add`'s verdict for each file. Of 468 files, 3 differ between the two readings, all in one tree. For those 3:
     - the test holds the function to `tf add`, and marks them as following it;
     - where the scanner kept a file by a `!` line at or above the folder, the note must name that line;
     - where the `!` line lies in a `.tfignore` inside the folder, which `tf add` never reads, the note must not name it.
2. **Case in `.gitignore` is the repository's, handed in** (`gitIgnoreCase`).
   - The git oracle test now asks git both ways, `core.ignorecase` false and true, for all 16 cases and the random trees: 33 tests, all agreeing.
   - A new case holds git's folding quirks, which the port keeps: an escaped letter and a class's single members are compared as written, while ranges and `[:upper:]` fold.
   - Asking both ways found one fault in the prefilter added for speed: a `**/` pattern's slash was taken as required. Mended.
   - The person's patterns and a starting list of patterns are always read without regard to case. `.tfignore` is unchanged.
   - **Can a page read `core.ignorecase` from the listing?** For an ordinary clone, yes: `.git/config` is a file in the folder a person picks, and git writes `ignorecase = true` there when it makes a repository on Windows. It does not hold when that setting comes from a global or system file, when `.git` is a file pointing elsewhere (a worktree, a submodule), or for `GIT_DIR`. Today's scanning page leaves `.git` out of what it holds, so it would have to read that one file first.
3. **The tool's own output is never scanned,** with a rule kind of its own (`own output`), whatever the ignore files and the person's patterns say.
   - The first leg's DNN figures counted 10,776 files of our own docs, written into the shared corpus by the readers' builder. Those figures are superseded by the clean copy below.
4. **The decide step keeps each folder's state,** derived once from its parent's and the ignore files in it. Measured on the made folder (103,329 files, 64,504 folders: 167,833 paths), every folder and every file asked, with the fixed starting list:
   - Node: 0.50 to 0.72 s;
   - a page at full speed on two cores: 0.16 to 0.27 s;
   - a page slowed four times on two cores: 0.65 to 1.17 s (three runs each, load about 11).
   - The first leg's figure was about 2 to 10 s for 25,000 paths.
5. **The evidence rules,** a starting list that looks before it leaves out: `bin` and `obj` beside a project file; `packages` holding NuGet's `<Id>.<Version>` folders or a `repositories.config`; `node_modules` holding a `package.json` in one of its first three folders.
   - They need the names one level into `packages`, two into `node_modules`, and no file's bytes.
   - On the made folder they cost 99 extra folder listings, against the 13,763 entries the walk listed.

### The made folder

`make-folder.mjs` made it from DNN, read only:

- DNN's files without `.git`, its `.gitignore` files and our docs: 10,941 files;
- built output beside each of its 82 project files: 1,722 files under `bin/Debug`, `bin/Release` and `obj`;
- NuGet-shaped `packages` folders: one at the top holding 600 packages, and one in each of the first 45 project folders holding 80. Each holds a `repositories.config` and `<Id>.<Version>` folders with a `.nupkg`, `lib/<framework>/` assemblies, resources, `content`, `tools` and `build` files;
- NuGet's own recommended `.tfignore` in 15 of those 45 project folders (every third), and no ignore file anywhere else.

That is 103,329 files in all, 92,399 of them made. Every file is empty, since only names matter before a scan. The manifest of what was made lets a listing count the made output it wrongly keeps.

### The five starting lists, names compared without regard to case

**The made folder** (`listings/made-*.txt`):

| Starting list | Kept | Left out | Made output wrongly kept (of 92,399) | Source wrongly left out | Entries the lazy walk listed | Walk and decide |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| nothing | 76,899 | 26,430 | 65,969 | 0 | 123,418 | 5.6 s |
| fixed (`bin/`, `obj/`, `packages/`, `node_modules/`, `.vs/`, `TestResults/`) | 11,228 | 92,101 | 313 | 12 | 13,749 | 0.44 s |
| GitHub's `VisualStudio.gitignore` | 11,170 | 92,159 | 313 | 63 | 16,789 | 1.4 s |
| TFVC's own 56 defaults | 40,374 | 62,955 | 29,543 | 29 | 121,805 | 6.6 s |
| by evidence | 11,242 | 92,087 | 313 | 1 | 13,763, and 99 extra listings | 0.36 s |

**Clean DNN** (10,941 files), as a TFS folder with no ignore file (`listings/dnn-clean-no-ignore-files-*.txt`):

| Starting list | Left out | Source wrongly left out |
| --- | ---: | ---: |
| nothing | 0 | 0 |
| fixed | 15 | 12 (`Services/Installer/Packages/*.cs`, once names fold) |
| VisualStudio | 73 | 63 (`Services/Installer/Log/*.cs` and `Packages/*.cs`) |
| TFVC defaults | 99 | 29 (`Website/js/Debug/*`) |
| evidence | 1 | 1, `Packages/repositories.config`, which is NuGet's own file and arguably right |

With its own `.gitignore` files (`listings/dnn-clean-*.txt`), every list gives the same 26 left out, by DNN's rules. A starting list never applies under a `.gitignore` at the top.

**What the numbers say.**

- *Source wrongly left out.* Every list that names a folder by name leaves out real source in a folder named `Packages`, `Log` or `Debug`. Only the evidence rules do not.
- *Packages wrongly kept.* TFVC's defaults keep the packages themselves: 29,543 made files, everything that is not a `.dll`, `.pdb`, `.exe` and the like. They also list nearly everything, since they prune almost nothing.
- *Build output kept under a `.tfignore`.* Every list keeps the same 313 made files: the build output in the 15 project folders that hold NuGet's `.tfignore`. That file names `packages` but not `bin` or `obj`, and the starting list stands off wherever an ignore file stands. Under TFVC itself the server's global list would leave them out.
  - This is a fork for the design: the starting list's build folders could apply under a `.tfignore` that does not mention them.

### Listing in a page

- **`<input webkitdirectory>`:** handed the made folder's 103,329 files in 73.4 s, on two cores at full speed, at a load of about 9 (`listing-in-page.mjs`). Making the list of names from them took 0.5 s.
  - That time includes Playwright's own handing over of the files, which cannot be told apart here.
  - Such an input always lists everything, packages included, before the page sees anything.
- **A lazy walk** through a directory handle cannot be driven by an automated browser, since the picker's prompt cannot be pressed (the probe of November 19). It was not timed. What can be said is in Node's walk above: with the evidence rules it listed 13,763 entries where the input listed 103,329 files.

### Forks 2 and 3, as far as this leg goes

**Where a person's own patterns are kept.** [The work item](../../../../../../Work/scan-leaves-no-trace.md) has not decided where a scan's output goes. Its candidates are a folder inside the mapped one that ignores itself, or a folder outside it. It asks that the patterns be kept "where the next scan finds them", and that a scan leave no trace unless asked.

The function needs the patterns before the walk, with the ignore files. So they belong with the scan's settings:

- **Command line, inside the scan's own output folder.** That folder is never scanned, so the patterns leave no trace in version control, and the next scan of the same folder finds them.
- **Command line, outside the folder** (beside the user's profile, keyed by the folder's path). This leaves no trace at all, but the patterns are lost when the folder moves.
- **A page.** It keeps them inside the HTML file it saves, with the facts. A blank copy carries none, and a filled copy carries its folder's.
- **In the folder as a file of its own** (a `.live-docs-ignore`). This leaves a trace, so it would only be written when asked. The work item's own rule makes it opt-in.

**One syntax or two.** Today the person's patterns are read by git's rules without regard to case.

- *Cost to a TFS user:*
  - `\` must be written `/`;
  - a pattern without a slash reaches every depth, as in TFVC, but one with a middle slash is anchored, where TFVC anchors only by a leading `\`;
  - `!` under a folder left out now behaves the same in both syntaxes (ruling 1), which removes the largest difference.
- *Cost to a git user of TFVC's syntax:* it has no `**`, no classes, and no anchoring by a middle slash.
- *What the measurements bear on:* git's syntax with case folded, `\` accepted as `/`, and no other change would read every pattern in NuGet's `.tfignore` and TFVC's default list the same way. Not measured further.

### Still owed

- **The swap measurement** (the function against today's discovery, on this repository and every fixture). Not done in this leg either.

### The first leg's DNN figures

The first leg's DNN listing and its starting-list figures below counted our own docs, and the tables above replace them.

The ask, in the owner's words of [Turn 3](../../2026-11-21.1.record.md#turn-3):

- "I do have some project specific .tfignore files specifically because of how sick I was of churn in the packages folders (which should never ever have made it into TFS in the first place - bah!), but not all"
- "This would then behoove us to ensure that the user, either via CLI or the page, has a good solid way to create ignore patterns on what they scan, before they scan it."
- "Thanks to dozens of projects committing their gosh dang packages folder, there's over 100k files in just the portion of TFS I have cloned."

## The function

`leaveOut({ ignoreFiles, startingList, person })` is given:

- the listing's paths;
- the texts of the `.gitignore` and `.tfignore` files the listing names;
- a starting list;
- a person's own patterns.

It answers for a file: kept, or left out, with the rule that decided (file and line, entry of the starting list, or the person's pattern). For a folder it also says whether a walk may leave it unlisted, and why. It imports nothing; the engine's page check found nothing new it needs of Node.

**Which rule wins.**

1. A person's patterns come first.
2. Then the ignore files. A path is left out when either kind leaves it out.
3. Then the starting list. It applies only where no ignore file stands at or above a path's folder ("a folder with no ignore file").

The person's patterns and the starting list are read by git's rules for now (fork 3 below).

## `.gitignore`: held to git, rule for rule

The `.gitignore` half is a port of git 2.56's `dir.c` (which patterns apply, the last match in a file, deeper files first, a folder git ignores deciding for everything beneath) and `wildmatch.c` (the matcher).

**The committed oracle test,** `packages/engine/src/tooling/leaveOut.oracle.test.ts`:

- It makes each tree in a fresh repository, with git's global and system configuration kept out and `core.ignorecase=false`.
- It asks `git check-ignore -v -n -z --no-index` of every file and folder.
- It requires the same verdict and the same deciding file and line.

The named cases:

- nested files;
- negation and the last line winning;
- anchored and unanchored patterns;
- trailing slashes;
- double stars;
- character classes, with a caret and a range;
- escapes, comments and trailing spaces;
- a folder named, with a `!` beneath it that cannot re-include;
- a `.gitignore` inside an ignored folder;
- carriage returns and a byte-order mark;
- a nested file's anchored pattern;
- one star and one question mark stopping at a slash;
- case;
- dot files.

A generator with a fixed seed adds 60 random trees. It found nothing the named cases had not.

- All 16 cases agree.
- Shown red: with `?` allowed to match `/` in an anchored pattern, `s/t/u` was ignored where git keeps it.

**On real folders** (`git-agreement.ts`). Every path is compared with git's answer.

| Folder | Paths | `.gitignore` files | Agree | Disagree | Decided from outside the tree | Tracked, yet left out by the rules | Decide time |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| this repository (the builder's worktree, with `node_modules`, `dist`, `test-results`) | 22,229 | 1 | 22,229 | 0 | 0 | 11 | 2.1 s |
| DNN (the readers' corpus, a git clone, read only) | 26,223 | 26 | 26,223 | 0 | 0 | 26 | 5.7 s |
| MediatR (cloned shallow and anonymously; build outputs placed where a .NET build puts them: 81 files) | 479 | 1 (224 lines) | 479 | 0 | 0 | 0 | 0.08 s |

**What a listing cannot know:**

- **`.git/info/exclude` and the global excludes file.** On these three folders none decided anything.
- **A file git tracks beneath a rule that would leave it out.** Git keeps it; the function, from a listing, leaves it out. That is 11 files here (for example `.vscode/settings.json` and probe logs) and 26 in DNN (for example `Build/Tools/NuGet/*.nuspec` and German `.resx` files). The Node host can still ask git for these; a page cannot.

**Not yet done:** the main checkout as such (the worktree stands in for it), and a public repository with many nested `.gitignore` files beyond DNN's 26.

## `.tfignore`: what its rules rest on

Microsoft's page says little. Its open-source cross-platform TFVC client, **Team Explorer Everywhere** (`microsoft/team-explorer-everywhere`, MIT, commit `21e0e598`, 2024-03-23), implements local workspaces and so implements `.tfignore`. The client is a Java port of Visual Studio's, whose source is not public, so these are TEE's rules.

A subagent of the builder's tier read the code: `IgnoreFile.java`, `IgnoreEntry.java`, `LocalItemExclusionEvaluator.java`, `ItemPath.java`, the walkers. It also compiled Microsoft's classes unchanged, with a small driver of its own, into an executable oracle. The answers to the three questions the page leaves open:

**A subfolder's file adds to its parent's; it does not replace them.**
- Files are read from the scanned folder down to the item's parent.
- The deepest file that has an opinion decides; a file with none passes the question up (`LocalItemExclusionEvaluator.java:279-303`; `IgnoreFile.isExcluded` returns `null`, "No declaration either way").
- A folder's own `.tfignore` governs its contents, not the folder itself.

**Case.**
- The name part ignores case on every platform (`IgnoreFile.java:274-293`, `compareCaseInsensitive`; `ItemPath.matchesWildcardFile`, "Character case is ignored").
- A pattern's folder part (`Docs\` in `Docs\*.md`) is compared with `java.io.File.equals`. That ignores case on Windows and respects it on Linux.
- The function compares it without regard to case, as on Windows, where TFVC workspaces are. That is its one deliberate difference from the oracle, which ran on Linux.

**Order within a file: the last matching line wins,** exclusion or inclusion (`IgnoreFile.java:221-316`).

The rest of the grammar:

- Lines are trimmed (Java's `trim`).
- `#` after trimming is a comment; there are no comments at the end of a line.
- `/` and `\` are one separator.
- `!` re-includes.
- A leading separator keeps a pattern to its own folder (tested after the `!`, so `!\Help.exe` works).
- A trailing separator matches folders only.
- Only `*` and `?` are wildcards, with Visual Studio's rule on a trailing period (`x*.` matches `xnoext`, not `xhas.ext`).
- An exclusion that matches any part of a path leaves it out; an inclusion re-includes only the part it names last.

**Can a `!` re-include a file under an excluded folder? Yes, for TFVC's change scanner, which fills Pending Changes.** It enters every folder and judges every file (`LocalWorkspaceScanner.java:166-168`). So `out` then `!out\keep.dll` keeps `out/keep.dll`. But `tf add /recursive` skips an excluded folder unseen (`FileSystemWalker.java:276-279`). So the function reports a folder a `.tfignore` excludes as **not prunable**, and says why.

**What it does not take from TFVC:**

- **The global exclusion list a collection's server sends.** TEE falls back to 56 entries when none has come (`ExclusionSet.java:47`), among them `bin`, `obj`, `Debug`, `Release`, `TestResults`, `*.dll`, `*.exe`, `*.pdb` and `*.user`, though not `packages`. It is a candidate starting list, not a rule of the file.
- **TFVC's skipping of its own `$tf` and `.tf` folders.**

**NuGet's own page** (https://learn.microsoft.com/en-us/nuget/consume-packages/packages-and-source-control, "Omitting packages with Team Foundation Version Control") gives this `.tfignore`:

```
# Ignore NuGet Packages
*.nupkg

# Ignore the NuGet packages folder in the root of the repository. If needed, prefix 'packages'
# with additional folder names if it's not in the same folder as .tfignore.
packages

# Omit temporary files
project.lock.json
project.assets.json
*.nuget.props
```

It has no `!packages/*.targets` line; the root's memory of one is not on the page. Its comment says "in the root of the repository", but `packages` with no leading `\` is recursive by the code above: it leaves out every file or folder named `packages` at any depth.

**The committed oracle test,** `packages/engine/src/tooling/leaveOut.tfvc.test.ts`:

- It reads `packages/engine/src/tooling/__fixtures__/tfignore-oracle.json`. That file holds TEE's own verdicts, recorded by `record-tfvc-oracle.mjs` with no global list: 12 trees that each probe one question, plus 40 trees from a fixed seed, 468 file verdicts in all.
- It requires each file's verdict and its deciding file and line.
- All 52 trees agree, with the one stated case difference.
- Shown red: with an inclusion allowed to match any part of a path, three trees differed.

**Known gaps:**

- A line that names nothing below its own folder (`\` alone) is skipped where TEE would read it oddly.
- Whitespace between `!` and `\` differs only for names that begin with spaces.
- How Visual Studio's own client treats case and encodings (no byte-order mark means the ANSI code page) is inferred from TEE, not proven.

## What a person would be shown before a scan: DNN

`shown-before-a-scan.ts` prints, by folder, the files, how many are kept, and how many are left out by which rule. Its four listings were replaced by the second leg's, made from a clean copy. The time to list is Node's walk; the time to decide is the function, not yet tuned.

| DNN, 21,717 files | Kept | Left out | Listed | Decided | Source files the starting list leaves out |
| --- | ---: | ---: | ---: | ---: | ---: |
| with its 26 `.gitignore` files | 21,686 | 31 | 201 ms | 3.9 s | — |
| as a TFS folder with no ignore file, starting list `fixed-list.txt` (`bin/`, `obj/`, `packages/`, `node_modules/`, `.vs/`, `TestResults/`) | 21,717 | 0 | 179 ms | 2.0 s | 0 |
| the same, starting list GitHub's `VisualStudio.gitignore` (426 lines, CC0, copied as `starting-lists/VisualStudio-ignore.txt`) | 21,574 | 143 | 177 ms | 9.5 s | **60** |
| the same, nothing left out | 21,717 | 0 | 147 ms | 1.4 s | — |

**The cost of the standard list.** Its `[Ll]og/` and `**/[Pp]ackages/*` lines leave out real source in DNN: `DNN Platform/Library/Services/Installer/Log/*.cs` and `Services/Installer/Packages/*.cs`, 60 code files in all.

**The cost of the fixed list.** It leaves nothing out of a clean clone, which has no build outputs. Its lowercase `packages/` does not match `Packages/` under git's rules. On the owner's Windows/TFS folders the same list read without regard to case would leave out `Services/Installer/Packages` too.

**What the clean clone cannot show:** the made folder of more than a hundred thousand files, with packages and build outputs, is not yet made. That is where the lists differ in kind.

## The three forks, as far as measured

1. **The starting list.** Measured above on DNN. On real source, the broad standard list is wrong 60 times, the fixed list never, and "nothing left out" never. The case of `packages` is a sub-fork of its own: TFS users write `Packages` and `packages` alike.
   - Not yet: the made folder.
2. **Where a person's patterns are kept.**
   - Not yet read against the work item (`AI-Agent-Workspace/Work/scan-leaves-no-trace.md`).
   - One constraint found: they must be handed to the function with the ignore files, before the walk, so they belong wherever the scan's settings are found before anything is listed.
3. **One syntax or two.** The function reads the person's patterns by git's rules today.
   - Git's syntax costs a TFS user `/` against `\`, case, the leading `\` for one folder, and `!` under an excluded folder, which git refuses and TFVC allows.
   - TFVC's syntax lacks `**`, classes and anchoring by a middle slash.
   - Not yet decided or measured further.

## Not done in this leg

- The swap measurement (item 4): the function's kept set against discovery's on this repository and every fixture.
- The made folder of more than a hundred thousand files.
- Timings in a page (a folder given through `webkitdirectory` against a lazy walk).
- Forks 2 and 3 in full.
- Tuning the decide step: it judges each path from the top, 2 to 10 s for about 25,000 paths, and should keep each folder's verdict.

## The scripts

- `record-tfvc-oracle.mjs <oracle folder> <trees folder> <out.json>` records TEE's verdicts. It needs Java and a build of the oracle in `tfvc-oracle/`:
  - `TfIgnoreOracle.java`, a driver that builds `LocalItemExclusionEvaluator` without a server, walks a tree, and prints each file's verdict for the scanner and for `tf add` with the deciding file and line;
  - four compile-only stand-ins for Eclipse types;
  - `build.sh`, which compiles Microsoft's classes unchanged with javac;
  - `make-fixtures.sh`, the twelve trees;
  - `run.sh`.

  To build it, copy the folder outside the repository (the build writes `classes/` beside it), and clone `microsoft/team-explorer-everywhere` at `21e0e598` next to the copy as `team-explorer-everywhere`. Then run `bash build.sh` and `bash make-fixtures.sh`, and pass the copy and its `fixtures/` to the recorder.
- `git-agreement.ts <folder>`: tsx, read only.
- `shown-before-a-scan.ts <folder> [--no-ignore-files] [--starting <file>]`: tsx, read only.
- `starting-lists/` holds the candidate lists; `listings/` holds the printed listings.

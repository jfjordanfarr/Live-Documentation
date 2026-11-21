# What a scan leaves out, decided before it reads: the function and its oracles

Historical evidence, taken on November 21, 2026 by a builder for the root, on branch `page-check`. It records the first leg of building the one function that decides what a scan leaves out, which [the design of one engine with two hosts](../../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) names. The function is `packages/engine/src/tooling/leaveOut.ts`. It is standalone: nothing in discovery calls it yet. **This leg is unfinished**; what is not done is listed at the end.

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

`shown-before-a-scan.ts` prints, by folder, the files, how many are kept, and how many are left out by which rule. The four listings are in `listings/`. The time to list is Node's walk; the time to decide is the function, not yet tuned.

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

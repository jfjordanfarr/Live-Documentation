# What a scan leaves out, decided before it reads: the function and its oracles

Historical evidence, taken on November 21, 2026 by a builder for the root, on branch `page-check`. It records the first leg of building the one function that decides what a scan leaves out, which [the design of one engine with two hosts](../../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) names. The function is `packages/engine/src/tooling/leaveOut.ts`. It is standalone: nothing in discovery calls it yet. **This leg is unfinished**; what is not done is listed at the end.

## Eighth leg, evening of 2026-11-21: one list, the person's, is the truth

The owner, 18:15 UTC: "The list the user sees for ignore patterns is the source of truth for our software, and we can take that in from other ignore patterns as needed." An ignore file found in the folder is offered to "use (replace current ignore pattern in browser window), integrate (add to current ignore pattern in browser window), or ignore". On a committed packages folder: "The user will likely need to make that decision themselves. Might be helpful as they're concocting the ignore pattern for the scan to know what would be ignored so they can tune it on the spot." The layered rules of the earlier legs and the evidence rules applied by default are gone. This section is the first milestone: the function's new shape held to both oracles, and the page's first pictures.

### The function (`packages/engine/src/tooling/leaveOut.ts`)

- **`leaveOut({ list, ignoreCase, ownOutput })`.** The list's text, read as one `.gitignore` at the top of the scanned folder, decides each path, and the verdict names the deciding line (number and text). Two things stand outside the list, shown and never scanned: a version control's own folder and the tool's own output. A folder left out is left out whole, and a `!` line that could have named something inside it is noted.
- **`fromGitignores(files, { folders, ignoreCase })`.** It rewrites a folder's `.gitignore` files as lines of the one list:
  - each line of a nested file gets its folder in front (`sub/docs/*.md`; a name alone becomes `sub/**/name`);
  - anchoring, `!` and a trailing `/` are kept;
  - the files go shallowest first, so that the last matching line is the deepest file's, as git asks the deepest file first;
  - each line carries its origin (file and line), and the page and the oracles trace a verdict back through it.
- **`fromTfignores(files)`.**
  - It writes TFVC's lines in the list's syntax: `\` becomes `/`; a leading separator anchors (`/src/bin`); a name alone becomes `src/**/name`; a folder part is literal; only `*` and `?` are wildcards.
  - Where any file holds a `!`, each exclusion is followed by the same line with `/**`. TFVC leaves out what lies beneath a folder it names even when a `!` keeps the folder itself.
  - Its lines need a list that matches without regard to case.
- **`proposeLines(folders, names, ignoreCase)`.** The evidence rules, turned into proposals.
  - A name alone (`bin/`) is proposed only where it leaves out no folder of that name that the exact lines would keep, and, in a list that matches case, only where every such folder is spelled alike.
  - Otherwise it proposes one anchored line per folder; a folder inside another proposed folder is not named again.
- **Deleted:** the layered decider, the `person` and `evidence` settings, and TFVC's matcher (its behaviour now lives in the translator, held to the same recordings).

### The two oracle comparisons, in full

**Git, with the files in place** (`leaveOut.oracle.test.ts`; `git-agreement.ts` on real folders, recorded in `listings/one-list-git-agreement.json`):

| Folder | Paths | `.gitignore` files | Lines in the one list | Agree | Differ |
| --- | ---: | ---: | ---: | ---: | ---: |
| this repository (the builder's worktree at `a11f7d007`, with `node_modules`, `dist`, `test-results`) | 23,554 | 1 | 46 | 23,554 | 0 |
| DNN (the readers' corpus, a git clone) | 26,227 | 26 | 364 | 26,227 | 0 |
| MediatR (cloned again, shallow and anonymous; no build outputs placed this time, so 270 paths where the second leg had 479) | 270 | 1 | 131 | 270 | 0 |
| the nested made tree, copied into a fresh repository | 23,038 | 25 | 261 | 23,038 | 0 |

The named cases all agree: 17 of them, each asked with `core.ignorecase` false and true. One of the 17 is new this leg: "a nested file whose folder has a twin spelled otherwise".

The generator's 60 random trees found the one difference a flat list cannot remove. A nested file speaks for its own folder alone. A list that matches names without regard to case also reaches a folder spelled otherwise (`build/` beside `Build/.gitignore`). Only a disk that tells case apart can hold both, so on the owner's Windows machines it cannot occur. `fromGitignores` says it whenever it sees such a twin, the test sets those paths apart and requires the sentence, and the page shows it at import.

**TFVC, against the client's recorded verdicts** (`leaveOut.tfvc.test.ts`; counted by `tfvc-agreement.ts` in `listings/one-list-tfvc-agreement.json`):

| Verdicts | Compared | Agree | Differ | Left out whole where `tf add` does not enter | In a version control's own folder | Set apart by a difference the translator says |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 468 | 448 | 447 | 1 | 17 | 1 | 2 |

- **The one difference** is the earlier legs' deliberate one: `b-case docs/y.md`. The recording ran on Linux, where TEE compares a pattern's folder part with regard to case; on Windows it does not, and neither does the list.
- **The difference the translator says:** `x*.`. TFVC lets a final `.` match a name with no extension (`xnoext`, and a folder `a/x` above `a/x/b/c.txt`), and no `.gitignore` line can say "no dot anywhere". The page will say it at import.

### Case: a fork, with a recommendation

- **The question.** TFVC matches names without regard to case. A `.gitignore` matches as the repository's `core.ignorecase` says. The list can have only one setting.
- **Built for the trial:** the list carries one setting, "Names match without case". It starts from what the page remembers; if nothing is remembered, from the folder's `.git/config` when a folder input can read it; otherwise on, as on Windows.
  - Taking in any `.tfignore` turns it on, and the page says so.
  - The command line's twin defaults it on, with `--case` to turn it off.
- **A mixed folder** (a `.gitignore` in a case-sensitive repository beside a `.tfignore`): the setting is on, and the one difference above is said for any twin folder.
- **Recommendation:** keep the one setting, defaulted on. Every folder the owner scans is on Windows, where git's own default is on. The alternative, spelling every letter as a class (`[Bb][Ii][Nn]`) to carry case per line, would make the list unreadable, and readability is its point.

### Lines proposed from what the folders hold (`listings/proposals.json`)

| Folder | Files | Lines proposed | Of which a name alone | Exact | Files they leave out | Files read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| the made folder | 103,329 | 48 | 2 (`bin/`, `obj/`) | 46 (`packages` folders) | 92,400 | 10,929 |
| DNN | 21,719 | 1 | 0 | 1 (its NuGet `Packages/`) | 1 | 21,718 |
| nested | 17,245 | 47 | 2 | 45 | 6,291 | 10,954 |

**How the lines could be written, when there are many** (a fork brought, not decided):
- exact lines, as built, grouped under a comment for each rule;
- a name alone, as built where it is honest;
- a name alone followed by `!` lines for the folders of that name that are not packages. On the made folder that is `packages/` plus one `!` per `packages` folder holding source. It is shorter, but it leaves out any new folder of that name the next day.

My recommendation is grouped exact lines with names alone where they are honest, as built.

### The Visual Studio list

GitHub's `VisualStudio.gitignore` (CC0) is the copy in `starting-lists/`. Its exact source revision was not recorded when it was copied, and is still owed.

On `nested`, the preview shows by kind what its lines leave out:
- `[Ll]og/` leaves out 22 `.cs` files (DNN's `Services/Installer/Log`);
- `**/[Pp]ackages/*` leaves out 11 `.cs` files (DNN's own `Packages`);
- `[Oo]bj/` takes over the 163 `.cs` files in the made `obj` folders from the proposed `obj/` line, because the last matching line decides.

Nothing corrects the person's choice.

### The page, first pictures

What it is now:
- **The list is the truth.** It is editable text, with copy, save as a file (`leave-out.gitignore`), load from a file, empty, and a prefill menu (Visual Studio; "From what the folders hold"). The page remembers it for the next folder where it may.
- **One notice of ignore files found** (for example "Found 25 .gitignore files and 15 .tfignore files, in 3 top folders") with Use, Add and Ignore for all of them. The files themselves are behind a disclosure, each with a checkbox to leave it aside.
- **"Left out", by line.** The line's number and text, what it leaves out in folders and files, the three largest kinds, and a plus that takes the line out of the list. Opened, it lists what the line leaves out, each item with a plus that adds a `!` line.
- **"Will be read"** by folder and by kind, as in the sixth leg, with a minus on each row that adds a line.

The folder tree and the layout switch are gone from the page.

**Pictures** (`choice/screenshots/`, 1,280 by 800, through the folder input; counts beside them in `records/nested-one-list-record.json` and `records/made-one-list-record.json`):
- `nested-one-list-1-first` … `nested-one-list-6-minus`;
- `made-one-list-1-first` … `made-one-list-6-minus`.

The steps of each run, starting from an empty list: the first screen, the notice opened, Use, "From what the folders hold", Visual Studio added, then the minus on `.png` and on `DNN Platform/Tests/`.

| Step | `nested` (17,245 files): read | list lines | made folder (103,329 files): read | list lines |
| --- | ---: | ---: | ---: | ---: |
| The first screen, an empty list | 17,245 | 0 | 103,329 | 0 |
| Use: the 25 `.gitignore` and 15 `.tfignore` files (made: the 15 `.tfignore`) | 15,594 | 311 | 76,899 | 75 |
| From what the folders hold | 10,946 | 358 | 10,929 | 123 |
| Visual Studio added | 10,874 | 592 | 10,857 | 357 |
| Minus on `.png`, then on `DNN Platform/Tests/` | 9,011 | 594 | 8,994 | 359 |

The made folder took 73 s to be handed over at a load near 40; `nested` took 10 s.

**What my eye sees:**
- **The first screen says what the folder holds before anything is left out.** The made folder reads "103,329 files will be read", and under "Will be read" `packages` stands second with 13,201 files and `.dll` first among the kinds with 37,813. That is what the owner asked to see "so they can tune it on the spot". Above, one line: "Found 15 .tfignore files, in 2 top folders", with Use, Add and Ignore.
- **Use folds the notice back to one line** ("Taken into your list: …"). The list fills with each file's lines under a comment naming it, and "Left out" shows each line that left something out, with its number, counts and kinds: `Dnn.AdminExperience/**/[Bb]in` "9 folders · 126 files", ".dll 72 · .config 18 · .pdb 18".
- **Every act shows as a line.** After the two minuses, the list ends `*.png` and `/DNN Platform/Tests/`, and the totals fall by the 1,324 images and the 543 test files.

**Still wrong or missing:**
- The list has no line numbers, while "Left out" names lines by number, so a person counts down the text to find line 354. A numbered gutter is owed.
- "Left out" goes in the list's order. After a long prefill, the Visual Studio lines that leave out real source (`[Ll]og/` with 22 `.cs`) sit far down. A way to bring the lines that leave out code to the eye is owed, without correcting the choice.
- Long anchored lines wrap over two or three lines in the middle column.
- What the translator cannot carry is shown under the notice when it occurs. Neither folder has such a line or a case twin, so it is not pictured.
- The list of files found, opened, fills the screen when there are 40; it should hold its own height.

**Not built yet:**
- **Forks brought:**
  - the name and place of the list file the command line reads, given that a scan leaves no trace in the scanned folder;
  - how the proposals are written when they are many (above).
- **The strangers' leave-out tasks** in `scripts/playtest/tasks.json` assume the sixth leg's page, where build output and packages were left out by default. Their answers must change before any new run (the read task now starts from nothing left out). They are not changed in this milestone.

### Second milestone: the overview by block, the empty list's offers, speed, and code marked

The root's six points on the first milestone, in their order.

1. **`URL.revokeObjectURL` is back.** I had removed a working call to quiet the asset audit, whose CSS `url(` pattern matched the end of `revokeObjectURL(`. That was the wrong mend. The root corrected the audit on the day branch (`0b0751a22`). With the call restored, the audit passes on the built page.
2. **"Left out" is an overview again, by the list's own structure.**
   - **Blocks.** A block runs from a `###` heading to the next one. The page writes a heading for each source it adds: "Taken in from the folder: …", "From what the folders hold: 48 lines", "GitHub's VisualStudio.gitignore (CC0)", and "Yours" for the person's own minus and plus. A person can type a heading too. The lines above the first heading are a block of their own.
   - **One row a block,** largest first, with its folders, files and three largest kinds.
   - **Opened,** a block shows its lines that act, largest first. Each line still names its number and opens to what it leaves out.
   - **A line that leaves nothing out** gets no row; the lines that leave nothing out are counted once at the end.
   - **The list has a numbered gutter** that scrolls with it, so that a row's number can be found in the text.
   - **The plus** on a block takes the block's lines out of the list. On a line, it takes that line out. On a single item, it adds a `!` line to "Yours".
3. **The empty list offers what would fill it.** When no line acts, the list's place holds an offer for each starting list, with what it would do on this folder, counted by the same function before anything is pressed. On the made folder: "What these folders hold: 48 lines · 92,400 files left out". The Visual Studio list gets its own line count and files. The offers go once a line acts, and remain under the tool above the list. Nothing is applied by itself.
4. **Speed** (below, before and after).
5. **The kinds a reader reads are marked.** "Which kinds a reader reads" comes from the engine's own list (`hasReader` in `packages/engine/src/config/liveDocumentationConfig.ts`, which a test holds to the adapters' registry); there is no second list.
   - In a row's kinds, such a kind is set in weight.
   - A block or line that leaves out such files carries a small sign of angle brackets, named "Leaves out N files a reader would read" for a screen reader and on hover.
   - Colour is not used: blue offers, green uses.
6. **Small things.**
   - The notes now stand above the list, where the footer cannot cut them off.
   - A line's text breaks only after a `/`, never inside a name.
   - Each of the five tools above the list shows its name on hover and on keyboard focus: "Add a starting list", "Copy the list", "Save the list as a file", "Load a list from a file", "Empty the list".

**Also done.**
- **The older probes.** `swap.ts`, `shown-before-a-scan.ts`, `decide-bench.mjs` and `drop-walk.mjs` call the layered API and are now marked at their top: each is a record of the third leg, ran against `d99fd0b7f`, and no longer runs against the present function.
- **`record-tfvc-oracle.mjs`** calls no part of the engine. It runs the compiled TFVC oracle, so the engine's change leaves it running as it was; its header says so.
- **The Visual Studio list's source** is recorded in `starting-lists/VisualStudio-ignore.source.txt`. The copy is byte for byte the file at GitHub's `github/gitignore` commit `eeb775f7` (its head on the evening of 2026-11-21). That exact file was introduced by `90e1bba3` (2026-11-09), found with a blobless anonymous clone and `git log --find-object`. The licence is CC0 1.0 Universal.

#### Speed, before and after

**Deciding in Node** (`one-list-bench.ts`):
- The setup is the page's full list on each folder: the folder's own ignore files taken in, the proposed lines and the Visual Studio list.
- Each figure is the median of five runs, on a machine at a load near 40.
- Every verdict is unchanged: the three test files still pass 98 of 98, and four real folders still agree with git on all 73,137 paths. The repository has 23,602 paths since the merge, where the first milestone counted 23,554.

| Folder | List lines | Paths decided | Before | After |
| --- | ---: | ---: | ---: | ---: |
| made (103,329 files) | 357 | 13,333 | 861 ms | 200 ms |
| nested (17,245 files) | 592 | 13,357 | 1,716 ms | 278 ms |

**What changed (engine commit `ccdd6f9be`).** The list is readied once, as git readies its own:
- a name with no wildcard is looked up by a path's last part;
- a whole path with no wildcard is looked up by the path;
- `*` and a plain ending is compared with the last part's end;
- a line that begins with plain folders, as a nested file taken in reads, is asked only of paths beneath them;
- a no-slash line's answer is kept for each name;
- only the rest meet the matcher, from the last line back, and no further than a line already found.

**On the page:**
- An edit waits for a 400 ms pause in typing.
- The page says "…" at once and "Deciding…" while it walks.
- The walk hands the thread back every 20 folders.
- The thread is handed back after 30 ms of work, not every 20 folders. A browser holds each pause to at least 4 ms, so the per-folder pauses had cost more than the deciding: before the change, an edit on `nested` took 1,960 ms to show, 876 of them walking.

**From an edit to its drawn answer,** timed in the page from the input event to the end of drawing, the 400 ms pause included. The edit is one line added to the full list; the processor is then slowed four times and held to two cores by the browser's own emulation.

| Folder | Full speed: shown after | of it, deciding | walk in all | drawing | Slowed: shown after | of it, deciding | walk in all | drawing |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| nested | 679 ms | 218 ms | 255 ms | (not timed then) | 3,009 ms | 1,011 ms | 1,316 ms | (not timed then) |
| made | 715 ms | 194 ms | 286 ms | 31 ms | 8,684 ms | 743 ms | 1,241 ms | 126 ms |

**What the slowed made folder says.** At four times slower, the page's own code accounts for under 2 s of the 8.7 s: the pause, the walk with its deciding, and the drawing. The rest falls between the page's tasks: the browser's own work in the pauses the walk takes, under the emulated throttle. I have not localized it, and it is unfinished. At full speed an edit shows in under three-quarters of a second on both folders.

#### The second milestone's pictures

These were taken at 1,280 by 800 through the folder input (`choice/screenshots/`, counts in `records/nested-blocks-record.json` and `records/made-blocks-record.json`). Each run goes: the first screen with its offers; the offer of what the folders hold taken; the ignore files found added; GitHub's Visual Studio list added and its block opened; the minus on `.png` and on `DNN Platform/Tests/`; a list tool's name on keyboard focus.

**Look at these first:**
1. `made-blocks-1-first.png`: the empty list's offers on the made folder, "What these folders hold: 48 lines · 92,400 files left out" and "GitHub's Visual Studio list: 234 lines · 92,472 files left out", with the notice of 15 `.tfignore` files above.
2. `nested-blocks-4-visual-studio-opened.png`: the blocks, largest first, and the Visual Studio block opened. Its lines that leave out code are marked: `[Oo]bj/` with **.cs 163**, `[Dd]ebug/` with **.js 27**, `[Ll]og/` with **.cs 22**, `**/[Pp]ackages/*` with **.cs 11**, each with the angle-bracket sign.
3. `nested-blocks-5-minus.png`: the list's end in the gutter's numbers, `### Yours`, `*.png`, `/DNN Platform/Tests/`, and the block "Yours" in "Left out" with **.cs 369**.

| Step | nested: read | made: read |
| --- | ---: | ---: |
| The first screen | 17,245 | 103,329 |
| What these folders hold | 10,954 | 10,929 |
| The ignore files found, added | 10,946 | 10,929 |
| Visual Studio list added | 10,874 | 10,857 |
| Minus on `.png` and `DNN Platform/Tests/` | 9,011 | 8,994 |

**What my eye sees.** "Left out" is an overview again: on `nested`, three blocks after the Visual Studio list, four after the minuses, each one row with its counts, kinds and the code sign where it applies.
- **Code shows.** The `.cs` in a row reads heavier than the `.dll` beside it. The code sign says how many files a reader would have read: 458, 169 and 306 on `nested` across three blocks.
- **The empty list explains itself.**
- **The tools' names show on focus,** as a small label under the icon.

**Still wrong:**
- A block's title wraps over two lines in the middle column.
- Three kinds with their counts sometimes wrap.
- The one note left above the list still takes three lines.
- The slowed made folder is slow for a reason not yet found (above).

#### The command line's list: where it lives (a fork for the owner)

The page saves the list as `leave-out.gitignore`, and the command line reads the same text. A scan leaves no trace in the scanned folder. Three places it could live:

1. **The person's own settings folder, outside every scanned folder.** For example `%APPDATA%\live-documentation\lists\<name>.gitignore`, chosen with `--list <name or path>`.
   - No trace in the scanned folder, ever.
   - The list does not travel with the folder: a colleague, or the same person on another machine, starts again unless the file is passed along.
   - The page's saved file lands where the browser saves, and the person moves it.
2. **Beside the tool's own output** (`.live-documentation/leave-out.gitignore`, where the output goes).
   - The next scan finds it without being told.
   - Where the output is configured to live inside the scanned folder, the scan already writes there, so this adds one file to an existing trace. Where the output lives elsewhere, there is no trace.
   - It is versioned with the docs if they are.
3. **Named in the repository's own configuration** (`.live-docs.config.json`, by path or with the lines in it).
   - It travels with the repository and is reviewed like code.
   - It is a trace the person chooses to commit, and a TFS folder without the configuration has none.

My reading: 1 keeps the rule "a scan leaves no trace" without exception. 2 is the most convenient where an output folder already exists. 3 suits a team. This is the owner's choice.

#### The strangers' tasks: what would change (`scripts/playtest/tasks.json`, left alone)

- **The parameters.** `?layout=reason|folders&switch=off` no longer mean anything: the page has one screen and no switch.
- **read.**
  - Nothing is left out until the person chooses: the strangers' `Source` reads 17,244 files on the first screen, with the notice of 25 `.gitignore` and 15 `.tfignore` files found.
  - The old answer (10,945 read, build output and NuGet packages as the reasons) is what the list gives only after the offer "What these folders hold" is taken.
- **keep.** `DNN Platform/Library/packages` is read by default. The task makes sense only after the proposals are taken, when its plus adds `!/DNN Platform/Library/packages/` to "Yours".
- **drop.** The minus on `DNN Platform/Tests` adds `/DNN Platform/Tests/`. The count depends on what the list already leaves out (for example 17,244 − 900 on an empty list).
- **why.** `Dnn.AdminExperience/EditBar/Dnn.EditBar.UI/bin` is read until a line leaves it out. After Use or Add it is left out by the line taken from `Dnn.AdminExperience/.gitignore` (`[Bb]in`); after the proposals, by `bin/`.

## Sixth leg, later on 2026-11-21: one layout, symmetric

Forty blind runs on the fifth leg's page settled which layout serves ([the strangers' record](../blind-playtests/README.md#the-choice-before-a-scan-tried-on-strangers)). By reason got 16 of 16 right. "What is left out and why" was answered from the first picture, and the quiet plus was found by four of four. The tree's read tasks all fell short, because its rows count folders, never files.

They also misread two things:
- Every tester took "Leave out build output and packages" for *the* reason things are left out. One unticked it to keep one folder and got the wrong count.
- "Also ignored by .gitignore: 28 of 162" told no one which line names a folder.

By reason had one gap: to leave something out, every tester typed its path. The root's design for this leg: By reason is the screen, and the tree's one advantage, leaving something out by pointing at it, moves into its right column. The function is not touched in this leg.

### Link parameters, now

| Parameter | Effect |
| --- | --- |
| none | The screen: By reason, with no layout switch. |
| `?layout=folders` | The folder tree, kept unchanged for the owner's eye. |
| `&switch=on` | Draws the switch between the two layouts. `&switch=off`, which the strangers' tasks name, is still accepted and changes nothing. |
| `&boxes=choice` or `&boxes=mixed` | The tree's two kinds of box, as before. |

### What changed

1. **"Will be read" answers as "Left out" does.**
   - *By folder:* each folder opens on demand to its own folders and a row for the files at its level, 50 at a time, with the rest counted. Each row has a quiet control to leave it out, an icon (a minus, the plus's opposite) with the accessible name and tooltip "Leave out <path>". A folder's control writes `/a/b/`, as the tree's box did. The files at a level are left out as one choice, with one pattern per file (git's patterns cannot name a level's files without its folders).
   - *By kind:* each kind has the same control, which writes `*.png`. It shows twelve kinds at first, then "60 more not shown: show 50".
   - What a person leaves out this way appears on the left as a reason of its own ("Your pattern: /DNN Platform/Tests/", "Left out by you: the 29 files in the top folder"). The Keep on that reason takes the choice back, rather than adding a `!`.
2. **The switch is gone.** The page always applies the evidence rules, the function's `evidence.apply` setting, held at true by the page; the person has no control over it. A person keeps build output or packages back with the worded Keep on "Build output beside a project" or "NuGet packages". That Keep writes one `!` per folder and is listed as one choice. The terminal twin lost `--offered` and its "Would also leave out" list for the same reason.
3. **An ignore file's line, where the folder is.** On an opened reason, a folder that an ignore file also names shows the file, line and words beneath its path, in the quiet colour: "Also Dnn.AdminExperience/.gitignore, line 53: [Bb]in". The count on the reason ("Also ignored by .gitignore: 28 of 128") stays, now without the tooltip.
4. **From the fifth leg's list of what was still wrong:**
   - "Your patterns" lists one row per choice. A choice of many patterns says what it named ("the 29 files in the top folder", "Build output beside a project, 162 folders"), with its patterns in a tooltip, and is removed as one.
   - A project's `bin` and `obj` are one row, "Dnn.AuthServices.Jwt/ obj/ bin/", with one Keep that writes both patterns.
   - The notes sit under "Your patterns", next to the patterns they are about, and no longer push the lists down.
5. **The tree** is unchanged and reached by `?layout=folders`. Its box and its files row write the same kind of choices, so "Your patterns" lists them the same way.
6. **The terminal twin** prints, under a folder alone under its top folder, the ignore file's line that also names it. Its help line says how to leave out a folder or a kind.

### The pictures

These are in `choice/screenshots/`, at 1,280 by 800, taken through the folder input on `nested`. That folder is made by the strangers' recipe (`../blind-playtests/make-leave-out-folder.mjs`) from the same DNN corpus as the made folder: 17,245 files, with DNN's nested `.gitignore` files and fifteen `.tfignore` files. It holds one file more than the strangers' `Source`, so it reads 10,946 where they read 10,945.

**What was not pictured.**
- **The made folder (103,329 files).** Its run and a second run on `nested` queued in the browser lane at 09:01 and were still waiting behind two other holders at 09:28. I stopped them so that I could hand back within the hour.
- **The last four changes.** The pictures are from the build of 08:58, which came before them:
  - By folder now comes before By kind;
  - an ignore file in the row's own folder is called "this folder's .gitignore" rather than by its full path, and its lines are given once;
  - a project's folders are sorted ("bin/ obj/");
  - a labelled choice says "left out".
- **The counts.** The pictures' counts are the same on the present build, because those changes touch only wording and order.

| Step | Picture |
| --- | --- |
| The first screen | `nested-6-1-first.png` |
| `DNN Platform` opened under "Will be read" | `nested-6-2-read-folder-opened.png` |
| `DNN Platform/Tests/` left out by its control, and the left column after | `nested-6-3-folder-left-out.png` |
| `.png` left out, and the left column after | `nested-6-4-kind-left-out.png` |
| An opened folder with its ignore file's lines | `nested-6-5-ignore-line.png` |
| Three choices, the files at the top as one entry | `nested-6-6-three-choices.png` |

**What was counted:** 10,946 read and 6,299 left out at first, under four reasons, with no switch drawn. Each step below starts from the one before:

| Step | Read |
| --- | --- |
| Leave out `DNN Platform/Tests/` by its control | 10,403 (543 fewer; the strangers' `drop` answer). "Your pattern: /DNN Platform/Tests/ · 1 folder · 900 files" appears on the left, and build output drops from 162 to 128 folders |
| Leave out `.png` | 9,079 (1,324 fewer) |
| Leave out the 28 files at the top | 9,051, listed as one entry, "the 28 files in the top folder" |
| Keep on "Your pattern: *.png" | 10,375, the choice taken back; two entries remain |

**What my eye says:**

- **The first screen answers both questions side by side.**
  - On the left are four reasons: build output, NuGet packages, and two of DNN's own lines.
  - On the right, every kind and every folder has a minus beside its count, as quiet as the plus on the left.
  - No switch is drawn above, only the totals and Scan.
- **Leaving a folder out is pointing at it,** as it was in the tree. `DNN Platform` opens to its folders, largest first, each with the count of files that will be read. The minus on `Tests/` drops the total by 543. The left column gains "Your pattern: /DNN Platform/Tests/" with its Keep, and build output drops to 128 folders, since 34 of them were inside `Tests`.
- **A kind is one press.** `.png` leaves the kinds list and stands on the left with its 1,324 files. Its Keep takes the choice back: the total returns and the entry leaves "Your patterns".
- **An ignore file's lines are on the folder's row.** Under "Modules/Samples/Dnn.ContactList.Spa/ obj/ bin/", one row for the project's two folders, stands the file and its two lines. In the picture they read "Also DNN Platform/Modules/Samples/Dnn.ContactList.Spa/.gitignore, line 2: obj/ · Also … line 1: bin/". That wraps to three lines and repeats the row's path, which is what the last build shortens to "Also this folder's .gitignore, line 1: bin/ · line 2: obj/".
- **"Your patterns"** lists the three choices as three rows; the 28 files at the top are one of them.
- **Still wrong or heavy:**
  - In the pictures, By kind fills the first screen and By folder starts below the fold. The last build puts By folder first, but an opened folder still makes the right column long.
  - The minus appears on every row, a column of identical glyphs: quiet, but it repeats down the whole list.
  - The tree behind `?layout=folders` was not looked at in this leg.

### The final build pictured, and two mends the pictures asked for

These were taken after the leg was merged, at 1,280 by 800, through the lane:
- on `nested` and on the made folder, both made again from the same recipes;
- each run's record is kept under its own name in `choice/screenshots/records/` (`nested-7-reason-record.json`, `nested-8-…`, `made-7-…`, `made-8-…`);
- handing the made folder over took 197 s at a load near 40.

**On the sixth leg's final build** (`nested-7-*`, `made-7-*`):
- **The ignore line is short where the file is in the row's own folder.** For example, "Also this folder's .gitignore, line 1: bin/ · line 2: obj/" stands on one line under "Modules/Samples/Dnn.ContactList.Spa/ bin/ obj/" (`nested-7-5-ignore-line.png`).
- **By folder comes first.** Its eight top rows and the first kinds fit the first screen (`nested-7-1-first.png`, `made-7-1-first.png`).
- **Nothing is cut or colliding at 1,280 by 800.** The longest folder name on the right, "DotNetNuke.Web.Client.ResourceManager/", wraps inside its row, and the last pattern ends at 750 px above the footer's 775 px. The counts match the sixth leg's: `nested` 10,946, then 10,403, 9,079, 9,051, and 10,375 after the Keep on `*.png`. The made folder goes 10,929, then 10,386, 9,062, 9,034, and 10,358.

**Two faults the pictures showed, each mended on the page:**

1. **An opened folder on the right took the left column out of view.**
   - With `DNN Platform` open, the page is 1,701 px tall in a 720 px window, and the left column ends at 389 px. Scrolled down the right to leave something out, a person no longer sees it arrive on the left. Only the totals, which stay in view, change (`made-7-6-three-choices.png`, `nested-7-6-three-choices.png`: the left column is gone).
   - The left column now stays in view below the totals while the page scrolls. When the left is itself longer than the window (an opened reason), it scrolls on its own.
   - After: scrolled 700 px down the right, "Your pattern: /DNN Platform/Tests/" is in view on the left (`nested-8-3b-scrolled-down-the-right.png`, `made-8-3b-scrolled-down-the-right.png`; `leftInViewScrolled: true` in both records). Scrolled to the end with three choices, the left column stands above "Your patterns" (`nested-8-6-three-choices.png`, `made-8-6-three-choices.png`).
   - What I see: the left keeps its place and the right moves under the totals. With an opened reason, the left shows its own scrolled part (`nested-8-5-ignore-line.png`), and the window's edge cuts a row in half, as any scrolling list does.
2. **The ignore line was short only for `bin` and `obj`.**
   - On a `packages` row, the `.tfignore` sits in the project folder that holds it. It was named by its full path, which repeated the row's: "Also DNN Platform/Controls/CountryListBox/.tfignore, line 6: packages" under "Controls/CountryListBox/packages/" (`made-7-5-ignore-line.png`).
   - It now reads "Also the .tfignore beside it, line 6: packages" (`made-8-5-ignore-line.png`).
   - The terminal twin says the same.

## Fifth leg, later on 2026-11-21: the trial page's drawing mended before strangers see it

The root's brief listed eight faults in the fourth leg's page; two more came from a stranger's pilot runs on the playtests' builder's own folder. Each mend below has a picture before and after, at 1,280 by 800, through the folder input (`choice/screenshots/`). Two faults in `leaveOut` came to light in the pictures; each was mended after a failing test.

### Link parameters

| Parameter | Effect |
| --- | --- |
| `?layout=reason` | Opens by reason (the default). |
| `?layout=folders` | Opens on the folder tree. |
| `&switch=off` | Hides the switch between the layouts, so a stranger sees one. |
| `&boxes=choice` | The tree's alternative boxes (below); `&boxes=mixed`, or nothing, is the present kind. |

For example, `choice.html?layout=folders&switch=off&boxes=choice`. The folder input, `#folder-input`, stays in the page under every parameter, so automation can hand it a folder.

### What the fifth leg changed

1. **An opened reason is no longer a wall.**
   - The reason's own row keeps the one Keep with a word.
   - Opened, its folders stand under their top folders, with counts, each opened on demand. A top folder with only one member shows that member on its own row.
   - Each folder row has a quiet Keep: an icon alone, muted until the row is pointed at or the button has the focus. It is a button, so Tab reaches it, and its accessible name and tooltip are "Keep" and the path.
   - Fifty rows are drawn at a time, and the rest are counted: "84 more not shown: show 50".
   - The Keep icon is now a plus, not a tick. A tick beside something left out reads as "read", which is what the tree's ticked box means.
2. **One thing is shown once.** A folder that an ignore file leaves out and that the evidence rules also recognise stands under the plain reason for what it is. The ignore file is a quieter line beneath that reason, counted by the kind of file ("Also ignored by .gitignore: 117 of 162"), with its patterns in the tooltip.
   - On the made folder, the separate "`.tfignore`: packages" row of 15 folders is gone; "NuGet packages" holds all 46 and says "Also ignored by .tfignore: 15 of 46".
   - On a copy of the made folder holding DNN's 26 nested `.gitignore` files, `[Oo]bj`, `[Bb]in`, `bin/`, `obj/` and four more patterns would each have had a row. They are now one line under "Build output beside a project". The lines that leave out what evidence does not recognise (`/*/css/*.css`, `*.de-DE.resx`, `/Build/Tools/`) keep their own rows.
   - **The Keep of such a folder did not keep it,** a fault in `leaveOut`. A `.tfignore` entry matches any folder of a path, as TFVC's does. So `!/…/GoogleAnalytics/packages/` kept the folder, but its 80 package folders and its `repositories.config` came back as "Ignored by .tfignore: packages".
     - The mend: a person's `!` on a folder takes away an entry's match on that folder's name, or on a name above it, for what it holds. A test came first.
     - After the mend, keeping that folder takes the files read from 10,929 to 12,610, which is 1,681 of its 1,761. The other 80 are `.nupkg` files, left out by the same `.tfignore`'s `*.nupkg` line, which names them by their own name. They show as a row of their own.
3. **Words in a person's voice.**
   - "Ignored by .gitignore: .vscode/".
   - A note reads "Your pattern !/Build/Tools/ cannot keep anything in Build/, which is left out whole." An ignore file's note names its line: "… (line 103 of .gitignore) …".
   - The totals say "left out" only when something is, and "N folders left out, not looked inside" only after a lazy walk, and only when N is not zero.
   - "(top)" is now "At the top". "and 60 mores" is now "and 60 more".
   - **A second fault in `leaveOut` that the words exposed.** On the copy with DNN's nested files, seven notes said that lines like `!DNN [Pp]latform/[Cc]omponents` "cannot keep anything in …/bin/ or 176 more folders". The function read a pattern only as far as its first `[`. It now compares the pattern part by part with the folder, as git would match it, and those notes are gone. A test came first.
4. **The files at a level are a row of their own.** The row reads "29 files here" and comes after that level's folders. It has a box, ticked, clear or mixed, which Space or a click changes.
   - Leaving the row out writes one pattern per file (`/README.md`, …). Keeping it writes `!` per file that is left out.
   - Git's patterns cannot name a level's files without its folders: `/*` with `!/*/` would also keep, as the person's own, every folder there that build output, packages or an ignore file left out.
   - The cost is a long list of patterns: leaving out the 29 files at the top adds 29 lines.
5. **The tree's alternative boxes** (`&boxes=choice`).
   - A folder's box shows the person's own choice. It is mixed only for what they or their ignore files left out beneath it.
   - What the starting rules left out is a quiet count beside it: "3 build or package folders left out".
   - A folder left out itself is clear, whichever rule left it out, since a tick there would say it is read.
6. **The footer.** The header and the footer hold their places and the page between them scrolls, so nothing sits under either. With three patterns added, the last pattern's bottom is at 750 px and the footer's top at 775 px.
7. **The totals stay in view.** The totals line, the evidence switch and Scan stick to the top of the scrolling page. This came from a stranger who ticked a folder deep in the tree and scrolled back up to read the sum.
8. **The terminal twin** uses the same words.
   - It prints each reason's folders under their top folders, and the ignore files that also name them, with their patterns, since a terminal has no tooltip.
   - Its output is in `choice/made-as-text.txt` and `choice/made-with-nested-as-text.txt`.

### The fifth leg's pictures

`choice/look.mjs` takes them, and can take its three pages in three holds of the browser lane, since the browser takes about 65 s to hand over each made folder. What it counted beside each picture is in `choice/screenshots/records/`. The made folder holds 103,329 files; the copy with DNN's nested `.gitignore` files is made by putting those 26 files back into a copy of it.

| Fault | Before | After |
| --- | --- | --- |
| An opened reason | `made-2-group-opened.png` | `made-after-2-reason-opened.png`, `made-after-3-top-opened.png` (a quiet Keep with the keyboard's focus) |
| One thing shown as two | `made-1-by-reason.png` | `made-after-1-by-reason.png`, `nested-after-1-by-reason.png` |
| Keep of a merged folder | (no picture; 80 folders came back) | `made-after-4-merged-kept.png` |
| Words | `made-1-by-reason.png`, `dnn-4-pattern-added.png` | `made-after-1-by-reason.png`, `nested-after-1-by-reason.png`; the note's new words are in the records, not pictured |
| Files at a level | `made-5-tree-focus.png` | `made-after-6-tree-mixed.png`, `made-after-7-loose-left-out.png` |
| The tree's boxes | `made-5-tree-focus.png` | `made-after-6-tree-mixed.png` beside `made-after-6-tree-choice.png` |
| The footer | `made-before-5-three-patterns.png`, `dnn-4-pattern-added.png` | `made-after-5-three-patterns.png` |
| Totals in view | (the stranger's pilot) | `made-after-6-tree-mixed-scrolled.png`, `made-after-6-tree-choice-scrolled.png` |

**What my eye says:**

- **By reason now fits on one screen.** The made folder shows two reasons. The copy with nested files shows seven: build output, NuGet packages, and five lines of DNN's own that leave out what evidence does not recognise. Before, it would have had eight more `.gitignore` rows for `bin` and `obj`.
- **An opened reason reads as a table of contents:** five top folders with counts. Opening "DNN Platform/" draws 50 of its 134 rows, then "84 more not shown: show 50". The plus is quiet and turns blue on the row that is pointed at. With the keyboard's focus it has a clear blue ring (`made-after-3-top-opened.png`).
- **A Keep's effect is visible at once.** Keeping the GoogleAnalytics `packages` folder takes the total to 12,610. NuGet packages drops to 45, the ".tfignore" line to 14 of 45, and the 80 `.nupkg` files appear under their own `.tfignore` line.
- **The totals stay put** while the tree scrolls beneath them, and the footer never covers anything.
- **The two kinds of box, side by side.**
  - Present: on the made folder nearly every project folder is half-ticked, for its own `bin` and `obj`, so the half-tick says nothing a person did.
  - Alternative: every folder is ticked, and only a quiet "3 build or package folders left out" says what the starting rules took.
  - Leaving out the 29 files at the top clears that row's box and drops the total to 10,900.
- **Still wrong or heavy:**
  - "3 build or package folders left out" repeated on forty rows is a lot of our own text. A quiet number, with the words in a tooltip, would do.
  - Under "Build output beside a project", each project gives two rows, `bin` and `obj`. One row per project would halve the list.
  - Leaving out the files at a level writes one pattern per file, so "Your patterns" grows by 29 lines. That list should show them as one entry, removable together.
  - Notes sit above both layouts. When there are several, they push the lists down.
  - The lazy walk (Pick, Drop here) is not pictured, since automation cannot press the picker. So "left out, not looked inside" has not been seen on screen. Tooltips are not pictured either.

**Which boxes I would keep: the alternative.** A box is the person's control, so it should show their decision. In the present boxes, the half-tick on nearly every project reports the starting rules, which the person never touched, so a half-tick that matters cannot be told from the rest. In the alternative, a half-tick appears only where the person or their own ignore file left something out beneath. That answers "what did I change, and where". What the starting rules took is still on the row as a count.

The cost: a ticked folder no longer promises that every file beneath it is read, and the count beside it has to say so. The strangers can settle it, since `&boxes=` switches between the two.

## Fourth leg, later on 2026-11-21: the choice before a scan, as a trial page

A trial page, not the product: `choice/choice.html` is one file, opened from disk. Its build is `choice/build.mjs`; its source is `choice/page.html`, `choice/page.mjs` and `choice/model.mjs`.

- **Policy.** One script admitted by its hash, no network (`default-src 'none'`), and listeners rather than inline handlers.
- **What it holds.** The engine's `leaveOut`.
- **What it reads.** Names, the text of ignore files, and `.git/config` for `core.ignorecase`. Nothing leaves the machine.

### What it does

- **Giving it a folder,** three ways, each an icon and one word:
  - **Pick:** a directory handle, walked lazily, so a folder left out is never listed.
  - **Drop here:** the same handle, where the browser gives one.
  - **Choose:** `<input webkitdirectory>`. The browser lists everything first. Automation and the other browsers can use it.
- **While it walks,** it hands the thread back every 20 folders and says how many it has listed.
- **The timings line** at the bottom: how the folder was walked, the listings, and listing and deciding time. A person who picks or drops a folder there times the first lazy walk.
- **By reason** (a summary with its exceptions):
  - one line of totals;
  - what is left out, grouped by its reason in plain words: "Build output beside a project", "NuGet packages", "Node packages", "`.tfignore`: packages", "`.gitignore`: .vscode/", "The tool's own output", "Version control's own folder", "Your pattern: …". Largest first, with how many folders and files ("not looked inside" where nothing was listed). Each row has a Keep control, and opens to its folders, each with its own Keep;
  - what will be read, by kind and by top folder.
- **Folders** (the tri-state tree):
  - each row is a folder: its name, how many files it keeps and leaves out, a box ticked, empty or mixed, and beside a row left out its reason;
  - only opened rows are drawn;
  - one tab stop, with the arrow keys, Home and End inside it; Space ticks a box and Enter opens a row;
  - ticking a folder left out adds a pattern of the person's own (`!/path/`) and walks it then.
- **In both:**
  - a field for a pattern of one's own, read by git's rules without regard to case, with the person's patterns listed and each removable;
  - the evidence switch, applied to begin with;
  - the notes beside `!` lines that may name files inside folders left out whole;
  - **Scan**, which in this trial only says how many files it would read.

### A change the function needed

The page's first pictures showed DNN's nested `.gitignore` files having no effect on the first walk; they took effect only after a change was made.

- **The cause, in `leaveOut`.** It asked for a folder's own ignore files when the folder was decided. A lazy walk lists a folder, and reads its ignore files, only after deciding it.
- **The mend.** A folder's ignore files are now asked for when something inside it is decided.
- **The test.** A case in `leaveOut.test.ts` holds that order: deciding a folder does not ask for its files, and deciding a file inside it does.
- **What else this touched.** The Node probes of the earlier legs listed folders on demand, so this did not touch their numbers. The never-run `drop-walk.mjs` had the same order.

### The pictures (`choice/screenshots/`, 1,280 by 800, through the folder input)

**Clean DNN** (10,941 files, its own `.gitignore` files):
- 10,915 files will be read and 26 left out;
- handed over and decided in 6.2 s, deciding 344 ms;
- keeping `Build/Tools/` makes it 13 left out;
- the pattern `Build/` makes it 108.

**The made folder** (103,329 files):
- 10,929 files will be read, 92,400 left out;
- handed over in about 71 s, the browser's listing of everything before the page sees anything;
- the walk over what was handed took 2.7 s in all: listing 266 ms, deciding 38 ms, and the rest the walk handing the thread back every 20 folders;
- before a fault of the page's own was mended it took 12.7 s: it counted the files beneath each left-out folder by scanning the whole list.

**What my eye says:**

- **The by-reason list answers "why is this left out" at a glance.** Each row says its reason in the person's terms, with counts. Its Keep sits beside the reason, so "how do I keep it" is answered in the same place.
  - Opened, a group of 162 folders draws a Keep on every row, which is heavy. One Keep for the group and a quieter control per folder would read better.
- **The tree answers "what about this folder"** better than "why". The reason shows only on rows left out, at the right edge, after the counts. On the made folder nearly every project reads "mixed", because each holds a `bin` and an `obj` that evidence leaves out, so the tick tells little until a row is opened.
- **The keyboard's focus in the tree** is a clear blue ring around the whole row (`made-5-tree-focus.png`).
- **"0 folders not looked inside"** after the folder input is true, since the browser listed everything, but the phrase belongs to a lazy walk. With the input, the counts of what lies inside are known and shown instead.
- **The drop target** was first drawn grey and dashed, like a disabled button. It is now drawn in the offered blue, and says "Drop here".
- **Where a person would not know what a row means:** `.gitignore: .vscode/` assumes they know what a `.gitignore` is. The reason could read "Ignored by .gitignore" with the pattern after it. Not changed.
- **What the page hides:** the files in the top folder (`(top)`) appear only in the counts; the tree lists folders, not files.
- **What I cannot judge for the owner:** which layout a stranger understands faster. That is the strangers' question.

### The same choice as text

`choice/as-text.ts` prints, for a folder, the totals, what is left out by reason with its folders, and what will be read by kind and by folder. It uses the same model, walked lazily over the disk. Its output for the made folder is `choice/made-as-text.txt`: 2,300 folders listed in 0.36 s. No command was added to the product.

## Third leg, later on 2026-11-21: the starting list decided, the swap, and a dropped folder

### The starting list, decided: the evidence rules, and no list of names

The second leg's tables below decided it. On clean DNN read as a TFS folder, every list that goes by a folder's name left out real source:

- the fixed list, 12 files;
- the Visual Studio list, 63;
- TFVC's 56 defaults, 29;
- the evidence rules, 1 (NuGet's own `Packages/repositories.config`).

The lists also kept wildly different amounts. So, by the root's ruling, the starting list is the evidence rules. The function takes no list of names any more. The three lists stay in `starting-lists/` and `listings/` as what was measured and why they lost.

**Evidence now applies everywhere,** beneath a `.tfignore` and a `.gitignore` alike, since what a folder is holds beneath any ignore file. Only a person's own `!` keeps what it would leave out. It is one setting of the input, `evidence: { names, apply }`: applied, or reported on the folder's answer (`evidence`) and not applied.

On the made folder, with evidence applied everywhere (`listings/made-evidence-applied-everywhere.txt`):

- 10,929 kept, 92,400 left out;
- **made output wrongly kept: 0 of 92,399**, where it was 313 when the rules stood off beneath a `.tfignore`;
- real source wrongly left out: 1, NuGet's `Packages/repositories.config`;
- the walk listed 13,390 entries, and the evidence rules listed 114 folders more;
- walk and decide: 0.23 s.

### A version control's own folder is never scanned

The rule kind is `version control`: `.git`, `.hg`, `.svn`, and TFVC's `$tf`, `.tf`, `$tf1` to `$tf15` and `.tf1` to `.tf15`, which are TFVC's baseline folders (`BaselineFolder.java`). It covers a file named `.git` too, the pointer a worktree or a submodule holds, which the swap found. In TEE's recording, `e-defaults` holds a `.git/HEAD` that TEE judges like any file on Linux; the TFVC test now holds it to this rule and says so.

### Evidence in a git repository: applied or offered

This question is for the owner. The swap below, both ways, found **nothing** that the evidence rules would leave out of this repository or of any of the 45 fixtures that discovery keeps today:

- in this repository, `node_modules` is ignored by `.gitignore`;
- no fixture commits a `packages`, `node_modules` or `bin`.

The case does exist in a real git repository: DNN commits a `Packages/` folder holding `repositories.config` (one file), which evidence would leave out. No measured repository has committed packages in bulk.

### The swap: the function against today's discovery

`swap.ts` compares today's discovery (`discoverTargetFiles` and `discoverDocuments`: glob, git's word through `gitIgnored.ts`, the configuration's exclusions and its rules by name) with a lazy walk using `leaveOut`. It runs on this repository and on a copy of every fixture outside any repository, with evidence applied and with it reported. The full output is `swap.txt`.

**All 45 fixtures, both ways: 0 differences.**

**This repository** (my worktree): discovery keeps 1,231 files and the function 7,640, with the same 6,413 differences both ways:

| Files | Kept by | Cause |
| ---: | --- | --- |
| 6,408 | the function | the configuration's `exclude` (`AI-Agent-Workspace/**`), which is discovery's and was not handed to the function |
| 3 | the function | lock files, which discovery leaves out by name (`package-lock.json`, two `devcontainer-lock.json`) |
| 1 | discovery | `.vscode/settings.json`: `.gitignore` line 18 `/.vscode/` leaves it out, but git tracks the file, which a listing cannot know |
| 1 | discovery | `packages/explorer/src/shared/d3-force-3d.d.ts`: line 35 `packages/**/src/**/*.d.ts`, the same case |

A first run found a fourth cause: the worktree's own `.git` pointer file, kept by the function. That led to the rule above, after which it no longer differs.

**What swapping the function in would need:**

- discovery's rules by name (lock files, documents, the docs root) and the configuration's `exclude` handed in beside it;
- git's word kept for tracked files, which the Node host can ask and a page cannot.

### A dropped folder, walked lazily

`drop-walk.mjs` makes a drop with the browser's debugging protocol (`Input.dispatchDragEvent`, its data a list of paths), asks the dropped item for a handle (`getAsFileSystemHandle()`), and walks it. Each folder is decided by the function before it is entered; the evidence names are listed one level further where the rules ask.

The result is the paragraph below.

**It does not work in this headless Chromium** (Playwright 1.61.1), so the lazy walk stays untimed until a person drops or picks a folder. Each run was made through the lane, at a load of 3 to 10. Where it stops:

- **The made folder (103,329 files).** `dragEnter`, `dragOver` and `drop` were sent, and no `drop` event reached the page within 10 s. The next run, slowed, hung in a call to the protocol until the lane's cap ended it.
- **A folder of three files.** The page's renderer crashed ("Target crashed") before the `drop` event was seen.
- **Clean DNN (10,941 files).** The protocol call hung until the `timeout` round it ended it at 170 s.

So a drop made by the protocol, with a folder's path as its drag data, never reached `getAsFileSystemHandle()` here. Whether it would with a newer browser, or headed, is not known.

**What a dropped folder would mean for a person.** It is a second way to give a folder, with no dialog: they drag it from Explorer onto the page. In Chromium the dropped item can give a `FileSystemDirectoryHandle`, the same kind of handle the picker gives. So the page could walk it lazily, leaving `packages` unlisted, where `<input webkitdirectory>` lists everything first (the 73 s of the second leg). Writing beside the code would still ask the person's leave, as with the picker. Measured here: nothing of this. It is the browser's documented behaviour, to be tried by a person.

### More evidence, proposed and not built

| Ecosystem | Folder | The mark that makes it evidence | Listings it costs | A public repository to measure it on |
| --- | --- | --- | --- | --- |
| Python | a virtual environment, whatever its name (`.venv`, `venv`, `env`) | it holds `pyvenv.cfg`, which `venv` and virtualenv write | the folder's own names: one | any Python project with a made environment, e.g. `pallets/flask` |
| Rust | `target` | it holds `CACHEDIR.TAG`, which cargo writes, and stands beside `Cargo.toml` | one, and the parent's names, already listed | `BurntSushi/ripgrep` |
| Go | `vendor` | it holds `modules.txt`, which `go mod vendor` writes, beside `go.mod` | one | `kubernetes/kubernetes`, which commits its `vendor` |
| Maven | `target` | beside `pom.xml` | none: the parent's names | `apache/commons-lang` |
| Gradle | `build` and `.gradle` | beside `build.gradle`, `build.gradle.kts` or `settings.gradle(.kts)` | none | `square/okhttp` |
| Any | a folder holding `CACHEDIR.TAG` | the Cache Directory Tagging convention, written by cargo, ccache and others | one | `BurntSushi/ripgrep` after a build |
| CMake | a build folder, whatever its name | it holds `CMakeCache.txt` | one | `nlohmann/json` after a configure |
| PHP | `vendor` | beside `composer.json`, holding `autoload.php` | one | `laravel/laravel` after `composer install` |
| Elixir | `_build`, `deps` | beside `mix.exs` | none | `phoenixframework/phoenix` |
| Dart | `.dart_tool` | beside `pubspec.yaml` | none | `flutter/samples` |
| Python | `__pycache__` | it holds only `*.pyc` | one | any Python project after a run |

Each row is a mark of what a folder is, never its name alone. Those that need no listing (Maven, Gradle, Elixir, Dart) read only names the walk already holds. A built repository would have to be made for most of them, since a fresh clone holds none of these folders.

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

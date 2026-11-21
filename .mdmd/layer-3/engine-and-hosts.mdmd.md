# One Engine, Two Hosts

_Proposed on 2026-11-21, at the owner's ask to explore an architecture that serves a page and a command line alike. Nothing here is built except the check that measures it._

_Drafted by the builder of that check from every call it counted, then read and corrected by the root the same day (the listing carries names alone; the scan reports how far it has come). It is one design, set beside its alternatives in section 7, and what would overturn it is in section 8._

Written for the owner first and for the builder who builds it second. Every number below was counted by [the check that the engine runs in a page](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md), over the 45 sample programs and fixtures of this repository, unless it says otherwise.

## 1. What was asked

On 2026-11-21 ([Turn 2](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), asked whether the page should come before the package:

> 1.  I have aspired to have a page that can write a page for a fair while and spoken it a fair few times.
> 2. With really awesome architecture, this shouldn't feel like a death sentence to switch between one and another (CLI versus browser window). Explore the possibility space that enables both if possible and elegant with great architecture. If not possible, explore the possibility space of what can be done with a page. If not enough is possible, then fall back to CLI.

And on the browser: "Chromium-based. Edge or Chrome."

The same hour ([Turn 3](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)), on folders under TFS that have no git:

> - I do have some project specific .tfignore files specifically because of how sick I was of churn in the packages folders (which should never ever have made it into TFS in the first place - bah!), but not all
> - This would then behoove us to ensure that the user, either via CLI or the page, has a good solid way to create ignore patterns on what they scan, before they scan it.

And on size: "Thanks to dozens of projects committing their gosh dang packages folder, there's over 100k files in just the portion of TFS I have cloned. But tens of thousands of code files sounds reasonable depending on what does and does not get counted as a code file."

Then ([Turn 4](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-4)), on a picture of this architecture that showed the command line writing "Markdown on disk": "Interesting. Wasn't that piece going to change?" It was. On 2026-11-19 the owner gave leave to try keeping a scan's facts as data, with Markdown made from them only when someone asks ("I think it's time to try, eh?", and "Export on demand, I'd expect."; [the store's trial in direction](../../AI-Agent-Workspace/Memory/direction.md#engine-and-docs)). So in what follows, what either host keeps from a scan is the scan's facts as data, not one Markdown file per source file.

## 2. The idea

```
   a folder on a disk                 a folder a person picked
           │                                     │
   ┌───────┴────────┐                   ┌────────┴────────┐
   │   Node host    │                   │    page host    │
   │ (command line) │                   │  (Edge, Chrome) │
   └───────┬────────┘                   └────────┬────────┘
           │                                     │
           └──────────────────┬──────────────────┘
                              │  1. list the folder
                              │  2. give me this file's bytes
                              │  3. keep these facts
                    ┌─────────┴─────────┐
                    │    the engine     │
                    │ the same code in  │
                    │   both places     │
                    └─────────┬─────────┘
                              │
            a scan's facts, as data (the store's trial)
                              │
            one Explorer page: shows the map, and saves
              a blank or a filled copy of itself
```

1. There is one engine: the code that finds a folder's files, reads each one, and works out what it offers and what it uses (today `packages/engine` and `packages/generator`).
2. In this design the engine never touches a disk itself. It asks whoever runs it, its host, for three things: the folder's listing, one file's bytes, and somewhere to put what it worked out.
3. There are two hosts. The Node host answers from a disk, and is what `npm run live-docs:generate` would become (`scripts/live-docs/generate.ts` today). The page host answers from a folder a person picked in the browser; today it exists only as the check's scaffolding (`tests/page-scan/page-entry.mjs`).
4. Designers call this "ports and adapters": the three questions are the engine's port, like a socket of a fixed shape, and each host is an adapter that fits a different supply into that socket. The idea is already in the code one level down: the language readers in `packages/engine/src/live-docs/adapters/` are each an adapter of one language to one shape (`LanguageAdapter`), which is why the folder has that name.
5. Today the page is made to fit by a third way: when the page is built, Node's own modules are swapped for stand-ins (`tests/page-scan/stand-ins/`). That works, and the check proves it, but the engine does not know it has two homes, and the stand-ins must copy Node's behaviour exactly, failures included. The port would make the second home part of the engine's own shape.

## 3. The port, from the calls counted

The check counted every call the engine makes of Node, two ways: which modules of the engine name each function (the committed list, [`node-needs.json`](../../tests/page-scan/node-needs.json)) and how often each was called while scanning the 45 folders.

They fall into five shapes. Here is what each becomes.

| Shape today | Example in today's code | Becomes |
| --- | --- | --- |
| **Walks**: list every file matching a pattern | discovery's walk, and the C#, Go, Java and Rust readers each walking again for their own language | the one listing, taken once and matched in memory |
| **Reads**: a file's text or bytes | the one reading step, `readSourceText` in `tooling/sourceText.ts`, which most readers share | `read`, once per file per run |
| **Probes**: is there a file at this path? | the Python reader trying candidate module files with `statSync`; the Go reader trying to read a `go.mod` in each folder above a file | `kind`, answered at once from the listing |
| **Folder contents**: what is in this folder? | the C reader looking through include folders; the HTML heuristics looking through a folder | answered from the listing |
| **Writes**: put the docs and the index on the disk | the generator writing each doc, and `graphFiles.ts` writing the index | the sink: here are the facts |

### What the host gives

Two things, and a third that saves work, kept as small as they can be, because each must be written twice, once for a disk and once for a picked folder:

- **`list()`**: every file in the folder, as its path relative to the folder with forward slashes. Asked once, before anything is read. It carries no size and no time of change: a disk and a picked folder both give names for the price of a walk, but a page learns a file's size and time only by opening that file, one wait each, which on a hundred thousand files is the very cost the listing exists to avoid. Where a size or a time is wanted (to show how much a folder holds before a scan, or to find what changed since the last one), it is asked for the files that need it and no others.
- **`read(path)`**: a file's bytes. It may take its time (in a page every read waits on the browser).
- **`head(path, n)`**: a file's first `n` bytes, so that a file can be judged text or binary without reading all of it. A host may answer it by reading the whole file.

And it takes two things. **The sink**, where the engine puts what it derived. And **word of how far the scan has come**: how many of the kept files are done and which is in hand, said between files, with the thread handed back to the host as it is said. The owner asked that the tool run on a weak machine "even if some amount of precomputation time with reasonable progress indicators is required to do so", and measured in a tab today the scan lets the page draw nothing from its start to its end, so a progress indicator could not move. On the command line the same word is a line of text; in a page it is what lets anything be drawn at all.

Two things the sink is owed, found by [the research on the stored form](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Research/stored-form/README.md#7-facts-arriving-one-file-at-a-time) on 2026-11-21, which wrote each candidate form as facts arrived one file at a time. **Each file's facts are handed over in the order of the files' paths.** Three of the forms measured need that order to be written without holding everything, the leading one among them; a scan whose readers finish out of order holds the finished files back until their turn comes, and the engine owes the sink a bound on how far out of order they may come: measured at fifty thousand files, a wait of up to about five hundred files costs 20 to 55 MB and no time worth naming, where sorting at the end holds the whole scan, 260 to 380 MB more. **And what depends on a file is known only after the last file.** The engine hands over what each file uses; the sink builds each file's dependents, and the documents that cite it, from those when the scan ends.

### What the engine builds once over them

From those, the engine itself builds, once per run, the one object every reader asks. Call it `WorkspaceFiles`:

| Method | Answers | Replaces (modules naming it, from `node-needs.json`) | Calls over the 45 folders |
| --- | --- | --- | ---: |
| `paths()` | the files kept for this scan, after the choice of what to leave out | `glob` (7 modules: discovery, `graphFiles.ts`, the generator, and the C#, Go, Java and Rust readers); the folder reads glob makes through the file system discovery hands it (`fs.readdir` in `gitIgnored.ts`) | 225 walks; 556 folder reads |
| `kind(path)` | file, folder, or nothing, at once and without waiting | `fs.statSync` (9 modules), `fs.promises.stat` (12 modules), `fs.lstatSync`, `fs.promises.access` (`rust.ts`), and a read used as a probe (`go.ts` on `go.mod`) | 2,163 + 742 + 685 + 15 |
| `children(folder)` | a folder's files and folders | `fs.readdirSync` (`c.ts`, `python.ts`), `fs.promises.readdir` (`heuristics/dom.ts`, the generator) | 33 + 26 |
| `read(path)` | the bytes, read once and handed to every reader that asks | `fs.promises.readFile` (`tooling/sourceText.ts`, discovery, `graphFiles.ts`, the generator), `fs.readFileSync` (`json.ts`, for a `tsconfig.json`) | 2,144 + 4 |
| `head(path, n)` | the first bytes | `fs.promises.open` with a read (the generator's test of whether a file is binary) | 412 |
| the sink | keeps the facts | `fs.promises.mkdir`, `writeFile`, `rm`, `rmdir` (the generator, `graphFiles.ts`) | 457 + 457 + 0 + 0 |

### What is no longer the host's at all

- **Paths.** `node:path` is named by 34 of the 36 modules that reach Node, for fourteen of its functions, and called about 25,700 times over the 45 folders. It is arithmetic on strings, not access to a machine. The engine would own a small module of its own for it, over paths relative to the folder with forward slashes only; the host turns its own paths (`C:\work\Shop` on Windows) into those at the edge. The file URLs `tooling/pathUtils.ts` makes and reads back for each file (414 calls each way) only to compute a relative path go with it.
- **Filename case.** Whether `Shop.cs` and `shop.cs` are one file is the engine's own rule, the same on every machine, and never the host's word. Where a language finds files without regard to case, its reader says so itself, as the PowerShell reader does for a path that differs in case alone (section 5). Asking the machine made the same folder read differently on Windows and Linux. It is also why the page failed until today: the reader of `package.json` asked TypeScript's host on Node, which a page does not have (mended on 2026-11-21; the setting is now the constant "names are read as written").
- **The grammars.** The readers that use tree-sitter find their grammar files by asking Node where the engine is installed (`__dirname`, `require.resolve` and `statSync` in `adapters/treeSitter.ts`). Under the port the host hands the grammars over as bytes, from the package's folder on a disk, or from inside the one HTML file in a page.

### The listing comes first, and what is left out is decided on it

The scan becomes two steps. First the host lists the folder, and nothing is read but the ignore files the listing names. Then one function, pure (it reads nothing and depends only on what it is given) and shared by both hosts, decides what is left out, from what the listing holds:

- the folder's `.gitignore` files, at every level;
- its `.tfignore` files, by TFS's rules (a pattern reaches every subfolder unless it begins with `\`; `!` keeps what a pattern would leave out; within a file the last matching line decides, and a subfolder's file adds to its parent's);
- a starting list of build and package folders, offered for a folder with no ignore file (a .NET solution's `bin`, `obj` and `packages`);
- a person's own patterns.

Its answer is a list of what is kept and, for each thing left out, which rule left it out. So the choice can be shown to a person before the scan, by folder with counts (for instance a `packages/` folder, how many files it holds, and that the starting list left it out), and changed, on the command line or in the page alike. Only then is anything read. With a hundred thousand files, most of them in committed `packages` folders, reading first and choosing afterwards would read the packages whole. Today's scanning page does exactly that: it reads every file the person picked before the scan starts.

**The function exists since 2026-11-21, and building it corrected this section in five ways** ([`leaveOut.ts`](../layer-4/packages/engine/src/tooling/leaveOut.ts.mdmd.md), nothing calling it yet; [its record](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md)). Its `.gitignore` half is held to git's own answer, rule for rule, on made trees and on three real folders (49,000 paths, none disagreeing); its `.tfignore` half to verdicts recorded from Microsoft's open-source TFVC client, compiled and run.

- **The listing and the choice go together, folder by folder.** A walk asks of each folder, before going in, whether everything beneath it is left out, and does not list it if so. A hundred thousand package files are then never listed, which a listing made whole and judged afterwards would not spare a page.
- **A left-out folder is left out whole, under either syntax** (root's ruling). Git never looks inside an ignored folder. TFVC has two readings: its change scanner looks inside and lets a `!` line keep a file there, and `tf add /recursive` does not look. The scan takes the second, and where a `!` line could have named something inside such a folder, the answer says so, for the person to see.
- **Case is not one rule here.** A `.tfignore` matches names without regard to case, as TFVC does. A `.gitignore` matches as its repository is set (`core.ignorecase`, true for every repository made on Windows), which the host hands in. The starting list and a person's patterns match without regard to case.
- **What a scan leaves out without being told goes by what a folder holds, never by its name,** and applies whatever ignore files stand above it (a second correction, the same day: the first leg had a list of names that applied only where no ignore file stood). `bin` and `obj` are left out only beside a project file, `packages` only where it holds NuGet's packages. Measured on a folder of 103,329 files made to the owner's shape, every list of names left out real source and this left out none. It costs a few folder listings and no file's bytes, and one setting makes it an offer in place of a default.
- **The folder the tool writes to is never scanned, nor a version control's own folder** (`.git`, `.hg`, `.svn`, TFVC's `$tf`), by rules of their own, whatever the ignore files say. The host reads the one setting it needs from `.git/config` and lists nothing else there.
- **Swapped in for today's discovery, it changes nothing on any of the 45 sample folders.** On this repository every difference has one of three causes, each of which the function must be handed: the configuration's own exclusions, discovery's rules by name (lock files, the docs root), and git's word on a file it tracks beneath a rule that ignores it.

What a listing cannot tell is now counted: a file git tracks beneath a rule that would leave it out (11 in this repository, 26 in DNN), which the Node host can still ask git about and a page cannot; and the two excludes files git keeps outside the folder, which decided nothing on the folders measured.

### Each file is read once

Today a file is read three to five times in one scan, and `go.mod` 30 times in one sample, once for each Go file below it. The reasons, in the code:

- the index pass reads every file to learn its symbols;
- the generator reads it to test whether it is binary, and again to note how its text was decoded;
- its reader reads it again;
- the Go reader reads `go.mod` in each folder above every Go file to find the module;
- the C# reader reads every `.cs` file to build its table of types.

Under the port, `read` keeps the bytes of a run so that every one of these asks once. A file's first reading also decides how its text is decoded, once, for everyone.

## 4. What cannot cross into a page

A page cannot start a program, so it cannot run git. Three things run git today; the third, the history, was shown on 2026-11-21 not to need the program at all.

| Uses git today | Where | In the page instead |
| --- | --- | --- |
| Git's own word on what it ignores, a file it tracks always kept | `tooling/gitIgnored.ts` asks `git ls-files --ignored` | The `.gitignore` files are read from the listing by the shared leave-out function. Lost: `.git/info/exclude`, the global excludes file, and git's rule that a tracked file under an ignored folder is kept. Reading that last one would mean reading git's own index file. |
| A scan of the files changed since the last commit (`--changed`) | `live-docs/gitUtils.ts` asks `git status` | Ask each kept file's size and time of change and compare them with those the last scan's facts recorded, and scan what moved; where that asking is itself slow, as it may be in a page, compare the bytes' own fingerprint instead, which costs a read and still saves the reader's work. This works without git, so the command line could do the same in a TFS folder. |
| The history: what the map looked like at each commit | `live-docs/history/` and `generator/src/history/` | **Measured on 2026-11-21 to cross after all** (below): the engine reads the files under `.git` itself, through the same `read` as any other file, on both hosts. As first proposed that morning, the page did without and the command line computed the history for it. |

In a folder with no `.git` at all, which is most of what the owner would map at work, the engine asks git nothing today, under Node or in the page. So for TFS folders the two hosts already lose nothing to each other.

**The history can cross, by reading `.git` as files** (the owner, 2026-11-21, on being told it could not: "Git is just a hidden directory of files. Complex as can be, but we can read files from the browser..."). [A probe of that day](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/git-in-a-page/README.md) wrote one reader of `.git` in plain JavaScript, about 770 lines with its own inflate, and beside it a port of git's rename detection, about 200 lines. The same files run under Node and in a Chromium tab. Held to git 2.56.1 on every step of this repository's history and eslint's (over ten thousand commits): every commit's fields, every commit's changed paths, the tags, the head's tree, every changed file's bytes by its id, and every rename with its score, with no difference; twelve histories made to exercise the rename rules one at a time agree as well. A folder input hands a page every file under `.git`. So the history is no longer something only one host can compute:

- **One implementation, not two.** The command line would stop starting the git program for the history (today some fifteen to twenty thousand processes for a rebuild of this repository, by the probe's estimate) and would not need git installed for it; the page gains the history.
- **A commit's tree is itself a host.** `list()` is the tree's paths and `read(path)` is a blob's bytes, so the history becomes the scan run over many hosts, and nothing is written to a scratch folder to be read back.
- **What it costs,** on eslint's 11,130 commits: every commit with its changed paths in 8.5 s in a tab and about 42 s on a tab slowed four times on two cores; renames for the whole history in half a second and 2.6 s; the newest commit within 40 ms, the walk going newest first and able to stop and resume. The engine's own work on each change, the reading of its files, is the larger cost and is unchanged by this.
- **What still does not cross:** a repository in a form the reader refuses by name (reftable, SHA-256), or whose objects lie outside the picked folder (alternates, a linked worktree's or a submodule's `.git` file); a partial clone is untested. Git's dependence on a checkout's attributes for what is binary, and on its own version for renames, is deliberately not reproduced: every machine gets the same answer.
- **Not built.** The reader and the port stand in the probe's folder. The first step in the engine is a version-control port shaped like today's, with git kept as the oracle in the tests.

## 5. The readers that read other files

Most of a reader's work is one file in hand. The hard part is the readers that must look at other files to understand this one. Each keeps a table built from many files. Today it is held in a memory keyed by the run's list of files (`fileIndex`, a set of paths) and built from reads and probes of its own. As the code stands on `day/2026-11-21`:

- **C#'s table of types.** To link `new PaymentService()` in one file to the file that declares `PaymentService`, the C# reader parses every `.cs` file the run knows and records each type by its full name. It reads each with its own cache, kept by the file's time of change, which it asks with `fs.promises.stat`. Under the port: the `.cs` paths come from `paths()`, the bytes from `read` (so the table and the file's own reading share one read), and the cache is kept by the run's `WorkspaceFiles`, not by the time of change.
- **A project's reach.** On `day/2026-11-21`, the reader of project files (`project.ts`) links each `<ProjectReference>` in a `.csproj` to the project it names, after testing with `fs.promises.stat` that the file exists. The C# reader being joined on another branch goes further: a C# file sees only the types of its own project and of the projects it references, so the reader reads every project file, works out which project holds each `.cs` file, and follows the references. Under the port: the project files come from `paths()` filtered by name, their bytes from `read`, and "does it exist" from `kind`.
- **PowerShell's tables.** On `day/2026-11-21`, a script that dot-sources `. $PSScriptRoot\Common.ps1` is linked to that file as Windows would find it: spelled exactly, or else the one file whose path differs from it in case alone. The reader keeps a table of the run's paths with their case folded for it. The PowerShell reader being joined on another branch adds a table of definitions. It reads every PowerShell file once to learn which file defines each function, so that a call of `Get-Rollout` links to the file that defines it, and what each file loads and reaches. Because that table's reading and the file's own reading are two reads, it compares the two texts by a fingerprint. Under the port both tables are built from `paths()` and `read`, and with one read per run the comparison is no longer needed.
- **The workspace's symbol index** (`buildWorkspaceIndexes` in `discovery.ts`): the first pass over every file, so that a later file can link to an earlier one's names. It is the main reason each file is read more than once, and under the port it reads through the same `read`.
- **Probes for a neighbour:** the Python reader trying candidate module files (563 `statSync` calls in the `python/ledger` sample's scan), the C reader looking through include folders, the HTML and CSS readers checking that a linked file exists. These become `kind` and `children`, answered from the listing.

The shape, in one sentence: a table is a function of the listing and of the bytes of the files it names. The port makes that the only way to build one, so a reader can no longer reach a file the person left out, and a page can answer every probe without waiting.

One case needs care. TypeScript reads a `tsconfig.json`, and every file it extends, through a host that must answer at once. It cannot wait for a page's read (the JSON reader, `compilerPaths` in `adapters/json.ts`). So those few files are read before TypeScript is called, and TypeScript is handed what was already read.

## 6. The road

The road is a strangler: the new shape grows around the old one, one kind of call at a time, until nothing calls the old way. At every step the whole gate and the page check stay green, and the check's list of what the engine needs of Node loses a module or a member of one. A reviewer sees each step as a shorter `node-needs.json`, and the page check proves at each step that the page still writes what Node writes.

1. **Done on 2026-11-21: the check itself, and TypeScript's host.** The list is committed, the page writes what Node writes in all 45 folders, and the ledger of differences is empty.
2. **File URLs out of `tooling/pathUtils.ts`.** The relative path is computed directly. This deletes the stand-in for `node:url`. It comes first because it is small, changes no fact, and shows the method working on one module.
3. **One `read` for the run.** `readSourceText`, the generator's own reads and the binary test take bytes from a `WorkspaceFiles` handed to every reader beside the `fileIndex` it already receives. Readers are already handed a per-run object, so this threads one more field through a path that exists. It removes the most calls (2,144 reads, 412 opens), cuts each file's three to five readings to one, which matters most on the weakest machine, and the check proves it by its count of reads per file. This deletes `readFile`, `readFileSync` and `open` from the stand-ins.
4. **`kind` and `children` from the listing**, starting from the `fileIndex` the readers already hold, which is a listing in embryo. This deletes `stat`, `access`, `readdirSync`, `fs/promises` `readdir` and every `statSync` but the grammars' from the stand-ins.
5. **The listing first.** Discovery's walk becomes the host's `list()` and the shared leave-out function. This deletes the stand-in for `glob` and the folder reads that pass through it. It is also where a person's choice of what to leave out, shown before the scan, becomes possible.
6. **The sink.** The generator and `graphFiles.ts` hand their output to the host. This deletes `mkdir`, `writeFile`, `rm` and `rmdir`, and it is the step the store's trial and this road share: what goes into the sink is the scan's facts.
7. **The grammars as bytes.** This deletes the `__dirname` and `require.resolve` stand-ins and the last `statSync`.
8. **Git as an optional port of the Node host.** `gitIgnored.ts` and `gitUtils.ts` ask it, and a host without git answers "none". This deletes the stand-ins for `child_process` and `process`, and `lstatSync` with them.
9. **The engine's own module for paths.** This deletes the last stand-in. The road is done when the page is built with no stand-in at all, which is when the check's list is empty.

Where the road could fork:

- **Steps 2 and 9 could swap.** Owning paths early turns every later step into work on workspace-relative paths only, but it touches 34 modules at once.
- **Whether the engine ever sees a full path.** If not, the hosts translate at the edge and Windows' drive letters never reach a reader. If so, the engine keeps two kinds of path, and Windows keeps its own failures.
- **The order of the sink and the store.** The sink could take today's doc texts first (no fact changes), and the facts when the store's trial lands; or wait for the trial and move once.
- **The caches kept by time of change.** A process that runs many generations in a row, as the history's workers do, keeps parsed files between runs by their time of change. Under the port that time is asked of the host for those files, or the cache is kept by the bytes' own fingerprint.

## 7. The alternatives

**Stand-ins swapped in when the page is built, for good.** This is what exists now.
- *It buys:* no change to the engine, and the check keeps it honest.
- *It bends:* every new call of Node needs a stand-in that behaves exactly like Node, errors and all; the probe of 2026-11-19 broke within two days without anyone noticing, and the check turns that silence into a failure but does not stop the work it causes.
- *It keeps:* each file read three to five times; and in a page the probes must be answered at once, so the stand-in must hold the whole listing, and today the bytes of every file, before the scan starts. On a folder of a hundred thousand files that means reading the packages before anyone can choose to leave them out.

**A scan as a pure function over a snapshot.** The host reads every kept file into memory and hands the engine the lot; the engine touches nothing else.
- *It buys:* the simplest engine to reason about and to test. The same snapshot gives the same facts, with no waiting inside a reader and no question of what a host may answer.
- *It bends:* memory and the time before anything starts. With the choice of what to leave out made first on the listing, the snapshot holds only the kept files, so a hundred thousand files of packages cost a listing, not a read. But the snapshot still holds every kept file at once, and reads files the scan only needs a few bytes of: a picture, or a file found binary.
- *It is:* the port with `read` answered eagerly. So the port does not rule it out: a host may preload, and on a fast machine it may.

**The engine in a worker of its own.** In a page the scan holds the page's only thread from its start to its end, so nothing on the page can move while it runs (measured on [the scan in a tab](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/scan-in-a-tab/README.md): 20.8 of 20.9 seconds without a frame).
- Running the engine on a second thread (a Web Worker) frees the page to show progress. It is not instead of the port but beside it: a worker cannot open a picked folder synchronously either, so the listing and `kind` are still what it needs.
- The cheaper choice is for the engine to hand the thread back between files.

**Node itself in the page.** Systems exist that run Node inside a browser tab. They would mean no stand-ins and no port. They are far heavier than the engine, often need a network, and the folder picker would still have to feed them. They would undo "nothing leaves the machine" and the page's size. Not recommended.

## 8. What would overturn this, and what is not known

- **Time and memory at the owner's scale.** Measured so far: 1,413 C# files scanned in a tab in 20.9 s and 586 MB, 80.2 s with the machine slowed four times on two cores. Not measured: tens of thousands of code files, on the owner's own VM (8 GB, a handful of GB free), in Edge. Reading each file once should cut the time most on the weakest machine. Keeping every file's bytes for the run raises the memory it holds at once. Which of the two wins there is not known.
- **A browser's policy.** A company may set Edge's policies to refuse the folder picker or writing to a folder. As remembered from Chromium's list of company policies and not checked here, there are settings that guard a page's reading and writing of folders (`DefaultFileSystemReadGuardSetting`, `DefaultFileSystemWriteGuardSetting`) and one that turns off every file chooser (`AllowFileSelectionDialogs`). Without the first two the page could still read a folder through `<input webkitdirectory>`, as the check does, but could not write beside the code; the third would close that way too. Whether the owner's work machine sets any of them is not known, and only trying there can tell.
- **A file opened from disk.** Windows marks a downloaded file as having come from the internet, and a company's settings may treat a page opened from such a file differently. Not tried.
- **Listing a hundred thousand files in a page.** The browser lists a picked folder one folder at a time, each answer a wait. How long a hundred thousand entries take is not measured.
- **A reader that cannot be given its files through the port without a second copy of its logic.** The readers that look at other files (section 5) are where this would show. On the code as it stands each fits, but the readers being joined on another branch change those files, and each must be read again when it lands.
- **TypeScript's synchronous host.** It is the one place found where a library insists on an answer at once. Another library may insist the same way, and each such place must read ahead.
- **The store's form.** What the sink receives is decided by the store's trial. Its research has measured seven forms, in Node and in a slowed tab, at ten thousand files and at fifty thousand ([the account](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Research/stored-form/README.md)); the choice among them is the owner's and is not made. This design asks only that the facts can be written by a page as they arrive and carried inside the HTML file the page saves.
- **A scan in a tab that is closed mid-way.** Everything a page has derived lives in its memory and is lost with the tab, unless the page sets it down as it goes. Measured on 2026-11-21 in Chromium: a page opened from disk can keep each piece in IndexedDB as it is made (no more memory, at most 15 % more time), and a new browser went on from a scan closed at sixty percent to the same bytes an unstopped scan writes. The origin's private file system is refused to such a page. A folder the person picks cannot be driven by automation, so writing into one is not measured, and neither is how much IndexedDB a machine with a few gigabytes free will offer, nor a browser killed outright.

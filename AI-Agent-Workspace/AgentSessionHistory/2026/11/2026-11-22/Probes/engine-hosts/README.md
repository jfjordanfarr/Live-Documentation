# The engine reading through its host: what was measured

Historical evidence, taken on November 22, 2026 by the builder of the road to one engine for a page and a command line, on branch `worktree-agent-ac72d8a99b54c2e5d` from `8bc5736cd`. These are the measurements that steps 3 and 4 of [that road](../../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md#6-the-road) rest on: reading each file once (commit `27b2bf9de`), and answering a reader's probes from the listing. The design, which is current, cites the figures; the figures and how to take them again are here.

The machine was shared with up to seven other builders all day. Its load average is given beside each figure. Under that load a time is only a rough figure; a count of reads, a digest of what was written, and a peak of memory are not moved by it.

## The scripts

- [`measure.mts`](measure.mts) copies a folder, scans it under Node with the generator as the command line runs it, counting every `readFile`, `open` and `readFileSync` the scan makes of a file in the folder, and prints the time, the process's peak resident memory, the reads per file, and a digest of every doc and the index it wrote. Equal digests mean the same facts to the byte.
- [`probes.mts`](probes.mts) copies a folder, works out the files a scan keeps (discovery, as the generator calls it), then scans it, recording every `stat`, `lstat`, `access` and `readdir`, sync and promise forms, with the module of the engine that made it. It sorts each probe by what a listing of the kept files could answer: a kept file, a folder holding kept files, a path absent on the disk, a path outside the workspace, the docs root, or a path **on the disk but outside the listing**. The last sort is where an answer from the listing would differ from the disk's.

Both run from a checkout with its packages installed: `node_modules/.bin/tsx --tsconfig tsconfig.base.json <script> <folder> <label>`. The folder is copied beside itself and the copy removed after the scan. For a "before", the engine of a commit was unpacked with `git archive <commit> packages tsconfig.base.json package.json`, linked to an installed `node_modules`, and the script was run with that tree's `tsconfig.base.json`.

The corpora were the copies the readers' builder of 2026-11-21 took, used here read-only and copied again before each scan: DNN Platform's repository, without its `.git` and the docs an earlier scan had left in it (10,941 files, of which a scan keeps 10,755), and its `DNN Platform/Library` folder (1,413 files, 1,409 of them C#); and this repository's 31 sample programs and its fixtures, each set copied whole and scanned as one folder.

## Reading each file once (step 3)

Before is `60b01e695`, after is `27b2bf9de`.

| Folder | Run | Load | Time | Peak memory | Files read | Reads | Most reads of one file | Digest |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| DNN Library | before 1 | 3.4 | 14.9 s | 527 MB | 1,414 | 7,054 | 5 (1,410 files) | `02fee93084cbd80e` |
| DNN Library | before 2 | 8.5 | 22.7 s | 526 MB | 1,414 | 7,054 | 5 | `02fee93084cbd80e` |
| DNN Library | before 3 | 7.8 | 23.7 s | 508 MB | 1,414 | 7,054 | 5 | `02fee93084cbd80e` |
| DNN Library | after 1 | 8.2 | 21.1 s | 531 MB | 1,414 | 1,414 | 1 | `02fee93084cbd80e` |
| DNN Library | after 2 | 8.5 | 22.1 s | 517 MB | 1,414 | 1,414 | 1 | `02fee93084cbd80e` |
| DNN Library | after 3 | 7.1 | 19.7 s | 518 MB | 1,414 | 1,414 | 1 | `02fee93084cbd80e` |
| DNN whole | before | 44.5 | 194.1 s | 1,107 MB | 10,880 | 35,481 | 10 (`Default.aspx` and two other pages) | `2a4c87ca522483b6` |
| DNN whole | after | 19.6 | 239.5 s | 1,622 MB | 10,880 | 10,903 | 3 (`.gitignore`) | `2a4c87ca522483b6` |

Before, on the whole of DNN, 4,066 files were read once, 2,700 four times, 3,994 five times, 95 six times and 3 ten times. After, 10,858 files are read once. The 22 read more than once are the workspace's `.gitignore`, which discovery reads for itself once in each of its three walks, outside the run's reads (the leave-out choice, step 5); and 21 `tsconfig.json` files that are not there at all. The reader of a `package.json` looks for a `tsconfig.json` beside it in each of the scan's two passes, a read that fails is kept by no one, and the script counts a read that fails as a read. These are probes in the shape of a read, which an answer from the listing ends (step 4).

**What it cost.** On the Library, peak memory did not move beyond the runs' spread. On the whole of DNN it rose by 515 MB, about a half, because the run now keeps each file's text, and its first 8,000 bytes, from the first pass to the second. The time is not comparable: the before ran at a load of 44, the after at 20. The page was not measured on the whole of DNN this day.

The peak comes at the turn between the two passes, when every file's text is held, so releasing a text once its last asker has had it (its own turn in the second pass) would not lower it. What would is a budget: once B bytes of text are kept, keep no more, so that the second pass finds the first B kept and reads the rest again, at most two reads where there were five. Letting the oldest go first would find nothing, since both passes go in the same order. The design's section 8 carries this as a fork.

## "Read once" held by the page check

The check that the engine runs in a page now fails a folder's case on any file its scan reads more than once that its ledger (`readMoreThanOnce` in `tests/page-scan/differences.json`) does not list, and on a listed one no longer read so. The ledger lists six docs, which the generator reads for their authored words and reads back for the index: five in `typescript/tidepool` and one in `fixtures/link-targets`.

Shown red on the code of step 4's first piece. The CSS reader's argument was taken away (`readSourceText(absolutePath)` with no `fileIndex`), the page was rebuilt, and `fixtures/slopcop-assets` was run through the lane. It failed on the read-once assertion alone, naming `workspace/public/styles/missing.css` and `workspace/styles/site.css`, each read four times: twice by the reader through the Node host's fallback, once for the count of how its text was decoded, and once for its first bytes. The argument was then put back.

## Probes answered from the listing (step 4's evidence)

Taken on the code of step 3 (`27b2bf9de`), before any probe moved.

| Folder | Kept files | Probes | A kept file | A folder of kept files | Absent on the disk | Outside the workspace | The docs root | On the disk, outside the listing |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| DNN Library | 1,413 | 4,663 | 4,227 | 189 | 190 | 55 | 2 | 0 |
| the 31 sample programs | 367 | 2,700 | 981 | 1,028 | 619 | 62 | 2 | 8 |
| the fixtures | 159 | 1,147 | 165 | 447 | 462 | 61 | 2 | 10 |

Every probe on the disk but outside the listing was discovery's, through `tooling/gitIgnored.ts` (16) and glob (2), looking at the docs a sample keeps and a fixture's `docs` folder: the walk that makes the listing, not a reader. **No reader's probe reached a file on the disk that the listing does not hold**, so a reader's probes answered from the listing change no fact on these folders.

No reader probes outside the workspace either. Taken again once the readers' caches no longer asked a file's time of change (step 4's first piece), the probes outside are, on each of the three folders, the generator's search of the folders above for a scan it lies inside (14 `stat`s), `gitIgnored.ts` looking up for a repository (40 `lstat`s, discovery's), and the grammars found beside the engine (1 to 8 `statSync`s, step 7's). The search above is the host's to answer. That second count also shows what the caches' times cost: the probes of a kept file fell from 4,227 to none on the Library, from 981 to 306 on the programs and from 165 to 72 on the fixtures.

## 2026-11-22, later: the read budget, the manifest's exports, and this repository's probes

Taken on the code after commit `610af3c6e`, with the read budget built.

### What made the peak, and the read budget

The whole of DNN was scanned four times under Node, one after another, each from a frozen copy of its engine. Before is `60b01e695`. The other three are the mended code, keeping every file, keeping 16 MiB, and keeping none (`measure.mts`'s third argument, in MiB). Every read was already in the disk's cache.

| Run | Load | Time | Peak memory | Reads | Reads per file | Digest |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| before | 10.5 | 276.9 s | 1,116 MB | 35,481 | 1 to 10 (3,994 files five times) | `2a4c87ca522483b6` |
| keep every file | 26.1 | 196.5 s | 1,381 MB | 10,903 | 10,858 once | `2a4c87ca522483b6` |
| keep 16 MiB | 16.7 | 155.6 s | 1,203 MB | 16,692 | 6,627 once, 2,720 twice, 1,519 three times | `2a4c87ca522483b6` |
| keep none | 11.4 | 110.1 s | 1,399 MB | 21,896 | 4,066 once, 2,722 twice, 3,994 three times | `2a4c87ca522483b6` |

- **The 515 MB of the morning's measure were mostly a mistake in step 3, not the text.** Each read keeps its first 8,000 bytes for the binary test, and they were cut with `slice`, which on Node's `Buffer` is a view of the same memory. Each kept head therefore held its whole file. The first two budget runs, on the code before the mend, showed it: a budget of 64 MiB, which DNN's texts never fill, peaked at 1,551 MB, against 1,635 MB for keeping everything (noise), with the reads unchanged. Mended, `new Uint8Array(bytes.subarray(…))` copies, and a unit case fails on the view: keeping everything peaks at 1,381 MB, not 1,622 MB.
- **The budget cannot be chosen here.** The time follows the machine's load, not the budget: keeping none was fastest at the lowest load. The peaks lie within one another's noise, since what the run keeps (DNN's texts come to less than 64 MiB) is small beside the rest of the scan's memory. With every read in the disk's cache, reading again costs nothing, so nothing here shows what keeping saves. The default stays at keeping everything. The measure that can choose it is in a page on the slowed machine, where every read waits on the browser; that was not taken.
- **Past the budget, a C# file is read three times, not two.** It is read once for the table of types in the first pass, once for its own reading in that pass, and once in the second pass. Two of these three are the same pass: the table is built from every file before the file's own turn comes.

### `exports` read as Node reads it

`node -e 'require.resolve("@live-documentation/stored-form")'` and `import.meta.resolve` of it, from this repository, both give `packages/stored-form/dist/storedForm.js`. The tsconfig maps that to `src/storedForm.ts`. Eleven manifest shapes are held to the same resolver in `packages/engine/src/live-docs/adapters/json.exports.test.ts`; seven failed with the reader reading `main` alone. This repository's docs changed in four: the JSON reader's, its new test's, `packages/stored-form/src/storedForm.ts`'s (its `Entry` line) and the expected entries'.

### This repository's probes, with its `node_modules` (root's fourth ruling)

[`probes-in-place.mts`](probes-in-place.mts), which is `probes.mts` changed to scan in place as a dry run with the checkout's own configuration (nothing copied, nothing written), was run over this worktree with its installed `node_modules`. Of 15,452 probes, 2,866 were of a kept file, 2,238 of a folder of kept files, 8,504 of a path absent on the disk, 14 of the docs root, 10 outside the workspace, and 1,820 of a path on the disk outside the listing. **All 1,820 are `gitIgnored.ts` looking for a `.git` in each folder: discovery's. No reader's probe, the TypeScript resolution of `dependencies.ts` among them, reached `node_modules` or any other file outside the listing.** So answering the readers' probes from the listing should change no fact of this repository. The comparison of its whole docs and index before and after, which the ruling asks for, is to be made when the probes move.

## 2026-11-22, last: the budget measured in a slowed page, and deleted

Taken on the code after `f8ff639c4` with the budget still built, by [`page-budget.mjs`](page-budget.mjs). It drives the page check's own scanning page, built by `npm run e2e:bundles`, through the browser lane, one hold per run, under `taskset -c 0,1`, slowed four times by the browser's own throttle (`Emulation.setCPUThrottlingRate`, as the scan-in-a-tab probe of 2026-11-21 slowed it). The page was handed DNN's Library (1,413 files). The whole of DNN would not fit a hold of five minutes at that pace: under Node it takes two to four minutes unslowed. The budget was named on the page's input (`data-read-budget`, taken out again with the budget). Peak memory is the highest resident memory of the page's renderer (`VmHWM`). The Library's texts come to about 10 MB, so 16 MiB would have kept them all, and 4 MiB was run instead.

| Run, in order | Load before → after | Scan | Renderer's peak | Reads |
| --- | ---: | ---: | ---: | ---: |
| keep everything | 4.9 → 4.3 | 57.1 s | 515 MB | 1,413 |
| keep nothing | 4.3 → 3.3 | 51.9 s | 514 MB | 4,233 |
| keep 4 MiB | 3.3 → 3.0 | 51.9 s | 509 MB | 3,239 |
| keep everything | 2.9 → 14.2 | 122.2 s | 512 MB | 1,413 |
| keep nothing | 12.4 → 6.7 | 68.5 s | 513 MB | 4,233 |

The fourth and fifth ran while this builder's own lint and tests ran, which is the load they show. The peaks lie within 6 MB of one another, and the times follow the load. So the budget bought nothing in the page either. It was deleted, with the generator's `readBudget`, its default and its cases (root's ruling: delete it unless a budget wins). The copied head and the order of asks stay. `measure.mts`'s third argument and `page-budget.mjs`'s budget are left as they were run; the generator no longer reads them.

One limit of this measure: the page check's page puts every file it is handed into its memory before the scan, so its host's reads cost no more than Node's did with the disk's cache warm. A page that reads each picked file only when the scan asks would make every second read cost, which favours keeping everything the more.

## The manifest reader against every installed package

`tests/integration/live-docs/package-modules.oracle.test.ts` asks Node's own resolver, `require.resolve` and `import.meta.resolve`, for the name of every package installed under this repository's `node_modules`, nested ones among them: 281 packages, Node 26.13.1. Each package's files are set beside those `packageModules` gives, both counted as files on the disk.

| Cause | Before the mend | After |
| --- | ---: | ---: |
| agree | 229 | 273 |
| no `exports` and no `main`: Node takes `index.js` | 24 | 0 |
| `main` without its extension, or a folder: Node completes it | 11 | 0 |
| `main` names no file: Node falls back to `index.js` | 8 | 0 |
| a nested copy: Node's ESM resolver answers with the top-level copy's file | 6 | 6 |
| a name of one of Node's own modules (`punycode`, `string_decoder`) | 2 | 2 |

The first count also had seven it could not explain. Once files were counted as files on both sides, `@types/three` agreed (its `exports` name files that are not there), and the other six took the class of nested copies. The mend is Node's legacy resolution of `main`: the path it names, then with `.js`, `.json` or `.node`, then its `index` with each, then the package's own `index`. A `main` of `""` names nothing and falls through to `index`. Mixed keys in `exports` (subpaths beside conditions, which Node refuses) occur in no installed package. For the six nested copies, Node 26's `import.meta.resolve`, asked both from the folder that holds the copy and from inside the copy, gave the top-level copy's file of the same name (`eslint-visitor-keys` 5.0.1 under `eslint` resolved to 3.4.3's `lib/index.js`); why is not established. The register is `tests/integration/live-docs/expected/package-modules.json`.

*Established in the next section: it was the oracle's question, not Node.*

## 2026-11-22, step 4: every reader's probes moved onto the listing

Taken from the day's tip `8cfd27b85`. Before the first move, this repository's whole `.mdmd` (1,334 docs and the index) was generated and saved. After each move or small group of moves, the docs were generated again and compared whole by [`compare-docs.mjs`](compare-docs.mjs). Every doc but those of the source files edited must be the same bytes, and the index must be the same once the edited files' own nodes and the edges of their new imports (`inbound`) are set aside.

| Move | Docs differing, the edited files' aside | Index | `node-needs.json` after |
| --- | ---: | --- | --- |
| Rust's `promises.access` (`packageDirOf`) | 0 | same | `promises.access` gone from the engine and the stand-ins; the Node host gains `statSync`, `readdirSync` for its fallback |
| Python's folder entries and `statSync`; C's folder listings (each kept until then by a folder's time of change) | 0 | same | `readdirSync`, `statSync` gone from `python.ts` and `c.ts` |
| CSS, HTML and Ruby `statSync` | 0 | same | `statSync` gone from `css.ts`, `html.ts`, `ruby.ts` |
| `dependencies.ts`'s `stat` (the TypeScript resolution), the DOM heuristics' `readdir`, the JSON reader's `statSync` in TypeScript's host | 0 | same | `node:fs/promises` gone from `heuristics/dom.ts`; `node:fs` from `json.ts`; `dependencies.ts`'s move undone, below |

The ASP.NET, project and C# dependency readers named no file probe by then; the day's other merges had taken theirs. With `node_modules` installed, the TypeScript resolution's move changed no byte of this repository, as the count in place predicted.

**But the TypeScript resolution's move failed a case of the integration suite, and was undone.** In `tests/integration/live-docs/history-reading.test.ts`, "reads excluded code an included file imports and re-exports, as a checkout does": an included file imports and re-exports from a folder the configuration excludes. The repository's decision, written in the case, is that the import resolves "against the excluded files on disk, as a checkout's generator resolves them". Asked of the listing, the excluded provider is not there: the dependency's labels came back without `api` and `types.thing`. That is the fork between that decision and root's ruling that what a scan leaves out no reader sees, and it is the owner's. With `dependencies.ts` and its two callers restored to the tip, the case passes, and the whole comparison shows no generated doc differing. So every reader but `dependencies.ts` names no `node:fs`. Left in `node-needs.json`: `glob` in the C#, Go, Java and Rust readers, for a walk only when no run is handed (step 5); discovery's `readFile` and `stat` (step 5); `gitIgnored.ts` and `gitUtils.ts` (steps 5 and 8); `graphFiles.ts` and the generator, the docs written and read back (step 6); `treeSitter.ts` (step 7); the Node host itself (step 9).

## The six nested copies: the oracle's question, not Node

Node documents `import.meta.resolve`'s second argument, the parent to resolve from, as honoured only under `--experimental-import-meta-resolve`. Without the flag it is ignored, and the name resolves from the asking script. Asked from `node_modules/eslint/consumer.mjs`, `eslint-visitor-keys` resolved to the top-level copy's `lib/index.js` without the flag and to the nested copy's with it. The oracle now asks with the flag: the six agree, and 279 of 281 packages agree, the two left being `punycode` and `string_decoder`, named as Node's own modules.

## 2026-11-22, sixth milestone: what a kept file imports from code a scan leaves out

Taken from `bcd44843b`. [`left-out-imports.mts`](left-out-imports.mts) runs, for every script file a scan keeps, the engine's own `collectDependencies` and `augmentWithReExportedSymbols` twice. The first run is as at the tip, a file asked of the disk. The second is with the run's listing, a file the scan leaves out never read. It uses a copy of the engine to which [`listed-resolution.py`](listed-resolution.py) re-applies the move of `dependencies.ts` that was undone. Nothing is generated, so it ran in place over the read-only corpora.

| Folder | Files kept | Script files | Files whose answer changes | An import of a left-out file | `export *` from one | `export { … }` from one | Through `node_modules` | Re-exported names no longer known |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| this repository, its `node_modules` installed | 1,337 | 798 | 0 | 0 | 0 | 0 | 0 | 0 |
| the 31 sample programs | | 45 | 0 | 0 | 0 | 0 | 0 | 0 |
| the fixtures | | 15 | 0 | 0 | 0 | 0 | 0 | 0 |
| DNN | | 1,992 | 0 | 0 | 0 | 0 | 0 | 0 |
| mojoportal | | 1,142 | 0 | 0 | 0 | 0 | 0 | 0 |
| OrchardCore | | 1,511 | 0 | 0 | 0 | 0 | 0 | 0 |
| nopCommerce | | 466 | 0 | 0 | 0 | 0 | 0 | 0 |

Load 11 to 16. No kept file of any of the seven imports or re-exports from a file the listing does not hold and the disk does. "Through `node_modules`" is none by construction. The TypeScript resolution resolves no bare package name into `node_modules`, only the workspace's own aliases into its own folders, so an import of a package is already labelled as written. The one input found where the answer changes is the history's made case, `tests/integration/live-docs/history-reading.test.ts`. There a kept file imports and re-exports from an excluded folder, and its labels and re-exported names are what would change. The measure holds no surprise.

The graph's keys were mended in the same milestone: a folder holding files named `__proto__`, `constructor`, `toString` and `hasOwnProperty` could not be mapped at all before (`tests/integration/live-docs/prototype-names.test.ts`).

## 2026-11-22, sixth milestone: three findings of the independent review, mended

[The review](../engine-review/README.md) found three things in this road's code.

- **The manifest reader read seven shapes unlike Node** (`json.exports-held-by-node.test.ts`, 7 red). These were `exports: null` beside `main`; a `null`, an empty list and a list of one `null` under a matching condition; targets with `..`, one of them climbing out of the package; and `.` keys mixed with condition keys. `packageModules` and `exportTarget` now follow Node's `PACKAGE_EXPORTS_RESOLVE` and `PACKAGE_TARGET_RESOLVE` as written. A target is refused unless it is `./` followed by segments none of which is empty, `.`, `..` or `node_modules`. A `null` under a matching condition ends that side. A list of fall-backs passes over a refused item and answers with its last item's answer. Mixed keys, and keys that are array indices, are refused. The seven are green, and they join the made shapes of `json.exports.test.ts`.
- **The host was asked again and again for `go.mod` files that are not there** (`go.module-probe.test.ts`, 1 red). On `go/depot` that was 32 asks for eight absent files. `moduleOf` now asks the listing what lies at each folder's `go.mod` before reading it. The JSON reader's read-ahead of a tsconfig does the same, since a `package.json` with no `tsconfig.json` beside it asked the host once in each pass.
- **The page check counted no failed read.** The page's own host (`tree.read` in `tests/page-scan/stand-ins/fs.mjs`) now counts every ask, found or not, so "read once" holds for both. The stand-in for `node:fs` still counts only a read that finds its file, since its asks are the docs', the sink's. Seen red on `go/depot` from a copy of the code before the Go mend. The case failed on "read once" alone, naming `report/go.mod` and `stock/go.mod` asked 8 times each, `store/go.mod` 6, and `cmd/depot/go.mod`, `cmd/go.mod`, `internal/audit/go.mod`, `internal/go.mod` and `store/memory/go.mod` twice each: 32 asks for eight absent files, the review's count. The full check on the mended code is below.

# What the tool needs to run, and whether one page can do it all

Historical evidence, taken on November 19, 2026 at `6ac37bf2`, by a builder for the root, on branch `worktree-agent-a39ded1f924ab596a`. It changed no product code. Everything built for it is scratch: the scripts here bundle the unchanged generator into a page through stand-ins for Node's modules (the `shims` folder), and measure. The corpora and built bundles are not kept.

The question came from the owner, on 2026-11-19: "The node question feels like it dodges a deeper question of what the actual execution surface _is_ for a typical user." What was talked about before is in [direction](../../../../../../Memory/direction.md) under "The first visit, delivery and sharing" and in [ideas](../../../../../../Memory/ideas.md) under the same heading. The work machine it is for: Windows, 8 GB of memory, little free disk ([the cold run](../cold-run/README.md) describes its code).

The machine was shared with other builders throughout. Load averages are given beside every time; counts and megabytes are worth more than the times.

## In short

- **The unchanged generator runs in a page.** Bundled with stand-ins for `fs`, `path`, `glob` and `child_process`, it mapped the estate sample from a page opened as a file and from `http://127.0.0.1`, and its 38 docs and index were identical, line for line apart from the `Generated At` stamp, to the same run under Node. On dbatools (1,973 files read) it took 61.9 s against Node's 59.8 to 82.4 s, and the tab peaked at 608 MB against Node's 497 to 597 MB.
- **A page that scans weighs 5.56 MB**, not the 16 MB measured in October. The grammars are 13.9 MB as files but 1.58 MB stored gzipped inside the page and inflated by the browser's own `DecompressionStream`. The TypeScript compiler is now 90% of the page's script (3.57 of 3.97 MB).
- **A page opened from disk can copy itself.** A blank copy was downloaded from both origins, and the copy, opened as a file, started again with no error.
- **What a page opened from disk cannot do:** use the origin private file system (a `SecurityError`). The folder picker exists there, but an automated browser cannot press it, so its prompt is unmeasured.
- **Packed from today's code, the command line installs to 100 MB.** It generates, but `visualize` fails: the Explorer is compiled from TypeScript source on the user's machine, and the package ships no source.
- **Memory is not the wall.** Generation under Node peaked at 161 MB (estate), 486 MB (this repository's code) and 597 MB (dbatools). With the heap capped at 1 GB, dbatools still finished, peaking at 497 MB.

## Part 1: what the generator needs from Node

Counted over every non-test module under `packages/engine/src`, `packages/generator/src` and `packages/explorer/src/shared`. The Explorer's client (`packages/explorer/src/client`) imports no Node module.

### Has a plain browser equivalent

| Need | Where | In a page |
| --- | --- | --- |
| `node:path` | about 30 engine and generator files | A POSIX path module; the probe used `pathe`, already installed |
| `node:url` `fileURLToPath` and `pathToFileURL` | `tooling/pathUtils.ts` | `URL` |
| Text decoding | `readSourceText` (below) | `TextDecoder`, which it already uses |
| `typescript`, called only for `createSourceFile` | `discovery.ts`, `dependencies.ts`, `sourceAnalysis.ts`, `symbolExtraction.ts`, `jsDoc.ts`, `coreUtils.ts`, `heuristics/routes.ts`, `adapters/json.ts` | Runs as it is; it is 3.57 MB of the page |
| `minimatch`, `ignore`, `smol-toml` | `relatedDocs.ts`, `discovery.ts`, `adapters/manifest.ts` | Run as they are |
| `web-tree-sitter` and the `.wasm` grammars | `adapters/treeSitter.ts` | Run as they are, given bytes rather than a path |
| `node:crypto` `createHash` | history only (`lens.ts`, `summary.ts`, `computeHistory.ts`, `generatorIdentity.ts`) | `crypto.subtle.digest`, which is asynchronous |
| `node:zlib` | history only (`computeHistory.ts`, `summarizeChange.ts`) | `CompressionStream`, also asynchronous |

### Needs a seam: an interface the engine reads files through

| Need | Where | Count |
| --- | --- | --- |
| A file's text (`fs.readFile`) | Every reader, `discovery.ts`, `dependencies.ts`, `sourceAnalysis.ts`, `heuristics/dom.ts`, `graphFiles.ts`, the generator | about 30 call sites |
| Whether a path is a file, synchronously (`statSync`, `existsSync`, `readdirSync`) | `c.ts`, `python.ts`, `css.ts`, `html.ts`, `ruby.ts`, `aspnet.ts`, `treeSitter.ts` | 21 calls in 7 files |
| Whether a path is a file, asynchronously (`fs.stat`, `fs.access`) | `csharp.dependencies.ts`, `project.ts`, `rust.ts`, `discovery.ts`, the generator's `isScan` | 9 |
| A modification time, for parse caches (`fs.stat` `mtimeMs`) | `csharp.ts`, `go.ts`, `java.ts`, `rust.ts`, `c.ts`, `python.ts` | 6 |
| A walk of the workspace (`glob`) | `discovery.ts`, `graphFiles.ts`, the generator (three times), and `csharp.ts`, `go.ts`, `java.ts`, `rust.ts`, each walking again for its own language | 9 |
| The first bytes of a file (`fs.open`) | the generator's binary sniff | 1 |
| Writing docs, pruning and the index (`mkdir`, `writeFile`, `rm`, `rmdir`, `readdir`) | the generator, `graphFiles.ts` | about 10 |
| Where a grammar's bytes come from (`__dirname`, `require.resolve`, `existsSync`) | `treeSitter.ts` | 1 function |

A browser's directory handle answers only asynchronously. So the synchronous probes are answered from a listing taken once at the walk, which is what the probe's stand-in does. The same listing serves the nine walks.

**How close one reading step brings the seam.** A builder's commit `ab9e346d` (branch `worktree-agent-aabeca6131a64c7b7`, not on `main` when this was taken) adds `readSourceText(absolutePath)`. It sends 16 readers and engine modules through one function. Its decoding half, `decodeSourceText(bytes)`, is already pure: it needs only `TextDecoder`. Still outside it: `csharp.ts`, `csharp.dependencies.ts`, `powershell.ts`, `sql.ts`, `aspnet.ts`, `project.ts` and `dotnetConfig.ts` ("the files other builders hold today"), plus every probe, walk and write in the table above.

So it covers the largest kind of call, reading text, but none of the others. A seam would be `readSourceText` taking its bytes from an interface, plus three more methods on that interface: list, is-file and write.

### Cannot be had in a page

- **What git ignores** (`tooling/gitIgnored.ts`, `spawnSync("git", ["check-ignore", …])`). Without git, discovery already falls back to the workspace's root `.gitignore`, and the page took that path. Lost are:
  - nested `.gitignore` files;
  - `.git/info/exclude` and the global excludes file;
  - git's rule that a tracked file under an ignored folder is kept.

  Through a directory handle a page could read nested `.gitignore` files and `.git/info/exclude`. "Tracked" would mean reading git's binary index file: a reimplementation, not a call.
- **`--changed`** (`gitUtils.ts`, `git status`). No equivalent. A page could compare against its last map instead.
- **The history engine.** It runs git: `rev-list --first-parent`, `read-tree` into a scratch index, `rev-parse`, `for-each-ref`, `ls-tree`. It builds a scratch tree per commit with `fs.symlink`, and `fork()`s worker processes (`regenerate.ts`), with caches under `os.tmpdir()`. 2,523 lines in `history/git.ts` and `packages/generator/src/history/`.

  A page would have to read git's objects itself through the handle: loose objects inflate with `DecompressionStream("deflate")`, but packfiles with deltas need a pack reader, a library the size of isomorphic-git or one of our own. Its scratch trees would live in memory and its workers would be Web Workers. That is a second history engine, not a seam.

  The candidate "the single file maps today's state; history stays a command-line feature" needs none of it. A middle form, untested: the command line computes history once and writes it into the file, which the page then only reads. The Explorer already reads history that way.

## Part 2: whether a page can do it, measured in Chromium

The page is built by [`build-page.mjs`](build-page.mjs) from [`page-entry.mjs`](page-entry.mjs) and the `shims` folder, and measured by [`browser-measure.mjs`](browser-measure.mjs) through the browser lane. Playwright 1.58.2 drove headless Chromium. Every run was a fresh browser.

The page's content security policy was `default-src 'none'; script-src 'sha256-…' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'`. That is one inline script admitted by its hash, and no `connect-src` at all: nothing is fetched. The grammars are inlined as gzip in base64, in `<script type="application/octet-stream">` blocks, which the browser does not run. They are inflated by `DecompressionStream`.

**The grammars load in the page under that policy.** All 8 `.wasm` files (the runtime and seven grammars) decoded in 390 to 650 ms. The one change from Node: emscripten tries to build a URL from `import.meta.url`, which a classic script lacks, until it is given `locateFile`. Whether `'wasm-unsafe-eval'` is strictly needed was not tested. Chromium's documented rule is that a policy restricting `script-src` must name it for WebAssembly to compile.

### What each origin offers

| | `file://` | `http://127.0.0.1` |
| --- | --- | --- |
| `showDirectoryPicker`, `showSaveFilePicker` | present | present |
| `isSecureContext` | true | true |
| Origin private file system | `SecurityError` | available |
| `<input webkitdirectory>` | works | works |
| `DecompressionStream` | present | present |

### How the folder was given

The native picker cannot be pressed by an automated browser. Called without a gesture, headless Chromium answered `AbortError: The user aborted a request`. Called from a click, it was aborted by Playwright's own interception ("Intercepted by Page.setInterceptFileChooserDialog()"), and no file-chooser event fired that could hand it a folder.

Two stand-ins were used instead:

- **The `<input webkitdirectory>` path.** Playwright set a real folder's files on the input, and the page read the File objects. This is the honest path for Firefox and Safari too, which have no directory handle. It reads but cannot write back.
- **The directory-handle path.** The corpus was copied into the origin private file system. The page then walked and read it through a `FileSystemDirectoryHandle`, the same interface the picker returns, and wrote the 39 outputs back through it.

What these do not prove: the picker's own prompt, and the read-write prompt Chromium shows for a folder a person picked. The origin private file system grants both without asking. A person must still press the picker once (a gesture), and accept a second prompt to allow writing.

### Generation in the page against Node

| Corpus | Where | Docs | Generation | Peak memory | Load |
| --- | --- | ---: | ---: | ---: | --- |
| estate | page, `file://`, folder input | 38 + index | 0.62 s, again 0.69 s | renderer 213 MB | 15.0, 32.7 |
| estate | page, `http`, folder input | 38 + index | 0.50 s | renderer 207 MB | 14.9 |
| estate | page, `http`, directory handle | 38 + index; 39 written back in 0.82 s | 0.56 s | renderer 210 MB | 15.0 |
| estate | Node, default heap | 38 + index | 1.3 s (process start included) | 161 MB | 11.4 |
| dbatools | page, `http`, folder input (2,002 files set in 1.56 s) | 1,973 + index | 61.9 s | renderer 608 MB; JS heap 411 MB after | 25.1 |
| dbatools | Node, default heap | 1,973 + index | 69.0 s (93.2 processor-s) | 597 MB | 16.4 |

What each column counts:

- **Generation** in the page is `generateLiveDocs` from its call to its return. It excludes reading the folder and the 0.4 to 0.6 s of grammar inflation.
- **Peak memory** in the page is the renderer process's high-water resident memory (`VmHWM`). An idle page holding the scanner already stands at about 188 MB. Under Node it is the process's peak resident memory (`getrusage`).
- **The page's dbatools heap** was read from `performance.memory` after the run.

**The page's output is Node's.** [`compare-outputs.mjs`](compare-outputs.mjs) compared the page's 39 files (from `file://`) with Node's run on the same folder: 39 the same, none different, none missing.

In the page, discovery asked git once (`git -C /ws check-ignore`), was told no, and used the folder's `.gitignore`. The dbatools run made 7,676 file reads, one stat and one synchronous probe through the stand-in. Its readers read each file about four times.

## Part 3: what one file weighs and how it copies itself

### The scanning page as built here (no viewer)

| Part | Bytes |
| --- | ---: |
| The whole page | 5,557,656 |
| Script, minified | 3,974,046 |
| of which TypeScript | 3,568,847 |
| of which the engine | 244,293 |
| of which web-tree-sitter's JavaScript | 77,686 |
| of which minimatch, `@isaacs/nonrecursive-glob-match`, smol-toml, pathe, ignore, brace-expansion | about 61,000 |
| Grammars embedded (gzip, base64) | 1,582,204 |
| C++ (5,394,393 raw) | 556,692 |
| C# (5,103,332 raw) | 408,552 |
| Rust (1,113,644 raw) | 159,416 |
| PowerShell (958,422 raw) | 130,604 |
| the tree-sitter runtime (209,613 raw) | 110,976 |
| Python, Java and Go | 215,964 |

The grammars the readers load are these seven and the runtime: 13.86 MB as files, 1.58 MB in the page. TypeScript's own tree-sitter grammars are not loaded by any reader, since TypeScript is read by the compiler. SQL and Ruby have scanners of their own.

### The Explorer's own script, as `visualize` builds it

Measured by [`explorer-shares.mjs`](explorer-shares.mjs):

| Part | Bytes |
| --- | ---: |
| The script, minified | 1,425,699 (426,977 gzipped) |
| of which the Explorer's own code | 691,993 |
| of which three.js | 590,216 |
| of which JSZip | 97,913 |
| of which the engine | 33,825 |
| The script's source map | 6,856,659 |
| Stylesheets | 231,528 |

A single file holding the scanner, the viewer and no map would come to about 7.2 MB (5.56 + 1.43 + 0.23), before the map's data and without the source map. This is a sum, not built. The data was 84.5 KB for the estate. [The cold run](../cold-run/README.md) measured 4.0 MB for dbatools and 37.2 MB for DNN.

### The largest savings, measured against October's estimate

1. **Gzip the grammars in the file:** from 13.86 MB to 1.58 MB, done here. In October they were counted at 7 MB raw. Since then C++ came in (5.4 MB) and C# stands at 5.1 MB.
2. **Leave the source map out of a single file:** 6.86 MB. Most of October's "11 MB of the Explorer's scripts" is the source map.
3. **TypeScript through its tree-sitter grammars instead of the compiler** (October's proposal, waiting on the oracle): it removes 3.57 MB of script and adds about 0.36 MB of gzipped grammars (TypeScript, TSX and JavaScript). Measured: the grammars' sizes. Reading: that the swap is complete.
4. **Store the script gzipped too:** 3.97 MB becomes 1.15 MB. But a script inflated at run time cannot be admitted by its hash. The policy would have to allow `blob:` scripts or `'unsafe-eval'`, a weakening of the policy, so it is listed only to show its price.

### Copying itself

Measured:

- From both `file://` and `http`, the page made a blank copy of itself and offered it as a download (`<a download>` on a `blob:` address). The copy was its own markup with the map's `<script type="application/json" data-map>` block emptied: 5,557,646 bytes.
- The downloaded copy, opened from disk, decoded its grammars and started with no error.
- Nothing in the policy had to allow this. A download of a `blob:` address is not a fetch, and needs no `connect-src`.

A copy holding a map is the same act with the data block filled. It was not separately run.

Measured only as present: `showSaveFilePicker` exists on both origins, but needs a gesture and a person at the save dialog.

Writing into a folder through a directory handle was measured only on the origin private file system, under `http`: 39 files written in 0.82 s, permission `granted` without a prompt. A page opened from disk cannot use that file system. Whether it can write into a folder a person picked, after the browser's read-write prompt, is unmeasured here. Chromium's documented behaviour is that it can.

## Part 4: the command line without this checkout

### Packing what ships

`npm pack` of the three workspaces:

| Package | Packed | Unpacked | Entries |
| --- | ---: | ---: | ---: |
| engine (its source, `dist` and grammars) | 0.80 MB | 4.37 MB | 606 |
| generator | 0.06 MB | 0.25 MB | 26 |
| explorer | 0.06 MB | 0.21 MB | 46 |

Installed into a scratch folder with `npm install --omit=dev`: **100 MB in `node_modules`, 41 packages.** The largest:

| Package | Size |
| --- | ---: |
| `typescript` | 23 MB |
| `three` | 23 MB |
| `@vscode/tree-sitter-wasm` | 22 MB (12.7 MB of it the six grammars used) |
| `@esbuild` | 11 MB |
| `@live-documentation` | 6.5 MB |
| `web-tree-sitter` | 4.6 MB |
| `lru-cache` | 3.6 MB |
| `glob` | 2.0 MB |

[`installed-run.cjs`](installed-run.cjs) ran from that install:

- **`generate` works**: the estate, 38 docs.
- **`visualize` does not**: "Could not resolve …/explorer/dist/client/index.ts". `buildAssets.ts` compiles the Explorer from TypeScript source with esbuild on the user's machine, and the package carries no source. That is also why three.js, esbuild, JSZip, lz-string and d3 are installed at all: they are the client's, needed only to compile it.
- **There is no command.** The commands (`scripts/live-docs/*.ts`) belong to no package and run under `tsx`, a development dependency. `packages/cli` only spawns `tsx` on them from a checkout, and `npm run build` does not build it.

Not measured: an install without `typescript`. The isolation guard refused a compound command before it ran, and it was not retried. Reading of the code: `discovery.ts` imports `typescript` at the top, so nothing would load without it until the tree-sitter swap.

### The smallest honest installation of each kind

| Form | Megabytes on disk | The person must have | Measured or reading |
| --- | ---: | --- | --- |
| npm package, as packed today | 100 | Node 22 or later, and npm | measured |
| npm package with the Explorer compiled before shipping | about 64: 100 less three, esbuild, JSZip, lz-string and d3 (about 35), with the compiled client (1.7) added | Node 22 or later, and npm | reading, from measured parts |
| One bundled script, generator with engine and packages | 4.05 for the script ([`node-bundle-size.mjs`](node-bundle-size.mjs); TypeScript 3.57 of it). With the grammars as files 13.86, with the compiled Explorer 1.66, 19.6 in all; about 7.2 if the grammars ship gzipped | Node 22 or later | the script measured; the rest a sum; not run, since `treeSitter.ts` finds grammars by `__dirname` and `require.resolve` |
| A single executable from Node's own facility | Node's binary here is 124.9 MB (Linux x64, v22.23.5), plus the bundle above: about 130 to 145 MB | nothing | Node's binary measured here; the Windows `node.exe` and the built executable not measured |

## Part 5: memory

Generation under Node, every run a first run into an empty `.live-documentation` with the default configuration ([`node-generate.mjs`](node-generate.mjs)):

| Corpus | Files | Heap cap | Finished | Wall s | Processor s | Peak resident | Heap peak | Load |
| --- | ---: | --- | --- | ---: | ---: | ---: | ---: | --- |
| estate | 38 | default (4,144 MB) | yes | 1.3 | 2.9 | 161 MB | 32 MB | 11.4 |
| estate | 38 | 2 GB | yes | 1.4 | 2.6 | 159 MB | 31 MB | 12.0 |
| estate | 38 | 1 GB | yes | 1.3 | 2.7 | 161 MB | 32 MB | 12.0 |
| dbatools | 1,973 | default | yes | 69.0 | 93.2 | 597 MB | 311 MB | 16.4 |
| dbatools | 1,973 | 2 GB | yes | 59.8 | 79.6 | 596 MB | 315 MB | 14.5 |
| dbatools | 1,973 | 1 GB | yes | 82.4 | 85.6 | 497 MB | 239 MB | 25.9 |
| this repository's code | 1,091 | default | yes | 54.7 | 73.3 | 486 MB | 125 MB | 33.4 |
| this repository's code | 1,091 | 1 GB | yes | 41.3 | 71.0 | 455 MB | 102 MB | 28.4 |

"This repository's code" is a copy of the worktree without `AI-Agent-Workspace`, `node_modules`, `dist` and `.git`, under the default configuration rather than `.live-docs.config.json`. So it is not the map the repository commits.

The heap peak is sampled every 50 ms. At 1 GB, dbatools and this repository both finished with a lower peak and about the same processor time. The wall-time differences are within what the load explains.

Not measured: a 512 MB cap, and the Explorer page's own memory opening each map. The page that scans held 188 MB at rest and 608 MB at its peak on dbatools (Part 2).

## Each candidate, what it would take

### The single file that scans

Pieces in the code:

- A file-system interface the engine reads through: list once, read bytes, is-file answered from the listing, write. Every `fs` call in Part 1's seam table goes through it, `readSourceText` first.
- A grammar source that hands `treeSitter.ts` bytes rather than a path, with the grammars inflated from the file.
- The generator able to keep its docs and index in memory and write them out through the interface, or as a download.
- Discovery's no-git path made as good as it can be without git: nested `.gitignore` files and `.git/info/exclude` read through the handle.
- The viewer and scanner in one file whose policy admits one hashed script and `'wasm-unsafe-eval'`.
- The TypeScript compiler kept (3.57 MB) or swapped for its grammars.

To install: nothing beyond a Chromium browser (Edge on Windows) for picking and writing. Firefox or Safari can read a chosen folder but not write into it. The file is about 7.2 MB plus its map.

What it cannot do:

- run git: history, `--changed`, the tracked-file rule;
- run without a person pressing the picker once and allowing writes;
- write beside the code outside Chromium;
- use the origin private file system from a page opened as a file.

### The single file that only views and saves itself, with scanning by command line

Pieces in the code:

- The Explorer, data and board in one file: the scripts inlined under a hashed policy, and the data in a block.
- A save that writes the page's own markup with its blocks filled or emptied. The probe's `blankCopy` is about ten lines.
- Something to read history written into the file.

To install: nothing to view. To scan, one of the command-line forms below.

Weight: about 1.7 MB plus the map, without the source map.

What it cannot do: map a folder by itself.

### The packaged command line

Pieces in the code:

- A command entry inside a package. Today the commands are TypeScript outside every package, run by `tsx`.
- The Explorer compiled when it is built, not on the user's machine.
- `treeSitter.ts` finding grammars beside a bundle.
- Optionally, gzipped grammars.

To install: Node 22 or later (the size of Node's Windows installer was not measured here), then about 64 MB as a package, or about 7 to 20 MB as one script. As a single executable, about 130 to 145 MB and nothing else.

What it cannot do: run where Node may not be installed, unless it is the single executable.

## What surprised

- The unchanged generator ran in a page with no change to its own code, and wrote what Node writes.
- The grammars shrink about ninefold under gzip. C#, 5.1 MB, becomes 0.30 MB.
- Most of what October counted as the viewer's scripts is the source map: 6.86 of the Explorer's 8.3 MB of script.
- The TypeScript compiler is now nine tenths of a scanning page's script.
- The packaged command line installs three.js and esbuild only to compile the Explorer on the user's machine, and does not work, because the source it compiles is not in the package.
- The origin private file system is refused to a page opened as a file, while the folder picker is offered there.
- In the page, dbatools' readers read each file about four times (7,676 reads for 2,002 files).

## Measured, and read from the code

Measured: every number in a table above unless its row says otherwise, the identity of the page's output with Node's on the estate, the policy the page ran under, and what each origin offered.

Read from the code, not run:

- that a page could read git's index and objects;
- that `'wasm-unsafe-eval'` is required;
- the price of a gzipped script;
- the 64 MB package;
- the single executable's size;
- that nothing loads without `typescript`;
- what Chromium asks when a person picks a folder and allows writing.

## The scripts

All are run from the repository root with Node 22.

| Script | What it does |
| --- | --- |
| [`build-page.mjs`](build-page.mjs) `--out <folder>` | Writes `page.html` and `sizes.json` |
| [`page-entry.mjs`](page-entry.mjs) | The page's script |
| `shims/fs.mjs`, `shims/glob.mjs`, `shims/path.mjs`, `shims/child_process.mjs`, `shims/misc.mjs`, `shims/tree-sitter.mjs` | The stand-ins for Node's modules |
| [`browser-measure.mjs`](browser-measure.mjs) `<page folder> <corpus> <origins> <steps>` | Only through `node scripts/browser-lane.mjs --label <who> -- …`. `PROBE_DUMP=<file>` keeps the page's output for comparison |
| [`compare-outputs.mjs`](compare-outputs.mjs) `<dump> <folder>` | Compares the page's output with Node's |
| [`node-generate.mjs`](node-generate.mjs) `<repository> <folder>` | One Node run, under `--max-old-space-size` if given |
| [`installed-run.cjs`](installed-run.cjs) `<install folder> <folder>` | Runs from an install of the packed packages |
| [`explorer-shares.mjs`](explorer-shares.mjs), [`node-bundle-size.mjs`](node-bundle-size.mjs) | Sizes, by package |

The dbatools corpus was cloned shallow from `https://github.com/dataplat/dbatools` at `067b215b` (the cold run's commit), and copied without `.git`. So in both the page and Node, discovery fell back to the root `.gitignore`.

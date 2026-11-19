# Where the generator's index pass spends its time

Current as of November 19, 2026. A builder measured this for the root, read-only, at `b55cc081`. Nothing under `packages/` or in `.live-docs.config.json` changed. It follows [the history-rebuild probe](../history-rebuild-cost/README.md), whose section 1 called the index pass undiagnosed. It also follows [the generation-cost probe of October 19](../../../../10/2026-10-19/Probes/generation-cost/README.md), which found a pause of about 2.5 s after the PowerShell adapter.

**Answer.** About two-thirds of the index pass's wall time is a single wait, and it is not parsing. It begins after the first few PowerShell parses. V8 decides a function in the PowerShell grammar's WebAssembly is hot and compiles it with its optimizing compiler, TurboFan. That compile takes **5–11 s of one background thread's processor time**. The main thread sits blocked with no processor time until it ends.

Running the same generation with `node --liftoff-only` changes three things:
- The pause disappears.
- The index pass falls from 10.0–17.7 s to 4.3–4.7 s of wall time, and from 14–25 to 7.8–8.1 processor-seconds.
- Peak memory falls by 150–200 MB.

Every remaining cost is small beside that.

## How it was measured

**The trees.** Three commit trees were written with the history's own writer, `workingTree` of the built `git.js`, into the scratch folder:
- `87b9e7b5`, early: 534 files rendered;
- `535ceefc`, middle: 858 files;
- `b55cc081`, head: 1,091 files.

**The runs.** Each tree was generated with the built `generateLiveDocs` in a process of its own, in the tree's git environment, under the head's configuration. The final table set uses `dryRun` (no doc writes, no graph read or write). Old trees' committed docs fail today's graph reader, and the index and analysis passes do not depend on the write.

**The driver** recorded the following, all from outside the engine:
- **Phase boundaries**, by wrapping the writable CommonJS exports `buildWorkspaceIndexes`, `discoverTargetFiles`, `discoverDocuments`, `analyzeSourceFile`, `analyzeWithLanguageAdapters` and each adapter's `analyze`.
- **Every read**, by wrapping `fs/promises.readFile` and `fs.readFileSync`.
- **Processor time.** `process.cpuUsage()` for the process, and `/proc/self/task/*/stat` for each thread, at every boundary.
- **A profile** from `node --cpu-prof --cpu-prof-interval 500`, whose samples were aligned to the driver's clock by a named busy-loop marker (offset about 1 ms).

**Attributing the samples.** Each sample was classed by its stack:
- `createSourceFile` → TypeScript parse;
- WebAssembly frames → tree-sitter parse;
- `collectDependencies` / `augmentWithReExportedSymbols` → resolve;
- adapter files → extraction;
- `(idle)`, `(garbage collector)` and `(program)` as V8 names them.

**Per-language figures.** The index pass is sequential, so each file owns the window from its first read or adapter call to the next file's.

**The pause, isolated.** A separate script parsed one PowerShell script with the grammar, then timed the next `setImmediate`, with each thread's processor time around it.

**Load.** The machine's load average was 10–16 throughout, from other builders on its 20 threads. Main-thread figures under that load run 10–30% slower than on an idle machine, and one earlier head run at load 15 took twice as long in its analysis pass. Read processor seconds and the with/without comparison, not single wall times.

## 1. The index pass decomposed

These are main-thread profile seconds in the index pass, so they sum to its wall time. Each column pair is default flags / `--liftoff-only`, one run each, back to back.

| Kind of work | Early (534) | Middle (858) | Head (1,091) |
| --- | ---: | ---: | ---: |
| **Waiting with nothing to run** (`(idle)`) | 13.41 / 0.37 | 12.41 / 0.40 | 6.07 / 0.41 |
| TypeScript parse (`createSourceFile`) | 2.26 / 2.04 | 2.97 / 2.29 | 2.34 / 2.65 |
| tree-sitter parse (all grammars) | 0.21 / 0.23 | 0.32 / 0.23 | 0.18 / 0.21 |
| Adapter extraction (JSON largest, 0.14–0.37) | ~0.6 / ~0.5 | ~0.5 / ~0.5 | ~0.5 / ~0.5 |
| TypeScript symbol extraction | ~0.15 / ~0.15 | 0.21 / 0.16 | ~0.13 / ~0.15 |
| Reading files (node fs internals) | 0.23 / 0.23 | 0.28 / 0.23 | 0.21 / 0.23 |
| Grammar load and WebAssembly instantiation | ≤0.05 | ≤0.05 | ≤0.05 |
| **Index pass wall** | **17.73 / 4.25** | **17.68 / 4.34** | **9.99 / 4.72** |
| Index pass processor s (all threads) | 24.57 / 7.82 | 25.30 / 8.00 | 14.27 / 8.07 |
| of which the main thread | 5.04 / 4.00 | 5.96 / 4.05 | 4.18 / 4.42 |
| of which V8's unnamed worker threads | 16.80 / 2.95 | 16.60 / 3.04 | 8.88 / 2.82 |

Notes:
- **The profiler's own thread** took a further 0.5–2.5 s.
- **Resolution** inside the index pass, the re-export providers' dependencies, is under 0.1 s. Resolution is a cost of the analysis pass: 0.73 s at the head.
- **Loading a grammar is cheap**, measured alone: PowerShell 64 ms, C# 71 ms, C++ 106 ms, Python 39 ms, each including runtime start the first time.
- **By file window at the head** (default flags): 660 TypeScript/JavaScript files took 8.2 s, of which 5.4 s was the wait, charged to `scripts/oracle/powershell-edges.test.ts`, the file after `powershell-ast.ps1`. The 44 C/C++ files took 0.96 s, of which 0.83 s was a smaller wait of the same kind after the C++ grammar. The 59 C# files took 0.42 s, of which 0.2 s was waiting. Every other language was under 0.25 s in all.

**Whole generation** (dry run):

| | Early | Middle | Head |
| --- | ---: | ---: | ---: |
| Wall, default / Liftoff-only (s) | 25.1 / 11.8 | 25.4 / 9.8 | 19.2 / 14.2 |
| Process processor s, default / Liftoff-only | 35.4 / 18.8 | 37.1 / 16.1 | 25.7 / 19.6 |
| Analysis pass wall, default / Liftoff-only | 6.7 / 6.8 | 6.6 / 4.7 | 7.0 / 7.1 |
| Discovery (target files) | 0.2 | 0.5 | 1.5 |

## 2. The PowerShell pause

**It is still there, and larger.** It lasted 5.0–6.1 s at the head in four runs, and 10.8–11.1 s at the early and middle commits, under load 10–16. October measured about 2.5 s on a quieter machine.

**What it is.** It is a TurboFan compile of a WebAssembly function in the PowerShell grammar, made hot by the first parses. Isolated, two parses of the 23 KB `powershell-ast.ps1` take about 120 ms. The next event-loop turn then takes:
- **11–13 s of wall time.** One V8 worker thread burns all of it (10–13 s processor time) while the main thread uses none.
- **2 ms under `--liftoff-only`.**
- **Under `--no-liftoff`**, the same 10.8 s lands on the main thread inside the parse instead.

**Which grammar.** The engine's patched build and the bundled `@vscode/tree-sitter-wasm` grammar behave alike, so it is not our patch. Which function it is (likely the generated lexer) was not confirmed by name. Why the main thread blocks rather than running on was not established.

**It is not** a garbage collection, a file read, the grammar's load (64 ms) or anything in the adapter's JavaScript.

**The C++ grammar** shows a smaller pause of the same kind, 0.5–1.2 s.

**What Liftoff-only costs.** Without TurboFan, parsing PowerShell is about half as fast: 20 parses took 609 ms against 326 ms. At this repository's 17 PowerShell files that is a few tens of milliseconds.

**Across a history rebuild** of 1,224 per-commit processes, 5–11 s each is about **1.7–3.7 processor-hours of a 22-hour rebuild**, wherever a PowerShell file exists at that commit.

## 3. Work done twice

**Every TypeScript and JavaScript file is parsed twice:**
- once by the index pass, 2.0–2.7 s;
- once more by `analyzeSourceFile`, 1.0–1.9 s;
- and providers are parsed again inside `augmentWithReExportedSymbols`.

One parse per file would save the second, about **1.0–1.9 s of main-thread time per generation** (5–10% of a Liftoff-only generation). That needs either keeping every AST alive between the passes, which costs memory (not measured; October found its symbol-only reuse raised memory), or the extraction seam that does not exist yet.

**Adapters.** Each adapter runs in both passes. Most cache their own facts within the process, so the second call is cheap: all adapters together took 0.15 s at the head in the analysis pass, against about 1.9 s in the index pass, almost all of which was the pauses.

**Reads.** At the head (dry run), 2,213 distinct workspace paths were read with 3,561 calls. 944 were read more than once:
- every TypeScript file twice;
- C# and C headers three times;
- some JSON four times.

In a writing run, every existing Live Doc is also read twice: once to keep its authored block, once by the graph reader. All reading together is about 0.2 s of the index pass and 0.5–0.9 s of the analysis pass. Reading a file once would save well under a second.

## 4. How it grows with files

All figures are Liftoff-only, so the pause does not mask them:

| | Early | Middle | Head |
| --- | ---: | ---: | ---: |
| Files rendered | 534 | 858 | 1,091 |
| Index pass wall / processor s | 4.25 / 7.8 | 4.34 / 8.0 | 4.72 / 8.1 |
| TypeScript parse in the index pass | 2.04 | 2.29 | 2.65 |
| Analysis pass wall | 6.8 | 4.7 | 7.1 |

**Fixed per process:**
- the TurboFan pauses, 5–11 s at default flags. They grow with no file count, only with whether a PowerShell (or C++) file is parsed at all;
- grammar loading, under 0.4 s for every grammar together;
- module loading, under 0.1 s;
- a baseline of about 200 MB of memory.

**Grows with files:** the TypeScript parses, in both passes, and the analysis pass's resolution and composition. The TypeScript parse grew about 30% from 534 to 1,091 files. The analysis pass's wall time is too noisy under this load to give a slope. The early tree has many large benchmark fixtures, so file counts and bytes do not move together.

## 5. Memory

Peak resident memory of a dry-run generation:

| | Early | Middle | Head |
| --- | ---: | ---: | ---: |
| Default flags | 424 MB | 385 MB | 403 MB (497–510 MB writing, with the profiler) |
| Liftoff-only | 224 MB | 232 MB | 253 MB |

**Most of the default figure is the compiler.** Without the TurboFan compile, the process sits near 220–250 MB.

**Per file.** Between 534 and 1,091 files, Liftoff-only peak memory grew by about 30 MB, which is roughly 50 KB per file above a baseline near 200 MB. That is a rough slope from three points under load. At that rate even 20,000 files would stay near 1.2 GB, comfortable on an 8 GB machine. An AST cache between the passes (section 3) would change this slope and was not measured.

## 6. What follows

**A plain waste, with every result identical: stop the TurboFan pause.**
- **How.** Run the summarizing process and the generator with WebAssembly's optimizing tier off:
  - Node's `--liftoff-only` flag or `--no-wasm-tier-up` on the processes the tool forks;
  - `NODE_OPTIONS` for the CLI;
  - or `v8.setFlagsFromString` before the first grammar loads, which needs no change to how the tool is launched.
- **Why results stay identical.** It changes only how V8 compiles the grammar's machine code, never what the parser produces.
- **Saves.** 5–11 s of wall time and 7–17 processor-seconds per process, and 150–200 MB of memory. Across a history rebuild that is about 2–4 processor-hours of 22.
- **Cost.** One line and a comment saying why. A test can only watch timing, so its protection is the oracle comparison plus a measurement note.
- **Check before landing.** That `--no-wasm-tier-up` gives the same relief as `--liftoff-only`; only the latter was measured. And that a repository heavy in PowerShell or C++ parses fast enough on Liftoff alone: 2× slower per parse, about 16 ms per 23 KB script.
- **Do this first.**

**Small and safe, small gain: parse each TypeScript file once.** About 1–2 s of the remaining ~14 s per process. The cost is either holding every AST between the passes (memory on the 8 GB machine, unmeasured) or splitting extraction from resolution. Not worth it alone.

**What a store of per-version results could reach.**
- **What it could reach.** After the pause is gone, the per-file part of the index pass is about 2.0–2.7 s of TypeScript parse, 0.2–0.3 s of tree-sitter parse and about 0.6 s of extraction. Add the analysis pass's 1.0–1.9 s of second parse: at most about **4–5 s of a 10–14 s process**, with the resolution and composition left to run every time.
- **What it could not reach.** Discovery (0.2–1.5 s), resolution (0.7 s), composition, Cited By, process start, and the whole-tree facts listed in section 4 of the history-rebuild probe.
- **Cost.** The full seam the history-rebuild probe describes: a serializable form of unresolved facts for every adapter, a store keyed by blob and analyzer, and a resolve-only pass. And October's lesson, that a cached fact can secretly depend on its neighbours.
- **Verdict.** Do not build it now. Remove the pause, write only what is read (the history-rebuild probe's shape (i)), and measure a rebuild again. The store is a large change for perhaps a third of what remains.

**What I would not build:** a read cache (well under a second), and an AST cache between the passes, until its memory is measured.

## Not measured

- **An idle machine.** Every run was at load 10–16, one run per configuration in the final set. Treat the wall times as indicative.
- **`--no-wasm-tier-up`, and V8's heuristics.** Its effect, and whether the tier-up threshold or a flag such as `--wasm-dynamic-tiering` alone avoids the pause.
- **The function.** The name of the WebAssembly function being compiled, and why the main thread waits on its compile.
- **Memory of an AST cache** between the passes.
- **Writing runs at old commits.** Today's graph reader rejects the old commits' committed docs, so the older trees ran as dry runs. The writing run's graph phases (about 0.6 s at the head) were measured only there.
- **The history's own summarizing process.** It forks the generator through `summarizeChange`, which was not run here. Its process start and text store are outside these figures.
- **The C# and C++ grammars' tier-up costs** on repositories larger than this one.

# Why a history rebuild is slow on this machine, and what would make it fast

_A record of November 20, 2026 (UTC), not current documentation. Measured by a builder for the root in its own worktree at `21b6e602` (the lens `b4294caf0e7d629f`, the same key as the main checkout's cache), under Node 26.13.1, on the i9-10900K (10 cores, 20 threads, 62 GB) inside WSL2. Nothing under `packages/` or `scripts/` changed; the one code change is a test's (section 8). Every machine-loading run went through the browser lane. Beside each run are the load average before it and what other processes took during it, from the machine's counters. Everything here was run by the builder, unless it is marked as someone else's figure. The measuring scripts are kept beside this file (section 9)._

**Answer.**
- **Today's command on this machine** regenerates the sample at 3.2 s a commit at 14 at a time: about **71 minutes for the whole line**, plus 1.8 minutes that every run pays even with nothing to regenerate. (Last night's whole rebuild took 105.8 minutes at 14 under Node 22, the root's figure, on a busier machine.)
- **What the processes wait for is the history command's own process.** It writes every commit's tree, all of them on its one main thread (2.4 s of that thread a tree on average, and as much again of libuv's threads in system calls). So the pool's size hardly matters above six: 3.6 s a commit at six, 3.1 at fourteen, and no size can go below about 2.5 s a commit (55 minutes for the line) while the trees are written there.
- **Behind it, the processor cores.** Twenty logical processors are ten cores. With the trees taken out of the command's process, ten lanes pinned one to a core do as well as fourteen spread over all twenty, and the same summaries cost 10.8 processor-seconds a commit alone and 29–31 at fourteen to twenty. The disk, the file system, memory, git and V8's background threads are not the limit (each removed in turn, section 2).
- **A process pays afresh** its start-up (0.4 processor-seconds built, 1.7 under tsx), V8's compiling of the hot TypeScript parser (2.9–5 processor-seconds on its worker threads) and its own warm-up. Measured all at once, long-lived workers make every summary after a worker's first **a third cheaper**. A third of a process's main-thread work (31–37 %) is a function of one file's bytes alone, mostly the TypeScript parse, which runs twice for every TypeScript file.
- **Ranked** (section 6), each with an estimate for the line on this machine:
  1. **long-lived workers that write their own trees**: about 47–51 min, a rebuild;
  2. **a synchronous tree writer inside them**: about 42 min, riding with 1;
  3. **the fixed cost**: about 2 min to under 45 s for every warm run, and no rebuild;
  4. **an in-memory memo of the bytes-only work**: about 33–36 min, high cost and risk;
  5. **the pool's size and flags alone**: under 10 %;
  6. **a store of per-version results on disk**: last; it shares 4's ceiling and helps a lens change least.
- **Every summary made in every run tonight was the oracle's**, byte for byte, with every text (each run's 60 and 7,186; 30 each for the two halves of the one-at-a-time run).

## How it was measured

- **The pool, as the history runs it.** `pool-driver.cjs` calls the built `regenerate` (`packages/generator/dist/history/regenerate.js`) on a list of commits into a scratch cache, with the history's own scratch folders, tree writer, task and environment. It patches `child_process.fork` only to add `--require measure-child.cjs` (and, for an experiment, node flags) to each summarizing process. `--mode tsx` starts the TypeScript `summarizeChange.ts` under tsx's loader, as `npm run live-docs:history` does; otherwise the built JavaScript runs, which is what lets the preload wrap the passes (tsx defines a module's exports as getters that cannot be wrapped). `--tree-in-process` writes each tree with the same writer in a small process of its own (`tree-writer.cjs`).
- **Inside each summarizing process** (`measure-child.cjs`): node's start-up marks, the main module's loading, wall and processor time inside the generator's passes (by wrapping the writable CommonJS exports of the engine's and generator's modules), each adapter's `analyze` in each pass, each grammar's load, and at each boundary and at exit every thread's processor time and its time waiting on a run queue (`/proc/self/task/*/stat` and `schedstat`), git's time (`/proc/self/stat` of waited children) and the peak resident memory.
- **Around each run:** the machine's processor counters (`/proc/stat`), the disks' counters, the pool process's own threads, and the load average before it. "Others' processor s a second" is the machine's user and system time less everything the run itself accounted for, over the wall: what other builders took meanwhile.
- **A fixed sample** of 60 commits spread evenly over the line of 1,333 (`sample-60.txt`, positions `round(i × 1332 / 59)`), the same for every run, each run into a fresh scratch cache and a fresh private `TMPDIR` under `/tmp/claude-1000/rs` (the container's overlay file system), unless said otherwise.
- **The oracle.** After every run `same-summaries.cjs` held each summary, unzipped, and each text of the scratch store to the main checkout's cache byte for byte. Every run below matched: 60 of 60 summaries and 7,186 of 7,186 texts (30 for each half of the one-at-a-time run; 1 for each run of a single commit).
- **The lane.** Every run that loads the machine went through `scripts/browser-lane.mjs`. The lane was busy with four other builders' browser gates for most of the night; to get the runs done, from bundle A on several runs shared one hold, each hold under its 900 s cap (`sweep.sh` with `IN_LANE=1`). A load average read at a run's start mostly shows the tail of the run before it, mine or another's; the counters say what ran meanwhile.

## 1. One commit's anatomy under Node 26

The early, middle and head commits of the November 19 probes, one at a time, the built JavaScript, the tree written by the pool's process (`pool-driver.cjs --jobs 1`; table by `anatomy-table.cjs`). Others took 1.4, 0.1 and 0.1 processor-seconds a second during them; the head was also run once earlier at a load of 1.5 (others 0.8), the right-hand figures.

| Phase | `87b9e7b5` (100th), wall / processor s | `535ceefc` (612th) | `21b6e602` (head) | head, earlier run |
| --- | --- | --- | --- | --- |
| The tree, written by the pool's process (its processor time, without git's) | 1.73 / 1.79 | 1.97 / 2.01 | 4.66 / 5.01 | 5.08 / 5.47 |
| Process start to the main module | 0.05 / 0.06 | 0.04 / 0.04 | 0.03 / 0.04 | 0.03 / 0.04 |
| Module loading (built JavaScript; under tsx 1.2–1.5 s and 1.7 s) | 0.42 / 0.50 | 0.33 / 0.39 | 0.32 / 0.38 | 0.33 / 0.39 |
| The committed mirror's authored blocks read | 0.16 / 0.19 | 0.16 / 0.21 | 0.20 / 0.25 | 0.21 / 0.26 |
| Discovery: the walk, `git check-ignore`, the nested scans | 0.15 / 0.23 | 0.29 / 0.28 | 1.48 / 0.63 + git 1.3 | 1.44 / 0.59 + git 1.4 |
| The index pass | 1.69 / 3.88 | 2.03 / 4.06 | 2.95 / 5.59 | 3.48 / 6.55 |
| Documents read for Cited By | 0.11 / 0.15 | 0.19 / 0.23 | 0.44 / 0.42 | 0.72 / 0.69 |
| The analysis pass: each file analysed, composed, rendered, read back, written | 2.65 / 3.05 | 3.23 / 3.65 | 4.47 / 5.06 | 6.94 / 8.10 |
| The graph read back from the docs and written | 0.13 / 0.20 | 0.23 / 0.34 | 0.32 / 0.55 | 0.38 / 0.62 |
| The index read, the standing files (`git ls-files`), the summary | 0.08 / 0.09 | 0.14 / 0.18 | 0.24 / 0.33 | 0.27 / 0.36 |
| The text store, empty at the start (575, 2,408 and 3,628 texts written) | 0.31 / 0.32 | 1.01 / 0.98 | 1.59 / 1.69 | 1.50 / 1.60 |
| **The summarizing process** | **5.77 / 8.68** (user 6.83, system 1.85) | **7.69 / 10.40** (7.98, 2.42) | **12.11 / 14.98** (11.75, 3.23) | **15.35 / 19.24** (15.36, 3.88) |
| of which the main thread / V8's four worker threads / libuv's four | 4.74 / 2.89 / 0.95 | 6.00 / 2.90 / 1.39 | 8.97 / 4.01 / 1.89 | 12.06 / 4.95 / 2.15 |
| Peak resident memory | 509 MB | 557 MB | 548 MB | 545 MB |

- **Each grammar loads in 2–25 ms** (PowerShell, C#, C++, Go, Java, Python, Rust). There is no wait on the WebAssembly compiler under Node 26: the head's index pass is idle 0.23 s of its 3.53 (section 5's profile), where Node 22 waited 5–13 s (November 19's index-pass probe).
- **V8's worker threads take 2.9–5 processor-seconds a process**, most of it during the index pass (2.1–3.1 s): compiling the TypeScript parser's JavaScript as it gets hot, and the garbage collector. Every process pays it again.
- **The same commit varies by a quarter between runs** (the head's two columns: 12.1 against 15.4 s, the analysis pass 4.5 against 6.9 s). Read single runs as ±25 %; the sweep's 60 commits average it out.

## 2. Throughput against the number of processes

The 60-commit sample at each pool size, the built JavaScript, the trees written by the pool's process as the history writes them (`sweep.sh <label> sample-60.txt <jobs>`; table by `sweep-table.cjs`). "A commit's own wall" is from the start of its tree to its summary; "processor s a commit" is the summarizing process's user and system time, git's (the process's and the tree's), and the pool process's.

| Jobs | Load before | Wall (s) | **Wall a commit (s)** | A commit's own wall: tree + process (s) | Processor s a commit: process user / system; git; pool process | A process's main thread: on a processor / waiting for one (s) | Pool process's main thread busy | Machine busy | Others' processor s a second | Peak MB |
| ---: | --- | ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: |
| 1 | 2.3, 2.2 (two halves of 30) | 659.6 | **10.99** | 2.7 + 8.1 | 8.6 / 2.2; 0.9; 3.2 | 6.4 / 0.0 | 15 % | 11 % | 0.61 | 581 |
| 2 | 8.1 | 415.8 | **6.93** | 3.5 + 10.1 | 10.7 / 2.7; 1.1; 3.5 | 8.1 / 0.0 | 26 % | 17 % | 0.41 | 586 |
| 4 | 2.4 | 244.2 | **4.07** | 4.3 + 11.5 | 12.4 / 3.1; 1.3; 4.3 | 9.3 / 0.0 | 54 % | 30 % | 0.24 | 588 |
| 6 | 9.0 | 215.1 | **3.58** | 6.1 + 14.4 | 15.8 / 3.7; 1.6; 4.9 | 11.9 / 0.0 | 69 % | 40 % | 0.17 | 587 |
| 10 | 11.6 | 203.2 | **3.39** | 12.8 + 18.4 | 19.9 / 4.2; 1.8; 5.0 | 15.0 / 0.3 | 74 % | 50 % | 0.44 | 567 |
| 14 | 2.5 | 187.4 | **3.12** | 18.4 + 20.2 | 21.0 / 4.3; 1.9; 4.8 | 15.7 / 1.1 | 75 % | 54 % | 0.11 | 593 |
| 14, under tsx: **today's command** | 2.2 | 190.6 | **3.18** | 17.8 + 21.4 | 22.7 / 4.2; 1.9; 4.8 | 16.8 / 1.3 | 74 % | 56 % | 0.15 | 644 |

The high loads before 2, 6 and 10 are the tails of the holds before them (my own 14 before 10; other builders' gates before 2 and 6); the last column, under one processor's worth in every run, is what others took during the run itself.

What the curve says:
- **It is flat from 6 to 14**: 3.6, 3.4 and 3.1 s a commit, while the processes' own processor time rises from 19.5 to 25.3 s a commit and the machine stays half idle (40–54 % busy).
- **The pool's own process is what they wait for.** Its main thread is busy 69–75 % of the run at 6 to 14, averaged over the whole run with its ramps at either end, and a commit's wait for its tree grows from 3.5 s at two to 18.4 s at fourteen, while the tree alone takes 1.7–5 s. The pool process writes every tree, all of them on its one main thread and libuv's four threads: 2.4 s of main-thread time and 2.3 s of libuv's (almost all of it system time) a tree, on average over the sample. 60 trees are 145–150 s of that one thread, so no pool size can take the sample below about 2.5 s a commit: over the 1,333 commits, about **55 minutes is the floor of the present design on this machine**, whatever the pool's size.
- **The processes themselves slow down as they multiply**: the same summaries cost 13.4 processor-seconds a commit at two, 19.5 at six, 24.1 at ten and 25.3 at fourteen; the main thread's own time 8.1 → 15.7 s, with little time waiting on a run queue (0–1.1 s). The work itself grows, not the wait: the symptom of two threads sharing a core (20 logical processors are 10 cores), a lower all-core clock, and a shared cache and memory bus. The experiments below take these apart.

**Removing one suspect at a time**, the same sample, the built JavaScript unless said (`sweep.sh` with the driver's options; `warm-driver.cjs` for the last two rows). "Tree writers" is the processor time of the processes that wrote the trees, node and git together.

| Run | What it removes or changes | **Wall a commit (s)** | Tree + process (s) | Processor s a commit: process user / system; tree writers or git; pool | Main thread on a processor / waiting (s) | Machine busy | Others' s a second |
| --- | --- | ---: | --- | --- | --- | ---: | ---: |
| 14, as the history runs | (the row above) | **3.12** | 18.4 + 20.2 | 21.0 / 4.3; 1.9; 4.8 | 15.7 / 1.1 | 54 % | 0.11 |
| `--tree-in-process`, 14 | the pool's process writes no tree: each is written by a small process of its own (`tree-writer.cjs`) | **2.92** | 10.9 + 25.0 | 24.4 / 4.5; 10.8; 1.0 | 18.4 / 2.5 | 77 % | 0.90 |
| the same under tsx | as above, the summarizing process under tsx | **2.94** | 11.1 + 26.1 | 26.6 / 4.4; 11.1; 0.9 | 19.7 / 2.3 | 77 % | 0.25 |
| `--tree-in-process`, 20 | as above, 20 at a time | **2.50** | 12.8 + 31.3 | 26.6 / 4.1; 10.9; 0.9 | 19.6 / 8.0 | 89 % | 0.48 |
| `--tree-in-process`, 10, pinned one to a core | `taskset -c 0,2,…,18`: ten logical processors, one on each core, so no two threads share a core | **3.03** | 9.0 + 19.2 | 16.4 / 2.9; 7.4; 0.6 | 12.1 / 3.8 | 48 % of 20 (96 % of the 10) | 0.38 |
| `--tree-in-process --flags --single-threaded`, 14 | V8's background threads (compilers, garbage collector): their work moves onto the main thread | **2.86** | 9.3 + 26.8 | 23.2 / 4.3; 11.0; 1.0 | 22.7 / 0.5 | 72 % | 0.06 |
| `--tree-in-process`, 14, trees on ext4 | the trees on the worktree's ext4 volume instead of `/tmp`'s overlay | **3.06** | 11.3 + 26.5 | 25.3 / 4.0; 10.6; 0.8 | 18.8 / 3.9 | 82 % | **2.43**: overlapped by another builder; see the tree writer below |
| long-lived workers, 14 | each of 14 processes starts once and makes about four summaries in turn (shape (b), built only to measure); trees written by processes of their own | **2.39** | 10.3 + 19.9 | 16.6 / 3.7 (the worker's whole process) | not taken | not taken | not taken |
| long-lived workers, 10 | as above, ten workers, six summaries each | **2.76** | 8.5 + 17.1 | 14.7 / 3.8 | not taken | not taken | not taken |

**The long-lived workers, commit by commit.** In the run at 14, each worker's first summary cost what a fresh process costs for the same commit (17.6 processor-seconds on average over those 14 commits, against 17.7 in the `--tree-in-process` run). Every later summary cost **a third less**: 21.2 against 32.4 processor-seconds for the same 46 commits, 21.6 against 28.2 s of wall. A worker's resident memory after four to six summaries was 435–530 MB. Its summaries, like every run's, were the oracle's byte for byte: the one hazard of section 7 that could silently change a summary, the inherited git environment, was met by giving each task its own before it ran.

**The tree writer alone** (`sync-tree-bench.cjs`, `tree-bench.cjs`; one hold, load 1.6–4.9, nothing else of mine running):

| | `87b9e7b5` (1,213 files) | `535ceefc` (3,020) | head (7,962) |
| --- | --- | --- | --- |
| The history's writer, alone: wall / its processor s + git's | 1.28 / 1.33 + 0.17 | 3.03 / 3.23 + 0.39 | 6.33 / 6.60 + 0.83 |
| The same tree written with synchronous calls, one thread (a measurement, not the writer's rules) | 0.38 / 0.44 | 0.75 / 0.91 | 3.62 / 5.56 |
| The two trees compared, file by file (names, bytes, executable bits) | identical | identical | identical |

At the head the synchronous probe's own buffering of large blobs (it joins each chunk to the blob so far) is quadratic in a blob's size; the archives at the head are the large ones, so its head figure is a bound, not the writer's floor. The head's tree, written by the history's own writer in one process:

| One process writing the head's tree | Wall (s) | Main thread: user + system (s) | libuv's four threads (s) | git (s) |
| --- | ---: | --- | ---: | ---: |
| 1 tree, `/tmp` (overlay) | 7.58 | 2.87 + 1.59 | 3.15 | 0.93 |
| 1 tree, ext4 | 7.89 | 2.83 + 1.66 | 3.29 | 1.03 |
| 8 trees at once, `/tmp` | 25.42 (3.2 a tree) | 13.96 + 11.21 | 18.04 | 8.32 |
| 8 trees at once, ext4 | 22.27 (2.8 a tree) | 11.95 + 9.98 | 13.55 | 7.21 |
| 8 trees at once, `/tmp`, `UV_THREADPOOL_SIZE=16` | 19.79 (2.5 a tree) | 10.55 + 9.05 | 14.14 | 6.56 |

What the processes contend for, and how it is known:
1. **The pool's own process, first.** Every tree is written there, on one main thread and libuv's four threads. The flat curve from 6 to 14, the main thread busy three quarters of every run, and a commit waiting 18 s for a tree that takes 2–5 s alone all say so; taking the trees out of that process takes its main thread from 75 % to 9 % busy and a commit's wait for its tree from 18.4 to 10.9 s. The writer's cost is its asynchronous handling of many small files, not the disk: a synchronous writer of the same tree uses a third to a quarter of the processor time, and ext4 against the overlay changes a single tree by 4 % and eight at once by 12 %.
2. **Then the processor cores.** With the trees out of the pool's process the machine is 77–89 % busy, and the same summaries cost 29–31 processor-seconds a commit at 14 to 20, against 10.8 alone. Ten lanes pinned one to a core (no core shared by two threads) make 3.03 s a commit with half the logical processors, against 2.92 with 14 lanes over all 20, and 2.50 with 20 lanes: the second thread of each core adds about a fifth when everything is busy, while making every thread's work cost about half as much again. Time waiting on a run queue stays small (0.5–8 s of a 20–31 s process): the processes do not wait for a processor so much as run slower on a shared one.
3. **Ruled out**, each by its run: V8's background threads (`--single-threaded`: 2 % faster, the work only moves to the main thread); the file system (above); the disk, so far (`iowait` 0.6–6.8 s a run up to 14 at a time, 15 s at 20; the container's disk busy 2–18 % of the wall, 36 % at 20; the same 60 trees put 1.1 GB on the device at two at a time, 3.9 GB at fourteen and 5.9 GB at twenty, since a tree that lives past the page cache's 30 s writeback reaches the disk before it is removed: at twenty the disk is the next thing to watch); memory (peaks of 0.5–0.65 GB a process, no swapping); git (1–2 processor-seconds a commit); the WebAssembly compiler's wait of Node 22 (no grammar takes over 25 ms to load, and no idle wait shows in the index pass).

## 3. The pool, and the hosted runner

**How it sizes itself today** (`poolSize` and `usableMachine` in `computeHistory.ts`, read): `--jobs` when given; otherwise the smaller of the processors less one (`os.availableParallelism()`, which counts logical processors) and half the memory (the control group's limit where lower) divided by the largest peak a summarizing process was measured to take under the lens, which `pool.json` beside the caches records (768 MiB before any was measured). Here, by the main checkout's record of 604 MB: the smaller of 19 and 62.7 GB / 2 / 604 MB = 51, so **19**. On the hosted runner (4 processors, 16 GB): **3**.

**What this machine does best at**: with the trees written by the command's process, any size from 6 up gives 3.1–3.6 s a commit (19 was not reached tonight; the flat curve puts it near 3.1), and no flag measured moves it by more than a few per cent. With the trees out of that process, 20 lanes were best (2.50 s a commit, against 2.92 at 14 and 3.03 at 10 pinned to the cores), so the present rule's 19 is right there. Memory is far from the limit at any size (0.5–0.65 GB a process). The rule's count of logical processors is right for throughput but not for each process's speed: past one process a core, every summary costs about half as much processor time again.

GitHub's API lists the Pages runs and their steps without a token, but refuses their logs (`Must have admin rights to Repository`), so the hosted runner's per-commit times could not be read. What the steps say:

| Run | Commit | The history step | What it did |
| --- | --- | ---: | --- |
| 277 | `86ba38c3` | 50.0 min | the whole line under the new lens `b4294caf0e7d629f` (the root's figure: 1,321 commits) |
| 278 | `a22f7aaf` | 1.1 min | a few new commits on a full cache |
| 279 | `69af42cd` | 2.1 min | a few new commits on a full cache |
| 276 | `2af0289b` | 120.3 min | an earlier lens (not read further) |

Command: `curl -s https://api.github.com/repos/<owner>/<repo>/actions/runs/<id>/jobs` and the step's `started_at`/`completed_at`.

## 4. The command's fixed cost

The real command, `npm run live-docs:history -- --check-head`, in this worktree with the oracle's cache copied in (`.mdmd/history/b4294caf0e7d629f/`, 1,333 summaries), each progress line timed by `stamp.cjs`. The first run had one commit to regenerate (this worktree's own new head, `926f1972`), the second none; the second ran under `--cpu-prof` (1 ms), which costs a little.

| Phase (what the progress line follows) | Run 1, load 1.9 (s) | Run 2, load 3.2, profiled (s) |
| --- | ---: | ---: |
| Start, the generator's identity, the mainline, and `uncached`: every summary read, unzipped and parsed, every text it names read and held to its hash | 18.7 | 21.3 |
| Regeneration | 17.8 (one commit) | 0 |
| `buildSequence`: every summary read again, `git diff --name-status -M50% -l0` between each two, every step derived and its replay held to what it was derived from | 79.1 | 78.9 |
| The head check: the head's tree written, its committed Live Docs read back | 5.4 | 6.9 |
| The words of every step, the sequence written | 1.8 | 2.0 |
| **Whole command** | 122.8 (user 122.3 s, system 35.0 s, with the child) | 109.0 (user 119.4 s, system 54.8 s) |

Where run 2's main thread went, from its profile (`profile-top.cjs`, self time unless marked):

| Work | s |
| --- | ---: |
| Parsing the summaries' JSON (self time of `readSummaryFile`), twice over | 20.0 |
| Unzipping them (`processChunkSync` of zlib), and the buffers around it | 7.4 + 2.3 |
| `spawn`: starting 1,333 git processes from a process holding a large heap (the cost is most likely the fork of that heap's page tables; not traced) | 17.0 |
| Deriving each step's rows and holding the replay to them (`rows.ts`: `same`, `deriveSymbols`, `rowsDifferences`, `rowsAgainstShape`, `deriveRowsChange` and their closures) | about 20 |
| Shapes (`shapeOfSummary`, `directoriesOf`, `renameShape`) | about 7 |
| Garbage collection | 6.3 |
| Idle (waiting on git and the disk) | 4.6 |

The same 1,333 `git diff` calls, made one after another from a small process (`diff-cost.cjs`), take **5.6 s** of wall clock and 4.5 s of git's processor time (2.7 s eight at a time). So about 12 of the 17 s is the fork from a large process, not git.

What of it every run must do, and what it could stop doing:
- **Reading every summary twice** (about 15 s each time): once to know what is missing or damaged before regenerating, once to build the sequence. Once is enough if the first reading keeps what the second needs, or if the check of the texts is folded into the build.
- **The git word between each two commits** never changes for a pair of commits, so it could be asked of one long-lived git (`git diff-tree --stdin` takes the pairs on its input) or remembered beside the cache. Either saves about 17 s. `changesBetween` lives in `git.ts`, which keys the lens, so this rides with the next rebuild.
- **The replay of every step and its check** is the guard that a sequence on disk replays to what it was derived from. When a run only appends commits to a line whose sequence was already written and checked by the same reading code, the earlier steps' derivation and check repeat work already done: a sequence that resumed from the last one written would cost a few seconds. That is a design decision (what keys the reuse of a written sequence: the lens, the sampling, the line, and the code that reads summaries into a sequence), not a measurement.
- **The head check** (5–7 s) writes the head's tree only to read its committed Live Docs, which `git show` or `cat-file` could read from the object store directly; the check itself is wanted.

## 5. What a process pays afresh, and what is a function of one file's bytes

**Measured inside the passes**: each of the three anatomy commits ran once more under `--cpu-prof --cpu-prof-interval 500` (`anat-*-prof`), and `classify-profile.cjs` put every main-thread sample in a class by the most specific frame of its whole stack (a resolution called from a parse is the resolution's; a parse called from the re-export reader is the reader's), and in a pass by the preload's marks on the same clock. The classes:
- **bytes**: work that is a function of one file's bytes and its name alone: the TypeScript parse (`createSourceFile`), `collectExportedSymbols`, the walk for raw import and export specifiers inside `collectDependencies` (not the resolution it calls), the tree-sitter parse (WebAssembly frames) and runtime, reading and decoding a file.
- **adapter**: an adapter's own JavaScript, which mixes extraction with resolution against the file index (not split further).
- **tree**: needs the rest of the tree: discovery (the walk, `git check-ignore`, which the main thread waits on synchronously, the nested scans), import resolution, re-exported symbols from providers, route and DOM inference, the documents' links for Cited By, the index pass's own registering.
- **output**: composing, rendering and reading back each doc, the generator's loop around it, the graph read back and written, the summary and the text store.
- **fixed**: start-up and module loading, garbage collection on the main thread.

| Main thread, s | `87b9e7b5` | `535ceefc` | head |
| --- | ---: | ---: | ---: |
| bytes | 1.39 | 2.35 | 4.34 |
| of which the TypeScript parse (index pass + analysis pass) | 1.05 | 1.80 | 3.55 (2.13 + 1.42) |
| adapter (mixed) | 0.48 | 0.52 | 0.65 |
| tree | 0.95 | 0.97 | 2.91 (discovery 1.99, of which about 1.3 waiting on `git check-ignore`) |
| output | 0.71 | 1.50 | 2.20 |
| fixed (start-up 0.39, garbage collection) | 0.49 | 0.49 | 0.63 |
| other (node's internals, native) | 0.40 | 0.61 | 1.12 |
| waiting with nothing to run (reads, writes, git) | 1.23 | 2.35 | 3.25 |
| **All** | **5.65** | **8.78** | **15.11** |

Read against the whole process (the table of section 1, run without the profiler):
- **What every process pays again**: start-up and module loading, 0.4 s built and about 1.7 processor-seconds under tsx; V8's worker threads, 2.9–5 processor-seconds a process, mostly compiling the hot JavaScript of the TypeScript parser and collecting garbage; and the main thread's own first pass through that code before it is optimized (not separable in a profile). The long-lived workers of section 6 measure the whole of it at once: **a third of a summarizing process's processor time** (below).
- **What is a function of one file's bytes**: 31–37 % of the main thread's busy time (1.4, 2.4, 4.3 s), most of it the TypeScript parse, which runs twice for every TypeScript file (once in each pass). The adapters' own work is 5–11 % more, part extraction and part resolution.
- **What needs the rest of the tree**: 15–25 % (1.0, 1.0, 2.9 s); the output 16–23 %.

## 6. The gains, ranked

Each estimate is for the whole line of 1,333 commits on this machine, from the sample's mean (it is spread evenly over the line), plus the command's fixed cost. **Today: 3.18 s a commit at 14 under tsx, about 71 minutes, plus 1.8 minutes of fixed cost.** (Last night's 105.8 minutes at 14 were under Node 22, with its WebAssembly wait; the root's figure.) Which file a change touches decides whether it costs a rebuild: `regenerate.ts`, `summarizeChange.ts`, `git.ts` and every non-history module of the two packages key the lens; `computeHistory.ts`, `scripts/live-docs/history.ts` and the history modules that only read summaries do not.

| Rank | Change | Measured | Estimate for the line | Cost | Risk | A rebuild? |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | **Long-lived workers that write their own trees** (shape (b) without a memo): a pool of processes, each started once, each taking commits in turn, writing the commit's tree itself and summarizing it, its git environment set per task | 2.39 s a commit at 14 on the sample, against 3.12 (−23 %), with each worker's first commit cold; every later commit a third cheaper in processor time | most commits warm over a whole line (about 95 a worker): **about 2.1–2.3 s a commit, 47–51 min**, and 20 lanes may do better still (20 beat 14 by 14 % with trees out of the pool's process) | medium: a worker protocol in `regenerate.ts` and `summarizeChange.ts`; the task's environment per task; one task at a time per worker; a crash ends one lane, which restarts; the peak memory measured per task rather than `maxRSS` | the list of section 7; the git environment is the one that changes a summary silently. Memory over 95 commits a worker not measured (the adapters' caches grow by a path per commit) | yes, one |
| 2 | **A cheaper tree writer**: the same entries and rules, written with synchronous calls inside the process that owns the tree (with 1, the worker) | the same trees byte for byte at three commits, with a quarter to a third of the processor time early and in the middle | the tree writers took 7–11 processor-seconds a commit under load, a quarter of all; at a third of that, **about −15 %** on top of 1: **about 1.9 s a commit, 42 min** | low to medium: `writeBlobs` and `placeEntry`'s disk in `git.ts` | low: the writer's rules stay; `git.test.ts` and `history-tree-equivalence.test.ts` hold them | yes (rides with 1) |
| 3 | **The fixed cost, about 105 s on every run**, warm or cold (section 4): read each summary once, ask git for every step's word in one process (or remember it, since a pair of commits never changes), and resume the sequence from the last one written when the line only grew | profiled: 30 s reading summaries twice, 17 s starting git from a large process, about 27 s deriving and re-checking rows and shapes of steps already written | a run with one new commit from **about 2 min to under 45 s**, about 25 s if the check of the cached summaries is also folded into the resume (most of what remains is the new commit's own 15–20 s); a cold rebuild saves the same 1–1.5 min | low for the first two; medium for the resume, whose key (lens, sampling, line, and the code that reads summaries into a sequence) is a design decision | low: the replay's check stays on every new step | no (`computeHistory.ts`), except moving `changesBetween`'s git call, which lives in `git.ts` |
| 4 | **Remember in memory, in each worker, by content hash, what is a function of one file's bytes** (shape (b)'s second half): the TypeScript parse, its symbols and raw specifiers, the tree-sitter parses | that work is 31–37 % of a process's main-thread busy time, the TypeScript parse alone 1.0–3.6 s a commit, run twice for every TypeScript file; 99.2 % of the line's file analyses repeat a version (November 19) | **another −15 to −25 %**: about 1.5–1.6 s a commit, 33–36 min | high: a seam between extraction and resolution that does not exist (the adapters mix them; `collectDependencies` resolves as it walks); the memo's memory | high: a fact that secretly depends on its neighbours (October's lesson); the oracle over a sample is the guard | yes |
| 5 | **The pool's size and the children's flags alone** (shape (a)) | flat from 6 to 14 while the pool's process writes the trees (3.6 → 3.1 s); `--single-threaded` −2 %; pinning one thread to a core: the same throughput on half the logical processors; ext4 instead of the overlay: none that shows; `UV_THREADPOOL_SIZE=16` in the pool's process: a fifth off eight trees at once in one process (not run in the pool) | **under 10 %**; the default here (19) is as good as any above 6 | trivial (`poolSize` in `computeHistory.ts`, or the environment) | none | no |
| 6 | **Per-version results kept on disk** (shape (c)) | not built; its ceiling is the same bytes-only share as 4 | at best what 4 saves, less the reads of a stored form; under a new lens it starts empty unless keyed by the extraction code alone, so it does not help the rebuild a lens change causes; it helps across runs and across CI's caches | high: 4's seam, plus a serialized form, a store, its key | 4's, plus a stale store | yes |

Smaller, from the same numbers:
- **`git check-ignore` in a tree of tracked files**: 1.3 s of git a commit at the head, which the main thread waits on synchronously. Every file of a history tree is tracked, and a tracked file is never ignored, so while the tree holds only the commit's files its answer is known (nothing); telling the generator so is a keyed change of about 5 %.
- **tsx in the summarizing process**: 1.6–2.1 processor-seconds a commit (module loading 1.2–1.5 s against 0.33, and 50 MB more memory); long-lived workers pay it once each.
- **The text store**: 0.3–1.6 s a commit into an empty store; it shrinks as the store fills.

**The four-core runner.** Its 50 minutes for 1,321 commits is 2.27 s a commit with at most 9.1 processor-seconds a commit, where a commit here costs 15 processor-seconds alone (process, git and tree) and 26–42 under load: the runner does the same work for about half the processor time or less. Its per-commit log is not readable without admin rights, so where its time goes is not known. By this machine's numbers the same rules hold there: with the pool's process writing every tree, three lanes may already wait on it (here a tree costs that process 2.4 s of its main thread); long-lived workers that write their own trees remove that wait and the per-process warm-up on any machine. The pool rule (processors − 1, so 3 there and 19 here) is right once the trees leave the pool's process: here 20 lanes beat 14 and 10, and memory (0.5–0.65 GB a process) is no limit on either machine.

## 7. What would go stale in a long-lived summarizing process

Read, not run: a reviewer of the builder's tier read every non-test module of `packages/engine/src` and `packages/generator/src` for state that outlives one call (the adapters and the modules that decide a summary line by line, the rest by a search for every top-level binding, `??=`, `static`, `process.env`, `process.cwd`, `g`/`y` regular expressions, `.clear()` and every spawn). The builder checked the two findings that matter most against the code (`gitIgnored.ts`, `rust.ts`). Nothing is ever cleared, and `generateLiveDocs` resets nothing; today a cache is per commit only because the process is.

| State | Where | Across commits in one process |
| --- | --- | --- |
| The tree's git environment (`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`), which the process inherits | `regenerate.ts` gives it at `fork`; read implicitly by `gitIgnored` and `gitIgnoresCase` (`tooling/gitIgnored.ts`, `spawnSync` with no `env`), and by `standingFiles` (`summarizeChange.ts`, `git ls-files`) | **Stale, silently.** `-C <tree>` does not override these variables, so a worker given one environment asks the first commit's index for every later commit's ignored and standing files. Each task must carry its own environment, set before it runs and only one task at a time per process, or each git call must be given it. |
| `packageCache`, a Map from a folder to the folder of its nearest `Cargo.toml` | `adapters/rust.ts:595` | **Stale where a path is reused** (no check at all); grows otherwise. |
| The grammar parsers, a Map from grammar to a promise of its parser | `adapters/treeSitter.ts:27-28` | Safe when it succeeds (a pure function of the grammar); a failed load is kept, and would fail every later commit. |
| `factsCache` of the C, Java, C#, Go, Rust and Python adapters, from an absolute path to the file's facts with its `mtimeMs`; C's `listingCache` and Python's `directoryCache` of folders | `c.ts:609,653`, `java.ts:498`, `csharp.ts:886`, `go.ts:426`, `rust.ts:540`, `python.ts:398,409` | **Grow without bound** (a new path per commit); where a path is reused they are guarded by the modification time alone. The facts themselves are a function of the file's bytes: these are the in-memory memo shape (b) wants, keyed by the wrong thing. |
| `tableCache` (Java, C#, Go, Rust), PowerShell's `foldedIndexes`, `manifest.ts`'s and `openings.ts`'s caches | WeakMaps keyed by the run's own `fileIndex` or symbol index | Safe: per run by construction. |
| `process.resourceUsage().maxRSS` sent as the peak | `summarizeChange.ts:189` | Stale as a measure: the peak since the process began, not one commit's. |
| Temporary names `<target>.<pid>.partial` for the summary and the texts; stderr as the channel of warnings | `summarizeChange.ts:173`, `textStore.ts:61`, `regenerate.ts` | Safe one task at a time per process; two at once in one process collide. |
| Grammar folders, lazily built tables (`htmlEntities.ts`), the syntax maps, shared constants, every `g`/`y` expression (each loop resets `lastIndex` or runs to `null` with no `await` inside) | many | Safe. |

The summarizing process's TypeScript path (`dependencies.ts`, `symbolExtraction.ts`, `sourceAnalysis.ts`) keeps no module state. A new entry module for a worker would also have to join `SUMMARY_ENTRIES` (`generatorIdentity.ts:71`) so that the lens keys it.

## 8. The small mend

`tests/integration/live-docs/history-tree-equivalence.test.ts` now takes its sample workspaces from `git ls-files` under `tests/integration/fixtures` and `tests/integration/programs`. With an empty folder `tests/integration/fixtures/zz-empty-leftover` beside the samples, the old test failed at `git commit` (`Command failed: git commit --quiet -m sample`); with the mend and the folder still there, all 46 cases passed (29 s, through the lane), and the list of 45 sample workspaces is the one the folders on disk gave before, less the leftover.

## 9. The scripts, and the commands that made each table

All run from the worktree's root after `npm run build`, with a private, short `TMPDIR`, through the lane: `node scripts/browser-lane.mjs --label rebuild-timing --max-seconds 900 -- <command>`. `P` is this folder.

| Script | What it does | Made |
| --- | --- | --- |
| `measure-child.cjs` | the preload that times a summarizing process from the inside | sections 1, 2, 5 |
| `pool-driver.cjs` | the history's own `regenerate` over a list of commits into a scratch cache, measured; `--jobs`, `--mode tsx`, `--tree-in-process`, `--flags "<node flags>"` | sections 1, 2 |
| `tree-writer.cjs` | one tree written by the history's writer in a process of its own (for `--tree-in-process`) | section 2 |
| `warm-driver.cjs` | long-lived workers, each making summaries in turn (a measurement of shape (b), not a design) | section 2 |
| `sweep.sh` | one measured run of `pool-driver.cjs` in a lane hold of its own (or inside one, `IN_LANE=1`), checked against the oracle, appended to `$RS/sweep.jsonl` | section 2 |
| `sweep-table.cjs` | the runs of `sweep.jsonl` as a table | section 2 |
| `anatomy-table.cjs` | one commit's phases from a `pool-driver.cjs` run of one commit | section 1 |
| `classify-profile.cjs` | a summarizing process's main-thread profile sorted by what the work depends on and by pass | section 5 |
| `tree-bench.cjs`, `sync-tree-bench.cjs` | the tree writer alone, K trees in one process; a synchronous writing of the same tree, compared file by file | section 2 |
| `syscall-cost.cjs` | one file-system call's cost on the overlay, ext4 and tmpfs | below |
| `diff-cost.cjs`, `profile-top.cjs`, `stamp.cjs` | the replay's git calls alone; a profile's self and inclusive times; seconds on each progress line | section 4 |
| `same-summaries.cjs` | the oracle: every summary and text of a scratch cache against the main checkout's, byte for byte | every run |

Examples:

```sh
TMPDIR=$RS/x/tmp node $P/pool-driver.cjs --commits $P/sample-60.txt --jobs 14 --cache $RS/x/cache --out $RS/x/out [--tree-in-process] [--mode tsx]
node $P/same-summaries.cjs /workspaces/Live-Documentation/.mdmd/history/b4294caf0e7d629f $RS/x/cache
bash $P/sweep.sh j14 $PWD/$P/sample-60.txt 14            # takes the lane itself
node $P/anatomy-table.cjs $RS/x/out
node $P/classify-profile.cjs $RS/x/prof/<file>.cpuprofile $RS/x/out/children/<pid>.json   # after --flags "--cpu-prof --cpu-prof-dir=$RS/x/prof --cpu-prof-interval=500"
TMPDIR=$RS/w/tmp node $P/warm-driver.cjs --commits $P/sample-60.txt --jobs 14 --cache $RS/w/cache --tree-in-process
node $P/sync-tree-bench.cjs <commit> $RS/stb
node $P/tree-bench.cjs <commit> $RS/tb --concurrent 8
TMPDIR=$RS/f npm run live-docs:history -- --check-head 2>&1 | node $P/stamp.cjs   # with the oracle's cache copied into the worktree's .mdmd/history/
```

One file-system call, synchronous, one thread (`syscall-cost.cjs`, at a load of 3.3 from others, so indicative): create, write 2 KB and close a file 38 µs on the overlay, 30 µs on ext4, 15 µs on `/dev/shm`'s tmpfs; `lstat` of an absent name 15–19 µs (most of it node building the error); of one that stands 4 µs. A tmpfs large enough for the trees could not be made: `mount -t tmpfs` is refused in this container (`permission denied`), so trees on tmpfs were not tried.

## Not measured

- **The hosted runner's own times**: its logs need admin rights, and the token was not to be used.
- **The default pool here (19) under today's command, and long-lived workers at 20**: queued as the last runs and not reached by hand-back (the lane was held by four other builders' gates for most of the night).
- **A clean retake of the ext4 run**, which another builder overlapped (2.4 processor-seconds a second of theirs); the tree writer's own runs stand in for it.
- **`--v8-pool-size=1`, `--single-threaded-gc`**: `--single-threaded` covers both and moved the number by 2 %.
- **`UV_THREADPOOL_SIZE` in the pool**: only with `tree-bench.cjs` (eight trees in one process, a fifth faster).
- **Long-lived workers over the whole line**: memory over about 95 commits a worker, as the adapters' path-keyed caches grow, and whether anything of section 7 other than the git environment shows over more commits than 60.
- **Rank 4 and rank 6** are estimates from the profiles, not built.
- **A synchronous writer at the head with proper buffering of large blobs**: the probe's head figure is a bound.
- **8 and 20 at a time with the trees in the pool's process**, and the anatomy of more than three commits (the sweep's 60 stand for the line).
- **Windows**, and Node 22 for comparison.

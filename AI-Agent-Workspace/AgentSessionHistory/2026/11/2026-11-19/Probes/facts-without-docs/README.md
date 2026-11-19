# Facts without docs: who reads the per-file Live Docs, and what the trip through Markdown costs

Historical: a record of 2026-11-19, made by a builder for the root at `a1d580016` (the joined engine round's tip). It is not current documentation and it decides nothing. It is evidence for the trial the owner allowed that day ("I think it's time to try, eh?"): whether the per-file Markdown doc should stop being the store. No product file was changed. Until the owner accepts a result, the guide's "Markdown is canonical" stands.

## The answer, first

- **The trip through Markdown loses nothing at this commit.** On four workspaces, 14,336 files, the graph derived straight from the generator's in-memory models equals, field by field, the graph derived from the docs it wrote. There were no differences at all. The only files that differ are files that one graph has and the other lacks: two docs this run did not render, kept because they hold authored words. A deliberate fault (one name changed, one edge dropped, one file removed) was found, so the comparison can fail.
- **So the format's machinery is all cost, and none of it is a store of facts the model lacks.** About 900 of `document.ts`'s 1,253 lines (the parser, the one-form-per-value reading of names and links, the reversal of body escapes) and about 1,000 lines of tests exist so that a written doc reads back as its model. The renderer, about 150 lines, plus the code-span and body-escape rules that keep a rendered doc readable, would still be needed by an export.
- **The model is already shaped by Markdown.** Each link in it is a doc-relative, percent-encoded path computed from where the doc would be written (`compose.ts`, `discovery.ts` `liveDocPath`). The graph decodes these links again (`graph.ts` `linkTarget`, `resolveDocLink`, `markdownLinks.ts` `linkPath`). Deriving the graph from models would save only the rendering, the reading back and the writing. Freeing the format also means changing the model's link coordinates to a file and a symbol. The census found one bug that this coordinate system hides: `compose.ts:407` assumes the docs root is exactly two folders below the workspace.
- **Only two facts live in the doc and nowhere else: the authored block and `Generated At`.** Everything else is recomputed on every run. But the docs also do four jobs that are not facts:
  - **The incremental cache.** `--include` and `--changed` runs, and the graph's re-read at the end of every run, take the docs of files the run did not render.
  - **CI's freshness gate.** `--check` compares the committed mirror with a fresh generation.
  - **The history's oracle at the head.** It compares its replay with the committed docs.
  - **A link target.** 173 documents outside the mirror name a mirror doc's path 8,724 times: 159 in the session archive (8,353 mentions) and 13 design documents and the skill (371).
- **The costs.**
  - Writing and re-reading the docs is a small share of generation's time. On DNN it was 48 s of 251, at a high and varying load.
  - The docs are a large share of its disk use. On DNN they are 10,776 files, 22.8 MB of text and 61.9 MB on disk, against one graph file of 60 MB pretty-printed, 39 MB compact or 3.1 MB gzipped.
  - Docs make every consumer slow. `inspect` on DNN takes 10.4–11.8 s to answer one question; deriving the graph from the docs is 6.5–7.5 s of that. Parsing the graph file instead takes 1.4–1.9 s. Re-analysing the sources with no cache takes 202 s.
- **What contradicts the brief or the root's recommendation:**
  1. The brief speaks of 1,093 docs. At `a1d580016` there are 1,120 under `.mdmd/layer-4/`, and a run in a copy renders 1,118 of them.
  2. The agent skill's `reference.md:49` says the CLI and the Explorer read `index.json`. The code contradicts it: both derive the graph from the docs afresh. The only product code that reads `index.json` is the history's `summarizeChange.ts:97`.
  3. On "facts beside the board": the estate reader reads each scan's own folder today (`graphFiles.ts:64–101`). Keeping a scan's facts inside that scan, in a folder that ignores itself, keeps that working and keeps one scan's facts the same whichever board names it. Facts kept beside the board would make the same scan's facts depend on the board. I would choose inside the scan; see the forks.
  4. "Written words kept as ordinary Markdown documents that link a file" loses something unless one more rule is added. Today the words' own links (720 links from files to 158 documents in this repository's bundle) are relations of the file. Moved into a separate document, they become links from one document to another, which no part of the graph carries.

## What was read

**Read in full (by me):**
- `generator.ts`;
- `graph.ts`;
- `document.ts` lines 1–160 and 240–709 (the model, the value slots, the renderer and the body escapes);
- the `summarizeChange.ts` lines that read the docs and the index (80–135);
- the cold-run probe;
- the history-rebuild-cost probe;
- the decision entries named in the brief.

**Read in part:**
- the authored-section probe (its answer and method);
- direction.md's paragraphs on the authored section, on scans as the board's pieces, on what a typical user runs, and on generation.

**Searched only:**
- the rest of `document.ts`, the Explorer client's use of related documents, `safe-to-commit.mjs`, the workflows.

**The census of part 1** was made by one subagent of my tier (general-purpose, read-only, running in parallel with my runs). I spot-checked these of its claims against the code, and each held:
- `compose.ts:407`;
- `reference.md:49`;
- `summarizeChange.ts:80–135`;
- the gate's `--check-live-docs` stage.

The subagent's own coverage:
- **Read in full:** `graphFiles.ts`, `graph.ts`, `relatedDocs.ts`, `generator.ts`, `computeHistory.ts`, `summarizeChange.ts`, `regenerate.ts`, `headCheck.ts`, `lint.ts`, `find-orphans.ts`, `run-all.ts`, `sample-build.ts`, `absoluteLinks.ts`, `download.ts`, the skill, `verify.mjs`, `ci.yml` and both configuration files.
- **Read in part:** the static builder, `inspect`, the board CLI, the Explorer's detail panel and Knowledge Sources, the SlopCop checks and `pages.yml`.
- **Searched only:** the engine's history modules and most tests.

The `many-scans` probe the brief names does not exist at `a1d580016`, so it was not read.

## 1. Every reader and writer of a per-file doc or `index.json`

"In the model?" asks whether the generator's model before rendering, or the graph derived from it, already holds what the reader takes.

| Who (file:line) | What it takes | In the model? | If no per-file doc were written |
| --- | --- | --- | --- |
| Generator writes each doc (`generator.ts:314–315`) | the rendered model | yes | the write goes |
| Generator keeps words and time (`generator.ts:253–254`, `readExisting` 661–675) | the authored block and `Generated At`, by `parseLiveDoc`; on a refused doc, `authoredBlockOf` and a regex for `Generated At` | **no**: the only facts with no other home | the words need a new home (part 5); `Generated At` needs one or goes |
| Generator decides "unchanged" (`classifyChange` 677–687; `generate.ts:331–334`) | the old text against the new; `--check` fails on `written > 0` | no prior state | nothing to compare: `--check` must be redefined |
| Generator reads back before writing (`generator.ts:292–296`) | `parseLiveDoc(rendered)` | yes | goes; it guards only the store |
| Generator writes the index (`generator.ts:339`, `graphFiles.ts:109–114`) | **every doc on disk**, parsed again | only for the files rendered this run | derive from models; files a run does not render (`--include`, `--changed`, stale docs kept for words) need a cache or a full run |
| Prune, refused-doc removal, empty folders (`generator.ts:473–559`, 373–385) | stale doc text, by `authoredBlockOf` | — | goes; a deleted file's words need a home |
| Nested-scan warning (`generator.ts:136–141`, 394–453) | whether `<root>/<baseLayer>` exists | — | only the configuration file, or the facts folder, marks a scan |
| `inspect` (`inspect.ts:139`, `inspect/emit.ts` 76, 80, 181…; `inspect/resolve.ts:40–112`) | the whole graph; prints each file's doc path; accepts a doc path as input | yes, but inspect runs no generator | reads a stored graph with a freshness check (fork 2); doc paths leave its output |
| Static builder (`staticBuilder.ts:266–282`, 136–137) | the graph, or the estate's; `relatedDocsOf(file.authored)` and `citedBy` for the bundle | yes | the same as `inspect`; related documents need the rule of part 5 |
| Board CLI and estate (`scripts/live-docs/board.ts:158`; `graphFiles.ts:64–101`) | each scan's docs, read from that scan's folder; a scan is marked by its docs root | yes, per scan | each scan's stored graph |
| `lint` (`lint.ts:142–182`, 175–176) | the parsed docs for islands; the authored blocks for placeholders; the doc text for absolute links | partly | the structural part runs on the graph; the authored and absolute-link checks lose their subject |
| `find-orphans` (`find-orphans.ts:84–163`) | each doc's `Code Path`, then whether the source exists | — | the command has no purpose |
| Oracle comparison (`oracle/compare.ts:57–63`), sample builds (`sample-build.ts:36–37`, `visualize-history-sample.ts:103–106`) | the edges, read back from the docs written into a temporary copy | yes | take the graph that `generateLiveDocs` would return |
| History: words per commit (`summarizeChange.ts:84`, 118–128; and the generator's `readExisting` above) | each committed doc's text, tested for `## Authored`; the authored block | no | old commits keep their mirror and are read as today; later commits read the words' new home |
| History: graph per commit (`summarizeChange.ts:97–100`) | `index.json`, **the only product reader of the file** | yes | the generator returns the graph; no file |
| History: related documents (`summarizeChange.ts:161–170`) | `relatedDocsOf(file.authored, docPath)` | yes | changes with the words' home |
| History: check at the head (`computeHistory.ts:691–742`, `headCheck.ts:41–121`) | the committed docs at HEAD, field by field against the last replayed step | — | no oracle: "skipped: no Live Docs are committed"; `--check-head` throws (718–722) |
| History tree (`regenerate.ts:202–209`, `history/git.ts:418`) | the docs root as the place the generator writes | — | moot |
| `--keep-index` (`summarizeChange.ts:108–109`) | the `index.json` text | yes | serialize the returned graph |
| Explorer client: detail panel and downloads (`detailPanel.ts:307`, `download.ts:46`) | **renders** each doc from the graph; file names from `docPath` | yes | unchanged: already an export |
| Explorer client: `Generated At` (`detailPanel.ts:385`, 566–596; `sources-facts.ts:182–194`; `sources-view.ts:107`) | `generatedAt` shown, earliest and latest; `${root}/${baseLayer}` as the Docs row | no | drop it, or give it a home |
| Explorer client: links (`reader-links.ts:16–48`; `shared/graph.ts:81–124`) | links resolved against `docPath` | yes | the doc-path convention, not the file |
| SlopCop markdown audit (`check-markdown-links.ts:49`, 154) | every layer-4 doc's **text**, every link in it; and links into layer-4 | no (text) | the generated half goes; 173 documents' links into layer-4 dangle unless the words stay at those paths |
| SlopCop symbol audit (`check-symbols.ts:58`) | headings and anchors in the text | no (text) | goes with the docs |
| `docs:links:enforce` (`documentationLinks.ts:41–46`) | layer-4 text for `<!-- live-docs:code -->` markers (finds none today) | — | goes |
| Gate stage "Live Docs" (`safe-to-commit.mjs:15–16`) and CI (`ci.yml:38`, through `ci-check`) | `livedocs`, or `livedocs -- --check`: generate and lint, or freshness of the committed mirror | — | becomes "generate the graph, lint it" |
| Pages (`pages.yml:88`) | `visualize` over the **committed** mirror, with no generate step | — | must generate first |
| Agent skill (`SKILL.md:10–14`, `reference.md:3`, 49) | the doc file of a path; a grep for `` #### `Name` ``; "read the whole doc" | yes, through `inspect` | reads `inspect --json` (fork 6) |
| CLI messages (`inspect.ts:103`, 142) | point the reader at "the file's Live Doc" | — | reworded |
| Round-trip tests | `document.test.ts` (390 lines), `document.fuzz.test.ts` (476), `tests/integration/live-docs/round-trip.test.ts` (158; every committed doc, the CRLF mirror, every sample, the fallback); `graph.test.ts:18, 28` (the committed mirror); `generation.test.ts:20, 109`, `generator.unmappable.test.ts:60–74` (index.json); `generator.test.ts` 43, 223, 398, 423–435 (words kept, note once, pruning); `pipeline.test.ts:84` (`--check`); `generate-cli.test.ts:301` (orphans); `history.test.ts:94, 193, 441–506`, `history-reading.test.ts:117` (head check, unread words) | — | the reader half and the mirror's tests go; the renderer's tests stay with an export |

The Explorer client never fetches a doc file: it reads `explorer-data.json`, which carries the parsed graph, and the history files. No Live Doc text is shipped to the browser. `bundledMarkdown` holds only related documents: `relatedDocsOf` drops links to Live Docs (`relatedDocs.ts:67`), and discovery skips the docs root (`discovery.ts:240–242`).

## 2. The graph made straight from the models

**Method.** [`probe.cjs`](probe.cjs) loads the built engine and wraps `renderLiveDoc` before the generator is loaded. The built packages are CommonJS and call `(0, document_1.renderLiveDoc)(…)` at call time, so the wrapper sees every model the generator renders. The wrapper records each model by its code path, keeping the last one rendered.

There are two modes:
- **"analysis":** a dry run in which the wrapper returns a sentinel and the post-render read accepts it. Nothing is rendered, read back or written. The graph is then derived from the recorded models with `deriveLiveDocGraph`.
- **"full":** the generator as it is, which writes every doc and `index.json`. The probe then derives the models' graph, passes it through JSON as `index.json` is, and compares the two field by field, every key of every file down to each array element.

The workspaces were private copies:
- this repository as `git archive a1d580016`, given its own git index so that ignore rules apply;
- `dbatools` at 067b215, `tSQLt` at 4a921d0 and `Dnn.Platform` at 9bc6b06, copied from the cold run's folder with their old `.live-documentation/` removed.

tSQLt's `.live-docs.config.json`, which the cold run wrote to exclude five crashing files, was also removed. At this commit none of those files stops the run: `failed` was 0 on every corpus.

| Workspace | Files in the models' graph | Files in the docs' graph | Identical | Differing fields | Only in the docs' graph |
| --- | ---: | ---: | ---: | ---: | --- |
| this repository | 1,118 | 1,120 | 1,118 | 0 | `.vscode/settings.json`, `packages/explorer/src/shared/d3-force-3d.d.ts` |
| dbatools | 1,977 | 1,977 | 1,977 | 0 | — |
| tSQLt | 465 | 465 | 465 | 0 | — |
| DNN Platform | 10,776 | 10,776 | 10,776 | 0 | — |

**Classes of difference.**
- **Lost by the trip: none.**
- **Changed: none.**
- **Added: one class, and the trip through Markdown does not cause it.** The docs' graph also carries docs the run did not render: stale docs kept because they hold authored words (`keepAuthoredStaleDocs`, true for a person's run). Both samples are artefacts of my copy:
  - `.vscode/settings.json` is tracked in this repository, but git ignores it, so my fresh `git add -A` left it out;
  - `d3-force-3d.d.ts` is the same case.
  
  With `--include` or `--changed`, the docs of every file not re-rendered would fall in this class too. With the history's `keepAuthoredStaleDocs: false`, the class is empty.

**The comparison can fail.** On tSQLt, renaming one symbol, dropping one edge and deleting one file from the models' graph gave two field differences (`.symbols[].name`, `.edges[]`) and one file only in the docs' graph (`results/tSQLt-full-selftest.json`).

**Why there are no differences.** By construction: the generator reads back every doc before writing it (`generator.ts:292`). The round-trip and fuzz suites hold `parseLiveDoc(renderLiveDoc(doc))` equal to `doc` for hostile names and docstrings. So the answer to "how much of the format's machinery exists only so that facts survive being written and read back" is this, in `document.ts`:

| Part | Lines (about) | Needed without per-file docs? |
| --- | ---: | --- |
| The model's types and vocabulary (1–240) | 240 | yes, as the model |
| Value slots: `writeValue`, `takeValue`, `quote`, `takeQuoted`, `codeSpan`, `takeCodeSpan`, `encodeLinkPath` (240–420) | 180 | the read side (`take*`, `takeValue`) only for the round trip. `codeSpan` stays for an export. `encodeLinkPath` stays only while links are doc-relative paths. |
| Renderer (420–565) | 145 | for an export and the Explorer's download |
| Body escapes: fences, HTML blocks, containers, `escapeBody` (567–692) | 125 | for an export to render faithfully. `unescapeBodyLine` and the "one more backslash" reversibility are for the round trip only. |
| Parser and its `Reader` (699–1253) | 550 | no. `authoredBlockOf` (1138–1163) stays to read old mirrors. |
| `document.test.ts`, `document.fuzz.test.ts`, `round-trip.test.ts` | 1,024 | the reader half and every committed-mirror case go |

Beyond `document.ts`, the model's links are machinery of the same kind:
- the composer computes doc-relative, percent-encoded paths (`compose.ts` `linkTo` and `encodeLinkPath`, `discovery.ts` `liveDocPath`);
- the graph decodes them (`graph.ts` `linkTarget`, `resolveDocLink`; `markdownLinks.ts` `linkPath`).

In a model whose links are `{file, symbol}`, neither the encoding nor the decoding exists for generated links. `markdownLinks.ts` stays for the links people write in documents.

## 3. Costs

All runs were one at a time, on 20 cores. A history rebuild had 14 cores, and the load average was about 21 throughout. Read processor seconds beside wall seconds; the cold run measured the same corpora at a load of 7 to 18 and found them about twice as fast. Peak memory is the process's peak resident size after generation, from `process.resourceUsage()`.

| Workspace | Full generation, as it is: wall / processor s, peak MB | Analysis alone, nothing written: wall / processor s, peak MB | The graph from the models | Docs written: count, bytes, on disk | One graph file: pretty / compact / gzipped |
| --- | --- | --- | ---: | --- | --- |
| this repository (docs already there) | 56.1 / 58.7, 485 | 56.1 / 54.4, 417 | 0.08–0.15 s | 1,120 docs, 4.28 MB, 7.8 MB on disk (2 written) | 9.45 MB / 6.75 MB / 1.16 MB |
| dbatools (cold) | 78.3 / 76.8, 492 | 68.7 / 68.0, 488 | 0.05 s | 1,977 docs, 4.02 MB, 9.3 MB on disk | 5.59 MB / 4.19 MB / 0.67 MB |
| tSQLt (cold) | 25.3 / 25.6, 310; again over its own docs 18.1 / 20.1, 312 | 24.6 / 24.7, 305 | 0.03 s | 465 docs, 1.17 MB, 2.6 MB on disk | 2.28 MB / 1.62 MB / 0.13 MB |
| DNN Platform (cold) | 250.8 / 241.8, 1,566 | 202.5 / 197.5, 1,161 | 1.1 s | 10,776 docs, 22.8 MB, 61.9 MB on disk | 60.1 MB / 39.0 MB / 3.14 MB |

- **Rendering, reading back, writing and re-reading every doc** cost:
  - about 10 s of 78 on dbatools;
  - about 48 s of 251 on DNN, with 400 MB more peak memory;
  - nothing measurable on tSQLt;
  - nothing on this repository, where the analysis mode also read the existing docs for their words.
  
  The load moved by several points during the runs, so take these differences as rough. The cold run's 118 MB for DNN's docs is disk use under a different count; the bytes of text are 22.8 MB here.
- **`inspect`, one question** (`--from <file>`, run twice, through `npx tsx`; script `time-inspect.sh`):

  | Workspace | Start-up alone (`--version`) | One question | Deriving the graph from the docs, in process | Parsing `index.json` instead |
  | --- | ---: | ---: | ---: | ---: |
  | this repository | 1.2–1.3 s | 2.2–4.0 s | 0.79–0.92 s | 0.15–0.16 s |
  | dbatools | 1.2–1.4 s | 2.0–2.4 s | 1.15–1.49 s | 0.09–0.14 s |
  | tSQLt | 2.0–3.0 s | 1.8–3.0 s | 0.40–0.50 s | 0.03–0.04 s |
  | DNN | 2.3–3.0 s | 10.4–11.8 s | 6.55–7.55 s | 1.35–1.93 s |

  Re-analysing the sources with no cache would cost the "analysis alone" column: 25 s, 56 s, 69 s and 202 s. For a question, that is no option. The decision of 2026-09-28 measured about 300 ms to read and parse this repository's docs; at this commit and load it is 0.8–0.9 s.
- **The history.** From the history-rebuild-cost record's section 1, at the head (`c84fd00f`), the generator's 18.5 s split as follows:
  - the index pass, 9.3 s;
  - `analyzeSourceFile`, 4.7 s;
  - discovery, 2.0 s;
  - the graph's read and write, 0.4 s;
  - rendering and `citingDocuments`, 0.1 s;
  - the rest (start-up, reading the existing docs, pruning), about 2 s.
  
  The docs' own share is the 0.4 s of the graph's re-read, the 0.1 s of rendering and part of the 2 s. To that add `authoredReading`'s second read of every committed doc, and the tree writer writing the committed mirror: 1,115 of 7,532 files and 5.2 of 29 MB logical bytes at the head, so roughly 2 s of the tree's 11 s. Together that is about 2–4.5 s of a commit's 31–34 s, **7–13 %**. Reading those numbers needed no new run.

  The history's cost lies in the index pass and the analysis (75 % of the generator). Removing the docs does not touch it. The October 19 boundary between extraction and resolution does.

## 4. What the per-file doc holds that nothing else would

Beyond the authored words the authored-section probe counted:

- **`Generated At`.** It moves only when the generated sections change (`generator.ts:255–289`). It is shown in the detail panel and as the earliest and latest moments in Knowledge Sources and its download. With no doc, it has no prior state to move against. Options:
  - drop it: the history already says when a file's facts changed, commit by commit, and a person's run would show the run's time;
  - keep a per-file "facts changed at" in the stored graph, carried from the previous stored graph. That is a cache, but a harmless one.
  
  I would drop it from the facts and let the Explorer show when the graph was made.
- **The note on a file no reader handles** (`UNREAD_NOTE`, written once into the authored Notes, then the author's). The note's purpose comes from a reader's absence. That is a generated fact the graph can carry as a flag (`noReaderHandles`), with the words drawn by the Explorer. Only a person's revision of the note is authored; it belongs with the other written words.
- **The authored words of a deleted file.** A stale doc that holds authored words is kept and stays in the graph (`keepAuthored`). Without docs, those words would be in an ordinary document whose link to the file is dead, which SlopCop's link audit already reports.
- **The facts of files a run did not render.** The docs are today's incremental cache: `--include`, `--changed`, and the index re-read of every doc. Without them, the stored graph must be carried forward, or every run made full.
- **A committed, reviewable diff of the facts.** In a pull request, a reviewer sees a doc change beside the code. Nothing else gives that today. The Explorer's history gives it after the fact, commit by commit.
- **A link target with anchors.** Mirror paths and `#slug` anchors are named 8,724 times from 173 documents. The anchors are in the model; the paths are a convention.
- **The history's oracle.** `headCheck.ts` compares the replay with the committed docs. It is the one check of the history against something it did not make itself.
- **The `Cited By` section and the re-export anchors** are recomputed each run, from the documents' links (`citingDocuments`) and from the analysis. They are in the model; nothing is lost.
- **`Layer: 4`** is a constant, and **the `LIVE-DOC` markers** exist only to fence generated regions in a file that also holds words. Both go.

## 5. This repository's 1,120 docs if they stopped being generated

**What they would be.** The generated sections would go. What remains of each doc is its authored block. That block is ordinary Markdown about one file. If it stays at the same path (`.mdmd/layer-4/<path>.mdmd.md`), the 8,724 mentions keep resolving, though anchors into the generated part do not. The history at old commits reads the same path's authored block, by `authoredBlockOf`, as it does today. `relatedDocsOf` keeps reading its links. Three changes are needed:
- discovery must stop skipping the docs root for documents (`discovery.ts:240–242`);
- the file the words describe must be known without a generated title: by the path convention, or by a link to the file on the words' first line;
- a document that is a file's own words must count its links as the file's.

Under the last rule, the 720 links from files to documents in the bundle today remain the file's.

**What the Explorer would draw.** Today's bundle (`visualize` of my copy, `explorer-data.json` 10.9 MB) carries:
- 158 documents;
- 1,104 file–document links: 720 from authored words, 384 from citing documents;
- 517 files with at least one related document.

Each of the 1,120 docs has meaningful authored words (`hasMeaningfulAuthoredContent`). If every former doc became an ordinary citing document, the bundle would carry **1,278 documents** (158 + 1,120) and at least 1,104 + 1,120 links.

- **The 3D map's documentation overlay** draws each related document as a node (`related:<path>`, `forceGraphData.ts:53–65`). It would gain 1,120 nodes, each a satellite of exactly one file. That doubles the overlay's bodies and buries the 158 real design documents among them.
- **The Knowledge Sources panel** would count about 1,278 documents and could not tell a file's own words from a design document.
- **The bytes would barely change.** 1.86 MB of authored text already rides in the graph's `authored` fields. It would move into `bundledMarkdown` (3.88 MB today).

So a file's own words should not be drawn as a citing document. They belong to the file: the detail panel shows them as the file's description and notes, as it shows the authored block today.

**The history at an old commit.** Before the change, the commit has its mirror, and the history reads it as it does now. After the change, it reads the words document at the same path. Its related documents come from that document's links through the rule above.

Note one gap whatever is chosen: the history's sequence carries only the forward links. Decision of 2026-10-22: "The history's sequence still carries the forward links alone." Citing documents are not in the sequence. If the words became citing documents rather than the file's own, every commit after the change would lose its related documents in the history.

## 6. The forks the root must decide before anything is built

**1. Where the derived facts live on disk, and whether anything derived is committed.**
- **Inside the mapped folder, in a folder that ignores itself.** For example `.live-documentation/` holding a `.gitignore` of `*`.
  - The user's `.gitignore` is untouched and `git status` stays clean.
  - The estate reader keeps reading each scan's folder (`graphFiles.ts:64–101`), and a scan is marked by that folder as today.
  - Cost: one ignored folder in a colleague's checkout, about 3 MB gzipped for DNN.
- **Outside the folder, in a per-user cache** keyed by the folder's path.
  - Nothing at all in the repository.
  - But it is invisible and outlives moved or deleted checkouts.
  - It is awkward on Windows, with long paths and roaming profiles.
  - The board must find it by a key, not by a folder.
- **Beside the board.** Each scan's facts sit in the board's folder.
  - Natural for one World Map over several repositories.
  - But a scan named by two boards is generated twice and can disagree.
  - A scan with no board needs a default anyway.

I would choose **inside the scan, self-ignored**, with the board naming the scans as now. I would commit nothing derived: CI and Pages generate, and the history regenerates from source at every commit anyway. A committed graph would be a 9 MB pretty file here whose every run rewrites lines across it.

**2. How a consumer knows the facts are fresh.** Today it needs no protocol: the docs are read afresh, and their freshness against source is CI's `--check`. Without docs, the stored graph is a cache. That reverses the 2026-09-28 reason "it is not a cache… a consumer derives the graph fresh rather than checking a file for staleness". This must be said to the owner as a reversal.
- **No store: every consumer regenerates.** 25–202 s per question on these corpora. Refused by the numbers.
- **The stored graph carries a fingerprint of its inputs.**
  - The fingerprint holds the generator's identity (the history already computes one: `generatorIdentity.ts`, the lens key), the configuration, and a listing of every discovered file with its size and time, or its blob from `git ls-files -s`.
  - A consumer recomputes the listing, which is discovery's walk (0.4–2.0 s here, measured in the history record), and on a mismatch says "stale" and regenerates, or refuses.
  - The whole graph is still made by a full generation.
- **A per-file store of extracted facts** keyed by the file's bytes and the reader's identity, with resolution always redone against the current workspace.
  - This is the 2026-10-19 decision itself: "ordinary full generation computed incrementally inside, the boundary between extraction and resolution against the current workspace".
  - Freshness is then by construction.
  - But that seam does not exist in the code, adapters mix the two, and the history record measured that the index pass, not the analysis, holds most of the time.

I would choose **the fingerprint now**, and keep the per-file store as the October 19 work it already is. The fingerprint check is exactly what that store's resolution step would run first, so nothing is thrown away.

**3. What `generate`, `lint`, `orphans` and the gate's "Live Docs" stage become.**
- **`generate`** writes the stored graph (and nothing else). `--check` either goes, or becomes "the stored graph is fresh" (the fingerprint). `--include` and `--changed` either go or carry the previous graph forward for the files they do not touch. I would drop them until the October 19 store exists. The record of that day shows `--changed` saving seconds that the store would save properly.
- **`lint`** keeps its structural checks over the graph: islands, links nothing answers. It loses the authored-placeholder and absolute-link checks. Those become SlopCop's ordinary checks over the words documents.
- **`find-orphans`** is deleted. A words document whose file is gone has a dead link, which the SlopCop markdown audit reports.
- **The gate's "Live Docs" stage, and CI** become "generate the graph, then lint it". That is non-mutating to the tree, since the graph is ignored. Pages generates before `visualize`.
- **The history's head check** needs a new oracle. Options:
  - compare the replay's last step with a fresh generation at the head (same code on both sides, so it checks the replay mechanism, not the generator);
  - keep it for repositories that still commit an export.
  
  I would take the fresh generation and say plainly what it no longer checks.

**4. What the export to Markdown is, and who uses it.**
- **No export.** The Explorer's download already renders a file's doc from the graph (`download.ts:46`), and agents use `inspect --json`.
- **An on-demand, one-way export:** `export --markdown <folder>` writes today's doc shape from the stored graph. It is for people who want greppable files, a wiki, or a reviewable diff they choose to commit. It keeps the renderer, `codeSpan` and the body escapes, and is never read back.
- **Keep committing the export in this repository**, which keeps the head check and the links into layer-4. But it keeps the whole round trip, and with it the machinery this trial is meant to shed.

I would choose **the on-demand, one-way export**, with the parser deleted. It is also what the Explorer's download is.

**5. How a file's own top comment is read per language, and what the model calls it.**
- **One generic reader by comment syntax per extension**, the rule table of the authored-section probe (`scripts/lib.py`). It covers kinds with no reader (YAML, shell, SQL, config) and tells a file's comment from a declaration's by the blank line.
- **Each language's reader returns it** where it already parses comments:
  - TypeScript's `@module`, `@packageDocumentation` and `@file` (`jsDoc.ts` already reads JSDoc);
  - Python's module docstring;
  - PowerShell's script help, which is separate from help inside the first function. The cold run found that help is usually inside the function, where the reader already takes it as the function's summary.

I would choose **both**: the generic reader as the floor, overridden by the language's reader where one parses the file. In the model, I would call it the file's **`description`**: the root's word, and next to a symbol's Summary. Keep its text verbatim, with the line it came from. Not "opening", which already means a route or procedure a caller names (`openings.ts`, `Entry: opening`).

On the owner's languages almost no file describes itself: 45 of 3,973 C# files and 7 of 281 T-SQL scripts. There the description will be empty, and the words document carries the meaning.

**6. What the agent skill reads when no mirror is committed.**
- **`inspect --json`**, with one new question, "everything about this file": symbols and their docstrings, dependencies, entries, description, words, related documents. One source, the same as the Explorer.
- **The stored graph file directly.** It is 9 MB here, and its shape is internal.
- **The export, generated on demand into a scratch folder** and grepped as now.

I would choose `inspect --json`, with the export for grep-heavy work. The skill's "grep the base layer for `` #### `Name` ``" becomes `inspect`'s symbol search.

**7. Found here: where a file's own written words live** (the root's recommendation leaves this open).
- **Any document that links the file**, as Cited By today. It loses the words' own links as file relations (720 here), draws 1,120 satellites in 3D, and the history loses them after the change (part 5).
- **One words document per file at a path convention**, here the same path as today, words only. Its links are the file's. Old links and the history keep working. A stranger's repository has none until a person writes some.
- **Words in the stored facts**, not Markdown. Refused: the owner keeps Markdown for what people write.

I would choose **one words document per file at a path convention**, created only when a person writes words.

## 7. The smallest complete road

Each step leaves a working product and a green gate. A step marked **keyed** changes `packages/engine`, `packages/generator`, `tsconfig.base.json` or the lock, so each landing costs a history rebuild of about ninety minutes; the keyed steps should be gathered into as few landings as possible.

1. **The generator returns the graph it made from its models,** and writes `index.json` from it, without re-reading every doc. The re-read stays only for files a run did not render (`--include`, `--changed`, stale docs kept for words). `summarizeChange` takes the returned graph instead of reading `index.json`.
   - Proven equal by this probe: 0 differences on 14,336 files.
   - Deletes: the index re-read in a full run; `summarizeChange.ts:97–100`.
   - **Keyed.**
   - The oracle: the history's summaries must be identical.
2. **Read each file's top comment into the model as `description`** (fork 5), render it into the doc's generated region, and show it in the detail panel.
   - Visible to the owner before anything is taken away.
   - Deletes nothing.
   - **Keyed.**
3. **Consumers read a stored graph with a fingerprint** (fork 2) instead of parsing docs: `inspect`, the static builder, the board and estate, `lint`'s structure, the oracle, the sample builds. The docs are still written.
   - Deletes: `readLiveDocGraph`'s callers outside the generator, and the per-question parse (DNN 6.5–7.5 s down to 1.4–1.9 s).
   - **Keyed** (`graphFiles.ts` is engine code).
4. **Move the written words.** Each doc's authored block becomes its words document at the same path (fork 7), with the file named on its first line.
   - The generator fills the doc's authored section from it, read-only, so the docs still render as today.
   - Discovery reads the words documents as documents.
   - The rule "a file's own words document's links are the file's" joins `relatedDocsOf`.
   - The history reads words from the words document at commits after the move, and from the mirror before it.
   - A one-time migration commit in this repository.
   - Deletes: `readExisting`, the "preserve authored" pruning, `UNREAD_AUTHORED_BLOCK` as written words (the flag of part 4 replaces it).
   - **Keyed.**
5. **Stop writing per-file docs.** The generator writes only the stored graph into the self-ignoring folder.
   - `--check` becomes the fingerprint check; the gate's stage and CI become "generate, lint"; Pages generates first.
   - `find-orphans` is deleted; the head check is redefined (fork 3).
   - The skill moves to `inspect --json`; `reference.md:49` is corrected.
   - Deletes:
     - `parseLiveDoc` and its `Reader` (about 550 lines);
     - the read side of the value slots;
     - `unescapeBodyLine`;
     - prune, `removeRefusedDoc` and `classifyChange`;
     - the `LIVE-DOC` markers;
     - `round-trip.test.ts`, the reader half of the fuzz suite, and the committed-mirror cases of `graph.test.ts`, `generator.test.ts`, `pipeline.test.ts`, `history.test.ts`;
     - `docs:links:enforce`;
     - SlopCop's symbol audit over layer-4.
   - **Keyed.**
6. **Links in the model become a file and a symbol,** not doc-relative paths. The export renders them relative.
   - Deletes: `linkTarget` and `resolveDocLink` for generated links, the composer's `linkTo` and `encodeLinkPath`, and with them the "two levels below the workspace" assumption (`compose.ts:407`).
   - The history's summaries hold links, so this is a format change with a format bump.
   - **Keyed.**
7. **The one-way export command** (fork 4). It adds no new rendering code: it calls the renderer the Explorer's download already uses.
   - The command itself lives under `scripts/`. It is keyed only if the renderer must move.

Steps 1 to 3 change no fact and can land in one rebuild. Steps 4 to 6 change what is stored and should land together in a second.

## Not measured, and what I would do next

- **Generation phase by phase on the corpora.** The analysis-alone numbers include the index pass and the analysis together; the October 19 split of extraction from resolution was not attempted.
- **The fingerprint check's own cost.** I would measure next a discovery walk plus `git ls-files -s` on DNN, which is the cost a fresh-facts check pays on every `inspect`.
- **The Explorer with 1,278 documents** was counted, not drawn. No browser was taken.
- **The census's counts of links into layer-4** (8,724 mentions) are grep counts of the path pattern, including mentions in code spans.
- **A Windows run.**

## Files

- [`probe.cjs`](probe.cjs): the comparison and the analysis-alone mode. Run from the worktree: `node <this folder>/probe.cjs <workspace> analysis|full <out.json>`.
- [`time-inspect.sh`](time-inspect.sh): `inspect`'s time to one question beside its start-up.
- `results/*.json`: each run's numbers, the comparison's summary and the self-test, with the workspace named by its folder only.

## The root's reading _(November 19, 2026, 23:36 UTC)_

The builder's record above stands as written (commit `78feba0e` on `worktree-agent-af60447013c08530c`; the probe's script and two of its result files read by the root). What the root takes from it, and where the root's own recommendation to the owner of 22:39 UTC was wrong:

- **Wrong: that Markdown costs facts.** It costs none at this commit: 14,336 files, no difference. What it costs is what was spent that day to make that so (five rounds on names, three on links), about 1,900 lines whose only work is reading a doc back as its model, 10,776 files and 62 MB on disk in the largest corpus against one file of 3 MB, and seven seconds of every question the command line answers there.
- **Wrong: "beside the board".** A scan's facts stay inside the scan, in a folder that ignores itself, so that a scan is the same whichever board names it and the estate's reader goes on reading each scan's own folder.
- **Wrong: "written words kept as ordinary documents that link a file".** A file's own words stay one document per file at the path they have today, words only, written when a person writes them, and its links stay the file's. Loose documents would turn 720 of the file's relations into links between documents that the graph does not carry, draw 1,120 satellites in the 3D map, and lose them from the history.
- **Not a gain: the history.** The docs are 7 to 13 % of one commit's time there.
- **The head check loses less than it seems.** The committed docs at the head are a generation by the same code, held fresh by the gate's own stage; a fresh generation at the head is the same oracle for a repository that keeps its gate, and repositories that commit no docs have no head check today.
- **What is given up, to be said to the owner as such:** a commit's diff no longer shows the facts changing beside the code, unless an export is committed; and the stored facts are a cache that must prove itself fresh, which the reason of 2026-09-28 ("it is not a cache") had ruled out. Against the second: the docs are today a derived copy too, kept fresh against the source by a gate's stage and a standing chore; a fingerprint is checked by every consumer and not only by a gate.

**Ruled by the root for the trial** (the owner's leave of the same evening covers a trial, not the product): facts inside the scan, self-ignored, nothing derived committed; a fingerprint of the generator's identity, the configuration and the discovered files, with its cost on the largest corpus measured before it is built, and no consumer ever answering from facts it has found stale without saying so; a one-way export on demand and no reader of it; a file's description from its own top comment, by comment syntax as the floor and a language's own reader where one parses the file, named `description`; the agent skill on `inspect --json`; one words document per file at today's path.

**Left open, for the owner when the second landing is designed:** whether this repository keeps committing a Markdown copy of the facts as an export, for the diff and for reading on GitHub (the root would not); what becomes of `--changed` and `--include`, since the owner asked on 2026-10-19 that incremental speed stay a goal and a full generation of the largest corpus takes four minutes.

**The road's order, as the root would take it:** after the engine round's landing and the readers'. The first landing changes no fact (the generator returns the graph it made; every consumer reads the stored graph; the docs are still written, so the two can be held against each other on every corpus). The second moves the words, stops writing the docs, and gives links their plain form. Where a top comment's reading goes in that order is decided with the readers' gathering, which already hands each reader the file's text.

**Found on the way, for their owners:** `compose.ts:407` assumes the docs root lies exactly two folders below the workspace; the agent skill's `reference.md:49` says the command line and the Explorer read `index.json`, and they do not; the brief's count of 1,093 docs was stale (1,120).


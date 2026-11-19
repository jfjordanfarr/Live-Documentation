# Could a file's own opening comment replace its Live Doc's authored section?

Historical: a measurement of 2026-11-19, at commit `e566dbb11`. It is evidence for a decision the owner has not yet made. It decides nothing.

## The question

The owner, 2026-11-19, asked whether Live Docs should be written inside the repository being mapped: "I hypothesize that the authored section in each piece of Live Documentation could feasibly be replaced by whatever text is in the top-level file comment of a given file whose symbols and docstrings we can actually parse. [...] We would lose the ability to freely and simply describe non-plaintext things, though, so it's a real careful decision to be made."

## The answer, first

- **As a description of the file, mostly yes.** Of 80 claims in the sampled Purposes, 51 (64 %) are already said by the file's own comment. Another 24 (30 %) could be said there with nothing lost. Only 5 are anything else. Where a file has an opening comment, it is usually longer than its Purpose: 36 of 44 sampled. It also says things the Purpose leaves out. A median 69 % of a comment's content words never appear in its Purpose.
- **But in this repository few files have that comment.** 352 of 1,093 sources open with a comment about the file. 600 open with code. 102 have no comment syntax at all. 366 of the docs are tests, and only 54 of those tests have an opening comment.
- **Most authored words are Notes, not Purpose, and Notes are mostly history.** Purposes total 41,542 words; Notes total 203,330. Of 292 sampled Notes claims, 113 (39 %) are provenance: when, why, which turn, which decision. 22 (8 %) relate the file to other files or documents. 14 (5 %) are not about the file's text at all. 869 Notes carry a date, a record turn or a link into the session history. 627 docs link a session record from their Notes, 1,688 links in all. 79 link pictures and 79 link probes.
- **The products that would replace those Notes do not carry them today.** A document that links a file is shown with it under Cited By. But in this repository the configuration's `exclude` drops `AI-Agent-Workspace/**`, so no record, probe or picture page is ever counted as citing a file. The forward rule, `relatedDocsOf`, reads links in the authored words. If the authored words go, it has nothing left to read.
- **The owner's work languages rarely have a file comment.** In the scratch copies of the cold run's corpora, once licence banners and run-me notes are struck:
  - DNN Platform's C#: 45 of 3,973 files describe themselves.
  - tSQLt's T-SQL: 7 of 281.
  - DNN's `.SqlDataProvider` scripts: at most 139 of 299, mostly one-line change notes.
  - dbatools's PowerShell is the exception. 843 of 1,789 `.ps1` files carry comment-based help, but it sits inside their one function, which the adapter already reads as that function's summary. Only 26 put help at the top of the script, where PowerShell treats it as the script's own.
- **The "non-plaintext things" are few and short.** 102 docs describe files with no comment syntax: 72 JSON, 14 of them JSONC `tsconfig`s that do allow comments; 25 pictures, fonts, sounds, a video and a wasm; 3 text files, a patch and `.nvmrc`. Their Purposes run a median 24 words and never more than 68. They are one sentence about what the picture shows or what the fixture is for: "A crab stepping sideways, shown beside the help line about feeding." Their Notes run longer, a median 48 words; 56 of them pass 40 words.

What I would choose is at the end, under [A view, not a decision](#a-view-not-a-decision).

## What was read

- **In full:** every Live Doc's authored block, by script (1,093 docs). The 44 sampled pairs were read by eye, comment and Purpose and Notes, every claim. The product code that reads or writes the authored block, named below. The PowerShell, Python and C# adapters' headers and help readers.
- **By script only:** the opening comments of all 1,093 sources, and every file of the three corpora on disk. The comments outside the sample were checked by eye only in spot checks of each state.
- **Not read:** the repository's other markdown (design documents, records), except where this README cites it.

## How to run it again

From the repository root, with Python 3 and nothing installed:

```bash
P=AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/authored-section/scripts
python3 -I $P/count.py                # the counts: docs, Purpose, Notes, opening comments, links, provenance
python3 -I $P/sample.py               # the seeded sample's tally, with the hand classes in classes.tsv
python3 -I $P/sample.py --dump out.txt   # every sampled pair in full, each claim numbered, for reading
python3 -I $P/notes.py                # what all the Notes hold
python3 -I $P/corpora.py <checkout>... --ext .ps1,.sql,.cs   # opening comments in other repositories
```

[`scripts/lib.py`](scripts/lib.py) holds the two readers: the authored block of a doc, and the opening comment of a source file. [`classes.tsv`](classes.tsv) holds the hand classification of every sampled claim. `corpora.py` walks the checkout on disk and skips `.git`, `node_modules`, `bin`, `obj` and any `.mdmd` folder. It does not ask version control which files are tracked; see [Not finished](#not-finished-and-refused).

### What counts as a file-level comment

The comments before the first statement, grouped into runs that blank lines separate. Lines that only instruct a tool are struck first: `eslint`, `@ts-`, `#Requires`, `frozen_string_literal`, licence and copyright lines, `<auto-generated>`, and this repository's four stale `// Live Documentation:` pointers. Then, by language:

| Language | File-level comment |
| --- | --- |
| TypeScript, JavaScript, C, C++, C#, Java, Go, Rust, CSS | Every run but the last belongs to the file. The last belongs to it too, unless it sits directly on a declaration, with no blank line between; then it is that declaration's doc ("attached", 36 files here). Some always belong to the file: a JSDoc with `@module`, `@file`, `@fileoverview` or `@packageDocumentation`, and a Rust `//!`. A comment directly on `import`, `using`, `package`, `namespace` or `#include` belongs to the file. |
| Python | Leading `#` lines (not the shebang or coding line) and the module docstring. |
| PowerShell | Leading `#` lines or a `<# #>` block. "Help" when it has `.SYNOPSIS` or `.DESCRIPTION`. Help inside the file's first function, with nothing above it, is counted apart as "help in first function". |
| SQL | Leading `--` lines and `/* */` blocks, banner rules of `*`, `-` and `=` struck. |
| XML, `.csproj`, `.config`, HTML, `.aspx`, `.ascx`, `.cshtml` | A `<!-- -->`, `<%-- --%>` or `@* *@` after the XML declaration or page directive. |
| Ruby, shell, YAML, TOML, `.gitignore`, `.env` | Leading `#` lines; a Ruby comment directly on `class`, `module` or `def` is attached. |
| JSON, `.txt`, `.patch`, `.nvmrc`; pictures, fonts, sounds, video, wasm | No comment syntax. The one exception is a `tsconfig` that opens with a comment. |

## 1. The counts

`count.py`, over this repository:

| | Docs |
| --- | ---: |
| Live Docs | 1,093 |
| with a Purpose that says something (not `_Pending…_`) | 1,093 |
| with Notes that say something | 1,093 |
| with an authored section other than Purpose and Notes | 0 |
| test archetype | 366 |

The Purposes run a median 27 words (at most 327). The Notes run a median 64, with a 90th percentile of 465 and at most 5,507. Seventeen Notes still carry the generator's "No reader handles this kind of file yet" note, each beside words of their own.

The opening comments of the 1,093 sources, by state:

| State | Files |
| --- | ---: |
| a file-level comment | 347 |
| PowerShell help at the top | 5 |
| a leading comment that is the first declaration's doc | 36 |
| only tool directives | 3 |
| no leading comment | 600 |
| no comment syntax | 77 |
| binary | 25 |

By kind, the largest rows:

| Kind | Docs | File-level comment | Attached | None | No syntax |
| --- | ---: | ---: | ---: | ---: | ---: |
| `.ts` | 649 | 244 | 28 | 375 | 0 |
| `.json` | 72 | 0 | 0 | 0 | 72 |
| `.cs` (fixtures) | 59 | 2 | 0 | 57 | 0 |
| `.java` (fixtures) | 38 | 0 | 0 | 38 | 0 |
| `.py` | 32 | 22 | 0 | 10 | 0 |
| `.rs` | 27 | 14 | 1 | 12 | 0 |
| `.go` | 23 | 13 | 0 | 10 | 0 |
| `.rb` | 19 | 8 | 0 | 11 | 0 |
| `.css` | 15 | 3 | 7 | 5 | 0 |
| pictures, fonts, sounds, video, wasm | 25 | 0 | 0 | 0 | 25 |

Of the 375 TypeScript files with no opening comment, 292 are tests; the other 83 are product code. Non-test files have a file-level comment 298 times in 727; tests 54 times in 366. Root's hurried count of 382 opening comments sits between my 352 and my 352 plus the 36 attached ones.

## 2. What the opening comments say beside their Purposes

`sample.py`, seed `20261119`. Of the 352 docs whose source has a file-level comment, I drew 32 non-tests and 12 tests. Each group is split by its first two folders (`packages/engine`, `packages/explorer`, `scripts/layout-lab`, `tests/integration` and so on). Each folder gets a share proportional to its size, and at least one. The sample spans the engine, the Explorer, the generator, the CLI, five script folders, the browser tests, the integration tests and the sample programs in eight languages.

Every Purpose and Notes was split into claims, one per bullet or sentence, 372 in all. I read each claim against its file's comment and classified it:

| Class | Purpose claims | Purpose words | Notes claims | Notes words |
| --- | ---: | ---: | ---: | ---: |
| (a) already said by the file's comment | 51 (64 %) | 1,375 | 38 (13 %) | 1,278 |
| (b) could be said there with no loss | 24 (30 %) | 393 | 105 (36 %) | 2,282 |
| (c) provenance: when, why, a turn, a decision, history | 3 (4 %) | 64 | 113 (39 %) | 3,394 |
| (d) a relation to other files or documents | 1 (1 %) | 40 | 22 (8 %) | 473 |
| (e) not about this file's text | 1 (1 %) | 1 | 14 (5 %) | 257 |
| **all** | **80** | **1,873** | **292** | **7,684** |

How I drew the lines:

- A claim with a date that only stamps how the code works now ("Current binding contract (2026-11-08): ...") is (b). A claim that tells what changed and when is (c).
- A claim whose provenance the comment already quotes is (a). For example, `closed-looks.ts`'s comment quotes the owner's words of November 13 that its Notes quote.
- (e) holds:
  - measurements ("All nine take about 5.7 s"; "26 to 32 % less processor time"),
  - facts about the container ("This container has no Segoe UI"),
  - workspace rules ("Pictures are scratch or go to the day's probe folder"),
  - the generator's own placeholder note,
  - the word "Current." at the head of a Purpose.

**The other direction.** 36 of the 44 comments are longer than their Purpose. A median 69 % of a comment's content words appear nowhere in its Purpose, and 44 % appear nowhere in its Purpose and Notes together. What the comments hold that the authored words do not, by what I saw:

- **Usage:** `packages/cli/src/index.ts`, `scripts/contact-sheet/contact-sheet.ts`, `scripts/live-docs/visualize-rosetta.ts`.
- **An output's layout:** `staticBuilder.ts`.
- **The mechanism in more detail:** `network-simplex.ts`'s objective; `scip-edges.ts`'s three indexer wrinkles; `judgments.ts`'s five ranks.
- **The owner's words that motivated the file.** `drift.ts`, `directory-flow.ts`, `moment-files.ts`, `design-audit.ts` and `generatorIdentity.ts` quote them. In this repository the comments already carry provenance: 97 of the 352 file-level comments have a date or a history path.

### Pairs that show the pattern

`packages/explorer/src/client/panels/frame.ts`. Every Purpose sentence is (a). The Notes are provenance, a trial's status and two relations.

> Comment: "What frames the map (a trial, 2026-11-19): the sidebar, today's page, or Bare. Under Bare the sidebar is not drawn and what it held stands where it is used [...] Nothing is built twice: the frame moves the sidebar's own elements [...]"
>
> Purpose: "The Bare frame, a trial of a page without its sidebar. With Tuning's Page group's Frame set to Bare, it moves the sidebar's own elements to where they are used [...] Moving rather than copying keeps one implementation of every lever and filter."
>
> Notes: "Written on 2026-11-19 for the owner's question of [Turn 34 of the November 18 record] [...]"; "A trial, not a production decision"; "The crumbs are read by `frame-crumbs.ts` [...]"; "The design and what is left open are in the Explorer design's section on the frame".

`packages/explorer/src/client/views/localView/network-simplex.ts`. The Purpose restates the comment's first paragraph, Gansner et al. included. The Notes are 31 claims: 13 provenance, 11 how-it-works, 3 measurements, 2 relations to tests.

> Comment: "The exact solver behind the Local Map's placement: a linear program whose constraints are differences, λ(head) − λ(tail) ≥ δ for every edge [...]"
>
> Purpose: "The exact solver behind the Local Map's placement: a linear program whose constraints are differences between nodes, λ(head) − λ(tail) ≥ δ [...]"
>
> Notes, for example: "Since 2026-11-19 a pivot finds its leaving edge's lower end and postorder range once (`headSide`) [...]"; "On 252 random systems of 5 to 700 nodes the results are the same to the last field and the solver takes 18 % less time (the measurements, linked to [the map-reds probe](../map-reds/README.md))."

`packages/engine/src/languages/go.ts`. A short comment and a short Purpose that agree. The Notes are an origin link and a history of tuning.

> Comment: "Go Language Syntax Configuration. Provides comment delimiters, string delimiters, framework type filtering, and a string-aware comment stripper for Go source files."
>
> Purpose: "Provides Go-specific syntax configuration implementing `LanguageSyntax`. Defines comment delimiters (`//`, `/* */`), string delimiters [...] and a blocklist of common Go variable names [...]"

### The pairs that fit it worst

`packages/cli/src/index.ts`. The comment is a usage banner, and it is stale: it lists four commands. The Purpose names seven ("generate, lint, inspect, visualize, system, report, orphans") and why the dispatcher is thin. Taking the comment as the description would show an out-of-date list.

`.gitignore`. The comment is "Node/TypeScript workspace artifacts". The Purpose is a paragraph on what is left out and why: "a file git ignores gets no Live Doc". The Notes are fourteen claims of history and relations. A `.gitignore`'s comments are for its own lines, not for describing the file.

The sample programs. Their comments speak inside the story the sample tells. Their Purposes say why the fixture exists in our test suite.

> `tests/integration/programs/rust/stockroom/src/store/mod.rs`. Comment: "Where stock is kept." Purpose: "The `store` module of the stockroom sample program, as a `mod.rs` directory module: the `Inventory` trait and the `Listener` type." Notes: "Labelled `store` in Dependencies lists, the way a Python package's `__init__.py` is labelled by its package."
>
> `tests/integration/fixtures/manifests/workspace/python/src/tally/__init__.py`. Comment: "Counts what the shelves hold." Purpose: "The manifests fixture's Python package, a docstring alone, so that `tally` is a package of the src layout as setuptools finds it."

A stranger's repository has no second voice of this kind. For our own fixtures, the reason a sample exists belongs to the test that reads it, not to the sample.

## 3. What the Notes hold, over all 1,093

`notes.py`:

| Notes that contain | Docs |
| --- | ---: |
| a date (YYYY-MM-DD) | 867 |
| a record turn ("Turn 34") | 404 |
| a warning or rule (never, must, do not) | 300 |
| a test that measures the file | 170 |
| the owner quoted | 136 |
| a trial's or a decision's state | 128 |
| a measurement (%, ms, s, MB, a count of tests) | 88 |
| the 2025–26 planning words (Dev Day, Goal, Phase, P0) | 45 |

| Notes link to | Docs | Links |
| --- | ---: | ---: |
| anything | 719 | |
| a session record or summary | 627 | 1,688 |
| a design document (`.mdmd/layer-1` to `layer-3`) | 164 | 218 |
| another Live Doc | 86 | 152 |
| a picture or a Screenshots folder | 79 | 123 |
| a probe | 79 | 102 |
| a source file or another target | 84 | 85 |

The links land on 174 distinct record, probe and picture files. The most cited are the November 15 record (185 links), November 18 (137) and November 5 (125).

**Which of it would be lost, and where it could live instead:**

| Kind | Lost if the authored section went? | Its natural home |
| --- | --- | --- |
| What the file is and does | No, where the file has a comment | The file's opening comment |
| How it works, rules, warnings about its own code | Partly; 105 of 292 sampled claims could move | The comment |
| Provenance: dates, turns, the owner's words, decisions | Yes: 869 docs | git history and the records. The records would need to link to the file, and the reverse links would need to be shown (below). |
| Links to pictures and probes as evidence | Yes: 79 and 79 docs | The probe or picture README, linking the file |
| Measurements | Yes: 88 docs | The probe that measured them |
| A test that measures it | Mostly derivable already: the test's import is an edge | The generated Dependencies of the test |
| Relations to design documents | Partly already carried: a design document that links the file is under Cited By (328 entries come from `.mdmd/layer-3`) | The design document |
| Trial status ("a trial, not a production decision") | Yes: 128 docs | The comment, or the design document |

**Does the existing remedy carry these?** Read in [`relatedDocs.ts`](../../../../../../../packages/engine/src/live-docs/relatedDocs.ts) and [`discovery.ts`](../../../../../../../packages/engine/src/live-docs/discovery.ts):

- *Forward*, `relatedDocsOf`: the documents a doc's authored words link to are its Related Docs, the Explorer's purple documents, and part of every history step. With no authored words it has nothing to read.
- *Reverse*, `citingDocuments`: a markdown document anywhere in the workspace whose links name a file, or the file's doc, puts itself in that doc's generated `Cited By`. It reads the documents discovery hands over. Discovery leaves out what the configuration's `exclude` names, and this repository excludes `AI-Agent-Workspace/**`. So today no record, probe or picture README is ever a citer here. Every Cited By entry comes from elsewhere:
  - 328 from `.mdmd/layer-3`
  - 45 from `tests/integration`
  - 5 from `.mdmd/layer-2`
  - 2 from `AGENTS.md`
  - 1 each from three other places
- The bundle exclusions go further and hide the day records themselves (`*.record.md`), keeping only summaries, probes, research and screenshots.

So the reverse rule is the right mechanism for "a probe that measured this file is shown with it". Three things would have to change before it carried what the Notes carry now:

1. This repository's records and probes would have to be discovered for citations, though not necessarily bundled.
2. The 1,688 forward links would have to exist in the other direction. A record names files in prose more often than by markdown link, and records are history that is not rewritten.
3. A citer would have to be shown with the reason it cites the file. Cited By lists paths only; a Note says why.

## 4. The files with no comment syntax

| Kind | Docs |
| --- | ---: |
| `.json` (14 of them `tsconfig`, which is JSONC and could carry a comment) | 72 |
| `.png` | 12 |
| `.wav` | 4 |
| `.txt` | 3 |
| `.woff2` | 2 |
| `.jpg`, `.gif`, `.ico`, `.mp4`, `.ttf`, `.woff`, `.wasm`, `.patch`, `.nvmrc` | 1 each |
| **all** | **102** |

Where they sit:

- 53 in `tests/integration/programs`.
- 23 in `tests/integration/fixtures`.
- 5 in `packages/engine/grammars`.
- The rest are the repository's own configuration files.

Their Purposes total 2,479 words, a median of 24 and at most 68. They are the owner's "non-plaintext things", and what is written about them is one sentence each: what a picture shows, what a sound is for, which test a fixture serves.

- "The surf that loops behind the game."
- "The sprite sheet: the crab, the anemone, the shrimp and the starfish in four sixteen-pixel cells."
- "SlopCop test fixture font representing an orphaned/unused font asset, used to test that the asset validation pipeline identifies fonts that exist but are not referenced by any CSS."
- The longest is the compiled PowerShell grammar's: how it is built, and why it is committed.

Their Notes total 8,371 words, and 56 pass 40 words. `package.json`'s run to several paragraphs of script history, all of it provenance. So the worry is real but small: about a hundred one-sentence descriptions, and a few manifests with history.

## 5. What the product does with the authored section today

| Reader or writer | What it does with the authored words | If the words came from the source's comment |
| --- | --- | --- |
| `document.ts`: `DEFAULT_AUTHORED_BLOCK`, `UNREAD_AUTHORED_BLOCK`, render and parse, `authoredBlockOf` | Writes the `## Authored` block a new doc starts with: `_Pending authored purpose_`, `_Pending notes_`, or the no-reader note. Parses it back verbatim. | The block becomes a generated region, say `LIVE-DOC:BEGIN Description`. The no-reader note becomes generated text too, since it is the generator's own fact. |
| `generator.ts`, the prune | A doc whose file is gone is kept when `hasMeaningfulAuthoredContent` finds words in it, so that words are never deleted with their file. | Goes away. With nothing authored, a doc of a vanished file is always pruned. |
| `archetype.ts`: `hasMeaningfulAuthoredContent` | Tells words from placeholders, for the prune and the lint. | Goes away. |
| `lint.ts`: `validateAuthoredSections` | Warns of a missing Purpose heading, or a Purpose or Notes still pending. | Becomes, at most, an optional audit of files with no opening comment. It should not fail on a stranger's repository. |
| `coreConstants.ts`: `RESERVED_HEADING_NAMES` | Reserves Authored, Purpose and Notes as heading names. | Shrinks. |
| `graph.ts` | Carries each doc's `authored` text verbatim into the graph and index. | Carries the generated description instead. |
| `relatedDocs.ts`: `relatedDocsOf` | The forward Related Docs: links in the authored words. | Links in a comment are not markdown. Related documents would come from Cited By alone, or from paths and URLs recognized in comments, which no reader does today. |
| Explorer `card-reading.ts`: `purposeOf` | The Purpose is the 2D card's reading line under the file's name. Its first line is kept when zoomed out ("Descriptions Zoomed Out", 2026-11-15). Fixed slots give every card a Purpose slot. | Reads the description instead. A file with none shows an empty slot, as `_Pending_` does now. |
| Explorer `detailPanel.ts` and `reader-sections.ts` | The reader shows Purpose above the generated facts and Notes after them, rendered as markdown with links followed in the Explorer. | Shows the description above. Notes have no counterpart unless they become linked documents. |
| Explorer 3D map, `forceGraphView.ts` | Draws the documents the authored words cite, when a filter is on, and a moment's Related Docs from the history. | Cited By only. |
| Explorer search, `graph-search.ts` | Does not read the authored words. | Nothing changes. |
| `inspect` | Related documents both ways (`emit.ts`), and `--words` at a past moment prints the authored block (`inspect/history.ts`). | The same, from the description. |
| History: `summarizeChange.ts`, `summary.ts`, `rows.ts`, `words.ts`, `codec.ts`, `textStore.ts` | Each commit's summary keeps each file's authored block by hash, marked `unread` before 2026-09-27 when no `## Authored` heading stood. It also keeps the links from the authored words to documents that stood then. A step's word changes come from these. | Better, not worse. A file's comment exists at every commit of any repository, while committed docs exist only where someone committed them. The `unread` state and the committed-mirror read (`authoredReading`) would go away. |
| `download.ts` | The export's notes list "Purpose and notes (authored sections)". | Re-worded. |

A step's summary does not depend on authored words for anything but these words and links. Its files, wires, symbols and descriptions are generated.

## 6. What the readers already extract

No adapter reads a file-level comment today. The analysis result, `SourceAnalysisResult` in `coreTypes.ts`, has slots for symbols, dependencies, re-exports, a program entry and what the file declares. It has none for the file's own description. The doc format has one per-symbol generated `Summary` and no generated description of the file. The authored Purpose is the only place a file is described.

| Reader | What it reads of comments now | Where a file-level description sits in that language |
| --- | --- | --- |
| TypeScript and JavaScript (`jsDoc.ts`) | JSDoc and TSDoc on each declaration, through `ts.getJSDocCommentsAndTags`. A leading `/** @module */` block on the first import is attached to nothing. | A leading block, often tagged `@module`, `@file` or `@packageDocumentation`. |
| Python (`python.ts`, `python.docstring.ts`) | Docstrings of classes and functions; the module docstring is not read. | The module docstring. |
| C# (`csharp.ts`, `csharp.xmldoc.ts`) | `///` XML documentation on types and members. | No convention. A file's header is a licence banner, and the type's `<summary>` describes the type, not the file. |
| PowerShell (`powershell.ts`) | Comment-based help where PowerShell finds it for a function: `.SYNOPSIS`, `.DESCRIPTION` and `.PARAMETER` become the function's summary, remarks and parameters. Script-level help is not read. | Script-level comment-based help at the top of a `.ps1`, before `param()`. A one-function file such as dbatools's carries the help inside the function. |
| SQL (`sql.ts`) | Comments are blanked before scanning. | A header block, by convention. In practice it is a banner and a run-me note. |
| Rust, Go, C and C++, Java, Ruby | Doc comments on declarations. | `//!` (Rust), the `// Package x` comment (Go), `@file`/`@brief` (C), `package-info.java` (Java). |

Counted on the scratch copies of [the cold run's](../cold-run/README.md) corpora with `corpora.py`. These are dbatools `067b215b`, tSQLt `4a921d0d` and DNN Platform `9bc6b06f`, under the session scratchpad's `cold/` folder; nothing was downloaded. "Describing" means the comment keeps three words once boilerplate lines are struck. A line is boilerplate when ten or more files of the kind, and at least one in fifty, carry it word for word.

| Corpus, kind | Files | Leading comment | Help at the top | Help in the first function | Describing |
| --- | ---: | ---: | ---: | ---: | ---: |
| dbatools `.ps1` | 1,789 | 65 | 26 | 843 | 898 |
| tSQLt `.sql` | 281 | 14 | 0 | 0 | 7 |
| tSQLt `.ps1` | 38 | 8 | 0 | 0 | 8 |
| tSQLt `.cs` | 17 | 0 | 0 | 0 | 0 |
| DNN `.cs` | 3,973 | 3,955 | 0 | 0 | 45 |
| DNN `.SqlDataProvider` | 299 | 288 | 0 | 0 | at most 139 |
| DNN `.js` | 1,330 | 305 | 0 | 0 | 153 |
| DNN `.ascx` | 161 | 3 | 0 | 0 | 2 |
| DNN `.vb` | 87 | 0 | 0 | 0 | 0 |

- **DNN's C#.** 3,800 files open with the .NET Foundation licence and 116 with a copyright line. Strike those and 45 files describe themselves.
- **DNN's SQL.** Its `.SqlDataProvider` scripts open with a banner of asterisks and a note on `{databaseOwner}` and `{objectQualifier}`. The 139 that keep more are mostly one-line change notes on the first statement ("Update legacy messaging scheduler to use CoreMessagingScheduler").
- **dbatools.** The 755 test files open with `#Requires -Module Pester` and nothing else.

For the owner's estate, that means:

- The C# and T-SQL would have, almost everywhere, no file description at all.
- The PowerShell would have one where the author wrote script help.
- In one-function files, the function's synopsis would stand in for the file's.

## 7. What would be lost in this repository if it were done tomorrow

- **Provenance with no other home in the comment.** 886 docs carry a provenance mark in their Purpose or Notes (74 in the Purpose). Of the 991 sources that have comment syntax, 813 carry one. Only 325 of those 813 already open with a comment, and only 97 of the 352 comments carry such a mark themselves. So about 800 files' worth of dated history and record links would have nowhere to go but a comment. In the sample that history is 39 % of the Notes' claims and 44 % of their words.
- **Links.** 642 docs link a session record, 81 a probe, 79 a picture, from authored words that would go.
- **Descriptions.** 639 sources with comment syntax have no file-level comment: 600 with none, 36 whose leading comment documents the first declaration, and 3 with directives only. 102 more cannot have one. Today all 741 have a Purpose; tomorrow none would have a description. Of the 600, 305 are tests (292 of them TypeScript) and 295 are not (83 of them TypeScript).
- **The cost of moving the descriptions into source comments.** 639 files would gain a comment. Of the 352 that have one, about half would gain a sentence or two: in the sample, 21 of 44 Purposes say something their comment does not. That is about 810 source files touched for descriptions alone. Carrying the provenance as well would touch about 800 files, most of them the same ones.

Is a source comment the right home for "cites the summary turn that explains it"?

- For this repository, partly. Many comments here already quote the owner and a record path. `closed-looks.ts` and `estate.test.ts` do, and `drift.ts` quotes the owner's words of 2026-10-17.
- But a comment's link is a path in plain text, not a markdown link. No reader follows it, and the Explorer would not make it clickable.
- And the history would have to be rewritten into code files on every change. Today it goes into a doc beside them.
- For a stranger's repository, no. A stranger's history is in their commits and tickets, and we do not write into their source.

## A view, not a decision

Of the three choices root named:

- **(i) Keep the authored section as it is.** Nothing is lost here. But every doc must be committed into the mapped repository. On the largest corpus of today's tests that is 10,777 files and 118 MB, and in a stranger's repository each authored section starts as a placeholder.
- **(ii) Take the file's own comment as its description, generated. Keep authored words only for files that have no comment syntax, or as ordinary linked documents.** Every Live Doc becomes derivable from the source. The format becomes free to change and need not be committed. The history reads descriptions at every commit.
  - It loses this repository's Notes as they stand, and the descriptions of 600 files with no comment, unless someone writes those comments.
  - On the owner's C# and T-SQL it gives almost no descriptions, because those files carry none.
- **(iii) Drop authored words from docs entirely.** Like (ii), plus the 102 non-plaintext descriptions, which are short and could live in one document per folder that links them.

I would choose (ii), with three conditions:

1. Add a generated description slot and fill it from each reader's conventional place: the module docstring, a leading or `@module` block, `//!`, `// Package`, script help, and a SQL header with the banner struck.
2. Have Cited By count this workspace's records and probes, so that a probe or picture README that links a file is shown with it.
3. Keep this repository's present authored words as history until they are carried. Do not delete them in the change that adds the slot.

The deciding fact is that the owner's own languages mostly have no file comment at all. Only 45 of 3,973 C# files and 7 of 281 SQL scripts describe themselves. So the description will be empty for them whichever way it is stored. The question for them is whether a person writes descriptions somewhere, and (ii) lets that "somewhere" be a document the person keeps, not a file inside every Live Doc.

## Not finished and refused

- **Refused:** running `git -C <checkout> ls-files` on the corpora, refused because this builder may run git only inside its own worktree. I did not retry it another way. `corpora.py` reads the files on disk instead, skipping `.git`, `node_modules`, `bin`, `obj` and any `.mdmd` folder. Its counts may include a few untracked files; the commit IDs are the cold run's.
- **Not done:** checking, for the 1,688 record links, whether the record links back to the file. That would size how much of what the Notes carry the reverse rule could carry if records were discovered.
- **Not done:** AL-Go and AzureStack-Tools, the PowerShell wires probe's other corpora, are no longer on disk.
- **One rater:** the classification is one rater's. `classes.tsv` lets another rater disagree claim by claim.

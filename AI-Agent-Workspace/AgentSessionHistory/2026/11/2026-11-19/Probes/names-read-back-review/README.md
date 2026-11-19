# Review: every name a repository can hold reads back from its doc

Current as of November 19, 2026. An independent reviewer (a subagent of the root, Claude Opus 5.5) read commit `e5e28301`, "Write every name, path and link a repository can hold so that its Live Doc reads it back" (parent `0bb8bbbc`), in a worktree reset to that commit. I had the code and the brief's list of claims, not anyone's opinion of the code. I changed no product code or tests. Every experiment ran in a private temporary folder, and that folder has been removed. This file is the only thing committed.

## Verdict

**Do not land it as it stands. One mend is needed first, and it is small.** The one rule this commit makes the format's rule writes a value in double quotes when it holds a line feed. It does not do so when the value holds a lone carriage return. CommonMark ends a line at a lone carriage return, and so does the Explorer's own markdown renderer. So a hostile name can still change what a markdown viewer and the Explorer show in a generated doc. If this is fixed after landing, the format changes again and moves docs in every repository once more. Everything else below can follow in a later commit: words, tests and readers that were missed.

The change is a real improvement. Generation no longer throws on names that Windows and Next.js produce by themselves, and CRLF checkouts now read. In this repository nothing moved: no committed doc and no past doc. I confirmed both claims by runs.

## How I tested

- I ran the commit's own tests: `document`, `document.fuzz`, `compose` and `relatedDocs` (56 pass). With the `graph` and `generator` unit tests added, 92 pass.
- `npm run live-docs:generate -- --check`: 1,092 docs unchanged.
- I read every Live Doc blob in `e5e28301`'s history (12,479 unique blobs) with the reader before the change and the reader after it, and compared the results and every link's resolution.
- I wrote probes that drive the real composer, writer, reader, graph, generator, the Explorer's markdown renderer and the SlopCop link audit on values I built. The probe scripts were temporary and have been deleted.
- I ran six mutations: each removes one part of the change, then runs the tests again.

## Findings, most consequential first

### 1. A lone carriage return is still written bare, so a name can rewrite what viewers show

- **What happens:** `writeValue` (`packages/engine/src/live-docs/document.ts:293`) writes a value in quotes only when it holds `\n`, a lone surrogate or nothing at all. Any other value goes in a code span exactly as it is, including a carriage return (`\r`), U+2028 or U+2029.
  - Our reader splits lines only at LF, so the value reads back correctly.
  - CommonMark's line rule is different: a line ends at LF, at CR followed by LF, and at a CR on its own. The Explorer's renderer turns every `\r` into a line break before it renders (`packages/explorer/src/client/markdown.ts:40`).
- **Confirmed by a run:** I sent a JSON key through `computePublicSymbolHeadingInfo`, `composeSymbolBlocks`, `renderLiveDoc` and `parseLiveDoc`. The key was ``"ok\r#### `injected` {#symbol-injected}\r- [`click`](https://example.invalid/)"``.
  - The reader gives back one symbol with exactly that name.
  - Split by CommonMark's line rule, its heading becomes three lines: a heading, a second heading `` `injected` ``, and a list item holding a live link.
  - The Explorer's inspected-symbol panel (`detailPanel.ts:392`, which re-renders `renderSymbolBlocks` through `renderMarkdown`) produced two `<h4>` headings and `<a href="https://example.invalid/" target="_blank">`.
- **Who is affected:** anyone who reads, on GitHub, in VS Code or in the Explorer, the doc of a repository that holds such a JSON key, script name or module specifier.
- **Is it new?** Headings had this problem before the commit. But this commit records the rule as "a name with a line break … is written as a JSON string", and the rule is not true for a carriage return.
- **Why the tests miss it:** the fuzzing test includes `"\r"` among its pieces. It checks only our own reader, so it passes.
- **Fix:** quote a value whenever it fails the `LINE_TEXT` test (LF, CR, U+2028, U+2029). The `TEXT` slot already uses that test. Then add CommonMark's line rule to the fuzzing test's oracle: split the written doc at CR as well, and require no line the writer did not write.

### 2. Docs committed before this change, in other repositories: some are refused, some are read as something else

This repository has none of these cases: every one of its old docs reads identically, as the history check above showed. Another repository with committed docs would see the following, and the new reader cannot tell an old form from a new one.

| Value in the source | Old doc wrote | New writer writes | New reader on the old doc |
| --- | --- | --- | --- |
| A leading or trailing space in a slot that wrote bare backticks: parameter, type, external dependency or its symbols, command, manifest label, citing-document label | `` ` x` `` | `` `  x ` `` | **Refuses the doc** (`unexpected parameter …`): it fails the check that each value has one form (`document.ts:300`) |
| A code path beginning with `"` (a root file named `"q".ts`) | `# "q".ts` | `# "\"q\".ts"` | **Refuses the doc** (`unexpected title`) |
| A docstring line of a backslash and then a format heading, fence or marker (`` \#### `x` ``, ```` \``` ````) | written as it is | one more backslash | **Silently reads the line with one backslash fewer** (`` #### `x` ``) |
| A file name holding well-formed percent-encoding (`a%41.ts`) | link `a%41.ts.mdmd.md` | `a%2541.ts.mdmd.md` | **Silently resolves the link to `aA.ts`** (`graph.ts:237`) |
| A path with a space, `&`, an unpaired `(`, `?`, `<`, `>`, `\` or a tab | raw | percent-encoded | Reads as before |
| A name ending in a parenthesised word (a locale key `Save (Ctrl+S)`) | `Save (Ctrl+S)` | `Save (Ctrl+S) (key)`, same anchor | Reads as before; `symbolName` gives `Save` |

All of these were confirmed by a run that wrote each case with the old writer and read it with both readers.

- **When the new reader refuses a doc:** `readLiveDocGraph` stops (`graphFiles.ts:34-37`). Until the repository is regenerated, that stops `inspect`, the Explorer build from committed docs, the estate reader and the history's check at the head. `live-docs:generate` repairs it, because `readExisting` falls back to the lenient reader (`generator.ts:571-580`).
- **When the new reader silently misreads:** the graph shows the wrong docstring line or the wrong edge until the next generation, and nothing says so.
- **Fix:** mainly words, because no code can tell the silent cases apart.
  - The decision's "What moved" names two exceptions. It should also name the refusals, the two silent misreadings, the code path that begins with a quote, and `?`, `<`, `>`, `\` and control characters among the newly encoded characters. It should tell a person upgrading to regenerate before reading.
  - Optionally, the reader could accept an old space-padded code span. That form is unambiguous to read. Today the one-form check refuses it.

### 3. Readers the change missed

- **The Explorer's markdown renderer** (`packages/explorer/src/client/markdown.ts:252`, `:254`; it has no handling of backslash escapes):
  - **Paired parentheses:** it ends a link target at the first `)`. A run confirmed that it passes `plan%20(draft` to the link handler, so the person sees an unavailable link followed by `.md)`. The decision does acknowledge this one.
  - **Escaped docstring lines:** in the inspected-symbol panel these now show a stray backslash, `\#### z`. An escaped unpaired fence also garbles the code spans after it. Confirmed by a run.
  - **Longer code-span fences:** a name written with them, such as ``` ``x`y`` ```, renders garbled. Headings already did this; now parameters and types do too.
  - **Fix:** teach the renderer CommonMark backslash escapes and backtick-run code spans. Alternatively, draw the inspected symbol from the model instead of re-rendering markdown.
- **The SlopCop markdown audit** (`scripts/slopcop/markdownLinks.ts:155` decodes with `decodeURI`, and `parseLinkTarget` cuts the target at `"` and `'`):
  - **Confirmed by a run:** it reports `./R%26D.md`, `./a%23b.md`, `./why%3F.md` and `./q"x.md` as broken. The graph resolves all four.
  - **`&` is a regression:** a raw link to `R&D.md` passed this audit before the commit and fails now. `#` and `?` failed before as well. The decision's "What remains" names `%23` and `%3F` but not `%26`. This audit is part of `safe:commit`.
  - **Fix:** decode the part before the first `#` with `decodeLinkPath`.
- **The SlopCop symbol audit** (`scripts/slopcop/symbolReferences.ts:423`) and **the documentation-link enforcement** (`scripts/doc-tools/documentationLinks.ts:13`, `:622`; part of `npm run verify`) use the same `decodeURI`, and the second also cuts at the first `)`. Found by reading; I did not trace the consequence.
- **`scripts/live-docs/find-orphans.ts:106`** reads the `Code Path` with its own pattern. A quoted code path is taken with its quotes and escapes, so the script reports a false orphan. Found by reading.
- **The history's `AUTHORED_HEADING`** (`packages/generator/src/history/summarizeChange.ts:127`) and **the generator's fallback `Generated At` pattern** (`generator.ts:578`) use the `m` flag. That flag ends lines at CR and U+2028 as well, while `authoredBlockOf` now ends them only at LF or CRLF. The consequence is small today. With the mend in finding 1 the two would agree.
- **The agent skill** (`.agents/skills/live-documentation/SKILL.md:13`) tells an agent to search for `` #### `Name` ``. That search misses a quoted name or one written with a longer fence. Found by reading.

### 4. Tests that cannot fail, and what the fuzzing generator cannot make

Each mutation was run against the six unit files above. The CRLF mutation was also run against `tests/integration/live-docs/round-trip.test.ts`.

| Part of the change removed | Result |
| --- | --- |
| `&` taken out of `LINK_UNSAFE` (`document.ts:369`) | **All 92 tests pass** |
| No quoting for a plain form that begins with `"` (`document.ts:294`) | **All 92 tests pass**, yet a root file `"q".ts` then gets a title its reader refuses (finding 2's run reads that exact line) |
| No extra backslash for a line already behind backslashes | 2 tests fail |
| No check that each value has one form (`document.ts:300`) | 1 test fails, a hand-written one; the fuzzing test passes |
| The graph no longer decodes a link's path | 5 tests fail |
| No CRLF reading | 6 tests fail, including the round-trip test |

The fuzzing generator cannot make these cases:

- **Paths:** every path segment is `d` followed by the name (`document.fuzz.test.ts:98-100`), and the code path is always `src/….ts` (line 150). So it makes no title that begins with `"`, a space or `#`, no doc at the root, and no link that begins other than `./` or `../`.
- **Characters:** it makes no CommonMark entity such as `&amp;`, and no lone surrogate in a path (`segment` replaces it).
- **Old docs:** it reads only what the new writer wrote, so it cannot see finding 2.
- **Viewers:** its oracle is the WHATWG URL parser for links and our own reader for everything else, so it cannot see finding 1.
- **Fixed parts:** kinds, flags and the archetype are fixed, and it makes only one pair of re-exports.

**Fix:** add a fixed case for `&` and one for a code path that begins with a quote, and add the viewer's line rule from finding 1.

### 5. A doc with CR-only line endings loses its authored words

- **What happens:** `authoredBlockOf` (`document.ts:1025`) now splits lines only at LF and CRLF. The old pattern found `## Authored` after a lone CR.
- **Confirmed by a run:** on a doc with CR-only line endings, the old reader returns `### Purpose\rKeeps the ledger.` and the new one returns the default placeholders.
- **Consequence:** the generator uses this reader for a doc the grammar refuses (`generator.ts:579`). It also uses it to decide whether a stale doc holds authored words before deleting it (`generator.ts:419`). So such a doc's words are replaced, or the doc is deleted along with its file.
- **Who is affected:** rare in practice (classic Mac editors).
- **Fix:** the lenient reader should be the most forgiving one: split at `\r\n?|\n`. This is safe once finding 1 quotes CR.

### 6. Simpler forms and lost distinctions

- **Two forms for one link.** The composer percent-encodes, so its link is a URL. The writer also quotes any other link as a JSON string, and `document.test.ts` expects ``("./app/(auth)/package.json.md")``. CommonMark reads that destination with the quotes in it, so no viewer opens it.
  - The composer reaches the quoted form only for a lone surrogate, which `encodeLinkPath` leaves alone. Only a Windows file name can hold one.
  - Simpler: let the writer percent-encode a link's path itself, or refuse a link that is not a URL reference. Then drop the quoted form for links. "A link is a URL reference" would then hold for the format, not only for the composer.
- **`SOURCE` is `LINK` plus `#L<n>`.** It is read up to the last `#L`, which only a raw `#` in a path needs. Now that `#` is encoded, the first `#` begins the fragment, so the slot could go.
- **The Explorer has its own copy of the link decoding** (`reader-links.ts:16-31`) beside `graph.ts`'s. `document.ts` imports nothing, so the client could import `decodeLinkPath` instead.
- **A distinction deepened.** A heading's text still holds both the name and its disambiguating suffix, which `symbolName` pulls apart with a pattern. To keep that pattern right, the change adds `(kind)` to every name that ends in a parenthesised word. The cost lands in other repositories: every locale key like `Save (Ctrl+S)` changes its heading. A separate suffix in the model would remove both the pattern and the extra suffix. That is out of this commit's scope.

### 7. Words that are not true

- **The decision's "What moved"** is incomplete (finding 2).
- **The decision's "What remains"** names `%23` and `%3F` for the link audit. The audit failure this commit introduces is `%26`, and the symbol audit and the documentation enforcement share the same `decodeURI`.
- **The decision and the `writeValue` comment** (`document.ts:284-290`) say a name with a line break is quoted, and "the plain form cannot carry a line break". A plain name carries CR, U+2028 and U+2029 exactly as they are, and `document.test.ts` asserts that a name holding U+2028 is written bare. The comment's reason for escaping U+2028 inside quotes, "so that it stays on its line for every reader", argues for quoting such a plain name as well.
- **The `document.ts` header** says that `renderLiveDoc(parseLiveDoc(text))` equals `text` "for every doc the generator has written". That is not true of docs written before this commit that the reader now refuses.
- **Noticed, not this commit's code.** `compose.ts`'s generated doc now lists `document`'s types as value dependencies. The reason is that `compose.ts` now imports them with an inline `type`, and the TypeScript reader honours only a statement-level `import type`.
- **True as written:** "11,517 links, of `-./0-9@A-Za-z_` only". I counted 11,523 generated link targets, fragment-only ones included, and found no other character in any path.

## Each reader of a Live Doc or its links

| Reader | Status |
| --- | --- |
| `document.ts` `parseLiveDoc` and `Reader` | Changed |
| `document.ts` `authoredBlockOf` | Changed (finding 5) |
| `graph.ts` `resolveDocLink`, `linkTarget` | Changed: decodes the path before the first `#`. The fragment is not decoded, which agrees in practice because anchors hold no `%` |
| `graphFiles.ts` `readLiveDocGraph` | Agrees, through the reader. It stops on a refused doc (finding 2) |
| `relatedDocs.ts` (related documents, Cited By) | Changed |
| History `summary.ts`, `headCheck.ts` (through `linkTarget`) | Agree |
| History `summarizeChange.ts` `AUTHORED_HEADING` | Missed (minor, finding 3) |
| `generator.ts` `readExisting`, stale-doc pruning | Agrees; its fallback pattern was missed (minor) |
| Explorer `staticBuilder.ts`, `shared/graph.ts` | Agree |
| Explorer `reader-links.ts` | Agrees: it has its own decoding of the path before the `#` |
| Explorer `markdown.ts` (authored prose, bundled docs, inspected symbol) | Missed (finding 3) |
| Explorer downloads (`renderLiveDoc` from the graph) | Agree |
| Explorer `card-reading.ts` | Agrees |
| CLI `inspect.ts`, `inspect/resolve.ts`, `inspect/emit.ts` | Agree |
| `boardGraph.ts`, `estateGraph.ts` (`symbolName`) | Agree |
| `scripts/live-docs/lint.ts` | Agrees (its link check looks only for absolute links) |
| `scripts/live-docs/find-orphans.ts` | Missed |
| `scripts/slopcop/markdownLinks.ts` | Missed (`&` regression) |
| `scripts/slopcop/symbolReferences.ts` | Missed |
| `scripts/doc-tools/documentationLinks.ts` | Missed |
| `.agents/skills/live-documentation` | Missed (heading search) |
| Markdown viewers | Agree on links; disagree on a lone CR (finding 1) |

What a person sees in the Explorer:

- **A quoted name:** the views drawn from the graph show the name itself. The inspected-symbol panel shows the JSON form, `"a\nb"`, with its quotes and backslash.
- **An encoded generated link:** it opens the right file.
- **An authored link with paired parentheses:** it shows as unavailable, followed by `.md)`.
- **An escaped docstring line:** in the inspected-symbol panel it keeps its backslash. On cards it shows as it always did, because cards are drawn from the model.

## The claims, one by one

| Claim | Holds? |
| --- | --- |
| 1. Round trip | Yes for our reader, through the composer, LF, CRLF and UTF-8, on every name I built and on a hostile repository run through the real generator. For markdown viewers, no: a lone CR breaks it (finding 1) |
| 2. No two values read as one | Yes among a doc's symbols, commands and specifiers. Re-export anchors can still collide, as the decision says |
| 3. Never a throw on a name | Yes for what the new generator writes. A doc written before is refused when it holds a padded name or a quote-led path (finding 2) |
| 4. Nothing that read back before has moved | True for this repository: every doc unchanged on regeneration, and all 5,358 historical blobs the old reader read are read identically, links included. Not true beyond it (finding 2) |
| 5. LF and CRLF | Yes |
| 6. Every reader of a link decodes it the same way | No for the audits, the documentation enforcement and the Explorer's renderer (finding 3) |
| 7. Linear cost | Yes, measured below. The `relatedDocs` pattern stays quadratic on many `](<` without a closing `>`, but that predates the commit and the new pattern is about 2.7 times faster |

## Checked and sound

- **Code spans:** the writer and reader are inverses on backticks, padding and names made only of spaces.
- **One form per value:** the reader refuses a quoted value the plain form could carry, and refuses non-canonical JSON escapes.
- **Docstring escaping:** the writer and reader agree on where fences are. Section markers are escaped even inside fences, because the reader finds a section's end without regard to fences.
- **Anchors** are unique among a doc's symbols, across case twins and suffix-like tails.
- **The real generator on a hostile workspace** finished without a warning, resolved every edge and Cited By link, and read the same graph under CRLF. The workspace held a root file `"q".ts`, `R&D.ts`, `app/(auth)/page.ts`, file names with CR and LF, `a%41.ts`, JSON keys with CR, padding, U+2028, an empty key and `Save (Ctrl+S)`, and a document `notes/plan (draft).md` that links to them.
- **Cost:**
  - A dependency line of 80,000 symbols (789 KB) is read in 193 ms.
  - A docstring of 80,000 lines of fences and headings is written and read in 332 ms.
  - Four times the input takes about four times as long.
- **`trimEnd`** strips the same characters as `\s+$`.

## Not checked

- The claim that the fuzzing test fails every case on the old code: I did not rerun it.
- A real CommonMark renderer. None is installed, so I used the specification's line rule and the Explorer's own renderer.
- Windows and macOS file systems: lone surrogates in names, NFD file names.
- The Explorer in a browser. The brief allowed no browser, so I ran the renderer in Node.
- The full gate, lint, the E2E suite, the estate reader, the consequence of the `documentationLinks` mismatch, and the symbol audit by a run.
- A history rebuild. Landing this changes the history's lens key, since engine code is keyed, so every cached history will rebuild once.

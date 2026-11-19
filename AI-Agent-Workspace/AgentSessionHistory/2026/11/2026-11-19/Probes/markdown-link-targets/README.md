Current as of November 19, 2026.

# How a markdown link's target is read: one rule, CommonMark's

A builder's handback to the root, on its branch. Before this round, three readers each read a link's target by a pattern of their own, and they disagreed: the engine (`relatedDocs.ts`), which decides a file's related documents and every document's citations; the Explorer's renderer (`markdown.ts`), which ended a target at its first `)`; and the markdown link audit (`scripts/slopcop/markdownLinks.ts`), which decoded with `decodeURI`. All three now read links by one module, `packages/engine/src/tooling/markdownLinks.ts`, graded by CommonMark's own examples.

## The second leg

This leg answers the root's review of `c2bfd65f` and sits on top of it, in six commits: `95fb8cf9`, `a6c1c638`, `f540ca5f`, `145bcd25`, `8215a0d0`, and the commit that brings this README level. The sections after this one describe the first leg; where this leg changed something, this section says so and wins.

### 1. Reading is linear (`95fb8cf9`)

The review measured six inputs that made a reader read the same characters again and again, and a document holding one could stop a run. One paragraph of 80 KB, timed with the same script before and after:

| Hostile paragraph | Before: read, rendered (load 27) | After: read, rendered (load 31) |
| --- | --- | --- |
| A run of unclosed destinations, `[a](` | 69.5 s, 81.6 s | 0.28 s, 0.23 s |
| Unclosed comments, `<!-- ` | 3.9 s, 4.6 s | 0.10 s, 0.11 s |
| Unclosed instructions, `<? ` | 5.3 s, 5.0 s | 0.12 s, 0.10 s |
| Unclosed declarations, `<!a ` | 10.6 s, 12.5 s | 0.14 s, 0.08 s |
| Many images | 9.9 s, 2.1 s | 0.09 s, 0.22 s |
| Unmatched `[`, then links | 5.8 s, 8.7 s | 0.08 s, 0.18 s |
| 20,000 links rendered | 11.4 s | 0.30 s |

What changed:
- A bare destination's parentheses nest at most 32 deep. cmark sets the same bound, and the specification allows one. With it, any character is scanned by at most about 33 attempts.
- A comment, a processing instruction, a declaration and CDATA end at a closer. One search finds the closer, and reading reuses it as it goes forward; no regular expression is involved.
- Making a link deactivates the earlier openers by one number.
- A code span's closer comes from an index of the paragraph's backtick runs.
- One sweep tells which tokens stand inside an image.
- The renderer starts each link's text at its first token, found by a binary search.

The proof counts steps instead of timing them. The reader exposes `readingSteps` and the renderer exposes `renderingSteps`. For ten hostile paragraphs in the reader and three in the renderer, ten times the text must take fewer than twelve times the steps. Lifting the nesting bound, the memoized closer search and the one-number deactivation makes seven of the reader's cases fail, and lifting the renderer's start index makes its three fail.

The count does not see scanning inside a regular expression. The patterns left (tags, autolinks, angle-bracket destinations, labels) are each bounded by their own delimiters, as the module's comments say.

### 2. Whole documents against commonmark.js (`a6c1c638`)

The root `package.json` gains `"commonmark": "^0.31.2"`, the same line the names' builder adds.

`tests/integration/live-docs/markdown-links-commonmark.test.ts` compares the links, images and autolinks the rule reads, destination and title, with those commonmark.js finds. It covers every markdown file the repository tracks, 2,004 files and 51,823 links. A register of named differences holds what is allowed to differ.

The register holds one entry. **I have not decided anything about it.** The entry is `AI-Agent-Workspace/AgentSessionHistory/2025/12/Summarized/2025-12-06.2.SUMMARIZED.md`, lines 126 to 129. There, a ```` ```markdown ```` fence is indented four spaces under a list item; it is the named departure, a fence inside a container. The rule reads the fence as text, so it counts the two example links inside it: `./logger.h.mdmd.md#symbol-log_message` and `./metrics.h.mdmd.md#symbol-compute_average`.

That file is a session summary under `AI-Agent-Workspace`, which the configuration excludes, so it moves nothing on the map. It is still the kind of wrong connection the root named. The same comparison over the four cold corpora's own markdown (132 files, 2,990 links) found no difference.

### 3. Reference links are counted (`8215a0d0`)

As ruled, `markdownLinkTargets` counts reference links. The renderer hides definition lines, using the module's new `leadingDefinitions`, and takes a `definitions` option. `detailPanel.ts` passes the whole authored block's definitions to it. Every file's related documents and every document's citations are unchanged.

**No pictures were taken for this.** No document here holds a relative reference link, and the fixture has none. Unit tests cover it, and both new cases fail on the previous code.

### 4. The readers still on patterns of their own (`f540ca5f`, `145bcd25`)

Done:
- The graph's `resolveDocLink` and the Explorer's `resolveReaderTarget` (in `reader-links.ts`) take the path and fragment from `linkPath`. Each kept copy is gone.
- `graph.test.ts` gains a test of its own for `R%26D.md`, `a%23b.md#top`, `why%3F.md?plain=1`, a malformed escape, a bare fragment and an external URL. It fails on the previous `graph.ts`.
- `symbolReferences.ts` and `documentationLinks.ts` decode with `linkPath` in place of `decodeURI`.

Not done:
- `symbolReferences.ts` and `documentationLinks.ts` still find links by patterns of their own, and no test of the decoding was added for either.
- `scripts/live-docs/lint.ts` near line 262 is untouched.
- `githubSlugger.ts` near line 116 is untouched.

**For the joining:** `decodeLinkPath` in `document.ts` now has no caller among the link readers. I did not delete it, since `document.ts` belongs to the names' builder.

### 5. The inspected-symbol panel: not done

The panel still renders `renderSymbolBlocks`, the doc's written form. So a quoted name still shows with its quotes and backslashes, and a name in a longer backtick fence is still garbled. I have not checked by a run that an escaped fence in a docstring no longer garbles what follows it. There are no pictures for item 5.

### 6. CR-only line numbers in the audit (`a6c1c638`)

`computeLineStarts` in `markdownShared.ts` ends a line at LF, CRLF or a lone CR. A test covers all three endings and an encoded `&`, and it fails on the previous code.

### Verification of this leg

- **`npm run safe:commit`, without the browser.** The docs pipeline, lint, the build and the type check of tests passed. Unit tests: 2,513 of 2,514 passed. The one failure was `generatorIdentity.test.ts`, which timed out at 5 s at a load of 49; alone, at a load of 25, it passed 9 of 9.
- **Integration, run alone** because the gate stops at a failed stage: 156 of 156 passed. That includes the new oracle over whole documents.
- **The three audits:** 0 broken links, 0 broken asset references, 0 symbol issues.
- **Red before.** Each new unit test fails on the code before its change, as described above.
- **The graph.** The script still reads every file's related documents and every document's citations as before; the only differences are the docs of new files.
- **Not rerun.** The browser case and the pictures were not taken again in this leg.

## Where the module lives, and why

The module is `packages/engine/src/tooling/markdownLinks.ts`, beside `githubSlugger.ts`. `tooling/` holds pure helpers that both the Node side and the browser client import, through `@live-documentation/engine/tooling/*`. The client bundle (esbuild, `buildAssets.ts`) already takes `githubSlugger` from there.

The module has no dependencies. Its one import is `htmlEntities.ts`, HTML's 2,125 named character references with their semicolon, taken from the MIT `html-entities` package already among the development dependencies. `relatedDocs.ts` stays apart from `graph.ts`, so `minimatch` still stays out of the browser.

What the module provides:
- `readMarkdownLinks(document)`: every link, image and autolink, each with its offsets, kind, destination and title; the references whose label nothing defines; and the definitions.
- `inlineTokens(text)`: one paragraph's links, plus everything that claims characters before a link can: code spans, escapes, character references and raw HTML. The renderer uses this.
- `linkPath(destination)`: how a destination becomes a path. The fragment is set apart first, then the query, as a browser reads one, then the path is percent-decoded. A path whose encoding is malformed is left as written.

The module differs from CommonMark in three places, each named in its header. All three come from the same cause: the module keeps no container structure of lists and block quotes.
- It does not recognise indented code blocks.
- It does not recognise a fence inside a container. Fences are found at the start of a line, as the renderer and the symbol audit find them.
- It does not recognise HTML blocks.

## The oracle and the scores

The oracle is the specification's own examples: version 0.31.2, `https://spec.commonmark.org/0.31.2/spec.json`. No CommonMark parser was among the dependencies.

The excerpt covers the eight sections that bear on links: backslash escapes, character references, link reference definitions, code spans, links, images, autolinks and raw HTML. That is 230 examples, kept unchanged with their source and their licence (CC BY-SA 4.0) in `packages/engine/src/tooling/__fixtures__/commonmark-link-examples.json`.

The test is `markdownLinks.commonmark.test.ts`. Each example must give the reference renderer's `<a href>` and `<img src>`, with titles, in order, or be named with its reason. A named example that starts to pass fails the test.

| Reader | Examples passed (of 230) | Links section (of 90) | Backslash escapes (of 13) |
| --- | --- | --- | --- |
| The new rule, destinations and titles | 229 | 90 | 13 |
| Engine before (`markdownLinkTargets`, destinations only) | 124 | 34 | 9 |
| Explorer before (its pattern, destinations only) | 108 | 24 | 9 |
| Audit before (its patterns, destinations only) | 131 | 39 | 9 |

The one example the new rule does not pass is 211, a definition inside an indented code block. The rule does not recognise indented code, so it reads the definition.

## Reference-style links and autolinks: counts, and a fork

Counted by the new rule:

| Corpus | Markdown files | Reference links | Of them to a relative path | Autolinks | Of them relative |
| --- | --- | --- | --- | --- | --- |
| This repository, every tracked `.md` | 1,992 | 0 | 0 | 3 | 0 |
| Dnn.Platform, its own markdown | 104 | 1 | 0 | 1 | 0 |
| Dnn.Platform, its Live Docs | 10,776 | 0 | 0 | 0 | 0 |
| dbatools, its own markdown and its Live Docs | 24 and 1,977 | 0 | 0 | 0 | 0 |
| shop and tSQLt, their own markdown and their Live Docs | 4 and 483 | 0 | 0 | 0 | 0 |

Before this round, how each reader treated them:
- **The engine** counted neither kind.
- **The Explorer** linked http, https and mailto autolinks, and rendered reference links as text.
- **The audit** checked reference links and reported a label that no definition names. It skipped autolinks as external.

The module reads both kinds. CommonMark reads in two stages: it collects definitions while splitting lines into paragraphs, then reads each paragraph's inline text. Inline links already need that, so reading references costs no second pass.

**Autolinks.** An autolink is an absolute URL by definition, so it can never name a file of the workspace. The engine leaves it out. The renderer still links only the web and mail.

**The fork: counting reference links.** I did not make the engine count them. The Explorer's reader renders a doc's authored block one section at a time (`detailPanel.ts`, not my file). A reference whose definition stands in another section would therefore be counted on the map and still not open in the reader. To count reference links, two more changes are needed:
1. The renderer hides definition lines.
2. `detailPanel.ts` passes the whole block's definitions to `renderMarkdown`.

My recommendation is to count them when the work above is done: CommonMark says they are links, and no repository on disk holds one to a relative path, so counting them moves nothing today.

## Nothing of this repository moved

- **Related documents and citations.** I ran a script over the graph before and after the change. It recorded every file's related documents (661 pairs over 1,092 files) and every document's cited files (383 citations from 58 documents). It also recorded every raw target read from an authored block (2,429) and from a document (1,228). The two outputs are byte-identical.
- **The Live Docs.** `npm run live-docs:generate` rewrote only the docs of the files changed here, plus `scripts/live-docs/visualize-sample.ts`. That doc gained a generated `Entry` line for the new `live-docs:visualize:link-targets` command. The new fixture adds one citation: its `notes/plan (draft).md` links to its `src/plan.ts`.
- **The link audit.** Over exactly the 1,633 files it scans, the old and new audits check the same 22,631 paths, compared file by file, and both report nothing. No link here was wrongly reported or wrongly passed. Over every tracked markdown file, including the session exports and records outside the audit's scope, 18 files differ. Most of those differences are JavaScript code pasted into raw exports.
- **The three audits after the change.** markdown: 1,644 files, 0 broken links. assets: 0 issues. symbols: 0 issues.

## The Explorer shows what the engine counted

I added a fixture workspace, `tests/integration/fixtures/link-targets/`. Its one file's authored Purpose links to `notes/plan (draft).md` six ways:
1. in angle brackets;
2. bare, with parentheses that pair;
3. fully percent-encoded;
4. with backslash escapes;
5. with a title in quotes;
6. with a title in parentheses.

It also links once into `app/(auth)/`. Its docstring holds ``#### `notes` ``, a line the Live Doc writes as ``\#### `notes` ``. `npm run live-docs:visualize:link-targets` builds the fixture into the suite's bundles, and the new entry in `scripts/e2e-bundles.mjs` keeps it there.

The browser case is `tests/e2e/link-targets.spec.ts`. It checks that all seven links open their documents, that the documents opened are exactly the bundle's related documents, that a click opens the document, and that the docstring line shows no backslash.

Matched pictures, before (`e5e28301`'s renderer and engine reader) and after:

- [before-purpose-links.png](before-purpose-links.png): six of the seven links are dead text followed by debris such as `.md>)`. Only the encoded one opens.
- [after-purpose-links.png](after-purpose-links.png): all seven open.
- [before-symbol-docstring.png](before-symbol-docstring.png): the line reads ``\#### notes``.
- [after-symbol-docstring.png](after-symbol-docstring.png): the line reads ``#### notes``, as a markdown viewer shows it.

## Verification

- **Red before.** Every new unit test fails on `e5e28301`'s code and passes on the new code: the engine's two new cases, the audit's new case, and the renderer's five new or changed cases.
- **The browser case was not run against the old code.** Its failure there is shown by the probe instead: six of seven links rendered as `unavailable-link`, and the backslash showed.
- **Build and the three audits** pass.
- **`npm run safe:commit`, without the browser.** Run under a private temp folder, on a machine under heavy load:
  - The docs pipeline, eslint and the build passed.
  - Unit tests: 2,496 of 2,497 passed. The one failure was `forceGraphOctree.test.ts`, at 5.2 s against its time limit. Run alone, it passes 6 of 6, and it touches nothing changed here.
  - The gate stops at a failed stage, so I ran integration alone. Its one failure was real: the hand-read expectation of this repository's entry points (`tests/integration/live-docs/expected/repository-entries.json`) now names the new `live-docs:visualize:link-targets` command, and it then passed.
- **The browser case through the lane.** 2 of 2 passed.

## Forks I decided

- **Where the module lives.** `tooling/`, as above.
- **The oracle.** The specification's examples, since no parser was among the dependencies.
- **How much the module reads.** It reads references too, because the audit always checked them. Only the audit uses them.
- **The path rule.** It follows a browser: the query is set apart as well as the fragment, and the audit always did this. For the rest it is `e5e28301`'s rule, decoded whole, and left as written if malformed.
- **The audit still reports a missing definition.** A full or collapsed reference whose label no definition names is reported, as before. The rule now supplies these.
- **The Explorer shows character references** as their characters (`&copy;` shows ©), and an escaped character as itself.
- **A link's address cannot carry the marker character.** U+E000, written or as a character reference, is percent-encoded in a link's address. The independent review found this regression.
- **The default link handler reads the scheme as a browser does.** It drops tabs, line breaks and leading controls before deciding.

## The review

I used one subagent of my tier: a general-purpose reviewer, given the code and not my conclusions.

Fixed from its findings:
- A doc could forge a held piece through a link's address, which could break out of an attribute or recurse until the page crashed. This was a regression of this round.
- The default handler could be made to write a `javascript:` address.
- In a CRLF document, a link at the end of a line had an end offset one too far.

Not fixed, and listed below as unfinished: the other block-level differences and the slow inputs it measured.

## Unfinished

- **Shared plumbing I touched.** I added the sample's command to `package.json` and its entry to `scripts/e2e-bundles.mjs`.
- **The engine's path decoding.** `graph.ts`'s `resolveDocLink` still decodes with `document.ts`'s `decodeLinkPath(link.split("#", 2)[0])`. Replacing that with `linkPath(link).path` from the module would make the engine use the one path rule, which also sets the query apart. `decodeLinkPath` could then go. Until then, the engine and the audit differ only on a relative link that holds a raw `?`. No link in this repository holds one.
- **The reader's own copy of the path decoding.** `reader-links.ts` (`resolveDocLink` and `decodeLinkPart`, its lines 16 to 31) still keeps its own copy. The client can import the module, as `markdown.ts` now does. It is not my file and I did not change it.
- **Other readers of links that I did not bring under the rule.**
  - `scripts/slopcop/symbolReferences.ts` (the symbol audit, which uses `decodeURI` and its own patterns);
  - `scripts/doc-tools/documentationLinks.ts` (part of `verify`, also `decodeURI`);
  - `scripts/live-docs/lint.ts:262`;
  - `githubSlugger.ts:116`, which strips a heading's link syntax by a pattern.
- **The reviewer's block-level differences.**
  - A list item numbered other than 1, or an empty item, ends a paragraph here. In CommonMark it cannot interrupt one.
  - A `--` setext underline is not seen.
  - An `=` line with no paragraph above it is skipped.
  - A second list marker, or a block quote marker after a list marker, is not stripped.
  - U+0000 is not replaced by U+FFFD.
  All of these are rare, and none occurs in this repository's links.
- **The reviewer's slow inputs.** These are quadratic, and every one needs an adversarial or unusual paragraph.
  - `"[a](".repeat(n)`, a long run with no spaces, takes 34 s at 80 KB. This is a regression for the engine; its old pattern took milliseconds.
  - Unclosed `<!--`, `<?` and `<!a` constructs rescan to the end of the paragraph.
  - Many images in one paragraph.
  - Many links in one rendered paragraph.
  - Many unmatched `[` before links.
- **Line numbers in a CR-only document.** The audit reports every issue on line 1, because `markdownShared.ts`'s `computeLineStarts` counts only line feeds.
- **The coordinator's later list.** It arrived near the end of the round. Of it:
  - The audit's `decodeURI` (`%26`, `%23`, `%3F`): covered.
  - The Explorer's cut at the first `)`: covered.
  - The stray backslash on an escaped line: covered.
  - An escaped fence: it now reads as CommonMark reads it, but I have not checked that it no longer garbles what follows.
  - A name written with a longer backtick fence, and a quoted name shown in the inspected-symbol panel in its written form: not done. They need the panel to render the doc reader's names, in `detailPanel.ts`.
  - `symbolReferences.ts` and `documentationLinks.ts`: not done, as above.
  - `reader-links.ts`: not done, as above.

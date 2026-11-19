# packages/engine/src/live-docs/relatedDocs.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/relatedDocs.ts
- Generated At: 2026-11-19T20:14:11.528Z

## Authored
### Purpose
The rules for a file's related documents, both ways: the markdown files, other than Live Docs, that its doc's authored words link to (`relatedDocsOf`, what the file cites), and the markdown documents whose own links name the file or its doc (`citingDocuments`, what cites it), inside the workspace and outside the configuration's bundle exclusions. The Explorer's bundle and the history read the first, so today's Related Docs and every past commit's come from one rule; the generator reads the second to write each doc's `Cited By` section, which the bundle and the CLI then read back.

### Notes
- Written 2026-10-20 ([Turn 9](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-9)), when the history began to keep each commit's authored words, as the owner had asked on 2026-10-18: "an improvement for later to _not_ discard those", "just run the latest version of the tool over prior snapshots of the workspace" ([Turn 10](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-10)). Until then the bundle found the links itself by scanning each doc's rendered text, a reading the history could not share.
- Only authored words link to a document: over this repository the same day, all 876 links from a Live Doc to another markdown file were authored, since the generator's sections link to Live Docs alone. The graph carries each authored block verbatim, so the rule reads the graph and never the disk; whether a document stands is the caller's question, which the bundle answers by reading it and the history by looking in the commit's tree.
- Kept apart from `graph.ts`, which the browser loads, because the exclusions need `minimatch`; a link is resolved by `graph.ts`'s `resolveDocLink`, which `linkTarget` uses too. The pattern is the one the bundle always read, `[text](path.md)` with an optional fragment; on this repository the rule gives exactly the 328 file-to-document pairs the old scan did.
- The other direction, `citingDocuments` (2026-10-22, [Turn 2](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-22/2026-10-22.1.record.md#turn-2); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)): for every documented file that a markdown document's links name, by the file's own path or its doc's, the citing documents, each once, sorted. The documents are the workspace's as `discoverDocuments` finds them, read and handed over as text by the generator, so that the rule stays free of the file system like its twin; a document the bundle exclusions name neither cites nor is cited, and a document that cites nothing is in no entry, as the owner asked ("I personally wouldn't"). Both rules read links through `markdownLinkTargets`, which skips fenced and inline code and reads angle-bracket targets and titles; the forward rule still admits only `.md` targets, and on this repository it gives the same 63 documents as before. Measured that day: 323 citations of 207 files from 19 documents.
- Since 2026-11-19 a bare link target may hold parentheses that pair, as CommonMark reads one (`notes/plan%20(draft).md`), and a link is handed to `resolveDocLink` as written, which decodes its path after the first `#` is set apart; until then the whole link was decoded first, so a path whose `#` was encoded as `%23` was cut there. A citing document is named by its own path whatever it holds; the generator writes that path as the `Cited By` line's label, as it is, and its link encoded so that a markdown viewer opens it (`document.ts`). A document named `notes/plan (draft).md` had stopped generation, found by an independent review of the history that day.
- Later on 2026-11-19 `markdownLinkTargets` became CommonMark's rule itself, shared with the Explorer's renderer and the link audit ([markdownLinks.ts](../tooling/markdownLinks.ts.mdmd.md); [the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)), in place of a pattern of its own: a title in parentheses, nested parentheses, backslash escapes, references to characters and a link across a paragraph's lines are now read, and a code span or raw HTML that claims a link's characters first is respected. A target is handed on with its escapes and references resolved and its percent-encoding kept. Over this repository it reads the same 3,657 targets as before, so every file's related documents and every document's citations stand as they were. Reference links are read by the rule but not counted, a choice left open with the counts in the probe.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `markdownLinkTargets` {#symbol-markdownlinktargets}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L41)

##### `markdownLinkTargets` — Summary
The destinations of every inline link and image in a markdown text, `[text](destination)`, in order, as
CommonMark reads them: their backslash escapes and character references resolved, their percent-encoding and
fragments kept. An autolink is an absolute URL, which names no file of the workspace. A reference link,
`[text][label]` with `[label]: destination` elsewhere, is read by the rule but not counted, as before: the
Explorer's reader renders a doc section by section, so it would not open one whose definition stands in another.

#### `isMarkdownDocument` {#symbol-ismarkdowndocument}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L46)

##### `isMarkdownDocument` — Summary
True for a markdown document by its suffix, whatever its case.

#### `relatedDocsOf` {#symbol-relateddocsof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L59)
- Parameters: `location`: [`DocLocation`](./graph.ts.mdmd.md#symbol-doclocation)

##### `relatedDocsOf` — Summary
The workspace-relative paths of the documents a doc's authored words link
to, each once, sorted: what the file cites.

##### `relatedDocsOf` — Parameters
- `exclude`: Workspace-relative glob patterns of documents that are neither bundled nor linked (`bundleExclude`).
- `file`: The doc: where it stands, and its authored block.
- `location`: Where the Live Docs are, so that a link to one is told from a link to a document.

#### `DocumentText` {#symbol-documenttext}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L79)

##### `DocumentText` — Summary
A document as the generator hands it over: its workspace-relative path, with forward slashes, and its text.

#### `citingDocuments` {#symbol-citingdocuments}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L97)
- Parameters: `documents`: `Iterable`; `files`: `ReadonlySet`; `location`: [`DocLocation`](./graph.ts.mdmd.md#symbol-doclocation)

##### `citingDocuments` — Summary
The documents that cite each file: for every documented file that a
document's markdown links name, by its own path or its doc's, the citing
documents' workspace-relative paths, each once, sorted, by the file's path.
A document that cites no file is in no entry, as a document no doc cites is
in no bundle: a document is related to the code by a link, one way or the
other, or not at all.

##### `citingDocuments` — Parameters
- `documents`: The workspace's markdown documents, as discovery finds them; another kind of document has no markdown links.
- `exclude`: Workspace-relative glob patterns of documents that are neither bundled nor linked (`bundleExclude`).
- `files`: The workspace-relative paths of the documented files, the generator's file index.
- `location`: Where the Live Docs are, so that a link to a doc names its file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `minimatch` - `minimatch`
- [`graph.DocLocation`](./graph.ts.mdmd.md#symbol-doclocation)
- [`graph.linkTarget`](./graph.ts.mdmd.md#symbol-linktarget-function)
- [`graph.resolveDocLink`](./graph.ts.mdmd.md#symbol-resolvedoclink)
- [`markdownLinks.readMarkdownLinks`](../tooling/markdownLinks.ts.mdmd.md#symbol-readmarkdownlinks)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

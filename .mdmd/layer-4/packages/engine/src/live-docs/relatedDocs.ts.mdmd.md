# packages/engine/src/live-docs/relatedDocs.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/relatedDocs.ts
- Generated At: 2026-10-22T16:47:53.629Z

## Authored
### Purpose
The rules for a file's related documents, both ways: the markdown files, other than Live Docs, that its doc's authored words link to (`relatedDocsOf`, what the file cites), and the markdown documents whose own links name the file or its doc (`citingDocuments`, what cites it), inside the workspace and outside the configuration's bundle exclusions. The Explorer's bundle and the history read the first, so today's Related Docs and every past commit's come from one rule; the generator reads the second to write each doc's `Cited By` section, which the bundle and the CLI then read back.

### Notes
- Written 2026-10-20 ([Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)), when the history began to keep each commit's authored words, as the owner had asked on 2026-10-18: "an improvement for later to _not_ discard those", "just run the latest version of the tool over prior snapshots of the workspace" ([Turn 10](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-10)). Until then the bundle found the links itself by scanning each doc's rendered text, a reading the history could not share.
- Only authored words link to a document: over this repository the same day, all 876 links from a Live Doc to another markdown file were authored, since the generator's sections link to Live Docs alone. The graph carries each authored block verbatim, so the rule reads the graph and never the disk; whether a document stands is the caller's question, which the bundle answers by reading it and the history by looking in the commit's tree.
- Kept apart from `graph.ts`, which the browser loads, because the exclusions need `minimatch`; a link is resolved by `graph.ts`'s `resolveDocLink`, which `linkTarget` uses too. The pattern is the one the bundle always read, `[text](path.md)` with an optional fragment; on this repository the rule gives exactly the 328 file-to-document pairs the old scan did.
- The other direction, `citingDocuments` (2026-10-22, [Turn 2](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-22.1.record.md#turn-2); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)): for every documented file that a markdown document's links name, by the file's own path or its doc's, the citing documents, each once, sorted. The documents are the workspace's as `discoverDocuments` finds them, read and handed over as text by the generator, so that the rule stays free of the file system like its twin; a document the bundle exclusions name neither cites nor is cited, and a document that cites nothing is in no entry, as the owner asked ("I personally wouldn't"). Both rules read links through `markdownLinkTargets`, which skips fenced and inline code and reads angle-bracket targets and titles; the forward rule still admits only `.md` targets, and on this repository it gives the same 63 documents as before. Measured that day: 323 citations of 207 files from 19 documents.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `markdownLinkTargets` {#symbol-markdownlinktargets}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L45)

##### `markdownLinkTargets` — Summary
The targets of every markdown link in a text, as written, in order, with
their fragments; a link inside fenced or inline code is not one.

#### `isMarkdownDocument` {#symbol-ismarkdowndocument}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L68)

##### `isMarkdownDocument` — Summary
True for a markdown document by its suffix, whatever its case.

#### `relatedDocsOf` {#symbol-relateddocsof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L81)
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
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L101)

##### `DocumentText` — Summary
A document as the generator hands it over: its workspace-relative path, with forward slashes, and its text.

#### `citingDocuments` {#symbol-citingdocuments}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L119)
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
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

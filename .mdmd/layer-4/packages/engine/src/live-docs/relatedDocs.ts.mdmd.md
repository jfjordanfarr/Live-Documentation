# packages/engine/src/live-docs/relatedDocs.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/relatedDocs.ts
- Generated At: 2026-10-20T21:28:53.637Z

## Authored
### Purpose
The rule for a Live Doc's related documents: the markdown files, other than Live Docs, that its authored words link to, inside the workspace and outside the configuration's bundle exclusions. The Explorer's bundle and the history both read it, so today's Related Docs and every past commit's come from one rule.

### Notes
- Written 2026-10-20 ([Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)), when the history began to keep each commit's authored words, as the owner had asked on 2026-10-18: "an improvement for later to _not_ discard those", "just run the latest version of the tool over prior snapshots of the workspace" ([Turn 10](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-10)). Until then the bundle found the links itself by scanning each doc's rendered text, a reading the history could not share.
- Only authored words link to a document: over this repository the same day, all 876 links from a Live Doc to another markdown file were authored, since the generator's sections link to Live Docs alone. The graph carries each authored block verbatim, so the rule reads the graph and never the disk; whether a document stands is the caller's question, which the bundle answers by reading it and the history by looking in the commit's tree.
- Kept apart from `graph.ts`, which the browser loads, because the exclusions need `minimatch`; a link is resolved by `graph.ts`'s `resolveDocLink`, which `linkTarget` uses too. The pattern is the one the bundle always read, `[text](path.md)` with an optional fragment; on this repository the rule gives exactly the 328 file-to-document pairs the old scan did.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `relatedDocsOf` {#symbol-relateddocsof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/relatedDocs.ts#L35)
- Parameters: `location`: [`DocLocation`](./graph.ts.mdmd.md#symbol-doclocation)

##### `relatedDocsOf` — Summary
The workspace-relative paths of the documents a doc's authored words link
to, each once, sorted.

##### `relatedDocsOf` — Parameters
- `exclude`: Workspace-relative glob patterns of documents that are neither bundled nor linked (`bundleExclude`).
- `file`: The doc: where it stands, and its authored block.
- `location`: Where the Live Docs are, so that a link to one is told from a link to a document.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `minimatch` - `minimatch`
- [`graph.DocLocation`](./graph.ts.mdmd.md#symbol-doclocation)
- [`graph.linkTarget`](./graph.ts.mdmd.md#symbol-linktarget-function)
- [`graph.resolveDocLink`](./graph.ts.mdmd.md#symbol-resolvedoclink)
<!-- LIVE-DOC:END Dependencies -->

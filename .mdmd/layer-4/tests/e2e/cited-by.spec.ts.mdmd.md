# tests/e2e/cited-by.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/cited-by.spec.ts
- Generated At: 2026-10-22T17:22:35.599Z

## Authored
### Purpose
Holds the Explorer's two readings of a file's citing documents, the `Cited By` section the generator writes since 2026-10-22: the 3D Local Map draws them under their own filter, from the document to the file and apart from the documents the file's own words cite, and the reader lists them under the file and opens one. Each expectation is computed again from `explorer-data.json`, so a picture or a panel that showed other documents would fail.

### Notes
- Written 2026-10-22 with the reverse direction of the related documents ([Turn 2 of the October 22 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-22.1.record.md#turn-2); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)), after the pictures of the day were looked at ([the screenshots](../../../../AI-Agent-Workspace/Screenshots/2026-10-22/README.md)).
- The 3D reading opens the page by a share link whose filters show the citing documents alone, reads the spheres and lines the renderer drew through `force-graph-observation.ts`, expects exactly the documents that cite a shown file (assets are hidden by default, so a document citing only an asset is not drawn), every `cited-by` line to start at a document and end at a file, no `related-doc` line, and the filter to ride the address and empty the picture when unchecked.
- The reader reading finds, in the bundle, a file one of whose citing documents the bundle carries, opens its evidence by the address, and looks for the link inside the Cited By section itself, since the file's authored words may link to the same document; the click must open the document in the reader.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
<!-- LIVE-DOC:END Dependencies -->

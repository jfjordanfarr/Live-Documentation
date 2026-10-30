# packages/explorer/src/shared/graph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/graph.ts
- Generated At: 2026-10-30T16:26:09.582Z

## Authored
### Purpose
Projects the graph index into the `ExplorerGraphPayload` the Explorer views render: nodes with dependency references and type references, links, and statistics. One pure function, which the client runs on the bundle it loads.

### Notes
- Created 2025-11-22 as `server/graph.ts`, moved to `shared/` on 2026-03-09, and rewritten on 2026-09-28 to read the graph index instead of building a graph of its own.
- The stat `dependenciesOutsideScan` counts the dependency lines whose edge has no target inside the scan, packages, builtins and files the scan does not hold. It was `referencesOutsideScan` from 2026-10-14, when the footer stopped calling them "missing dependencies", which told a reader something was broken ([Turn 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)), and was renamed on 2026-10-30 for what it counts: dependency lines, not references.
- The stat `references` (2026-10-30, the owner's decision of [Turn 3](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)) is the documented references between two files of the scan, `documentedReferences` over the links: each link's `referenceCount`, one when it has none. It is the one number the sidebar and Knowledge Sources print. `links` is smaller wherever a signature names one type in several places, one link carrying several references: 4,622 links and 4,651 references on this repository that day. The history's moments count through the same function.
- It keeps the shape the views were written against, quirks included: a type reference to a symbol of the same file, or to a doc the graph lacks, is reported unresolved; a bare type name keeps its `[]` suffix; type references become `type-reference` links after every dependency link. Those go when the views read the graph directly (vision step 3).

Signature facts remain available as dependency metadata but are emitted as links only once, under their type/inheritance kind. Repeated documented references sharing one visible endpoint/kind pair retain a referenceCount, and resolved target anchors retain canonical symbol identity. This corrects the display duplication that otherwise inflated spatial coupling; the graph index itself is not altered. This supports [the shared-preset design](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `explorerGraphOf` {#symbol-explorergraphof}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/shared/graph.ts#L43)
- Returns: [`ExplorerGraphPayload`](./types.ts.mdmd.md#symbol-explorergraphpayload)
- Parameters: `graph`: [`LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `explorerGraphOf` — Summary
Projects the graph into the Explorer's node-and-link payload.

#### `documentedReferences` {#symbol-documentedreferences}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/shared/graph.ts#L166)

##### `documentedReferences` — Summary
How many documented references the links carry between two files of the
scan: each link counts its `referenceCount`, one when it has none. A link
from a signature that names the same type in three places is one link and
three references. Today's stats and a moment of the history count through
this one function, and Knowledge Sources reads today's, so that no two
places in the Explorer give the number differently (2026-10-30).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.symbolName`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.GraphEdge`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphedge) (type-only)
- [`graph.GraphFile`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`types.ExplorerDependencyReference`](./types.ts.mdmd.md#symbol-explorerdependencyreference) (type-only)
- [`types.ExplorerGraphPayload`](./types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](./types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](./types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](./types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](./types.ts.mdmd.md#symbol-explorertypereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

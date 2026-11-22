# `scripts/doc-tools/merged-live-docs.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/doc-tools/merged-live-docs.ts`
- Generated At: 2026-11-22T14:01:43.041Z

## Authored
### Purpose
Two helpers for merging a builder's branch where both sides changed one Live Doc: `resolve` takes the incoming side inside each conflict of what the generator writes and refuses a conflict in the Authored part; `audit` reads every merge since a commit and names each Live Doc whose Authored part a merge did not keep.

### Notes
- Made 2026-11-22, after root resolved a conflict in a generated doc by taking one side's whole file and lost a paragraph of Notes the other side had written, which git had merged cleanly; it was found by reading every merge of the day again ([the record of 2026-11-22](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/2026-11-22.1.record.md#work-notes-six-handbacks-between-0354-and-0420-utc-five-merged)). Either side of a conflict in the metadata or a generated region will do, because `npm run live-docs:generate` writes those again; the Authored part is the one a person must read.
- `audit` trusts a merge where both sides changed the Authored part and the result is neither side's: that was joined by hand, and no comparison judges it. It flags the merge that holds exactly one side's.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `authoredPart` {#symbol-authoredpart}
- Type: function
- Source: [source](../../../../scripts/doc-tools/merged-live-docs.ts#L36)

##### `authoredPart` — Summary
A doc's Authored part, heading and all; empty when the doc has none.

#### `resolveGeneratedConflicts` {#symbol-resolvegeneratedconflicts}
- Type: function
- Source: [source](../../../../scripts/doc-tools/merged-live-docs.ts#L45)

##### `resolveGeneratedConflicts` — Summary
A conflicted doc with the incoming side taken inside each conflict, and how many there were. Throws on a conflict
that begins in the Authored part, and on a marker left standing (a conflict within a conflict, or a damaged one).

#### `AuthoredVerdict (type)` {#symbol-authoredverdict-type}
- Type: type
- Source: [source](../../../../scripts/doc-tools/merged-live-docs.ts#L61)

##### `AuthoredVerdict (type)` — Summary
What a merge did with a doc's Authored part, from the part at the merge's base, on each side and after it.

#### `authoredVerdict (function)` {#symbol-authoredverdict-function}
- Type: function
- Source: [source](../../../../scripts/doc-tools/merged-live-docs.ts#L69)
- Returns: [`AuthoredVerdict`](#symbol-authoredverdict-type)

##### `authoredVerdict (function)` — Summary
`kept`: the merge holds, whole, the part of the one side that changed it. `ours not kept` and `theirs not kept`: one
side changed the part and the merge holds something else, the other's unchanged copy or a piece. `both changed, one
taken`: both sides changed it differently and the merge holds exactly one of them, so the other's words may be gone.
Where both changed it and the merge holds neither, it was joined by hand, which no comparison can judge: `kept`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->

# `scripts/doc-tools/merged-live-docs.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/doc-tools/merged-live-docs.test.ts`
- Generated At: 2026-11-22T13:57:47.156Z

## Authored
### Purpose
Holds the merge helpers to a doc in the mirror's shape: a conflict in the metadata or a generated region resolved to the incoming side with the Authored part untouched, a conflict in the Authored part refused with its line, and each verdict the audit can give.

### Notes
- Made with the helpers on 2026-11-22 ([the record of 2026-11-22](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/2026-11-22.1.record.md#work-notes-six-handbacks-between-0354-and-0420-utc-five-merged)). The case of a longer Authored part cut to a piece is here because a comparison that asked only "is it the other side's copy" would have passed it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`merged-live-docs.authoredPart`](./merged-live-docs.ts.mdmd.md#symbol-authoredpart)
- [`merged-live-docs.authoredVerdict`](./merged-live-docs.ts.mdmd.md#symbol-authoredverdict-function)
- [`merged-live-docs.resolveGeneratedConflicts`](./merged-live-docs.ts.mdmd.md#symbol-resolvegeneratedconflicts)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

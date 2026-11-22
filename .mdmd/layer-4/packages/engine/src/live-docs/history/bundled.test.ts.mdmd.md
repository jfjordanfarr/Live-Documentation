# `packages/engine/src/live-docs/history/bundled.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/history/bundled.test.ts`
- Generated At: 2026-11-22T07:12:52.971Z

## Authored
### Purpose
Holds `bundledSummary` to its rule: the documents `bundleExclude` names leave the links and the `Cited By` lists, an emptied list is absent, an edit of the exclusions is followed, and the summary read is never changed.

### Notes
- Written 2026-11-19 with the function. Each case was seen to fail against a function that returns the summary unchanged, but the last, which holds a property such a function shares (it guards against a function that changes what it reads).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`bundled.bundledSummary`](./bundled.ts.mdmd.md#symbol-bundledsummary)
- [`summary.CommitSummary`](./summary.ts.mdmd.md#symbol-commitsummary) (type-only)
- [`summary.HISTORY_SUMMARY_FORMAT`](./summary.ts.mdmd.md#symbol-history_summary_format)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

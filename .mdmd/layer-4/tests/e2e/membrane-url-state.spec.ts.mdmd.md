# tests/e2e/membrane-url-state.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-url-state.spec.ts
- Generated At: 2026-10-01T01:07:10.394Z

## Authored
### Purpose

E2E tests verifying that shared Membrane URLs and page refresh restore directory context, multiple symbol pins and camera placement, with connectors meeting the rendered pins.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) to regression-test the URL state fix from earlier in Dev Day 85, where `parseInitialState` only checked `?view=` and `?node=` params but missed the `?s=` compressed state.
- After drilling into a directory and reloading, asserts the Membrane Map view is restored (not Knowledge Sources) and the directory context is preserved.
- The multi-pin case opens a saved non-default pan/zoom directly, checks the applied transform and wire-to-pin proximity, then reloads. This guards the measurement-order defect found during the [October 1 comparison](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-30.2.SUMMARIZED.md#turn-43).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- `lz-string` - `compressToEncodedURIComponent`
- [`helpers.expandDirectory`](./helpers.ts.mdmd.md#symbol-expanddirectory)
- [`helpers.goToMembraneMap`](./helpers.ts.mdmd.md#symbol-gotomembranemap)
<!-- LIVE-DOC:END Dependencies -->

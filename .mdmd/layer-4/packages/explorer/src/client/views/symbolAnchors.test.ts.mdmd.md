# packages/explorer/src/client/views/symbolAnchors.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/symbolAnchors.test.ts
- Generated At: 2026-09-27T23:21:29.312Z

## Authored
### Purpose
Unit tests for the symbol anchor normalisation logic. Validates that `normalizeSymbolIdentifier` and `buildNormalizedAnchorKey` handle edge cases like type annotations, special characters, and casing.

### Notes
- Created 2025-12-03 alongside `symbolAnchors.ts`.
- Exercises decorator stripping (`(class)`, `(function)`), whitespace handling, and round-trip parsing with `tryBuildNormalizedKeyFromAnchorKey`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`symbolAnchors.buildNormalizedAnchorKey`](./symbolAnchors.ts.mdmd.md#symbol-buildnormalizedanchorkey)
- [`symbolAnchors.normalizeSymbolIdentifier`](./symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`symbolAnchors.tryBuildNormalizedKeyFromAnchorKey`](./symbolAnchors.ts.mdmd.md#symbol-trybuildnormalizedkeyfromanchorkey)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

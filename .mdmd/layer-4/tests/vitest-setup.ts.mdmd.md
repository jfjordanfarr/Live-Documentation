# `tests/vitest-setup.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/vitest-setup.ts`
- Generated At: 2026-11-24T07:54:08.484Z

## Authored
### Purpose
Vitest setup module that calls `registerNodeGrammars()` once per worker so every unit and integration test calling tree-sitter adapters or `readTree` directly has `NODE_GRAMMAR_HOST` registered without `adapters/treeSitter.ts` touching the file system itself.

### Notes
- Added on 2026-11-24 for Step 7 of [the road to one engine for a page and a command line](../../layer-3/engine-and-hosts.mdmd.md#6-the-road) and wired into `vitest.config.ts` `setupFiles`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`nodeGrammars.registerNodeGrammars`](../packages/engine/src/tooling/nodeGrammars.ts.mdmd.md#symbol-registernodegrammars)
<!-- LIVE-DOC:END Dependencies -->

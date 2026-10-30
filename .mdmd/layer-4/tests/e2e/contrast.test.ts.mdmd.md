# tests/e2e/contrast.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/contrast.test.ts
- Generated At: 2026-10-30T14:57:10.594Z

## Authored
### Purpose
Vitest over [contrast.ts](contrast.ts.mdmd.md): computed colours are read and anything else refused; the luminances and ratios hold at WCAG's known points, black on white at 21:1 and `#767676` on white at 4.54:1 while `#777` falls short; translucent backgrounds are laid over the ones beneath; and the search's former path colour, `#666` on `#1f1f22`, measures under 3:1 as the October 23 review saw.

### Notes
- Written on 2026-10-30 with the module, so that the browser spec that imports it judges with arithmetic that is itself tested.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`contrast.AA_SMALL_TEXT`](./contrast.ts.mdmd.md#symbol-aa_small_text)
- [`contrast.backdrop`](./contrast.ts.mdmd.md#symbol-backdrop)
- [`contrast.contrastRatio`](./contrast.ts.mdmd.md#symbol-contrastratio)
- [`contrast.luminance`](./contrast.ts.mdmd.md#symbol-luminance)
- [`contrast.over`](./contrast.ts.mdmd.md#symbol-over)
- [`contrast.parseColour`](./contrast.ts.mdmd.md#symbol-parsecolour)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

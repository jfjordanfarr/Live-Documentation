# tests/e2e/contrast.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/contrast.ts
- Generated At: 2026-10-30T14:57:10.608Z

## Authored
### Purpose
The contrast of text against what stands behind it, as WCAG 2 defines it, for browser specs: `parseColour` reads a colour as `getComputedStyle` writes it, `backdrop` lays an element's and its ancestors' backgrounds over one another and over the browser's white canvas, and `contrastRatio` gives the ratio of the text's colour to that backdrop from their relative luminances. A spec reads the colours in the page and judges them here; `AA_SMALL_TEXT` is the 4.5:1 that WCAG AA asks of small text.

### Notes
- Written on 2026-10-30 for the search results' paths, which the [October 23 review](../../../../AI-Agent-Workspace/Screenshots/2026-10-23/README.md) found very faint, under the remediation plan the owner accepted ([Turn 3](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)). The path report's spec, `local-map-path.spec.ts`, carries its own in-page copy of the same arithmetic from before this module existed.
- A translucent background, such as a selected row's tint, is laid over what is beneath it, so a ratio is measured against the colour a person sees. An element's `opacity` is not read: a row faded on purpose is outside what this judges.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Rgba` {#symbol-rgba}
- Type: type
- Source: [source](../../../../tests/e2e/contrast.ts#L9)

##### `Rgba` — Summary
A colour as red, green and blue from 0 to 255 and an alpha from 0 to 1.

#### `AA_SMALL_TEXT` {#symbol-aa_small_text}
- Type: const
- Source: [source](../../../../tests/e2e/contrast.ts#L12)

##### `AA_SMALL_TEXT` — Summary
The smallest ratio WCAG AA accepts for text under 18 px, or under 14 px bold.

#### `parseColour` {#symbol-parsecolour}
- Type: function
- Source: [source](../../../../tests/e2e/contrast.ts#L15)
- Returns: [`Rgba`](#symbol-rgba)

##### `parseColour` — Summary
A computed CSS colour, `rgb(…)` or `rgba(…)` with numbers as `getComputedStyle` writes them.

#### `over` {#symbol-over}
- Type: function
- Source: [source](../../../../tests/e2e/contrast.ts#L22)
- Returns: [`Rgba`](#symbol-rgba)
- Parameters: `top`: [`Rgba`](#symbol-rgba); `below`: [`Rgba`](#symbol-rgba)

##### `over` — Summary
One colour laid over an opaque one by its alpha.

#### `backdrop` {#symbol-backdrop}
- Type: function
- Source: [source](../../../../tests/e2e/contrast.ts#L31)
- Returns: [`Rgba`](#symbol-rgba)

##### `backdrop` — Summary
The opaque colour behind an element: its ancestors' backgrounds and its own, outermost first, laid over the
browser's white canvas.

#### `luminance` {#symbol-luminance}
- Type: function
- Source: [source](../../../../tests/e2e/contrast.ts#L36)
- Parameters: `colour`: [`Rgba`](#symbol-rgba)

##### `luminance` — Summary
WCAG 2's relative luminance of an opaque colour.

#### `contrastRatio` {#symbol-contrastratio}
- Type: function
- Source: [source](../../../../tests/e2e/contrast.ts#L45)
- Parameters: `text`: [`Rgba`](#symbol-rgba); `behind`: [`Rgba`](#symbol-rgba)

##### `contrastRatio` — Summary
The contrast ratio of a text colour, laid over its opaque backdrop when translucent, against that backdrop: 1 to 21.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

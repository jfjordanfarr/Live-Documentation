# packages/engine/src/tooling/htmlEntities.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/tooling/htmlEntities.ts
- Generated At: 2026-11-19T20:14:11.639Z

## Authored
### Purpose
HTML's 2,125 named character references, which CommonMark reads in a link's destination, its title and its text (`&auml;` is `ä`), for the markdown link rule ([markdownLinks.ts](markdownLinks.ts.mdmd.md)).

### Notes
- Added 2026-11-19 with that rule ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)). The list is the WHATWG HTML standard's, taken from the MIT `html-entities` package already among the development dependencies, which carries it; the module must stay free of dependencies, since the Explorer's page loads it. Only the names with their semicolon are kept, as CommonMark reads only those. A name and its code points in hexadecimal per entry keep the table to about 26 KB of source, read into a map the first time a reference is met.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `namedCharacterReference` {#symbol-namedcharacterreference}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/htmlEntities.ts#L270)

##### `namedCharacterReference` — Summary
The text a named character reference stands for, without its `&` and `;`, or undefined when HTML names none.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

# slopcop.config.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: slopcop.config.json
- Entry: tooling
- Generated At: 2026-10-16T00:58:46.237Z

## Authored
### Purpose
What the three SlopCop audits check and leave alone: the markdown link audit, the asset path audit and the symbol audit, each with its include and ignore globs and the targets it must not flag.

### Notes
- The audits run in `safe:commit` and CI. The markdown audit reads every markdown file in the repository, the chat archive included, and ignores only the scratch folder; the asset audit reads HTML and CSS and knows the Explorer's hashed bundle names and its `static/` root; the symbol audit checks the symbol anchors the Live Docs link to. Each ignore names a fixture that deliberately carries broken links, so that the audit's own tests have something to find.
- Began on 2025-10-25 when SlopCop was added to the commit chain; last changed on 2026-09-28 when the audit library moved beside its scripts. Gained a Live Doc on 2026-10-16 ([Turn 9 of the October 15 session](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ignoreGlobs` {#symbol-ignoreglobs}
- Type: key

#### `markdown` {#symbol-markdown}
- Type: key

#### `markdown:includeGlobs` {#symbol-markdownincludeglobs}
- Type: key

#### `markdown:ignoreGlobs` {#symbol-markdownignoreglobs}
- Type: key

#### `markdown:ignoreTargets` {#symbol-markdownignoretargets}
- Type: key

#### `assets` {#symbol-assets}
- Type: key

#### `assets:includeGlobs` {#symbol-assetsincludeglobs}
- Type: key

#### `assets:ignoreGlobs` {#symbol-assetsignoreglobs}
- Type: key

#### `assets:ignoreTargets` {#symbol-assetsignoretargets}
- Type: key

#### `assets:rootDirectories` {#symbol-assetsrootdirectories}
- Type: key

#### `symbols` {#symbol-symbols}
- Type: key

#### `symbols:enabled` {#symbol-symbolsenabled}
- Type: key

#### `symbols:includeGlobs` {#symbol-symbolsincludeglobs}
- Type: key

#### `symbols:ignoreGlobs` {#symbol-symbolsignoreglobs}
- Type: key

#### `symbols:ignoreTargets` {#symbol-symbolsignoretargets}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

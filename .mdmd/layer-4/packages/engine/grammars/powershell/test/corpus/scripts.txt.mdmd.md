# packages/engine/grammars/powershell/test/corpus/scripts.txt

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/grammars/powershell/test/corpus/scripts.txt
- Generated At: 2026-10-22T00:39:37.210Z

## Authored
### Purpose
Corpus tests, in tree-sitter's format, for the patch's changes to what a whole script may be: empty, only comments or only a param block, and one whose expandable string begins with `<#`.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Each test is a title between `===` lines, PowerShell source, a `---` line, and the tree of named nodes the grammar must produce. Run only by [`build.sh`](../../build.sh.mdmd.md), which copies this file beside upstream's corpus and runs `tree-sitter test` before building the wasm; no npm suite or CI job runs it.
- Four tests of [`grammar.patch`](../../grammar.patch.mdmd.md): an empty script is an empty `program`, and a script of comments only or of a `param()` only parses with no `statement_list`, where upstream's `program` required one; and `$marker = "<#PSScriptInfo"` reads as a string, with the block comment and the function after it still read, where upstream took the string's `<#` for the opening of a comment and swallowed what followed.
- The string case came from measuring the grammar over the 56 PowerShell files on the development machine on 2026-10-16, where it was one of two constructs after which upstream's reading swallowed the rest of the file.
- Began with the grammar on 2026-10-16 (`dc60acba`), written with the patch so that each rule is proved and the two can be offered upstream together ([the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16); [Turn 4 of the October 16 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4)). Gained a Live Doc on 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)): [Turn 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5) had first judged the corpus files outside "within reason", and [Turn 6](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-6) brought them in, since `build.sh` runs them and each proves a change the patch makes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

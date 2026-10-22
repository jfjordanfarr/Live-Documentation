# packages/engine/grammars/powershell/upstream.env

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/grammars/powershell/upstream.env
- Generated At: 2026-10-22T00:39:37.248Z

## Authored
### Purpose
Pins the upstream source the engine's PowerShell grammar is built from: Airbus CERT's `tree-sitter-powershell` repository and the exact commit that `grammar.patch` was written against.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Two shell variables, `UPSTREAM_REPOSITORY` and `UPSTREAM_COMMIT`, read only by [`build.sh`](./build.sh.mdmd.md), which sources the file and fetches that one commit at depth one: a commit rather than a branch or tag, so that the build cannot drift with upstream.
- The pin, `e7bd348c`, lies past upstream's v0.26.5. The file's own comment says what moving it means: rebuilding, running the tests and committing the new wasm with the new pin. [`grammar.patch`](./grammar.patch.mdmd.md) must still apply to the new commit, or empty where upstream has taken it.
- Despite its extension it holds nothing secret, only a public URL and a commit hash. When the files never to document were worked out on 2026-10-21, this file was the example of why a rule by a secret-looking name would misfire ([Turn 6 of the October 21 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-6)).
- Began with the grammar on 2026-10-16 (`dc60acba`); why the engine builds its own PowerShell grammar is in [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16) and [Turn 4 of the October 16 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4). Gained a Live Doc on 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

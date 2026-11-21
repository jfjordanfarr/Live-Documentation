# `tests/page-scan/stand-ins/web-tree-sitter.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/stand-ins/web-tree-sitter.mjs`
- Generated At: 2026-11-21T03:40:56.727Z

## Authored
### Purpose
Stands beside `web-tree-sitter` in the page: the real runtime, with the runtime's own `.wasm` and each grammar loaded from bytes the page holds at the path the engine names, since a page loads no file by path.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- `locateFile` keeps emscripten from building a URL from `import.meta.url`, which a classic script lacks (found by the probe of November 19). A grammar the page does not hold fails the load with a sentence naming the list to add it to.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `real-web-tree-sitter`
- [`calls.counted`](./calls.mjs.mdmd.md#symbol-counted)
- [`engine-root.ENGINE_ROOT`](./engine-root.mjs.mdmd.md#symbol-engine_root)
- [`fs.tree`](./fs.mjs.mdmd.md#symbol-tree)
<!-- LIVE-DOC:END Dependencies -->

# `tests/page-scan/node-needs.json`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/node-needs.json`
- Generated At: 2026-11-24T10:31:43.720Z

## Authored
### Purpose
The committed list of what of Node the scanning page's bundle needs: by engine and generator module, the Node modules (and `glob`) imported and the members named; the members each stand-in must answer; the members of packages that exist only under Node; the globals; what packages from `node_modules` import; and the history engine's modules in the bundle (none).

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- Written by `node tests/page-scan/node-needs.mjs --write`, never by hand. `node-needs.test.ts` fails when the engine's needs differ from it, so a new dependence on Node arrives as a changed file in review.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `engine` {#symbol-engine}
- Type: key

#### `standIns` {#symbol-standins}
- Type: key

#### `hostedByNode` {#symbol-hostedbynode}
- Type: key

#### `globals` {#symbol-globals}
- Type: key

#### `packages` {#symbol-packages}
- Type: key

#### `packages:typescript` {#symbol-packagestypescript}
- Type: key

#### `packages:typescript:crypto` {#symbol-packagestypescriptcrypto}
- Type: key

#### `packages:typescript:fs` {#symbol-packagestypescriptfs}
- Type: key

#### `packages:typescript:inspector` {#symbol-packagestypescriptinspector}
- Type: key

#### `packages:typescript:os` {#symbol-packagestypescriptos}
- Type: key

#### `packages:typescript:path` {#symbol-packagestypescriptpath}
- Type: key

#### `packages:typescript:perf_hooks` {#symbol-packagestypescriptperf_hooks}
- Type: key

#### `packages:web-tree-sitter` {#symbol-packagesweb-tree-sitter}
- Type: key

#### `packages:web-tree-sitter:fs/promises` {#symbol-packagesweb-tree-sitterfspromises}
- Type: key

#### `packages:web-tree-sitter:module` {#symbol-packagesweb-tree-sittermodule}
- Type: key

#### `history` {#symbol-history}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->

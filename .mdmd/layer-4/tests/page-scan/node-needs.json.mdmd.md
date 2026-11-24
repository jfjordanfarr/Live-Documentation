# `tests/page-scan/node-needs.json`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/node-needs.json`
- Generated At: 2026-11-24T07:54:08.458Z

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

#### `engine:packages/engine/src/live-docs/adapters/aspnet.ts` {#symbol-enginepackagesenginesrclive-docsadaptersaspnetts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/aspnet.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersaspnettsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/c.ts` {#symbol-enginepackagesenginesrclive-docsadapterscts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/c.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersctsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/cargo.ts` {#symbol-enginepackagesenginesrclive-docsadapterscargots}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/cargo.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterscargotsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/csharp.ts` {#symbol-enginepackagesenginesrclive-docsadapterscsharpts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/csharp.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterscsharptsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/css.ts` {#symbol-enginepackagesenginesrclive-docsadapterscssts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/css.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterscsstsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/dotnetConfig.ts` {#symbol-enginepackagesenginesrclive-docsadaptersdotnetconfigts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/dotnetConfig.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersdotnetconfigtsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/dotnetPaths.ts` {#symbol-enginepackagesenginesrclive-docsadaptersdotnetpathsts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/dotnetPaths.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersdotnetpathstsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/dotnetProjects.ts` {#symbol-enginepackagesenginesrclive-docsadaptersdotnetprojectsts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/dotnetProjects.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersdotnetprojectstsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/go.ts` {#symbol-enginepackagesenginesrclive-docsadaptersgots}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/go.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersgotsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/gomod.ts` {#symbol-enginepackagesenginesrclive-docsadaptersgomodts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/gomod.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersgomodtsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/html.ts` {#symbol-enginepackagesenginesrclive-docsadaptershtmlts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/html.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptershtmltsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/index.ts` {#symbol-enginepackagesenginesrclive-docsadaptersindexts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/index.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersindextsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/java.ts` {#symbol-enginepackagesenginesrclive-docsadaptersjavats}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/java.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersjavatsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/json.ts` {#symbol-enginepackagesenginesrclive-docsadaptersjsonts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/json.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersjsontsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/manifest.ts` {#symbol-enginepackagesenginesrclive-docsadaptersmanifestts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/manifest.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersmanifesttsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/pom.ts` {#symbol-enginepackagesenginesrclive-docsadapterspomts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/pom.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterspomtsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/powershell.ts` {#symbol-enginepackagesenginesrclive-docsadapterspowershellts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/powershell.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterspowershelltsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/project.ts` {#symbol-enginepackagesenginesrclive-docsadaptersprojectts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/project.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersprojecttsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/pyproject.ts` {#symbol-enginepackagesenginesrclive-docsadapterspyprojectts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/pyproject.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterspyprojecttsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/python.ts` {#symbol-enginepackagesenginesrclive-docsadapterspythonts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/python.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterspythontsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/ruby.ts` {#symbol-enginepackagesenginesrclive-docsadaptersrubyts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/ruby.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersrubytsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/rust.ts` {#symbol-enginepackagesenginesrclive-docsadaptersrustts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/rust.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersrusttsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/solution.ts` {#symbol-enginepackagesenginesrclive-docsadapterssolutionts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/solution.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterssolutiontsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/sql.ts` {#symbol-enginepackagesenginesrclive-docsadapterssqlts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/sql.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterssqltsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/archetype.ts` {#symbol-enginepackagesenginesrclive-docsarchetypets}
- Type: key

#### `engine:packages/engine/src/live-docs/archetype.ts:node:path` {#symbol-enginepackagesenginesrclive-docsarchetypetsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/compose.ts` {#symbol-enginepackagesenginesrclive-docscomposets}
- Type: key

#### `engine:packages/engine/src/live-docs/compose.ts:node:path` {#symbol-enginepackagesenginesrclive-docscomposetsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/coreUtils.ts` {#symbol-enginepackagesenginesrclive-docscoreutilsts}
- Type: key

#### `engine:packages/engine/src/live-docs/coreUtils.ts:node:path` {#symbol-enginepackagesenginesrclive-docscoreutilstsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/dependencies.ts` {#symbol-enginepackagesenginesrclive-docsdependenciests}
- Type: key

#### `engine:packages/engine/src/live-docs/dependencies.ts:node:path` {#symbol-enginepackagesenginesrclive-docsdependenciestsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/discoveryCore.ts` {#symbol-enginepackagesenginesrclive-docsdiscoverycorets}
- Type: key

#### `engine:packages/engine/src/live-docs/discoveryCore.ts:node:path` {#symbol-enginepackagesenginesrclive-docsdiscoverycoretsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/graphFiles.ts` {#symbol-enginepackagesenginesrclive-docsgraphfilests}
- Type: key

#### `engine:packages/engine/src/live-docs/graphFiles.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsgraphfilestsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/graphFiles.ts:node:path` {#symbol-enginepackagesenginesrclive-docsgraphfilestsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/heuristics/dom.ts` {#symbol-enginepackagesenginesrclive-docsheuristicsdomts}
- Type: key

#### `engine:packages/engine/src/live-docs/heuristics/dom.ts:node:path` {#symbol-enginepackagesenginesrclive-docsheuristicsdomtsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/sourceAnalysis.ts` {#symbol-enginepackagesenginesrclive-docssourceanalysists}
- Type: key

#### `engine:packages/engine/src/live-docs/sourceAnalysis.ts:node:path` {#symbol-enginepackagesenginesrclive-docssourceanalysistsnodepath}
- Type: key

#### `engine:packages/engine/src/tooling/nodeHost.ts` {#symbol-enginepackagesenginesrctoolingnodehostts}
- Type: key

#### `engine:packages/engine/src/tooling/nodeHost.ts:node:fs` {#symbol-enginepackagesenginesrctoolingnodehosttsnodefs}
- Type: key

#### `engine:packages/engine/src/tooling/nodeHost.ts:node:path` {#symbol-enginepackagesenginesrctoolingnodehosttsnodepath}
- Type: key

#### `engine:packages/engine/src/tooling/pathUtils.ts` {#symbol-enginepackagesenginesrctoolingpathutilsts}
- Type: key

#### `engine:packages/engine/src/tooling/pathUtils.ts:node:path` {#symbol-enginepackagesenginesrctoolingpathutilstsnodepath}
- Type: key

#### `engine:packages/engine/src/tooling/workspaceListing.ts` {#symbol-enginepackagesenginesrctoolingworkspacelistingts}
- Type: key

#### `engine:packages/engine/src/tooling/workspaceListing.ts:node:path` {#symbol-enginepackagesenginesrctoolingworkspacelistingtsnodepath}
- Type: key

#### `engine:packages/engine/src/tooling/workspaceWalk.ts` {#symbol-enginepackagesenginesrctoolingworkspacewalkts}
- Type: key

#### `engine:packages/engine/src/tooling/workspaceWalk.ts:node:path` {#symbol-enginepackagesenginesrctoolingworkspacewalktsnodepath}
- Type: key

#### `engine:packages/generator/src/generatorCore.ts` {#symbol-enginepackagesgeneratorsrcgeneratorcorets}
- Type: key

#### `engine:packages/generator/src/generatorCore.ts:node:fs/promises` {#symbol-enginepackagesgeneratorsrcgeneratorcoretsnodefspromises}
- Type: key

#### `engine:packages/generator/src/generatorCore.ts:node:path` {#symbol-enginepackagesgeneratorsrcgeneratorcoretsnodepath}
- Type: key

#### `standIns` {#symbol-standins}
- Type: key

#### `standIns:node:fs` {#symbol-standinsnodefs}
- Type: key

#### `standIns:node:fs/promises` {#symbol-standinsnodefspromises}
- Type: key

#### `standIns:node:path` {#symbol-standinsnodepath}
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

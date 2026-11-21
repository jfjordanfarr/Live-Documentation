# `tests/page-scan/node-needs.json`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/node-needs.json`
- Generated At: 2026-11-21T04:17:33.557Z

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

#### `engine:packages/engine/src/live-docs/adapters/c.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadaptersctsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/c.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersctsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/cargo.ts` {#symbol-enginepackagesenginesrclive-docsadapterscargots}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/cargo.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterscargotsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/csharp.ts` {#symbol-enginepackagesenginesrclive-docsadapterscsharpts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/csharp.ts:glob` {#symbol-enginepackagesenginesrclive-docsadapterscsharptsglob}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/csharp.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadapterscsharptsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/csharp.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterscsharptsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/css.ts` {#symbol-enginepackagesenginesrclive-docsadapterscssts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/css.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadapterscsstsnodefs}
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

#### `engine:packages/engine/src/live-docs/adapters/go.ts:glob` {#symbol-enginepackagesenginesrclive-docsadaptersgotsglob}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/go.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadaptersgotsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/go.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersgotsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/gomod.ts` {#symbol-enginepackagesenginesrclive-docsadaptersgomodts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/gomod.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersgomodtsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/html.ts` {#symbol-enginepackagesenginesrclive-docsadaptershtmlts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/html.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadaptershtmltsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/html.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptershtmltsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/index.ts` {#symbol-enginepackagesenginesrclive-docsadaptersindexts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/index.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersindextsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/java.ts` {#symbol-enginepackagesenginesrclive-docsadaptersjavats}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/java.ts:glob` {#symbol-enginepackagesenginesrclive-docsadaptersjavatsglob}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/java.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadaptersjavatsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/java.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersjavatsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/json.ts` {#symbol-enginepackagesenginesrclive-docsadaptersjsonts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/json.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadaptersjsontsnodefs}
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

#### `engine:packages/engine/src/live-docs/adapters/python.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadapterspythontsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/python.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterspythontsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/ruby.ts` {#symbol-enginepackagesenginesrclive-docsadaptersrubyts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/ruby.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadaptersrubytsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/ruby.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadaptersrubytsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/rust.ts` {#symbol-enginepackagesenginesrclive-docsadaptersrustts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/rust.ts:glob` {#symbol-enginepackagesenginesrclive-docsadaptersrusttsglob}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/rust.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadaptersrusttsnodefs}
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

#### `engine:packages/engine/src/live-docs/adapters/treeSitter.ts` {#symbol-enginepackagesenginesrclive-docsadapterstreesitterts}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/treeSitter.ts:(global)` {#symbol-enginepackagesenginesrclive-docsadapterstreesittertsglobal}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/treeSitter.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsadapterstreesittertsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/adapters/treeSitter.ts:node:path` {#symbol-enginepackagesenginesrclive-docsadapterstreesittertsnodepath}
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

#### `engine:packages/engine/src/live-docs/dependencies.ts:node:fs/promises` {#symbol-enginepackagesenginesrclive-docsdependenciestsnodefspromises}
- Type: key

#### `engine:packages/engine/src/live-docs/dependencies.ts:node:path` {#symbol-enginepackagesenginesrclive-docsdependenciestsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/discovery.ts` {#symbol-enginepackagesenginesrclive-docsdiscoveryts}
- Type: key

#### `engine:packages/engine/src/live-docs/discovery.ts:glob` {#symbol-enginepackagesenginesrclive-docsdiscoverytsglob}
- Type: key

#### `engine:packages/engine/src/live-docs/discovery.ts:node:fs/promises` {#symbol-enginepackagesenginesrclive-docsdiscoverytsnodefspromises}
- Type: key

#### `engine:packages/engine/src/live-docs/discovery.ts:node:path` {#symbol-enginepackagesenginesrclive-docsdiscoverytsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/gitUtils.ts` {#symbol-enginepackagesenginesrclive-docsgitutilsts}
- Type: key

#### `engine:packages/engine/src/live-docs/gitUtils.ts:(global)` {#symbol-enginepackagesenginesrclive-docsgitutilstsglobal}
- Type: key

#### `engine:packages/engine/src/live-docs/gitUtils.ts:node:child_process` {#symbol-enginepackagesenginesrclive-docsgitutilstsnodechild_process}
- Type: key

#### `engine:packages/engine/src/live-docs/graphFiles.ts` {#symbol-enginepackagesenginesrclive-docsgraphfilests}
- Type: key

#### `engine:packages/engine/src/live-docs/graphFiles.ts:glob` {#symbol-enginepackagesenginesrclive-docsgraphfilestsglob}
- Type: key

#### `engine:packages/engine/src/live-docs/graphFiles.ts:node:fs` {#symbol-enginepackagesenginesrclive-docsgraphfilestsnodefs}
- Type: key

#### `engine:packages/engine/src/live-docs/graphFiles.ts:node:path` {#symbol-enginepackagesenginesrclive-docsgraphfilestsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/heuristics/dom.ts` {#symbol-enginepackagesenginesrclive-docsheuristicsdomts}
- Type: key

#### `engine:packages/engine/src/live-docs/heuristics/dom.ts:node:fs/promises` {#symbol-enginepackagesenginesrclive-docsheuristicsdomtsnodefspromises}
- Type: key

#### `engine:packages/engine/src/live-docs/heuristics/dom.ts:node:path` {#symbol-enginepackagesenginesrclive-docsheuristicsdomtsnodepath}
- Type: key

#### `engine:packages/engine/src/live-docs/sourceAnalysis.ts` {#symbol-enginepackagesenginesrclive-docssourceanalysists}
- Type: key

#### `engine:packages/engine/src/live-docs/sourceAnalysis.ts:node:path` {#symbol-enginepackagesenginesrclive-docssourceanalysistsnodepath}
- Type: key

#### `engine:packages/engine/src/tooling/gitIgnored.ts` {#symbol-enginepackagesenginesrctoolinggitignoredts}
- Type: key

#### `engine:packages/engine/src/tooling/gitIgnored.ts:node:child_process` {#symbol-enginepackagesenginesrctoolinggitignoredtsnodechild_process}
- Type: key

#### `engine:packages/engine/src/tooling/gitIgnored.ts:node:fs` {#symbol-enginepackagesenginesrctoolinggitignoredtsnodefs}
- Type: key

#### `engine:packages/engine/src/tooling/gitIgnored.ts:node:path` {#symbol-enginepackagesenginesrctoolinggitignoredtsnodepath}
- Type: key

#### `engine:packages/engine/src/tooling/gitIgnored.ts:node:process` {#symbol-enginepackagesenginesrctoolinggitignoredtsnodeprocess}
- Type: key

#### `engine:packages/engine/src/tooling/pathUtils.ts` {#symbol-enginepackagesenginesrctoolingpathutilsts}
- Type: key

#### `engine:packages/engine/src/tooling/pathUtils.ts:node:path` {#symbol-enginepackagesenginesrctoolingpathutilstsnodepath}
- Type: key

#### `engine:packages/engine/src/tooling/pathUtils.ts:node:url` {#symbol-enginepackagesenginesrctoolingpathutilstsnodeurl}
- Type: key

#### `engine:packages/engine/src/tooling/sourceText.ts` {#symbol-enginepackagesenginesrctoolingsourcetextts}
- Type: key

#### `engine:packages/engine/src/tooling/sourceText.ts:node:fs` {#symbol-enginepackagesenginesrctoolingsourcetexttsnodefs}
- Type: key

#### `engine:packages/generator/src/generator.ts` {#symbol-enginepackagesgeneratorsrcgeneratorts}
- Type: key

#### `engine:packages/generator/src/generator.ts:glob` {#symbol-enginepackagesgeneratorsrcgeneratortsglob}
- Type: key

#### `engine:packages/generator/src/generator.ts:node:fs/promises` {#symbol-enginepackagesgeneratorsrcgeneratortsnodefspromises}
- Type: key

#### `engine:packages/generator/src/generator.ts:node:path` {#symbol-enginepackagesgeneratorsrcgeneratortsnodepath}
- Type: key

#### `standIns` {#symbol-standins}
- Type: key

#### `standIns:(global)` {#symbol-standinsglobal}
- Type: key

#### `standIns:glob` {#symbol-standinsglob}
- Type: key

#### `standIns:node:child_process` {#symbol-standinsnodechild_process}
- Type: key

#### `standIns:node:fs` {#symbol-standinsnodefs}
- Type: key

#### `standIns:node:fs/promises` {#symbol-standinsnodefspromises}
- Type: key

#### `standIns:node:path` {#symbol-standinsnodepath}
- Type: key

#### `standIns:node:process` {#symbol-standinsnodeprocess}
- Type: key

#### `standIns:node:url` {#symbol-standinsnodeurl}
- Type: key

#### `hostedByNode` {#symbol-hostedbynode}
- Type: key

#### `globals` {#symbol-globals}
- Type: key

#### `globals:__dirname` {#symbol-globals__dirname}
- Type: key

#### `globals:process` {#symbol-globalsprocess}
- Type: key

#### `globals:require` {#symbol-globalsrequire}
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

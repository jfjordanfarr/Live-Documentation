# tests/integration/programs/powershell/rollout/expected/powershell-ast.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/expected/powershell-ast.json
- Generated At: 2026-10-16T22:20:46.099Z

## Authored
### Purpose
Everything PowerShell's own parser says about each file of the rollout program, written by `npm run oracle:index`: the ground truth `powershell-oracle.test.ts` holds the adapter to.

### Notes
- Never hand-edited; regenerate with `oracle:index` after changing the program (2026-10-16). Paths are relative to this file; the shape is described in [Sample Programs](../../../../../../../../.mdmd/layer-3/sample-programs.mdmd.md#expected-edges).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `tool` {#symbol-tool}
- Type: key

#### `files` {#symbol-files}
- Type: key

#### `files:../config/targets.psd1` {#symbol-filesconfigtargetspsd1}
- Type: key

#### `files:../config/targets.psd1:parseErrors` {#symbol-filesconfigtargetspsd1parseerrors}
- Type: key

#### `files:../config/targets.psd1:data` {#symbol-filesconfigtargetspsd1data}
- Type: key

#### `files:../config/targets.psd1:data:production` {#symbol-filesconfigtargetspsd1dataproduction}
- Type: key

#### `files:../config/targets.psd1:data:staging` {#symbol-filesconfigtargetspsd1datastaging}
- Type: key

#### `files:../config/targets.psd1:references` {#symbol-filesconfigtargetspsd1references}
- Type: key

#### `files:../Invoke-Rollout.ps1` {#symbol-filesinvoke-rolloutps1}
- Type: key

#### `files:../Invoke-Rollout.ps1:parseErrors` {#symbol-filesinvoke-rolloutps1parseerrors}
- Type: key

#### `files:../Invoke-Rollout.ps1:functions` {#symbol-filesinvoke-rolloutps1functions}
- Type: key

#### `files:../Invoke-Rollout.ps1:published` {#symbol-filesinvoke-rolloutps1published}
- Type: key

#### `files:../Invoke-Rollout.ps1:types` {#symbol-filesinvoke-rolloutps1types}
- Type: key

#### `files:../Invoke-Rollout.ps1:exportModuleMembers` {#symbol-filesinvoke-rolloutps1exportmodulemembers}
- Type: key

#### `files:../Invoke-Rollout.ps1:dotSources` {#symbol-filesinvoke-rolloutps1dotsources}
- Type: key

#### `files:../Invoke-Rollout.ps1:importModules` {#symbol-filesinvoke-rolloutps1importmodules}
- Type: key

#### `files:../Invoke-Rollout.ps1:usingStatements` {#symbol-filesinvoke-rolloutps1usingstatements}
- Type: key

#### `files:../Invoke-Rollout.ps1:requiredModules` {#symbol-filesinvoke-rolloutps1requiredmodules}
- Type: key

#### `files:../lib/Logging.ps1` {#symbol-fileslibloggingps1}
- Type: key

#### `files:../lib/Logging.ps1:parseErrors` {#symbol-fileslibloggingps1parseerrors}
- Type: key

#### `files:../lib/Logging.ps1:functions` {#symbol-fileslibloggingps1functions}
- Type: key

#### `files:../lib/Logging.ps1:published` {#symbol-fileslibloggingps1published}
- Type: key

#### `files:../lib/Logging.ps1:types` {#symbol-fileslibloggingps1types}
- Type: key

#### `files:../lib/Logging.ps1:exportModuleMembers` {#symbol-fileslibloggingps1exportmodulemembers}
- Type: key

#### `files:../lib/Logging.ps1:dotSources` {#symbol-fileslibloggingps1dotsources}
- Type: key

#### `files:../lib/Logging.ps1:importModules` {#symbol-fileslibloggingps1importmodules}
- Type: key

#### `files:../lib/Logging.ps1:usingStatements` {#symbol-fileslibloggingps1usingstatements}
- Type: key

#### `files:../lib/Logging.ps1:requiredModules` {#symbol-fileslibloggingps1requiredmodules}
- Type: key

#### `files:../lib/Settings.ps1` {#symbol-fileslibsettingsps1}
- Type: key

#### `files:../lib/Settings.ps1:parseErrors` {#symbol-fileslibsettingsps1parseerrors}
- Type: key

#### `files:../lib/Settings.ps1:functions` {#symbol-fileslibsettingsps1functions}
- Type: key

#### `files:../lib/Settings.ps1:published` {#symbol-fileslibsettingsps1published}
- Type: key

#### `files:../lib/Settings.ps1:types` {#symbol-fileslibsettingsps1types}
- Type: key

#### `files:../lib/Settings.ps1:exportModuleMembers` {#symbol-fileslibsettingsps1exportmodulemembers}
- Type: key

#### `files:../lib/Settings.ps1:dotSources` {#symbol-fileslibsettingsps1dotsources}
- Type: key

#### `files:../lib/Settings.ps1:importModules` {#symbol-fileslibsettingsps1importmodules}
- Type: key

#### `files:../lib/Settings.ps1:usingStatements` {#symbol-fileslibsettingsps1usingstatements}
- Type: key

#### `files:../lib/Settings.ps1:requiredModules` {#symbol-fileslibsettingsps1requiredmodules}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1:parseErrors` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1parseerrors}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1:functions` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1functions}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1:published` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1published}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1:types` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1types}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1:exportModuleMembers` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1exportmodulemembers}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1:dotSources` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1dotsources}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1:importModules` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1importmodules}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1:usingStatements` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1usingstatements}
- Type: key

#### `files:../modules/Rollout.Notify/Rollout.Notify.psm1:requiredModules` {#symbol-filesmodulesrolloutnotifyrolloutnotifypsm1requiredmodules}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:parseErrors` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1parseerrors}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1data}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:AliasesToExport` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1dataaliasestoexport}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:Author` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1dataauthor}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:CmdletsToExport` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1datacmdletstoexport}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:Description` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1datadescription}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:FunctionsToExport` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1datafunctionstoexport}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:GUID` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1dataguid}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:ModuleVersion` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1datamoduleversion}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:PowerShellVersion` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1datapowershellversion}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:RequiredModules` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1datarequiredmodules}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:RootModule` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1datarootmodule}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:data:VariablesToExport` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1datavariablestoexport}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psd1:references` {#symbol-filesmodulesrolloutstepsrolloutstepspsd1references}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1:parseErrors` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1parseerrors}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1:functions` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1functions}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1:published` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1published}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1:types` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1types}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1:exportModuleMembers` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1exportmodulemembers}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1:dotSources` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1dotsources}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1:importModules` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1importmodules}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1:usingStatements` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1usingstatements}
- Type: key

#### `files:../modules/Rollout.Steps/Rollout.Steps.psm1:requiredModules` {#symbol-filesmodulesrolloutstepsrolloutstepspsm1requiredmodules}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1:parseErrors` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1parseerrors}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1:functions` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1functions}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1:published` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1published}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1:types` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1types}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1:exportModuleMembers` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1exportmodulemembers}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1:dotSources` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1dotsources}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1:importModules` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1importmodules}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1:usingStatements` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1usingstatements}
- Type: key

#### `files:../modules/Rollout.Targets/Rollout.Targets.psm1:requiredModules` {#symbol-filesmodulesrollouttargetsrollouttargetspsm1requiredmodules}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1` {#symbol-filesscriptsshow-rolloutplanps1}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1:parseErrors` {#symbol-filesscriptsshow-rolloutplanps1parseerrors}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1:functions` {#symbol-filesscriptsshow-rolloutplanps1functions}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1:published` {#symbol-filesscriptsshow-rolloutplanps1published}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1:types` {#symbol-filesscriptsshow-rolloutplanps1types}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1:exportModuleMembers` {#symbol-filesscriptsshow-rolloutplanps1exportmodulemembers}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1:dotSources` {#symbol-filesscriptsshow-rolloutplanps1dotsources}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1:importModules` {#symbol-filesscriptsshow-rolloutplanps1importmodules}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1:usingStatements` {#symbol-filesscriptsshow-rolloutplanps1usingstatements}
- Type: key

#### `files:../scripts/Show-RolloutPlan.ps1:requiredModules` {#symbol-filesscriptsshow-rolloutplanps1requiredmodules}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Logging`](../lib/Logging.ps1.mdmd.md)
- [`Settings`](../lib/Settings.ps1.mdmd.md)
- [`Rollout.Notify`](../modules/Rollout.Notify/Rollout.Notify.psm1.mdmd.md)
- [`Rollout.Steps`](../modules/Rollout.Steps/Rollout.Steps.psd1.mdmd.md)
- [`Rollout.Steps`](../modules/Rollout.Steps/Rollout.Steps.psm1.mdmd.md)
- [`Rollout.Targets`](../modules/Rollout.Targets/Rollout.Targets.psm1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

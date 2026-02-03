# packages/shared/src/rules/symbolCorrectnessProfiles.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/symbolCorrectnessProfiles.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-symbolcorrectnessprofiles-ts
- Generated At: 2026-02-03T21:55:40.884Z

## Authored
### Purpose
Compiles symbol-correctness profiles from relationship-rules config so diagnostics can enforce required inbound/outbound links for documented artifacts.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

### Notes
- Emits warnings for malformed profile definitions and returns lookup helpers consumed by the server validator, closing the audit gap identified during the October 30 safe-commit pass.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]
- Continuous runs of `npm run graph:audit` after October 30 rely on these compiled profiles to report satisfied vs missing relationships per artifact.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-10.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.884Z","inputHash":"369dc094c97d96bb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolProfileLoadResult` {#symbol-symbolprofileloadresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/symbolCorrectnessProfiles.ts#L23)

#### `CompileSymbolProfilesResult` {#symbol-compilesymbolprofilesresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/symbolCorrectnessProfiles.ts#L28)

#### `loadSymbolCorrectnessProfiles` {#symbol-loadsymbolcorrectnessprofiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/symbolCorrectnessProfiles.ts#L34)
- Returns: [`SymbolProfileLoadResult`](#symbol-symbolprofileloadresult)
- Parameters: `config`: [`RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig)

#### `compileSymbolProfiles` {#symbol-compilesymbolprofiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/symbolCorrectnessProfiles.ts#L55)
- Returns: [`CompileSymbolProfilesResult`](#symbol-compilesymbolprofilesresult)
- Parameters: `config`: [`RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `minimatch` - `Minimatch`
- [`relationshipRuleTypes.CompiledSymbolProfile`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofile) (type-only)
- [`relationshipRuleTypes.CompiledSymbolProfileRequirement`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofilerequirement) (type-only)
- [`relationshipRuleTypes.CompiledSymbolProfileSource`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofilesource) (type-only)
- [`relationshipRuleTypes.CompiledSymbolProfileTarget`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledsymbolprofiletarget) (type-only)
- [`relationshipRuleTypes.RelationshipRuleWarning`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulewarning) (type-only)
- [`relationshipRuleTypes.RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig) (type-only)
- [`relationshipRuleTypes.SymbolCorrectnessProfileConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolcorrectnessprofileconfig) (type-only)
- [`relationshipRuleTypes.SymbolProfileEnforcementMode`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofileenforcementmode) (type-only)
- [`relationshipRuleTypes.SymbolProfileLookup`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilelookup) (type-only)
- [`relationshipRuleTypes.SymbolProfileOverrideConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofileoverrideconfig) (type-only)
- [`relationshipRuleTypes.SymbolProfileRequirementConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilerequirementconfig) (type-only)
- [`relationshipRuleTypes.SymbolProfileRequirementDirection`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilerequirementdirection) (type-only)
- [`relationshipRuleTypes.SymbolProfileSourceConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofilesourceconfig) (type-only)
- [`relationshipRuleTypes.SymbolProfileTargetConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-symbolprofiletargetconfig) (type-only)
- [`pathUtils.toWorkspaceRelativePath`](../tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
<!-- LIVE-DOC:END Dependencies -->

# packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts
- Live Doc ID: LD-implementation-packages-server-src-features-diagnostics-symbolcorrectnessvalidator-ts
- Generated At: 2025-12-15T00:38:06.277Z

## Authored
### Purpose
Evaluates compiled symbol correctness profiles against the workspace graph to surface missing evidence links, anchoring the relationship-rule rollout recorded in [2025-10-31 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-31.SUMMARIZED.md).

### Notes
- Leverages identifier intersection, target matchers, and directionality checks refined during the Oct 30 design sessions ([2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md)) to keep MDMD-layer expectations measurable.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.277Z","inputHash":"ce6d3ea44fd51ace"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolCorrectnessDiagnosticOptions` {#symbol-symbolcorrectnessdiagnosticoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts#L13)

#### `SymbolProfileViolation` {#symbol-symbolprofileviolation}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts#L20)

#### `SymbolProfileSummary` {#symbol-symbolprofilesummary}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts#L34)

#### `SymbolCorrectnessReport` {#symbol-symbolcorrectnessreport}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts#L43)

#### `generateSymbolCorrectnessDiagnostics` {#symbol-generatesymbolcorrectnessdiagnostics}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts#L53)
- Returns: [`SymbolCorrectnessReport`](#symbol-symbolcorrectnessreport)
- Parameters: `options`: [`SymbolCorrectnessDiagnosticOptions`](#symbol-symbolcorrectnessdiagnosticoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.CompiledSymbolProfile`](../../../../shared/src/index.ts.mdmd.md#symbol-compiledsymbolprofile)
- [`index.CompiledSymbolProfileRequirement`](../../../../shared/src/index.ts.mdmd.md#symbol-compiledsymbolprofilerequirement)
- [`index.CompiledSymbolProfileTarget`](../../../../shared/src/index.ts.mdmd.md#symbol-compiledsymbolprofiletarget)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.KnowledgeArtifact`](../../../../shared/src/index.ts.mdmd.md#symbol-knowledgeartifact)
- [`index.LinkRelationshipKind`](../../../../shared/src/index.ts.mdmd.md#symbol-linkrelationshipkind)
- [`index.SymbolProfileEnforcementMode`](../../../../shared/src/index.ts.mdmd.md#symbol-symbolprofileenforcementmode)
- [`index.SymbolProfileLookup`](../../../../shared/src/index.ts.mdmd.md#symbol-symbolprofilelookup)
- [`index.toWorkspaceRelativePath`](../../../../shared/src/index.ts.mdmd.md#symbol-toworkspacerelativepath)
<!-- LIVE-DOC:END Dependencies -->

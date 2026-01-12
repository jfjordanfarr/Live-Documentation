# packages/extension/src/commands/overrideLink.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/commands/overrideLink.ts
- Live Doc ID: LD-implementation-packages-extension-src-commands-overridelink-ts
- Generated At: 2026-01-12T21:47:40.293Z

## Authored
### Purpose
Registers the `linkDiagnostics.overrideLink` VS Code command, enabling users to manually rebind or override relationships between artifacts when automated inference is incorrect or incomplete. Supports both manual override (user picks source/target/kind) and rebind override (triggered from diagnostics when a referenced artifact moves or is deleted).

### Notes
- Uses Quick Pick UI to let users select artifact layers, relationship kinds, and target URIs.
- Sends `OverrideLinkRequest` to the language server, which persists the override.
- Rebind flow is invoked when diagnostics detect a broken reference and offer remediation.
- The command is intended for power users who need to correct false-positive diagnostics or establish relationships that static analysis cannot infer.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:47:40.293Z","inputHash":"7d5725dd9a388fd2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `registerOverrideLinkCommand` {#symbol-registeroverridelinkcommand}
- Type: function
- Source: [source](../../../../../../packages/extension/src/commands/overrideLink.ts#L39)
- Returns: `vscode.Disposable`
- Parameters: `client`: `LanguageClient`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.ArtifactLayer`](../../../shared/src/index.ts.mdmd.md#symbol-artifactlayer)
- [`index.LinkRelationshipKind`](../../../shared/src/index.ts.mdmd.md#symbol-linkrelationshipkind)
- [`index.OVERRIDE_LINK_REQUEST`](../../../shared/src/index.ts.mdmd.md#symbol-override_link_request)
- [`index.OverrideLinkRequest`](../../../shared/src/index.ts.mdmd.md#symbol-overridelinkrequest)
- [`index.OverrideLinkResponse`](../../../shared/src/index.ts.mdmd.md#symbol-overridelinkresponse)
- [`index.RebindImpactedArtifact`](../../../shared/src/index.ts.mdmd.md#symbol-rebindimpactedartifact)
- [`index.RebindReason`](../../../shared/src/index.ts.mdmd.md#symbol-rebindreason)
- [`index.RebindRequiredArtifact`](../../../shared/src/index.ts.mdmd.md#symbol-rebindrequiredartifact)
- `path` - `path`
- `vscode` - `vscode`
- `vscode-languageclient/node` - `LanguageClient`
<!-- LIVE-DOC:END Dependencies -->

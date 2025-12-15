# packages/extension/src/commands/overrideLink.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/commands/overrideLink.ts
- Live Doc ID: LD-implementation-packages-extension-src-commands-overridelink-ts
- Generated At: 2025-12-15T00:38:05.885Z

## Authored
### Purpose
Registers the `linkDiagnostics.overrideLink` command so maintainers can manually create or rebind graph edges from VS Code by issuing `OverrideLinkRequest` payloads to the language server, completing T027 as recorded in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2799-L2836](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2799-L2836).

### Notes
- The Oct 16 implementation added layer/kind pickers, file selection, and rebind progress reporting so rename-driven prompts can reuse the same command surface; see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2802-L2836](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2802-L2836).
- That change landed without automated coverage because the Node 22 toolchain blocked `npm run lint` and follow-on test runs; the gap is noted in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2804-L2836](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2804-L2836).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:05.885Z","inputHash":"7d5725dd9a388fd2"}]} -->
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

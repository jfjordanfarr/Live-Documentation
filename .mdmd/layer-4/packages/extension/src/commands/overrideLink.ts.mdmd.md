# packages/extension/src/commands/overrideLink.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/commands/overrideLink.ts
- Live Doc ID: LD-implementation-packages-extension-src-commands-overridelink-ts
- Generated At: 2025-11-24T15:19:58.296Z

## Authored
### Purpose
Registers the `linkDiagnostics.overrideLink` command so maintainers can manually create or rebind graph edges from VS Code by issuing `OverrideLinkRequest` payloads to the language server, completing T027 as recorded in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2799-L2836](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2799-L2836).

### Notes
- The Oct 16 implementation added layer/kind pickers, file selection, and rebind progress reporting so rename-driven prompts can reuse the same command surface; see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2802-L2836](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2802-L2836).
- That change landed without automated coverage because the Node 22 toolchain blocked `npm run lint` and follow-on test runs; the gap is noted in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2804-L2836](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2804-L2836).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.296Z","inputHash":"094138e56c9928bb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `registerOverrideLinkCommand` {#symbol-registeroverridelinkcommand}
- Type: function
- Source: [source](../../../../../../packages/extension/src/commands/overrideLink.ts#L39)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ArtifactLayer`, `LinkRelationshipKind`, `OVERRIDE_LINK_REQUEST`, `OverrideLinkRequest`, `OverrideLinkResponse`, `RebindImpactedArtifact`, `RebindReason`, `RebindRequiredArtifact`
- `path` - `path`
- `vscode` - `vscode`
- `vscode-languageclient/node` - `LanguageClient`
<!-- LIVE-DOC:END Dependencies -->

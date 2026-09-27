# packages/shared/src/tooling/pathUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/pathUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-pathutils-ts
- Generated At: 2026-09-27T20:36:54.537Z

## Authored
### Purpose

Unifies workspace path handling by converting between file URIs, absolute paths, and POSIX-style workspace-relative strings so relationship rules and diagnostics resolve targets consistently across platforms ([relationship rules upgrade](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L5428-L5454)).

### Notes

- Relationship rule provider, engine, and audit flows all depend on these helpers to normalise URIs before emitting `documents`/`implements` edges, avoiding divergent path logic in consumers ([upgrade summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L5428-L5454)).
- Chosen over ad hoc normalisation so Windows drive letters and separator differences collapse to the same canonical representation used by Live Docs and link audits ([upgrade summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L5428-L5454)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:36:54.537Z","inputHash":"b4560a905d93f187"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `toWorkspaceRelativePath` {#symbol-toworkspacerelativepath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/pathUtils.ts#L8)

##### `toWorkspaceRelativePath` — Summary
Convert a file URI into a workspace-relative path using POSIX-style separators.
Returns undefined when the URI is outside the workspace or cannot be resolved.

#### `toWorkspaceFileUri` {#symbol-toworkspacefileuri}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/pathUtils.ts#L31)

##### `toWorkspaceFileUri` — Summary
Resolve a workspace-relative path (or absolute path) to a file URI.

#### `normalizeWorkspacePath` {#symbol-normalizeworkspacepath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/pathUtils.ts#L41)

##### `normalizeWorkspacePath` — Summary
Normalise a path so directory separators are POSIX-style.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Integration Tests
- [evidence.test.ts](../../../../tests/integration/live-docs/evidence.test.ts.mdmd.md)
- [generation.test.ts](../../../../tests/integration/live-docs/generation.test.ts.mdmd.md)
- [oracle.test.ts](../../../../tests/integration/live-docs/oracle.test.ts.mdmd.md)
- [polyglot-fixtures.test.ts](../../../../tests/integration/live-docs/polyglot-fixtures.test.ts.mdmd.md)
- [rosettaParity.test.ts](../../../../tests/integration/live-docs/rosettaParity.test.ts.mdmd.md)

#### Vitest Unit Tests
- [generator.test.ts](../../../generator/src/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../generator/src/renderPublicSymbolLines.test.ts.mdmd.md)
- [aspnet.test.ts](../live-docs/adapters/aspnet.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](../live-docs/adapters/csharp.hangfire.test.ts.mdmd.md)
- [csharp.test.ts](../live-docs/adapters/csharp.test.ts.mdmd.md)
- [css.test.ts](../live-docs/adapters/css.test.ts.mdmd.md)
- [dotnetConfig.test.ts](../live-docs/adapters/dotnetConfig.test.ts.mdmd.md)
- [go.test.ts](../live-docs/adapters/go.test.ts.mdmd.md)
- [html.test.ts](../live-docs/adapters/html.test.ts.mdmd.md)
- [java.test.ts](../live-docs/adapters/java.test.ts.mdmd.md)
- [java.typeref.test.ts](../live-docs/adapters/java.typeref.test.ts.mdmd.md)
- [json.test.ts](../live-docs/adapters/json.test.ts.mdmd.md)
- [powershell.test.ts](../live-docs/adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](../live-docs/adapters/python.docstring.test.ts.mdmd.md)
- [python.resolution.test.ts](../live-docs/adapters/python.resolution.test.ts.mdmd.md)
- [python.test.ts](../live-docs/adapters/python.test.ts.mdmd.md)
- [python.typeref.test.ts](../live-docs/adapters/python.typeref.test.ts.mdmd.md)
- [generator.test.ts](../live-docs/generator.test.ts.mdmd.md)
- [documentationLinks.test.ts](./documentationLinks.test.ts.mdmd.md)
- [enforce-documentation-links.test.ts](../../../../scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

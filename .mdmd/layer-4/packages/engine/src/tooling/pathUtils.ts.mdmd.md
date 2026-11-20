# `packages/engine/src/tooling/pathUtils.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/pathUtils.ts`
- Generated At: 2026-11-20T15:53:17.127Z

## Authored
### Purpose

Unifies workspace path handling by converting between file URIs, absolute paths, and POSIX-style workspace-relative strings so relationship rules and diagnostics resolve targets consistently across platforms ([relationship rules upgrade](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-30/2025-10-30.md#L5428-L5454)).

### Notes

- Relationship rule provider, engine, and audit flows all depend on these helpers to normalise URIs before emitting `documents`/`implements` edges, avoiding divergent path logic in consumers ([upgrade summary](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-30/2025-10-30.md#L5428-L5454)).
- Chosen over ad hoc normalisation so Windows drive letters and separator differences collapse to the same canonical representation used by Live Docs and link audits ([upgrade summary](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-30/2025-10-30.md#L5428-L5454)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `toWorkspaceRelativePath` {#symbol-toworkspacerelativepath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/pathUtils.ts#L8)

##### `toWorkspaceRelativePath` — Summary
Convert a file URI into a workspace-relative path using POSIX-style separators.
Returns undefined when the URI is outside the workspace or cannot be resolved.

#### `toWorkspaceFileUri` {#symbol-toworkspacefileuri}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/pathUtils.ts#L31)

##### `toWorkspaceFileUri` — Summary
Resolve a workspace-relative path (or absolute path) to a file URI.

#### `normalizeWorkspacePath` {#symbol-normalizeworkspacepath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/pathUtils.ts#L41)

##### `normalizeWorkspacePath` — Summary
Normalise a path so directory separators are POSIX-style.

#### `NAME_FAILURES` {#symbol-name_failures}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/pathUtils.ts#L53)
- Returns: `ReadonlySet`

##### `NAME_FAILURES` — Summary
The failures of a disk that mean it cannot hold a name or a path, rather than that it failed: a name too long, a name
it does not accept, a name that is already another's by its own rule of names, a path through something that is not a
folder. The history's tree writer leaves out and names an entry that meets one (`history/git.ts`), and any other
failed system call is the machine's, not the file's (`machineFailure`, `live-docs/processMark.ts`). Kept here, the one
light module both reach, since 2026-11-20: before, each held a copy, and `processMark.ts` loads TypeScript, which the
history command's own process otherwise never loads.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
<!-- LIVE-DOC:END Dependencies -->

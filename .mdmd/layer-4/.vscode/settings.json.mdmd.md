# .vscode/settings.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: .vscode/settings.json
- Entry: tooling
- Generated At: 2026-10-22T18:45:16.881Z

## Authored
### Purpose
The editor settings the repository carries for everyone who opens it in VS Code: the sample programs kept out of the TypeScript server's watch, the Java importer and the problems view, and markdown validation on.

### Notes
- Every exclusion names `tests/integration/programs`, the sample programs in eight languages, which would otherwise be watched, imported and linted as if they were this repository's code. JSON with comments is allowed here, which the JSON adapter reads since 2026-10-16.
- `editor.formatOnSave: false` (2026-10-22): the repository's own word that nothing formats on save wherever it is opened, since no formatter is wanted for TypeScript ([the decision](../../../.mdmd/layer-3/architectural-decisions.mdmd.md#no-formatter-for-typescript-lint-for-correctness-on-eslint-10-and-the-tsconfig-off-baseurl-and-node10-recorded-2026-10-22)).
- Began with the repository's initial commit on 2025-10-16; last changed on 2026-09-29 when settings for code nothing ran were deleted. Gained a Live Doc on 2026-10-16 ([Turn 9 of the October 15 session](../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `typescript.tsserver.watchOptions` {#symbol-typescripttsserverwatchoptions}
- Type: key

#### `typescript.tsserver.watchOptions:excludeDirectories` {#symbol-typescripttsserverwatchoptionsexcludedirectories}
- Type: key

#### `java.project.import.exclusions` {#symbol-javaprojectimportexclusions}
- Type: key

#### `problems.exclude` {#symbol-problemsexclude}
- Type: key

#### `problems.exclude:**/tests/integration/programs/**` {#symbol-problemsexcludetestsintegrationprograms}
- Type: key

#### `markdown.validate.enabled` {#symbol-markdownvalidateenabled}
- Type: key

#### `editor.formatOnSave` {#symbol-editorformatonsave}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

# packages/engine/src/live-docs/adapters/pyproject.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/pyproject.ts
- Generated At: 2026-10-16T16:21:41.297Z

## Authored
### Purpose
The adapter for Python project manifests (`pyproject.toml`, matched by its exact name): the distribution `[project].name` or Poetry's `[tool.poetry].name` names as the file's one `package` symbol, the requirements it stands on as dependencies, and the modules its scripts start as the entries it declares. A manifest that names no distribution, such as one holding only a tool's settings, publishes nothing and is still a tooling entry.

### Notes
- Written on 2026-10-16 for the manifests the `reachable` build of October 15 had left for a later pass ([the October 15–16 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-15.1.SUMMARIZED.md#turn-4)), approved by the owner with the TOML library ([Turn 3 of the October 16 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)).
- Read: `[project].dependencies`, every list of `[project.optional-dependencies]` and every group of `[dependency-groups]` (PEP 735; an `{include-group = ...}` item is passed over); Poetry's `[tool.poetry.dependencies]` only when `[project]` has no dependency list (with one, Poetry 2 uses that table to refine the list's entries), `python` passed over; and Poetry's groups and its older `[tool.poetry.dev-dependencies]` in either case, since a group is listed nowhere else. A PEP 508 requirement is reduced by `parseRequirement` to its name and specifier joined with `@`, extras and markers dropped, spaces removed; a direct reference is `name@url`.
- Linked: a requirement whose source is a path (a Poetry dependency's `path`, or `[tool.uv.sources]`) links to the `pyproject.toml` in that folder when the workspace holds it; any other links to the workspace `pyproject.toml` publishing its name, compared as Python compares names (PEP 503), or is external. Not read: `[build-system].requires`, which builds the distribution and is not what it stands on.
- Declared: each entry of `[project.scripts]`, `[project.gui-scripts]` and `[tool.poetry.scripts]` (a string or a table's `callable`) is a `command` by its key, on the module its `module:function` value names: `module/path.py` or `module/path/__init__.py` under the manifest's folder, then under its `src/`. Poetry's `type = "file"` scripts are not read. Measured by `pyproject.test.ts` and `tests/integration/live-docs/manifests.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `normalizeDistributionName` {#symbol-normalizedistributionname}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pyproject.ts#L44)

##### `normalizeDistributionName` — Summary
A distribution name as Python compares them: lowercase, with every run of `-`, `_` and `.` one `-` (PEP 503).

#### `Requirement` {#symbol-requirement}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pyproject.ts#L49)

##### `Requirement` — Summary
A requirement reduced to what the docs write.

#### `parseRequirement` {#symbol-parserequirement}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pyproject.ts#L58)
- Returns: [`Requirement`](#symbol-requirement)

##### `parseRequirement` — Summary
Reads a PEP 508 requirement: the name, then the specifier or the direct reference, extras and markers dropped.

#### `pyprojectAdapter` {#symbol-pyprojectadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pyproject.ts#L72)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `pyprojectAdapter` — Summary
Language adapter for `pyproject.toml`: the distribution as a symbol, its requirements, and the modules its scripts start.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`manifest.ManifestContext`](./manifest.ts.mdmd.md#symbol-manifestcontext-interface)
- [`manifest.ManifestDependencies`](./manifest.ts.mdmd.md#symbol-manifestdependencies)
- [`manifest.manifestContext`](./manifest.ts.mdmd.md#symbol-manifestcontext-function)
- [`manifest.manifestIn`](./manifest.ts.mdmd.md#symbol-manifestin)
- [`manifest.packageSymbols`](./manifest.ts.mdmd.md#symbol-packagesymbols)
- [`manifest.publishedName`](./manifest.ts.mdmd.md#symbol-publishedname)
- [`manifest.readToml`](./manifest.ts.mdmd.md#symbol-readtoml)
- [`manifest.sortDeclared`](./manifest.ts.mdmd.md#symbol-sortdeclared)
- [`manifest.stringOf`](./manifest.ts.mdmd.md#symbol-stringof)
- [`manifest.tableOf`](./manifest.ts.mdmd.md#symbol-tableof)
- [`manifest.workspaceFile`](./manifest.ts.mdmd.md#symbol-workspacefile)
- [`coreTypes.DeclaredEntry`](../coreTypes.ts.mdmd.md#symbol-declaredentry) (type-only)
- [`coreTypes.SourceAnalysisResult`](../coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
<!-- LIVE-DOC:END Dependencies -->

# packages/shared/src/live-docs/coreUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/coreUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-coreutils-ts
- Generated At: 2025-12-09T01:18:23.359Z

## Authored
### Purpose
Stateless utility functions for Live Documentation generation. Provides helpers for path formatting, symbol slug creation, TypeScript AST node inspection, and dependency qualifier formatting used throughout the Live Doc system.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `formatSourceLink()` and `formatRelativePathFromDoc()` handle path-to-doc cross-referencing
- `createSymbolSlug()` produces `symbol-{name}` anchors for markdown headers
- AST helpers (`hasExportModifier`, `hasDefaultModifier`, `getNodeLocation`) wrap common TypeScript inspection patterns
- All functions are pure with no side effects

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-09T01:18:23.359Z","inputHash":"b78b0978c5c50d66"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `formatSourceLink` {#symbol-formatsourcelink}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L30)

##### `formatSourceLink` — Summary
Formats a source link with line number anchor.

##### `formatSourceLink` — Parameters
- `params.docDir`: Absolute path to the Live Doc directory
- `params.line`: 1-indexed line number
- `params.sourceAbsolute`: Absolute path to the source file

##### `formatSourceLink` — Returns
A relative path with #L{line} anchor

#### `formatRelativePathFromDoc` {#symbol-formatrelativepathfromdoc}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L42)

##### `formatRelativePathFromDoc` — Summary
Formats a relative path from a doc directory to a target file.

##### `formatRelativePathFromDoc` — Parameters
- `docDir`: Absolute path to the doc directory
- `targetAbsolute`: Absolute path to the target file

##### `formatRelativePathFromDoc` — Returns
A relative path, always starting with "./" or "../"

#### `createSymbolSlug` {#symbol-createsymbolslug}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L60)

##### `createSymbolSlug` — Summary
Creates a slug for a symbol name suitable for markdown anchors.

##### `createSymbolSlug` — Parameters
- `name`: The symbol name

##### `createSymbolSlug` — Returns
A slug like "symbol-myfunction", or undefined if the name is invalid

#### `toModuleLabel` {#symbol-tomodulelabel}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L75)

##### `toModuleLabel` — Summary
Extracts a module label from a workspace-relative path.

##### `toModuleLabel` — Parameters
- `workspaceRelativePath`: Path like "packages/shared/src/core.ts"

##### `toModuleLabel` — Returns
Base name without extension, e.g., "core"

#### `formatInlineCode` {#symbol-formatinlinecode}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L87)

##### `formatInlineCode` — Summary
Formats a value as inline code, escaping backticks.

##### `formatInlineCode` — Parameters
- `value`: The value to format

##### `formatInlineCode` — Returns
The value wrapped in backticks with internal backticks escaped

#### `formatDependencyQualifier` {#symbol-formatdependencyqualifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L98)
- Parameters: `dependency`: [`DependencyEntry`](./core.ts.mdmd.md#symbol-dependencyentry)

##### `formatDependencyQualifier` — Summary
Formats dependency qualifiers (re-export, type-only) for display.

##### `formatDependencyQualifier` — Parameters
- `dependency`: The dependency entry

##### `formatDependencyQualifier` — Returns
A qualifier string like " (re-export, type-only)" or empty string

#### `resolveExportAssignmentName` {#symbol-resolveexportassignmentname}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L122)
- Parameters: `expression`: `ts.Expression`

##### `resolveExportAssignmentName` — Summary
Resolves the name of an export assignment expression.

##### `resolveExportAssignmentName` — Parameters
- `expression`: The expression from `export = expr` or `export default expr`

##### `resolveExportAssignmentName` — Returns
The resolved name, or "default" for anonymous expressions

#### `hasExportModifier` {#symbol-hasexportmodifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L135)
- Parameters: `node`: `ts.Node`

##### `hasExportModifier` — Summary
Checks if a node has the `export` modifier.

#### `hasDefaultModifier` {#symbol-hasdefaultmodifier}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L146)
- Parameters: `node`: `ts.Node`

##### `hasDefaultModifier` — Summary
Checks if a node has the `default` modifier.

#### `getNodeLocation` {#symbol-getnodelocation}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L157)
- Returns: [`LocationInfo`](./core.ts.mdmd.md#symbol-locationinfo)
- Parameters: `node`: `ts.Node`; `sourceFile`: `ts.SourceFile`

##### `getNodeLocation` — Summary
Gets the source location (1-indexed line and character) of a node.

#### `displayDependencyKey` {#symbol-displaydependencykey}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L172)
- Parameters: `entry`: [`DependencyEntry`](./core.ts.mdmd.md#symbol-dependencyentry)

##### `displayDependencyKey` — Summary
Gets the display key for a dependency entry.

##### `displayDependencyKey` — Parameters
- `entry`: The dependency entry

##### `displayDependencyKey` — Returns
The resolved path if available, otherwise the specifier
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.LocationInfo`](./coreTypes.ts.mdmd.md#symbol-locationinfo) (type-only)
- [`githubSlugger.slug`](../tooling/githubSlugger.ts.mdmd.md#symbol-slug)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](./adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./adapters/csharp.hangfire.test.ts.mdmd.md)
- [java.typeref.test.ts](./adapters/java.typeref.test.ts.mdmd.md)
- [powershell.test.ts](./adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./adapters/python.docstring.test.ts.mdmd.md)
- [python.typeref.test.ts](./adapters/python.typeref.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./adapters/ruby.docstring.test.ts.mdmd.md)
- [ruby.typeref.test.ts](./adapters/ruby.typeref.test.ts.mdmd.md)
- [rust.docstring.test.ts](./adapters/rust.docstring.test.ts.mdmd.md)
- [rust.typeref.test.ts](./adapters/rust.typeref.test.ts.mdmd.md)
- [core.docstring.test.ts](./core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->

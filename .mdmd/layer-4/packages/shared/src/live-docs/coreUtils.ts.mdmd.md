# packages/shared/src/live-docs/coreUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/coreUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-coreutils-ts
- Generated At: 2026-03-11T01:35:37.214Z

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
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-11T01:35:37.214Z","inputHash":"0906a5f674db1fc8"}]} -->
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

#### `isBarrelFilePath` {#symbol-isbarrelfilepath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L210)

##### `isBarrelFilePath` — Summary
Determines if a file path represents a barrel/index file.

##### `isBarrelFilePath` — Remarks
Barrel files (also known as index files) are TypeScript/JavaScript modules
that primarily re-export symbols from other files rather than defining them.
They are commonly used as public API entry points for packages.

When resolving symbol references, we generally prefer to link to the file
where a symbol is **defined** rather than a barrel that re-exports it.
This produces more accurate dependency graphs and clearer documentation links.

##### `isBarrelFilePath` — Parameters
- `filePath`: The file path to check (workspace-relative or absolute)

##### `isBarrelFilePath` — Returns
True if the file appears to be a barrel file based on its name

##### `isBarrelFilePath` — Examples
```ts
isBarrelFilePath("packages/foo/index.ts");      // true
isBarrelFilePath("packages/foo/src/utils.ts");  // false
isBarrelFilePath("lib/mod.ts");                 // true
```

#### `compareSymbolLocationsPreferOrigin` {#symbol-comparesymbollocationspreferorigin}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L232)

##### `compareSymbolLocationsPreferOrigin` — Summary
Sorts symbol locations to prefer non-barrel files over barrel files.

##### `compareSymbolLocationsPreferOrigin` — Remarks
When multiple files export the same symbol (e.g., an origin file and a
barrel that re-exports it), we want to resolve links to the origin file
where the symbol is actually defined.

This comparator:
1. Puts non-barrel files before barrel files
2. Among files of the same barrel-ness, prefers deeper paths (more specific)

##### `compareSymbolLocationsPreferOrigin` — Parameters
- `a`: First location to compare
- `b`: Second location to compare

##### `compareSymbolLocationsPreferOrigin` — Returns
Negative if a should come first, positive if b should come first

#### `commonDirectoryPrefixLength` {#symbol-commondirectoryprefixlength}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L254)

##### `commonDirectoryPrefixLength` — Summary
Counts the number of shared leading directory segments between two paths.
Used for proximity-based symbol resolution.

#### `createProximityAwareComparator` {#symbol-createproximityawarecomparator}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/coreUtils.ts#L273)

##### `createProximityAwareComparator` — Summary
Creates a comparator that ranks symbol locations by proximity to a reference path.

Priority: non-barrel > barrel, then closer directory > distant, then deeper > shallower.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.LocationInfo`](./coreTypes.ts.mdmd.md#symbol-locationinfo) (type-only)
- [`githubSlugger.slug`](../tooling/githubSlugger.ts.mdmd.md#symbol-slug)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

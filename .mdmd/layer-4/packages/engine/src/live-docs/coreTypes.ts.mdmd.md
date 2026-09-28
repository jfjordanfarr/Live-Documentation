# packages/engine/src/live-docs/coreTypes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/coreTypes.ts
- Generated At: 2026-09-28T16:48:38.875Z

## Authored
### Purpose
Central type definitions for Live Documentation analysis. Defines the core interfaces for symbols (`PublicSymbolEntry`), dependencies (`DependencyEntry`), type references (`TypeReference`), documentation structures (`SymbolDocumentation`), and the workspace symbol index (`WorkspaceSymbolIndex`) that enables cross-Live-Doc linking.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `TypeReference.role` distinguishes extends/implements/return/parameter/property/generic-constraint/type-argument
- `WorkspaceSymbolIndex` is a Map<symbolName, ResolvedSymbolLocation[]> supporting multiple definitions with same name
- `SymbolDocumentation` supports JSDoc, TSDoc, and XML documentation comment formats
- Pure type definitions with no runtime behavior — consumed by analyzers, renderers, and graph builders

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SourceAnalysisResult` {#symbol-sourceanalysisresult}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L19)

##### `SourceAnalysisResult` — Summary
Result of analyzing a source file for symbols and dependencies.

#### `ResolvedSymbolLocation` {#symbol-resolvedsymbollocation}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L38)

##### `ResolvedSymbolLocation` — Summary
Represents a resolved symbol location in the Live Documentation workspace.

##### `ResolvedSymbolLocation` — Remarks
This interface maps a symbol name to its Live Doc file path and anchor,
enabling cross-Live-Doc linking when type references are rendered.

##### `ResolvedSymbolLocation` — Links
- `WorkspaceSymbolIndex`

#### `WorkspaceSymbolIndex` {#symbol-workspacesymbolindex}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L87)

##### `WorkspaceSymbolIndex` — Summary
A workspace-wide index mapping symbol names to their Live Doc locations.

##### `WorkspaceSymbolIndex` — Remarks
This index is built during Live Doc generation by collecting all exported
symbols from all tracked files. It enables type reference resolution:
when a symbol's return type or parameter type is a type defined elsewhere
in the workspace, we can render it as a link to that type's Live Doc.

The index supports multiple symbols with the same name (from different files)
by storing an array of locations. Resolution prefers exact matches and
falls back to qualified name matching when ambiguous.

##### `WorkspaceSymbolIndex` — Examples
```typescript
const index: WorkspaceSymbolIndex = new Map([
  ["Widget", [{ liveDocPath: ".live-documentation/source/src/types.ts.md", sourcePath: "src/types.ts", anchor: "symbol-widget", kind: "interface" }]],
  ["processWidget", [{ liveDocPath: ".live-documentation/source/src/core.ts.md", sourcePath: "src/core.ts", anchor: "symbol-processwidget", kind: "function" }]]
]);
```

##### `WorkspaceSymbolIndex` — Links
- `buildWorkspaceSymbolIndex`
- `ResolvedSymbolLocation` — *

#### `TypeReference` {#symbol-typereference}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L104)

##### `TypeReference` — Summary
Represents a type reference extracted from a symbol's signature.

##### `TypeReference` — Remarks
Type references capture the relationship between a symbol and the types it uses,
enabling cross-Live-Doc linking when those types are defined in other workspace files.
This powers the "type-aware symbol linking" feature in the Explorer's Local Map.

##### `TypeReference` — Links
- `collectTypeReferences`
- `PublicSymbolEntry.typeReferences` — *

#### `PublicSymbolEntry` {#symbol-publicsymbolentry}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L177)

##### `PublicSymbolEntry` — Summary
Describes a public symbol exported from a source file.

##### `PublicSymbolEntry` — Remarks
This interface captures the essential metadata for each exported symbol,
including its name, kind, location, documentation, and type references.
The `typeReferences` field enables cross-Live-Doc linking when types
are defined in other workspace files.

##### `PublicSymbolEntry` — Links
- `collectExportedSymbols` — *
- `TypeReference`

#### `DependencyBasis` {#symbol-dependencybasis}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L233)

##### `DependencyBasis` — Summary
How a dependency was observed, when it was not read from source.

##### `DependencyBasis` — Remarks
Within a folder, edges are observed from source: an import, a reference, a
type the language resolves. Between systems they are observed from a
contract (a route, a procedure or a table that one file serves under a name
and another calls by that name) or from configuration (an address one
configuration file listens on and another points at). The picture draws the
three differently, so every edge says which it is; source is the default and
carries no mark.

#### `DependencyEntry` {#symbol-dependencyentry}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L238)

##### `DependencyEntry` — Summary
Describes a dependency imported or exported from a source file.

#### `ReExportedSymbolInfo` {#symbol-reexportedsymbolinfo}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L253)

##### `ReExportedSymbolInfo` — Summary
Describes a re-exported symbol from another module.

#### `LocationInfo` {#symbol-locationinfo}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L268)

##### `LocationInfo` — Summary
Source location information (1-indexed line and character).

#### `SymbolDocumentationField` {#symbol-symboldocumentationfield}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L280)

##### `SymbolDocumentationField` — Summary
Fields that can appear in symbol documentation.

#### `SymbolDocumentationParameter` {#symbol-symboldocumentationparameter}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L295)

##### `SymbolDocumentationParameter` — Summary
Parameter documentation from JSDoc or XML comments.

#### `SymbolDocumentationException` {#symbol-symboldocumentationexception}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L303)

##### `SymbolDocumentationException` — Summary
Exception documentation from

##### `SymbolDocumentationException` — Exceptions
- _Unknown_: /@exception tags.

#### `SymbolDocumentationExample` {#symbol-symboldocumentationexample}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L311)

##### `SymbolDocumentationExample` — Summary
Example documentation from

##### `SymbolDocumentationExample` — Examples
tags.

#### `SymbolDocumentationLinkKind` {#symbol-symboldocumentationlinkkind}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L320)

##### `SymbolDocumentationLinkKind` — Summary
Link kind for

##### `SymbolDocumentationLinkKind` — Links
- `/@link tags.`

#### `SymbolDocumentationLink` {#symbol-symboldocumentationlink}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L325)

##### `SymbolDocumentationLink` — Summary
Link documentation from

##### `SymbolDocumentationLink` — Links
- `/@link tags.`

#### `SymbolDocumentation` {#symbol-symboldocumentation}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L338)

##### `SymbolDocumentation` — Summary
Comprehensive documentation extracted from a symbol's comments.

##### `SymbolDocumentation` — Remarks
Supports JSDoc, TSDoc, and XML documentation comment formats.
The `source` field indicates which parser produced the documentation.

#### `PublicSymbolHeadingInfo` {#symbol-publicsymbolheadinginfo}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/coreTypes.ts#L360)

##### `PublicSymbolHeadingInfo` — Summary
Information computed for rendering a public symbol heading.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

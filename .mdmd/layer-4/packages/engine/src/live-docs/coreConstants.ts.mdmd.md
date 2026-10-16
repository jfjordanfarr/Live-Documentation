# packages/engine/src/live-docs/coreConstants.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/coreConstants.ts
- Generated At: 2026-10-16T20:40:17.951Z

## Authored
### Purpose
Central repository of file extension constants for Live Documentation. Defines which extensions are analyzed by the TypeScript parser, which are treated as implementation code (vs assets), and which extensions are tried during module resolution.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `SUPPORTED_SCRIPT_EXTENSIONS`: TypeScript/JavaScript variants for AST parsing
- `IMPLEMENTATION_CODE_EXTENSIONS`: Polyglot coverage (TS, C/C++, C#, Java, Python, Ruby, Rust, PowerShell, ASP.NET)
- `MODULE_RESOLUTION_EXTENSIONS`: Order matters for TypeScript-style resolution
- `RESERVED_HEADING_NAMES`: Prevents user-authored sections from colliding with generated sections
- `.inl` joined the implementation extensions on 2026-10-16 with the C and C++ adapter's registration, so an inline file under a sample root is code and not an asset.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SUPPORTED_SCRIPT_EXTENSIONS` {#symbol-supported_script_extensions}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/coreConstants.ts#L15)

##### `SUPPORTED_SCRIPT_EXTENSIONS` — Summary
Extensions supported by the TypeScript parser for script analysis.

#### `MODULE_RESOLUTION_EXTENSIONS` {#symbol-module_resolution_extensions}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/coreConstants.ts#L29)

##### `MODULE_RESOLUTION_EXTENSIONS` — Summary
Extensions tried in order during module resolution (TypeScript-style).

#### `RESERVED_HEADING_NAMES` {#symbol-reserved_heading_names}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/coreConstants.ts#L45)

##### `RESERVED_HEADING_NAMES` — Summary
Reserved heading names that cannot be used as user-authored sections.
These are normalized to lowercase for comparison.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

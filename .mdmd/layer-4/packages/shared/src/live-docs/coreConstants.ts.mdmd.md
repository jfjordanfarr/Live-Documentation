# packages/shared/src/live-docs/coreConstants.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/coreConstants.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-coreconstants-ts
- Generated At: 2025-12-09T01:18:23.348Z

## Authored
### Purpose
Central repository of file extension constants for Live Documentation. Defines which extensions are analyzed by the TypeScript parser, which are treated as implementation code (vs assets), and which extensions are tried during module resolution.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `SUPPORTED_SCRIPT_EXTENSIONS`: TypeScript/JavaScript variants for AST parsing
- `IMPLEMENTATION_CODE_EXTENSIONS`: Polyglot coverage (TS, C/C++, C#, Java, Python, Ruby, Rust, PowerShell, ASP.NET)
- `MODULE_RESOLUTION_EXTENSIONS`: Order matters for TypeScript-style resolution
- `RESERVED_HEADING_NAMES`: Prevents user-authored sections from colliding with generated sections

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-09T01:18:23.348Z","inputHash":"ed56de8a29669ab7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SUPPORTED_SCRIPT_EXTENSIONS` {#symbol-supported_script_extensions}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/coreConstants.ts#L15)

##### `SUPPORTED_SCRIPT_EXTENSIONS` — Summary
Extensions supported by the TypeScript parser for script analysis.

#### `IMPLEMENTATION_CODE_EXTENSIONS` {#symbol-implementation_code_extensions}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/coreConstants.ts#L30)

##### `IMPLEMENTATION_CODE_EXTENSIONS` — Summary
Extensions that are always treated as implementation code, even under fixture directories.
These files contain analyzable source code with symbols and dependencies.

#### `MODULE_RESOLUTION_EXTENSIONS` {#symbol-module_resolution_extensions}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/coreConstants.ts#L55)

##### `MODULE_RESOLUTION_EXTENSIONS` — Summary
Extensions tried in order during module resolution (TypeScript-style).

#### `RESERVED_HEADING_NAMES` {#symbol-reserved_heading_names}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/coreConstants.ts#L71)

##### `RESERVED_HEADING_NAMES` — Summary
Reserved heading names that cannot be used as user-authored sections.
These are normalized to lowercase for comparison.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
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

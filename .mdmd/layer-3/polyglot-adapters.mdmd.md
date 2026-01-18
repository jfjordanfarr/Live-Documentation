# Polyglot Language Adapters

## Metadata
- Layer: 3
- Archetype: component
- Live Doc ID: COMP-polyglot-adapters

## Authored
### Purpose
Document the polyglot adapter subsystem that extracts symbols and dependencies from source files across 12+ languages, enabling Live Documentation generation without requiring language-specific compilers or interpreters at runtime.

### Notes
- Adapters reside in `packages/shared/src/live-docs/adapters/` and implement a common `LanguageAdapter` interface.
- Each adapter uses regex-based parsing to extract public symbols, dependencies, and docstring content. This is a deliberate design choice—adapters run in pure JavaScript/TypeScript without shelling out to compilers.
- **Only TypeScript has a true compiler-backed oracle** (via `import ts from "typescript"`). All other adapters are sophisticated regex parsers that approximate the behaviour of their respective language's import/module resolution.
- Docstring extraction varies by language:
  - **Python**: Supports NumPy, Google, and reStructuredText docstring formats (`python.docstring.ts`)
  - **C#**: Parses XML documentation comments including `<summary>`, `<param>`, `<returns>`, `<exception>` (`csharp.xmldoc.ts`)
  - **C**: Extracts Doxygen-style `/** */` comments (`c.ts`)
- The adapter barrel (`adapters/index.ts`) exports `analyzeWithLanguageAdapters()` which orchestrates analysis across the full adapter suite.

### Adapter Inventory

| Adapter | File | Languages/Extensions | Special Features |
|---------|------|---------------------|------------------|
| **TypeScript** | (core, not in adapters/) | `.ts`, `.tsx`, `.js`, `.jsx` | Compiler-backed, full AST |
| **Python** | `python.ts` | `.py` | NumPy/Google/reST docstrings |
| **C#** | `csharp.ts` | `.cs` | XML doc + dependency inference |
| **Java** | `java.ts` | `.java` | Package imports, same-package resolution |
| **Rust** | `rust.ts` | `.rs` | `use`, `mod`, `pub` paths |
| **Ruby** | `ruby.ts` | `.rb` | `require`, `require_relative` |
| **Go** | `go.ts` | `.go` | `import` blocks, test file skipping |
| **C** | `c.ts` | `.c`, `.h` | `#include`, function body scoping |
| **PowerShell** | `powershell.ts` | `.ps1`, `.psm1` | Comment-based help blocks |
| **HTML** | `html.ts` | `.html`, `.htm` | Asset references (scripts, stylesheets) |
| **CSS** | `css.ts` | `.css` | `@import`, `url()` references |
| **JSON** | `json.ts` | `.json` | Schema and reference detection |
| **ASP.NET** | `aspnet.ts` | `.aspx`, `.ascx`, `.master` | Code-behind linking |

### Supporting Modules

- **`csharp.dependencies.ts`**: Deep dependency inference for C# including configuration keys, type name literals, and indexer patterns.
- **`csharp.xmldoc.ts`**: Full XML documentation comment parser with multi-paragraph support.
- **`python.docstring.ts`**: Stateful docstring parser supporting all major Python docstring conventions.

### Strategy
- Maintain benchmark parity with curated `expected.json` fixtures across all supported languages.
- Consider compiler/interpreter-backed oracles for Python, Rust, and Go as a future enhancement when CI infrastructure supports it.
- Extend docstring extraction to Java (Javadoc) and Rust (`///` comments) to improve Live Doc richness.

## System References
### Components
- [packages/shared/src/live-docs/adapters/index.ts](../layer-4/packages/shared/src/live-docs/adapters/index.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/python.ts](../layer-4/packages/shared/src/live-docs/adapters/python.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/python.docstring.ts](../layer-4/packages/shared/src/live-docs/adapters/python.docstring.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/csharp.ts](../layer-4/packages/shared/src/live-docs/adapters/csharp.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/csharp.xmldoc.ts](../layer-4/packages/shared/src/live-docs/adapters/csharp.xmldoc.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/csharp.dependencies.ts](../layer-4/packages/shared/src/live-docs/adapters/csharp.dependencies.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/java.ts](../layer-4/packages/shared/src/live-docs/adapters/java.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/rust.ts](../layer-4/packages/shared/src/live-docs/adapters/rust.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/ruby.ts](../layer-4/packages/shared/src/live-docs/adapters/ruby.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/go.ts](../layer-4/packages/shared/src/live-docs/adapters/go.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/c.ts](../layer-4/packages/shared/src/live-docs/adapters/c.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/powershell.ts](../layer-4/packages/shared/src/live-docs/adapters/powershell.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/html.ts](../layer-4/packages/shared/src/live-docs/adapters/html.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/css.ts](../layer-4/packages/shared/src/live-docs/adapters/css.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/json.ts](../layer-4/packages/shared/src/live-docs/adapters/json.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/aspnet.ts](../layer-4/packages/shared/src/live-docs/adapters/aspnet.ts.mdmd.md)

## Evidence
- Benchmark fixtures under `tests/integration/benchmarks/fixtures/{language}/` validate adapter precision/recall.
- Dev Day 60 (2026-01-16) documented fixes for Ruby single-quote handling, Go test skipping, C function body scoping, Rust indented `use`, and Java same-package resolution.
- `npm run test:benchmarks` runs the full polyglot accuracy suite.

# Polyglot Language Adapters

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-polyglot-adapters

## Authored

### Purpose

Document the language adapters that turn a source file into its public symbols, its dependencies and its documentation, so that Live Documentation can be generated for a polyglot workspace without shelling out to each language's toolchain.

### Notes

- Adapters live in `packages/shared/src/live-docs/adapters/` and implement one `LanguageAdapter` interface: `analyze({ absolutePath, workspaceRoot, fileIndex })` returns symbols and dependencies for one file. The barrel (`adapters/index.ts`) dispatches by file extension; TypeScript and JavaScript are handled by the core with the TypeScript compiler API instead.
- **C# is parsed with tree-sitter** (`csharp.ts`, since 2026-09-27). The grammar comes from `@vscode/tree-sitter-wasm` and runs on `web-tree-sitter` (`treeSitter.ts`); that package's own JavaScript entry cannot be required from Node, so only its `.wasm` files are used. The adapter extracts each file's declarations and every name it uses, builds a workspace-wide table of qualified type names once per generation run (cached on the file index), and resolves names the way the compiler does: enclosing types, then enclosing namespaces from the inside out, then `using` directives and aliases. A partial class is linked to the peer file that declares the members it uses. Per-file facts are cached by modification time, so the symbol-index pass and the document pass parse each file once.
- **What no compiler sees** is handled by `csharp.dependencies.ts`: `ConfigurationManager.AppSettings[...]` and `ConnectionStrings[...]` keys (literals, or constants declared in this file or another), `ChannelFactory<T>(name)` endpoint names, `IConfiguration` indexer keys, types named in strings for reflection, and Hangfire job targets. Those resolve through the same type table.
- **Configuration files publish what code reaches into them by.** `.config` files (`dotnetConfig.ts`) publish appSettings keys, connection-string names, WCF endpoint names and service names, and depend on the types their `contract` and `service name` attributes name. JSON files (`json.ts`) publish every key path joined with `:`, the way `IConfiguration` addresses nested settings. Markup files (`aspnet.ts`, `html.ts`) publish element ids. This is what lets a generated link to a key, an endpoint or an element land on a real anchor.
- **Python is parsed with tree-sitter** (`python.ts`, since 2026-09-27). A module's symbols are its top-level classes, functions and assignments and the public members of its classes (methods, properties, fields, nested classes), with docstrings parsed by `python.docstring.ts` (NumPy, Google and reStructuredText). Imports resolve the way the interpreter resolves them: an absolute module is looked up beside the importing file, at the root of its package, at the workspace root and under `src/`; a `from` import depends on the module's own file and on the file where each name is defined, followed through the re-exports of a package's `__init__.py`; an aliased module import is followed through the attributes used on it; a wildcard import links the module's public names the file actually uses. Imports inside functions and under `TYPE_CHECKING` count; import text inside strings and comments does not. Per-file facts are cached by modification time and read on demand, so following a re-export parses the barrel once.
- The other languages still use hand-written scanners. C# parses XML documentation comments (`csharp.xmldoc.ts`); C extracts Doxygen-style comments (`c.ts`).

### Adapter Inventory

| Adapter         | File                     | Languages/Extensions         | What it extracts                                                                     |
| --------------- | ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------ |
| **TypeScript**  | (core, not in adapters/) | `.ts`, `.tsx`, `.js`, `.jsx` | Compiler-backed, full AST                                                            |
| **C#**          | `csharp.ts`              | `.cs`                        | tree-sitter; types, members, XML docs, signatures; compiler-style name resolution    |
| **.NET config** | `dotnetConfig.ts`        | `.config`                    | Settings, connection strings, WCF endpoints and services; contract and service types |
| **Python**      | `python.ts`              | `.py`                        | tree-sitter; classes, functions, members, docstrings; imports followed to origins    |
| **Java**        | `java.ts`                | `.java`                      | Package imports, same-package resolution                                             |
| **Rust**        | `rust.ts`                | `.rs`                        | `use`, `mod`, `pub` paths                                                            |
| **Ruby**        | `ruby.ts`                | `.rb`                        | `require`, `require_relative`                                                        |
| **Go**          | `go.ts`                  | `.go`                        | `import` blocks, test file skipping                                                  |
| **C**           | `c.ts`                   | `.c`, `.h`                   | `#include`, function body scoping                                                    |
| **PowerShell**  | `powershell.ts`          | `.ps1`, `.psm1`              | Comment-based help blocks                                                            |
| **HTML**        | `html.ts`                | `.html`, `.htm`              | Asset references; element ids as symbols                                             |
| **CSS**         | `css.ts`                 | `.css`                       | `@import`, `url()` references                                                        |
| **JSON**        | `json.ts`                | `.json`                      | Key paths as symbols; file-path references                                           |
| **ASP.NET**     | `aspnet.ts`              | `.aspx`, `.ascx`, `.master`  | Code-behind and script links; element ids as symbols                                 |

### Supporting Modules

- **`treeSitter.ts`**: one parser per grammar, loaded on first use.
- **`csharp.dependencies.ts`**: the C# dependencies no compiler sees (configuration, reflection, Hangfire).
- **`csharp.xmldoc.ts`**: XML documentation comment parser with multi-paragraph support.
- **`python.docstring.ts`**: stateful docstring parser supporting the major Python docstring conventions.

### Strategy

- Every adapter is measured against a compiler-backed oracle that shares no mechanism with it; the earlier benchmark was retired on 2026-09-27 because it did not. See "Accuracy Measurement" in [Architectural Decisions](architectural-decisions.mdmd.md). Every sample program with an indexer carries expectations; the C# and TypeScript adapters match every compiler edge, and the baseline of the remaining scanners is recorded there.
- Replace the remaining scanners with tree-sitter, one language at a time, each measured the same way.
- Extend docstring extraction to Java (Javadoc) and Rust (`///` comments).
- The C# adapter records each type's namespace-qualified name (`Outer.Inner` for nested types), which is what the [Membrane Map](membrane-map.mdmd.md)'s namespace-based hierarchy needs; no view reads it yet.

## System References

### Components

- [packages/shared/src/live-docs/adapters/index.ts](../layer-4/packages/shared/src/live-docs/adapters/index.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/python.ts](../layer-4/packages/shared/src/live-docs/adapters/python.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/python.docstring.ts](../layer-4/packages/shared/src/live-docs/adapters/python.docstring.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/csharp.ts](../layer-4/packages/shared/src/live-docs/adapters/csharp.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/csharp.xmldoc.ts](../layer-4/packages/shared/src/live-docs/adapters/csharp.xmldoc.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/csharp.dependencies.ts](../layer-4/packages/shared/src/live-docs/adapters/csharp.dependencies.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/treeSitter.ts](../layer-4/packages/shared/src/live-docs/adapters/treeSitter.ts.mdmd.md)
- [packages/shared/src/live-docs/adapters/dotnetConfig.ts](../layer-4/packages/shared/src/live-docs/adapters/dotnetConfig.ts.mdmd.md)
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

- The Rosetta parity suite (`tests/integration/live-docs/rosettaParity.test.ts`) generates the same program in eight languages and flags an adapter that disagrees with the others; the polyglot fixture suite checks the C#, Java and Python output in detail.
- Fixes recorded on 2026-01-16: Ruby single-quote handling, Go test skipping, C function body scoping, Rust indented `use`, and Java same-package resolution.

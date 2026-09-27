# Sample Programs

_Current as of 2026-09-27._

## Purpose

Describe the sample programs under `tests/integration/programs/`: what each one is for, which suite reads it, and which real-world pattern it encodes. The hand-authored scenario workspaces under `tests/integration/fixtures/` (WebForms, Razor, Blazor, queue worker, reflection, PowerShell, the C# XML-doc stress workspace, the SlopCop dogfood workspaces) are described in [Integration Testing](testing-integration-architecture.mdmd.md).

## What is here

Every directory below holds committed source. The seven vendored fixtures that were pinned clones of third-party repositories (ky, libuv, Newtonsoft.Json, mux, OkHttp, Requests, log) were retired on 2026-09-27; see [Architectural Decisions](architectural-decisions.mdmd.md).

| Language   | Fixtures                                  | Read by                                                                 |
| ---------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| TypeScript | `basic`, `layered`, `rosetta`             | all: the oracle; `rosetta`: Rosetta parity                              |
| C          | `basics`, `modular`, `rosetta`            | `rosetta`: Rosetta parity. No indexer for C is installed                |
| C#         | `basic`, `webforms`, `estate`, `rosetta`  | all: the oracle; `rosetta`: Rosetta parity                              |
| Go         | `rosetta`                                 | the oracle; Rosetta parity                                              |
| Java       | `basic`, `service`, `rosetta`             | all: the oracle; `basic`: polyglot fixtures; `rosetta`: Rosetta parity  |
| Python     | `basics`, `pipeline`, `rosetta`, `ledger` | all: the oracle; `basics`: polyglot fixtures; `rosetta`: Rosetta parity |
| Ruby       | `basic`, `cli`, `rosetta`                 | `rosetta`: Rosetta parity. No indexer for Ruby is installed             |
| Rust       | `basics`, `analytics`, `rosetta`          | all: the oracle; `rosetta`: Rosetta parity                              |

`rosetta-manifest.json` at the root describes the canonical program the eight Rosetta implementations share: the nodes, the twelve edges, and the symbols each edge travels through. The parity suite's constants are drawn from it.

The paired "trivial, then incrementally less trivial" programs of the retired accuracy benchmark (`basic`, `layered`, `basics`, `modular`, `pipeline`, `service`, `cli`, `analytics`) found a reader again on 2026-09-27: every one whose language has an indexer carries oracle expectations. C's `basics` and `modular` and Ruby's `basic` and `cli` still have none; `scip-clang` needs a compilation database and `scip-ruby` a Sorbet project, and neither is installed.

## Expected edges

A fixture that has been measured carries an `expected/` directory.

- `compiler-edges.json` is written by `npm run oracle:index -- <fixture>`: every file-to-file edge the language's compiler resolved, with the symbols that carry it, and every document the index contained. Nothing is trimmed. The indexer is chosen by the program's project file: `scip-dotnet` for `.sln` or `.csproj`, `scip-go` for `go.mod`, `rust-analyzer` for `Cargo.toml`, `scip-java` for `pom.xml`, `scip-typescript` for `tsconfig.json`, and `scip-python` for a directory of `.py` files. Documents an indexer produces from outside the program (`scip-go` indexes the test binaries it generates in the build cache) are listed under `outside` and carry no edges, since no source exists for the generator to read.
- `hand-verified-edges.json` is authored: the hops no compiler can see, each with the evidence a reader can check, and `remote: true` where the hop crosses a deployment.

`npm run oracle:compare -- <fixture>` runs the shipped generator over a copy of the fixture and prints where its Dependencies sections disagree with both files. The reports are recorded under "Accuracy Measurement" in [Architectural Decisions](architectural-decisions.mdmd.md): the C# baseline of 2026-09-27 and the tree-sitter result that replaced it, and the same day's baseline of the other scanners.

## The estate fixture

`csharp/estate` is the owner's payment chain in miniature, five .NET Framework 4.8 projects and the SQL behind them; its [README](../../tests/integration/programs/csharp/estate/README.md) draws the chain and says which hops each expectation file covers.

## The ledger program

`python/ledger` is a packaged double-entry ledger written on 2026-09-27 to give the Python adapter something a line scanner cannot pass; its [README](../../tests/integration/programs/python/ledger/README.md) lists the import shapes it exercises and where each one lives. The measurement before and after the tree-sitter adapter is under "Accuracy Measurement" in [Architectural Decisions](architectural-decisions.mdmd.md).

## The WebForms fixture

`csharp/webforms` is the owner's own scenario, stated on 2025-11-06: "we use a lot of ASPX hidden fields to supply server-authored values to the client-side HTML ... sourced from a common C# configuration reference file (we tend to call ours `Globals.cs`) which itself references from a `Web.config` file ... If we can see a change in the web.config expected to propagate to the JS and break something, we've done a damn good job."

The chain is `Web.config → Globals.cs → Default.aspx.cs → Default.aspx → appConfig.js`. Two of its hops became visible with the tree-sitter C# adapter on 2026-09-27: `ConfigurationManager.AppSettings[key]` where the key is held in a constant, and controls declared in `Default.aspx.designer.cs` and used from the code-behind partial class. One is still invisible: JavaScript that reads an element id through a helper function, because the DOM heuristic matches a literal inside `getElementById` or `querySelector('#…')` only.

The simpler form of the same chain, with literal keys and ids, lives in `tests/integration/fixtures/webforms-appsettings` and is exercised by the inspect CLI suite.

## Rules

- Fixtures are copied into a temporary workspace before generation; nothing writes into these directories.
- A fixture holds no third-party code. Vendored repositories were retired precisely because their source could not be committed and had to be cloned at gate time.
- Expectations, when they return with the oracle, are produced by a compiler-backed indexer and never trimmed to fit the analyzer.

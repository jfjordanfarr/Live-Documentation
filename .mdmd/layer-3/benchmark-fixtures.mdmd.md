# Fixture Corpus

_Current as of 2026-09-27._

## Purpose

Describe the sample programs under `tests/integration/benchmarks/fixtures/`: what each one is for, which suite reads it, and which real-world pattern it encodes. The hand-authored scenario workspaces under `tests/integration/fixtures/` (WebForms, Razor, Blazor, queue worker, reflection, PowerShell, the C# XML-doc stress workspace, the SlopCop dogfood workspaces) are described in [Integration Testing](testing-integration-architecture.mdmd.md).

## What is here

Every directory below holds committed source. The seven vendored fixtures that were pinned clones of third-party repositories (ky, libuv, Newtonsoft.Json, mux, OkHttp, Requests, log) were retired on 2026-09-27; see [Architectural Decisions](architectural-decisions.mdmd.md).

| Language   | Fixtures                                 | Read by                                                     |
| ---------- | ---------------------------------------- | ----------------------------------------------------------- |
| TypeScript | `basic`, `layered`, `rosetta`            | `rosetta`: Rosetta parity                                   |
| C          | `basics`, `modular`, `rosetta`           | `rosetta`: Rosetta parity                                   |
| C#         | `basic`, `webforms`, `estate`, `rosetta` | `webforms`, `estate`: the oracle; `rosetta`: Rosetta parity |
| Go         | `rosetta`                                | Rosetta parity                                              |
| Java       | `basic`, `service`, `rosetta`            | `basic`: polyglot fixtures; `rosetta`: Rosetta parity       |
| Python     | `basics`, `pipeline`, `rosetta`          | `basics`: polyglot fixtures; `rosetta`: Rosetta parity      |
| Ruby       | `basic`, `cli`, `rosetta`                | `rosetta`: Rosetta parity                                   |
| Rust       | `basics`, `analytics`, `rosetta`         | `rosetta`: Rosetta parity                                   |

`rosetta-manifest.json` at the root describes the canonical program the eight Rosetta implementations share: the nodes, the twelve edges, and the symbols each edge travels through. The parity suite's constants are drawn from it.

The fixtures with no reader today (`basic`, `layered`, `basics`, `modular`, `pipeline`, `service`, `cli`, `analytics`) were the paired "trivial, then incrementally less trivial" programs of the retired accuracy benchmark. They are candidates for oracle expectations once an indexer for their language is wired in.

## Expected edges

A fixture that has been measured carries an `expected/` directory.

- `compiler-edges.json` is written by `npm run oracle:index -- <fixture>`: every file-to-file edge the language's compiler resolved, with the symbols that carry it, and every document the index contained. Nothing is trimmed. Today the indexer is `scip-dotnet`, so only C# fixtures have one.
- `hand-verified-edges.json` is authored: the hops no compiler can see, each with the evidence a reader can check, and `remote: true` where the hop crosses a deployment.

`npm run oracle:compare -- <fixture>` runs the shipped generator over a copy of the fixture and prints where its Dependencies sections disagree with both files. The report on 2026-09-27, the baseline the tree-sitter adapter replaces, is recorded under "Accuracy Measurement" in [Architectural Decisions](architectural-decisions.mdmd.md).

## The estate fixture

`csharp/estate` is the owner's payment chain in miniature, five .NET Framework 4.8 projects and the SQL behind them; its [README](../../tests/integration/benchmarks/fixtures/csharp/estate/README.md) draws the chain and says which hops each expectation file covers.

## The WebForms fixture

`csharp/webforms` is the owner's own scenario, stated on 2025-11-06: "we use a lot of ASPX hidden fields to supply server-authored values to the client-side HTML ... sourced from a common C# configuration reference file (we tend to call ours `Globals.cs`) which itself references from a `Web.config` file ... If we can see a change in the web.config expected to propagate to the JS and break something, we've done a damn good job."

The chain is `Web.config → Globals.cs → Default.aspx.cs → Default.aspx → appConfig.js`. Two of its hops became visible with the tree-sitter C# adapter on 2026-09-27: `ConfigurationManager.AppSettings[key]` where the key is held in a constant, and controls declared in `Default.aspx.designer.cs` and used from the code-behind partial class. One is still invisible: JavaScript that reads an element id through a helper function, because the DOM heuristic matches a literal inside `getElementById` or `querySelector('#…')` only.

The simpler form of the same chain, with literal keys and ids, lives in `tests/integration/fixtures/webforms-appsettings` and is exercised by the inspect CLI suite.

## Rules

- Fixtures are copied into a temporary workspace before generation; nothing writes into these directories.
- A fixture holds no third-party code. Vendored repositories were retired precisely because their source could not be committed and had to be cloned at gate time.
- Expectations, when they return with the oracle, are produced by a compiler-backed indexer and never trimmed to fit the analyzer.

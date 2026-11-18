# Which languages are within reach, as of 2026-10-15

_A survey gathered on 2026-10-15 for the owner's question of that day ([Turn 7 of the October 15 session](../ChatHistory/2026/10/2026-10-15.1.record.md#turn-7)): "which languages, especially relative to our wasm tree sitter, should we _really_ have support for given how low-hanging of fruit they are?" It records what existed on its date, with a source for every claim, and decides nothing; the last section is the agent's reading and not a decision._

## What is already on disk

- The engine depends on `@vscode/tree-sitter-wasm` 0.3.0 and `web-tree-sitter` 0.27 ([the engine's manifest](../../.mdmd/layer-4/packages/engine/package.json.mdmd.md)). The bundle's `wasm/` directory holds sixteen grammars: bash, c-sharp, cpp, css, go, ini, java, javascript, php, powershell, python, regex, ruby, rust, tsx, typescript.
- Read through tree-sitter today: C#, Python, Java, Go and Rust. TypeScript and JavaScript go through the TypeScript compiler API, which resolves modules as the compiler does, which a grammar cannot. Hand-written scanners: C (registered for `.c` and `.h` only, as [the TH04 probe](../Probes/2026-10-15/live-docs-over-th04/README.md) found), Ruby, PowerShell, SQL, ASP.NET markup, .NET configuration, HTML, CSS and JSON ([the vision's status](../../.mdmd/layer-1/vision.mdmd.md#where-this-stands)).
- On disk and unused: cpp, bash, php, powershell, ruby, css, ini, regex, javascript. There is no separate C grammar in the bundle; the C++ grammar parses C.
- The rule in force: "C, Ruby and PowerShell keep their hand-written scanners until an oracle exists to measure a replacement" ([the vision's order of work](../../.mdmd/layer-1/vision.mdmd.md#where-this-stands), step 2), and "nothing grades itself" (AGENTS.md).

## What the world uses

- GitHub's Octoverse 2025, by distinct monthly contributors in August 2025: TypeScript first (2,636,006, up 66.63% in a year), Python, JavaScript, Java, C#, then, in its top-ten chart without figures, PHP, Shell, C++, HCL and Go ([the report](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/)). Fastest growing above a thousand contributors: Luau, Typst, Astro, Blade, TypeScript.
- Stack Overflow's 2026 survey, languages used by all respondents: JavaScript 62.0%, SQL 58.4%, HTML/CSS 58.2%, Python 58.0%, Bash/Shell 51.3%, TypeScript 43.8%, Java 27.6%, C# 27.1%, PowerShell 24.6%, C++ 24.3% ([the technology page](https://survey.stackoverflow.co/2026/technology)).
- The owner's own estates are .NET Framework with WebForms, WCF, SQL Server and PowerShell ([owner.md](../Memory/owner.md)), every one of them read today.

## Oracles that exist

The SCIP project lists indexers for TypeScript, Python, Java (with Scala and Kotlin), Go, Rust (rust-analyzer), C# and Visual Basic (scip-dotnet), C and C++ (scip-clang, which needs a compilation database), Ruby (scip-ruby, on Sorbet), PHP (scip-php) and Dart ([the SCIP repository](https://github.com/sourcegraph/scip)); Sourcegraph's page marks scip-clang, scip-ruby and scip-dotnet generally available ([precise code navigation](https://sourcegraph.com/docs/code-search/code-navigation/precise_code_navigation)). This repository's oracle already runs six of them ([the decisions log](../../.mdmd/layer-3/architectural-decisions.mdmd.md)). Bash and PowerShell have no indexer; their oracle would be hand-verified fixtures, the vision's third tier.

## Side by side

| Language | Octoverse 2025 | Stack Overflow 2026 | Read today by | Grammar on disk | Oracle | What it would cost |
| --- | --- | --- | --- | --- | --- | --- |
| C and C++ | C++ in the top ten | C++ 24.3% | a hand scanner, C only | cpp | scip-clang; a hand fixture | an adapter over the grammar, a C++ sample, the fixture |
| Bash and shell | Shell in the top ten | 51.3% | nothing | bash | a hand fixture | an adapter: `source` and `.` as wires, scripts run by name, every script a program |
| PHP | in the top ten | below the top ten | nothing | php | scip-php | an adapter: `require`, `include`, `use`; a sample |
| Ruby | | | a hand scanner | ruby | scip-ruby | a replacement measured on the rosetta sample |
| PowerShell | | 24.6% | a hand scanner | powershell | a hand fixture | a replacement measured on the samples |
| SQL | | 58.4% | a hand scanner | none in the bundle | a hand fixture | a grammar package, if ever |
| HCL, YAML | HCL in the top ten | | nothing | none in the bundle | | a grammar package each; configuration for the World Map's deployment shapes, not code |
| Kotlin, Swift, Dart, Scala, Lua | | | nothing | none in the bundle | scip-java for Kotlin and Scala; scip-dart | a grammar package each, and a sample |

## The agent's judgement

Not a decision. In order of fruit over cost:

1. **C and C++ through the C++ grammar on disk.** It mends a promise the adapter's own docstring makes, costs no dependency, and has an oracle: scip-clang where a compilation database exists, and a hand-verified fixture otherwise, which the vision's rule allows as the measure for replacing a scanner. The TH04 probe is a ready stress test for the result.
2. **Bash.** Half of all respondents use it, the grammar is on disk, and its wires are few and plain. No indexer exists, so the fixture is the oracle. Every script is a program, as every `.ps1` is today.
3. **PHP.** In GitHub's top ten with a grammar on disk and an indexer, but no sample program here and no need of the owner's; worth doing when someone brings a PHP repository.
4. **Ruby and PowerShell on the grammars.** Each replaces a scanner the vision already marks as provisional; Ruby's measure is scip-ruby on the rosetta sample, PowerShell's a hand fixture.
5. **Not in the bundle.** Kotlin, Swift, Dart, Scala and Lua each need a grammar package and a sample before they are low-hanging; HCL and YAML are the World Map's concern, as deployment facts rather than code, and belong to that plan.

What not to do: add a language ahead of its sample program and its oracle. A language with a grammar and no measure is a scanner by another name.

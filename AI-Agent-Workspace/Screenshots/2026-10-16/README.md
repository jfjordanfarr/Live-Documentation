# October 16, 2026: discovery reads every suffix anywhere, and C and C++ by the grammar

Pictures of the built Explorer after the pass the owner gave the go on [Turn 10 of the October 15 session](../../ChatHistory/2026/10/2026-10-15.1.record.md#turn-10): the shipped discovery defaults became every file an adapter can read, anywhere, with an `exclude` option and this repository excluding its agent workspace; the C and C++ adapter was rewritten over the tree-sitter grammar with its include rule chosen by measurement against scip-clang; and the Local Map's card stopped counting its internals row among the hidden symbols. Taken over this repository's own bundle, served from `dist/explorer`.

## The suffix-anywhere defaults, the C++ sample, and the card's count

| What is shown | Picture |
| --- | --- |
| Knowledge Sources, the bundle's shape: 722 files after the root's tooling files, the packages' project files, the C++ rosetta sample and the include fixture joined, and the agent workspace stayed out | [01-knowledge-sources-shape.png](suffix-anywhere-and-cpp/01-knowledge-sources-shape.png) |
| The entry points' Tooling inputs group opened: `eslint.config.js`, `tsconfig.base.json`, `tsconfig.json`, `vitest.config.ts`, `slopcop.config.json` and every package's `tsconfig.json` and `package.json` among the tooling, where before the pass none of the root's files had a doc | [02-tooling-inputs-with-the-root-files.png](suffix-anywhere-and-cpp/02-tooling-inputs-with-the-root-files.png) |
| `packages/engine/src/live-docs` opened in the Local Map with tests shown: each test card reads "No public symbols" with no reveal beneath it, where before it read "+1 symbols" for the internals row | [03-directory-with-test-cards.png](suffix-anywhere-and-cpp/03-directory-with-test-cards.png) |
| The `graph.test.ts` card at reading size: no public symbols, no reveal, its connections outside the view counted | [04-test-card-without-a-reveal.png](suffix-anywhere-and-cpp/04-test-card-without-a-reveal.png) |
| The C++ rosetta sample's `main.cpp` pinned: its includes of `models.hpp` and `processor.hpp` resolved by the new adapter, the symbols it uses wired to it (`Record`, `Report`, `create_record`; `run_processor`, `summarize_report`, `free_report`), `rosetta_main` and `main` offered | [05-cpp-rosetta-main-pinned.png](suffix-anywhere-and-cpp/05-cpp-rosetta-main-pinned.png) |

By eye: the tooling group holds the root's files; the test cards carry no reveal; the C++ wires land. `.live-docs.config.json` is a tooling entry by the `*.config.json` rule, and `.devcontainer/devcontainer.json` and `.vscode/settings.json` by their place, a rule added the same night when the hand found them unreachable from any entry.

# .devcontainer/post-create.sh

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: .devcontainer/post-create.sh
- Generated At: 2026-10-22T00:39:32.670Z

## Authored
### Purpose
Sets up the development container once it is created: lets git work on the bind-mounted checkout, installs and builds the workspace, and installs the SCIP indexers the oracle measures the adapters against.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Run by the dev container as its `postCreateCommand` in `.devcontainer/devcontainer.json`, after the image and the language toolchains that file's features install; the README beside it lists what it installs and how to check it. It stops at the first failing step (`set -e`), except scip-dotnet's install, whose failure is taken to mean it is already there.
- The indexers serve `npm run oracle:index` alone, which picks the one a sample program's files call for (its project file, its compilation database or its `.py` files) to write the program's compiler-resolved edges. Nothing Live Documentation ships needs them, by the owner's rule when scip-clang was added: "use an install only if it's for this project and not at runtime for users of Live Documentation" ([Turn 8 of the October 15 session](../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-8)). scip-typescript is not installed here; it is a development dependency, run through `npx`. scip-java (0.11.2, bootstrapped by Coursier) and scip-clang (v0.4.0, checked against its SHA-256) are pinned; scip-go (`@latest`), scip-python and scip-dotnet take whatever version is current when the container is built.
- `safe.directory '*'` lets git trust every repository: a checkout bind-mounted from Windows belongs to another user than the container's, which git refuses since 2.35.2. The wildcard, rather than the workspace's own path, was settled on 2026-02-03 after the owner questioned its breadth and asked for research, when benchmark fixtures cloned vendor repositories inside the checkout, each needing an entry of its own ([Turns 10 to 14 of the second February 3 session](../../../AI-Agent-Workspace/ChatHistory/2026/02/Summarized/2026-02-03.2.SUMMARIZED.md#turn-10)); those fixtures were retired on 2026-09-27, and the comment no longer names them.
- Began on 2026-02-03 with the dev container, to unblock scip-java and scip-python, which failed on Windows ([Turn 11 of the first February 3 session](../../../AI-Agent-Workspace/ChatHistory/2026/02/Summarized/2026-02-03.1.SUMMARIZED.md#turn-11)). It also installed the libraries the VS Code test harness needed, from that evening until the harness was retired on 2026-09-27; scip-java became a pinned bootstrap on 2026-02-17, and scip-clang was added on 2026-10-16 to measure the C and C++ include rule. Gained a Live Doc on 2026-10-22 ([Turn 8 of the October 21 session](../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

# `.devcontainer/devcontainer.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `.devcontainer/devcontainer.json`
- Entry: tooling
- Generated At: 2026-11-19T21:10:08.288Z

## Authored
### Purpose
The development container this repository is worked on in: the Node 26 image, the language toolchains the oracle's indexers need, the post-create script that installs the indexers, and the editor's extensions and settings.

### Notes
- Each toolchain feature names the indexer it serves: .NET for scip-dotnet, Java with Maven and Gradle for scip-java, Go for scip-go, Python for scip-python, Rust for rust-analyzer, PowerShell for the oracle's PowerShell parser (since 2026-10-16; the PowerShell adapter itself needs none); scip-clang and the rest are installed by `post-create.sh`. The host requirements are sized for SCIP indexing, which is CPU-bound. JSON with comments, which the JSON adapter reads since 2026-10-16.
- Since 2026-10-22 the container formats nothing on save and installs no Prettier extension: nothing formats TypeScript here, so that hand-aligned whitespace stays as written, and lint enforces correctness alone ([the decision](../../../.mdmd/layer-3/architectural-decisions.mdmd.md#no-formatter-for-typescript-lint-for-correctness-on-eslint-10-and-the-tsconfig-off-baseurl-and-node10-recorded-2026-10-22)); until then `editor.formatOnSave` was on and the Prettier extension listed, and whichever formatter an editor chose would have collapsed the alignment.
- Began on 2026-02-03 as a Codespaces-compatible container; gained a Live Doc on 2026-10-16 ([Turn 9 of the October 15 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/2026-10-15.1.record.md#turn-9)).
- Since 2026-11-17 a second configuration stands beside it, `wsl2-graphics-card/devcontainer.json`: this one plus the two run arguments that pass the host's graphics card in under WSL2, for the browser tests ([Turn 1 of the November 17 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-1)). This one stays the default because those arguments break a container on a host without the device. `scripts/devcontainer.test.ts` fails when the two differ in anything else, so a change here is made there too.
- Since 2026-11-17 the coding agents' own folders stand on two named volumes, `live-documentation-claude` at `~/.claude` and `live-documentation-codex` at `~/.codex`, with `CLAUDE_CONFIG_DIR` set to the first so that the file Claude Code writes beside its folder is inside it. Until then both lived in the container's own layer, and the rebuild the graphics card needed would have ended every chat and sign-in in the container. The owner's condition was that the configuration be no less portable ([Turn 4 of the November 17 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-4)): a named volume is created empty on first use by any Docker host, and Claude Code's own documentation gives this mount and this variable for dev containers and says they apply in GitHub Codespaces. The names are fixed, not made per container, so that the two configurations share them and changing between them keeps a sign-in. Docker mounts a new volume as root's, hence `onCreateCommand`, which is finished before an editor attaches; `postCreateCommand` may still be running when it does.
- Since the same day `node_modules` is a volume too, mounted over the workspace's folder of that name and named for the container (`${devcontainerId}`), since its content belongs to one checkout. The owner had called the gate's time a blocker; measuring it showed that the workspace, a folder on a Windows drive reached through 9p, costs 4 to 6 ms for each file opened against 0.01 ms on the container's own disk, and that a tool's start is thousands of such files in `node_modules`: the browser tests took 54 s to find their cases from the workspace and 5 s from a checkout on the container's disk, lint 239 s against 68, the unit tests 203 s against 88 ([the measurements](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#work-notes-after-turn-6-what-the-mount-costs-and-what-a-worker-costs)). The volume moves the dependencies and nothing of the owner's; the rest of the workspace is still reached through the host, and moving the whole working copy to the Linux side is the larger step, not taken.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `name` {#symbol-name}
- Type: key

#### `image` {#symbol-image}
- Type: key

#### `features` {#symbol-features}
- Type: key

#### `features:ghcr.io/devcontainers/features/dotnet:2` {#symbol-featuresghcriodevcontainersfeaturesdotnet2}
- Type: key

#### `features:ghcr.io/devcontainers/features/dotnet:2:version` {#symbol-featuresghcriodevcontainersfeaturesdotnet2version}
- Type: key

#### `features:ghcr.io/devcontainers/features/java:1` {#symbol-featuresghcriodevcontainersfeaturesjava1}
- Type: key

#### `features:ghcr.io/devcontainers/features/java:1:version` {#symbol-featuresghcriodevcontainersfeaturesjava1version}
- Type: key

#### `features:ghcr.io/devcontainers/features/java:1:installMaven` {#symbol-featuresghcriodevcontainersfeaturesjava1installmaven}
- Type: key

#### `features:ghcr.io/devcontainers/features/java:1:installGradle` {#symbol-featuresghcriodevcontainersfeaturesjava1installgradle}
- Type: key

#### `features:ghcr.io/devcontainers/features/go:1` {#symbol-featuresghcriodevcontainersfeaturesgo1}
- Type: key

#### `features:ghcr.io/devcontainers/features/go:1:version` {#symbol-featuresghcriodevcontainersfeaturesgo1version}
- Type: key

#### `features:ghcr.io/devcontainers/features/python:1` {#symbol-featuresghcriodevcontainersfeaturespython1}
- Type: key

#### `features:ghcr.io/devcontainers/features/python:1:version` {#symbol-featuresghcriodevcontainersfeaturespython1version}
- Type: key

#### `features:ghcr.io/devcontainers/features/rust:1` {#symbol-featuresghcriodevcontainersfeaturesrust1}
- Type: key

#### `features:ghcr.io/devcontainers/features/rust:1:version` {#symbol-featuresghcriodevcontainersfeaturesrust1version}
- Type: key

#### `features:ghcr.io/devcontainers/features/powershell:1` {#symbol-featuresghcriodevcontainersfeaturespowershell1}
- Type: key

#### `features:ghcr.io/devcontainers/features/powershell:1:version` {#symbol-featuresghcriodevcontainersfeaturespowershell1version}
- Type: key

#### `features:ghcr.io/devcontainers/features/github-cli:1` {#symbol-featuresghcriodevcontainersfeaturesgithub-cli1}
- Type: key

#### `mounts` {#symbol-mounts}
- Type: key

#### `containerEnv` {#symbol-containerenv}
- Type: key

#### `containerEnv:CLAUDE_CONFIG_DIR` {#symbol-containerenvclaude_config_dir}
- Type: key

#### `onCreateCommand` {#symbol-oncreatecommand}
- Type: key

#### `postCreateCommand` {#symbol-postcreatecommand}
- Type: key

#### `customizations` {#symbol-customizations}
- Type: key

#### `customizations:vscode` {#symbol-customizationsvscode}
- Type: key

#### `customizations:vscode:extensions` {#symbol-customizationsvscodeextensions}
- Type: key

#### `customizations:vscode:settings` {#symbol-customizationsvscodesettings}
- Type: key

#### `customizations:vscode:settings:terminal.integrated.defaultProfile.linux` {#symbol-customizationsvscodesettingsterminalintegrateddefaultprofilelinux}
- Type: key

#### `customizations:vscode:settings:editor.formatOnSave` {#symbol-customizationsvscodesettingseditorformatonsave}
- Type: key

#### `customizations:vscode:settings:typescript.tsdk` {#symbol-customizationsvscodesettingstypescripttsdk}
- Type: key

#### `customizations:codespaces` {#symbol-customizationscodespaces}
- Type: key

#### `customizations:codespaces:openFiles` {#symbol-customizationscodespacesopenfiles}
- Type: key

#### `hostRequirements` {#symbol-hostrequirements}
- Type: key

#### `hostRequirements:cpus` {#symbol-hostrequirementscpus}
- Type: key

#### `hostRequirements:memory` {#symbol-hostrequirementsmemory}
- Type: key

#### `hostRequirements:storage` {#symbol-hostrequirementsstorage}
- Type: key

#### `workspaceMount` {#symbol-workspacemount}
- Type: key

#### `workspaceFolder` {#symbol-workspacefolder}
- Type: key

#### `remoteUser` {#symbol-remoteuser}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

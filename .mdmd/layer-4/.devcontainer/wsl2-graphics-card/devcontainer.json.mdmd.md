# `.devcontainer/wsl2-graphics-card/devcontainer.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `.devcontainer/wsl2-graphics-card/devcontainer.json`
- Entry: tooling
- Generated At: 2026-11-19T21:10:08.315Z

## Authored
### Purpose
The development container with the host's graphics card passed in, for Windows with Docker Desktop's WSL2 engine: the ordinary configuration plus the device and the library folder through which a Linux process reaches the Windows graphics driver.

### Notes
- Written on 2026-11-17 at the owner's ask that the card be made available to the container for the browser tests ([Turn 1 of the November 17 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-1)). The two run arguments, `--device=/dev/dxg` and `--volume=/usr/lib/wsl:/usr/lib/wsl:ro`, are the form proven in a sibling container that day; Docker Desktop's `--gpus all` passed the device and NVIDIA's compute libraries without Direct3D, which nothing can draw through ([the measurements](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#work-notes-turn-2)).
- A second configuration, and not two more lines in the first, because Docker refuses to create a container whose device does not exist: the arguments would break the container on GitHub Codespaces, macOS and Linux, which the first configuration has served since 2026-02-03. The specification's portable `hostRequirements.gpu: "optional"` leads only to `--gpus all`. VS Code asks which configuration to use when a folder has more than one.
- It repeats the first configuration because a devcontainer configuration cannot extend another; `scripts/devcontainer.test.ts` fails when the two differ in anything but the name and the run arguments, or when the copy of the feature lock beside this file differs from the first's. The comments that explain each entry are in the first file alone.
- Nothing in it names the card's maker: under WSL2 every card is reached through Direct3D 12. What uses the card is `tests/e2e/browser-launch.ts`, by looking for the device and the libraries.
- It carries the first configuration's two volumes for the coding agents' folders under the same names, so that changing between the two configurations keeps their sign-ins and past chats ([Turn 4 of the November 17 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-4)).
- It carries the first configuration's volume for `node_modules` as well; being named for the container, each configuration fills its own.

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

#### `runArgs` {#symbol-runargs}
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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.devcontainer/README.md`](../../../../.devcontainer/README.md)
<!-- LIVE-DOC:END Cited By -->

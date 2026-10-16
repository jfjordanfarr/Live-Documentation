# .devcontainer/devcontainer.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: .devcontainer/devcontainer.json
- Entry: tooling
- Generated At: 2026-10-16T01:11:27.772Z

## Authored
### Purpose
The development container this repository is worked on in: the Node 22 image, the language toolchains the oracle's indexers need, the post-create script that installs the indexers, and the editor's extensions and settings.

### Notes
- Each toolchain feature names the indexer it serves: .NET for scip-dotnet, Java with Maven and Gradle for scip-java, Go for scip-go, Python for scip-python, Rust for rust-analyzer; PowerShell is for the generator's own adapter; scip-clang and the rest are installed by `post-create.sh`. The host requirements are sized for SCIP indexing, which is CPU-bound. JSON with comments, which the JSON adapter reads since 2026-10-16.
- Began on 2026-02-03 as a Codespaces-compatible container; gained a Live Doc on 2026-10-16 ([Turn 9 of the October 15 session](../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

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

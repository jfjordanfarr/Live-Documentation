# Live Documentation Development Container

This devcontainer provides a fully-configured Linux environment for developing and testing Live Documentation, including the SCIP indexers the oracle uses to write a sample program's expected edges.

## Compatibility

**This is the same configuration file for both environments:**

- ✅ **VS Code Dev Containers** (local Docker)
- ✅ **GitHub Codespaces** (cloud)

No special setup is required — the same `.devcontainer/devcontainer.json` works in both contexts. GitHub Codespaces uses the Dev Containers specification internally.

## Quick Start

### VS Code Dev Containers (Local Docker)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open this repository in VS Code
4. Click "Reopen in Container" when prompted (or use Command Palette → "Dev Containers: Reopen in Container")
5. Wait for container build and post-create setup (~5-10 minutes on first run)

### GitHub Codespaces (Cloud)

1. Navigate to this repository on GitHub
2. Click "Code" → "Codespaces" → "Create codespace on main"
3. Wait for the codespace to initialize (~3-5 minutes with prebuilds enabled)

## What's Included

### Base Environment

- **Node.js 26** (matches `.nvmrc`)
- **npm 11**, one pinned release that post-create.sh installs over the npm 11.20 that comes with Node 26, so that every container writes the lock alike. npm 10.9, which came with Node 22 until 2026-11-19, cannot resolve this project's dependency tree once vite is past 8.3.1 (it stops with "Cannot read properties of null (reading 'edgesOut')"), so `package-lock.json` is written by npm 11. npm 10 still installs from that lock with `npm ci`, which is what the GitHub workflows do.
- **TypeScript** (project dependency)
- **npm workspaces** pre-configured
- **Playwright Chromium** and its Linux dependencies, installed for the Explorer's browser tests

### Language Toolchains

| Language | Version                 | Purpose                         |
| -------- | ----------------------- | ------------------------------- |
| .NET     | 10.0 (LTS)              | scip-dotnet for C# fixtures     |
| Java     | 21 (LTS) + Maven/Gradle | scip-java for Java fixtures     |
| Go       | latest                  | scip-go for Go fixtures         |
| Python   | 3.12                    | scip-python for Python fixtures |
| Rust     | stable                  | rust-analyzer for Rust fixtures |
| PowerShell | 7 (latest)            | PowerShell's own parser for PowerShell fixtures, through `oracle:index`; generating docs needs no PowerShell |

### SCIP Indexers (installed via post-create.sh)

| Indexer         | Installation       | Command                     |
| --------------- | ------------------ | --------------------------- |
| scip-typescript | npm (project dep)  | `npx scip-typescript index` |
| scip-dotnet     | dotnet global tool | `scip-dotnet index`         |
| scip-java       | Coursier           | `scip-java index`           |
| scip-go         | go install         | `scip-go`                   |
| scip-python     | npm global         | `scip-python index`         |
| scip-clang      | release binary     | `scip-clang --compdb-path=compile_commands.json` |
| rust-analyzer   | rustup component   | `rust-analyzer scip .`      |

## Verifying the Environment

After container creation, verify everything works:

```bash
# Run the full validation suite
npm run safe:commit

# Or test SCIP indexers individually
npx scip-typescript --version
scip-dotnet --version
scip-go --version
scip-python --version
rust-analyzer --version
```

## The SCIP Indexers

The indexers above are the compiler-backed oracle for measuring the analyzers: they resolve symbols with each language's own compiler, so their output can be compared with what Live Documentation generates without either side grading itself. `npm run oracle:index -- <fixture>` picks the indexer from the fixture's project file (`.sln` or `.csproj`, `go.mod`, `Cargo.toml`, `pom.xml`, `tsconfig.json`) or, for Python, from the presence of `.py` files. `scip-dotnet` is built for an older runtime than the container's .NET 10, so the script runs it with `DOTNET_ROLL_FORWARD=Major`; do the same when running it by hand.

## The Engine's PowerShell Grammar

`packages/engine/grammars/powershell/build.sh` rebuilds the committed `tree-sitter-powershell.wasm` from the pinned upstream grammar and this project's patch, after running both their corpus tests. It needs what the container already has: `git`, Node, the base image's C compiler (for the native parser the tests build), and the `tree-sitter-cli` that `npm install` puts in `node_modules`. The CLI compiles the wasm with wasi-sdk 34 and binaryen 132, which it downloads into `~/.cache/tree-sitter` on the first build; it needs no Emscripten, so `post-create.sh` installs nothing for it.

## The Host's Graphics Card (Windows, WSL2)

A headless Chromium draws WebGL in software unless it is given a graphics card, and the Explorer's 3D pictures are WebGL. In software this repository's own 3D picture draws at about four frames a second and keeps most of the machine's threads busy; on a card it draws at about fifty. The browser tests wait for such pictures to come to rest, so the card is most of the difference between a short run and a long one.

On Windows with Docker Desktop's WSL2 engine, reopen the folder with the second configuration, **Live Documentation Dev (WSL2 graphics card)**, which is [wsl2-graphics-card/devcontainer.json](wsl2-graphics-card/devcontainer.json). VS Code asks which configuration to use when a folder has more than one ("Dev Containers: Rebuild and Reopen in Container"). It is the same container plus two run arguments:

| Argument | What it passes in |
| --- | --- |
| `--device=/dev/dxg` | WSL2's door to the Windows graphics driver |
| `--volume=/usr/lib/wsl:/usr/lib/wsl:ro` | Microsoft's Direct3D 12 libraries for Linux and the card's own driver files |

It works for any card Windows drives, since the path is Direct3D and not a maker's own Linux driver. Docker's `--gpus all` is not enough: on Docker Desktop it passes the device and NVIDIA's compute libraries, without Direct3D.

Nothing else is configured by hand. `post-create.sh` installs Mesa's EGL when it finds the device, and `tests/e2e/browser-launch.ts` launches the browser on the card when it finds the device and the libraries. The card draws WebGL and nothing else: the rest of the page, the 2D map among it, is still put together on the processor, which is quicker for it and is how the tests' timings were set. To check, from inside the container:

```bash
ls -la /dev/dxg /usr/lib/wsl/lib/libd3d12.so
npx playwright test --config tests/e2e/playwright.config.ts force-graph-identity
```

The run's first line names the renderer: `D3D12 (...)` with the card's name, or `SwiftShader` in software. A run stops at once when the card is there and the browser is not drawing on it. To run on the processor although a card is there, as GitHub Codespaces and CI do, set `LIVE_DOCS_BROWSER_RENDERER=software`.

**Playwright is pinned at exactly 1.61.1** for the card, in `package.json` and in Dependabot's configuration. The headless Chromium of Playwright 1.62 and later (Chromium 151 on) finds no EGL configuration it can use in Mesa's `d3d12` driver, gives up on the card and draws in software; Chromium 149, Playwright 1.61.1's, reaches it (measured on November 20, 2026, with each release's own browser: [the record](../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/playwright-upgrade/README.md#3-chromium-151-and-later-lose-the-graphics-card)). Playwright before 1.60 cannot install its browser under Node 26 at all: its unpacking stalls. The pin is lifted when a later release's browser draws on the card under the suite's launch, which that record's `gpu-probe.ts` shows in one command.

The ordinary configuration stays the default because Docker refuses to create a container whose device does not exist, which would break it everywhere but Windows.

## What a Rebuild Keeps

Rebuilding the container discards everything in it but the workspace. Two named Docker volumes keep the coding agents' own folders across rebuilds, in both configurations:

| Volume | Mounted at | What it keeps |
| --- | --- | --- |
| `live-documentation-claude` | `~/.claude` | Claude Code's sign-in, settings and past chats |
| `live-documentation-codex` | `~/.codex` | Codex's sign-in, settings and past chats |

`CLAUDE_CONFIG_DIR` points Claude Code at its folder, so that the one file it otherwise writes beside the folder (`~/.claude.json`) is kept as well. Nothing is set up by hand: Docker creates a named volume empty on first use, on any host and in GitHub Codespaces, and someone who uses neither agent never notices the two. They hold sign-in tokens and stay on your own Docker host. To start clean, remove them while no container uses them:

```bash
docker volume rm live-documentation-claude live-documentation-codex
```

## Dependencies on the Container's Own Disk

`node_modules` is a third volume, named for the container, mounted over the workspace's folder of that name and filled by `post-create.sh`. It is there for speed. Where the workspace is a folder on a Windows drive, each file a tool opens in it is a round trip to Windows: 4 to 6 ms each, against 0.01 ms on the container's own disk (measured on this repository, 2026-11-17). A tool's start is thousands of such files in `node_modules`:

| | Workspace's `node_modules` on a Windows drive | On the container's disk |
| --- | --- | --- |
| The browser tests finding their cases (`npx playwright test --list`) | 54 to 64 s | 5 s |
| One spec file | 44 s | 3 s |
| `npm run lint` | 239 s | 68 s |
| `npm run test:unit` | 203 s | 88 s |

The second column was measured with the whole checkout on the container's disk, so the volume alone gives somewhat less. The `node_modules` folder that an earlier container left on the host is no longer read and can be deleted from there. After changing `package-lock.json`, run `npm install` in the container as before.

Where the working copy is a folder on a Windows drive, the rest of the workspace is reached through the host as well. The faster arrangement on Windows is to keep the whole working copy on the Linux side, in a folder inside a WSL distribution, and to open that folder in the container. Measured on this repository on 2026-11-18, after it moved from a Windows drive to a folder in an Ubuntu distribution: the gate's stages before the browser took about four minutes where they had taken eight and a half, and the browser suite 72 minutes at one worker where it had taken 98, so the whole gate took 74 minutes against about 107.

A working copy moved by hand must carry its build output along or leave the compiler's build records behind too. The first container made from the moved copy failed at its build because the records had travelled without the `dist` folders they describe; since that day each package keeps its record inside `dist`, so the two cannot part.

## Troubleshooting

### scip-java fails on first run

scip-java uses Coursier to download dependencies. If it fails, try:

```bash
cs update
cs install scip-java
```

### Slow container startup

The first build downloads ~2GB of language toolchains. Subsequent rebuilds use cached layers.

## GitHub Codespaces Notes

- Recommended machine type: **4-core** (specified in `hostRequirements`)
- Prebuilds: Consider enabling [Codespaces prebuilds](https://docs.github.com/en/codespaces/prebuilding-your-codespaces) for faster startup
- Secrets: No secrets are required for basic development

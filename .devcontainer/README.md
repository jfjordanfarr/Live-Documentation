# Live Documentation Development Container

This devcontainer provides a fully-configured Linux environment for developing and testing Live Documentation, including all SCIP indexers needed for benchmark fixture generation.

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
- **Node.js 22** (matches `.nvmrc`)
- **TypeScript** (project dependency)
- **npm workspaces** pre-configured

### Language Toolchains
| Language | Version | Purpose |
|----------|---------|---------|
| .NET | 10.0 (LTS) | scip-dotnet for C# fixtures |
| Java | 21 (LTS) + Maven/Gradle | scip-java for Java fixtures |
| Go | latest | scip-go for Go fixtures |
| Python | 3.12 | scip-python for Python fixtures |
| Rust | stable | rust-analyzer for Rust fixtures |

### SCIP Indexers (installed via post-create.sh)
| Indexer | Installation | Command |
|---------|--------------|---------|
| scip-typescript | npm (project dep) | `npx scip-typescript index` |
| scip-dotnet | dotnet global tool | `scip-dotnet index` |
| scip-java | Coursier | `scip-java index` |
| scip-go | go install | `scip-go` |
| scip-python | npm global | `scip-python index` |
| rust-analyzer | rustup component | `rust-analyzer scip .` |

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

## Regenerating Benchmark Fixtures

With all SCIP indexers available, you can regenerate expected.json files with compiler-backed ground truth:

```bash
# Regenerate all fixtures with SCIP oracles
npm run test:benchmarks -- --write

# Or regenerate a specific fixture
npx tsx scripts/fixture-tools/regenerate-benchmarks.ts --fixture java-rosetta --write
```

## Troubleshooting

### scip-java fails on first run
scip-java uses Coursier to download dependencies. If it fails, try:
```bash
cs update
cs install scip-java
```

### Python fixtures fail
Ensure Python dependencies are installed in a virtualenv:
```bash
cd tests/integration/benchmarks/fixtures/python/requests
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
scip-python index .
```

### Slow container startup
The first build downloads ~2GB of language toolchains. Subsequent rebuilds use cached layers.

## GitHub Codespaces Notes

- Recommended machine type: **4-core** (specified in `hostRequirements`)
- Prebuilds: Consider enabling [Codespaces prebuilds](https://docs.github.com/en/codespaces/prebuilding-your-codespaces) for faster startup
- Secrets: No secrets are required for basic development

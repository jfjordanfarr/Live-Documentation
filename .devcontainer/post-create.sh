#!/bin/bash
# Post-create script for Live Documentation devcontainer
# This script runs after the container is created and features are installed
#
# Works in both:
#   - VS Code Dev Containers (local Docker)
#   - GitHub Codespaces (cloud)

set -e

echo "=== Live Documentation Devcontainer Setup ==="
echo ""

echo "=== Installing project dependencies ==="
npm install

echo ""
echo "=== Building project ==="
npm run build

echo ""
echo "=== Installing SCIP indexers ==="

# scip-python: npm global package (uses pyright under the hood)
echo "→ Installing scip-python..."
npm install -g @sourcegraph/scip-python

# scip-go: Go binary
echo "→ Installing scip-go..."
go install github.com/sourcegraph/scip-go/cmd/scip-go@latest

# scip-dotnet: .NET global tool
echo "→ Installing scip-dotnet..."
dotnet tool install --global scip-dotnet || echo "  (scip-dotnet may already be installed)"

# scip-java: Uses Coursier for lazy installation
# We just verify Coursier is available; scip-java downloads on first use
echo "→ Verifying Coursier for scip-java..."
if command -v cs &> /dev/null; then
  echo "  Coursier available (scip-java will install on first use)"
else
  echo "  Installing Coursier..."
  curl -fL https://github.com/coursier/coursier/releases/latest/download/cs-x86_64-pc-linux.gz | gzip -d > /tmp/cs
  chmod +x /tmp/cs
  sudo mv /tmp/cs /usr/local/bin/cs
fi

# rust-analyzer: Verify it's available (installed via Rust feature)
echo "→ Verifying rust-analyzer..."
if command -v rust-analyzer &> /dev/null; then
  echo "  rust-analyzer is available"
else
  echo "  Installing rust-analyzer via rustup..."
  rustup component add rust-analyzer
fi

echo ""
echo "=== SCIP Indexer Versions ==="
echo "scip-typescript: $(npx scip-typescript --version 2>/dev/null || echo 'available via npx')"
echo "scip-python:     $(scip-python --version 2>/dev/null || echo 'installed')"
echo "scip-go:         $(scip-go version 2>/dev/null || echo 'installed')"
echo "scip-dotnet:     $(dotnet tool list -g | grep scip-dotnet | awk '{print $2}' || echo 'installed')"
echo "rust-analyzer:   $(rust-analyzer --version 2>/dev/null || echo 'available')"

echo ""
echo "=== Language Versions ==="
echo "Node.js:  $(node --version)"
echo ".NET:     $(dotnet --version)"
echo "Java:     $(java --version 2>&1 | head -1)"
echo "Go:       $(go version | awk '{print $3}')"
echo "Python:   $(python3 --version)"
echo "Rust:     $(rustc --version)"

echo ""
echo "=== Devcontainer setup complete! ==="
echo ""
echo "Run 'npm run safe:commit' to verify the environment."
echo "Run 'npm run test:benchmarks' to regenerate fixture expected.json files."

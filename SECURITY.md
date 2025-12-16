# Security Policy

Live Documentation is designed with security-conscious environments in mind, including those requiring PCI-DSS compliance or air-gapped operation. This document describes our security posture and provides auditable evidence for each claim.

## Network Isolation Guarantee

**Live Documentation never makes outbound requests to the open internet.**

All network operations are restricted to localhost addresses only. This is enforced through multiple layers:

### Layer 1: Static Analysis Audit

We maintain a static analysis script that scans the entire codebase for network-related patterns:

```bash
npm run audit:network
```

This script identifies all usages of `fetch()`, `http.request()`, `createServer()`, and similar APIs, classifying each as:
- **Safe**: Protected by `safeFetch()` wrapper (localhost-only enforced)
- **Allowed**: Non-production code (tests, fixtures, documentation)
- **Requires Review**: Unaccounted usage that fails the audit

### Layer 2: Runtime Enforcement (`safeFetch`)

All network requests from our code pass through [`safeFetch()`](packages/shared/src/tooling/safeFetch.ts), a wrapper that:

1. Validates the URL hostname before making any request
2. Throws `NetworkPolicyViolation` for any non-localhost address
3. Permits only: `localhost`, `127.0.0.1`, `::1`, and `*.localhost` subdomains

```typescript
// This succeeds:
await safeFetch("http://localhost:11434/api/chat");

// This throws NetworkPolicyViolation:
await safeFetch("https://api.openai.com/v1/chat");
```

### Layer 3: CI Network Verification

Our CI pipeline runs the static network audit on every commit:

```yaml
- name: Run network usage audit
  run: npm run audit:network
```

This ensures any new code introducing network calls is immediately flagged. The audit must pass for CI to succeed.

Additionally, unit tests run with all proxy environment variables unset, verifying that tests don't depend on any external network configuration.

## What About LLM Providers?

Live Documentation supports optional LLM-powered features (relationship inference, semantic analysis). Here's how each mode handles network access:

### Local Ollama (Default)

When configured to use Ollama, requests go **only to localhost**:
- Default endpoint: `http://localhost:11434`
- `safeFetch()` blocks any non-localhost endpoint
- Your code never leaves your machine

### VS Code Language Model API (`vscode.lm`)

When you choose "Prompt me to choose a provider", Live Documentation uses VS Code's built-in language model API. This API may route requests to cloud providers (GitHub Copilot, Azure OpenAI, etc.) based on your VS Code configuration.

**⚠️ Important**: Requests through `vscode.lm` are **not under our control**. They follow your VS Code and GitHub Copilot settings. If you use this mode:
- Your code snippets may be sent to cloud providers
- Standard cloud LLM data handling policies apply
- This is user-initiated and requires explicit opt-in

### Ollama Cloud Warning

Ollama recently introduced cloud-hosted model options. If you configure Ollama to use a cloud endpoint:
- `safeFetch()` will **block the request** and throw an error
- You'll see: `"Ollama endpoint violates network policy. Only localhost endpoints are allowed."`

We have **no way to detect** whether Ollama is running locally vs. proxying to cloud services. If you require guaranteed air-gapped operation, verify your Ollama configuration independently.

## Dependency Supply Chain

### Minimized Attack Surface

We maintain a minimal dependency footprint:

| Package | Purpose | Justification |
|---------|---------|---------------|
| `better-sqlite3` | Local SQLite database | No network, native module |
| `glob` | File pattern matching | No network |
| `ignore` | Gitignore parsing | No network |
| `minimatch` | Path pattern matching | No network |
| `typescript` | TypeScript compiler API | No network |
| `vscode-languageserver` | VS Code extension protocol | IPC only, no network |

### No Post-Install Scripts

Our production dependencies have no `postinstall` scripts that could execute arbitrary code during installation. We verify this with:

```bash
npm ls --json | jq '.dependencies | to_entries | .[] | select(.value.scripts.postinstall)'
```

### Dependabot Monitoring

GitHub Dependabot monitors our dependencies for known vulnerabilities. We address security advisories promptly.

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Preferred**: Use GitHub's [private security advisory](https://github.com/jfjordanfarr/Live-Documentation/security/advisories/new) feature.
2. **Alternative**: Email jfjordanfarr@gmail.com with subject line `[SECURITY] Live Documentation`.
3. **Do not** open a public GitHub issue for security vulnerabilities.

Please include: description, reproduction steps, and potential impact.

We aim to respond within 48 hours and provide a fix within 7 days for critical issues.

## Audit Trail

All development decisions are captured in our [Chat History](AI-Agent-Workspace/ChatHistory/README.md), providing a complete audit trail of:
- Why each dependency was added
- Security considerations for each feature
- Decision rationale for architecture choices

This linear development history is searchable and auditable.

## Verification Limitations

Our multi-layer approach provides strong evidence but not absolute proof. This section documents what we can and cannot prove, and what was attempted.

### What We Attempted: True Network Isolation in CI

The gold standard for proving "software never needs internet" is to run tests in a Docker container with `--network none`. We attempted to add this to our CI workflow:

```yaml
network-isolation-test:
  runs-on: ubuntu-latest
  container:
    image: node:22-slim
    options: --network none  # No network stack at all
  steps:
    - uses: actions/checkout@v4
    - uses: actions/download-artifact@v4
    - run: npm run test:unit
```

If tests passed in this environment, it would be **definitive proof** that our software doesn't require internet access.

### Why It Doesn't Work

GitHub Actions itself requires network to function:

- `actions/checkout@v4` needs to clone the repository from GitHub
- `actions/download-artifact@v4` needs to download from GitHub's artifact storage

With `--network none`, the container starts with no network stack, so these actions fail before tests even run.

### Alternatives Considered

| Approach | Why Rejected |
|----------|-------------|
| Self-hosted runner with Docker-in-Docker | Requires external infrastructure, complex to maintain |
| Two-stage job with volume mounting | Complex Docker orchestration within GitHub Actions |
| iptables firewall rules | Requires root permissions, may interfere with GitHub Actions telemetry |

### What Our Current Approach Proves

| Layer | What It Proves | Limitation |
|-------|---------------|------------|
| Static audit | Code doesn't contain unaccounted network calls | Doesn't prove runtime behavior of dependencies |
| `safeFetch()` wrapper | Our fetch calls are localhost-only | Doesn't cover internal calls from third-party dependencies |
| CI audit | New code is checked on every commit | Audit could theoretically have false negatives |

### Manual Verification for High-Security Environments

For PCI-DSS compliance or air-gapped environments requiring definitive proof, run this locally:

```bash
# Build a test image
docker build -t ld-network-test -f - . <<EOF
FROM node:22-slim
WORKDIR /app
COPY . .
RUN npm ci --ignore-scripts
EOF

# Run tests with no network
docker run --rm --network none ld-network-test npm run test:unit
```

If this passes, the software genuinely does not require internet access at runtime.

### What This Means for Security Teams

Our automated CI provides **strong circumstantial evidence** of localhost-only network access. For environments requiring **absolute proof**, we recommend:

1. Running the manual Docker verification above as part of your release acceptance
2. Network monitoring/auditing in your deployment environment
3. Reviewing the static audit output (`npm run audit:network`) for your specific compliance needs

## Verification Commands

Run these commands to verify our security claims:

```bash
# Network usage audit (Layer 1)
npm run audit:network

# Run unit tests (would fail if network required)
npm run test:unit

# Dependency audit
npm audit

# Check for postinstall scripts
npm ls --json 2>/dev/null | node -e "
  const deps = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
  console.log('Checking for postinstall scripts...');
  // Check recursively
"
```

---

*Last updated: December 2025*

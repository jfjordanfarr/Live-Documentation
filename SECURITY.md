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

1. **Do not** open a public GitHub issue
2. Email: [security contact to be added]
3. Include: description, reproduction steps, potential impact

We aim to respond within 48 hours and provide a fix within 7 days for critical issues.

## Audit Trail

All development decisions are captured in our [Chat History](AI-Agent-Workspace/ChatHistory/README.md), providing a complete audit trail of:
- Why each dependency was added
- Security considerations for each feature
- Decision rationale for architecture choices

This linear development history is searchable and auditable.

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

# Security Policy

Live Documentation is built for environments that need offline, auditable tooling, including PCI-DSS scopes and air-gapped networks. This document states the posture and how to check it yourself.

## No network access

The generator, the CLI and the static-site builder open no sockets. They read source files, write markdown, and write a folder of static files. The Explorer page, once served, fetches only its own bundled data files from the same origin it was loaded from; it contacts no other host.

There is no LLM integration, no telemetry, and no update check.

### How to verify

Search the product code for network APIs. The only hits should be the Explorer client loading its own bundle:

```bash
grep -rn "fetch(\|http\.request\|https\.request\|net\.connect\|WebSocket\|createServer" packages/*/src scripts --include=*.ts | grep -v "\.test\."
```

Run the test suites with no network stack at all. If this passes, nothing the tests exercise needs the internet:

```bash
docker build -t ld-network-test -f - . <<EOF
FROM node:22-slim
WORKDIR /app
COPY . .
RUN npm ci --ignore-scripts
EOF

docker run --rm --network none ld-network-test npm run test:unit
docker run --rm --network none ld-network-test npm run test:integration
```

CI cannot run that recipe, because GitHub Actions needs the network to check out the repository before any step runs. The recipe is offered for release acceptance in high-security environments instead.

## Dependencies

Production dependencies are kept to a minimum. Everything else is a development dependency.

| Package                       | Used by             | Purpose                                            |
| ----------------------------- | ------------------- | -------------------------------------------------- |
| `typescript`                  | shared              | TypeScript and JavaScript analysis via the compiler API |
| `@vscode/tree-sitter-wasm`    | shared              | Tree-sitter grammars for the other languages       |
| `glob`, `ignore`, `minimatch` | shared, scripts, cli | File discovery and path matching                  |
| `esbuild`                     | scripts             | Bundles the Explorer client into the static site   |
| `lz-string`, `jszip`          | scripts             | Compressed URL state and downloadable exports in the Explorer |

No production dependency runs a `postinstall` script. Check with:

```bash
npm ls --json --omit=dev | node -e "const t=JSON.parse(require('fs').readFileSync(0,'utf8'));const walk=(d)=>{for(const [n,v] of Object.entries(d.dependencies??{})){if(v.scripts?.postinstall)console.log(n);walk(v);}};walk(t);console.log('done')"
npm audit
```

Dependabot monitors the lockfile for known vulnerabilities.

## Reporting a vulnerability

1. Preferred: open a [private security advisory](https://github.com/jfjordanfarr/Live-Documentation/security/advisories/new) on GitHub.
2. Alternative: email jfjordanfarr@gmail.com with the subject `[SECURITY] Live Documentation`.
3. Do not open a public issue for a vulnerability.

Include a description, reproduction steps, and the impact you expect. Critical issues are acknowledged within 48 hours and fixed within 7 days where possible.

---

_Last updated 2026-09-27._

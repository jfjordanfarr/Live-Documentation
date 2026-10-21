# Security Policy

Live Documentation is built for environments that need offline, auditable tooling, including PCI-DSS scopes and air-gapped networks. This document states the posture and how to check it yourself.

## No network access

The generator, the CLI and the static-site builder open no sockets. They read source files, write markdown, and write a folder of static files. The Explorer page, once served, reads only the site it was loaded from: its own script and styles, its bundled data and its history. Its Content-Security-Policy refuses every other request, whatever a doc, an address or the page's own code asks for. A doc's raw HTML is shown as text, never run. An image written in a doc is shown as a link to the image and is never fetched. The `?data=` parameter must name a path on the page's own site. Every library the page uses, the force graph's included, is bundled into it at build time. A link to a web page written in a doc opens only when someone clicks it.

There is no LLM integration, no telemetry, and no update check.

### How to verify

Search the product code and the page template for network APIs and scripts loaded from elsewhere. The hits should be the Explorer client loading its own data and a comment in the route heuristic that names `fetch`:

```bash
grep -rnE "fetch\(|http\.request|https\.request|net\.connect|WebSocket|createServer|src=\"(https?:)?//" packages/*/src scripts --include=*.ts --include=*.html | grep -v "\.test\."
```

Run the browser spec that holds the Explorer page to its own site. It builds the bundles first. It then walks every sample bundle's views and reads docs that carry raw HTML, outside images and links. It fails on any request to another site and on any refusal by the page's policy:

```bash
npm run test:e2e -- no-network
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

| Package                                       | Used by                              | Purpose                                                                     |
| --------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| `typescript`                                  | engine                               | TypeScript and JavaScript analysis via the compiler API                     |
| `web-tree-sitter`, `@vscode/tree-sitter-wasm` | engine                               | The tree-sitter runtime and its grammars for other languages                |
| `glob`, `minimatch`, `ignore`                 | engine                               | File discovery and path matching                                            |
| `smol-toml`                                   | engine                               | Reading the TOML manifests of Rust and Python projects                      |
| `esbuild`                                     | explorer                             | Bundles the Explorer client into the static site                            |
| `lz-string`, `jszip`                          | explorer                             | Compressed URL state and downloadable exports in the Explorer               |
| `3d-force-graph`, `three`, `d3-force-3d`      | explorer                             | The 3D Local Map, all bundled into the page                                 |

One production dependency runs an install script: `esbuild`'s `postinstall` (`node install.js`) checks that the binary for your platform, which arrives as an optional dependency, is present and runs; if it is missing, it installs it with npm or downloads it from `registry.npmjs.org` and checks its SHA-256. `npm ci --ignore-scripts` skips it. List every install script among the production dependencies, and check for known vulnerabilities, with:

```bash
npm ls --parseable --all --omit=dev | node -e "for (const dir of require('fs').readFileSync(0, 'utf8').trim().split('\n').slice(1)) { const p = require(dir + '/package.json'); for (const k of ['preinstall', 'install', 'postinstall']) if (p.scripts?.[k]) console.log(p.name, k + ':', p.scripts[k]); }"
npm audit
```

Dependabot monitors the lockfile for known vulnerabilities.

## Reporting a vulnerability

1. Preferred: open a [private security advisory](https://github.com/jfjordanfarr/Live-Documentation/security/advisories/new) on GitHub.
2. Alternative: email jfjordanfarr@gmail.com with the subject `[SECURITY] Live Documentation`.
3. Do not open a public issue for a vulnerability.

Include a description, reproduction steps, and the impact you expect. Critical issues are acknowledged within 48 hours and fixed within 7 days where possible.

---

_Last updated 2026-10-21._

---
name: live-documentation
description: Answer questions about how this repository's code is put together from the Live Docs, the committed markdown mirror of the source, and the inspect CLI, then hand the person a link into the Explorer with the subject pinned. Use when asked "show me how X works in our project", "what does X touch", "what depends on X", "what uses X", "where does this start", "what is reachable from X", "is X dead code", or to explain the shape of a directory. Say what the docs cannot see rather than guess.
---

# Live Documentation

Live Documentation writes one markdown file per source file, its Live Doc, saying what that file exposes and what it is wired to. The Explorer and the CLI show those files and nothing more. Answer a question about structure from the docs and the CLI, cite the doc, and end with a link into the Explorer so that the person looks at the same picture you did. Where the docs cannot see, say so.

## 1. Find the subject's Live Doc

- Read `.live-docs.config.json` at the repository root: `root` (default `.live-documentation`), `baseLayer` (default `source`), `extension` (default `.md`). The doc of `path/to/file.ext` is `<root>/<baseLayer>/path/to/file.ext<extension>`. Never assume the layout; this repository's configuration puts its docs under `.mdmd/layer-4/` with the extension `.mdmd.md`.
- A symbol: search the base layer for its heading, `#### \`Name\``. A directory: list the docs under its path. A vague name: the Explorer's search field finds files, symbols and directories; so does a grep over the base layer.
- Read the whole doc. `Metadata` gives the archetype and the `Entry` lines, one per reason something outside the code starts the file (`program`, `command`, `module`, `opening`, `tooling`, `declared`; a test is an entry by its archetype). `Purpose` and `Notes` are written by people: what the file is for and what a maintainer must know; read them before the generated sections. `Public Symbols` is what the file offers, each with its kind, source line and summary. `Dependencies` is what it uses: a line that links a doc and a symbol was resolved to that file; a bare name is an external package or something the generator could not follow; a qualifier such as `(contract)`, `(configuration)` or `(declared)` says how an edge across a process boundary was observed.

## 2. Ask the CLI

Run from the repository root. Add `--json` for data; the JSON is the same walk the Explorer draws.

| Question | Command |
| --- | --- |
| What X reaches, nearest first | `npm run live-docs:inspect -- --from <path> --reachable` |
| What reaches X, who uses it | `npm run live-docs:inspect -- --from <path> --reachable --direction inbound` |
| The path from A to B, by file or by symbol | `npm run live-docs:inspect -- --from <path>#<Symbol> --to <path>#<Symbol>` |
| The entry points, what they reach, what nothing reaches, what only a test reaches | `npm run live-docs:inspect -- --reachable` |
| What a change to X would touch | `--from <path> --reachable --direction inbound`, then read the reached docs' `Purpose` |

The guide to the command is [cli-reference](../../../.mdmd/layer-1/guides/cli-reference.mdmd.md), and to the question of impact, [tracing-impact](../../../.mdmd/layer-1/guides/tracing-impact.mdmd.md).

## 3. Answer, then hand over the picture

- Answer in plain words and cite the doc: the file, the section, the symbol, the dependency line. Keep what the docs observed apart from what you inferred by reading the code, and say which is which.
- Build the Explorer when `dist/explorer/index.html` is missing or older than the docs: `npm run live-docs:visualize`. Serve it: `npx http-server dist/explorer -p 8766 -c-1`. Then give the address with the subject pinned:
  - a file: `http://localhost:8766/?view=local&node=<path>`
  - a directory: `http://localhost:8766/?view=local&dir=<path>`
  - the inventory, the entry points and what nothing reaches: `http://localhost:8766/?view=sources`
- The person can take the picture further: the Explorer's share link carries their pins, and the Knowledge Sources panel downloads the docs as markdown or a zip and this panel's facts as JSON.

## 4. Say what the docs cannot see

- A use inside the file itself. The docs carry no local uses, so "nothing references this symbol" means nothing in another file does.
- A reference that is not an import or a type reference: reflection, a path held in a string, a computed `import()`. A dynamic import with a literal path is recorded.
- The languages read by hand-written scanners (Ruby, SQL, ASP.NET markup, .NET configuration, HTML, CSS, JSON) have no compiler behind them. TypeScript, JavaScript, C#, Python, Java, Go, Rust, C and C++ are measured against their compilers, and PowerShell against its own parser. A PowerShell module named rather than pathed (`Import-Module Az.Accounts`) stays external, since a machine's module path finds it; a path built from a variable other than `$PSScriptRoot` stays text.
- A doc whose generated sections are empty means no adapter read the file. Say so; do not conclude the file is isolated.
- The generated regions are never edited by hand. A wrong fact is fixed in the generator; `Purpose` and `Notes` are where a person writes.

[reference.md](reference.md) has the doc grammar in full, every flag of the CLI, and the Explorer's addresses.

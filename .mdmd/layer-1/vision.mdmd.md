# Live Documentation

_Current as of 2026-09-26. This replaces the [earlier vision document](link-aware-diagnostics-vision.mdmd.md), which is kept as history._

**Live Documentation turns a folder of source files into a map you can look at.**

It writes one markdown file per source file, describing what that file exposes and what it is wired to. Everything else the tool shows, whether the Explorer picture, the CLI answers, or the VS Code panel, is a rendering of those files and nothing more.

It exists so that a person can see how a system's pieces connect without reading the code or drawing the diagram by hand: the author checking a change's blast radius, a colleague learning the codebase, or someone from the business who needs to understand what the software does.

It is offline, static, and portable. It runs cold on a codebase nobody has annotated and produces something useful.

A system is a folder. A distributed system is a canvas of folders. The map is the same at both scales.

## Who looks at it

- A developer learning a codebase they didn't write, or returning to their own after time away.
- The author of a change, asking what else it touches.
- A senior engineer reasoning about how several systems talk to each other.
- Someone who never authors a map but receives one: a product owner, an auditor, a director who wants the shape of the whole estate.

The tool leads with the first two, because the single-folder map is what works today and the rest is built out of it.

## One model at every scale

| Scale  | Node                      | Exposes                                                 | Consumes                                                          |
| ------ | ------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| Symbol | a function, class, route  | —                                                       | the symbols it references                                         |
| File   | a source file             | public symbols                                          | imports                                                           |
| Folder | a directory               | the sum of its files                                    | the sum of its files                                              |
| System | a repository or app       | endpoints: routes, service contracts, stored procedures | remote endpoints: HTTP calls, service proxies, connection strings |
| Zone   | cloud, on-prem, a network | —                                                       | —                                                                 |

Every node is a card with a name, inputs on the left, outputs on the right, and wires between them. Focusing a node fades everything not connected to it. That is the whole visual vocabulary, and it does not change with scale.

## Scale is a design law, not a zoom slider

Each scale is its own designed experience, complete on its own terms. The closest view, one file with its public symbols, consumers flanking it, and wires crossing between them, should feel intimate and exact. The furthest, systems as shapes on a canvas, should feel like a map. The mechanics are continuous: the same cards, pins, wires, fading, and navigation everywhere. The renderings are crafted separately. You move between scales; the view does not morph under you. From any scale, the next one out should be visible enough to pull you toward it.

The upper limit of scale is set by what the data can honestly support, not by the renderer.

## Where edges come from

Within a folder, edges are observed from source: imports, references, type usage. Between systems there are three tiers, and the picture draws them differently rather than pretending they are equal:

1. **Observed from contracts.** A client calls `GET /payments/{id}`; a server declares that route. A proxy implements a service interface that a server also implements.
2. **Observed from configuration.** Base URLs, service endpoint addresses, and connection strings in `web.config`, `appsettings.json`, and their kin, matched to the systems that declare they answer to them.
3. **Declared.** A person draws the edge: a linked-server query, a database whose schema isn't in source control, a tunnel between zones.

Every edge carries its evidence (where it was found) and its tier.

## Snapshots

An exported map is a snapshot stamped with where it came from: repository, commit, time. Snapshots are first-class. A canvas can be composed of live folders on one machine and exported snapshots from many others, which is how a map of an entire estate can exist without any one machine holding every repository.

## Correctness

The map's edges are checked against oracles that share no mechanism with the analyzer: a compiler's own resolution, what actually breaks when a symbol is removed, and small hand-verified fixtures for patterns such as reflection and markup-to-code-behind. Cross-language parity, the same program written in eight languages producing the same shape, guards against regressions in any one adapter. Where an edge is inferred rather than observed, the map says so.

## What it is not

- Not an LLM tool. It calls no model and makes no network requests. Agents may read its output like anyone else.
- Not a server. The Explorer is a static page.
- Not editor-bound. The VS Code panel hosts the same static Explorer with a file watcher; nothing works only there.
- Not a specification. The map records interface and wiring, not behavior.

## Where this stands (September 2026)

Works today: the single-folder map for TypeScript and JavaScript through the compiler API; adapters of varying depth for C, C#, Go, Java, Python, Ruby, Rust, PowerShell, ASP.NET markup, HTML, CSS, and JSON; deterministic regeneration with authored sections preserved; `inspect` pathfinding; a static Explorer with a good file-scale view.

Being fixed, in this order:

1. Retire the process scaffolding from an earlier way of working, and separate current docs from historical ones.
2. Make the engine honest: tree-sitter in the shipped adapters, C# first; a strict grammar and round-trip test for generated markdown; one derived graph index that every consumer reads; accuracy measured against the oracles above.
3. Consolidate the Explorer into one file-scale view and one folder-scale view that you move between, using the visual vocabulary above.
4. Add `reachable`: what is reachable from a system's entry points, the dual of impact analysis.
5. Then the canvas.

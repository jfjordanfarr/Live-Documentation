# Live Documentation

_Current as of 2026-09-28._

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

What holds at every scale is the model: a thing exposes and consumes, and the picture shows what flows in, what flows out, and what is connected to what. How that is drawn was open until the probes of 2026-09-28; the picture below is what they settled. Two things were settled taste before any of it: focusing on something fades what is unrelated to it, and whatever convention marks direction is the same everywhere it appears.

## Scale is a design law, not a zoom slider

Each scale is its own designed experience, complete on its own terms. The closest view, one file with its public symbols, consumers flanking it, and wires crossing between them, should feel intimate and exact. The furthest, systems as pieces on a board, should feel like a map. The mechanics are continuous: the same model, the same fading, the same navigation everywhere. The renderings are crafted separately; which they are is the next section. You move between scales; the view does not morph under you. From any scale, the next one out should be visible enough to pull you toward it.

The upper limit of scale is set by what the data can honestly support, not by the renderer.

## The picture (2026-09-28)

Two views, named on trial the **World Map** and the **Local Map**, each reached from the other by zooming.

The World Map is the outside of everything: a blank board, white by default and deep dark for those who prefer it, seen at an isometric angle through an orthographic camera that pans, orbits and zooms without anything on it changing size. Each system is a closed piece floating above the board, a cube for a service, a tile for a library, a drum for a database, and nothing inside a piece shows from outside. A piece has doors: green where it serves an opening, a route, a service endpoint, a stored procedure, a table; blue where it calls one. Wires run door to door through the air, blue from the caller to green at the server, and a wire's evidence is a hover away. Districts such as cloud and on-prem are tints on the board, light blue and light orange, and a tunnel between districts is a declared object drawn where the wire crosses. What a piece stands on, its packages and project references, hangs beneath it, so a long beard means a heavy dependence. Pieces sit where a person put them, placed smoothly with snapping as an option, and there is no left-to-right law between systems: the reason for leaving two dimensions was that ordinal space could not hold the dependency shapes honestly, and the board should feel like plopping pieces down in a game.

The Local Map is the inside of one system, its folders, files and symbols, in two dimensions as the folder-scale map once the Membrane Map is as good as the original Local Map, or in three as the force-directed graph. Inside a system the left-to-right law holds.

Between them: zooming into a piece far enough opens it, and the map inside renders at reading size while the board recedes, dimmed. Text never resizes. A hover peeks, a click pins, and a pinned panel carries the link inside. The camera turns the way the force graph's does. Explanations live behind a help control, never on the screen.

The board that settled this, the owner's words on it and the forks still open are recorded under `AI-Agent-Workspace/Probes/2026-09-28/`.

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

## Where this stands (2026-09-29)

Works today: the single-folder map for TypeScript and JavaScript through the compiler API, and for C#, Python, Java, Go and Rust through tree-sitter, each measured against its compiler's own resolution; hand-written scanners for C, Ruby, PowerShell, ASP.NET markup, HTML, CSS and JSON, with no oracle yet for C or Ruby; one grammar that renders and parses every Live Doc, proved by a round trip over the whole corpus; deterministic regeneration with authored sections preserved; one graph index derived from the docs, which `inspect`, lint, the oracle and the Explorer all read; a static Explorer whose views predate the index and read it through a projection.

The order of work:

1. Done 2026-09-27: the process scaffolding from an earlier way of working retired, and current docs separated from historical ones.
2. Done 2026-09-28, except that C, Ruby and PowerShell keep their hand-written scanners until an oracle exists to measure a replacement: tree-sitter in the shipped adapters, C# first; a strict grammar and round-trip test for generated markdown; one derived graph index that every consumer reads; accuracy measured against the oracles above.
3. Consolidate the Explorer into the Local Map: one file-scale and one folder-scale rendering that you move between, in the picture above. The disposable probe came first, on 2026-09-28, and settled the picture. It also found what the picture needs that the docs do not yet say, which is the doc format's next growth: how each edge is known, and where, on every edge; the openings a system serves and calls; what a system stands on, from its manifests; what kind of system a folder is; and what a person declares, districts, tunnels, the edges no scan can see, and where the pieces sit. The first three landed on 2026-09-28 for the estate's languages, with a project's kind from its project file, and the fifth landed the same evening as the board text, one file of things and connections whose design is `.mdmd/layer-3/boards.mdmd.md`; a folder's kind beyond its project file remains, and on a board a kind is the person's word. The zoom into a thing landed on 2026-09-29: a thing's lid unfolds into its folder map, in the Local Map's grammar, inside the World Map's view, with large folders as boxes that open the same way; the file scale inside that same viewer, and the retirement of the older views, remain.
4. Add `reachable`: what is reachable from a system's entry points, the dual of impact analysis.
5. Then the World Map, drawn from those facts. It landed on 2026-09-28 in the Explorer, over the board text and the docs: things drawn by their kind, regions around what they hold, doors, wires with their basis and their evidence, a declared crossing, and what things stand on. The zoom into a thing and its folder map landed on 2026-09-29; the file scale inside the viewer is step 3's remaining work, and the traded file follows.

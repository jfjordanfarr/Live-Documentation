# Ideas and observations without a home yet

_Current as of 2026-09-27. Unprioritised. Mined from the planning documents retired on 2026-09-27, the chat archive, and the September 2026 sessions. Nothing here is a commitment; [the vision](../../.mdmd/layer-1/vision.mdmd.md) and the [decisions log](../../.mdmd/layer-3/architectural-decisions.mdmd.md) hold those. Delete an entry when it lands or when the owner rejects it._

## Asked for or loved by the owner

- **Reachability.** Told that about 40% of the non-test lines were unreachable from any user command, he said: "Man oh man, I wish our tool had the capability to tell me that." (2026-09-26) This is the vision's `reachable`. A related finding from dogfooding `inspect` (2026-09-27): `--direction inbound` without `--to` returns every path, capped at 200, which explodes through hub modules; the question "which files does my change reach, and at what hop distance?" wants the set, not the paths.
- **Prose reference report.** Resolve backticked names in markdown against the file index, the symbol index, npm scripts and configuration keys, and report the ones that resolve to nothing, per document. A report, never a gate, because shell fragments, placeholders, configuration values and deliberately historical names all look like dead references. He called it "a wonderful hard problem" (2026-09-27).

## The Explorer as found on 2026-09-26

Inputs to the consolidation (vision step 3), not a backlog:

- The default Membrane Map screen is mostly an empty tile; the emoji navigation icons render as boxes; dark theme only; unusable at phone width; five views overlap in purpose.
- `explorer-data.json` was 16.6 MB, 11.4 MB of it chat transcripts. The transcripts are now excluded from the bundle.
- The client still calls endpoints of the HTTP server removed on 2026-03-10 (`/bundled-docs`, `/details`, `/doc`, `/open?codePath=`) from `dataLoader.ts`, `detailPanel.ts`, `download.ts` and `index.ts`; on static hosting they return 404 and the client falls back to bundled data. Dead paths to remove.
- Accessibility targets stated in December 2025 and not re-affirmed since: WCAG 2.1 AA, contrast (1.4.3), name/role/value (4.1.2), reduced motion for the force view. Raise them when the views are redesigned.
- A February 2026 idea: colour force-graph nodes by a deterministic cluster. The co-activation code is gone; the idea does not need it.
- The multi-path rendering design (every shortest path merged into one DAG, near-miss paths dashed, symbol-divergent paths colour-coded) survives in [the Explorer doc](../../.mdmd/layer-3/live-documentation-explorer.mdmd.md) and does not depend on any one view.

## Engine

- **Ruby, C and PowerShell** still use hand-written scanners. No indexer is installed to measure Ruby (scip-ruby needs a Sorbet project) or C (scip-clang needs a compilation database), so they cannot be measured the way the other languages were. Either an indexer or a different oracle, such as what breaks when a symbol is removed, comes before rewriting them.

## Positioning

- The peers as the owner sees them (December 2025): Windsurf Codemaps, GitLab Knowledge Graph, Google CodeWiki. What he cares about: MIT licence, offline, markdown-first, "vastly more secure". The README carries a comparison table.
- The README still promises "redistributable prompt/instruction files that teach agents how to navigate the Live Doc graph" at release. Agent context is no longer the goal (see [direction.md](direction.md)); revisit that paragraph when the README is rewritten.

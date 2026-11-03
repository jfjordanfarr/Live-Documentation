# Live Documentation: working with agents

This is the shared guide for agents in this repository. Vendor-specific instructions point here; keep skills under `.agents/skills/`, with vendor locations holding pointers rather than competing copies.

## Purpose and context

Live Documentation turns source files into a map of what they expose and how they connect, so a person can understand software without holding the whole system in their head. Markdown is canonical; the Explorer and CLI are peers rendering the facts the Live Docs carry. Read [the vision](.mdmd/layer-1/vision.mdmd.md) before proposing features.

Current priorities and decisions live in [direction.md](AI-Agent-Workspace/Memory/direction.md); standing preferences in [owner.md](AI-Agent-Workspace/Memory/owner.md); unchosen ideas in [ideas.md](AI-Agent-Workspace/Memory/ideas.md). [The narrative](AI-Agent-Workspace/Memory/narrative.md) tells the workspace's story, and [the decisions log](.mdmd/layer-3/architectural-decisions.mdmd.md) explains consequential choices. Newer owner instructions supersede older ones. Historical certainty is evidence of what was said, not automatically a current decision.

## Collaborate with judgment

- **Be the lead developer.** Own the code and carry authorized work through investigation, implementation, verification and cleanup. Use established intent and evidence to resolve ordinary implementation choices. Debugging, equivalent refactors, justified dead-code removal, and a higher-effort but clearly more correct solution do not need another approval. A problem predating your current context is still ours to understand and fix.
- **Discuss genuine design forks.** Before building on an unresolved choice that changes the product's meaning or behavior, explain concrete alternatives, consequences and your recommendation. First check whether prior decisions or a small investigation already settle it. When experiments are requested, build alternatives for comparison without treating a trial as a production decision.
- **Keep understanding shared.** Explain consequential choices at the owner's level, introducing unfamiliar concepts with concrete examples, particularly in UI/UX. Show how the work fits the whole system. Distinguish established guidance from hypotheses; reject predictable failures through reasoning before building; show matched visual alternatives when spatial judgment is needed. If an explanation is unclear, repair it plainly. Final replies must contain the context needed to understand the result or answer a pending question. Adapt the detail; there is no terseness or verbosity quota.
- **Keep each other honest.** Give evidence, correct false statements and welcome correction. Do not flatter, invent results or estimates, or turn a tentative suggestion into a settled decision. In a disagreement about a picture, the owner's eye decides; for textual facts, explain what the evidence shows.
- **Prefer the simplest complete, correct form.** “A thing should be as simple as possible, *and no simpler*.” Delete duplication and unnecessary machinery while preserving required behavior and distinctions. Choose readable code and boundaries that permit independent improvement; line counts and brevity are not architectural goals. Fix causes instead of disguising them with workarounds; use a workaround only when explicitly requested by the owner. If correct behavior is genuinely unresolved, discuss the wall.

## Preserve continuity

The following startup and recording work belongs to the root agent. Subagents read applicable guidance and their task context without starting another archive cycle.

- **New chat:** read this guide and the four Memory documents linked above in full, then the five most recent session summaries in full, oldest to newest (all available if fewer). Finish the immediately preceding session's summary when captures are available and it is missing or incomplete. Maintain the narrative when that session changed the story, and correct contradicted history in place with a dated source note. Follow the [handoff routine](AI-Agent-Workspace/ChatHistory/README.md#session-handoff-routine), respecting explicit user overrides. Rank next work against the vision and direction's Next, not merely the latest open ends.
- **As work proceeds:** at each user turn, preserve newly received user messages and preceding root replies not yet recorded. Keep verbatim messages separate from interpretation, use stable turn references, checkpoint consequential work and record outcomes before finishing. Preserve source captures and unique findings. Follow [the recording convention](AI-Agent-Workspace/ChatHistory/README.md#recording-as-work-proceeds).
- **After compaction:** resume the same record from its resumption notes and relevant source turns. Do not bootstrap again or treat the latest steering as cancellation of the active task. Summarize the current chat when the owner requests its close-out.
- **Read and report faithfully.** A requested full read means the whole file; a search, sample or summary's claim is not a substitute. State actual coverage. Never extract private reasoning from agent traces. Recover conversation only from explicitly user-facing messages, excluding tool payloads and subagent threads from the root conversation record.

## Stewardship

- **Leave a clean workspace.** Remove your temporary outputs. Investigate questionable files encountered during the work through contents, consumers, git and relevant chat provenance; remove them when no justified purpose remains. Missing chat provenance alone does not prove a file disposable. Preserve source captures and unique findings, and record consequential deletions. This is initiative during the task, not a mandate for an unrelated repository-wide purge.
- **Own delegated work.** Subagents are welcome, up to five within the host's limits. Give bounded scopes and require changed/created files, outcomes and unfinished work in the handback. The root reviews their work, carries forward useful findings and cleans up disposable outputs, including after an interrupted agent. Shared history and Memory maintenance remain the root's responsibility.
- **Use git carefully.** Never bulk `git checkout`, `git restore` or `git clean`. Commit when confident in safety and quality under the owner's standing grant. They may push at any moment: never amend or rewrite an existing commit; correct it with the next commit. Write messages an outside reader can understand, without internal option or requirement IDs.

## Documentation and correctness

- **Keep one source of facts.** Everything the Explorer or CLI shows must be derivable from the Live Docs. Grow the format when it cannot carry a needed fact; do not add a private side channel. Consumers read the graph derived afresh from the docs. What a person can learn or do through the UI must also be available through commands or exported data. Agents use those same human-accessible surfaces.
- **Respect generated and authored content.** Never hand-edit a `LIVE-DOC:BEGIN` … `LIVE-DOC:END` region; fix the generator. Write authored Purpose and Notes for a new maintainer, from the file's origin in git and the chat record. Cite the relevant summary turn when the origin or decision explains the file. If its purpose cannot be defended, investigate improving or deleting the code. Before deleting an authored document, check its origin and carry forward still-valid information that lives nowhere else.
- **Distinguish current from historical.** Authored documents identify their status at the beginning. Current docs may cite historical ones for provenance, not depend on them for current facts. Carry old ideas forward as dated history or open questions unless the owner reaffirms them. Name requirements plainly; no requirement-ID schemes. Keep shared memory in the repository, not duplicated in a vendor's private memory.
- **Separate product from workspace conventions.** Read `.live-docs.config.json`; product code must not hardcode this repository's `.mdmd` root, `layer-4` or `.mdmd.md` suffix. The derived index and history caches are not committed. [The workspace guide](AI-Agent-Workspace/README.md) explains records, artifacts and local output locations.
- **Fix causes, not gates.** Never weaken a valid threshold, exclude a troublesome path, skip a test or add a workaround to obtain a pass. Correct a wrong check and explain the evidence. Test meaningful inputs and learned edge cases; a test that cannot fail proves nothing. Adapters are the product, independent oracles are ground truth, and nothing grades itself. Never trim benchmark expectations to fit the analyzer; block only genuine framework/builtin names.

## Explorer design and verification

- **Preserve orientation.** Following connections, changing scale, opening evidence and returning to a place must keep recognizable subjects and context. Transitions should explain spatial changes. Inspect motion and complete journeys, not only still pictures. Use consistent meanings across scales; current view behavior and open designs belong in [the Explorer design](.mdmd/layer-3/live-documentation-explorer.mdmd.md).
- **Make the picture legible.** Keep readable names, necessary controls, relevant evidence and honest indications of hidden content. Avoid decorative prose and repeated instructions; put optional help in contextual disclosure. Use recognizable icons for repeated actions with accessible names, keyboard access, state and hover/focus explanations. Do not shrink text to make room. Fade the irrelevant rather than boosting the relevant. No emoji in the UI.
- **Keep interfaces coherent.** Blue identifies what an interface offers; green what uses it. In the 2D file drawing, uses enter on the left and offerings leave on the right. Preserve these distinctions across scales while following each view's current rendering design. Prefer a symbol's origin file over a barrel re-export when resolving links.
- **Keep the page self-contained.** The page reads only its own site. Preserve its CSP and no-network checks, use listeners rather than inline event attributes/scripts, and render raw HTML in documentation as text.
- **Look, then protect the behavior.** After an Explorer change, build and use it, inspect screenshots and motion, and save named evidence following [the workspace convention](AI-Agent-Workspace/README.md). Ask why if the Explorer itself was unhelpful for looking. Write browser regressions after visual judgment. Keep layout math in pure modules with Vitest tests; verify DOM behavior with Playwright, not jsdom. Use the design audit to catch collisions and cut-off text over relevant states on this repository and the estate sample.

## Working environment and checks

The devcontainer uses Linux/Bash and the Node version in [.nvmrc](.nvmrc), with npm workspaces defined in [package.json](package.json). The Windows-backed mount is case-insensitive: confirm filename casing through directory listings, not existence checks alone. CLI entry points live under `scripts/live-docs/`; source/package responsibilities and current status are documented in the vision and Live Docs.

| Command | Use |
| --- | --- |
| `npm run build` | Type-check/build the engine, Explorer and generator. |
| `npm run live-docs:generate` | Regenerate the mirror and graph after source changes; commit regenerated docs with the code. |
| `npm run live-docs:visualize` | Build the static Explorer for inspection. |
| `npm run safe:commit -- --e2e` | The fullest applicable local verification, including Playwright. |

Run the full applicable local gate after product changes; keep CI's existing default without Playwright. Report failures and environment blockers instead of silently substituting a narrower pass. Run dependency inspection before and after risky edits. Detailed commands, sample builds, audits, oracles and the layout lab are in [internal tooling](.mdmd/layer-2/internal-tooling.mdmd.md); user-facing commands are in [the CLI reference](.mdmd/layer-1/guides/cli-reference.mdmd.md).

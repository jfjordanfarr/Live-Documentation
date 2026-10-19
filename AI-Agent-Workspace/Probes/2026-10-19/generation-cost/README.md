# Incremental generation: correctness and measured cost

_Historical investigation, October 19, 2026. No cache design or retirement decision is selected here. The owner approved investigating changed-only generation in [Turn 3](../../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-3), asked to measure whether the shortcut earns its complexity in [Turn 6](../../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-6), and widened the question to CI cost, scale and the portable HTML export in [Turn 7](../../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-7)._

## What was measured

A Sol builder ran the investigation in detached worktrees. The root reviewed the reported outputs and code changes; the numbers below are that measured work, not a second independent benchmark by the root. Instrumentation and the benchmark worktrees were removed. The definite corrections landed as `a0325304` after full review and the required gate; the unselected invalidation prototype was not adopted. Its unique findings are retained here, and its scratch patch is disposable.

The comparison uses corrected Git-path parsing and complete workspace file/symbol/entry indexes in both modes. The expanded affected-file selector was disabled for the measurements: **changed-only here means rendering just the Git-changed source**, which is still insufficient for full correctness. These numbers price the shortcut, not a finished correct incremental implementation.

One exported symbol's JSDoc sentence was alternated before each run, giving Git one real changed source and causing exactly one document to need updating. Runs alternated between modes. Times include npm/tsx startup and graph writing. No accuracy claim is derived from timing.

| Corpus and mode | Warm actual-write runs, seconds | Median | Processed / updated / unchanged |
| --- | --- | ---: | --- |
| This repository, literal changed-only | 5.914, 5.877, 6.080 | 5.914 | 1 / 1 / 0 |
| This repository, full | 7.284, 7.334, 7.443 | 7.334 | 836 / 1 / 835 |
| Controlled TS corpus, literal changed-only | 5.950, 5.893, 6.077 | 5.950 | 1 / 1 / 0 |
| Controlled TS corpus, full | 14.751, 14.949, 15.126 | 14.949 | 2,592 / 1 / 2,591 |

The local saving is 1.420 seconds (19%) on this repository and 8.999 seconds (60%) on the larger controlled input. Both modes rewrite the graph; full generation avoids rewriting unchanged docs. The larger corpus is six path-preserving copies of 432 TypeScript/TSX source files, with duplicate names and no adapters/manifests. It demonstrates scaling cost, not a representative large application's accuracy, language mix or change distribution.

The earlier three-run dry-run comparison on this repository was 5.826, 5.245, 5.243 seconds changed-only versus 6.775, 7.298, 6.916 seconds full: medians 5.245 and 6.916, the 1.67-second saving first reported to the owner. The root's initial recommendation to retire the shortcut from that measurement was premature; the owner's larger-repository question caused the second experiment.

## Where the time went

Temporary phase instrumentation on the repository's full run attributed roughly 0.24 seconds to discovery, 4.5 to the workspace index, 1.3 to main analysis, 0.12 to composition, 0.25 to reading/rendering/classification, 0.02 to pruning and 0.28 to graph derivation/writing. The index is paid even by corrected changed-only generation, because resolving one file requires the whole workspace context.

The first attribution of most index time to TypeScript was misleading. A roughly 2.5-second pause consistently appeared at the next TypeScript file's `await fs.readFile` after the PowerShell oracle script was analyzed; the TypeScript parse itself took less than a millisecond. A two-file reproduction and a direct adapter probe showed the PowerShell analysis returning in about 55 ms, followed by a roughly 2.6-second delay before `setImmediate`; a following filesystem stat was fast. Increasing the libuv thread pool did not remove it. This is a runtime/init/cleanup performance finding still to diagnose, not proof of expensive TypeScript parsing or of a particular cache benefit.

On the larger TS-only corpus, the index took about 3.7–3.9 seconds in both modes. The full second pass took about 7.0–7.15 seconds of analysis, 0.42 of composition, 0.75 of read/render/classification and 0.55–0.64 of graph work. Literal changed-only largely skips the second pass. This is the substantive scaling benefit the small mixed-language repository did not reveal.

## Correctness cases found

- Git porcelain lines were trimmed before their status columns were read. An unstaged path beginning with ` M ` was consequently parsed at the wrong offset. NUL-delimited porcelain also handles spaces and rename pairs without ambiguous arrow parsing.
- An empty changed-file set was treated as absence of a filter, processing everything.
- The dirty set supplied the first-pass indexes, so an edited consumer could lose links to providers whose source had not changed. Complete workspace indexes repair that case.
- A provider's public surface or a manifest's entry declaration can change facts written on an unchanged file's doc. A trial affected-file selector covers a regression of this kind.
- A newly added provider can resolve an unchanged consumer's formerly unresolved import. The trial initially missed it: full generation made a link where changed-only retained the unresolved text. This is why old resolved dependents alone do not establish complete invalidation.
- Deleted/renamed source paths need targeted stale-doc handling while preserving the existing safeguard for unique authored content. Global pruning is not a shortcut for understanding affected paths.

The initial full-context/status/empty-set fixes and provider/manifest cases passed their focused tests. The added-provider case first failed and prompted a wider fallback in the prototype, but that broader contract is unselected. The definite repairs were isolated from the optional invalidator, reviewed and committed; no partial trial is presented as a correct landed implementation. Root review also found Git-root-relative status paths when a scan is nested inside a larger repository, now covered by a focused regression.

## Ignored markup is a boundary bug, not a cache requirement

The owner questioned whether ignored files should become nodes in [Turns 9–11](../../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-9). Discovery already excludes ignored, untracked files and includes nonignored new files; the owner accepted the latter behavior so new work remains visible before staging. A tracked file remains eligible even when an ignore pattern matches it.

A disposable Git repository proved a separate inconsistency: a tracked script querying DOM id `x` was the only discovered source, but the DOM heuristic directly read an ignored HTML page defining that id and wrote a dependency link to its nonexistent doc. Only the script became a node; the graph left the target unresolved, and lint did not flag the missing dependency link. Editing only the ignored HTML changed the script doc while Git stayed clean. The heuristic predates the current ignore policy. The repair is to bound DOM inference by the discovered source set when generation supplies it, with positive visible-markup coverage and ignored/config-excluded cases; it does not change discovery to tracked-only.

This example corrects the root's earlier framing: preserving every observed filesystem read in a cache would preserve this bug too. Establish the intended analysis boundary first, then key cached results by their legitimate inputs. Other adapters' context reads still need that audit; fixing this example does not prove complete invalidation.

## The cache boundary to investigate

The TS/JS first pass produces raw symbol facts from source without a workspace symbol index; a cache of those serializable facts keyed by content, script kind and analyzer identity is a plausible bounded step. The second pass resolves imports, reexports, types and openings using the current workspace. Reusing its completed output or a rendered doc on source content alone is unsafe.

Several non-TS adapters already cache extracted facts within one process, while their workspace tables are keyed by the current file index. Persisting raw facts across runs needs an explicit representation and complete input keys; adapters and manifests currently mix some extraction with resolution. Reusing whole ASTs within one run could avoid parsing twice but retains more memory, which must be measured against the owner's smaller machine.

History is separate from `generate --changed`: each uncached commit is fully regenerated in a fresh worker process. The history cache skips whole commits already read under the same lens; changing the analyzer invalidates them. Reusing context-free facts across historical snapshots may reduce that cold cost, but this investigation has not implemented it.

A separate cache-identity gap was found during review: the local history lens does not currently include the root dependency lock in its generator identity. The new Pages workflow groups caches by that lock as well as analyzer/configuration inputs, guarding reuse in that workflow, but the local history key still needs the corresponding review. This investigation does not claim that local dependency-only invalidation is solved.

An incremental producer can still emit a complete, self-contained HTML snapshot. Its cache belongs to the producer; neither that cache nor earlier exports need be required by the recipient. Browser layout is another computation, driven by the exported graph and the person's current view, rather than precomputed in CI for every possible Local Map.

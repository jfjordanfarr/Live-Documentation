# What history in the 2D map would cost: symbol rows and descriptions at every commit

Historical record of a measurement, November 19, 2026, by a builder working read-only, on the owner's [Turn 35 of the November 18 record](../../2026-11-18.1.record.md#turn-35): "we're going to be like \"holy hell that produces a mega gigantic build that is totally unsustainable\", but that is the aspiration to achieve, yes." Rung 1 of history in the 2D map is the file-level picture from what the history file already carries; rung 2 adds each file's symbol rows and symbol-level wires as they were; rung 3 adds the words of that day. Nothing in the product changed and nothing was built. The report below is the builder's, as handed back; `main` was at `f5cc0638`.

Kept beside this file: `measure.js` and `analyze.py` (the scripts, which write to a scratch folder named inside them) and `formatTrack.json` (every twentieth step's count of docs in the mirror and how many today's parser reads, which is how the usable stretch was found). The other outputs, the per-step sizes (9 MB), the keyframes (20 MB) and the name tables, were not kept: the scripts make them again in a few seconds from git.

**Answer.** Rung 2 (symbol rows and symbol-level wires) about doubles the history file: 150 KB gzipped today, about 300–320 KB for the whole year. Rung 3 (descriptions) is where the size goes: 1.5–2.7 MB gzipped if it is stored inline in the file. A separate store of description text that holds each version once costs about 0.7 MB gzipped. Rebuilding the history would not get slower: every fact either rung needs is already derived at each commit and then thrown away. Nothing was committed, nothing under `packages/` or `.mdmd/` was touched, and nothing was built or regenerated.

**How I measured it.** One `git log --first-parent --diff-merges=first-parent --raw -M` over the mirror `.mdmd/layer-4`, then one `git cat-file --batch` for its 9,623 blobs (about 3 seconds). Each doc was parsed with the engine's own `parseLiveDoc`, and links were resolved with `linkTarget`. The steps were walked in mainline order and checked against all 817 steps of `dist/explorer/explorer-history.json`, which runs from the first commit to `5d520791` (2026-11-13). New data was encoded the way `codec.ts` does it: interned ids, empty lists left out, compact JSON. Sizes are gzip at level 9.

**Where the mirror is usable.** From step 291, `13f66380` (2026-09-27, "chore(grammar): drop the Live Doc ID line…"). From then on today's parser reads 100% of the docs. Before it the mirror uses older formats (`## Source Mapping`, front matter, `**Created:**`), and around step 80 there is no mirror at all. So the measured stretch is steps 292–817: **526 of 817 steps (64%), every step measured exactly, no sampling.** Steps 1–291 (36%) are extrapolated, as marked below.

### Numbers

| | raw | gzipped |
|---|---|---|
| Today's file (817 steps, 3 keyframes) | 640,859 | 149,575 |
| Today's steps within the stretch | 215,636 (mean 410 per step, median 286, p90 671, max 3,764) | |
| **Rung 2 additions to steps in the stretch** | 171,862 | 30,601 |
| — per step | median 0 (149 of 526 steps non-empty), p90 915, p99 5,478, max 8,521 | a non-empty step alone: median 203, p90 684 |
| **Rung 2 file** (today's file + stretch steps + name table + keyframes 512 and 768) | 1,237,250 | 271,032 |
| Rung 2 file, whole year (extrapolated) | ~1.45–1.5 MB | ~300–320 KB |
| **Rung 3 additions in the stretch, each changed text replaced whole** | 5,779,731 | 1,723,966 |
| — per step | median 0 (169 non-empty), p90 39,417, p99 127,232, max 217,085 | |
| — authored Purpose/Notes vs symbol descriptions | 5,418,628 vs 356,878 | 1,607,637 vs 105,123 |
| Rung 3 additions as line diffs | 1,948,648 (p90 12,159, max 78,278) | 536,851 |
| **Rungs 2+3 file, texts replaced whole** | 9,352,922 | 2,721,724 |
| **Rungs 2+3 file, line diffs** | 5,521,839 | 1,517,153 (the two text keyframes are about 0.74 MB of it) |
| Rungs 2+3 file without any keyframes, line diffs | 2,877,146 | 773,639 |
| Every text version in the stretch, each stored once, ordered by path then time | 6,018,994 | 677,880 (xz: 467,568) |
| Whole year, rung 3 (extrapolated) | add roughly 1 MB raw / 0.26 MB gzipped for the pre-stretch start state and a keyframe at 256 | |

What changed in the stretch:
- 2,089 symbols added, 238 removed and 4 renamed (a rename was counted only when the kind and the source line both matched).
- 4,969 links added and 665 removed.
- 1,893 authored blocks and 1,681 symbol descriptions changed.

**Largest steps.**
- **Rung 2:** step 576 `7dd2dbf2` (2026-10-18, the history sequence itself landing; 91 symbols, 298 links, 8.5 KB). Next come step 542 (C/C++ reading; 236 symbols), step 445 (the layout lab) and step 323 (the World Map).
- **Rung 3:** the November Explorer work. Step 729 `e104f9fa`, "Show the ladder without a switch…", rewrote 43 authored blocks (217 KB whole, 32 KB as diffs). Steps 730, 760, 614 and 742 are similar, all 100–150 KB.
- **Links must follow file renames.** Step 296 (`packages/scripts` → `packages/explorer`) produced 1,892 link changes before I made links follow file renames, as today's edges do, and almost none after. That one change took the rung-2 total from 244 KB to 172 KB and the largest step from 41.5 KB to 8.5 KB.

### Opening a past moment and keyframe spacing

At the last step:
- **Today's shape keyframe:** 52,004 raw / 12,361 gzipped.
- **Rung 2 part:** 197,315 raw / 34,433 gzipped (3,465 symbols, 6,219 links).
- **Rung 3 part:** 1,722,433 raw / 512,185 gzipped (959 authored blocks, 2,021 symbol descriptions).
- **What the 2D map needs to open there:** shape plus rung 2 is 243 KB raw / 45 KB gzipped. Adding rung 3 makes it 1.97 MB / 557 KB.

Keyframes every N steps, over the stretch (rung-2 keyframes gzipped; "worst replay" is the largest run of N−1 rung-2 deltas a seek would apply):

| N | keyframes | rung-2 keyframes | worst replay | text keyframes |
|---|---|---|---|---|
| 32 | 16 | 401 KB | 27 KB raw | — |
| 64 | 8 | 196 KB | — | 2.1 MB |
| 128 | 4 | 101 KB | 65 KB raw | — |
| 256 (today) | 2 | 55 KB | 105 KB raw | 686 KB |
| 512 | 1 | 21 KB | 170 KB raw | — |

Replaying 255 rung-2 deltas is a few thousand tuples, which is trivial work. So 256 is still right for rung 2. Text should not be keyframed at all.

### Build time, from the code

`derive.ts` only compares two shapes; it derives no docs. The docs are derived in `packages/generator/src/history/summarizeChange.ts`. It runs `generateLiveDocs` on each commit's scratch tree and parses the full `index.json` into a `LiveDocGraph`. Each file there already carries its symbols (name, kind, slug, description sections), its dependencies, its authored text, and edges with `from`, `toSymbol` and kind.

`summarizeGraph` in `packages/engine/src/live-docs/history/summary.ts` then keeps only `symbols.length`, the entry mark, edge counts per target and doc links, and discards the rest. So **rungs 2 and 3 need no second pass, and the cost of derivation does not change.** The real costs are:
1. **One full rebuild (about 85 minutes).** The summary format changes. Any edit to the engine or generator changes the lens key anyway, so this rebuild comes with the change itself.
2. **A much larger cache.** Today's head summary is 415 KB and the cache is 206 MB for 818 commits. With symbols, links and text, a summary is roughly 2 MB, so the cache becomes about 1.5–2 GB unless summaries are gzipped or texts are stored once. The Pages workflow caches this folder. For comparison, `--keep-index` already writes about 1.08 MB gzipped per commit.
3. **The in-process sequence build.** The diff, apply and replay check would also cover symbols and links. That work is linear in snapshot size, so seconds, holding one snapshot in memory.

### Proposed encoding

**Rung 2, inline in `history.json`.**
- Intern symbol names and kinds once, as paths are interned now. Each symbol gets an id at birth (`[pathId, nameId, kindId]`).
- Steps carry symbols born, died and renamed, and links added and removed as `[fromSymbolId | file, toSymbolId | path, kindId, count]`.
- A file rename carries its symbols and the links into it, at no cost.
- Keep keyframes every 256 steps.

**Rung 3, in a separate file loaded only when needed.**
- Store each distinct text version once, ordered by path then time, so that successive versions compress against each other (6.0 MB raw becomes 678 KB gzipped).
- Steps and keyframes refer to texts by id, so a text keyframe is just integers.
- Split the file by directory, so a 2D card fetches only the texts it shows.

### What I could not measure

- **Steps 1–291 (36%).** The mirror there is unreadable or missing, so those numbers are extrapolated from the stretch's ratios.
- **The mirror is not the lens.** The history regenerates each commit with today's generator; the mirror holds the generator of that day. The mirror lagged the source on only 5 of the stretch's 150 steps that changed shape. Format changes within the stretch may add some false churn I did not separate out. The authored text is a faithful stand-in, because the lens keeps that day's authored words from the committed mirror.
- **Symbol renames are undercounted.** Only 4 were found by matching kind and source line; any other rename counts as a removal plus an addition, so the counts are an upper bound.
- **The name table is an upper bound.** Link anchors are stored as strings separate from symbol names (5,154 strings, 29.8 KB gzipped); symbol ids would roughly halve it.
- **Row order and source lines are not measured.** A line number shifts with nearly every edit above it, so I would store each symbol's order, not its line.

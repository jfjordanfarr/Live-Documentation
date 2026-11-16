# The fewest returns: measurements

_Historical evidence, measured 2026-11-16 for the round of [Turn 5 of the November 15 record](../../../ChatHistory/2026/11/2026-11-15.1.record.md#turn-5); the decision and its summary are in [the decisions log](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md). Pictures are in [the round's pictures](../../../Screenshots/2026-11-15/fewest-returns/README.md)._

The scripts ran from a scratch folder in the builder's worktree with `npx --offline tsx --tsconfig <repository>/tsconfig.base.json <script> ...`; their imports have been adjusted to this folder. The "before" runs import `branches-base.ts` and `evaluate-base.ts`, copies of `packages/explorer/src/client/views/localView/branches.ts` and `scripts/layout-lab/evaluate.ts` at commit `3f734433` with their relative imports made absolute (and the evaluate copy importing the branches copy); they are not kept here.

| File | What it holds |
| --- | --- |
| `slack.ts` | The root's measurement of November 15, extended: every file opened alone (`exploreBranches`, no pins, assets left out) and four opened directories under Flow, the references the ranking reads backward against the least any order could (exact by subsets), with each picture's returns and columns. Run once on the base ranking and once on the new one over the same bundle. |
| `rows-repo-before.json.gz`, `rows-repo-after.json.gz` | Its rows. |
| `compare.ts`, `compare-repo.txt` | Picture by picture, what changed: 33 files and the `localView` directory, none of the 857 dark pictures, no picture with more returns. |
| `pure-compare.ts`, `pure-compare.md` | The ranking's own signals before and after on those 34: references backward, pairs with a return, columns, the forward references' column spans, the tallest column. |
| `lab-compare.ts`, `lab-base-build.md`, `lab-after-build.md` | The layout lab's signals before and after on the deck's four scopes and the 33 files (each pinned whole), from captures of the base page and of the new page; the last column is each layout's drift from the page it was captured from. |
| `drift-detail.ts`, `drift-detail.txt` | The lab's drift from the new page on `powershell.ts` and `json.ts`, line by line. |
| `timing.ts`, `timing.txt` | The ranking's time before and after on the largest pictures, the exact search's time at each size on a worst case, and the large cycle's path against the exact answer on all 45 distinct cycles here. |
| `tip.ts` | One reference at a time added to a real two-file cycle, and which cards change column. |
| `shots.ts`, `whole-shots.ts` | The pictures. |

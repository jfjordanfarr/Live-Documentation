# Normal-default reading-toggle integration check

Current investigation evidence from the unchanged candidate, after the root asked whether the sparse-search test setup could hide structural work. No source change was made during this check.

A fresh browser context used actual page defaults: two seeded starts before first paint, 32 continuing search starts, patience eight, fixed-slot text. `reading-state.ts` was selected and pinned whole. The initial continuing search was allowed to finish before either book action.

The [initial picture](01-normal-initial-settled.png), [folded picture](02-normal-fold-settled.png) and [single-description picture](03-normal-one-settled.png) have the same nine cards and sixteen shown rows. The subject remains 290×693 map units. Row order stays unchanged. Seven symbol-slot boxes stay fixed; their maximum final displacement is 0 px for folding and 0.00104 px for opening one description.

Both actions nevertheless recreated all nine cards and sixteen rows and restarted the continuing search. Initial search settled after twelve tries with two adoptions, at seed six. Each book action reset the counters to zero/running and settled again after eight tries with no adoption; the page also flagged a branch move. The root element itself survived. No page errors occurred.

[The full observations](normal-default-observations.json) include DOM identities from a WeakMap, card/row/slot boxes, row order, settings, choices and search-mutation events before, immediately after and after settling. [The summary](summary.json) extracts geometry comparisons. This proves redundant structural rebuilding and search restart for this unchanged scope; it does not prove a visible reorder or jump in this sample.

Proposed boundary, not implemented here: unchanged fixed-slot file/row retention and card controls refresh text/control/row-emphasis presentation in place, preserving DOM and the current search. Effective disclosure, retention or control-geometry changes keep the full render. Growing cards retain their current route. The existing geometry-refresh helper itself restarts search, so it is not the unchanged-slot route.

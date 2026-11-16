# `adapters/index.ts` arriving with the default search

_Historical evidence, measured 2026-11-16 for the fifth leg. `watch.ts` opened the file alone with no tuning seeded, at 1440 by 900, on `main`'s build (`28b7f224`, its own graph) and on this branch's final build, and read the search's status every three seconds until it had settled twice._

| Build | s | Status | Seeds tried | Next | Adopted | Joins tried | Cycle trials | Cycle adopted | Endpoints | Look | Files only | Returning connections |
| --- | --: | --- | --: | --: | --: | --: | --: | --: | --- | --- | --- | --: |
| main | 0 | running | 0 | 3 | 0 | 0 |  |  |  | reading | False | 34 |
| main | 3 | settled | 8 | 11 | 0 | 3 |  |  |  | reading | False | 34 |
| main | 6 | settled | 8 | 11 | 0 | 3 |  |  |  | reading | False | 34 |
| final | 0 | running | 0 | 3 | 0 | 0 | 0 | 0 | drawn | reading | False | 34 |
| final | 3 | settled | 8 | 11 | 2 | 2 | 2 | 1 | every | reading | False | 22 |
| final | 6 | settled | 8 | 11 | 2 | 2 | 2 | 1 | every | reading | False | 22 |

Both arrive in the reading look and settle within 3 s. The fourth leg's search that had not settled after 180 s was a build from before the search measured a returning reference's endpoints (`383dec5d`): a cycle trial asked the cached rows for an endpoint never measured, the idle step threw, and the status stayed running.

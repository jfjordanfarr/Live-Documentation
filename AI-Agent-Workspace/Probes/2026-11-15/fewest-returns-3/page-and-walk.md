# The page's cycle trials against the lab's walk, on one graph

_Historical evidence, measured 2026-11-16 for the fifth leg, on the final build. `agree-5.ts` captured each of the 33 pictures from the page with the search off (the file retained whole, 1600 by 1000), walked the capture's cycle trials as the search walks them (`evaluate`'s `cycleSearch`, the default Return Cost), then opened the page with one seed and a patience of one and read its own record of each trial (`data-search-cycle-trials`). Prices are in pixels of wire: the page's price with the two terms a ranking changes, churn aside (`base`)._

| Picture | Drift | Lab adopts | Page adopts | Lab price | Page prediction | Gap | Page measured |
| --- | --: | --- | --- | --- | --- | --- | --- |
| `ModelFactory.cs` | 0 | no | no | 36,869 | 36,869 | 0 |  |
| `ProcessorConfig.cs` | 0 | yes | yes | 37,760 | 37,760 | 0 | 37,760 |
| `Processor.cs` | 0 | yes | yes | 60,877 | 60,877 | 0 | 60,877 |
| `Record.cs` | 0 | yes | yes | 60,623 | 60,623 | 0 | 60,623 |
| `compiler-edges.json` | 0 | yes | yes | 71,757 | 71,757 | 0 | 71,757 |
| `css.ts` | 0 | no | no | 19,342 | 19,342 | 0 |  |
| `c.ts` | 0 | yes | yes | 39,307 | 39,307 | 0 | 39,307 |
| `powershell.ts` | 0 | no | no | 60,558 | 60,558 | 0 |  |
| `helpers.rs` | 0 | yes | yes | 21,272 | 21,272 | 0 | 21,272 |
| `json.ts` | 0 | no | no | 51,359 | 51,359 | 0 |  |
| `sourceAnalysis.ts` | 0 | no | no | 84,091 | 84,096 | 5 |  |
| `branch-scene.ts` | 0 | yes / no | yes / no | 434,442 / 513,712 | 434,442 / 513,712 | 0 / 0 | 434,442 /  |
| `go.ts` | 0 | yes | yes | 34,281 | 34,281 | 0 | 34,281 |
| `quantity.rs` | 0 | yes | yes | 71,118 | 71,138 | 20 | 71,118 |
| `html.ts` | 0 | yes | yes | 27,075 | 27,075 | 0 | 27,075 |
| `aspnet.ts` | 0 | yes | yes | 27,650 | 27,650 | 0 | 27,650 |
| `directory-ancestry.ts` | 0 | yes | yes | 25,557 | 25,564 | 7 | 25,557 |
| `controller.ts` | 0 | no | no | 655,496 | 655,496 | 0 |  |
| `dotnetConfig.ts` | 0 | no | no | 40,983 | 40,983 | 0 |  |
| `csharp.ts` | 0 | no | no | 103,973 | 103,973 | 0 |  |
| `item.rs` | 0 | yes | yes | 94,174 | 94,184 | 10 | 94,174 |
| `memory.rs` | 0 | yes | yes | 95,102 | 95,102 | 0 | 95,102 |
| `branches.ts` | 0 | no / no | no / no | 1,540,513 / 1,477,251 | 1,540,513 / 1,477,229 | 0 / -22 |  /  |
| `directory-flow.ts` | 0 | yes / no | yes / no | 351,051 / 370,506 | 351,064 / 370,519 | 13 / 13 | 351,064 /  |
| `manifest.ts` | 0 | yes | yes | 130,373 | 130,379 | 6 | 130,373 |
| `branch-renderer.ts` | 0 | yes / yes / no | yes / yes / no | 768,159 / 746,712 / 749,072 | 768,159 / 746,712 / 749,072 | 0 / 0 / 0 | 768,159 / 746,712 /  |
| `forceGraphView.ts` | 0 | yes | yes | 631,803 | 631,803 | 0 | 631,803 |
| `forceGraphReveal.ts` | 0 | no | no | 68,828 | 68,825 | -3 |  |
| `force-graph-reveal.spec.ts` | 0 | yes | yes | 52,019 | 52,019 | 0 | 52,019 |
| `forceGraphScope.ts` | 0 | yes | yes | 257,710 | 257,710 | 0 | 257,710 |
| `forceGraphLayout.ts` | 0 | yes | yes | 762,022 | 762,022 | 0 | 762,022 |
| `core.ts` | 0 | no / no | no / no | 730,839 / 824,003 | 730,839 / 824,003 | 0 / 0 |  /  |
| `index.ts` | 0 | no / yes | no / yes | 435,388 / 335,859 | 435,388 / 335,859 | 0 / 0 |  / 335,859 |

Every verdict agrees, 40 trials on 33 pictures, and no first draw drifts. 31 trials are priced alike to the pixel; the other nine differ by 3 to 22 px, in the vertical placement, which the page predicts from endpoints cached on the shown cards, and in three pictures by a pixel of a card's height (`sourceAnalysis.ts`, `directory-ancestry.ts`, `directory-flow.ts`). The narrowest verdict's margin is 150 px (`css.ts`).

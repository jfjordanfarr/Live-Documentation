Evidence from the two milestones of the directory flow trial, 2026-11-12, by a builder: pictures and measurements of a trial for comparison, not decisions.

The trial is behind Tuning → 2D Layout → Opened Directory, whose default, Grid, is the opened directory of 2026-10-07: cards about as wide as tall and no line until a file is pinned. Flow stands an opened directory's files in the order the code flows, a file left of the files that use it, and draws one line for each pair of cards on screen where one uses the other; a tall rank wraps into neighbouring columns until the ranks stand about as wide as tall. The trial answers the first-visit review of the same day (`../first-visit/README.md`, finding 3), where a newcomer opened three directories, saw no line and concluded the map draws no connections.

Every picture is 1440 by 900 at a device scale of 1, headless Chromium from the repository's Playwright, on the build of this branch served from `dist/explorer`. `-arrival` is the page as it settles after the link is opened; `-fit` is the same page after a press on Fit, the 2D toolbar's first control.

Two things changed between the milestones, so the Flow pictures come in two sets. Pictures `02` to `15` are the first milestone's: each card stands at the height where its lines are shortest, as a pinned neighbourhood's cards do, and their links now open the second milestone's picture. Pictures `16` to `23` are the trial as it stands: every column stands from the top (the root's answer to an arrival that framed empty space). Picture `07` used a second trial value, the flow with no rank wrapped, which was removed once the wrap was decided from the ranks alone: on the sixty-file directory the two differ by one column.

## Pictures

| Picture | Directory | Opened Directory | Link (after the site's address) |
| --- | --- | --- | --- |
| `01-small-grid` | `scripts/live-docs`, 11 files and 1 directory | Grid | `/?s=N4IgbiBcDMA0IBMoG0QGcDGAnAlgBwBc0B6AGxzAFMBaBAewzRAF0BfIA` |
| `02-small-flow` | the same | Flow | `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIAM7pypfDWkB6BKTCUAtMQzSQAXSFA` |
| `03-medium-grid` | `packages/explorer/src/client`, 20 files and 7 directories | Grid | `/?s=N4IgbiBcDMA0IBMoG0QAcCGBjA1hg5gKYDOA9IQB5oA2A9gE6H2nH1albUCWhAdgC4gAugF8gA` |
| `04-medium-flow` | the same | Flow | `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIfJnQBrTAHNKAZwD0lAB740VcmpXl0a9AlKUAdlwC6QoA` |
| `05-large-grid` | `packages/explorer/src/client/views/localView`, 60 files | Grid | `/?s=N4IgbiBcDMA0IBMoG0QAcCGBjA1hg5gKYDOA9IQB5oA2A9gE6H2nH1albUCWhAdgC6kwPAO5k6WDNQBqokAF0AvkA` |
| `06-large-flow` | the same | Flow | `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIfJnQBrTAHNKAZwD0lAB740VcmpXl0a9AlKUAdjTVhz-dWiwIAanZABdIUA` |
| `07-large-flow-tall` | the same | Flow with no rank wrapped, a value since removed | not reproducible on this branch |
| `08-portal-grid` | the estate sample's `Portal`, 2 files and 6 directories | Grid | `/samples/estate/?s=N4IgbiBcDMA0IBMoG0QAUD2AnALgQwBsQBdAXyA` |
| `09-portal-flow` | the same | Flow | `/samples/estate/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIAAr0a2EAF0hQA` |
| `10-portal-opened-grid` | `Portal` with its six subdirectories opened, 11 files | Grid | `/samples/estate/?s=N4IgbiBcDMA0IBMoG0QAUD2AnALgQwBsR5NdCB6AQQAdqB9AYQwQFNj1t8DymA7HLBgIEWWAM7tSXcgFlmLAhJKcKaPAHMWSjmW4BlAMZYAltRzapFPaLDGDWkAF0AvkA` |
| `11-portal-opened-flow` | the same | Flow | `/samples/estate/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIAAr0a2EPFnl5CAPQBBfPgD6AYVTFKimXOxqDAOxrlUCBJXIBnE8tVqchyghdKz66UwAc0pfUxVzAGV0clJ8GjC3KMcwUnRQkABdISA` |
| `12-large-flow-frame-cap` | the sixty-file directory | Flow with a first, discarded cap: a rank wrapped at the three cards the frame holds | not reproducible on this branch |
| `13-large-flow-tests-off` | the sixty-file directory with Show Tests off, 35 files | Flow | `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIfJnQBrTAHNKAZwD0lAB740VcmpXl0a9AlKUAdjTVhz-dWiwIAanZABdeD0kAGWD-chIA` |
| `14-root-grid` | the scan root, 10 files and 6 directories | Grid | `/?s=N4IgbiBcDMA0IBMoG0QgLoF8g` |
| `15-root-flow` | the same | Flow | `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIEAF0hQA` |

| `16-small-flow-top` | `scripts/live-docs` | Flow, from the top; also `-hover-300ms`, the pointer on `cli.ts` | as `02` |
| `17-medium-flow-top` | `packages/explorer/src/client` | Flow, from the top; also `-hover-0ms`, `-60ms`, `-120ms`, `-300ms`, the pointer arriving on `types.ts` | as `04` |
| `18-large-flow-top` | the sixty-file directory | Flow, from the top; also `-first-paint`, before the continuing search moved it | as `06` |
| `19-root-flow-top` | the scan root | Flow, from the top | as `15` |
| `20-portal-opened-flow-top` | `Portal` with its six subdirectories opened | Flow, from the top; also `-first-paint` | as `11` |
| `21-nested-1-explorer-flow` | `packages/explorer` opened, as the newcomer began | Flow | `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIfJnQBrTAHNKAZwD0lAB740VciAC6QoA` |
| `22-nested-2-src-flow` | then `packages/explorer/src` opened inside it | Flow | `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIfJnQBrTAHNKAZwD0lAB740VciHgz5S1Ru27K5NSvLoQAXSFA` |
| `23-nested-3-client-flow` | then `packages/explorer/src/client` opened inside that | Flow | `/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkQATASwCcBTdAF1XIE8AZTB1AVxqhADM0B3EAF8h8YlADaIfJnQBrTAHNKAZwD0lAB740VciHgz5S1Ru27K5NSvLoD02QuXqtO+peu216BKUoA7LgBdISA` |
| `24-nested-3-client-grid` | the same three directories | Grid | `/?s=N4IgbiBcDMA0IBMoG0QAcCGBjA1hg5gKYDOA9IQB5oA2A9gE6H0jya4EnlV2P2nH0sLdNjxEylGgyb9BpLNQCWhAHYAXEAF0AvkA` |

## What each picture holds

Read from the page. "Columns" is the number of cards and boxes in each column, left to right. "Lines" is the pair lines drawn and "links" the graph's links they stand for; a "return" is a pair whose line reads against the columns, a cycle, drawn as stubs at its two hubs. "Lanes" is the rooms between cards through which lines that skip a column pass. "+N" is the number of cards that still carry the `+N connections` control. "In frame" is the cards and boxes touching the frame at arrival, of which so many whole.

| Picture | Columns | Picture, px | Lines / links / returns | Lanes | +N | In frame (whole) | Fit scale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `01-small-grid` | 3, 3, 3, 3 | 1400 × 635 | 0 | 0 | 10 | 12 (9) | 0.81 |
| `02-small-flow` | 2, 3, 3, 3, 1 | 1658 × 669 | 9 / 37 / 0 | 2 | 10 | 11 (8) | 0.68 |
| `03-medium-grid` | 5, 5, 5, 4, 4, 4 | 2440 × 1040 | 0 | 0 | 20 | 12 (6) | 0.46 |
| `04-medium-flow` | 2, 3, 4, 3, 4, 6, 3, 2 | 3320 × 1380 | 29 / 82 / 0 | 10 | 18 | 7 (4) | 0.34 |
| `05-large-grid` | 8, 8, 8, 8, 7, 7, 7, 7 | 4076 × 1888 | 0 | 0 | 60 | 12 (6) | 0.28 |
| `06-large-flow` | 1, 3, 8, 6, 6, 11, 7, 5, 9, 4 | 4969 × 3178 | 130 / 452 / 1 | 39 | 31 | 3 (2) | 0.23 |
| `07-large-flow-tall` | 1, 3, 8, 12, 11, 7, 5, 9, 4 | 4399 × 3005 | 130 / 452 / 1 | 34 | 31 | 3 (2) | 0.25 |
| `08-portal-grid` | 3, 3, 2 | 838 × 449 | 0 | 0 | 1 | 8 (8) | 1 |
| `09-portal-flow` | 3, 3, 2 | 838 × 449 | 0 | 0 | 1 | 8 (8) | 1 |
| `10-portal-opened-grid` | 8, 3 | 782 × 2019 | 0 | 0 | 10 | 4 (4) | 0.37 |
| `11-portal-opened-flow` | 1, 4, 2, 2, 1, 1 | 2171 × 964 | 12 / 20 / 1 | 1 | 1 | 5 (5) | 0.52 |
| `12-large-flow-frame-cap` | 23 columns of 1 to 3 | 10845 × 1851 | 130 / 452 / 1 | 68 | 31 | 3 (2) | 0.10 |
| `13-large-flow-tests-off` | 1, 2, 6, 5, 8, 3, 4, 5, 1 | 3770 × 1931 | 84 / 289 / 1 | 27 | 34 | 4 (3) | 0.30 |
| `14-root-grid` | 4, 4, 4, 4 | 1265 × 644 | 0 | 0 | 3 | 16 (12) | 0.90 |
| `15-root-flow` | 4, 4, 4, 4 | 1255 × 726 | 1 / 1 / 0 | 0 | 2 | 16 (12) | 0.90 |

| `16-small-flow-top` | 2, 3, 3, 3, 1 | 1658 × 669 | 9 / 37 / 0 | 2 | 10 | 11 (8) | 0.68 |
| `17-medium-flow-top` | 2, 3, 4, 3, 4, 6, 3, 2 | 3320 × 1331 | 29 / 82 / 0 | 11 | 18 | 9 (5) | 0.34 |
| `18-large-flow-top` | 1, 3, 8, 6, 6, 11, 7, 5, 9, 4 | 4969 × 2667 | 130 / 452 / 1 | 44 | 31 | 7 (4) | 0.23 |
| `19-root-flow-top` | 4, 4, 4, 4 | 1255 × 726 | 1 / 1 / 0 | 0 | 2 | 16 (12) | 0.90 |
| `20-portal-opened-flow-top` | 1, 4, 2, 2, 1, 1 | 2171 × 954 | 12 / 20 / 1 | 1 | 1 | 6 (5) | 0.52 |
| `21-nested-1-explorer-flow` | 2, 1 | 583 × 344 | 0 | 0 | 2 | 3 (3) | 1 |
| `22-nested-2-src-flow` | 2, 2 | 583 × 404 | 0 | 0 | 2 | 4 (4) | 1 |
| `23-nested-3-client-flow` | 3, 3, 4, 3, 4, 6, 3, 2, 2 | 4078 × 1486 | 29 / 82 / 0 | 10 | 20 | 9 (6) | 0.28 |
| `24-nested-3-client-grid` | 7, 6, 5, 4, 4, 4 | 2752 × 1472 | 0 | 0 | 22 | 12 (7) | 0.41 |

`Portal` holds two files that do not use each other and six closed directories, and no wire ends on a closed box: Flow draws it exactly as Grid does (`08`, `09`). With its subdirectories opened the lines cross between the directories' outlines (`11`).

## How long an opened directory takes to appear

Five loads of each link in a fresh browser context, the continuing search on as it is for a person. "Appears" is from the navigation to the first drawn picture; "layout" is what the page reports of its own layout (`data-layout-ms`). Medians, with the least and the greatest. The machine was slow that day and a lint ran beside part of the measurement, so the differences between Grid and Flow are within the spread except for the sixty-file directory.

| Directory | Appears, Grid | Appears, Flow | Layout, Grid | Layout, Flow |
| --- | --- | --- | --- | --- |
| small, 12 items | 1216 ms (1161 to 1299) | 1265 ms (1168 to 1537) | 169 ms (157 to 203) | 187 ms (168 to 217) |
| medium, 27 items | 1456 ms (1301 to 1616) | 1491 ms (1466 to 1890) | 311 ms (274 to 366) | 330 ms (326 to 414) |
| large, 60 items | 2234 ms (1951 to 2302) | 2371 ms (2217 to 2797) | 747 ms (685 to 904) | 915 ms (811 to 1204) |
| `Portal`, 8 items | 806 ms (701 to 919) | 775 ms (750 to 1020) | 77 ms (74 to 96) | 80 ms (76 to 90) |
| `Portal` opened, 11 items | 881 ms (839 to 1109) | 1037 ms (839 to 1197) | 186 ms (162 to 238) | 208 ms (173 to 289) |

After the picture appears the continuing search goes on in idle moments. In Grid it never found a cheaper picture; in Flow it moved the picture once in the medium, the large and the opened `Portal` directories.

## What moves when Show Tests is turned off

The sixty-file directory, Show Tests pressed off on the open page; 35 files stay, 595 pairs of them.

| | Cards in another column | Pairs that swap left and right | Pairs that swap above and below |
| --- | --- | --- | --- |
| Grid | 31 of 35 | 238 of 595 | 0 |
| Flow | 22 of 35, all but one by one column | 5 of 595 | 79 of 595 |

Grid keeps alphabetical reading order, not places: taking 25 files out refills the rows. Flow keeps the left-to-right order of use; `wire-gathering.ts`, used with tests shown only by its own test and by `connections.ts`, moves two columns right.

## The switch off

With Opened Directory at Grid, every card's and box's place, size and text, every directory label's box, the number of wires and the camera were read on this branch's build and on a build of commit `99395eef`, for the six directories above (small, medium, large, scan root, `Portal`, `Portal` opened): identical in all six.

## From the top, against where the lines were shortest

The same directories and links, first milestone against second. Standing every column from the top fills the first frame: the medium directory's arrival holds its directories and the first three ranks together (`17-…-arrival` against `04-…-arrival`, which shows the directories, 350 px of nothing, and then the first card), and the sixty-file directory's holds seven cards against three (`18` against `06`). The first cards and boxes of every column stand level: 113 px down the page in all eight columns of the medium directory and 77 px in all four at the scan root, where the first milestone's two bands started 22 px apart.

| Directory | In frame at arrival, lines shortest | In frame at arrival, from the top | Picture height, lines shortest | Picture height, from the top |
| --- | --- | --- | --- | --- |
| medium | 7 (4 whole) | 9 (5 whole) | 1380 | 1331 |
| sixty-file | 3 (2 whole) | 7 (4 whole) | 3178 | 2667 |
| scan root | 16 (12 whole) | 16 (12 whole) | 726 | 726 |
| `Portal` opened | 5 (5 whole) | 6 (5 whole) | 964 | 954 |

At Fit the lines read somewhat worse from the top (`18-…-fit` against `06-…-fit`). Where the lines were shortest, a much-used file stood level with the middle of its users and its lines left as one long level trunk with short branches; from the top, the same file stands near the top of its column, its users are spread below, and its lines sweep down in longer curves that run beside one another through the gutters. The order of use left to right reads the same in both; tracing one line by eye is harder from the top, and is what the hover is for.

## The picture moving after it appears

The continuing search goes on in idle moments after the first paint and may adopt a cheaper order. Read on the second milestone's build, one load each: "moved" counts the cards and boxes that stood somewhere else on screen once the page had settled than at the first paint, the camera's own settling of 2 to 6 px aside.

| Directory | Orders adopted after the first paint | Moved | Greatest move | Median move |
| --- | --- | --- | --- | --- |
| small | 0 | none | | |
| medium | 0 | none | | |
| sixty-file | 1 | 55 of 60 | 2286 px | 336 px |
| scan root | 0 | none | | |
| `Portal` opened | 2 | 11 of 11, most by the camera's settling alone | 436 px | 4 px |
| `packages/explorer`, `src` and `client` opened | 1 | 30 of 30 | 123 px | 123 px |

`18-large-flow-top-first-paint` and `18-large-flow-top-arrival` are the sixty-file directory before and after its move; `20-…-first-paint` and `20-…-arrival` are the opened `Portal`. In Grid the search adopts nothing in any of them.

## Nested opening, as the newcomer did it

`packages/explorer` holds two files that join nothing and one directory, and `src` inside it two directories: Flow draws both as Grid does (`21`, `22`). With `client` opened inside them (`23`) the three outlines nest, `src`'s closed `shared` stands above `client`'s outline, and the flow is `client`'s own. One wart is visible there: `client`'s first column starts below its parent's `shared` box, about 30 px lower than its other columns, so its band of directories is not level and its outline steps up after the first column.

## The hover

`17-medium-flow-top-hover-0ms` to `-300ms`: the pointer arrives on `types.ts`. Its 7 lines and the 8 cards at their ends keep their look; the other 22 lines fade to 0.1 and the other cards and the closed boxes to 0.5, over the stylesheet's 150 ms. No card or box moved and the page held the same 3,616 elements before and during the hover; leaving the card restored every line. On the small directory (`16-…-hover-300ms`) every line is `cli.ts`'s, so its hover fades only `run-all.ts` and the closed box.

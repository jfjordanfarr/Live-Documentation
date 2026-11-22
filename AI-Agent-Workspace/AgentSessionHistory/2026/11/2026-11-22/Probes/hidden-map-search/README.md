# Why the hidden-map case ran out of time on 2026-11-22

Historical evidence of this date: what was measured on 2026-11-22, on which code, at what machine load. It is not a description of the product as it stands later.

## The question

At the day's gate the case "the search pauses while another view is shown, and a return to the unchanged picture keeps it and resumes the search" (`tests/e2e/local-map-hidden.spec.ts`, tagged `@alone`, run alone at one worker) waited 45 s after the return to the map for the Local Map to be at rest, and it never was. It had passed the gate the day before, at `76cd9914c`. Three causes were possible: the search no longer resumed or ended after the return (a fault of the product); each of its steps cost more than the day before (a regression); or the picture it searched had grown (honest growth).

## What was measured

A probe built on the case's own steps (the same five files of this repository retained whole, the same tuning: no starts before paint, 80 seeds with a patience of 80, moves at zero length, the arrival held at reading size) read the root's search attributes, the map's `data-camera` and `data-arrival` and the root's `data-moving` once a second from the return until the map had stood at rest for three seconds, and counted the page's long tasks. Each run was alone in the browser lane, at one worker. The probe was a temporary spec; `summarize.cjs` here reads its output files, which are kept beside it.

| Run | Code | Picture (bundle data) | Load (1-min) | Cards | Wires | Seeds | Joins | Adopted | Return to end | Long-task time per trial |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `yesterday-switch.json` | `76cd9914c` | `76cd9914c`'s | 2.8 to 2.0 | 110 | 630 | 80 | 107 | 18 | 24.9 s | 157 ms |
| `today-switch.json` | `cb7a75798` | `cb7a75798`'s | 6.5 to 4.1 | 114 | 685 | 80 | 278 | 34 | 54.8 s | 180 ms |
| `today-switch-wireoff.json` | `cb7a75798`, Wire Answers off | `cb7a75798`'s | 2.7 to 4.6 | 114 | 685 | 80 | 278 | 34 | 70.2 s | 220 ms |
| `ycode-tdata.json` | `76cd9914c` | `cb7a75798`'s, served in its place | 4.1 to 2.8 | 114 | 685 | 80 | 278 | 34 | 58.3 s | 179 ms |

The yesterday runs were made from a second checkout of `76cd9914c`, built with `npm run build` and `npm run e2e:bundles`; the swapped picture was the other checkout's `explorer-data.json`, served in the page's place by the probe.

## What it shows

- **The search pauses, resumes and ends.** In every run no trial was made in the 800 ms the map was hidden, the trials went on from where they stood after the return, and the search ended (`capped`), with the camera and the root at rest. The arrival said nothing throughout: held at reading size, it does not pull back. The product's pause and resume are not at fault.
- **A step costs what it cost the day before.** On the same picture, yesterday's code and today's made the same trials in the same order (80 seeds, 278 joins, 34 adoptions) at the same cost per trial (179 and 180 ms of long tasks), and Wire Answers off changed neither count. The time per trial moves with the machine's load more than with the code.
- **The picture grew.** The repository's own five-file picture went from 110 cards and 630 wires at `76cd9914c` to 114 cards and 685 wires at `cb7a75798`. The search's joins went from 107 to 278 and its adoptions from 18 to 34: each adopted picture brings its own new set of joins to try, so a few more cards made the search more than twice as long. On November 18 the same case counted 121 joins.

So it was honest growth: a case whose subject is this repository waits on a search whose length is the repository's size, and it will be outgrown again whatever its wait.

## A subject that does not grow

The same probe on the estate sample (`/samples/estate/`, built from `tests/integration/programs/csharp/estate`), the same tuning, sampled every 250 ms, alone at one worker, load 2.7 to 1.9:

| Run | Files retained | Cards | Wires | Seeds | Joins | Adopted | Return to end |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `estate-8-files-80-seeds.json` | 8 of its C# files | 23 | 91 | 80 | 15 | 6 | 5.4 s |
| `estate-8-files-300-seeds.json` | the same 8 | 23 | 91 | 300 | 15 | 6 | 16.1 s |
| `estate-20-files-80-seeds.json` | all 20 C# files | 29 | 108 | 80 | 24 | 7 | 4.4 s |
| `estate-20-files-300-seeds.json` | all 20 | 29 | 108 | 300 | 24 | 7 | 15.8 s |

The joins are the picture's whatever the seeds, and the seeds go at some nineteen a second, paced by the page's idle moments rather than by their cost (a few milliseconds of long task each). On the estate the first trials after the paint are joins of the first picture: a view switched in the first half second finds no seed yet tried, so a case that asks the search to go on from the seed after the last tried must switch once seeds have been tried. The case of the other view now takes the twenty files with 160 seeds and switches once forty are tried.

`search-probe.pw.ts` is the probe as it was run, from `tests/e2e/` (its imports are relative to that folder); it was removed from there after the measurement.

# How much memory the 3D Local Map asks for, per file and per link

Historical measurement, 2026-10-28, taken by the root agent for the owner's question in [Turn 3 of the October 28 session](../../../ChatHistory/2026/10/2026-10-28.1.record.md#turn-3): at what size could no browser render the whole 3D graph, and can a regression line say where memory runs out. It records what the code of this date costs; it decides nothing. The structured numbers are in [capacity-measurements.json](capacity-measurements.json); the scripts live in the ignored folder `AI-Agent-Workspace/tmp/capacity-2026-10-28/` and read the built bundles only.

## What was measured

In Node 22, with the garbage collector run before every reading and typed arrays counted beside the heap: the bundle's text and its parsed form, the Explorer graph built from it, the spatial graph the 3D view simulates, the field and motion arrays, and `three-forcegraph`'s own objects (a mesh per sphere, a line per wire), on the estate sample, this repository and the T3 bundle, the last at four sizes by taking the first 1,000, 5,000 and 10,000 of its 21,720 spheres and the wires among them. Headless Chromium 145 on the same machine was asked for its heap limit.

## The bundles

| Bundle | File | Nodes, links in the bundle | Text while loading | Parsed | Explorer graph | Spatial graph (spheres, wires) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| estate | 74 KB | 36, 95 | 0.1 MB | 0.1 MB | 0.1 MB | 0.0 MB (36, 60) |
| this repository | 6.3 MB | 877, 4,519 | 12.1 MB | 10.3 MB | 2.4 MB | under 1 MB (877, 2,049) |
| T3 | 124.6 MB | 28,145, 124,093 | 237.7 MB | 216.7 MB | 50.4 MB | 7.1 MB (21,720, 72,137) |

The parsed bundle is 1.7 to 1.8 times the file's bytes: 12.4 KB per node in this repository, 8.1 KB per node in T3. The text is two bytes a character here because the JSON holds characters outside Latin-1; the page reads the bundle with `response.json()`, which need not hold such a string, so the browser's loading peak is to be read there, not assumed from this.

## What the 3D view adds, by count

| Spheres, wires | Field and motion | Library objects | Meshes |
| ---: | ---: | ---: | ---: |
| 36, 60 | 0.1 MB | 0.5 MB | 96 |
| 877, 2,049 | 0.6 MB | 6.4 MB | 2,926 |
| 1,000, 546 | 0.4 MB | 3.3 MB | 1,546 |
| 5,000, 8,117 | 2.6 MB | 26.2 MB | 13,117 |
| 10,000, 26,992 | 4.8 MB | 45.3 MB | 36,992 |
| 21,720, 72,137 | 11.2 MB | 110.2 MB | 93,857 |

Least squares through the origin over these points:

- The field and motion: 506 bytes a sphere and 9 bytes a wire.
- The library's objects: 4,535 bytes a sphere and 222 bytes a wire.

So at T3's size the 3D view adds about 120 MB to the 275 MB the parsed bundle and the Explorer graph already hold for the 2D views, about 400 MB resident in all, apart from what the browser itself holds for the page (labels in the DOM, the instanced batches' buffers, the renderer's state), which was not measured here.

## The line and where it crosses

Per file, at T3's content and its 4.4 bundle links and 3.3 wires a file: parsed 8.1 KB, Explorer graph 1.8 KB, spatial graph 0.3 KB, field 0.5 KB, library 4.5 KB plus 0.7 KB for its wires, about 16 KB resident a file. Headless Chromium on this machine reports a heap limit of 3,586 MB (`performance.memory.jsHeapSizeLimit`, a Chromium-only reading; it reports no `deviceMemory` headless). On that line and that limit:

| Budget | Files the resident picture fits |
| ---: | ---: |
| 1,024 MB | about 64,000 |
| 2,048 MB | about 128,000 |
| 3,586 MB | about 224,000 |

Before the resident picture, the load itself peaks: in Node the text and the parsed form stand together, about 17 KB a file, which would cross the same limit near 210,000 files; the page's own peak was not measured. The 3D view's share of the line is about a third; the bundle's load, which every view needs, is the larger part. What the line says about T3 itself: its 3D view was far from any memory wall; the diagnosis of 2026-10-27 found the freeze in time (the naming loop and the exact field), not in memory.

## What this does not say

Time is the nearer wall than memory. One exact evaluation of the field at 21,720 spheres took 2.2 s on this machine and an octree evaluation about a quarter of a second (the morning's measurement in [the session record](../../../ChatHistory/2026/10/2026-10-28.1.record.md#planning-checkpoint-what-the-3d-repair-would-be)); at 100,000 spheres an octree evaluation would take seconds, and a picture at that size would settle at well under a frame a second unless an evaluation were spread across frames. Where a machine's memory ends is a prediction from this line and the browser's reported limit; where its patience ends is a judgment. How the software should behave at either is the owner's question, open at the time of this record.

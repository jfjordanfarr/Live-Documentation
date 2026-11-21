# The built Explorer on a machine without a graphics card

Historical evidence, taken on November 21, 2026 by the root itself, on the build of `main` at `370d1a51b` that stood in `dist/explorer/`. It changed no product code. One script, [`probe.mjs`](probe.mjs), run twice through the browser lane.

The question came from the owner's answer of that day about the machine they would show the tool on: "Absolute crap VM. No idea on graphics card, but we're talking about a VM that has 8GB of RAM and a handful of GB of remaining storage available. We want this to be able to run on absolute garbage" ([Turn 1](../../2026-11-21.1.record.md#turn-1)). Every bound in the browser suite is measured on this machine, twenty threads and an RTX 3090. Nobody had opened the Explorer as that VM would.

## What was done

Headless Chromium (Playwright 1.61.1) opened four addresses of the built site, each in a fresh page of 1,280 by 800, and counted the frames the page drew, the time its main thread was blocked by tasks longer than 50 ms, and what stood on screen 3 and 12 seconds after the address was asked for.

- **The subjects:** the estate sample (36 files, the miniature of the owner's C# estate) with `PaymentService/PaymentService.cs` as its subject, in 2D and in 3D; and this repository's own map (1,134 files) with `packages/engine/src/live-docs/graph.ts`, in 2D and in 3D.
- **The conditions:** the graphics card as the browser suite uses it; WebGL drawn in software (SwiftShader) with the page's processor slowed four times and six times by the browser's own throttle; the same four-times run again with the whole browser held to two processor cores (`taskset -c 0,1`); and WebGL refused (`--disable-3d-apis`), which is what a browser does when a policy or a driver's blocklist turns it off.

## What it found

Frames a second over the two seconds before each reading; "blocked" is the main thread's long tasks summed up to the second reading.

| Drawing | Subject | After 3 s | After 12 s | Blocked |
| --- | --- | ---: | ---: | ---: |
| The card | estate, 2D | 60 | 60 | 0.6 s |
| The card | estate, 3D | 60 | 60 | 0.7 s |
| The card | this repository, 2D | 14 | 60 | 4.0 s |
| The card | this repository, 3D | 60 | 60 | 0.7 s |
| Software, four times slower | estate, 2D | 9 | 60 | 3.0 s |
| Software, four times slower | estate, 3D | 16 | 32 | 2.1 s |
| Software, four times slower | this repository, 2D | 1 | 5 | 14.1 s |
| Software, four times slower | this repository, 3D | 5 | 5 | 11.5 s |
| Software, six times slower | estate, 2D | 5 | 60 | 5.0 s |
| Software, six times slower | estate, 3D | 6 | 25 | 3.9 s |
| Software, six times slower | this repository, 2D | 2 | 2 | 20.5 s |
| Software, six times slower | this repository, 3D | 4 | 5 | 10.8 s |
| Software, four times slower, two cores | estate, 2D | 15 | 60 | 2.5 s |
| Software, four times slower, two cores | estate, 3D | 12 | 23 | 5.4 s |
| Software, four times slower, two cores | this repository, 2D | 2 | 5 | 12.3 s |
| Software, four times slower, two cores | this repository, 3D | 2 | 2 | 13.0 s |
| WebGL refused | estate, 2D | 60 | 60 | 0.4 s |
| WebGL refused | estate, 3D | fatal error | fatal error | |
| WebGL refused | this repository, 3D | fatal error | fatal error | |

1. **A map the size of the estate sample holds up without a card.** Its 2D picture is whole within five seconds and then smooth; its 3D picture draws at 23 to 32 frames a second ([2D](software-6x--estate-2d--12s.png), [3D](software-6x--estate-3d--12s.png)).
2. **This repository's own map does not.** Its 3D picture is drawn and reads ([the picture](software-6x--repo-3d--12s.png)) at two to five frames a second. Its 2D picture is drawn ([the picture](software-6x--repo-2d--12s.png)) while the page gives one to five frames a second for at least the first twelve seconds; the 2D map's continuing search for a cheaper arrangement runs on the page's main thread, and on the card it took about a minute for a picture of this size.
3. **Where WebGL is refused, a link to the 3D map is a dead page.** `SpatialRenderer` creates its `WebGLRenderer` with nothing to catch a refusal (`packages/explorer/src/client/views/forceGraphRenderer.ts`), and the page shows "The Explorer stopped" with a stack trace and an empty map ([the picture](no-webgl--estate-3d--12s.png)); on this repository's map the page also goes on saying that it is building. The 2D map of the same subject works there.

## What it does not show

- The owner's machine. The throttle slows the page's own thread and not the threads that draw WebGL in software, so the first two software rows had twenty threads to draw with; the two-core rows are nearer a small VM and are still this machine's cores. The numbers rank the risks; they do not predict that machine.
- A map of the owner's size. They scope a scan to a solution; the estate sample is 36 files and this repository 1,134, and nothing between was opened.
- Memory beyond the page's heap, which stayed between 10 and 73 MB.
- Any interaction: no pin, no press of 2D or 3D, no zoom.
- Whether that VM's browser gives WebGL at all.

## Root's reading

The risk on that machine is the 3D map and the 2D map's continuing search, in that order, and it grows with the picture; a map of solution size is probably comfortable in 2D. The dead page where WebGL is refused is a defect whatever is decided, and is sent to a builder the same day. The rest is a question for [the work item on a modest machine](../../../../../../Work/explorer-holds-a-large-map.md), whose "about ten thousand files" this replaces as the thing to measure.

## The files

| File | What it is |
| --- | --- |
| [`probe.mjs`](probe.mjs) | The script: `node scripts/browser-lane.mjs --label <who> -- node probe.mjs <repository> <out folder>`; `ONLY=<conditions>` chooses conditions; under `taskset -c 0,1` for two cores |
| [`rows-all-cores.json`](rows-all-cores.json) | Every reading of the first run |
| [`rows-two-cores.json`](rows-two-cores.json) | The run held to two cores, and the 2D map where WebGL is refused |
| The five pictures | Each named for its condition, its subject and the second it was taken |

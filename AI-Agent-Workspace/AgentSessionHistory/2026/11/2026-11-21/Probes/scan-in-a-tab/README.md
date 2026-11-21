# A scan inside a browser tab, on a slowed machine

Historical evidence, taken on November 21, 2026 by the root itself on the engine of the day branch at `501a993f2`. It changed no product code.

The question was the one left open under the fork put to the owner that day, "how long a scan takes in a tab on that VM", and it was being measured when their answer arrived ([Turn 2](../../2026-11-21.1.record.md#turn-2)): "Explore the possibility space that enables both if possible and elegant with great architecture. If not possible, explore the possibility space of what can be done with a page."

## What was done

The scanning page of [the probe of November 19](../../../2026-11-19/Probes/execution-surface/README.md) (the unchanged engine and generator, bundled for a browser with stand-ins for Node's file system) was built again from today's engine by [`build-page.mjs`](build-page.mjs), which reads that probe's entry and stand-ins from its folder. [`measure.mjs`](measure.mjs) opened the page from disk in headless Chromium (Playwright 1.61.1), handed it a folder through an `<input webkitdirectory>`, and timed the scan; while the scan ran the page counted the frames it could draw.

- **The folders:** the estate sample as it is in the repository (90 files, 88 mapped); `DNN Platform/Modules` (845 files, 796 mapped) and `DNN Platform/Library` (1,413 files, all C#) of DNN at `9bc6b06f`, copied without `.git`.
- **The conditions:** the machine as it is (twenty threads); and the page's processor slowed four times by the browser's own throttle with the whole browser held to two cores (`taskset -c 0,1`), the nearer of the two to a small VM.

## What it found

### The page of November 19 did not survive two days of engine work

Built from today's engine it failed three times before it ran, each time on something `tooling/gitIgnored.ts` had come to ask of Node since: an import of `node:process` (the bundle would not build), `fs.lstatSync` (the scan threw), and `fs.statSync` answering `undefined` under `throwIfNoEntry: false` (the scan threw on the first folder without a `.git`). Three additions to the stand-ins ([`shims/process.mjs`](shims/process.mjs), [`shims/fs.mjs`](shims/fs.mjs)) made it run; a fourth, `unlink`, was added on reading the code and not on a failure. Nothing had said that the engine no longer ran in a page; no check exists that could. Whether today's page still writes what Node writes was not compared here: the probe's stand-in for `glob` ignores the file system `gitIgnored.ts` now hands it.

### The times

Each from a fresh browser. The estate's and Modules' rows are from the second round, taken with the machine quiet (load about 3.5); the library's row is from the first round (load 12 at full speed, 5 slowed).

| Folder | Files | Scan, machine as it is | Scan, slowed four times on two cores | The page ready to scan, as it is and slowed | Peak memory of the tab |
| --- | ---: | ---: | ---: | ---: | ---: |
| The estate sample | 90 | 0.3 s | 1.6 s | 0.9 s, 3.8 s | 234 MB |
| DNN Modules | 845 | 3.9 s | 15.9 s | 1.0 s, 3.9 s | 299 MB |
| DNN Library | 1,413 | 20.9 s | 80.2 s | 2.4 s, 4.6 s | 586 MB |

Under load the same scans took far longer: DNN Modules slowed took 58.6 s while three builders were working (load 32). A shared or busy VM would feel like that row and not the quiet one.

### The page draws nothing while it scans

In every run the longest stretch without a frame was the whole scan: 20.8 of 20.9 seconds, 79.8 of 80.2. With the folder's files already in memory, the scan is one unbroken chain on the page's main thread and never lets the browser draw. So a progress indicator on that page could not move, and the tab would look hung for a minute and more. The scan has to hand the thread back on purpose between files, or run on a thread of its own.

### Each file is read four to six times

381 reads for the estate's 90 files, 3,607 for 845, 8,465 for 1,413. The join's builder found the same from the code the same day: the generator's sniff and its reading, each reader in two passes, and the tables readers build across files.

## What it does not show

- The owner's machine. The numbers rank what matters; they do not predict that VM.
- Reading the folder. The page took 2 to 18 seconds to take the files in, but they came through the test driver's own transport, which is not how a picked folder is read. Unmeasured: a real folder picked by a person, and a folder of a hundred thousand files, most of them packages, which this page would read whole before scanning (the owner's clone, [Turn 3](../../2026-11-21.1.record.md#turn-3)).
- PowerShell, SQL or TypeScript at size; only C# with its neighbours was scanned at size here. The probe of November 19 scanned 1,973 PowerShell files in 62 s at full speed.
- The viewer. This page scans and shows nothing.

## Root's reading

A scan of a solution's size in a tab is a matter of seconds to a minute or two on a weak machine, and of a few hundred megabytes: slow enough to need an honest progress indicator, not slow enough to rule the page out. Three things follow for whatever is built: a standing check that the engine runs in a page, since it stopped once already unnoticed; a scan that yields the thread, so that progress can be drawn; and one reading of each file, which would cut the work on exactly the machine that has least to spare.

## The files

| File | What it is |
| --- | --- |
| [`build-page.mjs`](build-page.mjs) | From the repository root: `node <this file> --out <scratch folder>` writes `page.html` (5,613,398 bytes today) and `sizes.json` |
| [`shims/process.mjs`](shims/process.mjs), [`shims/fs.mjs`](shims/fs.mjs) | The three additions to the stand-ins of November 19 |
| [`measure.mjs`](measure.mjs) | `node scripts/browser-lane.mjs --label <who> -- [taskset -c 0,1] node <this file> <page folder> <folder to scan> <rate>`; prints one line of JSON |
| [`rows.json`](rows.json) | Every run, both rounds; the first four of the first round were taken before the freeze measure was corrected and say so |

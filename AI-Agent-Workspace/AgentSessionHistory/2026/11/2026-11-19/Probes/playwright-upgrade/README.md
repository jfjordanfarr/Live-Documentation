# Moving the browser suite from Playwright 1.58.2 to 1.61.1, so that its browser installs under Node 26

_Historical evidence: a record of November 20, 2026 (UTC), from 05:43 UTC, by a builder for the root in its own worktree, from `6ed67e485`. It is not current documentation. Numbers are of this machine (ten cores, twenty threads, the host's RTX 3090 reached through WSL2) on this date, shared with other builders; every heavy step ran through the browser lane._

## The answer in short

- **The cause of the stuck install is gone from 1.60.0 on**, and confirmed so here: Playwright 1.65.1 and 1.61.1 each installed their browsers under Node 26.13.1 in well under a minute, where 1.58.2 never returned.
- **But Chromium 151 and later no longer reach the graphics card here**: their GPU process finds no EGL configuration it can use in Mesa's `d3d12` driver and falls back to SwiftShader without a word. Playwright's own headless shells, probed under the suite's unchanged launch: 145, 148 and 149 draw on the card; 151, 153, 156 and 159 draw in software. The newest Playwright whose shell still reaches the card is **1.61.1** (Chromium 149.0.7827.55); 1.62.0 is the first to lose it.
- **So this repository moves to Playwright 1.61.1, and is held there** until the browser reaches the card another way (the last section). The root ruled so on the first handback.
- **The whole browser stage on 1.61.1, on the card**: 609 cases, 600 passed, 2 failed, 7 skipped, in 43.3 minutes against the baseline's 43.0, and 81.8 minutes of case time against 80.4 (the cases that passed in both: +1.4%). One case newly failed, `explorer-navigation.spec.ts:126`, which passed alone three times in three at the baseline's time and passed beside its stage neighbour three times, with its wait four fifths full: a case on its time limit under load, not the browser. Five newly passed. `force-graph-discovery.spec.ts:70` failed in both, as known. `npm audit` before and after: 0 vulnerabilities.

## Why

The dev container was rebuilt for Node 26 on November 20, and its set-up script (`.devcontainer/post-create.sh`) stopped at `npx --no-install playwright install --with-deps chromium`: the browser's archive downloaded to 100% and its unpacking never returned.

**What was confirmed, and how.** In the installed Playwright 1.58.2 (`node_modules/playwright-core`), the browser's archive is unpacked by `lib/server/registry/oopDownloadBrowserMain.js` through `zipBundle.extract`, a bundle whose notices name `yauzl@3.2.0` (`ThirdPartyNotices.txt`). Playwright's issue 40724, "[Bug]: `playwright install` hangs in node v26", read on GitHub: the hang is in extracting the archive, the reporter points at yauzl and its fix (thejoshwolfe/yauzl#168), and the issue was closed by Playwright's pull request 40747 on May 9, 2026. The issue page does not name the release that carried the fix; users' commits on it name 1.60.0 ("bump Playwright to ^1.60.0 (fixes install hang on Node 24.16+)"). Playwright 1.65.1 as installed bundles `yauzl@3.4.0` (`lib/utilsBundle.js.LICENSE`); yauzl's own change list between the two names fixes "related to interrupting streams with `destroy()` and with async iteration on read streams" (3.3.1). Which of yauzl's changes ends the stall was not read in code; that the install returns under Node 26 was measured, for 1.65.1 and for 1.61.1, and the shells of 1.60.0 to 1.64.1 were each installed by their own Playwright under Node 26 in the probe below.

## 1. Dependencies

Before, from the lock at `6ed67e485` after `npm ci` (14 s, in the lane, load 5.4): `npm audit` found 0 vulnerabilities; `npm ls` gave `@playwright/test@1.58.2` → `playwright@1.58.2` → `playwright-core@1.58.2`.

First `npm install -D @playwright/test@1.65.1` (npm 11.21.1, Node 26.13.1), the newest stable by npm's registry at 05:45 UTC (`latest` 1.65.1). Then, once 1.65.1's browser was found not to reach the card, `npm install -D @playwright/test@1.61.1`, and at the root's ruling (07:30 UTC) `npm install -D --save-exact @playwright/test@1.61.1`: `package.json` and the lock's root now ask for exactly `1.61.1`, no range, so that no install drifts to a browser that cannot reach the card. The lock changed only the three packages' versions, addresses and checksums (1.65.1 had also raised their `node` engine to `>=20` and dropped the macOS-only `fsevents`; 1.61.1 does neither). After: `npm ls` gives `@playwright/test@1.61.1` → `playwright@1.61.1` → `playwright-core@1.61.1`. `npm audit` after, at 1.61.1 pinned: 0 vulnerabilities.

## 2. The browser installs under Node 26

```bash
PLAYWRIGHT_BROWSERS_PATH=/tmp/claude-1000/pwup/browsers npx playwright install chromium
```

On 1.65.1, run in the lane at 05:58 UTC (load 5.4), into a private folder (the default `~/.cache/ms-playwright` was left alone: the hung install held it). It returned in **39 s**, downloads included, having installed Chrome for Testing 159.0.8154.6 (`chromium-1255`, 414 MB), Chrome Headless Shell 159.0.8154.6 (`chromium_headless_shell-1255`, 282 MB) and FFmpeg (`ffmpeg-1013`). Under 1.58.2 the same command never returned (the suite-time record: unzipping stopped after one to two files; `unzip` took 2.9 s on the same archive). The suite runs the headless shell, as before.

On 1.61.1, the set-up script's own line as written, `npx --no-install playwright install --with-deps chromium`, with only the browsers' folder made private, in the lane at 07:08 UTC (load 26 from a neighbour's run that had just ended, 13 a minute later): it returned in **36 s**, exit 0. Its system step found all 32 of Playwright's packages already installed ("0 newly installed"); it installed Chrome for Testing 149.0.7827.55 (`chromium-1228`), Chrome Headless Shell 149.0.7827.55 (`chromium_headless_shell-1228`) and FFmpeg (`ffmpeg-1011`). So `post-create.sh` needs no change. The probe on that folder's shell gave `ANGLE (Microsoft Corporation, D3D12 (NVIDIA GeForce RTX 3090), OpenGL ES 3.1)`.

## 3. Chromium 151 and later lose the graphics card

`npm run build` (20 s) and `npm run e2e:bundles` (45 s, with the main checkout's `.mdmd/history` copied in: 1,333 commits) each ran in a lane hold of their own. The whole browser stage on 1.65.1 then ran at 06:00 UTC and stopped after 11 s, before any case, on the suite's own guard, as `tests/e2e/renderer-report.ts` is written to:

```text
WebGL in this run is drawn by: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
Error: The container has a graphics card (/dev/dxg) but the browser is not drawing on it.
```

Mesa's EGL was installed system-wide by then (`libegl1 1.7.0-1+b2`, `libegl-mesa0 25.0.7-2+deb13u1`, `libgl1-mesa-dri 25.0.7-2+deb13u1`, `d3d12_dri.so` present), so the private copies fetched beforehand were not used.

**The browser changed, not the machine.** [`gpu-probe.ts`](gpu-probe.ts) launches a browser exactly as the suite does (`browserLaunchOptions()` from `tests/e2e/browser-launch.ts`, unchanged: `--use-angle=gl-egl --disable-gpu-compositing`, `GALLIUM_DRIVER=d3d12`, WSL's libraries first on the library path) and prints the WebGL renderer; `--executable` runs another build under the same Playwright 1.65.1. Each release's own headless shell, installed by that release (`npx -y playwright@<version> install chromium-headless-shell`, a private folder each), on the same machine with the same system libraries, in lane holds at 06:17 and 06:45 UTC:

| Playwright | Headless shell | Renderer |
| --- | --- | --- |
| 1.58.2 | 145.0.7632.6 (`1208`; the focus builder's private copy, read only) | **ANGLE (Microsoft Corporation, D3D12 (NVIDIA GeForce RTX 3090), OpenGL ES 3.1)** |
| 1.60.0 | 148.0.7778.96 (`1223`) | **ANGLE (Microsoft Corporation, D3D12 (NVIDIA GeForce RTX 3090), OpenGL ES 3.1)** |
| 1.61.1 (and 1.61.0, the same build) | 149.0.7827.55 (`1228`) | **ANGLE (Microsoft Corporation, D3D12 (NVIDIA GeForce RTX 3090), OpenGL ES 3.1)** |
| 1.62.1 (and 1.62.0, the same build) | 151.0.7922.34 (`1234`) | ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero))), SwiftShader driver |
| 1.63.0 | 153.0.8010.12 (`1243`) | SwiftShader, as above |
| 1.64.1 | 156.0.8078.4 (`1248`) | SwiftShader, as above |
| 1.65.1 | 159.0.8154.6 (`1255`) | SwiftShader, as above |

That 1.61.0 and 1.61.1, and 1.62.0 and 1.62.1, carry the same build was read from each release's `browsers.json` (`npm pack playwright-core@<version>`), not probed twice. **The first Chromium to fail is 151.0.7922.34**; the builds between 149.0.7827.55 and it were not tried, since Playwright ships none.

**What the new browser's GPU process says.** With `--enable-logging=stderr --v=1` (159):

```text
ERROR:ui/gl/gl_surface_egl.cc:267] No suitable EGL configs found.
ERROR:ui/gl/gl_surface_egl.cc:1013] No suitable EGL configs found for initialization.
ERROR:gpu/ipc/service/gpu_init.cc:124] CollectGraphicsInfo failed.
ERROR:components/viz/service/main/viz_main_impl.cc:192] Exiting GPU process due to errors during initialization
```

The log also names the step that wanted the configuration, `gpu_info_collector.cc:86] gl::GLContext::CreateOffscreenGLSurface failed`, after which the browser starts SwiftShader (`GPU.ProcessLifetimeEvents.SwiftShader`). Shell 145 logged none of these lines.

**What Mesa says** (`EGL_LOG_LEVEL=debug`), held against the newest shell that works (149, at 07:09 UTC):

| | Chromium 149 (on the card) | Chromium 159 (in software) |
| --- | --- | --- |
| Mesa's account of the display it was given | `Native platform type: x11 (build-time configuration)`, then `DRI3: Could not get DRI3 device` | no such line |
| Configurations Mesa offers | 317, every one for window, pbuffer, pixmap and preserved surfaces (`win,pb,pix,prsv`) | 48, every one for **window surfaces only** (`win,`) |
| Shared by both | two `EGL_BAD_MATCH` in `eglCreateContext: dri2_create_context`, and `eglPrintConfigDebug: nothing to print` | the same |

Read together: Chromium 149 opens Mesa's EGL display the old way (`eglGetDisplay` with the default display, which Mesa resolves by its build-time default platform, x11), and there the `d3d12` driver offers offscreen (pbuffer) configurations; Chromium 159 opens it some other way that Mesa does not log, gets configurations for windows only, and its first step, an offscreen surface to collect the card's details (`CreateOffscreenGLSurface`), finds none. That reading is from the logs, not from Chromium's source; which platform the new Chromium asks for was not found. It would also explain why `EGL_PLATFORM=surfaceless` changed nothing: Mesa reads that variable only for a display opened the old way.

**What was tried on 159 and did not help**, one change at a time, each still SwiftShader: `--ignore-gpu-blocklist`; `--use-gl=angle`; both together; `EGL_PLATFORM=surfaceless`; and the full Chrome for Testing 159 in its new headless mode instead of the shell.

**So this repository is held at Playwright 1.61.1** (Chromium 149) until the browser reaches the card another way. Ways that can be seen, **none tried**:

- **ANGLE over Vulkan, through Mesa's Vulkan driver for Direct3D 12 (`dzn`)**: `--use-angle=vulkan` (perhaps with `--enable-features=Vulkan`) in `browserLaunchOptions()`, and `mesa-vulkan-drivers` in the set-up script's card step. Changes the launch, the set-up script and the Live Doc's measurements: Mesa's `dzn` is younger than its OpenGL driver, and its speed and correctness for this suite's pictures are unmeasured.
- **A Chromium switch that makes it open Mesa's display the old way, or skips the offscreen surface**, if Chromium has one (the change between 149 and 151 was not found in Chromium's history). Changes only the launch's arguments.
- **A newer Mesa than Debian 13's 25.0.7**, if a later one offers offscreen configurations for `d3d12` on the platform the new Chromium asks for. Changes the set-up script's packages, perhaps their source; unknown whether any does.
- **Telling Chromium's or Mesa's makers**: a report with the two logs above, so that a later Chromium works again without our change.

The root ruled (07:30 UTC) that the hold be written as a decision: `@playwright/test` pinned at exactly `1.61.1` in `package.json`, and Dependabot told not to propose 1.62.0 or later (`.github/dependabot.yml`).

**The test for lifting the pin.** In the container with the card, from the repository's root, fetch a candidate release's headless shell into a folder of its own, then run the probe on it (one command; the WebGL renderer it prints must name `D3D12`):

```bash
PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-candidate npx -y playwright@<version> install chromium-headless-shell
npx tsx --tsconfig tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/playwright-upgrade/gpu-probe.ts --executable "$(ls -d /tmp/pw-candidate/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell)"
```

## 4. The whole browser stage on 1.61.1

The bundles were not rebuilt for it: they do not depend on Playwright's version, and the suite's first global setup proved the server served this checkout's bundles, built together. Run in the lane from 07:09:24 to 07:52:41 UTC (load 13.6 at the start from a neighbour's run that had just ended, 2.7 at the end), with the suite-time builder's reporter beside `list`, which changes no configuration:

```bash
SUITE_TIME_OUT=/tmp/claude-1000/pwup/cases.jsonl node scripts/browser-lane.mjs --label pw-upgrade --max-seconds 5400 -- \
  node scripts/e2e-passes.mjs --reporter=list,<this folder>/duration-reporter.cjs
```

Its first line: `WebGL in this run is drawn by: ANGLE (Microsoft Corporation, D3D12 (NVIDIA GeForce RTX 3090), OpenGL ES 3.1)`. Every case's line is in [`cases-1.61.1.tsv`](cases-1.61.1.tsv) (by [`cases-analyse.mjs`](cases-analyse.mjs)); the baseline is the suite-time builder's stage of 04:27 to 05:10 UTC on 1.58.2, copied here as [`baseline-1.58.2-cases.tsv`](baseline-1.58.2-cases.tsv); [`compare.mjs`](compare.mjs) holds one against the other, a case known by its file, line and title together.

| | Baseline, 1.58.2 (Chromium 145) | 1.61.1 (Chromium 149) |
| --- | ---: | ---: |
| Cases: passed, failed, skipped | 609: 596, 6, 7 | 609: 600, 2, 7 |
| Lane hold (the stage's wall time) | 2,580 s, 43.0 min | 2,597 s, 43.3 min |
| First pass, wall | 40.4 min | 40.5 min |
| Second pass (`@alone`), wall | 2.3 min | 2.5 min |
| Case time | 80.4 min | 81.8 min |
| The 595 cases that passed in both | 4,776 s | 4,844 s (+1.4%) |

(The first and second passes' wall times are measured from the cases' own start and end times; the suite-time record gives 2.4 min for the baseline's second pass, measured otherwise.)

**Newly failing, one:** `explorer-navigation.spec.ts:126`, "a bundle whose docs declare one entry point lands on it" (4.2 s passed; 6.7 s failed). Its triage is below.

**Newly passing, five:** the four `history-panel.spec.ts` cases (`:137`, `:164`, and `:295` at both sizes), which failed in the baseline because that worktree's bundle carried no history, and this one's did; and `force-graph-focus.spec.ts:182` (13.7 s failed; 15.4 s passed), which the suite-time builder found failing once in three alone, a race.

**Failing in both:** `force-graph-discovery.spec.ts:70` (29.0 s; 29.9 s), the known red, a 3D picture that does not come to rest.

**The focus cases** (`force-graph-focus.spec.ts`, as `main` has it, which another builder is changing tonight): all fifteen passed, each within 1.7 s of its baseline time.

**Cases whose time moved by more than a quarter and more than two seconds**, both runs passed:

| Case | Baseline, s | 1.61.1, s | Change |
| --- | ---: | ---: | ---: |
| `local-map-search.spec.ts:65` a change of pins starts the search afresh | 60.0 | 76.8 | +16.8 s (+28%) |
| `local-map-simplicity.spec.ts:179` continuing geometry competition agrees with the headless command: generator | 11.8 | 15.5 | +3.7 s (+32%) |
| `explorer-navigation.spec.ts:83` World Map folder entry retains 3D, and its shared link restores the folder | 4.5 | 6.9 | +2.4 s (+53%) |
| `camera-intent.spec.ts:317` following, pins that cannot all be framed | 22.0 | 16.3 | −5.7 s (−26%) |
| `history-scrubber.spec.ts:785` a drag places every step it crosses | 36.4 | 22.0 | −14.4 s (−39%) |

The first two run the Local Map's continuing search, which works in the page's idle moments and so follows the machine's load; whether that, the browser or chance moved them was not separated (each ran once on each version). Two moved faster by more than they moved slower; over all cases that passed in both, the new browser is within 1.4% of the old.

### Triage of `explorer-navigation.spec.ts:126`

**What the case does.** It routes `explorer-data.json` through `page.route`, reads the real 10.9 MB bundle, empties every file's entry points but one (`packages/engine/src/live-docs/graph.ts`, as a `command`), drops the board, fulfills the page with the rewritten JSON, then asks the page to land on that file: `ready(page, "2d")` waits with Playwright's default five seconds for `#view-map.active .local-placed` to be visible, then for the context to name the file.

**What failed, from its trace** (`test-results/…/trace.zip`, read with a short script): navigation reached its load event at 0.44 s; the route's fetch took 0.05 s; the case's own parse and rewrite 0.26 s; the fulfill was done at 1.41 s. The page then had four seconds and was still at `Loading… Context: None` (`status "Loading"`) when the wait ran out at 5.45 s; the failure's screenshot, taken a moment later, shows the map landed on `graph.ts`, as the case asks. So the route was not slow and the product landed where it should; the picture was placed later than the five seconds allow. In the baseline the same case's waits took 3.5 s of the five at two workers.

**Alone, three times** (`--repeat-each 3 --workers 1`, in the lane at 08:09 UTC, load 1.9): **passed three times, 4.2, 4.0 and 4.0 s**, the baseline stage's 4.2 s.

**Beside the 3D case it ran beside in the stage** (`force-graph-building.spec.ts:192`, two workers, `--repeat-each 3`, in the lane at 08:14 UTC, load 8.0 from the hold before): **passed three times, 4.5, 4.9 and 4.7 s**; its waits took **3.7, 4.1 and 3.9 s of the five**. In the stage a third case (`force-graph-contained.spec.ts:35`) also overlapped it, and the machine's load was falling from 13.6.

**Reading.** On the new browser the case takes alone what it took in the baseline's stage, so the browser did not slow it. Its wait is Playwright's default five seconds, and the work inside it, the page landing a 2D picture of `graph.ts` from a rewritten bundle, fills about 3.2 s alone (by subtraction: those runs were not timed step by step), 3.5 s at two workers in the baseline, and 3.7 to 4.1 s beside a 3D case here: it passes or fails on the load around it. That is the suite's own description of an `@alone` case ("failing at two workers and passing alone", `playwright.config.ts`), but it has failed at two workers once, not reliably, and whether it should be moved to the second pass or the page's landing should be quicker is a decision about the product and the suite, not about the browser. **Not mended**; the question is the root's.

The other new times are not failures, and none was triaged further.

## 5. Release notes from 1.59 to 1.61, for what this suite relies on

Read on playwright.dev (the release notes page), not run. Nothing in 1.59 to 1.61 touches the headless shell against the new headless mode, launch arguments, GPU, WebGL, ANGLE, SwiftShader, `page.clock`, `expect.poll`'s defaults, `webServer` or `globalSetup`. What 1.60 removed (`Locator.ariaRef()`, `exposeBinding`'s `handle`, `connect`'s `logger`, the `videosPath` and `videoSize` options) is used nowhere in `tests/` or `scripts/`. The reporter API only gained things (`onError`'s `workerInfo`, `errorContext`, `fullConfig.argv`, `failOnFlakyTests`), so the timing reporter here is unchanged. The JUnit reporter's split of errors from failures (1.59) does not touch this suite, which uses `list` and `html`. The notes for 1.62 to 1.65, read for the first attempt, named changes that would have mattered (actions waiting for elements to stop being inert, 1.65; accessible names leaving out text that is not rendered, 1.65; `window.screen` following the device, 1.64; a headless clipboard of its own, 1.62); none applies at 1.61.1.

## 6. The set-up script and the documents

`.devcontainer/post-create.sh` is unchanged: its install line works as written on 1.61.1 (section 2). No authored document named Playwright's version or the browser's build as a current fact; the Live Doc of `tests/e2e/browser-launch.ts` says its measurements of 2026-11-17 were taken "with Playwright 1.58.2", which stays true as dated history. The hold at 1.61 is a new standing fact, so it was written where a maintainer would look before moving Playwright: the devcontainer's README, under the graphics card, and the renderer's paragraph of the internal tooling reference. `package.json`'s generated Live Doc, which lists the dependency's range, was regenerated with `npm run live-docs:generate`.

## 7. The gate without the browser

@@GATE@@

## What is in this folder

- [`gpu-probe.ts`](gpu-probe.ts): the renderer a browser draws WebGL with under the suite's own launch; the test for lifting the pin (section 3).
- [`duration-reporter.cjs`](duration-reporter.cjs) and [`cases-analyse.mjs`](cases-analyse.mjs): the suite-time builder's per-case reporter and its tables, copied unchanged so that this record stands alone.
- [`compare.mjs`](compare.mjs): one stage held against another, case by case.
- [`baseline-1.58.2-cases.tsv`](baseline-1.58.2-cases.tsv) and [`cases-1.61.1.tsv`](cases-1.61.1.tsv): every case of each stage.

The temporary folder `/tmp/claude-1000/pwup/` (the private browsers, Mesa's packages fetched as a fallback and never used, the logs) was removed at the end.

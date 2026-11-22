# Two browser cases that failed on the day's tip: whose are they?

Historical record, 2026-11-22. The root asked the mirror's builder to part the causes of two failures by the day's
merges, on three builds: the day's start (`76cd9914c`), the commit before the mirror's first merge (`837c52c76`) and
the day's tip (`1d685ea72`). Each was checked out into a folder of its own, given its own dependencies and built whole
(`npm ci`, `npm run build`, `npm run e2e:bundles`). **Neither failure is the mirror's, and neither is any other merge's
of this day.**

## The lanes case

`tests/e2e/local-map-branches.spec.ts:287`, "a retained exploration threads skipped references through lanes": five
files retained, every wire and lane read whole by the still-picture instrument, inside a limit of one minute.

The case and a probe of it ([`lanes-probe.spec.ts`](lanes-probe.spec.ts), copied into `tests/e2e/` of each build to
run: it does what the case does and prints its times and its highest wire) were run on each build through the browser
lane, alone in the lane. The three runs were one after another, not interleaved, and the machine's load was not the
same for each (other builders' builds ran beside them; the load was not recorded per run): the times below say what the
case costs, and are not a comparison between the builds.

| Build | The case | To the picture drawn | The instrument's reading | Wires, samples read | Highest wire against the highest card |
| --- | --- | --- | --- | --- | --- |
| start `76cd9914c` | passed | 5.4 s | 37.5 s | 481, 220,253 | 165 px below it |
| before the mirror `837c52c76` | **timed out at 60 s, inside the reading** | 42.8 s | 151.3 s | 492, 223,500 | 165 px below it |
| tip `1d685ea72` | **timed out at 60 s, inside the reading** | 8.8 s | 53.6 s | 493, 224,923 | 165 px below it |

What this says:

- **Not the mirror's.** The case times out on the commit before any of the mirror's work was merged, at the same place
  as on the tip: `page.evaluate` in `readPicture` (`tests/e2e/still-picture.ts:358`), the instrument still reading
  when the minute ends.
- **Not the map's growth of this day either.** The retained picture went from 481 wires to 493 over the day and the
  points the instrument samples from 220,253 to 224,923, two in a hundred.
- **The case has outgrown its minute, before today.** Its own comment gives 24 to 26 seconds on one worker on
  2026-10-19. At the day's start, alone in the lane, the reading alone took 37.5 s and the case passed with about ten
  seconds to spare; any load on the machine, or two in a hundred more to read, takes it past the minute. Its time is the
  instrument's: about 225,000 sampled points, each tested against the page.
- **The wire 856 px above the top was not found.** On all three builds the highest wire is the same one, the lane run
  of `graphFiles.ts` using `sourceText.ts`'s `throwIfMachineFailure`, and it stands 165 px below the highest card's top:
  given the time to reach it, the assertion holds. The arrival's builder saw 856 px on a branch of theirs with Wire
  Answers off; that state was not built here.

The printed lines are in `lanes-start.txt`, `lanes-before-the-mirror.txt` and `lanes-tip.txt`.

## The first picture of a heavy file

`tests/e2e/local-map-path.spec.ts:200`, "a direct file link starts in the directory-aware layout: /": its first line
waits five seconds for `.local-placed` on `packages/explorer/src/client/index.ts`.

[`first-picture.mjs`](first-picture.mjs) serves the three builds side by side and times, from the navigation, how long
that page takes to show `.local-placed`: seven runs of each, interleaved (one of each build in turn), alone in the
lane, the machine's one-minute load 2.2 as it ended. The output is [`first-picture.json`](first-picture.json).

| Build | Median | Least | Most | Over 5 s | The picture: cards, rows | The map |
| --- | --- | --- | --- | --- | --- | --- |
| start | 3,392 ms | 2,874 | 3,444 | 0 of 7 | 50, 619 | 1,294 files, 7,853 references |
| before the mirror | 3,132 ms | 2,880 | 3,771 | 0 of 7 | 52, 650 | 1,330 files, 8,071 references |
| tip | 3,161 ms | 3,037 | 3,724 | 0 of 7 | 52, 658 | 1,340 files, 8,153 references |

What this says:

- **The first picture did not get slower today**, by the mirror's merge or anyone's: the three medians lie within each
  other's spread, and the first runs of each (about 3.4 to 3.7 s) are slower than the last (about 2.9 to 3.0 s) on all
  three alike, which is the machine settling, not the builds.
- **The limit is near.** On a quiet machine the page takes three to three and three quarter seconds of its five. A load
  that slows the machine by half, as the load near 10 the root ran it under does, puts it past the limit. The failures
  seen in passing today were the load, and the load is enough because the margin is one and a half seconds.

## Left to the root

Both cases fail by a limit their own measure has come close to or passed, not by a fault in the picture. The lanes
case needs either a smaller picture, a cheaper reading or a limit that is its measure; the first picture's five seconds
holds alone and not under load. Neither was changed here.

# Blind playtests on the November 21 build: the owner's own journey, the narrative test, and the estate tasks again

Historical record of a probe, November 21, 2026, by a builder of that day's session. It is evidence of what testers did on the Explorer built at 01:00 UTC that day (`dist/explorer/index.html` written 2026-11-21T01:00:25Z, the estate sample's data at 00:46:34Z), except the runs of [Step tried on strangers](#step-tried-on-strangers), which ran on the build of 07:01 UTC from the day branch at `c5458a329`; `siteChanged` is false in every `run.json` here. The instrument is described as it is now in [its README](../../../../../../scripts/playtest/README.md); the first half of the ladder, on the November 18 build, is in [the November 18 probe](../../../2026-11-18/Probes/blind-playtests/README.md). Nothing here is decided, and nothing here proposes a fix.

The owner's caution on reading testers (2026-11-19): "Models live on text. It's natural for them to wish for there to be more. This is a bias we must account for." So what follows is behaviour: what a tester tried, what it pressed, what the page did. A tester's wish for more words on the screen is recorded as a wish and marked as that bias.

## What was run

Every visitor run is look-only (the instrument's default), at most 60 actions (150 for the narrative task). Tasks 1 to 3 ran one tester at a time under the shared browser lock, in the order of [ladder-plan.json](ladder-plan.json); task 4 and the Framing, Arrival, Step and Cut Counted trials ran through `ladder.mjs`, four at a time. Model ids: `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`. Sonnet ran at medium effort and Haiku at its own default, as on November 19. Everything here, testers, the two grades and the setup check, cost $9.59 as the program reports it, $5.76 of it the two narrative runs and their grades.

| Run | Task | Model, effort | Turns | Actions (looks) | Tokens in, out | Wall | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [estate-trace-opus-medium-look-only](estate-trace-opus-medium-look-only/) | estate-trace | Opus, medium | 25 | 24 (10) | 145k, 2.1k | 110 s | $0.262 |
| [estate-trace-opus-medium-look-only-2](estate-trace-opus-medium-look-only-2/) | estate-trace | Opus, medium | 19 | 18 (7) | 80k, 1.9k | 90 s | $0.178 |
| [estate-trace-sonnet-medium-look-only](estate-trace-sonnet-medium-look-only/) | estate-trace | Sonnet, medium | 12 | 11 (6) | 65k, 1.3k | 61 s | $0.079 |
| [estate-trace-sonnet-medium-look-only-2](estate-trace-sonnet-medium-look-only-2/) | estate-trace | Sonnet, medium | 9 | 8 (5) | 61k, 1.2k | 50 s | $0.062 |
| [estate-trace-haiku-default-look-only](estate-trace-haiku-default-look-only/) | estate-trace | Haiku, default | 18 | 17 (8) | 93k, 2.7k | 78 s | $0.006 |
| [estate-trace-haiku-default-look-only-2](estate-trace-haiku-default-look-only-2/) | estate-trace | Haiku, default | 14 | 13 (7) | 66k, 2.2k | 65 s | $0.005 |
| [narrative-panel-opus-high](narrative-panel-opus-high/) | narrative-panel | Opus, high | 117 | 115 (48) | 2,904k, 13.4k | 571 s | $1.737 (grading $1.05) |
| [narrative-picture-opus-high](narrative-picture-opus-high/) | narrative-picture | Opus, high | 105 | 103 (52) | 3,325k, 13.3k | 705 s | $1.878 (grading $1.09) |
| [estate-uses-sonnet-medium-look-only](estate-uses-sonnet-medium-look-only/) | estate-uses | Sonnet, medium | 10 | 9 (5) | 51k, 1.0k | 19 s | $0.061 |
| [estate-uses-sonnet-medium-look-only-2](estate-uses-sonnet-medium-look-only-2/) | estate-uses | Sonnet, medium | 11 | 10 (4) | 54k, 1.3k | 22 s | $0.055 |
| [estate-uses-haiku-default-look-only](estate-uses-haiku-default-look-only/) | estate-uses | Haiku, default | 13 | 12 (6) | 70k, 1.9k | 22 s | $0.004 |
| [estate-uses-haiku-default-look-only-2](estate-uses-haiku-default-look-only-2/) | estate-uses | Haiku, default | 6 | 5 (3) | 22k, 0.8k | 11 s | $0.002 |
| [estate-directory-sonnet-medium-look-only](estate-directory-sonnet-medium-look-only/) | estate-directory | Sonnet, medium | 9 | 8 (4) | 53k, 1.2k | 54 s | $0.054 |
| [estate-directory-sonnet-medium-look-only-2](estate-directory-sonnet-medium-look-only-2/) | estate-directory | Sonnet, medium | 11 | 10 (5) | 66k, 1.1k | 60 s | $0.061 |
| [estate-directory-haiku-default-look-only](estate-directory-haiku-default-look-only/) | estate-directory | Haiku, default | 10 | 9 (5) | 46k, 1.6k | 46 s | $0.004 |
| [estate-directory-haiku-default-look-only-2](estate-directory-haiku-default-look-only-2/) | estate-directory | Haiku, default | 9 | 8 (4) | 54k, 1.7k | 47 s | $0.003 |
| [estate-link-sonnet-medium-look-only](estate-link-sonnet-medium-look-only/) | estate-link | Sonnet, medium | 7 | 6 (3) | 33k, 1.2k | 41 s | $0.043 |
| [estate-link-sonnet-medium-look-only-2](estate-link-sonnet-medium-look-only-2/) | estate-link | Sonnet, medium | 7 | 6 (3) | 33k, 1.2k | 41 s | $0.041 |
| [estate-link-haiku-default-look-only](estate-link-haiku-default-look-only/) | estate-link | Haiku, default | 7 | 6 (3) | 22k, 1.3k | 36 s | $0.002 |
| [estate-link-haiku-default-look-only-2](estate-link-haiku-default-look-only-2/) | estate-link | Haiku, default | 7 | 6 (3) | 22k, 1.3k | 37 s | $0.002 |
| [repo-uses-haiku-default-look-only](repo-uses-haiku-default-look-only/) | repo-uses | Haiku, default | 15 | 14 (7) | 83k, 1.9k | 24 s | $0.005 |
| [repo-uses-sonnet-medium-look-only](repo-uses-sonnet-medium-look-only/) | repo-uses | Sonnet, medium | 6 | 5 (3) | 33k, 1.0k | 22 s | $0.041 |
| [repo-uses-sonnet-medium-look-only-2](repo-uses-sonnet-medium-look-only-2/) | repo-uses | Sonnet, medium | 8 | 7 (4) | 53k, 0.9k | 21 s | $0.050 |
| [repo-uses-haiku-default-look-only-2](repo-uses-haiku-default-look-only-2/) | repo-uses | Haiku, default | 6 | 5 (3) | 23k, 1.0k | 14 s | $0.002 |
| [repo-directory-sonnet-medium-look-only](repo-directory-sonnet-medium-look-only/) | repo-directory | Sonnet, medium | 11 | 10 (5) | 77k, 1.3k | 53 s | $0.067 |
| [repo-directory-sonnet-medium-look-only-2](repo-directory-sonnet-medium-look-only-2/) | repo-directory | Sonnet, medium | 26 | 24 (11) | 328k, 2.3k | 80 s | $0.158 |
| [repo-directory-haiku-default-look-only](repo-directory-haiku-default-look-only/) | repo-directory | Haiku, default | 18 | 17 (7) | 109k, 2.4k | 62 s | $0.006 |
| [repo-directory-haiku-default-look-only-2](repo-directory-haiku-default-look-only-2/) | repo-directory | Haiku, default | 14 | 13 (6) | 95k, 1.7k | 60 s | $0.005 |
| [repo-link-sonnet-medium-look-only](repo-link-sonnet-medium-look-only/) | repo-link | Sonnet, medium | 8 | 7 (4) | 44k, 1.4k | 52 s | $0.055 |
| [repo-link-sonnet-medium-look-only-2](repo-link-sonnet-medium-look-only-2/) | repo-link | Sonnet, medium | 8 | 7 (4) | 44k, 1.3k | 48 s | $0.052 |
| [repo-link-haiku-default-look-only](repo-link-haiku-default-look-only/) | repo-link | Haiku, default | 7 | 6 (3) | 34k, 2.2k | 47 s | $0.003 |
| [repo-link-haiku-default-look-only-2](repo-link-haiku-default-look-only-2/) | repo-link | Haiku, default | 7 | 6 (3) | 34k, 1.3k | 44 s | $0.002 |
| [estate-uses-sonnet-medium-follows-pins](estate-uses-sonnet-medium-follows-pins/) | estate-uses with localMap.framing=follows | Sonnet, medium | 20 | 19 (10) | 151k, 1.9k | 41 s | $0.123 |
| [estate-uses-sonnet-medium-follows-pins-2](estate-uses-sonnet-medium-follows-pins-2/) | estate-uses with localMap.framing=follows | Sonnet, medium | 17 | 16 (8) | 131k, 1.9k | 41 s | $0.103 |
| [estate-uses-haiku-default-follows-pins](estate-uses-haiku-default-follows-pins/) | estate-uses with localMap.framing=follows | Haiku, default | 11 | 10 (5) | 56k, 2.9k | 28 s | $0.004 |
| [estate-uses-haiku-default-follows-pins-2](estate-uses-haiku-default-follows-pins-2/) | estate-uses with localMap.framing=follows | Haiku, default | 6 | 5 (3) | 23k, 0.9k | 12 s | $0.002 |
| [estate-directory-sonnet-medium-follows-pins](estate-directory-sonnet-medium-follows-pins/) | estate-directory with localMap.framing=follows | Sonnet, medium | 11 | 10 (5) | 66k, 1.4k | 51 s | $0.065 |
| [estate-directory-sonnet-medium-follows-pins-2](estate-directory-sonnet-medium-follows-pins-2/) | estate-directory with localMap.framing=follows | Sonnet, medium | 10 | 8 (4) | 54k, 1.3k | 39 s | $0.055 |
| [estate-directory-haiku-default-follows-pins](estate-directory-haiku-default-follows-pins/) | estate-directory with localMap.framing=follows | Haiku, default | 10 | 9 (5) | 47k, 1.7k | 44 s | $0.004 |
| [estate-directory-haiku-default-follows-pins-2](estate-directory-haiku-default-follows-pins-2/) | estate-directory with localMap.framing=follows | Haiku, default | 9 | 8 (4) | 34k, 1.6k | 43 s | $0.003 |
| [estate-uses-sonnet-medium-follows-files](estate-uses-sonnet-medium-follows-files/) | estate-uses with localMap.framing=follows-files | Sonnet, medium | 18 | 17 (8) | 112k, 1.9k | 36 s | $0.102 |
| [estate-uses-sonnet-medium-follows-files-2](estate-uses-sonnet-medium-follows-files-2/) | estate-uses with localMap.framing=follows-files | Sonnet, medium | 13 | 12 (6) | 105k, 1.0k | 26 s | $0.073 |
| [estate-uses-haiku-default-follows-files](estate-uses-haiku-default-follows-files/) | estate-uses with localMap.framing=follows-files | Haiku, default | 15 | 14 (7) | 85k, 2.6k | 29 s | $0.005 |
| [estate-uses-haiku-default-follows-files-2](estate-uses-haiku-default-follows-files-2/) | estate-uses with localMap.framing=follows-files | Haiku, default | 14 | 13 (7) | 87k, 3.0k | 34 s | $0.006 |
| [estate-directory-sonnet-medium-follows-files](estate-directory-sonnet-medium-follows-files/) | estate-directory with localMap.framing=follows-files | Sonnet, medium | 10 | 9 (5) | 66k, 1.3k | 41 s | $0.064 |
| [estate-directory-sonnet-medium-follows-files-2](estate-directory-sonnet-medium-follows-files-2/) | estate-directory with localMap.framing=follows-files | Sonnet, medium | 10 | 8 (4) | 54k, 1.3k | 40 s | $0.055 |
| [estate-directory-haiku-default-follows-files](estate-directory-haiku-default-follows-files/) | estate-directory with localMap.framing=follows-files | Haiku, default | 9 | 8 (4) | 34k, 1.7k | 45 s | $0.003 |
| [estate-directory-haiku-default-follows-files-2](estate-directory-haiku-default-follows-files-2/) | estate-directory with localMap.framing=follows-files | Haiku, default | 9 | 8 (4) | 34k, 2.0k | 47 s | $0.003 |
| [estate-uses-sonnet-medium-arrival-then-neighbours](estate-uses-sonnet-medium-arrival-then-neighbours/) | estate-uses with localMap.arrival=then-neighbours | Sonnet, medium | 8 | 7 (4) | 52k, 0.8k | 18 s | $0.048 |
| [estate-uses-sonnet-medium-arrival-then-neighbours-2](estate-uses-sonnet-medium-arrival-then-neighbours-2/) | estate-uses with localMap.arrival=then-neighbours | Sonnet, medium | 8 | 7 (4) | 52k, 0.7k | 19 s | $0.047 |
| [estate-uses-haiku-default-arrival-then-neighbours](estate-uses-haiku-default-arrival-then-neighbours/) | estate-uses with localMap.arrival=then-neighbours | Haiku, default | 6 | 5 (3) | 23k, 0.9k | 13 s | $0.002 |
| [estate-uses-haiku-default-arrival-then-neighbours-2](estate-uses-haiku-default-arrival-then-neighbours-2/) | estate-uses with localMap.arrival=then-neighbours | Haiku, default | 6 | 5 (3) | 23k, 1.0k | 13 s | $0.002 |
| [estate-directory-sonnet-medium-arrival-then-neighbours](estate-directory-sonnet-medium-arrival-then-neighbours/) | estate-directory with localMap.arrival=then-neighbours | Sonnet, medium | 9 | 8 (4) | 53k, 1.2k | 48 s | $0.053 |
| [estate-directory-sonnet-medium-arrival-then-neighbours-2](estate-directory-sonnet-medium-arrival-then-neighbours-2/) | estate-directory with localMap.arrival=then-neighbours | Sonnet, medium | 7 | 5 (3) | 33k, 0.9k | 33 s | $0.039 |
| [estate-directory-haiku-default-arrival-then-neighbours](estate-directory-haiku-default-arrival-then-neighbours/) | estate-directory with localMap.arrival=then-neighbours | Haiku, default | 9 | 8 (4) | 54k, 1.9k | 46 s | $0.003 |
| [estate-directory-haiku-default-arrival-then-neighbours-2](estate-directory-haiku-default-arrival-then-neighbours-2/) | estate-directory with localMap.arrival=then-neighbours | Haiku, default | 8 | 7 (4) | 33k, 2.0k | 40 s | $0.003 |
| [repo-uses-sonnet-medium-arrival-then-neighbours](repo-uses-sonnet-medium-arrival-then-neighbours/) | repo-uses with localMap.arrival=then-neighbours | Sonnet, medium | 6 | 5 (3) | 33k, 0.8k | 18 s | $0.038 |
| [repo-uses-haiku-default-arrival-then-neighbours](repo-uses-haiku-default-arrival-then-neighbours/) | repo-uses with localMap.arrival=then-neighbours | Haiku, default | 6 | 5 (3) | 22k, 0.8k | 14 s | $0.002 |
| [estate-uses-sonnet-medium-arrival-neighbours](estate-uses-sonnet-medium-arrival-neighbours/) | estate-uses with localMap.arrival=neighbours | Sonnet, medium | 6 | 5 (3) | 33k, 0.6k | 14 s | $0.036 |
| [estate-uses-sonnet-medium-arrival-neighbours-2](estate-uses-sonnet-medium-arrival-neighbours-2/) | estate-uses with localMap.arrival=neighbours | Sonnet, medium | 6 | 5 (3) | 33k, 0.6k | 14 s | $0.036 |
| [estate-uses-haiku-default-arrival-neighbours](estate-uses-haiku-default-arrival-neighbours/) | estate-uses with localMap.arrival=neighbours | Haiku, default | 6 | 5 (3) | 23k, 0.8k | 12 s | $0.002 |
| [estate-uses-haiku-default-arrival-neighbours-2](estate-uses-haiku-default-arrival-neighbours-2/) | estate-uses with localMap.arrival=neighbours | Haiku, default | 6 | 5 (3) | 24k, 1.3k | 14 s | $0.002 |
| [estate-directory-sonnet-medium-arrival-neighbours](estate-directory-sonnet-medium-arrival-neighbours/) | estate-directory with localMap.arrival=neighbours | Sonnet, medium | 9 | 7 (4) | 54k, 1.2k | 39 s | $0.053 |
| [estate-directory-sonnet-medium-arrival-neighbours-2](estate-directory-sonnet-medium-arrival-neighbours-2/) | estate-directory with localMap.arrival=neighbours | Sonnet, medium | 9 | 8 (4) | 53k, 1.2k | 46 s | $0.053 |
| [estate-directory-haiku-default-arrival-neighbours](estate-directory-haiku-default-arrival-neighbours/) | estate-directory with localMap.arrival=neighbours | Haiku, default | 9 | 8 (4) | 34k, 1.8k | 44 s | $0.003 |
| [estate-directory-haiku-default-arrival-neighbours-2](estate-directory-haiku-default-arrival-neighbours-2/) | estate-directory with localMap.arrival=neighbours | Haiku, default | 9 | 8 (4) | 34k, 1.9k | 45 s | $0.003 |
| [repo-uses-sonnet-medium-arrival-neighbours](repo-uses-sonnet-medium-arrival-neighbours/) | repo-uses with localMap.arrival=neighbours | Sonnet, medium | 6 | 5 (3) | 33k, 0.8k | 17 s | $0.038 |
| [repo-uses-haiku-default-arrival-neighbours](repo-uses-haiku-default-arrival-neighbours/) | repo-uses with localMap.arrival=neighbours | Haiku, default | 6 | 5 (3) | 23k, 1.0k | 14 s | $0.002 |
| [estate-directory-sonnet-medium-step-least](estate-directory-sonnet-medium-step-least/) | estate-directory with localMap.step=least | Sonnet, medium | 11 | 10 (5) | 77k, 1.3k | 60 s | $0.072 |
| [estate-directory-sonnet-medium-step-least-2](estate-directory-sonnet-medium-step-least-2/) | estate-directory with localMap.step=least | Sonnet, medium | 9 | 7 (4) | 53k, 1.1k | 46 s | $0.060 |
| [estate-directory-haiku-default-step-least](estate-directory-haiku-default-step-least/) | estate-directory with localMap.step=least | Haiku, default | 9 | 8 (4) | 38k, 1.5k | 52 s | $0.003 |
| [estate-directory-haiku-default-step-least-2](estate-directory-haiku-default-step-least-2/) | estate-directory with localMap.step=least | Haiku, default | 11 | 10 (5) | 59k, 1.7k | 56 s | $0.004 |
| [repo-directory-sonnet-medium-step-least](repo-directory-sonnet-medium-step-least/) | repo-directory with localMap.step=least | Sonnet, medium | 23 | 21 (10) | 270k, 2.2k | 82 s | $0.142 |
| [repo-directory-sonnet-medium-step-least-2](repo-directory-sonnet-medium-step-least-2/) | repo-directory with localMap.step=least | Sonnet, medium | 24 | 23 (11) | 187k, 2.3k | 83 s | $0.145 |
| [repo-directory-haiku-default-step-least](repo-directory-haiku-default-step-least/) | repo-directory with localMap.step=least | Haiku, default | 12 | 11 (5) | 59k, 1.7k | 58 s | $0.004 |
| [repo-directory-haiku-default-step-least-2](repo-directory-haiku-default-step-least-2/) | repo-directory with localMap.step=least | Haiku, default | 7 | 6 (3) | 22k, 1.1k | 44 s | $0.002 |
| [estate-directory-sonnet-medium-step-lines](estate-directory-sonnet-medium-step-lines/) | estate-directory with localMap.step=lines | Sonnet, medium | 6 | 5 (3) | 33k, 0.9k | 34 s | $0.039 |
| [estate-directory-sonnet-medium-step-lines-2](estate-directory-sonnet-medium-step-lines-2/) | estate-directory with localMap.step=lines | Sonnet, medium | 9 | 8 (4) | 53k, 1.0k | 50 s | $0.051 |
| [estate-directory-haiku-default-step-lines](estate-directory-haiku-default-step-lines/) | estate-directory with localMap.step=lines | Haiku, default | 9 | 8 (4) | 54k, 1.3k | 44 s | $0.003 |
| [estate-directory-haiku-default-step-lines-2](estate-directory-haiku-default-step-lines-2/) | estate-directory with localMap.step=lines | Haiku, default | 10 | 9 (4) | 55k, 1.8k | 50 s | $0.003 |
| [repo-directory-sonnet-medium-step-lines](repo-directory-sonnet-medium-step-lines/) | repo-directory with localMap.step=lines | Sonnet, medium | 28 | 26 (13) | 260k, 2.5k | 88 s | $0.173 |
| [repo-directory-sonnet-medium-step-lines-2](repo-directory-sonnet-medium-step-lines-2/) | repo-directory with localMap.step=lines | Sonnet, medium | 26 | 24 (12) | 227k, 2.6k | 73 s | $0.161 |
| [repo-directory-haiku-default-step-lines](repo-directory-haiku-default-step-lines/) | repo-directory with localMap.step=lines | Haiku, default | 12 | 11 (5) | 60k, 1.6k | 51 s | $0.004 |
| [repo-directory-haiku-default-step-lines-2](repo-directory-haiku-default-step-lines-2/) | repo-directory with localMap.step=lines | Haiku, default | 11 | 10 (4) | 55k, 1.4k | 51 s | $0.003 |
| [repo-uses-sonnet-medium-step-least](repo-uses-sonnet-medium-step-least/) | repo-uses with localMap.step=least | Sonnet, medium | 8 | 7 (4) | 37k, 0.9k | 21 s | $0.050 |
| [repo-uses-haiku-default-step-least](repo-uses-haiku-default-step-least/) | repo-uses with localMap.step=least | Haiku, default | 6 | 5 (3) | 23k, 1.2k | 14 s | $0.002 |
| [repo-uses-sonnet-medium-step-lines](repo-uses-sonnet-medium-step-lines/) | repo-uses with localMap.step=lines | Sonnet, medium | 4 | 3 (2) | 18k, 0.8k | 14 s | $0.028 |
| [repo-uses-haiku-default-step-lines](repo-uses-haiku-default-step-lines/) | repo-uses with localMap.step=lines | Haiku, default | 12 | 11 (6) | 65k, 1.7k | 21 s | $0.004 |
| [repo-directory-haiku-default-cut-counted](repo-directory-haiku-default-cut-counted/) | repo-directory with localMap.step=least, localMap.cutCounted=on | Haiku, default | 17 | 16 (7) | 84k, 1.9k | 68 s | $0.005 |
| [repo-directory-haiku-default-cut-counted-2](repo-directory-haiku-default-cut-counted-2/) | repo-directory with localMap.step=least, localMap.cutCounted=on | Haiku, default | 17 | 16 (7) | 83k, 1.9k | 63 s | $0.005 |
| [repo-directory-sonnet-medium-cut-counted](repo-directory-sonnet-medium-cut-counted/) | repo-directory with localMap.step=least, localMap.cutCounted=on | Sonnet, medium | 22 | 20 (9) | 142k, 2.1k | 79 s | $0.119 |
| [repo-directory-sonnet-medium-cut-counted-2](repo-directory-sonnet-medium-cut-counted-2/) | repo-directory with localMap.step=least, localMap.cutCounted=on | Sonnet, medium | 28 | 26 (13) | 261k, 2.6k | 83 s | $0.173 |
| [setup-failure-check](setup-failure-check/) | narrative-picture | Haiku, default | - | 0 (0) | - | 31 s | -, outcome "setup failed" |
| [setup-check-cut-counted-before-mend](setup-check-cut-counted-before-mend/) | repo-directory with localMap.step=least, localMap.cutCounted=on | Haiku, default | - | 0 (0) | - | 21 s | -, outcome "setup failed" |
| [instrument-check-estate-uses-haiku](instrument-check-estate-uses-haiku/) | estate-uses | Haiku, default | 11 | 10 (5) | 50k, 2.5k | 24 s | $0.004 |
| [pilot-leave-out-read-reason-sonnet](pilot-leave-out-read-reason-sonnet/) | leave-out-read-reason | Sonnet, medium | 2 | 1 (1) | 6k, 0.6k | 38 s | $0.015 |
| [pilot-leave-out-keep-folders-sonnet](pilot-leave-out-keep-folders-sonnet/) | leave-out-keep-folders with [data-layout="tree"] | Sonnet, medium | 13 | 12 (6) | 58k, 1.0k | 33 s | $0.055 |

Costs and times are as the program reports them; "Actions" counts every tool call, with the number of `look`s in brackets.

### Two faults in the instrument, met and mended

- **The program's path named a version.** The launcher and the grader named Claude Code 2.1.327 by its path, and the extension had become 2.1.329, so the first two runs ended at once with `flock: failed to execute /home/node/.vscode-server/extensions/anthropic.claude-code-2.1.327-linux-x64/resources/native-binary/claude: No such file or directory` (exit 69, outcome "no result"). `playtest.mjs` took `--claude`, but `ladder.mjs` could not pass it on, so the 20 runs of [ladder-plan.json](ladder-plan.json) (tasks 1 to 3) were run one at a time by a short driver in the builder's scratch folder that did what `ladder.mjs` does and added `--claude .../anthropic.claude-code-2.1.329-linux-x64/...`; the two failed folders were replaced by the reruns, and both narrative grades were made with `--claude` too. **Mended:** [claude-program.mjs](../../../../../../scripts/playtest/claude-program.mjs) finds the newest `anthropic.claude-code-*` extension folder that holds the program (checked with folders 2.1.9, 2.1.10 and a 2.2.0 without the program: it chose 2.1.10); `playtest.mjs` and `grade-narrative.mjs` use it unless given `--claude`, and `ladder.mjs` passes `--claude` on. **Shown working:** [ladder-check-plan.json](ladder-check-plan.json), one run, by `ladder.mjs` with no `--claude`: `repo-uses-haiku-default-look-only: success: 15 turns, 14 actions, 24 s, $0.00`. The rest of task 4 then ran through `ladder.mjs` as well.
- **A failed setup did not end the run.** `narrative-picture`'s first setup failed (`locator.click: Timeout 15000ms exceeded`, the History button) and the window closed as it should; but Claude Code started the window's server again on the tester's next call, the second setup passed and overwrote `setup.json`, and the tester went on (details under task 2). **Mended:** the launcher stops the tester as soon as `setup.json` says `ok: false`, and the run's outcome is `setup failed`; a window started again for a run whose setup failed ends at once, before it can set up or write. **Shown working:** [setup-failure-check](setup-failure-check/) is `narrative-picture` started on the estate's World Map (`--start http://127.0.0.1:8792/samples/estate/`), where there is no History button, on Haiku. Its `setup.json` keeps the failure (`"error": "locator.click: Timeout 15000ms exceeded."`, `"ok": false`); the tester's first `look` got "Connection closed", its second was cut off when the launcher stopped it (exit 143); `run.json` says `"outcome": "setup failed"`, 0 actions, 31 s. The instrument's README says what changed.

## Task 1, `estate-trace`: the owner's own journey

The owner's use of the tool: showing colleagues, on a shared screen, how their payment systems connect ("the consumer payment portal talks to its API, to the WCF router on-prem over a tunnel, to the WCF service, to the databases"). The estate sample is the miniature of that estate. The task starts on the estate's landing address, the World Map, and says: "This is a map of our payments system. When someone submits a payment on the web page, what happens to it? Name each piece of the system it passes through, in order, until it is stored."

### The answer, written before any run

From the sample's source and [its README](../../../../../../../tests/integration/programs/csharp/estate/README.md), not from the map; the full text is the task's `rightAnswer` in [tasks.json](../../../../../../scripts/playtest/tasks.json).

| # | Step | File that carries it |
| --- | --- | --- |
| 1 | The page with the payment form loads its script | `Portal/Pages/Default.aspx` (`<script src="../Scripts/portal.js">`) |
| 2 | On submit, the script POSTs JSON to the portal's own `api/payments` | `Portal/Scripts/portal.js` |
| 3 | The portal's Web API controller receives it | `Portal/Controllers/PaymentsController.cs` |
| 4 | Its gateway client POSTs to the gateway's `api/payments` at `Portal.GatewayBaseUrl` | `Portal/Services/GatewayClient.cs` (base URL in `Portal/Web.config`, read through `Portal/App_Code/Globals.cs`) |
| 5 | The gateway's controller stamps workload and environment | `Gateway/Controllers/PaymentsController.cs`, `Gateway/GatewaySettings.cs` |
| 6 | Its hub proxy opens the WCF client endpoint "PaymentHub" | `Gateway/Wcf/HubProxy.cs` |
| 7 | That endpoint's address crosses the IPsec tunnel to on-prem | `Gateway/Web.config` (`net.tcp://hub.onprem.example:8731/PaymentHub`) |
| 8 | The hub hosts that address | `Hub/App.config` (service `Estate.Hub.PaymentHub`) |
| 9 | The hub does no payment work; it forwards | `Hub/PaymentHub.cs` |
| 10 | Routing names the service endpoint for the workload and environment | `Hub/ServiceRouting.cs` (`PaymentService.Consumer.Production`, a client endpoint in `Hub/App.config`) |
| 11 | The payment service hosts that address | `PaymentService/App.config` (service `Estate.Payments.PaymentService`) |
| 12 | The service's `Post` opens the data context | `PaymentService/PaymentService.cs` |
| 13 | The context EXECs the stored procedure (connection `PaymentsDb`) | `PaymentService/Data/PaymentsContext.cs` |
| 14 | The procedure posts the payment | `Database/SqlServer/dbo.usp_PostPayment.sql` |
| 15 | **Stored:** the row is inserted into `dbo.Payment` | `Database/SqlServer/dbo.Payment.sql` |
| 16 | The procedure *reads* the account balance from Oracle over a linked server | `Database/Oracle/CENTRAL.ACCOUNT.sql` |

Judged **right** when an answer names the steps in this order down to the `dbo.Payment` table, at file grain (page and script, the portal's controller and gateway client, the gateway's controller and hub proxy, the hub with its routing, the service and its data context, the procedure, the table); **partly** when the order is right but pieces are merged or missing; **wrong** when the order contradicts the flow or the payment is said to be stored elsewhere. A thing-level answer (portal, gateway, hub, payments, sqlserver) is therefore partly right by this key, however clean its order.

### What the Live Docs record of this chain

Read from the estate sample's built `explorer-data.json` (each file's `outbound` list, which is derived from the sample's Live Docs). `npm run live-docs:inspect` was not used: the sample's Live Docs exist only in a temporary copy made while the site is built (`scripts/live-docs/sample-build.ts`), so asking `inspect` a path question of the sample would need that generation run again, which this probe was told not to do.

- **Recorded, in the direction of the flow:** steps 1 to 8 (`Default.aspx` → `portal.js` → `Portal/Controllers/PaymentsController.cs` → `GatewayClient.cs` → `Gateway/Controllers/PaymentsController.cs` → `HubProxy.cs` → `Gateway/Web.config` → `Hub/App.config`), `Hub/App.config` → `Hub/PaymentHub.cs` → `Hub/ServiceRouting.cs`, `Hub/App.config` → `PaymentService/App.config` → `PaymentService.cs` → `PaymentsContext.cs` → `dbo.usp_PostPayment.sql` → `dbo.Payment.sql` and `CENTRAL.ACCOUNT.sql`.
- **Not recorded:** `Hub/PaymentHub.cs` → `Hub/App.config`; see [A finding about the readers](#a-finding-about-the-readers-the-hubs-routing-is-not-read) below.
- On the World Map these file connections are gathered into wires between seven things: portal → gateway → hub → payments → sqlserver → oracle, with contracts beside them. A thing's card names its offers (routes, addresses, tables) and the files that declare them, and "calls" / "called by" the other things.

### A finding about the readers: the hub's routing is not read

This is not a tester's stumble; it is what the Live Docs say of the sample, found while writing the answer. The hub picks the payment service's client endpoint by a name built at run time. `Hub/PaymentHub.cs`, line 27:

```csharp
var factory = new ChannelFactory<IPaymentService>(ServiceRouting.EndpointNameFor(workload, environment));
```

and `Hub/ServiceRouting.cs`, line 10, `return EndpointPrefix + "." + workload + "." + environment;` with `EndpointPrefix = "PaymentService"`, which names the endpoints `PaymentService.Consumer.Production` and `PaymentService.Consumer.Staging` declared in `Hub/App.config`. The sample's hand-verified list (`expected/hand-verified-edges.json`) has the edge `Hub/PaymentHub.cs` → `Hub/App.config` for this; the built map does not. The gateway's same pattern with a constant name, `new ChannelFactory<IPaymentHub>(EndpointName)` with `EndpointName = "PaymentHub"` in `Gateway/Wcf/HubProxy.cs`, is recorded (`HubProxy.cs` → `Gateway/Web.config`). So the readers follow a named endpoint when the name is a constant, and lose it when the name is assembled from a prefix and the request's values.

What that does on the map: the hub's code leads only to its routing file and stops. The onward path runs configuration to configuration, `Gateway/Web.config` → `Hub/App.config` → `PaymentService/App.config` → `PaymentService.cs`. A path search over the recorded connections from `portal.js` to `dbo.Payment.sql` finds one that never passes through `PaymentHub.cs`, and from `PaymentHub.cs` or `ServiceRouting.cs` none reaches the payment service. No tester went far enough down to meet it.

### The runs

| Run | By the key | The chain it gave | What it said of Oracle | Where it stalled or misread | What it did |
| --- | --- | --- | --- | --- | --- |
| [Opus medium 1](estate-trace-opus-medium-look-only/answer.md) | partly | portal → gateway → (IPsec tunnel) → hub → payments → sqlserver, stored in `dbo.Payment` through `dbo.usp_PostPayment` | "the account table in Oracle appears to be updated afterwards" (it is read) | Read the hub's staging endpoint as a fault in the path; one click missed the payments box | Clicked each box in turn, reading its card; closed each card by clicking where the next box was |
| [Opus medium 2](estate-trace-opus-medium-look-only-2/answer.md) | partly | the same, with the tunnel as a step of its own | "It may update the account, but that's my guess" | Read the staging endpoint as a fault, again | The same box-by-box walk, 18 actions |
| [Sonnet 1](estate-trace-sonnet-medium-look-only/answer.md) | partly | portal → gateway → hub → payments → sqlserver (`dbo.Payment` through `usp_PostPayment`) → oracle | "it doesn't say whether that call writes the payment or only touches the account" | None | Started at payments and worked outward, five clicks; never opened the gateway ("the hub's 'called by' list confirms it") |
| [Sonnet 2](estate-trace-sonnet-medium-look-only-2/answer.md) | partly, with an error | portal → gateway → hub → payments → sqlserver ("where the payment is first written") → oracle | "the payment ends up there" | Took the last box in the line for the payment's last resting place | Three clicks (sqlserver, oracle, hub); read portal → gateway "from the arrows on the map" |
| [Haiku 1](estate-trace-haiku-default-look-only/answer.md) | partly | portal → gateway → hub → payments → sqlserver (`dbo.Payment`) → oracle | "The map doesn't say what gets written there." | Closed the first card unseen; went to the Local Map and came back | Hovered each box and read its tooltip |
| [Haiku 2](estate-trace-haiku-default-look-only-2/answer.md) | partly (the nearest to right) | portal → gateway → hub → payments → sqlserver, stored in `dbo.Payment` by `dbo.usp_PostPayment` | "Oracle is not on the path to storage ... it is downstream of where the payment is saved" | Its first click, on the name "portal", changed nothing it could see | Clicked the boxes themselves instead |

Every tester stayed on the World Map and answered at the grain of its seven things. None pressed a card's "open <thing>" link or opened a thing into its files, so none named `portal.js`, `GatewayClient.cs`, `HubProxy.cs`, `ServiceRouting.cs` or `PaymentsContext.cs`; the only file names in the answers are those printed on the cards (`Controllers/PaymentsController.cs` beside a route, `App.config` beside an address). All six put the five things in the right order and named `dbo.Payment` (through `dbo.usp_PostPayment`) as where the payment is stored. By the key written beforehand all six are **partly** right; at the grain the owner described to their colleagues ("portal ... its API ... the WCF router on-prem over a tunnel ... the WCF service ... the databases") all six have the chain in order.

### What the testers stalled on or misread

1. **Nobody went below the World Map.** Each thing's card ends with "open <thing>" and a folded "N files · M symbols"; no tester pressed either. The testers took the card's "calls" and "called by" for the whole answer: "I got this by clicking each box on the map and reading its 'calls / called by' details" (Opus 1). The one tester that looked for more, Haiku 1, pressed Local Map in the sidebar and found the six top folders of the estate drawn as closed groups of dots with no wire between them ([Haiku 1, #5](estate-trace-haiku-default-look-only/shots/005-click.png)). It said "The Local Map is a code-level view and doesn't show the request path", went back to the World Map, and answered at the grain of things. What I see in that picture: six folder cards and `Estate.sln` on a dark ground, the folders' contents as small blue dots, and nothing joining Portal to Gateway or Gateway to Hub; the request's path, so plain on the World Map, is not drawn at this scale of the Local Map. So the file-grain steps (the page's script, the gateway client, the hub proxy, the routing, the data context) were never seen by any tester.
2. **A staging endpoint read as a fault in the path.** The hub's card lists "calls payments" and then, under "calls out to", `net.tcp://payments-staging.onprem.example:8732/PaymentService` "from configuration, in App.config", followed in grey by "nothing on the board serves it; a ghost until something does" ([Opus 1, #11](estate-trace-opus-medium-look-only/shots/011-look.png)). The production address the hub also calls is not listed on the hub's card; it appears only on the payments card, as what payments offers. Both Opus runs concluded the hub may be sending payments to the wrong place: "If the hub really uses that setting, payments may never reach the payments service. Someone should check the hub's `App.config`" (Opus 1); "Even though the map draws a hub → payments link, payments may not reach the payments service as configured" (Opus 2). In the sample the hub has two client endpoints, production and staging, and picks one by the request's environment; nothing is misrouted. Sonnet 1 read the same card rightly ("It isn't part of the normal path"); Sonnet 2 mentioned it without judging it. In a meeting of the owner's colleagues this is the reading that would start an argument.
3. **What a wire carries between two databases is guessed.** sqlserver's card says "calls oracle", and oracle's says it offers "CENTRAL.ACCOUNT · table" and is "called by sqlserver" ([Sonnet 1, #9](estate-trace-sonnet-medium-look-only/shots/009-look.png)). Every tester had to decide what that call does, and they decided differently: "appears to be updated afterwards" (Opus 1), "It may update the account, but that's my guess" (Opus 2), "the payment ends up there" (Sonnet 2), "the map doesn't say" (Sonnet 1, Haiku 1), "downstream of where the payment is saved" (Haiku 2). The procedure reads the balance there. The testers' remarks that "the map doesn't say" are, by the owner's caution, partly the text-loving bias; the behaviour is that four of six took a direction or a write that is not in the source, and that the last box in the line was taken by one as the payment's last stop.
4. **A click on a thing's name does nothing visible.** Haiku 2's first click landed on the word "portal" above the box; the picture after it is the untouched World Map ([Haiku 2, #3](estate-trace-haiku-default-look-only-2/shots/003-look.png)), and it said "Clicking the portal only highlighted its connections" before clicking the box itself. Opus 1 also lost one click (#13) on the space between the payments name and its box. Each recovered on the next click.

Not product questions: Haiku 1 clicked away the payments card before it had looked at it (look-only lets a tester act without seeing), then said "The map doesn't show a text list of connections yet"; it found the same lists a moment later under the pointer, by hovering ([Haiku 1, #10](estate-trace-haiku-default-look-only/shots/010-point.png)).

## Task 2: the narrative playtest

Run as [the instrument's README](../../../../../../scripts/playtest/README.md#the-narrative-playtest) says: Opus at high effort, 150 actions, starting on this repository's 3D Local Map with the history opened by the window; `narrative-panel` with the step panel as a person meets it, `narrative-picture` with the step panel, its toggle and dialog and the finder's commit subjects not drawn. Each account was graded by `grade-narrative.mjs` against [the 39 claims](../../../../../../scripts/playtest/narrative-claims.md), by a fresh session told neither the model nor the condition. The key was drawn on November 19 from a history that ended on 2026-11-13; today's history runs to 2026-11-21 (1,453 steps), so the key's last claims ask about the middle of what the tester saw, not its end.

**The setup of `narrative-picture` failed once and was retried by the program, not by the harness.** The window's first setup ended with `locator.click: Timeout 15000ms exceeded` (the History button was not clickable within 15 s of the page's load) and the window closed, as it is meant to. The tester's first `look` came back "Connection closed"; Claude Code then started the window's server again on the tester's next call, and that second setup passed (`setup.json`: scrubber visible, step panel not drawn, `ok: true`). The run was therefore made in the right condition, with one lost action, but the instrument's promise that "a setup that fails ends the window, so no tester works on the wrong page" did not hold: the run went on, and the failed check was overwritten in `setup.json`. It is recorded here from the first `setup.json`, read while the run was going. The fault has since been mended ([Two faults in the instrument](#two-faults-in-the-instrument-met-and-mended)).

### The grader's marks

Each mark as the grader gave it; the claims are shortened here, and are whole in [the key](../../../../../../scripts/playtest/narrative-claims.md). The twelve claims marked not showable were not graded.

| Claim | Date | Showable | With the step panel | Without the step words |
| --- | --- | --- | --- | --- |
| C1: The first commit holds no product code, only the planning toolkit and the first feature's specification | 2025-10-16 | picture | partly restated | partly restated |
| C2: The product began as a VS Code extension with a language server and a shared library, storing its graph in SQLite | 2025-10-16 | picture | partly restated | restated |
| C4: The extension shipped a symbol-neighbours query; the first command-line graph tools appeared | 2025-10-24 | picture | absent | absent |
| C5: A language-model path: an LLM ingestion pipeline, then a bridge to a local Ollama model | 2025-10-24 to 10-29 | picture | absent | partly restated |
| C6: An accuracy benchmark with a hand-written expected answer beside a committed "inferred" one | 2025-10-28 to 11-01 | picture | absent | partly restated |
| C9: The Live Docs generator landed in one large commit | 2025-11-09 | words | absent | absent |
| C11: Documentation went polyglot, one adapter file per language | 2025-11-13 to 11-20 | picture | absent | partly restated |
| C13: The Explorer began as one visualize script and within two days became a package | 2025-11-20 to 11-22 | picture | absent | absent |
| C15: December's work gathered on the Explorer: a Local Map, a static site | 2025-12-01 to 12-19 | picture | partly restated | absent |
| C17: Readied for other people: a configuration file, CI and security scanning, a CLI package | 2025-12-12 to 12-15 | picture | absent | partly restated |
| C18: A two-week holiday pause | 2025-12-20 to 2026-01-02 | picture | absent | absent |
| C19: The SQLite graph store went; the docs became the graph; compiler-index ingestion went next | 2026-01-12 to 01-13 | picture | partly restated | partly restated |
| C20: The Rosetta samples arrived | 2026-01-14 | picture | absent | absent |
| C21: The shared package's barrel file was deleted | 2026-01-17 | words | absent | absent |
| C22: All language-model code, then the diagnostics subsystem, were shed | 2026-02-17 to 02-18 | picture | restated | partly restated |
| C23: Spec Kit was retired | 2026-02-23 | picture | absent | absent |
| C24: The Membrane Map was built, and the first browser test suite for it | 2026-03-24 to 03-30 | picture | partly restated | partly restated |
| C25: The work stopped for almost six months | 2026-04-02 to 09-27 | picture | restated | restated |
| C28: The return began with deletion: harness, benchmark, inference path, extension and server | 2026-09-27 | picture | restated | partly restated |
| C29: Self-graded answers replaced by the compilers' own | 2026-09-27 | picture | absent | absent |
| C30: The adapters rebuilt on tree-sitter, one language at a time | 2026-09-27 | words | absent | absent |
| C31: AGENTS.md and a new vision replaced the Copilot-era instructions | 2026-09-27 | words | restated | partly restated |
| C32: The World Map shipped as a new view | 2026-09-28 | picture | partly restated | absent |
| C33: The Membrane Map and the Circuit Board were retired | 2026-10-12 | picture | absent | absent |
| C35: The history reader and the History scrubber arrived | 2026-10-18 | picture | partly restated | **contradicted** |
| C37: From October the visible work was almost all the Explorer and its browser tests | 2026-10-02 to 11-13 | picture | partly restated | partly restated |
| C38: The 2D cards and 3D groupings tried as a run of named trials | 2026-11-04 to 11-12 | picture | absent | absent |

The grader's counts (restated 1, partly 0.5):

| | With the step panel | Without the step words |
| --- | --- | --- |
| Picture claims (23) | 3 restated, 8 partly, 12 absent, 0 contradicted: **0.30** | 2 restated, 10 partly, 10 absent, 1 contradicted: **0.30** |
| Words claims (4) | 1 restated, 3 absent: **0.25** | 1 partly, 3 absent: **0.13** |
| All 27 | 4 restated, 8 partly, 15 absent: **0.30** | 2 restated, 11 partly, 13 absent, 1 contradicted: **0.28** |
| What it said that the narrative contradicts | one: it calls the 18 Feb cut the period's biggest, where the 01-12 cut was larger | three: the history feature "added" on 2026-11-20; browser tests "arrived" on 2026-10-19; Java and diagnostics "arriving" on 2026-02-16, a day of deletion |
| Tester's cost, grader's cost | $1.74, $1.05 | $1.88, $1.09 |

**Which claims only the commit subjects could have told.** Of the four claims the key marks "words", only C31 was earned, and only with the panel: the tester quoted the subject "replace Copilot-era steering with AGENTS.md and a new vision"; without words the same step was found and described as one that "only touched `settings.json`". Three picture claims were restated with the panel and only partly without it, and in each the difference is words: C22 (the subjects "Remove diagnostics subsystem" and the finder's results for "remove", where the picture tester saw only "files dropped from 705 to about 630"), C28 (the subject and the step dialog's list of 154 deleted files, where the picture tester saw only a fall in the count, two days late) and C19's meaning (the finder's "GraphStore removed"; both partly). The words did not help everywhere: without them the tester sampled the whole track evenly, and it caught four claims the panel tester missed entirely (C5, C6, C11, C17) from the file names the map labels at each step. Both scores sit near 0.3; the panel tester's account is built from subjects and the finder, the other from labels and counts, and they miss different things.

### How each tester travelled

- **With the step panel** ([account](narrative-panel-opus-high/answer.md), [grade](narrative-panel-opus-high/grade.md); 115 actions: 48 looks, 44 clicks, 12 typed searches). It said how it worked: "I also used the history's commit search (the magnifier next to the date) to find renames and removals. I only looked at about 30 of the 1,453 steps, so between those points I'm going by commit messages and the change in counts." It searched the finder for "rename", "remove" and for months ("2026-05" and "2026-08" found nothing, which is how it proved the gap), and opened the step dialog to read lists of deleted files ([the dialog of the September 27 cut, #78](narrative-panel-opus-high/shots/078-look.png)). Its periods are built from commit subjects and the footer's file counts; the 3D picture itself is cited only for the file names floating on it ("Labels included render.ts, connections.ts and controller.ts").
- **Without the step words** ([account](narrative-picture-opus-high/answer.md), [grade](narrative-picture-opus-high/grade.md); 103 actions: 52 looks, 50 clicks, no typing). It never used the finder; it clicked points along the track about forty times and read, at each, the date, the short commit id, the footer's counts and the file names the map labels. Its own statement of the limits: "Counts can't tell additions from removals", "Moves and renames were never shown directly. No step showed a file moving or changing name", "Dates are narrowed, not pinned". It saw things the panel tester did not: a period when "the map became a star centred on one node", which hovering named as `data/graph-snapshots/workspace.snapshot.json`, and that node's disappearance with the groups rising from 4 to 34 on 2026-01-12. It also took the labels of the files a step changed for files the step added: of the last steps it wrote "the history feature itself was added: `live-docs/history.ts`, `history/format.ts` ..." (the history arrived in October; those steps changed those files). It did not see the September 27 cut to 496 files: its samples went from 677 on 09-27 to 628 on 09-29.

### What the history's controls did to both testers

1. **The button that looks like "go to the start" goes back one marked commit.** The scrubber's leftmost button draws a bar and a chevron, |◀, the sign media players use for "to the beginning". Its name is "Previous marked commit". Both testers pressed it first. With the panel, it went from step 1452 to step 1444 ([after one press, #5](narrative-panel-opus-high/shots/005-look.png): the card says "step 1444", the date 2026-11-20), and the tester dragged the thumb to the left end instead. Without the words, it pressed twice, from 2026-11-21 to two commits of 2026-11-20 ([after the second press, #6](narrative-picture-opus-high/shots/006-look.png)), and said: "The 'jump to start' button seems to go back only one step at a time, so next I'll click the start of the timeline directly." Hovering the button (panel run, #4) showed no name in the picture.
2. **The repository's map opens with its search field holding "Scan root" and the line "Nothing connects to Scan root"** beside it, and a pin counter reading "1 pin" ([the first picture of the run without words](narrative-picture-opus-high/shots/001-look.png)). Neither tester remarked on it; it is the first thing written at the top of the screen. Both narrative runs started at `http://127.0.0.1:8792/?view=local&mode=3d` on the November 21 build, and the window then pressed the map's History button before the first picture, so it is not shown whether "Scan root" is there before History opens. The address of that first picture, which reproduces it exactly (the same in both runs), is below. Decoded, its state holds the scan's root directory, the empty path, as the open subject (`"o":["[\"directory\",\"\"]"]`, `"d":[""]`): the page's name for that directory is "Scan root", and the one pin is it.

   ```
   http://127.0.0.1:8792/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeAHc2kjou17D8Cj1EAnCVwCiYLlSpcdO2bftOXgDKbBT4CGzonACesizwDqjGADJc7ghePn4gDlwcZA5UVvqQDAYsAL7wAGaoDuhcNE74ikQRVADWMpAAbKzEipgOqlxQffAkCBE6bKi09JBGxKhk4WxUqozwVKiSXCEAXqOQIiA60RSipEFYCMcM8KpOYDFQTAB0TAJLJGFzHhwglx8ENMBxZlQ3u8BBNBsMuAAlCQjN7wAj4RIAD1CYIhULgiHWHSCHFyGwsUKWq0kYNcXmGsVK8G4Fi4DihX3gOjyHDuAAlSJJUcROFxJAAhaIABTIUy2hM6AHUzBSmSAdnsAFqoVAUBHeNh6CQNfEmNi5bW6-UzI1UE2QD4ATm2mDsAEESgwFCBFKh8L41bl3NgAGJOOwB8ZnZRTAAiwNVMJATxW%2BEVzXwbIDZw66xAFSqOSg1Ww3PgACti6WuPBUFAANogesAHRAknNXHQHDq0VbsFbrYAuiBB-AAI5QEDQIXwIWQRsjipAA
   ```

## Task 3: the estate tasks again, set beside November 19

Twelve runs, the same tasks, words and start addresses as November 19's [Sonnet and Haiku runs](../../../2026-11-18/Probes/blind-playtests/README.md#by-task-and-rung), judged against the same `rightAnswer`s.

| Task | Sonnet medium, Nov 19 | Sonnet medium, Nov 21 | Haiku default, Nov 19 | Haiku default, Nov 21 |
| --- | --- | --- | --- | --- |
| estate-uses: "What uses this file?" | done, done | done, partly | done, done | done, done |
| estate-directory: "how the files in it connect" | done, partly | partly, partly | partly, partly | partly, partly |
| estate-link: "send me a link" | done, done | done, done | done, done | done, done |

**estate-uses.**
- [Sonnet 1](estate-uses-sonnet-medium-look-only/answer.md), done in 9 actions: arrived on `IPaymentService.cs` with its neighbours cut off on both sides and below ([#1](estate-uses-sonnet-medium-look-only/shots/001-look.png)), pressed fit at once ([#4](estate-uses-sonnet-medium-look-only/shots/004-click.png): the Contracts, PaymentService and Hub folders and the wires between their files), then opened the file's reader and answered from its Dependents: "I got this from the Dependents list in the Live Docs Explorer detail panel for the file".
- [Sonnet 2](estate-uses-sonnet-medium-look-only-2/answer.md), partly: it pressed `-` six times and never fit. After the last press the right-hand App.config is still cut off at the edge, and every "Internals" wraps as "Intern / als" ([#9](estate-uses-sonnet-medium-look-only-2/shots/009-click.png)). It answered "three files use `IPaymentService.cs`, though I only read this from the graph's lines", adding "A second App.config at the far right, which I couldn't see in full, also has a link".
- [Haiku 1](estate-uses-haiku-default-look-only/answer.md), done: its first click was the small → chip on the `Get` row, taken for "the incoming-usage control"; it opened the reader of `PaymentQuery.cs`, the type the chip points to ([#3](estate-uses-haiku-default-look-only/shots/003-point.png)): "My click opened the PaymentQuery.cs panel instead, which isn't the file you asked about." It reached `IPaymentService.cs`'s Dependents through the card's menu.
- [Haiku 2](estate-uses-haiku-default-look-only-2/answer.md), done in 5 actions: clicked the file's title, then the reader's Dependents tab.

On November 19 the Sonnet runs read the answer from the wires and only Haiku opened the reader; today three of four went to the reader, and the one that read the wires is the one that fell short.

**estate-directory.** All four partly; none got the cycle right.
- Finding the folder: both Sonnet runs and Haiku 2 typed "PaymentService" into the search at once; Haiku 1 clicked the World Map's "payments" box, whose card says "PaymentService" under the name ([#3](estate-directory-haiku-default-look-only/shots/003-look.png)), unfolded "6 files" and pressed "open payments".
- Framing: three of four opened `Data/` and answered from a view cut off on the right and below ([Sonnet 1, #7](estate-directory-sonnet-medium-look-only/shots/007-click.png): `PaymentService.cs` half off the right edge, `Payment.cs` off the bottom; [Haiku 1, #8](estate-directory-haiku-default-look-only/shots/008-click.png): App.config's card cut at the top). Only Sonnet 2 pressed fit, and at fit the cards' text is a few pixels high ([#9](estate-directory-sonnet-medium-look-only-2/shots/009-click.png)); it then said "The fourth Data file was off-screen, so I didn't read it" of a folder that has three.
- The cycle: App.config and PaymentService.cs each still say "1 connection returns in a cycle" beside a short loop at the card's edge (visible in both pictures above). Sonnet 1: "App.config and PaymentService.cs seem to refer to each other"; Sonnet 2: "a link with App.config that loops back on itself (the map flags a cycle)"; Haiku 2 repeated the card's words without saying between which files; Haiku 1 did not mention it.
- Directions: Sonnet 1 has App.config linking to `PaymentsContext.cs` and `PaymentService.cs` drawing on App.config, both the wrong way; Sonnet 2: "I read the directions from the line colours, so a few details may be off"; Haiku 2: "I read the links from the on-screen lines and badges rather than the underlying data, so the exact wiring is my best reading"; Haiku 1: "I couldn't read every edge label, so I can't say exactly which file each line runs to".
- Haiku 1 noticed that opening the folder had pinned things: "clicking the folder label in the map added pins to the view (the counter now says "2 pins")".

**estate-link.** All four took November 19's path exactly: search, type "ServiceRouting", click the result, look, and copy the 740-character address the window shows into the reply. The four links are the same address; decoded, it pins `Hub/ServiceRouting.cs` and makes it the subject (`"n":"Hub/ServiceRouting.cs"`), so all four are right (judged by decoding the address, not by opening it afresh). Nothing was copied to the clipboard. Sonnet 1: "I couldn't use the clipboard, so nothing was copied. The link is only in this message."

### November 19's four stumbles, today

1. **The view does not frame what the visitor came for: recurs.** Arriving on a pinned file still cuts off its neighbours ([#1](estate-uses-sonnet-medium-look-only/shots/001-look.png)); opening `Data/` still pushes files off the right and bottom ([#7](estate-directory-sonnet-medium-look-only/shots/007-click.png)); `-` still stops short of the whole ([#9](estate-uses-sonnet-medium-look-only-2/shots/009-click.png)). Changed: fewer testers recovered with fit. On November 19 nine of ten estate-directory runs pressed it after opening `Data/`; today one of four did. The estate-uses answer that fell short today is the one run that answered from a cut-off view.
2. **A World Map box does not name the folder it opens: recurs, and is now avoided rather than guessed.** The box still says "payments"; three of four estate-directory testers went straight to the search instead of the map, and the fourth found the folder's name on the card.
3. **A cycle's returning connection reads as a file linking to itself: recurs unchanged.** The same stub loops and words; "loops back on itself" (Sonnet 2), "seem to refer to each other" (Sonnet 1).
4. **Wires say nothing under the pointer: recurs.** Every estate-directory tester hedged the directions it read from lines and colours. Changed: in estate-uses the testers now answer from the reader's Dependents, a list in words, and do not need the wires at all.

**New today:** the → chip on a symbol's row was taken for a "who uses this" control and opened another file's reader (Haiku, estate-uses); opening a folder adds pins the visitor did not ask for (Haiku, estate-directory).

## Task 4: part of the ladder's remainder, the repository's tasks on Sonnet and Haiku

November 18's ladder left the repository's three tasks unrun on every rung, and the after-each runs. With the hour left, the repository's tasks ran on Sonnet and Haiku, two runs each, through `ladder.mjs` with its default four at a time ([ladder-check-plan.json](ladder-check-plan.json), one run, and [ladder-repo-plan.json](ladder-repo-plan.json), the other eleven). **Not run:** the repository's tasks on Opus at medium and at low effort (12 runs) and the seven after-each runs; [November 18's plan](../../../2026-11-18/Probes/blind-playtests/ladder-plan.json) still names them.

| Task | Sonnet medium | Haiku default |
| --- | --- | --- |
| repo-uses: "What uses this file?" | done, done | done, done |
| repo-directory: "how the files in it connect" | partly, done | partly, partly |
| repo-link: "send me a link" | done, done | done, done |

- **repo-uses.** All four named the five files. Three read them from the reader's Dependents; Sonnet 1 read them from the drawing ("links run from the right side of `pathfind.ts` to these files").
- **repo-directory.** Sonnet 2 had it whole, after walking down from the World Map ("Explorer is likely the web package. Try double-clicking it.", then "Expand src."). Sonnet 1 missed `search-field.ts` → `graph-search.ts`, and Haiku 1 `search-bar.ts` → `search-field.ts`. Haiku 2 typed the folder's path into the search; the results list the folder's four files under a heading that is the path, with no row for the folder itself ([#6](repo-directory-haiku-default-look-only-2/shots/006-look.png)). It opened two files' readers one by one and said: "The map doesn't show a folder view directly, so I built this picture from the search results and the file panels for `graph-search.ts` and `search-bar.ts`. I did not open `search-field.ts` or the test file."
- **repo-link.** All four searched, clicked the result, and copied the address into the reply; decoded, every link pins `scripts/live-docs/inspect.ts` as the subject. Nothing was copied to the clipboard.

## "Scan root" reproduced: what the History button does

Asked by the root after the first two milestones. Opened on the November 21 build through the browser lane at 1,280 by 800, by a short script outside the instrument (no tester):

- **Before History** ([picture](scan-root/1-before-history.png)): `http://127.0.0.1:8792/?view=local&mode=3d` shows the repository's 3D Local Map with its groups packed as clusters, the search field empty ("Search files, symbols and directories"), no second field, and "0 pins".
- **After pressing History** ([picture](scan-root/2-after-history.png)): the search field holds "Scan root", "Nothing connects to Scan root" stands in a second field beside it, the pin counter reads "1 pin", the clusters have opened into the whole graph of files, and the step card and scrubber are drawn.

So "Scan root" is what pressing History puts there. The code is the History button's handler in `packages/explorer/src/client/index.ts`, lines 602 to 607:

```ts
historyButton.addEventListener("click", () => {
  // Opening the history with nothing asked about shows the whole picture, since a repository's history is the whole
  // repository's (the owner, 2026-11-02); with a question, the mode that is on stands, and the toggle changes it.
  if (!historyControl.isOpen() && nothingAsked() && !state.openDirectories?.has("")) openRetainedDirectory("");
  historyControl.toggle();
});
```

Opening the root directory (the empty path) retains it as a pin, and the search bar's first field shows the newest pin, whose name for the empty path is "Scan root" (`search/search-field.ts`, line 103); the second field is the path search from that pin, which finds nothing connected to the whole. The narrative testers met this because their window pressed History before the first picture. It is recorded as seen, not judged.

**Why the second field says "Nothing connects to Scan root"** (read on November 21, nothing changed). The words come from a general rule applied to the root as an ordinary directory pin:

- The second field is drawn whenever there is a newest pin, and its placeholder is chosen in `packages/explorer/src/client/search/search-bar.ts`, lines 121 and 126 to 127:

  ```ts
  destinationGroup.hidden = !newest;
  …
  const connects = !reach || reach.forward.size + reach.reverse.size > 0;
  destinationInput.placeholder = connects || !newest ? askWords : `Nothing connects to ${newest.name}`;
  ```

  `askWords` is the field's own placeholder, "Path to…" (line 78, from `shared/template.html`); the other words appear when the newest pin reaches no file either way.
- `reach` is computed for the newest pin in `index.ts`, lines 1170 to 1175: `reach = newest ? reachOf(endFiles(newest, ground), ground.nodesById, ground.links) : null`.
- `endFiles` (`history/moment-paths.ts`, lines 61 to 68) stands a directory pin for every file under it, `[...ground.nodesById.keys()].filter(id => under(id, directory))`, and `under` (`views/localView/directory-state.ts`, lines 28 to 30) says that "the scan root, "", holds everything". So the root pin stands for every file in the map.
- `reachOf` (`pathfind.ts`, lines 124 to 134) walks forward along dependents and back along dependencies with the engine's `reachFrom` (`packages/engine/src/live-docs/pathfind.ts`, lines 108 to 116), which removes the starts: "the starts themselves are not listed". With every file a start, nothing is left, both maps are empty, and the rule says nothing connects.

So no rule names the root: it is treated as any directory pin, and for the root the general rule's answer is always "nothing", because there is no file outside it.

## Framing tried on strangers

The view that does not frame what the visitor came for has stood since November 19 (task 3 above). Tuning → 2D Layout → **Framing** has three values (`hand`, `follows`, `follows-files` in `packages/explorer/src/client/types.ts`; the control `#tuning-framing`): *By Hand*, the default, *Follows Pins*, and *Follows Pins, Out To Files*. What each does is in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md) ("The camera that follows the pins, a trial beside it"). A viewer's choice is kept in the page's saved interface state (`live-docs-explorer:ui:v2` in the browser's storage, read by `readPersistedUi` and `readLayoutSettings`) and carried in a shared link's layout settings. No product code was changed to try it: the instrument gained `--setting <group>.<name>=<value>`, which writes the choice into that saved state before the page first loads, names it in `run.json`, and checks in `setup.json` that Tuning's own control shows it (every run below: `"wanted": "follows"` or `"follows-files"`, `"shown"` the same, `"ok": true`; the Tuning heading in the sidebar shows a "1" beside it, the page's own sign of a changed setting).

The runs: [ladder-framing-plan.json](ladder-framing-plan.json), 16 runs through `ladder.mjs`, four at a time, estate-uses and estate-directory, Sonnet at medium and Haiku at default, two each, under Follows Pins (`…-follows-pins`) and under Out To Files (`…-follows-files`). They are set beside the eight By Hand runs of the same tasks and rungs in task 3 above (`…-look-only`). The rest of task 3's tasks were not run under Framing.

### estate-uses: arriving on a pinned file

"Whole at arrival" asks whether the first picture shows `IPaymentService.cs` with its neighbours whole; "Fit / zoom" is what the tester pressed to move the camera; "Cut-off view" whether the answer was read from a picture that still cut off what it named.

| Framing | Run | Whole at arrival | Fit / zoom | Cut-off view | Result | Actions |
| --- | --- | --- | --- | --- | --- | --- |
| By Hand | [Sonnet 1](estate-uses-sonnet-medium-look-only/answer.md) | no | Fit: the whole neighbourhood at once | no (reader) | done | 9 |
| By Hand | [Sonnet 2](estate-uses-sonnet-medium-look-only-2/answer.md) | no | `-` six times | yes | partly | 10 |
| By Hand | [Haiku 1](estate-uses-haiku-default-look-only/answer.md) | no | none | no (reader) | done | 12 |
| By Hand | [Haiku 2](estate-uses-haiku-default-look-only-2/answer.md) | no | none | no (reader) | done | 5 |
| Follows Pins | [Sonnet 1](estate-uses-sonnet-medium-follows-pins/answer.md) | no | Fit twice (no visible change), wheel, two drags ("Dragged too far. Drag back partly."), wheel twice | no: the wheel reached the whole ([#18](estate-uses-sonnet-medium-follows-pins/shots/018-scroll.png)) | done, from the lines | 19 |
| Follows Pins | [Sonnet 2](estate-uses-sonnet-medium-follows-pins-2/answer.md) | no | `-`, Fit, `-`, wheel, four drags | read piece by piece while panning | done, from the lines | 16 |
| Follows Pins | [Haiku 1](estate-uses-haiku-default-follows-pins/answer.md) | no | Fit ("The view didn't change, so I'll zoom out with the minus button"), `-` four times | yes ([#9](estate-uses-haiku-default-follows-pins/shots/009-click.png)) | partly | 10 |
| Follows Pins | [Haiku 2](estate-uses-haiku-default-follows-pins-2/answer.md) | no | none | no (reader) | done | 5 |
| Out To Files | [Sonnet 1](estate-uses-sonnet-medium-follows-files/answer.md) | no | `-` three times, closed the sidebar, Fit (no visible change, [#8](estate-uses-sonnet-medium-follows-files/shots/008-click.png)), drag, wheel twice | no: the wheel reached the whole ([#16](estate-uses-sonnet-medium-follows-files/shots/016-scroll.png)) | done, from the lines | 17 |
| Out To Files | [Sonnet 2](estate-uses-sonnet-medium-follows-files-2/answer.md) | no | Fit (no visible change), `-` twice | no (reader) | done | 12 |
| Out To Files | [Haiku 1](estate-uses-haiku-default-follows-files/answer.md) | no | Fit ("The view didn't change"), `-` twice | no (reader, through the card's menu) | done | 14 |
| Out To Files | [Haiku 2](estate-uses-haiku-default-follows-files-2/answer.md) | no | `-` once; a stray click pinned PaymentService.cs | yes | partly ("I couldn't get a complete answer from this map") | 13 |

**What the pictures show.** Under all three values the arrival is the same picture: `IPaymentService.cs` at reading size, the cards on its left and right cut by the window's edges ([By Hand](estate-uses-sonnet-medium-look-only/shots/001-look.png), [Follows Pins](estate-uses-haiku-default-follows-pins/shots/001-look.png)). With nothing pinned, following frames the subject's card, which is what By Hand's arrival frames too. The one visible difference is the Fit button at the toolbar's left, drawn pressed under both following values.

**The stumble Framing brings: Fit stops showing the whole.** Under By Hand, Fit framed the whole neighbourhood in one press ([Sonnet 1, #4](estate-uses-sonnet-medium-look-only/shots/004-click.png)). Under both following values the same button is "Follow pins", and with only the subject to follow it frames the subject's card again, so the picture barely moves: the card shifts some 16 px ([Follows Pins, Sonnet 1, #4](estate-uses-sonnet-medium-follows-pins/shots/004-click.png)). Six of the eight following runs pressed Fit, most as their first move; in every case the picture barely moved ("The view didn't change", Haiku twice), and they turned to `-`, the wheel and dragging. The three Sonnet runs that answered from the drawing took 16 to 19 actions, where By Hand's two Sonnet runs took 9 and 10. Results are the same count under each value: three done and one partly of four. Two of the eight following runs answered from a cut-off view and were partly right; under By Hand one of four did. Three of the eight following runs answered from the reader (two Haiku, one Sonnet); under By Hand three of four did.

### estate-directory: opening a folder

Every tester reached `PaymentService/` (by the search, or by the World Map's "payments" box and "open payments") and opened `Data/`. "Whole after Data opened" is the first picture after that press.

| Framing | Run | Whole after Data opened | Fit / zoom | Cut-off view | Result |
| --- | --- | --- | --- | --- | --- |
| By Hand | Sonnet 1 | no ([#7](estate-directory-sonnet-medium-look-only/shots/007-click.png)) | none | yes | partly |
| By Hand | Sonnet 2 | no | Fit: whole, text a few pixels high | no | partly |
| By Hand | Haiku 1 | no ([#8](estate-directory-haiku-default-look-only/shots/008-click.png)) | none | yes | partly |
| By Hand | Haiku 2 | no | none | yes | partly |
| Follows Pins | [Sonnet 1](estate-directory-sonnet-medium-follows-pins/answer.md) | no ([#7](estate-directory-sonnet-medium-follows-pins/shots/007-click.png)) | Fit: the camera went to `Data/`, App.config cut at the top, PaymentService.cs off the right ([#9](estate-directory-sonnet-medium-follows-pins/shots/009-click.png)) | yes | partly |
| Follows Pins | [Sonnet 2](estate-directory-sonnet-medium-follows-pins-2/answer.md) | no | `-` twice: all six cards, PaymentService.cs's right edge clipped, text small ([#7](estate-directory-sonnet-medium-follows-pins-2/shots/007-click.png)) | no | partly |
| Follows Pins | [Haiku 1](estate-directory-haiku-default-follows-pins/answer.md) | no: the camera had followed to `Data/` ([#8](estate-directory-haiku-default-follows-pins/shots/008-click.png)) | none | yes | partly |
| Follows Pins | [Haiku 2](estate-directory-haiku-default-follows-pins-2/answer.md) | no ([#7](estate-directory-haiku-default-follows-pins-2/shots/007-click.png)) | none | yes | partly |
| Out To Files | [Sonnet 1](estate-directory-sonnet-medium-follows-files/answer.md) | no: followed to `Data/` ([#4](estate-directory-sonnet-medium-follows-files/shots/004-click.png)) | `-`, then Fit, which went back to `Data/` ([#8](estate-directory-sonnet-medium-follows-files/shots/008-click.png)) | yes | partly |
| Out To Files | [Sonnet 2](estate-directory-sonnet-medium-follows-files-2/answer.md) | no | `-` twice: nearly whole, as above ([#7](estate-directory-sonnet-medium-follows-files-2/shots/007-click.png)) | no | partly |
| Out To Files | [Haiku 1](estate-directory-haiku-default-follows-files/answer.md) | no ([#7](estate-directory-haiku-default-follows-files/shots/007-click.png)) | none | yes | partly |
| Out To Files | [Haiku 2](estate-directory-haiku-default-follows-files-2/answer.md) | no | none | yes | partly |

**What the pictures show.** The picture after `Data/` opened depends on the route, not on the Framing value. Opened after the search, it is the PaymentService group from App.config at the left to PaymentService.cs cut by the right edge, `Payment.cs` cut by the bottom, the same picture under all three values (By Hand Sonnet 1 #7, Follows Pins Sonnet 1 #7, Out To Files Haiku 1 #7). Opened after the World Map's box, the camera has moved to bring `Data/` in, App.config cut at the top and PaymentService.cs at the right, again under all three values (By Hand Haiku 1 #8, Follows Pins Haiku 1 #8, Out To Files Sonnet 1 #4): under By Hand that move is the step's own pan to the newly opened folder. In every one, PaymentService.cs, the file the answer turns on, is the one cut off. No result changed: all twelve are partly, for the cycle and the directions, as in task 3.

**Fit again.** Under following, Fit framed `Data/`, the newest pin, not the folder the tester had asked for, and cut PaymentService.cs further ([#9](estate-directory-sonnet-medium-follows-pins/shots/009-click.png)); under By Hand it framed everything. The testers who got the whole folder into view under following did it with `-`, twice.

### What the trial shows

- Neither following value changes the first picture a stranger meets on these two tasks: the arrival on a pinned file is the subject at reading size with its neighbours cut, and an opened folder is framed from its top-left or at the newest opening, with the hub file at the right edge cut.
- Both take away the one press that recovered the whole: Fit becomes "Follow pins", and pressed on a single subject it changes nothing visible, or on an opened folder frames the folder last opened. Six of eight following estate-uses testers pressed it and found the picture unchanged; the Sonnet runs then took about twice the actions to reach the whole by wheel and drag.
- The results are the same under all three values: three done of four on estate-uses, none whole on estate-directory.
- No tester remarked on the camera moving when it had not asked: with look-only, a tester sees only the picture after its press has come to rest.
- Tuning → 2D Layout → **Arrival**, the lever aimed at this stumble, was tried next: [Arrival tried on strangers](#arrival-tried-on-strangers).

## Arrival tried on strangers

Asked by the root after the Framing trial. Tuning → 2D Layout → **Arrival** decides how an *arrival* is framed: a fresh subject from a link, a search choice or the first open (`localMap.arrival`, values `reading`, `then-neighbours`, `neighbours` in `packages/explorer/src/client/types.ts`; the control `#tuning-arrival`). `main` stands at the first, **Reading Size**: the subject's card at the scale its words are written for, neighbours allowed beyond the window. **Reading, Then Neighbours** arrives the same way and, once the picture has settled, holds 900 ms and eases over 700 ms out to the neighbours' frame, the frame Fit frames; **Neighbours** arrives on that frame at once ([the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md), "The camera follows the intent a gesture declares"). The owner's direction of 2026-11-04 is that a shared 2D link "can begin with one deliberately framed card, composed to teach its subject in a single view as far as feasible, with neighbors allowed beyond the viewport", and on 2026-11-19 they proposed the pull back for the eye to judge: "The user simply will not know that the deepest level of detail exists unless we show it to them."

The runs: [ladder-arrival-plan.json](ladder-arrival-plan.json), 20 runs through `ladder.mjs`, Framing left at By Hand: estate-uses and estate-directory, Sonnet at medium and Haiku at default, two each, and repo-uses, Sonnet and Haiku, one each, under each of the two values (`…-arrival-then-neighbours`, `…-arrival-neighbours`). Every setup passed (`"wanted"` and `"shown"` the same). They are set beside the By Hand runs at Reading Size of task 3 (estate) and task 4 (repo-uses). One thing the instrument hides: the window waits for the page to come to rest before the tester's first picture (up to 15 s), so under Reading, Then Neighbours the testers never saw the reading-size moment; their first picture is the neighbours' frame, as under Neighbours. A person would see the card for about a second and then the pull back.

### What each arrival looks like

By my eye on the 1,280 by 800 pictures; text sizes are the rough height of a line of text, in the picture's pixels.

- **estate-uses, Reading Size** ([By Hand, #1](estate-uses-sonnet-medium-look-only/shots/001-look.png)): `IPaymentService.cs` large in the middle, its name about 18 px, its symbols about 16 px, and under `IPaymentService` its description at about 16 px, "The payment service's contract, one deployment per workload…"; the cards on both sides cut by the window's edges.
- **estate-uses, the neighbours' frame** ([Neighbours, #1](estate-uses-sonnet-medium-arrival-neighbours/shots/001-look.png); Reading, Then Neighbours [#1](estate-uses-sonnet-medium-arrival-then-neighbours/shots/001-look.png) is the same picture): the Contracts, PaymentService and Hub folders whole with every wire, file names about 16 px, symbol names about 13 px, all readable. What is lost: the symbols' descriptions are not drawn, and "Internals" still wraps as "Intern / als". It is the picture By Hand's Fit gave Sonnet 1 at its second action.
- **repo-uses, Reading Size** ([By Hand, #1](repo-uses-haiku-default-look-only/shots/001-look.png)): `pathfind.ts` large in the middle with its description and a description under every symbol, names and words about 11 to 13 px, readable, `live-docs/pathfind.ts` cut on the left, `graph-search.ts` and `pathfind.test.ts` cut on the right; the files that use it are mostly off the screen.
- **repo-uses, the neighbours' frame** ([Neighbours, #1](repo-uses-haiku-default-arrival-neighbours/shots/001-look.png)): a different picture. Seven files in five nested folders (`packages`, `live-docs`, `…rer/src/shared`, `client`, `packages/explorer/src/client/search`, `history`) and `index.ts` at the far right, with the bundle of wires from `pathfind.ts` running to it. File names about 12 px, symbol names about 10 px, still legible: the map keeps its names at a readable size as it draws out, and pays in content instead; no descriptions at all; `graph-search.ts` shows two of its symbols and "+16 symbols", `live-docs/pathfind.ts` "+24 symbols", `index.ts`'s one row "Inter…". It is a map of where the file sits, not of what it says.
- **estate-directory**: Arrival changes nothing a tester saw. A folder chosen in the search is an arrival, and `PaymentService/` fits at reading size, so the picture is the same under all three values ([By Hand, #5](estate-directory-sonnet-medium-look-only/shots/005-click.png) and [Neighbours, #5](estate-directory-sonnet-medium-arrival-neighbours-2/shots/005-click.png) are the same picture): the four items of the folder whole at the bottom of the window, the top half empty. Opening `Data/` inside it is a step, not an arrival, and gives the same cut picture as before ([Reading, Then Neighbours, #7](estate-directory-sonnet-medium-arrival-then-neighbours/shots/007-click.png)).

### What the testers did

estate-uses and repo-uses: "Moved the camera" is any press of Fit, `-`, `+`, the wheel or a drag.

| Arrival | Task, run | Whole at arrival | Moved the camera | Answered from | Result | Actions |
| --- | --- | --- | --- | --- | --- | --- |
| Reading Size (By Hand) | estate-uses, Sonnet 1 | no | Fit | the reader | done | 9 |
| Reading Size (By Hand) | estate-uses, Sonnet 2 | no | `-` six times | a cut-off drawing | partly | 10 |
| Reading Size (By Hand) | estate-uses, Haiku 1 | no | no | the reader | done | 12 |
| Reading Size (By Hand) | estate-uses, Haiku 2 | no | no | the reader | done | 5 |
| Reading, Then Neighbours | [estate-uses, Sonnet 1](estate-uses-sonnet-medium-arrival-then-neighbours/answer.md) | yes, readable | no | the reader, through the card's ⋯ menu ([#2](estate-uses-sonnet-medium-arrival-then-neighbours/shots/002-click.png)) | done | 7 |
| Reading, Then Neighbours | [estate-uses, Sonnet 2](estate-uses-sonnet-medium-arrival-then-neighbours-2/answer.md) | yes, readable | no | the reader, the same way | done | 7 |
| Reading, Then Neighbours | [estate-uses, Haiku 1](estate-uses-haiku-default-arrival-then-neighbours/answer.md) | yes, readable | no | the reader (clicked the card's name) | done | 5 |
| Reading, Then Neighbours | [estate-uses, Haiku 2](estate-uses-haiku-default-arrival-then-neighbours-2/answer.md) | yes, readable | no | the reader, the same way | done | 5 |
| Neighbours | [estate-uses, Sonnet 1](estate-uses-sonnet-medium-arrival-neighbours/answer.md) | yes, readable | no | the reader (the card's name) | done | 5 |
| Neighbours | [estate-uses, Sonnet 2](estate-uses-sonnet-medium-arrival-neighbours-2/answer.md) | yes, readable | no | the reader, the same way | done | 5 |
| Neighbours | [estate-uses, Haiku 1](estate-uses-haiku-default-arrival-neighbours/answer.md) | yes, readable | no | the reader, the same way | done | 5 |
| Neighbours | [estate-uses, Haiku 2](estate-uses-haiku-default-arrival-neighbours-2/answer.md) | yes, readable | no | the reader, the same way | done | 5 |
| Reading Size (By Hand) | repo-uses, Sonnet 1 | no | no | the drawing ("links run from the right side of `pathfind.ts`") | done | 5 |
| Reading Size (By Hand) | repo-uses, Sonnet 2 | no | no | the reader | done | 7 |
| Reading Size (By Hand) | repo-uses, Haiku 1 | no | no (it scrolled the reader) | the reader | done | 14 |
| Reading Size (By Hand) | repo-uses, Haiku 2 | no | no | the reader | done | 5 |
| Reading, Then Neighbours | [repo-uses, Sonnet](repo-uses-sonnet-medium-arrival-then-neighbours/answer.md) | yes, names readable, no descriptions ([#1](repo-uses-sonnet-medium-arrival-then-neighbours/shots/001-look.png)) | no | the reader (clicked `pathfind.ts`'s name) | done | 5 |
| Reading, Then Neighbours | [repo-uses, Haiku](repo-uses-haiku-default-arrival-then-neighbours/answer.md) | yes, names readable, no descriptions | no | the reader, the same way | done | 5 |
| Neighbours | [repo-uses, Sonnet](repo-uses-sonnet-medium-arrival-neighbours/answer.md) | yes, names readable, no descriptions | no | the reader, the same way | done | 5 |
| Neighbours | [repo-uses, Haiku](repo-uses-haiku-default-arrival-neighbours/answer.md) | yes, names readable, no descriptions | no | the reader, the same way ([#2](repo-uses-haiku-default-arrival-neighbours/shots/002-click.png)) | done | 5 |

estate-directory: all eight Arrival runs are partly, as all eight By Hand runs were, for the cycle and the directions ("one of its connections returns to itself", "so the two reference each other"). Seven of eight answered from the cut picture after `Data/` opened without moving the camera; Sonnet 1 under Neighbours pressed Fit and got the whole folder with file names about 9 px and paths about 7 px, hard to read ([#6](estate-directory-sonnet-medium-arrival-neighbours/shots/006-click.png)), and answered from that.

### What each value mends and what it costs

- **Reading Size** (`main`). Mends nothing here; it is the default the stumble was found on. What it gives: the subject's own words at the size they are written for, the "one deliberately framed card" of the owner's direction, with its symbols' descriptions. What it costs a stranger: the answer to "what uses this file" is off the edges, and a stranger must know to look. On today's build half of them did: two of four estate-uses testers moved the camera (one by Fit, at once and well; one by `-` six times, and fell short), two went to the reader without moving it; on repo-uses none of four moved it. On November 19 all eight estate-uses testers moved the view first. Those who moved it knew there was more: the cut cards at both edges said so.
- **Neighbours** and **Reading, Then Neighbours**, as these testers met them. Mends: on the estate, the whole neighbourhood is there at once and still readable (names about 16 px), and no tester moved the camera; every one of the twelve "what uses" runs, on both maps, clicked the subject's name or its ⋯ menu as its first or second act, opened the reader, and answered rightly from its Dependents in 5 to 7 actions. No By Hand run was that uniform (5 to 14 actions, one partly). Costs: the card's own words go. On the estate the symbols' descriptions are not drawn. On this repository the picture is a different thing: seven files in five folders, names about 12 px and symbols about 10 px, every description gone and most symbols folded into "+N symbols"; a stranger sees where `pathfind.ts` sits and what it touches, and cannot read what it is without opening it. Whether strangers read the drawing at all under these values, the runs cannot say: none tried to; each went to the reader at once, which is also where they get the subject's words back.
- **For the owner's direction.** The trial does not show a stranger failing to find what lies beyond a reading-size card: those who wanted it found it, by Fit or by the reader. It does show that a stranger given the whole goes straight to a list in words and never reads the drawing, and that on a file of this repository with many neighbours the whole keeps its names readable by giving up every description. The difference between the two "neighbours" values, the second of reading size a person sees before the pull back, is invisible to a look-only tester and was not measured.
- **estate-directory** is untouched by Arrival: the folder's arrival already fits, and the cut picture comes from opening `Data/`, a step, which Arrival does not frame.

## Step tried on strangers

Asked by the root after the Arrival trial, on a new build: the day branch at `c5458a329`, its `dist/explorer` rebuilt at 07:01 UTC (`siteChanged` false in every run below; the repository's map now counts 1,165 files where this morning's counted 1,134, so the repository's comparisons cross a change of data as well as of code). Since the runs above, the product has:

- **three mends to the default.** A folder chosen in the search is framed by its whole box, where it stood in the lower half of the window with the upper half empty. The folder a search opened no longer stands in for the next step's newcomer. A directory opened by the handle on its label is a step, so its label and first row are brought into view.
- **a lever**, Tuning → 2D Layout → **Step** (`localMap.step`, the control `#tuning-step`): `least`, the default, *Least Pan*, which keeps the scale and pans the least that brings the opened folder's label and first row in; `whole`; and `lines`, *With Its Lines*, which eases out to the opened folder and the cards its lines reach, only where a scale at or above the floor holds them, else does what Least Pan does. The builder's pictures and reading are in [the step-framing evidence](../../Screenshots/step-framing/README.md). `whole` was not run: on these steps it gives nearly Least Pan's picture.

The runs: [ladder-step-plan.json](ladder-step-plan.json), 20 runs through `ladder.mjs`: estate-directory and repo-directory under `least` and under `lines`, Sonnet at medium and Haiku at default, two each, and repo-uses under each, one each of Sonnet and Haiku (`…-step-least`, `…-step-lines`). The first, `estate-directory-haiku-default-step-lines`, was run alone as the setup probe: `"wanted": "lines"`, `"shown": "lines"`, `"ok": true`, as in every run after it. None timed out; the machine's load was between 4 and 24. They are set beside this morning's By Hand runs of the same tasks (task 3 and task 4, `…-look-only`), which ran on the build before the mends: morning against `least` measures the mends, `least` against `lines` measures the lever.

**What the instrument hides here.** The window waits for the page to come to rest before the tester's next picture, so under `lines` a tester never sees the ease, only where it ends; under `least` it sees only the end of the pan. Neither tester saw the motion that tells where the opened folder came from. On the estate this matters little to a reading, since the end picture under `lines` holds everything the motion would have shown; it means the trial says nothing about whether the ease itself loses a person's place.

### What each value's step looks like

- **The folder chosen in the search, now** ([#5](estate-directory-haiku-default-step-lines/shots/005-click.png)): `PaymentService/` stands centred in the window, its box whole, the Data handle and three cards at reading size. This morning the same choice put the folder in the lower half with the upper half empty ([By Hand, #5](estate-directory-sonnet-medium-look-only/shots/005-click.png)). The first mend is seen as described.
- **estate-directory, `Data/` opened, Least Pan** ([#7](estate-directory-haiku-default-step-least/shots/007-click.png)): the camera keeps reading size and pans up to bring `PaymentService/Data`'s label and first row in; `PostPaymentRow.cs`, `PaymentsContext.cs` and `Payment.cs` whole. App.config is cut at the top, its name half under the search bar's shade, and `PaymentService.cs` is cut at the right edge, the file the answer turns on. This morning's picture of the same press cut `Payment.cs` at the bottom and `PaymentService.cs` at the right ([By Hand, #7](estate-directory-sonnet-medium-look-only/shots/007-click.png)); now the cut has moved from the bottom to the top, and `PaymentService.cs` is still cut. Opened from the World Map's box instead of the search, Least Pan gives the same picture ([#4](estate-directory-sonnet-medium-step-least-2/shots/004-click.png)).
- **estate-directory, `Data/` opened, With Its Lines** ([#7](estate-directory-haiku-default-step-lines/shots/007-click.png); from the World Map's box, [#4](estate-directory-sonnet-medium-step-lines/shots/004-click.png), the same picture): eased to about nine tenths of reading size; App.config, `PaymentService.cs`, `PaymentsContext.cs`, `PostPaymentRow.cs` and `Payment.cs` whole with every line, and the two cycle loops visible at App.config's left and `PaymentService.cs`'s right. File names drop from about 14 px to about 13 px and stay readable; I see no description or name lost, since these cards carry none at reading size either. Not in view: `PaymentService.csproj`, which no line reaches, off to the right, as it is under Least Pan.
- **repo-directory.** The two values gave one picture on every step a tester took. The Sonnet testers walked down from the World Map (the `explorer` box, then `src`, then `client`): `src` fits at reading size under both ([least, #4](repo-directory-sonnet-medium-step-least/shots/004-click.png)), and `client` is too large to hold at or above the floor, so With Its Lines did what Least Pan does, the scale kept and `client`'s label and first row brought in at the left, `palette.ts` and its test at reading size, the rest of `client` beyond the edges ([least, #6](repo-directory-sonnet-medium-step-least/shots/006-click.png); [lines, #6](repo-directory-sonnet-medium-step-lines/shots/006-click.png), the same picture). The Haiku testers never opened a folder in the map: as this morning, they typed the folder's path into the search, which lists its four files under a heading, and opened a file from the list.
- **repo-uses.** No tester pressed a cell, so no step was taken under either value; the runs measure nothing of the lever.

### What the testers did under each Step value

estate-directory, the step being `Data/` opened. "Whole after the step" asks whether the first picture after it shows `Data/`'s files and the folder's other connected files whole.

| Value | Run | Whole after the step | Moved the camera | Answered from | Result | Actions |
| --- | --- | --- | --- | --- | --- | --- |
| By Hand, morning | Sonnet 1 | no: `Payment.cs` and `PaymentService.cs` cut | no | the cut drawing | partly | 8 |
| By Hand, morning | Sonnet 2 | no | Fit: the whole folder, text small | the drawing at Fit | partly | 10 |
| By Hand, morning | Haiku 1 | no | no | the cut drawing | partly | 9 |
| By Hand, morning | Haiku 2 | no | no | the cut drawing | partly | 8 |
| Least Pan | [Sonnet 1](estate-directory-sonnet-medium-step-least/answer.md) | no: App.config and `PaymentService.cs` cut | Fit ("Let me zoom out to see the whole thing"): the whole folder, file names about 9 px ([#9](estate-directory-sonnet-medium-step-least/shots/009-click.png)) | the drawing at Fit | partly | 10 |
| Least Pan | [Sonnet 2](estate-directory-sonnet-medium-step-least-2/answer.md) | no | Fit | the drawing at Fit | partly | 7 |
| Least Pan | [Haiku 1](estate-directory-haiku-default-step-least/answer.md) | no | no | the cut drawing | partly | 8 |
| Least Pan | [Haiku 2](estate-directory-haiku-default-step-least-2/answer.md) | no | Fit: "The view is zoomed into the Data subfolder. I'll fit the whole scene so I can see every file and its links." | the drawing at Fit | partly | 10 |
| With Its Lines | [Sonnet 1](estate-directory-sonnet-medium-step-lines/answer.md) | yes | no | the whole drawing | partly | 5 |
| With Its Lines | [Sonnet 2](estate-directory-sonnet-medium-step-lines-2/answer.md) | yes | no | the whole drawing | partly | 8 |
| With Its Lines | [Haiku 1](estate-directory-haiku-default-step-lines/answer.md) | yes | no | the whole drawing | partly | 8 |
| With Its Lines | [Haiku 2](estate-directory-haiku-default-step-lines-2/answer.md) | yes | no | the whole drawing | partly | 9 |

repo-directory, where the step happened only in the Sonnet runs' walk down from the World Map:

| Value | Run | Step taken | Moved the camera | Answered from | Result | Actions |
| --- | --- | --- | --- | --- | --- | --- |
| By Hand, morning | Sonnet 1 | none: searched the path | Fit | the drawing | partly | 10 |
| By Hand, morning | Sonnet 2 | `src`, `client`, then searched the path | Fit, the wheel | the readers | done | 24 |
| By Hand, morning | Haiku 1, Haiku 2 | none: searched the path | no | the readers | partly, partly | 17, 13 |
| Least Pan | [Sonnet 1](repo-directory-sonnet-medium-step-least/answer.md) | `src`, `client` | the wheel, sideways and down | the readers | partly: did not say `search-bar.ts` uses `search-field.ts` ("I didn't open its own page") | 21 |
| Least Pan | [Sonnet 2](repo-directory-sonnet-medium-step-least-2/answer.md) | `src`, `client` | Fit, Control+wheel | the readers | done | 23 |
| Least Pan | [Haiku 1](repo-directory-haiku-default-step-least/answer.md) | none: searched the path | no | the readers | partly | 11 |
| Least Pan | [Haiku 2](repo-directory-haiku-default-step-least-2/answer.md) | none: searched the path | no | one reader ("I didn't open `search-bar.ts`") | partly | 6 |
| With Its Lines | [Sonnet 1](repo-directory-sonnet-medium-step-lines/answer.md) | `src`, `client`, then gave up the walk and searched the path | the wheel, Fit | the readers | done | 26 |
| With Its Lines | [Sonnet 2](repo-directory-sonnet-medium-step-lines-2/answer.md) | `src`, `client`, then searched the path | the wheel, Fit | the readers | done | 24 |
| With Its Lines | [Haiku 1](repo-directory-haiku-default-step-lines/answer.md) | none: searched the path | no | the readers | done | 11 |
| With Its Lines | [Haiku 2](repo-directory-haiku-default-step-lines-2/answer.md) | none: searched the path | no | the readers | done | 10 |

repo-uses: all four done. Under both values Haiku went to `pathfind.ts`'s reader (5 and 11 actions). Sonnet pressed Fit and, under Least Pan, then the reader (7 actions); under With Its Lines it answered from the drawing at Fit in 3 actions, naming the five files, one with a wrong folder (`client/search/pathfind.test.ts` for `client/pathfind.test.ts`).

### Reading

- **The mends, morning against Least Pan, on the estate.** The folder chosen in the search now stands whole and centred, as described. The step that opens `Data/` still cuts the picture: the cut moved from `Payment.cs` at the bottom to App.config at the top, and `PaymentService.cs` stays cut at the right. Results did not change (partly, four of four, both times). What changed is what the testers did: three of four now pressed Fit after the step, against one of four this morning, and one said why: "The view is zoomed into the Data subfolder." A picture whose top card is cut under the search bar seems to say "there is more" more plainly than one cut at the bottom; Fit then gave the whole at about 9 px, which they read.
- **The lever, Least Pan against With Its Lines, on the estate.** With Its Lines gave every tester the whole folder after the step, readable, and none of the four moved the camera; they answered from the drawing in 5 to 9 actions, against 7 to 10 under Least Pan. It cost almost nothing to see: the names shrink a tenth and nothing is hidden. It did not change a single answer: all eight are partly, for the same reasons as every estate-directory run today, the cycle drawn as a stub and the directions read from colours ("I read the links off the diagram, so the direction of each one is my best reading"). So the lever ends the stumble of the cut view on this step and leaves the stumbles of reading the drawing where they were.
- **The lever on this repository.** Not exercised: the one large step taken (`client`) is beyond the floor, so both values gave the same picture, and the Haiku testers took no step at all. The repo-directory results differ between the two values (two done and two partly under Least Pan, four done under With Its Lines), but no step framing differed between them, so the difference belongs to the testers' own routes through the readers, not to the lever. Under both values both Sonnet testers spent 21 to 26 actions walking down and scrolling `client`; under With Its Lines both gave up the walk and typed the path into the search, as the walking Sonnet tester did this morning.
- **Where a value loses the tester's place.** Least Pan's estate step leaves App.config's name half under the search bar's shade at the top: the folder the tester did not open is the one cut. With Its Lines loses nothing visible on the estate; whether the ease loses a person's place in motion is what the instrument hides.

## The choice before a scan: the instrument, the folder and the tasks (runs to come)

Asked by the root on November 21, after the Step trial: try on strangers the choice a person makes before a scan, what it will read and what it leaves out, on its trial page (`Probes/leave-out/choice/choice.html`, the [leave-out record](../leave-out/README.md), "Fourth leg"), in its two layouts, *By reason* and *Folders*. The owner, 2026-11-21: "This would then behoove us to ensure that the user, either via CLI or the page, has a good solid way to create ignore patterns on what they scan, before they scan it." Their clone at work holds over 100,000 files, most of them packages, under git and TFS. The 32 runs wait for the page's builder to mend its drawing and add the link parameters `?layout=reason|folders` and `&switch=off`; this section holds what was made for them and two pilot runs on the page as it stood at 07:10 UTC.

### What the instrument gained

Described in [its README](../../../../../../scripts/playtest/README.md#a-page-that-is-not-the-explorer-and-a-folder-handed-to-it): a run can start on a page given by its file (served read-only at `http://127.0.0.1:8793/` with its query, so the address names no folder of this repository), hand a folder to a named file input before the tester's first look, waiting for a named element to show its words and the page to rest, and press controls in the same setup. `setup.json` records each. **Checked:** `estate-uses` on Haiku was run again with no new option ([instrument-check-estate-uses-haiku](instrument-check-estate-uses-haiku/)): served on 8792 from `dist/explorer` as before, no `setup.json` written, 10 actions, right (the four files from the reader's Dependents).

### The folder

[make-leave-out-folder.mjs](make-leave-out-folder.mjs) makes it; to make it again:

1. Clone DNN shallowly and anonymously, with nothing of this project in the request: `GIT_TERMINAL_PROMPT=0 git -c credential.helper= clone --depth 1 https://github.com/dnnsoftware/Dnn.Platform.git dnn`. On November 21 that gave `d6c3af4d78c2a064913bfd72f0bac4a992997e3a` (10,940 files without `.git`, 82 project files, 26 `.gitignore` files).
2. `node make-leave-out-folder.mjs dnn Source`. It runs `Probes/leave-out/make-folder.mjs` (unchanged) to make the full folder of the owner's shape, then:
   - removes DNN's own top `Packages/` (one `repositories.config`), which on a Windows drive is the same folder as the made `packages/`;
   - keeps in each `packages` folder its `repositories.config` and its first packages by name, 30 at the top and 4 in a project folder;
   - puts back DNN's 25 nested `.gitignore` files, not its top one: a TFS folder has none at its top, and that one would leave out every `bin`, `obj` and `packages` by its own lines.

The folder is named `Source`, the name the page shows. It holds **17,244 files**: DNN's own (with the nested `.gitignore` files), 1,714 built files under `bin` and `obj` beside the projects, 4,577 package files in 45 NuGet-shaped `packages` folders, and NuGet's recommended `.tfignore` in 15 project folders. It took 54 s to make. Handed through the folder input it is listed and decided in 10.4 s at a load of 3 to 5, and 29.8 s at a load near 18 (`setup.json` of the pilots); the full made folder takes 65 to 71 s. It lives in the builder's scratch folder and is not committed.

The page shows: **10,945 files will be read · 6,299 files left out**. The left-out groups: NuGet packages, 30 folders, 3,242 files; build output beside a project, 134 folders, 1,420 files; `.tfignore: packages`, 15 folders, 1,335 files; `.gitignore: [Bb]in` 9 folders 126 files, `[Oo]bj` 9 and 63, `bin/` 5 and 70, `obj/` 5 and 35; `/*/css/*.css` 6 files; `/*/scripts/bundles/*.svg` 2 files. Checked against the making: 1,714 built and 4,577 package files plus the 8 single files are exactly 6,299. [leave-out-answers.mts](leave-out-answers.mts) prints these from the page's own model over the folder, with patterns added, and gave the answers below.

### The tasks, with their answers written before any run

In [tasks.json](../../../../../../scripts/playtest/tasks.json), each twice, `-reason` and `-folders`, each with `?layout=…&switch=off`. The root's four, changed: each names a real folder of the made tree and gives the visitor's own reason, so that a tester is asked to act on a premise and not told how; task 4 says "without changing anything". No sentence names a control or what the page calls anything.

| Task | The visitor's words | The answer |
| --- | --- | --- |
| `leave-out-read` | "A scan of this folder is about to start. Without changing anything: how many files will it read, what is it leaving out, and why? Name the largest things left out and the reason for each." | 10,945 read, 6,299 left out; the largest: NuGet packages 3,242 (the top `packages/` 661), build output 1,420, `.tfignore: packages` 1,335, then the nested `.gitignore` groups. |
| `leave-out-keep` | "Our team wrote what is in `DNN Platform/Library/packages` ourselves; it isn't downloaded. Make the scan read that folder, then tell me how many files the scan will read." | Left out as NuGet packages (89 files); kept, **11,034** read. Keeping the whole group would give 14,187. |
| `leave-out-drop` | "We don't want the tests in this scan. Make it leave out `DNN Platform/Tests`, then tell me how many files the scan will read." | 900 files, 543 of them read until then; left out, **10,402** read. |
| `leave-out-why` | "Without changing anything: will the scan read the folder `Dnn.AdminExperience/EditBar/Dnn.EditBar.UI/bin`? Why or why not?" | No: the line `[Bb]in` (line 53) of `Dnn.AdminExperience/.gitignore`, shown as `.gitignore: [Bb]in`; 14 files; as a project's build output it would be left out without the line too. |

The full answers, with what counts as right, partly and wrong, are each task's `rightAnswer`.

### Two pilots, on the page as it stood

The page did not yet read `?layout` or `&switch`, so the query was ignored, the switch was drawn, and the Folders pilot's setup pressed `[data-layout="tree"]` to open Folders before the first look.

| Run | Task | Model | Turns | Actions (looks) | Tokens in, out | Wall | Lock wait | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [pilot-leave-out-read-reason-sonnet](pilot-leave-out-read-reason-sonnet/) | leave-out-read, By reason | Sonnet, medium | 2 | 1 (1) | 6k, 0.6k | 38 s | 54 s | $0.015 |
| [pilot-leave-out-keep-folders-sonnet](pilot-leave-out-keep-folders-sonnet/) | leave-out-keep, Folders | Sonnet, medium | 13 | 12 (6) | 58k, 1.0k | 33 s | 301 s | $0.055 |

- **leave-out-read, By reason: right in one look** ([answer](pilot-leave-out-read-reason-sonnet/answer.md); the [picture](pilot-leave-out-read-reason-sonnet/shots/001-look.png) it read). The totals, all nine groups with their counts, and a reason for each: "downloaded third-party packages … skipped because the 'Leave out build output and packages' option is checked"; "The folder's `.tfignore` file (Team Foundation's ignore list) excludes the `packages` folders". It added "It won't look inside 0 folders", the page's own words read back without meaning. On this layout the task is answered by the first picture; it measures reading, not finding.
- **leave-out-keep, Folders: right in 12 actions** ([answer](pilot-leave-out-keep-folders-sonnet/answer.md)). It opened `DNN Platform`, scrolled, opened `Library`, scrolled until the row `packages · 89 files left out · NuGet packages` stood with an empty box ([#8](pilot-leave-out-keep-folders-sonnet/shots/008-scroll.png)), ticked it, scrolled back to the top and read "11,034 files will be read · 6,210 files left out" ([#11](pilot-leave-out-keep-folders-sonnet/shots/011-scroll.png)). What I see: the row it wanted carries its reason at the right edge, and the totals sit above the tree, out of view once the tree is scrolled, so it scrolled back to read them.
- **The wording.** Both testers took the visitor's words as meant and changed nothing they were not asked to. Neither pressed Scan ("I didn't press Scan, so nothing has been run yet"). The By reason read task may prove easy for every tester; the Folders read task and the three acting tasks are where the layouts should part.

### Not yet done

- The 32 runs, on the root's word once the mended page with its link parameters is merged. The plan is the eight `leave-out-*` tasks on Sonnet at medium and Haiku at default, two each, with `"folder"` the made `Source`; the folder and the DNN clone stay in the builder's scratch folder until then.
- The four runs of Cut Counted (`localMap.cutCounted=on`), on the root's word once its counts are changed.

## Cut Counted tried on strangers

Asked by the root after the leave-out pilots. Tuning → 2D Layout → **Cut Counted** (`localMap.cutCounted`, the control `#tuning-cut-counted`), a trial of the same day, default *Off*: *On* puts, at each edge of the view past which what the last step opened goes on, a small control with an arrow and the count of its cards beyond that edge, each card counted at one edge only; a press pans, the scale kept, to the nearest of them ([the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md), "What a step frames"). Run on `dist/explorer` rebuilt at 07:44 UTC from `b37c67fec`, which holds the counts' second round (`siteChanged` false in every run; the repository's map now counts 1,166 files). The runs: [ladder-cut-counted-plan.json](ladder-cut-counted-plan.json), `repo-directory` with `localMap.step=least` and `localMap.cutCounted=on`, Sonnet at medium and Haiku at default, two each, set beside the Step trial's Least Pan runs of the same task.

**The setup probe found a fault of the instrument, mended.** The window looked for a setting's control as `#tuning-<name>`, which for `cutCounted` is `#tuning-cutCounted`; the control is `#tuning-cut-counted`. The first probe therefore failed its setup and ended (`"shown": null`, `"ok": false`), kept as [setup-check-cut-counted-before-mend](setup-check-cut-counted-before-mend/). `browser-window.mjs` now writes the name in kebab case, and the instrument's README says so; the probe run again showed both settings taken (`"step": least/least`, `"cutCounted": on/on`, `"ok": true`). The earlier settings (`framing`, `arrival`, `step`) are single words, so no earlier run was touched.

| Run | A step in the map | Counters on the screen | Pressed a counter | Answered from | Result | Actions |
| --- | --- | --- | --- | --- | --- | --- |
| Least Pan (Step trial), Sonnet 1 | `src`, `client` | — (off) | — | the readers | partly | 21 |
| Least Pan (Step trial), Sonnet 2 | `src`, `client` | — (off) | — | the readers | done | 23 |
| Least Pan (Step trial), Haiku 1, Haiku 2 | none: searched the path | — | — | the readers | partly, partly | 11, 6 |
| [Cut Counted, Haiku 1](repo-directory-haiku-default-cut-counted/answer.md) | none: searched the path | none | no | the readers of the three code files | done | 16 |
| [Cut Counted, Haiku 2](repo-directory-haiku-default-cut-counted-2/answer.md) | none: searched the path | none | no | the readers | partly: takes `Internals` for "a shared helper" node both files depend on, and names a test file `tests/e2e/search-bar.ts` | 16 |
| [Cut Counted, Sonnet 1](repo-directory-sonnet-medium-cut-counted/answer.md) | `src`, then `client` | yes, after `client` opened: "› 24" at the right edge and "⌄ 3" at the bottom ([#6](repo-directory-sonnet-medium-cut-counted/shots/006-click.png)) | no; it scrolled once, then typed the folder's path into the search | the map's cards and the readers | done | 20 |
| [Cut Counted, Sonnet 2](repo-directory-sonnet-medium-cut-counted-2/answer.md) | `src`, then `client` | yes, the same after `client` opened; after a scroll and a Shift+scroll, "^ 8" at the top and "› 22" at the right ([#10](repo-directory-sonnet-medium-cut-counted-2/shots/010-scroll.png)) | no; it scrolled twice, then typed the path into the search | the readers | done | 26 |

**What the pictures show.** After `client` opens under Least Pan, the camera keeps reading size with `client`'s label and first row in view (`bootstrap`, `history`, `palette.ts` and its test), the same picture as in the Step trial; now two dark rounded controls stand on it, an arrow and a number each: "›  24" at the right edge, halfway down, and "⌄ 3" at the bottom, over the top of the `types.ts` card near the toolbar ([#6](repo-directory-sonnet-medium-cut-counted/shots/006-click.png)). After the tester's scrolls the counts follow what is cut: "^ 8" at the top, drawn over a card's row of test chips, and "› 22" at the right ([#10](repo-directory-sonnet-medium-cut-counted-2/shots/010-scroll.png)). They are legible, and they cover what lies under them.

**What the testers did.** Both Sonnet testers had the counters on the screen after the step; neither pressed one, neither named one in anything it said or answered, and both left the map for the search after one or two scrolls, as both Sonnet testers did in the Step trial under With Its Lines; under Least Pan without the counters, the two Sonnet testers had stayed in the map and scrolled on. The two Haiku testers never opened a folder in the map, as in the Step trial; I did not force a step on them. So in four runs a counter met two strangers and was not used; the results (three done, one partly) differ from Least Pan's (one done, three partly) by the testers' routes through the readers, which the counters did not touch. What a counter does when pressed was not seen by any tester.

**Not run.** The root offered two runs of a task of my own wording, to make a stranger open a folder too large for the window from inside the map, if no tester's step showed a counter. Counters were shown, so they were not run. The task was written, with its answer, before I knew: `repo-open-history` in [tasks.json](../../../../../../scripts/playtest/tasks.json), starting on `packages/engine/src/live-docs/pathfind.ts` and asking what the `history` folder beside it holds (32 files: 18 code files and 14 tests). It stands ready if a counter is to be tried where pressing one is the shortest way to the answer.

## What a designer would look at next

What strangers did and said across the 30 visitor runs of this probe (tasks 1, 3 and 4) and the two narrative runs, most common first. Each is a stumble named, with its picture; none is a proposal.

1. **Lines are read by guesswork: what a connection carries, and which way it goes.** Every estate-directory tester hedged the directions it took from lines and colours ("I read the directions from the line colours, so a few details may be off", Sonnet), and one had two of them backwards. All six estate-trace testers had to guess what sqlserver → oracle does; three took it for a write ([the cards](estate-trace-sonnet-medium-look-only/shots/009-look.png)). Two of the three repo-directory answers that fell short each missed one connection between the folder's files. Where a tester took a list in words instead, the reader's Dependents, it was right: all six "what uses" runs that opened it; of the two that read the drawing, one fell short. Every rung.
2. **The view does not frame what was asked for.** Arriving on a pinned file cuts off its neighbours ([#1](estate-uses-sonnet-medium-look-only/shots/001-look.png)); opening a folder pushes its files off the right and bottom ([#7](estate-directory-sonnet-medium-look-only/shots/007-click.png)); `-` stops short of the whole ([#9](estate-uses-sonnet-medium-look-only-2/shots/009-click.png)). Four runs answered from a cut-off view, and fell short; one of four estate-directory testers pressed fit, where nine of ten did on November 19. Sonnet and Haiku. Under either following Framing value the first pictures are the same, and Fit, which recovered the whole under By Hand, then changes nothing visible on an arrival ([#4](estate-uses-sonnet-medium-follows-pins/shots/004-click.png); [Framing tried on strangers](#framing-tried-on-strangers)). Under Arrival's two neighbours values the file arrives whole, names readable and descriptions gone, and every tester went straight to the reader ([Arrival tried on strangers](#arrival-tried-on-strangers)). On the November 21 evening build, Step's With Its Lines showed the estate folder whole after `Data/` opened and no tester moved the camera, with no answer changed ([Step tried on strangers](#step-tried-on-strangers)).
3. **The journey stops at the World Map.** No estate-trace tester went below the seven things, on any rung; the one that tried the Local Map found the estate's top folders drawn with no wire between them, said "The Local Map is a code-level view and doesn't show the request path", and turned back ([#5](estate-trace-haiku-default-look-only/shots/005-click.png)).
4. **A folder is hard to reach by its own name.** The World Map box that opens `PaymentService/` says "payments", and three of four estate-directory testers went to the search instead ([the card that names it](estate-directory-haiku-default-look-only/shots/003-look.png)). Searching a folder by its path lists its files under a heading, with no row for the folder ([#6](repo-directory-haiku-default-look-only-2/shots/006-look.png)). Sonnet and Haiku.
5. **A cycle's returning connection reads as a file linked to itself, or to its neighbour both ways.** The stub loops and "1 connection returns in a cycle" on App.config and PaymentService.cs ([#7](estate-directory-sonnet-medium-look-only/shots/007-click.png)); no estate-directory tester named the cycle through `PaymentsContext.cs`. Sonnet and Haiku, as on November 19.
6. **The scrubber's |◀ is taken for "to the start".** Both narrative testers pressed it first; it is "Previous marked commit" and went back one ([#5](narrative-panel-opus-high/shots/005-look.png), [#6](narrative-picture-opus-high/shots/006-look.png)): "The 'jump to start' button seems to go back only one step at a time".
7. **A ghost endpoint reads as a fault in the path.** Both Opus estate-trace testers read the hub's staging address, "nothing on the board serves it; a ghost until something does", as payments possibly going astray ([#11](estate-trace-opus-medium-look-only/shots/011-look.png)). Opus only.
8. **Once each:** a click on a thing's name on the World Map changes nothing visible ([#3](estate-trace-haiku-default-look-only-2/shots/003-look.png)); the → chip on a symbol's row was taken for "who uses this" and opened another file's reader ([#3](estate-uses-haiku-default-look-only/shots/003-point.png)); opening a folder added pins the visitor had not asked for ("the counter now says "2 pins""); a history step's lit file names were read as files born at that step (narrative without words, the grader's one contradiction); pressing History on the repository's 3D map pins the root, and "Scan root" and "Nothing connects to Scan root" are then written at the top ([#1](narrative-picture-opus-high/shots/001-look.png); [reproduced](#scan-root-reproduced-what-the-history-button-does)).

By the owner's caution, testers' remarks that "the map doesn't say" what a line carries are partly the text-loving bias; the stumbles above are counted from what they did and got wrong, not from what they wished for.

## Pictures kept

On November 21, once the runs were judged, [keep-pictures.mjs](../../../../../../scripts/playtest/keep-pictures.mjs) kept in this folder each run's first and last picture and every picture this README links to. Run again after the Framing, Arrival, Step and Cut Counted trials and the leave-out pilots, it keeps 217 of the runs' pictures (30.0 MB); over its passes it moved 606 others (about 84 MB) to the main checkout's `AI-Agent-Workspace/tmp/playtests/2026-11-21/<run>/shots/`, which git ignores and which is not kept; each run's `actions.jsonl` still names every picture. A run can be had again for a few cents (the narrative runs for about two dollars each), though not on the Explorer as it was built that morning. The two pictures in [scan-root](scan-root/) were taken by a script outside the instrument and are kept whole.

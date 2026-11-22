# Where the budget of files drawn within skins buys frames: as far as it got

**Historical evidence, 2026-11-22. Unfinished.** Taken by the builder, 1,440 by 900, on the container's graphics card. The DNN Platform corpus (10,776 files read, 25,265 edges) was copied from the read-only corpora into scratch, its docs generated there and its Explorer built as a sample in 2 minutes 11 seconds. A temporary instrument opened its 3D map with nothing asked about, in the Connections layout, with the budget switched by a hook removed before the commit; it waited up to 80 seconds for rest, then turned the camera by a held pointer for three seconds and timed the frames.

## Why

That morning's [matched pictures](../veil-order/README.md) found that on this repository drawing every file within the skins took no longer a frame than drawing a third of them, so root raised the budget from 1,024 to 2,048 as an interim number and asked where a budget does buy frames: a larger picture, at budgets of 1,024, 2,048, 4,096 and none, on the card and on the slowed machine.

## What was measured

Only two of the eight: 1,024 and 2,048, on the card.

| Budget | Rest | Files drawn within skins | Bodies veiled | Frames while turning |
| --- | --- | ---: | ---: | --- |
| [1,024](dnn--budget-1024--card.png) | not within 81 s | 1,001 | 48 | 33 in 3 s, median 91 ms, 95th 143 ms |
| [2,048](dnn--budget-2048--card.png) | at 80 s | 1,446 | 1 | 50 in 3 s, median 63 ms, 95th 99 ms |

Each also [turned](dnn--budget-1024--card--turned.png) and [turned](dnn--budget-2048--card--turned.png). [The instrument's lines](measurements.txt).

The two frame times do not compare the budgets: the first picture was still moving when the camera was turned and the second was at rest.

## What the pictures do say

- DNN's picture with nothing asked is 3,313 spheres: 58 groups and 3,255 files that reference nothing and are referenced by nothing. On the card a frame while turning takes 63 ms with 1,446 files drawn within skins.
- **At 2,048 the one body veiled is the main body**, the blank ball at the centre of the picture. It is veiled because it alone holds more files than the budget, and no order of veiling can keep it: the owner's complaint of the morning comes back at this size, at any budget smaller than the main body.
- At 1,024 forty-eight bodies are veiled.

## What was not reached, and why

- 4,096 and none on the card: the hold was queued behind two other builders' holds and was given up when the milestone's time ran short.
- All four on the slowed machine: the picture takes 80 seconds to come to rest on the card; with WebGL in software and the processor slowed four times, one run would not fit a lane hold of five minutes, and none was tried.

So nothing here says where the budget buys frames, and the budget stays at 2,048. The sample is rebuilt with `npx tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-sample.ts --program <a copy of the corpus> --output dist/explorer/samples/dnn`.

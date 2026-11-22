# Which groups the 3D start veils: three matched pictures

**Historical evidence, 2026-11-22.** Taken by the builder on its own build of this repository (1,298 files, 1,284 shown with the default filters), 1,440 by 900, with nothing asked about, in the Connections layout with the default skin. One temporary instrument opened the same address three times, each with a different veiling rule switched in by a hook that was removed before the commit, waited for rest, saved the picture, turned the camera by hand twice and saved it again. It ran once on the container's graphics card and once on the slowed machine of [the weak-machine probe](../../../2026-11-21/Probes/weak-machine/README.md): WebGL drawn in software and the page's processor slowed four times.

## Why

A picture draws at most 1,024 files within its skins (the rule of 2026-11-07). Past that, bodies are veiled: drawn as one milky ball with none of their files. Until today the bodies farthest from what was asked went first and, among bodies as far, the largest. With nothing asked every group is as far as every other, so this repository opened with its main body, 707 of its files, as a blank ball. The owner, shown it on 2026-11-22: "Oh man I know that annoys the heck out of me." and, of veiling the smallest first, "Hey if we can remediate and make the picture even more truthful I am stoked!"

## The three rules

All three hold the same 132 spheres in the same places; only what the skins show differs. If every skin drew every file, the picture would draw 1,152 files within skins.

| | Rule | Files drawn within skins | Bodies veiled | Files the veils hide |
| --- | --- | ---: | ---: | ---: |
| a | As it was: the largest group first | 446 | 1 (the main body) | 706 |
| b | The smallest whole groups first, until the budget of 1,024 holds | 1,024 | 32 of 47 groups | 128 |
| c | As b, with the budget at 2,048 | 1,152 | 0 | 0 |

The pictures, each at rest and from two other angles:

- a: [at rest](a-largest-first-as-it-was--at-rest.png), [turned once](a-largest-first-as-it-was--turned-once.png), [turned twice](a-largest-first-as-it-was--turned-twice.png)
- b: [at rest](b-smallest-groups-first--at-rest.png), [turned once](b-smallest-groups-first--turned-once.png), [turned twice](b-smallest-groups-first--turned-twice.png)
- c: [at rest](c-nothing-veiled-at-twice-the-budget--at-rest.png), [turned once](c-nothing-veiled-at-twice-the-budget--turned-once.png), [turned twice](c-nothing-veiled-at-twice-the-budget--turned-twice.png)

## Frame times

Frames while the camera was turned by a held pointer for three seconds ([the instrument's lines](measurements.txt)); one run each, so differences of a few tens of milliseconds are noise.

| | The card: median, 95th | Slowed: frames in 3 s, median, 95th |
| --- | --- | --- |
| a, 446 files | 47 ms, 54 ms | 13 frames, 305 ms, 668 ms |
| b, 1,024 files | 45 ms, 53 ms | 15 frames, 247 ms, 301 ms |
| c, 1,152 files | 30 ms, 44 ms | 15 frames, 246 ms, 327 ms |

On neither machine did drawing two and a half times as many files within the skins make a frame slower. On the slowed machine every rule gives about four frames a second; what a frame costs there is not the files inside the skins.

## What the builder's eye sees

- **a** is the complaint: the one thing a first picture is for, the repository's main body, is the only blank thing on the screen.
- **b** mends that: the main body is full of its files, blue and green. But 32 of the 47 groups, the smallest ones, 128 files between them beside their seeds, are now pale balls, and the picture reads as a field of blanks around a few open groups. It hides far fewer files than a (128 against 706) and it looks more hidden.
- **c** is the truest and the best looking: nothing is veiled, every group shows what it holds.

## What was made the default, and what is left

**b is the default**: whole groups are veiled the smallest first, with the budget where it was. It is the rule the owner answered, it keeps the main body's files in sight, and its frame time was no worse on either machine. A veiled group's name now says the files its veil hides, as a shell's name does. Directory shells keep their order, the largest first, which was chosen for the neighbourhood of a pin.

**c is one number away and is left to root and the owner.** The measurement says the budget of 1,024 buys no frames at this repository's size on the slowed machine, and costs 128 files of truth and a field of blank balls. What it does not say is what 2,048 files cost: this repository cannot draw more than 1,152 within skins, so a larger budget is not measured by anything here. A picture of a few thousand files on the slowed machine would settle whether the budget should be raised, or dropped for the start.

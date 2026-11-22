# The 3D Local Map filling as a scan would: a trial to look at

**Historical evidence, 2026-11-22.** Taken by the builder of the Scan Growth trial on its own build, 1,440 by 900, on the container's graphics card, with a temporary instrument that opened each link below, saved a frame at a fixed interval and timed every frame of the page. The numbers are of that machine and that hour.

## What was asked, and what this is

The owner, 2026-11-21: "I aspire to be able to let users do some exploring in 2D/3D local map _while the scan is happening_ ... I've never seen what it would look like to be in the 3D local map _as it is being built from scans_. That said, if our scanning process is heavily batch-oriented, that might be totally ugly and stupid-looking unless we buffer what we add to the rendered space piecemeal ourselves".

Nothing here scans. The trial takes the finished map and hands it to the 3D picture a file at a time, in the rhythm root measured on one scan of this repository that day (1,292 files in 21 s: about 3 s listing the folder, 5 s of a first pass that finishes no file, then 12 s in which files finish one at a time), so that the look can be judged before any engine is changed. It is two levers in Tuning's 3D Layout, under Discovery, both off by default:

- **Scan Growth**: Off; Path order (the order a scan finishes files in); First-commit order (the order the history says the files were first committed in, offered only where the map carries a history).
- **Scan Pace**: As measured; Four times slower (the owner's work machine is a weak virtual machine).

With Scan Growth on, opening the 3D map with nothing asked about plays a scan from its start. Choosing the lever's value again, or the pace, plays it again.

## Links to try

Serve the build (`npx http-server dist/explorer -a 127.0.0.1 -p 8766 -c-1`) and add one of these to `http://127.0.0.1:8766/`:

| Order | Pace | Connections | Structure |
| --- | --- | --- | --- |
| Path | measured | `?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGctCA7AtAdwBdzIRjDWQBfH+AI5QQ0ACa8gA` | `?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGctCA7AtAdwBdzIRjDWQBfH+AI5QQ0ACYh4AT2GVmGAK5Zm8jDl5A` |
| Path | four times slower | `?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGctCA7AtAdwBdzIRjDWR5q6AFQrihUETHBhABfKfACOI6ABNpQA` | `?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGctCA7AtAdwBdzIRjDWR5q6AFQrihUETHBhABfKfACOI6ABMeIAJ4jKzDAFcszHRhzSgA` |
| First commit | measured | `?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGctCA7AtAdwBdzIQUBLDS5gWixoAtkM7MQAXwnwAjlBDQAJpKA` | `?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGctCA7AtAdwBdzIQUBLDS5gWixoAtkM7MQAXwnwAjlBDQAJiHgBPebwwBXLMy0YckoA` |
| First commit | four times slower | `?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGctCA7AtAdwBdzIQUBLDS5gWixoAtkM7MQ8anQAKhXFCoImODCAC+a+AEcF0ACbqgA` | `?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGctCA7AtAdwBdzIQUBLDS5gWixoAtkM7MQ8anQAKhXFCoImODCAC+a+AEcF0ACYSQATwW8MAVyzNzGHOqA` |

First-commit order needs a map built with its history (`npm run live-docs:history`, then `npm run live-docs:visualize`); without one the choice is greyed and its tooltip says why, and such a link plays nothing. The estate and tidepool samples hold 36 and 43 files, so their scan at the measured pace is over in about half a second: there is nothing to watch on them, which is itself the finding for a small project.

## The pictures

Strips, the map alone, each tile with its moment, what the sign said and what the sidebar counted:

- [Path order, measured pace](strip-path-order-measured.png), a frame a second.
- [First-commit order, measured pace](strip-first-commit-order-measured.png), a frame a second.
- [Path order, four times slower](strip-path-order-slower.png), a frame every four seconds; at 41 s the camera was turned by a drag and zoomed in by the wheel, and left there.
- [First-commit order, four times slower](strip-first-commit-order-slower.png), a frame every four seconds.

Stills at full size:

1. [The listing](still-1-listing.png): an empty map, and at its top edge "Listing Files… (707)".
2. [The first pass](still-2-first-pass.png): still empty, "Reading File Text… (0/1,297)". This lasts 5 s at the measured pace and 20 s at the slower one.
3. [Path order at 610 files](still-3-path-order-610-files.png): one bubble has swollen in one place since the first file; lone files stand around it.
4. [First-commit order at 618 files](still-4-first-commit-order-618-files.png): some thirty small bubbles all over the picture, and two larger ones side by side that will become the main body.
5. [Path order at 1,254 files](still-5-path-order-veiled-1254-files.png): the main body has passed the 1,024 files a picture draws and has turned, in one step, from a bubble full of its files into a veiled grey ball.
6. [The end](still-6-end-as-off.png): the sign gone; the picture the lever's off value shows.
7. [A pointer resting on a sphere while the map fills](still-7-rest-on-a-sphere-while-it-fills.png): the sphere is named and offers its actions, and the rest fades, as in a finished map (taken before the buffering below was added).
8. [Zoomed in by hand, at 844 files](still-8-zoomed-in-by-hand-844-files.png): a large group that was not in view four seconds earlier fills the right of the frame; four seconds later it has gone again.

The four `frames-*.txt` files beside this one list every frame the instrument took (the strips and stills are chosen from them; the rest were not kept) with its moment, the sign's words and the sidebar's counts, then the page's frame times by how many files had arrived.

## What the builder's eye sees

**It looks alive, not stupid, and the two orders look different.** In path order the picture is one bubble swelling in one place, with single files appearing around it like a slow drizzle, for the first two thirds of the scan; then the test fixtures arrive and forty small bubbles appear within a few seconds. It is calm and a little dull, and it does not read as one folder at a time, because the Connections start draws groups by what uses what, never by folder. In first-commit order small bubbles appear all over from the first second, grow and join, and the main body is seen forming from two neighbours: this is the one that looks like something coming into being, the owner's "the structure ends up coming in quite nice". It also churns more: a bubble that joins another vanishes where it stood.

The Structure layout's links are in the table and play, but its growth was not looked at in this round; there the picture is the folder tree, and path order may well read as one folder at a time.

**Where the camera stands.** Until a hand takes it, it keeps the whole picture framed and backs away as the picture grows, so that everything shrinks slowly; nothing jumps. Once a hand has turned or zoomed it, it stays where it was put for the rest of the scan.

**Things do move under the pointer, and this is the thing that goes wrong.** Every arrival that swells a body pushes its neighbours outward. Framed whole, that reads as gentle breathing. Zoomed in, it is weather: in the slower strip a named sphere slides a few dozen pixels between most frames four seconds apart and some 180 px between two of them, and a group fills the right of the view in one tile and is gone in the next. A rest on a sphere still names it and a press still pins the one pressed (the browser test presses the largest sphere of this repository at some sixty files and its pin holds to the end), but a person cannot keep their place in a region while the scan runs. The rule of 2026-11-15 that this trial suspends, no hover or click while the map builds, guarded against exactly this for a few seconds; over a minute the cost is not a wrong click but a lost place.

**The wrappers.** A bubble grows smoothly as files join it. Two bubbles that become one do not fuse: as the picture is made, the group keeps one seed and its bubble is larger at the next step where that seed stood, while the other bubble is simply no longer drawn; the strips agree, though no frame here catches a join in the act. And the main body's veil arrives as a sudden change of look near the end, the fullest bubble becoming a blank ball, which is the 1,024-file budget root wrote up on 2026-11-21 met in motion.

**The sign.** One quiet line at the top edge is enough, and the first pass is the dead part: five seconds, or twenty on a weak machine, of "(0/1,297)" over an empty map.

## The buffering, measured

The first build handed the picture a new cut at every frame, and the page fell behind: in the first look a pointer's move and the screenshot after it took some ten seconds to be answered while the picture went from 219 files to 852. So the play now lets taking the arrivals in use at most a quarter of the page's time (`FEED_SHARE` in `scanGrowthPlay.ts`): after a cut it rests three times as long as the cut took, and the files that arrive meanwhile enter together. With that, on this repository at the measured pace in path order, the median frame through the twelve seconds of arrivals was 22 to 24 ms, with eleven frames over 100 ms, the worst 594 ms; the picture then runs behind the sign's count by up to a couple of hundred files, and the sidebar says what the picture holds. The slower pace had more long frames early (twelve over 100 ms between 200 and 400 files). What makes the long frames was not profiled; the likeliest cause is that a body is packed again whole whenever it gains a file, and the main body gains one at nearly every cut.

## What a real scan would need that this did not

- A count during the first pass, so that the line moves while nothing can be drawn.
- A cheaper way for a body to take a file in, if profiling confirms that packing it again whole is the cost.
- For exploring zoomed in: something that holds a region still, or a camera that follows what the pointer rests on.

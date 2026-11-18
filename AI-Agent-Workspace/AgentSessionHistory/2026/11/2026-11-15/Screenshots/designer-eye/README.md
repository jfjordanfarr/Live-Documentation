# A designer's reading of the 2D Local Map, November 15, 2026

_Historical evidence. Taken by the root agent at the opening of [the November 15 session](../../2026-11-15.1.record.md#turn-1), after the owner asked for the 2D map's style to be judged by the root's own eye and for the designer's words to be taught as the work goes. The build is `cb53d7c7` (product code as `ef7ce597`), opened headlessly at 1,440 by 900 with nothing remembered, in the default looks, with Segoe UI's line metrics over Liberation Sans, which is closer to the owner's screen in width than the container's default font. Pictures 08 to 10 are probes: the same build with styles injected by the root, not product code._

Each finding is named in the term a designer would use, with what the term means and where it shows.

## 1. Type hierarchy: on a card, everything is one grey and the prose is larger than the name it describes

**Hierarchy** is the order in which the eye meets things, set by size, weight and tone. [01](01-reading-card-one-tone.png): the file's name is 13 px bold, its path 10 px, a symbol's name 11 px and that symbol's description 12 px, all but the path in one tone, `#ccc`. Four sizes within three pixels of each other is a **type scale** with no steps, and the larger, equally bright description pulls the eye off the name, which is the thing with wires on it. The sizes are held by the zoomed-out fits, so the cure is **value**: names brighter, prose a step down. [08](08-probe-tone-reading-card.png) is that probe.

## 2. Contrast budget: the wires are the brightest marks on a crowded picture

The strongest contrast on a picture should belong to what the person came to read. [06](06-crowded-directory-as-built.png): every wire at rest is 70% opaque with a 6 px glow, so sixty cards' lines add up to more light than their names; the owner found this directory "overwhelming". This is **figure and ground** inverted: connections should be the ground a hovered card's own lines stand out from. [09](09-probe-tone-crowded-directory.png): wires at rest without their glow at half strength, names brighter.

## 3. Hierarchy between a container and its contents: a directory's name is the smallest text there is

[03](03-opened-directory-three-presses-out.png) and [04](04-opened-directory-after-fit.png): the opened directory is the subject of the picture, and its name is "…plorer/src/client", cut at its start above a 130 px column with 900 px free beside it, then about 6 px tall after Fit beside file names held at 13 px. A map sets a country's name larger than its cities'. The same pictures show the closed directories: "bootst…" cut, and five of seven with nothing to press.

## 4. Signifier and target size: a directory offers no sign of what a press would do, and often nothing to press

An **affordance** is what a thing lets you do; a **signifier** is the mark that tells you so. "Open" as a text button is words of ours on the screen, shrinks to 7 px, and is dropped where a box is narrow; an opened directory loses its close cross past the reading look. **Fitts's law**: the time to hit a target grows as it shrinks, so at the zoom where a directory is the thing to act on, the target should be the whole box and its sign a chevron, as a file tree draws one.

## 5. Greeking: at the overview a card is a name over a tall blank box

[05](05-overview-blank-cards.png). The box keeps the height of rows it no longer draws, by the owner's rule that a card does not resize with the zoom, and reads as empty. Typesetters call the cure **greeking**: text too small to read is drawn as grey bars, so that the page keeps its shape. [10](10-probe-rows-as-bars.png): each row as a faint bar as long as its name. Nothing moves, and a tall card now reads as a file with many symbols, which is what its height meant all along.

## 6. Data-ink: a card says where it is three times

[07](07-scan-root-path-said-twice.png) and [01](01-reading-card-one-tone.png): the file's path stands under its name (at the scan root it is the name again, "tsconfig.json" over "tsconfig.json"), its directory in italics at the foot, and the directory's own label around the card. **Data-ink** is Tufte's word for ink that carries a fact; said once is enough. Not yet built: it changes every card's height, which the layout lab's model must learn with it.

## 7. The cue that never came: a returning connection

[02](02-returning-connection-on-hover.png): with the pointer on `BranchStage`, a connection leaves the right of the card and crosses it leftward, the wire the owner asked on November 2 to have the 3D button light for. The page draws eight such routes on this file and counts none; the button is dark. A defect, mended the same day.

## What was decided from this reading

The root's decisions under the owner's grant of that day, each built as what the preview shows with the way back kept: tone for the type hierarchy and quieter wires at rest; a visible outline for a directory; a directory's name held no smaller than its files' and cut last, a chevron for its sign and the whole closed box for its target; rows as bars at the overview in place of a blank; the 3D button's cue counting returning connections. The builders' own evidence is in this date's other folders.

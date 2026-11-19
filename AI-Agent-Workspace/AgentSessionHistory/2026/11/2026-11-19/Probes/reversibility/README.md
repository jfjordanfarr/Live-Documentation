Current as of November 19, 2026. A survey of every interaction in the Explorer that a person cannot take back, made by doing each one in a real browser. No product code was changed.

## What was tested, and how

- **Build.** The Explorer in the main checkout's `dist/explorer`, built at 15:37 UTC on November 19 (at commit `2af0289b`; the client code that bears on this survey is the same at `aeb840c4`, which differs only in the 2D placement solver). Served read-only on a private port; this repository's site, and the estate sample at `/samples/estate/` for the World Map.
- **Browser.** Headless Chromium launched as the browser suite launches it (`tests/e2e/browser-launch.ts`), through the browser lane, 1600 × 1000 unless said otherwise. Each route was tried in a fresh browser context, so that the browser's Back could only land on this page or leave it.
- **Subjects.** The rosetta TypeScript sample inside this repository's map (`tests/integration/programs/typescript/rosetta/src/main.ts` as the subject, with up to four pins and two open directories), so that pictures settle in seconds; the whole repository for the 3D wrapped groups; the repository's and the estate's World Map boards.
- **What was read after each act.** The address (decoded: view, subject, pins in order, retention order, open directories, reader target, path, filters, the layout settings the address carries, the commit), `localStorage`, the position of the page's history entry and whether Back and Forward are enabled, the pin tray's count, the page's status region, the 2D camera's transform and the 3D camera's position (read from the scene the page draws, by `tests/e2e/force-graph-observation.ts`). Then, in order: the same control again, the page's own back arrow (and the browser's Back where the page's was disabled), Forward, a reload, and the browser's Back after the reload.
- **The list of interactions** came from the listeners under `packages/explorer/src/client/` (265 `addEventListener` calls; hover-only, focus-only and resize listeners left out), grouped by surface below.
- The scripts and raw logs were written to `AI-Agent-Workspace/tmp/reversibility/`, which git ignores; the numbers quoted here are from those logs.

## The verdict

**73 interactions change what the page shows or remembers (three more only download a file). 38 can be taken back exactly by some route today; 23 partly; 12 not at all.** 52 of the 73 were done in the browser; 21 are judged from the code, and the table says which.

"Exactly" means some route today restores what was there, the same pins in the same order, the same open directories, settings and camera. "Partly" means a route exists but something differs (order, camera, a setting) or it works only in some states. "Not" means no route on the page or in the browser brings it back.

Three things decide most rows:

1. **Back undoes a place, not an act.** A move to another place (another view, subject, open directory, reader target, path, 3D layout) is a step Back takes back, exactly, pins and order included. A change within a place (a pin, a release, a filter, a Tuning lever, a camera move) is written over the current step, so Back skips it: it takes back everything done since the last move, all at once, or nothing.
2. **Whether a release is undoable depends on a side effect.** Clear all pins, Clear pins inside and the card's close are a step of their own only when they also release the subject or close a directory, because that makes them a move; then Back restores them exactly. Without a subject and an open directory the same press is written over the current step: Back then returns to the last move, so every pin made since that move is lost. Nothing on the page tells the two cases apart.
3. **Nothing on the page says, before a press, that it cannot be taken back, and only three acts say anything after it** (Unpin others, Fold others away, Tuning's reset, in the status region a screen reader hears; nothing visible says "Back will undo this").

## The ones that cannot be taken back, worst first

1. **Clear all pins (and Clear pins inside, a card's ×, the tray's ×) with no subject and no open directory: the pins made since the last move.** The tray empties; Back does not undo the press itself but returns to the last move, with the pins as they were then. Tried by an ordinary route: open the `scripts` thing from the World Map (no subject, its folder open), pin two files, close the folder, Clear all: Back brought the two pins back only by also reopening the folder, because the folder's close was the last move; pins made after that close would have been lost. From a shared link with four pins and no subject, Back was disabled and the browser's Back left the page: all four lost. With a subject or an open directory the same press is a step Back restores exactly (tried twice: identical pins, order, directories and subject, and after a reload too). The owner's report that "nothing brings them back" is true of the page's own controls in every case; Back usually does, and nothing on the page says so, before or after.
2. **Moving a thing on the World Map** (both boards). Each drag is saved to `localStorage` at once; there is no undo of one move (Ctrl+Z does nothing, Back is not involved, the address does not carry positions). The only way back is Reset layout, which returns every thing to the board's own layout, not to where it stood before the last drag.
3. **World Map's Reset layout, after one more move or a reload.** Pressed again before anything moves, it puts every position back exactly (tried on both boards). After one more drag, or a reload, the positions it discarded are gone: tried, the first thing moved stayed at the board's layout. The pressed state of the button ("Put things back where you had them (R)") is the only sign, and it vanishes without a word when the chance goes.
4. **Tuning's Reset to defaults, after one more lever or a reload** (the known case). Confirmed: three levers changed, reset, second press restores all three exactly; reset, then the palette changed, then reset again: Column Gap and Card Text stay at their defaults, the earlier values lost; reset then reload: the button is disabled and the values are gone. A new finding in the same place: **reset, then Back** to an earlier place restores only the levers the address carries (Column Gap came back to 112) and not the others (Card Text stayed at its default), and the reset's memory is dropped: a mixture of the two states that no single press made.
5. **Releasing one thing: the tray's ×, a card's ×, a pressed Pin pressed again.** The tray's row and the card are gone with the press, so the same control is not there to press again; the file must be found again (search, or its card if still drawn) and pinned again, and it comes back as the newest pin, which moves where a path starts from. The card's × also closes the card's readings and its "+N symbols" expansion, and those do not come back with the pin. Back skips all three (a change within the place).
6. **Back reverting settings behind the person's back.** Not a press that cannot be undone but one that undoes by surprise: a Tuning lever or a display filter changed after a move is reverted on screen by Back to the earlier place (the address of that step carries the old value), while `localStorage` keeps the new one. Tried: Show Tests turned off on Knowledge Sources, then Back: the box shows on, storage says off; Column Gap changed after a move, Back twice: shows 100, storage says 112, and a reload then shows 100 because the address wins. So Back is the one route that undoes a setting, only for the settings the address carries, and only by accident.
7. **The 2D and 3D cameras.** Pan, wheel and zoom are in no history entry, no address and no storage. Back does not restore a camera within a place; Fit and "Return to reading size" go to a computed framing, not to where the person was. Leaving for another view and coming back keeps the 2D camera (tried, to a hundredth of a pixel); a reload returns to the arrival's framing. Low stakes on their own, but they are why "Back exactly" rows below mostly say "camera differs" in 3D.
8. **"+N symbols" on a card** (the 2D map's own memory, `expandedCards`). Shows the card's other rows; no control folds them again; the card's × does, but also releases the file's pins; a reload does. Not in the address.
9. **The 3D layout's popped groups.** A click on a wrapped group pops it open and pins its seed; the second click on the seed's name releases the pin and wraps it again (tried, exact). But a pop is the view's own memory: not in the address, so a link does not reproduce it and a reload wraps every group again (tried). Back neither undoes a pop nor loses it (tried: popped, Structure, Back: still popped).
10. **Opening a thing from the World Map clears every pin.** Tried with two pins: the Local Map opens on the thing's folder with no pins and no subject. Two Backs restore the map with both pins exactly. Reversible, but nothing says the pins were dropped or that Back brings them back.
11. **Smaller ones** (all in the table): the Knowledge Sources' "Reachable from" choice is overwritten in its place (no Back; the earlier choice must be typed again); its tree's open folders are forgotten on reload; the sidebar's collapse is forgotten on reload; the history bar's chosen commit rides the address but its range, play and details do not; the World Map's pinned panel is not there after Back from the Local Map.

The stranger's 3D finding, confirmed: a click on the **subject's** pinned sphere releases the pin and moves the subject to the next pin, which reframes the whole picture (pictures: [before](3d-subject-sphere-before.png), [after the click](3d-subject-sphere-after-click.png)). It is a step Back takes back, because the subject changed: pins, order and subject come back exactly, the camera close to but not at where it was (-53, -25, 200 against -51, -34, 198). Pressing the sphere again does not undo it: it pins the file again but the subject stays moved. A click on a pinned sphere that is not the subject is a change within the place: Back skips it, and the same sphere pressed again restores the pin exactly.

## What the two back arrows cover today

**They are one mechanism.** The sidebar's Back, the reader's own Back (in the reading dialog and the narrow reader), the browser's Back, Alt+← and the mouse's side button all call `window.history.back()` (`index.ts`, the four `addEventListener` lines after `startHistory`). The design document's line that "the two do different jobs (places against the reader's own history)" describes no difference in the code.

**Where entries are made.** Every write to the address goes through `commitUrl` in `persistence/history.ts`, which decides with `entryFor`:

- **A new entry** (`pushState`) when the *place* the address names changes, the person has touched the page (a pointer press, a key or the wheel since load), the page is not restoring an entry, and no entry was made earlier in the same task. The place is `placeOf` in `persistence/place.ts`: the view; in the map the perspective and the 3D layout; the subject; the open directories; the path's end; the reader's target and whether it is the reading dialog; the 3D discovery.
- **A forced new entry** within a place by `stepWithinPlace()`, called only by Unpin others and Fold others away (`releaseOthersOf`, 2026-11-19).
- **Otherwise a rewrite** (`replaceState`) of the current entry: pins and their order, filters, the layout settings the address carries, the commit the history bar shows, the authors toggle, "Reachable from", reading choices.

**What an entry carries.** Only `{ liveDocsPosition }` in the history state; everything else is the address, a compressed snapshot (`persistence/compressed-url-state.ts`): view, perspective, 3D layout, subject, pins and their order, open directories, filters, the Tuning settings of `layoutSettingsOf` (the 2D layout's numbers and the 3D forces, hops and wrappers), path end, "Reachable from", commit, authors, reader target, reading choices, discovery. On Back or Forward, `restoreFromUrl` re-applies all of it, filters and those Tuning settings included, without writing them to `localStorage`.

**What no entry carries:** the 2D and 3D cameras; the 3D pops; the 2D "+N symbols" expansions; every Tuning setting outside the layout subset (Card Text, the palette, the frame, the history's play rate and others) and the reset's memory; the World Map entirely (positions and theme in `localStorage`, its camera, toggles and pinned panel in memory); the history bar's range, play and details; the sidebar's collapse; Knowledge Sources' tree.

**So, for one undo for the whole page.** For the exploration (pins, order, directories, subject, reader, path, filters, layout settings) the step is small in mechanism: every change already goes through one function and is already one comparable snapshot; making a change within a place an entry is what `stepWithinPlace` already does for two acts, and the tests for `entryFor` cover the rule. What makes it larger:

- **It reverses a standing choice.** The rule that Back skips pins was built on September 30 at the owner's request; their words then were "Remember that we can split out the pinning history from the navigation history" ([the record](../../../../09/2026-09-29/2026-09-29.2.md), the owner's message of 01:23 UTC on September 30), after first asking for "back/forward buttons (undo/redo?)". What was built has no pin history at all, rather than a separate one. A page-wide undo must decide whether it is the browser's Back (every pin a step, so Back walks through pins) or a second history beside it.
- **Settings in the address.** Back already re-applies filters and the layout settings from the older address, but not to `localStorage` and not to the settings outside the address, which gives the mixed states in finding 6. A page-wide undo has to choose whether settings are undoable steps or are left out of what Back restores; today they are half in.
- **State outside the snapshot** cannot be restored by Back without first being carried: the World Map's positions (in `localStorage`, per board), the Tuning settings outside the layout subset and the reset's memory, the 3D pops (`forceGraphView`'s own sets), the 2D expansions (`controller.expandedCards`), the cameras. Each is its own module's memory today.
- **The entry is pushed only on a person's input** (the `armed` flag) and joined within one task, which is right for undo too; restoring re-renders the whole map for any entry whose snapshot differs, so an undo of one pin redraws and re-places the picture (the camera is held for the subject, not restored).

## The full table

"Back" means the page's back arrow and the browser's Back, which are the same call. "Move" means the act makes a new entry; "within" means it rewrites the current one. "Browser" means done in the browser for this survey; "code" means judged from the code.

### Pins and directories (the 2D map; the same state in 3D)

| Interaction | What it changes | Taken back today by | Exactly? | Said before / after | Reload / link | Verdict | How judged |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A card's Pin (unpinned file) | pins, order (within) | the same Pin | yes | no / no | kept / carried | Full | browser |
| A symbol's Pin | pins, order (within) | the same Pin | yes | no / no | kept / carried | Full | browser |
| Pin only a symbol of a file pinned whole | narrows the file's pin to one symbol (within) | Unpin that symbol, which leaves the file whole again | pins and order yes; the camera has moved | no / no | kept / carried | Full | browser |
| A pressed Pin pressed again (Unpin file) | releases the file's pins (within) | the same Pin | pins back, but the file becomes the newest pin (order changes) | no / no | kept / carried | Partly | browser |
| A card's × | releases the file's pins, its readings, its discovery, its "+N symbols"; the card goes (within, unless the subject moves) | re-pin from search or another card; Back only if the subject moved | pins only, as the newest | no / no | kept / carried | Not | browser |
| The tray's × (Release) | releases one item (within) | re-pin from search | pins only, as the newest | no / no | kept / carried | Not | browser |
| The tray's Clear pins inside (directory) | releases everything inside, the directory, and the subject if inside (move if the subject or a directory went) | Back, when a move | yes | no / no | kept / carried | Partly | browser |
| The tray's Clear all pins | every pin, directory, discovery, the subject (a move only if there was a subject or an open directory) | Back: exactly when it was a move; otherwise Back returns to the last move and the pins made since are lost | yes when a move | no / no | kept / carried | Partly | browser |
| Menu: Clear pins inside this directory | as the tray's | Back, when a move | yes (camera to a hundredth of a pixel) | no / no | kept / carried | Partly | browser |
| Menu: Unpin others | other pins and directories released; one step | Back | yes (in 3D the pops are not restored) | no / status region | kept / carried | Full | browser |
| Menu: Fold others away | other directories closed; one step | Back | yes | no / status region | kept / carried | Full | browser |
| A directory's handle: Close / Open | open directories (move) | the same handle, or Back | yes | no / no | kept / carried | Full | browser |
| A closed directory's box (open) | open directories (move) | its handle, or Back | yes | no / no | kept / carried | Full | code (no box on the test picture) |
| A hidden file's cell (pin) | pins (within) | the file's Pin | yes | no / no | kept / carried | Full | code |
| A card's Centre | subject (move) | Back, or Centre on the old subject | yes, camera included | no / no | kept / carried | Full | browser |
| "Uses N files" menu, choose one | subject (move) | Back | yes | no / no | kept / carried | Full | browser |
| "+N connections outside this view" | pins the file (within); camera moves | the file's Pin | pins yes; camera no | no / no | kept / carried | Partly | browser |
| "+N symbols" | the card's rows (the 2D map's memory only) | none alone (the card's × also releases pins; reload) | — | no / no | lost / not carried | Not | browser |
| A card's book (read all descriptions) | reading choices (within) | the same book | on screen yes; the address keeps an explicit "open" where it had none | no / no | kept / carried | Partly | browser |
| A card's or symbol's name (read) | the reader opens (move) | its ×, Escape, or Back | yes | no / no | kept / carried | Full | browser |
| The returning connections' note, choose one | subject (move) | Back | yes | no / no | kept / carried | Full | code |
| Ancestors, choose one | opens and centres on a directory (move) | Back | yes | no / no | kept / carried | Full | code |

### The 2D camera

| Interaction | What it changes | Taken back today by | Exactly? | Said | Reload / link | Verdict | How judged |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Drag to pan | camera | nothing returns to the previous camera | — | no | lost / not carried | Not | browser |
| Wheel, Zoom In, Zoom Out | camera | the opposite zoom, roughly | no | no | lost / not carried | Partly | browser |
| Fit, Return to reading size | camera to a computed framing | nothing returns to the previous camera | — | no | — | Not | browser |

### The 3D map

| Interaction | What it changes | Taken back today by | Exactly? | Said | Reload / link | Verdict | How judged |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Click an unpinned sphere | pins (within) | the same sphere | yes | no | kept / carried | Full | browser |
| Click a pinned sphere, not the subject | releases its pins, readings, discovery (within) | the same sphere | yes | no | kept / carried | Full | browser |
| Click the subject's pinned sphere | releases its pins; the subject moves; the picture reframes (move) | Back (the same sphere does not) | pins, order, subject yes; camera near | no | kept / carried | Partly | browser |
| Click a wrapped group | pops it and pins its seed (within) | the seed's name or sphere again | yes | no | pin kept, pop lost / pin carried, pop not | Partly | browser |
| Click a directory shell, or the popped group's dimmed name, or "Wrap this group again" | pops or wraps a group (the view's memory) | the other of the two | yes | "Wrapped … again" in the status region | lost / not carried | Partly | code |
| Click a directory hub | discovery and reader (move) | the same hub, or Back | yes | no | kept / carried | Full | code |
| Click a Structure bubble | opens the directory (move) | Back | yes | no | kept / carried | Full | code |
| Orbit, wheel | camera | nothing returns to it; Fit frames the scope | — | no | lost / not carried | Not | browser |
| Hops | the hop count (within; address and storage) | the same select | yes | no | kept / carried | Full | browser |
| The action strip's Pin, Centre, Open the shell | as the sphere's, Centre's, a shell's | as those rows | as those | no | as those | Full | code |

### The map's toolbar and the sidebar

| Interaction | What it changes | Taken back today by | Exactly? | Said | Reload / link | Verdict | How judged |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2D / 3D | perspective (move) | the other button, or Back | yes; the 2D camera is kept | no | kept / carried | Full | browser |
| Connections / Structure | the 3D layout (move) | the other button, or Back | layout yes; camera not | no | kept / carried | Partly | browser |
| Whole | opens the scan root (move) | Whole again, or Back | directories yes; 3D camera not | no | kept / carried | Partly | browser |
| History (open the bar) | may open the scan root (move) and the bar | the button again, or Back for the root | yes | no | the bar reopens if a commit is in the address | Full | browser |
| The views (Knowledge Sources, World Map, Local Map) | view (move) | Back, or the view again | yes | no | kept / carried | Full | browser |
| The sidebar's collapse | the sidebar | the same button | yes | no | lost / not carried | Partly | browser |
| Layout tuning, Key (open a panel) | a panel shows | the same button | yes | no | — | Full | code |

### Tuning and the display filters

| Interaction | What it changes | Taken back today by | Exactly? | Said | Reload / link | Verdict | How judged |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A lever the address carries (the 2D layout's numbers, the 3D forces, hops, wrappers) | the setting (within; address and storage) | the same lever, to a remembered value | yes if the value is remembered | the lever's mark and the count | kept / carried | Partly (Back to an earlier step reverts it on screen only) | browser |
| A lever the address does not carry (Card Text, the palette, Hold Still and the other choices) | the setting (storage only) | the same lever | yes if remembered | the lever's mark and the count | kept / not carried | Partly | browser |
| Reset to defaults | every lever but the frame | its second press, until a lever moves or a reload | yes, in that window | the pressed state, its tooltip, the status region | lost after reload | Partly | browser |
| Export layout settings | nothing (a download) | — | — | — | — | (no state) | code |
| A display filter (Show Tests, Assets, Related Docs, Citing Docs) | the filter (within; address and storage) | the same box | yes | no | kept / carried | Partly (Back to an earlier step reverts it on screen, not in storage) | browser |

### Search, the path and the reader

| Interaction | What it changes | Taken back today by | Exactly? | Said | Reload / link | Verdict | How judged |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Choose a search result | pins it, makes it the subject (move if the subject changes) | Back | yes | no | kept / carried | Full | browser |
| Choose a search result already the subject | pins it (within) | its Pin | yes | no | kept / carried | Full | code |
| Ask for a path (the second field) | the path's end (move) | its ×, or Back | yes | no | kept / carried | Full | browser |
| Clear the path (×) | forgets the path (move) | Back | yes | no | kept / carried | Full | browser |
| A path's file, the reverse link | subject or the path swapped (move) | Back | yes | no | kept / carried | Full | code |
| Open the reader; follow a link in it | reader target (move); an in-page heading link scrolls only | Back, or the reader's Back | yes | no | kept / carried | Full | browser |
| Close the reader (× or Escape) | reader closed (move) | Back | yes | no | kept / carried | Full | browser |
| The reader's Pin and Centre | as a card's Pin and Centre | as those | as those | no | as those | Full | code |
| Read full description | the reading dialog (move) | its ×, or Back | yes | no | kept / carried | Full | code |

### The World Map (both boards)

| Interaction | What it changes | Taken back today by | Exactly? | Said | Reload / link | Verdict | How judged |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Drag a thing | its position (storage) | nothing for one move; Reset layout returns all to the board's layout | — | no | kept / not carried | Not | browser |
| Reset layout | every position (storage) | its second press, until a move or a reload | yes, in that window | the pressed state and tooltip | the chance lost on reload | Partly | browser |
| Turn left / right, Look straight down, Built on, Snap | the board's camera and layers (memory) | the opposite or same tool | yes | the pressed state | lost on reload | Partly | browser |
| Dark board | theme (storage) | the same tool | yes | the pressed state | kept / not carried | Full | browser |
| Wheel, pan | the board's camera | nothing returns to it; Fit | — | no | lost | Not | browser |
| Fit | the board's camera | nothing returns to the previous | — | no | — | Not | browser |
| Click a thing (pin its panel), Escape | the pinned panel | Escape or another click | yes | no | lost; also lost on Back from the Local Map | Partly | browser |
| Open a thing (its panel's link, a double click, or the wheel into it) | opens the Local Map on its folder, dropping every pin and the subject (move) | Back, twice | yes | no | kept / carried | Partly (nothing says the pins went) | browser |
| Help, the tour, "wanting" | the help panel | the same button, Escape | yes | — | — | Full | code |
| Save board | nothing (a download) | — | — | — | — | (no state) | code |

### Knowledge Sources

| Interaction | What it changes | Taken back today by | Exactly? | Said | Reload / link | Verdict | How judged |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Reachable from, choose | the walk's start (within) | its × returns to the entry points; the earlier choice must be typed again | no | no | kept / carried | Not | browser |
| Reachable from's × | the walk's start (within) | choose it again | no | no | kept / carried | Not | code |
| The bundled tree's folders | open folders (memory) | the same folder | yes | no | lost | Partly | code |
| A file's name | the reader (move) | Back | yes | no | kept / carried | Full | code |
| Copy, Download | nothing | — | — | — | — | (no state) | code |

### The history's bar

| Interaction | What it changes | Taken back today by | Exactly? | Said | Reload / link | Verdict | How judged |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Step, scrub, keys, a chosen commit | the commit shown (within) | step back the other way | yes if the person counts | the readout | kept / carried | Partly | browser |
| A range, the whole range | what the track shows (memory) | the whole range | no (the old range is gone) | no | lost | Not | code |
| Play, rate | playing; the rate (storage) | the same control | yes | the button's name | rate kept | Full | code |
| Step details, Authors | the panel; authors (address) | the same toggle | yes | the pressed state | authors carried | Full | code |
| A file in the step panel | pins it (as a search result) | as a search result | as that | no | kept / carried | Full | code |

## What was not tested, and why

- **21 rows judged from the code** (the table's last column): the closed directory's box (the test picture had none on screen), a hidden file's cell, the returning connections' note, Ancestors, Layout tuning and Key, Read full description, the bundled tree's folders (the click did not open one in the run), the 3D shells and "Wrap this group again", hubs and Structure bubbles, the action strip, the step panel, the history's range and play, the path's hops and reverse link, the reader's Pin and Centre, Knowledge Sources' file names and Reachable from's ×, the World Map's help and tour. Each is judged from its handler; those that write the address do so through the same `commitUrl` rule the tested rows exercised.
- **The Bare frame's trial** (Tuning's frame choice): its breadcrumbs call the same Centre and directory functions as the sidebar's rows; not driven.
- **Touch and long press**, the 3D right-press menu and the keyboard's routes: the same handlers as the clicks, so the same answers; not driven.
- **The estate sample's Local Map**: the mechanism is the same code; only the World Map differs by board and was run on both.
- **Narrow screens**, where the reader becomes full-screen with its own Back: the same `history.back()`.
- **Timing**: whether a quick second press, before a picture settles, does the same; not tried.

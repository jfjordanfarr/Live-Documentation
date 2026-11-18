# October 15, 2026: clicks pin what they name

Pictures of the built Explorer after the Local Map's pin rules changed on the owner's answers of [Turns 8 to 10 of the October 14 session](../../ChatHistory/2026/10/2026-10-14.1.record.md#turn-8) (the night's challenge and its findings are in [the probe record](../../Probes/2026-10-14/pin-clicks/README.md)). This repository's bundle, the rosetta sample's `main.ts` as the landing subject, 1600 by 1000, each picture taken after the picture's move had ended; the pins were read from the address after every click and agree with the tray.

## The pin rules and the recentre control

| What is shown | Picture |
| --- | --- |
| The landing on `main.ts`: every card but the subject's wears the recentre control where the subject's card wears its close; no pins | [2d-landing-main-recentre-controls.png](pin-clicks/2d-landing-main-recentre-controls.png) |
| `Report` clicked on the neighbour `models.ts`: one pin, the field reading "Report", the tray at 1 pin; `main.ts` still the subject, its rows drawn and wired, nothing pinned on the person's behalf | [2d-one-symbol-on-a-neighbour.png](pin-clicks/2d-one-symbol-on-a-neighbour.png) |
| The card's body clicked: `models.ts` pinned whole, every row lit, the field reading "models.ts" | [2d-card-pinned-whole.png](pin-clicks/2d-card-pinned-whole.png) |
| `Report` clicked on the card pinned whole: the pin narrowed to `Report` alone, the other rows folded behind the reveal | [2d-narrowed-to-one-symbol.png](pin-clicks/2d-narrowed-to-one-symbol.png) |
| The reveal, then `Record`: two symbols of the file pinned, 2 pins | [2d-second-symbol-added.png](pin-clicks/2d-second-symbol-added.png) |
| `Report` released, then `Record`, the last: the file pinned whole again rather than dropped, every row lit, the subject still `main.ts` with its rows | [2d-last-symbol-released-file-whole.png](pin-clicks/2d-last-symbol-released-file-whole.png) |
| The recentre control on `models.ts`: it is the subject now, `main.ts` a neighbour wearing the control, the pin kept, the detail panel closed | [2d-recentred-on-models.png](pin-clicks/2d-recentred-on-models.png) |
| Knowledge Sources, `branches.ts`, the detail panel's Local Map action, one symbol: one pin, `branches.ts#closedDirectoryNode`, the route the night's challenge found | [2d-branches-one-symbol-by-the-panel.png](pin-clicks/2d-branches-one-symbol-by-the-panel.png) |

## The entry points in the Knowledge Sources panel, and the landing they decide

_Pictures by the root Claude Code agent (Fable 5.1) of the build of `reachable`, the vision's step 4, after the owner's "We are aligned. You're clear to build." ([Turn 4 of the day's record](../../ChatHistory/2026/10/2026-10-15.1.record.md#turn-4)). This repository's bundle (674 files) and the estate sample (35 files), 1600 by 1000, taken in headless Chromium from the bundles the gate builds; no page errors in any capture. The panel's counts are the engine's walk from the docs' `Entry` lines, the same `inspect --reachable` prints._

| What is shown | Picture |
| --- | --- |
| The panel's new section at rest on this repository: "Entry points 257", the "Reachable from" field holding "every entry point", the status "257 entry points reach 277 of the other 417 files", the groups by reason (Programs, Commands, Modules, Openings served, Tooling inputs, Declared, Tests) folded, and under them "Unreachable from any entry 140" by archetype and "Reached only from tests 14" open | [01-repository-entry-points-at-rest.png](entry-points/01-repository-entry-points-at-rest.png) |
| The Commands group opened: the nineteen files the manifests' scripts, binaries and main modules run, each with its reasons in words beside it, `index.ts` of the CLI package carrying both its `live-docs` binary and its module, `safe-to-commit.mjs` its two scripts | [02-repository-commands-opened.png](entry-points/02-repository-commands-opened.png) |
| The Programs group opened: this repository's one script, the PowerShell emitter, and the sample programs' and fixtures' mains folded under their roots and opened, each `main` named where the language names it, the C test programs carrying `program main; test` | [03-repository-programs-with-sample-fold-opened.png](entry-points/03-repository-programs-with-sample-fold-opened.png) |
| "Unreachable from any entry" opened on its implementation group: fixtures, sample programs' internals, and the C sources no `#include` reaches, with the note on what the docs cannot read | [04-repository-unreachable-and-tests-only.png](entry-points/04-repository-unreachable-and-tests-only.png) |
| The field with "staticBuilder" typed: the search bar's results under it, the file offered under its directory | [05-repository-reachable-from-typing.png](entry-points/05-repository-reachable-from-typing.png) |
| The file chosen: "packages/explorer/src/shared/staticBuilder.ts reaches 12 of the other 673 files", the configuration line `"entryPoints": [...]` with its copy action, the groups gone, and "Unreachable from packages/explorer/src/shared/staticBuilder.ts 661" by archetype | [06-repository-reachable-from-staticbuilder.png](entry-points/06-repository-reachable-from-staticbuilder.png) |
| The estate sample: "Openings served 7", the two controllers' routes, the two listening addresses, the procedure and the two tables, and "Tooling inputs 9", the five project files and the four configurations, the `App.config` files standing in both | [07-estate-openings-and-tooling.png](entry-points/07-estate-openings-and-tooling.png) |
| The landing on this repository's Local Map: the root with nothing pinned, `packages`, `tests`, `scripts` and `package.json`, since the docs declare many entries; before this day the file-name guess had landed on the rosetta sample's `main.ts` | [08-repository-root-landing.png](entry-points/08-repository-root-landing.png) |


# The Bare frame: a page without its sidebar, as a trial

_Historical evidence, taken on the night of 2026-11-18 to 19 by the builder of the Bare frame. The owner asked, in [Turn 34 of the November 18 record](../../2026-11-18.1.record.md#turn-34), how the page could get out of the way so that the scanned materials do the talking, perhaps without the Detail Panel and the left sidebar; root proposed a page without its sidebar, built behind a lever to be judged in the app, and the owner answered "That would be great!"._

**The setup.** This repository's Explorer and the estate sample's, built from branch `bare-frame` (`npm run build`, `npm run live-docs:visualize`, `npm run live-docs:visualize:estate`), served on port 8825, Chromium through Playwright at device scale 1. The 1440 and 390 pictures of this repository, the `subject-` and the `tuning-` pictures are from the last build, after main was merged in (Tuning's count and Reset, the Arrival lever). The other `repo-834x1112-` and the `estate-` pictures are from an earlier build of the same frame, before the views' menu, the crumbs' widths and the merge were mended; nothing they show changed but the Tuning sheet's head. Each picture is named `<site>-<width>x<height>-<frame>-<state>.png`. The frame was set by Tuning's Frame select, or remembered in the browser before the page loaded (the `subject-` pictures). The 2D and 3D pictures open on the Local Map's landing, where nothing is pinned, so their crumbs end at the scan root; the `subject-` pictures open on `packages/explorer/src/client/errors.ts`.

To open it yourself: Tuning (the sliders button in the bottom strip) → Page → Frame → Bare. The choice is remembered by the browser, not by the link.

## What the map gains

The map's frame (`#views`), measured in the page:

| Window | Sidebar | Bare | Gained |
| --- | --- | --- | --- |
| 1440 × 900 | 1179 × 850 = 1,002,150 px | 1440 × 850 = 1,224,000 px | 221,850 px, 22 % |
| 834 × 1112 | 573 × 1062 = 608,526 px | 834 × 1062 = 885,708 px | 277,182 px, 46 % |
| 390 × 844 | 342 × 794 = 271,548 px | 390 × 794 = 309,660 px | 38,112 px, 14 % (the sidebar is already a 48 px rail there) |

The top bar keeps its height: the crumbs take the room the sidebar's title took, at the left of the search.

## The pictures

| Picture | What it shows | What I see |
| --- | --- | --- |
| `repo-1440x900-sidebar-2d.png`, `repo-1440x900-bare-2d.png` | The landing, Sidebar and Bare. | Under Bare the map runs from the window's left edge; the fourth column of cards (`.gitignore`, `.nvmrc`, `package.json`, `vitest.config.ts`), cut off at the right under Sidebar, stands whole. The top bar reads, left to right, Back and Forward (faint, nowhere to go), the World Map's diamond, a slash, the scan root's folder, the views' chevron, then the search. No words of ours on the page but the search's placeholder. |
| `subject-1440x900-sidebar.png`, `subject-1440x900-bare.png` | A file as the subject. | The crumbs read `◇ / 📁 / packages / explorer / src / client / errors.ts`, the file brighter than its directories. The path a person had to read from the card's second line is now the way out, one press per scale. |
| `subject-1440x900-bare-src.png` | After pressing the `src` crumb. | The map shows `packages/explorer/src` opened, its `client` and `shared` closed inside it, centred; the crumbs end at `src`. The crumb does what a directory's Centre does, so `src` also becomes the newest pin: the search field reads "src" and the path's second field appears, and `errors.ts` is no longer selected or drawn. Whether going out should keep the file in view, as a zoom out would, is open. |
| `repo-1440x900-bare-2d-views.png`, `repo-390x844-bare-2d-views.png` | The views' menu, open. | The sidebar's own three buttons, with their icons and names, Local Map marked current, in a small dark menu under the crumbs. In the first narrow picture the menu stood ten pixels tall, the three views spilling over the map with no ground under them: it had taken the key's placing over the strip. Mended, and a browser case holds it. |
| `subject-834x1112-sidebar.png`, `subject-834x1112-bare.png` | A file as the subject in the owner's window. | Every crumb's name whole: `◇ / 📁 / packages / explorer / src / client / errors.ts`. In the first picture at this width the crumbs were held to half the window, the names cut to `packa…`, `s..` and `cl…`, and the World Map's and the scan root's drawings shrank with them; the drawings now keep their size, only names give way, and the crumbs may take 60 % of the width. |
| `tuning-834x1112-bare-at-defaults.png`, `tuning-834x1112-bare-two-changed.png`, `tuning-834x1112-bare-after-reset.png` | Tuning's count and Reset in the sheet. | At the defaults the sheet's head holds Reset alone, faint (disabled): the Bare frame is not counted as a change. With Hold Still and Symbol Order moved, a `2` stands before Reset, its title "2 settings changed from their defaults", and both levers and the 2D Layout heading carry the changed dot. After Reset the count is gone, the frame is still Bare, the sheet still open and focus on Reset. Closed, the sheet hides the count: under Bare nothing on the strip says that Tuning differs from the defaults. |
| `repo-1440x900-bare-2d-key.png`, `repo-834x1112-bare-2d-key.png`, `repo-390x844-bare-2d-key.png` | The key, open. | Show Tests and Show Assets above a rule, then the legend's rows: Offers to Uses, Test-backed, and the kinds' dots. It stands on the strip, centred, its Key button pressed below it and clear. |
| `repo-1440x900-bare-3d-key.png` | The key over the 3D map. | The two 3D-only filters (Related Docs, Citing Docs) join, and the 3D legend's rows replace the 2D's: Implementation, Test, Symbols, Wrapped group. |
| `repo-1440x900-bare-2d-tuning.png`, `repo-1440x900-bare-3d-tuning.png`, `repo-834x1112-bare-2d-tuning.png`, `repo-390x844-bare-2d-tuning.png`, `estate-834x1112-bare-3d-tuning.png` | The Tuning sheet, open. | The sidebar's own Tuning groups, in the order the sidebar has them, scrolling inside a sheet that stands on the strip and stops below the top bar. Page, the Frame lever's group, is last, below History; it is reached by scrolling. In 3D the open sheet hides the middle of the picture, as the sidebar's Tuning never did. |
| `repo-1440x900-bare-world.png`, `repo-834x1112-bare-world.png`, `repo-390x844-bare-world.png`, `estate-1440x900-bare-world.png`, `estate-390x844-bare-world.png` | The World Map. | The board takes the whole window under the top bar; the crumbs are the diamond and the views' chevron. The board's own title line ("Live Documentation · 15 things, 2 regions") and its tools are unchanged. At 390 the estate's title wraps beside its nine tools, as it did before. |
| `repo-390x844-sidebar-2d.png`, `repo-390x844-bare-2d.png`, `subject-390x844-bare.png` | The narrow window. | Under Bare the 48 px rail is gone. The crumbs show the way out (a left chevron) and the innermost place only, `errors.ts`; the search keeps its placeholder, cut at "Search files, symbols and", its Ctrl+P hint gone where the field is narrower than 300 px. Back, Forward, the way out and the views' chevron take about 150 px beside one name: at this width they are four small controls in a row. |
| `subject-390x844-bare-out.png` | After pressing the way out on the narrow window. | The crumb now reads `client`. With `client` the newest pin the path's second field appears, and the top bar wraps to two rows, 94 px tall in place of 50. |
| `repo-834x1112-*.png` | The owner's own window, 834 wide. | The sidebar took 261 of its 834 px. Under Bare the 2D landing shows all three columns of directories and the cards' column beside them. |
| `estate-*.png` | The estate sample. | The same frame over a small C# estate: the landing's six directories and `Estate.sln` stand with room around them under Bare at 834 and 1440. |

## Measures and checks

- Unit cases: `packages/explorer/src/client/panels/frame-crumbs.test.ts`, 8 cases, and the touched modules' suites (`panels/`, `persistence/`), 145 cases after the merge, pass.
- Browser cases, each run once: `tests/e2e/bare-frame.spec.ts` (7 cases) passes after the merge; before it, `shell-accessibility`, `tuning`, `labels-and-controls`, `explorer-navigation`, `spatial-legend` and `no-network` passed on this branch's bundles (the last three once the history sample was built).
- Escape in the sheet closed it and returned focus to the strip's tuning button at every size; opening the sheet closed the key.

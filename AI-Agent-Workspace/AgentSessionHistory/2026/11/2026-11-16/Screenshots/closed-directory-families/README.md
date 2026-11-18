# Closed directories at the far looks, and a handle that fits before it is cut, 2026-11-16

Historical evidence for the corrections round that followed the cells and shapes ([decided](../../../2026-11-15/2026-11-15.1.record.md#work-notes-the-closed-directorys-cells-and-shapes-come-back) and [reviewed](../../../2026-11-15/2026-11-15.1.record.md#work-notes-the-seventh-hour-of-november-16-utc) the same night). The root's principle: a difference of form that means nothing is read as a difference of kind. The owner's words that bear on it: the far zoom is "the primary place in which a user would _want_ to open a directory node" (November 13), and directories "aren't exceptionally _useful_ (interaction-wise) at high zoom-outs because there are no buttons to interact with at that distance" (November 15).

The round had two legs. The first held the closed boxes of one parent at one name size, the tightest sibling's, with More beside the name in all of them or in none. Its sheets showed the cost: a family's names stood at the floor in seven of twelve families, 8 px on the screen beside file names of 13, and More could be held in a quarter of the families. The root withdrew both rules: uniform at 8 px is worse than uneven at 13 where a directory is the thing to act on. These sheets are the second leg's and replace the first's.

Every sheet is a composition made for looking: pages of the Explorer side by side, each cropped to its picture, at twice the device pixels. The words on a sheet are the sheet's, not the product's. `segoe` is drawn with Segoe UI's line metrics over this machine's Liberation Sans (the owner's browser draws Segoe UI); `fallback` with this machine's own lines.

## The sheets

`sheet-{scripts|root|engine-src|client}-{out3|out7}-{segoe|fallback}.png`: `scripts`, the scan root, `packages/engine/src` and `packages/explorer/src/client`, three presses of Zoom Out (the connections look) and seven (the overview look). `sheet-estate-root-out7-*.png`: the estate sample's top level seven presses out. Three columns:

- **Before**: the build as landed (`90bcd106`). Each closed box fitted its own name, kept More where its box held it, beside the name or on a line of its own, and drew its cells where its own name left a row.
- **Now**: each name is fitted on its own, as before; More is not drawn in a closed box at either far look, the box being the control there; and the cells' row is drawn in every closed box of one parent or in none.
- **For comparison, not built**: every sibling's name at the greatest sibling's size, cut with an ellipsis where its box does not hold it. A scratch build made for these sheets, to show the fork the root keeps: a name far below its siblings left smaller, or cut at their size.

`sheet-estate-payment-service-out7-*.png`: the estate's picture of `PaymentService/PaymentService.cs` seven presses out, before and after. Before, the `PaymentService` membrane's handle reads "Pay…" at the look's full size in the first of its three columns, beside a row that holds nothing. After, the handle reaches across the level columns of the membrane that hold nothing under its edge, and its name, the count of what it hides and More stand whole.

## The numbers

Counted under Segoe UI's metrics (Liberation Sans's widths) with the product's own function run in the page, over every directory of this repository that holds two or more directories outside `tests/integration`, and that folder's `fixtures` (twelve families, 54 closed boxes), and over the estate's five (17 boxes).

**The names' sizes at the overview look**, least to greatest in each family. Now is the same as before: the landed build never counted More's room in a name's fit, so More's leaving frees no size. The look's own size is 3.6 and the floor 2.2; file names in the same pictures run from 3.16 to 3.6.

| family | boxes | before | first leg (one size) | now |
| --- | --- | --- | --- | --- |
| the scan root | 6 | 2.20 to 3.60 | 2.20 | 2.20 to 3.60 |
| `packages` | 4 | 2.20 to 3.60 | 2.20 | 2.20 to 3.60 |
| `packages/engine` | 2 | 2.40 to 3.60 | 2.40 | 2.40 to 3.60 |
| `packages/engine/src` | 4 | 2.20 to 2.40 | 2.20 | 2.20 to 2.40 |
| `packages/engine/src/live-docs` | 3 | 3.60 | 3.60 | 3.60 |
| `packages/explorer/src` | 2 | 2.30 to 2.65 | 2.30 | 2.30 to 2.65 |
| `packages/explorer/src/client` | 7 | 2.70 to 3.60 | 2.20 | 2.70 to 3.60 |
| `packages/explorer/src/client/views` | 2 | 3.30 to 3.60 | 2.70 | 3.30 to 3.60 |
| `scripts` | 5 | 2.35 to 3.60 | 2.35 | 2.35 to 3.60 |
| `tests` | 2 | 2.20 to 3.60 | 2.20 | 2.20 to 3.60 |
| `tests/integration` | 4 | 2.20 to 2.25 | 2.20 | 2.20 to 2.25 |
| `tests/integration/fixtures` | 13 | 2.20 to 2.65 | 2.20 | 2.20 to 2.65 |
| estate, top level | 6 | 2.20 to 3.60 | 2.20 | 2.20 to 3.60 |
| estate `Database` | 2 | 2.25 to 2.35 | 2.25 | 2.25 to 2.35 |
| estate `Gateway` | 2 | 2.20 to 3.60 | 2.20 | 2.20 to 3.60 |
| estate `PaymentService` | 1 | 3.60 | 3.60 | 3.60 |
| estate `Portal` | 6 | 2.20 to 3.20 | 2.20 | 2.20 to 3.20 |

So most names do not stand at or near the look's size. A closed box is 160 to 250 units wide and holds one line at 3.6: after the chevron that is five or six letters. Names of up to six letters stand at the look's size (`cli`, `e2e`, `src`, `tests`, `oracle`, `Hub`, `Wcf`); a name of nine comes down to about 2.4 in a 200-unit box; a longer one stands at the floor, on two lines or broken inside a word. The spread within a family is about file names' (within 0.45) in eight of the seventeen families and far wider in nine.

Families where one name stands far below its siblings:

- the scan root: `.devcontainer` at 2.20, and `packages` at 2.55, beside `.github` 3.15, `.vscode` 3.45, `scripts` and `tests` 3.60;
- `client`: `bootstrap` at 2.70 and `persistence` at 3.00 beside five at 3.60;
- `tests`: `integration` at 2.20, broken "integra" / "tion", beside `e2e` at 3.60;
- `packages/engine`: `grammars` at 2.40 beside `src` at 3.60;
- estate `Gateway`: `Controllers` at 2.20, broken "Controller" / "s", beside `Wcf` at 3.60.

Families that are a ladder or the reverse, with no one outlier: `scripts` (2.35, 2.40, 2.60, 2.90, 3.60); `packages`, where `cli` alone stands at 3.60 above three at the floor; the estate's top level, where `Hub` alone does; estate `Portal`.

**The cells' row**, now, with the landed build's count of boxes showing cells in brackets:

| | three presses out | seven presses out |
| --- | --- | --- |
| `scripts` (five boxes) | all (2) | none (3) |
| the scan root (six) | all (4) | none (1) |
| `packages/engine/src` (four) | none (0) | none (1) |
| `packages/explorer/src/client` (seven) | all (7) | none (1) |

Over the twelve families the row is drawn in seven at the connections look and in one at the overview (`packages/explorer/src`); on the estate in one of five and in none. Seven presses out a row needs its box's name at 2.68 or smaller, so one sibling at a larger size, which is to say one short name, leaves the family without it.

## What is still not right in them

- Seven presses out a closed directory is its name alone, in every family but one: no cells, since a family's short names stand too large to leave a row, and no More. What marks it as a directory there is its chevron and its shorter box.
- The names' sizes within a family are as uneven as they were: the scan root's run from 8 px to 13 on the screen.
- The cut is worse than the smaller name wherever it is shown. At the greatest sibling's size a 200-unit box holds five letters, so the third column cuts four of the scan root's six names (".dev…", ".vsc…", ".git…", "pac…") and four of `scripts`' five. The cause of both the small names and the cuts is the box, not the rule: it is one line tall and five letters wide at the overview look's size.
- A name that the floor cannot hold whole is broken inside a word, as before this round: "langua" / "ges", "explor" / "er", "integra" / "tion", "fixture" / "s"; on the estate "Databa" / "se", "Gatew" / "ay", "Payme" / "ntSe…". One such sibling also takes the cells' row from its family three presses out.
- Whether a family has its row three presses out turns on a few units of one name's width. These sheets are drawn with Liberation Sans, where "doc-tools" holds one line and `scripts` shows cells in all five boxes; the browser cases' Segoe fixture draws a wider bold face, "doc-" / "tools" takes two lines there, and the same five boxes show none.
- A wire may cross the row beside a handle's name, which the handle now reaches into.

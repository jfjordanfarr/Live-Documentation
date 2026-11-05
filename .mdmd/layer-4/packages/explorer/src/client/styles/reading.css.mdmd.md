# packages/explorer/src/client/styles/reading.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/reading.css
- Generated At: 2026-11-04T15:03:16.127Z

## Authored
### Purpose
Current presentation of portrait reading cards and the explicit full-text dialog.

### Notes
Descriptions occupy measured space under their own symbol rows. Subgrid keeps the label and both pins together while prose takes a second row. Reading text has a viewport-aware width and a bounded preview with an explicit full reader, never a nested scrollbar. The dialog uses the existing canonical reader, one scroll surface and the map’s original state.

Introduced during the [November 4 portrait integration](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

Since [November 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-4) the fixed-slot composition draws beside the growing one, behind the Card Text switch: `.local-slot-card` fixes the box at 440 px within the reading width and keeps the ordinary type, `.local-reading-slot` draws 12 px prose at the number of lines Slot Lines gives (`--slot-lines`, two by default) with an ellipsis, the same height whether the prose fills it or is empty, and hides the recorded facts and the full-text link; hidden facts give the prose beside them no margin, since an 8 px margin had made rows without facts shorter, the unevenness the owner saw ([Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-5)); and `.local-reading-faded` dims every description block to 0.35 below reading scale in either composition, since zoom never changes a box ([Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-6)). Rows lay out as a grid for a slot card as they do for a card with the book, since the slot card has no book. The composition the owner does not choose is to be deleted.

The card ladder ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-9), slot cards only): transforms, which change no layout, scale the node's controls and the anchor dots by `--control-scale` and, from the middle band down, names and the file's name by `--text-scale`; a description's type follows `--prose-scale` inside its fixed slot with `--prose-lines` lines; every symbol row but Internals keeps an explicit allotment, `32px + Slot Lines × 17px`, and centres its name once the slot leaves. By band, read from the map's `data-lod`: Middle leaves out the descriptions, the row controls and the type badges; Far the path, the directory line, the tests chips, the counts and the cycle link, and every node control but More. Hidden parts keep their boxes (`visibility: hidden`) or stand in a row with an explicit height, so no box changes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

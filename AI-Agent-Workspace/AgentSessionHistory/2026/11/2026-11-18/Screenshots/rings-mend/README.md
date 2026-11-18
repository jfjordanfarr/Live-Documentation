# The rings' mend: pictures before and after

_Historical evidence, taken 2026-11-18 by the builder of the mend. The design it shows is in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md); the owner's question that asked for it is [Turn 12 of the November 16 record](../../../2026-11-16/2026-11-16.1.record.md#turn-12)._

**The setup.** This repository's Explorer at 1280 × 800, built twice from the same graph:
- "Before" is main at `686ab1af`. Its ten client source files were written into the builder's worktree, the Explorer was built, and the bundle was served on its own port.
- "After" is the mend, with the trial's default (Everything).

The settings, unless a picture says otherwise:
- **Pin:** `packages/engine/src/live-docs/archetype.ts`, one hop, Connections.
- **Switches:** Show Tests, Show Related Docs and Show Citing Docs on.
- **Looks:** marbles on, Group Wrappers at Skin, Shell Depth 2.
- **Camera:** the page's own fit; nothing was moved by hand except where a picture says "zoomed".

Each "near" picture is a part of the full one taken at twice the pixel density, around the sphere named. The counts come from the buffers the page draws. They agree, sphere for sphere, with the counts computed from the bundle by the page's own pure functions.

| Picture | What it shows | What I see |
| --- | --- | --- |
| `01-owner-state-before.png`, `01-owner-state-before-near-archetype.png` | The owner's state on main. | Six spheres wear a ring beside the membranes: five engine files (`core.ts`, `compose.ts`, `discovery.ts`, `document.ts`, `liveDocumentationConfig.ts`) and the citing document `architectural-decisions.mdmd.md`. They stand in a cluster right beside `archetype.ts`. The key has a "More connected" row. |
| `02-owner-state-after.png`, `02-owner-state-after-near-archetype.png` | The same state after the mend. | No ring anywhere; the key has no "More connected" row. Six more spheres stand in the picture (69 against 63): the six files that were alone in their folder beyond the hops, drawn dimmed. In the near picture they are the larger dark blue balls standing apart (left of the explorer membrane, right of the pinned cluster, below). Otherwise the picture is the same: 14 directory membranes and 33 wrapped groups. |
| `03-owner-state-after-documents-off.png`, `03-owner-state-after-documents-off-near-archetype.png` | The same, with Show Related Docs and Show Citing Docs off. | No ring, as with them on. With fewer document wires the groups part differently: 109 file spheres, 11 directory membranes, 41 wrapped groups and 3 lone files. The key loses Document, Cites and Cited by. |
| `04-wrappers-off-before-near-archetype.png`, `05-wrappers-off-after-near-archetype.png` | Group Wrappers Off, before and after. | The same picture both times: 39 rings in the whole picture, on every frontier sphere with something beyond it. The ring stays that picture's only sign. The faded marbles there keep their bands, faintly: that is what a dimmed marble does today. |
| `06-structure-hub-at-the-frontier-before.png`, `07-structure-hub-at-the-frontier-after.png` | The Structure layout with Skin, documents off, the same pin: the pinned file's folder hub `packages/engine/src/live-docs` at the frontier. Its other files are beyond the hops. | Before: the dimmed hub wears an orange ring. After: the same hub without it; its only sign is the frontier's dimming. This is the open case named in the design. |
| `08-lone-file-connections.png` | Zoomed toward `.vscode/settings.json` (six wheel steps), after, Skin, documents on. The file is the only one of its folder beyond the hops. | At the centre, a small dimmed blue ball standing on its own outside the membranes, near the pinned cluster, with no ring. It is dimmed as a frontier sphere is, and a press on it pins it. At this size the marble's bands do not show. |
| `09-lone-file-structure.png` | The Structure layout's start with Skin and documents on, zoomed toward the same file (four wheel steps). There it stands in for its folder `.vscode`, which holds one file. | A small bright ball beside the scan root, not dimmed: in Structure it stands in for its own folder, which is shown. Put beside `08`, this is the difference ruled on: dimmed in Connections, bright in Structure. |

**Counts at the owner's state:**

| State | File spheres | Documents | Directory membranes (files in them) | Wrapped groups | Lone files | Rings |
| --- | --- | --- | --- | --- | --- | --- |
| Before, documents on | 63 | 1 | 14 (798) | 33 | not drawn | 6 |
| After, documents on | 69 | 1 | 14 (798) | 33 | 6 | 0 |
| After, documents off | 109 | 0 | 11 (551) | 41 | 3 | 0 |
| Off, before and after | 63 | 1 | none | none | not drawn | 39 |

**A difference from November 17.** The count measured then (10 rings, 9 from documents) was taken before the repository grew. Today's main shows 6.
- The document's ring came at least in part from two lone files beside it, `.devcontainer/devcontainer.json` and `.vscode/settings.json`, which the mend now draws.
- The five engine files have documents beyond the hops shown. The mend gives those documents no sign.

# Row crossing evidence — 2026-11-04

Historical motion investigation. The selected text-column surface was subsequently rebuilt and passed the focused crossing checks and final full gate. These pictures retain the original trials and are not claimed to be newly captured from the final build.

The clean 900×700 opening of PaymentService.cs briefly superimposed Get/Post text during the continuing search's row permutation. Both default settled layout and searchStarts=0 were free of that row overlap. With moveMs=1500, baseline sampling saw 52 collision frames among 92 moving frames. This was a transient crossing, not a settled layout defect.

The first candidate moves each native boxed row as one opaque surface, retaining per-child movement for legacy display:contents rows. `crossing-0.png` through `crossing-5.png` and `settled.png` show the rebuilt candidate at 900×700; `desktop-crossing-0.png` through `desktop-crossing-6.png` show it at 1440×960. Capture moveMs was 3000 to make the crossing inspectable. Full-row backgrounds prevented text blending but obscured the rear pin in [desktop-crossing-3.png](desktop-crossing-3.png).

The revised surface paints only the text column, leaving both pin columns transparent. [text-surface-3.png](text-surface-3.png), [text-surface-4.png](text-surface-4.png) and [text-surface-5.png](text-surface-5.png) show that revision at 1440×960. These seven `text-surface` captures used a private browser response override of reading.css with the current workspace stylesheet, against the first rebuilt bundle at port 8900. The rear label briefly passes behind the foreground explanation; text does not blend, and the moving pins/wire ends remain visible.

All browsers were private Chromium contexts and were closed. No shared page or server was changed. The first rebuilt candidate passed four focused browser tests: search disabled/enabled row text, interrupted zoomed attached wires, and held-row/card motion. The new crossing test failed against immutable baseline port 8901 while the disabled-search case passed. After the shared rebuild, both crossing cases passed with the selected text-column surface. Later interrupted-motion and held-row checks also passed. Full-suite verification is tracked in the experiment report.

## Captured frames

| Frame | First treatment at 900×700 | First treatment at 1440×960 | Text-column preview at 1440×960 |
| --- | --- | --- | --- |
| 0 | [Frame 0](crossing-0.png) | [Frame 0](desktop-crossing-0.png) | [Frame 0](text-surface-0.png) |
| 1 | [Frame 1](crossing-1.png) | [Frame 1](desktop-crossing-1.png) | [Frame 1](text-surface-1.png) |
| 2 | [Frame 2](crossing-2.png) | [Frame 2](desktop-crossing-2.png) | [Frame 2](text-surface-2.png) |
| 3 | [Frame 3](crossing-3.png) | [Frame 3](desktop-crossing-3.png) | [Frame 3](text-surface-3.png) |
| 4 | [Frame 4](crossing-4.png) | [Frame 4](desktop-crossing-4.png) | [Frame 4](text-surface-4.png) |
| 5 | [Frame 5](crossing-5.png) | [Frame 5](desktop-crossing-5.png) | [Frame 5](text-surface-5.png) |
| 6 | — | [Frame 6](desktop-crossing-6.png) | [Frame 6](text-surface-6.png) |

[Settled first treatment](settled.png) confirms the distinction between the moving crossing and the final row order.
